/// Test suite untuk modul Frontier Pulse smart contract.
/// Menguji seluruh lifecycle: init, oracle authorization, reputation CRUD,
/// system health CRUD, CHI updates, trust threshold, dan error handling.
#[test_only]
module smartcontract_fp::frontier_pulse_tests;

use sui::test_scenario as ts;
use sui::clock;
use smartcontract_fp::frontier_pulse::{Self, AdminCap, OracleCap, PulseRegistry};

// ==================== Test Addresses ====================

const ADMIN: address = @0xAD;
const ORACLE: address = @0x0AC;
const PLAYER_A: address = @0xA;
const PLAYER_B: address = @0xB;

// ==================== Init Tests ====================

#[test]
/// Verifikasi bahwa init membuat AdminCap (ke deployer) dan PulseRegistry (shared)
fun test_init_creates_admin_and_registry() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    // AdminCap harus dimiliki oleh deployer
    assert!(ts::has_most_recent_for_sender<AdminCap>(&scenario));

    // PulseRegistry harus shared dan kosong
    let registry = scenario.take_shared<PulseRegistry>();
    assert!(frontier_pulse::get_total_players(&registry) == 0);
    assert!(frontier_pulse::get_total_systems(&registry) == 0);
    assert!(frontier_pulse::get_chi_overall(&registry) == 0);
    ts::return_shared(registry);

    scenario.end();
}

// ==================== Oracle Authorization Tests ====================

#[test]
/// Verifikasi bahwa admin bisa mengeluarkan OracleCap ke alamat tertentu
fun test_issue_oracle_cap() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    // Admin mengeluarkan OracleCap
    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let clock = clock::create_for_testing(scenario.ctx());
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);
    clock.destroy_for_testing();

    // Verifikasi oracle menerima cap
    scenario.next_tx(ORACLE);
    assert!(ts::has_most_recent_for_sender<OracleCap>(&scenario));

    scenario.end();
}

// ==================== Reputation Lifecycle Tests ====================

#[test]
/// Test lengkap: create → read → update → read → remove → verify
fun test_player_reputation_full_lifecycle() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    // Setup: issue oracle cap
    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(1000);
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    // ---- CREATE: Oracle membuat reputasi PLAYER_A ----
    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();

    frontier_pulse::update_player_reputation(
        &oracle_cap, &mut registry, &clock,
        PLAYER_A,
        80,  // reliability
        75,  // commerce
        60,  // diplomacy
        70,  // stewardship
        20,  // volatility
        b"Trusted Trader".to_string(),
    );

    // Verifikasi pembuatan
    assert!(frontier_pulse::has_reputation(&registry, PLAYER_A));
    assert!(frontier_pulse::get_total_players(&registry) == 1);

    let score = frontier_pulse::get_composite_score(&registry, PLAYER_A);
    // composite = (80*25 + 75*25 + 60*20 + 70*20 + (100-20)*10) / 100
    //           = (2000 + 1875 + 1200 + 1400 + 800) / 100 = 72
    assert!(score == 72);

    // Verifikasi semua dimensi
    let (r, c, d, s, v, comp) = frontier_pulse::get_reputation(&registry, PLAYER_A);
    assert!(r == 80 && c == 75 && d == 60 && s == 70 && v == 20 && comp == 72);

    // Verifikasi arketipe
    let archetype = frontier_pulse::get_archetype(&registry, PLAYER_A);
    assert!(archetype == b"Trusted Trader".to_string());

    // ---- UPDATE: Oracle memperbarui reputasi PLAYER_A ----
    clock.set_for_testing(2000);
    frontier_pulse::update_player_reputation(
        &oracle_cap, &mut registry, &clock,
        PLAYER_A,
        90,  // reliability naik
        85,  // commerce naik
        70,  // diplomacy naik
        80,  // stewardship naik
        10,  // volatility turun (bagus)
        b"Civilization Builder".to_string(),
    );

    // Verifikasi update (player count tetap 1)
    assert!(frontier_pulse::get_total_players(&registry) == 1);
    let score2 = frontier_pulse::get_composite_score(&registry, PLAYER_A);
    // composite = (90*25 + 85*25 + 70*20 + 80*20 + (100-10)*10) / 100
    //           = (2250 + 2125 + 1400 + 1600 + 900) / 100 = 82
    assert!(score2 == 82);

    // ---- REMOVE: Oracle menghapus reputasi ----
    frontier_pulse::remove_player_reputation(
        &oracle_cap, &mut registry, &clock, PLAYER_A,
    );
    assert!(!frontier_pulse::has_reputation(&registry, PLAYER_A));
    assert!(frontier_pulse::get_total_players(&registry) == 0);

    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}

