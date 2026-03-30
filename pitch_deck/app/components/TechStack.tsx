"use client";

import { motion } from "framer-motion";
import SteppedSlide from "./SteppedSlide";
import { SectionLabel, SectionTitle } from "./SectionWrapper";

const categories = [
  {
    label: "Frontend",
    techs: ["Next.js 16", "React 19", "TypeScript", "Canvas API", "TailwindCSS 4", "Zustand 5", "React Query 5"],
  },
  {
    label: "Blockchain",
    techs: ["Sui Move", "Sui SDK", "dApp Kit", "Programmable TXs"],
  },
  {
    label: "Backend",
    techs: ["Node.js", "TypeScript", "node-cron", "World API"],
  },
  {
    label: "Infrastructure",
    techs: ["Vercel", "Railway", "Sui Testnet", "Suiscan"],
  },
];

export default function TechStack() {
  return (
    <SteppedSlide id="tech-stack" steps={3} render={(step) => (
      <div>
        <div className="text-center mb-6">
          <SectionLabel>Tech Stack</SectionLabel>
          <SectionTitle>Built with production-grade tools.</SectionTitle>
        </div>

        {/* Step 0: Frontend + Blockchain — slide up */}
        <motion.div
          animate={{ opacity: step >= 0 ? 1 : 0, y: step >= 0 ? 0 : 50 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
          className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto mb-3"
        >
          {categories.slice(0, 2).map((cat, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.08] p-4" style={{ background: "rgba(10, 15, 26, 0.95)" }}>
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted block mb-2.5">{cat.label}</span>
              <div className="flex flex-col gap-1">
                {cat.techs.map((tech, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                    <span className="text-sm text-text-primary">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Step 1: Backend + Infrastructure — slide from right */}
        <motion.div
          animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : 50 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
          className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto mb-3"
        >
          {categories.slice(2, 4).map((cat, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.08] p-4" style={{ background: "rgba(10, 15, 26, 0.95)" }}>
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted block mb-2.5">{cat.label}</span>
              <div className="flex flex-col gap-1">
                {cat.techs.map((tech, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                    <span className="text-sm text-text-primary">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Step 2: Stats — scale up */}
        <motion.div
          animate={{ opacity: step >= 2 ? 1 : 0, scale: step >= 2 ? 1 : 0.85 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 250, damping: 25 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 rounded-2xl border border-white/[0.08] px-6 max-w-3xl mx-auto"
          style={{ background: "rgba(10, 15, 26, 0.95)" }}
        >
          {[
            { value: "24,502", label: "Systems" },
            { value: "5D", label: "Trust" },
            { value: "10min", label: "Cycle" },
            { value: "50/batch", label: "PTB" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    )} />
  );
}
