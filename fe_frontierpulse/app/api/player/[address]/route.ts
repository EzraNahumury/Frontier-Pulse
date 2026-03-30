import { NextResponse } from "next/server";
import { getLivePlayerByAddress, getPlayerSystemIds } from "@/lib/liveData";
import { fetchCharacterByWallet } from "@/lib/suiCharacter";
import { fetchSmartCharacterSystem } from "@/lib/worldApi";
import { fetchOracleBackendJson, hasOracleBackend } from "@/lib/oracleBackend";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (hasOracleBackend()) {
    const oraclePlayer = await fetchOracleBackendJson<Record<string, unknown>>(
      `/api/player/${encodeURIComponent(address)}`,
    );
    if (oraclePlayer) {
      return NextResponse.json(oraclePlayer);
    }
  }

  try {
    const [player, systemIds] = await Promise.all([
      getLivePlayerByAddress(address),
      getPlayerSystemIds(address),
    ]);

    if (player) {
      // If live data has no system IDs, try the World API as fallback
      const finalSystemIds = systemIds.length > 0
        ? systemIds
        : await fetchSmartCharacterSystem(address).then(
            (id) => (id ? [id] : []),
            () => []
          );
      return NextResponse.json({ ...player, systemIds: finalSystemIds });
    }

    // Player has no activity yet — check if they have a Character on-chain
    const character = await fetchCharacterByWallet(address);
    if (character) {
      // Try to find their solar system from the World API
      const fallbackSystemIds = systemIds.length > 0
        ? systemIds
        : await fetchSmartCharacterSystem(address).then(
            (id) => (id ? [id] : []),
            () => []
          );
      const systemId = fallbackSystemIds.length > 0 ? fallbackSystemIds[0] : 0;

      return NextResponse.json({
        address,
        name: character.name || `Pilot_${address.slice(2, 8)}`,
        reliability: 40,
        commerce: 30,
        diplomacy: 50,
        stewardship: 20,
        volatility: 0,
        compositeScore: 38,
        archetype: "Newcomer",
        systemId,
        systemIds: fallbackSystemIds,
        characterId: character.characterId,
      });
    }

    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 503 });
  }
}
