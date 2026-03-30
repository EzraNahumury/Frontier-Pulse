"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { DataFlowDiagram, StatGrid } from "@/components/docs/visuals";

export default function DataSourcesPage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">Data Sources</h1>
      <p className="page-desc text-[#5c6b7a] mb-8">The external APIs and blockchain data that power Frontier Pulse.</p>

      <DataFlowDiagram />

      <StatGrid stats={[
        { label: "Solar Systems", value: "24,502", sub: "from World API" },
        { label: "Refresh Rate", value: "10 min", sub: "oracle cycle" },
        { label: "Cache TTL", value: "5 min", sub: "live data" },
        { label: "Batch Size", value: "50", sub: "per PTB transaction" },
      ]} />

      <section>
        <h2 id="world-api" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">EVE Frontier World API</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">The World API is the primary source of game state. Base URL: <code>https://world-api-stillness.live.tech.evefrontier.com</code></p>

        <div className="overflow-x-auto my-4">
          <table><thead><tr><th>Endpoint</th><th>Data</th><th>Used For</th></tr></thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]"><code>GET /v2/solarsystems</code></td><td className="text-[#8899a8]">24,502 systems with 3D coords, constellation, region</td><td className="text-[#5c6b7a]">Galaxy map rendering, system enumeration</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>GET /v2/solarsystems/:id</code></td><td className="text-[#8899a8]">Single system detail + gate links</td><td className="text-[#5c6b7a]">Deep dive panel, constellation neighbors</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>GET /v2/smartassemblies</code></td><td className="text-[#8899a8]">All deployed Smart Assemblies (gates, SSUs, turrets)</td><td className="text-[#5c6b7a]">Infrastructure mapping, stewardship scoring</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>GET /v2/killmails</code></td><td className="text-[#8899a8]">PvP kill records (attacker, victim, system, timestamp)</td><td className="text-[#5c6b7a]">Combat analysis, volatility scoring</td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="pagination" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">Pagination Strategy</h3>
        <p className="text-[#8899a8] text-sm mb-3">All paginated endpoints support <code>?limit=N&amp;offset=M</code> and return <code>metadata.total</code>. Frontier Pulse uses parallel page fetching for speed:</p>
        <CodeBlock language="typescript" filename="worldApi.ts" code={`// 1. Probe for total count
const probe = await fetch(\`\${BASE}/v2/solarsystems?limit=1&offset=0\`);
const total = (await probe.json()).metadata.total;  // → 24502

// 2. Fetch all pages in parallel (1000 per page)
const pages = Math.ceil(total / 1000);  // → 25 pages
const fetches = Array.from({ length: pages }, (_, i) =>
  fetch(\`\${BASE}/v2/solarsystems?limit=1000&offset=\${i * 1000}\`)
    .then(r => r.json())
    .then(d => d.data)
);
const all = (await Promise.all(fetches)).flat();  // → 24502 systems`} />

        <h3 id="normalization" className="text-lg font-semibold text-[#e2eaf2] mb-3 mt-6 scroll-mt-20">Coordinate Normalization</h3>
        <p className="text-[#8899a8] text-sm mb-3">World API provides 3D coordinates (x, y, z). The frontend normalizes these to 0-1 range for Canvas rendering:</p>
        <CodeBlock language="typescript" filename="worldApi.ts" code={`// Find bounds across all systems
for (const s of all) {
  minX = min(minX, s.location.x);  maxX = max(maxX, s.location.x);
  minZ = min(minZ, s.location.z);  maxZ = max(maxZ, s.location.z);
  minY = min(minY, s.location.y);  maxY = max(maxY, s.location.y);
}

// Normalize with 3% padding
nx    = 0.03 + ((x - minX) / rangeX) * 0.94   // → horizontal position
ny    = 0.03 + ((z - minZ) / rangeZ) * 0.94   // → vertical position
depth = (y - minY) / rangeY                     // → parallax/sizing`} />
      </section>

      <section>
        <h2 id="sui-blockchain" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Sui Blockchain</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">On-chain data is read via Sui JSON-RPC and written via the Sui TypeScript SDK.</p>

        <div className="overflow-x-auto my-4">
          <table><thead><tr><th>Method</th><th>Data</th><th>Used By</th></tr></thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]"><code>sui_getObject</code></td><td className="text-[#8899a8]">PulseRegistry shared object (CHI, player count, system count, timestamps)</td><td className="text-[#5c6b7a]">Frontend suiReader.ts</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>suix_queryTransactionBlocks</code></td><td className="text-[#8899a8]">Oracle transaction history filtered by package ID</td><td className="text-[#5c6b7a]">Transaction log page</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>signAndExecuteTransaction</code></td><td className="text-[#8899a8]">Batched PTBs for system health, reputation, CHI, alerts</td><td className="text-[#5c6b7a]">Oracle suiWriter.ts</td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="on-chain-reading" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">Reading On-Chain Data</h3>
        <CodeBlock language="typescript" filename="lib/suiReader.ts" code={`const SUI_RPC = "https://fullnode.testnet.sui.io:443";
const REGISTRY_ID = "0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4";

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(SUI_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return (await res.json()).result as T;
}

// Read CHI + registry stats
const result = await rpc("sui_getObject", [
  REGISTRY_ID,
  { showContent: true },
]);
const fields = result.data?.content?.fields;
// → fields.chi.fields.overall_score, fields.total_players, etc.`} />
      </section>

      <section>
        <h2 id="data-priority" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Data Priority Chain</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">The frontend uses a three-tier fallback strategy for every data request:</p>
        <div className="space-y-2 my-4">
          <div className="flex items-center gap-3 rounded-lg border border-[rgba(0,229,255,0.15)] bg-[rgba(0,229,255,0.06)] px-4 py-3"><span className="text-[#00e5ff] font-bold text-sm w-5">1</span><span className="text-sm text-[#8899a8]"><strong className="text-[#e2eaf2]">On-chain (Sui)</strong> — Read from PulseRegistry via JSON-RPC. Most authoritative.</span></div>
          <div className="flex items-center gap-3 rounded-lg border border-[rgba(0,255,136,0.15)] bg-[rgba(0,255,136,0.06)] px-4 py-3"><span className="text-[#00ff88] font-bold text-sm w-5">2</span><span className="text-sm text-[#8899a8]"><strong className="text-[#e2eaf2]">Live-computed</strong> — Fetch World API data and compute scores locally using <code>liveData.ts</code>.</span></div>
          <div className="flex items-center gap-3 rounded-lg border border-[rgba(255,152,0,0.15)] bg-[rgba(255,152,0,0.06)] px-4 py-3"><span className="text-[#ff9800] font-bold text-sm w-5">3</span><span className="text-sm text-[#8899a8]"><strong className="text-[#e2eaf2]">Deterministic fallback</strong> — Hash-based vitals from <code>vitals.ts</code>. Same ID = same scores, always.</span></div>
        </div>
        <Callout variant="tip">This means the dashboard always works, even when the oracle is offline or the World API is unreachable. Only the source and freshness of scores changes.</Callout>
      </section>

      <section>
        <h2 id="caching" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Caching &amp; Refresh Rates</h2>
        <div className="overflow-x-auto my-4">
          <table><thead><tr><th>Data Type</th><th>Cache Location</th><th>TTL</th></tr></thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]">Solar systems (24K)</td><td className="text-[#8899a8]">In-memory (worldApi.ts)</td><td className="text-[#5c6b7a]">10 minutes</td></tr>
              <tr><td className="text-[#e2eaf2]">Smart assemblies + killmails</td><td className="text-[#8899a8]">In-memory (liveData.ts)</td><td className="text-[#5c6b7a]">5 minutes</td></tr>
              <tr><td className="text-[#e2eaf2]">Computed scores (CHI, reputation)</td><td className="text-[#8899a8]">Sui blockchain</td><td className="text-[#5c6b7a]">Written every 10 min by oracle</td></tr>
              <tr><td className="text-[#e2eaf2]">Pulse Card SVG</td><td className="text-[#8899a8]">HTTP Cache-Control</td><td className="text-[#5c6b7a]">max-age=300 (5 min)</td></tr>
              <tr><td className="text-[#e2eaf2]">Frontend page data</td><td className="text-[#8899a8]">None (force-dynamic)</td><td className="text-[#5c6b7a]">Fresh on every load</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 id="external-links" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">External Resources</h2>
        <div className="overflow-x-auto my-4">
          <table><thead><tr><th>Resource</th><th>URL</th></tr></thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]">World API (Swagger)</td><td className="text-[#8899a8]"><a href="https://docs.evefrontier.com/SwaggerWorldApi" className="text-[#00e5ff] hover:underline" target="_blank" rel="noopener noreferrer">docs.evefrontier.com/SwaggerWorldApi</a></td></tr>
              <tr><td className="text-[#e2eaf2]">Builder Documentation</td><td className="text-[#8899a8]"><a href="https://docs.evefrontier.com" className="text-[#00e5ff] hover:underline" target="_blank" rel="noopener noreferrer">docs.evefrontier.com</a></td></tr>
              <tr><td className="text-[#e2eaf2]">Sui JSON-RPC Reference</td><td className="text-[#8899a8]"><a href="https://docs.sui.io/references/sui-api" className="text-[#00e5ff] hover:underline" target="_blank" rel="noopener noreferrer">docs.sui.io/references/sui-api</a></td></tr>
              <tr><td className="text-[#e2eaf2]">Sui TypeScript SDK</td><td className="text-[#8899a8]"><a href="https://sdk.mystenlabs.com" className="text-[#00e5ff] hover:underline" target="_blank" rel="noopener noreferrer">sdk.mystenlabs.com</a></td></tr>
              <tr><td className="text-[#e2eaf2]">Move Book</td><td className="text-[#8899a8]"><a href="https://move-book.com" className="text-[#00e5ff] hover:underline" target="_blank" rel="noopener noreferrer">move-book.com</a></td></tr>
              <tr><td className="text-[#e2eaf2]">EVE Frontier Discord</td><td className="text-[#8899a8]"><a href="https://discord.gg/evefrontier" className="text-[#00e5ff] hover:underline" target="_blank" rel="noopener noreferrer">discord.gg/evefrontier</a></td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </PageWrapper>
  );
}
