# Frontier Pulse Smart Contract

On-chain civilization health oracle for **EVE Frontier** on the Sui blockchain. This Move smart contract provides the data backbone for the Frontier Pulse ecosystem — storing player reputation profiles, star system health metrics, the global Civilization Health Index (CHI), and community endorsements in a shared on-chain registry.

**Network:** Sui Testnet
**Package ID:** `0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9`

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Build & Test](#build--test)
- [Deployment](#deployment)
- [Module Reference](#module-reference)
  - [Data Structures](#data-structures)
  - [Capabilities](#capabilities)
  - [Oracle Functions](#oracle-functions)
  - [Public Read Functions](#public-read-functions)
  - [User Functions](#user-functions)
  - [Events](#events)
  - [Error Codes](#error-codes)
- [Scoring Formulas](#scoring-formulas)
- [On-Chain Addresses](#on-chain-addresses)

---

## Architecture Overview

```
┌──────────────┐     issue_oracle_cap()     ┌──────────────┐
│   AdminCap   │ ──────────────────────────► │  OracleCap   │
│  (deployer)  │                             │  (backend)   │
└──────────────┘                             └──────┬───────┘
                                                    │
                    write functions                  │
                    (reputation, health, CHI, alerts)│
                                                    ▼
                                          ┌─────────────────┐
                                          │  PulseRegistry   │
                                          │  (shared object) │
                                          │                  │
                                          │  ├─ reputations  │ ◄── Table<address, PlayerReputation>
                                          │  ├─ systems      │ ◄── Table<u64, SystemHealth>
                                          │  ├─ chi          │ ◄── CivilizationHealthIndex
                                          │  ├─ endorsements │ ◄── Table<u64, u64>
                                          │  └─ metadata     │ ◄── counters, version, timestamps
                                          └────────┬────────┘
                                                   │
                                      public read  │  endorse_system()
                                      functions    │  (any wallet)
                                                   ▼
                                          ┌─────────────────┐
                                          │  Frontend /      │
                                          │  External dApps  │
                                          └─────────────────┘
```

---

## Project Structure

```
smartcontract_FP/
├── sources/
│   ├── frontier_pulse.move         # Main module (788 lines)
│   └── smartcontract_fp.move       # Module stub
├── tests/
│   ├── frontier_pulse_tests.move   # Comprehensive test suite (24 tests)
│   └── smartcontract_fp_tests.move # Test stub
├── build/                          # Compiled artifacts (generated)
├── Move.toml                       # Package manifest
├── Move.lock                       # Dependency lock file
├── Published.toml                  # On-chain deployment metadata
└── backup.txt                      # Publish transaction history
```

---

## Prerequisites

- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) v1.64.2+
- Sui wallet with testnet SUI tokens

---

## Build & Test

### Build

```bash
cd smartcontract_FP
sui move build
```

### Run Tests

```bash
sui move test
```

The test suite contains **24 tests** covering:

| Category | Tests |
|----------|-------|
| Initialization | Admin cap creation, registry setup |
| Oracle Authorization | OracleCap issuance |
| Reputation CRUD | Create, read, update, delete player profiles |
| System Health CRUD | System snapshot operations |
| CHI Updates | Global metric calculations |
| Trust Thresholds | Trust-gating functionality |
| Comparisons | Compare two players' trust scores |
| Edge Cases | Perfect scores (100), zero scores (0) |
| Error Handling | Score validation, missing data, invalid severity |
| Endorsements | Endorse systems, double-endorsement prevention |

---

## Deployment

### Publish to Testnet

```bash
sui client publish --gas-budget 100000000
```

### Post-Deployment Setup

1. Note the **Package ID**, **AdminCap ID**, and **PulseRegistry ID** from the publish output
2. Issue an OracleCap to the oracle backend address:

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module frontier_pulse \
  --function issue_oracle_cap \
  --args <ADMIN_CAP_ID> <ORACLE_ADDRESS> <CLOCK_OBJECT> \
  --gas-budget 10000000
```

3. Note the **OracleCap ID** from the transaction output and configure the oracle backend

---

## Module Reference

### Data Structures

#### PulseRegistry (Shared Object)

The central state object accessible by all participants. Created during `init()` and shared immediately.

| Field | Type | Description |
|-------|------|-------------|
| `reputations` | `Table<address, PlayerReputation>` | Player trust profiles |
| `systems` | `Table<u64, SystemHealth>` | Star system health snapshots |
| `chi` | `CivilizationHealthIndex` | Global civilization metric |
| `total_players` | `u64` | Registered player count |
| `total_systems` | `u64` | Tracked system count |
| `last_updated_ms` | `u64` | Latest update timestamp |
| `version` | `u64` | Schema version for upgrades |
| `endorsement_counts` | `Table<u64, u64>` | Endorsements per system |
| `endorsement_records` | `Table<vector<u8>, bool>` | Double-endorsement prevention |

#### PlayerReputation

Five-dimensional trust profile for each player address.

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `player` | `address` | — | Sui wallet address |
| `reliability` | `u64` | 0–100 | Behavioral consistency |
| `commerce` | `u64` | 0–100 | Trading honesty |
| `diplomacy` | `u64` | 0–100 | Cross-group cooperation |
| `stewardship` | `u64` | 0–100 | Infrastructure contribution |
| `volatility` | `u64` | 0–100 | Behavioral unpredictability (inverted in scoring) |
| `composite_score` | `u64` | 0–100 | Weighted aggregate |
| `archetype` | `String` | — | Player classification label |
| `update_count` | `u64` | — | Number of updates received |
| `last_updated_ms` | `u64` | — | Timestamp of last update |

#### SystemHealth

Health snapshot for a solar system in EVE Frontier.

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `system_id` | `u64` | — | EVE Frontier system identifier |
| `activity_level` | `u64` | 0–100 | Overall activity metric |
| `trust_level` | `u64` | 0–100 | Inter-player trust |
| `player_count` | `u64` | — | Active player count |
| `infrastructure_count` | `u64` | — | Smart Assembly density |
| `tx_frequency` | `u64` | 0–100 | Transaction rate |
| `combat_incidents` | `u64` | — | Recent battle count |
| `local_chi` | `u64` | 0–100 | Local Civilization Health Index |
| `last_updated_ms` | `u64` | — | Timestamp of last update |

#### CivilizationHealthIndex (CHI)

Global civilization health metric with 6 weighted sub-indices.

| Field | Type | Range | Weight | Description |
|-------|------|-------|--------|-------------|
| `overall_score` | `u64` | 0–100 | — | Weighted aggregate |
| `economic_vitality` | `u64` | 0–100 | 20% | Trade volume, currency circulation |
| `security_index` | `u64` | 0–100 | 15% | Kill rate, defense infrastructure |
| `growth_rate` | `u64` | 0–100 | 15% | New deployments, expansion |
| `connectivity` | `u64` | 0–100 | 15% | Gate network density |
| `trust_index` | `u64` | 0–100 | 20% | Average reputation scores |
| `social_cohesion` | `u64` | 0–100 | 15% | Cross-alliance cooperation |
| `diagnosis` | `String` | — | — | Human-readable status |
| `last_calculated_ms` | `u64` | — | — | Timestamp |

---

### Capabilities

#### AdminCap

Proof of contract deployment. Automatically transferred to the deployer during `init()`. Used exclusively to issue `OracleCap` tokens.

#### OracleCap

Authorization token for oracle backend services. Required to call all write functions (reputation, system health, CHI, alerts). Issued by the admin via `issue_oracle_cap()`.

---

### Oracle Functions

These functions require an `OracleCap` reference.

#### `update_player_reputation`

```move
public fun update_player_reputation(
    _oracle: &OracleCap,
    registry: &mut PulseRegistry,
    clock: &Clock,
    player: address,
    reliability: u64,
    commerce: u64,
    diplomacy: u64,
    stewardship: u64,
    volatility: u64,
    archetype: String,
)
```

Creates or updates a player's 5-dimensional reputation profile. Validates all scores are 0–100. Automatically computes the composite score. Emits `ReputationUpdated`.

#### `remove_player_reputation`

```move
public fun remove_player_reputation(
    _oracle: &OracleCap,
    registry: &mut PulseRegistry,
    clock: &Clock,
    player: address,
)
```

Removes a player's reputation from the registry. Aborts with `EPlayerNotFound` if the player doesn't exist. Emits `ReputationRemoved`.

#### `update_system_health`

```move
public fun update_system_health(
    _oracle: &OracleCap,
    registry: &mut PulseRegistry,
    clock: &Clock,
    system_id: u64,
    activity_level: u64,
    trust_level: u64,
    player_count: u64,
    infrastructure_count: u64,
    tx_frequency: u64,
    combat_incidents: u64,
)
```

Creates or updates a system health snapshot. Validates activity and trust levels are 0–100. Calculates `local_chi`. Emits `SystemHealthUpdated`.

#### `remove_system`

```move
public fun remove_system(
    _oracle: &OracleCap,
    registry: &mut PulseRegistry,
    clock: &Clock,
    system_id: u64,
)
```

Removes a system from the registry. Aborts with `ESystemNotFound` if not found.

#### `update_global_chi`

```move
public fun update_global_chi(
    _oracle: &OracleCap,
    registry: &mut PulseRegistry,
    clock: &Clock,
    economic_vitality: u64,
    security_index: u64,
    growth_rate: u64,
    connectivity: u64,
    trust_index: u64,
    social_cohesion: u64,
    diagnosis: String,
)
```

Updates the global Civilization Health Index. Validates all sub-indices are 0–100. Calculates `overall_score` using the weighted formula. Emits `CHIUpdated`.

#### `emit_anomaly_alert`

```move
public fun emit_anomaly_alert(
    _oracle: &OracleCap,
    clock: &Clock,
    alert_type: String,
    severity: u8,
    system_id: u64,
    description: String,
)
```

Emits an anomaly alert as an event (not stored on-chain for gas efficiency). Severity must be 0–4. Emits `AnomalyAlertEmitted`.

#### `issue_oracle_cap`

```move
public fun issue_oracle_cap(
    _admin: &AdminCap,
    recipient: address,
    clock: &Clock,
    ctx: &mut TxContext,
)
```

Issues an OracleCap to authorize a backend service. Requires `AdminCap`. Emits `OracleAuthorized`.

---

### Public Read Functions

These functions are callable by anyone without any capability.

#### Player Reputation

| Function | Signature | Returns |
|----------|-----------|---------|
| `has_reputation` | `(registry, player): bool` | Whether the player exists |
| `get_composite_score` | `(registry, player): u64` | Trust composite score |
| `get_reputation` | `(registry, player): (u64, u64, u64, u64, u64, u64)` | 5 dimensions + composite |
| `get_archetype` | `(registry, player): String` | Player archetype label |
| `meets_trust_threshold` | `(registry, player, min_score): bool` | Trust gating (returns `false` if not found) |
| `compare_trust` | `(registry, player_a, player_b): (u64, u64)` | Side-by-side composite scores |

#### System Health

| Function | Signature | Returns |
|----------|-----------|---------|
| `has_system` | `(registry, system_id): bool` | Whether the system exists |
| `get_system_health` | `(registry, system_id): (u64, u64, u64, u64)` | activity, trust, players, local_chi |
| `get_system_health_full` | `(registry, system_id): (u64, u64, u64, u64, u64, u64, u64)` | All 7 fields |

#### CHI

| Function | Signature | Returns |
|----------|-----------|---------|
| `get_chi_overall` | `(registry): u64` | Overall CHI score |
| `get_chi_details` | `(registry): (u64, u64, u64, u64, u64, u64, u64)` | Overall + 6 sub-indices |
| `get_diagnosis` | `(registry): String` | Diagnosis text |

#### Registry Statistics

| Function | Signature | Returns |
|----------|-----------|---------|
| `get_total_players` | `(registry): u64` | Total registered players |
| `get_total_systems` | `(registry): u64` | Total tracked systems |
| `get_last_updated` | `(registry): u64` | Last update timestamp (ms) |
| `get_endorsement_count` | `(registry, system_id): u64` | Endorsements for a system |

---

### User Functions

These functions can be called by any Sui wallet without an OracleCap.

#### `endorse_system`

```move
entry fun endorse_system(
    registry: &mut PulseRegistry,
    clock: &Clock,
    system_id: u64,
    ctx: &TxContext,
)
```

Allows any wallet to endorse a star system on-chain. Each wallet can endorse a system only once (double-endorsement prevented via composite key). Increments the system's endorsement counter. Emits `SystemEndorsed`.

---

### Events

| Event | Emitted By | Key Fields |
|-------|------------|------------|
| `ReputationUpdated` | `update_player_reputation` | player, 5 dimensions, composite_score, archetype |
| `ReputationRemoved` | `remove_player_reputation` | player |
| `SystemHealthUpdated` | `update_system_health` | system_id, activity, trust, local_chi, player_count |
| `CHIUpdated` | `update_global_chi` | overall_score, 6 sub-indices, diagnosis |
| `AnomalyAlertEmitted` | `emit_anomaly_alert` | alert_type, severity, system_id, description |
| `OracleAuthorized` | `issue_oracle_cap` | recipient |
| `SystemEndorsed` | `endorse_system` | endorser, system_id, total_endorsements |

### Alert Severity Levels

| Value | Level |
|-------|-------|
| 0 | CRITICAL |
| 1 | HIGH |
| 2 | MEDIUM |
| 3 | WARNING |
| 4 | INFO |

---

### Error Codes

| Code | Constant | Trigger |
|------|----------|---------|
| 0 | `EScoreOutOfRange` | Any score value exceeds 100 |
| 1 | `EPlayerNotFound` | Player address not in registry |
| 2 | `ESystemNotFound` | System ID not in registry |
| 3 | `EInvalidAlertSeverity` | Alert severity not 0–4 |
| 4 | `EAlreadyEndorsed` | Wallet already endorsed this system |

---

## Scoring Formulas

### Player Composite Score

```
composite = (reliability × 25 + commerce × 25 + diplomacy × 20
           + stewardship × 20 + (100 - volatility) × 10) / 100
```

### Local CHI (Per System)

```
local_chi = (activity_level × 40 + trust_level × 60) / 100
```

### Global CHI (Overall)

```
overall = (economic_vitality × 20 + security_index × 15 + growth_rate × 15
         + connectivity × 15 + trust_index × 20 + social_cohesion × 15) / 100
```

---

## On-Chain Addresses

All addresses are on **Sui Testnet**.

| Object | Address |
|--------|---------|
| Package | `0x661842e6994fa10da8182c752711dd313895f8cf0dcc94eba6764beb6f43bbc9` |
| PulseRegistry (shared) | `0x945f1d589bae9c60e95b99c0f02a7fffb814db3772cb16467e5c683ea0bd32c4` |
| AdminCap | `0x2adb35c6ececb66b28fd178d246d3ef1b4f8c65fa5a3a7583192df91605da797` |
| UpgradeCap | `0x4d9d1182571536e4f2383a66a89622a66e0dfd114b23b89f1b0fb313c7d9ef46` |
| Clock (Sui system) | `0x0000000000000000000000000000000000000000000000000000000000000006` |

---

## Dependencies

| Package | Source |
|---------|--------|
| Sui Framework | Built-in (testnet rev `563c158`) |
| MoveStdlib | Built-in (testnet rev `563c158`) |

---

## License

MIT

Part of the [Frontier Pulse](https://github.com/EzraNahumury/Frontier-Pulse) project for the EVE Frontier x Sui Hackathon 2026.
