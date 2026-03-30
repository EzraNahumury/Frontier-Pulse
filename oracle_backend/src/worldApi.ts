import { config } from "./config.js";
import { fetchEveGameData } from "./eveSuiData.js";

const BASE = config.worldApiBase;

// ── Raw types from EVE Frontier World API ──

interface RawSystem {
  id: number;
  name: string;
  constellationId: number;
  regionId: number;
  location: { x: number; y: number; z: number };
}

interface RawGateLink {
  id: number;
  name: string;
  destination: { id: number; name: string };
}

// ── Re-export types used by eveSuiData for compatibility ──

export interface RawSmartAssembly {
  id: string;
  typeId: number;
  solarSystemId: number;
  ownerId: string;
  state: string;
}

export interface RawKillmail {
  id: string;
  solarSystemId: number;
  attackerId: string;
  victimId: string;
  timestamp: number;
}

// ── Normalized types ──

export interface SolarSystem {
  id: number;
  name: string;
  constellationId: number;
  regionId: number;
  location: { x: number; y: number; z: number };
  gateCount: number;
}

export interface SystemEnrichment {
  systemId: number;
  smartAssemblyCount: number;
  recentKills: number;
  activePlayerAddresses: Set<string>;
}

// ── Fetch helpers ──

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`World API ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

/** Paginate through a World API v2 endpoint */
async function fetchAllPaginated<T>(
  endpoint: string,
  pageSize = 1000,
): Promise<T[]> {
  // Probe for total count
  const probe = await fetchJson<{ metadata: { total: number }; data: T[] }>(
    `${BASE}${endpoint}?limit=1&offset=0`,
  );
  const total = probe.metadata.total;
  if (total === 0) return [];

  const pages = Math.ceil(total / pageSize);
  const fetches = Array.from({ length: pages }, (_, i) =>
    fetchJson<{ data: T[] }>(
      `${BASE}${endpoint}?limit=${pageSize}&offset=${i * pageSize}`,
    ).then((d) => d.data),
  );
  const results = await Promise.all(fetches);
  return results.flat();
}

// ── Public API ──

/** Fetch all solar systems from the World API (still available on REST) */
export async function fetchAllSystems(): Promise<SolarSystem[]> {
  console.log("[WorldAPI] Fetching all solar systems...");
  const raw = await fetchAllPaginated<RawSystem>("/v2/solarsystems");
  console.log(`[WorldAPI] Got ${raw.length} solar systems`);
  return raw.map((s) => ({
    id: s.id,
    name: s.name,
    constellationId: s.constellationId,
    regionId: s.regionId,
    location: s.location,
    gateCount: 0,
  }));
}

/** Fetch gate links for a specific system */
export async function fetchGateLinks(
  systemId: number,
): Promise<{ gateId: number; destinationId: number }[]> {
  try {
    const raw = await fetchJson<{ gateLinks?: RawGateLink[] }>(
      `${BASE}/v2/solarsystems/${systemId}`,
    );
    return (raw.gateLinks || []).map((g) => ({
      gateId: g.id,
      destinationId: g.destination.id,
    }));
  } catch {
    return [];
  }
}

/**
 * Enrich systems with smart assembly counts, kill counts, and active players.
 * Fetches assemblies and killmails from the Sui blockchain (not REST API).
 */
export async function enrichSystems(
  systems: SolarSystem[],
): Promise<Map<number, SystemEnrichment>> {
  const enrichment = new Map<number, SystemEnrichment>();

  // Initialize all systems
  for (const sys of systems) {
    enrichment.set(sys.id, {
      systemId: sys.id,
      smartAssemblyCount: 0,
      recentKills: 0,
      activePlayerAddresses: new Set(),
    });
  }

  // Fetch real game data from Sui blockchain
  const { assemblies, killmails, walletSystems } = await fetchEveGameData();

  // Aggregate assemblies by solar system (resolved via LocationRevealedEvent)
  for (const sa of assemblies) {
    if (sa.solarSystemId > 0) {
      const e = enrichment.get(sa.solarSystemId);
      if (e) {
        e.smartAssemblyCount++;
        if (sa.ownerId) e.activePlayerAddresses.add(sa.ownerId);
      }
    }
  }

  // Aggregate ALL deployable locations (Gates, StorageUnits, etc.) into system enrichment
  for (const [wallet, systems] of walletSystems) {
    for (const systemId of systems) {
      const e = enrichment.get(systemId);
      if (e) {
        e.smartAssemblyCount++;
        e.activePlayerAddresses.add(wallet);
      }
    }
  }

  // Aggregate killmails — these always have a solar system ID
  for (const k of killmails) {
    const e = enrichment.get(k.solarSystemId);
    if (e) {
      e.recentKills++;
      if (k.attackerId) e.activePlayerAddresses.add(k.attackerId);
      if (k.victimId) e.activePlayerAddresses.add(k.victimId);
    }
  }

  // Also expose raw data for player-level scoring
  (enrichment as any).__rawAssemblies = assemblies;
  (enrichment as any).__rawKillmails = killmails;
  (enrichment as any).__walletSystems = walletSystems;

  return enrichment;
}

/** Get the raw assembly, killmail, and wallet-system data from the last enrichment */
export function getRawGameData(enrichment: Map<number, SystemEnrichment>): {
  assemblies: RawSmartAssembly[];
  killmails: RawKillmail[];
  walletSystems: Map<string, Set<number>>;
} {
  return {
    assemblies: (enrichment as any).__rawAssemblies || [],
    killmails: (enrichment as any).__rawKillmails || [],
    walletSystems: (enrichment as any).__walletSystems || new Map(),
  };
}
