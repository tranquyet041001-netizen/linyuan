#!/usr/bin/env node
/**
 * Studio Editor Redesign — Master E2E Test Runner
 *
 * Runs all 4 test tiers systematically per Dual Track principles:
 * - Tier 1: Feature Coverage (14 features x 5 tests = 70 tests)
 * - Tier 2: Boundary & Corner Cases (14 features x 5 tests = 70 tests)
 * - Tier 3: Cross-Feature Interactions (14 tests)
 * - Tier 4: Real-World Scenarios (7 workflows)
 * Total: 161 comprehensive test cases
 *
 * Usage: node tests/e2e/runner.js
 */

import { harness } from './framework/testHarness.js';
import { printSummary } from './framework/reporter.js';

const TIER1_FILES = [
  './tier1-features/feature01_styling.test.js',
  './tier1-features/feature02_navigation.test.js',
  './tier1-features/feature03_splitscreen.test.js',
  './tier1-features/feature04_mobile.test.js',
  './tier1-features/feature05_audio.test.js',
  './tier1-features/feature06_data_encoder.test.js',
  './tier1-features/feature07_preview_sync.test.js',
  './tier1-features/feature08_polaroid_card.test.js',
  './tier1-features/feature09_memory_batch.test.js',
  './tier1-features/feature10_music_controls.test.js',
  './tier1-features/feature11_device_switcher.test.js',
  './tier1-features/feature12_containment.test.js',
  './tier1-features/feature13_build_integrity.test.js',
  './tier1-features/feature14_adversarial.test.js'
];

const TIER2_FILES = [
  './tier2-boundaries/boundary_styling.test.js',
  './tier2-boundaries/boundary_navigation.test.js',
  './tier2-boundaries/boundary_splitscreen.test.js',
  './tier2-boundaries/boundary_mobile.test.js',
  './tier2-boundaries/boundary_audio.test.js',
  './tier2-boundaries/boundary_data_encoder.test.js',
  './tier2-boundaries/boundary_preview_sync.test.js',
  './tier2-boundaries/boundary_polaroid_card.test.js',
  './tier2-boundaries/boundary_memory_batch.test.js',
  './tier2-boundaries/boundary_music_controls.test.js',
  './tier2-boundaries/boundary_device_switcher.test.js',
  './tier2-boundaries/boundary_containment.test.js',
  './tier2-boundaries/boundary_build_integrity.test.js',
  './tier2-boundaries/boundary_adversarial.test.js'
];

const TIER3_FILES = [
  './tier3-interactions/cross_feature_interactions.test.js'
];

const TIER4_FILES = [
  './tier4-scenarios/real_world_scenarios.test.js'
];

const TIER5_FILES = [
  './tier5-stress/m1_challenger_stress.test.js'
];

async function runAll() {
  console.log('🌸 Initializing Studio Editor E2E Test Runner...\n');

  // Load Tier 1
  for (const file of TIER1_FILES) {
    await import(file);
  }

  // Load Tier 2
  for (const file of TIER2_FILES) {
    await import(file);
  }

  // Load Tier 3
  for (const file of TIER3_FILES) {
    await import(file);
  }

  // Load Tier 4
  for (const file of TIER4_FILES) {
    await import(file);
  }

  // Load Tier 5: Adversarial Stress
  for (const file of TIER5_FILES) {
    await import(file);
  }

  await harness.waitForCompletion();

  const summary = harness.getSummary();
  const allPassed = printSummary(summary);

  process.exit(allPassed ? 0 : 1);
}

runAll().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
