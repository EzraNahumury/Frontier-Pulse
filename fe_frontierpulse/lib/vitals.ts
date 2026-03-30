import type { SystemVitals } from "./types";

// Deterministic pseudo-random from system ID — same ID always gives same vitals
function hash(n: number): number {
  let h = n ^ 0x5f3759df;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
  h = (h ^ (h >>> 16)) >>> 0;
  return (h & 0xffff) / 0xffff;
}

export function getSystemVitals(systemId: number): SystemVitals {
  const h1 = hash(systemId);
  const h2 = hash(systemId + 7919);
  const h3 = hash(systemId + 15373);
  const h4 = hash(systemId + 23197);
  const h5 = hash(systemId + 31531);
  const h6 = hash(systemId + 40343);

  const activity = Math.floor(10 + h1 * 90);
  const trust = Math.floor(15 + h2 * 85);
  return {
    activityLevel: activity,
    trustLevel: trust,
    playerCount: Math.floor(h3 * 60),
    infrastructureCount: Math.floor(h4 * 20),
    txFrequency: Math.floor(10 + h5 * 90),
    combatIncidents: Math.floor(h6 * 12),
    localChi: Math.floor((activity * 40 + trust * 60) / 100),
  };
}
