"""
HR Database MCP Server
======================
FastMCP server exposing PostgreSQL tools for the HR Manager application.

Tools:
  - list_tables          — list all tables in the database
  - get_database_schema  — full schema with columns and types
  - get_table_sample     — first N rows of a table
  - run_sql_query        — execute a SELECT query
  - validate_sql_syntax  — check SQL syntax without executing
  - get_column_stats     — statistics for a specific column
  - count_rows           — count rows in a table (with optional filter)
  - check_table_exists   — check whether a table exists

Transport: SSE (Server-Sent Events) — listens on http://0.0.0.0:8001
"""

import os
import re
from typing import Any, Optional

import asyncpg
from dotenv import load_dotenv
from fastmcp import FastMCP

load_dotenv()

# ------------------------------------------------------------------ #
#  Configuration                                                        #
# ------------------------------------------------------------------ #

_RAW_DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/app_db"
)

# The server always listens on all interfaces at port 8001 (matches the
# Dockerfile EXPOSE and the container's -p 8001:8001 mapping).
MCP_HOST = "0.0.0.0"
MCP_PORT = 8001

# Strip SQLAlchemy-specific prefix so asyncpg can use the URL
DATABASE_URL = _RAW_DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

# ------------------------------------------------------------------ #
#  FastMCP instance                                                     #
# ------------------------------------------------------------------ #

mcp = FastMCP(
    "HR Database MCP Server",
    instructions=(
        "Provides tools to query and inspect the HR Manager PostgreSQL database. "
        "Use run_sql_query for SELECT queries. Never modify data — all write operations are rejected."
    ),
)


# ------------------------------------------------------------------ #
#  Helpers                                                              #
# ------------------------------------------------------------------ #


async def _connect() -> asyncpg.Connection:
    """Open a fresh asyncpg connection."""
    return await asyncpg.connect(DATABASE_URL)


_WRITE_PATTERN = re.compile(
    r"^\s*(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|MERGE|GRANT|REVOKE)\b",
    re.IGNORECASE,
)


def _is_write_statement(sql: str) -> bool:
    """Return True if the SQL looks like a write/DDL statement."""
    return bool(_WRITE_PATTERN.match(sql.strip()))


# ------------------------------------------------------------------ #
#  Tools                                                                #
# ------------------------------------------------------------------ #


@mcp.tool()
async def list_tables() -> dict[str, Any]:
    """
    List all user tables in the public schema.

    Returns:
        tables: list of {table_name, table_type}
    """
    conn = await _connect()
    try:
        rows = await conn.fetch(
            """
            SELECT table_name, table_type
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name NOT LIKE 'alembic_%'
            ORDER BY table_name
            """
        )
        return {"tables": [dict(r) for r in rows]}
    finally:
        await conn.close()


@mcp.tool()
async def get_database_schema(table_name: Optional[str] = None) -> dict[str, Any]:
    """
    Return column definitions for one or all tables.

    Args:
        table_name: If provided, returns schema for that table only.
                    If omitted, returns schema for all public tables.

    Returns:
        schema: dict mapping table_name → list of column info dicts
    """
    conn = await _connect()
    try:
        where = "WHERE c.table_schema = 'public'"
        params: list[Any] = []
        if table_name:
            where += " AND c.table_name = $1"
            params.append(table_name)

        rows = await conn.fetch(
            f"""
            SELECT
                c.table_name,
                c.column_name,
                c.data_type,
                c.is_nullable,
                c.column_default,
                c.character_maximum_length
            FROM information_schema.columns c
            {where}
            ORDER BY c.table_name, c.ordinal_position
            """,
            *params,
        )

        schema: dict[str, list[dict[str, Any]]] = {}
        for r in rows:
            tbl = r["table_name"]
            schema.setdefault(tbl, []).append(
                {
                    "column": r["column_name"],
                    "type": r["data_type"],
                    "nullable": r["is_nullable"] == "YES",
                    "default": r["column_default"],
                    "max_length": r["character_maximum_length"],
                }
            )
        return {"schema": schema}
    finally:
        await conn.close()


@mcp.tool()
async def get_table_sample(table_name: str, limit: int = 5) -> dict[str, Any]:
    """
    Return the first N rows of a table as a preview.

    Args:
        table_name: Name of the table to sample.
        limit:      Maximum number of rows to return (1–50, default 5).

    Returns:
        rows: list of row dicts
    """
    limit = max(1, min(limit, 50))
    # Validate table name to prevent SQL injection
    if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", table_name):
        return {"error": f"Invalid table name: {table_name!r}"}

    conn = await _connect()
    try:
        rows = await conn.fetch(
            f'SELECT * FROM "{table_name}" WHERE is_deleted = false LIMIT $1',
            limit,
        )
        if not rows:
            rows = await conn.fetch(
                f'SELECT * FROM "{table_name}" LIMIT $1',
                limit,
            )
        return {"rows": [dict(r) for r in rows], "count": len(rows)}
    except Exception as exc:
        return {"error": str(exc)}
    finally:
        await conn.close()


@mcp.tool()
async def run_sql_query(query: str) -> dict[str, Any]:
    """
    Execute a read-only SQL SELECT query and return results.

    Only SELECT statements are allowed. Write operations (INSERT, UPDATE,
    DELETE, DROP, etc.) will be rejected.

    Args:
        query: A valid SELECT SQL statement.

    Returns:
        rows:  list of result row dicts
        count: number of rows returned
    """
    if _is_write_statement(query):
        return {"error": "Write operations are not allowed. Only SELECT queries are permitted."}

    conn = await _connect()
    try:
        rows = await conn.fetch(query)
        return {"rows": [dict(r) for r in rows], "count": len(rows)}
    except Exception as exc:
        return {"error": str(exc)}
    finally:
        await conn.close()


