"use client";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { WorldSystem, GateLink, PlayerReputation, Alert, CHIData } from "@/lib/types";
import { useUIStore } from "@/lib/store";
import { getSystemVitals } from "@/lib/vitals";
import { getTrustColorHex } from "@/lib/colors";
import GalaxyCanvas from "./components/GalaxyCanvas";
import type { TrustFilter } from "./components/GalaxyCanvas";
import TrustFilterBar from "./components/TrustFilterBar";
import DualHeartbeat from "./components/DualHeartbeat";
import CHIGauge from "./components/CHIGauge";
import SubIndexBars from "./components/SubIndexBars";
import SystemPanel from "./components/SystemPanel";
import AlertBell from "./components/AlertBell";
import SearchPalette from "./components/SearchPalette";
import Panel from "./components/Panel";
import TimeLapse from "./components/TimeLapse";
import WatchlistPanel from "./components/WatchlistPanel";
import GuidedTour from "./components/GuidedTour";
import WalletModal from "./components/WalletModal";
import DisconnectWalletModal from "./components/DisconnectWalletModal";
import {
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";

function StatBadge({ label, value, trend }: { label: string; value: string; trend?: "up" | "down" }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] text-white/20 uppercase tracking-[0.06em]">{label}</span>
      <span className="text-[11px] font-mono font-medium text-white/50 tabular-nums">{value}</span>
      {trend && (
        <span className={trend === "up" ? "text-[#00ff88]/60 text-[9px]" : "text-[#ff3d3d]/60 text-[9px]"}>
          {trend === "up" ? "\u25B2" : "\u25BC"}
        </span>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { selectedSystemId, selectedPlayerAddress, setSelectedSystem, setSelectedPlayer } = useUIStore();
  const [worldSystems, setWorldSystems] = useState<WorldSystem[]>([]);
  const [players, setPlayers] = useState<PlayerReputation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [chi, setChi] = useState<CHIData>({ overallScore: 0, economicVitality: 0, securityIndex: 0, growthRate: 0, connectivity: 0, trustIndex: 0, socialCohesion: 0, diagnosis: "Loading" });
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState("");
  const [gateLinks, setGateLinks] = useState<GateLink[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<TrustFilter>>(new Set(["all"]));
  const [tourOpen, setTourOpen] = useState(false);

  const { watchedSystemIds: watchedArr, personalSystemIds } = useUIStore();

  // Build a Set of all watched/personal system IDs for the canvas
  const watchedSystemIdSet = useMemo(() => {
    const ids = new Set([...watchedArr, ...personalSystemIds]);
    return ids;
  }, [watchedArr, personalSystemIds]);

  const handleToggleFilter = useCallback((filter: TrustFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (filter === "all") {
        // "All" clears other filters
        return new Set(["all"]);
      }
      // Remove "all" when selecting specific filter
      next.delete("all");
      if (next.has(filter)) {
        next.delete(filter);
        // If nothing left, revert to "all"
        if (next.size === 0) return new Set(["all"]);
      } else {
        next.add(filter);
        // If all three categories selected, switch back to "all"
        if (next.has("healthy") && next.has("stressed") && next.has("hostile")) {
          return new Set(["all"]);
        }
      }
      return next;
    });
  }, []);

  const [totalSystems, setTotalSystems] = useState(0);
  const [loadingRemaining, setLoadingRemaining] = useState(false);
  const [focusRegion, setFocusRegion] = useState<{ cx: number; cy: number; scale: number } | null>(null);

  // Compute focus region from a set of system IDs → zoom to fit them
  const handleFocusSystems = useCallback((systemIds: number[]) => {
    if (systemIds.length === 0 || worldSystems.length === 0) return;
    const map = new Map(worldSystems.map((s) => [s.id, s]));
    const matched = systemIds.map((id) => map.get(id)).filter(Boolean) as WorldSystem[];
    if (matched.length === 0) return;

    // Compute bounding box
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const s of matched) {
      if (s.nx < minX) minX = s.nx;
      if (s.nx > maxX) maxX = s.nx;
      if (s.ny < minY) minY = s.ny;
      if (s.ny > maxY) maxY = s.ny;
    }

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const spanX = maxX - minX + 0.05; // padding
    const spanY = maxY - minY + 0.05;
    const scale = Math.min(8, Math.max(2, 0.6 / Math.max(spanX, spanY)));

    setFocusRegion({ cx, cy, scale });
    // Auto-select first system for detail view
    if (matched.length > 0) setSelectedSystem(matched[0].id);
  }, [worldSystems, setSelectedSystem]);

  const handleResetZoom = useCallback(() => {
    setFocusRegion({ cx: 0.5, cy: 0.5, scale: 1 });
  }, []);

  // Select a system AND zoom to it — used for non-map navigation
  // (search, constellation neighbors, watchlist, alerts, hint panel)
  const handleSelectAndZoom = useCallback((id: number | null) => {
    setSelectedSystem(id);
    if (id === null) return;
    const sys = worldSystems.find((s) => s.id === id);
    if (!sys) return;
    setFocusRegion({ cx: sys.nx, cy: sys.ny, scale: 5 });
  }, [worldSystems, setSelectedSystem]);

  // Progressive data loading: hot systems first, then all remaining (full data)
  useEffect(() => {
    // Phase 1: Load hot (active) systems + alerts — fast, small payload
    Promise.all([
      fetch("/api/universe?tier=hot").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
    ])
      .then(([universeData, alertsData]) => {
        setWorldSystems(universeData.systems || []);
        setTotalSystems(universeData.totalSystems || 0);
        if (universeData.chi) setChi(universeData.chi);
        setDataSource(universeData.source || "unknown");
        setAlerts(alertsData.alerts || []);
        setLoading(false); // UI is now interactive!

        // Phase 2: Load remaining systems (full data — needed for search, panels, etc.)
        setLoadingRemaining(true);
        fetch("/api/universe?tier=remaining")
          .then((r) => r.json())
          .then((data) => {
            if (data.systems?.length) {
              setWorldSystems((prev) => [...prev, ...data.systems]);
            }
          })
          .catch(() => {})
          .finally(() => setLoadingRemaining(false));
      })
      .catch(() => setDataSource("error"))
      .finally(() => setLoading(false));
  }, []);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const selectedSystem = useMemo(
    () => worldSystems.find((s) => s.id === selectedSystemId) ?? null,
    [selectedSystemId, worldSystems]
  );

  const [selectedPlayer, setSelectedPlayerData] = useState<PlayerReputation | null>(null);

  // Fetch player data when address changes
  useEffect(() => {
    if (!selectedPlayerAddress) {
      setSelectedPlayerData(null);
      return;
    }
    fetch(`/api/player/${encodeURIComponent(selectedPlayerAddress)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setSelectedPlayerData(data))
      .catch(() => setSelectedPlayerData(null));
  }, [selectedPlayerAddress]);

  // Clear gate links when system changes
  useEffect(() => { setGateLinks([]); }, [selectedSystemId]);

  // Auto-zoom to personal systems once both worldSystems and personalSystemIds are ready.
  // Handles the race condition where wallet auto-connects before systems finish loading.
  const zoomedForRef = useRef<string>("");
  useEffect(() => {
    if (personalSystemIds.length === 0 || worldSystems.length === 0) return;
    const key = personalSystemIds.slice().sort().join(",");
    if (key === zoomedForRef.current) return;
    // Only zoom once we know the systems are in the loaded data
    const systemMap = new Map(worldSystems.map((s) => [s.id, s]));
    const hasMatch = personalSystemIds.some((id) => systemMap.has(id));
    if (!hasMatch) return;
    zoomedForRef.current = key;
    handleFocusSystems(personalSystemIds);
  }, [personalSystemIds, worldSystems, handleFocusSystems]);

  const handleGateLinksLoaded = useCallback((links: GateLink[]) => {
    setGateLinks(links);
  }, []);

  const handleSearchSelect = useCallback((id: number) => {
    handleSelectAndZoom(id);
  }, [handleSelectAndZoom]);

  const isLive = dataSource.includes("evefrontier") || dataSource.includes("world-api") || dataSource.includes("sui-testnet");

  // Pick a few "notable" systems for the hint panel
  const notableSystems = useMemo(() => {
    if (worldSystems.length === 0) return [];
    return worldSystems
      .slice(0, 500)
      .map((s) => ({ ...s, vitals: getSystemVitals(s.id) }))
      .sort((a, b) => b.vitals.activityLevel - a.vitals.activityLevel)
      .slice(0, 5);
  }, [worldSystems]);

  return (
    <div className="h-screen flex flex-col bg-space-950 overflow-hidden">
      {/* ── Header ── */}
      <header className="h-14 shrink-0 border-b border-white/[0.06] flex items-center justify-between px-5 bg-[rgba(5,8,15,0.9)] backdrop-blur-xl z-30 relative">
        <div className="flex items-center gap-3">
          <img src="/logo/logo.png" alt="Frontier Pulse" className="h-6" />
          {isLive && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#00ff88]/[0.08]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-[8px] text-[#00ff88]/70 uppercase tracking-[0.1em] font-medium">Live</span>
            </div>
          )}

          <button
            data-tour="search"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all ml-1"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(200,215,230,0.5)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="text-[10px] text-white/50 hidden sm:inline">Search systems</span>
            <kbd className="text-[8px] text-white/25 px-1 py-0.5 rounded bg-white/[0.04] hidden sm:inline">
              /
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* ── Info ── */}
          <span className="text-[10px] text-white/40 font-mono tabular-nums hidden sm:inline">
            {loading ? "..." : (
              loadingRemaining
                ? <>{worldSystems.length.toLocaleString()} / {totalSystems.toLocaleString()}</>
                : <>{worldSystems.length.toLocaleString()} systems</>
            )}
          </span>

          <div className="flex items-center gap-1.5" title="Civilization Health Index">
            <span className="text-[9px] text-white/40 uppercase tracking-[0.08em]">chi</span>
            <span className="text-[13px] font-mono font-bold text-white/80 tabular-nums">{chi.overallScore}</span>
          </div>

          <Link
            href="/transactions"
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#f0a830]/35 bg-[#f0a830]/12 text-[#f0a830] hover:bg-[#f0a830]/20 hover:border-[#f0a830]/55 transition-all"
            title="Open transaction log"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span className="text-[10px] uppercase tracking-[0.08em] font-semibold">Transactions</span>
          </Link>

          <AlertBell alerts={alerts} />

          {/* ── Separator ── */}
          <div className="w-px h-5 bg-white/[0.08]" />

          {/* ── Primary actions ── */}
          <button
            onClick={() => setTourOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-white/60 hover:text-white/90 transition-all"
            title="How it works"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-[10px] hidden sm:inline font-medium">Guide</span>
          </button>

          <div data-tour="connect">
            <HeaderWallet onFocusSystems={handleFocusSystems} />
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 relative overflow-hidden" data-tour="galaxy">
        <GalaxyCanvas
          systems={worldSystems}
          gateLinks={gateLinks}
          selectedSystemId={selectedSystemId}
          onSelectSystem={setSelectedSystem}
          loading={loading}
          activeFilters={activeFilters}
          watchedSystemIds={watchedSystemIdSet}
          focusRegion={focusRegion}
        />

        {/* CHI Gauge — top left */}
        <div className="absolute top-4 left-4 z-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div data-tour="chi" className="w-fit">
            <Panel className="w-[190px]">
              <CHIGauge data={chi} />
              <div className="mt-3 pt-3 border-t border-white/[0.03]">
                <SubIndexBars data={chi} />
              </div>
            </Panel>
          </div>

          {/* Time-Lapse Replay — below CHI */}
          {!loading && worldSystems.length > 0 && (
            <div data-tour="timelapse" className="mt-2 animate-fade-in w-fit" style={{ animationDelay: "0.5s" }}>
              <TimeLapse systems={worldSystems} />
            </div>
          )}

        </div>

        {/* ── Right area: My Pulse (left) + System Intel / Hint (right) ── */}
        <div className="absolute top-4 right-4 z-10 flex flex-row-reverse items-start gap-2">
          {/* System Detail or Hint — rightmost */}
          {selectedSystem ? (
            <div className="animate-fade-in">
              <Panel title="System Intel" className="w-[320px] max-h-[calc(100vh-180px)] overflow-y-auto">
                <SystemPanel
                  system={selectedSystem}
                  allSystems={worldSystems}
                  players={players}
                  selectedPlayer={selectedPlayer}
                  onSelectPlayer={setSelectedPlayer}
                  onSelectSystem={handleSelectAndZoom}
                  gateLinks={gateLinks}
                  onGateLinksLoaded={handleGateLinksLoaded}
                />
              </Panel>
              <button
                onClick={() => setSelectedSystem(null)}
                className="mt-1 w-full text-center text-[10px] text-[#5c6b7a] hover:text-[#00e5ff] transition-colors py-1"
              >
                Close Panel
              </button>
            </div>
          ) : !loading && worldSystems.length > 0 ? (
            <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="panel px-4 py-3.5 w-[220px]">
                <p className="text-[10px] text-white/25 mb-3">Select a system to inspect</p>

                {notableSystems.length > 0 && (
                  <div>
                    <div className="text-[8px] text-white/15 uppercase tracking-[0.1em] mb-2">Most Active</div>
                    <div className="space-y-0.5">
                      {notableSystems.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleSelectAndZoom(s.id)}
                          className="w-full flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-white/[0.03] transition-all text-left group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-1 h-1 rounded-full shrink-0"
                              style={{ backgroundColor: getTrustColorHex(s.vitals.trustLevel) }}
                            />
                            <span className="text-[10px] text-white/35 group-hover:text-white/60 transition-colors truncate">{s.name}</span>
                          </div>
                          <span className="text-[9px] font-mono text-white/15 tabular-nums shrink-0 ml-2">
                            {s.vitals.activityLevel}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-2.5 border-t border-white/[0.03]">
                  <div className="flex items-center justify-center gap-3">
                    <LegendDot color="#00ff88" label="Healthy" />
                    <LegendDot color="#ff9800" label="Stressed" />
                    <LegendDot color="#ff3d3d" label="Hostile" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* My Pulse — to the left of System Intel, collapsible */}
          {!loading && (
            <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <WatchlistPanel
                systems={worldSystems}
                alerts={alerts}
                onSelectSystem={handleSelectAndZoom}
                onFocusSystems={handleFocusSystems}
              />
            </div>
          )}
        </div>

        {/* Trust filter — bottom center */}
        {!loading && worldSystems.length > 0 && (
          <div data-tour="filters" className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <TrustFilterBar
              systems={worldSystems}
              activeFilters={activeFilters}
              onToggleFilter={handleToggleFilter}
            />
          </div>
        )}

        {/* Reset zoom button */}
        {focusRegion && focusRegion.scale > 1.05 && (
          <button
            onClick={handleResetZoom}
            className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(5,8,15,0.85)] backdrop-blur-xl border border-[#00e5ff]/20 hover:border-[#00e5ff]/40 text-[10px] text-[#00e5ff]/60 hover:text-[#00e5ff] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            Reset View
          </button>
        )}

        <div className="absolute bottom-2 left-4 z-10 flex items-center gap-2">
          <span className="text-[9px] text-white/20 font-mono">
            {worldSystems.length.toLocaleString()} systems
          </span>
          <span className="text-[7px] text-white/10 font-mono">
            {dataSource || "..."}
          </span>
        </div>
      </main>

      {/* ── Heartbeat ── */}
      <footer data-tour="heartbeat" className="h-[72px] shrink-0 border-t border-white/[0.03] relative z-10 bg-space-950">
        <DualHeartbeat />
      </footer>

      {/* ── Search Palette ── */}
      <SearchPalette
        systems={worldSystems}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectSystem={handleSearchSelect}
      />

      {/* ── Guided Tour (auto-shows on first visit, re-openable via Guide button) ── */}
      <GuidedTour
        forceOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color, opacity: 0.6 }} />
      <span className="text-[8px] text-white/20">{label}</span>
    </div>
  );
}

function HeaderWallet({ onFocusSystems }: { onFocusSystems: (ids: number[]) => void }) {
  const { walletAddress, setWalletAddress, setPersonalSystems, clearWatchlist } = useUIStore();
  const account = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [loadingPlayer, setLoadingPlayer] = useState(false);

  // Sync wallet address from dApp kit account to store.
  // Uses a ref instead of comparing against stored walletAddress so that
  // auto-reconnect (where walletAddress is already restored from localStorage)
  // still triggers the player data fetch.
  const fetchedRef = useRef<string | null>(null);
  useEffect(() => {
    const addr = account?.address;
    if (!addr || addr === fetchedRef.current) return;
    fetchedRef.current = addr;
    setWalletAddress(addr);
    setLoadingPlayer(true);
    fetch(`/api/player/${encodeURIComponent(addr)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setPersonalSystems(data.systemIds || []);
        } else {
          setPersonalSystems([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPlayer(false));
  }, [account?.address, setWalletAddress, setPersonalSystems]);

  const handleDisconnect = useCallback(() => {
    setDisconnectModalOpen(false);
    setModalOpen(false);
    if (account) {
      disconnectWallet(undefined, {
        onSettled: () => {
          clearWatchlist();
        },
      });
      return;
    }
    clearWatchlist();
  }, [account, disconnectWallet, clearWatchlist]);

  // Connected state
  const displayAddress = account?.address || walletAddress;
  if (displayAddress) {
    return (
      <>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f0a830]/[0.08] border border-[#f0a830]/20">
            {loadingPlayer ? (
              <span className="inline-block h-3 w-3 rounded-full border-2 border-[#f0a830]/30 border-t-[#f0a830] animate-spin" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-[#f0a830] animate-pulse" />
            )}
            <span className="text-[10px] font-mono text-[#f0a830]/80">
              {loadingPlayer ? "Loading..." : `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`}
            </span>
            {!loadingPlayer && account && (
              <span className="text-[7px] text-[#00ff88]/50 uppercase tracking-wider ml-0.5">wallet</span>
            )}
          </div>
          <button
            onClick={() => setDisconnectModalOpen(true)}
            className="text-[10px] text-white/40 hover:text-[#ff3d3d]/70 transition-colors"
          >
            Disconnect
          </button>
        </div>
        <DisconnectWalletModal
          open={disconnectModalOpen}
          address={displayAddress}
          onClose={() => setDisconnectModalOpen(false)}
          onDisconnect={() => {
            handleDisconnect();
          }}
        />
      </>
    );
  }

  // Default: connect button + modal
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#f0a830]/35 bg-[#f0a830]/12 text-[#f0a830] hover:bg-[#f0a830]/20 hover:border-[#f0a830]/55 transition-all"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-90">
          <rect x="2" y="6" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
        <span className="text-[10px] uppercase tracking-[0.08em] font-semibold">Connect</span>
      </button>

      <WalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
