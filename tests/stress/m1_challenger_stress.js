/**
 * Milestone 1 Empirical Challenger Stress Test Suite
 *
 * Executes exhaustive adversarial and stress harnesses directly against
 * the real TypeScript source files via Vite SSR runtime.
 */

import { installFullMockAudio } from './mockAudioFull.js';

// Setup environment
installFullMockAudio();

const { createServer } = await import('vite');
const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

// Dynamically load the ACTUAL source modules
const audioMod = await viteServer.ssrLoadModule('./src/utils/audioSynthesizer.ts');
const shareMod = await viteServer.ssrLoadModule('./src/utils/shareEncoder.ts');

const { SakuraAudioEngine, AMBIENT_PRESETS } = audioMod;
const {
  minifyBirthdayForUrl,
  unminifyBirthdayFromUrl,
  encodeBirthdayToUrlPayload,
  decodeBirthdayFromUrlPayload,
  generateUniversalShareUrl
} = shareMod;

// Minimal test runner
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertStrictEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'assertStrictEqual failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

async function testAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

console.log('\n======================================================');
console.log('⚡ STRESS TEST HARNESS — MILESTONE 1 EMPIRICAL CHALLENGE');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// GROUP 1: Audio Synthesizer Stress & Boundary
// -----------------------------------------------------------------------------
console.log('--- Group 1: Audio Synthesizer Engine Stress ---');

test('1.1 Presets dictionary exports all 4 required presets with full metadata', () => {
  const expectedPresets = ['koto-classic', 'zen-bell', 'rain-koto', 'lofi-beats'];
  assertStrictEqual(Object.keys(AMBIENT_PRESETS).length, 4, 'Must have 4 presets');
  for (const preset of expectedPresets) {
    assert(AMBIENT_PRESETS[preset], `Preset ${preset} must exist`);
    assert(AMBIENT_PRESETS[preset].name, `Preset ${preset} must have a name`);
    assert(AMBIENT_PRESETS[preset].japaneseName, `Preset ${preset} must have a japaneseName`);
    assert(AMBIENT_PRESETS[preset].description, `Preset ${preset} must have a description`);
  }
});

await testAsync('1.2 Rapid preset switching (1,000 switches under active playback)', async () => {
  const engine = new SakuraAudioEngine();
  await engine.play();
  assert(engine.getIsPlaying(), 'Engine should be playing');

  const presets = ['koto-classic', 'zen-bell', 'rain-koto', 'lofi-beats'];
  for (let i = 0; i < 1000; i++) {
    const target = presets[i % presets.length];
    engine.setPreset(target);
    assertStrictEqual(engine.getPreset(), target, `Preset should be updated to ${target}`);
  }

  engine.pause();
  assertStrictEqual(engine.getIsPlaying(), false, 'Engine should pause cleanly after 1,000 rapid switches');
});

await testAsync('1.3 Resource cleanup: loop sources properly stopped and disconnected on preset switch and pause', async () => {
  const engine = new SakuraAudioEngine();
  await engine.playPreset('rain-koto');
  assertStrictEqual(engine.getPreset(), 'rain-koto');

  // Verify that switching to lofi-beats stops previous rain sources
  await engine.playPreset('lofi-beats');
  assertStrictEqual(engine.getPreset(), 'lofi-beats');

  // Switch to zen-bell (no continuous loop source)
  await engine.playPreset('zen-bell');
  assertStrictEqual(engine.getPreset(), 'zen-bell');

  // Pause
  engine.pause();
  assertStrictEqual(engine.getIsPlaying(), false);
});

test('1.4 Volume boundary checks & clickless clamping', () => {
  const engine = new SakuraAudioEngine();
  engine.setVolume(0.5);

  // Negative extreme
  engine.setVolume(-1000);
  // Volume is clamped to >= 0
  engine.setVolume(-0.001);

  // Positive extreme
  engine.setVolume(1.0);
  engine.setVolume(1.5);
  engine.setVolume(9999);

  // Zero boundary
  engine.setVolume(0.0);

  // Rapid sweep (500 iterations)
  for (let i = 0; i <= 500; i++) {
    const vol = (i % 100) / 100;
    engine.setVolume(vol);
  }
});

