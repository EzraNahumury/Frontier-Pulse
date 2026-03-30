"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const changelog = [
  {
    version: "v1.0.0",
    title: "Hackathon Submission",
    date: "March 2026",
    color: "#00ff88",
    items: [
      "Full dashboard with 24,502 solar systems on interactive Canvas",
      "Dual Heartbeat EKG visualization (Activity + Trust)",
      "CHI Gauge with 6 sub-indices and diagnosis",
      "Trust Compass (5-axis player reputation radar)",
      "Oracle backend with 10-minute cron cycle",
      "Smart contract deployed on Sui Testnet (PulseRegistry)",
      "Anomaly detection (4 alert types)",
      "Time-lapse replay with speed controls",
      "Shareable Pulse Cards (SVG snapshots)",
      "Sui wallet integration via @mysten/dapp-kit",
      "Guided onboarding tour",
      "Searchable command palette (Ctrl+K)",
      "Watchlist and personal system tracking",
      "System endorsements (on-chain signals)",
      "Full documentation site",
    ],
  },
  {
    version: "v0.3.0",
    title: "On-Chain Integration",
    date: "March 2026",
    color: "#a78bfa",
    items: [
      "PulseRegistry shared object deployed on Sui Testnet",
      "OracleCap/AdminCap capability model",
      "Batched PTB writes (50 systems per transaction)",
      "Frontend reads from on-chain data with priority fallback",
      "Player endorsement system",
    ],
  },
  {
    version: "v0.2.0",
    title: "Trust Intelligence",
    date: "February 2026",
    color: "#00e5ff",
    items: [
      "Agora Engine: 5-dimension player reputation scoring",
      "Player archetype classification (6 types)",
      "Trust Compass SVG radar chart",
      "Anomaly detection pipeline",
      "System panel deep-dive with gate connections",
    ],
  },
  {
    version: "v0.1.0",
    title: "Galaxy Foundation",
    date: "January 2026",
    color: "#ff9800",
    items: [
      "World API integration (24,502 solar systems)",
      "Galaxy Canvas with trust-based coloring",
      "Dual Heartbeat EKG animation",
      "CHI calculation engine (6 sub-indices)",
      "Deterministic fallback scoring (hash-based vitals)",
      "Basic search and navigation",
    ],
  },
];

const roadmapPlanned = [
  { title: "Mainnet deployment", desc: "Move from Testnet to Sui Mainnet" },
  { title: "Historical data persistence", desc: "Store score history for trend analysis" },
  { title: "Alliance and faction tracking", desc: "Group-level trust metrics" },
  { title: "Real-time WebSocket updates", desc: "Replace polling with live data" },
  { title: "Mobile-responsive optimizations", desc: "Full mobile experience" },
];

const roadmapExploring = [
  { title: "AI-powered anomaly prediction", desc: "ML models for early warning" },
  { title: "Cross-chain data aggregation", desc: "Pull from multiple data sources" },
  { title: "Community governance for oracle parameters", desc: "Decentralized oracle tuning" },
  { title: "Embeddable widgets", desc: "Drop Pulse Cards into any website" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ChangelogPage() {
  return (
    <PageWrapper>
      {/* Header */}
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-1 font-[family-name:var(--font-playfair)]">
        Changelog &amp; Roadmap
      </h1>
      <p className="page-desc text-[#5c6b7a] text-sm mb-12">
        A living record of every milestone and what lies ahead for Frontier Pulse.
      </p>

      {/* ── Changelog ── */}
      <section className="mb-16">
        <h2
          id="changelog"
          className="text-lg font-semibold text-[#e2eaf2] mb-8 scroll-mt-20"
        >
          Changelog
        </h2>

        {/* Timeline */}
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-[rgba(0,229,255,0.25)] via-[rgba(0,229,255,0.08)] to-transparent" />

          <div className="space-y-10">
            {changelog.map((release, i) => (
              <motion.div
                key={release.version}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12, duration: 0.4, ease: "easeOut" }}
                className="relative"
              >
                {/* Dot */}
                <span
                  className="absolute -left-8 top-[7px] z-10 block h-[11px] w-[11px] rounded-full ring-[3px]"
                  style={{
                    backgroundColor: release.color,
                    boxShadow: `0 0 8px ${release.color}55`,
                  }}
                />
                {/* Glow ring via outline */}
                <span
                  className="absolute -left-8 top-[7px] z-[9] block h-[11px] w-[11px] rounded-full"
                  style={{
                    outline: `3px solid rgb(13 17 23)`,
                  }}
                />

                {/* Version badge + date */}
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase"
                    style={{
                      color: release.color,
                      backgroundColor: `${release.color}14`,
                      border: `1px solid ${release.color}30`,
                    }}
                  >
                    {release.version}
                  </span>
                  <span className="text-sm font-semibold text-[#e2eaf2]">
                    {release.title}
                  </span>
                  <span className="text-xs text-[#5c6b7a]">
                    {release.date}
                  </span>
                </div>

                {/* Items */}
                <ul className="space-y-1.5 ml-0.5">
                  {release.items.map((item, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.12 + 0.15 + j * 0.03,
                        duration: 0.25,
                      }}
                      className="flex items-start gap-2 text-[13px] text-[#8899a8] leading-relaxed"
                    >
                      <span
                        className="mt-[7px] block h-1 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: release.color }}
                      />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section>
        <h2
          id="roadmap"
          className="text-lg font-semibold text-[#e2eaf2] mb-8 scroll-mt-20"
        >
          Roadmap
        </h2>

        {/* Planned */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.25)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-[#00e5ff]">
              Planned
            </span>
          </div>

          <div className="space-y-2.5">
            {roadmapPlanned.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
                className="group flex items-center gap-4 rounded-xl border border-[rgba(0,229,255,0.08)] bg-space-900/50 px-5 py-4 hover:border-[rgba(0,229,255,0.18)] transition-all duration-200"
              >
                {/* Icon dot */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(0,229,255,0.06)]">
                  <span className="block h-2 w-2 rounded-full bg-[#00e5ff] shadow-[0_0_6px_rgba(0,229,255,0.4)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#e2eaf2]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#5c6b7a] mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center rounded-full bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.15)] px-2 py-0.5 text-[10px] font-medium text-[#00e5ff]">
                  Planned
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Exploring */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.25)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-[#a78bfa]">
              Exploring
            </span>
          </div>

          <div className="space-y-2.5">
            {roadmapExploring.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.08, duration: 0.3 }}
                className="group flex items-center gap-4 rounded-xl border border-[rgba(0,229,255,0.08)] bg-space-900/50 px-5 py-4 hover:border-[rgba(167,139,250,0.18)] transition-all duration-200"
              >
                {/* Icon dot */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(167,139,250,0.06)]">
                  <span className="block h-2 w-2 rounded-full bg-[#a78bfa] shadow-[0_0_6px_rgba(167,139,250,0.4)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#e2eaf2]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#5c6b7a] mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center rounded-full bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.15)] px-2 py-0.5 text-[10px] font-medium text-[#a78bfa]">
                  Exploring
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
