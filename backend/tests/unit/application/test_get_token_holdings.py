"""Unit tests for the GetTokenHoldings application service.

All external dependencies are replaced with lightweight async mocks.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.application.get_token_holdings import GetTokenHoldings
from app.domain.exceptions import InvalidAddressError, RpcError
from app.domain.token import TokenHolding


def _make_holding(mint: str = "MintAddr111", owner: str = "OwnerAddr111") -> TokenHolding:
    return TokenHolding(
        mint_address=mint,
        owner_address=owner,
        raw_amount=1_000_000,
        decimals=6,
    )


@pytest.fixture()
def mock_rpc() -> MagicMock:
    rpc = MagicMock()
    rpc.get_token_accounts = AsyncMock()
    return rpc


async def test_execute_returns_holdings_from_rpc(mock_rpc: MagicMock) -> None:
    """Use case should return the list of TokenHolding objects from the RPC port."""
    holdings = [_make_holding("Mint1"), _make_holding("Mint2")]
    mock_rpc.get_token_accounts.return_value = holdings

    use_case = GetTokenHoldings(rpc=mock_rpc)
    result = await use_case.execute("FakeAddr")

    assert result == holdings
    mock_rpc.get_token_accounts.assert_awaited_once_with("FakeAddr")


async def test_execute_returns_empty_list_when_no_tokens(mock_rpc: MagicMock) -> None:
    """Use case should return an empty list when the wallet holds no SPL tokens."""
    mock_rpc.get_token_accounts.return_value = []

    use_case = GetTokenHoldings(rpc=mock_rpc)
    result = await use_case.execute("FakeAddr")

    assert result == []


async def test_execute_propagates_invalid_address_error(mock_rpc: MagicMock) -> None:
    """Use case should not swallow InvalidAddressError from the RPC port."""
    mock_rpc.get_token_accounts.side_effect = InvalidAddressError("bad")

    use_case = GetTokenHoldings(rpc=mock_rpc)
    with pytest.raises(InvalidAddressError):
        await use_case.execute("bad")


async def test_execute_propagates_rpc_error(mock_rpc: MagicMock) -> None:
    """Use case should not swallow RpcError from the RPC port."""
    mock_rpc.get_token_accounts.side_effect = RpcError("timeout")

    use_case = GetTokenHoldings(rpc=mock_rpc)
    with pytest.raises(RpcError):
        await use_case.execute("FakeAddr")


async def test_execute_passes_address_verbatim_to_rpc(mock_rpc: MagicMock) -> None:
    """Use case must forward the address unchanged to the RPC port."""
    address = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
    mock_rpc.get_token_accounts.return_value = []

    use_case = GetTokenHoldings(rpc=mock_rpc)
    await use_case.execute(address)

    mock_rpc.get_token_accounts.assert_awaited_once_with(address)
