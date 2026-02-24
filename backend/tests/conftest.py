"""Shared pytest fixtures for all test suites.

Fixtures for the async DB session, mock RPC client, and mock cache
will be added here as their implementations are completed.
"""

from __future__ import annotations

import pytest


@pytest.fixture
def anyio_backend() -> str:
    """Use asyncio as the anyio backend for all async tests."""
    return "asyncio"
