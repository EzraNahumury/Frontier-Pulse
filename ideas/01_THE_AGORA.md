# The Agora — A Trustless Reputation Engine for the Frontier

> *"In a universe where law is dead and authority is a myth,
> the only currency that matters is your name."*

---

## The Concept

**The Agora** is a decentralized reputation and trust system for EVE Frontier.

In the real world, civilizations built courts, credit systems, guilds, and social contracts
to answer one fundamental question: **"Can I trust this person?"**

In EVE Frontier, there is no central authority. No police. No courts. No credit bureau.
Players are waking up from stasis as strangers in a hostile universe. They need to trade,
form alliances, share gates, and cooperate to survive — but they have NO way to evaluate
who is trustworthy and who will betray them.

**The Agora solves this.** It analyzes on-chain player behavior to generate transparent,
verifiable reputation scores — the "credit system" of a recovering civilization.

---

## Why This Nails the Theme

"A Toolkit for Civilization" — what is the FIRST tool a civilization needs?

Not maps. Not weapons. Not trade routes. **Trust.**

Without trust, there is no trade. Without trade, there is no specialization.
Without specialization, there is no civilization. Just survival.

The Agora is the foundational layer that makes everything else possible.
It's not a feature — it's **infrastructure for civilization itself.**

---

## How It Works

### Data Sources (from World API + Sui on-chain data)

1. **Trade Behavior**
   - Smart Storage Unit interactions: who deposits, who withdraws, who honors trades
   - Frequency and consistency of economic activity
   - Trade volume and diversity (trading with many parties = more trustworthy)

2. **Gate Access Patterns**
   - Smart Gate configurations: who grants access vs. who restricts
   - Whether a player's gates have consistent, transparent rules
   - Gate usage reciprocity (do they open gates for others who open gates for them?)

3. **Combat Behavior**
   - Kill/death patterns from killmail data
   - Friendly fire incidents
   - Whether they attack players they've recently traded with (betrayal detection)
   - Turret targeting patterns (defensive vs. aggressive posture)

4. **Infrastructure Contribution**
   - Smart Assembly deployments (are they building for the community?)
   - Public vs. private infrastructure ratio
   - Longevity of deployed structures (maintained infrastructure = committed player)

5. **Social Graph**
   - Interaction patterns with other high-reputation players
   - Alliance/group behavioral consistency
   - Network position (bridge between communities = diplomatic role)

### Reputation Dimensions

Instead of a single "reputation score" (boring and reductive), The Agora produces a
**multi-dimensional trust profile**:

| Dimension | What It Measures | Metaphor |
|-----------|-----------------|----------|
| **Reliability** | Consistency of behavior over time | "Will they show up?" |
| **Commerce** | Trade fairness and economic participation | "Are they good for it?" |
| **Diplomacy** | Cross-group cooperation and bridge-building | "Can they bring people together?" |
| **Stewardship** | Infrastructure contribution and maintenance | "Do they build for others?" |
| **Volatility** | Behavioral unpredictability and risk | "Will they snap?" |

### The Trust Compass (Visual)

Each player's profile is visualized as a **radar/spider chart** called their "Trust Compass."
At a glance, you can see if someone is:
- A **reliable trader** (high Commerce + Reliability, low Volatility)
- A **warlord** (high Volatility, low Diplomacy)
- A **civilization builder** (high Stewardship + Diplomacy)
- A **lone wolf** (moderate everything, low social connections)
- A **wildcard** (erratic pattern, high Volatility)

---

## Key Features

### 1. Player Lookup
Search any player/character and see their full Trust Compass, behavioral history,
and notable events (largest trades, betrayals, infrastructure contributions).

### 2. Alliance/Group Profiles
Aggregate reputation for groups of players. "Is this alliance trustworthy?"
See if an alliance has consistent behavior or if it's held together by one reliable leader.

### 3. Trust Verification Widget
An embeddable widget other tools/dApps can use: "Verified by The Agora"
Before a trade, a player can check their counterpart's Trust Compass.

### 4. Behavioral Alerts
Real-time notifications: "Player X's Volatility score just spiked 40% in 24 hours"
or "Alliance Y's Commerce score is declining — possible internal collapse."

### 5. The Agora Leaderboard
Rankings by dimension — who are the most trusted traders? The greatest diplomats?
The most prolific builders? This creates positive incentive loops.

### 6. Historical Trends
Track how any player's reputation evolves over time. A player who was once volatile
but has been stable for weeks tells a redemption story.

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│                 FRONTEND                     │
│  React + D3.js (Trust Compass visualizer)   │
│  Next.js / Vite                             │
└─────────────┬───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│              BACKEND API                     │
│  Node.js / Python FastAPI                   │
│  - Reputation calculation engine            │
│  - Behavioral pattern analysis              │
│  - Alert system                             │
└─────────────┬───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│           DATA LAYER                         │
│  - EVE Frontier World API (REST)            │
│  - Sui RPC (on-chain reads)                 │
│  - PostgreSQL (processed reputation data)   │
│  - Redis (caching + real-time alerts)       │
└─────────────────────────────────────────────┘
```

### Tech Stack
- **Frontend**: React/Next.js + D3.js (radar charts, network graphs) + TailwindCSS
- **Backend**: Node.js or Python FastAPI
- **Data**: World API + Sui RPC for raw data, PostgreSQL for computed scores
- **Real-time**: WebSockets for live updates, Redis for caching
- **Deployment**: Vercel/Railway + Supabase (PostgreSQL)

---

## Category Strength Analysis

| Category | Strength | Why |
|----------|----------|-----|
| **Most Utility** | ★★★★★ | Every player needs this. Trust is the #1 problem in a lawless universe. |
| **Best Technical** | ★★★★☆ | Multi-dimensional scoring, graph analysis, real-time processing. |
| **Most Creative** | ★★★★☆ | No one else will build a reputation system. The "Trust Compass" is novel. |
| **Weirdest Idea** | ★★☆☆☆ | It's impressive, not weird. |
| **Live Integration** | ★★★★☆ | Pulls live data from Stillness. Real players can look up real reputations. |

---

## Why I'm Most Confident About This One

1. **Thematic resonance is unmatched.** When judges hear "toolkit for civilization" and then
   see a tool that literally enables the trust layer civilization requires — it clicks instantly.

2. **No one else will think of this.** Most teams will build maps, dashboards, or analytics.
   A reputation engine is a fundamentally different category of tool.

3. **It creates emergent gameplay.** Players will change their behavior BECAUSE of The Agora.
   That's not just a tool — it's a new game mechanic born from an external system.

4. **It's technically impressive but buildable in 5 days.** The core is API calls + math +
   visualization. No ML required, no complex infrastructure.

5. **It tells a story.** The pitch writes itself: "Civilization begins with trust."

---

## 5-Day Build Plan

| Day | Focus | Deliverable |
|-----|-------|-------------|
| 1 | World API integration + data modeling | Raw data pipeline working |
| 2 | Reputation calculation engine | Scoring algorithm producing results |
| 3 | Frontend — Trust Compass + player lookup | Core UI functional |
| 4 | Alliance profiles, leaderboard, alerts | Feature completion |
| 5 | Polish, deploy to live Stillness data, demo video | Submission ready |

---

## One-Liner Pitch

> *"In a universe without law, The Agora is the civilization's memory of who you are
> and what you've done — the trust layer that makes everything else possible."*