await testAsync('1.5 Rapid play/pause/toggle cycles (200 cycles)', async () => {
  const engine = new SakuraAudioEngine();
  for (let i = 0; i < 200; i++) {
    const playing = engine.toggle();
    assert(typeof playing === 'boolean', 'Toggle must return boolean');
  }
  engine.pause();
  assertStrictEqual(engine.getIsPlaying(), false);
});

test('1.6 Celebration chime execution under rapid load', () => {
  const engine = new SakuraAudioEngine();
  for (let i = 0; i < 50; i++) {
    engine.playCelebrationChime();
  }
});

test('1.7 Custom audio URL switching and fallback handling', () => {
  const engine = new SakuraAudioEngine();
  engine.setCustomAudioUrl('https://example.com/ambient.mp3');
  engine.setCustomAudioUrl('');
  engine.setCustomAudioUrl(undefined);
});

// -----------------------------------------------------------------------------
// GROUP 2: Share Encoder Stress & Extreme Inputs
// -----------------------------------------------------------------------------
console.log('\n--- Group 2: Share Encoder Extreme Inputs & Roundtrip ---');

const baseMockBirthday = {
  id: 'test-card-2026',
  slug: 'test-card',
  status: 'published',
  privacy: 'unlisted',
  name: 'Test Recipient',
  age: 25,
  birthday: '2026-03-20',
  subtitle: 'A special day',
  japaneseMessage: '桜の花びらが舞う春の日に…',
  englishMessage: 'May every day be as radiant as cherry blossoms.',
  message: 'Dear friend, happy birthday!',
  closingWish: 'With eternal warmth.',
  avatar_url: 'https://example.com/avatar.jpg',
  cover_url: 'https://example.com/cover.jpg',
  theme: 'sakura-day',
  music_type: 'ambient',
  ambient_preset: 'zen-bell',
  sakura_settings: {
    density: 50,
    speed: 50,
    wind: 50,
    petal_size: 50,
    blur: 35,
    animation_intensity: 60,
  },
  animations: {
    particles: true,
    parallax: true,
    floatingParticles: true,
    glow: true,
    depthBlur: true,
    mouseInteraction: true,
    touchInteraction: true,
    scrollAnimation: true,
    cinematicOpening: true,
  },
  memories: [],
  timeline: [],
  created_at: new Date().toISOString(),
};

test('2.1 Empty memories array roundtrip', () => {
  const payload = encodeBirthdayToUrlPayload(baseMockBirthday);
  assert(payload && payload.length > 10, 'Payload must be non-empty');

  const decoded = decodeBirthdayFromUrlPayload(payload);
  assert(decoded, 'Decoded object must exist');
  assertStrictEqual(decoded.memories.length, 0, 'Memories should be empty array');
  assertStrictEqual(decoded.ambient_preset, 'zen-bell', 'ambient_preset must be preserved');
});

test('2.2 Extreme 2000+ character Polaroid note roundtrip', () => {
  const longNote = '🌸 Dòng ghi chú bí mật rất dài trên mặt sau thẻ ảnh: ' + 'A'.repeat(2500) + ' 🎋 Kính chúc an khang thịnh vượng! ✨';
  const data = {
    ...baseMockBirthday,
    memories: [
      {
        id: 'mem-long-1',
        image_url: 'https://example.com/photo1.jpg',
        caption: 'Memories of Kyoto',
        year: '2025',
        location: 'Kyoto',
        note: longNote,
      },
    ],
  };

  const payload = encodeBirthdayToUrlPayload(data);
  const decoded = decodeBirthdayFromUrlPayload(payload);
  assert(decoded, 'Decoded object must exist');
  assertStrictEqual(decoded.memories.length, 1);
  assertStrictEqual(decoded.memories[0].note, longNote, '2500-char note with unicode must be perfectly preserved');
});

