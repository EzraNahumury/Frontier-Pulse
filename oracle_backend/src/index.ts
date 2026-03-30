/**
 * Frontier Pulse Oracle Backend
 *
 * Reads data from EVE Frontier World API, computes civilization health scores,
 * and writes them to the Sui smart contract on a cron schedule.
 *
 * Usage:
 *   npm run dev           — start with cron scheduler
 *   npm run dev -- --once — run a single cycle and exit
 */
import cron from "node-cron";
import { config } from "./config.js";
import { fetchAllSystems, enrichSystems, getRawGameData } from "./worldApi.js";
import {
  computeSystemHealth,
  computeGlobalCHI,
  computePlayerReputation,
  detectAnomalies,
  type SystemHealthScore,
  type PlayerReputationScore,
} from "./scoring.js";
import {
  verifyOracleCap,
  getOracleAddress,
  getOracleBalance,
  writeSystemHealthBatch,
  writePlayerReputationBatch,
  writeGlobalCHI,
  emitAlertsBatch,
} from "./suiWriter.js";

// ── Oracle Cycle ──

let cycleCount = 0;
let running = false;

async function runCycle(): Promise<void> {
  if (running) {
    console.log("[Oracle] Previous cycle still running, skipping...");
    return;
  }
  running = true;
  cycleCount++;
  const start = Date.now();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`[Oracle] Cycle #${cycleCount} started at ${new Date().toISOString()}`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    // 1. Fetch solar systems from World API
    const systems = await fetchAllSystems();
    if (systems.length === 0) {
      console.warn("[Oracle] No systems fetched, skipping cycle");
      return;
    }

    // 2. Enrich with smart assembly + killmail data
    const enrichment = await enrichSystems(systems);

    // 3. Compute system health scores
    // Process a subset per cycle to manage gas costs
    const systemSubset = systems.slice(0, config.maxSystemsPerCycle);
    const systemScores: SystemHealthScore[] = systemSubset.map((sys) =>
      computeSystemHealth(sys, enrichment.get(sys.id)),
    );

    console.log(`[Oracle] Computed ${systemScores.length} system health scores`);

    // 4. Build system name lookup for alerts
    const systemNames = new Map(systems.map((s) => [s.id, s.name]));

    // 5. Detect anomalies
    const alerts = detectAnomalies(systemScores, systemNames);
    console.log(`[Oracle] Detected ${alerts.length} anomalies`);

    // 6. Compute global CHI
    const chi = computeGlobalCHI(systemScores);
    console.log(`[Oracle] Global CHI: ${chi.overall} (${chi.diagnosis})`);

    // 7. Compute player reputations from real on-chain game data
    const playerStats = new Map<string, {
      assemblyCount: number;
      killCount: number;
      deathCount: number;
      systemsVisited: number;
    }>();

    const { assemblies: rawAssemblies, killmails: rawKillmails, walletSystems } = getRawGameData(enrichment);

    // Count assemblies per owner
    for (const sa of rawAssemblies) {
      if (!sa.ownerId) continue;
      if (!playerStats.has(sa.ownerId)) {
        playerStats.set(sa.ownerId, { assemblyCount: 0, killCount: 0, deathCount: 0, systemsVisited: 0 });
      }
      playerStats.get(sa.ownerId)!.assemblyCount++;
    }

    // Count kills/deaths per player and track systems visited
    const playerSystems = new Map<string, Set<number>>();
    for (const km of rawKillmails) {
      // Attacker
      if (km.attackerId) {
        if (!playerStats.has(km.attackerId)) {
          playerStats.set(km.attackerId, { assemblyCount: 0, killCount: 0, deathCount: 0, systemsVisited: 0 });
        }
        playerStats.get(km.attackerId)!.killCount++;
        if (!playerSystems.has(km.attackerId)) playerSystems.set(km.attackerId, new Set());
        if (km.solarSystemId > 0) playerSystems.get(km.attackerId)!.add(km.solarSystemId);
      }
      // Victim
      if (km.victimId) {
        if (!playerStats.has(km.victimId)) {
          playerStats.set(km.victimId, { assemblyCount: 0, killCount: 0, deathCount: 0, systemsVisited: 0 });
        }
        playerStats.get(km.victimId)!.deathCount++;
        if (!playerSystems.has(km.victimId)) playerSystems.set(km.victimId, new Set());
        if (km.solarSystemId > 0) playerSystems.get(km.victimId)!.add(km.solarSystemId);
      }
    }

    // Include players from walletSystems (Turrets, NetworkNodes, Gates, StorageUnits)
    for (const [wallet, systems] of walletSystems) {
      if (!playerStats.has(wallet)) {
        playerStats.set(wallet, { assemblyCount: 0, killCount: 0, deathCount: 0, systemsVisited: 0 });
      }
      playerStats.get(wallet)!.assemblyCount += systems.size;
      if (!playerSystems.has(wallet)) playerSystems.set(wallet, new Set());
      for (const sid of systems) playerSystems.get(wallet)!.add(sid);
    }

    // Set systemsVisited from tracked systems
    for (const [addr, systems] of playerSystems) {
      const ps = playerStats.get(addr);
      if (ps) ps.systemsVisited = systems.size;
    }

    const playerScores: PlayerReputationScore[] = [];
    for (const [addr, stats] of playerStats) {
      // Only process valid Sui addresses (0x...)
      if (addr.startsWith("0x") && addr.length >= 42) {
        playerScores.push(computePlayerReputation(addr, stats));
      }
    }
    console.log(`[Oracle] Computed ${playerScores.length} player reputations`);

    // 8. Write to Sui — batched transactions
    const oracleCapId = config.oracleCapId;

    // 8a. Write system health in batches
    for (let i = 0; i < systemScores.length; i += config.batchSize) {
      const batch = systemScores.slice(i, i + config.batchSize);
      try {
        await writeSystemHealthBatch(oracleCapId, batch);
        console.log(`[Oracle] System batch ${Math.floor(i / config.batchSize) + 1} written`);
      } catch (e: any) {
        console.error(`[Oracle] System batch failed:`, e.message);
      }
    }

    // 8b. Write player reputations in batches
    for (let i = 0; i < playerScores.length; i += config.batchSize) {
      const batch = playerScores.slice(i, i + config.batchSize);
      try {
        await writePlayerReputationBatch(oracleCapId, batch);
        console.log(`[Oracle] Player batch ${Math.floor(i / config.batchSize) + 1} written`);
      } catch (e: any) {
        console.error(`[Oracle] Player batch failed:`, e.message);
      }
    }

    // 8c. Write global CHI
    try {
      await writeGlobalCHI(oracleCapId, chi);
    } catch (e: any) {
      console.error(`[Oracle] CHI write failed:`, e.message);
    }

    // 8d. Emit anomaly alerts
    if (alerts.length > 0) {
      try {
        await emitAlertsBatch(oracleCapId, alerts);
      } catch (e: any) {
        console.error(`[Oracle] Alert emission failed:`, e.message);
      }
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n[Oracle] Cycle #${cycleCount} completed in ${elapsed}s`);
    console.log(`  Systems: ${systemScores.length} | Players: ${playerScores.length} | CHI: ${chi.overall} | Alerts: ${alerts.length}`);

  } catch (e: any) {
    console.error(`[Oracle] Cycle failed:`, e.message);
  } finally {
    running = false;
  }
}

