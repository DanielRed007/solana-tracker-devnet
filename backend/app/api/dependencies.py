"""FastAPI dependency factories.

All dependencies that require setup or configuration live here.
Router functions declare them via ``Depends()``, keeping the routers
free of infrastructure concerns.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from app.infrastructure.solana.rpc_client import create_rpc_client

if TYPE_CHECKING:
    from app.ports.rpc_port import RpcPort


def get_rpc_client() -> RpcPort:
    """Create a configured SolanaRpcClient for injection into route handlers.

    FastAPI calls this function once per request when declared as a
    ``Depends()`` parameter. The returned client is scoped to the request.

    Returns:
        A SolanaRpcClient instance implementing RpcPort.
    """
    return create_rpc_client()
