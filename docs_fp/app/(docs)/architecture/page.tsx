"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { ArchitectureDiagram } from "@/components/docs/architecture-diagram";
import { PipelineDiagram } from "@/components/docs/pipeline-diagram";

export default function ArchitecturePage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">Architecture</h1>
      <p className="page-desc text-[#5c6b7a] mb-8">
        How the frontend, oracle backend, and smart contract work together.
      </p>

      {/* Overview */}
      <section>
        <h2 id="overview" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Overview
        </h2>
        <p className="text-[#8899a8] leading-relaxed mb-4">
          Frontier Pulse follows a <strong className="text-[#e2eaf2]">three-tier architecture</strong> with
          two distinct data paths. The Oracle Backend acts as the intelligence layer &mdash; it reads raw game
          data from the World API, computes scores and reputation, then persists results on-chain. The Frontend
          reads from both the live World API and the on-chain PulseRegistry to render the dashboard.
        </p>
        <ArchitectureDiagram />
      </section>

      {/* Data Paths */}
      <section>
        <h2 id="data-paths" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Dual Data Paths
        </h2>

        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="rounded-xl border border-[rgba(0,255,136,0.15)] bg-[rgba(0,255,136,0.04)] p-5">
            <h3 className="text-sm font-semibold text-[#00ff88] mb-2">1. Oracle Path (Write)</h3>
            <ol className="text-xs text-[#5c6b7a] leading-relaxed space-y-2 list-decimal list-inside">
              <li>Oracle polls World API every 10 minutes</li>
              <li>Fetches all solar systems, smart assemblies, and killmails</li>
              <li>Computes system health, player reputation, global CHI, anomalies</li>
              <li>Writes results on-chain via batched Programmable Transaction Blocks</li>
            </ol>
          </div>
          <div className="rounded-xl border border-[rgba(0,229,255,0.15)] bg-[rgba(0,229,255,0.04)] p-5">
            <h3 className="text-sm font-semibold text-[#00e5ff] mb-2">2. Frontend Path (Read)</h3>
            <ol className="text-xs text-[#5c6b7a] leading-relaxed space-y-2 list-decimal list-inside">
              <li>Next.js API routes serve the dashboard</li>
              <li>Reads galaxy data from World API (24,502 systems)</li>
              <li>Reads CHI and scores from Sui RPC (PulseRegistry)</li>
              <li>Merges both sources with priority: on-chain &gt; live-computed &gt; fallback</li>
            </ol>
          </div>
        </div>

        <Callout variant="info">
          The dual-path design ensures the dashboard works even when the oracle is offline &mdash;
          the frontend can compute scores locally using the same deterministic hash function as the oracle.
        </Callout>
      </section>

      {/* Smart Contract */}
      <section>
        <h2 id="on-chain-layer" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          On-Chain Layer
        </h2>
        <p className="text-[#8899a8] leading-relaxed mb-4">
          The <code>PulseRegistry</code> is a <strong className="text-[#e2eaf2]">shared object</strong> on
          Sui Testnet that stores all civilization health data. Anyone can read; only authorized oracles can write.
        </p>
        <CodeBlock
          language="move"
          filename="frontier_pulse.move"
          code={`public struct PulseRegistry has key {
    id: UID,
    reputations: Table<address, PlayerReputation>,  // player → trust profile
    systems: Table<u64, SystemHealth>,               // system → health snapshot
    chi: CivilizationHealthIndex,                    // global composite score
    total_players: u64,
    total_systems: u64,
    last_updated_ms: u64,
    endorsement_counts: Table<u64, u64>,             // user-driven signals
    endorsement_records: Table<vector<u8>, bool>,
}`}
        />

        <h3 id="capability-model" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">
          Capability Model
        </h3>
        <p className="text-[#8899a8] leading-relaxed mb-4">
          Write access is controlled by a two-tier capability system following Sui&apos;s object-centric security:
        </p>
        <div className="overflow-x-auto mb-6">
          <table>
            <thead>
              <tr>
                <th>Capability</th>
                <th>Holder</th>
                <th>Powers</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code className="text-[#a78bfa]">AdminCap</code></td>
                <td className="text-[#5c6b7a]">Deployer (auto-transferred at publish)</td>
                <td className="text-[#5c6b7a]">Issue OracleCap to backend services</td>
              </tr>
              <tr>
                <td><code className="text-[#00e5ff]">OracleCap</code></td>
                <td className="text-[#5c6b7a]">Oracle backend wallet</td>
                <td className="text-[#5c6b7a]">Write system health, player reputation, CHI, alerts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Data Flow Pipeline */}
      <section>
        <h2 id="data-pipeline" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Data Pipeline
        </h2>
        <p className="text-[#8899a8] leading-relaxed mb-4">
          Each oracle cycle follows this sequential pipeline:
        </p>
        <PipelineDiagram />
      </section>

      {/* Deployed Contracts */}
      <section>
        <h2 id="deployed-contracts" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Deployed Contracts
        </h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>ID / URL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-[#e2eaf2]">Package</td>
                <td><code className="text-xs">0x6618...bbc9</code></td>
              </tr>
              <tr>
                <td className="text-[#e2eaf2]">PulseRegistry</td>
                <td><code className="text-xs">0x945f...32c4</code></td>
              </tr>
              <tr>
                <td className="text-[#e2eaf2]">Network</td>
                <td className="text-[#5c6b7a]">Sui Testnet</td>
              </tr>
              <tr>
                <td className="text-[#e2eaf2]">RPC</td>
                <td><code className="text-xs">https://fullnode.testnet.sui.io:443</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </PageWrapper>
  );
}
