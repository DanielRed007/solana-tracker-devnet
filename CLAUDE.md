# CLAUDE.md — solana-tracker-devnet

> Single source of truth for human developers and AI coding assistants working on this project.
> Author: R.Daneel.Olivaw | License: MIT | Year: 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Repository Layout](#4-repository-layout)
5. [Clean Code Protocol](#5-clean-code-protocol)
6. [Linter and Formatter Setup](#6-linter-and-formatter-setup)
7. [Architectural Constraints](#7-architectural-constraints)
8. [Development Phases](#8-development-phases)
9. [Environment and Local Development](#9-environment-and-local-development)
10. [Commit Conventions](#10-commit-conventions)
11. [Testing](#11-testing)
12. [AI Collaboration Guidelines](#12-ai-collaboration-guidelines)
13. [Suggested Improvements and Future Considerations](#13-suggested-improvements-and-future-considerations)

---

## 1. Project Overview

**solana-tracker-devnet** is a production-grade Solana wallet portfolio tracker built as both a functional product and a structured learning project for Solana development. It connects to multiple Solana wallets, displays real-time holdings, tracks profit and loss, and monitors transactions.

### Goals

- Provide a clean, fast, and accurate view of any Solana wallet's portfolio
- Demonstrate real-world fullstack architecture: monorepo, typed APIs, async Python backend, React frontend
- Serve as a learning reference for Solana on-chain data access, wallet adapter integration, and RPC patterns
- Establish architecture, tooling, and workflows reusable across all future Solana projects
- Be extensible toward DeFi positions, NFT holdings, and historical P&L in later phases

### Monorepo Layout

```
solana-tracker-devnet/
├── ui/                  # Next.js 14+ frontend (App Router, TypeScript)
├── backend/             # Python FastAPI data engine
├── docker-compose.yml   # Orchestrates all services for local dev
├── .env.example         # Environment variable template
├── .pre-commit-config.yaml
└── CLAUDE.md            # This file
```

> The monorepo is intentionally simple at this stage — no build tool (e.g. Turborepo or Nx) is added until Phase 2, when shared packages become necessary.

---

## 2. Tech Stack

### Frontend (`ui/`)

| Concern | Technology | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Server Components enabled by default |
| Language | TypeScript 5+ (strict mode) | `strict: true` in tsconfig.json |
| Styling | Tailwind CSS 3+ | JIT mode, no CSS-in-JS |
| Component Library | shadcn/ui | Copy-paste model, fully owned components |
| Wallet Integration | @solana/wallet-adapter | Phantom, Solflare, Backpack adapters |
| State Management | Zustand (global) + React Context (local) | Zustand for wallet/portfolio state |
| Data Fetching | SWR or React Query | For server-state, cache, and revalidation |
| Testing | Vitest + Testing Library | See Section 11 |
| Linting/Formatting | ESLint (strict) + Prettier | See Section 6 |

### Backend (`backend/`)

| Concern | Technology | Notes |
|---|---|---|
| Framework | FastAPI (async) | Pydantic v2 for request/response models |
| Language | Python 3.12+ | Type hints everywhere, mypy strict |
| Solana Client | solana-py / solders | solders for low-level primitives |
| ORM | SQLAlchemy 2+ (async) | Async engine via `asyncpg` |
| Migrations | Alembic | Auto-generated, reviewed before applying |
| Caching | Redis | TTL-based; via `redis-py` (async client) |
| Testing | pytest + pytest-asyncio | See Section 11 |
| Linting/Formatting | Ruff | Replaces flake8 + isort + black |
| Type Checking | mypy (strict) | See Section 6 |

### Infrastructure

| Concern | Technology | Notes |
|---|---|---|
| Database | PostgreSQL 16 | Primary data store |
| Cache | Redis 7 | Ephemeral, not persisted across restarts |
| Local Orchestration | Docker Compose | All four services in one file |
| Frontend Deploy | Vercel | Zero-config for Next.js |
| Backend Deploy | Railway or Fly.io | Docker-based deployment |
| RPC Provider | Helius (preferred) or public devnet | See Section 13 for Helius notes |

---

## 3. Architecture

### 3-Tier Model

```
┌─────────────────────────────────────────────────────┐
│  Presentation Layer                                  │
│  Next.js App Router (ui/)                            │
│  - React Server Components + Client Components       │
│  - Wallet Adapter (browser-side)                     │
│  - Zustand stores, SWR hooks                         │
└───────────────────┬─────────────────────────────────┘
                    │  HTTP (fetch to /api/*)
┌───────────────────▼─────────────────────────────────┐
│  BFF / API Proxy Layer                               │
│  Next.js API Routes (ui/app/api/)                    │
│  - Thin proxy: validates, forwards to FastAPI        │
│  - Handles auth headers, CORS concerns               │
│  - No business logic lives here                      │
└───────────────────┬─────────────────────────────────┘
                    │  HTTP (internal Docker network)
┌───────────────────▼─────────────────────────────────┐
│  Data Engine Layer                                   │
│  FastAPI (backend/)                                  │
│  - Domain models (pure Python dataclasses)           │
│  - Application services (use cases)                  │
│  - Infrastructure: RPC client, DB repos, Redis cache │
└───────────┬───────────────────┬─────────────────────┘
            │                   │
   ┌────────▼───────┐  ┌────────▼────────┐
   │  PostgreSQL 16 │  │   Redis 7        │
   │  (persistent)  │  │  (TTL cache)     │
   └────────────────┘  └─────────────────┘
```

### Data Flow: Wallet Balance Request

```
Browser (Phantom connected)
  → ui: useWalletBalance() hook
    → SWR fetch to /api/wallet/{address}/balance
      → Next.js API Route: proxy to backend
        → FastAPI GET /wallet/{address}/balance
          → Check Redis cache (key: "balance:{address}")
            → Cache HIT: return cached value
            → Cache MISS:
              → Solana RPC getBalance(address)
              → Persist snapshot to PostgreSQL
              → Write to Redis with TTL=30s
              → Return response
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| BFF proxy via Next.js API routes | Avoids CORS issues, centralises auth, hides backend URL from browser |
| FastAPI async-only | Solana RPC calls are I/O-bound; sync would block the event loop |
| Redis TTL caching | Solana RPC has rate limits; caching prevents hammering and improves latency |
| Pydantic v2 response models | Guarantees serialization safety; auto-generates OpenAPI schema |
| shadcn/ui copy-paste model | Avoids opaque dependency updates; we own the component code |
| Alembic for migrations | Explicit, reviewable, reversible migrations — no auto-migrate in production |

---

## 4. Repository Layout

### Frontend (`ui/`)

```
ui/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (providers, fonts)
│   ├── page.tsx                # Home — redirects to /dashboard
│   ├── dashboard/
│   │   └── page.tsx            # Main portfolio dashboard
│   └── api/                    # BFF proxy routes
│       └── wallet/
│           └── [address]/
│               ├── balance/
│               │   └── route.ts
│               └── tokens/
│                   └── route.ts
├── components/                 # Shared UI components (shadcn/ui extensions)
│   ├── wallet/
│   │   ├── WalletConnectButton.tsx
│   │   └── NetworkSelector.tsx
│   └── portfolio/
│       ├── BalanceCard.tsx
│       └── TokenList.tsx
├── features/                   # Feature-scoped logic (hooks + state)
│   ├── wallet/
│   │   ├── useWalletBalance.ts
│   │   └── walletStore.ts      # Zustand slice
│   └── portfolio/
│       └── usePortfolio.ts
├── lib/                        # Pure utilities, adapters, constants
│   ├── solana/
│   │   └── connection.ts       # Solana Connection factory
│   └── utils.ts
├── types/                      # Shared TypeScript types
│   └── api.ts                  # API response types (align with backend OpenAPI)
├── public/
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── .eslintrc.json
└── package.json
```

### Backend (`backend/`)

```
backend/
├── app/
│   ├── main.py                 # FastAPI app factory, router registration
│   ├── config.py               # Settings (Pydantic BaseSettings)
│   ├── domain/                 # Pure domain models — no framework imports
│   │   ├── wallet.py           # WalletAddress, BalanceSnapshot value objects
│   │   └── token.py            # TokenHolding domain model
│   ├── application/            # Use cases / application services
│   │   ├── get_wallet_balance.py
│   │   └── get_token_holdings.py
│   ├── infrastructure/         # External dependencies (RPC, DB, Cache)
│   │   ├── solana/
│   │   │   └── rpc_client.py   # Wraps solana-py; implements RpcPort interface
│   │   ├── database/
│   │   │   ├── models.py       # SQLAlchemy ORM models
│   │   │   ├── repositories.py # Repository implementations
│   │   │   └── session.py      # Async session factory
│   │   └── cache/
│   │       └── redis_cache.py  # Redis adapter; implements CachePort interface
│   ├── api/                    # FastAPI routers and Pydantic schemas
│   │   ├── routers/
│   │   │   └── wallet.py       # /wallet/* endpoints
│   │   └── schemas/
│   │       ├── wallet.py       # Request/response Pydantic models
│   │       └── token.py
│   └── ports/                  # Abstract interfaces (dependency inversion)
│       ├── rpc_port.py         # Protocol class for RPC client
│       └── cache_port.py       # Protocol class for cache
├── alembic/
│   ├── env.py
│   └── versions/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── alembic.ini
├── pyproject.toml              # Ruff, mypy, pytest config all here
├── requirements.txt            # Pinned production deps
├── requirements-dev.txt        # Dev/test deps
└── Dockerfile
```

---

## 5. Clean Code Protocol

These rules apply to all code produced in this project, by humans and AI alike. They are non-negotiable for commits to `main`.

### Universal Rules

- **Single Responsibility:** every function, class, and module does one thing and names it clearly
- **DRY (Don't Repeat Yourself):** extract any logic that appears more than once; shared logic lives in `lib/` (frontend) or a utility module (backend)
- **SOLID Principles:** particularly Dependency Inversion — depend on abstractions (ports/interfaces), not concrete implementations
- **Meaningful Naming:** names must be self-documenting; abbreviations are forbidden except universally understood ones (`id`, `url`, `rpc`)
- **No Magic Numbers or Strings:** all constants are named and placed in a dedicated constants file or enum
- **No Commented-Out Code:** dead code is deleted, not commented. Use git history for recovery
- **Function Length:** aim for 20 lines or fewer per function. Functions exceeding 30 lines must be refactored unless a clear case is made
- **One level of abstraction per function:** a function either orchestrates OR does low-level work — not both

### Python-Specific Rules

```python
# CORRECT: async-first, typed, documented
async def fetch_wallet_balance(
    address: str,
    rpc_client: RpcPort,
    cache: CachePort,
) -> BalanceSnapshot:
    """Fetch the current SOL balance for a wallet address.

    Checks the cache first. On cache miss, queries the Solana RPC and
    writes the result back to the cache with the configured TTL.

    Args:
        address: Base58-encoded Solana wallet public key.
        rpc_client: Injected RPC port implementation.
        cache: Injected cache port implementation.

    Returns:
        A BalanceSnapshot with lamports and the timestamp of retrieval.

    Raises:
        InvalidAddressError: If the address fails public key validation.
        RpcError: If the Solana RPC call fails after retries.
    """
    ...

# WRONG — never do this
def get_bal(addr, cl, c):  # no types, no docstring, cryptic names
    bal = cl.get(addr)     # no caching, no error handling
    return bal
```

- All Python functions called across module boundaries must have Google-style docstrings
- Use `dataclasses` or Pydantic `BaseModel` for all data structures — no bare dicts passed between layers
- All I/O operations (RPC, DB, Redis) must be `async`; no `time.sleep()` or blocking calls
- Use `from __future__ import annotations` in every Python file for forward-reference compatibility
- Pydantic models are used only at the API boundary (serialization/deserialization); domain models use `dataclasses`

### TypeScript-Specific Rules

```typescript
// CORRECT: named, typed, documented
/**
 * Fetches the SOL balance for a given wallet address.
 *
 * @param walletAddress - Base58-encoded Solana public key string
 * @returns The balance in lamports, or null if the request fails
 */
async function fetchWalletBalance(walletAddress: string): Promise<number | null> {
  const response = await fetch(`/api/wallet/${walletAddress}/balance`);
  if (!response.ok) return null;
  const data: WalletBalanceResponse = await response.json();
  return data.lamports;
}

// WRONG — never do this
const getB = async (addr: any) => {   // 'any' is banned, cryptic name
  const r = await fetch('/api/' + addr + '/b');  // string concat, no type
  return r.json();
};
```

- `any` is banned; use `unknown` and narrow with type guards when the shape is truly unknown
- All React component props must be typed with a named interface (not inline)
- No business logic inside React components — move to custom hooks or utility functions
- All public exports (components, hooks, utilities) must have JSDoc comments
- Prefer named exports over default exports for better refactoring support (exception: Next.js page/layout files)

---

## 6. Linter and Formatter Setup

### Frontend (`ui/`)

**TypeScript (`tsconfig.json`)**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**ESLint (`.eslintrc.json`)**

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

**Prettier (`.prettierrc`)**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

**Scripts (`package.json`)**

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  }
}
```

### Backend (`backend/`)

**Ruff + mypy (`pyproject.toml`)**

```toml
[tool.ruff]
target-version = "py312"
line-length = 100
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "UP",  # pyupgrade
    "ARG", # flake8-unused-arguments
    "SIM", # flake8-simplify
    "TCH", # flake8-type-checking
    "RUF", # Ruff-specific rules
]
ignore = ["E501"]  # line length handled by formatter

[tool.ruff.format]
quote-style = "double"
indent-style = "space"

[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_ignores = true
disallow_any_generics = true
```

**Running the tools**

```bash
# From backend/
ruff check .          # lint
ruff check . --fix    # lint + autofix
ruff format .         # format
mypy app/             # type check
```

### Pre-commit Hooks (`.pre-commit-config.yaml` — repo root)

```yaml
repos:
  # Frontend hooks
  - repo: local
    hooks:
      - id: frontend-lint
        name: Frontend ESLint
        language: system
        entry: bash -c "cd ui && npm run lint"
        pass_filenames: false
        files: ^ui/

      - id: frontend-type-check
        name: Frontend TypeScript
        language: system
        entry: bash -c "cd ui && npm run type-check"
        pass_filenames: false
        files: ^ui/.*\.(ts|tsx)$

      - id: frontend-format
        name: Frontend Prettier
        language: system
        entry: bash -c "cd ui && npm run format:check"
        pass_filenames: false
        files: ^ui/

  # Backend hooks
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.4
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.10.0
    hooks:
      - id: mypy
        args: [--config-file=backend/pyproject.toml]
        files: ^backend/

  # Universal hooks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: check-merge-conflict
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: no-commit-to-branch
        args: [--branch, main]
```

**Install pre-commit**

```bash
pip install pre-commit
pre-commit install           # install git hook
pre-commit run --all-files   # run against all files once
```

Commits that fail any hook are blocked. Fix the issues; do not bypass with `--no-verify`.

---

## 7. Architectural Constraints

These constraints are derived from Clean Architecture principles and must be respected at all times.

### Layer Separation

```
UI Layer         →  may call  →  BFF API Routes
BFF API Routes   →  may call  →  FastAPI backend
FastAPI routers  →  may call  →  Application services
App services     →  may call  →  Ports (interfaces)
Infrastructure   →  implements →  Ports
Domain models    →  has NO     →  imports from other layers
```

**Violations that are never acceptable:**

- A React component fetching directly from FastAPI (bypassing the BFF)
- A Next.js API route importing from SQLAlchemy models
- A domain model importing from FastAPI or SQLAlchemy
- An application service importing from `infrastructure/` directly (must use the port interface)
- Business logic placed inside FastAPI router functions (routers delegate to application services)

### Domain Models are Pure

Domain models in `backend/app/domain/` are plain Python `dataclasses` with no imports from FastAPI, SQLAlchemy, or Redis. They represent business concepts only.

```python
# CORRECT: pure domain model
from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, UTC
from decimal import Decimal

@dataclass(frozen=True)
class BalanceSnapshot:
    """Immutable record of a wallet's SOL balance at a point in time."""
    wallet_address: str
    lamports: int
    retrieved_at: datetime

    @property
    def sol(self) -> Decimal:
        """Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)."""
        return Decimal(self.lamports) / Decimal(1_000_000_000)
```

### Ports and Adapters (Dependency Inversion)

All external dependencies (Solana RPC, PostgreSQL, Redis) are accessed through Protocol interfaces defined in `backend/app/ports/`.

```python
# backend/app/ports/rpc_port.py
from __future__ import annotations
from typing import Protocol
from app.domain.wallet import BalanceSnapshot

class RpcPort(Protocol):
    """Interface for Solana RPC interactions."""

    async def get_balance(self, address: str) -> BalanceSnapshot:
        """Fetch the current SOL balance for a wallet address."""
        ...
```

Application services depend only on `RpcPort`, not on the concrete `SolanaRpcClient`. This makes testing with mocks trivial and allows swapping RPC providers without touching business logic.

### Frontend Layer Rules

- `app/` (pages and layouts): routing and data fetching orchestration only
- `features/`: feature-scoped hooks and Zustand slices — no JSX
- `components/`: presentational and composed UI — receives data via props, emits events via callbacks
- `lib/`: pure utilities, constants, API client functions — framework-agnostic where possible
- No `fetch()` calls inside React component bodies; all data fetching lives in custom hooks

### No Business Logic in React Components

```tsx
// WRONG: business logic in component
function BalanceCard({ lamports }: { lamports: number }) {
  const sol = lamports / 1_000_000_000;  // business logic in component
  const formatted = sol.toFixed(4) + ' SOL';
  return <div>{formatted}</div>;
}

// CORRECT: logic extracted to utility
// lib/solana/formatters.ts
export const SOL_LAMPORTS_PER_UNIT = 1_000_000_000;

export function lamportsToSol(lamports: number): number {
  return lamports / SOL_LAMPORTS_PER_UNIT;
}

// component is presentation-only
function BalanceCard({ lamports }: { lamports: number }) {
  return <div>{formatSolBalance(lamportsToSol(lamports))}</div>;
}
```

---

## 8. Development Phases

### Phase 1 — Foundation (Current Focus)

#### Frontend Tasks (`ui/`)

- [ ] Scaffold Next.js 14+ project with App Router (`npx create-next-app@latest`)
- [ ] Configure TypeScript strict mode in `tsconfig.json`
- [ ] Install and configure Tailwind CSS
- [ ] Install and configure shadcn/ui (`npx shadcn-ui@latest init`)
- [ ] Install `@solana/wallet-adapter-react`, `@solana/wallet-adapter-wallets`, `@solana/web3.js`
- [ ] Create `WalletContextProvider` wrapping the app layout
- [ ] Build `WalletConnectButton` component (connect / disconnect / show address)
- [ ] Build `NetworkSelector` component (Devnet / Mainnet toggle)
- [ ] Create basic dashboard layout with sidebar + main content area
- [ ] Implement `useWalletBalance` hook with SWR, calling `/api/wallet/{address}/balance`
- [ ] Build `BalanceCard` component to display SOL balance
- [ ] Create BFF API route `GET /api/wallet/[address]/balance` that proxies to FastAPI
- [ ] Create BFF API route `GET /api/wallet/[address]/tokens` that proxies to FastAPI
- [ ] Set up ESLint, Prettier, TypeScript strict config
- [ ] Write Vitest unit tests for utility functions and custom hooks

#### Backend Tasks (`backend/`)

- [ ] Scaffold FastAPI project structure as per Section 4 layout
- [ ] Configure `pyproject.toml` with Ruff, mypy, pytest settings
- [ ] Install and pin deps: `fastapi`, `uvicorn`, `solana`, `solders`, `sqlalchemy`, `asyncpg`, `alembic`, `redis`, `pydantic-settings`
- [ ] Implement `app/config.py` with Pydantic `BaseSettings` (RPC URL, DB URL, Redis URL, TTL config)
- [ ] Define `RpcPort` and `CachePort` protocol interfaces in `app/ports/`
- [ ] Implement `SolanaRpcClient` in `app/infrastructure/solana/rpc_client.py`
- [ ] Implement `RedisCache` adapter in `app/infrastructure/cache/redis_cache.py`
- [ ] Define domain models: `BalanceSnapshot`, `TokenHolding` in `app/domain/`
- [ ] Implement application service `GetWalletBalance` with cache-aside logic
- [ ] Implement application service `GetTokenHoldings`
- [ ] Create SQLAlchemy ORM models and Alembic initial migration
- [ ] Create FastAPI router for `GET /wallet/{address}/balance`
- [ ] Create FastAPI router for `GET /wallet/{address}/tokens`
- [ ] Add input validation (base58 address format check) at the router layer
- [ ] Write pytest unit tests for application services (mocked ports)
- [ ] Write pytest integration tests against a test PostgreSQL instance

#### DevOps Tasks

- [ ] Write `docker-compose.yml` with services: `ui`, `backend`, `postgres`, `redis`
- [ ] Write `backend/Dockerfile` (multi-stage, non-root user)
- [ ] Write `ui/Dockerfile` (multi-stage, Next.js standalone output)
- [ ] Create `.env.example` with all required environment variables
- [ ] Verify full stack starts with a single `docker compose up`
- [ ] Install pre-commit and verify all hooks pass on a clean commit

#### Phase 1 Deliverables

- Working local dev environment with all services running via `docker compose up`
- User can connect a Phantom wallet and see SOL balance fetched from Devnet
- Backend health check and auto-generated API documentation at `/docs`
- All code passes ESLint, Prettier, mypy, and Ruff with zero warnings
- Test coverage: backend ≥ 80%, frontend utilities ≥ 70%
- Clean git history with Conventional Commits

---

### Phase 2 — Portfolio Core (Weeks 3–4)

- SPL token balance fetching and enrichment pipeline
- Token metadata resolution (Metaplex / DAS API)
- Price data integration (Jupiter Price API or CoinGecko)
- Transaction history parsing and type classification
- Background job for periodic price refresh
- Token holdings table + portfolio summary card in UI

### Phase 3 — Multi-Wallet and Analytics (Weeks 5–6)

- Multi-wallet management UI and aggregated portfolio view
- Historical balance snapshots and P&L calculation engine
- Portfolio analytics charts (recharts): P&L over time, allocation breakdown
- Data export service (CSV)

### Phase 4 — Real-Time and Production (Weeks 7–8)

- WebSocket integration for live balance/price updates
- Sign In With Solana (SIWS) authentication + JWT sessions
- Rate limiting, structured logging, Sentry error monitoring
- Mainnet toggle with confirmation safeguards
- Production deployment: Vercel (frontend) + Railway/Fly.io (backend)

---

## 9. Environment and Local Development

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- Node.js 20 LTS (`nvm use 20`)
- Python 3.12+ (`pyenv local 3.12`)
- `pre-commit` (`pip install pre-commit`)

### Environment Variables

Copy `.env.example` to `.env` and fill in values. **Never commit `.env`.**

```bash
# .env.example

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# PostgreSQL
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/solana_tracker

# Redis
REDIS_URL=redis://localhost:6379/0

# Cache TTL (seconds)
BALANCE_CACHE_TTL=30
TOKEN_CACHE_TTL=60

# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
LOG_LEVEL=INFO

# Frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### Docker Compose Services

```yaml
# docker-compose.yml (structure reference)
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: solana_tracker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [postgres, redis]
    env_file: .env

  ui:
    build: ./ui
    ports: ["3000:3000"]
    depends_on: [backend]
    env_file: .env
```

### Common Development Commands

```bash
# Start full stack
docker compose up

# Start only infrastructure (DB + Redis) — develop backend/frontend locally
docker compose up postgres redis

# Backend (from backend/)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run Alembic migrations
alembic upgrade head

# Frontend (from ui/)
npm run dev

# Run all tests
# Backend:
pytest backend/tests/ -v --cov=app --cov-report=term-missing
# Frontend:
npm run test
npm run test:coverage

# Run all linters
# Backend:
ruff check backend/ && mypy backend/app/
# Frontend:
npm run lint && npm run type-check

# Pre-commit (all files)
pre-commit run --all-files
```

---

## 10. Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must follow this format:

```
<type>(<scope>): <short description in imperative mood>

[optional body]

[optional footer: BREAKING CHANGE, closes #issue]
```

### Allowed Types

| Type | When to use |
|---|---|
| `feat` | A new feature visible to users |
| `fix` | A bug fix |
| `refactor` | Code change that is not a fix or feature (restructuring) |
| `test` | Adding or updating tests only |
| `docs` | Documentation changes only (including this file) |
| `chore` | Tooling, config, dependencies — no production code change |
| `ci` | CI/CD pipeline changes |
| `perf` | Performance improvement |
| `style` | Formatting changes only (no logic change) |

### Scopes

| Scope | Target area |
|---|---|
| `ui` | Frontend (Next.js) |
| `backend` | Python FastAPI backend |
| `docker` | Docker Compose or Dockerfile |
| `db` | Database schema / Alembic migrations |
| `cache` | Redis caching layer |
| `api` | API contract (routes, schemas) |
| `deps` | Dependency updates |
| `config` | Configuration files |

### Examples

```
feat(ui): add WalletConnectButton with Phantom adapter support

fix(backend): handle invalid base58 address in balance endpoint

refactor(backend): extract cache-aside logic into CacheService

test(backend): add unit tests for GetWalletBalance use case

chore(deps): update solana-py to 0.31.0

docs(config): add DATABASE_URL to .env.example
```

**Rules:**

- Subject line is lowercase, imperative mood, ≤ 72 characters
- No period at the end of the subject line
- Body wraps at 72 characters
- Reference GitHub issues in the footer when applicable: `Closes #42`
- The `no-commit-to-branch` pre-commit hook blocks direct commits to `main`; use feature branches and PRs

---

## 11. Testing

### Philosophy

- Tests are written alongside implementation, not after
- Tests document intended behaviour; test names are complete sentences
- Mocks are used for external dependencies; real databases are used for integration tests
- A failing test is a build failure — no skipping tests to make CI green

### Backend (`backend/`)

**Framework:** pytest + pytest-asyncio + pytest-cov

```toml
# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = "--cov=app --cov-report=term-missing --cov-fail-under=80"

[tool.coverage.run]
omit = ["tests/*", "alembic/*"]
```

**Test layout:**

```
backend/tests/
├── conftest.py          # Shared fixtures: async DB session, mock RPC, mock cache
├── unit/
│   ├── domain/
│   │   └── test_wallet.py              # Domain model tests (no I/O)
│   └── application/
│       └── test_get_wallet_balance.py  # Use case tests with mocked ports
└── integration/
    └── api/
        └── test_wallet_routes.py       # Full HTTP tests against test DB
```

**Example unit test:**

```python
async def test_get_wallet_balance_returns_cached_value_when_cache_hits(
    mock_rpc: RpcPort,
    mock_cache: CachePort,
) -> None:
    """Use case should return cached balance without calling RPC on cache hit."""
    cached_snapshot = BalanceSnapshot(
        wallet_address="FakeAddress123",
        lamports=5_000_000_000,
        retrieved_at=datetime.now(UTC),
    )
    mock_cache.get.return_value = cached_snapshot

    use_case = GetWalletBalance(rpc=mock_rpc, cache=mock_cache)
    result = await use_case.execute("FakeAddress123")

    assert result == cached_snapshot
    mock_rpc.get_balance.assert_not_called()
```

### Frontend (`ui/`)

**Framework:** Vitest + @testing-library/react + @testing-library/user-event

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Coverage threshold (`vitest.config.ts`):**

```typescript
coverage: {
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 65,
  },
  exclude: ['**/*.stories.tsx', 'app/api/**'],
}
```

**What to test:**

- All utility functions in `lib/` (pure functions — exhaustively testable)
- All custom hooks in `features/` (use `renderHook` with mocked fetch)
- Component rendering under key states: loading, error, empty, populated
- **Do not test:** Next.js routing, shadcn/ui internals, third-party library behaviour

**Example hook test:**

```typescript
describe('useWalletBalance', () => {
  it('returns the lamport balance when the API responds successfully', async () => {
    server.use(
      http.get('/api/wallet/:address/balance', () =>
        HttpResponse.json({ lamports: 2_000_000_000 })
      )
    );

    const { result } = renderHook(() =>
      useWalletBalance('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lamports).toBe(2_000_000_000);
  });
});
```

---

## 12. AI Collaboration Guidelines

This section defines how Claude Code should behave when working in this codebase. These rules exist to ensure AI-generated code meets the same standards as human-written code.

### Core Behavioural Rules

1. **Respect layer boundaries absolutely.** Never generate code that crosses the layer boundaries defined in Section 7. If a request requires crossing layers, flag it and propose the correct abstraction instead.

2. **Always write tests alongside implementation.** When generating a new function, service, or component, always include the corresponding test file or test cases in the same response. Code without tests is incomplete.

3. **Follow the naming conventions in Section 5.** Full words, not abbreviations. Descriptive names. If a name is unclear, ask before generating code.

4. **Prefer explicit over implicit.** Never use `any` in TypeScript. Never use untyped Python. When the correct type is complex, define a named type alias or dataclass rather than using `dict[str, Any]`.

5. **Never suppress linter warnings with inline ignores** (`# noqa`, `// eslint-disable`) without a documented reason in a comment above the ignore. If the linter flags something, it is usually correct.

6. **Use the existing patterns, do not invent new ones.** If there is already a custom hook for data fetching, follow that pattern. If there is already a port interface for external dependencies, implement it. Do not introduce a new pattern without flagging it for review.

7. **Surface trade-offs, do not silently choose.** If there are two reasonable approaches, explain both briefly and state your recommendation with reasoning. Do not silently pick one.

8. **Environment variables are accessed only through the config module.** In the backend, all env vars are read through `app/config.py` (Pydantic `BaseSettings`). Never use `os.environ.get()` directly in application or infrastructure code. In the frontend, always use a typed config object, never raw `process.env`.

9. **All new endpoints must have OpenAPI documentation.** FastAPI generates this automatically from Pydantic models and docstrings. Ensure every endpoint function has a docstring and every Pydantic model has field descriptions.

10. **Database migrations are not auto-generated blindly.** When schema changes are needed, describe the intended change first. Generate the Alembic migration and review it before running `upgrade head`. Never apply `autogenerate=True` output without human review.

### Scope Discipline

When asked to implement a feature:

- Implement only what is asked — do not speculatively add features
- If the implementation requires changes to a shared layer (e.g., a new port interface), flag this explicitly
- If a request is ambiguous, ask one focused clarifying question rather than making an assumption

### Code Review Checklist (for AI-generated code)

Before presenting generated code, verify:

- [ ] No layer boundary violations
- [ ] All functions have docstrings / JSDoc
- [ ] No `any` types, no untyped parameters
- [ ] No magic numbers — constants are named
- [ ] No commented-out code
- [ ] Tests included
- [ ] Async where I/O is involved (Python backend)
- [ ] Error cases are handled explicitly

---

## 13. Suggested Improvements and Future Considerations

The following are not Phase 1 requirements but are recommended for adoption as the project matures. Architectural decisions made in Phase 1 should not inadvertently block them.

### OpenAPI Schema-First Development

FastAPI auto-generates an OpenAPI 3.x schema at `/openapi.json`. From Phase 2 onward, use `openapi-typescript` to generate TypeScript types directly from this schema:

```bash
npx openapi-typescript http://localhost:8000/openapi.json -o ui/types/api.generated.ts
```

This eliminates manual type duplication between backend Pydantic models and frontend TypeScript types. Add this as a `package.json` script that runs as part of CI.

### Structured Logging with Correlation IDs

Introduce structured JSON logging from day 1 using `structlog` (Python). Assign a `correlation_id` (UUID) to every incoming request in FastAPI middleware and propagate it through all log entries for that request.

```python
# Middleware — add in Phase 1 if possible
@app.middleware("http")
async def add_correlation_id(request: Request, call_next: Callable) -> Response:
    """Attach a correlation ID to every request for distributed tracing."""
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid4()))
    with structlog.contextvars.bound_contextvars(correlation_id=correlation_id):
        response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation_id
    return response
```

This costs almost nothing to add early and is invaluable for debugging.

### GitHub Actions CI Pipeline

Set up a CI workflow early so that the discipline enforced by pre-commit is also enforced on every pull request:

```yaml
# .github/workflows/ci.yml (stub)
jobs:
  backend-checks:
    steps:
      - run: ruff check backend/
      - run: mypy backend/app/
      - run: pytest backend/tests/ --cov-fail-under=80

  frontend-checks:
    steps:
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
```

Add branch protection on `main` requiring CI to pass before merge.

### Husky for Frontend Git Hooks

Consider adding `husky` + `lint-staged` inside `ui/` as a redundant safety net that runs only on staged frontend files — faster than running pre-commit hooks on the whole repo:

```bash
cd ui && npx husky init
```

This is optional if `pre-commit` is already installed and working reliably.

### Environment-Based Feature Flags for Devnet/Mainnet Toggle

Rather than a hard environment variable swap, design a feature flag system from Phase 2 onward. A simple `NEXT_PUBLIC_FEATURE_FLAGS=mainnet_enabled,nft_tab` env var parsed at startup is sufficient initially. This allows Mainnet support to be developed without breaking the Devnet default.

### Helius RPC as Enhanced RPC Provider

The public Solana Devnet RPC has aggressive rate limits. [Helius](https://helius.dev) provides a free-tier enhanced RPC with higher rate limits, enriched transaction parsing (DAS API), webhook support, and token metadata resolution.

Design the `RpcPort` interface so that swapping the public RPC for Helius requires only a new `HeliusRpcClient` implementation and a config change — no changes to application services. This is exactly what the port pattern in Section 7 enables.

### pnpm Workspaces (if shared packages emerge)

If shared TypeScript packages become necessary (e.g., shared types between `ui/` and a future CLI), migrate the frontend to `pnpm` and use pnpm workspaces. Do not create a root-level `package.json` prematurely to avoid constraining this decision.

---

*This document is the authoritative specification for the solana-tracker-devnet project. Update it when architectural decisions change. Treat a discrepancy between this document and the code as a bug.*
