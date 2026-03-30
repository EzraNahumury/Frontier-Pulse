"use client";

import { motion } from "framer-motion";
import {
  Monitor,
  Server,
  Blocks,
  Globe,
  Route,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   Architecture page — Interactive system architecture diagram
   ═══════════════════════════════════════════════════════════ */

interface NodeConfig {
  id: string;
  label: string;
  sub: string;
  icon: typeof Monitor;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  chips: string[];
}

const nodes: NodeConfig[] = [
  {
    id: "frontend",
    label: "Frontend",
    sub: "Next.js 16 + React 19",
    icon: Monitor,
    color: "#00e5ff",
    bgColor: "rgba(0,229,255,0.04)",
    borderColor: "rgba(0,229,255,0.15)",
    glowColor: "rgba(0,229,255,0.06)",
    chips: ["Galaxy View", "Heartbeat EKG", "Trust Compass", "CHI Gauge", "Alerts UI"],
  },
  {
    id: "api",
    label: "API Routes",
    sub: "Next.js Server Routes",
    icon: Route,
    color: "#8899a8",
    bgColor: "rgba(136,153,168,0.04)",
    borderColor: "rgba(136,153,168,0.12)",
    glowColor: "rgba(136,153,168,0.04)",
    chips: ["/universe", "/chi", "/system/:id", "/player/:addr", "/alerts", "/pulse-card"],
  },
  {
    id: "oracle",
    label: "Oracle Backend",
    sub: "Node.js + cron (10 min)",
    icon: Server,
    color: "#00ff88",
    bgColor: "rgba(0,255,136,0.04)",
    borderColor: "rgba(0,255,136,0.15)",
    glowColor: "rgba(0,255,136,0.06)",
    chips: ["Scoring", "Reputation", "CHI", "Anomaly Detection"],
  },
  {
    id: "world",
    label: "World API",
    sub: "EVE Frontier",
    icon: Globe,
    color: "#ff9800",
    bgColor: "rgba(255,152,0,0.04)",
    borderColor: "rgba(255,152,0,0.12)",
    glowColor: "rgba(255,152,0,0.04)",
    chips: ["Systems", "Assemblies", "Killmails", "Gates"],
  },
  {
    id: "sui",
    label: "Sui Blockchain",
    sub: "PulseRegistry (Testnet)",
    icon: Blocks,
    color: "#a78bfa",
    bgColor: "rgba(167,139,250,0.04)",
    borderColor: "rgba(167,139,250,0.15)",
    glowColor: "rgba(167,139,250,0.06)",
    chips: ["SystemHealth", "PlayerReputation", "CHI", "Alerts"],
  },
];

/* Connection line between nodes */
function ConnectionLine({
  direction,
  color,
  label,
  dashed,
}: {
  direction: "down" | "right";
  color: string;
  label?: string;
  dashed?: boolean;
}) {
  const isDown = direction === "down";

  return (
    <div
      className={`relative flex items-center justify-center ${
        isDown ? "h-8 w-full" : "w-10 h-full shrink-0"
      }`}
    >
      {/* The line */}
      <div
        className={isDown ? "w-px h-full" : "h-px w-full"}
        style={{
          background: dashed ? "transparent" : `${color}40`,
          borderLeft: dashed && isDown ? `1px dashed ${color}30` : undefined,
          borderTop: dashed && !isDown ? `1px dashed ${color}30` : undefined,
        }}
      />

      {/* Label */}
      {label && (
        <span
          className={`absolute text-[9px] font-mono ${
            isDown ? "left-3" : "top-[-14px]"
          }`}
          style={{ color: `${color}80` }}
        >
          {label}
        </span>
      )}

      {/* Arrow */}
      <div className={`absolute ${isDown ? "bottom-0" : "right-0"}`}>
        {isDown ? (
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" />
          </svg>
        ) : (
          <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
            <path d="M1 1L5 5L1 9" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" />
          </svg>
        )}
      </div>
    </div>
  );
}

/* Node card */
function NodeCard({ node, delay }: { node: NodeConfig; delay: number }) {
  const Icon = node.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border overflow-hidden flex-1 min-w-0"
      style={{
        borderColor: node.borderColor,
        background: `linear-gradient(160deg, ${node.bgColor}, rgba(5,8,15,0.6))`,
      }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `${node.color}12`,
              border: `1px solid ${node.color}25`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color: node.color }} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#e2eaf2]">{node.label}</p>
            <p className="text-[10px] text-[#5c6b7a]">{node.sub}</p>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1">
          {node.chips.map((chip) => (
            <span
              key={chip}
              className="text-[10px] px-2 py-0.5 rounded-md"
              style={{
                background: `${node.color}08`,
                color: `${node.color}cc`,
                border: `1px solid ${node.color}15`,
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function ArchitectureDiagram() {
  return (
    <div className="my-6 rounded-xl border border-[rgba(0,229,255,0.06)] bg-space-900/30 p-5 overflow-hidden">
      <p className="text-[11px] font-semibold text-[#5c6b7a] uppercase tracking-widest mb-5">
        System Architecture
      </p>

      {/* Row 1: Frontend */}
      <NodeCard node={nodes[0]} delay={0} />

      {/* Connection: Frontend → API */}
      <ConnectionLine direction="down" color="#00e5ff" label="reads" />

      {/* Row 2: API Routes */}
      <NodeCard node={nodes[1]} delay={0.1} />

      {/* Connection: API → Oracle + Data */}
      <div className="flex items-stretch">
        <div className="flex-1 flex flex-col items-center">
          <ConnectionLine direction="down" color="#00ff88" label="scores" />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <ConnectionLine direction="down" color="#ff9800" label="fetches" />
        </div>
      </div>

      {/* Row 3: Oracle + World API */}
      <div className="flex gap-3">
        <NodeCard node={nodes[2]} delay={0.2} />
        <NodeCard node={nodes[3]} delay={0.25} />
      </div>

      {/* Connection: Oracle → Sui, World API → Oracle */}
      <div className="flex items-stretch">
        <div className="flex-1 flex flex-col items-center">
          <ConnectionLine direction="down" color="#a78bfa" label="writes PTBs" />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <ConnectionLine direction="down" color="#ff9800" label="feeds" dashed />
        </div>
      </div>

      {/* Row 4: Sui Blockchain */}
      <NodeCard node={nodes[4]} delay={0.3} />

      {/* Fallback line label */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-3 flex items-center gap-2 px-1"
      >
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)" }} />
        <span className="text-[9px] text-[#3d4f60] font-mono shrink-0">
          frontend also reads Sui directly as fallback
        </span>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)" }} />
      </motion.div>
    </div>
  );
}
