# HR Database MCP Server

A [FastMCP](https://github.com/jlowin/fastmcp) server that exposes PostgreSQL database tools for the HR Manager application. The backend's LangGraph AI agent connects to this server to query HR data on behalf of users.

---

## Architecture

```
Frontend (WebSocket)
    ↕
FastAPI Backend  ──→  MCP Server (FastMCP SSE)
  LangGraph AI              ↕
  ReAct Agent          PostgreSQL DB
```

The MCP server runs as an independent process. The LangGraph agent in the backend connects to it via SSE (Server-Sent Events) and uses the tools to run SQL queries against the HR database.

---

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (recommended) or pip
- A running PostgreSQL database with the HR schema (run `alembic upgrade head` from `backend/` first)

---

## Setup

```bash
cd mcp-server

# 1. Create virtual environment
uv venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. Install dependencies
uv sync

# 3. Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string
```

### `.env` example

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/app_db
MCP_HOST=0.0.0.0
MCP_PORT=8001
```

> The `postgresql+asyncpg://` prefix is supported — the server strips it automatically so asyncpg can use the URL.

---

## Running the Server

```bash
# Activate venv (if not already)
source .venv/bin/activate

# Start the MCP server
python server.py
```

The server starts on `http://0.0.0.0:8001` with the SSE endpoint at `/sse`.

You should see:
```
Starting HR Database MCP Server on 0.0.0.0:8001
SSE endpoint: http://0.0.0.0:8001/sse
```

---

## Available Tools

| Tool | Description |
|------|-------------|
| `list_tables` | List all public tables in the database |
| `get_database_schema` | Get column definitions for one or all tables |
| `get_table_sample` | Preview first N rows of a table |
| `run_sql_query` | Execute a read-only SELECT query |
| `validate_sql_syntax` | Check SQL syntax without running it |
| `get_column_stats` | Statistics for a column (numeric or categorical) |
| `count_rows` | Count rows with optional WHERE filter |
| `check_table_exists` | Check whether a table exists |

> **Safety**: `run_sql_query` only permits SELECT statements. All write operations (INSERT, UPDATE, DELETE, DROP, etc.) are rejected.

---

## Integration with Backend

The backend reads `MCP_SERVER_URL` from its `.env` file:

```env
# backend/.env
MCP_SERVER_URL=http://localhost:8001
```

The LangGraph AI service (`app/services/ai_service.py`) connects to the MCP server via `langchain-mcp-adapters`:

```python
from langchain_mcp_adapters.client import MultiServerMCPClient

async with MultiServerMCPClient({
    "hr-database": {
        "url": "http://localhost:8001/sse",
        "transport": "sse",
    }
}) as client:
    tools = client.get_tools()
    agent = create_react_agent(llm, tools)
```

If the MCP server is not running, the agent falls back gracefully with no tools.

---

## Testing the Server

You can test the tools using the MCP inspector or by connecting a LangChain client directly:

```python
import asyncio
from langchain_mcp_adapters.client import MultiServerMCPClient

async def test():
    async with MultiServerMCPClient({
        "hr-database": {
            "url": "http://localhost:8001/sse",
            "transport": "sse",
        }
    }) as client:
        tools = client.get_tools()
        print(f"Available tools: {[t.name for t in tools]}")

asyncio.run(test())
```
