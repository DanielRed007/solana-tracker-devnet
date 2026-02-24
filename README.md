# Solana Wallet Portfolio Tracker

A production-grade Solana wallet portfolio tracker. Connects to Solana wallets, displays real-time holdings, tracks profit and loss, and monitors transactions — built on Devnet first.

**Stack:** Next.js 16 + TypeScript · Python 3.12 + FastAPI · PostgreSQL · Redis

---

## Repository Structure

```
solana-tracker-devnet/
├── ui/          # Next.js 16 frontend (App Router, TypeScript, Tailwind)
├── backend/     # Python FastAPI data engine
├── CLAUDE.md    # Authoritative project specification
└── README.md    # This file
```

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20 LTS | [nvm](https://github.com/nvm-sh/nvm) |
| Python | 3.12+ | [pyenv](https://github.com/pyenv/pyenv) |
| Docker + Compose | Latest | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |

---

## Quick Start (Docker — full stack)

> Requires Docker. Runs all four services: frontend, backend, PostgreSQL, Redis.

```bash
# 1. Clone
git clone https://github.com/DanielRed007/solana-tracker-devnet.git
cd solana-tracker-devnet

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Start everything
docker compose up
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## Local Development (without Docker)

Running each service locally gives faster feedback loops. Start the infrastructure
(PostgreSQL + Redis) via Docker, then run the app services natively.

### 1. Start infrastructure only

```bash
docker compose up postgres redis
```

### 2. Frontend (`ui/`)

```bash
cd ui

# Install dependencies
npm install

# Start dev server with hot reload
npm run dev
```

Frontend runs at **http://localhost:3000**.

**All frontend scripts:**

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint (zero warnings enforced)
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier write
npm run format:check # Prettier check (used in CI)
npm run type-check   # tsc --noEmit (strict)
```

### 3. Backend (`backend/`)

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install production + dev dependencies
pip install -r requirements-dev.txt

# Copy env file
cp ../.env.example .env

# Run database migrations
alembic upgrade head

# Start dev server with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at **http://localhost:8000**.

**All backend commands:**

```bash
# Run dev server
uvicorn app.main:app --reload

# Lint
ruff check app/

# Lint + auto-fix
ruff check app/ --fix

# Format
ruff format app/

# Type check
mypy app/

# Run tests with coverage
pytest

# Apply DB migrations
alembic upgrade head

# Create a new migration (after model changes)
alembic revision --autogenerate -m "describe the change"
```

---

## Environment Variables

Copy `.env.example` to `.env` at the repo root before starting any service.

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `SOLANA_RPC_URL` | `https://api.devnet.solana.com` | Solana RPC endpoint |
| `SOLANA_NETWORK` | `devnet` | `devnet` or `mainnet-beta` |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/solana_tracker` | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection string |
| `BALANCE_CACHE_TTL` | `30` | Seconds to cache balance responses |
| `TOKEN_CACHE_TTL` | `60` | Seconds to cache token responses |
| `BACKEND_PORT` | `8000` | FastAPI server port |
| `LOG_LEVEL` | `INFO` | Logging level (`DEBUG`, `INFO`, `WARNING`) |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8000` | Backend URL visible to the browser |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | Network shown in the UI |

---

## Code Quality

Both repos enforce zero-warning policies. All checks must pass before committing
(enforced by pre-commit hooks once installed).

### Frontend

```bash
cd ui
npm run lint         # ESLint strict — zero warnings
npm run type-check   # TypeScript strict — zero errors
npm run format:check # Prettier — no unformatted files
```

### Backend

```bash
cd backend
source .venv/bin/activate
ruff check app/      # Linter — zero issues
ruff format --check app/  # Formatter — no unformatted files
mypy app/            # Type checker — zero errors (strict mode)
pytest               # Tests — must meet 80% coverage threshold
```

### Pre-commit hooks (recommended)

```bash
pip install pre-commit
pre-commit install        # Installs git hook — runs on every commit
pre-commit run --all-files  # Run manually against all files
```

---

## Project Documentation

- **[CLAUDE.md](./CLAUDE.md)** — Full architecture, clean code protocol, linter setup, phase task checklists, AI collaboration guidelines, and all other project conventions. Start here.
- **[solana-portfolio-tracker-roadmap.docx](./solana-portfolio-tracker-roadmap.docx)** — Original living roadmap document with the 4-phase implementation plan.

---

## Development Phases

| Phase | Scope | Status |
|---|---|---|
| 1 — Foundation | Wallet connect, SOL balance, basic dashboard, Docker Compose | In Progress |
| 2 — Portfolio Core | SPL tokens, prices, transaction history | Not Started |
| 3 — Multi-Wallet & Analytics | Multiple wallets, P&L charts, export | Not Started |
| 4 — Real-Time & Production | WebSockets, auth, Mainnet, monitoring | Not Started |

See [CLAUDE.md § 8](./CLAUDE.md#8-development-phases) for detailed task checklists per phase.

---

## Contributing

- Follow the [Conventional Commits](https://www.conventionalcommits.org/) format
- Never commit directly to `main` — use feature branches and PRs
- All lint, type-check, and test checks must pass before opening a PR
- See [CLAUDE.md](./CLAUDE.md) for the full code protocol and architectural constraints
