# EVE Frontier x Sui Blockchain -- Comprehensive Technical Research

**Compiled: March 26, 2026**
**Purpose: Preparation for the EVE Frontier x Sui Hackathon 2026**

---

## TABLE OF CONTENTS

1. [Sui Blockchain Basics](#1-sui-blockchain-basics)
2. [The Move Programming Language](#2-the-move-programming-language)
3. [EVE Frontier + Sui Integration](#3-eve-frontier--sui-integration)
4. [GitHub Repositories Deep Dive](#4-github-repositories-deep-dive)
5. [World API and External Tools](#5-world-api-and-external-tools)
6. [Builder Tools and SDKs](#6-builder-tools-and-sdks)
7. [Move Language for EVE Frontier -- Contract Patterns](#7-move-language-for-eve-frontier----contract-patterns)
8. [The Hackathon: EVE Frontier x Sui 2026](#8-the-hackathon-eve-frontier-x-sui-2026)
9. [Community Resources](#9-community-resources)
10. [Quick-Start Checklist for Hackathon Participants](#10-quick-start-checklist-for-hackathon-participants)

---

## 1. SUI BLOCKCHAIN BASICS

### What Is Sui?

Sui is a **Layer-1, permissionless smart contract blockchain** designed for low-latency, high-throughput management of digital assets. Originally developed by **Mysten Labs** (founded by former Meta/Diem engineers), Sui is engineered for scale and mass-market consumer applications.

### Key Technical Properties

| Property | Detail |
|---|---|
| **Consensus** | Narwhal/Bullshark DAG-based consensus; simple transactions bypass consensus entirely |
| **Execution** | Parallel transaction execution (non-overlapping inputs processed simultaneously) |
| **Finality** | Sub-second transaction finality |
| **Data Model** | Object-centric (not account-centric like Ethereum) |
| **Smart Contract Language** | Move (Sui variant) |
| **Storage Model** | Each object has a unique 32-byte ID and is individually addressable |
| **Gas** | SUI token; supports sponsored transactions (third parties pay gas) |

### Sui's Object Model

Unlike Ethereum's account-based model, Sui treats **every on-chain entity as an object** with a unique ID. This is critical for EVE Frontier because every ship, structure, item, and character maps naturally to a Sui object.

**Five ownership types exist in Sui:**

1. **Address-Owned Objects** -- Belong to a specific wallet address. Only the owner can use them in transactions. Fast path (no consensus needed).
2. **Shared Objects** -- Accessible by anyone on the network. Require consensus for ordering. Used for things like marketplaces, game assemblies, etc.
3. **Immutable Objects** -- Cannot be changed, transferred, or deleted. No owner. Accessible to all. Good for configuration data.
4. **Wrapped Objects** -- Nested inside another object's data structure. Can be in `Option<T>` or `vector<T>` fields.
5. **Object-Owned Objects** -- An object owned by another object (not an address). Used for capability patterns.

### Why Sui Matters for Gaming

- **Parallel execution** means thousands of game transactions can process simultaneously
- **Sub-second finality** enables real-time gameplay interactions on-chain
- **Object model** maps 1:1 to game items/entities
- **Sponsored transactions** let players interact without holding gas tokens
- **zkLogin** enables players to sign in with existing OAuth credentials (Google, Apple, etc.) without managing private keys

---

## 2. THE MOVE PROGRAMMING LANGUAGE

### Overview

Move is a **resource-oriented, type-safe smart contract language** originally created for Facebook's Diem (Libra) blockchain. Sui uses a customized variant called "Sui Move" that integrates with Sui's object model.

### Key Move Concepts

**Abilities System:**
Every struct in Move has a set of *abilities* that control what you can do with it:
- `key` -- The struct is a Sui object (must have `id: UID` as first field)
- `store` -- Can be stored inside other objects
- `copy` -- Can be copied/cloned
- `drop` -- Can be implicitly discarded/destroyed

**Resource Safety:**
Move's type system guarantees that resources (objects with `key` ability) cannot be:
- Duplicated (no double-spending)
- Accidentally destroyed (must be explicitly consumed)
- Created out of thin air (only the defining module can create them)

This eliminates entire classes of exploits common in Solidity (reentrancy, token duplication, etc.).

**Module System:**
- Code is organized into **modules** within **packages**
- Modules define structs, functions, and constants
- Only the defining module can create instances of its structs (encapsulation)
- Packages are published on-chain and are immutable

**Key Sui Move Features:**
- `init()` function: Runs once at package publication for setup
- `entry` functions: Callable directly from transactions
- `public` functions: Callable from other modules
- Programmable Transaction Blocks (PTBs): Compose multiple Move calls into a single atomic transaction
- Dynamic fields: Attach arbitrary key-value data to objects at runtime

### Move Package Structure

```
my_package/
  Move.toml          # Package manifest (dependencies, addresses)
  sources/
    my_module.move   # Source code
  tests/
    my_tests.move    # Test files
```

### Move.toml Example (from EVE Frontier world contracts)

```toml
[package]
name = "world"
edition = "2024.beta"

[dependencies]
# Sui is provided implicitly

[environments]
testnet_internal = "4c78adac"
testnet_utopia = "4c78adac"
testnet_stillness = "4c78adac"
```

### Install Sui CLI

```bash
# Using suiup (recommended)
curl -sSf https://sui.io/install.sh | bash

# Or via Homebrew (macOS)
brew install sui

# Or via Chocolatey (Windows)
choco install sui
```

### Key Sui CLI Commands

```bash
sui move new my_project       # Create new Move project
sui move build                # Compile
sui move test                 # Run tests
sui client publish            # Deploy to network
sui client call               # Call on-chain functions
```

### Learning Resources for Move

- **The Move Book**: https://move-book.com/
- **Sui Move Intro Course**: https://intro.sui-book.com/
- **Sui Documentation**: https://docs.sui.io/concepts/sui-move-concepts
- **Awesome Sui**: https://github.com/sui-foundation/awesome-sui

---

## 3. EVE FRONTIER + SUI INTEGRATION

### Background

**EVE Frontier** is a space survival MMO by CCP Games (creators of EVE Online). In October 2025, CCP Games announced that EVE Frontier would migrate from its previous Ethereum-based architecture (OP Sepolia testnet with MUD/Solidity) to the **Sui blockchain**.

The migration to Sui was completed around Q1 2026. This means:
- **All smart contracts are now written in Move** (not Solidity)
- The previous MUD/EVM-based builder-examples are **obsolete**
- New development uses Sui's object model and Move language

### Why CCP Chose Sui

1. **Object-centric architecture** -- Natural fit for modeling a universe with billions of distinct game items
2. **Parallel execution** -- Handles massive player economies without bottlenecks
3. **Sub-second finality** -- Responsive gameplay
4. **Move's safety guarantees** -- Player mods cannot introduce exploits
5. **zkLogin** -- Seamless onboarding (no wallet management required)
6. **Sponsored transactions** -- Players do not need to hold SUI tokens
7. **Walrus** -- Decentralized data storage for game assets
8. **Seal** -- Data access controls enabling information asymmetry (hidden locations, secret intel)

### What Exists On-Chain

EVE Frontier puts the following systems on the Sui blockchain:

| System | On-Chain Representation |
|---|---|
| **Characters** | Shared objects with identity, tribe, metadata, and OwnerCap |
| **Smart Assemblies** | Shared objects (gates, storage units, turrets, network nodes) |
| **Items/Inventory** | Objects within storage unit inventories |
| **EVE Token** | Sui Coin type with treasury, 10B total supply, 9 decimals |
| **Killmails** | On-chain records of ship destructions |
| **Locations** | Hashed on-chain (privacy-preserving); cleartext off-chain |
| **Energy/Fuel** | On-chain resource management for powering structures |
| **Access Control** | Capability-based (OwnerCap, AdminACL, typed witnesses) |

### The Smart Assemblies System

Smart Assemblies are the core moddable infrastructure of EVE Frontier. They are **programmable structures anchored in space** that players deploy and customize.

**Assembly Types:**

1. **Network Node** -- Power generator. Anchored at Lagrange points. Requires fuel deposit. Generates energy for other assemblies.
2. **Smart Gate** -- Enables custom space travel rules (toll gates, access lists, tribe-based permits). Links to other gates for transport.
3. **Smart Storage Unit** -- Programmable item storage (vending machines, trade hubs, guild hangars). Three access modes: extension-based, extension-to-owned, owner-direct.
4. **Smart Turret** -- Custom targeting algorithms for defense. Returns priority-weighted target lists.

**Assembly Lifecycle:**
1. Create a character (on-chain identity)
2. Deploy a Network Node at a Lagrange point
3. Deposit fuel and bring the Network Node online
4. Anchor a Smart Assembly (auto-connects to Network Node for energy)
5. Bring the Assembly online (reserves energy)
6. Optionally: register extension contracts to customize behavior

### The Extension Pattern (Moddability)

This is the **key pattern for hackathon participants**. EVE Frontier uses a **typed authentication witness pattern** for extensions:

1. The assembly maintains an allowlist of `TypeName` entries
2. A builder deploys a custom Move package with a witness type (e.g., `struct MyAuth has drop {}`)
3. The assembly owner registers the builder's type on the assembly
4. The extension calls assembly functions using its witness for authentication
5. Only the defining module can create instances of its witness type -- this is Move's security guarantee

**This means:** You can write custom logic that runs inside the game world, and only YOUR code can authenticate as YOUR extension.

### Mysten Labs Full Stack

EVE Frontier is the first game to use the complete Mysten Labs technology stack:

- **Sui** -- Core blockchain (transactions, objects, Move contracts)
- **Walrus** -- Decentralized data storage (game assets, large data blobs)
- **Seal** -- Data access controls (information asymmetry, encrypted intel)
- **zkLogin** -- OAuth-based wallet creation (via Enoki)
- **Sponsored Transactions** -- Gasless player experience

---

## 4. GITHUB REPOSITORIES DEEP DIVE

### Organization: https://github.com/evefrontier

All 8 public repositories:

| Repository | Language | Description |
|---|---|---|
| **world-contracts** | Move | Core Sui Move smart contracts for EVE Frontier |
| **evevault** | TypeScript | Chrome extension + web wallet using zkLogin |
| **builder-scaffold** | TypeScript + Move | Templates and tools for building on EVE Frontier |
| **dapps** | TypeScript | Monorepo for Frontier dApps and SDK packages |
| **sui-go-sdk** | Go | Go language SDK for Sui |
| **sui-gas-pool** | N/A | Gas sponsorship pool |
| **eve-frontier-proximity-zk-poc** | TypeScript | ZK proof system for obfuscated location/distance verification |
| **builder-documentation** | MDX | Documentation website source |

---

### 4.1 world-contracts (THE CORE REPO)

**URL:** https://github.com/evefrontier/world-contracts
**Language:** Sui Move
**Status:** Under active development; shared early for visibility and collaboration

#### Structure

```
world-contracts/
  contracts/
    assets/
      sources/EVE.move              # EVE token (Coin type, 10B supply)
      tests/EVE_tests.move
    world/
      sources/
        world.move                  # GovernorCap, init
        access/
          access_control.move       # OwnerCap, AdminACL, typed auth
        assemblies/
          assembly.move             # Base assembly (anchor, online, offline)
          gate.move                 # Smart Gate (jump, link, permits)
          storage_unit.move         # Storage Unit (inventory, deposits)
          turret.move               # Smart Turret (targeting)
        character/
          character.move            # Player identity (tribe, address, metadata)
        crypto/
          sig_verify.move           # Signature verification
        killmail/
          killmail.move             # Ship destruction records
        network_node/
          network_node.move         # Energy infrastructure
        primitives/
          energy.move               # Energy management
          fuel.move                 # Fuel consumption
          in_game_id.move           # Tenant + item ID system
          inventory.move            # Item storage
          location.move             # Hashed locations
          metadata.move             # Name, description, URL
          status.move               # Anchored/Online/Offline state
        registry/
          killmail_registry.move    # Killmail tracking
          object_registry.move      # Object existence tracking
      tests/                        # Comprehensive test suite
    extension_examples/
      sources/
        config.move                 # Shared ExtensionConfig + AdminCap
        corpse_gate_bounty.move     # Example: trade corpse for jump permit
        tribe_permit.move           # Example: tribe-based gate access
        turret.move                 # Example: custom turret targeting
      tests/
        gate_tests.move
  ts-scripts/                       # TypeScript interaction scripts
    access/setup-access.ts
    assembly/create-assembly.ts
    assets/transfer-eve.ts
    builder_extension/              # Scripts for extension management
    character/create-character.ts
    gate/                           # Gate creation, linking, jumping
    storage-unit/                   # Deposit, withdraw, item transfer
    turret/                         # Turret anchor, targeting
    utils/                          # Client, config, proof helpers
  scripts/                          # Shell scripts for deployment
  tools/error-decoder/              # Error decoding web tool
  docker/                           # Docker deployment
  docs/
    architechture.md                # Three-layer architecture ADR
```

#### Quick Start (from README)

```bash
# Prerequisites: Docker OR (Sui CLI + Node.js)

# 1. Create environment file
cp env.example .env

# 2. Get your private key
sui keytool export --address YOUR_ADDRESS
# Or generate new: sui keytool generate ed25519

# 3. Install dependencies
npm install

# 4. Build contracts
npm run build

# 5. Run tests
npm run test

# 6. Deploy locally
pnpm deploy-world
```

#### Three-Layer Architecture (from docs/architechture.md)

**Layer 1: Composable Primitives**
Small, focused modules implementing the "digital physics" of the game:
- `location.move` -- Spatial positioning with hashed storage
- `inventory.move` -- Item storage and management
- `fuel.move` -- Energy/resource consumption
- `status.move` -- State management (anchored/online/offline)
- `energy.move` -- Energy reservation system

Design principle: **Composition over inheritance**. Example compositions:
- Storage Unit = status + inventory + location + fuel + network_node
- Gate = status + location + fuel + network_node

**Layer 2: Game-Defined Assemblies**
Actual in-game structures:
- Each assembly is a **Sui shared object** (concurrent access)
- Protected by Move capability patterns
- Two authorization modes: Admin (game operations) and Owner (player operations)
- Maintain extension allowlists

**Layer 3: Player Extensions (Moddability)**
Custom smart contracts by players/builders:
- Register witness types on assemblies
- Type-based authorization (only defining module can instantiate)
- Dynamic registration/removal without redeployment
- Custom side effects and business logic

#### Key Contract: EVE Token (assets/EVE.move)

```move
module assets::EVE;

const DECIMALS: u8 = 9;
const TOTAL_SUPPLY: u64 = 10_000_000_000; // 10B tokens
const INITIAL_DEPLOYER_ALLOCATION: u64 = 10_000_000; // 10M to deployer
const SCALE: u64 = 1_000_000_000; // 10^DECIMALS

public struct EVE has drop {}  // One-time witness

public struct AdminCap has key, store { id: object::UID }

public struct EveTreasury has key {
    id: object::UID,
    balance: Balance<EVE>,
}
```

Features:
- Standard Sui Coin type using `coin_registry`
- 10 billion total supply, 9 decimal places
- Treasury holds non-circulating balance
- Admin can transfer from treasury and burn
- Uses Sui's CoinRegistry for proper registration

---

### 4.2 evevault (THE WALLET)

**URL:** https://github.com/evefrontier/evevault
**Language:** TypeScript (React + WXT)
**Description:** Chrome extension and web wallet for Sui using zkLogin

#### Key Features
- EVE Frontier FusionAuth OAuth integration
- zkLogin address derivation via Enoki
- Sui Wallet Standard implementation
- Transaction signing with zkLogin
- Multi-network (Devnet, Testnet) and multi-tenant (Stillness, Utopia) support
- Zustand state management, Chrome storage persistence

#### How It Works
1. User authenticates via FusionAuth (EVE Frontier's OAuth provider)
2. A Sui wallet address is **cryptographically derived** from the OAuth credential using zero-knowledge proofs (zkLogin)
3. No private key management needed by the user
4. Extension registers as "Eve Vault" in the page context
5. dApps connect via Sui Wallet Standard

#### Tech Stack
- WXT (Chrome extension framework)
- React + TypeScript
- Zustand (state management)
- @mysten/sui SDK
- Enoki (zkLogin integration)
- oidc-client-ts (OAuth)
- Bun (package manager)
- Turborepo (monorepo management)
- Biome (linting/formatting)

#### Monorepo Structure
```
evevault/
  packages/
    shared/              # Cross-platform business logic
      src/
        auth/            # OAuth, zkLogin, JWT handling
        wallet/          # Balance, transactions, zkProof
        sui/             # GraphQL client, network config
        stores/          # Device, network, tenant stores
        components/      # Shared React components
  apps/
    extension/           # Chrome MV3 extension
    web/                 # Web application (PWA)
```

#### dApp Integration

```typescript
import { WalletProvider } from "@mysten/dapp-kit";

<WalletProvider
  autoConnect
  walletFilter={(wallet) => wallet.name.includes("Eve Vault")}
>
  <App />
</WalletProvider>
```

---

### 4.3 builder-scaffold (THE STARTER KIT)

**URL:** https://github.com/evefrontier/builder-scaffold
**Language:** TypeScript + Move

Templates and tools for building on EVE Frontier. Contains:

```
builder-scaffold/
  move-contracts/
    smart_gate_extension/       # Gate extension template (tribe_permit, corpse_gate_bounty)
    storage_unit_extension/     # Storage unit extension template
  dapps/                        # Reference dApp (React + Vite)
  ts-scripts/                   # TypeScript interaction scripts
  setup-world/                  # World deployment configuration
  docker/                       # Containerized development
  zklogin/                      # OAuth-based signing CLI tool
  rust-scripts/                 # Rust-based tooling
```

#### Three Development Flows

1. **Docker Flow** -- No local Sui/Node.js needed; everything containerized
2. **Host Flow** -- Local Sui CLI + Node.js; targets localnet or testnet
3. **Existing World** -- Build extensions on already-deployed worlds

#### Workflow
1. Clone the repo
2. Choose environment (Docker or Host)
3. Deploy a world instance
4. Create/customize a Move contract
5. Publish the contract on-chain
6. Use TypeScript scripts to interact with it

---

### 4.4 dapps (THE FRONTEND MONOREPO)

**URL:** https://github.com/evefrontier/dapps
**Language:** TypeScript
**Description:** Monorepo for all Frontier dApps and support libraries

#### Packages
```
dapps/
  packages/
    apps/
      assembly/          # Assembly management dApp
    libs/
      dapp-kit/          # @evefrontier/dapp-kit -- SDK for Frontier dApps
      ui-components/     # Shared UI component library
```

Uses Nx for build orchestration and pnpm workspaces.

---

### 4.5 Other Repositories

**sui-go-sdk** -- Go language SDK for interacting with the Sui blockchain (fork/adaptation for EVE Frontier use).

**sui-gas-pool** -- Infrastructure for gas sponsorship, enabling gasless transactions for players.

**eve-frontier-proximity-zk-poc** -- A **zero-knowledge proof system** for obfuscated location and distance verification. This is the future of location privacy in EVE Frontier -- proving two entities are near each other without revealing actual coordinates.

**builder-documentation** -- MDX source for the documentation website at https://docs.evefrontier.com.

---

## 5. WORLD API AND EXTERNAL TOOLS

### World API Overview

The EVE Frontier World API provides external access to on-chain game state. It is documented via Swagger at: https://docs.evefrontier.com/SwaggerWorldApi

**Data Available:**
- Deployables/Smart Assemblies (positions, status, configurations)
- Characters (identity, tribe, metadata)
- General world information
- Items and inventories
- Killmails

**Access Methods:**
- **REST API** (Swagger-documented endpoints)
- **GraphQL** (for querying on-chain state)
- **gRPC** (for faster serialization)
- **Direct on-chain reads** (Sui RPC / SDK)

The underlying data exists on a public blockchain, so anyone can read the full universe state directly from Sui.

### Public vs. Private Endpoints

The API features both public and private endpoints. Public endpoints provide general world data; private endpoints may require authentication for sensitive operations.

### Provable Object Data (PODs)

PODs are a mechanism for integrating out-of-game applications with in-game events. They allow external tools to react to and verify on-chain game state.

### Community API Wrappers

- **R wrapper**: https://github.com/kandrsn99/frontierRwrapper
- **Dart API**: Available on pub.dev (evefrontier_api)

---

## 6. BUILDER TOOLS AND SDKS

### Official Tools

| Tool | Description | URL |
|---|---|---|
| **Sui CLI** | Build, test, deploy Move contracts | https://docs.sui.io/references/cli |
| **builder-scaffold** | Templates for Move contracts + dApps | https://github.com/evefrontier/builder-scaffold |
| **@eveworld/create-eve-dapp** | npm scaffolding tool for dApps | `npx @eveworld/create-eve-dapp my-dapp` |
| **@evefrontier/dapp-kit** | SDK for building Frontier dApps | In the dapps monorepo |
| **@mysten/dapp-kit-react** | Sui React hooks and components | npm: @mysten/dapp-kit-react |
| **@mysten/sui** | Sui TypeScript SDK | npm: @mysten/sui |
| **EVE Vault** | zkLogin wallet extension | https://github.com/evefrontier/evevault |
| **efctl** | Community tool for automated setup | Referenced in docs |
| **World API** | REST/GraphQL/gRPC endpoints | https://docs.evefrontier.com/SwaggerWorldApi |

### DApp Development Stack

The recommended stack for building EVE Frontier dApps:

```
Frontend: React + TypeScript + Vite
UI: Material UI + TailwindCSS
Routing: React Router
Blockchain: @mysten/sui SDK + @mysten/dapp-kit-react
Wallet: EVE Vault (zkLogin) or any Sui Wallet Standard wallet
State: Zustand
Package Manager: pnpm (v8+)
```

### Creating a New dApp

```bash
# Scaffold a new dApp
npx @eveworld/create-eve-dapp my-dapp
cd my-dapp
pnpm install

# Configure environment
# Set VITE_SMARTASSEMBLY_ID and VITE_GATEWAY in .env

# Start development
pnpm dev
```

### Smart Contract Development Workflow

```bash
# 1. Clone the scaffold
git clone https://github.com/evefrontier/builder-scaffold
cd builder-scaffold

# 2. Install dependencies
npm install

# 3. Write/modify Move contracts in move-contracts/
# 4. Build
sui move build

# 5. Test
sui move test

# 6. Deploy (Docker method)
docker build -t world-contracts:latest --target release-stage -f docker/Dockerfile .
docker run --rm -v "$(pwd)/.env:/app/.env:ro" -v "$(pwd)/deployments:/app/deployments" world-contracts:latest

# OR deploy locally
pnpm deploy-world

# 7. Interact via TypeScript scripts in ts-scripts/
```

---

## 7. MOVE LANGUAGE FOR EVE FRONTIER -- CONTRACT PATTERNS

### Pattern 1: The World Module (GovernorCap)

The root module creates a `GovernorCap` -- a capability object that grants administrative control.

```move
module world::world;

public struct GovernorCap has key {
    id: UID,
    governor: address,
}

fun init(ctx: &mut TxContext) {
    let gov_cap = GovernorCap {
        id: object::new(ctx),
        governor: ctx.sender(),
    };
    transfer::transfer(gov_cap, ctx.sender());
}
```

### Pattern 2: Assembly (Shared Object with Capabilities)

Assemblies are shared objects protected by OwnerCap:

```move
public struct Assembly has key {
    id: UID,
    key: TenantItemId,
    owner_cap_id: ID,
    type_id: u64,
    status: AssemblyStatus,
    location: Location,
    energy_source_id: Option<ID>,
    metadata: Option<Metadata>,
}

public fun online(
    assembly: &mut Assembly,
    network_node: &mut NetworkNode,
    energy_config: &EnergyConfig,
    owner_cap: &OwnerCap<Assembly>,
) {
    let assembly_id = object::id(assembly);
    assert!(access::is_authorized(owner_cap, assembly_id), EAssemblyNotAuthorized);
    // ... reserve energy, update status
}
```

### Pattern 3: Typed Witness Authentication (THE EXTENSION PATTERN)

This is the most important pattern for builders. Extensions authenticate using a witness type that only the defining module can create:

```move
// In your extension package:
module my_extension::config;

public struct ExtensionConfig has key {
    id: UID,
}

public struct AdminCap has key, store {
    id: UID,
}

// Your unique authentication witness
public struct MyAuth has drop {}

public fun my_auth(): MyAuth {
    MyAuth {}
}
```

Then in your extension logic:

```move
module my_extension::custom_gate;

use my_extension::config::{MyAuth, ExtensionConfig};
use world::gate::{Self, Gate};

public fun issue_jump_permit(
    extension_config: &ExtensionConfig,
    source_gate: &Gate,
    destination_gate: &Gate,
    character: &Character,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    // Custom logic: check tribe, check items, charge toll, etc.

    let expires_at = clock.timestamp_ms() + 5 * 24 * 60 * 60 * 1000; // 5 days
    gate::issue_jump_permit_with_id<MyAuth>(
        source_gate,
        destination_gate,
        character,
        config::my_auth(),
        expires_at,
        ctx,
    )
}
```

### Pattern 4: Dynamic Fields for Configuration

Extensions store configuration using Sui dynamic fields:

```move
// Define a config key and value type
public struct BountyConfigKey has copy, drop, store {}

public struct BountyConfig has drop, store {
    bounty_type_id: u64,
}

// Store config on the shared ExtensionConfig object
public fun set_bounty_type_id(
    extension_config: &mut ExtensionConfig,
    admin_cap: &AdminCap,
    bounty_type_id: u64,
) {
    extension_config.set_rule<BountyConfigKey, BountyConfig>(
        admin_cap,
        BountyConfigKey {},
        BountyConfig { bounty_type_id },
    );
}

// Read config
public fun bounty_type_id(extension_config: &ExtensionConfig): u64 {
    extension_config
        .borrow_rule<BountyConfigKey, BountyConfig>(BountyConfigKey {})
        .bounty_type_id
}
```

### Pattern 5: Corpse Gate Bounty (Full Extension Example)

This is a complete example of an extension that lets players trade a corpse item for a gate jump permit:

```move
module extension_examples::corpse_gate_bounty;

/// Submit a corpse to get a JumpPermit for using the gate.
public fun collect_corpse_bounty<T: key>(
    extension_config: &ExtensionConfig,
    storage_unit: &mut StorageUnit,
    source_gate: &Gate,
    destination_gate: &Gate,
    character: &Character,
    player_inventory_owner_cap: &OwnerCap<T>,
    corpse_item_id: u64,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    // 1. Read bounty config from dynamic fields
    let bounty_cfg = extension_config
        .borrow_rule<BountyConfigKey, BountyConfig>(BountyConfigKey {});

    // 2. Withdraw corpse from player inventory
    let corpse = storage_unit.withdraw_by_owner<T>(
        character, player_inventory_owner_cap, corpse_item_id, 1, ctx,
    );

    // 3. Verify corpse type matches bounty requirement
    assert!(corpse.type_id() == bounty_cfg.bounty_type_id, ECorpseTypeMismatch);

    // 4. Deposit corpse into owner's inventory
    storage_unit.deposit_item<XAuth>(character, corpse, config::x_auth(), ctx);

    // 5. Issue a 5-day jump permit
    let expires_at = clock.timestamp_ms() + 5 * 24 * 60 * 60 * 1000;
    gate::issue_jump_permit_with_id<XAuth>(
        source_gate, destination_gate, character,
        config::x_auth(), expires_at, ctx,
    )
}
```

### Pattern 6: Turret Extension (Custom Targeting)

```move
module extension_examples::turret;

public struct TurretAuth has drop {}

/// Game calls this with target candidates; return priority-weighted list.
public fun get_target_priority_list(
    turret: &Turret,
    _: &Character,
    target_candidate_list: vector<u8>,
    receipt: OnlineReceipt,
): vector<u8> {
    assert!(receipt.turret_id() == object::id(turret), EInvalidOnlineReceipt);

    let _ = turret::unpack_candidate_list(target_candidate_list);
    // Build your custom targeting logic here
    // Ship types: Shuttle(31), Corvette(237), Frigate(25),
    //             Destroyer(420), Cruiser(26), Battlecruiser(419)
    // Turret types: Autocannon(92402), Plasma(92403), Howitzer(92484)

    let return_list = vector::empty<turret::ReturnTargetPriorityList>();
    let result = bcs::to_bytes(&return_list);

    turret::destroy_online_receipt(receipt, TurretAuth {});
    result
}
```

### Pattern 7: Character System

Characters are shared objects with capability-based access:

```move
public struct Character has key {
    id: UID,
    key: TenantItemId,
    tribe_id: u32,
    character_address: address,
    metadata: Option<Metadata>,
    owner_cap_id: ID,
}

// Borrowing owner cap from a character (transfer-to-object pattern)
public fun borrow_owner_cap<T: key>(
    character: &mut Character,
    owner_cap_ticket: Receiving<OwnerCap<T>>,
    ctx: &TxContext,
): (OwnerCap<T>, access::ReturnOwnerCapReceipt) {
    assert!(character.character_address == ctx.sender(), ESenderCannotAccessCharacter);
    let owner_cap = access::receive_owner_cap(&mut character.id, owner_cap_ticket);
    let return_receipt = access::create_return_receipt(
        object::id(&owner_cap),
        object::id_address(character),
    );
    (owner_cap, return_receipt)
}
```

### Pattern 8: Privacy-Preserving Locations

All on-chain locations are stored as **cryptographic hashes**, not cleartext:

```move
public struct Location has store {
    // Contains hashed location data
    // Cleartext coordinates are NEVER stored on-chain
}

// Location verification uses signatures from trusted game server
// Future: Zero-knowledge proofs for trustless verification
```

This enables:
- Hidden bases and ambush strategies
- On-chain verification without revealing positions
- Future ZK proximity proofs (see eve-frontier-proximity-zk-poc)

---

## 8. THE HACKATHON: EVE FRONTIER x SUI 2026

### Overview

| Detail | Info |
|---|---|
| **Name** | "A Toolkit for Civilization" EVE Frontier x Sui Hackathon 2026 |
| **Dates** | March 11-31, 2026 |
| **Prize Pool** | $80,000 USD |
| **Format** | Global online event |
| **Team Size** | Individuals or teams up to 5 |
| **Registration** | http://deepsurge.xyz/evefrontier2026 |
| **Community Voting** | April 1-15, 2026 |
| **Winners Announced** | April 24, 2026 |

### Two Submission Tracks

#### Track 1: In-World Extensions (Smart Assembly Mods)

Build mods that run inside EVE Frontier through Smart Assemblies:
- Custom gate access rules (tolls, permits, tribe restrictions)
- Custom storage unit behavior (vending machines, automated trade)
- Custom turret targeting algorithms
- Novel assembly interactions and mechanics

**Technical requirements:** Deploy Move smart contracts that extend the world-contracts

#### Track 2: External Applications

Build tools that connect via the World API:
- Star maps and navigation tools
- Fleet coordination platforms
- Analytics dashboards and market trackers
- Intelligence and scouting tools
- Community management tools

**Technical requirements:** Use the World API (REST/GraphQL/gRPC) or read directly from Sui

### Judging

- Community participation plays a meaningful role
- Submissions can be deployed to live servers during judging
- Early April deployment earns bonus points
- Players can test and interact with entries

### Available Resources

- Documentation: https://docs.evefrontier.com/
- World Contracts: https://github.com/evefrontier/world-contracts
- Builder Scaffold: https://github.com/evefrontier/builder-scaffold
- EVE Vault: https://github.com/evefrontier/evevault
- Discord: https://discord.gg/evefrontier
- Training: Structured guides, video sessions, optional bootcamp

---

## 9. COMMUNITY RESOURCES

### Official Channels

| Resource | URL |
|---|---|
| **EVE Frontier Website** | https://evefrontier.com |
| **Builder Documentation** | https://docs.evefrontier.com |
| **Whitepaper** | https://whitepaper.evefrontier.com |
| **Discord** (55,000+ members) | https://discord.gg/evefrontier |
| **Linktree** | https://linktr.ee/evefrontier |
| **Support** | https://support.evefrontier.com |
| **CCP Games News** | https://www.ccpgames.com/news |

### Developer Documentation

| Resource | URL |
|---|---|
| **Builder Docs Home** | https://docs.evefrontier.com |
| **Smart Assemblies Intro** | https://docs.evefrontier.com/smart-assemblies/introduction |
| **Smart Contracts Overview** | https://docs.evefrontier.com/smart/world-development |
| **World API (Swagger)** | https://docs.evefrontier.com/SwaggerWorldApi |
| **DApp Building** | https://docs.evefrontier.com/Dapp |
| **Tool Setup** | https://docs.evefrontier.com/Tools |
| **Troubleshooting** | https://docs.evefrontier.com/Troubleshooting/Builder |

### Sui Ecosystem Learning

| Resource | URL |
|---|---|
| **Sui Documentation** | https://docs.sui.io |
| **Sui Move Concepts** | https://docs.sui.io/concepts/sui-move-concepts |
| **The Move Book** | https://move-book.com |
| **Sui Move Intro Course** | https://intro.sui-book.com |
| **Awesome Sui** | https://github.com/sui-foundation/awesome-sui |
| **Sui SDK (TypeScript)** | https://sdk.mystenlabs.com |
| **Sui dApp Kit** | https://sdk.mystenlabs.com/dapp-kit |
| **Sui GitHub** | https://github.com/MystenLabs/sui |

### Community Tutorials and Guides

- **Pool Party Nodes Guide**: https://poolpartynodes.com/eve-frontier-smart-assemblies-a-beginners-guide/
- **DEV.to Tutorial**: https://dev.to/q9/getting-started-with-smart-infrastructure-in-eve-frontier-45n4
- **Suipiens Analysis**: https://suipiens.com/blog/eve-frontier-chooses-sui-for-next-gen-on-chain-mmo/

### Previous Hackathons

- **EVE Frontier Hackathon 2025** (on Devpost): https://eve-frontier-hackathon-2025.devpost.com/ (Note: this was the older EVM-based hackathon)

### Legacy Resources (Pre-Sui, for reference only)

| Resource | Note |
|---|---|
| https://github.com/projectawakening/world-chain-contracts | Old EVM/Solidity contracts (current in-game until migration) |
| https://github.com/projectawakening/builder-examples | Old Solidity examples -- OBSOLETE for new development |

---

## 10. QUICK-START CHECKLIST FOR HACKATHON PARTICIPANTS

### For Smart Assembly Extensions (Track 1)

- [ ] **Install Sui CLI**: `curl -sSf https://sui.io/install.sh | bash` (or Chocolatey on Windows)
- [ ] **Install Node.js 22+** and pnpm
- [ ] **Clone builder-scaffold**: `git clone https://github.com/evefrontier/builder-scaffold`
- [ ] **Clone world-contracts**: `git clone https://github.com/evefrontier/world-contracts` (for reference)
- [ ] **Learn Move basics**: Work through https://move-book.com and https://intro.sui-book.com
- [ ] **Study extension examples**: Read `contracts/extension_examples/` in world-contracts
- [ ] **Understand the extension pattern**: Typed witness authentication + dynamic fields
- [ ] **Write your Move extension contract**
- [ ] **Test locally**: `sui move test`
- [ ] **Deploy**: Use builder-scaffold's Docker or Host flow
- [ ] **Interact**: Use TypeScript scripts in ts-scripts/

### For External Applications (Track 2)

- [ ] **Install Node.js 22+** and pnpm
- [ ] **Scaffold a dApp**: `npx @eveworld/create-eve-dapp my-dapp`
- [ ] **Or clone dapps repo**: `git clone https://github.com/evefrontier/dapps`
- [ ] **Study the World API**: https://docs.evefrontier.com/SwaggerWorldApi
- [ ] **Install Sui TypeScript SDK**: `npm install @mysten/sui @mysten/dapp-kit-react`
- [ ] **Connect to EVE Vault wallet**: Use Sui Wallet Standard
- [ ] **Read on-chain state**: Use Sui RPC or World API GraphQL endpoints
- [ ] **Build your tool**: Maps, dashboards, coordination platforms, analytics

### General

- [ ] **Join Discord**: https://discord.gg/evefrontier -- essential for support and community
- [ ] **Read the architecture ADR**: https://github.com/evefrontier/world-contracts/blob/main/docs/architechture.md
- [ ] **Register for the hackathon**: http://deepsurge.xyz/evefrontier2026
- [ ] **Team up**: Teams of up to 5 allowed
- [ ] **Plan for early April deployment**: Earns bonus points

---

## Sources

- [Move | Smart Contract Programming Language Powering Sui](https://www.sui.io/move)
- [Sui GitHub Repository](https://github.com/MystenLabs/sui)
- [Move Concepts | Sui Documentation](https://docs.sui.io/concepts/sui-move-concepts)
- [EVE Frontier to Launch on Layer-1 Blockchain Sui - CCP Games](https://www.ccpgames.com/news/2025/eve-frontier-to-launch-on-layer-1-blockchain-sui)
- [EVE Frontier to Launch on Sui - Sui Blog](https://blog.sui.io/ccp-games-eve-frontier-on-sui/)
- [EVE Frontier Moves to Sui Blockchain - W3Gamer](https://w3gamer.com/articles/eve-frontier-moves-to-sui-blockchain/)
- [EVE Frontier partners with Sui - Massively Overpowered](https://massivelyop.com/2025/10/09/eve-frontier-partners-with-sui-blockchain-to-enable-object-ownership-composability-and-scalability/)
- [CCP Games and Sui Announce $80,000 Hackathon - CCP Games](https://www.ccpgames.com/news/2026/ccp-games-and-sui-announce-usd80-000-a-toolkit-for-civilization-eve-frontier)
- [EVE Frontier x Sui Hackathon 2026 - Sui Blog](https://blog.sui.io/ccp-games-eve-frontier-hackathon/)
- [Announcing the EVE Frontier x Sui 2026 Hackathon](https://evefrontier.com/en/news/eve-frontier-sui-2026-hackathon)
- [EVE Frontier Builder Documentation](https://docs.evefrontier.com)
- [EVE Frontier Smart Assemblies Introduction](https://docs.evefrontier.com/smart-assemblies/introduction)
- [EVE Frontier Whitepaper](https://whitepaper.evefrontier.com)
- [Sui Documentation - Getting Started](https://docs.sui.io/guides/developer/getting-started)
- [The Move Book](https://move-book.com)
- [Sui Move Intro Course](https://intro.sui-book.com)
- [Awesome Sui](https://github.com/sui-foundation/awesome-sui)
- [Install Sui](https://docs.sui.io/guides/developer/getting-started/sui-install)
- [Sui dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [@eveworld/create-eve-dapp - npm](https://www.npmjs.com/package/@eveworld/create-eve-dapp)
- [EVE Frontier Discord](https://discord.com/invite/evefrontier)
- [EVE Frontier Linktree](https://linktr.ee/evefrontier)
- [Smart Infrastructure in EVE Frontier - DEV Community](https://dev.to/q9/getting-started-with-smart-infrastructure-in-eve-frontier-45n4)
- [Pool Party Nodes - Smart Assemblies Guide](https://poolpartynodes.com/eve-frontier-smart-assemblies-a-beginners-guide/)
- [EVE Frontier Chooses Sui - Suipiens](https://suipiens.com/blog/eve-frontier-chooses-sui-for-next-gen-on-chain-mmo/)
- [Grayscale - Why Sui Stands Out](https://research.grayscale.com/reports/why-sui-stands-out)
- [Supra - Ultimate Guide to Move](https://supra.com/academy/ultimate-guide-to-the-move-programming-language/)
- [EVE Frontier Hackathon 2025 - Devpost](https://eve-frontier-hackathon-2025.devpost.com/)
- [GitHub: evefrontier/world-contracts](https://github.com/evefrontier/world-contracts)
- [GitHub: evefrontier/evevault](https://github.com/evefrontier/evevault)
- [GitHub: evefrontier/builder-scaffold](https://github.com/evefrontier/builder-scaffold)
- [GitHub: evefrontier/dapps](https://github.com/evefrontier/dapps)
