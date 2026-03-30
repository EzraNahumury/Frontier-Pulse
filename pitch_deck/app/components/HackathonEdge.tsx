"use client";

import { motion } from "framer-motion";
import SteppedSlide from "./SteppedSlide";
import { SectionLabel, SectionTitle, SectionDescription } from "./SectionWrapper";

const differentiators = [
  "Only tool treating the universe as a living organism",
  "Behavioral trust engine — no other tool does this",
  "On-chain verification — all scores verifiable on Suiscan",
  "Dual data pipeline — World API + Sui RPC combined",
  "Demo-worthy — heartbeat & galaxy vis are memorable",
  "Full-stack production — not a prototype, a product",
];

export default function HackathonEdge() {
  return (
    <SteppedSlide id="hackathon-edge" steps={3} render={(step) => (
      <div>
        <div className="text-center mb-6">
          <SectionLabel>Hackathon Edge</SectionLabel>
          <SectionTitle>Why this wins.</SectionTitle>
          <div className="flex justify-center">
            <SectionDescription>
              Built for &ldquo;A Toolkit for Civilization.&rdquo;
            </SectionDescription>
          </div>
        </div>

        {/* Quote — scales + rotates in slightly */}
        <motion.div
          animate={{
            opacity: step >= 0 ? 1 : 0,
            scale: step >= 0 ? 1 : 0.85,
            rotate: step >= 0 ? 0 : -2,
          }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
          className="max-w-2xl mx-auto text-center py-5 px-6 rounded-2xl border border-white/[0.08] mb-3"
          style={{ background: "rgba(10, 15, 26, 0.95)" }}
        >
          <p className="text-base sm:text-lg text-text-primary font-medium italic leading-relaxed">
            &ldquo;A civilization without self-awareness is flying blind.
            Frontier Pulse gives it eyes.&rdquo;
          </p>
        </motion.div>

        {/* Differentiators — slide in from right */}
        <motion.div
          animate={{
            opacity: step >= 1 ? 1 : 0,
            x: step >= 1 ? 0 : 60,
          }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
          className="max-w-3xl mx-auto rounded-2xl border border-white/[0.08] p-5 mb-3"
          style={{ background: "rgba(10, 15, 26, 0.95)" }}
        >
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted mb-3">Key Differentiators</p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5">
            {differentiators.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-white/20 mt-0.5 shrink-0">&mdash;</span>
                <span className="text-[13px] text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats — pop in from bottom */}
        <motion.div
          animate={{
            opacity: step >= 2 ? 1 : 0,
            y: step >= 2 ? 0 : 40,
            scale: step >= 2 ? 1 : 0.9,
          }}
          transition={{ duration: 0.4, type: "spring", stiffness: 250, damping: 25 }}
          className="grid grid-cols-3 gap-6 max-w-md mx-auto text-center"
        >
          <div>
            <p className="text-2xl font-bold text-text-primary">$80k</p>
            <p className="text-[11px] text-text-muted mt-0.5">Prize Pool</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">External</p>
            <p className="text-[11px] text-text-muted mt-0.5">Tools Track</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">World API</p>
            <p className="text-[11px] text-text-muted mt-0.5">Integration</p>
          </div>
        </motion.div>
      </div>
    )} />
  );
}
