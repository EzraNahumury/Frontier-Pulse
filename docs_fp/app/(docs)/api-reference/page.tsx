"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

function Endpoint({
  method,
  path,
  description,
  children,
}: {
  method: string;
  path: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[rgba(0,229,255,0.08)] bg-space-900 p-5 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[rgba(0,255,136,0.08)] text-[#00ff88] border border-[rgba(0,255,136,0.15)]">
          {method}
        </span>
        <code className="text-sm text-[#e2eaf2] font-mono">{path}</code>
      </div>
      <p className="text-sm text-[#5c6b7a] mb-3">{description}</p>
      {children}
    </div>
  );
}

export default function ApiReferencePage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">API Reference</h1>
      <p className="page-desc text-[#5c6b7a] mb-8">
        All Next.js API routes served by the Frontier Pulse frontend.
      </p>

      <Callout variant="info">
        All routes use <code>force-dynamic</code> rendering. Data priority:{" "}
        <strong>on-chain (Sui)</strong> → <strong>live World API</strong> → <strong>computed fallback</strong>.
      </Callout>

      {/* Universe */}
      <section>
        <h2 id="universe" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Universe
        </h2>
        <Endpoint method="GET" path="/api/universe" description="Returns all solar systems with CHI data. Supports tiered loading.">
          <div className="text-xs text-[#5c6b7a] space-y-1 mb-3">
            <p><strong className="text-[#8899a8]">Query params:</strong></p>
            <p><code>tier=hot</code> — Only active systems + CHI (small, fast payload)</p>
            <p><code>tier=remaining</code> — All remaining non-active systems</p>
            <p><code>(none)</code> — Full dataset (backward compatible)</p>
          </div>
          <CodeBlock
            language="json"
            filename="Response"
            code={`{
  "systems": [
    { "id": 30000001, "name": "Tanoo", "constellation": "San Matar", "region": "Derelik", "nx": 0.42, "ny": 0.78, "depth": 0.55 }
  ],
  "chi": { "overallScore": 62, "diagnosis": "Thriving", "economicVitality": 71, "securityIndex": 58, "growthRate": 65, "connectivity": 60, "trustIndex": 68, "socialCohesion": 55 },
  "totalSystems": 24502
}`}
          />
        </Endpoint>
      </section>

      {/* CHI */}
      <section>
        <h2 id="chi" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Civilization Health Index
        </h2>
        <Endpoint method="GET" path="/api/chi" description="Returns the global CHI with all 6 sub-indices. Reads from on-chain PulseRegistry first, falls back to live computation.">
          <CodeBlock
            language="json"
            filename="Response"
            code={`{
  "overallScore": 62,
  "diagnosis": "Thriving",
  "economicVitality": 71,
  "securityIndex": 58,
  "growthRate": 65,
  "connectivity": 60,
  "trustIndex": 68,
  "socialCohesion": 55,
  "lastUpdated": "2026-03-30T08:10:00Z"
}`}
          />
        </Endpoint>
      </section>

      {/* System */}
      <section>
        <h2 id="system" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          System Detail
        </h2>
        <Endpoint method="GET" path="/api/system/:id" description="Returns detailed state for a single solar system including computed vitals and player list.">
          <CodeBlock
            language="json"
            filename="Response"
            code={`{
  "system": { "id": 30000001, "name": "Tanoo", "constellation": "San Matar", "region": "Derelik" },
  "vitals": { "activityLevel": 72, "trustLevel": 85, "playerCount": 14, "infrastructureCount": 6, "txFrequency": 45, "combatIncidents": 2, "localChi": 80 },
  "gateLinks": [{ "fromSystem": 30000001, "toSystem": 30000002 }],
  "players": ["0x1a2b...3c4d", "0x5e6f...7g8h"]
}`}
          />
        </Endpoint>

        <Endpoint method="GET" path="/api/world/system/:id" description="Proxy to World API — returns raw system detail with computed vitals and gate connections.">
          <p className="text-xs text-[#5c6b7a]">Used by SystemPanel for live gate link data.</p>
        </Endpoint>
      </section>

      {/* Player */}
      <section>
        <h2 id="player" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Player Reputation
        </h2>
        <Endpoint method="GET" path="/api/player/:address" description="Returns Trust Compass profile for a player by Sui address.">
          <CodeBlock
            language="json"
            filename="Response"
            code={`{
  "address": "0x1a2b...3c4d",
  "reputation": { "reliability": 82, "commerce": 75, "diplomacy": 68, "stewardship": 90, "volatility": 15, "compositeScore": 78, "archetype": "Civilization Builder" },
  "systems": [30000001, 30000142],
  "endorsements": 3
}`}
          />
        </Endpoint>

        <Endpoint method="GET" path="/api/player/:address/systems" description="Returns the list of systems associated with a player address." />
      </section>

      {/* Alerts */}
      <section>
        <h2 id="alerts" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Anomaly Alerts
        </h2>
        <Endpoint method="GET" path="/api/alerts" description="Returns the anomaly alert feed detected by the oracle.">
          <CodeBlock
            language="json"
            filename="Response"
            code={`{
  "alerts": [
    { "id": "alert_001", "type": "trust_collapse", "systemId": 30004521, "systemName": "Amamake", "severity": "high", "message": "Trust dropped below 20 with 12 active players", "timestamp": "2026-03-30T07:50:00Z" }
  ]
}`}
          />
        </Endpoint>
      </section>

      {/* Transactions */}
      <section>
        <h2 id="transactions" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Transaction Log
        </h2>
        <Endpoint method="GET" path="/api/transactions" description="Returns recent oracle transactions from the Sui blockchain, filtered by package ID.">
          <CodeBlock
            language="json"
            filename="Response"
            code={`{
  "transactions": [
    { "digest": "ABC123...", "timestamp": "2026-03-30T08:10:00Z", "sender": "0xoracle...", "type": "system_health_update", "function": "update_system_health", "gasUsed": 1250000 }
  ]
}`}
          />
        </Endpoint>
      </section>

      {/* Pulse Card */}
      <section>
        <h2 id="pulse-card" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Pulse Card
        </h2>
        <Endpoint method="GET" path="/api/pulse-card/:systemId" description="Returns a generated SVG snapshot image for sharing on social media.">
          <div className="text-xs text-[#5c6b7a] space-y-1">
            <p><strong className="text-[#8899a8]">Content-Type:</strong> <code>image/svg+xml</code></p>
            <p><strong className="text-[#8899a8]">Size:</strong> 600 x 315px (Twitter card optimized)</p>
            <p><strong className="text-[#8899a8]">Cache:</strong> <code>max-age=300</code> (5 minutes)</p>
            <p>Includes system name, trust badge, CHI score, vital bars, player stats, and Frontier Pulse branding.</p>
          </div>
        </Endpoint>
      </section>

      {/* Data Sources */}
      <section>
        <h2 id="data-sources" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Data Sources
        </h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Source</th><th>Endpoint</th><th>Used For</th></tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-[#e2eaf2]">World API</td>
                <td><code className="text-xs">/v2/solarsystems</code></td>
                <td className="text-[#5c6b7a]">24,502 solar systems with 3D coords</td>
              </tr>
              <tr>
                <td className="text-[#e2eaf2]">World API</td>
                <td><code className="text-xs">/v2/smartassemblies</code></td>
                <td className="text-[#5c6b7a]">Infrastructure mapping</td>
              </tr>
              <tr>
                <td className="text-[#e2eaf2]">World API</td>
                <td><code className="text-xs">/v2/killmails</code></td>
                <td className="text-[#5c6b7a]">Combat analysis</td>
              </tr>
              <tr>
                <td className="text-[#e2eaf2]">Sui RPC</td>
                <td><code className="text-xs">sui_getObject</code></td>
                <td className="text-[#5c6b7a]">Read PulseRegistry (CHI, scores)</td>
              </tr>
              <tr>
                <td className="text-[#e2eaf2]">Sui RPC</td>
                <td><code className="text-xs">suix_queryTransactionBlocks</code></td>
                <td className="text-[#5c6b7a]">Transaction log display</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </PageWrapper>
  );
}
