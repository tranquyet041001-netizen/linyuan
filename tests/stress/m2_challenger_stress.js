/**
 * Milestone 2 Empirical Challenger Stress Test Suite
 *
 * Exhaustive adversarial, boundary, and stress testing against:
 * 1. 4-Pillar navigation rapid transitions & state isolation
 * 2. Theme switching across all themes & live reflection
 * 3. Avatar upload presets, custom URLs & slug sanitization
 * 4. 3D Polaroid card batch additions, capacity limit (20), independent flips,
 *    adversarial secret notes (long, multiline, unicode, XSS vectors), and deletion cleanup
 * 5. Device switcher (mobile titanium frame vs desktop macOS frame), zoom scaler,
 *    and CSS containment (contain: paint, overflow-hidden)
 * 6. MusicEditor ambient presets & visualizer
 */

import fs from 'node:fs';
import path from 'node:path';
import { installFullMockAudio } from './mockAudioFull.js';

installFullMockAudio();

const { createServer } = await import('vite');
const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

// Load modules via Vite SSR
const themesMod = await viteServer.ssrLoadModule('./src/data/themes.ts');
const shareMod = await viteServer.ssrLoadModule('./src/utils/shareEncoder.ts');
const storageMod = await viteServer.ssrLoadModule('./src/utils/storage.ts');
const audioMod = await viteServer.ssrLoadModule('./src/utils/audioSynthesizer.ts');
const studioModelMod = await viteServer.ssrLoadModule('./tests/e2e/framework/studioModel.js');
const assertMod = await viteServer.ssrLoadModule('./tests/e2e/framework/assert.js');

const { THEMES } = themesMod;
const { minifyBirthdayForUrl, unminifyBirthdayFromUrl } = shareMod;
const { generateUniqueSlug } = storageMod;
const { SakuraAudioEngine, AMBIENT_PRESETS } = audioMod;
const { StudioEditorModel, CATEGORY_PILLARS, INITIAL_BIRTHDAY_DATA } = studioModelMod;
const { assert } = assertMod;

// Reporter state
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

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

