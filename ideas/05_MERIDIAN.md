# Meridian — The Civilization Command Table

> *"Every great civilization had a war room. This is yours."*

---

## The Concept

**Meridian** is a strategic command interface — the "war room" of EVE Frontier.

It combines real-time intelligence, interactive mapping, economic monitoring, and
coordination tools into a single unified interface designed for **leaders, commanders,
and alliance strategists** who need to make decisions that affect hundreds of players
across dozens of systems.

Think: CIC (Combat Information Center) meets Bloomberg Terminal meets Total War's
strategic map — but for a live, persistent space MMO where the data is real and the
stakes are actual.

This is the tool that every alliance leader will have open on their second monitor 24/7.

---

## Why This Nails the Theme

Every civilization has a seat of power — a place where information converges and decisions
are made. The Roman Senate. The British Admiralty. NASA Mission Control.

In EVE Frontier, alliances coordinate through Discord text channels and gut feeling.
There is no command center. No unified operational picture. No strategic planning tool.

**Meridian IS the seat of civilization** — the tool that transforms a loose collection of
players into an organized, strategically coherent civilization.

---

## How It Works

### The Strategic Map (Core Feature)

An interactive, layered map of the EVE Frontier universe with toggleable intelligence layers:

| Layer | What It Shows |
|-------|--------------|
| **Infrastructure** | All known Smart Assemblies — gates, storage, turrets. Color-coded by owner/alliance |
| **Economic** | Trade flow visualization — arrows showing resource movement between systems |
| **Military** | Killmail heatmap, turret coverage zones, recent combat events |
| **Territorial** | Influence map — who controls what, based on infrastructure density and activity |
| **Movement** | Player migration patterns and traffic flows between systems |
| **Threat** | Danger assessment overlay — high-risk zones based on kill rates and hostile infrastructure |

### The Intelligence Panel

A sidebar showing real-time intelligence feeds:

- **Activity Feed**: Latest events (kills, deployments, destructions) with timestamps
- **Economic Ticker**: Key trade metrics, resource price movements, volume changes
- **Alerts**: Unusual activity detected (new hostile deployments, access changes, trade disruptions)
- **Weather Report**: A quick-read summary of current conditions ("Sector 7: hostile activity rising, recommend gate restriction")

### Fleet/Alliance Tools

- **Bookmark System**: Mark systems of interest with notes (target, friendly, resource-rich, dangerous)
- **Route Planner**: Calculate optimal paths through the gate network, factoring in danger and toll costs
- **Strategic Annotations**: Draw on the map — plan attack routes, mark defensive lines, highlight objectives
- **Shared Views**: Alliance members can share their Meridian view with teammates

### Economic Intelligence

- **Resource Flow Analysis**: Where are resources going? Identify supply chain dependencies
- **Market Opportunity Scanner**: Systems with high demand and low supply = trade opportunity
- **Economic Dependency Map**: "If this storage unit goes down, these 5 trade routes are affected"

---

## Key Features

### 1. Multi-Layer Strategic Map
The core. A beautiful, responsive map with toggleable intelligence overlays.

### 2. Influence Territories
Automatically computed territorial boundaries based on Smart Assembly ownership
and player activity density. See who "owns" what without anyone declaring it.

### 3. Route Planner
Optimal pathfinding through the Smart Gate network with customizable priorities:
- Safest route (avoid killmail hotspots)
- Cheapest route (minimize toll costs)
- Fastest route (fewest jumps)
- Balanced (weighted combination)

### 4. Strategic Annotations
Draw directly on the map. Plan operations. Share annotated views.

### 5. Real-Time Alert System
Configurable alerts: "Notify me when any new Smart Assembly is deployed in Sector 12"
or "Alert when kill rate in my territory exceeds 5/hour."

### 6. Economic Dashboard
Trade volumes, resource flows, market opportunities — everything a trade-focused
civilization needs.

### 7. After-Action Review
Select a time range and replay what happened on the map. Perfect for analyzing
battles, understanding raids, or studying expansion patterns.

