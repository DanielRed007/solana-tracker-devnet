"""Application service: retrieve the SOL balance for a wallet.

This use case sits between the API layer and the infrastructure layer.
It depends on the RpcPort abstraction, not on any concrete implementation,
which keeps it testable in isolation.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.domain.wallet import BalanceSnapshot
    from app.ports.rpc_port import RpcPort


class GetWalletBalance:
    """Use case: fetch the current SOL balance for a given wallet address.

    Delegates to the injected RpcPort. Exception handling (InvalidAddressError,
    RpcError) is left to propagate to the router layer, which maps them to
    the appropriate HTTP status codes.
    """

    def __init__(self, rpc: RpcPort) -> None:
        """Inject the RPC port dependency.

        Args:
            rpc: An implementation of RpcPort (e.g. SolanaRpcClient).
        """
        self._rpc = rpc

    async def execute(self, address: str) -> BalanceSnapshot:
        """Fetch the SOL balance for the given wallet address.

        Args:
            address: Base58-encoded Solana public key.

        Returns:
            A BalanceSnapshot containing the lamport balance and retrieval time.

        Raises:
            InvalidAddressError: If the address is not a valid Solana public key.
            RpcError: If the RPC call fails.
        """
        return await self._rpc.get_balance(address)
