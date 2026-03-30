"use client";
import { useState, useCallback } from "react";
import type { PlayerReputation } from "@/lib/types";
import { getTrustColorHex } from "@/lib/colors";

const DIMENSIONS = [
  { key: "reliability" as const, label: "REL", full: "Reliability", angle: -90 },
  { key: "commerce" as const, label: "COM", full: "Commerce", angle: -18 },
  { key: "stewardship" as const, label: "STW", full: "Stewardship", angle: 54 },
  { key: "diplomacy" as const, label: "DIP", full: "Diplomacy", angle: 126 },
  { key: "volatility" as const, label: "VOL", full: "Volatility", angle: 198 },
];

function polarToCart(angleDeg: number, r: number, cx: number, cy: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
}

function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [address]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[10px] font-mono text-[#7a8ba0] hover:text-[#c8d6e5] transition-colors"
      title={address}
    >
      <span>{short}</span>
      {copied ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export default function TrustCompass({ player }: { player: PlayerReputation }) {
  const cx = 110;
  const cy = 110;
  const maxR = 80;
  const levels = [25, 50, 75, 100];
  const trustColor = getTrustColorHex(player.compositeScore);

  const dataPoints = DIMENSIONS.map((dim) => {
    const value = dim.key === "volatility" ? 100 - player[dim.key] : player[dim.key];
    return polarToCart(dim.angle, (value / 100) * maxR, cx, cy);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <div>
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-[#c8d6e5]">{player.name}</div>
          <span className="text-lg font-bold font-mono" style={{ color: trustColor }}>{player.compositeScore}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <CopyAddress address={player.address} />
          <span className="text-[9px] text-[#7a8ba0] uppercase tracking-wider">{player.archetype}</span>
        </div>
      </div>

      {/* Radar chart */}
      <svg viewBox="0 0 220 220" className="w-full max-w-[200px] mx-auto">
        {levels.map((lv) => {
          const pts = DIMENSIONS.map((d) => polarToCart(d.angle, (lv / 100) * maxR, cx, cy));
          const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
          return <path key={lv} d={path} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />;
        })}

        {DIMENSIONS.map((dim) => {
          const end = polarToCart(dim.angle, maxR, cx, cy);
          return <line key={dim.key} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />;
        })}

        <path d={dataPath} fill={`${trustColor}18`} stroke={trustColor} strokeWidth="1.5" />

        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={trustColor} />
        ))}

        {DIMENSIONS.map((dim) => {
          const labelR = maxR + 18;
          const pos = polarToCart(dim.angle, labelR, cx, cy);
          const value = player[dim.key];
          return (
            <g key={dim.key}>
              <text x={pos.x} y={pos.y - 5} textAnchor="middle" className="text-[9px] fill-[#7a8ba0]">{dim.label}</text>
              <text x={pos.x} y={pos.y + 7} textAnchor="middle" className="text-[10px] font-mono fill-[#c8d6e5]">{value}</text>
            </g>
          );
        })}
      </svg>

      {/* Stat bars with labels */}
      <div className="space-y-1.5 mt-3">
        {DIMENSIONS.map((dim) => {
          const val = player[dim.key];
          const isVol = dim.key === "volatility";
          const barColor = isVol
            ? val > 50 ? "#ff3d3d" : val > 25 ? "#ff9800" : "#00ff88"
            : val >= 70 ? "#00ff88" : val >= 40 ? "#ff9800" : "#ff3d3d";
          return (
            <div key={dim.key} className="flex items-center gap-2">
              <span className="text-[8px] text-[#5c6b7a] w-[28px] uppercase tracking-wider shrink-0">{dim.label}</span>
              <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${val}%`, backgroundColor: barColor }} />
              </div>
              <span className="text-[9px] font-mono w-5 text-right shrink-0" style={{ color: barColor }}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
