"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  id: string;
  title: string;
  items: FAQItem[];
}

const sections: FAQSection[] = [
  {
    id: "general",
    title: "General",
    items: [
      {
        question: "What is Frontier Pulse?",
        answer:
          "Frontier Pulse is a real-time civilization health monitor for EVE Frontier, treating the game universe as a living organism with vital signs. It combines a visualization layer (Pulse) with a trust intelligence engine (Agora) to answer whether civilization is genuinely thriving or just busy dying.",
      },
      {
        question: "What track is this built for?",
        answer:
          "The External Tools track of the EVE Frontier x Sui Hackathon 2026. We connect via the World API rather than in-world Smart Assembly mods.",
      },
      {
        question: "Do I need to play EVE Frontier to use this?",
        answer:
          "No. Frontier Pulse reads public data from the World API and Sui blockchain. You can explore the galaxy, analyze trust patterns, and monitor civilization health without a game account.",
      },
      {
        question: "Is the data real?",
        answer:
          "Yes. Systems, smart assemblies, and killmails come from the live EVE Frontier World API. When enrichment data isn\u2019t available for a system, we use a deterministic hash function that generates consistent pseudo-random vitals per system ID.",
      },
    ],
  },
  {
    id: "technical",
    title: "Technical",
    items: [
      {
        question: "Why Sui blockchain?",
        answer:
          "Sui\u2019s object-centric model, sub-second finality, and Programmable Transaction Blocks (PTBs) let us batch 50+ score updates into a single transaction. The shared object pattern (PulseRegistry) provides natural concurrency for reads while restricting writes to authorized oracles.",
      },
      {
        question: "How does the oracle work?",
        answer:
          "A Node.js service on a 10-minute cron cycle. Each cycle: (1) fetches all 24,502 systems from World API, (2) enriches with assemblies + killmails, (3) computes system health + player reputation + global CHI, (4) detects anomalies, (5) writes results on-chain via batched PTBs.",
      },
      {
        question: "Can the dashboard work without the oracle?",
        answer:
          "Yes. The frontend computes vitals locally using the same deterministic hash function. You lose on-chain persistence and trust scores, but the galaxy map, heartbeat, and system views all function standalone.",
      },
      {
        question: "How are 24,502 systems rendered at 60fps?",
        answer:
          "All nodes are drawn as simple Canvas circles with trust-based coloring. Performance comes from: depth-based sizing (no complex shapes), viewport culling (skip off-screen nodes), color batching, and an offscreen canvas cache for the static background layer.",
      },
    ],
  },
  {
    id: "trust-scoring",
    title: "Trust & Scoring",
    items: [
      {
        question: "How is trust calculated?",
        answer:
          "Trust Level = 100 - (kill_ratio \u00d7 50) + infrastructure_boost. High combat relative to player count lowers trust; infrastructure investment raises it. The formula runs identically in the oracle (scoring.ts) and frontend (vitals.ts).",
      },
      {
        question: "What makes someone a \u2018Civilization Builder\u2019 vs a \u2018Warlord\u2019?",
        answer:
          "Archetypes are classified by dimension thresholds. A Civilization Builder has Stewardship \u2265 80 and Reliability \u2265 70 (they build for others). A Warlord has Volatility \u2265 70 and Commerce < 40 (high combat, little trade). First matching rule wins.",
      },
      {
        question: "Can the CHI score be gamed?",
        answer:
          "The oracle reads from the live World API, not player-submitted data. Scores reflect actual on-chain activity. The multi-dimensional approach (6 sub-indices) means boosting one metric doesn\u2019t inflate the overall score \u2014 you\u2019d need genuine broad-spectrum civilization health.",
      },
      {
        question: "What triggers an anomaly alert?",
        answer:
          "Pattern matching on system scores: Blackout (infrastructure exists but activity collapsed), Trust Collapse (active players but trust critically low), Combat Hotspot (extreme PvP), Trade Spike (unusual transaction volume).",
      },
    ],
  },
  {
    id: "wallet",
    title: "Wallet & On-Chain",
    items: [
      {
        question: "Do I need a wallet to use Frontier Pulse?",
        answer:
          "No. The dashboard is fully functional without a wallet. Connecting a Sui wallet unlocks personalized features: your systems highlighted on the map, watchlist persistence, and the ability to endorse systems on-chain.",
      },
      {
        question: "What does endorsing a system do?",
        answer:
          "An endorsement is an on-chain signal from your wallet validating a system\u2019s activity. It\u2019s stored in the PulseRegistry with anti-spam deduplication (one endorsement per wallet per system via BCS key).",
      },
      {
        question: "Which wallets are supported?",
        answer:
          "Any Sui-compatible wallet via @mysten/dapp-kit: Sui Wallet, Suiet, Ethos, Nightly, Martian. You can also enter a wallet address manually for read-only features.",
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle, index }: { item: FAQItem; isOpen: boolean; onToggle: () => void; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 rounded-xl border border-[rgba(0,229,255,0.08)] bg-space-900/50 px-5 py-4 text-left hover:border-[rgba(0,229,255,0.18)] hover:bg-space-900/70 transition-all duration-200 cursor-pointer group"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronRight className="w-4 h-4 text-[#00e5ff]" />
        </motion.div>
        <span className="font-medium text-[#e2eaf2] text-sm leading-snug flex-1">
          {item.question}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-4 pt-2 ml-7">
          <p className="text-[#8899a8] text-sm leading-relaxed">
            {item.answer}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (sectionId: string, index: number) => {
    const key = `${sectionId}-${index}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">
        Frequently Asked Questions
      </h1>
      <p className="page-desc text-[#5c6b7a] mb-10">
        Common questions about Frontier Pulse, its architecture, scoring engine, and on-chain features.
      </p>

      <Callout variant="tip" title="Can&apos;t find your answer?">
        Check the detailed docs for{" "}
        <a href="/architecture" className="text-[#00e5ff] hover:underline">Architecture</a>,{" "}
        <a href="/scoring" className="text-[#00e5ff] hover:underline">Scoring</a>, or{" "}
        <a href="/smart-contract" className="text-[#00e5ff] hover:underline">Smart Contract</a>{" "}
        pages for in-depth technical references.
      </Callout>

      {sections.map((section) => (
        <section key={section.id} className="mb-10">
          <h2
            id={section.id}
            className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-5 scroll-mt-20 font-[family-name:var(--font-playfair)]"
          >
            {section.title}
          </h2>
          <div className="space-y-2">
            {section.items.map((item, index) => (
              <AccordionItem
                key={index}
                item={item}
                index={index}
                isOpen={!!openItems[`${section.id}-${index}`]}
                onToggle={() => toggleItem(section.id, index)}
              />
            ))}
          </div>
        </section>
      ))}
    </PageWrapper>
  );
}
