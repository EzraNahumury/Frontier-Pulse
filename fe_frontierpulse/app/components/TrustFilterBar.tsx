"use client";
import { useMemo } from "react";
import type { WorldSystem } from "@/lib/types";
import type { TrustFilter } from "./GalaxyCanvas";
import { getSystemVitals } from "@/lib/vitals";

interface Props {
  systems: WorldSystem[];
  activeFilters: Set<TrustFilter>;
  onToggleFilter: (filter: TrustFilter) => void;
}

const FILTERS: { key: TrustFilter; label: string; color: string; test: (t: number) => boolean }[] = [
  { key: "all", label: "All", color: "#b8c7d6", test: () => true },
  { key: "healthy", label: "Healthy", color: "#00ff88", test: (t) => t >= 70 },
  { key: "stressed", label: "Stressed", color: "#ff9800", test: (t) => t >= 40 && t < 70 },
  { key: "hostile", label: "Hostile", color: "#ff3d3d", test: (t) => t < 40 },
];

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function TrustFilterBar({ systems, activeFilters, onToggleFilter }: Props) {
  const counts = useMemo(() => {
    const c = { all: systems.length, healthy: 0, stressed: 0, hostile: 0 };
    for (const sys of systems) {
      const v = getSystemVitals(sys.id);
      if (v.trustLevel >= 70) c.healthy++;
      else if (v.trustLevel >= 40) c.stressed++;
      else c.hostile++;
    }
    return c;
  }, [systems]);

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-xl panel-glass">
      {FILTERS.map(({ key, label, color }) => {
        const isAll = key === "all";
        const isActive = isAll ? activeFilters.has("all") : activeFilters.has(key);
        const count = counts[key];

        return (
          <button
            key={key}
            onClick={() => onToggleFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-medium transition-all duration-200 ${
              isActive
                ? "bg-white/[0.07]"
                : "hover:bg-white/[0.03] opacity-40 hover:opacity-70"
            }`}
            style={isActive ? { color } : { color: "#5c6b7a" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200"
              style={{
                backgroundColor: isActive ? color : "#3d4a5c",
                boxShadow: isActive ? `0 0 4px ${color}40` : "none",
              }}
            />
            <span className="tracking-[0.08em] uppercase">{label}</span>
            <span
              className="font-mono text-[8px] tabular-nums transition-colors"
              style={{ color: isActive ? `${color}80` : "#3d4a5c" }}
            >
              {formatCount(count)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
