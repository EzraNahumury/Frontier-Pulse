"use client";

import { motion } from "framer-motion";
import SteppedSlide from "./SteppedSlide";
import { SectionLabel, SectionTitle, SectionDescription } from "./SectionWrapper";

const layers = [
  {
    label: "Frontend",
    tech: "Next.js 16 + React 19 + Canvas API",
    items: ["Galaxy Map (24,502 nodes)", "Dual Heartbeat EKG", "Trust Compass", "CHI Gauge"],
  },
  {
    label: "Oracle Backend",
    tech: "Node.js + TypeScript",
    items: ["World API Ingestion", "Scoring Engine", "Anomaly Detection", "PTB Transaction Writer"],
  },
  {
    label: "Data Layer",
    tech: "Sui Blockchain + World API",
    items: ["PulseRegistry (Sui Move)", "On-Chain Trust Scores", "Live Stillness Server", "Verifiable on Suiscan"],
  },
];

export default function Architecture() {
  return (
    <SteppedSlide id="architecture" steps={3} render={(step) => (
      <div>
        <div className="text-center mb-6">
          <SectionLabel>How It Works</SectionLabel>
          <SectionTitle>From raw data to civilization intelligence.</SectionTitle>
          <div className="flex justify-center">
            <SectionDescription>
              Ingest &rarr; Analyze &rarr; Anchor on-chain &rarr; Visualize. Every 10 minutes.
            </SectionDescription>
          </div>
        </div>

        {/* Layers drop in from top, one by one */}
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {layers.map((layer, i) => (
            <div key={i}>
              <motion.div
                animate={{
                  opacity: i <= step ? 1 : 0,
                  y: i <= step ? 0 : -50,
                  rotateX: i <= step ? 0 : 15,
                }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 22 }}
                className="rounded-2xl border border-white/[0.08] p-5 overflow-hidden"
                style={{
                  background: "rgba(10, 15, 26, 0.95)",
                  transformPerspective: 800,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-[0.12em] uppercase bg-white/[0.04] text-text-muted">{layer.label}</span>
                  <span className="text-sm font-medium text-text-primary">{layer.tech}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {layer.items.map((item, j) => (
                    <span key={j} className="text-xs text-text-muted">{item}</span>
                  ))}
                </div>
              </motion.div>

              {/* Connecting arrow */}
              {i < layers.length - 1 && (
                <motion.div
                  animate={{ opacity: i < step ? 0.4 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center py-0.5"
                >
                  <svg width="14" height="18" viewBox="0 0 14 18" className="text-white/30">
                    <path d="M7 0v12M2 9l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    )} />
  );
}
