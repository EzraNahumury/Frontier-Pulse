/**
 * Live data module — fetches real player activity from the Sui blockchain.
 *
 * After the Sui migration, smart assemblies and killmails are on-chain objects
 * queried via Sui GraphQL (the World API REST endpoints no longer exist).
 *
 * Computes reputation scores using the same formulas as oracle_backend/src/scoring.ts,
 * and generates anomaly alerts dynamically from real game data.
 */

import type { PlayerReputation, Alert, CHIData, AlertSeverity } from "./types";
import { getSystemNameMap } from "./worldApi";

const GQL = "https://graphql.testnet.sui.io/graphql";
const WORLD_PKG = "0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75";

// ── Raw on-chain types ──

interface OnChainAssembly {
  address: string;
  ownerWallet: string;
  typeId: number;
  status: string;
  solarSystemId: number;
}

interface OnChainKillmail {
  address: string;
  killerId: string;
  victimId: string;
  solarSystemId: number;
  timestamp: number;
}

interface OnChainCharacter {
  address: string;
  itemId: string;
  ownerCapId: string;
}

// ── Cache (5-minute TTL) ──

interface LiveCache {
  players: PlayerReputation[];
  alerts: Alert[];
  chi: CHIData;
  systemNames: Map<number, string>;
  activeSystemIds: Set<number>;
  playerSystems: Map<string, number[]>;
  ts: number;
}

let cache: LiveCache | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// ── GraphQL helper ──

