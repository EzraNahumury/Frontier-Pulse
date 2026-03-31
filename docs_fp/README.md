# Frontier Pulse Docs

Official documentation portal for **Frontier Pulse** — a real-time civilization health monitoring tool for EVE Frontier on the Sui blockchain.

Built with Next.js 16 and deployed as a fully static documentation site with interactive diagrams, full-text search, and a dark space-themed UI.

**Live:** [docs-frontierpulse.vercel.app](https://docs-frontierpulse.vercel.app/)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation Pages](#documentation-pages)
- [Components](#components)
- [Search](#search)
- [Styling & Design System](#styling--design-system)
- [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 (Turbopack) |
| UI | React 19.2.4 |
| Styling | Tailwind CSS 4 (`@tailwindcss/postcss`) |
| Animation | Framer Motion 12.15.0 |
| Icons | Lucide React 0.468.0 |
| Theme | next-themes 0.4.6 (forced dark mode) |
| Utilities | clsx, tailwind-merge |
| Language | TypeScript 5 |
| Package Manager | pnpm |

---

## Project Structure

```
docs_fp/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, ThemeProvider)
│   ├── page.tsx                      # Home — redirects to /introduction
│   ├── globals.css                   # Global styles + Tailwind theme tokens
│   └── (docs)/                       # Grouped docs layout
│       ├── layout.tsx                # Sidebar + Header + Table of Contents
│       ├── introduction/page.tsx     # Welcome & overview
│       ├── getting-started/page.tsx  # Installation & setup
│       ├── project-structure/page.tsx
│       ├── architecture/page.tsx     # System architecture diagrams
│       ├── data-sources/page.tsx     # World API & Sui blockchain
│       ├── frontend/page.tsx         # Dashboard documentation
│       ├── components/page.tsx       # Component reference
│       ├── oracle/page.tsx           # Oracle backend docs
│       ├── scoring/page.tsx          # Scoring engine algorithms
│       ├── smart-contract/page.tsx   # Sui Move contract details
│       ├── api-reference/page.tsx    # API endpoints
│       ├── deployment/page.tsx       # Deployment guides
│       ├── glossary/page.tsx         # 90+ terms & definitions
│       ├── faq/page.tsx              # Frequently asked questions
│       ├── changelog/page.tsx        # Version history & roadmap
│       ├── team/page.tsx             # Team info & links
│       └── not-found.tsx             # 404 handler
│
├── components/
│   ├── theme-provider.tsx            # next-themes wrapper
│   └── docs/
│       ├── header.tsx                # Sticky header with breadcrumbs
│       ├── sidebar.tsx               # Collapsible left navigation
│       ├── toc.tsx                   # Auto-generated table of contents
│       ├── search-modal.tsx          # Ctrl+K full-text search
│       ├── page-wrapper.tsx          # Framer Motion page transitions
│       ├── scroll-progress.tsx       # Top scroll progress bar
│       ├── callout.tsx               # Info/warning/tip/important alerts
│       ├── code-block.tsx            # Syntax-highlighted code blocks
│       ├── feature-card.tsx          # Feature grid cards
│       ├── hero-background.tsx       # Animated particle canvas
│       ├── architecture-diagram.tsx  # Interactive 3-tier diagram
│       ├── pipeline-diagram.tsx      # Oracle pipeline visualization
│       └── visuals.tsx               # StatGrid & chart components
│
├── lib/
│   ├── navigation.ts                # Navigation structure & icons
│   ├── search-index.ts              # Search entries with headings
│   └── utils.ts                     # cn() utility
│
├── public/
│   └── logo/logo.png                # Frontier Pulse logo
│
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

```bash
cd docs_fp
pnpm install
```

### Development

```bash
pnpm dev
```

Opens at [http://localhost:3000](http://localhost:3000). The home page redirects to `/introduction`.

### Build

```bash
pnpm build
pnpm start
```

---

## Documentation Pages

The site contains 16 documentation pages organized into logical sections:

### Overview
| Page | Description |
|------|-------------|
| Introduction | Project vision, feature overview, tech stack, philosophy |
| Getting Started | Prerequisites, installation, environment setup |
| Project Structure | Directory breakdown across all subprojects |

### Architecture & Data
| Page | Description |
|------|-------------|
| Architecture | 3-tier system design with interactive diagram |
| Data Sources | World API and Sui blockchain data pipeline |
| Scoring Engine | Formulas for health, reputation, CHI, anomaly detection |

### Components & API
| Page | Description |
|------|-------------|
| Frontend | Dashboard features (Galaxy Canvas, Heartbeat EKG, Trust Compass) |
| Component Reference | UI component listing and usage |
| Oracle Backend | System health scoring, player reputation, CHI computation |
| Smart Contract | On-chain structures, PulseRegistry, capabilities |
| API Reference | All REST endpoints (universe, CHI, system, player, alerts, transactions) |

### Reference
| Page | Description |
|------|-------------|
| Deployment | Frontend (Vercel), Oracle (Railway), Smart Contract (Sui) |
| Glossary | 90+ terms including CHI, Agora, Pulse, archetypes, Sui concepts |
| FAQ | Common questions about functionality and wallet integration |
| Changelog | v1.0 release notes and v2.0 roadmap |
| Team | Team members, GitHub repository, hackathon details |

---

## Components

### Layout Components
- **Header** — Sticky top bar with breadcrumb navigation, search trigger, and GitHub link
- **Sidebar** — Collapsible left navigation with 7 sections, mobile-responsive overlay
- **TableOfContents** — Right sidebar auto-generated from h2/h3 headings via Intersection Observer
- **PageWrapper** — Framer Motion fade-in transition for page content
- **ScrollProgress** — Cyan progress bar at the top of the viewport

### Content Components
- **Callout** — Alert boxes with 4 variants: `info`, `warning`, `tip`, `important`
- **CodeBlock** — Syntax-highlighted code with optional filename label
- **FeatureCard** — Icon + title + description cards, color-coded (cyan/violet/amber/emerald)

### Visualization Components
- **ArchitectureDiagram** — Interactive 3-tier system architecture (Frontend → Oracle → Blockchain)
- **PipelineDiagram** — Oracle data pipeline flow (World API → Analyze → Record → Visualize)
- **HeroBackground** — Animated particle canvas for the introduction page
- **StatGrid** — 4-column statistics display

---

## Search

The documentation includes a built-in search system accessible via `Ctrl+K` (or `Cmd+K` on macOS).

- Searches across all 16 pages and their heading structure
- Results display page title and heading breadcrumbs
- Keyboard navigation (arrow keys, Enter, Escape)
- Maximum 12 results shown
- Search index defined in `lib/search-index.ts`

---

## Styling & Design System

### Color Palette (Dark Mode Only)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#05080f` | Page background |
| `--fg` | `#b8c7d6` | Body text |
| `--pri` | `#00e5ff` | Primary accent (cyan) |
| `--sec` | `#7c3aed` | Secondary accent (violet) |
| Success | `#00ff88` | Growth indicators |
| Warning | `#ff9800` | Caution states |
| Danger | `#ff3d3d` | Critical alerts |

### Typography

| Role | Font | Weights |
|------|------|---------|
| Display (headings) | Playfair Display | 400–800 |
| Body | Space Grotesk | 300–700 |
| Monospace | Geist Mono | 400 |

### Layout

- Content max-width: `48rem` (3xl)
- Sidebar width: `72px` left padding on `lg+`
- Table of Contents: visible on `xl+` screens
- Fully responsive with mobile-first breakpoints

---

## Deployment

### Vercel (Recommended)

1. Import the `docs_fp` directory to Vercel
2. Framework preset: **Next.js**
3. Build command: `pnpm build`
4. Deploy

### Manual

```bash
pnpm build
pnpm start
```

Runs on port 3000 by default. Requires Node.js 20+.

---

## License

Part of the [Frontier Pulse](https://github.com/EzraNahumury/Frontier-Pulse) project for the EVE Frontier x Sui Hackathon 2026.
