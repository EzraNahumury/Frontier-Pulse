"use client";
import { useState, useEffect, useCallback } from "react";

interface TourStep {
  target: string;       // CSS selector or "center" for no-target modal
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right" | "center" | "bottom-right";
  lightBackdrop?: boolean; // Use lighter backdrop (e.g. for galaxy step)
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "center",
    title: "Welcome to Frontier Pulse",
    description: "A real-time civilization monitor for EVE Frontier's Stillness universe — 24,502 solar systems visualized with player activity, trust scores, and anomaly alerts, powered by on-chain data from the Sui blockchain.",
    position: "center",
  },
  {
    target: "[data-tour='galaxy']",
    title: "The Galaxy Map",
    description: "Each dot is a real solar system. Green = healthy (trust 70+), amber = stressed (40-70), red = hostile (below 40). Scroll to zoom, drag to pan. Click any system to inspect it.",
    position: "bottom-right",
    lightBackdrop: true,
  },
  {
    target: "[data-tour='chi']",
    title: "Civilization Health Index",
    description: "The CHI measures overall universe health across 6 dimensions: economy, security, growth, connectivity, trust, and social cohesion. Computed from real on-chain game data.",
    position: "right",
  },
  {
    target: "[data-tour='filters']",
    title: "Trust Filters",
    description: "Filter the galaxy by trust level to spot patterns. Where are the safe trade routes? Where is conflict breaking out? Use these to focus on what matters.",
    position: "top",
  },
  {
    target: "[data-tour='connect']",
    title: "Connect Your Wallet",
    description: "Link your Sui wallet (or paste your address) to personalize the view. The map auto-zooms to your systems, shows your pilot reputation, and tracks your watchlist.",
    position: "bottom",
  },
  {
    target: "center",
    title: "How to Appear on the Map",
    description: "Frontier Pulse detects your location from on-chain data. To be visible:\n\n1. Deploy a structure (Turret, Gate, Network Node, etc.) in a solar system.\n\n2. Add fuel to bring it ONLINE.\n\nOnce online, your location is recorded on-chain and the map pinpoints your system automatically.",
    position: "center",
  },
  {
    target: "center",
    title: "Tribes & Clonebanks",
    description: "Every pilot belongs to a tribe (clonebank). Pilots in the same clonebank often share a starting system. Your tribe members may be nearby but won't appear on Frontier Pulse until they bring a structure online — just deploying or anchoring isn't enough.",
    position: "center",
  },
  {
    target: "[data-tour='search']",
    title: "Search & Explore",
    description: "Press / or Ctrl+K to search any system by name. Click a system to view its intel panel with gate connections, active pilots, infrastructure, and combat activity. Star systems to add them to your watchlist.",
    position: "bottom",
  },
  {
    target: "[data-tour='heartbeat']",
    title: "Universe Heartbeat",
    description: "The live pulse of civilization. White line = overall activity, green line = trust levels. When they diverge, something interesting is happening in the universe.",
    position: "top",
  },
];

const STORAGE_KEY = "frontier-pulse-toured";
const PAD = 8; // Padding around cutout
const TOOLTIP_W = 340;
const TOOLTIP_H_EST = 190;
const GAP = 16;
const MARGIN = 12;

interface Props {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function GuidedTour({ forceOpen, onClose }: Props) {
  const [step, setStep] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; right: number; bottom: number } | null>(null);

  // Auto-show on first visit
  useEffect(() => {
    if (forceOpen) {
      setStep(0); setVisible(true); return;
    }
    const toured = localStorage.getItem(STORAGE_KEY);
    if (!toured) {
      const t = setTimeout(() => { setStep(0); setVisible(true); }, 800);
      return () => clearTimeout(t);
    }
  }, [forceOpen]);

  // Measure target element
  useEffect(() => {
    if (step < 0 || step >= TOUR_STEPS.length) return;
    const s = TOUR_STEPS[step];
    if (s.target === "center") { setRect(null); return; }

    const measure = () => {
      const el = document.querySelector(s.target) as HTMLElement | null;
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PAD,
        left: r.left - PAD,
        right: r.right + PAD,
        bottom: r.bottom + PAD,
      });
    };

