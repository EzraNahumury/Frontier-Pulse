"use client";
import { useState, useMemo } from "react";
import { useUIStore } from "@/lib/store";
import type { WorldSystem, Alert, PlayerReputation } from "@/lib/types";

interface Props {
  systems: WorldSystem[];
  alerts: Alert[];
  onSelectSystem: (id: number) => void;
  onFocusSystems?: (systemIds: number[]) => void;
}

const severityColors: Record<string, string> = {
  critical: "#ff3d3d", high: "#ff6b35", medium: "#ff9800",
  warning: "#ffd600", info: "#00e5ff",
};

export default function WatchlistPanel({ systems, alerts, onSelectSystem, onFocusSystems }: Props) {
  const {
    walletAddress, watchedSystemIds, personalSystemIds,
    toggleWatchSystem,
  } = useUIStore();

  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<"profile" | "systems" | "alerts">("profile");
  const [player, setPlayer] = useState<(PlayerReputation & { systemIds?: number[] }) | null>(null);
  const [profileLoaded, setProfileLoaded] = useState<string | null>(null);

  // All "my" system IDs
  const mySystemIds = useMemo(() => {
    return [...new Set([...personalSystemIds, ...watchedSystemIds])];
  }, [personalSystemIds, watchedSystemIds]);

  const mySystemIdSet = useMemo(() => new Set(mySystemIds), [mySystemIds]);

  const mySystems = useMemo(() => {
    if (systems.length === 0) return [];
    const map = new Map(systems.map((s) => [s.id, s]));
    return mySystemIds.map((id) => map.get(id)).filter(Boolean) as WorldSystem[];
  }, [systems, mySystemIds]);

  const myAlerts = useMemo(() => {
    if (mySystemIds.length === 0) return [];
    return alerts.filter((a) => mySystemIdSet.has(a.systemId));
  }, [alerts, mySystemIdSet, mySystemIds.length]);

  // Auto-fetch player profile when wallet changes
  const isConnected = !!walletAddress;
  if (isConnected && walletAddress !== profileLoaded) {
    setProfileLoaded(walletAddress);
    fetch(`/api/player/${encodeURIComponent(walletAddress)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setPlayer(data); })
      .catch(() => {});
  }

  const totalCount = mySystemIds.length;

  // ── Collapsed state ──
  if (!expanded) {
    if (!isConnected && totalCount === 0) return null; // Hidden until connected or has pins

    return (
      <button
        onClick={() => setExpanded(true)}
        className="panel flex items-center gap-2 px-3 py-2 hover:border-[#f0a830]/20 transition-all group !rounded-lg"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f0a830" strokeWidth="2" strokeLinecap="round" className="opacity-60">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="text-[10px] text-white/30 group-hover:text-white/50 transition-colors">
          My Pulse
        </span>
        {totalCount > 0 && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#f0a830]/15 text-[#f0a830]/80">
            {totalCount}
          </span>
        )}
      </button>
    );
  }

  // ── Expanded panel ──
  return (
    <div className="panel w-[240px] !p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f0a830" strokeWidth="2" strokeLinecap="round" className="opacity-70">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="text-[11px] font-medium text-white/60">My Pulse</span>
          {isConnected && player && (
            <button
              onClick={() => onFocusSystems?.(mySystemIds)}
              className="text-[8px] text-[#00e5ff]/40 hover:text-[#00e5ff]/80 transition-colors uppercase tracking-wider"
              title="Focus on my systems"
            >
              Focus
            </button>
          )}
        </div>
        <button onClick={() => setExpanded(false)} className="text-[14px] text-white/20 hover:text-white/50 transition-colors px-1">&times;</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.04]">
        {isConnected && player && (
          <button
            onClick={() => setTab("profile")}
            className={`flex-1 text-[9px] py-1.5 uppercase tracking-wider transition-colors ${tab === "profile" ? "text-[#f0a830]/80 border-b border-[#f0a830]/40" : "text-white/20 hover:text-white/40"}`}
          >
            Profile
          </button>
        )}
        <button
          onClick={() => setTab("systems")}
          className={`flex-1 text-[9px] py-1.5 uppercase tracking-wider transition-colors ${tab === "systems" ? "text-[#f0a830]/80 border-b border-[#f0a830]/40" : "text-white/20 hover:text-white/40"}`}
        >
          Systems ({mySystems.length})
        </button>
        <button
          onClick={() => setTab("alerts")}
          className={`flex-1 text-[9px] py-1.5 uppercase tracking-wider transition-colors ${tab === "alerts" ? "text-[#f0a830]/80 border-b border-[#f0a830]/40" : "text-white/20 hover:text-white/40"}`}
        >
          Alerts ({myAlerts.length})
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[240px] overflow-y-auto">
        {/* Profile Tab */}
        {tab === "profile" && player && (
          <div className="px-3 py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[12px] font-medium text-white/70">{player.name}</div>
                <div className="text-[9px] text-[#f0a830]/60 uppercase tracking-wider mt-0.5">{player.archetype}</div>
              </div>
              <div className="text-right">
                <div className="text-[18px] font-mono font-bold text-[#f0a830]">{player.compositeScore}</div>
                <div className="text-[7px] text-white/20 uppercase">Trust</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <RepBar label="Reliability" value={player.reliability} />
              <RepBar label="Commerce" value={player.commerce} />
              <RepBar label="Diplomacy" value={player.diplomacy} />
              <RepBar label="Stewardship" value={player.stewardship} />
              <RepBar label="Volatility" value={player.volatility} invert />
            </div>
          </div>
        )}

        {/* Not connected hint */}
        {tab === "profile" && !player && (
          <div className="px-3 py-4 text-center">
            <p className="text-[10px] text-white/20">Connect wallet in header to see profile</p>
          </div>
        )}

        {/* Systems Tab */}
        {tab === "systems" && (
          mySystems.length > 0 ? (
            <div className="py-1">
              {mySystems.map((s) => {
                const isPinned = watchedSystemIds.includes(s.id);
                const isFromWallet = personalSystemIds.includes(s.id);
                return (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.03] transition-colors group">
                    <button onClick={() => onSelectSystem(s.id)} className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-[#f0a830] shrink-0" />
                        <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors truncate">{s.name}</span>
                      </div>
                      {isFromWallet && !isPinned && (
                        <span className="text-[7px] text-[#f0a830]/40 uppercase tracking-wider ml-2.5">wallet</span>
                      )}
                    </button>
                    <button onClick={() => toggleWatchSystem(s.id)} className="text-[12px] shrink-0 transition-opacity opacity-40 group-hover:opacity-100" title={isPinned ? "Unpin" : "Pin"}>
                      {isPinned ? <span className="text-[#f0a830]">&#9733;</span> : <span className="text-white/20 hover:text-[#f0a830]/50">&#9734;</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-[10px] text-white/20">No systems tracked</p>
              <p className="text-[8px] text-white/10">{isConnected ? "Pin systems from the map" : "Connect wallet or pin systems"}</p>
            </div>
          )
        )}

        {/* Alerts Tab */}
        {tab === "alerts" && (
          myAlerts.length > 0 ? (
            <div className="py-1">
              {myAlerts.slice(0, 20).map((a) => (
                <button key={a.id} onClick={() => onSelectSystem(a.systemId)} className="w-full flex items-start gap-2 px-3 py-1.5 hover:bg-white/[0.03] transition-colors text-left">
                  <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: severityColors[a.severity] || "#00e5ff" }} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-white/40 truncate">{a.systemName}</span>
                      <span className="text-[7px] uppercase tracking-wider shrink-0" style={{ color: severityColors[a.severity] || "#00e5ff", opacity: 0.6 }}>{a.severity}</span>
                    </div>
                    <div className="text-[8px] text-white/20 truncate">{a.description}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-[10px] text-white/20">No alerts for your systems</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function RepBar({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const color = invert
    ? (value >= 70 ? "#ff3d3d" : value >= 40 ? "#ff9800" : "#00ff88")
    : (value >= 70 ? "#00ff88" : value >= 40 ? "#ff9800" : "#ff3d3d");
  return (
    <div className="flex items-center gap-2">
      <span className="text-[8px] text-white/25 w-[62px] uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color, opacity: 0.7 }} />
      </div>
      <span className="text-[9px] font-mono w-5 text-right" style={{ color, opacity: 0.7 }}>{value}</span>
    </div>
  );
}
