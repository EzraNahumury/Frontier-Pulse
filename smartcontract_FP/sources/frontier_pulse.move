/// Frontier Pulse — On-chain civilization health oracle for EVE Frontier.
///
/// Menyediakan data layer on-chain untuk Frontier Pulse, sebuah real-time
/// civilization health monitor. Menyimpan:
///   - Player reputation profiles (Trust Compass: 5-dimension trust scores)
///   - Star system health snapshots
///   - Global Civilization Health Index (CHI)
///
/// Data ditulis oleh oracle backend yang terotorisasi dan dapat dibaca oleh siapa saja,
/// memungkinkan dApp lain membuat keputusan berbasis trust.
module smartcontract_fp::frontier_pulse;

use sui::event;
use sui::table::{Self, Table};
use sui::clock::Clock;
use std::string::String;

// ==================== Error Constants ====================

/// Nilai skor melebihi batas maksimum (100)
const EScoreOutOfRange: u64 = 0;
/// Alamat player tidak ditemukan di registry
const EPlayerNotFound: u64 = 1;
/// System ID tidak ditemukan di registry
const ESystemNotFound: u64 = 2;
/// Nilai severity alert tidak valid (harus 0-4)
const EInvalidAlertSeverity: u64 = 3;
/// Player sudah meng-endorse sistem ini
const EAlreadyEndorsed: u64 = 4;

// ==================== Score Constants ====================

/// Nilai maksimum untuk semua dimensi skor
const MAX_SCORE: u64 = 100;

// Composite Trust Score weights (total = 100)
const W_RELIABILITY: u64 = 25;
const W_COMMERCE: u64 = 25;
const W_DIPLOMACY: u64 = 20;
const W_STEWARDSHIP: u64 = 20;
const W_VOLATILITY_INV: u64 = 10; // Inverted: (100 - volatility) * weight

// CHI sub-index weights (total = 100)
const W_ECONOMIC: u64 = 20;
const W_SECURITY: u64 = 15;
const W_GROWTH: u64 = 15;
const W_CONNECTIVITY: u64 = 15;
const W_TRUST: u64 = 20;
const W_SOCIAL: u64 = 15;

// Alert severity levels (0 = paling kritis)
const SEVERITY_INFO: u8 = 4;

// ==================== Capabilities ====================

/// Admin capability — diberikan otomatis ke deployer saat publish.
/// Digunakan untuk mengotorisasi oracle backend via `issue_oracle_cap`.
public struct AdminCap has key, store {
    id: UID,
}

/// Oracle capability — dikeluarkan oleh admin untuk backend services.
/// Wajib dimiliki untuk semua operasi tulis data ke PulseRegistry.
public struct OracleCap has key, store {
    id: UID,
}

// ==================== Core Registry ====================

/// Registry utama (shared object) yang menyimpan seluruh state Frontier Pulse.
/// Siapa saja bisa membaca; hanya pemegang OracleCap yang bisa menulis.
public struct PulseRegistry has key {
    id: UID,
    /// Player address → profil Trust Compass
    reputations: Table<address, PlayerReputation>,
    /// Star system ID → snapshot kesehatan sistem
    systems: Table<u64, SystemHealth>,
    /// Global Civilization Health Index (singleton)
    chi: CivilizationHealthIndex,
    /// Jumlah player yang dilacak
    total_players: u64,
    /// Jumlah star system yang dilacak
    total_systems: u64,
    /// Timestamp update terakhir (epoch ms)
    last_updated_ms: u64,
    /// Versi skema untuk kompatibilitas upgrade
    version: u64,
    /// System ID → total endorsement count (user-driven on-chain signals)
    endorsement_counts: Table<u64, u64>,
    /// "endorser:system_id" → true, prevents double-endorsement
    endorsement_records: Table<vector<u8>, bool>,
}

// ==================== Trust Compass (Player Reputation) ====================

