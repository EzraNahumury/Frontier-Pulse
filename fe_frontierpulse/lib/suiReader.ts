/**
 * Reads on-chain data from the Frontier Pulse smart contract via Sui JSON-RPC.
 * No SDK needed — just raw fetch to the testnet fullnode.
 */

const SUI_RPC = process.env.SUI_RPC_URL || "https://sui-testnet.nodeinfra.com";
const REGISTRY_ID = "0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4";

// ── Types ──

export interface OnChainCHI {
  overallScore: number;
  economicVitality: number;
  securityIndex: number;
  growthRate: number;
  connectivity: number;
  trustIndex: number;
  socialCohesion: number;
  diagnosis: string;
  lastCalculatedMs: number;
}

export interface RegistryStats {
  totalPlayers: number;
  totalSystems: number;
  lastUpdatedMs: number;
}

// ── JSON-RPC helper ──

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(SUI_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

// ── Read PulseRegistry object ──

interface SuiObjectResponse {
  data?: {
    content?: {
      dataType: string;
      fields?: Record<string, unknown>;
    };
  };
}

/**
 * Read the PulseRegistry shared object which contains:
 * - chi: CivilizationHealthIndex (embedded struct)
 * - total_players, total_systems, last_updated_ms
 */
export async function readRegistry(): Promise<{
  chi: OnChainCHI;
  stats: RegistryStats;
} | null> {
  try {
    const result = await rpc<SuiObjectResponse>("sui_getObject", [
      REGISTRY_ID,
      { showContent: true },
    ]);

    const fields = result.data?.content?.fields;
    if (!fields) return null;

    // CHI is an embedded struct in the registry
    const chiFields = (fields.chi as { fields?: Record<string, unknown> })?.fields;
    if (!chiFields) return null;

    return {
      chi: {
        overallScore: Number(chiFields.overall_score ?? 0),
        economicVitality: Number(chiFields.economic_vitality ?? 0),
        securityIndex: Number(chiFields.security_index ?? 0),
        growthRate: Number(chiFields.growth_rate ?? 0),
        connectivity: Number(chiFields.connectivity ?? 0),
        trustIndex: Number(chiFields.trust_index ?? 0),
        socialCohesion: Number(chiFields.social_cohesion ?? 0),
        diagnosis: String(chiFields.diagnosis ?? "Unknown"),
        lastCalculatedMs: Number(chiFields.last_calculated_ms ?? 0),
      },
      stats: {
        totalPlayers: Number(fields.total_players ?? 0),
        totalSystems: Number(fields.total_systems ?? 0),
        lastUpdatedMs: Number(fields.last_updated_ms ?? 0),
      },
    };
  } catch (e) {
    console.error("[SuiReader] Failed to read registry:", e);
    return null;
  }
}
