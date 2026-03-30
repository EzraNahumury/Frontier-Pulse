/**
 * Fetches real EVE Frontier game data (assemblies, killmails, characters)
 * directly from the Sui blockchain via GraphQL.
 *
 * After the Sui migration, these are on-chain objects — the World API
 * REST endpoints for /v2/smartassemblies and /v2/killmails no longer exist.
 */

import { config } from "./config.js";

const GQL = config.suiGraphqlUrl;
const WORLD_PKG = config.eveWorldPackage;

// ── Types matching the old World API format (scoring code stays unchanged) ──

export interface RawSmartAssembly {
  id: string;
  typeId: number;
  solarSystemId: number; // 0 when location can't be resolved
  ownerId: string;        // wallet address (resolved via OwnerCap)
  state: string;
}

export interface RawKillmail {
  id: string;
  solarSystemId: number;
  attackerId: string;  // wallet address (resolved via Character → OwnerCap)
  victimId: string;    // wallet address (resolved via Character → OwnerCap)
  timestamp: number;
}

// ── GraphQL helper ──

async function gqlQuery<T>(query: string): Promise<T> {
  const res = await fetch(GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors?.length) {
    console.warn("[SuiGQL] GraphQL errors:", JSON.stringify(json.errors));
  }
  return json.data as T;
}

/** Paginate through all objects of a given type */
async function fetchAllObjects<T>(
  type: string,
  extractNodes: (data: any) => { nodes: T[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } },
  pageSize = 50,
): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | null = null;

  while (true) {
    const afterClause = cursor ? `, after: "${cursor}"` : "";
    const query = `{
      objects(filter: { type: "${type}" }, first: ${pageSize}${afterClause}) {
        nodes {
          address
          owner { __typename ... on AddressOwner { owner: address { address } } }
          asMoveObject { contents { json } }
        }
        pageInfo { hasNextPage endCursor }
      }
    }`;

    const data = await gqlQuery<any>(query);
    const result = extractNodes(data);
    all.push(...result.nodes);

    if (!result.pageInfo.hasNextPage) break;
    cursor = result.pageInfo.endCursor;
  }

  return all;
}

// ── Raw on-chain types ──

interface OnChainKillmail {
  address: string;
  json: {
    key: { item_id: string };
    killer_id: { item_id: string };
    victim_id: { item_id: string };
    solar_system_id: { item_id: string };
    kill_timestamp: string;
    loss_type: { "@variant": string };
  };
}

interface OnChainAssembly {
  address: string;
  json: {
    key: { item_id: string };
    owner_cap_id: string;
    type_id: string;
    status: { status: { "@variant": string } };
  };
}

interface OnChainCharacter {
  address: string;
  json: {
    key: { item_id: string };
    owner_cap_id: string;
    character_address: string;
  };
}

interface OnChainOwnerCap {
  address: string;
  ownerWallet: string;
  json: {
    authorized_object_id: string;
  };
}

// ── Fetch functions ──

export async function fetchOnChainKillmails(): Promise<OnChainKillmail[]> {
  console.log("[SuiGQL] Fetching killmails...");
  const type = `${WORLD_PKG}::killmail::Killmail`;
  const items = await fetchAllObjects<OnChainKillmail>(type, (data) => ({
    nodes: data.objects.nodes.map((n: any) => ({
      address: n.address,
      json: n.asMoveObject.contents.json,
    })),
    pageInfo: data.objects.pageInfo,
  }));
  console.log(`[SuiGQL] Got ${items.length} killmails`);
  return items;
}

export async function fetchOnChainAssemblies(): Promise<OnChainAssembly[]> {
  console.log("[SuiGQL] Fetching assemblies...");
  const type = `${WORLD_PKG}::assembly::Assembly`;
  const items = await fetchAllObjects<OnChainAssembly>(type, (data) => ({
    nodes: data.objects.nodes.map((n: any) => ({
      address: n.address,
      json: n.asMoveObject.contents.json,
    })),
    pageInfo: data.objects.pageInfo,
  }));
  console.log(`[SuiGQL] Got ${items.length} assemblies`);
  return items;
}

export async function fetchOnChainCharacters(): Promise<OnChainCharacter[]> {
  console.log("[SuiGQL] Fetching characters...");
  const type = `${WORLD_PKG}::character::Character`;
  const items = await fetchAllObjects<OnChainCharacter>(type, (data) => ({
    nodes: data.objects.nodes.map((n: any) => ({
      address: n.address,
      json: n.asMoveObject.contents.json,
    })),
    pageInfo: data.objects.pageInfo,
  }));
  console.log(`[SuiGQL] Got ${items.length} characters`);
  return items;
}

async function fetchOwnerCaps(objectType: string): Promise<OnChainOwnerCap[]> {
  const capType = `${WORLD_PKG}::access::OwnerCap<${WORLD_PKG}::${objectType}>`;
  const items = await fetchAllObjects<OnChainOwnerCap>(capType, (data) => ({
    nodes: data.objects.nodes.map((n: any) => ({
      address: n.address,
      ownerWallet: n.owner?.__typename === "AddressOwner" ? n.owner.owner.address : "",
      json: n.asMoveObject.contents.json,
    })),
    pageInfo: data.objects.pageInfo,
  }));
  return items;
}

