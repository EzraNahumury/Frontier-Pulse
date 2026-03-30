"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { FlowSteps, WeightChart } from "@/components/docs/visuals";

export default function SmartContractPage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">Smart Contract</h1>
      <p className="page-desc text-[#5c6b7a] mb-8">
        The Sui Move smart contract that stores civilization health data on-chain.
      </p>

      {/* Overview */}
      <section>
        <h2 id="overview" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Overview
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          The <code>frontier_pulse</code> module is written in <strong className="text-[#e2eaf2]">Sui Move (edition 2024)</strong>{" "}
          and deployed to Sui Testnet. It provides the on-chain data layer for Frontier Pulse, storing player
          reputation profiles, star system health snapshots, and the global Civilization Health Index.
        </p>
        <Callout variant="info">
          Data is written by the authorized oracle backend and can be read by anyone &mdash;
          enabling other dApps to make trust-based decisions using Frontier Pulse data.
        </Callout>

        <FlowSteps title="Module Initialization Flow" steps={[
          { label: "Package Published", detail: "sui client publish deploys the frontier_pulse module to Sui", color: "bg-blue-500", icon: "1" },
          { label: "AdminCap → Deployer", detail: "init() creates AdminCap and transfers to deployer wallet", color: "bg-violet-500", icon: "2" },
          { label: "PulseRegistry Shared", detail: "init() creates PulseRegistry as a shared object (public read)", color: "bg-emerald-500", icon: "3" },
          { label: "Issue OracleCap", detail: "Admin calls issue_oracle_cap() to authorize the oracle backend", color: "bg-amber-500", icon: "4" },
          { label: "Oracle Writes Data", detail: "Oracle uses OracleCap to write system health, reputation, CHI, alerts", color: "bg-red-400", icon: "5" },
        ]} />
      </section>

      {/* Core Structs */}
      <section>
        <h2 id="core-structs" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Core Structs
        </h2>

        <h3 id="player-reputation" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">PlayerReputation</h3>
        <p className="text-[#8899a8] text-sm mb-3">
          5-dimension behavioral profile stored per player address:
        </p>
        <CodeBlock
          language="move"
          filename="frontier_pulse.move"
          code={`public struct PlayerReputation has store, drop, copy {
    player: address,
    reliability: u64,       // 0-100: "Can they be counted on?"
    commerce: u64,          // 0-100: "Honest in deals?"
    diplomacy: u64,         // 0-100: "Brings people together?"
    stewardship: u64,       // 0-100: "Builds for others?"
    volatility: u64,        // 0-100: "Could they betray?" (lower = safer)
    composite_score: u64,   // Weighted trust score
    archetype: String,      // e.g. "Trusted Trader", "Warlord"
    update_count: u64,
    last_updated_ms: u64,
}`}
        />

        <h3 id="system-health" className="text-lg font-semibold mb-3 mt-6 scroll-mt-20">SystemHealth</h3>
        <CodeBlock
          language="move"
          filename="frontier_pulse.move"
          code={`public struct SystemHealth has store, drop, copy {
    system_id: u64,
    activity_level: u64,        // 0-100
    trust_level: u64,           // 0-100
    player_count: u64,
    infrastructure_count: u64,
    tx_frequency: u64,          // 0-100
    combat_incidents: u64,
    local_chi: u64,             // (activity * 40 + trust * 60) / 100
    last_updated_ms: u64,
}`}
        />

        <h3 id="chi-struct" className="text-lg font-semibold mb-3 mt-6 scroll-mt-20">CivilizationHealthIndex</h3>
        <CodeBlock
          language="move"
          filename="frontier_pulse.move"
          code={`public struct CivilizationHealthIndex has store, drop, copy {
    overall_score: u64,       // 0-100: weighted composite
    economic_vitality: u64,   // Trade volume, market diversity
    security_index: u64,      // Inverse of kill rate
    growth_rate: u64,         // Territory expansion
    connectivity: u64,        // Gate network density
    trust_index: u64,         // Average reputation scores
    social_cohesion: u64,     // Cross-group cooperation
    diagnosis: String,        // e.g. "Flourishing", "Stressed"
    last_calculated_ms: u64,
}`}
        />
      </section>

      {/* Composite Score Formula */}
      <section>
        <h2 id="formulas" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          On-Chain Formulas
        </h2>

        <h3 id="trust-formula" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">Composite Trust Score</h3>
        <CodeBlock
          language="move"
          filename="frontier_pulse.move"
          code={`// Weights: R=25, C=25, D=20, S=20, InvV=10 (total = 100)
fun calculate_composite_score(
    reliability: u64, commerce: u64, diplomacy: u64,
    stewardship: u64, volatility: u64,
): u64 {
    let inv_volatility = MAX_SCORE - volatility; // invert: low volatility = good
    (
        reliability * 25 +
        commerce * 25 +
        diplomacy * 20 +
        stewardship * 20 +
        inv_volatility * 10
    ) / 100
}`}
        />

        <WeightChart title="On-Chain Trust Composite Weights" items={[
          { label: "Reliability", weight: 25, color: "bg-blue-500" },
          { label: "Commerce", weight: 25, color: "bg-cyan-500" },
          { label: "Diplomacy", weight: 20, color: "bg-violet-500" },
          { label: "Stewardship", weight: 20, color: "bg-emerald-500" },
          { label: "Inv. Volatility", weight: 10, color: "bg-amber-500" },
        ]} />

        <h3 id="chi-formula" className="text-lg font-semibold text-[#e2eaf2] mb-3 mt-6 scroll-mt-20">CHI Overall Score</h3>
        <CodeBlock
          language="move"
          filename="frontier_pulse.move"
          code={`// Weights: E=20, Sec=15, G=15, C=15, T=20, Soc=15 (total = 100)
fun calculate_chi_overall(
    economic: u64, security: u64, growth: u64,
    connectivity: u64, trust: u64, social: u64,
): u64 {
    (
        economic * 20 + security * 15 + growth * 15 +
        connectivity * 15 + trust * 20 + social * 15
    ) / 100
}`}
        />
      </section>

      {/* Write Functions */}
      <section>
        <h2 id="write-functions" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Oracle Write Functions
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          All write functions require an <code>OracleCap</code> reference. They validate scores (0-100 range),
          compute derived values on-chain, and emit events for real-time subscribers.
        </p>
        <div className="overflow-x-auto my-4">
          <table>
            <thead>
              <tr><th>Function</th><th>Purpose</th><th>Event</th></tr>
            </thead>
            <tbody>
              <tr><td><code className="text-[#00e5ff] text-xs">update_player_reputation</code></td><td className="text-[#5c6b7a]">Create/update player Trust Compass</td><td className="text-[#5c6b7a]">ReputationUpdated</td></tr>
              <tr><td><code className="text-[#00e5ff] text-xs">update_system_health</code></td><td className="text-[#5c6b7a]">Create/update system health snapshot</td><td className="text-[#5c6b7a]">SystemHealthUpdated</td></tr>
              <tr><td><code className="text-[#00e5ff] text-xs">update_global_chi</code></td><td className="text-[#5c6b7a]">Update global CHI composite</td><td className="text-[#5c6b7a]">CHIUpdated</td></tr>
              <tr><td><code className="text-[#00e5ff] text-xs">emit_anomaly_alert</code></td><td className="text-[#5c6b7a]">Emit anomaly alert event</td><td className="text-[#5c6b7a]">AnomalyAlertEmitted</td></tr>
              <tr><td><code className="text-[#00e5ff] text-xs">remove_player_reputation</code></td><td className="text-[#5c6b7a]">Delete player from registry</td><td className="text-[#5c6b7a]">ReputationRemoved</td></tr>
              <tr><td><code className="text-[#00e5ff] text-xs">remove_system</code></td><td className="text-[#5c6b7a]">Delete system from registry</td><td className="text-[#5c6b7a]">&mdash;</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Read Functions */}
      <section>
        <h2 id="read-functions" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Public Read Functions
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          These functions are callable by any contract or off-chain reader. No capabilities required.
        </p>
        <div className="overflow-x-auto my-4">
          <table>
            <thead>
              <tr><th>Function</th><th>Returns</th></tr>
            </thead>
            <tbody>
              <tr><td><code className="text-[#00ff88] text-xs">get_reputation</code></td><td className="text-[#5c6b7a]">(reliability, commerce, diplomacy, stewardship, volatility, composite)</td></tr>
              <tr><td><code className="text-[#00ff88] text-xs">get_composite_score</code></td><td className="text-[#5c6b7a]">u64 &mdash; single composite trust score</td></tr>
              <tr><td><code className="text-[#00ff88] text-xs">get_archetype</code></td><td className="text-[#5c6b7a]">String &mdash; player archetype label</td></tr>
              <tr><td><code className="text-[#00ff88] text-xs">meets_trust_threshold</code></td><td className="text-[#5c6b7a]">bool &mdash; true if composite &ge; min_score</td></tr>
              <tr><td><code className="text-[#00ff88] text-xs">get_system_health</code></td><td className="text-[#5c6b7a]">(activity, trust, players, local_chi)</td></tr>
              <tr><td><code className="text-[#00ff88] text-xs">get_chi_overall</code></td><td className="text-[#5c6b7a]">u64 &mdash; global CHI score</td></tr>
              <tr><td><code className="text-[#00ff88] text-xs">get_chi_details</code></td><td className="text-[#5c6b7a]">(overall, economic, security, growth, connectivity, trust, social)</td></tr>
              <tr><td><code className="text-[#00ff88] text-xs">compare_trust</code></td><td className="text-[#5c6b7a]">(player_a_score, player_b_score)</td></tr>
            </tbody>
          </table>
        </div>

        <Callout variant="tip" title="Integration">
          Other dApps can use <code>meets_trust_threshold(registry, player, 60)</code> to gate
          access based on Frontier Pulse trust scores &mdash; e.g., requiring a minimum trust
          level for marketplace trades or alliance membership.
        </Callout>
      </section>

      {/* Endorsements */}
      <section>
        <h2 id="endorsements" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          System Endorsements
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          Any wallet holder can endorse a star system on-chain &mdash; a user-driven trust signal.
          Each wallet can only endorse each system once (anti-spam via BCS key deduplication).
        </p>
        <CodeBlock
          language="move"
          filename="frontier_pulse.move"
          code={`entry fun endorse_system(
    registry: &mut PulseRegistry,
    clock: &Clock,
    system_id: u64,
    ctx: &TxContext,
) {
    assert!(registry.systems.contains(system_id), ESystemNotFound);

    // Build unique key: sender bytes + system_id bytes
    let mut key = bcs::to_bytes(&ctx.sender());
    key.append(bcs::to_bytes(&system_id));

    assert!(!registry.endorsement_records.contains(key), EAlreadyEndorsed);
    registry.endorsement_records.add(key, true);
    // ... increment count, emit SystemEndorsed event
}`}
        />
      </section>
    </PageWrapper>
  );
}