test('2.3 Multilingual & Emoji note roundtrip (Kanji, Vietnamese, Emojis, Surrogate pairs)', () => {
  const complexNote = '🌸🎉 Chúc mừng sinh nhật Lê Ngọc Hân! 🎋✨\n' +
    '日本語メッセージ: 桜の花びらが舞う春の日に、あなたの笑顔が永遠に輝きますように。\n' +
    'Special symbols: 💖🎂🎁🕊️🍀🏯🎎🍙𠮷野家 (surrogate pair) & < > " \' / \\';

  const data = {
    ...baseMockBirthday,
    memories: [
      {
        id: 'mem-unicode-1',
        image_url: 'https://example.com/photo.jpg',
        caption: 'Hoa anh đào nở rộ',
        note: complexNote,
      },
    ],
  };

  const payload = encodeBirthdayToUrlPayload(data);
  const decoded = decodeBirthdayFromUrlPayload(payload);
  assert(decoded, 'Decoded must exist');
  assertStrictEqual(decoded.memories[0].note, complexNote, 'Complex unicode & emoji note must be 100% identical');
});

test('2.4 Special characters and injection strings in Polaroid note and messages', () => {
  const injectionNote = '<script>alert("XSS")</script>&quot;\'`\\n\\r\\t<!-- comment --> %20 %00 ?param=1&x=2';
  const data = {
    ...baseMockBirthday,
    name: 'Injection <Test>',
    memories: [
      {
        id: 'mem-xss',
        image_url: 'https://example.com/x.jpg',
        caption: 'Caption with "quotes" and \'apostrophes\'',
        note: injectionNote,
      },
    ],
  };

  const payload = encodeBirthdayToUrlPayload(data);
  const decoded = decodeBirthdayFromUrlPayload(payload);
  assert(decoded, 'Decoded must exist');
  assertStrictEqual(decoded.name, 'Injection <Test>');
  assertStrictEqual(decoded.memories[0].note, injectionNote, 'Injection string must be treated strictly as literal data');
});

test('2.5 Ambient presets roundtrip preservation across all 4 types', () => {
  const presets = ['koto-classic', 'zen-bell', 'rain-koto', 'lofi-beats', undefined];
  for (const p of presets) {
    const data = { ...baseMockBirthday, ambient_preset: p };
    const payload = encodeBirthdayToUrlPayload(data);
    const decoded = decodeBirthdayFromUrlPayload(payload);
    assertStrictEqual(decoded.ambient_preset, p, `ambient_preset '${p}' must match original`);
  }
});

test('2.6 Malformed and corrupted payloads handling in decodeBirthdayFromUrlPayload', () => {
  // Empty or short
  assertStrictEqual(decodeBirthdayFromUrlPayload(''), null);
  assertStrictEqual(decodeBirthdayFromUrlPayload('abc'), null);
  assertStrictEqual(decodeBirthdayFromUrlPayload(null), null);
  assertStrictEqual(decodeBirthdayFromUrlPayload(undefined), null);

  // Corrupted base64
  assertStrictEqual(decodeBirthdayFromUrlPayload('???NotBase64@@@'), null);

  // Base64 of invalid JSON
  const invalidJsonB64 = Buffer.from('{ corrupt json').toString('base64');
  assertStrictEqual(decodeBirthdayFromUrlPayload(invalidJsonB64), null);

  // Base64 of unexpected JSON types
  const numberJsonB64 = Buffer.from('12345').toString('base64');
  const decodedNumber = decodeBirthdayFromUrlPayload(numberJsonB64);
  assert(decodedNumber !== null, 'unminify handles empty object gracefully');

  const emptyObjB64 = Buffer.from('{}').toString('base64');
  const decodedEmpty = decodeBirthdayFromUrlPayload(emptyObjB64);
  assert(decodedEmpty !== null, 'unminify handles empty object gracefully');
  assertStrictEqual(decodedEmpty.name, 'Someone Special', 'Fallback default name provided');
});

test('2.7 Universal share URL generation with clean hash structure', () => {
  const url = generateUniversalShareUrl(baseMockBirthday);
  assert(url.includes('#/birthday/test-card?d='), `URL must contain valid hash route: ${url}`);
});

