import type { PlayerReputation, CHIData, Alert } from "./types";

// ── Player reputation data (simulated — would come from our smart contract) ──

const PLAYER_DATA: Omit<PlayerReputation, "compositeScore">[] = [
  { address: "0xa1b2...3c4d", name: "StarForge_7", reliability: 88, commerce: 92, diplomacy: 65, stewardship: 71, volatility: 12, archetype: "Trusted Trader", systemId: 30000001 },
  { address: "0xd4e5...f6a7", name: "VoidRunner", reliability: 45, commerce: 38, diplomacy: 22, stewardship: 30, volatility: 85, archetype: "Warlord", systemId: 30000004 },
  { address: "0xb8c9...d0e1", name: "CivBuilder_X", reliability: 82, commerce: 70, diplomacy: 88, stewardship: 94, volatility: 8, archetype: "Civilization Builder", systemId: 30000001 },
  { address: "0xf2a3...b4c5", name: "DriftTrader", reliability: 76, commerce: 85, diplomacy: 60, stewardship: 55, volatility: 20, archetype: "Trusted Trader", systemId: 30000010 },
  { address: "0xe6f7...a8b9", name: "Nomad_IX", reliability: 50, commerce: 45, diplomacy: 78, stewardship: 40, volatility: 55, archetype: "Diplomat", systemId: 30000020 },
  { address: "0xc0d1...e2f3", name: "IronSentinel", reliability: 91, commerce: 60, diplomacy: 72, stewardship: 88, volatility: 10, archetype: "Civilization Builder", systemId: 30000008 },
  { address: "0xa4b5...c6d7", name: "ReaperKing", reliability: 35, commerce: 25, diplomacy: 15, stewardship: 10, volatility: 92, archetype: "Warlord", systemId: 30000006 },
  { address: "0xd8e9...f0a1", name: "Eclipse_V", reliability: 68, commerce: 72, diplomacy: 85, stewardship: 62, volatility: 30, archetype: "Diplomat", systemId: 30000025 },
  { address: "0xb2c3...d4e5", name: "GateKeeper", reliability: 94, commerce: 78, diplomacy: 70, stewardship: 92, volatility: 5, archetype: "Civilization Builder", systemId: 30000015 },
  { address: "0xf6a7...b8c9", name: "Phantom_0x", reliability: 40, commerce: 55, diplomacy: 35, stewardship: 28, volatility: 70, archetype: "Wildcard", systemId: 30000012 },
  { address: "0xe0f1...a2b3", name: "Solaris_D", reliability: 73, commerce: 80, diplomacy: 55, stewardship: 60, volatility: 25, archetype: "Trusted Trader", systemId: 30000030 },
  { address: "0xc4d5...e6f7", name: "Ash_Warden", reliability: 85, commerce: 65, diplomacy: 90, stewardship: 80, volatility: 15, archetype: "Diplomat", systemId: 30000018 },
  { address: "0xa8b9...c0d1", name: "MerchantLord", reliability: 80, commerce: 95, diplomacy: 50, stewardship: 45, volatility: 18, archetype: "Trusted Trader", systemId: 30000005 },
  { address: "0xd2e3...f4a5", name: "RaiderPrime", reliability: 30, commerce: 20, diplomacy: 18, stewardship: 15, volatility: 88, archetype: "Warlord", systemId: 30000009 },
  { address: "0xb6c7...d8e9", name: "Architect_Z", reliability: 78, commerce: 62, diplomacy: 75, stewardship: 96, volatility: 7, archetype: "Civilization Builder", systemId: 30000003 },
];

export const players: PlayerReputation[] = PLAYER_DATA.map((p) => ({
  ...p,
  compositeScore: Math.floor(
    (p.reliability * 25 + p.commerce * 25 + p.diplomacy * 20 +
      p.stewardship * 20 + (100 - p.volatility) * 10) / 100
  ),
}));

// ── Alerts (simulated — would come from anomaly detection engine) ──

const now = Date.now();
export const alerts: Alert[] = [
  { id: 1, alertType: "Trust Collapse", severity: "high", systemId: 30000006, systemName: "Crimson Nebula", description: "Average trust dropped 32% in sector over 24h", timestampMs: now - 180_000 },
  { id: 2, alertType: "Trade Spike", severity: "medium", systemId: 30000001, systemName: "A 2560", description: "Trade volume surged 420% above baseline", timestampMs: now - 420_000 },
  { id: 3, alertType: "Betrayal Cluster", severity: "high", systemId: 30000009, systemName: "Ashfall Station", description: "4 betrayal events within 2 hours", timestampMs: now - 600_000 },
  { id: 4, alertType: "Alliance Forming", severity: "info", systemId: 30000015, systemName: "Vanguard", description: "New gate network emerging across 3 systems", timestampMs: now - 900_000 },
  { id: 5, alertType: "Blackout", severity: "critical", systemId: 30000025, systemName: "Dead Reckoning", description: "All activity ceased — possible coordinated shutdown", timestampMs: now - 1_200_000 },
  { id: 6, alertType: "Exodus", severity: "warning", systemId: 30000012, systemName: "Drift Point", description: "Player count declined 55% over 48 hours", timestampMs: now - 1_800_000 },
  { id: 7, alertType: "Trade Spike", severity: "medium", systemId: 30000010, systemName: "Solaris Reach", description: "Unusual resource accumulation detected", timestampMs: now - 2_400_000 },
  { id: 8, alertType: "Alliance Forming", severity: "info", systemId: 30000020, systemName: "Horizon's End", description: "Cross-tribe cooperation increasing in sector", timestampMs: now - 3_600_000 },
];

// ── CHI (simulated — would be computed by CHI calculator engine) ──

export const chi: CHIData = {
  overallScore: 67,
  economicVitality: 72,
  securityIndex: 58,
  growthRate: 61,
  connectivity: 73,
  trustIndex: 79,
  socialCohesion: 64,
  diagnosis: "Thriving",
};
