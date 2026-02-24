"""Wallet domain models.

Pure Python dataclasses with no framework imports.
These represent business concepts only — no SQLAlchemy, FastAPI, or Redis.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal

LAMPORTS_PER_SOL: int = 1_000_000_000


@dataclass(frozen=True)
class BalanceSnapshot:
    """Immutable record of a wallet's SOL balance at a point in time."""

    wallet_address: str
    lamports: int
    retrieved_at: datetime

    @property
    def sol(self) -> Decimal:
        """Convert lamports to SOL.

        Returns:
            The balance expressed in SOL as a Decimal for precision.
        """
        return Decimal(self.lamports) / Decimal(LAMPORTS_PER_SOL)

    @classmethod
    def now(cls, wallet_address: str, lamports: int) -> BalanceSnapshot:
        """Create a snapshot stamped with the current UTC time.

        Args:
            wallet_address: Base58-encoded Solana public key.
            lamports: Balance in lamports.

        Returns:
            A new BalanceSnapshot with retrieved_at set to now.
        """
        return cls(
            wallet_address=wallet_address,
            lamports=lamports,
            retrieved_at=datetime.now(UTC),
        )
