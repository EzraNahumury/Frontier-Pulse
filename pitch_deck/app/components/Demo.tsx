"use client";

import { motion, AnimatePresence } from "framer-motion";
import SteppedSlide from "./SteppedSlide";
import { SectionLabel, SectionTitle } from "./SectionWrapper";

const useCases = [
  {
    id: "trader",
    persona: "The Trader",
    action: "Open Trust Compass",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
    scenario: "Before accepting a 10,000 ISK trade deal from a stranger...",
    result: "Reliability: 23. Commerce: 15. Volatility: 89. Archetype: Warlord. Walk away — or bring backup.",
    stats: [
      { label: "Reliability", value: 23, danger: false },
      { label: "Commerce", value: 15, danger: false },
      { label: "Volatility", value: 89, danger: true },
    ],
  },
  {
    id: "builder",
    persona: "The Alliance Leader",
    action: "Check Galaxy Map + CHI",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
    scenario: "Planning where to build your next infrastructure hub...",
    result: "CHI: Economy 85, Security 72. High-trust systems glowing bright. Build with on-chain confidence.",
    stats: [
      { label: "Economy", value: 85, danger: false },
      { label: "Security", value: 72, danger: false },
      { label: "Trust", value: 78, danger: false },
    ],
  },
  {
    id: "scout",
    persona: "The Scout",
    action: "Monitor Anomaly Alerts",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    scenario: "Your alliance needs early warning of incoming threats...",
    result: "Combat Hotspot flagged 3 systems away. Trust Collapse nearby. Heartbeat shows fever. Mobilize.",
    stats: [
      { label: "Combat", value: 92, danger: true },
      { label: "Exodus Risk", value: 67, danger: true },
      { label: "Activity", value: 95, danger: false },
    ],
  },
];

export default function Demo() {
  // 6 internal steps → 2 per persona, so each lingers for an extra scroll
  // step 0-1 → Trader, step 2-3 → Alliance Leader, step 4-5 → Scout
  return (
    <SteppedSlide id="demo" steps={6} buffer={1} render={(step) => {
      const personaIndex = Math.min(2, Math.floor(step / 2));
      const current = useCases[personaIndex];

      return (
        <div>
          <div className="text-center mb-6">
            <SectionLabel>Use Cases</SectionLabel>
            <SectionTitle>What would you do with this data?</SectionTitle>
          </div>

          <div className="flex justify-center gap-2 mb-5">
            {useCases.map((uc, i) => (
              <span
                key={uc.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  i === personaIndex
                    ? "bg-white text-bg-primary"
                    : i < personaIndex
                      ? "text-text-muted border border-white/[0.06]"
                      : "text-white/10 border border-white/[0.03]"
                }`}
              >
                {uc.icon}
                <span className="hidden sm:inline">{uc.persona}</span>
              </span>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="max-w-3xl mx-auto rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-text-muted">{current.icon}</div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">{current.persona}</h3>
                  <p className="text-[11px] text-text-muted">{current.action}</p>
                </div>
              </div>
              <p className="text-text-secondary mb-3 italic text-[14px] leading-relaxed">
                &ldquo;{current.scenario}&rdquo;
              </p>
              <div className="h-px bg-white/[0.06] my-3" />
              <p className="text-text-primary text-[14px] leading-relaxed mb-4">{current.result}</p>
              <div className="flex flex-col gap-2.5">
                {current.stats.map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-24 shrink-0 text-right">{stat.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className={`h-full rounded-full ${stat.danger && stat.value > 60 ? "bg-red-500/70" : "bg-white/30"}`}
                      />
                    </div>
                    <span className="text-xs font-mono w-7 text-text-muted">{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      );
    }} />
  );
}
