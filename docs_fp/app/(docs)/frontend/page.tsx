"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { FeatureCard } from "@/components/docs/feature-card";
import { RenderPipelineDiagram } from "@/components/docs/pipeline-diagram";
import { Globe, Activity, Radar, Layers, Timer, AlertTriangle, Share2, Search, Wallet, Eye } from "lucide-react";

export default function FrontendPage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">Frontend</h1>
      <p className="page-desc text-[#5c6b7a] mb-8">
        A deep dive into the Next.js 16 frontend &mdash; components, rendering, and state management.
      </p>

      {/* Component Overview */}
      <section>
        <h2 id="components" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Component Overview
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-6">
          The frontend contains <strong className="text-[#e2eaf2]">18 React components</strong> organized
          under <code>app/components/</code>. Each handles a specific domain of the dashboard.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <FeatureCard icon={Globe} title="GalaxyCanvas" description="24,502-node galaxy map rendered on Canvas API with trust-colored pulsing and gate connections." color="cyan" />
          <FeatureCard icon={Activity} title="DualHeartbeat" description="Dual EKG monitor (Activity + Trust) with 300-point rolling buffer at ~30fps." color="cyan" />
          <FeatureCard icon={Layers} title="CHIGauge" description="SVG circular arc gauge showing the global Civilization Health Index (0-100)." color="violet" />
          <FeatureCard icon={Radar} title="TrustCompass" description="5-axis SVG radar chart for player reputation with archetype classification." color="violet" />
          <FeatureCard icon={Eye} title="SystemPanel" description="Deep-dive panel with vitals, gate connections, neighbors, and player list." color="emerald" />
          <FeatureCard icon={AlertTriangle} title="AlertBell" description="Notification bell with dropdown showing detected anomalies by severity." color="amber" />
          <FeatureCard icon={Timer} title="TimeLapse" description="Replay controller with 1x/2x/4x speed, range selector, and progress scrubber." color="emerald" />
          <FeatureCard icon={Search} title="SearchPalette" description="Ctrl+K command palette for instant system search across all 24K systems." color="cyan" />
          <FeatureCard icon={Share2} title="PulseCards" description="Shareable SVG snapshot images (600x315px, Twitter card optimized)." color="amber" />
          <FeatureCard icon={Wallet} title="WalletModal" description="Sui wallet connection/disconnect powered by @mysten/dapp-kit." color="violet" />
        </div>
      </section>

      {/* Galaxy Canvas */}
      <section>
        <h2 id="galaxy-canvas" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Galaxy Canvas
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          The main view renders all <strong className="text-[#e2eaf2]">24,502 solar systems</strong> as
          interactive nodes on an HTML5 Canvas. Visual properties encode real data:
        </p>
        <div className="overflow-x-auto my-4">
          <table>
            <thead>
              <tr><th>Visual Property</th><th>Data Encoded</th></tr>
            </thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]">Brightness</td><td className="text-[#5c6b7a]">Player activity level (more players = brighter glow)</td></tr>
              <tr><td className="text-[#e2eaf2]">Color</td><td className="text-[#5c6b7a]">Trust level: <span className="text-[#00ff88]">Green</span> (&ge;70), <span className="text-[#ff9800]">Orange</span> (40-70), <span className="text-[#ff3d3d]">Red</span> (&lt;40)</td></tr>
              <tr><td className="text-[#e2eaf2]">Node Size</td><td className="text-[#5c6b7a]">Depth-based sizing from 3D coordinate normalization</td></tr>
              <tr><td className="text-[#e2eaf2]">Selection Ring</td><td className="text-[#5c6b7a]">Dashed pulsing ring with glow effect on selected system</td></tr>
              <tr><td className="text-[#e2eaf2]">Gate Lines</td><td className="text-[#5c6b7a]">Cyan flowing lines from selected system to gate destinations</td></tr>
            </tbody>
          </table>
        </div>
        <RenderPipelineDiagram />
        <Callout variant="tip" title="Performance">
          All 24,502 nodes are rendered every frame. Performance is achieved by using simple circles
          (no complex shapes), skipping off-screen nodes, and batching draw calls by color.
        </Callout>
      </section>

      {/* Dual Heartbeat */}
      <section>
        <h2 id="heartbeat" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Dual Heartbeat EKG
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          Two synchronized heartbeat lines at the bottom of the screen visualize the relationship
          between activity and trust in real time:
        </p>
        <div className="overflow-x-auto my-4">
          <table>
            <thead>
              <tr><th>Pattern</th><th>Activity</th><th>Trust</th><th>Diagnosis</th></tr>
            </thead>
            <tbody>
              <tr><td className="text-[#00ff88]">Thriving</td><td className="text-[#5c6b7a]">High</td><td className="text-[#5c6b7a]">High</td><td className="text-[#5c6b7a]">Genuine civilization growth</td></tr>
              <tr><td className="text-[#ff3d3d]">Fever</td><td className="text-[#5c6b7a]">High</td><td className="text-[#5c6b7a]">Dropping</td><td className="text-[#5c6b7a]">War, exploitation &mdash; trust is breaking</td></tr>
              <tr><td className="text-[#00e5ff]">Hibernation</td><td className="text-[#5c6b7a]">Low</td><td className="text-[#5c6b7a]">Stable</td><td className="text-[#5c6b7a]">Quiet but the social fabric is intact</td></tr>
              <tr><td className="text-[#8899a8]">Extinction</td><td className="text-[#5c6b7a]">Dropping</td><td className="text-[#5c6b7a]">Dropping</td><td className="text-[#5c6b7a]">Civilization is collapsing</td></tr>
            </tbody>
          </table>
        </div>
        <CodeBlock
          filename="Heartbeat Algorithm"
          code={`Buffer:    Rolling array of 300 data points (~30fps update rate)
Rendering: Quadratic Bezier curve interpolation (ctx.quadraticCurveTo)
Animation: requestAnimationFrame, shift buffer left, append new sample
Lines:     Activity (white, 0.9 opacity) | Trust (green, 0.8 opacity)

Data Generation:
  actBase  = 50 + sin(t * 1.1) * 12 + sin(t * 2.7) * 6
  actSpike = beatPhase < 0.3 ? sin(beatPhase / 0.3 * PI) * 25 : 0
  activity = clamp(actBase + actSpike + random_noise)`}
        />
      </section>

      {/* Trust Compass */}
      <section>
        <h2 id="trust-compass" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Trust Compass
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          Every player gets a 5-dimension reputation profile rendered as an SVG pentagon radar chart.
          The dimensions map directly to the on-chain <code>PlayerReputation</code> struct:
        </p>
        <div className="overflow-x-auto my-4">
          <table>
            <thead>
              <tr><th>Dimension</th><th>Measures</th><th>Question</th></tr>
            </thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]">Reliability</td><td className="text-[#5c6b7a]">Behavioral consistency, assembly count</td><td className="text-[#5c6b7a] italic">&ldquo;Can they be counted on?&rdquo;</td></tr>
              <tr><td className="text-[#e2eaf2]">Commerce</td><td className="text-[#5c6b7a]">Trade fairness, infrastructure investment</td><td className="text-[#5c6b7a] italic">&ldquo;Are they honest in deals?&rdquo;</td></tr>
              <tr><td className="text-[#e2eaf2]">Diplomacy</td><td className="text-[#5c6b7a]">Cross-system cooperation, low aggression</td><td className="text-[#5c6b7a] italic">&ldquo;Do they bring people together?&rdquo;</td></tr>
              <tr><td className="text-[#e2eaf2]">Stewardship</td><td className="text-[#5c6b7a]">Infrastructure contribution, deployments</td><td className="text-[#5c6b7a] italic">&ldquo;Do they build for others?&rdquo;</td></tr>
              <tr><td className="text-[#e2eaf2]">Volatility</td><td className="text-[#5c6b7a]">Combat involvement (inverted: lower = better)</td><td className="text-[#5c6b7a] italic">&ldquo;Could they betray me?&rdquo;</td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="archetypes" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">Player Archetypes</h3>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          Dimension patterns automatically classify players into behavioral archetypes:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {[
            { name: "Civilization Builder", rule: "Stewardship ≥ 80, Reliability ≥ 70", color: "text-[#00ff88]" },
            { name: "Trusted Trader", rule: "Commerce ≥ 80, Reliability ≥ 70", color: "text-[#00e5ff]" },
            { name: "Diplomat", rule: "Diplomacy ≥ 75, Volatility < 30", color: "text-[#a78bfa]" },
            { name: "Warlord", rule: "Volatility ≥ 70, Commerce < 40", color: "text-[#ff3d3d]" },
            { name: "Wildcard", rule: "50 ≤ Volatility < 70", color: "text-[#ff9800]" },
            { name: "Newcomer", rule: "Default archetype", color: "text-[#5c6b7a]" },
          ].map((a) => (
            <div key={a.name} className="rounded-lg border border-[rgba(0,229,255,0.08)] bg-space-900 p-3">
              <p className={`text-xs font-semibold ${a.color}`}>{a.name}</p>
              <p className="text-[10px] text-[#5c6b7a] mt-0.5">{a.rule}</p>
            </div>
          ))}
        </div>
      </section>

      {/* State Management */}
      <section>
        <h2 id="state" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          State Management
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          The frontend uses <strong className="text-[#e2eaf2]">Zustand 5</strong> for lightweight
          client-side state with localStorage persistence for watchlist and wallet state:
        </p>
        <CodeBlock
          language="typescript"
          filename="lib/store.ts"
          code={`// Key state slices:
interface AppStore {
  selectedSystem: string | null;   // Currently selected system ID
  selectedPlayer: string | null;   // Currently viewed player address
  view: "galaxy" | "timelapse";    // Active view mode
  trustFilter: "all" | "healthy" | "stressed" | "hostile";
  watchlist: string[];             // Bookmarked system/player IDs
  walletAddress: string | null;    // Connected Sui wallet
}`}
        />
      </section>
    </PageWrapper>
  );
}