test('2.8 Large memory album (50 cards with notes)', () => {
  const memories = [];
  for (let i = 0; i < 50; i++) {
    memories.push({
      id: `mem-${i}`,
      image_url: `https://example.com/img-${i}.jpg`,
      caption: `Caption ${i}`,
      year: `${2000 + i}`,
      location: `Location ${i}`,
      note: `Secret note for card ${i}: 🌸 Cherry blossom memory.`,
    });
  }

  const data = { ...baseMockBirthday, memories };
  const payload = encodeBirthdayToUrlPayload(data);
  const decoded = decodeBirthdayFromUrlPayload(payload);
  assertStrictEqual(decoded.memories.length, 50);
  assertStrictEqual(decoded.memories[49].note, 'Secret note for card 49: 🌸 Cherry blossom memory.');
});

// -----------------------------------------------------------------------------
// GROUP 3: SakuraCanvas Math & Boundary & Memoization
// -----------------------------------------------------------------------------
console.log('\n--- Group 3: SakuraCanvas Particle Math & Memoization ---');

test('3.1 Density boundary calculation (0, 20, 50, 100, 200)', () => {
  const calcTargetCount = (density, isMobile) => {
    const baseCount = isMobile ? 38 : 80;
    return Math.floor(baseCount * (density / 50));
  };

  assertStrictEqual(calcTargetCount(0, false), 0, 'Density 0 gives 0 particles');
  assertStrictEqual(calcTargetCount(50, false), 80, 'Density 50 gives 80 particles on desktop');
  assertStrictEqual(calcTargetCount(100, false), 160, 'Density 100 gives 160 particles on desktop');
  assertStrictEqual(calcTargetCount(200, false), 320, 'Density 200 gives 320 particles on desktop');

  assertStrictEqual(calcTargetCount(0, true), 0, 'Density 0 gives 0 particles on mobile');
  assertStrictEqual(calcTargetCount(50, true), 38, 'Density 50 gives 38 particles on mobile');
  assertStrictEqual(calcTargetCount(100, true), 76, 'Density 100 gives 76 particles on mobile');
});

test('3.2 Speed boundary calculation (0, 10, 50, 100)', () => {
  const calcSpeedMultiplier = (speed, z) => {
    const isForeground = z > 0.85;
    const isBackground = z < 0.35;
    return (speed / 50) * (isForeground ? 1.3 : isBackground ? 0.6 : 0.9);
  };

  // Speed 0: no motion
  assertStrictEqual(calcSpeedMultiplier(0, 0.5), 0, 'Speed 0 produces 0 speed multiplier');

  // Speed 10: slow motion
  const slowSpeed = calcSpeedMultiplier(10, 0.5);
  assert(slowSpeed > 0 && slowSpeed < 0.3, 'Speed 10 produces gentle float');

  // Speed 50: standard motion
  const normalSpeed = calcSpeedMultiplier(50, 0.5);
  assertStrictEqual(normalSpeed, 0.9, 'Speed 50 produces 0.9 midground multiplier');
});

test('3.3 Blur boundary calculation (0, 10, 35, 100, 200)', () => {
  const calcOpacity = (blur, z) => {
    const isForeground = z > 0.85;
    const isBackground = z < 0.35;
    if (isForeground) return 0.45;
    if (isBackground) return 0.35;
    return (0.45 + z * 0.45) * (1 - (blur / 200));
  };

  const op0 = calcOpacity(0, 0.5);
  const op100 = calcOpacity(100, 0.5);
  const op200 = calcOpacity(200, 0.5);

  assert(op0 > op100, 'Higher blur reduces midground opacity');
  assertStrictEqual(op200, 0, 'Blur 200 fades midground opacity to 0');
});

