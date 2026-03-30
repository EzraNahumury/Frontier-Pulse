/**
 * One-time setup script: issues an OracleCap to the oracle address.
 *
 * Usage:
 *   1. Copy .env.example to .env and set SUI_PRIVATE_KEY
 *   2. Run: npm run oracle:init
 *   3. Copy the printed ORACLE_CAP_ID into your .env
 */
import { issueOracleCap, getOracleAddress, getOracleBalance } from "./suiWriter.js";

async function main() {
  console.log("=== Frontier Pulse Oracle — Init ===\n");
  console.log(`Oracle address: ${getOracleAddress()}`);
  console.log(`Balance: ${await getOracleBalance()}\n`);

  const oracleCapId = await issueOracleCap();

  console.log("\n=== Done! ===");
  console.log(`Add to your .env file:`);
  console.log(`ORACLE_CAP_ID=${oracleCapId}`);
}

main().catch((e) => {
  console.error("Init failed:", e.message);
  process.exit(1);
});
