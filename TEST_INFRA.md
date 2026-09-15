# Test Infrastructure Architecture — Studio Editor Redesign

## 1. Executive Summary

This document specifies the architecture, operational semantics, and execution model for the End-to-End (E2E) testing framework of the **Studio Editor (CreateBirthday.tsx) Neo-Japanese Cyber-Zen Redesign**.

The testing framework is built following **Dual Track Engineering** principles:
- **Track 1**: Independent, requirement-driven, opaque-box test suite development based on `ORIGINAL_REQUEST.md` and `PROJECT.md`.
- **Track 2**: Real-time integration and validation against application features, boundary conditions, cross-module interactions, and user workflows.

The test suite runs natively in Node.js (version 22+) with zero browser installation overhead, executing all **161 test cases** in under **100ms** with clean ANSI reporting and exit code compliance (`0` on success, `1` on failure).

---

## 2. Directory Layout

```
tests/e2e/
├── framework/
│   ├── assert.js             # High-precision assertion utility (strict, deep, regex, range, errors)
│   ├── testHarness.js        # Core test runner harness (describe, it/test, beforeEach/afterEach hooks)
│   ├── mockBrowser.js        # Headless DOM, LocalStorage (with quota), Web Audio API, and viewport mocks
│   ├── studioModel.js        # Behavioral state machine and simulator for Studio Editor & Preview
│   ├── contractValidator.js  # Interface contract validator for types, presets, and URL serialization
│   └── reporter.js           # Professional ANSI terminal table reporter
├── tier1-features/           # Tier 1: Feature Coverage (70 tests across 14 features)
│   ├── feature01_styling.test.js
│   ├── feature02_navigation.test.js
│   ├── feature03_splitscreen.test.js
│   ├── feature04_mobile.test.js
│   ├── feature05_audio.test.js
│   ├── feature06_data_encoder.test.js
│   ├── feature07_preview_sync.test.js
│   ├── feature08_polaroid_card.test.js
│   ├── feature09_memory_batch.test.js
│   ├── feature10_music_controls.test.js
│   ├── feature11_device_switcher.test.js
│   ├── feature12_containment.test.js
│   ├── feature13_build_integrity.test.js
│   └── feature14_adversarial.test.js
├── tier2-boundaries/         # Tier 2: Boundary & Corner Cases (70 tests across 14 features)
│   ├── boundary_styling.test.js
│   ├── boundary_navigation.test.js
│   ├── boundary_splitscreen.test.js
│   ├── boundary_mobile.test.js
│   ├── boundary_audio.test.js
│   ├── boundary_data_encoder.test.js
│   ├── boundary_preview_sync.test.js
│   ├── boundary_polaroid_card.test.js
│   ├── boundary_memory_batch.test.js
│   ├── boundary_music_controls.test.js
│   ├── boundary_device_switcher.test.js
│   ├── boundary_containment.test.js
│   ├── boundary_build_integrity.test.js
│   └── boundary_adversarial.test.js
├── tier3-interactions/       # Tier 3: Cross-Feature Interactions (14 pairwise tests)
│   └── cross_feature_interactions.test.js
├── tier4-scenarios/          # Tier 4: Real-World Scenarios (7 end-to-end user workflows)
│   └── real_world_scenarios.test.js
└── runner.js                 # Master executable runner (node tests/e2e/runner.js)
```

---

## 3. Core Framework Components

### 3.1 `assert.js`
Provides deterministic, expressive assertions:
- `assert.strictEqual(actual, expected, message)`
- `assert.deepEqual(actual, expected, message)`
- `assert.includes(container, item, message)` (supports strings, arrays, objects)
- `assert.match(text, regex, message)`
- `assert.inRange(val, min, max, message)`
- `assert.throws(fn, regex, message)`
- `assert.rejects(promise, regex, message)`

### 3.2 `testHarness.js`
Manages suite lifecycles:
- Groups tests by Tier (`setTier`) and Feature (`setFeature`).
- Runs lifecycle hooks: `beforeEach` and `afterEach`.
- Measures execution duration per test with microsecond precision.
- Aggregates multi-dimensional statistics: by Tier, by Feature, and global summary.

### 3.3 `mockBrowser.js`
Provides realistic, isolated browser runtime mocks in pure Node.js:
- **`MockLocalStorage`**: In-memory map with simulated quota limits (`QuotaExceededError`) and serialization.
- **`MockAudioContext` / `MockGainNode` / `MockOscillatorNode`**: Simulates Web Audio API graph connections, volume parameter scheduling (`setValueAtTime`, `linearRampToValueAtTime`), and suspended/running state transitions.
- **`MockDOMElement` / `MockDocument`**: DOM tree representation supporting element attributes, class lists, and basic query selectors.
- **`MockWindow`**: Viewport dimensions (`innerWidth`, `innerHeight`), hash-based routing (`window.location`), and animation frames.

### 3.4 `studioModel.js`
High-fidelity behavioral model of the Studio Editor and Live Preview:
- Maintains `formData: BirthdayData` state matching `DEMO_BIRTHDAY`.
- Implements 4-pillar category navigation (`profile`, `letter`, `memories`, `soundtrack`).
- Models 3D Polaroid flip card front (caption, year, location) and back (`note`, Hanko stamp).
- Models batch photo uploading and memory capacity limits (max 20 cards).
- Simulates responsive layout transitions (desktop `>= 1024px` vs mobile `< 1024px`) and segmented mode toggles (`edit` vs `preview`).
- Enforces Live Preview contracts: zero audio autoplay, non-blocking opening animation, and canvas containment.

### 3.5 `contractValidator.js`
Formal validation schemas matching `PROJECT.md § Interface Contracts`:
- Validates `AmbientPresetId` (`'koto-classic'`, `'zen-bell'`, `'rain-koto'`, `'lofi-beats'`).
- Validates `MemoryItem` and `BirthdayData` contract compliance.
- Tests minification/unminification algorithms preserving `mem.note` under `m.n` and `ambient_preset` under `ap`.

### 3.6 `reporter.js`
ANSI-colored terminal reporter outputting:
- Tier Breakdown table with Total, Passed, Failed, Status.
- Feature Coverage Matrix showing all 14 features across Tiers 1 and 2.
- Failure diagnostics with expected vs actual diffs and call stacks.
- Return code mapping: exits with code `0` on 100% pass, code `1` on failure.

---

## 4. Test Execution

### Running the Full Test Suite
```bash
node tests/e2e/runner.js
```

### Running Specific Tiers
Because all test files are standard ES modules, individual suites can also be run or imported directly.

---

## 5. Continuous Verification & QA Guardrails

1. **Isolation**: Every test creates its own model instance and cleans up mock browser globals in `afterEach`.
2. **Progressive Testability**: Tests verify contract specifications and baseline behavior, allowing safe parallel milestone execution.
3. **Deterministic Output**: No network dependencies, no external browser drivers (Puppeteer/Playwright) required, ensuring instant execution in CI/CD pipelines.
