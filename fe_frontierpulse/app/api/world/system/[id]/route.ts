import { NextResponse } from "next/server";
import { fetchSystemDetail } from "@/lib/worldApi";
import { getSystemVitals } from "@/lib/vitals";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const systemId = parseInt(id, 10);

  try {
    const detail = await fetchSystemDetail(systemId);
    if (!detail) {
      return NextResponse.json({ error: "System not found" }, { status: 404 });
    }
    const vitals = getSystemVitals(systemId);
    return NextResponse.json({ ...detail, vitals });
  } catch {
    return NextResponse.json({ error: "World API unavailable" }, { status: 503 });
  }
}
