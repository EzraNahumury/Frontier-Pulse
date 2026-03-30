/**
 * Deterministic seed data for demo/hackathon use.
 * Provides realistic player activity when World API assembly/killmail
 * endpoints are unavailable (currently returning 404).
 *
 * Uses real solar system IDs from the World API so everything maps correctly.
 */

// ── Featured test wallets (easy to copy-paste for demos) ──

export const TEST_WALLETS = {
  builder:  "0xA1b2C3d4E5f6a7B8c9D0e1F2a3B4c5D6e7F8a9B0",
  trader:   "0xB2c3D4e5F6a7b8C9d0E1f2A3b4C5d6E7f8A9b0C1",
  warlord:  "0xC3d4E5f6A7b8c9D0e1F2a3B4c5D6e7F8a9B0c1D2",
  diplomat: "0xD4e5F6a7B8c9d0E1f2A3b4C5d6E7f8A9b0C1d2E3",
  wildcard: "0xE5f6A7b8C9d0e1F2a3B4c5D6e7F8a9B0c1D2e3F4",
  newcomer: "0xF6a7B8c9D0e1f2A3b4C5d6E7f8A9b0C1d2E3f4A5",
} as const;

// Deterministic hash for generating consistent random data from an index
function seedHash(n: number): number {
  let h = n ^ 0x5f3759df;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff;
}

function pickFrom<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seedHash(seed) * arr.length)];
}

// Real system IDs from the EVE Frontier World API (first ~200 systems)
// These are actual IDs that exist in the solar system data
const SYSTEM_IDS = [
  30000001, 30000002, 30000003, 30000004, 30000005, 30000006, 30000007, 30000008,
  30000009, 30000010, 30000011, 30000012, 30000013, 30000014, 30000015, 30000016,
  30000017, 30000018, 30000019, 30000020, 30000021, 30000022, 30000023, 30000024,
  30000025, 30000026, 30000027, 30000028, 30000029, 30000030, 30000031, 30000032,
  30000033, 30000034, 30000035, 30000036, 30000037, 30000038, 30000039, 30000040,
  30000050, 30000060, 30000070, 30000080, 30000090, 30000100, 30000110, 30000120,
  30000130, 30000140, 30000150, 30000160, 30000170, 30000180, 30000190, 30000200,
  30000250, 30000300, 30000350, 30000400, 30000450, 30000500, 30000600, 30000700,
  30000800, 30000900, 30001000, 30001100, 30001200, 30001500, 30002000, 30002500,
  30003000, 30004000, 30005000, 30006000, 30007000, 30008000, 30009000, 30010000,
];

// ── Assembly types from EVE Frontier ──
const ASSEMBLY_TYPES = [84955, 84956, 84957, 84958]; // gate, storage, turret, node

// ── Generate seed addresses for ~80 players ──
function generateAddress(index: number): string {
  const hex = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += hex[Math.floor(seedHash(index * 100 + i) * 16)];
  }
  return addr;
}

export interface SeedAssembly {
  id: string;
  typeId: number;
  solarSystemId: number;
  ownerId: string;
  state: string;
}

export interface SeedKillmail {
  id: string;
  solarSystemId: number;
  attackerId: string;
  victimId: string;
  timestamp: number;
}

// ── Build the seed dataset ──

const PLAYER_COUNT = 80;

