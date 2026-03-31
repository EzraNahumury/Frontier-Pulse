# Frontier Pulse Frontend

Real-time civilization health monitoring dashboard for **EVE Frontier** on the Sui blockchain. Displays an interactive galaxy map, player reputation metrics, anomaly alerts, and on-chain transaction history through a cyberpunk-themed interface.

**Live:** [frontier-pulse-nine.vercel.app](https://frontier-pulse-nine.vercel.app/)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Pages & Routes](#pages--routes)
- [API Routes](#api-routes)
- [Key Components](#key-components)
- [Data Architecture](#data-architecture)
- [Sui Blockchain Integration](#sui-blockchain-integration)
- [State Management](#state-management)
- [Styling & Design System](#styling--design-system)
- [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 |
| UI | React 19.2.4 |
| Styling | Tailwind CSS 4 (`@tailwindcss/postcss`) |
| Blockchain SDK | @mysten/sui 2.12.0 |
| Wallet Kit | @mysten/dapp-kit 1.0.4 |
| State | Zustand 5.0.12 (persisted to localStorage) |
| Server State | @tanstack/react-query 5.95.2 |
| Language | TypeScript 5 |
| Package Manager | npm |

---

## Project Structure

```
fe_frontierpulse/
├── app/
│   ├── layout.tsx                          # Root layout with Providers
│   ├── page.tsx                            # Main dashboard (client-rendered)
│   ├── providers.tsx                       # Sui + React Query providers
│   ├── globals.css                         # Tailwind theme + animations
│   ├── icon.png                            # Favicon
│   │
│   ├── components/
│   │   ├── GalaxyCanvas.tsx                # 2D canvas star map (zoom/pan)
│   │   ├── SystemPanel.tsx                 # Selected system details sidebar
│   │   ├── WatchlistPanel.tsx              # "My Pulse" — personal watchlist
│   │   ├── AlertBell.tsx                   # Alert notification dropdown
│   │   ├── AlertFeed.tsx                   # Full alert history
│   │   ├── CHIGauge.tsx                    # Civilization Health Index gauge
│   │   ├── SubIndexBars.tsx                # CHI sub-metric bars
│   │   ├── TrustFilterBar.tsx              # Filter: All / Healthy / Stressed / Hostile
│   │   ├── SearchPalette.tsx               # Cmd+K search modal
│   │   ├── DualHeartbeat.tsx               # Live network pulse animation
│   │   ├── TimeLapse.tsx                   # System history replay
│   │   ├── TrustCompass.tsx                # Neighbor system navigation
│   │   ├── GuidedTour.tsx                  # Interactive onboarding tour
│   │   ├── WalletModal.tsx                 # Sui wallet connection UI
│   │   ├── DisconnectWalletModal.tsx       # Wallet disconnect confirmation
│   │   └── Panel.tsx                       # Reusable glassmorphism panel
│   │
│   ├── api/
│   │   ├── universe/route.ts               # Systems + CHI data
│   │   ├── alerts/route.ts                 # Anomaly alerts
│   │   ├── chi/route.ts                    # Civilization Health Index
│   │   ├── system/[id]/route.ts            # System details + vitals
│   │   ├── player/[address]/route.ts       # Player reputation
│   │   ├── player/[address]/systems/route.ts # Player's owned systems
│   │   ├── transactions/route.ts           # Oracle contract transactions
│   │   ├── pulse-card/[systemId]/route.ts  # Embeddable SVG card
│   │   └── world/system/[id]/route.ts      # Raw World API system
│   │
│   └── transactions/
│       └── page.tsx                        # Transaction log viewer
│
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── store.ts                # Zustand UI store
│   ├── colors.ts               # Trust level → color mapping
│   ├── vitals.ts               # Deterministic system vitals fallback
│   ├── worldApi.ts             # EVE Frontier World API client
│   ├── liveData.ts             # Sui GraphQL queries
│   ├── suiReader.ts            # Sui JSON-RPC (PulseRegistry reads)
│   ├── suiCharacter.ts         # Character lookups on Sui
│   └── oracleBackend.ts        # Railway oracle backend proxy
│
├── public/
│   └── logo/logo.png
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── .env.example
└── eslint.config.mjs
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
cd fe_frontierpulse
npm ci
```

### Environment Setup

```bash
cp .env.example .env.local
```

The default configuration points to the production oracle backend. Override only if needed:

```env
# Optional — defaults to https://oracle-fp.up.railway.app
ORACLE_BACKEND_URL=https://oracle-fp.up.railway.app
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ORACLE_BACKEND_URL` | No | `https://oracle-fp.up.railway.app` | Oracle backend base URL |
| `NEXT_PUBLIC_ORACLE_BACKEND_URL` | No | — | Client-side oracle URL (optional) |

All other endpoints are hardcoded:

| Service | URL |
|---------|-----|
| EVE Frontier World API | `https://world-api-utopia.uat.pub.evefrontier.com` |
| Sui Testnet RPC | `https://sui-testnet.nodeinfra.com` |
| Sui GraphQL | `https://graphql.testnet.sui.io/graphql` |

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Main dashboard — interactive galaxy map with side panels |
| `/transactions` | Oracle transaction log on Sui testnet with gas costs |

---

## API Routes

All API routes prioritize the Railway oracle backend (8s timeout) and automatically fall back to live computation when unavailable.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/universe?tier=hot\|remaining` | GET | Paginated system list with CHI and source metadata |
| `/api/chi` | GET | Civilization Health Index (7 metrics) |
| `/api/system/:id` | GET | System details, vitals, and active players |
| `/api/player/:address` | GET | Player reputation scores and system IDs |
| `/api/player/:address/systems` | GET | Player's owned system IDs |
| `/api/alerts` | GET | Anomaly alerts array |
| `/api/transactions` | GET | Recent oracle contract transactions on Sui |
| `/api/pulse-card/:systemId` | GET | Embeddable SVG card (600x315) for sharing |
| `/api/world/system/:id` | GET | Raw World API system data with computed vitals |

### Data Loading Strategy

The frontend uses a two-phase loading approach:

1. **Phase 1 (Hot):** Load active systems + alerts → UI becomes interactive immediately
2. **Phase 2 (Remaining):** Load remaining systems asynchronously → full search/navigation available

---

## Key Components

### Galaxy Visualization
- **GalaxyCanvas** — Canvas-based 2D star map rendering ~800 solar systems as colored dots. Supports zoom, pan, click-to-select, and trust-level color coding.

### Data Panels
- **SystemPanel** — Right sidebar showing selected system details: gate links, vitals bars, active players, and an on-chain endorse button.
- **WatchlistPanel** — "My Pulse" left sidebar with personal systems (auto-detected from wallet), starred systems, and quick navigation.
- **CHIGauge** — Circular gauge displaying the global Civilization Health Index (0–100).
- **SubIndexBars** — Horizontal bars for 7 CHI sub-metrics (economic vitality, security, growth, connectivity, trust, social cohesion).

### Alerts & Monitoring
- **AlertBell** — Notification dropdown with critical/high severity badge count.
- **AlertFeed** — Full scrollable alert history feed.
- **DualHeartbeat** — Footer animation showing live network pulse status.

### Navigation & Discovery
- **SearchPalette** — `Cmd+K` modal for searching systems by name or ID.
- **TrustFilterBar** — Toggle between All / Healthy / Stressed / Hostile views.
- **TrustCompass** — Shows neighboring systems via gate connections.
- **GuidedTour** — Step-by-step onboarding tour for first-time users.
- **TimeLapse** — Replay system history over time.

### Wallet
- **WalletModal** — Lists supported Sui wallets (Sui Wallet, Suiet, Ethos, Nightly, Martian).
- **DisconnectWalletModal** — Confirmation dialog for wallet disconnection.

---

## Data Architecture

```
┌─────────────────────────────────────────────────────┐
│              Frontend API Routes (/api/*)            │
│          (8s timeout on Railway, then fallback)      │
└──────────┬───────────────────┬──────────────────────┘
           │                   │
           ▼                   ▼
┌────────────────────┐  ┌──────────────────────┐
│  Railway Oracle    │  │  Live Computation     │
│  Backend           │  │  (fallback path)      │
│  Pre-computed,     │  │                       │
│  aggregated data   │  │  ├─ World API (REST)  │
└────────────────────┘  │  ├─ Sui RPC (JSON)    │
                        │  ├─ Sui GraphQL       │
                        │  └─ PulseRegistry     │
                        └──────────────────────┘
```

**Data Source Priority:**
1. Railway Oracle Backend — fast, pre-computed
2. Sui Testnet Smart Contract — on-chain PulseRegistry
3. Sui GraphQL — live player activity and assemblies
4. EVE Frontier World API — system topology and gates
5. Deterministic Vitals — hash-based fallback (same ID = same vitals)

---

## Sui Blockchain Integration

### On-Chain Addresses (Testnet)

| Object | Address |
|--------|---------|
| Package | `0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9` |
| PulseRegistry | `0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4` |

### Contract Interactions

- **Read:** System health, player reputation, CHI metrics, endorsement counts via `suiReader.ts`
- **Write:** `endorse_system()` — any connected wallet can endorse a system on-chain
- **Events:** Transaction history queried via Sui JSON-RPC

### Wallet Integration

Uses `@mysten/dapp-kit` for wallet connection and transaction signing. Supported wallets:
- Sui Wallet
- Suiet
- Ethos
- Nightly
- Martian

On wallet connect, the dashboard auto-detects the player's owned systems and zooms to their location.

---

## State Management

### Zustand Store (`lib/store.ts`)

```typescript
interface UIStore {
  selectedSystemId: number | null;
  selectedPlayerAddress: string | null;
  activeView: "overview" | "systems" | "players" | "alerts";
  walletAddress: string | null;
  watchedSystemIds: number[];      // User-starred systems
  personalSystemIds: number[];     // Auto-detected from wallet
}
```

**Persisted to localStorage** (key: `frontier-pulse`):
- `walletAddress`
- `watchedSystemIds`
- `personalSystemIds`

---

## Styling & Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#05080f` | Page background |
| Surface | `#070b14` | Panel backgrounds |
| Healthy | `#00ff88` | Trust level healthy |
| Stressed | `#ff9800` | Trust level stressed |
| Hostile | `#ff3d3d` | Trust level hostile |
| Accent | `#00e5ff` | CHI gauge, primary accent |
| Text | `#b8c7d6` | Body text |

### UI Patterns

- Glassmorphism panels with backdrop blur and gradient borders
- Monospace font (Geist Mono) for metrics and data
- Sans-serif font (Geist Sans) for labels and navigation
- Micro-animations: fade-in, scale transitions
- Canvas rendering for performant galaxy visualization

---

## Deployment

### Vercel (Recommended)

1. Import the `fe_frontierpulse` directory to Vercel
2. Framework preset: **Next.js**
3. Optionally set `ORACLE_BACKEND_URL` environment variable
4. Deploy

The frontend API routes automatically proxy to the Railway oracle backend. No additional configuration required.

### Manual

```bash
npm run build
npm start
```

Runs on port 3000 by default. Requires Node.js 20+.

---

## License

Part of the [Frontier Pulse](https://github.com/EzraNahumury/Frontier-Pulse) project for the EVE Frontier x Sui Hackathon 2026.
