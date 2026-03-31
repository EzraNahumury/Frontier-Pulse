# Frontier Pulse Pitch Deck

Interactive pitch deck and presentation website for **Frontier Pulse** — a real-time civilization health monitoring tool for EVE Frontier on the Sui blockchain. Built as a cinematic, scroll-driven single-page experience with full-viewport sections, neural network visuals, and scroll-snap navigation.

**Live:** [frontier-pulse-nine.vercel.app](https://frontier-pulse-nine.vercel.app/)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Sections & Content Flow](#sections--content-flow)
- [Components](#components)
- [Scroll Architecture](#scroll-architecture)
- [Styling & Design System](#styling--design-system)
- [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 |
| UI | React 19.2.4 |
| Styling | Tailwind CSS 4 (`@tailwindcss/postcss`) |
| Animation | Framer Motion 12.38.0 |
| Canvas | HTML5 Canvas API (neural network background) |
| Language | TypeScript 5 |
| Package Manager | npm |

---

## Project Structure

```
pitch_deck/
├── app/
│   ├── layout.tsx                # Root layout (metadata, Geist fonts)
│   ├── page.tsx                  # Main page — section orchestration
│   ├── globals.css               # Design tokens, theme, keyframes
│   └── components/
│       ├── Hero.tsx              # Title reveal, stats, CTA buttons
│       ├── Problem.tsx           # Visibility gap & trust vacuum
│       ├── Solution.tsx          # Pulse Layer, Agora Engine, Vital Signs
│       ├── Architecture.tsx      # 3-layer technical architecture
│       ├── Features.tsx          # 8 key instruments showcase
│       ├── Demo.tsx              # 3 persona use cases (Trader, Builder, Scout)
│       ├── TechStack.tsx         # Technology categories grid
│       ├── HackathonEdge.tsx     # Competitive differentiators
│       ├── Roadmap.tsx           # v1.0 → v2.0 → v3.0 timeline
│       ├── CTA.tsx               # Final call-to-action
│       ├── Footer.tsx            # Footer with links
│       │
│       ├── StarField.tsx         # Neural network canvas background
│       ├── Navbar.tsx            # Sticky top navigation
│       ├── SideNav.tsx           # Right-side dot navigation
│       ├── ScrollProgress.tsx    # Top cyan progress bar
│       ├── CursorGlow.tsx        # Mouse-tracking glow effect
│       ├── ScrollToTop.tsx       # Scroll-to-top button
│       │
│       ├── SteppedSlide.tsx      # Core scroll-step controller
│       ├── SectionWrapper.tsx    # Shared section layout helpers
│       ├── ScrollReveal.tsx      # Scroll-triggered animations
│       ├── ParallaxSection.tsx   # Parallax scrolling effects
│       └── AnimatedCounter.tsx   # Number counter animation
│
├── public/
│   └── logo/logo.png            # Frontier Pulse logo
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
cd pitch_deck
npm install
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

## Sections & Content Flow

The entire pitch deck is a single continuous scroll with mandatory scroll-snap alignment. Each section occupies a full viewport (`100dvh`) and reveals content in discrete steps as the user scrolls.

| # | Section | Steps | Content |
|---|---------|-------|---------|
| 1 | **Hero** | 3 | Title reveal, key stats (800+ systems, 5D trust, real-time), CTA buttons |
| 2 | **Problem** | 3 | "Visibility Gap" — no way to read universe health; "Trust Vacuum" — no on-chain reputation |
| 3 | **Solution** | 4 | Three components: Pulse Layer (real-time data), Agora Engine (scoring), Vital Signs (visualization) |
| 4 | **Architecture** | 3 | 3-layer stack: Frontend Dashboard → Oracle Backend → On-Chain Data Layer |
| 5 | **Features** | 8 | Galaxy Map, Heartbeat EKG, Trust Compass, CHI Gauge, Alert System, Endorsements, Pulse Cards, Transactions |
| 6 | **Demo** | 6 | Three personas: Trader (route safety), Builder (infrastructure), Scout (anomaly detection) |
| 7 | **Tech Stack** | 3 | Four categories: Frontend, Blockchain, Backend, Infrastructure |
| 8 | **Hackathon Edge** | 3 | Differentiators: Real data, on-chain proof, full-stack completeness |
| 9 | **Roadmap** | 3 | v1.0 (Hackathon MVP), v2.0 (Community features), v3.0 (AI intelligence) |
| 10 | **CTA** | 1 | Final pitch with launch app and documentation links |

---

## Components

### Content Sections

Each content section uses the `SteppedSlide` component to convert continuous scroll progress into discrete step counts, revealing content progressively.

- **Hero** — Animated title, stats counters, dual CTA buttons (Explore App / Read Docs)
- **Problem** — Cards slide in from opposite sides framing the core problems
- **Solution** — Horizontal card stack showing three system components
- **Architecture** — Animated 3-layer architecture visualization
- **Features** — Horizontal scrolling card stack (8 feature cards, indexed)
- **Demo** — Persona tab switcher with animated stat visualizations
- **TechStack** — 4-category grid with technology items
- **HackathonEdge** — Competitive differentiators with track/prize context
- **Roadmap** — Horizontal card stack for v1/v2/v3 phases
- **CTA** — Final pitch with prominent action buttons

### Visual Effects

- **StarField** — Complex Canvas API neural network background with 400+ neurons and synapses. Responds to cursor proximity (activation rings) and scroll velocity (wave propagation). Signal pulses travel along connections with parallax depth layers.
- **CursorGlow** — Radial gradient that follows the mouse cursor across the page.
- **ScrollProgress** — Thin cyan line at the top showing overall scroll position.
- **AnimatedCounter** — Numbers animate from 0 to target value when scrolled into view.

### Navigation

- **Navbar** — Sticky top bar that hides on scroll-down and reappears on scroll-up. Desktop nav links + mobile hamburger menu overlay.
- **SideNav** — Right-side dot indicators that track the active section. Hidden on small screens.
- **ScrollToTop** — Button that appears after scrolling past the hero section.

### Layout Utilities

- **SteppedSlide** — Core scroll-snap controller. Each section is a sticky container with spacer divs below. Converts scroll progress (0–1) into discrete step counts (0–N) for child components.
- **SectionWrapper** — Shared section template with label, title, and description helpers.
- **ScrollReveal** — Wrapper for scroll-triggered entrance animations (up/down/left/right/scale/fade).
- **ParallaxSection** — Parallax depth and floating effects on scroll.

---

## Scroll Architecture

The pitch deck uses a `scroll-snap-type: y mandatory` approach:

```
┌─────────────────────────────────┐
│  Section (position: sticky)     │  ← Full viewport (100dvh)
│  Content revealed by steps      │
├─────────────────────────────────┤
│  Spacer divs                    │  ← Create scrollable area
│  (height = steps × viewport)    │     for step progression
├─────────────────────────────────┤
│  Next Section (sticky)          │
│  ...                            │
└─────────────────────────────────┘
```

Each `SteppedSlide` component:
1. Creates a tall scrollable container (steps × 100vh)
2. Pins its content to the viewport via `position: sticky`
3. Converts the scroll position within the container to a step index (0–N)
4. Passes the current step to child components for progressive reveals

---

## Styling & Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#060a13` | Deep space background |
| `--bg-secondary` | `#0c1220` | Slightly lighter navy |
| `--bg-card` | `#111827` | Card surfaces |
| `--accent-cyan` | `#00d4ff` | Primary accent (60% of UI) |
| `--accent-purple` | `#8b5cf6` | Secondary accent |
| `--accent-green` | `#10b981` | Success / trust |
| `--accent-orange` | `#f59e0b` | Warning states |
| `--accent-red` | `#ef4444` | Danger / hostile |
| `--text-primary` | `#f1f5f9` | Main text |
| `--text-secondary` | `#94a3b8` | Secondary text |
| `--text-muted` | `#64748b` | Muted text |

### Typography

| Role | Font |
|------|------|
| Primary | Geist Sans |
| Monospace | Geist Mono |

### Responsive Breakpoints

- Mobile-first design using Tailwind breakpoints
- `sm` (640px) — Stack adjustments
- `lg` (1024px) — Desktop layout, side navigation visible
- Dynamic viewport height (`dvh`) for mobile browser compatibility

### Animations

- Framer Motion spring physics for entrance transitions
- Staggered reveals within sections
- Canvas-based neural network with real-time particle simulation
- Smooth scroll behavior with snap points
- Cursor-tracking glow effects

---

## Deployment

### Vercel (Recommended)

1. Import the `pitch_deck` directory to Vercel
2. Framework preset: **Next.js**
3. Build command: `npm run build`
4. Deploy

No environment variables required — this is a fully static presentation.

### Manual

```bash
npm run build
npm start
```

Runs on port 3000 by default. Requires Node.js 20+.

---

## License

Part of the [Frontier Pulse](https://github.com/EzraNahumury/Frontier-Pulse) project for the EVE Frontier x Sui Hackathon 2026.
