"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { WeightChart, TrustSpectrum, ScoreCard, FlowSteps, StatGrid } from "@/components/docs/visuals";

export default function ScoringPage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">Scoring Engine</h1>
      <p className="page-desc text-[#5c6b7a] mb-8">Complete reference for all scoring algorithms, formulas, and thresholds.</p>

      <StatGrid stats={[
        { label: "Star Systems", value: "24,502", sub: "scored per cycle" },
        { label: "Trust Dimensions", value: "5", sub: "per player" },
        { label: "CHI Sub-Indices", value: "6", sub: "weighted composite" },
        { label: "Alert Types", value: "5", sub: "anomaly patterns" },
      ]} />

      <Callout variant="important" title="Consistency Guarantee">
        The same scoring formulas run in three places: the oracle backend (<code>scoring.ts</code>), the frontend live data module (<code>liveData.ts</code>), and the Sui smart contract (<code>frontier_pulse.move</code>). This ensures consistent scores regardless of which path produces them.
      </Callout>

      <section>
        <h2 id="system-health" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">System Health Scoring</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">Each of the 24,502 star systems receives a health snapshot. When real enrichment data (smart assemblies, killmails) is available from the World API, it drives the scores. Otherwise, a deterministic hash function provides consistent fallback scores.</p>

        <h3 id="real-data" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">Real Data Path</h3>
        <p className="text-[#8899a8] text-sm mb-3">Inputs from World API enrichment:</p>
        <div className="overflow-x-auto my-4">
          <table><thead><tr><th>Input</th><th>Source</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]">playerCount</td><td className="text-[#8899a8]">Smart Assemblies + Killmails</td><td className="text-[#5c6b7a]">Unique player addresses active in system</td></tr>
              <tr><td className="text-[#e2eaf2]">infraCount</td><td className="text-[#8899a8]">Smart Assemblies API</td><td className="text-[#5c6b7a]">Number of deployed Smart Assemblies (gates, SSUs, turrets)</td></tr>
              <tr><td className="text-[#e2eaf2]">kills</td><td className="text-[#8899a8]">Killmails API</td><td className="text-[#5c6b7a]">Recent PvP kill count in this system</td></tr>
            </tbody>
          </table>
        </div>

        <CodeBlock language="typescript" filename="scoring.ts — System Health" code={`// Step 1: Component scores (0-100 each)
playerScore  = min(playerCount * 5, 100)
infraScore   = min(infraCount * 3, 100)
combatScore  = min(kills * 8, 100)

// Step 2: Activity Level — weighted blend
activityLevel = clamp(
  playerScore * 0.4 + infraScore * 0.35 + combatScore * 0.25
)

// Step 3: Trust Level — inverse of combat ratio + infrastructure bonus
combatRatio = playerCount > 0 ? kills / playerCount : 0
baseTrust   = clamp(100 - combatRatio * 50)
infraBoost  = min(infraCount * 2, 20)
trustLevel  = clamp(baseTrust + infraBoost)

// Step 4: Transaction Frequency — activity density proxy
txFrequency = clamp((playerCount * 3 + infraCount * 2 + kills) * 2)

// Step 5: Local CHI — 40% activity + 60% trust (trust-weighted)
localChi = floor((activityLevel * 40 + trustLevel * 60) / 100)`} />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 my-6">
          <ScoreCard label="Activity Level" formula="players×0.4 + infra×0.35 + combat×0.25" example={72} color="bg-blue-500" />
          <ScoreCard label="Trust Level" formula="100 - combatRatio×50 + infraBoost" example={85} color="bg-emerald-500" />
          <ScoreCard label="Local CHI" formula="activity×40% + trust×60%" example={79} color="bg-violet-500" />
        </div>

        <h3 id="fallback" className="text-lg font-semibold text-[#e2eaf2] mb-3 mt-6 scroll-mt-20">Deterministic Fallback</h3>
        <p className="text-[#8899a8] text-sm mb-3">When no enrichment data exists, a seeded hash function generates consistent pseudo-random scores from the system ID:</p>
        <CodeBlock language="typescript" filename="vitals.ts — Hash Function" code={`function hash(n: number): number {
  let h = n ^ 0x5f3759df;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
  h = (h ^ (h >>> 16)) >>> 0;
  return (h & 0xffff) / 0xffff;  // → 0.0 to 1.0
}

// Same system ID always produces the same vitals:
activityLevel = floor(10 + hash(systemId) * 90)           // 10-100
trustLevel    = floor(15 + hash(systemId + 7919) * 85)    // 15-100
playerCount   = floor(hash(systemId + 15373) * 60)        // 0-60
infraCount    = floor(hash(systemId + 23197) * 20)        // 0-20
txFrequency   = floor(10 + hash(systemId + 31531) * 90)   // 10-100
combatIncidents = floor(hash(systemId + 40343) * 12)      // 0-12`} />
        <Callout variant="tip">The hash offsets (7919, 15373, etc.) are prime numbers chosen to minimize correlation between dimensions for the same system.</Callout>
      </section>

      <section>
        <h2 id="player-reputation" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Player Reputation (Trust Compass)</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">Each player&apos;s on-chain activity is analyzed across 5 behavioral dimensions (0-100 each):</p>

        <CodeBlock language="typescript" filename="scoring.ts — Player Reputation" code={`// Inputs from World API aggregation:
//   assemblyCount  — Smart Assemblies owned by this player
//   killCount      — Times this player was the attacker
//   deathCount     — Times this player was the victim
//   systemsVisited — Unique systems with activity

totalCombat     = killCount + deathCount
aggressionRatio = totalCombat > 0 ? killCount / totalCombat : 0

// 5 Dimensions:
reliability  = clamp(40 + assemblyCount * 5 + systemsVisited * 2)
commerce     = clamp(30 + assemblyCount * 8)
diplomacy    = clamp(50 - aggressionRatio * 40 + systemsVisited * 3)
stewardship  = clamp(20 + assemblyCount * 10)
volatility   = clamp(totalCombat * 5 + |killCount - deathCount| * 3)`} />

        <WeightChart title="Trust Compass Dimension Weights" items={[
          { label: "Reliability", weight: 25, color: "bg-blue-500" },
          { label: "Commerce", weight: 25, color: "bg-cyan-500" },
          { label: "Diplomacy", weight: 20, color: "bg-violet-500" },
          { label: "Stewardship", weight: 20, color: "bg-emerald-500" },
          { label: "Inv. Volatility", weight: 10, color: "bg-amber-500" },
        ]} />

        <h3 id="composite-score" className="text-lg font-semibold text-[#e2eaf2] mb-3 mt-6 scroll-mt-20">Composite Trust Score</h3>
        <p className="text-[#8899a8] text-sm mb-3">Weighted combination matching the on-chain formula:</p>
        <CodeBlock language="typescript" filename="On-chain formula" code={`composite = (
  reliability * 25 +
  commerce    * 25 +
  diplomacy   * 20 +
  stewardship * 20 +
  (100 - volatility) * 10   // inverted: low volatility = good
) / 100`} />

        <h3 id="archetypes" className="text-lg font-semibold text-[#e2eaf2] mb-3 mt-6 scroll-mt-20">Archetype Classification</h3>
        <p className="text-[#8899a8] text-sm mb-3">First matching rule wins:</p>
        <div className="overflow-x-auto my-4">
          <table><thead><tr><th>Archetype</th><th>Rule</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td className="text-[#00ff88] font-medium">Civilization Builder</td><td className="text-[#8899a8]">stewardship &ge; 80 AND reliability &ge; 70</td><td className="text-[#5c6b7a]">Builds infrastructure for others</td></tr>
              <tr><td className="text-[#00e5ff] font-medium">Trusted Trader</td><td className="text-[#8899a8]">commerce &ge; 80 AND reliability &ge; 70</td><td className="text-[#5c6b7a]">Reliable economic participant</td></tr>
              <tr><td className="text-[#a78bfa] font-medium">Diplomat</td><td className="text-[#8899a8]">diplomacy &ge; 75 AND volatility &lt; 30</td><td className="text-[#5c6b7a]">Brings people together peacefully</td></tr>
              <tr><td className="text-[#ff3d3d] font-medium">Warlord</td><td className="text-[#8899a8]">volatility &ge; 70 AND commerce &lt; 40</td><td className="text-[#5c6b7a]">Combat-focused, low trade</td></tr>
              <tr><td className="text-[#ff9800] font-medium">Wildcard</td><td className="text-[#8899a8]">50 &le; volatility &lt; 70</td><td className="text-[#5c6b7a]">Unpredictable behavior</td></tr>
              <tr><td className="text-[#5c6b7a] font-medium">Newcomer</td><td className="text-[#8899a8]">default</td><td className="text-[#5c6b7a]">Insufficient data for classification</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 id="chi" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Civilization Health Index (CHI)</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">The global CHI aggregates all system health scores into a single composite (0-100) using 6 weighted sub-indices:</p>

        <WeightChart title="CHI Sub-Index Weights" items={[
          { label: "Economic Vitality", weight: 20, color: "bg-blue-500" },
          { label: "Security Index", weight: 15, color: "bg-red-400" },
          { label: "Growth Rate", weight: 15, color: "bg-emerald-500" },
          { label: "Connectivity", weight: 15, color: "bg-cyan-500" },
          { label: "Trust Index", weight: 20, color: "bg-violet-500" },
          { label: "Social Cohesion", weight: 15, color: "bg-amber-500" },
        ]} />

        <CodeBlock language="typescript" filename="scoring.ts — Global CHI" code={`// Inputs: all system health scores from current cycle

economicVitality = avg(txFrequency) * 0.6 + avg(infraCount * 5) * 0.4
securityIndex    = clamp(100 - avg(combatIncidents) * 8)
growthRate       = (systemsWithActivity>50 / totalSystems) * 100
connectivity     = avg(activityLevel) * 1.1
trustIndex       = avg(trustLevel)
socialCohesion   = trustIndex * 0.4
                 + securityIndex * 0.3
                 + min(avg(playerCount) * 3, 100) * 0.3

// Weighted overall (matches on-chain):
overall = (
  economicVitality * 20 +
  securityIndex    * 15 +
  growthRate       * 15 +
  connectivity     * 15 +
  trustIndex       * 20 +
  socialCohesion   * 15
) / 100`} />

        <h3 id="diagnosis" className="text-lg font-semibold text-[#e2eaf2] mb-3 mt-6 scroll-mt-20">Diagnosis Thresholds</h3>
        <div className="overflow-x-auto my-4">
          <table><thead><tr><th>Score</th><th>Diagnosis</th><th>Meaning</th></tr></thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]">&ge; 80</td><td className="text-[#00ff88] font-medium">Flourishing</td><td className="text-[#5c6b7a]">Peak civilization — high activity, high trust, growing</td></tr>
              <tr><td className="text-[#e2eaf2]">&ge; 65</td><td className="text-[#00e5ff] font-medium">Thriving</td><td className="text-[#5c6b7a]">Strong and healthy, minor issues</td></tr>
              <tr><td className="text-[#e2eaf2]">&ge; 50</td><td className="text-[#8899a8] font-medium">Stable</td><td className="text-[#5c6b7a]">Functional but not exceptional</td></tr>
              <tr><td className="text-[#e2eaf2]">&ge; 35</td><td className="text-[#ff9800] font-medium">Stressed</td><td className="text-[#5c6b7a]">Cracks showing — trust or security concerns</td></tr>
              <tr><td className="text-[#e2eaf2]">&ge; 20</td><td className="text-[#ff6b35] font-medium">Declining</td><td className="text-[#5c6b7a]">Significant deterioration across metrics</td></tr>
              <tr><td className="text-[#e2eaf2]">&lt; 20</td><td className="text-[#ff3d3d] font-medium">Collapsing</td><td className="text-[#5c6b7a]">Civilization is failing</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 id="anomaly-detection" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Anomaly Detection</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">Each oracle cycle scans system scores against pattern rules. Alerts are emitted as on-chain events (not stored, for gas efficiency).</p>
        <div className="overflow-x-auto my-4">
          <table><thead><tr><th>Alert Type</th><th>Trigger Condition</th><th>Severity</th><th>On-Chain Code</th></tr></thead>
            <tbody>
              <tr><td className="text-[#ff3d3d] font-medium">Blackout</td><td className="text-[#8899a8]">infra &gt; 5 AND activity &lt; 10</td><td className="text-[#5c6b7a]">Critical (0)</td><td className="text-[#5c6b7a]">AnomalyAlertEmitted</td></tr>
              <tr><td className="text-[#ff9800] font-medium">Trust Collapse</td><td className="text-[#8899a8]">trust &lt; 20 AND players &gt; 5</td><td className="text-[#5c6b7a]">High (1)</td><td className="text-[#5c6b7a]">AnomalyAlertEmitted</td></tr>
              <tr><td className="text-[#00e5ff] font-medium">Combat Hotspot</td><td className="text-[#8899a8]">combatIncidents &gt; 8</td><td className="text-[#5c6b7a]">Medium (2)</td><td className="text-[#5c6b7a]">AnomalyAlertEmitted</td></tr>
              <tr><td className="text-[#00ff88] font-medium">Trade Spike</td><td className="text-[#8899a8]">tx &gt; 85 AND players &gt; 20</td><td className="text-[#5c6b7a]">Warning (3)</td><td className="text-[#5c6b7a]">AnomalyAlertEmitted</td></tr>
              <tr><td className="text-[#8899a8] font-medium">Infrastructure Hub</td><td className="text-[#8899a8]">infraCount &gt; 5</td><td className="text-[#5c6b7a]">Info (4)</td><td className="text-[#5c6b7a]">AnomalyAlertEmitted</td></tr>
            </tbody>
          </table>
        </div>
        <Callout variant="info">The frontend&apos;s <code>liveData.ts</code> also generates additional summary alerts (Population Center, Warzone, Civilization Core, Census Update) from aggregate statistics.</Callout>
      </section>

      <section>
        <h2 id="color-mapping" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Color Mapping</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">Trust scores map to a consistent color palette across all visualizations:</p>
        <TrustSpectrum />
        <CodeBlock language="typescript" filename="lib/colors.ts" code={`// Trust colors (galaxy nodes, compass, badges)
trust >= 70 → green  (#00ff88)  // Healthy
trust >= 40 → orange (#ff9800)  // Stressed
trust <  40 → red    (#ff3d3d)  // Hostile

// CHI gauge colors
score >= 70 → green  (#00ff88)
score >= 50 → cyan   (#00e5ff)
score >= 30 → orange (#ff9800)
score <  30 → red    (#ff3d3d)

// Alert severity colors
critical → #ff3d3d  |  high → #ff6b35  |  medium → #ff9800
warning  → #ffca28  |  info → #00e5ff`} />
      </section>
    </PageWrapper>
  );
}
