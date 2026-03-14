"""Unit tests for the GetWalletBalance application service.

All external dependencies are replaced with lightweight async mocks.
No network calls, no database, no Redis.
"""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.application.get_wallet_balance import GetWalletBalance
from app.domain.exceptions import InvalidAddressError, RpcError
from app.domain.wallet import BalanceSnapshot


def _make_snapshot(address: str = "FakeAddr", lamports: int = 1_000_000_000) -> BalanceSnapshot:
    return BalanceSnapshot(
        wallet_address=address,
        lamports=lamports,
        retrieved_at=datetime(2026, 1, 1, tzinfo=UTC),
    )


@pytest.fixture()
def mock_rpc() -> MagicMock:
    rpc = MagicMock()
    rpc.get_balance = AsyncMock()
    return rpc


async def test_execute_returns_snapshot_from_rpc(mock_rpc: MagicMock) -> None:
    """Use case should return the BalanceSnapshot produced by the RPC port."""
    expected = _make_snapshot(lamports=5_000_000_000)
    mock_rpc.get_balance.return_value = expected

    use_case = GetWalletBalance(rpc=mock_rpc)
    result = await use_case.execute("FakeAddr")

    assert result == expected
    mock_rpc.get_balance.assert_awaited_once_with("FakeAddr")


async def test_execute_propagates_invalid_address_error(mock_rpc: MagicMock) -> None:
    """Use case should not swallow InvalidAddressError from the RPC port."""
    mock_rpc.get_balance.side_effect = InvalidAddressError("badaddr")

    use_case = GetWalletBalance(rpc=mock_rpc)
    with pytest.raises(InvalidAddressError):
        await use_case.execute("badaddr")


async def test_execute_propagates_rpc_error(mock_rpc: MagicMock) -> None:
    """Use case should not swallow RpcError from the RPC port."""
    mock_rpc.get_balance.side_effect = RpcError("connection refused")

    use_case = GetWalletBalance(rpc=mock_rpc)
    with pytest.raises(RpcError):
        await use_case.execute("FakeAddr")


async def test_execute_passes_address_verbatim_to_rpc(mock_rpc: MagicMock) -> None:
    """Use case must forward the address unchanged to the RPC port."""
    address = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
    mock_rpc.get_balance.return_value = _make_snapshot(address=address)

    use_case = GetWalletBalance(rpc=mock_rpc)
    await use_case.execute(address)

    mock_rpc.get_balance.assert_awaited_once_with(address)