/// Profil reputasi player dengan 5 dimensi perilaku.
/// Skor 0–100, dihitung off-chain oleh Agora Engine menggunakan
/// data World API + Sui RPC dengan time-decay eksponensial (half-life: 14 hari).
public struct PlayerReputation has store, drop, copy {
    /// Alamat Sui player
    player: address,
    /// Konsistensi perilaku: "Bisa diandalkan?" (0-100)
    reliability: u64,
    /// Kejujuran perdagangan: "Jujur dalam transaksi?" (0-100)
    commerce: u64,
    /// Kerjasama lintas-grup: "Menyatukan orang?" (0-100)
    diplomacy: u64,
    /// Kontribusi infrastruktur: "Membangun untuk orang lain?" (0-100)
    stewardship: u64,
    /// Ketidakpastian perilaku: "Bisa mengkhianati?" (0-100, lebih rendah = lebih aman)
    volatility: u64,
    /// Skor trust komposit tertimbang (0-100)
    composite_score: u64,
    /// Label arketipe dari pola dimensi (mis. "Trusted Trader", "Warlord")
    archetype: String,
    /// Jumlah update yang diterima
    update_count: u64,
    /// Timestamp update terakhir (epoch ms)
    last_updated_ms: u64,
}

// ==================== System Health ====================

/// Snapshot kesehatan satu star system di EVE Frontier.
public struct SystemHealth has store, drop, copy {
    /// Identifier sistem EVE Frontier
    system_id: u64,
    /// Level aktivitas keseluruhan (0-100)
    activity_level: u64,
    /// Level trust antar player di sistem ini (0-100)
    trust_level: u64,
    /// Jumlah player aktif
    player_count: u64,
    /// Jumlah Smart Assembly (kepadatan infrastruktur)
    infrastructure_count: u64,
    /// Frekuensi transaksi ternormalisasi (0-100)
    tx_frequency: u64,
    /// Insiden pertempuran terkini
    combat_incidents: u64,
    /// Skor CHI lokal sistem (0-100)
    local_chi: u64,
    /// Timestamp update terakhir (epoch ms)
    last_updated_ms: u64,
}

// ==================== Civilization Health Index ====================

/// Kesehatan peradaban global yang dihitung dari 6 sub-indeks.
public struct CivilizationHealthIndex has store, drop, copy {
    /// Skor CHI keseluruhan (0-100)
    overall_score: u64,
    /// Volume perdagangan, sirkulasi mata uang, diversitas pasar (0-100)
    economic_vitality: u64,
    /// Tingkat pembunuhan, cakupan turret, pembatasan gate (0-100)
    security_index: u64,
    /// Deployment baru, ekspansi teritori (0-100)
    growth_rate: u64,
    /// Kepadatan jaringan gate, redundansi rute (0-100)
    connectivity: u64,
    /// Rata-rata skor reputasi, tingkat pengkhianatan (0-100)
    trust_index: u64,
    /// Frekuensi kerjasama lintas-grup (0-100)
    social_cohesion: u64,
    /// Diagnosis kondisi peradaban yang mudah dibaca
    diagnosis: String,
    /// Timestamp kalkulasi terakhir (epoch ms)
    last_calculated_ms: u64,
}

// ==================== Events ====================

/// Dipancarkan saat Trust Compass player dibuat atau diperbarui
public struct ReputationUpdated has copy, drop {
    player: address,
    reliability: u64,
    commerce: u64,
    diplomacy: u64,
    stewardship: u64,
    volatility: u64,
    composite_score: u64,
    archetype: String,
    timestamp_ms: u64,
}

/// Dipancarkan saat CHI global dihitung ulang
public struct CHIUpdated has copy, drop {
    overall_score: u64,
    economic_vitality: u64,
    security_index: u64,
    growth_rate: u64,
    connectivity: u64,
    trust_index: u64,
    social_cohesion: u64,
    diagnosis: String,
    timestamp_ms: u64,
}

/// Dipancarkan saat snapshot kesehatan sistem diperbarui
public struct SystemHealthUpdated has copy, drop {
    system_id: u64,
    activity_level: u64,
    trust_level: u64,
    local_chi: u64,
    player_count: u64,
    timestamp_ms: u64,
}

/// Dipancarkan saat anomaly detector mendeteksi aktivitas tidak biasa
public struct AnomalyAlertEmitted has copy, drop {
    alert_type: String,
    severity: u8,
    system_id: u64,
    description: String,
    timestamp_ms: u64,
}

/// Dipancarkan saat oracle baru diotorisasi
public struct OracleAuthorized has copy, drop {
    recipient: address,
    timestamp_ms: u64,
}

/// Dipancarkan saat reputasi player dihapus
public struct ReputationRemoved has copy, drop {
    player: address,
    timestamp_ms: u64,
}

