import type { SolarSystem, SystemEnrichment } from "./worldApi.js";

// ── Types matching smart contract structs ──

export interface SystemHealthScore {
  systemId: number;
  activityLevel: number;   // 0-100
  trustLevel: number;       // 0-100
  playerCount: number;
  infrastructureCount: number;
  txFrequency: number;      // 0-100
  combatIncidents: number;
  localChi: number;          // computed: (activity*40 + trust*60) / 100
}

export interface PlayerReputationScore {
  player: string;           // Sui address
  reliability: number;      // 0-100
  commerce: number;         // 0-100
  diplomacy: number;        // 0-100
  stewardship: number;      // 0-100
  volatility: number;       // 0-100
  archetype: string;
}

export interface CHIScore {
  economicVitality: number;  // 0-100
  securityIndex: number;     // 0-100
  growthRate: number;        // 0-100
  connectivity: number;      // 0-100
  trustIndex: number;        // 0-100
  socialCohesion: number;    // 0-100
  diagnosis: string;
  overall: number;           // computed
}

export interface AnomalyAlert {
  alertType: string;
  severity: number;          // 0=critical, 1=high, 2=medium, 3=warning, 4=info
  systemId: number;
  description: string;
}

// ── Deterministic hash (same as frontend vitals.ts, for systems without real data) ──