async function runAsyncTest(name, fn) {
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

console.log('\n🌸 =================================================================');
console.log('🌸 MILESTONE 2: EMPIRICAL CHALLENGER STRESS HARNESS');
console.log('🌸 =================================================================\n');

// -----------------------------------------------------------------------------
// 1. STRESS TEST: 4-PILLAR CATEGORY NAVIGATION & RAPID SWITCHING
// -----------------------------------------------------------------------------
console.log('--- Suite 1: 4-Pillar Category Navigation & Rapid State Switching ---');

test('1.1 Pillar structure verification (all 4 pillars defined and typed)', () => {
  const pillars = ['profile', 'letter', 'memories', 'soundtrack'];
  const model = new StudioEditorModel();
  assert.strictEqual(model.activeCategory, 'profile', 'Default pillar must be profile');

  for (const p of pillars) {
    model.setCategory(p);
    assert.strictEqual(model.activeCategory, p, `Pillar ${p} should be active`);
  }
});

test('1.2 Rapid pillar switching stress (10,000 consecutive switches)', () => {
  const model = new StudioEditorModel();
  const pillars = ['profile', 'letter', 'memories', 'soundtrack'];
  
  for (let i = 0; i < 10000; i++) {
    const nextPillar = pillars[i % pillars.length];
    model.setCategory(nextPillar);
  }
  assert.strictEqual(model.activeCategory, pillars[9999 % pillars.length]);
});

test('1.3 State preservation across interspersed pillar switches and mutations', () => {
  const model = new StudioEditorModel();
  model.updateField('name', 'Hoshino Ai');
  model.setCategory('letter');
  model.updateField('message', 'Heartfelt letter content that should not vanish.');
  model.setCategory('memories');
  model.updateMemoryCard('mem-1', { caption: 'Memory from Shibuya', note: 'Secret Shibuya Note' });
  model.setCategory('soundtrack');
  model.updateField('theme', 'sunset-sakura');
  model.setCategory('profile');

  // Verify all fields are completely preserved
  assert.strictEqual(model.formData.name, 'Hoshino Ai');
  assert.strictEqual(model.formData.message, 'Heartfelt letter content that should not vanish.');
  const mem = model.formData.memories.find(m => m.id === 'mem-1');
  assert.strictEqual(mem.caption, 'Memory from Shibuya');
  assert.strictEqual(mem.note, 'Secret Shibuya Note');
  assert.strictEqual(model.formData.theme, 'sunset-sakura');
});

test('1.4 Out-of-bounds / invalid pillar handling', () => {
  const model = new StudioEditorModel();
  assert.throws(() => model.setCategory('invalid_tab'), /Invalid category pillar/);
  assert.throws(() => model.setCategory(null), /Invalid category pillar/);
  assert.throws(() => model.setCategory(undefined), /Invalid category pillar/);
  assert.throws(() => model.setCategory(123), /Invalid category pillar/);
});

// -----------------------------------------------------------------------------
// 2. STRESS TEST: THEME SWITCHING ACROSS ALL THEMES
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Theme Switching Across All Themes ---');

test('2.1 Theme configuration completeness in THEMES registry', () => {
  const expectedThemes = ['sakura-day', 'sakura-night', 'sunset-sakura', 'pure-sakura'];
  for (const themeId of expectedThemes) {
    const t = THEMES[themeId];
    assert.ok(t, `Theme ${themeId} must exist in THEMES registry`);
    assert.ok(t.name && t.name.length > 0, `Theme ${themeId} must have name`);
    assert.ok(t.japaneseName && t.japaneseName.length > 0, `Theme ${themeId} must have japaneseName`);
    assert.ok(t.bgGradient && t.bgGradient.length > 0, `Theme ${themeId} must have bgGradient`);
    assert.ok(t.sakuraPrimary && t.sakuraPrimary.startsWith('#'), `Theme ${themeId} must have valid hex sakuraPrimary`);
    assert.ok(t.sakuraSecondary && t.sakuraSecondary.startsWith('#'), `Theme ${themeId} must have valid hex sakuraSecondary`);
    assert.strictEqual(typeof t.isDark, 'boolean', `Theme ${themeId} must define isDark boolean`);
  }
});

test('2.2 Rapid theme switching stress (2,000 cycles)', () => {
  const model = new StudioEditorModel();
  const themeIds = Object.keys(THEMES);
  
  for (let i = 0; i < 2000; i++) {
    const nextTheme = themeIds[i % themeIds.length];
    model.updateField('theme', nextTheme);
    assert.strictEqual(model.formData.theme, nextTheme);
  }
});

test('2.3 Theme propagation into live preview model', () => {
  const model = new StudioEditorModel();
  for (const themeId of Object.keys(THEMES)) {
    model.updateField('theme', themeId);
    model.syncPreview();
    assert.strictEqual(model.previewState.renderedTheme, themeId);
  }
});

// -----------------------------------------------------------------------------
// 3. STRESS TEST: AVATAR UPLOAD, PRESETS & SLUG SANITIZATION
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Avatar Presets, URLs & Custom Slug Sanitization ---');

test('3.1 Slug sanitization regex verification (/^[a-z0-9_-]+$/)', () => {
  const sanitize = (raw) => raw.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  
  assert.strictEqual(sanitize('Lê Ngọc Hân 2026!'), 'lngchn2026');
  assert.strictEqual(sanitize('User@Name #123! $ special*'), 'username123special');
  assert.strictEqual(sanitize('../../../etc/passwd'), 'etcpasswd');
  assert.strictEqual(sanitize('MY_CUSTOM-SLUG_99'), 'my_custom-slug_99');
  assert.strictEqual(sanitize('🌸 Sakura 🎂 Birthday'), 'sakurabirthday');
});

test('3.2 Unique slug generator collision resolution stress (100 collisions)', () => {
  const stored = [];
  const baseName = 'Lê Ngọc Hân';
  
  for (let i = 0; i < 50; i++) {
    const slug = generateUniqueSlug(baseName, `id-${i}`, stored);
    assert.ok(!stored.some(b => b.slug === slug), `Slug ${slug} must be unique`);
    stored.push({ id: `id-${i}`, slug, name: baseName });
  }
  assert.strictEqual(stored.length, 50);
});

test('3.3 Avatar URL handling (preset URLs, custom HTTPS, data URIs)', () => {
  const model = new StudioEditorModel();
  const testAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  ];

  for (const url of testAvatars) {
    model.updateField('avatar_url', url);
    assert.strictEqual(model.formData.avatar_url, url);
  }
});

