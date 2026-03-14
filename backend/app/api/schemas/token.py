"""Pydantic schemas for token API endpoints.

These models define the JSON shape of response bodies for SPL token holdings.
Mirrors the TokenHoldingResponse and TokenHoldingsResponse TypeScript interfaces.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class TokenHoldingResponse(BaseModel):
    """Serialised representation of a single SPL token holding.

    Mirrors the TokenHoldingResponse TypeScript interface in the frontend.
    """

    mint_address: str = Field(
        description="Base58-encoded mint address of the SPL token.",
        alias="mintAddress",
    )
    owner_address: str = Field(
        description="Base58-encoded public key of the wallet that owns this token account.",
        alias="ownerAddress",
    )
    raw_amount: int = Field(
        description="Raw token balance without decimal adjustment.",
        alias="rawAmount",
    )
    decimals: int = Field(
        description="Number of decimal places defined by the token mint.",
    )
    symbol: str | None = Field(
        default=None,
        description="Token ticker symbol (e.g. 'USDC'). Null if metadata is unavailable.",
    )
    name: str | None = Field(
        default=None,
        description="Full token name (e.g. 'USD Coin'). Null if metadata is unavailable.",
    )
    logo_uri: str | None = Field(
        default=None,
        description="URL to the token's logo image. Null if metadata is unavailable.",
        alias="logoUri",
    )

    model_config = {"populate_by_name": True}


class TokenHoldingsResponse(BaseModel):
    """Response body for GET /wallet/{address}/tokens."""

    holdings: list[TokenHoldingResponse] = Field(
        description="All SPL token accounts owned by the queried wallet.",
    )
