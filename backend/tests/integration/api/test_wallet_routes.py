"""Integration tests for the wallet API routes.

Uses FastAPI's TestClient with the RPC dependency overridden by an async mock.
No real network calls are made.
"""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_rpc_client
from app.domain.exceptions import InvalidAddressError, RpcError
from app.domain.token import TokenHolding
from app.domain.wallet import BalanceSnapshot
from app.main import app

_VALID_ADDRESS = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
_FIXED_TIME = datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC)


def _mock_rpc(
    *,
    balance: BalanceSnapshot | None = None,
    holdings: list[TokenHolding] | None = None,
    balance_error: Exception | None = None,
    tokens_error: Exception | None = None,
) -> MagicMock:
    rpc = MagicMock()
    if balance_error:
        rpc.get_balance = AsyncMock(side_effect=balance_error)
    else:
        rpc.get_balance = AsyncMock(
            return_value=balance
            or BalanceSnapshot(
                wallet_address=_VALID_ADDRESS,
                lamports=2_000_000_000,
                retrieved_at=_FIXED_TIME,
            )
        )
    if tokens_error:
        rpc.get_token_accounts = AsyncMock(side_effect=tokens_error)
    else:
        rpc.get_token_accounts = AsyncMock(return_value=holdings or [])
    return rpc


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


# --- Balance endpoint ---


def test_get_balance_returns_200_with_lamports(client: TestClient) -> None:
    """GET /wallet/{address}/balance should return 200 and the lamport value."""
    rpc = _mock_rpc()
    app.dependency_overrides[get_rpc_client] = lambda: rpc

    response = client.get(f"/wallet/{_VALID_ADDRESS}/balance")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["lamports"] == 2_000_000_000
    assert body["walletAddress"] == _VALID_ADDRESS
    assert "retrievedAt" in body


def test_get_balance_returns_422_for_invalid_address(client: TestClient) -> None:
    """GET /wallet/{address}/balance should return 422 when address is invalid."""
    rpc = _mock_rpc(balance_error=InvalidAddressError("bad"))
    app.dependency_overrides[get_rpc_client] = lambda: rpc

    response = client.get("/wallet/bad/balance")
    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_get_balance_returns_502_on_rpc_error(client: TestClient) -> None:
    """GET /wallet/{address}/balance should return 502 when RPC fails."""
    rpc = _mock_rpc(balance_error=RpcError("connection refused"))
    app.dependency_overrides[get_rpc_client] = lambda: rpc

    response = client.get(f"/wallet/{_VALID_ADDRESS}/balance")
    app.dependency_overrides.clear()

    assert response.status_code == 502


# --- Tokens endpoint ---


def test_get_tokens_returns_200_with_empty_list_when_no_holdings(client: TestClient) -> None:
    """GET /wallet/{address}/tokens should return 200 and an empty holdings list."""
    rpc = _mock_rpc(holdings=[])
    app.dependency_overrides[get_rpc_client] = lambda: rpc

    response = client.get(f"/wallet/{_VALID_ADDRESS}/tokens")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["holdings"] == []


def test_get_tokens_returns_200_with_holdings(client: TestClient) -> None:
    """GET /wallet/{address}/tokens should return serialised token holdings."""
    holdings = [
        TokenHolding(
            mint_address="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            owner_address=_VALID_ADDRESS,
            raw_amount=5_000_000,
            decimals=6,
            symbol="USDC",
        )
    ]
    rpc = _mock_rpc(holdings=holdings)
    app.dependency_overrides[get_rpc_client] = lambda: rpc

    response = client.get(f"/wallet/{_VALID_ADDRESS}/tokens")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert len(body["holdings"]) == 1
    first = body["holdings"][0]
    assert first["mintAddress"] == "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    assert first["rawAmount"] == 5_000_000
    assert first["decimals"] == 6
    assert first["symbol"] == "USDC"


def test_get_tokens_returns_422_for_invalid_address(client: TestClient) -> None:
    """GET /wallet/{address}/tokens should return 422 when address is invalid."""
    rpc = _mock_rpc(tokens_error=InvalidAddressError("bad"))
    app.dependency_overrides[get_rpc_client] = lambda: rpc

    response = client.get("/wallet/bad/tokens")
    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_get_tokens_returns_502_on_rpc_error(client: TestClient) -> None:
    """GET /wallet/{address}/tokens should return 502 when RPC fails."""
    rpc = _mock_rpc(tokens_error=RpcError("timeout"))
    app.dependency_overrides[get_rpc_client] = lambda: rpc

    response = client.get(f"/wallet/{_VALID_ADDRESS}/tokens")
    app.dependency_overrides.clear()

    assert response.status_code == 502
