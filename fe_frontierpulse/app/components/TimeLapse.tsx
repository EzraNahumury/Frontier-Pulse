"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import type { WorldSystem } from "@/lib/types";
import { getSystemVitals } from "@/lib/vitals";

interface Props {
  systems: WorldSystem[];
}

/**
 * Time-Lapse Replay — animates civilization evolution over simulated time.
 * Generates historical snapshots by varying the hash seed, then plays them
 * as an accelerated animation showing CHI, trust, and activity changes.
 */
export default function TimeLapse({ systems }: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x
  const [range, setRange] = useState<"24h" | "7d" | "30d">("7d");
  const frameRef = useRef(0);
  const startTimeRef = useRef(0);

  const totalFrames = range === "24h" ? 24 : range === "7d" ? 7 * 24 : 30 * 24;
  const durationMs = (totalFrames * 50) / speed; // ~50ms per frame at 1x

  // Compute snapshot at a given progress point
  const getSnapshot = useCallback(
    (t: number) => {
      if (systems.length === 0) return { chi: 0, healthy: 0, stressed: 0, hostile: 0, activity: 0 };

      // Use time offset to create variation in the deterministic hash
      const timeOffset = Math.floor(t * totalFrames);
      const sample = systems.slice(0, 200);

      let totalTrust = 0;
      let totalActivity = 0;
      let healthy = 0;
      let stressed = 0;
      let hostile = 0;

      for (const sys of sample) {
        const base = getSystemVitals(sys.id);
        // Apply time-varying wave to simulate change over time
        const wave = Math.sin((timeOffset + sys.id * 0.01) * 0.15) * 12;
        const trend = Math.sin((timeOffset + sys.id * 0.003) * 0.05) * 8;
        const trust = Math.max(0, Math.min(100, base.trustLevel + wave + trend));
        const activity = Math.max(0, Math.min(100, base.activityLevel + wave * 0.7));

        totalTrust += trust;
        totalActivity += activity;
        if (trust >= 70) healthy++;
        else if (trust >= 40) stressed++;
        else hostile++;
      }

      const n = sample.length;
      const avgTrust = totalTrust / n;
      const avgActivity = totalActivity / n;
      const chi = Math.round((avgActivity * 40 + avgTrust * 60) / 100);

      return { chi, healthy, stressed, hostile, activity: Math.round(avgActivity) };
    },
    [systems, totalFrames],
  );

  // Animation loop
  useEffect(() => {
    if (!playing) return;
    startTimeRef.current = Date.now() - (progress / 100) * durationMs;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / durationMs, 1);
      setProgress(p * 100);

      if (p >= 1) {
        setPlaying(false);
        return;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [playing, durationMs, progress]);

  const snap = getSnapshot(progress / 100);

  const togglePlay = () => {
    if (progress >= 100) setProgress(0);
    setPlaying(!playing);
  };

  // Format time label
  const timeLabel = (() => {
    const frame = Math.floor((progress / 100) * totalFrames);
    if (range === "24h") return `${frame}h ago`;
    if (range === "7d") return `${(frame / 24).toFixed(1)}d ago`;
    return `${(frame / 24).toFixed(0)}d ago`;
  })();

  return (
    <div className="panel-glass px-3 py-2.5 w-[260px]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[9px] text-[#5c6b7a] uppercase tracking-wider">Time-Lapse Replay</div>
        <div className="flex gap-1">
          {(["24h", "7d", "30d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => { setRange(r); setProgress(0); setPlaying(false); }}
              className={`text-[8px] px-1.5 py-0.5 rounded ${
                range === r ? "bg-[#00e5ff]/10 text-[#00e5ff]" : "text-[#3d4a5c] hover:text-[#5c6b7a]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-white/[0.04] rounded-full mb-2 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const p = ((e.clientX - rect.left) / rect.width) * 100;
          setProgress(Math.max(0, Math.min(100, p)));
          setPlaying(false);
        }}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-[#00e5ff] transition-[width] duration-75"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#00e5ff] border-2 border-[#0a0f1a]"
          style={{ left: `calc(${progress}% - 5px)` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-6 h-6 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
          >
            {playing ? (
              <svg width="8" height="10" viewBox="0 0 8 10" fill="#c8d6e5">
                <rect x="0" y="0" width="3" height="10" />
                <rect x="5" y="0" width="3" height="10" />
              </svg>
            ) : (
              <svg width="8" height="10" viewBox="0 0 8 10" fill="#c8d6e5">
                <polygon points="0,0 8,5 0,10" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setSpeed((s) => (s >= 4 ? 1 : s * 2))}
            className="text-[9px] font-mono text-[#5c6b7a] hover:text-[#00e5ff] transition-colors px-1"
          >
            {speed}x
          </button>
        </div>
        <span className="text-[9px] font-mono text-[#5c6b7a]">{timeLabel}</span>
      </div>

      {/* Snapshot stats */}
      <div className="grid grid-cols-4 gap-1 text-center">
        <div>
          <div className="text-[14px] font-mono font-bold text-[#00e5ff]">{snap.chi}</div>
          <div className="text-[7px] text-[#3d4a5c] uppercase">CHI</div>
        </div>
        <div>
          <div className="text-[14px] font-mono font-bold text-[#00ff88]">{snap.healthy}</div>
          <div className="text-[7px] text-[#3d4a5c] uppercase">Healthy</div>
        </div>
        <div>
          <div className="text-[14px] font-mono font-bold text-[#ff9800]">{snap.stressed}</div>
          <div className="text-[7px] text-[#3d4a5c] uppercase">Stressed</div>
        </div>
        <div>
          <div className="text-[14px] font-mono font-bold text-[#ff3d3d]">{snap.hostile}</div>
          <div className="text-[7px] text-[#3d4a5c] uppercase">Hostile</div>
        </div>
      </div>
    </div>
  );
}
