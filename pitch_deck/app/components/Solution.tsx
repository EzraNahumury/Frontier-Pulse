"use client";

import { motion } from "framer-motion";
import SteppedSlide from "./SteppedSlide";
import { SectionLabel, SectionTitle } from "./SectionWrapper";

const components = [
  {
    num: "01",
    name: "Pulse Layer",
    role: "The Eyes",
    details: "Real-time visualization mapping activity, combat, trade, and growth across all 24,502 systems. Brightness, color, and size encode three dimensions at a glance.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>,
  },
  {
    num: "02",
    name: "Agora Engine",
    role: "The Brain",
    details: "Behavioral trust intelligence analyzing reputation, cooperation, and betrayal to answer: is this civilization building — or tearing itself apart?",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.95.44" /><path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.95.44" /></svg>,
  },
  {
    num: "03",
    name: "Vital Signs",
    role: "The Diagnosis",
    details: "Combined health index: activity + trust = a single diagnosis. Thriving, Stressed, Feverish, or Dying. On-chain, verifiable, updated every 10 minutes.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  },
];

const CARD_W = 300;
const CARD_H = 240;
const VISIBLE = 110;

export default function Solution() {
  return (
    <SteppedSlide id="solution" steps={4} render={(step) => {
      const cardStep = Math.min(step, 2);
      const stackWidth = cardStep * VISIBLE + CARD_W;

      return (
        <div>
          <div className="text-center mb-6">
            <SectionLabel>The Solution</SectionLabel>
            <SectionTitle>We gave the universe a heartbeat.</SectionTitle>
          </div>

          {/* Horizontal card stack */}
          <div
            className="relative mx-auto mb-5"
            style={{ height: CARD_H, width: stackWidth, maxWidth: "100%", transition: "width 0.4s ease" }}
          >
            {components.map((comp, i) => {
              if (i > cardStep) return null;
              const isCurrent = i === cardStep;
              const depth = cardStep - i;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: stackWidth + 40 }}
                  animate={{
                    x: i * VISIBLE,
                    opacity: isCurrent ? 1 : Math.max(0.55, 1 - depth * 0.15),
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-white/10 font-mono leading-none">{comp.num}</span>
                    <div className="text-text-muted">{comp.icon}</div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-base font-bold text-text-primary">{comp.name}</h3>
                    <span className="text-[10px] tracking-[0.1em] uppercase text-text-muted">{comp.role}</span>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed flex-1">{comp.details}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Formula — step 3 */}
          <motion.div
            animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 30 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm font-medium text-text-muted"
          >
            <span className="px-4 py-2 rounded-lg border border-white/[0.06]">Activity Data</span>
            <span className="text-lg">+</span>
            <span className="px-4 py-2 rounded-lg border border-white/[0.06]">Trust Intelligence</span>
            <span className="text-lg">=</span>
            <span className="px-4 py-2 rounded-lg border border-white/[0.06] text-text-primary">Civilization Vital Signs</span>
          </motion.div>
        </div>
      );
    }} />
  );
}
