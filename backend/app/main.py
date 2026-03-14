"""FastAPI application factory.

Registers all routers and configures middleware.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.api.routers import wallet
from app.domain.exceptions import InvalidAddressError, RpcError

app = FastAPI(
    title="Solana Tracker API",
    description="Data engine for the Solana Wallet Portfolio Tracker.",
    version="0.1.0",
)

# --- Routers ---
app.include_router(wallet.router)


# --- Exception handlers ---
@app.exception_handler(InvalidAddressError)
async def invalid_address_handler(_request: object, exc: InvalidAddressError) -> JSONResponse:
    """Map InvalidAddressError to HTTP 422 Unprocessable Entity.

    Args:
        _request: The incoming request (unused).
        exc: The domain exception carrying the invalid address.

    Returns:
        A JSON response with status 422 and the exception message.
    """
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(RpcError)
async def rpc_error_handler(_request: object, exc: RpcError) -> JSONResponse:
    """Map RpcError to HTTP 502 Bad Gateway.

    Args:
        _request: The incoming request (unused).
        exc: The domain exception describing the RPC failure.

    Returns:
        A JSON response with status 502 and the exception message.
    """
    return JSONResponse(status_code=502, content={"detail": str(exc)})


# --- Health check ---
@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Return a simple liveness response.

    Used by Docker Compose and load balancers to verify the service is up.
    """
    return {"status": "ok"}