/// Dipancarkan saat user meng-endorse sebuah star system on-chain.
/// Endorsement adalah sinyal trust dari wallet user — siapa saja bisa melakukannya.
public struct SystemEndorsed has copy, drop {
    endorser: address,
    system_id: u64,
    total_endorsements: u64,
    timestamp_ms: u64,
}

// ==================== Module Initializer ====================

/// Inisialisasi modul saat publish:
/// 1. AdminCap → ditransfer ke deployer
/// 2. PulseRegistry → di-share untuk akses publik
fun init(ctx: &mut TxContext) {
    transfer::transfer(
        AdminCap { id: object::new(ctx) },
        ctx.sender(),
    );

    transfer::share_object(PulseRegistry {
        id: object::new(ctx),
        reputations: table::new(ctx),
        systems: table::new(ctx),
        chi: CivilizationHealthIndex {
            overall_score: 0,
            economic_vitality: 0,
            security_index: 0,
            growth_rate: 0,
            connectivity: 0,
            trust_index: 0,
            social_cohesion: 0,
            diagnosis: b"Initializing".to_string(),
            last_calculated_ms: 0,
        },
        total_players: 0,
        total_systems: 0,
        last_updated_ms: 0,
        version: 1,
        endorsement_counts: table::new(ctx),
        endorsement_records: table::new(ctx),
    });
}

// ==================== Admin Functions ====================

/// Mengotorisasi backend service dengan mengeluarkan OracleCap.
/// Hanya deployer (pemegang AdminCap) yang bisa memanggil fungsi ini.
public fun issue_oracle_cap(
    _admin: &AdminCap,
    recipient: address,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    transfer::transfer(
        OracleCap { id: object::new(ctx) },
        recipient,
    );
    event::emit(OracleAuthorized {
        recipient,
        timestamp_ms: clock.timestamp_ms(),
    });
}

// ==================== Oracle: Reputation ====================

/// Membuat atau memperbarui profil Trust Compass 5-dimensi player.
/// Dipanggil oleh oracle backend setelah Agora Engine menghitung skor baru.
/// Memancarkan event ReputationUpdated untuk subscriber real-time.
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
) {
    // Validasi semua skor dalam rentang 0-100
    assert!(reliability <= MAX_SCORE, EScoreOutOfRange);
    assert!(commerce <= MAX_SCORE, EScoreOutOfRange);
    assert!(diplomacy <= MAX_SCORE, EScoreOutOfRange);
    assert!(stewardship <= MAX_SCORE, EScoreOutOfRange);
    assert!(volatility <= MAX_SCORE, EScoreOutOfRange);

    let now = clock.timestamp_ms();
    let composite = calculate_composite_score(
        reliability, commerce, diplomacy, stewardship, volatility,
    );

    if (registry.reputations.contains(player)) {
        // Perbarui reputasi yang sudah ada
        let rep = registry.reputations.borrow_mut(player);
        rep.reliability = reliability;
        rep.commerce = commerce;
        rep.diplomacy = diplomacy;
        rep.stewardship = stewardship;
        rep.volatility = volatility;
        rep.composite_score = composite;
        rep.archetype = archetype;
        rep.update_count = rep.update_count + 1;
        rep.last_updated_ms = now;
    } else {
        // Buat entri reputasi baru
        registry.reputations.add(player, PlayerReputation {
            player,
            reliability,
            commerce,
            diplomacy,
            stewardship,
            volatility,
            composite_score: composite,
            archetype,
            update_count: 1,
            last_updated_ms: now,
        });
        registry.total_players = registry.total_players + 1;
    };

    registry.last_updated_ms = now;

    event::emit(ReputationUpdated {
        player,
        reliability,
        commerce,
        diplomacy,
        stewardship,
        volatility,
        composite_score: composite,
        archetype,
        timestamp_ms: now,
    });
}

/// Menghapus profil reputasi player dari registry.
/// Abort jika player tidak ditemukan.
public fun remove_player_reputation(
    _oracle: &OracleCap,
    registry: &mut PulseRegistry,
    clock: &Clock,
    player: address,
) {
    assert!(registry.reputations.contains(player), EPlayerNotFound);
    registry.reputations.remove(player);
    registry.total_players = registry.total_players - 1;
    registry.last_updated_ms = clock.timestamp_ms();

    event::emit(ReputationRemoved {
        player,
        timestamp_ms: clock.timestamp_ms(),
    });
}

