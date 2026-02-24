"""Token domain models.

Pure Python dataclasses with no framework imports.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class TokenHolding:
    """Immutable record of a wallet's holding of a single SPL token."""

    mint_address: str
    owner_address: str
    raw_amount: int
    decimals: int
    symbol: str | None = None
    name: str | None = None
    logo_uri: str | None = None

    @property
    def ui_amount(self) -> Decimal:
        """Human-readable token amount adjusted for decimals.

        Returns:
            The token balance as displayed in wallets (e.g. 1.5 USDC).
        """
        return Decimal(self.raw_amount) / Decimal(10**self.decimals)
