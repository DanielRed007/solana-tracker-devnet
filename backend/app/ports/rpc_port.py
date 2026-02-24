"""Abstract interface for Solana RPC interactions.

Application services depend on this Protocol, not on any concrete
implementation. This enforces the Dependency Inversion Principle and
makes unit testing with mocks trivial.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
    from app.domain.token import TokenHolding
    from app.domain.wallet import BalanceSnapshot


class RpcPort(Protocol):
    """Interface for Solana RPC interactions."""

    async def get_balance(self, address: str) -> BalanceSnapshot:
        """Fetch the current SOL balance for a wallet address.

        Args:
            address: Base58-encoded Solana wallet public key.

        Returns:
            A BalanceSnapshot with lamports and retrieval timestamp.

        Raises:
            InvalidAddressError: If the address fails public key validation.
            RpcError: If the Solana RPC call fails.
        """
        ...

    async def get_token_accounts(self, address: str) -> list[TokenHolding]:
        """Fetch all SPL token accounts owned by a wallet address.

        Args:
            address: Base58-encoded Solana wallet public key.

        Returns:
            A list of TokenHolding domain objects.

        Raises:
            InvalidAddressError: If the address fails public key validation.
            RpcError: If the Solana RPC call fails.
        """
        ...
