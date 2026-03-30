"use client";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7 } },
};

export default function CTA() {
  return (
    <section
      id="cta"
      className="relative h-dvh flex items-center justify-center overflow-hidden"
      style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-4xl mx-auto px-6 text-center"
      >
        <motion.p variants={fadeUp} className="text-[11px] font-semibold tracking-[0.2em] uppercase text-text-muted mb-6">
          A Toolkit for Civilization
        </motion.p>

        <motion.h2 variants={scaleIn} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
          A civilization without
          <br />
          self-awareness is flying blind.
        </motion.h2>

        <motion.p variants={fadeUp} className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
          See the universe. Measure the trust.
          Read the vital signs. Build with confidence.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href="https://frontier-pulse-nine.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group px-8 py-4 rounded-lg font-semibold text-bg-primary bg-white hover:bg-white/90 transition-all hover:scale-105 text-lg"
          >
            Launch Frontier Pulse
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
          </a>
          <a
            href="https://docs-frontierpulse.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-lg font-semibold text-text-secondary border border-white/10 hover:border-white/20 hover:text-text-primary transition-all text-lg"
          >
            Read the Docs
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-lg border border-white/[0.06]">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-sm text-text-muted">
            Built for{" "}
            <span className="text-text-secondary font-medium">
              EVE Frontier x Sui Hackathon 2026
            </span>{" "}
            — External Tools Track
          </span>
        </motion.div>

        {/* Footer info merged into last slide */}
        <motion.div variants={fadeUp} className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="https://frontier-pulse-nine.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-text-primary transition-colors">App</a>
          <span className="text-white/10 hidden sm:block">&middot;</span>
          <a href="https://evefrontier.com" target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-text-primary transition-colors">EVE Frontier</a>
          <span className="text-white/10 hidden sm:block">&middot;</span>
          <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-text-primary transition-colors">Sui</a>
          <span className="text-white/10 hidden sm:block">&middot;</span>
          <a href="https://docs.evefrontier.com/SwaggerWorldApi" target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-text-primary transition-colors">Docs</a>
        </motion.div>
      </motion.div>
    </section>
  );
}
