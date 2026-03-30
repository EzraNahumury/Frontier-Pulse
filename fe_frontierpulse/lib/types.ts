// ── World API types (real data) ──

export interface WorldSystem {
  id: number;
  name: string;
  constellationId: number;
  regionId: number;
  nx: number;
  ny: number;
  depth: number;
}

export interface GateLink {
  gateId: number;
  gateName: string;
  destinationId: number;
  destinationName: string;
}

export interface SystemDetail extends WorldSystem {
  gateLinks: GateLink[];
}

// ── Simulated vitals (overlaid on real topology) ──

export interface SystemVitals {
  activityLevel: number;
  trustLevel: number;
  playerCount: number;
  infrastructureCount: number;
  txFrequency: number;
  combatIncidents: number;
  localChi: number;
}

// ── Reputation (from our smart contract) ──

export interface PlayerReputation {
  address: string;
  name: string;
  reliability: number;
  commerce: number;
  diplomacy: number;
  stewardship: number;
  volatility: number;
  compositeScore: number;
  archetype: string;
  systemId: number;
}

// ── CHI ──

export interface CHIData {
  overallScore: number;
  economicVitality: number;
  securityIndex: number;
  growthRate: number;
  connectivity: number;
  trustIndex: number;
  socialCohesion: number;
  diagnosis: string;
}

// ── Alerts ──

export type AlertSeverity = "critical" | "high" | "medium" | "warning" | "info";

export interface Alert {
  id: number;
  alertType: string;
  severity: AlertSeverity;
  systemId: number;
  systemName: string;
  description: string;
  timestampMs: number;
}
