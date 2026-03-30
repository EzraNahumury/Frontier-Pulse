import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { config, target } from "./config.js";
import type {
  SystemHealthScore,
  PlayerReputationScore,
  CHIScore,
  AnomalyAlert,
} from "./scoring.js";

// ── Sui client setup ──

const rpcUrl = config.rpcUrl || getJsonRpcFullnodeUrl(config.network);

const client = new SuiJsonRpcClient({
  network: config.network,
  url: rpcUrl,
});

/** Retry an async fn with exponential backoff. */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  retries = 3,
  baseDelayMs = 2000,
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isTimeout =
        err?.cause?.code === "UND_ERR_CONNECT_TIMEOUT" ||
        err?.message?.includes("fetch failed");
      if (!isTimeout || attempt === retries) throw err;
      const delay = baseDelayMs * 2 ** (attempt - 1);
      console.warn(
        `[RPC] ${label} attempt ${attempt}/${retries} failed (timeout), retrying in ${delay}ms...`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}

function getKeypair(): Ed25519Keypair {
  const key = config.privateKey.trim();

  // Format 1: Bech32 — suiprivkey1q...
  if (key.startsWith("suiprivkey1")) {
    const { secretKey } = decodeSuiPrivateKey(key);
    return Ed25519Keypair.fromSecretKey(secretKey);
  }

  // Format 2: Hex — 0x... (strip prefix, decode)
  if (key.startsWith("0x") || key.startsWith("0X")) {
    const hex = key.slice(2);
    const bytes = Uint8Array.from(hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
    // If 33 bytes, first byte is scheme flag — skip it
    return Ed25519Keypair.fromSecretKey(bytes.length === 33 ? bytes.slice(1) : bytes);
  }

  // Format 3: Base64 — e.g. from `sui keytool export`
  // May be 33 bytes (scheme byte + 32-byte key) or 32 bytes raw
  const bytes = Buffer.from(key, "base64");
  if (bytes.length === 33) {
    // First byte is the key scheme flag (0x00 = ed25519), skip it
    return Ed25519Keypair.fromSecretKey(bytes.slice(1));
  }
  return Ed25519Keypair.fromSecretKey(bytes);
}

const SUI_CLOCK = "0x0000000000000000000000000000000000000000000000000000000000000006";

async function signAndExecute(tx: Transaction): Promise<string> {
  const keypair = getKeypair();
  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true },
  });
  if (result.effects?.status?.status !== "success") {
    throw new Error(`Tx failed: ${JSON.stringify(result.effects?.status)}`);
  }
  // Wait for finality so the next tx sees updated object versions
  await client.waitForTransaction({ digest: result.digest });
  return result.digest;
}

// ── Oracle Cap Management ──

/**
 * Issue an OracleCap to the oracle address using AdminCap.
 * This must be called once before the oracle can write data.
 * Returns the OracleCap object ID.
 */
export async function issueOracleCap(): Promise<string> {
  const keypair = getKeypair();
  const oracleAddress = keypair.getPublicKey().toSuiAddress();

  console.log(`[Sui] Issuing OracleCap to ${oracleAddress}...`);

  const tx = new Transaction();
  tx.moveCall({
    target: target("issue_oracle_cap"),
    arguments: [
      tx.object(config.adminCapId),
      tx.pure.address(oracleAddress),
      tx.object(SUI_CLOCK),
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true, showObjectChanges: true },
  });

  if (result.effects?.status?.status !== "success") {
    throw new Error(`Failed to issue OracleCap: ${JSON.stringify(result.effects?.status)}`);
  }

  // Find the created OracleCap object
  const created = result.objectChanges?.find(
    (o) => o.type === "created" && "objectType" in o && o.objectType.includes("OracleCap"),
  );
  if (!created || !("objectId" in created)) {
    throw new Error("OracleCap object not found in tx result");
  }

  console.log(`[Sui] OracleCap issued: ${created.objectId}`);
  console.log(`[Sui] Add this to your .env: ORACLE_CAP_ID=${created.objectId}`);
  return created.objectId;
}

// ── Batch System Health Writes ──

/**
 * Write a batch of system health scores on-chain via a single PTB.
 * Each system is a separate moveCall within the same transaction.
 */
