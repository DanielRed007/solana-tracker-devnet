"""Abstract interface for cache interactions.

Application services depend on this Protocol, not on Redis directly.
Swapping the cache implementation (e.g., in-memory for tests) requires
only a new adapter — no application logic changes.
"""

from __future__ import annotations

from typing import Any, Protocol


class CachePort(Protocol):
    """Interface for key-value cache interactions."""

    async def get(self, key: str) -> Any | None:
        """Retrieve a value by key.

        Args:
            key: The cache key to look up.

        Returns:
            The cached value, or None on cache miss.
        """
        ...

    async def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        """Store a value with a time-to-live expiry.

        Args:
            key: The cache key.
            value: The value to store (must be JSON-serialisable).
            ttl_seconds: Seconds until the entry expires.
        """
        ...

    async def delete(self, key: str) -> None:
        """Remove a value by key.

        Args:
            key: The cache key to remove.
        """
        ...
