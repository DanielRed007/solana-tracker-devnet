"""Solana RPC client implementation.

Implements the RpcPort Protocol using the solana-py async client.
All I/O is async to avoid blocking the FastAPI event loop.
"""

from __future__ import annotations

from typing import Any, cast

from solana.rpc.async_api import AsyncClient
from solana.rpc.types import TokenAccountOpts
from solders.pubkey import Pubkey
from spl.token.constants import TOKEN_PROGRAM_ID

from app.config import settings
from app.domain.exceptions import InvalidAddressError, RpcError
from app.domain.token import TokenHolding
from app.domain.wallet import BalanceSnapshot


class SolanaRpcClient:
    """Concrete Solana RPC client implementing the RpcPort Protocol.

    Wraps the solana-py AsyncClient. Uses the RPC URL from application
    settings. All methods are async to avoid blocking the FastAPI event loop.
    """

    def __init__(self, rpc_url: str, *, client: AsyncClient | None = None) -> None:
        """Initialize the client with the configured RPC endpoint.

        The optional ``client`` parameter enables dependency injection in tests
        without requiring module-level patching. Production code should use
        the ``create_rpc_client`` factory and pass only ``rpc_url``.

        Args:
            rpc_url: The Solana RPC endpoint URL (devnet or mainnet).
            client: Optional pre-built AsyncClient. If None, a new AsyncClient
                is created from ``rpc_url``.
        """
        self._client = client if client is not None else AsyncClient(rpc_url)
        self._rpc_url = rpc_url

    @staticmethod
    def _parse_pubkey(address: str) -> Pubkey:
        """Parse a base58 address string into a solders Pubkey.

        Args:
            address: Base58-encoded Solana public key string.

        Returns:
            A validated solders Pubkey instance.

        Raises:
            InvalidAddressError: If the string is not valid base58 or is not
                a valid Ed25519 public key.
        """
        try:
            return Pubkey.from_string(address)
        except Exception as exc:
            raise InvalidAddressError(address) from exc

    async def get_balance(self, address: str) -> BalanceSnapshot:
        """Fetch the current SOL balance for a wallet address.

        Checks the Solana RPC for the latest balance of the given address.
        Returns a BalanceSnapshot stamped with the current UTC time.

        Args:
            address: Base58-encoded Solana wallet public key.

        Returns:
            A BalanceSnapshot with lamports and retrieval timestamp.

        Raises:
            InvalidAddressError: If the address fails public key validation.
            RpcError: If the RPC call raises or returns a None value.
        """
        pubkey = self._parse_pubkey(address)
        try:
            response = await self._client.get_balance(pubkey)
        except Exception as exc:
            raise RpcError(str(exc), rpc_url=self._rpc_url) from exc

        if response.value is None:
            raise RpcError(
                f"No balance returned for address {address!r}",
                rpc_url=self._rpc_url,
            )

        return BalanceSnapshot.now(wallet_address=address, lamports=response.value)

    async def get_token_accounts(self, address: str) -> list[TokenHolding]:
        """Fetch all SPL token accounts owned by a wallet address.

        Uses ``get_token_accounts_by_owner_json_parsed`` to retrieve structured
        token data including mint address, owner, raw amount, and decimals.
        Filters by the standard SPL Token Program ID.

        Args:
            address: Base58-encoded Solana wallet public key.

        Returns:
            A list of TokenHolding domain objects. Returns an empty list if
            the wallet has no SPL token accounts.

        Raises:
            InvalidAddressError: If the address fails public key validation.
            RpcError: If the RPC call raises an exception.
        """
        pubkey = self._parse_pubkey(address)
        try:
            response = await self._client.get_token_accounts_by_owner_json_parsed(
                pubkey,
                TokenAccountOpts(program_id=TOKEN_PROGRAM_ID),
            )
        except Exception as exc:
            raise RpcError(str(exc), rpc_url=self._rpc_url) from exc

        holdings: list[TokenHolding] = []
        for keyed_account in response.value:
            # ParsedAccount.parsed is typed as Dict[str, Json] where Json is a
            # recursive union type. We cast to dict[str, Any] to allow safe nested
            # access while making the structure explicit in the code.
            parsed_data = cast("dict[str, Any]", keyed_account.account.data.parsed)
            parsed_info = cast("dict[str, Any]", parsed_data["info"])
            token_amount = cast("dict[str, Any]", parsed_info["tokenAmount"])
            holdings.append(
                TokenHolding(
                    mint_address=str(parsed_info["mint"]),
                    owner_address=str(parsed_info["owner"]),
                    raw_amount=int(str(token_amount["amount"])),
                    decimals=int(str(token_amount["decimals"])),
                )
            )

        return holdings


def create_rpc_client() -> SolanaRpcClient:
    """Create a SolanaRpcClient instance from application settings.

    This is the intended composition root for wiring the RPC client into
    application services. It must NOT be called during module import —
    only when building the dependency graph at request time or startup.

    Returns:
        A configured SolanaRpcClient ready for use.
    """
    return SolanaRpcClient(rpc_url=settings.solana_rpc_url)
