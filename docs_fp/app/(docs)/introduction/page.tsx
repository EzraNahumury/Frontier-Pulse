"use client";

import Image from "next/image";
import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { FeatureCard } from "@/components/docs/feature-card";
import { HeroBackground } from "@/components/docs/hero-background";
import { motion } from "framer-motion";
import { StatGrid } from "@/components/docs/visuals";
import {
  Globe,
  Shield,
  Activity,
  Radar,
  AlertTriangle,
  Layers,
  Wallet,
  BookOpen,
  Timer,
  Share2,
  ArrowRight,
  Eye,
  Brain,
  Link,
  Monitor,
} from "lucide-react";

export default function IntroductionPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden mb-8"
          style={{ background: "linear-gradient(160deg, #070b14 0%, #0d1525 40%, #0a1020 100%)" }}
        >
          {/* Animated particle canvas */}
          <HeroBackground />

          {/* Animated glow orbs */}
          <motion.div
            animate={{ x: [0, 15, -10, 0], y: [0, -10, 5, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[rgba(0,229,255,0.1)] blur-[80px] pointer-events-none"
          />
          <motion.div
            animate={{ x: [0, -12, 8, 0], y: [0, 8, -12, 0], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[rgba(0,255,136,0.08)] blur-[70px] pointer-events-none"
          />
          <motion.div
            animate={{ x: [0, 10, -8, 0], y: [0, -6, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-[rgba(124,58,237,0.1)] blur-[50px] pointer-events-none"
          />

          <div className="relative px-8 py-14 md:py-18 flex flex-col items-center text-center z-10">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <Image
                src="/logo/logo.png"
                alt="Frontier Pulse"
                width={180}
                height={48}
                className="h-10 w-auto brightness-0 invert drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                priority
              />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-[rgba(0,229,255,0.12)] text-[#00e5ff]/90 text-[11px] font-medium tracking-wide mb-7 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ff88]" />
              </span>
              EVE Frontier x Sui Hackathon 2026
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-3xl md:text-[2.75rem] leading-[1.15] font-bold mb-5 font-[family-name:var(--font-playfair)] drop-shadow-[0_0_30px_rgba(0,229,255,0.2)]"
              style={{ color: "#ffffff" }}
            >
              The Vital Signs of a<br />Living Universe
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="text-[15px] text-[#5c6b7a] max-w-md mx-auto leading-relaxed mb-9"
            >
              Real-time civilization health monitoring, behavioral trust intelligence, and on-chain reputation — built on Sui.
            </motion.p>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <a href="/getting-started" className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00e5ff] text-[#05080f] text-sm font-semibold hover:shadow-lg hover:shadow-[rgba(0,229,255,0.2)] transition-all duration-200">
                Get Started <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a href="/architecture" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.06] border border-[rgba(0,229,255,0.12)] text-[#b8c7d6] text-sm font-medium hover:bg-white/[0.1] hover:border-[rgba(0,229,255,0.25)] transition-all duration-200">
                Architecture
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* Quote */}
        <div className="flex items-start gap-3 my-6 px-1">
          <div className="w-1 shrink-0 rounded-full bg-gradient-to-b from-[#00e5ff] to-[#a78bfa] self-stretch" />
          <p className="text-[#5c6b7a] italic font-[family-name:var(--font-playfair)] text-[15px] leading-relaxed">
            &ldquo;Any dashboard can show you activity. We show you whether civilization is real.&rdquo;
          </p>
        </div>
      </div>

      <StatGrid stats={[
        { label: "Star Systems", value: "24,502", sub: "live from World API" },
        { label: "Trust Dimensions", value: "5", sub: "per player" },
        { label: "On-Chain", value: "Sui", sub: "Testnet" },
        { label: "Refresh", value: "10 min", sub: "oracle cycle" },
      ]} />

      {/* What is Frontier Pulse */}
      <section>
        <h2 id="what-is-frontier-pulse" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20 font-[family-name:var(--font-playfair)]">
          What is Frontier Pulse?
        </h2>
        <p className="text-[#8899a8] leading-relaxed mb-4">
          <strong className="text-[#e2eaf2]">Frontier Pulse</strong> is a real-time civilization health
          monitor for <a href="https://evefrontier.com" className="text-[#00e5ff] hover:underline" target="_blank" rel="noopener noreferrer">EVE Frontier</a> &mdash;
          a space survival MMO where thousands of players rebuild civilization across 24,000 star systems,
          all recorded on the <a href="https://sui.io" className="text-[#00e5ff] hover:underline" target="_blank" rel="noopener noreferrer">Sui blockchain</a>.
        </p>
        <p className="text-[#8899a8] leading-relaxed mb-4">
          It treats the entire game universe as a <strong className="text-[#e2eaf2]">living organism</strong>,
          visualizing not just what&apos;s happening &mdash; but whether what&apos;s happening is building
          something that lasts. By combining biometric-style universe visualization with a deep behavioral
          trust engine, Frontier Pulse answers the most fundamental question about any civilization:
        </p>
        <p className="text-center text-xl font-semibold text-[#e2eaf2] my-8 font-[family-name:var(--font-playfair)] italic">
          &ldquo;Is it alive, or just busy dying?&rdquo;
        </p>
      </section>

      {/* The Problem */}
      <section>
        <h2 id="the-problem" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          The Problem
        </h2>
        <p className="text-[#8899a8] leading-relaxed mb-4">
          EVE Frontier is a universe of <strong className="text-[#e2eaf2]">24,000+ star systems</strong> where
          thousands of players simultaneously mine, trade, build, fight, and form alliances. But players face two
          critical blind spots:
        </p>

        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="rounded-xl border border-[rgba(255,152,0,0.15)] bg-[rgba(255,152,0,0.04)] p-5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(255,152,0,0.12)] flex items-center justify-center mb-3">
              <Globe className="w-4 h-4 text-[#ff9800]" />
            </div>
            <h3 className="text-sm font-semibold text-[#e2eaf2] mb-1.5">Blind Spot 1: Visibility</h3>
            <p className="text-xs text-[#5c6b7a] leading-relaxed">
              You can only be in one system at a time. Wars ignite three sectors away and you don&apos;t know.
              A trade route gets severed and you find out when your shipment never arrives.
            </p>
          </div>
          <div className="rounded-xl border border-[rgba(255,61,61,0.15)] bg-[rgba(255,61,61,0.04)] p-5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(255,61,61,0.12)] flex items-center justify-center mb-3">
              <Shield className="w-4 h-4 text-[#ff3d3d]" />
            </div>
            <h3 className="text-sm font-semibold text-[#e2eaf2] mb-1.5">Blind Spot 2: Trust</h3>
            <p className="text-xs text-[#5c6b7a] leading-relaxed">
              There is no law in EVE Frontier. No police, courts, or credit system. When a stranger offers you
              a trade, you can&apos;t tell if they&apos;ll honor it or rob you.
            </p>
          </div>
        </div>

        <Callout variant="important" title="The Deeper Insight">
          These aren&apos;t just missing features &mdash; they&apos;re two halves of the same question.
          A universe can be full of activity but collapsing in trust. Activity without trust isn&apos;t civilization &mdash; it&apos;s chaos.
        </Callout>
      </section>

      {/* The Solution */}
      <section>
        <h2 id="the-solution" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          The Solution
        </h2>
        <p className="text-[#8899a8] leading-relaxed mb-6">
          Frontier Pulse combines a <strong className="text-[#e2eaf2]">real-time universe visualization layer</strong> with
          a <strong className="text-[#e2eaf2]">behavioral trust intelligence engine</strong> into a single unified tool:
        </p>

        <div className="overflow-x-auto my-6">
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Role</th>
                <th>What It Reveals</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong className="text-[#00e5ff]">Pulse Layer</strong></td>
                <td className="text-[#8899a8]">The eyes</td>
                <td className="text-[#8899a8]">Where things are happening &mdash; activity, combat, trade, growth</td>
              </tr>
              <tr>
                <td><strong className="text-[#a78bfa]">Agora Engine</strong></td>
                <td className="text-[#8899a8]">The brain</td>
                <td className="text-[#8899a8]">Whether what&apos;s happening is building real civilization &mdash; trust, reliability</td>
              </tr>
              <tr>
                <td><strong className="text-[#00ff88]">Combined</strong></td>
                <td className="text-[#8899a8]">The vital signs</td>
                <td className="text-[#8899a8]">Whether civilization is thriving, stressed, feverish, or dying</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Key Features */}
      <section>
        <h2 id="key-features" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-6 scroll-mt-20">
          Key Features
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard icon={Globe} title="Living Galaxy Map" description="24,502 star systems rendered on Canvas with trust-colored pulsing nodes and gate connections." color="cyan" />
          <FeatureCard icon={Activity} title="Dual Heartbeat EKG" description="Synchronized Activity Pulse and Trust Pulse lines revealing civilization health patterns." color="cyan" />
          <FeatureCard icon={Layers} title="Civilization Health Index" description="Composite score (0-100) from 6 sub-indices: economy, security, growth, connectivity, trust, social." color="violet" />
          <FeatureCard icon={Radar} title="Trust Compass" description="5-dimension player reputation radar: Reliability, Commerce, Diplomacy, Stewardship, Volatility." color="violet" />
          <FeatureCard icon={AlertTriangle} title="Anomaly Detection" description="Pattern detection flags blackouts, trust collapses, combat hotspots, and trade spikes." color="amber" />
          <FeatureCard icon={Timer} title="Time-Lapse Replay" description="Replay civilization evolution as an accelerated animation with playback controls." color="emerald" />
          <FeatureCard icon={Share2} title="Pulse Cards" description="Shareable SVG snapshot images of any system's vital signs for social media." color="emerald" />
          <FeatureCard icon={Wallet} title="Wallet Integration" description="Native Sui wallet connection via @mysten/dapp-kit for personalized features." color="cyan" />
          <FeatureCard icon={BookOpen} title="Guided Tour" description="Interactive onboarding walkthrough for new users exploring the dashboard." color="amber" />
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <h2 id="tech-stack" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Tech Stack
        </h2>
        <div className="overflow-x-auto my-4">
          <table>
            <thead>
              <tr>
                <th>Layer</th>
                <th>Technology</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]">Frontend</td><td className="text-[#8899a8]">Next.js 16 + React 19 + TailwindCSS 4 + Zustand 5</td></tr>
              <tr><td className="text-[#e2eaf2]">Visualization</td><td className="text-[#8899a8]">Canvas API (galaxy + EKG) + SVG (radar charts, gauges)</td></tr>
              <tr><td className="text-[#e2eaf2]">Wallet</td><td className="text-[#8899a8]">@mysten/dapp-kit + @tanstack/react-query</td></tr>
              <tr><td className="text-[#e2eaf2]">Smart Contract</td><td className="text-[#8899a8]">Sui Move (edition 2024) &mdash; PulseRegistry</td></tr>
              <tr><td className="text-[#e2eaf2]">Oracle Backend</td><td className="text-[#8899a8]">Node.js + TypeScript + node-cron + @mysten/sui SDK</td></tr>
              <tr><td className="text-[#e2eaf2]">Data Sources</td><td className="text-[#8899a8]">EVE Frontier World API + Sui Blockchain (Testnet)</td></tr>
            </tbody>
          </table>
        </div>

        <Callout variant="tip" title="External Tools Track">
          Frontier Pulse is built for the <strong>External Tools</strong> track of the hackathon &mdash;
          connecting to EVE Frontier via the World API rather than in-world Smart Assembly mods.
        </Callout>
      </section>

      {/* Design Philosophy */}
      <section>
        <h2
          id="design-philosophy"
          className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-6 scroll-mt-20 font-[family-name:var(--font-playfair)]"
        >
          Design Philosophy
        </h2>
        <div className="grid gap-4">
          {[
            {
              principle: "Universe as Organism",
              description:
                "We don\u2019t show dashboards of data. We show vital signs of a living universe. Every metric maps to a biological metaphor: the heartbeat shows rhythm, the CHI gauge shows health, the Trust Compass shows character.",
              color: "#00e5ff",
            },
            {
              principle: "Trust Over Activity",
              description:
                "Activity is noise. Trust is signal. Any universe can be busy \u2014 what matters is whether that activity is building something that lasts. That\u2019s why trust accounts for 60% of every health score.",
              color: "#00ff88",
            },
            {
              principle: "On-Chain Truth",
              description:
                "Reputation that lives only in a database can be edited, hidden, or deleted. By writing scores to Sui\u2019s PulseRegistry, we create an immutable civilization record that no single party controls.",
              color: "#a78bfa",
            },
          ].map((item, i) => (
            <motion.div
              key={item.principle}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.45 }}
              className="rounded-xl bg-space-900/50 border border-[rgba(0,229,255,0.08)] p-5"
              style={{ borderLeftWidth: 3, borderLeftColor: item.color }}
            >
              <p className="text-sm font-bold text-[#e2eaf2] mb-1.5">{item.principle}</p>
              <p className="text-[13px] text-[#8899a8] leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2
          id="how-it-works"
          className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-6 scroll-mt-20 font-[family-name:var(--font-playfair)]"
        >
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          {[
            {
              step: 1,
              label: "Observe",
              description: "World API feeds 24,502 systems, assemblies, and killmails",
              Icon: Eye,
              color: "#00e5ff",
              bgColor: "rgba(0,229,255,0.10)",
              borderColor: "rgba(0,229,255,0.18)",
            },
            {
              step: 2,
              label: "Analyze",
              description: "Oracle scores system health, player reputation, global CHI",
              Icon: Brain,
              color: "#00ff88",
              bgColor: "rgba(0,255,136,0.10)",
              borderColor: "rgba(0,255,136,0.18)",
            },
            {
              step: 3,
              label: "Record",
              description: "Batched writes to Sui PulseRegistry via PTBs",
              Icon: Link,
              color: "#a78bfa",
              bgColor: "rgba(167,139,250,0.10)",
              borderColor: "rgba(167,139,250,0.18)",
            },
            {
              step: 4,
              label: "Visualize",
              description: "Dashboard renders galaxy, heartbeat, compass, alerts",
              Icon: Monitor,
              color: "#f59e0b",
              bgColor: "rgba(245,158,11,0.10)",
              borderColor: "rgba(245,158,11,0.18)",
            },
          ].map((item, i, arr) => (
            <div key={item.label} className="flex flex-col md:flex-row items-center flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.45 }}
                className="flex flex-col items-center text-center rounded-xl bg-space-900/50 border border-[rgba(0,229,255,0.08)] p-5 w-full"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: item.bgColor, border: `1px solid ${item.borderColor}` }}
                >
                  <item.Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <span
                  className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                  style={{ color: item.color }}
                >
                  Step {item.step}
                </span>
                <p className="text-sm font-bold text-[#e2eaf2] mb-1">{item.label}</p>
                <p className="text-[12px] text-[#5c6b7a] leading-relaxed">{item.description}</p>
              </motion.div>

              {/* Connector arrow */}
              {i < arr.length - 1 && (
                <>
                  {/* Desktop: horizontal arrow */}
                  <div className="hidden md:flex items-center px-2 shrink-0">
                    <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
                      <path d="M0 6h22m0 0l-5-5m5 5l-5 5" stroke="#5c6b7a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {/* Mobile: vertical arrow */}
                  <div className="flex md:hidden items-center py-2 shrink-0">
                    <svg width="12" height="28" viewBox="0 0 12 28" fill="none">
                      <path d="M6 0v22m0 0l-5-5m5 5l5-5" stroke="#5c6b7a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}
