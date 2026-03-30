"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Glossary data                                                      */
/* ------------------------------------------------------------------ */

interface Term {
  name: string;
  definition: string;
  color?: string;           // accent color for the term badge
}

interface Category {
  id: string;
  title: string;
  accent: string;           // left-border / badge color
  terms: Term[];
}

const categories: Category[] = [
  {
    id: "core-concepts",
    title: "Core Concepts",
    accent: "#00e5ff",
    terms: [
      {
        name: "CHI (Civilization Health Index)",
        definition:
          "Composite score (0\u2013100) measuring overall universe health from 6 sub-indices.",
        color: "#00e5ff",
      },
      {
        name: "Agora Engine",
        definition:
          "The behavioral trust intelligence engine that computes player reputation profiles.",
        color: "#a78bfa",
      },
      {
        name: "Pulse Layer",
        definition:
          "The real-time visualization layer showing universe activity, combat, trade, and growth.",
        color: "#00e5ff",
      },
      {
        name: "Trust Compass",
        definition:
          "5-axis radar chart measuring player reliability, commerce, diplomacy, stewardship, and volatility.",
        color: "#00ff88",
      },
      {
        name: "Dual Heartbeat",
        definition:
          "Two synchronized EKG-style lines showing activity vs trust patterns.",
        color: "#a78bfa",
      },
    ],
  },
  {
    id: "scoring-health",
    title: "Scoring & Health",
    accent: "#00ff88",
    terms: [
      {
        name: "Activity Level",
        definition:
          "Metric (0\u2013100) measuring player count, infrastructure, and combat in a system.",
        color: "#00e5ff",
      },
      {
        name: "Trust Level",
        definition:
          "Metric (0\u2013100) inversely related to combat ratio, boosted by infrastructure.",
        color: "#00ff88",
      },
      {
        name: "Local CHI",
        definition:
          "Per-system health score: activity \u00d7 40% + trust \u00d7 60%.",
        color: "#a78bfa",
      },
      {
        name: "Sub-Index",
        definition:
          "One of 6 dimensions of global CHI: Economic, Security, Growth, Connectivity, Trust, Social.",
        color: "#00e5ff",
      },
      {
        name: "Diagnosis",
        definition:
          "Text classification of CHI score: Flourishing (\u226580), Thriving (\u226565), Stable (\u226550), Stressed (\u226535), Declining (\u226520), Collapsing (<20).",
        color: "#ff9800",
      },
    ],
  },
  {
    id: "player-archetypes",
    title: "Player Archetypes",
    accent: "#a78bfa",
    terms: [
      {
        name: "Civilization Builder",
        definition: "Stewardship \u2265 80, Reliability \u2265 70.",
        color: "#00ff88",
      },
      {
        name: "Trusted Trader",
        definition: "Commerce \u2265 80, Reliability \u2265 70.",
        color: "#00e5ff",
      },
      {
        name: "Diplomat",
        definition: "Diplomacy \u2265 75, Volatility < 30.",
        color: "#a78bfa",
      },
      {
        name: "Warlord",
        definition: "Volatility \u2265 70, Commerce < 40.",
        color: "#ff3d3d",
      },
      {
        name: "Wildcard",
        definition: "50 \u2264 Volatility < 70.",
        color: "#ff9800",
      },
      {
        name: "Newcomer",
        definition: "Default archetype for unclassified players.",
        color: "#5c6b7a",
      },
    ],
  },
  {
    id: "anomaly-types",
    title: "Anomaly Types",
    accent: "#ff9800",
    terms: [
      {
        name: "Blackout",
        definition:
          "Infrastructure present but activity collapsed (infra > 5, activity < 10).",
        color: "#ff3d3d",
      },
      {
        name: "Trust Collapse",
        definition:
          "Active players but trust critically low (trust < 20, players > 5).",
        color: "#ff9800",
      },
      {
        name: "Combat Hotspot",
        definition: "Extreme combat activity (combat incidents > 8).",
        color: "#00e5ff",
      },
      {
        name: "Trade Spike",
        definition:
          "Unusual transaction volume (tx > 85, players > 20).",
        color: "#00ff88",
      },
    ],
  },
  {
    id: "technical-terms",
    title: "Technical Terms",
    accent: "#00e5ff",
    terms: [
      {
        name: "PulseRegistry",
        definition:
          "Shared Sui Move object storing all civilization health data.",
        color: "#00e5ff",
      },
      {
        name: "OracleCap",
        definition:
          "Sui capability object granting oracle write access to PulseRegistry.",
        color: "#a78bfa",
      },
      {
        name: "AdminCap",
        definition:
          "Sui capability object held by deployer, used to issue OracleCaps.",
        color: "#a78bfa",
      },
      {
        name: "PTB (Programmable Transaction Block)",
        definition:
          "Sui\u2019s composable transaction format, bundles multiple Move calls.",
        color: "#00e5ff",
      },
      {
        name: "Deterministic Fallback",
        definition:
          "Hash-based scoring that generates consistent vitals per system ID without external data.",
        color: "#ff9800",
      },
      {
        name: "Endorsement",
        definition:
          "On-chain signal from any wallet validating a system\u2019s activity.",
        color: "#00ff88",
      },
    ],
  },
  {
    id: "eve-frontier-terms",
    title: "EVE Frontier Terms",
    accent: "#ff9800",
    terms: [
      {
        name: "Solar System",
        definition:
          "One of 24,502 star systems in the EVE Frontier universe.",
        color: "#00e5ff",
      },
      {
        name: "Smart Assembly",
        definition:
          "Player-deployed infrastructure (gates, SSUs, turrets).",
        color: "#00ff88",
      },
      {
        name: "Killmail",
        definition: "Record of a PvP kill event from the World API.",
        color: "#ff3d3d",
      },
      {
        name: "Gate Link",
        definition:
          "Connection between two solar systems allowing travel.",
        color: "#a78bfa",
      },
      {
        name: "World API",
        definition:
          "EVE Frontier\u2019s external REST API providing universe data.",
        color: "#ff9800",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function GlossaryPage() {
  return (
    <PageWrapper>
      {/* Header */}
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">
        Glossary
      </h1>
      <p className="page-desc text-[#5c6b7a] text-sm mb-10">
        Definitions of every metric, archetype, anomaly, and technical
        term used throughout Frontier Pulse.
      </p>

      {/* Category sections */}
      <div className="space-y-14">
        {categories.map((cat, catIdx) => (
          <section key={cat.id}>
            <h2
              id={cat.id}
              className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-5 scroll-mt-20"
              style={{ borderLeftColor: cat.accent }}
            >
              <span
                className="inline-block w-2 h-5 rounded-sm mr-3 align-middle"
                style={{ backgroundColor: cat.accent }}
              />
              {cat.title}
            </h2>

            <div className="grid gap-3">
              {cat.terms.map((term, termIdx) => (
                <motion.div
                  key={term.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: catIdx * 0.08 + termIdx * 0.05,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  className="group flex items-start gap-4 rounded-xl border border-[rgba(0,229,255,0.08)] bg-space-900/50 px-5 py-4 hover:border-[rgba(0,229,255,0.18)] hover:shadow-[0_0_12px_rgba(0,229,255,0.04)] transition-all duration-200"
                >
                  {/* Colored dot */}
                  <span
                    className="mt-[7px] w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: term.color ?? cat.accent }}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: term.color ?? "#e2eaf2" }}
                    >
                      {term.name}
                    </span>
                    <span className="mx-2 text-[#3d4f60]">&mdash;</span>
                    <span className="text-sm text-[#8899a8] leading-relaxed">
                      {term.definition}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageWrapper>
  );
}
