"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

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

function timeAgo(ts: number, now: number): string {
  const diff = now - ts;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ${Math.floor((diff % 60_000) / 1000)}s`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ${Math.floor((diff % 3_600_000) / 60_000)}m`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function shortenDigest(d: string): string {
  if (d.length <= 16) return d;
  return `${d.slice(0, 8)}···${d.slice(-6)}`;
}

function shortenAddress(a: string): string {
  if (a.length <= 16) return a;
  return `${a.slice(0, 8)}···${a.slice(-8)}`;
}

const FUNC_COLORS: Record<string, string> = {
  update_system_health: "#00e5ff",
  update_global_chi: "#f0a830",
  emit_anomaly_alert: "#ff3d3d",
  update_player_reputation: "#7dd3fc",
  issue_oracle_cap: "#00ff88",
};

function getFuncName(tx: OracleTx): string {
  if (tx.txType === "system_health") return "update_system_health";
  if (tx.txType === "chi_update") return "update_global_chi";
  if (tx.txType === "alerts") return "emit_anomaly_alert";
  if (tx.txType === "reputation") return "update_player_reputation";
  if (tx.txType === "oracle_init") return "issue_oracle_cap";
  return "unknown";
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-30 hover:opacity-70 cursor-pointer transition-opacity inline-block ml-1">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

interface PaginationProps {
  clampedPage: number;
  totalPages: number;
  perPage: number;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onPerPageChange: (value: number) => void;
}

function TransactionPagination({
  clampedPage,
  totalPages,
  perPage,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onPerPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 select-none">
        <PagBtn onClick={onFirst} disabled={clampedPage <= 1}>&laquo;</PagBtn>
        <PagBtn onClick={onPrev} disabled={clampedPage <= 1}>&lsaquo;</PagBtn>
        <span className="text-[12px] text-white/45 px-2">
          Page {clampedPage} of {totalPages}
        </span>
        <PagBtn onClick={onNext} disabled={clampedPage >= totalPages}>&rsaquo;</PagBtn>
        <PagBtn onClick={onLast} disabled={clampedPage >= totalPages}>&raquo;</PagBtn>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-white/45 uppercase tracking-[0.08em]">Show</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="border border-white/10 rounded-lg px-2 py-1 text-[12px] text-white/80 bg-white/[0.04] focus:outline-none focus:border-[#f0a830]/50"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const [data, setData] = useState<TxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(0);

  const fetchData = useCallback(() => {
    fetch("/api/transactions")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Initial fetch
  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 5 seconds (real-time)
  useEffect(() => {
    const id = setInterval(fetchData, 5_000);
    return () => clearInterval(id);
  }, [fetchData]);

  // Tick every second for live Age
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const allTx = data?.transactions ?? [];
  const totalPages = Math.max(1, Math.ceil(allTx.length / perPage));
  const clampedPage = Math.min(page, totalPages);
  const startIdx = (clampedPage - 1) * perPage;
  const txList = allTx.slice(startIdx, startIdx + perPage);

  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);

  return (
    <div className="min-h-screen bg-space-950 text-[#b8c7d6]">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[rgba(5,8,15,0.9)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image src="/logo/logo.png" alt="Frontier Pulse" width={170} height={34} className="h-7 w-auto object-contain" />
            </Link>
            <span className="text-white/15">|</span>
            <span className="text-[12px] text-white/55 uppercase tracking-[0.08em]">Oracle Transaction Log</span>
            <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-[#00ff88]/[0.08] border border-[#00ff88]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-[9px] text-[#00ff88]/75 font-medium uppercase tracking-wider">Live</span>
            </div>
          </div>
          <Link
            href="/"
            className="text-[11px] text-white/50 hover:text-[#f0a830] transition-colors px-3 py-1.5 rounded-md border border-white/10 hover:border-[#f0a830]/35"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-6">
        {/* Top pagination */}
        <div className="mb-4">
          <TransactionPagination
            clampedPage={clampedPage}
            totalPages={totalPages}
            perPage={perPage}
            onFirst={goFirst}
            onPrev={goPrev}
            onNext={goNext}
            onLast={goLast}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
          />
        </div>

        {/* Table */}
        <div className="border border-white/[0.08] rounded-lg overflow-hidden bg-[linear-gradient(165deg,rgba(10,16,30,0.94),rgba(6,10,20,0.90))] backdrop-blur-xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="text-left text-[11px] text-white/45 font-medium px-4 py-3 w-[190px] uppercase tracking-[0.08em]">Type / Func</th>
                <th className="text-left text-[11px] text-white/45 font-medium px-4 py-3 uppercase tracking-[0.08em]">
                  <span className="inline-flex items-center gap-1">
                    <InfoIcon />
                    Digest
                  </span>
                </th>
                <th className="text-left text-[11px] text-white/45 font-medium px-4 py-3 w-[100px] uppercase tracking-[0.08em]">Age &darr;</th>
                <th className="text-left text-[11px] text-white/45 font-medium px-4 py-3 w-[170px] uppercase tracking-[0.08em]">
                  <span className="inline-flex items-center gap-1">
                    <InfoIcon />
                    Sender
                  </span>
                </th>
                <th className="text-left text-[11px] text-white/45 font-medium px-4 py-3 w-[110px] uppercase tracking-[0.08em]">Transactions</th>
                <th className="text-right text-[11px] text-white/45 font-medium px-4 py-3 w-[150px] uppercase tracking-[0.08em]">Gas</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-[13px] text-white/45">
                    Loading transactions from Sui testnet...
                  </td>
                </tr>
              )}
              {!loading && txList.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-[13px] text-white/45">
                    No oracle transactions found. Run the oracle first.
                  </td>
                </tr>
              )}
              {txList.map((tx) => {
                const funcName = getFuncName(tx);
                const funcColor = FUNC_COLORS[funcName] ?? "#6b7280";

                return (
                  <tr key={tx.digest} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                    {/* Type / Func */}
                    <td className="px-4 py-3.5">
                      <div className="text-[13px] font-medium text-white/85">Programmable Tx</div>
                      <div className="text-[12px] font-mono" style={{ color: funcColor }}>{funcName}</div>
                    </td>

                    {/* Digest */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://suiscan.xyz/testnet/tx/${tx.digest}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-white/50 hover:text-[#f0a830] transition-colors px-2.5 py-1 rounded border border-white/10 hover:border-[#f0a830]/35 shrink-0"
                        >
                          Details
                        </a>
                        {tx.status === "success" ? (
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0">
                            <circle cx="10" cy="10" r="9" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.2" />
                            <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0">
                            <circle cx="10" cy="10" r="9" fill="#fef2f2" stroke="#ef4444" strokeWidth="1.2" />
                            <path d="M7 7l6 6M13 7l-6 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                        <a
                          href={`https://suiscan.xyz/testnet/tx/${tx.digest}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-mono text-[#f0a830] hover:underline"
                        >
                          {shortenDigest(tx.digest)}
                        </a>
                        <button onClick={() => navigator.clipboard.writeText(tx.digest)} title="Copy digest">
                          <CopyIcon />
                        </button>
                      </div>
                    </td>

                    {/* Age (live) */}
                    <td className="px-4 py-3.5 text-[13px] text-white/60 tabular-nums">
                      {tx.timestamp && now ? timeAgo(tx.timestamp, now) : "..."}
                    </td>

                    {/* Sender */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center">
                        <a
                          href={`https://suiscan.xyz/testnet/account/${tx.sender}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] font-mono text-[#7dd3fc] hover:underline"
                        >
                          {shortenAddress(tx.sender)}
                        </a>
                        <button onClick={() => navigator.clipboard.writeText(tx.sender)} title="Copy address">
                          <CopyIcon />
                        </button>
                      </span>
                    </td>

                    {/* Transactions */}
                    <td className="px-4 py-3.5 text-[14px] font-medium text-white/85 tabular-nums">
                      {tx.moveCalls}
                    </td>

                    {/* Gas */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="text-[13px] text-white/85 tabular-nums">{tx.gasSui} SUI</div>
                      <div className="text-[11px] text-white/40 tabular-nums">{tx.gasMist.toLocaleString()} MIST</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom pagination */}
        <div className="mt-4">
          <TransactionPagination
            clampedPage={clampedPage}
            totalPages={totalPages}
            perPage={perPage}
            onFirst={goFirst}
            onPrev={goPrev}
            onNext={goNext}
            onLast={goLast}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
          />
        </div>
      </main>
    </div>
  );
}

function PagBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-colors ${
        disabled
          ? "text-white/20 cursor-not-allowed"
          : "text-white/45 hover:text-[#f0a830] hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function InfoIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="inline">
      <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
      <path d="M8 5v0M8 7.5v4" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