// ── Main ──

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   FRONTIER PULSE — Oracle Backend        ║");
  console.log("╚══════════════════════════════════════════╝\n");

  console.log(`Network:    ${config.network}`);
  console.log(`Package:    ${config.packageId}`);
  console.log(`Registry:   ${config.registryId}`);
  console.log(`Oracle:     ${getOracleAddress()}`);
  try {
    console.log(`Balance:    ${await getOracleBalance()}`);
  } catch {
    console.warn(`Balance:    (unavailable — RPC timeout)`);
  }
  console.log(`Schedule:   ${config.cronSchedule}`);
  console.log(`Batch size: ${config.batchSize}`);
  console.log(`Max sys:    ${config.maxSystemsPerCycle}\n`);

  // Verify OracleCap
  if (!config.oracleCapId) {
    console.error("ERROR: ORACLE_CAP_ID not set in .env");
    console.error("Run `npm run oracle:init` first to create an OracleCap");
    process.exit(1);
  }

  const capValid = await verifyOracleCap(config.oracleCapId);
  if (!capValid) {
    console.error(`ERROR: OracleCap ${config.oracleCapId} not found or invalid`);
    console.error("Run `npm run oracle:init` to create a new one");
    process.exit(1);
  }
  console.log(`OracleCap:  ${config.oracleCapId} ✓\n`);

  // Single run mode
  const isOnce = process.argv.includes("--once");
  if (isOnce) {
    console.log("[Oracle] Running single cycle...\n");
    await runCycle();
    console.log("\n[Oracle] Done.");
    return;
  }

  // Cron mode — run immediately then on schedule
  console.log("[Oracle] Running initial cycle...\n");
  await runCycle();

  console.log(`\n[Oracle] Scheduling next cycles: ${config.cronSchedule}`);
  cron.schedule(config.cronSchedule, () => {
    runCycle();
  });

  console.log("[Oracle] Running. Press Ctrl+C to stop.\n");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
