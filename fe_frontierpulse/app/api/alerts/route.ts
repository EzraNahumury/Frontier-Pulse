import { NextResponse } from "next/server";
import { getLiveAlerts } from "@/lib/liveData";
import { fetchOracleBackendJson, hasOracleBackend } from "@/lib/oracleBackend";

export const dynamic = "force-dynamic";

export async function GET() {
  if (hasOracleBackend()) {
    const oracle = await fetchOracleBackendJson<{ alerts: unknown[]; source?: string }>("/api/alerts");
    if (oracle?.alerts) {
      return NextResponse.json({
        alerts: oracle.alerts,
        source: oracle.source || "railway-oracle",
      });
    }
  }

  try {
    const alerts = await getLiveAlerts();
    return NextResponse.json({ alerts, source: "world-api-live" });
  } catch {
    return NextResponse.json({ alerts: [], source: "error" });
  }
}
