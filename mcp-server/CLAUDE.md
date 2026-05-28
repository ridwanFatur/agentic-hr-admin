# CLAUDE.md — MCP Server

## Overview

This is a standalone **FastMCP** server that provides PostgreSQL database tools for the HR Manager application. It runs as an independent process alongside the FastAPI backend.

**Purpose**: Enable the LangGraph AI agent (in the backend) to introspect and query the HR database using natural language. The agent discovers what tables and columns exist, runs safe SELECT queries, and returns data to users in the chat interface.

---

## Architecture

```
FastAPI Backend (port 8000)
  └── LangGraph ReAct Agent
        └── langchain-mcp-adapters
              └── [SSE Connection]
                    ↓
MCP Server (port 8001)
  └── FastMCP tools
        └── asyncpg → PostgreSQL
```

### Transport: SSE (Server-Sent Events)

The MCP server runs in **SSE mode** using `fastmcp.run(transport="sse")`. This starts a uvicorn HTTP server. The backend connects to it at `http://localhost:8001/sse`.

---

## Key Files

| File | Purpose |
|------|---------|
| `server.py` | All tool definitions + FastMCP server setup |
| `pyproject.toml` | Python dependencies |
| `.env` | Local config (not committed) |
| `.env.example` | Template for `.env` |

---

## Tools (all read-only)

| Tool | SQL operation | Key params |
|------|--------------|------------|
| `list_tables` | `information_schema.tables` | — |
| `get_database_schema` | `information_schema.columns` | `table_name?` |
| `get_table_sample` | `SELECT * FROM ... LIMIT` | `table_name`, `limit=5` |
| `run_sql_query` | User-provided SELECT | `query` |
| `validate_sql_syntax` | `EXPLAIN {query}` | `query` |
| `get_column_stats` | MIN/MAX/AVG or COUNT DISTINCT | `table_name`, `column_name` |
| `count_rows` | `COUNT(*)` with optional WHERE | `table_name`, `where_clause?` |
| `check_table_exists` | `information_schema.tables` count | `table_name` |

**Safety**: `run_sql_query` rejects any statement matching the write-operation regex before sending it to PostgreSQL. Only SELECT is allowed.

---

## Database Connection

The server uses **asyncpg** directly (not SQLAlchemy). It creates a new connection per tool call and closes it immediately after. This is intentional — the MCP server is stateless and low-traffic.

The `DATABASE_URL` env var accepts either format:
- `postgresql://user:pass@host:port/db`
- `postgresql+asyncpg://user:pass@host:port/db` (SQLAlchemy prefix stripped automatically)

---

## Development

```bash
# Start the server
python server.py

# The server logs connection URL and tool count to stdout
```

When adding new tools:
1. Define an `async def` function with type-annotated parameters
2. Decorate with `@mcp.tool()`
3. Write a clear docstring — the LLM uses it to decide when to call the tool
4. Never execute write statements; validate input with regex if building SQL

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://...` | PostgreSQL connection string |
| `MCP_HOST` | `0.0.0.0` | Host to bind the SSE server to |
| `MCP_PORT` | `8001` | Port to listen on |

---

## Adding to Claude Code as MCP

This server is compatible with Claude Code's MCP integration. Add it to your Claude Code settings:

```json
{
  "mcpServers": {
    "hr-database": {
      "command": "python",
      "args": ["server.py"],
      "cwd": "/path/to/mcp-server",
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}
```

Or, if running as SSE:
```json
{
  "mcpServers": {
    "hr-database": {
      "url": "http://localhost:8001/sse"
    }
  }
}
```

---

## Stack

- **FastMCP** `>=2.0` — MCP server framework
- **asyncpg** `>=0.31` — Async PostgreSQL driver
- **python-dotenv** — Load `.env` file
- **uvicorn** — HTTP server for SSE transport (used internally by FastMCP)
- Python 3.12+
