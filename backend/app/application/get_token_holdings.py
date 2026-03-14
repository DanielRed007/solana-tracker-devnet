"""Application service: retrieve SPL token holdings for a wallet.

This use case sits between the API layer and the infrastructure layer.
It depends on the RpcPort abstraction so it can be tested with mock ports.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.domain.token import TokenHolding
    from app.ports.rpc_port import RpcPort


class GetTokenHoldings:
    """Use case: fetch all SPL token accounts owned by a wallet address.

    Delegates to the injected RpcPort. Propagates InvalidAddressError and
    RpcError to the router layer for HTTP mapping.
    """

    def __init__(self, rpc: RpcPort) -> None:
        """Inject the RPC port dependency.

        Args:
            rpc: An implementation of RpcPort (e.g. SolanaRpcClient).
        """
        self._rpc = rpc

    async def execute(self, address: str) -> list[TokenHolding]:
        """Fetch all SPL token holdings for the given wallet address.

        Args:
            address: Base58-encoded Solana public key.

        Returns:
            A list of TokenHolding objects. Empty list if the wallet holds
            no SPL tokens.

        Raises:
            InvalidAddressError: If the address is not a valid Solana public key.
            RpcError: If the RPC call fails.
        """
        return await self._rpc.get_token_accounts(address)
