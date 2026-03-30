import { NextResponse } from "next/server";
import { getPlayerSystemIds } from "@/lib/liveData";
import { fetchOracleBackendJson, hasOracleBackend } from "@/lib/oracleBackend";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (hasOracleBackend()) {
    const oracleSystems = await fetchOracleBackendJson<Record<string, unknown>>(
      `/api/player/${encodeURIComponent(address)}/systems`,
    );
    if (oracleSystems) {
      return NextResponse.json(oracleSystems);
    }
  }

  try {
    const systemIds = await getPlayerSystemIds(address);
    return NextResponse.json({ address, systemIds });
  } catch {
    return NextResponse.json({ address, systemIds: [] });
  }
}