    const t = setTimeout(measure, 80);
    return () => clearTimeout(t);
  }, [step]);

  const handleNext = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) setStep(step + 1);
    else handleDismiss();
  }, [step]);

  const handleDismiss = useCallback(() => {
    setVisible(false); setStep(-1);
    localStorage.setItem(STORAGE_KEY, "true");
    onClose?.();
  }, [onClose]);

  // Keyboard
  useEffect(() => {
    if (!visible) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [visible, handleDismiss, handleNext]);

  if (!visible || step < 0 || step >= TOUR_STEPS.length) return null;

  const cur = TOUR_STEPS[step];
  const isCenter = cur.target === "center";
  const isLast = step === TOUR_STEPS.length - 1;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
  const overlayColor = cur.lightBackdrop ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.75)";
  const blurClass = cur.lightBackdrop ? "" : "backdrop-blur-[2px]";

  // ── Tooltip position (clamped) ──
  let tooltipStyle: React.CSSProperties = {};
  const isFixedPos = cur.position === "bottom-right";
  if (isFixedPos) {
    // Fixed position: bottom-right above the heartbeat footer
    tooltipStyle = { bottom: 90, right: MARGIN, width: TOOLTIP_W };
  } else if (!isCenter && rect) {
    let top: number | undefined;
    let left: number | undefined;
    const cx = (rect.left + rect.right) / 2;
    const cy = (rect.top + rect.bottom) / 2;

    switch (cur.position) {
      case "bottom":
        top = rect.bottom + GAP; left = cx - TOOLTIP_W / 2; break;
      case "top":
        top = rect.top - GAP - TOOLTIP_H_EST; left = cx - TOOLTIP_W / 2; break;
      case "right":
        top = cy - TOOLTIP_H_EST / 2; left = rect.right + GAP; break;
      case "left":
        top = cy - TOOLTIP_H_EST / 2; left = rect.left - GAP - TOOLTIP_W; break;
    }
    if (top !== undefined) top = Math.max(MARGIN, Math.min(vh - TOOLTIP_H_EST - MARGIN, top));
    if (left !== undefined) left = Math.max(MARGIN, Math.min(vw - TOOLTIP_W - MARGIN, left));
    tooltipStyle = { top, left, width: TOOLTIP_W };
  }

  return (
    <div className="fixed inset-0 z-[60]" style={{ pointerEvents: "auto" }}>
      {/* ── Overlay: 4 rectangles around the cutout (no z-index manipulation needed) ── */}
      {!isCenter && rect ? (
        <>
          {/* Top */}
          <div className={blurClass} style={{ position: "absolute", top: 0, left: 0, right: 0, height: Math.max(0, rect.top), background: overlayColor, transition: "all 0.4s ease" }} onClick={handleDismiss} />
          {/* Bottom */}
          <div className={blurClass} style={{ position: "absolute", bottom: 0, left: 0, right: 0, top: rect.bottom, background: overlayColor, transition: "all 0.4s ease" }} onClick={handleDismiss} />
          {/* Left */}
          <div className={blurClass} style={{ position: "absolute", top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.bottom - rect.top, background: overlayColor, transition: "all 0.4s ease" }} onClick={handleDismiss} />
          {/* Right */}
          <div className={blurClass} style={{ position: "absolute", top: rect.top, right: 0, left: rect.right, height: rect.bottom - rect.top, background: overlayColor, transition: "all 0.4s ease" }} onClick={handleDismiss} />
          {/* Glow ring around cutout */}
          <div
            className="pointer-events-none"
            style={{
              position: "absolute",
              top: rect.top,
              left: rect.left,
              width: rect.right - rect.left,
              height: rect.bottom - rect.top,
              borderRadius: 10,
              border: "2px solid rgba(240,168,48,0.7)",
              boxShadow: "0 0 40px rgba(240,168,48,0.25), inset 0 0 30px rgba(240,168,48,0.08)",
              transition: "all 0.4s ease",
              animation: "tour-glow 2s ease-in-out infinite",
            }}
          />
        </>
      ) : (
        /* Full overlay for center steps */
        <div className={blurClass} style={{ position: "absolute", inset: 0, background: overlayColor, transition: "background 0.4s ease" }} onClick={handleDismiss} />
      )}

      {/* ── Tooltip ── */}
      <div
        key={step}
        className={isCenter ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] z-[61]" : `fixed z-[61]`}
        style={{
          ...(isCenter ? {} : tooltipStyle),
          animation: "tour-tooltip-in 0.35s ease-out",
        }}
      >
        <div className="panel px-5 py-4">
          {/* Step dots */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === step ? "w-5 bg-[#f0a830]" : i < step ? "w-1.5 bg-[#f0a830]/40" : "w-1.5 bg-white/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-[9px] text-white/25 font-mono">{step + 1}/{TOUR_STEPS.length}</span>
          </div>

          {step === 0 && (
            <div className="flex justify-center mb-3">
              <img src="/logo/logo.png" alt="Frontier Pulse" className="h-8" />
            </div>
          )}
          <h3 className="text-[15px] font-semibold text-white/90 mb-2">{step === 0 ? "" : cur.title}</h3>
          <p className="text-[12px] text-white/50 leading-relaxed mb-5 whitespace-pre-line">{cur.description}</p>

          <div className="flex items-center justify-between">
            <button onClick={handleDismiss} className="text-[10px] text-white/25 hover:text-white/50 transition-colors">
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="text-[10px] px-3 py-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all">
                  Back
                </button>
              )}
              <button onClick={handleNext} className="text-[11px] px-5 py-2 rounded-lg bg-[#f0a830]/20 text-[#f0a830] hover:bg-[#f0a830]/30 transition-all font-medium uppercase tracking-wider">
                {isLast ? "Start Exploring" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tour-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(240,168,48,0.2), inset 0 0 20px rgba(240,168,48,0.06); }
          50% { box-shadow: 0 0 50px rgba(240,168,48,0.35), inset 0 0 30px rgba(240,168,48,0.12); }
        }
        @keyframes tour-tooltip-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
