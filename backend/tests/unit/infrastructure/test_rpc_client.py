"""Unit tests for SolanaRpcClient.

All tests use an injected AsyncMock for the underlying AsyncClient, so no
real Solana RPC network calls are made.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.domain.exceptions import InvalidAddressError, RpcError
from app.domain.token import TokenHolding
from app.domain.wallet import BalanceSnapshot
from app.infrastructure.solana.rpc_client import SolanaRpcClient

# A known valid Solana devnet address used as a stand-in for all success paths.
VALID_ADDRESS = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"


@pytest.fixture
def mock_client() -> AsyncMock:
    """A fully mocked solana-py AsyncClient for injecting into SolanaRpcClient.

    Returns:
        An AsyncMock configured with a fake provider endpoint URI.
    """
    client = AsyncMock()
    client._provider = MagicMock()
    client._provider.endpoint_uri = "https://api.devnet.solana.com"
    return client


@pytest.fixture
def rpc_client(mock_client: AsyncMock) -> SolanaRpcClient:
    """A SolanaRpcClient wired with the injected mock AsyncClient.

    Args:
        mock_client: The AsyncMock fixture for the underlying RPC client.

    Returns:
        A SolanaRpcClient ready for use in tests.
    """
    return SolanaRpcClient(
        rpc_url="https://api.devnet.solana.com",
        client=mock_client,
    )


# ---------------------------------------------------------------------------
# get_balance tests
# ---------------------------------------------------------------------------


async def test_get_balance_returns_snapshot_on_success(
    rpc_client: SolanaRpcClient,
    mock_client: AsyncMock,
) -> None:
    """get_balance returns a BalanceSnapshot with correct lamports on a valid response."""
    mock_response = MagicMock()
    mock_response.value = 5_000_000_000  # 5 SOL
    mock_client.get_balance.return_value = mock_response

    result = await rpc_client.get_balance(VALID_ADDRESS)

    assert isinstance(result, BalanceSnapshot)
    assert result.wallet_address == VALID_ADDRESS
    assert result.lamports == 5_000_000_000
    mock_client.get_balance.assert_called_once()


async def test_get_balance_raises_invalid_address_error_for_bad_address(
    rpc_client: SolanaRpcClient,
) -> None:
    """get_balance raises InvalidAddressError when given a non-base58 address."""
    with pytest.raises(InvalidAddressError) as exc_info:
        await rpc_client.get_balance("not-a-valid-address!!!")

    assert "not-a-valid-address!!!" in str(exc_info.value)


async def test_get_balance_raises_rpc_error_when_client_raises(
    rpc_client: SolanaRpcClient,
    mock_client: AsyncMock,
) -> None:
    """get_balance raises RpcError when the underlying AsyncClient raises."""
    mock_client.get_balance.side_effect = Exception("connection timeout")

    with pytest.raises(RpcError) as exc_info:
        await rpc_client.get_balance(VALID_ADDRESS)

    assert "connection timeout" in str(exc_info.value)


async def test_get_balance_raises_rpc_error_when_response_value_is_none(
    rpc_client: SolanaRpcClient,
    mock_client: AsyncMock,
) -> None:
    """get_balance raises RpcError when the RPC returns a None balance value."""
    mock_response = MagicMock()
    mock_response.value = None
    mock_client.get_balance.return_value = mock_response

    with pytest.raises(RpcError):
        await rpc_client.get_balance(VALID_ADDRESS)


# ---------------------------------------------------------------------------
# get_token_accounts tests
# ---------------------------------------------------------------------------


def _make_token_keyed_account(
    mint: str,
    owner: str,
    amount: str,
    decimals: int,
) -> MagicMock:
    """Build a MagicMock that mimics a jsonParsed RPC token account entry.

    Args:
        mint: Mint address string.
        owner: Owner address string.
        amount: Raw token amount as a string.
        decimals: Token decimal places.

    Returns:
        A MagicMock with the parsed account data structure set.
    """
    keyed_account = MagicMock()
    keyed_account.account.data.parsed = {
        "info": {
            "mint": mint,
            "owner": owner,
            "tokenAmount": {
                "amount": amount,
                "decimals": decimals,
            },
        }
    }
    return keyed_account


async def test_get_token_accounts_returns_holdings_list(
    rpc_client: SolanaRpcClient,
    mock_client: AsyncMock,
) -> None:
    """get_token_accounts returns a populated list of TokenHolding on success."""
    mock_response = MagicMock()
    mock_response.value = [
        _make_token_keyed_account(USDC_MINT, VALID_ADDRESS, "1000000", 6),
    ]
    mock_client.get_token_accounts_by_owner_json_parsed.return_value = mock_response

    result = await rpc_client.get_token_accounts(VALID_ADDRESS)

    assert len(result) == 1
    holding = result[0]
    assert isinstance(holding, TokenHolding)
    assert holding.mint_address == USDC_MINT
    assert holding.owner_address == VALID_ADDRESS
    assert holding.raw_amount == 1_000_000
    assert holding.decimals == 6


async def test_get_token_accounts_returns_empty_list_when_no_accounts(
    rpc_client: SolanaRpcClient,
    mock_client: AsyncMock,
) -> None:
    """get_token_accounts returns an empty list when the wallet has no token accounts."""
    mock_response = MagicMock()
    mock_response.value = []
    mock_client.get_token_accounts_by_owner_json_parsed.return_value = mock_response

    result = await rpc_client.get_token_accounts(VALID_ADDRESS)

    assert result == []


async def test_get_token_accounts_raises_invalid_address_error_for_bad_address(
    rpc_client: SolanaRpcClient,
) -> None:
    """get_token_accounts raises InvalidAddressError for a non-base58 address."""
    with pytest.raises(InvalidAddressError):
        await rpc_client.get_token_accounts("bad!!address")


async def test_get_token_accounts_raises_rpc_error_when_client_raises(
    rpc_client: SolanaRpcClient,
    mock_client: AsyncMock,
) -> None:
    """get_token_accounts raises RpcError when the underlying AsyncClient raises."""
    mock_client.get_token_accounts_by_owner_json_parsed.side_effect = Exception(
        "rate limit exceeded"
    )

    with pytest.raises(RpcError) as exc_info:
        await rpc_client.get_token_accounts(VALID_ADDRESS)

    assert "rate limit exceeded" in str(exc_info.value)
