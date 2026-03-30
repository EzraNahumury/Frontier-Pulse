"use client";
import { useEffect, useState, useCallback } from "react";
import type { WorldSystem, GateLink, PlayerReputation, SystemVitals } from "@/lib/types";
import { getTrustColorHex } from "@/lib/colors";
import { getSystemVitals } from "@/lib/vitals";
import { useUIStore } from "@/lib/store";
import TrustCompass from "./TrustCompass";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

interface Props {
  system: WorldSystem;
  allSystems: WorldSystem[];
  players: PlayerReputation[];
  selectedPlayer: PlayerReputation | null;
  onSelectPlayer: (address: string | null) => void;
  onSelectSystem: (id: number) => void;
  gateLinks: GateLink[];
  onGateLinksLoaded: (links: GateLink[]) => void;
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[10px] text-[#5c6b7a] uppercase tracking-wider">{label}</span>
      <span className="text-xs font-mono font-medium" style={{ color: color || "#c8d6e5" }}>{value}</span>
    </div>
  );
}

function VitalBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "#00ff88" : value >= 40 ? "#ff9800" : "#ff3d3d";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-[#5c6b7a] w-8 uppercase">{label}</span>
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono w-6 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

const PACKAGE_ID = "0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9";
const REGISTRY_ID = "0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4";
const SUI_CLOCK = "0x0000000000000000000000000000000000000000000000000000000000000006";

function EndorseButton({ systemId }: { systemId: number }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleEndorse = useCallback(() => {
    if (!account) return;
    setStatus("idle");
    setErrorMsg("");

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::frontier_pulse::endorse_system`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.object(SUI_CLOCK),
        tx.pure.u64(BigInt(systemId)),
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => setStatus("success"),
        onError: (err) => {
          setStatus("error");
          const msg = err.message || "Transaction failed";
          if (msg.includes("EAlreadyEndorsed") || msg.includes("abort_code: 4")) {
            setErrorMsg("Already endorsed");
          } else {
            setErrorMsg("Failed to endorse");
          }
        },
      },
    );
  }, [account, systemId, signAndExecute]);

  if (!account) {
    return (
      <div className="text-[9px] text-white/15 text-center py-1">
        Connect wallet to endorse
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-[#00ff88]/70">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Endorsed on-chain
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleEndorse}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00e5ff]/[0.06] border border-[#00e5ff]/15 hover:border-[#00e5ff]/30 hover:bg-[#00e5ff]/[0.1] disabled:opacity-30 transition-all text-[10px] text-[#00e5ff]/70 hover:text-[#00e5ff]"
      >
        {isPending ? (
          <>
            <span className="inline-block w-3 h-3 border border-[#00e5ff]/40 border-t-[#00e5ff] rounded-full animate-spin" />
            Signing...
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            Endorse System
          </>
        )}
      </button>
      {status === "error" && (
        <div className="text-[9px] text-[#ff3d3d]/60 text-center mt-1">{errorMsg}</div>
      )}
    </div>
  );
}

export default function SystemPanel({ system, allSystems, players, selectedPlayer, onSelectPlayer, onSelectSystem, gateLinks, onGateLinksLoaded }: Props) {
  // Fetch live players for this system from API
  const [systemPlayers, setSystemPlayers] = useState<PlayerReputation[]>([]);

  useEffect(() => {
    setSystemPlayers([]);
    fetch(`/api/system/${system.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.players) setSystemPlayers(data.players);
      })
      .catch(() => {});
  }, [system.id]);
  const [loadingGates, setLoadingGates] = useState(false);
  const vitals: SystemVitals = getSystemVitals(system.id);

  // Fetch gate links from World API when system changes
  useEffect(() => {
    let cancelled = false;
    setLoadingGates(true);
    fetch(`/api/world/system/${system.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.gateLinks) {
          onGateLinksLoaded(data.gateLinks);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingGates(false); });
    return () => { cancelled = true; };
  }, [system.id, onGateLinksLoaded]);

  const { watchedSystemIds, toggleWatchSystem } = useUIStore();
  const isWatched = watchedSystemIds.includes(system.id);

  if (selectedPlayer) {
    return (
      <div>
        <button
          onClick={() => onSelectPlayer(null)}
          className="text-[10px] text-[#00e5ff] hover:text-[#00e5ff]/80 mb-3 flex items-center gap-1"
        >
          &larr; Back to {system.name}
        </button>
        <TrustCompass player={selectedPlayer} />
      </div>
    );
  }
  const trustColor = getTrustColorHex(vitals.trustLevel);

  return (
    <div>
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-[#c8d6e5]">{system.name}</h3>
            <button
              onClick={() => toggleWatchSystem(system.id)}
              className="transition-colors"
              title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isWatched ? (
                <span className="text-[#f0a830] text-sm">&#9733;</span>
              ) : (
                <span className="text-white/15 hover:text-[#f0a830]/50 text-sm">&#9734;</span>
              )}
            </button>
          </div>
          <a
            href={`/pulse-card/${system.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[8px] text-[#3d4a5c] hover:text-[#00e5ff] transition-colors px-1.5 py-0.5 rounded border border-white/[0.06] hover:border-[#00e5ff]/20"
            title="Open shareable Pulse Card"
          >
            PULSE CARD
          </a>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] text-[#3d4a5c] font-mono">ID {system.id}</span>
          <span className="text-[9px] text-[#3d4a5c]">&middot;</span>
          <span className="text-[9px] text-[#3d4a5c]">Region {system.regionId}</span>
        </div>
      </div>

      {/* Vitals */}
      <div className="mb-3 space-y-1.5">
        <div className="text-[9px] text-[#5c6b7a] uppercase tracking-wider mb-1">Simulated Vitals</div>
        <VitalBar label="ACT" value={vitals.activityLevel} />
        <VitalBar label="TRS" value={vitals.trustLevel} />
        <VitalBar label="CHI" value={vitals.localChi} />
      </div>

      {/* Stats */}
      <div className="space-y-0 mb-3 py-2 border-t border-b border-white/[0.05]">
        <Stat label="Players" value={vitals.playerCount} />
        <Stat label="Infrastructure" value={vitals.infrastructureCount} />
        <Stat label="TX Frequency" value={vitals.txFrequency} />
        <Stat label="Combat" value={vitals.combatIncidents} color={vitals.combatIncidents > 5 ? "#ff3d3d" : undefined} />
      </div>

      {/* On-Chain Endorsement */}
      <div className="mb-3 py-2 border-b border-white/[0.05]">
        <EndorseButton systemId={system.id} />
      </div>

      {/* Gate Links (REAL from World API) */}
      <div className="mb-3">
        <div className="text-[9px] text-[#5c6b7a] uppercase tracking-wider mb-1.5 flex items-center gap-2">
          <span>Gate Connections</span>
          <span className="text-[#00e5ff]">{loadingGates ? "..." : gateLinks.length}</span>
          <span className="ml-auto text-[8px] text-[#00e5ff]/50">LIVE DATA</span>
        </div>
        {gateLinks.length > 0 ? (
          <div className="space-y-1">
            {gateLinks.map((gl) => (
              <div key={gl.gateId} className="flex items-center gap-2 py-1 px-2 rounded bg-white/[0.02] text-[10px] min-w-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" className="shrink-0 opacity-50">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M2 12h20" />
                </svg>
                <span className="text-[#8a96a5] truncate min-w-0 flex-1">{gl.destinationName}</span>
              </div>
            ))}
          </div>
        ) : !loadingGates ? (
          <span className="text-[10px] text-[#3d4a5c]">No stargates in this system</span>
        ) : null}
      </div>

      {/* Constellation Neighbors */}
      {(() => {
        const neighbors = allSystems
          .filter((s) => s.constellationId === system.constellationId && s.id !== system.id)
          .slice(0, 8);
        if (neighbors.length === 0) return null;
        return (
          <div className="mb-3">
            <div className="text-[9px] text-[#5c6b7a] uppercase tracking-wider mb-1.5">
              Same Constellation ({neighbors.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {neighbors.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onSelectSystem(n.id)}
                  className="text-[10px] text-[#8a96a5] hover:text-[#00e5ff] px-2 py-1 rounded bg-white/[0.02] hover:bg-white/[0.05] transition-colors truncate max-w-[140px]"
                >
                  {n.name}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Players (from World API) */}
      {systemPlayers.length > 0 && (
        <div>
          <div className="text-[9px] text-[#5c6b7a] uppercase tracking-wider mb-1.5">
            Known Pilots
            <span className="ml-1 text-[8px] text-[#00e5ff]/50">({systemPlayers.length})</span>
          </div>
          <div className="space-y-1">
            {systemPlayers.slice(0, 10).map((p) => (
                <button
                  key={p.address}
                  onClick={() => onSelectPlayer(p.address)}
                  className="w-full flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-[#c8d6e5] truncate">{p.name}</div>
                    <div className="text-[9px] text-[#3d4a5c]">{p.archetype}</div>
                  </div>
                  <span className="text-xs font-mono font-bold shrink-0" style={{ color: getTrustColorHex(p.compositeScore) }}>
                    {p.compositeScore}
                  </span>
                </button>
              ))}
            {systemPlayers.length > 10 && (
              <div className="text-[9px] text-[#3d4a5c] text-center py-1">
                +{systemPlayers.length - 10} more pilots
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
