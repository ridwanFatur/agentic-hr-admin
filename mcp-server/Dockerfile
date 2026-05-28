# ── Stage 1: install dependencies with uv ──────────────────────────────────
FROM ghcr.io/astral-sh/uv:latest AS uv

FROM python:3.12-slim AS builder

COPY --from=uv /uv /usr/local/bin/uv

WORKDIR /app

# Install dependencies first so this layer is cached separately from source
COPY pyproject.toml uv.lock* ./

RUN uv sync --frozen --no-install-project --no-dev

# Copy source
COPY . .

RUN uv sync --frozen --no-dev


# ── Stage 2: minimal production image ──────────────────────────────────────
FROM python:3.12-slim AS runtime

# Non-root user
RUN groupadd --gid 1001 appgroup && \
    useradd  --uid 1001 --gid appgroup --no-create-home appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /app /app

USER appuser

# MCP server listens on 8001 (SSE transport)
EXPOSE 8001

CMD ["/app/.venv/bin/python", "server.py"]
