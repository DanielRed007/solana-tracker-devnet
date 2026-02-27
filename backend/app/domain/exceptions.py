"""Domain exceptions for the Solana tracker application.

These are pure domain exceptions with no framework imports. They represent
error conditions that application services and infrastructure layers
communicate back to the API layer.
"""

from __future__ import annotations


class InvalidAddressError(ValueError):
    """Raised when a string cannot be parsed as a valid Solana public key.

    Extends ValueError because the input value itself is malformed.
    """

    def __init__(self, address: str) -> None:
        """Initialize with the offending address value.

        Args:
            address: The invalid address string that triggered this error.
        """
        super().__init__(f"Invalid Solana address: {address!r}")
        self.address = address


class RpcError(RuntimeError):
    """Raised when a Solana RPC call fails or returns an error response.

    Extends RuntimeError because this represents an unexpected failure
    at runtime, not a programming error.
    """

    def __init__(self, message: str, *, rpc_url: str | None = None) -> None:
        """Initialize with the error message and optional RPC endpoint.

        Args:
            message: Human-readable description of the RPC failure.
            rpc_url: The endpoint URL that produced the error, if known.
        """
        super().__init__(message)
        self.rpc_url = rpc_url