// ==================== Oracle: System Health ====================

/// Membuat atau memperbarui snapshot kesehatan star system.
/// Menghitung local CHI sebagai campuran tertimbang: aktivitas (40%) + trust (60%).
/// Memancarkan event SystemHealthUpdated.
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
) {
    assert!(activity_level <= MAX_SCORE, EScoreOutOfRange);
    assert!(trust_level <= MAX_SCORE, EScoreOutOfRange);
    assert!(tx_frequency <= MAX_SCORE, EScoreOutOfRange);

    let now = clock.timestamp_ms();
    // Local CHI: 40% aktivitas + 60% trust
    let local_chi = (activity_level * 40 + trust_level * 60) / 100;

    if (registry.systems.contains(system_id)) {
        let sys = registry.systems.borrow_mut(system_id);
        sys.activity_level = activity_level;
        sys.trust_level = trust_level;
        sys.player_count = player_count;
        sys.infrastructure_count = infrastructure_count;
        sys.tx_frequency = tx_frequency;
        sys.combat_incidents = combat_incidents;
        sys.local_chi = local_chi;
        sys.last_updated_ms = now;
    } else {
        registry.systems.add(system_id, SystemHealth {
            system_id,
            activity_level,
            trust_level,
            player_count,
            infrastructure_count,
            tx_frequency,
            combat_incidents,
            local_chi,
            last_updated_ms: now,
        });
        registry.total_systems = registry.total_systems + 1;
    };

    registry.last_updated_ms = now;

    event::emit(SystemHealthUpdated {
        system_id,
        activity_level,
        trust_level,
        local_chi,
        player_count,
        timestamp_ms: now,
    });
}

/// Menghapus data star system dari registry.
/// Abort jika system tidak ditemukan.
public fun remove_system(
    _oracle: &OracleCap,
    registry: &mut PulseRegistry,
    clock: &Clock,
    system_id: u64,
) {
    assert!(registry.systems.contains(system_id), ESystemNotFound);
    registry.systems.remove(system_id);
    registry.total_systems = registry.total_systems - 1;
    registry.last_updated_ms = clock.timestamp_ms();
}

// ==================== Oracle: CHI ====================

/// Memperbarui Civilization Health Index global.
/// Dipanggil periodik oleh oracle setelah mengagregasi semua data sistem dan player.
/// Memancarkan event CHIUpdated.
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
) {
    assert!(economic_vitality <= MAX_SCORE, EScoreOutOfRange);
    assert!(security_index <= MAX_SCORE, EScoreOutOfRange);
    assert!(growth_rate <= MAX_SCORE, EScoreOutOfRange);
    assert!(connectivity <= MAX_SCORE, EScoreOutOfRange);
    assert!(trust_index <= MAX_SCORE, EScoreOutOfRange);
    assert!(social_cohesion <= MAX_SCORE, EScoreOutOfRange);

    let now = clock.timestamp_ms();
    let overall = calculate_chi_overall(
        economic_vitality, security_index, growth_rate,
        connectivity, trust_index, social_cohesion,
    );

    let chi = &mut registry.chi;
    chi.overall_score = overall;
    chi.economic_vitality = economic_vitality;
    chi.security_index = security_index;
    chi.growth_rate = growth_rate;
    chi.connectivity = connectivity;
    chi.trust_index = trust_index;
    chi.social_cohesion = social_cohesion;
    chi.diagnosis = diagnosis;
    chi.last_calculated_ms = now;

    registry.last_updated_ms = now;

    event::emit(CHIUpdated {
        overall_score: overall,
        economic_vitality,
        security_index,
        growth_rate,
        connectivity,
        trust_index,
        social_cohesion,
        diagnosis,
        timestamp_ms: now,
    });
}

// ==================== Oracle: Alerts ====================

/// Memancarkan event anomaly alert.
/// Alert hanya berupa event (tidak disimpan on-chain) untuk efisiensi gas.
/// Subscriber menerima alert via Sui event subscriptions.
///
/// Severity levels:
///   0 = CRITICAL  — kegagalan kritis seluruh sistem
///   1 = HIGH      — masalah trust/keamanan signifikan
///   2 = MEDIUM    — anomali penting
///   3 = WARNING   — situasi berkembang
///   4 = INFO      — observasi informatif
public fun emit_anomaly_alert(
    _oracle: &OracleCap,
    clock: &Clock,
    alert_type: String,
    severity: u8,
    system_id: u64,
    description: String,
) {
    assert!(severity <= SEVERITY_INFO, EInvalidAlertSeverity);

    event::emit(AnomalyAlertEmitted {
        alert_type,
        severity,
        system_id,
        description,
        timestamp_ms: clock.timestamp_ms(),
    });
}

