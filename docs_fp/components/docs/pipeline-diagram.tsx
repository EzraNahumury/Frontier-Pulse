"use client";

import { motion } from "framer-motion";
import {
  Database,
  Cpu,
  Link,
  Globe,
  Sword,
  Building2,
  Shield,
  Users,
  Activity,
  AlertTriangle,
  Blocks,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   Architecture page — 3-phase pipeline with animated flow
   ═══════════════════════════════════════════════════════════ */

const phases = [
  {
    label: "INGEST",
    sub: "World API",
    icon: Database,
    color: "#00e5ff",
    bgColor: "rgba(0,229,255,0.05)",
    borderColor: "rgba(0,229,255,0.15)",
    glowColor: "rgba(0,229,255,0.08)",
    items: [
      { fn: "fetchAllSystems()", out: "24,502 solar systems", icon: Globe },
      { fn: "fetchSmartAssemblies()", out: "player infrastructure", icon: Building2 },
      { fn: "fetchKillmails()", out: "PvP combat records", icon: Sword },
    ],
  },
  {
    label: "PROCESS",
    sub: "Scoring Engine",
    icon: Cpu,
    color: "#00ff88",
    bgColor: "rgba(0,255,136,0.05)",
    borderColor: "rgba(0,255,136,0.15)",
    glowColor: "rgba(0,255,136,0.08)",
    items: [
      { fn: "computeSystemHealth()", out: "activity, trust, infra, combat", icon: Activity },
      { fn: "computePlayerReputation()", out: "5 dimensions + archetype", icon: Users },
      { fn: "computeGlobalCHI()", out: "6 sub-indices + diagnosis", icon: Shield },
      { fn: "detectAnomalies()", out: "pattern matching → alerts", icon: AlertTriangle },
    ],
  },
  {
    label: "STORE",
    sub: "Sui Blockchain",
    icon: Link,
    color: "#a78bfa",
    bgColor: "rgba(167,139,250,0.05)",
    borderColor: "rgba(167,139,250,0.15)",
    glowColor: "rgba(167,139,250,0.08)",
    items: [
      { fn: "writeSystemHealthBatch()", out: "batched PTB (50/batch)", icon: Blocks },
      { fn: "writePlayerReputationBatch()", out: "batched PTB (50/batch)", icon: Users },
      { fn: "writeGlobalCHI()", out: "single PTB call", icon: Activity },
      { fn: "emitAlertsBatch()", out: "on-chain events (10/batch)", icon: AlertTriangle },
    ],
  },
];

/* Animated flowing dots on a connection line */
function FlowingConnection({ color, vertical }: { color: string; vertical?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center ${vertical ? "h-10 w-full" : "w-14 h-full shrink-0 hidden md:flex"}`}>
      {/* Line */}
      <div
        className={`${vertical ? "w-px h-full" : "h-px w-full"}`}
        style={{ background: `linear-gradient(${vertical ? "180deg" : "90deg"}, ${color}60, ${color}20)` }}
      />
      {/* Arrow head */}
      <div className={`absolute ${vertical ? "bottom-0" : "right-0"}`}>
        {vertical ? (
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
          </svg>
        ) : (
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
            <path d="M1 1L6 6L1 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
          </svg>
        )}
      </div>
    </div>
  );
}

/* Phase card */
function PhaseCard({
  phase,
  index,
}: {
  phase: (typeof phases)[number];
  index: number;
}) {
  const Icon = phase.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      className="flex-1 min-w-0 rounded-xl border overflow-hidden"
      style={{
        borderColor: phase.borderColor,
        background: `linear-gradient(160deg, ${phase.bgColor}, rgba(5,8,15,0.6))`,
      }}
    >
      {/* Phase header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: phase.borderColor }}
      >
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `${phase.color}15`,
            border: `1px solid ${phase.color}30`,
            boxShadow: `0 0 20px ${phase.glowColor}`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: phase.color }} />
        </motion.div>
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: phase.color }}>
            {phase.label}
          </p>
          <p className="text-[11px] text-[#5c6b7a]">{phase.sub}</p>
        </div>
        <div
          className="ml-auto text-lg font-bold font-mono"
          style={{ color: `${phase.color}30` }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      {/* Function items */}
      <div className="p-3 space-y-1.5">
        {phase.items.map((item, i) => {
          const ItemIcon = item.icon;
          return (
            <motion.div
              key={item.fn}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + i * 0.06, duration: 0.3 }}
              className="group flex items-start gap-2.5 rounded-lg px-3 py-2 hover:bg-white/[0.02] transition-colors"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${phase.color}10` }}
              >
                <ItemIcon className="w-3 h-3" style={{ color: `${phase.color}90` }} />
              </div>
              <div className="min-w-0">
                <code className="text-[11px] font-mono block break-all" style={{ color: phase.color }}>
                  {item.fn}
                </code>
                <span className="text-[11px] text-[#5c6b7a] group-hover:text-[#8899a8] transition-colors block">
                  {item.out}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function PipelineDiagram() {
  return (
    <div className="my-6">
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex items-center gap-0">
        {phases.map((phase, i) => (
          <div key={phase.label} className="contents">
            <PhaseCard phase={phase} index={i} />
            {i < phases.length - 1 && (
              <FlowingConnection
                color={i === 0 ? "#00e5ff" : "#00ff88"}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical flow */}
      <div className="md:hidden space-y-0">
        {phases.map((phase, i) => (
          <div key={phase.label}>
            <PhaseCard phase={phase} index={i} />
            {i < phases.length - 1 && (
              <div className="flex justify-center">
                <FlowingConnection
                  color={i === 0 ? "#00e5ff" : "#00ff88"}
                  vertical
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Throughput bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-4 rounded-lg border border-[rgba(0,229,255,0.06)] bg-space-900/30 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
          <span className="text-[11px] text-[#5c6b7a]">Cycle interval: <strong className="text-[#e2eaf2]">10 min</strong></span>
        </div>
        <span className="text-[11px] text-[#5c6b7a]">Batch size: <strong className="text-[#e2eaf2]">50 systems/tx</strong></span>
        <span className="text-[11px] text-[#5c6b7a]">Max per cycle: <strong className="text-[#e2eaf2]">500 systems</strong></span>
      </motion.div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   Frontend page — Canvas Rendering Pipeline (layered stack)
   ═══════════════════════════════════════════════════════════ */

const renderLayers = [
  {
    label: "Background Layer",
    color: "#3d4f60",
    depth: "z-0",
    items: ["Radial gradient", "Grid lines", "400 twinkle particles"],
  },
  {
    label: "System Nodes",
    color: "#00e5ff",
    depth: "z-1",
    sub: "24,502 circles",
    items: [
      { text: "Default", detail: "gray dot, depth-based size (1.5–3px)" },
      { text: "Filter match", detail: "colored glow (green / orange / red by trust)" },
      { text: "Hovered", detail: "enlarged glow + core" },
      { text: "Selected", detail: "pulsing glow + dashed ring + label + core" },
    ],
  },
  {
    label: "Gate Connections",
    color: "#00ff88",
    depth: "z-2",
    sub: "when system selected",
    items: [{ text: "Cyan lines", detail: "flowing dash animation to gate destinations" }],
  },
  {
    label: "Render Loop",
    color: "#ff9800",
    depth: "z-3",
    items: [{ text: "requestAnimationFrame", detail: "~60fps continuous" }],
  },
];

export function RenderPipelineDiagram() {
  return (
    <div className="my-6 rounded-xl border border-[rgba(0,229,255,0.08)] bg-space-900/60 p-5 overflow-hidden">
      <p className="text-[11px] font-semibold text-[#5c6b7a] uppercase tracking-widest mb-4">
        Canvas 2D Context — Render Stack
      </p>

      {/* Visual stacked layers */}
      <div className="relative space-y-2">
        {renderLayers.map((layer, li) => (
          <motion.div
            key={layer.label}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: li * 0.1, duration: 0.35 }}
            className="relative rounded-lg overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${layer.color}08, ${layer.color}03)`,
              border: `1px solid ${layer.color}20`,
            }}
          >
            {/* Depth indicator */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ background: `linear-gradient(180deg, ${layer.color}, ${layer.color}30)` }}
            />

            <div className="pl-5 pr-4 py-3">
              {/* Layer header */}
              <div className="flex items-center gap-2.5 mb-1.5">
                <span
                  className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded"
                  style={{ background: `${layer.color}15`, color: layer.color }}
                >
                  {layer.depth}
                </span>
                <span className="text-[13px] font-semibold" style={{ color: layer.color }}>
                  {layer.label}
                </span>
                {"sub" in layer && layer.sub && (
                  <span className="text-[11px] text-[#5c6b7a]">— {layer.sub}</span>
                )}
              </div>

              {/* Items as inline pills */}
              <div className="flex flex-wrap gap-1.5 pl-[38px]">
                {layer.items.map((item) => {
                  const text = typeof item === "string" ? item : item.text;
                  const detail = typeof item === "string" ? null : item.detail;
                  return (
                    <div
                      key={text}
                      className="group relative text-[11px] px-2.5 py-1 rounded-md bg-space-900/80 border border-[rgba(0,229,255,0.06)] text-[#b8c7d6] hover:border-[rgba(0,229,255,0.15)] transition-colors cursor-default"
                    >
                      {text}
                      {detail && (
                        <span className="text-[#5c6b7a] ml-1.5">— {detail}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Frame rate indicator */}
      <div className="mt-3 flex items-center gap-2 pl-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
        <span className="text-[10px] text-[#3d4f60]">requestAnimationFrame loop — all layers redrawn each frame</span>
      </div>
    </div>
  );
}