function buildSeedData() {
  const addresses: string[] = [];

  // First 6 are the featured test wallets
  addresses.push(
    TEST_WALLETS.builder, TEST_WALLETS.trader, TEST_WALLETS.warlord,
    TEST_WALLETS.diplomat, TEST_WALLETS.wildcard, TEST_WALLETS.newcomer,
  );
  // Fill remaining with generated addresses
  for (let i = 6; i < PLAYER_COUNT; i++) {
    addresses.push(generateAddress(i));
  }

  const assemblies: SeedAssembly[] = [];
  const killmails: SeedKillmail[] = [];
  let assemblyId = 1;
  let killId = 1;
  const now = Date.now();

  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i];
    const h = seedHash(i * 7);

    // Determine player profile based on archetype
    let assemblyCount: number;
    let killCount: number;
    let deathCount: number;
    let systemSpread: number;

    if (addr === TEST_WALLETS.builder) {
      // → Civilization Builder (stewardship>=80, reliability>=70)
      assemblyCount = 12; killCount = 1; deathCount = 0; systemSpread = 6;
    } else if (addr === TEST_WALLETS.trader) {
      // → Civilization Builder variant (high assemblies + wide reach)
      assemblyCount = 9; killCount = 0; deathCount = 0; systemSpread = 8;
    } else if (addr === TEST_WALLETS.warlord) {
      // → Warlord (volatility>=70, commerce<40 needs assemblies<=1)
      assemblyCount = 0; killCount = 12; deathCount = 2; systemSpread = 3;
    } else if (addr === TEST_WALLETS.diplomat) {
      // → Diplomat (diplomacy>=75, volatility<30, needs 0 combat + wide spread)
      assemblyCount = 3; killCount = 0; deathCount = 0; systemSpread = 10;
    } else if (addr === TEST_WALLETS.wildcard) {
      // → Wildcard (volatility 50-70, needs balanced kills/deaths)
      assemblyCount = 2; killCount = 5; deathCount = 5; systemSpread = 3;
    } else if (addr === TEST_WALLETS.newcomer) {
      assemblyCount = 1; killCount = 0; deathCount = 0; systemSpread = 1;
    } else {
      // Random profiles for background players
      assemblyCount = Math.floor(h * 8);
      killCount = Math.floor(seedHash(i * 11) * 6);
      deathCount = Math.floor(seedHash(i * 13) * 4);
      systemSpread = 1 + Math.floor(seedHash(i * 17) * 5);
    }

    // Pick systems for this player
    const playerSystems: number[] = [];
    for (let s = 0; s < systemSpread; s++) {
      playerSystems.push(pickFrom(SYSTEM_IDS, i * 50 + s));
    }

    // Generate assemblies
    for (let a = 0; a < assemblyCount; a++) {
      assemblies.push({
        id: `seed-assembly-${assemblyId++}`,
        typeId: pickFrom(ASSEMBLY_TYPES, i * 200 + a),
        solarSystemId: playerSystems[a % playerSystems.length],
        ownerId: addr,
        state: "online",
      });
    }

    // Generate kills — featured wallets (i<6) only fight random players,
    // random players (i>=6) also only fight other random players.
    // This keeps featured wallet stats clean and predictable.
    for (let k = 0; k < killCount; k++) {
      const victimIdx = 6 + ((i * 10 + k) % (addresses.length - 6));
      killmails.push({
        id: `seed-kill-${killId++}`,
        solarSystemId: playerSystems[k % playerSystems.length],
        attackerId: addr,
        victimId: addresses[victimIdx],
        timestamp: now - (k + 1) * 3600_000 - Math.floor(seedHash(i * 300 + k) * 7200_000),
      });
    }

    // Generate deaths — offset by assemblyCount so deaths use different systems
    for (let d = 0; d < deathCount; d++) {
      const attackerIdx = 6 + ((i * 10 + d + 5) % (addresses.length - 6));
      killmails.push({
        id: `seed-kill-${killId++}`,
        solarSystemId: playerSystems[(assemblyCount + d) % playerSystems.length],
        attackerId: addresses[attackerIdx],
        victimId: addr,
        timestamp: now - (d + 1) * 5400_000 - Math.floor(seedHash(i * 400 + d) * 10800_000),
      });
    }
  }

  return { assemblies, killmails };
}

// Export cached seed data
let _seed: { assemblies: SeedAssembly[]; killmails: SeedKillmail[] } | null = null;

export function getSeedData() {
  if (!_seed) _seed = buildSeedData();
  return _seed;
}
