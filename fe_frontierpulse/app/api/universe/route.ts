import { NextResponse } from "next/server";
import { fetchAllSystems } from "@/lib/worldApi";
import { readRegistry } from "@/lib/suiReader";
import { getLiveCHI, getActiveSystemIds } from "@/lib/liveData";
import { fetchOracleBackendJson, hasOracleBackend } from "@/lib/oracleBackend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tier = searchParams.get("tier"); // "hot" | "remaining" | null

  if (hasOracleBackend()) {
    const oraclePath = tier ? `/api/universe?tier=${encodeURIComponent(tier)}` : "/api/universe";
    const oracleUniverse = await fetchOracleBackendJson<Record<string, unknown>>(oraclePath, 12000);
    if (oracleUniverse && Array.isArray(oracleUniverse.systems)) {
      return NextResponse.json({
        ...oracleUniverse,
        source: typeof oracleUniverse.source === "string" ? oracleUniverse.source : "railway-oracle",
      });
    }
  }

  // Always fetch systems first. This must succeed for the page to render.
  let systems;
  try {
    systems = await fetchAllSystems();
  } catch {
    return NextResponse.json({
      systems: [],
      chi: {
        overallScore: 0,
        economicVitality: 0,
        securityIndex: 0,
        growthRate: 0,
        connectivity: 0,
        trustIndex: 0,
        socialCohesion: 0,
        diagnosis: "No data",
      },
      totalSystems: 0,
      source: "error-fallback",
    });
  }

  // Sui-dependent data loads separately so systems still render on failures.
  const [onChain, activeIds] = await Promise.all([
    readRegistry().catch(() => null),
    getActiveSystemIds().catch(() => new Set<number>()),
  ]);

  let chi;
  let source: string;
  if (onChain && onChain.chi.overallScore > 0) {
    chi = onChain.chi;
    source = "world-api + sui-testnet";
  } else {
    chi = await getLiveCHI().catch(() => ({
      overallScore: 0,
      economicVitality: 0,
      securityIndex: 0,
      growthRate: 0,
      connectivity: 0,
      trustIndex: 0,
      socialCohesion: 0,
      diagnosis: "No data",
    }));
    source = chi.overallScore > 0
      ? "world-api-live (computed)"
      : "world-api-utopia (computed)";
  }

  if (tier === "remaining") {
    const remaining = systems.filter((s) => !activeIds.has(s.id));
    return NextResponse.json({
      systems: remaining,
      totalSystems: systems.length,
      tier: "remaining",
    });
  }

  if (tier === "hot") {
    const hotSystems = systems.filter((s) => activeIds.has(s.id));
    return NextResponse.json({
      systems: hotSystems,
      chi,
      totalSystems: systems.length,
      hotCount: hotSystems.length,
      source,
      tier: "hot",
      onChain: onChain ? {
        systemsTracked: onChain.stats.totalSystems,
        playersTracked: onChain.stats.totalPlayers,
        lastUpdatedMs: onChain.stats.lastUpdatedMs,
      } : null,
    });
  }

  return NextResponse.json({
    systems,
    chi,
    totalSystems: systems.length,
    source,
    onChain: onChain ? {
      systemsTracked: onChain.stats.totalSystems,
      playersTracked: onChain.stats.totalPlayers,
      lastUpdatedMs: onChain.stats.lastUpdatedMs,
    } : null,
  });
}
