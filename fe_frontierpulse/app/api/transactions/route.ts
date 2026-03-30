import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUI_RPC = "https://fullnode.testnet.sui.io:443";
const PACKAGE_ID = "0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9";
const REGISTRY_ID = "0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4";
const ORACLE_ADDRESS = "0x8c4551885e339c4b2cd88cb96f0fe34186a5a1dd03667957187c257c02e88776";

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(SUI_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

interface SuiTxBlock {
  digest: string;
  transaction?: {
    data?: {
      sender?: string;
      transaction?: {
        kind?: string;
        transactions?: Array<{
          MoveCall?: {
            package?: string;
            module?: string;
            function?: string;
          };
        }>;
      };
      gasData?: {
        budget?: string;
      };
    };
  };
  effects?: {
    status?: { status: string };
    gasUsed?: {
      computationCost?: string;
      storageCost?: string;
      storageRebate?: string;
    };
  };
  timestampMs?: string;
}

interface QueryResult {
  data: SuiTxBlock[];
  hasNextPage: boolean;
  nextCursor?: string;
}

export async function GET() {
  try {
    // Query recent transactions from the oracle address
    const result = await rpc<QueryResult>("suix_queryTransactionBlocks", [
      {
        filter: { FromAddress: ORACLE_ADDRESS },
        options: {
          showInput: true,
          showEffects: true,
        },
      },
      null,  // cursor
      50,    // limit
      true,  // descending (newest first)
    ]);

    const transactions = result.data.map((tx) => {
      const moveCalls = tx.transaction?.data?.transaction?.transactions
        ?.filter((t) => t.MoveCall?.package === PACKAGE_ID)
        ?.map((t) => t.MoveCall!.function!) ?? [];

      const gasUsed = tx.effects?.gasUsed;
      const computationCost = Number(gasUsed?.computationCost ?? 0);
      const storageCost = Number(gasUsed?.storageCost ?? 0);
      const storageRebate = Number(gasUsed?.storageRebate ?? 0);
      const totalGas = computationCost + storageCost - storageRebate;

      // Determine transaction type from move calls
      let txType = "unknown";
      let details = "";
      const fnCounts = new Map<string, number>();
      for (const fn of moveCalls) {
        fnCounts.set(fn, (fnCounts.get(fn) ?? 0) + 1);
      }

      if (fnCounts.has("update_system_health")) {
        txType = "system_health";
        details = `${fnCounts.get("update_system_health")} systems updated`;
      } else if (fnCounts.has("update_global_chi")) {
        txType = "chi_update";
        details = "Global CHI recalculated";
      } else if (fnCounts.has("update_player_reputation")) {
        txType = "reputation";
        details = `${fnCounts.get("update_player_reputation")} reputations updated`;
      } else if (fnCounts.has("emit_anomaly_alert")) {
        txType = "alerts";
        details = `${fnCounts.get("emit_anomaly_alert")} alerts emitted`;
      } else if (fnCounts.has("issue_oracle_cap")) {
        txType = "oracle_init";
        details = "Oracle capability issued";
      }

      return {
        digest: tx.digest,
        timestamp: tx.timestampMs ? Number(tx.timestampMs) : null,
        sender: tx.transaction?.data?.sender ?? "",
        status: tx.effects?.status?.status ?? "unknown",
        txType,
        details,
        moveCalls: moveCalls.length,
        gasMist: totalGas,
        gasSui: (totalGas / 1_000_000_000).toFixed(6),
      };
    });

    return NextResponse.json({
      transactions,
      total: transactions.length,
      registryId: REGISTRY_ID,
      packageId: PACKAGE_ID,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ transactions: [], error: message }, { status: 500 });
  }
}