function hash(n: number): number {
  let h = n ^ 0x5f3759df;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
  h = (h ^ (h >>> 16)) >>> 0;
  return (h & 0xffff) / 0xffff;
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

// ── System Health Scoring ──

/**
 * Compute system health scores from World API data + enrichment.
 *
 * When real enrichment data is available (smart assemblies, kills),
 * we use it. Otherwise we fall back to deterministic hash-based scoring
 * (matches the frontend's vitals.ts so the display stays consistent).
 */
export function computeSystemHealth(
  system: SolarSystem,
  enrichment: SystemEnrichment | undefined,
): SystemHealthScore {
  const hasRealData = enrichment &&
    (enrichment.smartAssemblyCount > 0 ||
     enrichment.recentKills > 0 ||
     enrichment.activePlayerAddresses.size > 0);

  if (hasRealData && enrichment) {
    // ── Real data path ──
    const playerCount = enrichment.activePlayerAddresses.size;
    const infraCount = enrichment.smartAssemblyCount;
    const kills = enrichment.recentKills;

    // Activity: combination of players, infrastructure, and combat
    const playerScore = Math.min(playerCount * 5, 100);
    const infraScore = Math.min(infraCount * 3, 100);
    const combatScore = Math.min(kills * 8, 100);
    const activityLevel = clamp((playerScore * 0.4 + infraScore * 0.35 + combatScore * 0.25));

    // Trust: inverse of combat ratio, boosted by infrastructure
    const combatRatio = playerCount > 0 ? kills / playerCount : 0;
    const baseTrust = clamp(100 - combatRatio * 50);
    const infraBoost = Math.min(infraCount * 2, 20);
    const trustLevel = clamp(baseTrust + infraBoost);

    // Transaction frequency: proxy from activity density
    const txFrequency = clamp((playerCount * 3 + infraCount * 2 + kills) * 2);

    const localChi = Math.floor((activityLevel * 40 + trustLevel * 60) / 100);

    return {
      systemId: system.id,
      activityLevel,
      trustLevel,
      playerCount,
      infrastructureCount: infraCount,
      txFrequency,
      combatIncidents: kills,
      localChi,
    };
  }

  // ── Fallback: deterministic hash (matches frontend vitals.ts) ──
  const h1 = hash(system.id);
  const h2 = hash(system.id + 7919);
  const h3 = hash(system.id + 15373);
  const h4 = hash(system.id + 23197);
  const h5 = hash(system.id + 31531);
  const h6 = hash(system.id + 40343);

  const activityLevel = Math.floor(10 + h1 * 90);
  const trustLevel = Math.floor(15 + h2 * 85);

  return {
    systemId: system.id,
    activityLevel,
    trustLevel,
    playerCount: Math.floor(h3 * 60),
    infrastructureCount: Math.floor(h4 * 20),
    txFrequency: Math.floor(10 + h5 * 90),
    combatIncidents: Math.floor(h6 * 12),
    localChi: Math.floor((activityLevel * 40 + trustLevel * 60) / 100),
  };
}

// ── Player Reputation Scoring ──

const ARCHETYPES: { name: string; test: (r: PlayerReputationScore) => boolean }[] = [
  { name: "Civilization Builder", test: (r) => r.stewardship >= 80 && r.reliability >= 70 },
  { name: "Trusted Trader",      test: (r) => r.commerce >= 80 && r.reliability >= 70 },
  { name: "Diplomat",            test: (r) => r.diplomacy >= 75 && r.volatility < 30 },
  { name: "Warlord",             test: (r) => r.volatility >= 70 && r.commerce < 40 },
  { name: "Wildcard",            test: (r) => r.volatility >= 50 && r.volatility < 70 },
  { name: "Newcomer",            test: () => true },
];

/**
 * Compute player reputation from their on-chain activity patterns.
 * In production, this would analyze World API killmails, trades, assembly deployments, etc.
 * For the hackathon, we generate consistent scores from the player address hash.
 */
export function computePlayerReputation(
  playerAddress: string,
  stats: {
    assemblyCount: number;
    killCount: number;
    deathCount: number;
    systemsVisited: number;
  },
): PlayerReputationScore {
  // Derive scores from observable behavior
  const { assemblyCount, killCount, deathCount, systemsVisited } = stats;
  const totalCombat = killCount + deathCount;

  // Reliability: consistent presence (systems visited + assemblies deployed)
  const reliability = clamp(40 + assemblyCount * 5 + systemsVisited * 2);

  // Commerce: inferred from infrastructure deployment
  const commerce = clamp(30 + assemblyCount * 8);

  // Diplomacy: inverse of aggression, boosted by exploration
  const aggressionRatio = totalCombat > 0 ? killCount / totalCombat : 0;
  const diplomacy = clamp(50 - aggressionRatio * 40 + systemsVisited * 3);

  // Stewardship: infrastructure contribution
  const stewardship = clamp(20 + assemblyCount * 10);

  // Volatility: combat intensity and kill/death imbalance
  const volatility = clamp(totalCombat * 5 + Math.abs(killCount - deathCount) * 3);

  const rep: PlayerReputationScore = {
    player: playerAddress,
    reliability,
    commerce,
    diplomacy,
    stewardship,
    volatility,
    archetype: "",
  };

  // Determine archetype
  rep.archetype = ARCHETYPES.find((a) => a.test(rep))?.name ?? "Newcomer";

  return rep;
}

// ── Global CHI Scoring ──

/**
 * Aggregate all system health scores into the global Civilization Health Index.
 * Matches the smart contract's 6 sub-indices and weight formula.
 */
export function computeGlobalCHI(systemScores: SystemHealthScore[]): CHIScore {
  if (systemScores.length === 0) {
    return {
      economicVitality: 0,
      securityIndex: 0,
      growthRate: 0,
      connectivity: 0,
      trustIndex: 0,
      socialCohesion: 0,
      diagnosis: "No data",
      overall: 0,
    };
  }

  const n = systemScores.length;

  // Economic Vitality: average of txFrequency and infrastructure density
  const avgTx = systemScores.reduce((s, v) => s + v.txFrequency, 0) / n;
  const avgInfra = systemScores.reduce((s, v) => s + Math.min(v.infrastructureCount * 5, 100), 0) / n;
  const economicVitality = clamp((avgTx * 0.6 + avgInfra * 0.4));

  // Security Index: inverse of combat density, capped
  const avgCombat = systemScores.reduce((s, v) => s + v.combatIncidents, 0) / n;
  const securityIndex = clamp(100 - avgCombat * 8);

  // Growth Rate: systems with high activity vs low activity ratio
  const activeSystems = systemScores.filter((s) => s.activityLevel > 50).length;
  const growthRate = clamp((activeSystems / n) * 100);

  // Connectivity: systems with gate links (proxy from enrichment)
  // For now, use average activity as a proxy for interconnectedness
  const avgActivity = systemScores.reduce((s, v) => s + v.activityLevel, 0) / n;
  const connectivity = clamp(avgActivity * 1.1);

  // Trust Index: average trust level
  const avgTrust = systemScores.reduce((s, v) => s + v.trustLevel, 0) / n;
  const trustIndex = clamp(avgTrust);

  // Social Cohesion: low combat + high trust + high players
  const avgPlayers = systemScores.reduce((s, v) => s + v.playerCount, 0) / n;
  const socialCohesion = clamp(
    (trustIndex * 0.4 + securityIndex * 0.3 + Math.min(avgPlayers * 3, 100) * 0.3),
  );

  // Overall CHI: weighted sum matching smart contract formula
  // (E×20 + Sec×15 + G×15 + C×15 + T×20 + Soc×15) / 100
  const overall = Math.floor(
    (economicVitality * 20 +
      securityIndex * 15 +
      growthRate * 15 +
      connectivity * 15 +
      trustIndex * 20 +
      socialCohesion * 15) / 100,
  );

  // Diagnosis
  let diagnosis: string;
  if (overall >= 80) diagnosis = "Flourishing";
  else if (overall >= 65) diagnosis = "Thriving";
  else if (overall >= 50) diagnosis = "Stable";
  else if (overall >= 35) diagnosis = "Stressed";
  else if (overall >= 20) diagnosis = "Declining";
  else diagnosis = "Collapsing";

  return {
    economicVitality: clamp(economicVitality),
    securityIndex: clamp(securityIndex),
    growthRate: clamp(growthRate),
    connectivity: clamp(connectivity),
    trustIndex: clamp(trustIndex),
    socialCohesion: clamp(socialCohesion),
    diagnosis,
    overall,
  };
}

// ── Anomaly Detection ──

/**
 * Detect anomalies by comparing current scores to thresholds.
 * Returns alerts for systems that show unusual patterns.
 */
export function detectAnomalies(
  scores: SystemHealthScore[],
  systemNames: Map<number, string>,
): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = [];

  for (const s of scores) {
    const name = systemNames.get(s.systemId) ?? `System ${s.systemId}`;

    // Trust collapse
    if (s.trustLevel < 20 && s.playerCount > 5) {
      alerts.push({
        alertType: "Trust Collapse",
        severity: 1, // HIGH
        systemId: s.systemId,
        description: `Trust level critically low (${s.trustLevel}) in ${name} with ${s.playerCount} active players`,
      });
    }

    // Combat hotspot
    if (s.combatIncidents > 8) {
      alerts.push({
        alertType: "Combat Hotspot",
        severity: 2, // MEDIUM
        systemId: s.systemId,
        description: `High combat activity (${s.combatIncidents} incidents) detected in ${name}`,
      });
    }

    // Blackout: had infrastructure but zero activity
    if (s.infrastructureCount > 5 && s.activityLevel < 10) {
      alerts.push({
        alertType: "Blackout",
        severity: 0, // CRITICAL
        systemId: s.systemId,
        description: `${name} has ${s.infrastructureCount} structures but near-zero activity — possible coordinated shutdown`,
      });
    }

    // Boom: very high tx + players
    if (s.txFrequency > 85 && s.playerCount > 20) {
      alerts.push({
        alertType: "Trade Spike",
        severity: 3, // WARNING
        systemId: s.systemId,
        description: `Unusual trade volume (tx: ${s.txFrequency}) in ${name} with ${s.playerCount} players`,
      });
    }
  }

  return alerts;
}
