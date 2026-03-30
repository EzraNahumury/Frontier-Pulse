"use client";
import { getChiColor } from "@/lib/colors";
import type { CHIData } from "@/lib/types";

export default function CHIGauge({ data }: { data: CHIData }) {
  const radius = 48;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.overallScore / 100) * circumference;
  const color = getChiColor(data.overallScore);

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Outer track */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${color}30)` }}
        />
        {/* Score */}
        <text
          x="60" y="55"
          textAnchor="middle"
          className="fill-white/90"
          style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "26px", fontWeight: 700 }}
        >
          {data.overallScore}
        </text>
        <text
          x="60" y="72"
          textAnchor="middle"
          style={{ fontSize: "8px", fontWeight: 500, letterSpacing: "0.12em", fill: "rgba(140,160,180,0.45)" }}
        >
          CIV. HEALTH
        </text>
      </svg>
      <span
        className="text-[10px] font-semibold tracking-[0.15em] uppercase -mt-1"
        style={{ color }}
      >
        {data.diagnosis}
      </span>
    </div>
  );
}
