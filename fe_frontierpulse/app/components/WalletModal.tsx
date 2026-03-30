"use client";
import { useState, useCallback, useEffect } from "react";
import { useWallets, useConnectWallet } from "@mysten/dapp-kit";
import { createPortal } from "react-dom";
import { useUIStore } from "@/lib/store";

function SuiWalletIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#4DA2FF" />
      <path d="M27.5 14.5c-1.8-1.8-4.2-2.8-6.8-2.8-1.7 0-3.3.4-4.7 1.3l6.3 6.3c.4.4.4 1 0 1.4l-6.3 6.3c1.4.8 3 1.3 4.7 1.3 5.2 0 9.5-4.3 9.5-9.5 0-2.5-1-5-2.7-6.8v2.5z" fill="white" />
      <path d="M12.5 25.5c1.8 1.8 4.2 2.8 6.8 2.8.6 0 1.2-.1 1.8-.2l-6.5-6.5c-.4-.4-.4-1 0-1.4l6.5-6.5c-.6-.1-1.2-.2-1.8-.2-5.2 0-9.5 4.3-9.5 9.5 0 2.5 1 5 2.7 6.8v-4.3z" fill="white" opacity="0.7" />
    </svg>
  );
}

function SuietIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#6FBCF0" />
      <circle cx="20" cy="17" r="6" fill="white" />
      <path d="M12 28c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function EthosIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#6C5CE7" />
      <path d="M14 13h12l-6 14-6-14z" fill="white" opacity="0.9" />
      <path d="M14 13l6 6 6-6" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function NightlyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#1A1A2E" />
      <path d="M25 12a9 9 0 1 1-10 14.7A7 7 0 0 0 25 12z" fill="#E2C044" />
      <circle cx="28" cy="13" r="1.2" fill="#E2C044" />
      <circle cx="30" cy="17" r="0.8" fill="#E2C044" opacity="0.7" />
    </svg>
  );
}

function MartianIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#FF4E17" />
      <circle cx="20" cy="18" r="7" fill="white" opacity="0.9" />
      <circle cx="17" cy="16.5" r="1.5" fill="#FF4E17" />
      <circle cx="23" cy="16.5" r="1.5" fill="#FF4E17" />
      <path d="M16.5 21c0 0 1.5 2 3.5 2s3.5-2 3.5-2" stroke="#FF4E17" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M13 12l3 3M27 12l-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GlassIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#00D4AA" />
      <rect x="11" y="14" width="18" height="12" rx="3" fill="white" opacity="0.9" />
      <path d="M11 18h18" stroke="#00D4AA" strokeWidth="1.5" />
      <circle cx="27" cy="22" r="1.5" fill="#00D4AA" />
    </svg>
  );
}

function ManualEntryIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#E8ECF0" />
      <path d="M15 15h10M15 20h7M15 25h10" stroke="#8896A6" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="27" cy="25" r="2" fill="#8896A6" />
    </svg>
  );
}

