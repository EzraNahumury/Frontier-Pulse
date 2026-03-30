"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/docs/page-wrapper";
import { Callout } from "@/components/docs/callout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  FileJson,
  File,
  ChevronRight,
  Monitor,
  Server,
  Blocks,
  BookOpen,
  Lightbulb,
} from "lucide-react";

/* ── Types ── */

interface TreeNode {
  name: string;
  desc?: string;
  lines?: string;
  children?: TreeNode[];
}

interface LayerConfig {
  name: string;
  slug: string;
  icon: typeof Monitor;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  badgeColor: string;
  tech: string;
  files: number;
  linesTotal: string;
  tree: TreeNode;
}

/* ── File-type icon resolver ── */

function getFileIcon(name: string) {
  if (name.endsWith(".tsx") || name.endsWith(".ts"))
    return <FileCode2 className="w-3.5 h-3.5 text-[#00e5ff]" />;
  if (name.endsWith(".move"))
    return <FileCode2 className="w-3.5 h-3.5 text-[#a78bfa]" />;
  if (name.endsWith(".css"))
    return <FileText className="w-3.5 h-3.5 text-[#ff9800]" />;
  if (name.endsWith(".json") || name.endsWith(".toml") || name.endsWith(".lock"))
    return <FileJson className="w-3.5 h-3.5 text-[#5c6b7a]" />;
  if (name.endsWith(".md"))
    return <FileText className="w-3.5 h-3.5 text-[#8899a8]" />;
  if (name.endsWith(".example"))
    return <File className="w-3.5 h-3.5 text-[#5c6b7a]" />;
  return <File className="w-3.5 h-3.5 text-[#3d4f60]" />;
}

/* ── Tree node component ── */