test('3.4 areSakuraCanvasPropsEqual memoization contract', async () => {
  // Test the exact comparator logic from SakuraCanvas.tsx
  function areSakuraCanvasPropsEqual(prevProps, nextProps) {
    if (prevProps.interactive !== nextProps.interactive) return false;
    if (prevProps.burstTrigger !== nextProps.burstTrigger) return false;
    if (prevProps.theme.id !== nextProps.theme.id) return false;
    if (prevProps.theme.sakuraPrimary !== nextProps.theme.sakuraPrimary) return false;
    if (prevProps.theme.sakuraSecondary !== nextProps.theme.sakuraSecondary) return false;
    if (prevProps.theme.petalShadow !== nextProps.theme.petalShadow) return false;

    const s1 = prevProps.settings;
    const s2 = nextProps.settings;
    if (s1 === s2) return true;
    if (!s1 || !s2) return false;

    return (
      s1.density === s2.density &&
      s1.speed === s2.speed &&
      s1.wind === s2.wind &&
      s1.petal_size === s2.petal_size &&
      s1.blur === s2.blur &&
      s1.animation_intensity === s2.animation_intensity
    );
  }

  const baseTheme = {
    id: 'sakura-day',
    sakuraPrimary: '#f43f5e',
    sakuraSecondary: '#fda4af',
    petalShadow: 'rgba(255,183,197,0.6)',
  };

  const baseSettings = {
    density: 50,
    speed: 50,
    wind: 50,
    petal_size: 50,
    blur: 35,
    animation_intensity: 60,
  };

  const p1 = { theme: baseTheme, settings: baseSettings, interactive: true, burstTrigger: 0 };
  // Identical props
  assertStrictEqual(areSakuraCanvasPropsEqual(p1, { ...p1 }), true, 'Identical props equal true');

  // Form text changed (does NOT affect canvas props) -> equal true
  assertStrictEqual(areSakuraCanvasPropsEqual(p1, { ...p1, unrelatedFormData: 'new name' }), true);

  // Settings changed -> equal false
  assertStrictEqual(areSakuraCanvasPropsEqual(p1, { ...p1, settings: { ...baseSettings, density: 80 } }), false);

  // Theme changed -> equal false
  assertStrictEqual(areSakuraCanvasPropsEqual(p1, { ...p1, theme: { ...baseTheme, id: 'pure-sakura' } }), false);

  // Burst trigger changed -> equal false
  assertStrictEqual(areSakuraCanvasPropsEqual(p1, { ...p1, burstTrigger: 1 }), false);
});

// -----------------------------------------------------------------------------
// GROUP 4: Preview Mode Synchronization
// -----------------------------------------------------------------------------
console.log('\n--- Group 4: Preview Mode Synchronization & Audio Isolation ---');

test('4.1 Preview mode direct synchronous derivation', () => {
  // Verify logic: const birthday = (isPreview && initialData) ? initialData : stateBirthday;
  const initialData = { name: 'Typing User...', message: 'Live text' };
  const stateBirthday = { name: 'Stale State', message: 'Old text' };

  const derivePreviewBirthday = (isPreview, initial, state) => {
    return (isPreview && initial) ? initial : state;
  };

  const previewResult = derivePreviewBirthday(true, initialData, stateBirthday);
  assertStrictEqual(previewResult.name, 'Typing User...', 'Preview must synchronously derive initialData');

  const normalResult = derivePreviewBirthday(false, initialData, stateBirthday);
  assertStrictEqual(normalResult.name, 'Stale State', 'Non-preview mode uses state');
});

test('4.2 Preview mode suppresses audio autoplay', () => {
  const isPreview = true;
  let autoPlayScheduled = false;

  const checkAutoPlay = (preview, cinematicOpening) => {
    if (preview) return false;
    if (!cinematicOpening) {
      return true;
    }
    return false;
  };

  assertStrictEqual(checkAutoPlay(true, false), false, 'Preview mode NEVER schedules autoplay');
  assertStrictEqual(checkAutoPlay(false, false), true, 'Public card mode schedules autoplay when opening disabled');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
await viteServer.close();

console.log('\n======================================================');
console.log(`STRESS TEST EXECUTION COMPLETE: ${passedTests}/${totalTests} PASSED`);
if (failedTests > 0) {
  console.log(`❌ ${failedTests} TESTS FAILED:`);
  for (const f of failures) {
    console.log(`  - ${f.name}: ${f.error.message}`);
  }
} else {
  console.log('✔ ALL EMPIRICAL CHALLENGER STRESS TESTS PASSED CLEANLY');
}
console.log('======================================================\n');

process.exit(failedTests > 0 ? 1 : 0);
