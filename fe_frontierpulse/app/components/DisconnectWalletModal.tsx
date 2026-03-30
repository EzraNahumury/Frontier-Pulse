"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { MIST_PER_SUI } from "@mysten/sui/utils";

interface Props {
  open: boolean;
  address: string;
  onClose: () => void;
  onDisconnect: () => void;
}

function formatSuiAmount(totalBalance?: string): string {
  if (!totalBalance) return "0.00 SUI";
  try {
    const mist = BigInt(totalBalance);
    const whole = mist / MIST_PER_SUI;
    const fraction = (mist % MIST_PER_SUI).toString().padStart(9, "0").slice(0, 2);
    return `${whole.toString()}.${fraction} SUI`;
  } catch {
    return "0.00 SUI";
  }
}

export default function DisconnectWalletModal({ open, address, onClose, onDisconnect }: Props) {
  const [copied, setCopied] = useState(false);

  const { data: balanceData, isLoading } = useSuiClientQuery(
    "getBalance",
    { owner: address },
    { enabled: open && !!address, refetchOnWindowFocus: false },
  );

  const shortAddress = useMemo(() => `${address.slice(0, 6)}...${address.slice(-4)}`, [address]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  }, [address]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[130] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/10" onClick={onClose} />

      <div className="relative w-full max-w-[350px] rounded-[20px] border border-white/10 bg-[#0d131b]/95 px-5 pb-5 pt-5 shadow-2xl shadow-black/45">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white/70"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-4">
          <Image src="/logo/logo.png" alt="Frontier Pulse" width={140} height={38} className="h-[38px] w-auto object-contain" />

          <div className="w-full px-1 text-center">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
              Connected Wallet
            </div>

            <div className="mt-2 text-[14px] leading-none font-semibold text-white">
              {shortAddress}
            </div>

            <div className="mt-3 text-[13px] leading-none text-white/55">
              {isLoading ? "Loading..." : formatSuiAmount(balanceData?.totalBalance)}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-[12px] font-semibold text-[#f0a830]/90 transition-opacity hover:opacity-75"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? "Copied" : "Copy Address"}
          </button>

          <button
            onClick={onDisconnect}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-[12px] font-semibold text-[#f0a830]/90 transition-opacity hover:opacity-75"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Disconnect
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
