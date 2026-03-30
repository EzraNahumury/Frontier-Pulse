"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { FlowSteps, ScoreCard, WeightChart, StatGrid } from "@/components/docs/visuals";

export default function OraclePage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">Oracle Backend</h1>
      <p className="page-desc text-[#5c6b7a] mb-8">
        The scoring engine that reads World API data, computes civilization health, and writes on-chain.
      </p>

      {/* Overview */}
      <section>
        <h2 id="overview" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Overview
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          The Oracle Backend is a Node.js service that runs on a 10-minute cron cycle.
          Each cycle follows a three-phase pipeline: <strong className="text-[#e2eaf2]">Ingest</strong> game data,{" "}
          <strong className="text-[#e2eaf2]">Process</strong> scores, and <strong className="text-[#e2eaf2]">Write</strong>{" "}
          results to the Sui blockchain via batched Programmable Transaction Blocks.
        </p>

        <FlowSteps title="Oracle Cycle Pipeline" steps={[
          { label: "Fetch Systems", detail: "GET /v2/solarsystems — all 24,502 systems (parallel paginated)", color: "bg-blue-500", icon: "1" },
          { label: "Enrich Data", detail: "GET /v2/smartassemblies + /v2/killmails — infrastructure + combat", color: "bg-blue-500", icon: "2" },
          { label: "Score Systems", detail: "computeSystemHealth() — activity, trust, infra, combat per system", color: "bg-emerald-500", icon: "3" },
          { label: "Score Players", detail: "computePlayerReputation() — 5 dimensions + archetype per player", color: "bg-emerald-500", icon: "4" },
          { label: "Compute CHI", detail: "computeGlobalCHI() — 6 sub-indices → overall score + diagnosis", color: "bg-violet-500", icon: "5" },
          { label: "Detect Anomalies", detail: "detectAnomalies() — pattern matching for blackouts, trust collapses, etc.", color: "bg-amber-500", icon: "6" },
          { label: "Write On-Chain", detail: "Batched PTBs (50/batch) → PulseRegistry on Sui Testnet", color: "bg-red-400", icon: "7" },
        ]} />
        <CodeBlock
          filename="src/index.ts — Cycle Overview"
          code={`async function runCycle() {
  // 1. Fetch solar systems from World API
  const systems = await fetchAllSystems();

  // 2. Enrich with smart assembly + killmail data
  const enrichment = await enrichSystems(systems);

  // 3. Compute system health scores (up to 500 per cycle)
  const systemScores = systemSubset.map(sys =>
    computeSystemHealth(sys, enrichment.get(sys.id))
  );

  // 4. Detect anomalies
  const alerts = detectAnomalies(systemScores, systemNames);

  // 5. Compute global CHI
  const chi = computeGlobalCHI(systemScores);

  // 6. Compute player reputations from enrichment
  const playerScores = computePlayerReputation(addr, stats);

  // 7. Write to Sui in batches (50 per tx)
  await writeSystemHealthBatch(oracleCapId, batch);
  await writePlayerReputationBatch(oracleCapId, batch);
  await writeGlobalCHI(oracleCapId, chi);
  await emitAlertsBatch(oracleCapId, alerts);
}`}
        />
      </section>

      {/* System Health Scoring */}
      <section>
        <h2 id="system-health" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          System Health Scoring
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          Each star system receives a health snapshot based on observable data. When real enrichment data
          (smart assemblies, killmails) is available, it&apos;s used. Otherwise, a deterministic hash function
          provides consistent fallback scores.
        </p>

        <h3 id="real-data-path" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">Real Data Path</h3>
        <CodeBlock
          language="typescript"
          filename="src/scoring.ts"
          code={`// Inputs from World API enrichment:
const playerCount = enrichment.activePlayerAddresses.size;
const infraCount  = enrichment.smartAssemblyCount;
const kills       = enrichment.recentKills;

// Activity: weighted combination of players, infrastructure, combat
const playerScore = Math.min(playerCount * 5, 100);
const infraScore  = Math.min(infraCount * 3, 100);
const combatScore = Math.min(kills * 8, 100);
const activityLevel = clamp(
  playerScore * 0.4 + infraScore * 0.35 + combatScore * 0.25
);

// Trust: inverse of combat ratio, boosted by infrastructure
const combatRatio = playerCount > 0 ? kills / playerCount : 0;
const baseTrust   = clamp(100 - combatRatio * 50);
const infraBoost  = Math.min(infraCount * 2, 20);
const trustLevel  = clamp(baseTrust + infraBoost);

// Local CHI: 40% activity + 60% trust
const localChi = Math.floor(
  (activityLevel * 40 + trustLevel * 60) / 100
);`}
        />

        <Callout variant="info" title="Deterministic Fallback">
          For systems without enrichment data, a seeded hash function generates consistent pseudo-random
          scores per system ID. The same algorithm runs in both the oracle (<code>scoring.ts</code>) and
          frontend (<code>vitals.ts</code>) for display consistency.
        </Callout>
      </section>

      {/* Player Reputation */}
      <section>
        <h2 id="player-reputation" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Player Reputation (Agora Engine)
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          The Agora Engine computes 5 behavioral dimensions from observable on-chain activity:
        </p>
        <CodeBlock
          language="typescript"
          filename="src/scoring.ts"
          code={`// Inputs: assemblyCount, killCount, deathCount, systemsVisited

reliability  = clamp(40 + assemblyCount * 5 + systemsVisited * 2)
commerce     = clamp(30 + assemblyCount * 8)
diplomacy    = clamp(50 - aggressionRatio * 40 + systemsVisited * 3)
stewardship  = clamp(20 + assemblyCount * 10)
volatility   = clamp(totalCombat * 5 + |kills - deaths| * 3)

// Archetype classification (first match):
Civilization Builder → stewardship >= 80 && reliability >= 70
Trusted Trader      → commerce >= 80 && reliability >= 70
Diplomat            → diplomacy >= 75 && volatility < 30
Warlord             → volatility >= 70 && commerce < 40
Wildcard            → volatility >= 50 && volatility < 70
Newcomer            → default`}
        />
      </section>

      {/* Global CHI */}
      <section>
        <h2 id="chi-calculation" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Global CHI Calculation
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          The Civilization Health Index aggregates all system health scores into a single composite score (0-100)
          using 6 weighted sub-indices:
        </p>
        <CodeBlock
          language="typescript"
          filename="src/scoring.ts"
          code={`// Sub-index computation (from all system scores):
economicVitality = avg(txFrequency) * 0.6 + avg(infraCount * 5) * 0.4
securityIndex    = clamp(100 - avg(combatIncidents) * 8)
growthRate       = (activeSystems / totalSystems) * 100
connectivity     = avg(activityLevel) * 1.1
trustIndex       = avg(trustLevel)
socialCohesion   = trustIndex * 0.4 + securityIndex * 0.3
                 + avg(playerCount) * 3 * 0.3

// Weighted overall (matches smart contract formula):
overall = (
  economicVitality * 20 +
  securityIndex    * 15 +
  growthRate       * 15 +
  connectivity     * 15 +
  trustIndex       * 20 +
  socialCohesion   * 15
) / 100

// Diagnosis thresholds:
// ≥ 80 Flourishing | ≥ 65 Thriving  | ≥ 50 Stable
// ≥ 35 Stressed    | ≥ 20 Declining | < 20 Collapsing`}
        />
      </section>

      {/* Anomaly Detection */}
      <section>
        <h2 id="anomaly-detection" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Anomaly Detection
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          Each cycle, the oracle scans system scores for unusual patterns and emits alerts as on-chain events:
        </p>
        <div className="overflow-x-auto my-4">
          <table>
            <thead>
              <tr><th>Alert Type</th><th>Trigger</th><th>Severity</th></tr>
            </thead>
            <tbody>
              <tr><td className="text-[#ff3d3d]">Blackout</td><td className="text-[#5c6b7a]">infra &gt; 5 but activity &lt; 10</td><td className="text-[#5c6b7a]">Critical (0)</td></tr>
              <tr><td className="text-[#ff9800]">Trust Collapse</td><td className="text-[#5c6b7a]">trust &lt; 20 with players &gt; 5</td><td className="text-[#5c6b7a]">High (1)</td></tr>
              <tr><td className="text-[#00e5ff]">Combat Hotspot</td><td className="text-[#5c6b7a]">combat incidents &gt; 8</td><td className="text-[#5c6b7a]">Medium (2)</td></tr>
              <tr><td className="text-[#00ff88]">Trade Spike</td><td className="text-[#5c6b7a]">tx &gt; 85 with players &gt; 20</td><td className="text-[#5c6b7a]">Warning (3)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Sui Writer */}
      <section>
        <h2 id="sui-writer" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          On-Chain Writer
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          The <code>suiWriter.ts</code> module handles all blockchain interactions using the Sui TypeScript SDK.
          Scores are written via <strong className="text-[#e2eaf2]">Programmable Transaction Blocks (PTBs)</strong>,
          which bundle multiple Move calls into a single transaction for gas efficiency.
        </p>
        <CodeBlock
          language="typescript"
          filename="src/suiWriter.ts — Batch Write Example"
          code={`export async function writeSystemHealthBatch(
  oracleCapId: string,
  scores: SystemHealthScore[],
): Promise<string> {
  const tx = new Transaction();

  for (const s of scores) {
    tx.moveCall({
      target: target("update_system_health"),
      arguments: [
        tx.object(oracleCapId),
        tx.object(config.registryId),
        tx.object(SUI_CLOCK),
        tx.pure.u64(BigInt(s.systemId)),
        tx.pure.u64(BigInt(s.activityLevel)),
        tx.pure.u64(BigInt(s.trustLevel)),
        tx.pure.u64(BigInt(s.playerCount)),
        tx.pure.u64(BigInt(s.infrastructureCount)),
        tx.pure.u64(BigInt(s.txFrequency)),
        tx.pure.u64(BigInt(s.combatIncidents)),
      ],
    });
  }

  return await signAndExecute(tx);
}`}
        />
        <Callout variant="tip">
          The oracle batches writes at 50 systems per transaction to stay within gas limits.
          Private key supports three formats: Bech32 (<code>suiprivkey1...</code>), hex, and base64.
        </Callout>
      </section>
    </PageWrapper>
  );
}
