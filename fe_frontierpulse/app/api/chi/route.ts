import { NextResponse } from "next/server";
import { readRegistry } from "@/lib/suiReader";
import { getLiveCHI } from "@/lib/liveData";
import { fetchOracleBackendJson, hasOracleBackend } from "@/lib/oracleBackend";

export const dynamic = "force-dynamic";

export async function GET() {
  if (hasOracleBackend()) {
    const oracle = await fetchOracleBackendJson<{
      overallScore: number;
      economicVitality: number;
      securityIndex: number;
      growthRate: number;
      connectivity: number;
      trustIndex: number;
      socialCohesion: number;
      diagnosis: string;
      source?: string;
      lastUpdatedMs?: number;
    }>("/api/chi");

    if (oracle && typeof oracle.overallScore === "number") {
      return NextResponse.json({
        ...oracle,
        source: oracle.source || "railway-oracle",
      });
    }
  }

  // Priority 1: on-chain contract
  const onChain = await readRegistry();

  if (onChain && onChain.chi.overallScore > 0) {
    return NextResponse.json({
      ...onChain.chi,
      source: "sui-testnet",
      onChainSystems: onChain.stats.totalSystems,
      onChainPlayers: onChain.stats.totalPlayers,
      lastUpdatedMs: onChain.stats.lastUpdatedMs,
    });
  }

  // Priority 2: computed from live World API data
  try {
    const chi = await getLiveCHI();
    return NextResponse.json({ ...chi, source: "world-api-live" });
  } catch {
    return NextResponse.json({
      overallScore: 0, economicVitality: 0, securityIndex: 0,
      growthRate: 0, connectivity: 0, trustIndex: 0,
      socialCohesion: 0, diagnosis: "No data", source: "error",
    });
  }
}