// ── Location events: map deployables → solar system + owner via LocationRevealedEvent ──
// Events fire for ALL deployable types (Assembly, Gate, StorageUnit, NetworkNode),
// and include owner_cap_id so we can resolve wallet → system directly.

interface LocationEvent {
  assemblyId: string;
  ownerCapId: string;
  solarSystemId: number;
}

async function fetchLocationEvents(): Promise<LocationEvent[]> {
  console.log("[SuiGQL] Fetching LocationRevealedEvents...");
  const events: LocationEvent[] = [];
  const eventType = `${WORLD_PKG}::location::LocationRevealedEvent`;

  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const beforeClause: string = cursor ? `, before: "${cursor}"` : "";
    const query: string = `{
      events(filter: { type: "${eventType}" }, last: 50${beforeClause}) {
        nodes { contents { json } }
        pageInfo { hasPreviousPage startCursor }
      }
    }`;

    const data: any = await gqlQuery<any>(query);
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

  console.log(`[SuiGQL] Got ${events.length} location events`);
  return events;
}

/** Resolve owner_cap_ids from location events to wallet addresses */
async function resolveCapOwners(capIds: string[]): Promise<Map<string, string>> {
  const capToWallet = new Map<string, string>();
  if (capIds.length === 0) return capToWallet;

  // Batch query cap objects
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

// ── Main pipeline: fetch + resolve into normalized format ──

export async function fetchEveGameData(): Promise<{
  assemblies: RawSmartAssembly[];
  killmails: RawKillmail[];
  walletSystems: Map<string, Set<number>>;
}> {
  // Fetch all data in parallel
  const [rawKillmails, rawAssemblies, rawCharacters, assemblyCaps, characterCaps, locationEvents] =
    await Promise.all([
      fetchOnChainKillmails(),
      fetchOnChainAssemblies(),
      fetchOnChainCharacters(),
      fetchOwnerCaps("assembly::Assembly"),
      fetchOwnerCaps("character::Character"),
      fetchLocationEvents(),
    ]);

  // Build assembly → solar system map from location events
  const locationMap = new Map<string, number>();
  for (const ev of locationEvents) {
    locationMap.set(ev.assemblyId, ev.solarSystemId);
  }

  // Resolve owner_cap_ids from events to get wallet → system mapping
  // (covers Gates, StorageUnits, NetworkNodes — not just Assembly type)
  const eventCapIds = [...new Set(locationEvents.map((e) => e.ownerCapId).filter(Boolean))];
  const capOwners = await resolveCapOwners(eventCapIds);

  // Build Character address → wallet address mapping.
  // OwnerCaps are owned by the Character object (shared), not the wallet directly.
  // We must resolve Character address → wallet to attribute systems correctly.
  const charAddrToWallet = new Map<string, string>();
  const characterIdToWallet = new Map<string, string>();
  for (const char of rawCharacters) {
    const wallet = char.json.character_address;
    if (wallet) {
      charAddrToWallet.set(char.address, wallet);
      if (char.json.key?.item_id) {
        characterIdToWallet.set(char.json.key.item_id, wallet);
      }
    }
  }

  // Build wallet → systems mapping from ALL deployable locations
  const walletSystems = new Map<string, Set<number>>();
  for (const ev of locationEvents) {
    let owner = capOwners.get(ev.ownerCapId);
    if (!owner || ev.solarSystemId <= 0) continue;
    // Resolve Character address → actual wallet address
    const wallet = charAddrToWallet.get(owner) || owner;
    if (!walletSystems.has(wallet)) walletSystems.set(wallet, new Set());
    walletSystems.get(wallet)!.add(ev.solarSystemId);
  }
  console.log(`[SuiGQL] Mapped ${walletSystems.size} wallets to solar systems from location events`);

  // Build mappings

  // OwnerCap<Assembly> → wallet: cap.authorized_object_id → wallet
  // OwnerCap is owned by Character, so resolve to actual wallet
  const assemblyToWallet = new Map<string, string>();
  for (const cap of assemblyCaps) {
    if (cap.ownerWallet && cap.json.authorized_object_id) {
      const wallet = charAddrToWallet.get(cap.ownerWallet) || cap.ownerWallet;
      assemblyToWallet.set(cap.json.authorized_object_id, wallet);
    }
  }

  console.log(`[SuiGQL] Resolved ${assemblyToWallet.size} assembly owners, ${characterIdToWallet.size} character→wallet mappings`);

  // Normalize assemblies (with solar system from LocationRevealedEvent)
  const assemblies: RawSmartAssembly[] = rawAssemblies.map((a) => ({
    id: a.address,
    typeId: parseInt(a.json.type_id, 10) || 0,
    solarSystemId: locationMap.get(a.address) || 0,
    ownerId: assemblyToWallet.get(a.address) || "",
    state: a.json.status?.status?.["@variant"]?.toLowerCase() || "unknown",
  }));

  // Normalize killmails
  const killmails: RawKillmail[] = rawKillmails.map((k) => ({
    id: k.address,
    solarSystemId: parseInt(k.json.solar_system_id.item_id, 10) || 0,
    attackerId: characterIdToWallet.get(k.json.killer_id.item_id) || k.json.killer_id.item_id,
    victimId: characterIdToWallet.get(k.json.victim_id.item_id) || k.json.victim_id.item_id,
    timestamp: parseInt(k.json.kill_timestamp, 10) * 1000, // seconds → ms
  }));

  return { assemblies, killmails, walletSystems };
}
