"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { WorldSystem } from "@/lib/types";
import { getSystemVitals } from "@/lib/vitals";
import { getTrustColorHex } from "@/lib/colors";

interface Props {
  systems: WorldSystem[];
  open: boolean;
  onClose: () => void;
  onSelectSystem: (id: number) => void;
}

export default function SearchPalette({ systems, open, onClose, onSelectSystem }: Props) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search results — substring match, max 30 results
  const results = useMemo(() => {
    if (!query.trim()) {
      // Show some notable systems when no query
      return systems
        .filter((_, i) => i < 200) // Scan first 200 for variety
        .sort((a, b) => {
          const va = getSystemVitals(a.id);
          const vb = getSystemVitals(b.id);
          return vb.activityLevel - va.activityLevel;
        })
        .slice(0, 12);
    }
    const q = query.toLowerCase();
    const matches: WorldSystem[] = [];
    // Prioritize starts-with, then contains
    const startsWith: WorldSystem[] = [];
    const contains: WorldSystem[] = [];
    for (const sys of systems) {
      const lower = sys.name.toLowerCase();
      if (lower.startsWith(q)) startsWith.push(sys);
      else if (lower.includes(q)) contains.push(sys);
      if (startsWith.length + contains.length >= 30) break;
    }
    return [...startsWith, ...contains].slice(0, 30);
  }, [query, systems]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.children[activeIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[activeIndex]) {
        e.preventDefault();
        onSelectSystem(results[activeIndex].id);
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, activeIndex, onSelectSystem, onClose]
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Palette */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-[520px] z-50 animate-fade-in">
        <div className="panel-glass rounded-xl overflow-hidden shadow-2xl border border-[rgba(0,229,255,0.15)]">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7a8ba0" strokeWidth="2" strokeLinecap="round" className="shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search solar systems..."
              className="flex-1 bg-transparent text-sm text-[#c8d6e5] placeholder-[#3d4a5c] outline-none"
              spellCheck={false}
            />
            <kbd className="text-[9px] text-[#3d4a5c] px-1.5 py-0.5 rounded border border-white/[0.06] bg-white/[0.02]">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[360px] overflow-y-auto py-1">
            {results.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-[#3d4a5c]">
                No systems found for &quot;{query}&quot;
              </div>
            ) : (
              <>
                {!query.trim() && (
                  <div className="px-4 pt-1 pb-1.5">
                    <span className="text-[9px] text-[#3d4a5c] uppercase tracking-wider">
                      Notable Systems
                    </span>
                  </div>
                )}
                {results.map((sys, i) => {
                  const vitals = getSystemVitals(sys.id);
                  const trustColor = getTrustColorHex(vitals.trustLevel);
                  const isActive = i === activeIndex;
                  return (
                    <button
                      key={sys.id}
                      onClick={() => {
                        onSelectSystem(sys.id);
                        onClose();
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                        isActive ? "bg-[rgba(0,229,255,0.08)]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      {/* Trust dot */}
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: trustColor, boxShadow: `0 0 4px ${trustColor}40` }}
                      />
                      {/* System info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-[#c8d6e5] font-medium truncate">
                            {highlightMatch(sys.name, query)}
                          </span>
                          <span className="text-[9px] text-[#3d4a5c] font-mono shrink-0">
                            ID {sys.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[9px] text-[#3d4a5c]">
                            Constellation {sys.constellationId}
                          </span>
                          <span className="text-[9px] text-[#3d4a5c]">
                            Region {sys.regionId}
                          </span>
                        </div>
                      </div>
                      {/* Quick vitals */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-[9px] text-[#5c6b7a]">ACT</div>
                          <div className="text-[10px] font-mono text-[#8a96a5]">{vitals.activityLevel}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-[#5c6b7a]">TRS</div>
                          <div className="text-[10px] font-mono" style={{ color: trustColor }}>
                            {vitals.trustLevel}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-white/[0.04] flex items-center gap-4">
            <span className="text-[9px] text-[#3d4a5c]">
              {systems.length.toLocaleString()} systems indexed
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[9px] text-[#3d4a5c] flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-white/[0.06] bg-white/[0.02] text-[8px]">&uarr;&darr;</kbd>
                navigate
              </span>
              <span className="text-[9px] text-[#3d4a5c] flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-white/[0.06] bg-white/[0.02] text-[8px]">&crarr;</kbd>
                select
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Highlight matching portion of text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[#00e5ff]">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}