### 8. Shareable Briefings
Export a strategic briefing as an image or PDF: current territorial map,
recent threats, economic summary. Post to Discord for alliance members.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                  FRONTEND                        │
│  React + Leaflet/MapLibre (2D map)              │
│  OR React + Three.js (3D star map)              │
│  D3.js (economic charts, flow diagrams)         │
│  Canvas (annotations, drawing layer)            │
│  TailwindCSS (responsive panels)                │
└──────────────┬──────────────────────────────────┘
               │ WebSocket (real-time updates)
┌──────────────▼──────────────────────────────────┐
│              BACKEND                             │
│  Node.js / Python FastAPI                       │
│  - Data aggregation + caching                   │
│  - Route calculation (Dijkstra/A*)              │
│  - Influence territory computation              │
│  - Alert engine                                 │
│  - Briefing generator                           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│             DATA LAYER                           │
│  - World API (assemblies, kills, characters)    │
│  - Sui RPC (on-chain state, transactions)       │
│  - PostgreSQL (processed data, bookmarks, notes)│
│  - Redis (real-time cache, alert queue)         │
└─────────────────────────────────────────────────┘
```

### Tech Stack
- **Frontend**: React + Leaflet (2D) or Three.js (3D) + D3.js + TailwindCSS
- **Backend**: Node.js with Express or Python FastAPI
- **Real-time**: WebSockets for live map updates
- **Data**: World API + Sui RPC, PostgreSQL for persistence
- **Algorithms**: Dijkstra for routing, Voronoi for territory computation
- **Deployment**: Vercel + Railway/Supabase

---

## Category Strength Analysis

| Category | Strength | Why |
|----------|----------|-----|
| **Most Utility** | ★★★★★ | This is THE tool every alliance leader and strategist needs |
| **Best Technical** | ★★★★★ | Multi-layer map, pathfinding, territory computation, real-time feeds |
| **Most Creative** | ★★★☆☆ | The concept of a "command table" is familiar, execution is what shines |
| **Weirdest Idea** | ★★☆☆☆ | Not weird — just extremely well-executed and essential |
| **Live Integration** | ★★★★★ | Built entirely on live Stillness data |

---

## Why This Is the "Safe Bet" That Still Wins

1. **Undeniable utility.** Every single player who sees this will want it. Alliance leaders
   will NEED it. That kind of immediate, visceral usefulness scores maximum Utility points.

2. **Technically the most demanding.** Multi-layer interactive mapping, real-time data
   streams, pathfinding algorithms, territory computation — this showcases serious
   engineering. Judges evaluating "Best Technical" will gravitate here.

3. **It fills the biggest gap.** EVE Frontier has 24,000 systems and no good way to
   visualize or coordinate across them. Meridian is the tool that should ship with the game.

4. **Live integration is natural.** Everything on Meridian is live data. There's no
   demo mode needed — the demo IS the live product.

5. **It's a platform other tools build on.** The Agora's reputation data could display
   on Meridian. The Chronicle's war reports could link from Meridian's after-action review.
   It's the connective tissue of the builder ecosystem.

---

## What Separates This From "Just Another Map"

The existing community maps (like EF Interactive Map) show locations and gate routes.
Meridian is fundamentally different:

- **Intelligence, not just geography**: Economic flows, military threats, influence territories
- **Strategic tools**: Annotations, route planning, alerts — it's a planning tool, not a viewer
- **Operational focus**: Designed for decision-making, not exploration
- **Real-time updates**: Live feeds, not static snapshots
- **Alliance-oriented**: Shared views, briefings, collaborative annotations

---

## 5-Day Build Plan

| Day | Focus | Deliverable |
|-----|-------|-------------|
| 1 | World API integration + map rendering with system positions | Basic map working |
| 2 | Intelligence layers (infrastructure, kills, economic) + territory computation | Layered map |
| 3 | Route planner + alert system + intelligence sidebar | Interactive tools |
| 4 | Annotations, bookmarks, economic dashboard, shared views | Feature complete |
| 5 | Polish, optimize performance, deploy on live data, demo video | Submission ready |

---

## One-Liner Pitch

> *"Meridian is mission control for civilization — the command table where scattered
> survivors become an organized force capable of building something that lasts."*
