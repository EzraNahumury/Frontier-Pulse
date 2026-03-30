"use client";

import { motion } from "framer-motion";
import SteppedSlide from "./SteppedSlide";
import { SectionLabel, SectionTitle } from "./SectionWrapper";

const features = [
  {
    num: "01",
    title: "Living Galaxy Map",
    desc: "24,502 systems on Canvas. Brightness = activity, color = trust, size = infrastructure.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>,
  },
  {
    num: "02",
    title: "Dual Heartbeat",
    desc: "Two EKG lines at 30fps. White for activity, green for trust. Diagnoses civilization state.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  },
  {
    num: "03",
    title: "Health Index",
    desc: "Composite 0-100 from 6 sub-indices: Economy, Security, Growth, Trust, Connectivity, Cohesion.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  },
  {
    num: "04",
    title: "Trust Compass",
    desc: "5D reputation radar. Auto-classifies players: Builder, Trader, Diplomat, or Warlord.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12,2 15,9 22,9 17,14 19,22 12,18 5,22 7,14 2,9 9,9" /></svg>,
  },
  {
    num: "05",
    title: "Anomaly Detection",
    desc: "Flags Blackouts, Trust Collapses, Combat Hotspots, Exoduses — before anyone else knows.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
  },
  {
    num: "06",
    title: "Time-Lapse",
    desc: "Scrub 24h–30d of civilization evolution at up to 4x speed. See invisible macro patterns.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  },
  {
    num: "07",
    title: "Pulse Cards",
    desc: "Shareable SVG snapshots for social. System vitals, trust badges, CHI scores — one click.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /></svg>,
  },
  {
    num: "08",
    title: "On-Chain Proof",
    desc: "Every score on Sui via batched PTBs. Verifiable on Suiscan. No black box — just truth.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>,
  },
];

const CARD_W = 240;
const CARD_H = 230;
const VISIBLE = 68; // px of each previous card visible on left

export default function Features() {
  return (
    <SteppedSlide id="features" steps={8} buffer={1} render={(step) => {
      const stackWidth = step * VISIBLE + CARD_W;

      return (
        <div>
          <div className="flex items-end justify-between mb-6">
            <div>
              <SectionLabel>Key Features</SectionLabel>
              <SectionTitle>Eight instruments.</SectionTitle>
            </div>
            <span className="text-sm font-mono text-text-muted mb-1">
              {step + 1}<span className="text-white/10">/8</span>
            </span>
          </div>

          {/* Horizontal card stack — left to right */}
          <div
            className="relative mx-auto"
            style={{ height: CARD_H, width: stackWidth, maxWidth: "100%", transition: "width 0.4s ease" }}
          >
            {features.map((f, i) => {
              if (i > step) return null;
              const isCurrent = i === step;
              const depth = step - i;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: stackWidth + 40 }}
                  animate={{
                    x: i * VISIBLE,
                    opacity: isCurrent ? 1 : Math.max(0.5, 1 - depth * 0.08),
                    scale: isCurrent ? 1 : 0.98,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute top-0 rounded-2xl border border-white/[0.08] p-5 flex flex-col"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    zIndex: i,
                    background: isCurrent ? "rgba(12, 18, 30, 1)" : "rgba(10, 14, 24, 0.97)",
                    boxShadow: isCurrent ? "0 8px 40px rgba(0,0,0,0.5)" : "0 2px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  {/* Number + Icon — top-left, always visible */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-white/10 font-mono leading-none">{f.num}</span>
                    <div className="text-text-muted">{f.icon}</div>
                  </div>

                  {/* Title — left-aligned */}
                  <h3 className="text-[15px] font-bold text-text-primary mb-2 leading-tight">{f.title}</h3>

                  {/* Description — only fully readable on current card */}
                  <p className="text-[12px] text-text-secondary leading-relaxed flex-1">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }} />
  );
}