// ==================== Public Read Functions ====================

/// Mengecek apakah player memiliki profil reputasi di registry.
public fun has_reputation(registry: &PulseRegistry, player: address): bool {
    registry.reputations.contains(player)
}

/// Mendapatkan skor trust komposit player (0-100).
/// Abort dengan EPlayerNotFound jika player belum terdaftar.
public fun get_composite_score(registry: &PulseRegistry, player: address): u64 {
    assert!(registry.reputations.contains(player), EPlayerNotFound);
    registry.reputations.borrow(player).composite_score
}

/// Mendapatkan skor lengkap 5 dimensi Trust Compass player.
/// Returns: (reliability, commerce, diplomacy, stewardship, volatility, composite)
public fun get_reputation(
    registry: &PulseRegistry,
    player: address,
): (u64, u64, u64, u64, u64, u64) {
    assert!(registry.reputations.contains(player), EPlayerNotFound);
    let rep = registry.reputations.borrow(player);
    (
        rep.reliability,
        rep.commerce,
        rep.diplomacy,
        rep.stewardship,
        rep.volatility,
        rep.composite_score,
    )
}

/// Mendapatkan label arketipe player (mis. "Trusted Trader", "Warlord").
public fun get_archetype(registry: &PulseRegistry, player: address): String {
    assert!(registry.reputations.contains(player), EPlayerNotFound);
    registry.reputations.borrow(player).archetype
}

/// Mengecek apakah skor trust player memenuhi threshold minimum.
/// Mengembalikan false (tanpa abort) jika player belum terdaftar.
/// Berguna untuk smart contract lain yang ingin membatasi akses berdasarkan trust.
public fun meets_trust_threshold(
    registry: &PulseRegistry,
    player: address,
    min_score: u64,
): bool {
    if (!registry.reputations.contains(player)) return false;
    registry.reputations.borrow(player).composite_score >= min_score
}

/// Mengecek apakah star system memiliki data kesehatan di registry.
public fun has_system(registry: &PulseRegistry, system_id: u64): bool {
    registry.systems.contains(system_id)
}

/// Mendapatkan ringkasan kesehatan sistem.
/// Returns: (activity_level, trust_level, player_count, local_chi)
public fun get_system_health(
    registry: &PulseRegistry,
    system_id: u64,
): (u64, u64, u64, u64) {
    assert!(registry.systems.contains(system_id), ESystemNotFound);
    let sys = registry.systems.borrow(system_id);
    (sys.activity_level, sys.trust_level, sys.player_count, sys.local_chi)
}

/// Mendapatkan detail lengkap kesehatan sistem.
/// Returns: (activity, trust, players, infra, tx_freq, combat, local_chi)
public fun get_system_health_full(
    registry: &PulseRegistry,
    system_id: u64,
): (u64, u64, u64, u64, u64, u64, u64) {
    assert!(registry.systems.contains(system_id), ESystemNotFound);
    let sys = registry.systems.borrow(system_id);
    (
        sys.activity_level,
        sys.trust_level,
        sys.player_count,
        sys.infrastructure_count,
        sys.tx_frequency,
        sys.combat_incidents,
        sys.local_chi,
    )
}

/// Mendapatkan skor CHI keseluruhan (0-100).
public fun get_chi_overall(registry: &PulseRegistry): u64 {
    registry.chi.overall_score
}

/// Mendapatkan seluruh 6 sub-indeks CHI plus skor keseluruhan.
/// Returns: (overall, economic, security, growth, connectivity, trust, social)
public fun get_chi_details(
    registry: &PulseRegistry,
): (u64, u64, u64, u64, u64, u64, u64) {
    let chi = &registry.chi;
    (
        chi.overall_score,
        chi.economic_vitality,
        chi.security_index,
        chi.growth_rate,
        chi.connectivity,
        chi.trust_index,
        chi.social_cohesion,
    )
}