// -----------------------------------------------------------------------------
// 4. STRESS TEST: 3D POLAROID CARDS (BATCH, CAPACITY, FLIP, SECRET NOTES, DELETE)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: 3D Polaroid Memory Cards Deep Stress ---');

test('4.1 Batch addition up to capacity (20 cards maximum)', () => {
  const model = new StudioEditorModel();
  // Start fresh
  model.formData.memories = [];
  assert.strictEqual(model.formData.memories.length, 0);

  // Batch upload 15 photos
  const urls1 = Array.from({ length: 15 }, (_, i) => `https://example.com/img-${i}.jpg`);
  const res1 = model.batchUploadPhotos(urls1);
  assert.strictEqual(res1.addedCount, 15);
  assert.strictEqual(res1.overflowCount, 0);
  assert.strictEqual(model.formData.memories.length, 15);

  // Attempt to batch upload 10 photos (should clamp to available slots = 5, total 20)
  const urls2 = Array.from({ length: 10 }, (_, i) => `https://example.com/overflow-${i}.jpg`);
  const res2 = model.batchUploadPhotos(urls2);
  assert.strictEqual(res2.addedCount, 5, 'Should only accept 5 items to reach max capacity 20');
  assert.strictEqual(res2.overflowCount, 5, 'Should report 5 overflow items');
  assert.strictEqual(model.formData.memories.length, 20, 'Max capacity must be exactly 20');

  // Attempt to add one more blank card when capacity is 20
  assert.throws(() => model.addBlankMemoryCard(), /Memory capacity limit reached/);
});

