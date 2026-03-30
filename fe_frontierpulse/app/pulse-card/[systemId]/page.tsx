import { fetchAllSystems } from "@/lib/worldApi";
import { getSystemVitals } from "@/lib/vitals";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ systemId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { systemId } = await params;
  return {
    title: `Pulse Card — System ${systemId} | Frontier Pulse`,
    description: "EVE Frontier Civilization Health Monitor — System vital signs snapshot",
    openGraph: {
      images: [`/api/pulse-card/${systemId}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/pulse-card/${systemId}`],
    },
  };
}

export default async function PulseCardPage({ params }: Props) {
  const { systemId } = await params;
  const id = parseInt(systemId, 10);

  const systems = await fetchAllSystems();
  const system = systems.find((s) => s.id === id);
  if (!system) notFound();

  const v = getSystemVitals(id);
  const trustColor = v.trustLevel >= 70 ? "#00ff88" : v.trustLevel >= 40 ? "#ff9800" : "#ff3d3d";
  const trustLabel = v.trustLevel >= 70 ? "Healthy" : v.trustLevel >= 40 ? "Stressed" : "Hostile";
  const chiColor = v.localChi >= 65 ? "#00e5ff" : v.localChi >= 40 ? "#ff9800" : "#ff3d3d";

  const metrics = [
    { label: "Activity", value: v.activityLevel, color: v.activityLevel >= 70 ? "#00e5ff" : v.activityLevel >= 40 ? "#ff9800" : "#ff3d3d" },
    { label: "Trust", value: v.trustLevel, color: trustColor },
    { label: "TX Frequency", value: v.txFrequency, color: "#00e5ff" },
  ];

  const stats = [
    { label: "Players", value: v.playerCount },
    { label: "Infrastructure", value: v.infrastructureCount },
    { label: "Combat", value: v.combatIncidents, highlight: v.combatIncidents > 3 },
    { label: "TX Freq", value: v.txFrequency },
  ];

  return (
    <div className="min-h-screen bg-[#04070d] flex flex-col items-center justify-center p-6">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: `radial-gradient(circle, ${trustColor}, transparent)` }}
        />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-[640px]">
        {/* Main card */}
        <div
          className="rounded-2xl overflow-hidden border border-white/[0.06]"
          style={{ background: "linear-gradient(165deg, #0c1220, #060b14, #04070d)" }}
        >
          {/* Header bar */}
          <div className="px-8 pt-7 pb-0 flex items-start justify-between">
            <div>
              <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-white/20 mb-3">
                Frontier Pulse
              </div>
              <h1 className="text-3xl font-bold text-white/90 mb-1.5">{system.name}</h1>
              <p className="text-[11px] text-white/20">
                Region {system.regionId} &middot; Constellation {system.constellationId}
              </p>

              {/* Trust badge */}
              <div
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full"
                style={{
                  background: `${trustColor}10`,
                  border: `1px solid ${trustColor}25`,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: trustColor }} />
                <span className="text-[9px] font-semibold tracking-[0.1em] uppercase" style={{ color: trustColor }}>
                  {trustLabel}
                </span>
              </div>
            </div>

            {/* CHI Score */}
            <div className="text-right">
              <div className="text-5xl font-bold font-mono tabular-nums" style={{ color: chiColor }}>
                {v.localChi}
              </div>
              <div className="text-[9px] text-white/15 tracking-[0.1em] mt-0.5">LOCAL CHI</div>
            </div>
          </div>

          {/* Metrics */}
          <div className="px-8 py-6">
            <div className="border-t border-white/[0.04] pt-5 space-y-4">
              {metrics.map((m) => (
                <div key={m.label} className="flex items-center gap-4">
                  <span className="text-[9px] font-medium tracking-[0.08em] uppercase text-white/20 w-20 shrink-0">
                    {m.label}
                  </span>
                  <div className="flex-1 h-[6px] bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${m.value}%`,
                        background: `linear-gradient(90deg, ${m.color}40, ${m.color})`,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono font-semibold tabular-nums w-8 text-right"
                    style={{ color: m.color }}
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats grid */}
          <div className="px-8 pb-6">
            <div className="border-t border-white/[0.04] pt-5 grid grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-[8px] font-medium tracking-[0.1em] uppercase text-white/15 mb-1">
                    {s.label}
                  </div>
                  <div
                    className="text-xl font-bold font-mono tabular-nums"
                    style={{ color: s.highlight ? "#ff3d3d" : "rgba(255,255,255,0.7)" }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-3 border-t border-white/[0.03] flex items-center justify-between">
            <span className="text-[8px] text-white/10">
              Frontier Pulse &middot; EVE Frontier Civilization Health Monitor
            </span>
            <span className="text-[8px] font-mono text-white/10">
              ID {system.id} &middot; sui-testnet
            </span>
          </div>
        </div>

        {/* Actions below card */}
        <div className="flex items-center justify-between mt-4 px-1">
          <a
            href="/"
            className="text-[11px] text-white/20 hover:text-white/50 transition-colors"
          >
            &larr; Back to Dashboard
          </a>
          <div className="flex items-center gap-3">
            <a
              href={`/api/pulse-card/${systemId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-white/15 hover:text-white/40 transition-colors"
            >
              Open SVG
            </a>
            <button
              onClick={undefined}
              className="text-[10px] text-white/15 hover:text-white/40 transition-colors cursor-default"
              title="Copy image URL"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