// ==================== System Health Tests ====================

#[test]
/// Test create, read, update, dan remove data kesehatan star system
fun test_system_health_crud() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(1000);
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();

    // Create system health untuk system 42
    let system_id: u64 = 42;
    frontier_pulse::update_system_health(
        &oracle_cap, &mut registry, &clock,
        system_id,
        70,  // activity_level
        80,  // trust_level
        15,  // player_count
        5,   // infrastructure_count
        60,  // tx_frequency
        3,   // combat_incidents
    );

    // Verifikasi
    assert!(frontier_pulse::has_system(&registry, system_id));
    assert!(frontier_pulse::get_total_systems(&registry) == 1);

    let (activity, trust, players, chi) = frontier_pulse::get_system_health(
        &registry, system_id,
    );
    assert!(activity == 70);
    assert!(trust == 80);
    assert!(players == 15);
    // local_chi = (70*40 + 80*60) / 100 = (2800 + 4800) / 100 = 76
    assert!(chi == 76);

    // Verifikasi detail lengkap
    let (a, t, p, infra, freq, combat, lchi) = frontier_pulse::get_system_health_full(
        &registry, system_id,
    );
    assert!(a == 70 && t == 80 && p == 15);
    assert!(infra == 5 && freq == 60 && combat == 3 && lchi == 76);

    // Update system
    clock.set_for_testing(2000);
    frontier_pulse::update_system_health(
        &oracle_cap, &mut registry, &clock,
        system_id,
        90, 85, 25, 10, 80, 1,
    );
    assert!(frontier_pulse::get_total_systems(&registry) == 1);

    let (activity2, trust2, _, chi2) = frontier_pulse::get_system_health(
        &registry, system_id,
    );
    assert!(activity2 == 90 && trust2 == 85);
    // local_chi = (90*40 + 85*60) / 100 = (3600 + 5100) / 100 = 87
    assert!(chi2 == 87);

    // Remove system
    frontier_pulse::remove_system(
        &oracle_cap, &mut registry, &clock, system_id,
    );
    assert!(!frontier_pulse::has_system(&registry, system_id));
    assert!(frontier_pulse::get_total_systems(&registry) == 0);

    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}

// ==================== CHI Tests ====================

#[test]
/// Test update dan pembacaan Civilization Health Index global
fun test_chi_update_and_read() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(1000);
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();

    frontier_pulse::update_global_chi(
        &oracle_cap, &mut registry, &clock,
        75,  // economic_vitality
        60,  // security_index
        50,  // growth_rate
        70,  // connectivity
        80,  // trust_index
        65,  // social_cohesion
        b"Thriving".to_string(),
    );

    // Verifikasi overall score
    // overall = (75*20 + 60*15 + 50*15 + 70*15 + 80*20 + 65*15) / 100
    //         = (1500 + 900 + 750 + 1050 + 1600 + 975) / 100 = 67
    assert!(frontier_pulse::get_chi_overall(&registry) == 67);

    // Verifikasi detail
    let (overall, eco, sec, grow, conn, trust, social) =
        frontier_pulse::get_chi_details(&registry);
    assert!(overall == 67);
    assert!(eco == 75);
    assert!(sec == 60);
    assert!(grow == 50);
    assert!(conn == 70);
    assert!(trust == 80);
    assert!(social == 65);

    // Verifikasi diagnosis
    let diag = frontier_pulse::get_diagnosis(&registry);
    assert!(diag == b"Thriving".to_string());

    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}

// ==================== Trust Threshold Tests ====================

#[test]
/// Test fungsi meets_trust_threshold untuk trust-gating
fun test_meets_trust_threshold() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let clock = clock::create_for_testing(scenario.ctx());
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();

    // Player A dengan composite score 72
    frontier_pulse::update_player_reputation(
        &oracle_cap, &mut registry, &clock,
        PLAYER_A, 80, 75, 60, 70, 20,
        b"Trusted Trader".to_string(),
    );

    // Harus lolos threshold 70
    assert!(frontier_pulse::meets_trust_threshold(&registry, PLAYER_A, 70));
    // Harus lolos threshold 72 (tepat sama)
    assert!(frontier_pulse::meets_trust_threshold(&registry, PLAYER_A, 72));
    // Tidak boleh lolos threshold 73
    assert!(!frontier_pulse::meets_trust_threshold(&registry, PLAYER_A, 73));
    // Player tak dikenal mengembalikan false (tanpa abort)
    assert!(!frontier_pulse::meets_trust_threshold(&registry, PLAYER_B, 0));

    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}

