"""Application configuration loaded from environment variables.

All environment variables are accessed exclusively through this module.
Never use os.environ.get() directly in application or infrastructure code.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed, validated application settings sourced from the environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Solana RPC
    solana_rpc_url: str = "https://api.devnet.solana.com"
    solana_network: str = "devnet"

    # PostgreSQL
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/solana_tracker"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Cache TTL (seconds)
    balance_cache_ttl: int = 30
    token_cache_ttl: int = 60

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    log_level: str = "INFO"


settings = Settings()