export async function writeSystemHealthBatch(
  oracleCapId: string,
  scores: SystemHealthScore[],
): Promise<string> {
  if (scores.length === 0) return "";

  const tx = new Transaction();

  for (const s of scores) {
    tx.moveCall({
      target: target("update_system_health"),
      arguments: [
        tx.object(oracleCapId),
        tx.object(config.registryId),
        tx.object(SUI_CLOCK),
        tx.pure.u64(BigInt(s.systemId)),
        tx.pure.u64(BigInt(s.activityLevel)),
        tx.pure.u64(BigInt(s.trustLevel)),
        tx.pure.u64(BigInt(s.playerCount)),
        tx.pure.u64(BigInt(s.infrastructureCount)),
        tx.pure.u64(BigInt(s.txFrequency)),
        tx.pure.u64(BigInt(s.combatIncidents)),
      ],
    });
  }

  const digest = await signAndExecute(tx);
  console.log(`[Sui] Wrote ${scores.length} system health scores. Digest: ${digest}`);
  return digest;
}

// ── Player Reputation Writes ──

/**
 * Write a batch of player reputations on-chain.
 */
export async function writePlayerReputationBatch(
  oracleCapId: string,
  players: PlayerReputationScore[],
): Promise<string> {
  if (players.length === 0) return "";

  const tx = new Transaction();

  for (const p of players) {
    tx.moveCall({
      target: target("update_player_reputation"),
      arguments: [
        tx.object(oracleCapId),
        tx.object(config.registryId),
        tx.object(SUI_CLOCK),
        tx.pure.address(p.player),
        tx.pure.u64(BigInt(p.reliability)),
        tx.pure.u64(BigInt(p.commerce)),
        tx.pure.u64(BigInt(p.diplomacy)),
        tx.pure.u64(BigInt(p.stewardship)),
        tx.pure.u64(BigInt(p.volatility)),
        tx.pure.string(p.archetype),
      ],
    });
  }

  const digest = await signAndExecute(tx);
  console.log(`[Sui] Wrote ${players.length} player reputations. Digest: ${digest}`);
  return digest;
}

// ── Global CHI Write ──

/**
 * Write the global Civilization Health Index on-chain.
 */
export async function writeGlobalCHI(
  oracleCapId: string,
  chi: CHIScore,
): Promise<string> {
  const tx = new Transaction();

  tx.moveCall({
    target: target("update_global_chi"),
    arguments: [
      tx.object(oracleCapId),
      tx.object(config.registryId),
      tx.object(SUI_CLOCK),
      tx.pure.u64(BigInt(chi.economicVitality)),
      tx.pure.u64(BigInt(chi.securityIndex)),
      tx.pure.u64(BigInt(chi.growthRate)),
      tx.pure.u64(BigInt(chi.connectivity)),
      tx.pure.u64(BigInt(chi.trustIndex)),
      tx.pure.u64(BigInt(chi.socialCohesion)),
      tx.pure.string(chi.diagnosis),
    ],
  });

  const digest = await signAndExecute(tx);
  console.log(`[Sui] Wrote global CHI (overall: ${chi.overall}). Digest: ${digest}`);
  return digest;
}

// ── Anomaly Alerts ──

/**
 * Emit anomaly alerts as on-chain events (not stored, just events for subscribers).
 */
export async function emitAlertsBatch(
  oracleCapId: string,
  alerts: AnomalyAlert[],
): Promise<string> {
  if (alerts.length === 0) return "";

  // Cap at 10 alerts per tx to avoid gas limits
  const batch = alerts.slice(0, 10);
  const tx = new Transaction();

  for (const a of batch) {
    tx.moveCall({
      target: target("emit_anomaly_alert"),
      arguments: [
        tx.object(oracleCapId),
        tx.object(SUI_CLOCK),
        tx.pure.string(a.alertType),
        tx.pure.u8(a.severity),
        tx.pure.u64(BigInt(a.systemId)),
        tx.pure.string(a.description),
      ],
    });
  }

  const digest = await signAndExecute(tx);
  console.log(`[Sui] Emitted ${batch.length} anomaly alerts. Digest: ${digest}`);
  return digest;
}

// ── Read helpers ──

/** Check if OracleCap exists and is accessible */
export async function verifyOracleCap(oracleCapId: string): Promise<boolean> {
  try {
    const obj = await withRetry(
      () => client.getObject({ id: oracleCapId, options: { showType: true } }),
      "verifyOracleCap",
    );
    return obj.data?.type?.includes("OracleCap") ?? false;
  } catch {
    return false;
  }
}

/** Get oracle's SUI balance for gas */
export async function getOracleBalance(): Promise<string> {
  const keypair = getKeypair();
  const address = keypair.getPublicKey().toSuiAddress();
  const balance = await withRetry(
    () => client.getBalance({ owner: address }),
    "getOracleBalance",
  );
  const sui = Number(balance.totalBalance) / 1_000_000_000;
  return `${sui.toFixed(4)} SUI`;
}

/** Get the oracle's address */
export function getOracleAddress(): string {
  return getKeypair().getPublicKey().toSuiAddress();
}