// ==================== Compare Trust Tests ====================

#[test]
/// Test perbandingan trust antara dua player
fun test_compare_trust_scores() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let clock = clock::create_for_testing(scenario.ctx());
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();

    // Player A: Trusted Trader (composite = 72)
    frontier_pulse::update_player_reputation(
        &oracle_cap, &mut registry, &clock,
        PLAYER_A, 80, 75, 60, 70, 20,
        b"Trusted Trader".to_string(),
    );

    // Player B: Warlord (low scores, high volatility)
    frontier_pulse::update_player_reputation(
        &oracle_cap, &mut registry, &clock,
        PLAYER_B, 40, 30, 20, 25, 80,
        b"Warlord".to_string(),
    );

    let (score_a, score_b) = frontier_pulse::compare_trust(&registry, PLAYER_A, PLAYER_B);
    // Player A harus lebih tinggi dari Player B
    assert!(score_a > score_b);
    assert!(score_a == 72);
    // Player B: (40*25 + 30*25 + 20*20 + 25*20 + (100-80)*10) / 100
    //         = (1000 + 750 + 400 + 500 + 200) / 100 = 28
    assert!(score_b == 28);

    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}

// ==================== Edge Case: Perfect Scores ====================

#[test]
/// Test skor sempurna (100 di semua dimensi positif, 0 volatility)
fun test_perfect_scores() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let clock = clock::create_for_testing(scenario.ctx());
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();

    // Skor sempurna
    frontier_pulse::update_player_reputation(
        &oracle_cap, &mut registry, &clock,
        PLAYER_A, 100, 100, 100, 100, 0,
        b"Paragon".to_string(),
    );

    let score = frontier_pulse::get_composite_score(&registry, PLAYER_A);
    // (100*25 + 100*25 + 100*20 + 100*20 + 100*10) / 100 = 10000/100 = 100
    assert!(score == 100);

    // CHI sempurna
    frontier_pulse::update_global_chi(
        &oracle_cap, &mut registry, &clock,
        100, 100, 100, 100, 100, 100,
        b"Utopia".to_string(),
    );
    assert!(frontier_pulse::get_chi_overall(&registry) == 100);

    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}

// ==================== Edge Case: Zero Scores ====================

#[test]
/// Test skor nol (0 di semua dimensi, 100 volatility = terburuk)
fun test_zero_scores() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let clock = clock::create_for_testing(scenario.ctx());
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();

    // Skor terburuk
    frontier_pulse::update_player_reputation(
        &oracle_cap, &mut registry, &clock,
        PLAYER_A, 0, 0, 0, 0, 100,
        b"Wildcard".to_string(),
    );

    let score = frontier_pulse::get_composite_score(&registry, PLAYER_A);
    // (0 + 0 + 0 + 0 + 0*10) / 100 = 0
    assert!(score == 0);

    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}

// ==================== Error Handling Tests ====================

#[test, expected_failure(abort_code = frontier_pulse::EScoreOutOfRange)]
/// Skor > 100 harus menyebabkan abort
fun test_score_out_of_range_aborts() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let clock = clock::create_for_testing(scenario.ctx());
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();

    // reliability = 101 harus abort
    frontier_pulse::update_player_reputation(
        &oracle_cap, &mut registry, &clock,
        PLAYER_A, 101, 75, 60, 70, 20,
        b"Invalid".to_string(),
    );

    // Cleanup (tidak akan tercapai karena abort di atas)
    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}

#[test, expected_failure(abort_code = frontier_pulse::EPlayerNotFound)]
/// Mengambil skor player yang tidak ada harus abort
fun test_get_nonexistent_player_aborts() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let registry = scenario.take_shared<PulseRegistry>();

    // PLAYER_A belum terdaftar — harus abort
    let _ = frontier_pulse::get_composite_score(&registry, PLAYER_A);

    ts::return_shared(registry);
    scenario.end();
}

#[test, expected_failure(abort_code = frontier_pulse::ESystemNotFound)]
/// Mengambil data system yang tidak ada harus abort
fun test_get_nonexistent_system_aborts() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let registry = scenario.take_shared<PulseRegistry>();

    // System 999 belum terdaftar — harus abort
    let (_, _, _, _) = frontier_pulse::get_system_health(&registry, 999);

    ts::return_shared(registry);
    scenario.end();
}