@mcp.tool()
async def validate_sql_syntax(query: str) -> dict[str, Any]:
    """
    Validate SQL syntax without executing the query.

    Uses PostgreSQL's EXPLAIN to check the query plan without side effects.

    Args:
        query: SQL statement to validate.

    Returns:
        valid:   True if the syntax is valid
        message: Error message if invalid, "OK" if valid
    """
    if _is_write_statement(query):
        return {"valid": False, "message": "Write operations are not permitted."}

    conn = await _connect()
    try:
        await conn.fetch(f"EXPLAIN {query}")
        return {"valid": True, "message": "OK"}
    except Exception as exc:
        return {"valid": False, "message": str(exc)}
    finally:
        await conn.close()


@mcp.tool()
async def get_column_stats(table_name: str, column_name: str) -> dict[str, Any]:
    """
    Return basic statistics for a numeric or categorical column.

    For numeric columns: min, max, avg, count, null_count.
    For text columns:   distinct_count, null_count, top_5_values.

    Args:
        table_name:  Table to inspect.
        column_name: Column to analyse.

    Returns:
        stats: dict of statistics
    """
    if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", table_name):
        return {"error": f"Invalid table name: {table_name!r}"}
    if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", column_name):
        return {"error": f"Invalid column name: {column_name!r}"}

    conn = await _connect()
    try:
        # Determine data type
        type_row = await conn.fetchrow(
            """
            SELECT data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = $1
              AND column_name = $2
            """,
            table_name,
            column_name,
        )
        if not type_row:
            return {"error": f"Column {column_name!r} not found in table {table_name!r}"}

        data_type = type_row["data_type"]
        is_numeric = data_type in (
            "integer", "bigint", "smallint", "numeric", "real",
            "double precision", "decimal", "float",
        )

        col = f'"{column_name}"'
        tbl = f'"{table_name}"'

        if is_numeric:
            row = await conn.fetchrow(
                f"""
                SELECT
                    MIN({col})       AS min_val,
                    MAX({col})       AS max_val,
                    AVG({col})       AS avg_val,
                    COUNT({col})     AS count_val,
                    COUNT(*) FILTER (WHERE {col} IS NULL) AS null_count
                FROM {tbl}
                """
            )
            return {
                "column": column_name,
                "data_type": data_type,
                "stats": {
                    "min": float(row["min_val"]) if row["min_val"] is not None else None,
                    "max": float(row["max_val"]) if row["max_val"] is not None else None,
                    "avg": float(row["avg_val"]) if row["avg_val"] is not None else None,
                    "count": row["count_val"],
                    "null_count": row["null_count"],
                },
            }
        else:
            distinct_row = await conn.fetchrow(
                f"""
                SELECT
                    COUNT(DISTINCT {col}) AS distinct_count,
                    COUNT(*) FILTER (WHERE {col} IS NULL) AS null_count
                FROM {tbl}
                """
            )
            top_rows = await conn.fetch(
                f"""
                SELECT {col} AS value, COUNT(*) AS freq
                FROM {tbl}
                WHERE {col} IS NOT NULL
                GROUP BY {col}
                ORDER BY freq DESC
                LIMIT 5
                """
            )
            return {
                "column": column_name,
                "data_type": data_type,
                "stats": {
                    "distinct_count": distinct_row["distinct_count"],
                    "null_count": distinct_row["null_count"],
                    "top_values": [
                        {"value": str(r["value"]), "frequency": r["freq"]}
                        for r in top_rows
                    ],
                },
            }
    except Exception as exc:
        return {"error": str(exc)}
    finally:
        await conn.close()


@mcp.tool()
async def count_rows(table_name: str, where_clause: Optional[str] = None) -> dict[str, Any]:
    """
    Count rows in a table, optionally filtered by a WHERE clause.

    Args:
        table_name:   Table to count rows in.
        where_clause: Optional SQL WHERE condition (without the WHERE keyword),
                      e.g. "is_deleted = false AND status = 'active'".

    Returns:
        count: integer row count
    """
    if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", table_name):
        return {"error": f"Invalid table name: {table_name!r}"}

    tbl = f'"{table_name}"'
    sql = f"SELECT COUNT(*) AS count FROM {tbl}"
    if where_clause:
        sql += f" WHERE {where_clause}"

    conn = await _connect()
    try:
        row = await conn.fetchrow(sql)
        return {"table": table_name, "count": row["count"]}
    except Exception as exc:
        return {"error": str(exc)}
    finally:
        await conn.close()


@mcp.tool()
async def check_table_exists(table_name: str) -> dict[str, Any]:
    """
    Check whether a table exists in the public schema.

    Args:
        table_name: Name of the table to check.

    Returns:
        exists: True/False
    """
    conn = await _connect()
    try:
        row = await conn.fetchrow(
            """
            SELECT COUNT(*) AS cnt
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = $1
            """,
            table_name,
        )
        exists = (row["cnt"] > 0) if row else False
        return {"table": table_name, "exists": exists}
    finally:
        await conn.close()


# ------------------------------------------------------------------ #
#  Entry point                                                          #
# ------------------------------------------------------------------ #

if __name__ == "__main__":
    print(f"Starting HR Database MCP Server on {MCP_HOST}:{MCP_PORT}")
    print(f"SSE endpoint: http://{MCP_HOST}:{MCP_PORT}/sse")

    # FastMCP starts uvicorn internally for SSE transport
    mcp.run(transport="sse", host=MCP_HOST, port=MCP_PORT)
