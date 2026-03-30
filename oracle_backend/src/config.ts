import "dotenv/config";

function env(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

export const config = {
  // Sui network
  network: env("SUI_NETWORK", "testnet") as "testnet" | "mainnet" | "devnet",
  rpcUrl: process.env.SUI_RPC_URL || "",
  privateKey: env("SUI_PRIVATE_KEY"),

  // Contract addresses
  packageId: env("PACKAGE_ID", "0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9"),
  registryId: env("PULSE_REGISTRY_ID", "0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4"),
  adminCapId: env("ADMIN_CAP_ID", "0x2adb35c6ececb66b28fd178d246d3ef1b4f8c65fa5a3a7583192df91605da797"),
  oracleCapId: process.env.ORACLE_CAP_ID || "",

  // World API
  worldApiBase: env("WORLD_API_BASE", "https://world-api-utopia.uat.pub.evefrontier.com"),

  // EVE Frontier on-chain (Utopia)
  eveWorldPackage: env("EVE_WORLD_PACKAGE", "0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75"),
  eveKillmailRegistry: env("EVE_KILLMAIL_REGISTRY", "0xa92de75fde403a6ccfcb1d5a380f79befaed9f1a2210e10f1c5867a4cd82b84e"),
  eveObjectRegistry: env("EVE_OBJECT_REGISTRY", "0xc2b969a72046c47e24991d69472afb2216af9e91caf802684514f39706d7dc57"),
  suiGraphqlUrl: env("SUI_GRAPHQL_URL", "https://graphql.testnet.sui.io/graphql"),

  // Oracle settings
  cronSchedule: env("CRON_SCHEDULE", "*/10 * * * *"),
  batchSize: parseInt(env("BATCH_SIZE", "50"), 10),
  maxSystemsPerCycle: parseInt(env("MAX_SYSTEMS_PER_CYCLE", "500"), 10),

  // Module target
  module: "frontier_pulse",
} as const;

/** Full Move target string, e.g. "0x6618...::frontier_pulse" */
export const target = (fn: string) =>
  `${config.packageId}::${config.module}::${fn}` as const;