/// Mendapatkan diagnosis kondisi peradaban saat ini.
public fun get_diagnosis(registry: &PulseRegistry): String {
    registry.chi.diagnosis
}

/// Mendapatkan jumlah total player yang dilacak.
public fun get_total_players(registry: &PulseRegistry): u64 {
    registry.total_players
}

/// Mendapatkan jumlah total star system yang dilacak.
public fun get_total_systems(registry: &PulseRegistry): u64 {
    registry.total_systems
}

/// Mendapatkan timestamp update data terakhir (epoch ms).
public fun get_last_updated(registry: &PulseRegistry): u64 {
    registry.last_updated_ms
}

/// Membandingkan skor trust komposit antara dua player.
/// Returns: (player_a_score, player_b_score)
/// Berguna untuk kontrak yang perlu mengevaluasi trustworthiness relatif.
public fun compare_trust(
    registry: &PulseRegistry,
    player_a: address,
    player_b: address,
): (u64, u64) {
    assert!(registry.reputations.contains(player_a), EPlayerNotFound);
    assert!(registry.reputations.contains(player_b), EPlayerNotFound);
    (
        registry.reputations.borrow(player_a).composite_score,
        registry.reputations.borrow(player_b).composite_score,
    )
}

// ==================== Public: Endorsements (User-Initiated) ====================

/// Meng-endorse sebuah star system on-chain. Siapa saja dengan wallet Sui bisa memanggil.
/// Setiap wallet hanya bisa endorse satu kali per sistem (mencegah spam).
/// Memancarkan event SystemEndorsed dan menaikkan counter endorsement.
entry fun endorse_system(
    registry: &mut PulseRegistry,
    clock: &Clock,
    system_id: u64,
    ctx: &TxContext,
) {
    assert!(registry.systems.contains(system_id), ESystemNotFound);

    // Build unique key: sender_address bytes + system_id bytes
    let sender = ctx.sender();
    let mut key = sui::bcs::to_bytes(&sender);
    let sys_bytes = sui::bcs::to_bytes(&system_id);
    key.append(sys_bytes);

    // Prevent double endorsement
    assert!(!registry.endorsement_records.contains(key), EAlreadyEndorsed);
    registry.endorsement_records.add(key, true);

    // Increment endorsement count
    if (registry.endorsement_counts.contains(system_id)) {
        let count = registry.endorsement_counts.borrow_mut(system_id);
        *count = *count + 1;
    } else {
        registry.endorsement_counts.add(system_id, 1);
    };

    let total = *registry.endorsement_counts.borrow(system_id);

    event::emit(SystemEndorsed {
        endorser: sender,
        system_id,
        total_endorsements: total,
        timestamp_ms: clock.timestamp_ms(),
    });
}

/// Mendapatkan jumlah endorsement untuk sebuah star system.
public fun get_endorsement_count(registry: &PulseRegistry, system_id: u64): u64 {
    if (registry.endorsement_counts.contains(system_id)) {
        *registry.endorsement_counts.borrow(system_id)
    } else {
        0
    }
}

// ==================== Internal Helpers ====================

/// Menghitung skor trust komposit tertimbang dari 5 dimensi.
/// Formula: (R×25 + C×25 + D×20 + S×20 + (100−V)×10) / 100
fun calculate_composite_score(
    reliability: u64,
    commerce: u64,
    diplomacy: u64,
    stewardship: u64,
    volatility: u64,
): u64 {
    let inv_volatility = MAX_SCORE - volatility;
    (
        reliability * W_RELIABILITY +
        commerce * W_COMMERCE +
        diplomacy * W_DIPLOMACY +
        stewardship * W_STEWARDSHIP +
        inv_volatility * W_VOLATILITY_INV
    ) / 100
}

/// Menghitung skor CHI keseluruhan dari 6 sub-indeks.
/// Formula: (E×20 + Sec×15 + G×15 + C×15 + T×20 + Soc×15) / 100
fun calculate_chi_overall(
    economic: u64,
    security: u64,
    growth: u64,
    connectivity: u64,
    trust: u64,
    social: u64,
): u64 {
    (
        economic * W_ECONOMIC +
        security * W_SECURITY +
        growth * W_GROWTH +
        connectivity * W_CONNECTIVITY +
        trust * W_TRUST +
        social * W_SOCIAL
    ) / 100
}

// ==================== Test Helpers ====================

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
