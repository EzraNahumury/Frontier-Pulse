"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { ComponentMap, StatGrid } from "@/components/docs/visuals";

function ComponentEntry({ name, file, lines, description, details, children }: {
  name: string; file: string; lines: string; description: string; details?: string; children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 pb-8 border-b border-[rgba(0,229,255,0.08)] last:border-b-0">
      <div className="flex items-baseline gap-3 mb-1">
        <h3 id={name.toLowerCase().replace(/\s+/g, "-")} className="text-lg font-semibold text-[#e2eaf2] scroll-mt-20">{name}</h3>
        <span className="text-xs text-[#5c6b7a] font-mono">{file}</span>
        <span className="text-[10px] text-[#5c6b7a]">{lines} lines</span>
      </div>
      <p className="text-sm text-[#8899a8] leading-relaxed mb-2">{description}</p>
      {details && <p className="text-sm text-[#5c6b7a] leading-relaxed mb-2">{details}</p>}
      {children}
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">Component Reference</h1>
      <p className="page-desc text-[#5c6b7a] mb-4">All 18 React components in the frontend, organized by function.</p>

      <ComponentMap categories={[
        { name: "Visualization", color: "bg-blue-500", components: ["GalaxyCanvas", "DualHeartbeat", "CHIGauge", "SubIndexBars", "TrustCompass", "TimeLapse"] },
        { name: "Panels & Navigation", color: "bg-emerald-500", components: ["SystemPanel", "SearchPalette", "TrustFilterBar", "WatchlistPanel", "Panel"] },
        { name: "Alerts & Transactions", color: "bg-amber-500", components: ["AlertBell", "AlertFeed", "TransactionHistory"] },
        { name: "Wallet & Onboarding", color: "bg-violet-500", components: ["WalletModal", "DisconnectWalletModal", "GuidedTour"] },
      ]} />

      <StatGrid stats={[
        { label: "Total Components", value: "18" },
        { label: "Canvas-based", value: "2", sub: "Galaxy + EKG" },
        { label: "SVG-based", value: "3", sub: "Gauge + Compass + Cards" },
        { label: "Largest", value: "~17K", sub: "GalaxyCanvas lines" },
      ]} />

      <Callout variant="info">All components are located in <code>fe_frontierpulse/app/components/</code>. Most are client components using Canvas API, SVG, or Framer Motion.</Callout>

      <section>
        <h2 id="visualization" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-6 scroll-mt-20">Visualization</h2>

        <ComponentEntry name="GalaxyCanvas" file="GalaxyCanvas.tsx" lines="~17,800" description="The main galaxy map rendering all 24,502 star systems as interactive Canvas nodes." details="Uses requestAnimationFrame for 60fps rendering. Each system node is colored by trust level (green/orange/red), sized by depth, and glows on hover. Selected systems show a dashed pulsing ring and cyan gate connection lines to destinations. Supports click-to-select, hover preview, and trust filter integration.">
          <div className="overflow-x-auto my-3">
            <table><thead><tr><th>Visual</th><th>Data</th></tr></thead>
              <tbody>
                <tr><td className="text-[#e2eaf2]">Brightness</td><td className="text-[#8899a8]">Player activity level</td></tr>
                <tr><td className="text-[#e2eaf2]">Color</td><td className="text-[#8899a8]">Trust: green (&ge;70), orange (40-70), red (&lt;40)</td></tr>
                <tr><td className="text-[#e2eaf2]">Size</td><td className="text-[#8899a8]">Depth from 3D coordinate normalization (1.5-3px)</td></tr>
                <tr><td className="text-[#e2eaf2]">Gate lines</td><td className="text-[#8899a8]">Cyan flowing dashes to Smart Gate destinations</td></tr>
              </tbody>
            </table>
          </div>
        </ComponentEntry>

        <ComponentEntry name="DualHeartbeat" file="DualHeartbeat.tsx" lines="~5,100" description="Dual EKG-style heartbeat monitor showing Activity (white) and Trust (green) pulses." details="Maintains a 300-point rolling buffer updated at ~30fps. Rendered with quadratic Bezier curves (ctx.quadraticCurveTo). Features a horizontal scanline sweep effect and sinusoidal beat spike generation. The relationship between the two lines reveals civilization health patterns." />

        <ComponentEntry name="CHIGauge" file="CHIGauge.tsx" lines="~1,800" description="SVG circular arc gauge displaying the global Civilization Health Index (0-100)." details="Animated arc that fills based on CHI score. Color changes by threshold: green (≥70), blue (≥50), orange (≥30), red (<30). Shows the overall score number in the center with diagnosis text below." />

        <ComponentEntry name="SubIndexBars" file="SubIndexBars.tsx" lines="~1,500" description="Six horizontal progress bars for CHI sub-indices." details="Displays Economic Vitality, Security Index, Growth Rate, Connectivity, Trust Index, and Social Cohesion as labeled progress bars with percentage labels." />

        <ComponentEntry name="TrustCompass" file="TrustCompass.tsx" lines="~6,900" description="5-axis SVG radar chart (pentagon) for player reputation profiles." details="Axes: Reliability, Commerce, Stewardship, Diplomacy, Volatility (inverted: 100 - value). Pentagon guide lines at 25/50/75/100 levels. Filled polygon with trust-based color. Shows 5 dimension progress bars below and the player archetype label." />

        <ComponentEntry name="TimeLapse" file="TimeLapse.tsx" lines="~6,800" description="Historical time-lapse replay controller with playback controls." details="Range selector (24h, 7d, 30d), play/pause, speed toggle (1x/2x/4x), interactive progress scrubber. Generates synthetic historical snapshots using sinusoidal time-varying offsets to base vitals." />
      </section>

      <section>
        <h2 id="panels" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-6 scroll-mt-20">Panels &amp; Navigation</h2>

        <ComponentEntry name="SystemPanel" file="SystemPanel.tsx" lines="~12,700" description="Deep-dive panel for a selected star system." details="Shows system vitals (Activity, Trust, Local CHI as colored bars), stats (player count, infrastructure, TX frequency, combat), real gate connections from World API, up to 8 constellation neighbors (clickable), and known pilots with trust scores. Includes a link to generate the shareable Pulse Card." />

        <ComponentEntry name="SearchPalette" file="SearchPalette.tsx" lines="~9,000" description="Ctrl+K command palette for instant system search across all 24,502 systems." details="Fuzzy search by system name or ID. Results show system name, constellation, and trust status. Clicking a result selects it on the galaxy map." />

        <ComponentEntry name="TrustFilterBar" file="TrustFilterBar.tsx" lines="~2,700" description="Filter pills to highlight systems by trust level." details="Three toggleable pills: Healthy (green, trust ≥70), Stressed (orange, 40-70), Hostile (red, <40). Can also show 'All' for no filter." />

        <ComponentEntry name="WatchlistPanel" file="WatchlistPanel.tsx" lines="~10,900" description="Personal tracking panel for bookmarked systems and players." details="Add/remove systems and players. Persistent via Zustand store with localStorage. Quick-access links to jump to watched items on the map." />

        <ComponentEntry name="Panel" file="Panel.tsx" lines="~500" description="Reusable glassmorphism panel wrapper with consistent styling." />
      </section>

      <section>
        <h2 id="alerts" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-6 scroll-mt-20">Alerts &amp; Transactions</h2>

        <ComponentEntry name="AlertBell" file="AlertBell.tsx" lines="~4,200" description="Notification bell icon with badge count and dropdown panel." details="Shows unread alert count. Dropdown lists alerts sorted by severity (critical → info) with color-coded severity badges. Each alert links to the affected system." />

        <ComponentEntry name="AlertFeed" file="AlertFeed.tsx" lines="~1,700" description="Full alert feed list component used in the dropdown." details="Renders alert type, severity badge, system name, description, and relative timestamp for each anomaly alert." />

        <ComponentEntry name="TransactionHistory" file="TransactionHistory.tsx" lines="~6,800" description="Dashboard widget showing recent oracle transactions." details="Auto-refreshes every 5 seconds. Shows function name (color-coded by type), digest linked to Suiscan, age, sender, Move call count, and gas consumed." />
      </section>

      <section>
        <h2 id="wallet" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-6 scroll-mt-20">Wallet &amp; Onboarding</h2>

        <ComponentEntry name="WalletModal" file="WalletModal.tsx" lines="~11,400" description="Sui wallet connection modal powered by @mysten/dapp-kit." details="Detects available Sui wallets (Sui Wallet, Suiet, Ethos, etc.). Shows wallet icons, handles connection flow, and stores the connected address in Zustand." />

        <ComponentEntry name="DisconnectWalletModal" file="DisconnectWalletModal.tsx" lines="~4,400" description="Confirmation dialog before disconnecting wallet session." details="Shows connected address and asks for confirmation. Clears wallet state from the store on disconnect." />

        <ComponentEntry name="GuidedTour" file="GuidedTour.tsx" lines="~11,100" description="Interactive step-by-step onboarding walkthrough." details="Highlights key UI elements one by one (galaxy map, heartbeat, CHI gauge, trust compass, search palette, etc.). Shows contextual tooltips explaining what each feature does. Can be dismissed or replayed." />
      </section>

      <section>
        <h2 id="state-management" className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-6 scroll-mt-20">State Management</h2>
        <p className="text-[#8899a8] text-sm leading-relaxed mb-4">
          All client-side state is managed by a single <strong className="text-[#e2eaf2]">Zustand 5</strong> store with localStorage persistence for watchlist and wallet data.
        </p>
        <CodeBlock language="typescript" filename="lib/store.ts" code={`interface UIStore {
  // UI state
  selectedSystemId: number | null;
  selectedPlayerAddress: string | null;
  activeView: "overview" | "systems" | "players" | "alerts";

  // Watchlist (persisted to localStorage)
  walletAddress: string | null;
  watchedSystemIds: number[];
  personalSystemIds: number[];  // auto-detected from wallet activity

  // Actions
  setSelectedSystem: (id: number | null) => void;
  setSelectedPlayer: (address: string | null) => void;
  toggleWatchSystem: (id: number) => void;
  clearWatchlist: () => void;
}`} />
      </section>
    </PageWrapper>
  );
}