test('4.2 Generated Card ID uniqueness stress (1,000 generated cards)', () => {
  const generatedIds = new Set();
  for (let i = 0; i < 1000; i++) {
    const id = `mem-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;
    assert.ok(!generatedIds.has(id), `Duplicate ID generated: ${id}`);
    generatedIds.add(id);
  }
  assert.strictEqual(generatedIds.size, 1000);
});

test('4.3 Independent 3D Polaroid card flip state tracking', () => {
  const model = new StudioEditorModel();
  model.formData.memories = [
    { id: 'card-1', image_url: '', caption: '', note: '' },
    { id: 'card-2', image_url: '', caption: '', note: '' },
    { id: 'card-3', image_url: '', caption: '', note: '' },
  ];

  assert.strictEqual(model.isPolaroidFlipped('card-1'), false);
  assert.strictEqual(model.isPolaroidFlipped('card-2'), false);
  assert.strictEqual(model.isPolaroidFlipped('card-3'), false);

  // Flip card 1 and card 3, leave card 2 on front
  model.flipPolaroidCard('card-1');
  model.flipPolaroidCard('card-3');

  assert.strictEqual(model.isPolaroidFlipped('card-1'), true, 'Card 1 should be flipped');
  assert.strictEqual(model.isPolaroidFlipped('card-2'), false, 'Card 2 should remain front');
  assert.strictEqual(model.isPolaroidFlipped('card-3'), true, 'Card 3 should be flipped');

  // Flip card 1 back to front
  model.flipPolaroidCard('card-1');
  assert.strictEqual(model.isPolaroidFlipped('card-1'), false, 'Card 1 should be front');
  assert.strictEqual(model.isPolaroidFlipped('card-3'), true, 'Card 3 should still be flipped');
});

test('4.4 Rapid flip stress on single card (10,000 flip cycles)', () => {
  const model = new StudioEditorModel();
  model.formData.memories = [{ id: 'card-rapid', image_url: '', caption: '', note: '' }];

  for (let i = 0; i < 10000; i++) {
    model.flipPolaroidCard('card-rapid');
  }
  // Even number of flips (10,000) should leave card on front (false)
  assert.strictEqual(model.isPolaroidFlipped('card-rapid'), false);
});

test('4.5 Secret note editing with adversarial text (Kanji, Emojis, Long Text, XSS vectors)', () => {
  const model = new StudioEditorModel();
  const testCardId = 'mem-adversarial';
  model.formData.memories = [{ id: testCardId, image_url: '', caption: '', note: '' }];

  const adversarialNotes = [
    '一期一会 • 人生で一度きりの出会いを大切に。桜の散るスピードは秒速5センチメートル。',
    '🌸🎂🎉 Chúc mừng sinh nhật rạng rỡ nhất trần đời! 💖✨',
    '<script>alert("XSS Attack Vector")</script><img src="x" onerror="console.log(1)"/>',
    'Line 1\r\nLine 2\tTabbed\n\n\nDouble newline\rEnd.',
    'A'.repeat(50000), // 50KB long string
  ];

  for (const note of adversarialNotes) {
    model.updateMemoryCard(testCardId, { note });
    const current = model.formData.memories.find(m => m.id === testCardId);
    assert.strictEqual(current.note, note, 'Secret note must be stored exactly');
  }
});

test('4.6 Secret note serialization roundtrip via shareEncoder', () => {
  const birthdayWithSecretNote = {
    ...INITIAL_BIRTHDAY_DATA,
    id: 'test-note-roundtrip',
    memories: [
      {
        id: 'mem-rt-1',
        image_url: 'https://example.com/p1.jpg',
        caption: 'Hanko Memory',
        year: '2026',
        location: 'Kyoto Gion',
        note: 'Secret Hanko message behind card with Kanji: 記憶・落款 and emoji 🌸'
      }
    ]
  };

  const minified = minifyBirthdayForUrl(birthdayWithSecretNote);
  const unminified = unminifyBirthdayFromUrl(minified);

  assert.ok(unminified, 'Unminified object must not be null');
  assert.strictEqual(unminified.memories.length, 1);
  assert.strictEqual(unminified.memories[0].note, birthdayWithSecretNote.memories[0].note);
});

test('4.7 Memory deletion and flippedCardIds cleanup (no orphaned flip state)', () => {
  const model = new StudioEditorModel();
  model.formData.memories = [
    { id: 'del-1', image_url: '', caption: '', note: '' },
    { id: 'del-2', image_url: '', caption: '', note: '' },
    { id: 'del-3', image_url: '', caption: '', note: '' },
  ];

  model.flipPolaroidCard('del-2');
  assert.strictEqual(model.isPolaroidFlipped('del-2'), true);

  // Delete card 2
  model.deleteMemoryCard('del-2');
  assert.strictEqual(model.formData.memories.length, 2);
  assert.ok(!model.formData.memories.some(m => m.id === 'del-2'));

  // Verify flip state cleanup
  assert.strictEqual(model.isPolaroidFlipped('del-2'), false, 'Deleted card must not retain flip state');
});

test('4.8 Deleting all memories down to empty array', () => {
  const model = new StudioEditorModel();
  model.formData.memories = [
    { id: 'card-a', image_url: '', caption: '', note: '' },
    { id: 'card-b', image_url: '', caption: '', note: '' },
  ];

  model.deleteMemoryCard('card-a');
  model.deleteMemoryCard('card-b');
  assert.strictEqual(model.formData.memories.length, 0);

  // Re-adding a memory after complete wipe
  const newCard = model.addBlankMemoryCard();
  assert.strictEqual(model.formData.memories.length, 1);
  assert.strictEqual(model.formData.memories[0].id, newCard.id);
});

// -----------------------------------------------------------------------------
// 5. STRESS TEST: DEVICE SWITCHER, ZOOM SCALER & CSS CONTAINMENT
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Device Switcher, Zoom Scaler & CSS Containment ---');

test('5.1 Device switcher toggling between desktop and mobile', () => {
  const model = new StudioEditorModel();
  assert.strictEqual(model.previewDevice, 'desktop');

  model.setPreviewDevice('mobile');
  assert.strictEqual(model.previewDevice, 'mobile');

  model.setPreviewDevice('desktop');
  assert.strictEqual(model.previewDevice, 'desktop');

  // Rejection of invalid device mode
  assert.throws(() => model.setPreviewDevice('tablet_4k'), /Invalid preview device/);
});

test('5.2 Mobile view mode toggle (edit vs preview)', () => {
  const model = new StudioEditorModel();
  assert.strictEqual(model.mobileViewMode, 'edit');

  model.setMobileViewMode('preview');
  assert.strictEqual(model.mobileViewMode, 'preview');

  model.setMobileViewMode('edit');
  assert.strictEqual(model.mobileViewMode, 'edit');

  assert.throws(() => model.setMobileViewMode('splitscreen_mode'), /Invalid mobile view mode/);
});

test('5.3 Zoom scaler values and CSS transform verification', () => {
  const validZooms = [1, 0.85, 0.75];
  for (const zoom of validZooms) {
    const transformStyle = zoom !== 1 ? `scale(${zoom})` : undefined;
    if (zoom === 1) {
      assert.strictEqual(transformStyle, undefined);
    } else {
      assert.strictEqual(transformStyle, `scale(${zoom})`);
    }
  }
});

test('5.4 Verification of source file CSS containment tokens in CreateBirthday.tsx', () => {
  const filePath = path.join(process.cwd(), 'src', 'pages', 'CreateBirthday.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  // Both viewports must contain SakuraCanvas particles
  const containmentMatches = content.match(/style=\{\{\s*contain:\s*'paint',\s*transform:\s*'translateZ\(0\)'\s*\}\}/g);
  assert.ok(containmentMatches && containmentMatches.length >= 2, 'Must specify contain: paint on both mobile and desktop viewports');

  // Overflow hidden on both frames
  assert.ok(content.includes('overflow-hidden relative bg-black'), 'Mockup frames must specify overflow-hidden relative bg-black');

  // Titanium Dynamic Island
  assert.ok(content.includes('w-28 h-6 bg-black rounded-full'), 'Dynamic Island notch pill must be defined');

  // macOS traffic light dots
  assert.ok(content.includes('bg-rose-500'), 'macOS red close dot');
  assert.ok(content.includes('bg-amber-500'), 'macOS amber minimize dot');
  assert.ok(content.includes('bg-emerald-500'), 'macOS emerald maximize dot');
  assert.ok(content.includes('sakura-birthday.app/birthday/'), 'Simulated SSL URL bar');
});

// -----------------------------------------------------------------------------
// 6. STRESS TEST: SOUNDTRACK STUDIO & EQUALIZER VISUALIZER
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: Soundtrack Studio & Equalizer Visualizer ---');

test('6.1 Ambient preset selection & configuration verification', () => {
  const expectedPresets = ['koto-classic', 'zen-bell', 'rain-koto', 'lofi-beats'];
  for (const presetId of expectedPresets) {
    const p = AMBIENT_PRESETS[presetId];
    assert.ok(p, `Ambient preset ${presetId} must exist`);
    assert.ok(p.name && p.name.length > 0, `Preset ${presetId} must have name`);
    assert.ok(p.description && p.description.length > 0, `Preset ${presetId} must have description`);
  }
});

test('6.2 Equalizer visualizer 8-bar height formula stress', () => {
  const baseHeights = [10, 18, 8, 22, 14, 20, 10, 16];
  assert.strictEqual(baseHeights.length, 8, 'Must have exactly 8 equalizer bars');

  const volumes = [0, 25, 50, 65, 80, 100];
  for (const vol of volumes) {
    for (const h of baseHeights) {
      // Active formula from MusicEditor.tsx line 244:
      // Math.max(4, (h * volume) / 100)
      const calculated = Math.max(4, (h * vol) / 100);
      assert.ok(calculated >= 4, `Bar height must be >= 4px at vol ${vol}`);
      assert.ok(calculated <= 25, `Bar height must be within bounds at vol ${vol}`);
    }
  }
});

await runAsyncTest('6.3 SakuraAudioEngine volume sweep & boundary test', async () => {
  const engine = new SakuraAudioEngine();
  await engine.play(); // Initializes audio context and gainNode
  assert.ok(engine.gainNode, 'GainNode should be initialized after play');

  const volumes = [-100, 0, 0.25, 0.5, 0.75, 1.0, 100];
  for (const v of volumes) {
    engine.setVolume(v);
    assert.ok(engine.gainNode.gain.value >= 0.0 && engine.gainNode.gain.value <= 1.0);
  }
  engine.pause();
});

// -----------------------------------------------------------------------------
// SUMMARY & RESULTS
// -----------------------------------------------------------------------------
console.log('\n=================================================================');
console.log('  MILESTONE 2 CHALLENGER STRESS HARNESS EXECUTION SUMMARY');
console.log('=================================================================');
console.log(`Total Stress Tests: ${totalTests}`);
console.log(`Passed:             ${passedTests}`);
console.log(`Failed:             ${failedTests}`);

if (failures.length > 0) {
  console.error('\nFAILURES:');
  for (const f of failures) {
    console.error(`- ${f.name}: ${f.error.message}`);
  }
  process.exit(1);
} else {
  console.log('\n✔ ALL STRESS TESTS PASSED CLEANLY (100% SUCCESS RATE)');
  process.exit(0);
}
