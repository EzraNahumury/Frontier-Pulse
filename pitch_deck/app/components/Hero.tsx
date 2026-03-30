"use client";

import { motion } from "framer-motion";
import SteppedSlide from "./SteppedSlide";

export default function Hero() {
  return (
    <SteppedSlide id="hero" steps={3} render={(step) => (
      <div className="text-center relative">
        {/* Launch App — top right, fixed to viewport */}
        <div className="fixed top-5 right-16 z-50">
          <a
            href="https://frontier-pulse-nine.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-lg border border-white/[0.1] text-text-muted hover:text-text-primary hover:border-white/[0.2] transition-all"
          >
            Launch App
            <span className="text-xs">&rarr;</span>
          </a>
        </div>
        {/* Step 0: Badge + Logo */}
        <motion.div
          animate={{ opacity: step >= 0 ? 1 : 0, y: step >= 0 ? 0 : -20 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-text-muted">
            EVE Frontier x Sui Hackathon 2026
          </span>
        </motion.div>

        <motion.div
          animate={{ opacity: step >= 0 ? 1 : 0, scale: step >= 0 ? 1 : 0.8 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <img
            src="/logo/logo.png"
            alt="Frontier Pulse"
            className="h-12 sm:h-16 lg:h-20 logo-pulse"
          />
        </motion.div>

        {/* Step 1: Title */}
        <motion.h1
          animate={{
            opacity: step >= 1 ? 1 : 0,
            y: step >= 1 ? 0 : 40,
          }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight mb-8"
        >
          The vital signs of
          <br />
          a living universe.
        </motion.h1>

        {/* Step 2: Subtitle + CTAs + Stats */}
        <motion.div
          animate={{
            opacity: step >= 2 ? 1 : 0,
            y: step >= 2 ? 0 : 30,
          }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto mb-12 leading-relaxed">
            24,502 solar systems. No way to know if your civilization
            is thriving or dying.{" "}
            <span className="text-text-primary">Until now.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a
              href="https://frontier-pulse-nine.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-8 py-3.5 rounded-lg font-semibold text-bg-primary bg-white hover:bg-white/90 transition-all hover:scale-105"
            >
              Explore the Pulse
              <span className="inline-block ml-1.5 transition-transform group-hover:translate-x-1">&rarr;</span>
            </a>
            <a
              href="https://docs-frontierpulse.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-lg font-semibold text-text-secondary border border-white/10 hover:border-white/20 hover:text-text-primary transition-all"
            >
              Documentation
            </a>
          </div>

          <div className="flex justify-center gap-12 sm:gap-16">
            {[
              { value: "24,502", label: "Systems" },
              { value: "5D", label: "Trust" },
              { value: "On-Chain", label: "Verified" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-[11px] text-text-muted mt-1 tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )} />
  );
}