async function gqlQuery<T>(query: string): Promise<T | null> {
  try {
    const res = await fetch(GQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}

/** Paginate through all objects of a given Move type */
async function fetchAllObjects(
  type: string,
  pageSize = 50,
): Promise<{ address: string; ownerWallet: string; json: any }[]> {
  const all: { address: string; ownerWallet: string; json: any }[] = [];
  let cursor: string | null = null;

  while (true) {
    const afterClause: string = cursor ? `, after: "${cursor}"` : "";
    const query: string = `{
      objects(filter: { type: "${type}" }, first: ${pageSize}${afterClause}) {
        nodes {
          address
          owner { __typename ... on AddressOwner { owner: address { address } } }
          asMoveObject { contents { json } }
        }
        pageInfo { hasNextPage endCursor }
      }
    }`;

    const data: any = await gqlQuery<any>(query);
    if (!data?.objects?.nodes) break;

    for (const n of data.objects.nodes) {
      all.push({
        address: n.address,
        ownerWallet: n.owner?.__typename === "AddressOwner" ? n.owner.owner?.address || "" : "",
        json: n.asMoveObject?.contents?.json || {},
      });
    }

    if (!data.objects.pageInfo.hasNextPage) break;
    cursor = data.objects.pageInfo.endCursor;
  }

  return all;
}

// ── Scoring (mirrors oracle_backend/src/scoring.ts exactly) ──

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

interface PlayerStats {
  address: string;
  assemblyCount: number;
  killCount: number;
  deathCount: number;
  systemsVisited: Set<number>;
}

function scorePlayer(stats: PlayerStats): PlayerReputation {
  const { address, assemblyCount, killCount, deathCount, systemsVisited } = stats;
  const totalCombat = killCount + deathCount;
  const aggressionRatio = totalCombat > 0 ? killCount / totalCombat : 0;

  const reliability = clamp(40 + assemblyCount * 5 + systemsVisited.size * 2);
  const commerce = clamp(30 + assemblyCount * 8);
  const diplomacy = clamp(50 - aggressionRatio * 40 + systemsVisited.size * 3);
  const stewardship = clamp(20 + assemblyCount * 10);
  const volatility = clamp(totalCombat * 5 + Math.abs(killCount - deathCount) * 3);

  const compositeScore = Math.floor(
    (reliability * 25 + commerce * 25 + diplomacy * 20 +
      stewardship * 20 + (100 - volatility) * 10) / 100
  );

  let archetype = "Newcomer";
  if (stewardship >= 80 && reliability >= 70) archetype = "Civilization Builder";
  else if (commerce >= 80 && reliability >= 70) archetype = "Trusted Trader";
  else if (diplomacy >= 75 && volatility < 30) archetype = "Diplomat";
  else if (volatility >= 70 && commerce < 40) archetype = "Warlord";
  else if (volatility >= 50 && volatility < 70) archetype = "Wildcard";

  const systemId = systemsVisited.size > 0 ? [...systemsVisited][0] : 0;

  return {
    address,
    name: `Pilot_${address.slice(2, 8)}`,
    reliability,
    commerce,
    diplomacy,
    stewardship,
    volatility,
    compositeScore,
    archetype,
    systemId,
  };
}

// ── Location events: map deployables → solar system + owner ──

interface LocationEvent {
  assemblyId: string;
  ownerCapId: string;
  solarSystemId: number;
}

async function fetchLocationEvents(): Promise<LocationEvent[]> {
  const events: LocationEvent[] = [];
  const eventType = `${WORLD_PKG}::location::LocationRevealedEvent`;
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const beforeClause: string = cursor ? `, before: "${cursor}"` : "";
    const q: string = `{
      events(filter: { type: "${eventType}" }, last: 50${beforeClause}) {
        nodes { contents { json } }
        pageInfo { hasPreviousPage startCursor }
      }
    }`;

    const data: any = await gqlQuery<any>(q);
    if (!data?.events?.nodes) break;

    for (const node of data.events.nodes) {
      const j = node.contents?.json;
      if (j?.assembly_id && j?.solarsystem) {
        events.push({
          assemblyId: j.assembly_id,
          ownerCapId: j.owner_cap_id || "",
          solarSystemId: parseInt(j.solarsystem, 10),
        });
      }
    }

    hasMore = data.events.pageInfo.hasPreviousPage;
    cursor = data.events.pageInfo.startCursor;
  }

  return events;
}

/** Batch-resolve owner_cap_ids to wallet addresses */
async function resolveCapOwners(capIds: string[]): Promise<Map<string, string>> {
  const capToWallet = new Map<string, string>();
  if (capIds.length === 0) return capToWallet;

  for (let i = 0; i < capIds.length; i += 10) {
    const batch = capIds.slice(i, i + 10);
    const objectQueries = batch.map((id, idx) =>
      `obj${idx}: object(address: "${id}") { address owner { __typename ... on AddressOwner { owner: address { address } } } }`
    ).join("\n");

    const data: any = await gqlQuery<any>(`{ ${objectQueries} }`);
    if (!data) continue;

    for (let idx = 0; idx < batch.length; idx++) {
      const obj = data[`obj${idx}`];
      if (obj?.owner?.__typename === "AddressOwner") {
        capToWallet.set(batch[idx], obj.owner.owner.address);
      }
    }
  }

  return capToWallet;
}

// ── Fetch on-chain game data ──

async function fetchSuiGameData(): Promise<{
  assemblies: OnChainAssembly[];
  killmails: OnChainKillmail[];
  characterIdToWallet: Map<string, string>;
  walletSystems: Map<string, Set<number>>;
}> {
  console.log("[LiveData] Fetching game data from Sui blockchain...");

  // Fetch all data types in parallel
  const [rawAssemblies, rawKillmails, rawCharacters, assemblyCaps, characterCaps, locationEvents] =
    await Promise.all([
      fetchAllObjects(`${WORLD_PKG}::assembly::Assembly`),
      fetchAllObjects(`${WORLD_PKG}::killmail::Killmail`),
      fetchAllObjects(`${WORLD_PKG}::character::Character`),
      fetchAllObjects(`${WORLD_PKG}::access::OwnerCap<${WORLD_PKG}::assembly::Assembly>`),
      fetchAllObjects(`${WORLD_PKG}::access::OwnerCap<${WORLD_PKG}::character::Character>`),
      fetchLocationEvents(),
    ]);

  // Build assembly → solar system map
  const locationMap = new Map<string, number>();
  for (const ev of locationEvents) {
    locationMap.set(ev.assemblyId, ev.solarSystemId);
  }

  // Resolve all event owner_cap_ids → wallet addresses for system mapping
  const eventCapIds = [...new Set(locationEvents.map((e) => e.ownerCapId).filter(Boolean))];
  const capOwners = await resolveCapOwners(eventCapIds);

  // Build wallet → systems from ALL deployable locations (Gate, StorageUnit, etc.)
  // NOTE: OwnerCaps are owned by the Character object (shared), not the wallet
  // directly. We need to resolve Character address → wallet address first.
  // Build character address → wallet map early (before walletSystems loop)
  const charAddrToWallet = new Map<string, string>();
  for (const char of rawCharacters) {
    if (char.json.character_address) {
      charAddrToWallet.set(char.address, char.json.character_address);
    }
  }

  const walletSystems = new Map<string, Set<number>>();
  for (const ev of locationEvents) {
    let owner = capOwners.get(ev.ownerCapId);
    if (!owner || ev.solarSystemId <= 0) continue;
    // Resolve Character address → actual wallet address
    const wallet = charAddrToWallet.get(owner) || owner;
    if (!walletSystems.has(wallet)) walletSystems.set(wallet, new Set());
    walletSystems.get(wallet)!.add(ev.solarSystemId);
  }

  console.log(`[LiveData] Mapped ${walletSystems.size} wallets to solar systems from location events`);

  // Map assembly address → owner wallet via OwnerCap
  // OwnerCap<Assembly> is owned by the Character, so resolve to actual wallet
  const assemblyToWallet = new Map<string, string>();
  for (const cap of assemblyCaps) {
    if (cap.ownerWallet && cap.json.authorized_object_id) {
      const wallet = charAddrToWallet.get(cap.ownerWallet) || cap.ownerWallet;
      assemblyToWallet.set(cap.json.authorized_object_id, wallet);
    }
  }

  // Map character item_id → wallet address (used for killmail resolution)
  const characterIdToWallet = new Map<string, string>();
  for (const char of rawCharacters) {
    const wallet = char.json.character_address;
    if (wallet && char.json.key?.item_id) {
      characterIdToWallet.set(char.json.key.item_id, wallet);
    }
  }

  // Normalize assemblies (with solar system from LocationRevealedEvent)
  const assemblies: OnChainAssembly[] = rawAssemblies.map((a) => ({
    address: a.address,
    ownerWallet: assemblyToWallet.get(a.address) || "",
    typeId: parseInt(a.json.type_id, 10) || 0,
    status: a.json.status?.status?.["@variant"]?.toLowerCase() || "unknown",
    solarSystemId: locationMap.get(a.address) || 0,
  }));

  // Normalize killmails
  const killmails: OnChainKillmail[] = rawKillmails.map((k) => ({
    address: k.address,
    killerId: characterIdToWallet.get(k.json.killer_id?.item_id) || k.json.killer_id?.item_id || "",
    victimId: characterIdToWallet.get(k.json.victim_id?.item_id) || k.json.victim_id?.item_id || "",
    solarSystemId: parseInt(k.json.solar_system_id?.item_id, 10) || 0,
    timestamp: (parseInt(k.json.kill_timestamp, 10) || 0) * 1000,
  }));

  console.log(`[LiveData] Sui: ${assemblies.length} assemblies, ${killmails.length} killmails, ${characterIdToWallet.size} character→wallet mappings`);

  return { assemblies, killmails, characterIdToWallet, walletSystems };
}

// ── Main data pipeline ──

export async function fetchLiveData(): Promise<LiveCache> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache;

  const [gameData, systemNames] = await Promise.all([
    fetchSuiGameData(),
    cache?.systemNames.size ? Promise.resolve(cache.systemNames) : getSystemNameMap(),
  ]);
  const { assemblies, killmails, walletSystems } = gameData;

  // ── Aggregate per-player stats ──

  const playerMap = new Map<string, PlayerStats>();

  function getPlayer(addr: string): PlayerStats {
    if (!playerMap.has(addr)) {
      playerMap.set(addr, {
        address: addr, assemblyCount: 0,
        killCount: 0, deathCount: 0, systemsVisited: new Set(),
      });
    }
    return playerMap.get(addr)!;
  }

  // Per-system aggregation for alerts + CHI
  const sysInfra = new Map<number, number>();
  const sysKills = new Map<number, number>();
  const sysPlayers = new Map<number, Set<string>>();

  for (const sa of assemblies) {
    if (!sa.ownerWallet) continue;
    const p = getPlayer(sa.ownerWallet);
    p.assemblyCount++;
    if (sa.solarSystemId > 0) {
      p.systemsVisited.add(sa.solarSystemId);
      sysInfra.set(sa.solarSystemId, (sysInfra.get(sa.solarSystemId) ?? 0) + 1);
      if (!sysPlayers.has(sa.solarSystemId)) sysPlayers.set(sa.solarSystemId, new Set());
      sysPlayers.get(sa.solarSystemId)!.add(sa.ownerWallet);
    }
  }

  for (const km of killmails) {
    if (km.killerId) {
      const p = getPlayer(km.killerId);
      p.killCount++;
      if (km.solarSystemId) p.systemsVisited.add(km.solarSystemId);
    }
    if (km.victimId) {
      const p = getPlayer(km.victimId);
      p.deathCount++;
      if (km.solarSystemId) p.systemsVisited.add(km.solarSystemId);
    }
    if (km.solarSystemId) {
      sysKills.set(km.solarSystemId, (sysKills.get(km.solarSystemId) ?? 0) + 1);
      if (!sysPlayers.has(km.solarSystemId)) sysPlayers.set(km.solarSystemId, new Set());
      if (km.killerId) sysPlayers.get(km.solarSystemId)!.add(km.killerId);
      if (km.victimId) sysPlayers.get(km.solarSystemId)!.add(km.victimId);
    }
  }

  // ── Include players from walletSystems (Turrets, NetworkNodes, Gates, StorageUnits) ──
  // LocationRevealedEvents cover ALL deployable types, but playerMap only has
  // Assembly owners + killmail participants. Merge walletSystems into playerMap
  // so players with non-Assembly deployables also appear.
  for (const [wallet, systems] of walletSystems) {
    const p = getPlayer(wallet);
    for (const sid of systems) {
      p.systemsVisited.add(sid);
      p.assemblyCount++;
      sysInfra.set(sid, (sysInfra.get(sid) ?? 0) + 1);
      if (!sysPlayers.has(sid)) sysPlayers.set(sid, new Set());
      sysPlayers.get(sid)!.add(wallet);
    }
  }

  // ── Compute player reputations ──

  const players = [...playerMap.values()]
    .map(scorePlayer)
    .sort((a, b) => b.compositeScore - a.compositeScore);

  console.log(`[LiveData] Scored ${players.length} players from Sui on-chain data (incl. all deployable types)`);

  // ── Generate alerts from live data ──

  const alerts: Alert[] = [];
  let alertId = 1;
  const now = Date.now();
  const allSystemIds = new Set([...sysInfra.keys(), ...sysKills.keys()]);

  let topKillSystem = { id: 0, count: 0, name: "" };
  let topPlayerSystem = { id: 0, count: 0, name: "" };

  for (const systemId of allSystemIds) {
    const infraCount = sysInfra.get(systemId) ?? 0;
    const kills = sysKills.get(systemId) ?? 0;
    const pCount = sysPlayers.get(systemId)?.size ?? 0;
    const name = systemNames.get(systemId) ?? `System ${systemId}`;

    if (kills > topKillSystem.count) topKillSystem = { id: systemId, count: kills, name };
    if (pCount > topPlayerSystem.count) topPlayerSystem = { id: systemId, count: pCount, name };

    const combatRatio = pCount > 0 ? kills / pCount : 0;
    const trustLevel = clamp(100 - combatRatio * 50 + Math.min(infraCount * 2, 20));
    const playerScore = Math.min(pCount * 5, 100);
    const infraScore = Math.min(infraCount * 3, 100);
    const combatScore = Math.min(kills * 8, 100);
    const activityLevel = clamp(playerScore * 0.4 + infraScore * 0.35 + combatScore * 0.25);
    const txFrequency = clamp((pCount * 3 + infraCount * 2 + kills) * 2);

    if (trustLevel < 40 && pCount > 2) {
      alerts.push({ id: alertId++, alertType: "Trust Collapse", severity: "high" as AlertSeverity, systemId, systemName: name, description: `Trust eroding (${trustLevel}) with ${pCount} active players`, timestampMs: now - alertId * 45_000 });
    }
    if (kills > 2) {
      alerts.push({ id: alertId++, alertType: "Combat Hotspot", severity: "medium" as AlertSeverity, systemId, systemName: name, description: `Combat activity detected (${kills} incidents)`, timestampMs: now - alertId * 55_000 });
    }
    if (infraCount > 3 && activityLevel < 15) {
      alerts.push({ id: alertId++, alertType: "Blackout", severity: "critical" as AlertSeverity, systemId, systemName: name, description: `${infraCount} structures but near-zero activity`, timestampMs: now - alertId * 70_000 });
    }
    if (txFrequency > 60 && pCount > 5) {
      alerts.push({ id: alertId++, alertType: "Trade Spike", severity: "warning" as AlertSeverity, systemId, systemName: name, description: `High trade volume (tx: ${txFrequency}) with ${pCount} players`, timestampMs: now - alertId * 50_000 });
    }
    if (infraCount > 5) {
      alerts.push({ id: alertId++, alertType: "Infrastructure Hub", severity: "info" as AlertSeverity, systemId, systemName: name, description: `${infraCount} smart assemblies deployed`, timestampMs: now - alertId * 80_000 });
    }
  }

  // Summary alerts
  if (topPlayerSystem.count > 0) {
    alerts.push({ id: alertId++, alertType: "Population Center", severity: "info" as AlertSeverity, systemId: topPlayerSystem.id, systemName: topPlayerSystem.name, description: `Most populated system with ${topPlayerSystem.count} unique players`, timestampMs: now - 120_000 });
  }
  if (topKillSystem.count > 0) {
    alerts.push({ id: alertId++, alertType: "Warzone", severity: "warning" as AlertSeverity, systemId: topKillSystem.id, systemName: topKillSystem.name, description: `Highest combat zone with ${topKillSystem.count} killmails`, timestampMs: now - 180_000 });
  }
  if (players.length > 0) {
    alerts.push({ id: alertId++, alertType: "Census Update", severity: "info" as AlertSeverity, systemId: 0, systemName: "Universe", description: `${players.length} active pilots tracked across ${allSystemIds.size} systems`, timestampMs: now - 300_000 });
  }

  const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, warning: 3, info: 4 };
  alerts.sort((a, b) => (sevOrder[a.severity] ?? 5) - (sevOrder[b.severity] ?? 5));

  console.log(`[LiveData] Generated ${alerts.length} alerts from on-chain data`);

  // ── Compute CHI from real system data ──

  const systemScores: { activity: number; trust: number; players: number; infra: number; kills: number; tx: number }[] = [];

  for (const systemId of allSystemIds) {
    const infraCount = sysInfra.get(systemId) ?? 0;
    const kills = sysKills.get(systemId) ?? 0;
    const pCount = sysPlayers.get(systemId)?.size ?? 0;

    const activity = clamp(Math.min(pCount * 5, 100) * 0.4 + Math.min(infraCount * 3, 100) * 0.35 + Math.min(kills * 8, 100) * 0.25);
    const combatRatio = pCount > 0 ? kills / pCount : 0;
    const trust = clamp(100 - combatRatio * 50 + Math.min(infraCount * 2, 20));
    const tx = clamp((pCount * 3 + infraCount * 2 + kills) * 2);

    systemScores.push({ activity, trust, players: pCount, infra: infraCount, kills, tx });
  }

  let chi: CHIData;
  if (systemScores.length > 0) {
    const n = systemScores.length;
    const avgTx = systemScores.reduce((s, v) => s + v.tx, 0) / n;
    const avgInfra = systemScores.reduce((s, v) => s + Math.min(v.infra * 5, 100), 0) / n;
    const economicVitality = clamp(avgTx * 0.6 + avgInfra * 0.4);
    const avgCombat = systemScores.reduce((s, v) => s + v.kills, 0) / n;
    const securityIndex = clamp(100 - avgCombat * 8);
    const activeSystems = systemScores.filter((s) => s.activity > 50).length;
    const growthRate = clamp((activeSystems / n) * 100);
    const avgActivity = systemScores.reduce((s, v) => s + v.activity, 0) / n;
    const connectivity = clamp(avgActivity * 1.1);
    const trustIndex = clamp(systemScores.reduce((s, v) => s + v.trust, 0) / n);
    const avgPlayers = systemScores.reduce((s, v) => s + v.players, 0) / n;
    const socialCohesion = clamp(trustIndex * 0.4 + securityIndex * 0.3 + Math.min(avgPlayers * 3, 100) * 0.3);

    const overallScore = Math.floor(
      (economicVitality * 20 + securityIndex * 15 + growthRate * 15 +
        connectivity * 15 + trustIndex * 20 + socialCohesion * 15) / 100
    );

    let diagnosis: string;
    if (overallScore >= 80) diagnosis = "Flourishing";
    else if (overallScore >= 65) diagnosis = "Thriving";
    else if (overallScore >= 50) diagnosis = "Stable";
    else if (overallScore >= 35) diagnosis = "Stressed";
    else if (overallScore >= 20) diagnosis = "Declining";
    else diagnosis = "Collapsing";

    chi = { overallScore, economicVitality, securityIndex, growthRate, connectivity, trustIndex, socialCohesion, diagnosis };
  } else {
    chi = { overallScore: 0, economicVitality: 0, securityIndex: 0, growthRate: 0, connectivity: 0, trustIndex: 0, socialCohesion: 0, diagnosis: "No data" };
  }

  // Build player → systems map (merge killmail systems + deployable locations)
  const playerSystems = new Map<string, number[]>();
  for (const [addr, stats] of playerMap) {
    // Start with systems from killmails + assemblies
    const systems = new Set(stats.systemsVisited);
    // Add systems from ALL deployable locations (Gates, StorageUnits, etc.)
    const extraSystems = walletSystems.get(addr);
    if (extraSystems) {
      for (const sid of extraSystems) systems.add(sid);
    }
    playerSystems.set(addr, [...systems]);
  }
  // Also add wallets that only have deployables (no assemblies/killmails in playerMap)
  for (const [wallet, systems] of walletSystems) {
    if (!playerSystems.has(wallet)) {
      playerSystems.set(wallet, [...systems]);
    }
  }

  cache = { players, alerts, chi, systemNames, activeSystemIds: allSystemIds, playerSystems, ts: Date.now() };
  return cache;
}

// ── Convenience exports ──

export async function getLivePlayers(): Promise<PlayerReputation[]> {
  return (await fetchLiveData()).players;
}

export async function getLiveAlerts(): Promise<Alert[]> {
  return (await fetchLiveData()).alerts;
}

export async function getLiveCHI(): Promise<CHIData> {
  return (await fetchLiveData()).chi;
}

export async function getLivePlayerByAddress(address: string): Promise<PlayerReputation | undefined> {
  return (await fetchLiveData()).players.find((p) => p.address === address);
}

export async function getLivePlayersInSystem(systemId: number): Promise<PlayerReputation[]> {
  return (await fetchLiveData()).players.filter((p) => p.systemId === systemId);
}

export async function getActiveSystemIds(): Promise<Set<number>> {
  return (await fetchLiveData()).activeSystemIds;
}

export async function getPlayerSystemIds(address: string): Promise<number[]> {
  return (await fetchLiveData()).playerSystems.get(address) ?? [];
}
