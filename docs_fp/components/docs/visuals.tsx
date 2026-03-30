"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════
   1. Weight Bar Chart — horizontal stacked bars with labels
   ═══════════════════════════════════════════════════════════ */

interface WeightItem { label: string; weight: number; color: string }

export function WeightChart({ items, title }: { items: WeightItem[]; title?: string }) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  return (
    <div className="my-6 rounded-xl border border-[rgba(0,229,255,0.08)] bg-space-900/50 p-5">
      {title && <p className="text-xs font-semibold text-[#5c6b7a] uppercase tracking-wider mb-3">{title}</p>}
      {/* Stacked bar */}
      <div className="flex h-8 rounded-lg overflow-hidden mb-4">
        {items.map((item) => (
          <motion.div
            key={item.label}
            initial={{ width: 0 }}
            whileInView={{ width: `${(item.weight / total) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn("flex items-center justify-center text-[10px] font-bold text-white", item.color)}
          >
            {item.weight}%
          </motion.div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-sm", item.color)} />
            <span className="text-xs text-[#8899a8]">{item.label} ({item.weight}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. Trust Spectrum — gradient bar showing score thresholds
   ═══════════════════════════════════════════════════════════ */

export function TrustSpectrum() {
  return (
    <div className="my-6 rounded-xl border border-[rgba(0,229,255,0.08)] bg-space-900/50 p-5">
      <p className="text-xs font-semibold text-[#5c6b7a] uppercase tracking-wider mb-3">Trust Level Spectrum</p>
      <div className="relative">
        <div className="h-6 rounded-lg overflow-hidden flex">
          <div className="flex-1 bg-gradient-to-r from-[#ff3d3d] to-[#ff6b35]" />
          <div className="flex-1 bg-gradient-to-r from-[#ff6b35] to-[#ff9800]" />
          <div className="flex-1 bg-gradient-to-r from-[#00cc6a] to-[#00ff88]" />
        </div>
        {/* Threshold markers */}
        <div className="flex justify-between mt-2 text-[10px] text-[#5c6b7a]">
          <span>0</span>
          <span className="text-[#ff3d3d] font-medium -ml-8">Hostile</span>
          <span className="border-l border-[rgba(0,229,255,0.1)] pl-1">40</span>
          <span className="text-[#ff9800] font-medium">Stressed</span>
          <span className="border-l border-[rgba(0,229,255,0.1)] pl-1">70</span>
          <span className="text-[#00ff88] font-medium">Healthy</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. Flow Steps — visual pipeline with animated connector
   ═══════════════════════════════════════════════════════════ */

interface FlowStep { label: string; detail: string; color: string; icon: string }

export function FlowSteps({ steps, title }: { steps: FlowStep[]; title?: string }) {
  return (
    <div className="my-6 rounded-xl border border-[rgba(0,229,255,0.08)] bg-space-900/40 p-5 overflow-hidden">
      {title && (
        <p className="text-[11px] font-semibold text-[#5c6b7a] uppercase tracking-widest mb-5">
          {title}
        </p>
      )}
      <div className="relative">
        {steps.map((step, i) => {
          /* Extract a hex color from the tailwind class for accents */
          const colorMap: Record<string, string> = {
            "bg-blue-500": "#3b82f6",
            "bg-emerald-500": "#10b981",
            "bg-violet-500": "#8b5cf6",
            "bg-amber-500": "#f59e0b",
            "bg-red-400": "#f87171",
          };
          const hex = colorMap[step.color] || "#00e5ff";

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              className="flex gap-4 items-start relative"
            >
              {/* Timeline column */}
              <div className="flex flex-col items-center shrink-0 relative z-10">
                {/* Step number node */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg",
                    step.color,
                  )}
                  style={{
                    boxShadow: `0 0 12px ${hex}30`,
                  }}
                >
                  {step.icon}
                </div>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="relative w-px h-12">
                    <div
                      className="absolute inset-0 w-px"
                      style={{
                        background: `linear-gradient(180deg, ${hex}50, ${hex}15)`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="pb-6 pt-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#e2eaf2]">{step.label}</p>
                  <div className="flex-1 h-px" style={{ background: `${hex}15` }} />
                </div>
                <p className="text-[12px] text-[#5c6b7a] mt-1 leading-relaxed">{step.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. Score Card — compact metric with label, value, bar
   ═══════════════════════════════════════════════════════════ */

export function ScoreCard({ label, formula, example, color }: {
  label: string; formula: string; example: number; color: string;
}) {
  return (
    <div className="rounded-lg border border-[rgba(0,229,255,0.08)] bg-space-900/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-xs font-semibold text-[#e2eaf2]">{label}</span>
      </div>
      <p className="text-[11px] text-[#5c6b7a] font-mono mb-2">{formula}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-space-800 rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${example}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={cn("h-full rounded-full", color)}
          />
        </div>
        <span className="text-[10px] text-[#5c6b7a] font-mono w-6 text-right">{example}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. Data Flow Diagram — horizontal flow with arrows
   ═══════════════════════════════════════════════════════════ */

export function DataFlowDiagram() {
  return (
    <div className="my-6 overflow-x-auto">
      <svg viewBox="0 0 800 160" className="w-full min-w-[600px] max-w-3xl mx-auto" fill="none">
        {/* World API */}
        <rect x="10" y="40" width="150" height="80" rx="10" fill="rgba(0,229,255,0.06)" stroke="rgba(0,229,255,0.15)" />
        <text x="85" y="70" textAnchor="middle" fill="#00e5ff" fontSize="11" fontWeight="700">World API</text>
        <text x="85" y="88" textAnchor="middle" fill="#5c6b7a" fontSize="9">Systems, Kills</text>
        <text x="85" y="102" textAnchor="middle" fill="#5c6b7a" fontSize="9">Assemblies</text>

        {/* Arrow 1 */}
        <line x1="160" y1="80" x2="210" y2="80" stroke="#3d4f60" strokeWidth="1.5" />
        <polygon points="208,76 218,80 208,84" fill="#3d4f60" />

        {/* Oracle */}
        <rect x="220" y="40" width="150" height="80" rx="10" fill="rgba(0,255,136,0.06)" stroke="rgba(0,255,136,0.15)" />
        <text x="295" y="70" textAnchor="middle" fill="#00ff88" fontSize="11" fontWeight="700">Oracle Backend</text>
        <text x="295" y="88" textAnchor="middle" fill="#5c6b7a" fontSize="9">Scoring, CHI</text>
        <text x="295" y="102" textAnchor="middle" fill="#5c6b7a" fontSize="9">Reputation</text>

        {/* Arrow 2 */}
        <line x1="370" y1="80" x2="420" y2="80" stroke="#3d4f60" strokeWidth="1.5" />
        <polygon points="418,76 428,80 418,84" fill="#3d4f60" />

        {/* Sui Blockchain */}
        <rect x="430" y="40" width="150" height="80" rx="10" fill="rgba(124,58,237,0.08)" stroke="rgba(124,58,237,0.2)" />
        <text x="505" y="70" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="700">Sui Blockchain</text>
        <text x="505" y="88" textAnchor="middle" fill="#5c6b7a" fontSize="9">PulseRegistry</text>
        <text x="505" y="102" textAnchor="middle" fill="#5c6b7a" fontSize="9">On-chain scores</text>

        {/* Arrow 3 */}
        <line x1="580" y1="80" x2="630" y2="80" stroke="#3d4f60" strokeWidth="1.5" />
        <polygon points="628,76 638,80 628,84" fill="#3d4f60" />

        {/* Frontend */}
        <rect x="640" y="40" width="150" height="80" rx="10" fill="rgba(255,152,0,0.06)" stroke="rgba(255,152,0,0.15)" />
        <text x="715" y="70" textAnchor="middle" fill="#ff9800" fontSize="11" fontWeight="700">Frontend</text>
        <text x="715" y="88" textAnchor="middle" fill="#5c6b7a" fontSize="9">Dashboard</text>
        <text x="715" y="102" textAnchor="middle" fill="#5c6b7a" fontSize="9">Visualizations</text>

        {/* Direct read line from World API to Frontend */}
        <path d="M 85 120 Q 85 145 400 145 Q 715 145 715 120" stroke="#00e5ff" strokeWidth="1" strokeDasharray="4 3" fill="none" opacity="0.3" />
        <text x="400" y="155" textAnchor="middle" fill="#5c6b7a" fontSize="8">direct read (fallback)</text>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   6. Component Map — visual grid of component categories
   ═══════════════════════════════════════════════════════════ */

interface CompCategory { name: string; color: string; components: string[] }

export function ComponentMap({ categories }: { categories: CompCategory[] }) {
  return (
    <div className="my-6 grid sm:grid-cols-2 gap-3">
      {categories.map((cat) => (
        <motion.div
          key={cat.name}
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-lg border border-[rgba(0,229,255,0.08)] bg-space-900/50 p-4"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className={cn("w-3 h-3 rounded", cat.color)} />
            <span className="text-xs font-semibold text-[#e2eaf2] uppercase tracking-wider">{cat.name}</span>
            <span className="text-[10px] text-[#5c6b7a] ml-auto">{cat.components.length} components</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cat.components.map((c) => (
              <span key={c} className="text-[11px] px-2 py-0.5 rounded-md bg-space-800 text-[#8899a8] border border-[rgba(0,229,255,0.06)]">{c}</span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   7. Stat Grid — quick metric boxes
   ═══════════════════════════════════════════════════════════ */

export function StatGrid({ stats }: { stats: { label: string; value: string; sub?: string }[] }) {
  return (
    <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border border-[rgba(0,229,255,0.08)] bg-space-900/50 p-3 text-center">
          <p className="text-2xl font-bold text-[#e2eaf2]">{s.value}</p>
          <p className="text-[11px] text-[#5c6b7a] mt-0.5">{s.label}</p>
          {s.sub && <p className="text-[10px] text-[#3d4f60]">{s.sub}</p>}
        </div>
      ))}
    </div>
  );
}
