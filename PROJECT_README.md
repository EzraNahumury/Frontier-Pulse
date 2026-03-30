# Frontier Pulse

### The Vital Signs of a Living Universe

> *"Any dashboard can show you activity. We show you whether civilization is real."*

**Frontier Pulse** is a real-time civilization health monitor for [EVE Frontier](https://evefrontier.com) — a space survival MMO where thousands of players rebuild civilization across 24,000 star systems on the [Sui blockchain](https://sui.io).

It treats the entire game universe as a **living organism**, visualizing not just what's happening — but whether what's happening is building something that lasts. By combining biometric-style universe visualization with a deep behavioral trust engine, Frontier Pulse answers the most fundamental question about any civilization:

**"Is it alive, or just busy dying?"**

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Core Architecture](#core-architecture)
- [Features](#features)
  - [The Living Galaxy Map](#1-the-living-galaxy-map)
  - [The Dual Heartbeat](#2-the-dual-heartbeat)
  - [Civilization Health Index (CHI)](#3-civilization-health-index-chi)
  - [Trust Compass (Player Reputation)](#4-trust-compass-player-reputation)
  - [Deep Dive Mode](#5-deep-dive-mode)
  - [Anomaly Detection & Alerts](#6-anomaly-detection--alerts)
  - [Time-Lapse Replay](#7-time-lapse-replay)
  - [Pulse Cards](#8-pulse-cards)
  - [Transaction Log](#9-transaction-log)
  - [Wallet Integration](#10-wallet-integration)
  - [Watchlist Panel](#11-watchlist-panel)
  - [Guided Tour](#12-guided-tour)
- [Technical Documentation](#technical-documentation)
  - [System Architecture](#system-architecture)
  - [Tech Stack](#tech-stack)
  - [Data Pipeline](#data-pipeline)
  - [Reputation Engine](#reputation-engine)
  - [Visualization Engine](#visualization-engine)
  - [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
  - [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Data Sources](#data-sources)
- [Hackathon Context](#hackathon-context)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## The Problem

EVE Frontier is a universe of **24,000 star systems** where thousands of players simultaneously mine, trade, build, fight, and form alliances — all recorded on the Sui blockchain. But players face two critical blind spots:

### Blind Spot 1: "What's happening out there?"
You can only be in one system at a time. Wars ignite three sectors away and you don't know. A critical trade route gets severed and you find out when your shipment never arrives. An alliance is building a massive gate network in unclaimed space and you miss the opportunity to join.

**There is no way to see the universe at a glance.**

### Blind Spot 2: "Can I trust this person?"
There is no law in EVE Frontier. No police. No courts. No credit system. When a stranger offers you a trade, you have no way to know if they'll honor it or rob you. When an alliance invites you to join, you can't tell if they're builders or raiders.

**There is no way to evaluate trust.**

### The Deeper Problem
These aren't just two missing features. They're two halves of the same question:

> *"Is this civilization actually healthy?"*

A universe can be full of activity but collapsing in trust. Markets can be booming while betrayal rates soar. Systems can be bright with players while the social fabric disintegrates. **Activity without trust isn't civilization — it's chaos.**

---

## The Solution

Frontier Pulse combines a **real-time universe visualization layer** with a **behavioral trust intelligence engine** into a single unified tool that shows the true health of civilization.

| Component | Role | What It Reveals |
|-----------|------|-----------------|
| **Pulse Layer** (Visualization) | The eyes | Where things are happening — activity, combat, trade, growth |
| **Agora Engine** (Trust Intelligence) | The brain | Whether what's happening is building real civilization — trust, reliability, cooperation |
| **Combined** | The vital signs | Whether civilization is thriving, stressed, feverish, or dying |

The result: a living, breathing galaxy map where every pulse of light, every flowing connection, and every color shift tells you something real about the state of human civilization in the Frontier.

---

## Core Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                               │
│  Next.js 16 + React 19 + Canvas API (Galaxy + EKG)           │
│  SVG (Radar Charts + Pulse Cards) + TailwindCSS 4            │
│  Zustand (State Management)                                   │
├──────────────┬───────────────────────┬───────────────────────┤
│  Galaxy View │   Heartbeat Monitor   │   Trust Compass UI    │
│  (Pulse)     │   (Dual EKG)          │   (Agora)             │
└──────┬───────┴───────────┬───────────┴───────────┬───────────┘
       │                   │                       │
┌──────▼───────────────────▼───────────────────────▼───────────┐
│                   NEXT.JS API ROUTES                          │
│  /api/universe  /api/chi  /api/system  /api/player  etc.     │
├──────────────────────────────────────────────────────────────┤
│  Reads from World API (live game data)                       │
│  Reads from Sui RPC (on-chain scores from PulseRegistry)     │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    ORACLE BACKEND                              │
│  Node.js + TypeScript + node-cron (every 10 minutes)         │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Data Aggregator │  │ Reputation Eng. │  │ Anomaly Det. │ │
│  │  (Pulse Engine)  │  │ (Agora Engine)  │  │   Engine     │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘ │
│           │                    │                   │          │
│  ┌────────▼────────────────────▼───────────────────▼───────┐ │
│  │              CHI Calculator (Combined Index)             │ │
│  └─────────────────────────┬───────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                       DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────────────────────────────┐  │
│  │ World API    │  │ Sui Blockchain (Testnet)              │  │
│  │ (REST)       │  │ PulseRegistry shared object           │  │
│  │ Systems,     │  │ ├─ SystemHealth[] (per system)        │  │
│  │ Assemblies,  │  │ ├─ PlayerReputation[] (per player)    │  │
│  │ Killmails    │  │ ├─ CivilizationHealthIndex (global)   │  │
│  └──────────────┘  │ └─ Anomaly alert events               │  │
│                    └──────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Features

### 1. The Living Galaxy Map

The main view is a 2D galaxy map rendered on HTML Canvas where every star system is a **node that pulses with light**. All 24,502 solar systems from the live EVE Frontier World API are rendered simultaneously. Visual properties encode real data:

| Visual Property | Data Encoded |
|-----------------|-------------|
| **Brightness** | Player activity level (more players = brighter glow) |
| **Color** | Trust-weighted activity: Green = healthy/trusted (trust >= 70), Orange = eroding trust (40-70), Red = hostile/betrayal zone (< 40) |
| **Node Size** | Depth-based sizing from 3D coordinate normalization |
| **Selection Ring** | Dashed pulsing ring on selected system with glow effect |
| **Connection Lines** | Smart Gate links — cyan flowing lines from selected system to gate destinations |

**Interaction:** Click any system to select it and open the Deep Dive panel. Hover for glow preview. Use the Trust Filter Bar to highlight systems by trust level.

### 2. The Dual Heartbeat

A persistent EKG-style monitor at the bottom of the screen shows two synchronized heartbeat lines rendered on Canvas:

- **White line (Activity Pulse):** Raw activity — transactions, kills, deployments, logins
- **Green line (Trust Pulse):** Trust health — reputation trends, cooperation rates, betrayal frequency

The heartbeat uses a 300-point rolling buffer updated at ~30fps with quadratic curve interpolation and a moving scanline effect. Heartbeat-like spikes are generated using sinusoidal waveforms with periodic beat phases.

**What the relationship between the lines reveals:**

| Pattern | Activity | Trust | Diagnosis |
|---------|----------|-------|-----------|
| **Thriving** | High | High | Genuine civilization growth |
| **Fever** | High | Dropping | Lots happening but trust is breaking — war, exploitation |
| **Hibernation** | Low | Stable | Quiet but the social fabric is intact |
| **Extinction** | Dropping | Dropping | Civilization is collapsing |
| **Recovery** | Rising | Rising | Rebuilding after a crisis |

### 3. Civilization Health Index (CHI)

A composite score (0-100) representing overall civilization health, displayed as a prominent SVG circular arc gauge:

| Sub-Index | Weight | What It Measures |
|-----------|--------|-----------------|
| **Economic Vitality** | 20% | Transaction frequency, infrastructure density |
| **Security Index** | 15% | Inverse of combat incident rate |
| **Growth Rate** | 15% | Percentage of systems with active players/infrastructure |
| **Connectivity** | 15% | Average system activity as proxy for interconnectedness |
| **Trust Index** | 20% | Average trust scores across all systems |
| **Social Cohesion** | 15% | Combined trust, security, and player density |

**Diagnosis thresholds:** >= 80 Flourishing, >= 65 Thriving, >= 50 Stable, >= 35 Stressed, >= 20 Declining, < 20 Collapsing

The CHI is computed by the Oracle Backend, written on-chain to the Sui smart contract, and read by the frontend via Sui JSON-RPC. Six sub-index progress bars are displayed alongside the gauge.

### 4. Trust Compass (Player Reputation)

Every player gets a multi-dimensional reputation profile rendered as an SVG radar chart (pentagon):

| Dimension | What It Measures | Question Answered |
|-----------|-----------------|-------------------|
| **Reliability** | Behavioral consistency, assembly count, systems visited | "Can they be counted on?" |
| **Commerce** | Trade fairness and infrastructure investment | "Are they honest in deals?" |
| **Diplomacy** | Cross-system cooperation, low aggression ratio | "Do they bring people together?" |
| **Stewardship** | Infrastructure contribution and deployment count | "Do they build for others?" |
| **Volatility** | Combat involvement, kill/death variance (lower = better) | "Could they betray me?" |

**Player archetypes that emerge from the data:**
- **Civilization Builder:** Stewardship >= 80, Reliability >= 70
- **Trusted Trader:** Commerce >= 80, Reliability >= 70
- **Diplomat:** Diplomacy >= 75, Volatility < 30
- **Warlord:** Volatility >= 70, Commerce < 40
- **Wildcard:** 50 <= Volatility < 70
- **Newcomer:** Default archetype

### 5. Deep Dive Mode

Click any system on the galaxy map to open the System Panel and see:
- **System vitals** — Activity level, Trust level, Local CHI (colored progress bars)
- **System stats** — Player count, Infrastructure count, TX Frequency, Combat incidents
- **Gate connections** — Real gate link data fetched from World API (live indicator)
- **Constellation neighbors** — Up to 8 nearby systems in the same constellation (clickable)
- **Known pilots** — Players present in the system with trust scores (clickable for full Trust Compass)
- **Pulse Card link** — Generate a shareable SVG snapshot of the system

Click any player to see their full Trust Compass radar chart with archetype classification.

### 6. Anomaly Detection & Alerts

Pattern detection that flags unusual events, with a bell icon + dropdown notification panel:

| Alert Type | Trigger Condition | Severity |
|-----------|-------------------|----------|
| **Blackout** | Infrastructure > 5 but activity < 10 | Critical |
| **Trust Collapse** | Trust level < 20 with player count > 5 | High |
| **Combat Hotspot** | Combat incidents > 8 in a system | Medium |
| **Trade Spike** | TX frequency > 85 with player count > 20 | Warning |
| **Alliance Forming** | New gate network emerging between systems | Info |
| **Exodus** | Player count declining sharply in a region | Warning |

Anomalies are detected by the Oracle Backend during each scoring cycle and emitted as on-chain events via the smart contract.

### 7. Time-Lapse Replay

Replay civilization evolution as an accelerated animation with synthetic historical data:
- **Range selector:** 24h, 7d (default), 30d
- **Playback controls:** Play/pause, speed (1x/2x/4x)
- **Interactive progress bar** (clickable scrubber)
- **Snapshot stats:** CHI trend, healthy/stressed/hostile system counts, activity level

Historical snapshots are generated by applying sinusoidal time-varying offsets to base system vitals, simulating civilization change over time.

### 8. Pulse Cards

Generate shareable SVG snapshot images (600x315px, Twitter card optimized) of any system's vital signs via `/api/pulse-card/:systemId`. Includes:
- System name and ID
- Trust level badge (Healthy / Stressed / Hostile) with color coding
- CHI score display
- Vital bars (Activity, Trust, TX Freq, Infrastructure, Combat)
- Key stats (player count, infrastructure, combat incidents)
- Frontier Pulse branding
- Cached for 5 minutes (max-age=300)

### 9. Transaction Log

A dedicated `/transactions` page displaying real-time oracle transactions from the Sui blockchain:
- **Auto-refresh** every 5 seconds with live timestamp updates
- **Pagination** controls (10/20/50 items per page)
- **Transaction types:** System health updates (purple), Global CHI updates (blue), Anomaly alerts (orange), Player reputation updates (pink), Oracle initialization (green)
- Each transaction shows: function name, digest (linked to Suiscan), age, sender, Move call count, gas consumed (SUI + MIST)
- Summary stats: system batches, CHI updates, total gas used

### 10. Wallet Integration

Native Sui wallet connection powered by `@mysten/dapp-kit`:

- **Connect modal** — Detects and lists available Sui wallets (Sui Wallet, Suiet, Ethos, etc.)
- **Disconnect modal** — Confirmation dialog before disconnecting wallet session
- **Persistent session** — Wallet state persisted via Zustand store
- **Provider setup** — `SuiClientProvider` + `WalletProvider` + `QueryClientProvider` wrapped in `providers.tsx`

When connected, the user's wallet address is available across the app for personalized features (watchlist, player lookup).

### 11. Watchlist Panel

A personal tracking panel that lets users bookmark and monitor systems and players:

- **Add/remove** systems and players to a persistent watchlist
- **Quick access** to watched items from the main dashboard
- **State persistence** via Zustand store with localStorage
- **Integration** with System Panel and Trust Compass — watch items directly from detail views

### 12. Guided Tour

An interactive onboarding experience that walks new users through the dashboard:

- **Step-by-step walkthrough** highlighting key UI elements (galaxy map, heartbeat, CHI gauge, trust compass, etc.)
- **Contextual tooltips** explaining what each feature does and how to interact with it
- **Progressive disclosure** — introduces complexity gradually so users aren't overwhelmed
- **Dismissible** — can be skipped or replayed at any time

---

## Technical Documentation

### System Architecture

The application follows a three-tier architecture:

```
Client (Browser)  ←→  Next.js API Routes  ←→  Data Sources
   React 19 App        /api/* handlers         World API (REST)
   Canvas API          Server Components       Sui JSON-RPC
   SVG Charts                                  Sui Smart Contract
```

**Data flows in two paths:**
1. **Oracle Path:** Oracle Backend polls World API every 10 minutes, computes scores (system health, player reputation, global CHI, anomalies), and writes results on-chain to the Sui smart contract via batched Programmable Transaction Blocks (PTBs)
2. **Frontend Path:** Next.js API routes read from both the World API (system data) and Sui RPC (on-chain scores from PulseRegistry) to serve the dashboard

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Next.js 16.2.1 + React 19.2.4 + TypeScript | Full-stack app with API routes |
| **Galaxy Rendering** | Canvas API + requestAnimationFrame | 24,502-node galaxy map with trust-colored pulsing |
| **Heartbeat / EKG** | Canvas API + requestAnimationFrame | Dual EKG monitor with quadratic curve interpolation |
| **Charts** | SVG (inline React) | Radar charts (Trust Compass), circular gauge (CHI), progress bars |
| **Styling** | TailwindCSS 4 | Responsive space-themed dark UI |
| **State Management** | Zustand 5 | Lightweight client-side state (selected system, player, view, filters) |
| **Smart Contract** | Sui Move (edition 2024) | On-chain PulseRegistry (trust, CHI, reputation, alerts) |
| **Oracle Backend** | Node.js + TypeScript | Fetches World API, computes scores, writes on-chain |
| **Sui SDK** | @mysten/sui ^2.12.0 (frontend + oracle) | On-chain reads and transaction signing |
| **Wallet Integration** | @mysten/dapp-kit ^1.0.4 | Sui wallet connection (connect/disconnect) |
| **Data Fetching** | @tanstack/react-query ^5.95.2 | Cached data fetching with auto-refetch |
| **Scheduling** | node-cron 3.x | Oracle runs every 10 minutes (configurable via CRON_SCHEDULE) |
| **Image Gen** | SVG (server-generated in API route) | Shareable Pulse Card snapshots (600x315px) |
| **On-chain Reads** | Sui JSON-RPC (`sui_getObject`) | Frontend reads CHI/registry directly from contract |
| **Deploy** | Vercel (frontend) | Production hosting |

### Data Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    INGESTION (Oracle Backend)                 │
│                    Triggered every 10 minutes via node-cron  │
├─────────────────────────────────────────────────────────────┤
│  World API Poller                                            │
│  ├─ fetchAllSystems()     ──→ All 24,502 solar systems       │
│  ├─ fetchSmartAssemblies()──→ Player-deployed infrastructure │
│  └─ fetchKillmails()      ──→ PvP combat records             │
│                                                              │
│  enrichSystems()           ──→ Aggregate assemblies + kills   │
│                                per system, extract player     │
│                                addresses                      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    PROCESSING (Oracle Backend)                │
├─────────────────────────────────────────────────────────────┤
│  computeSystemHealth()    ──→ Per-system: activity, trust,   │
│                               playerCount, infrastructure,   │
│                               txFrequency, combat, localChi  │
│  computePlayerReputation()──→ Per-player: 5 Trust Compass    │
│                               dimensions + archetype         │
│  computeGlobalCHI()       ──→ 6 sub-indices + overall score  │
│                               + diagnosis                    │
│  detectAnomalies()        ──→ Pattern matching for alerts     │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    STORAGE (Sui Blockchain)                   │
├─────────────────────────────────────────────────────────────┤
│  writeSystemHealthBatch()     ──→ Batched PTB (50/batch)     │
│  writePlayerReputationBatch() ──→ Batched PTB (50/batch)     │
│  writeGlobalCHI()             ──→ Single PTB call            │
│  emitAlertsBatch()            ──→ On-chain events (10/batch) │
│                                                              │
│  All writes go to PulseRegistry shared object on Sui testnet │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    DELIVERY (Next.js API Routes)             │
├─────────────────────────────────────────────────────────────┤
│  /api/universe       ──→ All systems + CHI (World API + Sui) │
│  /api/chi            ──→ On-chain CHI from PulseRegistry     │
│  /api/system/:id     ──→ System detail + vitals + players    │
│  /api/player/:addr   ──→ Player reputation profile           │
│  /api/alerts         ──→ Anomaly alert feed                  │
│  /api/transactions   ──→ Oracle tx history from Sui          │
│  /api/pulse-card/:id ──→ SVG snapshot image                  │
└─────────────────────────────────────────────────────────────┘
```

### Reputation Engine

The Agora Engine calculates reputation scores based on five behavioral dimensions derived from World API and on-chain data.

#### System Health Scoring

**With real enrichment data (assemblies + killmails):**

```
Inputs:
  - playerCount: Active unique player addresses in system
  - infraCount: Smart Assemblies deployed in system
  - recentKills: Killmail count in system

Formula:
  playerScore     = min(playerCount * 5, 100)
  infraScore      = min(infraCount * 3, 100)
  combatScore     = min(recentKills * 8, 100)

  activityLevel   = playerScore * 0.4 + infraScore * 0.35 + combatScore * 0.25
  trustLevel      = clamp(100 - (kills / playerCount) * 50 + infraCount * 2, 0, 100)
  txFrequency     = clamp((playerCount * 3 + infraCount * 2 + kills) * 2, 0, 100)
  localChi        = (activityLevel * 40 + trustLevel * 60) / 100
```

**Without real data (deterministic fallback):**
Uses a seeded hash function per system ID — produces consistent pseudo-random scores. Same algorithm runs in both Oracle Backend (`scoring.ts`) and Frontend (`vitals.ts`) for consistency.

#### Player Reputation Scoring (0-100 per dimension)

```
Inputs:
  - assemblyCount: Smart Assemblies owned
  - systemsVisited: Unique systems with activity
  - totalKills: Kill count (as attacker)
  - totalDeaths: Death count (as victim)

Formulas:
  reliability  = clamp(40 + assemblyCount * 5 + systemsVisited * 2, 0, 100)
  commerce     = clamp(30 + assemblyCount * 8, 0, 100)
  diplomacy    = clamp(50 - aggressionRatio * 40 + systemsVisited * 3, 0, 100)
  stewardship  = clamp(20 + assemblyCount * 10, 0, 100)
  volatility   = clamp(totalCombat * 5 + abs(kills - deaths) * 3, 0, 100)
```

#### Global CHI Calculation

```
Inputs:
  - All system health scores from current cycle

Formulas:
  economicVitality = avg(txFrequency) * 0.6 + avg(infraCount * 5) * 0.4
  securityIndex    = clamp(100 - avg(combatIncidents) * 8, 0, 100)
  growthRate       = (activeSystemCount / totalSystems) * 100
  connectivity     = avg(activityLevel) * 1.1
  trustIndex       = avg(trustLevel)
  socialCohesion   = trustIndex * 0.4 + securityIndex * 0.3 + avg(playerCount) * 3 * 0.3

  overall = (economicVitality * 20 +
             securityIndex * 15 +
             growthRate * 15 +
             connectivity * 15 +
             trustIndex * 20 +
             socialCohesion * 15) / 100

Diagnosis:
  >= 80: Flourishing | >= 65: Thriving | >= 50: Stable
  >= 35: Stressed    | >= 20: Declining | < 20: Collapsing
```

### Visualization Engine

#### Galaxy Renderer (Canvas API)

```
Canvas (2D Context)
├── Background
│   ├── Radial gradient (dark space nebula)
│   ├── Grid lines (cyan, 0.03 opacity)
│   └── Background stars (400 cosmetic twinkle particles)
├── System Nodes (24,502 circles)
│   ├── Default: gray dot, depth-based size (1.5-3px)
│   ├── Filter match: colored glow (green/orange/red by trust)
│   ├── Hovered: enlarged glow + core
│   └── Selected: large pulsing glow + dashed ring + label + core
├── Gate Connections (when system selected)
│   └── Cyan lines with flowing dash animation to destinations
└── Mouse Interaction
    ├── Hover detection (15px threshold)
    └── Click to select system

Animation: requestAnimationFrame loop
Coordinate system: Normalized 0-1 (nx, ny) from World API 3D positions
Depth: z-axis mapped to visual size for parallax effect
```

#### Heartbeat Renderer (Canvas API)

```
Canvas (2D Context)
Buffer:    Rolling array of 300 data points (~30fps update rate)
Rendering: Quadratic Bezier curve interpolation (ctx.quadraticCurveTo)
Animation: requestAnimationFrame, shift buffer left, append new sample
Lines:     Activity (white, opacity 0.9) and Trust (green, opacity 0.8)
Grid:      Horizontal lines every h/4, vertical lines every 40px
Effects:   Moving scanline (horizontal sweep), beat spikes via sin waves

Data Generation:
  actBase  = 50 + sin(t * 1.1) * 12 + sin(t * 2.7) * 6
  actSpike = beatPhase < 0.3 ? sin(beatPhase / 0.3 * PI) * 25 : 0
  activity = clamp(actBase + actSpike + random_noise)
```

#### Trust Compass Renderer (SVG)

```
SVG (inline React component)
Shape:     Pentagon (5 axes at 72-degree intervals)
Axes:      Reliability (-90°), Commerce (-18°), Stewardship (54°),
           Diplomacy (126°), Volatility (198°, inverted: 100 - value)
Guides:    Pentagon outlines at 25/50/75/100 levels
Data:      Filled polygon with semi-transparent trust color
Labels:    3-letter axis labels (REL, COM, STW, DIP, VOL)
Bars:      5 dimension progress bars below radar chart
Color:     Green (score >= 70), Orange (>= 40), Red (< 40)
```

### API Reference

#### Next.js API Routes

```
GET  /api/universe
     Returns current state of all systems with CHI
     Response: { systems[], chi, totalSystems, source, onChain? }
     Source: World API (paginated fetch of all ~24,502 systems) + Sui RPC (CHI from PulseRegistry)

GET  /api/chi
     Returns global Civilization Health Index from on-chain contract
     Response: { overallScore, economicVitality, securityIndex, growthRate,
                 connectivity, trustIndex, socialCohesion, diagnosis,
                 source, onChainSystems, onChainPlayers, lastUpdatedMs }
     Falls back to mock CHI if on-chain has no data

GET  /api/system/:id
     Returns detailed state for a single system
     Response: { ...SystemDetail, vitals, players[] }
     Includes: computed vitals (activity, trust, localChi), mock players in system

GET  /api/world/system/:id
     Returns system detail directly from World API with computed vitals
     Response: { ...SystemDetail, vitals }
     Used by SystemPanel for gate connection data

GET  /api/player/:address
     Returns Trust Compass profile for a player by Sui address
     Response: { address, name, reliability, commerce, diplomacy,
                 stewardship, volatility, compositeScore, archetype, systemId }
     Returns 404 if address not found

GET  /api/alerts
     Returns anomaly alert feed
     Response: { alerts[] }
     Each alert: { id, alertType, severity, systemId, systemName, description, timestampMs }

GET  /api/transactions
     Returns recent oracle transactions from Sui blockchain
     Response: { transactions[], total, registryId, packageId }
     Queries Sui JSON-RPC for transactions from oracle address, filtered by package ID
     Parses Move function names, calculates gas usage

GET  /api/pulse-card/:systemId
     Returns a generated SVG snapshot image for sharing
     Content-Type: image/svg+xml
     Size: 600x315px (Twitter card optimized)
     Cache: max-age=300 (5 minutes)
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ (comes with Node.js)
- **Git**
- **Sui CLI** (optional, for smart contract deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/frontier-pulse.git
cd frontier-pulse

# Install frontend dependencies
cd fe_frontierpulse
npm install

# Install oracle backend dependencies
cd ../oracle_backend
npm install
```

### Environment Variables

**`oracle_backend/.env`** (copy from `.env.example`)
```env
# Sui Network
SUI_NETWORK=testnet
SUI_PRIVATE_KEY=your_private_key_here

# Smart Contract IDs
PACKAGE_ID=0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9
PULSE_REGISTRY_ID=0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4
ADMIN_CAP_ID=0x2adb35c6ececb66b28fd178d246d3ef1b4f8c65fa5a3a7583192df91605da797
ORACLE_CAP_ID=                    # Set after running npm run oracle:init

# EVE Frontier
WORLD_API_BASE=https://world-api-stillness.live.tech.evefrontier.com

# Scheduling
CRON_SCHEDULE=*/10 * * * *        # Every 10 minutes
BATCH_SIZE=50                     # Systems per transaction batch
MAX_SYSTEMS_PER_CYCLE=500         # Max systems processed per cycle
```

**Frontend** uses hardcoded constants in source files:
- World API base URL: `https://world-api-stillness.live.tech.evefrontier.com` (in `lib/worldApi.ts`)
- Sui RPC URL: `https://fullnode.testnet.sui.io:443` (in `lib/suiReader.ts`)
- PulseRegistry ID: `0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4` (in `lib/suiReader.ts`)

### Running Locally

```bash
# Frontend (Next.js dev server)
cd fe_frontierpulse
npm run dev                       # http://localhost:3000

# Oracle Backend (in a separate terminal)
cd oracle_backend
npm run dev                       # Starts cron scheduler

# Oracle: single cycle then exit
npm run dev -- --once

# Oracle: initialize OracleCap (one-time setup)
npm run oracle:init
```

### Deployment

**Frontend → Vercel**
```bash
cd fe_frontierpulse && vercel --prod
```

**Oracle Backend → Railway / any Node.js host**
```bash
cd oracle_backend
npm run build && npm start
```

**Smart Contract → Sui Testnet** (already deployed)
```
Package ID: 0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9
```

---

## Project Structure

```
SUI_FRONTIER/
├── fe_frontierpulse/                  # Frontend (Next.js 16 + React 19)
│   ├── app/
│   │   ├── page.tsx                   # Main dashboard
│   │   ├── layout.tsx                 # Root layout
│   │   ├── providers.tsx              # Sui wallet + React Query providers
│   │   ├── globals.css                # Space-themed dark CSS
│   │   ├── pulse-card/
│   │   │   └── [systemId]/page.tsx    # Dynamic system detail view
│   │   ├── transactions/
│   │   │   └── page.tsx               # Oracle transaction log page
│   │   ├── components/
│   │   │   ├── GalaxyCanvas.tsx       # 24,502-node galaxy map (Canvas API)
│   │   │   ├── DualHeartbeat.tsx      # Dual EKG monitor (Canvas API)
│   │   │   ├── CHIGauge.tsx           # Civilization Health Index gauge (SVG)
│   │   │   ├── SubIndexBars.tsx       # 6 CHI sub-index progress bars
│   │   │   ├── TrustCompass.tsx       # 5-dimension radar chart (SVG)
│   │   │   ├── TrustFilterBar.tsx     # Green/Amber/Red filter pills
│   │   │   ├── SystemPanel.tsx        # System deep dive panel
│   │   │   ├── TimeLapse.tsx          # Time-lapse replay controller
│   │   │   ├── AlertBell.tsx          # Alert notification bell + dropdown
│   │   │   ├── AlertFeed.tsx          # Anomaly alert feed list
│   │   │   ├── SearchPalette.tsx      # Ctrl+K system search palette
│   │   │   ├── TransactionHistory.tsx # Dashboard transaction widget
│   │   │   ├── GuidedTour.tsx         # Interactive onboarding tour
│   │   │   ├── WalletModal.tsx        # Sui wallet connection modal
│   │   │   ├── DisconnectWalletModal.tsx # Wallet disconnect confirmation
│   │   │   ├── WatchlistPanel.tsx     # User system/player watchlist
│   │   │   └── Panel.tsx              # Reusable glassmorphism panel
│   │   └── api/
│   │       ├── universe/route.ts      # All systems + CHI (World API + Sui)
│   │       ├── chi/route.ts           # CHI from on-chain contract
│   │       ├── system/[id]/route.ts   # Single system detail
│   │       ├── player/[address]/route.ts        # Player reputation
│   │       ├── player/[address]/systems/route.ts # Player's systems
│   │       ├── alerts/route.ts        # Anomaly alerts
│   │       ├── transactions/route.ts  # Oracle tx history from Sui
│   │       ├── pulse-card/[systemId]/route.ts # Shareable SVG card
│   │       └── world/system/[id]/route.ts     # World API proxy
│   ├── lib/
│   │   ├── worldApi.ts                # EVE Frontier World API client
│   │   ├── suiReader.ts               # Sui JSON-RPC on-chain reader
│   │   ├── liveData.ts                # Live World API data fetching + trust scoring
│   │   ├── vitals.ts                  # Deterministic system vitals (hash-based)
│   │   ├── colors.ts                  # Trust color palette + severity colors
│   │   ├── types.ts                   # TypeScript interfaces
│   │   ├── store.ts                   # Zustand UI store (UI + watchlist + wallet)
│   │   ├── seedData.ts               # Seed data for development
│   │   └── mockData.ts               # Simulated player/alert data
│   ├── package.json
│   └── tsconfig.json
│
├── oracle_backend/                    # Oracle service (Node.js + TypeScript)
│   ├── src/
│   │   ├── index.ts                   # Main entry + cron scheduler
│   │   ├── initOracle.ts             # One-time OracleCap setup
│   │   ├── config.ts                  # Environment config
│   │   ├── worldApi.ts                # World API data fetcher (paginated)
│   │   ├── scoring.ts                 # Score computation engine
│   │   └── suiWriter.ts              # Sui PTB transaction writer
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── smartcontract_FP/                  # Sui Move smart contract
│   ├── sources/
│   │   ├── frontier_pulse.move        # PulseRegistry, Trust, CHI, Alerts
│   │   └── smartcontract_fp.move      # Secondary module
│   ├── tests/
│   │   ├── frontier_pulse_tests.move
│   │   └── smartcontract_fp_tests.move
│   ├── Move.toml
│   └── Published.toml                 # Deployed to Sui testnet
│
├── PROJECT_README.md
├── RESEARCH_EVE_FRONTIER_SUI.md
└── ideas/                             # Design documentation
    ├── 00_OVERVIEW.md
    ├── 01_THE_AGORA.md
    ├── 02_FRONTIER_PULSE.md
    ├── 03_THE_CHRONICLE.md
    ├── 04_ARK_PROTOCOL.md
    └── 05_MERIDIAN.md
```

---

## Data Sources

### EVE Frontier World API

Base URL: `https://world-api-stillness.live.tech.evefrontier.com`

| Endpoint | Data | Used For |
|----------|------|----------|
| `GET /v2/solarsystems` | All 24,502 solar systems with 3D coordinates | Galaxy map rendering, system enumeration |
| `GET /v2/solarsystems/:id` | Single system detail + gate links | Deep dive, constellation neighbors |
| `GET /v2/smartassemblies` | All Smart Assemblies (gates, SSUs, turrets) | Infrastructure mapping, stewardship scores |
| `GET /v2/killmails` | PvP kill records | Combat analysis, volatility scoring |

- **API Docs:** https://docs.evefrontier.com/SwaggerWorldApi
- **Builder Docs:** https://docs.evefrontier.com

### Sui Blockchain (On-Chain Data)

| Data | Method | Used For |
|------|--------|----------|
| PulseRegistry object | `sui_getObject` | Read CHI scores, system/player counts |
| Oracle transactions | `suix_queryTransactionBlocks` | Transaction log display |

**Deployed Contract:**
- **Package:** `0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9`
- **PulseRegistry:** `0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4`
- **Network:** Sui Testnet
- **Sui RPC:** `https://fullnode.testnet.sui.io:443`

- **Sui RPC Docs:** https://docs.sui.io/references/sui-api
- **Sui TypeScript SDK:** https://sdk.mystenlabs.com

### Data Refresh Rates

| Data Type | Method | Interval |
|-----------|--------|----------|
| System data | Oracle polls World API | Every 10 minutes |
| Smart assemblies | Oracle polls World API | Every 10 minutes |
| Killmails | Oracle polls World API | Every 10 minutes |
| Score computation | Oracle batch calculation | Every 10 minutes |
| On-chain writes | Oracle PTB transactions | Every 10 minutes |
| Frontend data | Next.js API route fetch | On page load / user action |
| World API cache | In-memory (worldApi.ts) | 10-minute TTL |

---

## Hackathon Context

### Event
**EVE Frontier x Sui Hackathon 2026** — *"A Toolkit for Civilization"*

| Detail | Value |
|--------|-------|
| Organizers | CCP Games + Mysten Labs (Sui) |
| Prize Pool | $80,000 USD |
| Track | External Tools (World API) |
| Deadline | March 31, 2026 (23:59 UTC) |
| Community Voting | April 1-15, 2026 |
| Winners Announced | April 24, 2026 |
| Registration | https://deepsurge.xyz/evefrontier2026 |

### Theme Alignment

> Frontier Pulse embodies the theme "A Toolkit for Civilization" by answering the question
> every toolkit for civilization must address: **"How do you know if your civilization is alive?"**
>
> It provides the diagnostic instruments — vital signs, trust metrics, and health indices —
> that allow a recovering civilization to understand itself, identify its strengths and
> vulnerabilities, and make decisions about its future.
>
> A civilization without self-awareness is flying blind. Frontier Pulse gives it eyes.

### Category Targeting

| Category | How We Compete |
|----------|---------------|
| **Most Utility** | Trust Compass gives every player actionable intelligence before every trade and alliance decision |
| **Best Technical Implementation** | Real-time Canvas rendering of 24,502 nodes + behavioral analysis engine + on-chain scoring via Sui smart contract + dual data pipeline (World API + Sui RPC) |
| **Most Creative** | The "universe as living organism" metaphor — biometric encoding of civilization data into visual art |
| **Weirdest Idea** | "We gave the universe a heartbeat" — a dual EKG that diagnoses whether civilization is real or just chaos |
| **Best Live Frontier Integration** | Every data point pulled from the live Stillness server, scores written on-chain, transactions verifiable on Suiscan |

### Key Resources

| Resource | URL |
|----------|-----|
| Hackathon Registration | https://deepsurge.xyz/evefrontier2026 |
| Hackathon Rules | https://evefrontier.com/en/eve-froniter-hackathon-event-rules |
| Builder Documentation | https://docs.evefrontier.com |
| World API (Swagger) | https://docs.evefrontier.com/SwaggerWorldApi |
| World Contracts (GitHub) | https://github.com/evefrontier/world-contracts |
| Builder Scaffold | https://github.com/evefrontier/builder-scaffold |
| DApps Monorepo | https://github.com/evefrontier/dapps |
| EVE Vault (Wallet) | https://github.com/evefrontier/evevault |
| Sui Documentation | https://docs.sui.io |
| Sui TypeScript SDK | https://sdk.mystenlabs.com |
| Move Book | https://move-book.com |
| EVE Frontier Discord | https://discord.gg/evefrontier |

---

## Roadmap

### Hackathon Scope (v1.0)

- [x] Project architecture and documentation
- [x] World API data ingestion pipeline
- [x] Sui RPC integration for on-chain reads
- [x] Sui Move smart contract (PulseRegistry) deployed to testnet
- [x] Oracle backend with cron scheduler and batched PTB writes
- [x] Activity aggregation engine (per-system scoring)
- [x] Reputation engine (5-dimension Trust Compass)
- [x] CHI calculator (6 sub-indices)
- [x] Galaxy visualization (Canvas 2D pulsing nodes + gate connections)
- [x] Dual heartbeat monitor (Activity + Trust EKG)
- [x] System deep dive view with gate connections
- [x] Player profile with Trust Compass radar chart
- [x] Anomaly detection and alert system
- [x] Time-lapse replay
- [x] Pulse Card SVG generation
- [x] Transaction log (oracle tx history from Sui)
- [x] Search palette (Ctrl+K)
- [x] Trust filter bar (healthy/stressed/hostile)
- [x] Sui wallet integration (connect/disconnect via @mysten/dapp-kit)
- [x] Watchlist panel (bookmark systems and players)
- [x] Guided tour (interactive onboarding walkthrough)
- [x] Deploy connected to live Stillness data
- [ ] Record demo video

### Post-Hackathon (v2.0+)

- [ ] Alliance/group aggregate reputation profiles
- [ ] Full leaderboard system with filters
- [ ] Discord bot (auto-post alerts and daily civilization digest)
- [ ] Mobile-responsive layout
- [ ] Predictive analytics and trend forecasting
- [ ] "What If" simulation mode (remove a gate, see cascade effects)
- [ ] Embeddable Trust Verification widget for other builders' tools
- [ ] Public reputation API for ecosystem integration
- [ ] WebSocket real-time push updates
- [ ] Historical data storage (PostgreSQL/Supabase)
- [ ] Redis caching layer

---

## Contributing

Built for the EVE Frontier x Sui Hackathon 2026. Contributions and feedback welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Frontier Pulse</strong><br>
  <em>"We don't just show you what's happening. We show you whether it's real."</em>
</p>
