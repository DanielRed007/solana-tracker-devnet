"""Pydantic schemas for wallet API endpoints.

These models define the JSON shape of request/response bodies.
They are the only place where camelCase serialization is applied.
Domain models remain snake_case throughout the application layer.
"""

from __future__ import annotations

from datetime import (
    datetime,  # noqa: TC003 — Pydantic v2 resolves annotations at runtime via get_type_hints()
)

from pydantic import BaseModel, Field


class BalanceResponse(BaseModel):
    """Response body for GET /wallet/{address}/balance.

    Mirrors the WalletBalanceResponse TypeScript interface in the frontend.
    """

    wallet_address: str = Field(
        description="Base58-encoded Solana public key of the queried wallet.",
        alias="walletAddress",
    )
    lamports: int = Field(
        description="SOL balance expressed in lamports (1 SOL = 1,000,000,000 lamports).",
    )
    retrieved_at: datetime = Field(
        description="UTC timestamp at which the balance was fetched from the RPC.",
        alias="retrievedAt",
    )

    model_config = {"populate_by_name": True}
