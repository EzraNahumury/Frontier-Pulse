"use client";
import { getChiColor } from "@/lib/colors";
import type { CHIData } from "@/lib/types";

const SUB_INDICES: { key: keyof CHIData; abbr: string }[] = [
  { key: "economicVitality", abbr: "ECO" },
  { key: "securityIndex", abbr: "SEC" },
  { key: "growthRate", abbr: "GRW" },
  { key: "connectivity", abbr: "CON" },
  { key: "trustIndex", abbr: "TRS" },
  { key: "socialCohesion", abbr: "SOC" },
];

export default function SubIndexBars({ data }: { data: CHIData }) {
  return (
    <div className="space-y-3">
      {SUB_INDICES.map(({ key, abbr }) => {
        const value = data[key] as number;
        const color = getChiColor(value);
        return (
          <div key={key} className="group">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[9px] font-medium tracking-[0.1em] text-white/25 uppercase">
                {abbr}
              </span>
              <span
                className="text-[11px] font-mono font-semibold tabular-nums"
                style={{ color }}
              >
                {value}
              </span>
            </div>
            <div className="h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${value}%`,
                  background: `linear-gradient(90deg, ${color}60, ${color})`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
