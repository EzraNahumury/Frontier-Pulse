const BASE = "https://world-api-utopia.uat.pub.evefrontier.com";

// ── Raw types from World API ──

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

// ── Normalized types for frontend ──

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

// ── In-memory cache ──

let systemCache: { data: WorldSystem[]; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

// ── Fetch all solar systems (parallel paginated) ──

export async function fetchAllSystems(): Promise<WorldSystem[]> {
  if (systemCache && Date.now() - systemCache.ts < CACHE_TTL) {
    return systemCache.data;
  }

  // Get total count first
  const probe = await fetch(`${BASE}/v2/solarsystems?limit=1&offset=0`);
  if (!probe.ok) throw new Error(`World API error: ${probe.status}`);
  const { metadata } = await probe.json();
  const total: number = metadata.total;

  // Fetch all pages in parallel (1000 per page)
  const pageSize = 1000;
  const pages = Math.ceil(total / pageSize);
  const fetches = Array.from({ length: pages }, (_, i) =>
    fetch(`${BASE}/v2/solarsystems?limit=${pageSize}&offset=${i * pageSize}`)
      .then((r) => r.json())
      .then((d) => d.data as RawSystem[])
  );
  const results = await Promise.all(fetches);
  const all = results.flat();

  // Find coordinate bounds
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const s of all) {
    const { x, y, z } = s.location;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const rx = maxX - minX || 1;
  const rz = maxZ - minZ || 1;
  const ry = maxY - minY || 1;

  // Normalize to 0-1 with padding
  const pad = 0.03;
  const normalized: WorldSystem[] = all.map((s) => ({
    id: s.id,
    name: s.name,
    constellationId: s.constellationId,
    regionId: s.regionId,
    nx: pad + ((s.location.x - minX) / rx) * (1 - pad * 2),
    ny: pad + ((s.location.z - minZ) / rz) * (1 - pad * 2),
    depth: (s.location.y - minY) / ry,
  }));

  systemCache = { data: normalized, ts: Date.now() };
  return normalized;
}

// ── System name map (shared with liveData.ts to avoid duplicate fetches) ──

export async function getSystemNameMap(): Promise<Map<number, string>> {
  const systems = await fetchAllSystems();
  const map = new Map<number, string>();
  for (const s of systems) map.set(s.id, s.name);
  return map;
}

// ── Fetch smart character's solar system from World API ──

export async function fetchSmartCharacterSystem(walletAddress: string): Promise<number | null> {
  try {
    const res = await fetch(`${BASE}/v2/smartcharacters/${walletAddress}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Handle different possible field names for the solar system ID
    const solarSystemId = data?.solarSystemId ?? data?.solar_system_id ?? null;
    return typeof solarSystemId === "number" && solarSystemId > 0 ? solarSystemId : null;
  } catch {
    return null;
  }
}

// ── Fetch single system with gate links ──

export async function fetchSystemDetail(id: number): Promise<SystemDetail | null> {
  // Find from cache for base data
  const systems = await fetchAllSystems();
  const base = systems.find((s) => s.id === id);
  if (!base) return null;

  // Fetch gate links from World API
  const res = await fetch(`${BASE}/v2/solarsystems/${id}`);
  if (!res.ok) return { ...base, gateLinks: [] };
  const raw = await res.json();

  const gateLinks: GateLink[] = (raw.gateLinks || []).map((g: RawGateLink) => ({
    gateId: g.id,
    gateName: g.name,
    destinationId: g.destination.id,
    destinationName: g.destination.name,
  }));

  return { ...base, gateLinks };
}