function TreeItem({
  node,
  depth,
  accentColor,
  index,
}: {
  node: TreeNode;
  depth: number;
  accentColor: string;
  index: number;
}) {
  const isFolder = !!node.children;
  const [open, setOpen] = useState(depth < 1);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02, duration: 0.25 }}
      >
        <button
          onClick={() => isFolder && setOpen(!open)}
          className={`group flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-md transition-colors duration-150 ${
            isFolder
              ? "hover:bg-white/[0.03] cursor-pointer"
              : "cursor-default"
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          disabled={!isFolder}
        >
          {/* Expand chevron or spacer */}
          {isFolder ? (
            <motion.div
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              className="shrink-0"
            >
              <ChevronRight className="w-3 h-3 text-[#3d4f60]" />
            </motion.div>
          ) : (
            <span className="w-3 shrink-0" />
          )}

          {/* Icon */}
          {isFolder ? (
            open ? (
              <FolderOpen className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
            ) : (
              <Folder className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
            )
          ) : (
            getFileIcon(node.name)
          )}

          {/* Name */}
          <span
            className={`text-[13px] ${
              isFolder ? "font-semibold text-[#e2eaf2]" : "text-[#b8c7d6]"
            }`}
          >
            {node.name}
            {isFolder && "/"}
          </span>

          {/* Lines badge */}
          {node.lines && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0"
              style={{
                background: `${accentColor}10`,
                color: accentColor,
                border: `1px solid ${accentColor}20`,
              }}
            >
              {node.lines}
            </span>
          )}

          {/* Description */}
          {node.desc && (
            <span className="text-[11px] text-[#3d4f60] ml-auto truncate max-w-[50%] hidden sm:inline group-hover:text-[#5c6b7a] transition-colors">
              {node.desc}
            </span>
          )}
        </button>
      </motion.div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {isFolder && open && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Vertical guide line */}
            <div className="relative">
              <div
                className="absolute top-0 bottom-0 w-px"
                style={{
                  left: `${depth * 20 + 19}px`,
                  background: `${accentColor}15`,
                }}
              />
              {node.children.map((child, i) => (
                <TreeItem
                  key={child.name}
                  node={child}
                  depth={depth + 1}
                  accentColor={accentColor}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Layer card with embedded tree ── */

function LayerCard({ layer, index }: { layer: LayerConfig; index: number }) {
  const Icon = layer.icon;
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <h2
        id={layer.slug}
        className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20"
      >
        {layer.name}
      </h2>

      <div
        className="rounded-xl border overflow-hidden"
        style={{
          borderColor: layer.borderColor,
          background: `linear-gradient(135deg, ${layer.bgColor} 0%, rgba(5,8,15,0.5) 100%)`,
        }}
      >
        {/* Header bar */}
        <div
          className="flex items-center gap-3 px-5 py-3.5 border-b"
          style={{ borderColor: layer.borderColor }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${layer.color}15`, border: `1px solid ${layer.color}25` }}
          >
            <Icon className="w-4 h-4" style={{ color: layer.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#e2eaf2]">{layer.tree.name}/</p>
            <p className="text-[11px] text-[#5c6b7a]">{layer.tech}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-[#5c6b7a]">Files</p>
              <p className="text-sm font-bold" style={{ color: layer.color }}>{layer.files}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-[#5c6b7a]">Lines</p>
              <p className="text-sm font-bold" style={{ color: layer.color }}>{layer.linesTotal}</p>
            </div>
          </div>
        </div>

        {/* File tree */}
        <div className="py-2">
          {layer.tree.children?.map((child, i) => (
            <TreeItem
              key={child.name}
              node={child}
              depth={0}
              accentColor={layer.color}
              index={i}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ── Layer data ── */

const layers: LayerConfig[] = [
  {
    name: "Frontend",
    slug: "frontend",
    icon: Monitor,
    color: "#00e5ff",
    bgColor: "rgba(0,229,255,0.03)",
    borderColor: "rgba(0,229,255,0.12)",
    glowColor: "rgba(0,229,255,0.08)",
    badgeColor: "#00e5ff",
    tech: "Next.js 16 + React 19 + TailwindCSS 4 + Zustand 5",
    files: 34,
    linesTotal: "~95K",
    tree: {
      name: "fe_frontierpulse",
      children: [
        {
          name: "app",
          children: [
            { name: "page.tsx", desc: "Main dashboard — galaxy map + all panels" },
            { name: "layout.tsx", desc: "Root layout with metadata" },
            { name: "providers.tsx", desc: "SuiClient + Wallet + QueryClient providers" },
            { name: "globals.css", desc: "Space-themed dark CSS, custom properties" },
            {
              name: "pulse-card/[systemId]",
              children: [
                { name: "page.tsx", desc: "Dynamic system detail view" },
              ],
            },
            {
              name: "transactions",
              children: [
                { name: "page.tsx", desc: "Oracle transaction log (paginated, auto-refresh)" },
              ],
            },
            {
              name: "components",
              children: [
                { name: "GalaxyCanvas.tsx", desc: "24,502-node galaxy map on Canvas API", lines: "~17K" },
                { name: "DualHeartbeat.tsx", desc: "Dual EKG — Activity + Trust pulse", lines: "~5K" },
                { name: "CHIGauge.tsx", desc: "Circular arc gauge for global CHI (SVG)" },
                { name: "SubIndexBars.tsx", desc: "6 CHI sub-index progress bars" },
                { name: "TrustCompass.tsx", desc: "5-axis radar chart for player reputation" },
                { name: "TrustFilterBar.tsx", desc: "Green / Amber / Red trust filter pills" },
                { name: "SystemPanel.tsx", desc: "System deep-dive panel", lines: "~12K" },
                { name: "TimeLapse.tsx", desc: "Time-lapse replay with playback controls" },
                { name: "AlertBell.tsx", desc: "Notification bell + dropdown", lines: "~4K" },
                { name: "AlertFeed.tsx", desc: "Anomaly alert feed list" },
                { name: "SearchPalette.tsx", desc: "Ctrl+K command palette", lines: "~9K" },
                { name: "TransactionHistory.tsx", desc: "Dashboard transaction widget" },
                { name: "GuidedTour.tsx", desc: "Interactive onboarding walkthrough", lines: "~11K" },
                { name: "WalletModal.tsx", desc: "Sui wallet connection modal", lines: "~11K" },
                { name: "DisconnectWalletModal.tsx", desc: "Wallet disconnect confirmation" },
                { name: "WatchlistPanel.tsx", desc: "System/player watchlist", lines: "~10K" },
                { name: "Panel.tsx", desc: "Reusable glassmorphism panel wrapper" },
              ],
            },
            {
              name: "api",
              children: [
                { name: "universe/route.ts", desc: "All systems + CHI (tiered loading)" },
                { name: "chi/route.ts", desc: "Global CHI from on-chain or live computation" },
                { name: "system/[id]/route.ts", desc: "Single system detail + vitals + players" },
                { name: "player/[address]/route.ts", desc: "Player Trust Compass profile" },
                { name: "player/[address]/systems/route.ts", desc: "Player's visited systems" },
                { name: "alerts/route.ts", desc: "Anomaly alert feed" },
                { name: "transactions/route.ts", desc: "Oracle tx history from Sui" },
                { name: "pulse-card/[systemId]/route.ts", desc: "Shareable SVG card (600x315)" },
                { name: "world/system/[id]/route.ts", desc: "World API proxy for gate data" },
              ],
            },
          ],
        },
        {
          name: "lib",
          children: [
            { name: "worldApi.ts", desc: "World API client — paginated fetch, coord normalization" },
            { name: "suiReader.ts", desc: "Sui JSON-RPC reader — reads PulseRegistry on-chain" },
            { name: "liveData.ts", desc: "Live scoring pipeline — assemblies + kills → scores" },
            { name: "vitals.ts", desc: "Deterministic hash-based system vitals (fallback)" },
            { name: "colors.ts", desc: "Trust color palette + severity mapping" },
            { name: "types.ts", desc: "TypeScript interfaces for all data models" },
            { name: "store.ts", desc: "Zustand store (UI state + watchlist + wallet)" },
            { name: "seedData.ts", desc: "Seed data for development/demo mode" },
            { name: "mockData.ts", desc: "Legacy mock data (replaced by liveData.ts)" },
          ],
        },
        { name: "package.json", desc: "Next.js 16.2.1, React 19.2.4, Zustand 5, Sui SDK" },
        { name: "tsconfig.json", desc: "ES2017, JSX react-jsx, path aliases" },
      ],
    },
  },
  {
    name: "Oracle Backend",
    slug: "oracle-backend",
    icon: Server,
    color: "#00ff88",
    bgColor: "rgba(0,255,136,0.03)",
    borderColor: "rgba(0,255,136,0.12)",
    glowColor: "rgba(0,255,136,0.08)",
    badgeColor: "#00ff88",
    tech: "Node.js + TypeScript + node-cron + @mysten/sui SDK",
    files: 9,
    linesTotal: "~3K",
    tree: {
      name: "oracle_backend",
      children: [
        {
          name: "src",
          children: [
            { name: "index.ts", desc: "Main entry — cron scheduler, --once flag support" },
            { name: "config.ts", desc: "Environment config loader (dotenv) + target() helper" },
            { name: "worldApi.ts", desc: "World API fetcher — systems, assemblies, killmails" },
            { name: "scoring.ts", desc: "Score computation — health, reputation, CHI, anomalies" },
            { name: "suiWriter.ts", desc: "Sui PTB writer — batched transactions to PulseRegistry" },
            { name: "initOracle.ts", desc: "One-time OracleCap setup script" },
          ],
        },
        { name: ".env.example", desc: "Template with all required environment variables" },
        { name: "package.json", desc: "@mysten/sui ^2.12.0, node-cron ^3.0.3, dotenv" },
        { name: "tsconfig.json", desc: "ES2022, Node16 modules, strict mode" },
      ],
    },
  },
  {
    name: "Smart Contract",
    slug: "smart-contract",
    icon: Blocks,
    color: "#a78bfa",
    bgColor: "rgba(167,139,250,0.03)",
    borderColor: "rgba(167,139,250,0.12)",
    glowColor: "rgba(167,139,250,0.08)",
    badgeColor: "#a78bfa",
    tech: "Sui Move (edition 2024) — PulseRegistry",
    files: 6,
    linesTotal: "~1K",
    tree: {
      name: "smartcontract_FP",
      children: [
        {
          name: "sources",
          children: [
            { name: "frontier_pulse.move", desc: "Main module — registry, structs, oracle writes, reads", lines: "~788" },
            { name: "smartcontract_fp.move", desc: "Secondary module" },
          ],
        },
        {
          name: "tests",
          children: [
            { name: "frontier_pulse_tests.move", desc: "Core module tests" },
            { name: "smartcontract_fp_tests.move", desc: "Secondary module tests" },
          ],
        },
        { name: "Move.toml", desc: "Package manifest (edition 2024, MIT license)" },
        { name: "Move.lock", desc: "Dependency lock (pinned to testnet)" },
        { name: "Published.toml", desc: "Deployed contract addresses" },
      ],
    },
  },
];

/* ── Extras data ── */

const docsTree: TreeNode = {
  name: "docs_fp",
  children: [
    {
      name: "app/(docs)",
      children: [
        { name: "introduction/page.tsx", desc: "Product overview & hero" },
        { name: "getting-started/page.tsx", desc: "Quick start guide" },
        { name: "architecture/page.tsx", desc: "System architecture" },
        { name: "...12 more pages", desc: "Frontend, Oracle, Scoring, API, etc." },
      ],
    },
    {
      name: "components/docs",
      children: [
        { name: "sidebar.tsx", desc: "Navigation sidebar" },
        { name: "search-modal.tsx", desc: "Ctrl+K search" },
        { name: "...12 more components", desc: "Code blocks, callouts, diagrams, etc." },
      ],
    },
  ],
};

/* ── Key Libraries table ── */

const keyLibs = [
  { file: "worldApi.ts", purpose: "EVE Frontier World API client", exports: "fetchAllSystems(), fetchSystemDetail()" },
  { file: "suiReader.ts", purpose: "On-chain data reader via JSON-RPC", exports: "readRegistry() → CHI + stats" },
  { file: "liveData.ts", purpose: "Live scoring from assemblies + killmails", exports: "getLivePlayers(), getLiveCHI(), getLiveAlerts()" },
  { file: "vitals.ts", purpose: "Deterministic hash-based vitals", exports: "getSystemVitals(systemId)" },
  { file: "store.ts", purpose: "Zustand state (UI + watchlist + wallet)", exports: "useUIStore hook" },
  { file: "colors.ts", purpose: "Trust color palette", exports: "getTrustColor(), getSeverityColor()" },
  { file: "types.ts", purpose: "TypeScript interfaces", exports: "WorldSystem, PlayerReputation, CHIData, Alert" },
];

/* ── Page ── */

export default function ProjectStructurePage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-2 font-[family-name:var(--font-playfair)]">
        Project Structure
      </h1>
      <p className="page-desc text-[#5c6b7a] mb-8">
        Complete file tree with descriptions for every file in the repository.
      </p>

      {/* ── Overview: 3 layer cards ── */}
      <section>
        <h2
          id="overview"
          className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20"
        >
          Overview
        </h2>
        <p className="text-[#8899a8] leading-relaxed mb-6">
          The repository is organized into three main directories, each representing a layer of the system.
          The frontend and oracle share the same Sui SDK and scoring formulas for consistency.
        </p>

        {/* Layer summary cards */}
        <div className="grid sm:grid-cols-3 gap-3 mb-2">
          {layers.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <motion.a
                key={layer.slug}
                href={`#${layer.slug}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border p-4 hover:shadow-lg transition-all duration-200 block"
                style={{
                  borderColor: layer.borderColor,
                  background: layer.bgColor,
                }}
                whileHover={{
                  boxShadow: `0 0 30px ${layer.glowColor}`,
                  borderColor: `${layer.color}40`,
                }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${layer.color}15`, border: `1px solid ${layer.color}25` }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: layer.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#e2eaf2]">{layer.name}</p>
                    <p className="text-[10px] text-[#5c6b7a]">{layer.tree.name}/</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-lg font-bold" style={{ color: layer.color }}>{layer.files}</p>
                    <p className="text-[10px] text-[#3d4f60]">files</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: layer.color }}>{layer.linesTotal}</p>
                    <p className="text-[10px] text-[#3d4f60]">lines</p>
                  </div>
                  <div
                    className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${layer.color}12`,
                      color: layer.color,
                      border: `1px solid ${layer.color}20`,
                    }}
                  >
                    {layer.tech.split("+")[0].trim()}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Root-level extras */}
        <div className="rounded-lg border border-[rgba(0,229,255,0.06)] bg-space-900/30 px-4 py-2.5 mt-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-[#5c6b7a]">
            <span className="text-[#8899a8] font-medium">Root files:</span>
            <span>PROJECT_README.md</span>
            <span>RESEARCH_EVE_FRONTIER_SUI.md</span>
            <span className="text-[#3d4f60]">ideas/</span>
            <span className="text-[#3d4f60]">docs_fp/</span>
          </div>
        </div>
      </section>

      {/* ── Layer trees ── */}
      {layers.map((layer, i) => (
        <LayerCard key={layer.slug} layer={layer} index={i} />
      ))}

      {/* ── Documentation site (compact) ── */}
      <section>
        <h2
          id="docs-site"
          className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20"
        >
          Documentation Site
        </h2>
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            borderColor: "rgba(255,152,0,0.12)",
            background: "linear-gradient(135deg, rgba(255,152,0,0.03) 0%, rgba(5,8,15,0.5) 100%)",
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3.5 border-b"
            style={{ borderColor: "rgba(255,152,0,0.12)" }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(255,152,0,0.12)] border border-[rgba(255,152,0,0.2)]">
              <BookOpen className="w-4 h-4 text-[#ff9800]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#e2eaf2]">docs_fp/</p>
              <p className="text-[11px] text-[#5c6b7a]">Next.js 16 documentation site (this site)</p>
            </div>
          </div>
          <div className="py-2">
            {docsTree.children?.map((child, i) => (
              <TreeItem
                key={child.name}
                node={child}
                depth={0}
                accentColor="#ff9800"
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Library Files ── */}
      <section>
        <h2
          id="lib-files"
          className="text-2xl font-bold tracking-tight text-[#e2eaf2] mb-4 scroll-mt-20"
        >
          Key Library Files
        </h2>
        <div className="overflow-x-auto my-4">
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Purpose</th>
                <th>Key Exports</th>
              </tr>
            </thead>
            <tbody>
              {keyLibs.map((lib) => (
                <tr key={lib.file}>
                  <td className="text-[#e2eaf2]">{lib.file}</td>
                  <td className="text-[#8899a8]">{lib.purpose}</td>
                  <td className="text-[#5c6b7a]">
                    <code>{lib.exports}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Callout variant="info">
        The contract is deployed to Sui Testnet. Package ID:{" "}
        <code>0x6618...bbc9</code>. PulseRegistry:{" "}
        <code>0x945f...32c4</code>.
      </Callout>
    </PageWrapper>
  );
}