const RECOMMENDED_WALLETS = [
  {
    name: "Sui Wallet",
    url: "https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
    icon: SuiWalletIcon,
  },
  {
    name: "Suiet",
    url: "https://chromewebstore.google.com/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd",
    icon: SuietIcon,
  },
  {
    name: "Ethos Wallet",
    url: "https://chromewebstore.google.com/detail/ethos-sui-wallet/mcbigmjiafegjnnogedioegffbooigli",
    icon: EthosIcon,
  },
  {
    name: "Nightly",
    url: "https://chromewebstore.google.com/detail/nightly/fiikommddbeccaoicoejoniammnalkfa",
    icon: NightlyIcon,
  },
  {
    name: "Martian Wallet",
    url: "https://chromewebstore.google.com/detail/martian-aptos-sui-wallet/efbglgofoippbgcjepnhiblaibstadca",
    icon: MartianIcon,
  },
  {
    name: "Glass Wallet",
    url: "https://chromewebstore.google.com/detail/glass-wallet/loipoajkpkipaabcfglnlcmjnphenklg",
    icon: GlassIcon,
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function WalletModal({ open, onClose }: Props) {
  const wallets = useWallets();
  const { mutate: connectWallet, isPending } = useConnectWallet();
  const { setWalletAddress, setPersonalSystems } = useUIStore();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState("");

  const handleClose = useCallback(() => {
    setSelectedWallet(null);
    setShowManualInput(false);
    setManualInput("");
    setManualError("");
    setManualLoading(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showManualInput) {
          setShowManualInput(false);
          setManualInput("");
          setManualError("");
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose, showManualInput]);

  const handleConnect = useCallback((wallet: (typeof wallets)[number]) => {
    setSelectedWallet(wallet.name);
    connectWallet(
      { wallet },
      {
        onSuccess: () => handleClose(),
        onError: () => setSelectedWallet(null),
      },
    );
  }, [connectWallet, handleClose]);

  const handleManualConnect = useCallback(async () => {
    const addr = manualInput.trim();
    if (!addr) return;
    if (!addr.startsWith("0x") || addr.length < 10) {
      setManualError("Invalid address format");
      return;
    }
    setManualLoading(true);
    setManualError("");
    try {
      const res = await fetch(`/api/player/${encodeURIComponent(addr)}`);
      if (res.ok) {
        const data = await res.json();
        setWalletAddress(addr);
        setPersonalSystems(data.systemIds || []);
      } else {
        setWalletAddress(addr);
        setPersonalSystems([]);
      }
      handleClose();
    } catch {
      setManualError("Failed to connect. Please try again.");
      setManualLoading(false);
    }
  }, [manualInput, setWalletAddress, setPersonalSystems, handleClose]);

  if (!open || typeof document === "undefined") return null;

  const installedWallets = wallets;
  const hasInstalled = installedWallets.length > 0;
  const popularWallets = RECOMMENDED_WALLETS.filter(
    (rw) => !installedWallets.some(
      (iw) => iw.name.toLowerCase().includes(rw.name.toLowerCase().split(" ")[0]),
    ),
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative w-full max-w-[760px] max-h-[84vh] overflow-hidden rounded-[22px] border border-white/10 bg-[#171a1f]/95 shadow-2xl shadow-black/35 sm:max-h-[460px]">
        <div className="flex h-full flex-col sm:flex-row">
          <div className="w-full shrink-0 border-b border-white/10 bg-[#24272c] sm:w-[300px] sm:border-b-0 sm:border-r">
            <div className="px-8 pb-4 pt-7">
              <h2 className="text-[18px] font-bold text-white">Connect a Wallet</h2>
            </div>

            <div className="max-h-[260px] overflow-y-auto px-5 pb-5 sm:max-h-none">
              <div className="space-y-1.5">
                {hasInstalled && installedWallets.map((w) => {
                  const isSelected = selectedWallet === w.name;
                  return (
                    <button
                      key={w.name}
                      onClick={() => handleConnect(w)}
                      disabled={isPending || manualLoading}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        isSelected ? "bg-white/12" : "hover:bg-white/6"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-black/25">
                        {w.icon ? (
                          <img
                            src={typeof w.icon === "string" ? w.icon : (w.icon as string)}
                            alt=""
                            className="h-10 w-10 rounded-[10px]"
                          />
                        ) : (
                          <SuiWalletIcon />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-semibold text-white">{w.name}</div>
                        {isSelected && isPending && (
                          <div className="mt-0.5 text-[11px] text-[#b7bfcc]">Connecting...</div>
                        )}
                      </div>
                      {isSelected && isPending && (
                        <span className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      )}
                    </button>
                  );
                })}

                {!hasInstalled && popularWallets.slice(0, 3).map((rw) => {
                  const IconComp = rw.icon;
                  return (
                    <a
                      key={rw.name}
                      href={rw.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/6"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-black/25">
                        <IconComp />
                      </div>
                      <div className="min-w-0 flex-1 truncate text-[15px] font-semibold text-white">
                        {rw.name}
                      </div>
                    </a>
                  );
                })}

                <button
                  onClick={() => setShowManualInput(!showManualInput)}
                  disabled={manualLoading}
                  className={`mt-2 flex w-full items-center gap-3 rounded-xl border-t border-white/10 px-3 pb-2.5 pt-4 text-left transition-colors ${
                    showManualInput ? "bg-white/8" : "hover:bg-white/6"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-black/25">
                    <ManualEntryIcon />
                  </div>
                  <div className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[#d5d9e3]">
                    Enter Address
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="relative flex-1 bg-[#111418] px-7 py-7 sm:px-10">
            <button
              onClick={handleClose}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close wallet modal"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {showManualInput ? (
              /* ── Manual Address Entry Panel ── */
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-full max-w-[320px]">
                  <h3 className="text-[20px] font-bold text-white text-center">
                    Enter Wallet Address
                  </h3>
                  <p className="mt-3 text-[13px] text-[#8f95a3] text-center leading-relaxed">
                    Paste your Sui wallet address to view your systems and reputation without connecting a browser wallet.
                  </p>

                  <div className="mt-8">
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => { setManualInput(e.target.value); setManualError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleManualConnect(); }}
                      placeholder="0x..."
                      autoFocus
                      disabled={manualLoading}
                      className="w-full text-[14px] px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-[#f0a830]/50 transition-colors disabled:opacity-50"
                    />

                    {manualError && (
                      <p className="mt-2 text-[12px] text-[#ff3d3d]">{manualError}</p>
                    )}

                    <button
                      onClick={handleManualConnect}
                      disabled={!manualInput.trim() || manualLoading}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#f0a830]/20 border border-[#f0a830]/30 text-[#f0a830] hover:bg-[#f0a830]/30 disabled:opacity-30 disabled:hover:bg-[#f0a830]/20 transition-all font-semibold text-[14px]"
                    >
                      {manualLoading ? (
                        <>
                          <span className="inline-block h-4 w-4 rounded-full border-2 border-[#f0a830]/30 border-t-[#f0a830] animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        "Link Address"
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => { setShowManualInput(false); setManualInput(""); setManualError(""); }}
                    disabled={manualLoading}
                    className="mt-4 w-full text-center text-[12px] text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
                  >
                    Back to wallet list
                  </button>
                </div>
              </div>
            ) : (
              /* ── Default: What is a Wallet info ── */
              <>
                <h3 className="pr-10 text-center text-[20px] font-bold text-white">
                  What is a Wallet
                </h3>

                <div className="mt-12 space-y-8 sm:mt-14">
                  <section>
                    <h4 className="text-[16px] font-semibold text-white">Easy Login</h4>
                    <p className="mt-3 max-w-[520px] text-[13px] leading-relaxed text-[#8f95a3]">
                      No need to create new accounts and passwords for every website. Just connect your wallet and get going.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-[16px] font-semibold text-white">Store your Digital Assets</h4>
                    <p className="mt-3 max-w-[520px] text-[13px] leading-relaxed text-[#8f95a3]">
                      Send, receive, store, and display your digital assets like NFTs and coins.
                    </p>
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