#[test, expected_failure(abort_code = frontier_pulse::EPlayerNotFound)]
/// Menghapus player yang tidak ada harus abort
fun test_remove_nonexistent_player_aborts() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let clock = clock::create_for_testing(scenario.ctx());
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();

    // Player belum ada — harus abort
    frontier_pulse::remove_player_reputation(
        &oracle_cap, &mut registry, &clock, PLAYER_A,
    );

    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}

// ==================== Endorsement Tests ====================

#[test]
/// Test endorsement lifecycle: endorse → verify count → prevent double endorse
fun test_endorse_system() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    // Setup: issue oracle cap and create a system
    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(1000);
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();

    // Create a system first (endorsement requires system to exist)
    frontier_pulse::update_system_health(
        &oracle_cap, &mut registry, &clock,
        42, 70, 80, 15, 5, 60, 3,
    );

    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);

    // PLAYER_A endorses system 42
    scenario.next_tx(PLAYER_A);
    let mut registry = scenario.take_shared<PulseRegistry>();
    assert!(frontier_pulse::get_endorsement_count(&registry, 42) == 0);
    frontier_pulse::endorse_system(&mut registry, &clock, 42, scenario.ctx());
    assert!(frontier_pulse::get_endorsement_count(&registry, 42) == 1);
    ts::return_shared(registry);

    // PLAYER_B also endorses system 42
    scenario.next_tx(PLAYER_B);
    let mut registry = scenario.take_shared<PulseRegistry>();
    frontier_pulse::endorse_system(&mut registry, &clock, 42, scenario.ctx());
    assert!(frontier_pulse::get_endorsement_count(&registry, 42) == 2);
    ts::return_shared(registry);

    clock.destroy_for_testing();
    scenario.end();
}

#[test, expected_failure(abort_code = frontier_pulse::EAlreadyEndorsed)]
/// Double endorsement dari wallet yang sama harus abort
fun test_double_endorse_aborts() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let clock = clock::create_for_testing(scenario.ctx());
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();
    frontier_pulse::update_system_health(
        &oracle_cap, &mut registry, &clock,
        42, 70, 80, 15, 5, 60, 3,
    );
    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);

    // PLAYER_A endorses once
    scenario.next_tx(PLAYER_A);
    let mut registry = scenario.take_shared<PulseRegistry>();
    frontier_pulse::endorse_system(&mut registry, &clock, 42, scenario.ctx());
    ts::return_shared(registry);

    // PLAYER_A tries again — should abort
    scenario.next_tx(PLAYER_A);
    let mut registry = scenario.take_shared<PulseRegistry>();
    frontier_pulse::endorse_system(&mut registry, &clock, 42, scenario.ctx());

    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}

#[test, expected_failure(abort_code = frontier_pulse::ESystemNotFound)]
/// Endorsing a non-existent system should abort
fun test_endorse_nonexistent_system_aborts() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(PLAYER_A);
    let mut registry = scenario.take_shared<PulseRegistry>();
    let clock = clock::create_for_testing(scenario.ctx());
    frontier_pulse::endorse_system(&mut registry, &clock, 999, scenario.ctx());

    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}

// ==================== Metadata Tests ====================

#[test]
/// Verifikasi last_updated_ms diperbarui dengan benar
fun test_last_updated_tracking() {
    let mut scenario = ts::begin(ADMIN);
    frontier_pulse::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN);
    let admin_cap = scenario.take_from_sender<AdminCap>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(5000);
    frontier_pulse::issue_oracle_cap(&admin_cap, ORACLE, &clock, scenario.ctx());
    scenario.return_to_sender(admin_cap);

    scenario.next_tx(ORACLE);
    let oracle_cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<PulseRegistry>();

    // Awalnya 0
    assert!(frontier_pulse::get_last_updated(&registry) == 0);

    // Setelah update reputasi, harus == 5000
    frontier_pulse::update_player_reputation(
        &oracle_cap, &mut registry, &clock,
        PLAYER_A, 50, 50, 50, 50, 50,
        b"Neutral".to_string(),
    );
    assert!(frontier_pulse::get_last_updated(&registry) == 5000);

    // Advance clock dan update lagi
    clock.set_for_testing(10000);
    frontier_pulse::update_system_health(
        &oracle_cap, &mut registry, &clock,
        1, 50, 50, 10, 3, 40, 0,
    );
    assert!(frontier_pulse::get_last_updated(&registry) == 10000);

    scenario.return_to_sender(oracle_cap);
    ts::return_shared(registry);
    clock.destroy_for_testing();
    scenario.end();
}
