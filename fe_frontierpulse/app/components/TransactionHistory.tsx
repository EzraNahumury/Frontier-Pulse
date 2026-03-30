"use client";
import { useState, useEffect } from "react";

interface OracleTx {
  digest: string;
  timestamp: number | null;
  sender: string;
  status: string;
  txType: string;
  details: string;
  moveCalls: number;
  gasMist: number;
  gasSui: string;
}

interface TxResponse {
  transactions: OracleTx[];
  total: number;
  registryId: string;
  packageId: string;
}

const TX_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  system_health: { label: "System Health", color: "#00ff88", icon: "SYS" },
  chi_update:    { label: "CHI Update",    color: "#00e5ff", icon: "CHI" },
  reputation:    { label: "Reputation",    color: "#a78bfa", icon: "REP" },
  alerts:        { label: "Alerts",        color: "#ff9800", icon: "ALR" },
  oracle_init:   { label: "Oracle Init",   color: "#f472b6", icon: "INI" },
  unknown:       { label: "Transaction",   color: "#5c6b7a", icon: "TX" },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function shortenDigest(d: string): string {
  return d.length > 16 ? `${d.slice(0, 8)}...${d.slice(-6)}` : d;
}

export default function TransactionHistory() {
  const [data, setData] = useState<TxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/transactions")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="panel-glass px-4 py-3 w-full">
        <div className="text-[9px] text-[#3d4a5c] uppercase tracking-wider">Loading transactions...</div>
      </div>
    );
  }

  if (!data || data.transactions.length === 0) {
    return (
      <div className="panel-glass px-4 py-3 w-full">
        <div className="text-[9px] text-[#3d4a5c] uppercase tracking-wider">No oracle transactions found</div>
      </div>
    );
  }

  const txList = expanded ? data.transactions : data.transactions.slice(0, 5);

  // Aggregate stats
  const totalGas = data.transactions.reduce((s, t) => s + t.gasMist, 0);
  const systemUpdates = data.transactions.filter((t) => t.txType === "system_health").length;
  const chiUpdates = data.transactions.filter((t) => t.txType === "chi_update").length;

  return (
    <div className="panel-glass px-4 py-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-[9px] text-[#5c6b7a] uppercase tracking-wider">On-Chain Oracle History</div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#00ff88]/8 border border-[#00ff88]/15">
            <div className="w-1 h-1 rounded-full bg-[#00ff88]" />
            <span className="text-[8px] text-[#00ff88]/80 font-mono">{data.total} txs</span>
          </div>
        </div>
        <a
          href={`https://suiscan.xyz/testnet/object/${data.registryId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[8px] text-[#00e5ff]/60 hover:text-[#00e5ff] transition-colors"
        >
          View on Suiscan
        </a>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white/[0.02] rounded px-2 py-1.5 text-center">
          <div className="text-[12px] font-mono font-bold text-[#00ff88]">{systemUpdates}</div>
          <div className="text-[7px] text-[#3d4a5c] uppercase">Sys Batches</div>
        </div>
        <div className="bg-white/[0.02] rounded px-2 py-1.5 text-center">
          <div className="text-[12px] font-mono font-bold text-[#00e5ff]">{chiUpdates}</div>
          <div className="text-[7px] text-[#3d4a5c] uppercase">CHI Updates</div>
        </div>
        <div className="bg-white/[0.02] rounded px-2 py-1.5 text-center">
          <div className="text-[12px] font-mono font-bold text-[#ff9800]">{(totalGas / 1e9).toFixed(4)}</div>
          <div className="text-[7px] text-[#3d4a5c] uppercase">Gas (SUI)</div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="space-y-1">
        {txList.map((tx) => {
          const cfg = TX_TYPE_CONFIG[tx.txType] ?? TX_TYPE_CONFIG.unknown;
          return (
            <a
              key={tx.digest}
              href={`https://suiscan.xyz/testnet/tx/${tx.digest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-1.5 px-2 rounded bg-white/[0.01] hover:bg-white/[0.04] transition-colors group"
            >
              {/* Type badge */}
              <div
                className="w-7 h-5 rounded flex items-center justify-center text-[7px] font-bold shrink-0"
                style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
              >
                {cfg.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#c8d6e5] group-hover:text-[#00e5ff] transition-colors">
                    {cfg.label}
                  </span>
                  {tx.status === "success" ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff3d3d]" />
                  )}
                </div>
                <div className="text-[8px] text-[#3d4a5c] truncate">{tx.details}</div>
              </div>

              {/* Right side */}
              <div className="text-right shrink-0">
                <div className="text-[8px] font-mono text-[#5c6b7a] group-hover:text-[#00e5ff]/60 transition-colors">
                  {shortenDigest(tx.digest)}
                </div>
                <div className="text-[8px] text-[#3d4a5c]">
                  {tx.timestamp ? timeAgo(tx.timestamp) : "..."} · {tx.gasSui} SUI
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Show more / less */}
      {data.transactions.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 text-center text-[9px] text-[#5c6b7a] hover:text-[#00e5ff] transition-colors py-1"
        >
          {expanded ? "Show less" : `Show all ${data.transactions.length} transactions`}
        </button>
      )}
    </div>
  );
}
