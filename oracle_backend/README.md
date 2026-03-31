# Frontier Pulse Oracle Backend

Scheduled oracle service that reads live game data from the **EVE Frontier World API** and **Sui blockchain**, computes civilization health scores and player reputations, and writes the results back to the Frontier Pulse smart contract on Sui. Runs on a 10-minute cron cycle with batched transactions.

**Deployment:** Railway ([oracle-fp.up.railway.app](https://oracle-fp.up.railway.app))

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Oracle Cycle](#oracle-cycle)
- [Data Sources](#data-sources)
- [Scoring Engine](#scoring-engine)
- [Smart Contract Interface](#smart-contract-interface)
- [Deployment](#deployment)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  ORACLE CYCLE (Every 10 min)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. FETCH DATA                                              │
│  ├─ worldApi.fetchAllSystems()     → ~800 solar systems     │
│  └─ eveSuiData.fetchEveGameData()  → Assemblies, killmails  │
│                                                             │
│  2. ENRICH DATA                                             │
│  └─ worldApi.enrichSystems()       → Per-system counts      │
│     ├─ Smart assembly count                                 │
│     ├─ Recent kills                                         │
│     └─ Active player addresses                              │
│                                                             │
│  3. COMPUTE SCORES                                          │
│  ├─ scoring.computeSystemHealth()      → Per-system metrics │
│  ├─ scoring.computePlayerReputation()  → Per-player metrics │
│  ├─ scoring.computeGlobalCHI()         → Global health      │
│  └─ scoring.detectAnomalies()          → Alert generation   │
│                                                             │
│  4. WRITE TO SUI (Batched Transactions)                     │
│  ├─ suiWriter.writeSystemHealthBatch()      → 50 systems/tx │
│  ├─ suiWriter.writePlayerReputationBatch()  → 50 players/tx │
│  ├─ suiWriter.writeGlobalCHI()              → 1 tx          │
│  └─ suiWriter.emitAlertsBatch()             → 10 alerts/tx  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES2022 modules) |
| Language | TypeScript 5.7 |
| Sui SDK | @mysten/sui 2.12.0 |
| Scheduler | node-cron 3.0.3 |
| Environment | dotenv 16.4.7 |
| Dev Runner | tsx 4.19.0 |
| Deployment | Railway (Nixpacks) |

---

## Project Structure

```
oracle_backend/
├── src/
│   ├── config.ts          # Environment variables & contract addresses
│   ├── index.ts           # Main entry point + cron scheduler
│   ├── worldApi.ts        # EVE Frontier World API client (REST)
│   ├── eveSuiData.ts      # Sui blockchain data fetcher (GraphQL)
│   ├── scoring.ts         # Score computation (health, reputation, CHI, anomalies)
│   ├── suiWriter.ts       # Sui transaction builder & signer
│   └── initOracle.ts      # One-time OracleCap setup script
├── dist/                  # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── railway.json           # Railway deployment config
├── .env.example           # Environment variable template
└── .gitignore
```

### Source Files

| File | Lines | Purpose |
|------|-------|---------|
| `index.ts` | ~260 | Cron scheduler, cycle orchestration, logging |
| `eveSuiData.ts` | ~344 | Sui GraphQL queries, data normalization |
| `scoring.ts` | ~335 | Score computations, anomaly rule engine |
| `suiWriter.ts` | ~307 | PTB transaction building, signing, execution |
| `worldApi.ts` | ~196 | World API REST client, parallel pagination |
| `config.ts` | ~42 | Environment variable parsing with defaults |
| `initOracle.ts` | ~27 | One-time OracleCap issuance script |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Sui wallet with testnet SUI tokens
- The Frontier Pulse smart contract deployed (see `smartcontract_FP`)

### Installation

```bash
cd oracle_backend
npm install
```

### Initial Setup

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Set `SUI_PRIVATE_KEY` to the oracle wallet's private key (Ed25519, bech32/hex/base64 format).

3. Issue an OracleCap (one-time):

```bash
npm run oracle:init
```

4. Copy the printed `ORACLE_CAP_ID` into your `.env` file.

### Development

```bash
# Run with hot reload
npm run dev

# Run a single cycle (no cron loop)
npm run dev -- --once
```

### Production

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUI_PRIVATE_KEY` | **Yes** | — | Oracle wallet private key |
| `ORACLE_CAP_ID` | **Yes** | — | OracleCap object ID (from `oracle:init`) |
| `SUI_NETWORK` | No | `testnet` | Sui network (`testnet`, `mainnet`, `devnet`) |
| `SUI_RPC_URL` | No | Auto | Custom RPC URL (overrides network default) |
| `PACKAGE_ID` | No | `0x6618...` | Frontier Pulse package address |
| `PULSE_REGISTRY_ID` | No | `0x945f...` | PulseRegistry shared object ID |
| `ADMIN_CAP_ID` | No | `0x2adb...` | AdminCap ID (for oracle:init only) |
| `WORLD_API_BASE` | No | `https://world-api-utopia.uat.pub.evefrontier.com` | EVE Frontier World API |
| `EVE_WORLD_PACKAGE` | No | `0xd12a...` | EVE Frontier package on Sui |
| `EVE_KILLMAIL_REGISTRY` | No | `0xa92d...` | Killmail registry address |
| `EVE_OBJECT_REGISTRY` | No | `0xc2b9...` | Object registry address |
| `SUI_GRAPHQL_URL` | No | `https://graphql.testnet.sui.io/graphql` | Sui GraphQL endpoint |
| `CRON_SCHEDULE` | No | `*/10 * * * *` | Cron pattern (default: every 10 min) |
| `BATCH_SIZE` | No | `50` | Items per Sui transaction |
| `MAX_SYSTEMS_PER_CYCLE` | No | `500` | Max systems processed per cycle |

---

## Oracle Cycle

Each cycle executes the following pipeline:

### 1. Fetch Data

**World API** (`worldApi.ts`):
- `GET /v2/solarsystems` — Paginated fetch of all ~800 solar systems
- Parallel pagination for fast retrieval

**Sui GraphQL** (`eveSuiData.ts`):
- `Killmail` objects — battles (killer, victim, system, timestamp)
- `Assembly` objects — player structures (type, status)
- `Character` objects — player identities (wallet address)
- `OwnerCap` objects — resolve owner → wallet mappings
- `LocationRevealedEvent` — map assemblies to solar systems

### 2. Enrich Data

Merge World API systems with on-chain activity:
- Count smart assemblies per system
- Count recent kills per system
- Identify active player addresses per system

### 3. Compute Scores

See [Scoring Engine](#scoring-engine) for detailed formulas.

### 4. Write to Sui

All writes use **Programmable Transaction Blocks (PTBs)** for gas efficiency:
- System health updates: batched 50 per transaction
- Player reputation updates: batched 50 per transaction
- Global CHI: single transaction
- Anomaly alerts: batched 10 per transaction

### Cycle Safety

- Overlapping cycles are skipped (prevents double-writes)
- Individual batch failures don't stop the cycle
- RPC calls use exponential backoff (2s, 4s, 8s)
- Missing `ORACLE_CAP_ID` fails at startup with a clear error

---

## Data Sources

### EVE Frontier World API (REST)

| Endpoint | Data |
|----------|------|
| `GET /v2/solarsystems` | System list with ID, name, constellation, region, coordinates |

Provides the static topology of the EVE Frontier universe (~800 solar systems).

### Sui Blockchain (GraphQL)

| Object Type | Data |
|-------------|------|
| `Killmail` | Battles: killer, victim, solar system, timestamp |
| `Assembly` | Player structures: type, status, owner |
| `Character` | Player identities: wallet address |
| `OwnerCap` | Ownership resolution: cap → wallet |
| `LocationRevealedEvent` | Assembly → solar system mapping |

**Resolution Chain:**
```
LocationRevealedEvent.owner_cap_id
  → OwnerCap.authorized_object_id
  → Character.character_address
  → Player wallet address
```

---

## Scoring Engine

All scoring logic lives in `src/scoring.ts`.

### System Health Score

For systems with real activity data:

| Metric | Formula |
|--------|---------|
| `activityLevel` | `0.4 × playerScore + 0.35 × infraScore + 0.25 × combatScore` (capped 0–100) |
| `trustLevel` | `(100 - combatRatio × 50) + infraBoost` (infra adds up to +20) |
| `txFrequency` | `(players × 3 + infra × 2 + kills) × 2` (capped 0–100) |
| `localChi` | `(activityLevel × 40 + trustLevel × 60) / 100` |

Systems with no real data use a deterministic hash of the system ID to generate stable phantom metrics.

### Player Reputation Score

| Dimension | Formula |
|-----------|---------|
| `reliability` | `40 + assemblies × 5 + systems × 2` (capped 0–100) |
| `commerce` | `30 + assemblies × 8` (capped 0–100) |
| `diplomacy` | `50 - aggression × 40 + systems × 3` (capped 0–100) |
| `stewardship` | `20 + assemblies × 10` (capped 0–100) |
| `volatility` | `(kills + deaths) × 5 + |kills - deaths| × 3` (capped 0–100) |

**Archetypes:**

| Archetype | Condition |
|-----------|-----------|
| Civilization Builder | stewardship >= 80 AND reliability >= 70 |
| Trusted Trader | commerce >= 80 AND reliability >= 70 |
| Diplomat | diplomacy >= 75 AND volatility < 30 |
| Warlord | volatility >= 70 AND commerce < 40 |
| Wildcard | volatility 50–70 |
| Newcomer | fallback |

### Global CHI

| Sub-Index | Formula | Weight |
|-----------|---------|--------|
| `economicVitality` | `0.6 × avgTxFrequency + 0.4 × infraDensity` | 20% |
| `securityIndex` | `100 - avgCombat × 8` | 15% |
| `growthRate` | `% of systems with activity > 50` | 15% |
| `connectivity` | `avgActivity × 1.1` (proxy for gate density) | 15% |
| `trustIndex` | Average system trustLevel | 20% |
| `socialCohesion` | `0.4 × trust + 0.3 × security + 0.3 × playerDensity` | 15% |

**Diagnosis Labels:**

| Score Range | Diagnosis |
|-------------|-----------|
| 80–100 | Flourishing |
| 65–79 | Thriving |
| 50–64 | Stable |
| 35–49 | Stressed |
| 20–34 | Declining |
| 0–19 | Collapsing |

### Anomaly Detection

Rule-based alert generation:

| Alert Type | Severity | Trigger |
|------------|----------|---------|
| Trust Collapse | HIGH (1) | trust < 20 AND players > 5 |
| Combat Hotspot | MEDIUM (2) | combatIncidents > 8 |
| Blackout | CRITICAL (0) | infrastructure > 5 AND activity < 10 |
| Trade Spike | WARNING (3) | txFrequency > 85 AND players > 20 |

---

## Smart Contract Interface

The oracle calls these Move functions via PTBs:

```
frontier_pulse::update_system_health(cap, registry, clock, system_id, activity, trust, players, infra, tx_freq, combat)
frontier_pulse::update_player_reputation(cap, registry, clock, player, reliability, commerce, diplomacy, stewardship, volatility, archetype)
frontier_pulse::update_global_chi(cap, registry, clock, economic, security, growth, connectivity, trust, social, diagnosis)
frontier_pulse::emit_anomaly_alert(cap, clock, alert_type, severity, system_id, description)
frontier_pulse::issue_oracle_cap(admin_cap, recipient, clock)
```

### On-Chain Addresses (Testnet)

| Object | Address |
|--------|---------|
| Package | `0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9` |
| PulseRegistry | `0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4` |
| AdminCap | `0x2adb35c6ececb66b28fd178d246d3ef1b4f8c65fa5a3a7583192df91605da797` |
| Clock (Sui) | `0x0000000000000000000000000000000000000000000000000000000000000006` |

---

## Deployment

### Railway (Recommended)

The `railway.json` configuration handles everything:

```json
{
  "build": { "builder": "NIXPACKS", "buildCommand": "npm ci && npm run build" },
  "deploy": { "startCommand": "npm run start", "restartPolicyType": "ON_FAILURE", "restartPolicyMaxRetries": 10 }
}
```

1. Connect the repository to Railway
2. Set environment variables (`SUI_PRIVATE_KEY`, `ORACLE_CAP_ID`)
3. Deploy — the service starts the cron scheduler automatically

**Watch patterns** (auto-redeploy): `src/**`, `package.json`, `tsconfig.json`

### Manual

```bash
npm run build       # Compile TypeScript → dist/
npm start           # Start cron scheduler
```

### Logging

Log output is prefixed by source:
- `[Oracle]` — Cycle progress and timing
- `[WorldAPI]` — World API requests
- `[SuiGQL]` — Sui GraphQL queries
- `[Sui]` — Transaction execution
- `[RPC]` — RPC retries and errors

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `tsx src/index.ts` | Development with hot reload |
| `build` | `tsc` | Compile TypeScript to `dist/` |
| `start` | `npm run build && node dist/index.js` | Production build + run |
| `oracle:init` | `tsx src/initOracle.ts` | One-time OracleCap issuance |

---

## License

MIT

Part of the [Frontier Pulse](https://github.com/EzraNahumury/Frontier-Pulse) project for the EVE Frontier x Sui Hackathon 2026.
