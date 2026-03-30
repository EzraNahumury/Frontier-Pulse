"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export default function DeploymentPage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">Deployment</h1>
      <p className="page-desc text-[#5c6b7a] mb-8">Production deployment guide for all three system components.</p>

      <section>
        <h2 id="frontend" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Frontend (Vercel)</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">The Next.js frontend deploys to Vercel with zero configuration. All data is fetched at runtime from the World API and Sui RPC.</p>
        <CodeBlock language="bash" filename="Terminal" code={`cd fe_frontierpulse

# Deploy to Vercel
vercel --prod

# Or link to GitHub for auto-deploy on push
vercel link`} />
        <Callout variant="info">No environment variables needed for the frontend. World API base URL and Sui RPC are hardcoded in <code>lib/worldApi.ts</code> and <code>lib/suiReader.ts</code>.</Callout>

        <h3 id="frontend-env" className="text-lg font-semibold text-[#e2eaf2] mb-3 mt-6 scroll-mt-20">Hardcoded Constants</h3>
        <div className="overflow-x-auto my-4">
          <table><thead><tr><th>Constant</th><th>File</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]">World API Base</td><td className="text-[#8899a8]"><code>lib/worldApi.ts</code></td><td className="text-[#5c6b7a]"><code>https://world-api-stillness.live.tech.evefrontier.com</code></td></tr>
              <tr><td className="text-[#e2eaf2]">Sui RPC URL</td><td className="text-[#8899a8]"><code>lib/suiReader.ts</code></td><td className="text-[#5c6b7a]"><code>https://fullnode.testnet.sui.io:443</code></td></tr>
              <tr><td className="text-[#e2eaf2]">PulseRegistry ID</td><td className="text-[#8899a8]"><code>lib/suiReader.ts</code></td><td className="text-[#5c6b7a]"><code>0x945f...32c4</code></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 id="oracle" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Oracle Backend</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">The oracle is a long-running Node.js process that needs to be hosted on any server with internet access. Railway, Render, or a VPS all work.</p>

        <h3 id="oracle-setup" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">First-Time Setup</h3>
        <CodeBlock language="bash" filename="Terminal" code={`cd oracle_backend

# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your Sui private key
#    (needs SUI tokens for gas on testnet)

# 3. Build TypeScript
npm run build

# 4. Issue OracleCap (one-time)
npm run oracle:init
# → Outputs: ORACLE_CAP_ID=0x...
# → Add this to your .env file

# 5. Test with a single cycle
npm start -- --once`} />

        <h3 id="oracle-env" className="text-lg font-semibold text-[#e2eaf2] mb-3 mt-6 scroll-mt-20">Environment Variables</h3>
        <div className="overflow-x-auto my-4">
          <table><thead><tr><th>Variable</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]"><code>SUI_NETWORK</code></td><td className="text-[#8899a8]">No</td><td className="text-[#5c6b7a]">testnet</td><td className="text-[#5c6b7a]">Sui network (testnet/mainnet/devnet)</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>SUI_PRIVATE_KEY</code></td><td className="text-[#ff3d3d] font-medium">Yes</td><td className="text-[#5c6b7a]">—</td><td className="text-[#5c6b7a]">Oracle wallet key (Bech32, hex, or base64)</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>PACKAGE_ID</code></td><td className="text-[#8899a8]">No</td><td className="text-[#5c6b7a]">0x6618...bbc9</td><td className="text-[#5c6b7a]">Deployed Move package ID</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>PULSE_REGISTRY_ID</code></td><td className="text-[#8899a8]">No</td><td className="text-[#5c6b7a]">0x945f...32c4</td><td className="text-[#5c6b7a]">PulseRegistry shared object ID</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>ADMIN_CAP_ID</code></td><td className="text-[#8899a8]">No</td><td className="text-[#5c6b7a]">0x2adb...a797</td><td className="text-[#5c6b7a]">AdminCap object ID</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>ORACLE_CAP_ID</code></td><td className="text-[#ff3d3d] font-medium">Yes</td><td className="text-[#5c6b7a]">—</td><td className="text-[#5c6b7a]">From <code>npm run oracle:init</code></td></tr>
              <tr><td className="text-[#e2eaf2]"><code>WORLD_API_BASE</code></td><td className="text-[#8899a8]">No</td><td className="text-[#5c6b7a]">https://world-api-...</td><td className="text-[#5c6b7a]">EVE Frontier World API base URL</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>CRON_SCHEDULE</code></td><td className="text-[#8899a8]">No</td><td className="text-[#5c6b7a]">*/10 * * * *</td><td className="text-[#5c6b7a]">Cron expression (default: every 10 min)</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>BATCH_SIZE</code></td><td className="text-[#8899a8]">No</td><td className="text-[#5c6b7a]">50</td><td className="text-[#5c6b7a]">Systems per Sui transaction batch</td></tr>
              <tr><td className="text-[#e2eaf2]"><code>MAX_SYSTEMS_PER_CYCLE</code></td><td className="text-[#8899a8]">No</td><td className="text-[#5c6b7a]">500</td><td className="text-[#5c6b7a]">Max systems processed per oracle cycle</td></tr>
            </tbody>
          </table>
        </div>
        <Callout variant="warning" title="Private Key Formats">
          The oracle supports three key formats: Bech32 (<code>suiprivkey1...</code>), hex (<code>0x...</code>), and base64. Never commit the key to version control.
        </Callout>

        <h3 id="oracle-production" className="text-lg font-semibold text-[#e2eaf2] mb-3 mt-6 scroll-mt-20">Production Deployment</h3>
        <CodeBlock language="bash" filename="Railway / Render / VPS" code={`cd oracle_backend
npm run build
npm start
# → Starts cron scheduler, runs initial cycle immediately
# → Logs: "[Oracle] Running. Press Ctrl+C to stop."`} />
        <p className="text-[#8899a8] text-sm mb-4">The oracle prints detailed logs for each cycle including systems processed, players scored, CHI value, alerts detected, and gas consumed.</p>
      </section>

      <section>
        <h2 id="smart-contract" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Smart Contract (Sui Move)</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">The contract is already deployed to Sui Testnet. If you need to redeploy (e.g., for a code change):</p>
        <CodeBlock language="bash" filename="Terminal" code={`cd smartcontract_FP

# Install Sui CLI if not already
# https://docs.sui.io/build/install

# Build the package
sui move build

# Run tests
sui move test

# Deploy to testnet (requires SUI for gas)
sui client publish --gas-budget 100000000

# → Note the new Package ID, PulseRegistry ID, and AdminCap ID
# → Update oracle_backend/.env with new IDs
# → Update fe_frontierpulse/lib/suiReader.ts with new REGISTRY_ID`} />
        <Callout variant="tip">After redeployment, you must re-run <code>npm run oracle:init</code> in the oracle backend to issue a new OracleCap for the new package.</Callout>
      </section>

      <section>
        <h2 id="contract-ids" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Deployed Contract IDs</h2>
        <div className="overflow-x-auto my-4">
          <table><thead><tr><th>Resource</th><th>Object ID</th></tr></thead>
            <tbody>
              <tr><td className="text-[#e2eaf2]">Package</td><td className="text-[#8899a8]"><code className="text-xs break-all">0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9</code></td></tr>
              <tr><td className="text-[#e2eaf2]">PulseRegistry</td><td className="text-[#8899a8]"><code className="text-xs break-all">0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4</code></td></tr>
              <tr><td className="text-[#e2eaf2]">AdminCap</td><td className="text-[#8899a8]"><code className="text-xs break-all">0x2adb35c6ececb66b28fd178d246d3ef1b4f8c65fa5a3a7583192df91605da797</code></td></tr>
              <tr><td className="text-[#e2eaf2]">Network</td><td className="text-[#8899a8]">Sui Testnet</td></tr>
              <tr><td className="text-[#e2eaf2]">RPC Endpoint</td><td className="text-[#8899a8]"><code>https://fullnode.testnet.sui.io:443</code></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 id="troubleshooting" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">Troubleshooting</h2>
        <div className="space-y-4 my-4">
          <div className="rounded-lg border border-[rgba(0,229,255,0.08)] p-4">
            <p className="text-sm font-semibold text-[#e2eaf2] mb-1">Oracle: &ldquo;OracleCap not found or invalid&rdquo;</p>
            <p className="text-sm text-[#8899a8]">The ORACLE_CAP_ID in .env is wrong or the cap was issued for a different package. Run <code>npm run oracle:init</code> again.</p>
          </div>
          <div className="rounded-lg border border-[rgba(0,229,255,0.08)] p-4">
            <p className="text-sm font-semibold text-[#e2eaf2] mb-1">Oracle: &ldquo;Insufficient gas&rdquo;</p>
            <p className="text-sm text-[#8899a8]">The oracle wallet needs SUI tokens. Get testnet tokens from the Sui faucet or transfer from another wallet.</p>
          </div>
          <div className="rounded-lg border border-[rgba(0,229,255,0.08)] p-4">
            <p className="text-sm font-semibold text-[#e2eaf2] mb-1">Frontend: Galaxy shows no active systems</p>
            <p className="text-sm text-[#8899a8]">The World API may be returning empty smart assembly or killmail data. The frontend will use deterministic fallback scoring. This is normal when the Stillness server is down.</p>
          </div>
          <div className="rounded-lg border border-[rgba(0,229,255,0.08)] p-4">
            <p className="text-sm font-semibold text-[#e2eaf2] mb-1">Frontend: CHI shows &ldquo;No data&rdquo;</p>
            <p className="text-sm text-[#8899a8]">Neither on-chain data nor live computation returned results. Run the oracle once (<code>npm run dev -- --once</code>) to populate on-chain data.</p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
