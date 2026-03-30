import { NextResponse } from "next/server";
import { fetchSystemDetail } from "@/lib/worldApi";
import { getSystemVitals } from "@/lib/vitals";
import { getLivePlayersInSystem } from "@/lib/liveData";
import { fetchOracleBackendJson, hasOracleBackend } from "@/lib/oracleBackend";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const systemId = parseInt(id, 10);

  try {
    const oracleSystem = hasOracleBackend()
      ? await fetchOracleBackendJson<{ vitals?: unknown; players?: unknown[] }>(`/api/system/${systemId}`)
      : null;

    const detail = await fetchSystemDetail(systemId);
    if (!detail) {
      return NextResponse.json({ error: "System not found" }, { status: 404 });
    }

    const vitals = oracleSystem?.vitals || getSystemVitals(systemId);
    const players = oracleSystem?.players || await getLivePlayersInSystem(systemId);

    return NextResponse.json({ ...detail, vitals, players });
  } catch {
    return NextResponse.json({ error: "World API unavailable" }, { status: 503 });
  }
}
