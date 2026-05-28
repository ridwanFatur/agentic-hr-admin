# HR Manager

A full-stack HR management application for managing companies, employees, and HR data — with AI-powered chat and Google OAuth authentication.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-containerized-2496ED?logo=docker)

---

## Overview

HR Manager is a monorepo containing three services:

| Service | Description |
|---------|-------------|
| `frontend/` | Next.js 16 App Router — responsive UI with sidebar layout |
| `backend/` | FastAPI monolith — REST API + WebSocket AI chat |
| `mcp-server/` | FastMCP server — exposes PostgreSQL tools to the AI agent |

**Key features:**

- Google OAuth 2.0 authentication (no password required)
- JWT access & refresh token rotation
- Company and employee CRUD with file uploads (Supabase Storage)
- HR modules: Attendance, Leave, Payroll, Performance
- AI chat with a LangGraph ReAct agent streaming responses over WebSocket
- MCP integration — the AI agent can query the PostgreSQL database directly
- Soft-delete across all entities; no hard deletes
- Dockerized services with GitHub Actions CI/CD to Google Cloud Run

---

## Tech Stack

### Frontend

| Tool | Purpose |
|------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library |
| [TypeScript 5](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Axios](https://axios-http.com/) | HTTP client with interceptors |

### Backend

| Tool | Purpose |
|------|---------|
| [FastAPI](https://fastapi.tiangolo.com/) | Async HTTP framework |
| [SQLAlchemy 2 (async)](https://www.sqlalchemy.org/) | ORM with `asyncpg` driver |
| [Alembic](https://alembic.sqlalchemy.org/) | Database migrations |
| [Pydantic v2](https://docs.pydantic.dev/) | Request/response schema validation |
| [python-jose](https://python-jose.readthedocs.io/) | JWT creation and verification |
| [google-auth](https://google-auth.readthedocs.io/) | Google ID token verification |
| [Supabase](https://supabase.com/) | File storage (logos, photos, avatars) |
| [LangChain](https://www.langchain.com/) + [LangGraph](https://langchain-ai.github.io/langgraph/) | ReAct AI agent |
| [langchain-mcp-adapters](https://github.com/langchain-ai/langchain-mcp-adapters) | Connect LangGraph to MCP tools |
| [uv](https://github.com/astral-sh/uv) | Fast Python package manager |

### MCP Server

| Tool | Purpose |
|------|---------|
| [FastMCP](https://github.com/jlowin/fastmcp) | MCP server framework |
| [asyncpg](https://magicstack.github.io/asyncpg/) | Async PostgreSQL driver |

### AI / LLM

| Tool | Purpose |
|------|---------|
| [Groq](https://groq.com/) | LLM API (llama-3.3-70b-versatile) |
| [LangGraph ReAct](https://langchain-ai.github.io/langgraph/) | Agent reasoning loop |
| WebSocket | Token-by-token streaming to the browser |

### Infrastructure & DevOps

| Tool | Purpose |
|------|---------|
| [PostgreSQL](https://www.postgresql.org/) | Primary database |
| [Docker](https://www.docker.com/) | Containerization for all three services |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline |
| [Google Cloud (GCP)](https://cloud.google.com/) | Artifact Registry + VM deployment |
| [Supabase Storage](https://supabase.com/storage) | Object storage for file uploads |

---

## Project Structure

```
.
├── backend/          FastAPI API server
│   ├── app/
│   │   ├── api/      Route handlers (thin, no business logic)
│   │   ├── services/ Business logic
│   │   ├── repositories/ Database access
│   │   ├── models/   SQLAlchemy ORM models
│   │   ├── schemas/  Pydantic request/response models
│   │   └── core/     Config, DB session, JWT helpers
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/         Next.js application
│   ├── app/          App Router pages
│   ├── components/   Reusable UI components
│   ├── lib/          API clients, auth session, utilities
│   └── package.json
├── mcp-server/       FastMCP PostgreSQL tools server
│   ├── server.py
│   └── pyproject.toml
└── init.sql          Development seed data (run manually)
```

---

## Getting Started

### Prerequisites

- Python 3.12+, `uv`
- Node.js 20+, npm
- PostgreSQL instance
- Google OAuth credentials
- Groq API key
- Supabase project (for file uploads)

### Backend

```bash
cd backend
uv venv .venv
source .venv/bin/activate
uv sync

# Copy and fill in environment variables
cp .env.example .env

# Run migrations
alembic upgrade head

# Start dev server (http://localhost:8000)
uvicorn app.main:app --reload
```

### MCP Server

```bash
cd mcp-server
uv venv .venv
source .venv/bin/activate
uv sync

cp .env.example .env

# Start server (http://localhost:8001)
uvicorn server:mcp --host 0.0.0.0 --port 8001
```

### Frontend

```bash
cd frontend
npm install

# Copy and fill in environment variables
cp .env.example .env

# Start dev server (http://localhost:3000)
npm run dev
```

### Seed Data (optional)

After running migrations, seed the database with sample companies and employees:

```bash
# Replace the placeholder UUID with a real user ID first
psql $DATABASE_URL -f init.sql
```

---

## Environment Variables

### Backend (`.env`)

```env
PROJECT_NAME=app-backend
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/app_db
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/redirect/login
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_STORAGE_BUCKET=hr-assets
GROQ_API_KEY=
MCP_SERVER_URL=http://localhost:8001
```

### Frontend (`.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### MCP Server (`.env`)

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/app_db
```

---

## API Overview

All backend routes are prefixed `/api/v1/`. Key endpoint groups:

| Group | Base Path | Notes |
|-------|-----------|-------|
| Auth | `/auth/google/...` | OAuth URL, callback, token refresh, logout |
| Users | `/users/me` | Profile, avatar upload |
| Companies | `/companies` | CRUD + logo upload |
| Employees | `/companies/{id}/employees` | CRUD + photo upload |
| Attendance | `.../employees/{eid}/attendances` | Per-employee records |
| Leave | `.../employees/{eid}/leaves` | Per-employee records |
| Payroll | `.../employees/{eid}/payrolls` | Net salary auto-calculated |
| Performance | `.../employees/{eid}/performances` | Rating 1–5 |
| AI Chat | `/chats` + `ws://.../chats/{id}/ws` | REST CRUD + streaming WebSocket |

Interactive API docs available at `http://localhost:8000/docs`.
