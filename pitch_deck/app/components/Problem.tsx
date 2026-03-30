"use client";

import { motion } from "framer-motion";
import SteppedSlide from "./SteppedSlide";
import { SectionLabel, SectionTitle } from "./SectionWrapper";

const cards = [
  {
    question: "What's happening out there?",
    title: "The Visibility Gap",
    description:
      "You're in one system. There are 24,501 others. A war just started three gates away and you won't know until the refugees show up. Trade routes collapse overnight. Nobody told you.",
  },
  {
    question: "Can I trust this person?",
    title: "The Trust Vacuum",
    description:
      "Someone wants to trade. Sounds fair. But there's no reputation, no history, no record. They could honor the deal or rob you blind. You're guessing, and so is everyone else.",
  },
];

export default function Problem() {
  return (
    <SteppedSlide id="problem" steps={3} render={(step) => (
      <div>
        <div className="text-center mb-8">
          <SectionLabel>The Problem</SectionLabel>
          <SectionTitle>
            Two questions every player asks.
            <br />
            <span className="text-text-muted">Zero answers — until now.</span>
          </SectionTitle>
        </div>

        {/* Cards slide in from opposite sides */}
        <div className="flex flex-col gap-3 max-w-3xl mx-auto mb-4">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: i <= step ? 1 : 0,
                x: i <= step ? 0 : (i === 0 ? -80 : 80),
                scale: i <= step ? 1 : 0.92,
              }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
              className="rounded-2xl border border-white/[0.08] p-6 overflow-hidden"
              style={{ background: "rgba(10, 15, 26, 0.95)" }}
            >
              <p className="text-accent-cyan text-sm font-medium mb-2 italic">
                &ldquo;{card.question}&rdquo;
              </p>
              <h3 className="text-lg font-bold text-text-primary mb-2">{card.title}</h3>
              <p className="text-text-secondary leading-relaxed text-[14px]">{card.description}</p>
            </motion.div>
          ))}

          {/* Insight — scales up from center */}
          <motion.div
            animate={{
              opacity: step >= 2 ? 1 : 0,
              scale: step >= 2 ? 1 : 0.8,
            }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
            className="rounded-2xl border border-white/[0.08] p-6 text-center"
            style={{ background: "rgba(10, 15, 26, 0.95)" }}
          >
            <p className="text-xl sm:text-2xl font-bold text-text-primary leading-snug max-w-3xl mx-auto mb-2">
              These aren&apos;t two separate problems.
              They&apos;re two halves of the same question:
            </p>
            <p className="text-lg text-text-muted italic">
              &ldquo;Is this civilization actually healthy?&rdquo;
            </p>
          </motion.div>
        </div>
      </div>
    )} />
  );
}
