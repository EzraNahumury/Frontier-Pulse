"use client";

import { motion } from "framer-motion";
import SteppedSlide from "./SteppedSlide";
import { SectionLabel, SectionTitle } from "./SectionWrapper";

const phases = [
  {
    phase: "v1.0",
    title: "Hackathon Launch",
    status: "Completed",
    period: "Mar 2026",
    items: ["Galaxy Map", "Dual Heartbeat", "Health Index", "Trust Compass", "Anomaly Detection", "Sui Contracts"],
  },
  {
    phase: "v2.0",
    title: "Community",
    status: "Planned",
    period: "Q2 2026",
    items: ["Alliance profiles", "Leaderboards", "Discord bot", "Mobile layout", "Trust widget"],
  },
  {
    phase: "v3.0",
    title: "Intelligence",
    status: "Vision",
    period: "Q3-Q4 2026",
    items: ["Predictive analytics", "Simulation mode", "Public API", "WebSocket push", "PostgreSQL + Redis"],
  },
];

const CARD_W = 300;
const CARD_H = 250;
const VISIBLE = 110;

export default function Roadmap() {
  return (
    <SteppedSlide id="roadmap" steps={3} render={(step) => {
      const stackWidth = step * VISIBLE + CARD_W;

      return (
        <div>
          <div className="text-center mb-6">
            <SectionLabel>Roadmap</SectionLabel>
            <SectionTitle>From hackathon to platform.</SectionTitle>
          </div>

          {/* Horizontal card stack */}
          <div
            className="relative mx-auto"
            style={{ height: CARD_H, width: stackWidth, maxWidth: "100%", transition: "width 0.4s ease" }}
          >
            {phases.map((phase, i) => {
              if (i > step) return null;
              const isCurrent = i === step;
              const depth = step - i;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: stackWidth + 40 }}
                  animate={{
                    x: i * VISIBLE,
                    opacity: isCurrent ? 1 : Math.max(0.55, 1 - depth * 0.15),
                    scale: isCurrent ? 1 : 0.98,
                  }}
                  transition={{ type: "spring", stiffness: 250, damping: 28 }}
                  className="absolute top-0 rounded-2xl border border-white/[0.08] p-5 flex flex-col"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    zIndex: i,
                    background: isCurrent ? "rgba(12, 18, 30, 1)" : "rgba(10, 14, 24, 0.97)",
                    boxShadow: isCurrent ? "0 8px 40px rgba(0,0,0,0.5)" : "0 2px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold tracking-wider uppercase text-text-primary">{phase.phase}</span>
                    <span className={`text-[11px] font-medium ${
                      phase.status === "Completed" ? "text-accent-green" : "text-text-muted"
                    }`}>{phase.status}</span>
                  </div>
                  <span className="text-[11px] text-text-muted mb-2">{phase.period}</span>
                  <h3 className="text-base font-bold text-text-primary mb-3">{phase.title}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 flex-1">
                    {phase.items.map((item, j) => (
                      <span key={j} className="flex items-center gap-1 text-[12px] text-text-secondary">
                        <span className="text-white/20 shrink-0">
                          {phase.status === "Completed" ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                          ) : (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /></svg>
                          )}
                        </span>
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }} />
  );
}
