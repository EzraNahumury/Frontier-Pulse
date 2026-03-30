"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export default function GettingStartedPage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">Quick Start</h1>
      <p className="page-desc text-[#5c6b7a] mb-8">
        Get Frontier Pulse running locally in under 5 minutes.
      </p>

      {/* Prerequisites */}
      <section>
        <h2 id="prerequisites" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Prerequisites
        </h2>
        <ul className="space-y-2 text-[#8899a8] text-sm mb-6">
          <li className="flex items-start gap-2">
            <span className="text-[#00e5ff] mt-1">&#8226;</span>
            <span><strong className="text-[#e2eaf2]">Node.js 20+</strong> (LTS recommended)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00e5ff] mt-1">&#8226;</span>
            <span><strong className="text-[#e2eaf2]">npm 10+</strong> (comes with Node.js)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00e5ff] mt-1">&#8226;</span>
            <span><strong className="text-[#e2eaf2]">Git</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00e5ff] mt-1">&#8226;</span>
            <span><strong className="text-[#e2eaf2]">Sui CLI</strong> (optional, for smart contract deployment)</span>
          </li>
        </ul>
      </section>

      {/* Installation */}
      <section>
        <h2 id="installation" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Installation
        </h2>
        <CodeBlock
          language="bash"
          filename="Terminal"
          code={`# Clone the repository
git clone https://github.com/EzraNahumury/Frontier-Pulse.git
cd frontier-pulse

# Install frontend dependencies
cd fe_frontierpulse
npm install

# Install oracle backend dependencies
cd ../oracle_backend
npm install`}
        />
      </section>

      {/* Environment Setup */}
      <section>
        <h2 id="environment" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Environment Variables
        </h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          The oracle backend requires a <code>.env</code> file. Copy the example and configure:
        </p>
        <CodeBlock
          language="bash"
          filename="oracle_backend/.env"
          code={`# Sui Network
SUI_NETWORK=testnet
SUI_PRIVATE_KEY=your_private_key_here

# Smart Contract IDs (already deployed)
PACKAGE_ID=0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9
PULSE_REGISTRY_ID=0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4
ADMIN_CAP_ID=0x2adb35c6ececb66b28fd178d246d3ef1b4f8c65fa5a3a7583192df91605da797
ORACLE_CAP_ID=           # Set after running npm run oracle:init

# EVE Frontier
WORLD_API_BASE=https://world-api-stillness.live.tech.evefrontier.com

# Scheduling
CRON_SCHEDULE=*/10 * * * *   # Every 10 minutes
BATCH_SIZE=50                # Systems per transaction batch
MAX_SYSTEMS_PER_CYCLE=500    # Max systems processed per cycle`}
        />
        <Callout variant="warning" title="Private Key">
          Never commit your <code>SUI_PRIVATE_KEY</code> to version control.
          The oracle wallet needs SUI tokens for gas on testnet.
        </Callout>

        <p className="text-[#8899a8] text-sm leading-relaxed mt-4 mb-4">
          The <strong className="text-[#e2eaf2]">frontend</strong> uses hardcoded constants and does not
          require a <code>.env</code> file:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Constant</th><th>File</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-[#e2eaf2]">World API Base</td>
                <td className="text-[#5c6b7a]"><code>lib/worldApi.ts</code></td>
                <td><code className="text-xs">https://world-api-stillness.live.tech.evefrontier.com</code></td>
              </tr>
              <tr>
                <td className="text-[#e2eaf2]">Sui RPC URL</td>
                <td className="text-[#5c6b7a]"><code>lib/suiReader.ts</code></td>
                <td><code className="text-xs">https://fullnode.testnet.sui.io:443</code></td>
              </tr>
              <tr>
                <td className="text-[#e2eaf2]">PulseRegistry ID</td>
                <td className="text-[#5c6b7a]"><code>lib/suiReader.ts</code></td>
                <td><code className="text-xs">0x945f...32c4</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Running Locally */}
      <section>
        <h2 id="running-locally" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Running Locally
        </h2>
        <h3 id="frontend" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">Frontend</h3>
        <CodeBlock
          language="bash"
          filename="Terminal"
          code={`cd fe_frontierpulse
npm run dev
# → http://localhost:3000`}
        />
        <p className="text-[#5c6b7a] text-sm mb-6">
          The frontend works standalone &mdash; it reads live data from the World API and falls back to
          deterministic hash-based scoring when on-chain data is unavailable.
        </p>

        <h3 id="oracle" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">Oracle Backend</h3>
        <CodeBlock
          language="bash"
          filename="Terminal"
          code={`cd oracle_backend

# First-time setup: create OracleCap
npm run oracle:init

# Start cron scheduler (runs every 10 minutes)
npm run dev

# Or run a single cycle then exit
npm run dev -- --once`}
        />
        <Callout variant="tip" title="Standalone Mode">
          You don&apos;t need to run the oracle to use the dashboard.
          The frontend will render the galaxy and compute vitals locally.
          The oracle adds on-chain persistence and trust scores.
        </Callout>
      </section>

      {/* Deployment */}
      <section>
        <h2 id="deployment" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20">
          Deployment
        </h2>
        <h3 id="deploy-frontend" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">Frontend → Vercel</h3>
        <CodeBlock language="bash" filename="Terminal" code={`cd fe_frontierpulse && vercel --prod`} />

        <h3 id="deploy-oracle" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">Oracle → Any Node.js Host</h3>
        <CodeBlock language="bash" filename="Terminal" code={`cd oracle_backend\nnpm run build && npm start`} />

        <h3 id="deploy-contract" className="text-lg font-semibold text-[#e2eaf2] mb-3 scroll-mt-20">Smart Contract</h3>
        <p className="text-[#8899a8] text-sm">
          The contract is already deployed to Sui Testnet. To redeploy:
        </p>
        <CodeBlock language="bash" filename="Terminal" code={`cd smartcontract_FP\nsui client publish --gas-budget 100000000`} />
      </section>
    </PageWrapper>
  );
}
