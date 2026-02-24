"""FastAPI application factory.

Registers all routers and configures middleware.
"""

from __future__ import annotations

from fastapi import FastAPI

app = FastAPI(
    title="Solana Tracker API",
    description="Data engine for the Solana Wallet Portfolio Tracker.",
    version="0.1.0",
)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Return a simple liveness response.

    Used by Docker Compose and load balancers to verify the service is up.
    """
    return {"status": "ok"}
