"""FastAPI router for wallet-related endpoints.

Handles HTTP concerns only: routing, request parsing, error-to-status mapping.
All business logic is delegated to application services.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_rpc_client
from app.api.schemas.token import TokenHoldingResponse, TokenHoldingsResponse
from app.api.schemas.wallet import BalanceResponse
from app.application.get_token_holdings import GetTokenHoldings
from app.application.get_wallet_balance import GetWalletBalance
from app.domain.exceptions import InvalidAddressError, RpcError

if TYPE_CHECKING:
    from app.ports.rpc_port import RpcPort

router = APIRouter(prefix="/wallet", tags=["wallet"])


@router.get(
    "/{address}/balance",
    response_model=BalanceResponse,
    summary="Get SOL balance",
    description=(
        "Returns the current SOL balance for the given wallet address, "
        "expressed in lamports. Fetched live from the Solana RPC."
    ),
)
async def get_balance(
    address: str,
    rpc: RpcPort = Depends(get_rpc_client),  # noqa: B008
) -> BalanceResponse:
    """Fetch the SOL balance for a wallet address.

    Args:
        address: Base58-encoded Solana public key from the URL path.
        rpc: Injected RPC port via FastAPI Depends.

    Returns:
        A BalanceResponse with the lamport balance and retrieval timestamp.

    Raises:
        HTTPException 422: If the address is not a valid Solana public key.
        HTTPException 502: If the Solana RPC call fails.
    """
    use_case = GetWalletBalance(rpc=rpc)
    try:
        snapshot = await use_case.execute(address)
    except InvalidAddressError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RpcError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return BalanceResponse.model_validate(
        {
            "walletAddress": snapshot.wallet_address,
            "lamports": snapshot.lamports,
            "retrievedAt": snapshot.retrieved_at,
        }
    )


@router.get(
    "/{address}/tokens",
    response_model=TokenHoldingsResponse,
    summary="Get SPL token holdings",
    description=(
        "Returns all SPL token accounts owned by the given wallet address. "
        "Token metadata (symbol, name, logo) is not yet enriched in Phase 1."
    ),
)
async def get_tokens(
    address: str,
    rpc: RpcPort = Depends(get_rpc_client),  # noqa: B008
) -> TokenHoldingsResponse:
    """Fetch all SPL token holdings for a wallet address.

    Args:
        address: Base58-encoded Solana public key from the URL path.
        rpc: Injected RPC port via FastAPI Depends.

    Returns:
        A TokenHoldingsResponse containing the list of token holdings.

    Raises:
        HTTPException 422: If the address is not a valid Solana public key.
        HTTPException 502: If the Solana RPC call fails.
    """
    use_case = GetTokenHoldings(rpc=rpc)
    try:
        holdings = await use_case.execute(address)
    except InvalidAddressError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RpcError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return TokenHoldingsResponse(
        holdings=[
            TokenHoldingResponse.model_validate(
                {
                    "mintAddress": h.mint_address,
                    "ownerAddress": h.owner_address,
                    "rawAmount": h.raw_amount,
                    "decimals": h.decimals,
                    "symbol": h.symbol,
                    "name": h.name,
                    "logoUri": h.logo_uri,
                }
            )
            for h in holdings
        ]
    )
