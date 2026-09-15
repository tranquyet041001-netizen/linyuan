import { describe, it, setTier, setFeature, beforeEach, afterEach } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel, CATEGORY_PILLARS, INITIAL_BIRTHDAY_DATA } from '../framework/studioModel.js';
import { installMockBrowser, cleanupMockBrowser } from '../framework/mockBrowser.js';
import fs from 'node:fs';
import path from 'node:path';

setTier('Tier 5: Adversarial Stress & Boundaries');
setFeature('Milestone 2 Challenger Stress Testing');

describe('Milestone 2 Challenger Stress Testing: Studio Editor & 3D Polaroid', () => {
  const rootDir = process.cwd();

  beforeEach(() => {
    installMockBrowser();
  });

  afterEach(() => {
    cleanupMockBrowser();
  });

  // =========================================================================
  // 1. Rapid Pillar Navigation Stress
  // =========================================================================
  it('C2.1 Rapid pillar navigation (2,000 cycles) preserves all form state without mutation', () => {
    const editor = new StudioEditorModel();
    editor.updateField('name', 'Hatsune Miku');
    editor.updateField('slug', 'miku-cyber-zen');
    editor.updateField('japaneseMessage', '未来への歌声、桜のように永遠に。');
    editor.updateField('message', 'A deeply personal letter to Miku.');

    const pillars = ['profile', 'letter', 'memories', 'soundtrack'];
    for (let i = 0; i < 2000; i++) {
      const target = pillars[i % pillars.length];
      editor.setCategory(target);
      assert.strictEqual(editor.activeCategory, target);
    }

    // State verification after 2,000 rapid switches
    assert.strictEqual(editor.formData.name, 'Hatsune Miku');
    assert.strictEqual(editor.formData.slug, 'miku-cyber-zen');
    assert.strictEqual(editor.formData.japaneseMessage, '未来への歌声、桜のように永遠に。');
    assert.strictEqual(editor.formData.message, 'A deeply personal letter to Miku.');
  });

  it('C2.2 Pillar navigation strictly rejects malformed or malicious pillar IDs', () => {
    const editor = new StudioEditorModel();
    const maliciousInputs = [
      'admin',
      'settings',
      '__proto__',
      'constructor',
      '<script>alert(1)</script>',
      '',
      'PROFILE', // case-sensitive check
      'profile/edit',
      'null',
      'undefined'
    ];

    for (const badInput of maliciousInputs) {
      assert.throws(
        () => editor.setCategory(badInput),
        /Invalid category pillar/,
        `Should reject invalid category pillar "${badInput}"`
      );
    }
  });

  // =========================================================================
  // 2. Japanese Cyber-Zen Theme Switching Stress
  // =========================================================================
  it('C2.3 Rapid theme switching (1,000 cycles) preserves custom physics and maintains color token integrity', () => {
    const editor = new StudioEditorModel();
    editor.updateSakuraSetting('density', 88);
    editor.updateSakuraSetting('speed', 72);
    editor.updateSakuraSetting('wind', 15);

    const availableThemes = ['sakura-night', 'pure-sakura', 'sakura-day', 'sunset-sakura'];
    for (let i = 0; i < 1000; i++) {
      const themeId = availableThemes[i % availableThemes.length];
      editor.updateField('theme', themeId);
      assert.strictEqual(editor.formData.theme, themeId);
    }

    // Custom physics must not be reset by theme changes
    assert.strictEqual(editor.formData.sakura_settings.density, 88);
    assert.strictEqual(editor.formData.sakura_settings.speed, 72);
    assert.strictEqual(editor.formData.sakura_settings.wind, 15);
  });

  // =========================================================================
  // 3. Memory Album Capacity Boundaries & Batch Upload
  // =========================================================================
  it('C2.4 Memory card addition enforces hard boundary limit at 20 cards', () => {
    const editor = new StudioEditorModel();
    // Clear demo cards
    editor.formData.memories = [];

    // Add up to max capacity (20 cards)
    const addedIds = new Set();
    for (let i = 0; i < 20; i++) {
      const card = editor.addBlankMemoryCard();
      assert.ok(card.id, `Card #${i + 1} must have an ID`);
      assert.ok(!addedIds.has(card.id), `Card ID ${card.id} must be globally unique`);
      addedIds.add(card.id);
    }
    assert.strictEqual(editor.formData.memories.length, 20);

    // Attempting card #21 must throw capacity limit error
    assert.throws(
      () => editor.addBlankMemoryCard(),
      /capacity limit reached/i,
      'Should reject 21st card'
    );
    assert.strictEqual(editor.formData.memories.length, 20, 'Length must remain clamped at 20');
  });

  it('C2.5 Batch photo upload correctly handles overflow and zero-length inputs', () => {
    const editor = new StudioEditorModel();
    editor.formData.memories = [];

    // Pre-populate with 15 cards
    for (let i = 0; i < 15; i++) {
      editor.addBlankMemoryCard();
    }
    assert.strictEqual(editor.formData.memories.length, 15);

    // Attempt batch upload of 10 photos (only 5 slots available)
    const tenPhotos = Array.from({ length: 10 }, (_, i) => `https://example.com/photo-${i}.jpg`);
    const result = editor.batchUploadPhotos(tenPhotos);

    assert.strictEqual(result.addedCount, 5, 'Only 5 slots should be filled');
    assert.strictEqual(result.overflowCount, 5, '5 photos should be reported as overflow');
    assert.strictEqual(editor.formData.memories.length, 20, 'Total memories must reach exactly 20');

    // Attempt batch upload when fully full
    const fullResult = editor.batchUploadPhotos(['https://example.com/extra.jpg']);
    assert.strictEqual(fullResult.addedCount, 0);
    assert.strictEqual(fullResult.overflowCount, 1);
    assert.strictEqual(editor.formData.memories.length, 20);

    // Batch upload with empty list
    const emptyResult = editor.batchUploadPhotos([]);
    assert.strictEqual(emptyResult.addedCount, 0);
    assert.strictEqual(emptyResult.overflowCount, 0);
  });

  // =========================================================================
  // 4. 3D Polaroid Card Flipping & Secret Note Stress
  // =========================================================================
  it('C2.6 Polaroid flip state isolation across 20 cards under 1,000 random flip iterations', () => {
    const editor = new StudioEditorModel();
    editor.formData.memories = [];
    const cardIds = [];
    for (let i = 0; i < 20; i++) {
      const card = editor.addBlankMemoryCard();
      cardIds.push(card.id);
    }

    // All cards start unflipped (front)
    for (const id of cardIds) {
      assert.strictEqual(editor.isPolaroidFlipped(id), false);
    }

    // Perform 1,000 random flip toggles
    const expectedFlipState = {};
    cardIds.forEach(id => { expectedFlipState[id] = false; });

    for (let i = 0; i < 1000; i++) {
      const targetId = cardIds[i % cardIds.length];
      const nowFlipped = editor.flipPolaroidCard(targetId);
      expectedFlipState[targetId] = !expectedFlipState[targetId];
      assert.strictEqual(nowFlipped, expectedFlipState[targetId]);
    }

    // Final verification that each card matches its exact expected flip state
    for (const id of cardIds) {
      assert.strictEqual(editor.isPolaroidFlipped(id), expectedFlipState[id]);
    }
  });

  it('C2.7 Secret note handles massive multilingual text (Kanji, Vietnamese diacritics, emojis, code)', () => {
    const editor = new StudioEditorModel();
    const complexSecretNote = 
      '🌸 Gửi người thương yêu nhất! 💖\n\n' +
      'Chúc mừng sinh nhật tuổi 24 thật rạng rỡ và ngập tràn hạnh phúc! ' +
      'Dù cuộc đời có nhiều thăng trầm sóng gió, mong cậu luôn giữ vững nụ cười hồn nhiên và ấm áp như nắng sớm mùa xuân.\n\n' +
      '春風とともに、無限の可能性へ。一期一会、あなたと出会えた奇跡に心から感謝を込めて。🏯🎋🏮\n\n' +
      'Special symbols: <div id="test">&hearts; &copy; 2026</div> ' +
      'Repeat content: ' + '🌟'.repeat(200) + ' ' + 'A'.repeat(1500);

    editor.updateMemoryCard('mem-1', { note: complexSecretNote });
    const mem = editor.formData.memories.find(m => m.id === 'mem-1');
    assert.strictEqual(mem.note, complexSecretNote, 'Massive complex secret note must be preserved verbatim');

    // Flip card back and forth 10 times
    for (let i = 0; i < 10; i++) {
      editor.flipPolaroidCard('mem-1');
      assert.strictEqual(mem.note, complexSecretNote, 'Secret note must not degrade or truncate on flip');
    }
  });

  // =========================================================================
  // 5. Memory Card Deletion & Flipped State Garbage Collection
  // =========================================================================
  it('C2.8 Deleting flipped card purges its flip state preventing memory leaks', () => {
    const editor = new StudioEditorModel();
    const card = editor.addBlankMemoryCard();
    editor.flipPolaroidCard(card.id);
    assert.strictEqual(editor.isPolaroidFlipped(card.id), true);

    // Delete card
    const deleted = editor.deleteMemoryCard(card.id);
    assert.strictEqual(deleted, true);
    assert.strictEqual(editor.isPolaroidFlipped(card.id), false, 'Deleted card must be purged from flip tracking');
    assert.ok(!editor.formData.memories.some(m => m.id === card.id));
  });

  it('C2.9 Deleting cards preserves identity and notes of adjacent sibling cards', () => {
    const editor = new StudioEditorModel();
    editor.formData.memories = [];
    const c1 = editor.addBlankMemoryCard();
    const c2 = editor.addBlankMemoryCard();
    const c3 = editor.addBlankMemoryCard();

    editor.updateMemoryCard(c1.id, { note: 'Note 1', caption: 'Cap 1' });
    editor.updateMemoryCard(c2.id, { note: 'Note 2', caption: 'Cap 2' });
    editor.updateMemoryCard(c3.id, { note: 'Note 3', caption: 'Cap 3' });

    // Delete middle card c2
    editor.deleteMemoryCard(c2.id);
    assert.strictEqual(editor.formData.memories.length, 2);

    const rem1 = editor.formData.memories.find(m => m.id === c1.id);
    const rem3 = editor.formData.memories.find(m => m.id === c3.id);
    assert.strictEqual(rem1.note, 'Note 1');
    assert.strictEqual(rem1.caption, 'Cap 1');
    assert.strictEqual(rem3.note, 'Note 3');
    assert.strictEqual(rem3.caption, 'Cap 3');
  });

  // =========================================================================
  // 6. Device Frame Switcher, Zoom Scaler, & CSS Containment
  // =========================================================================
  it('C2.10 Device switcher toggles cleanly across 500 switches while synchronizing state', () => {
    const editor = new StudioEditorModel();
    for (let i = 0; i < 500; i++) {
      const dev = i % 2 === 0 ? 'mobile' : 'desktop';
      editor.setPreviewDevice(dev);
      assert.strictEqual(editor.previewDevice, dev);
    }
  });

  it('C2.11 Viewport CSS containment tokens are strictly declared in CreateBirthday.tsx', () => {
    const filePath = path.join(rootDir, 'src', 'pages', 'CreateBirthday.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    // Strict containment styling
    assert.includes(content, "contain: 'paint'", 'Must use contain: paint to prevent canvas particle bleeding');
    assert.includes(content, "transform: 'translateZ(0)'", 'Must use GPU layer promotion');

    // Mobile titanium frame & Dynamic Island
    assert.includes(content, 'rounded-[48px]', 'Must specify titanium rounded chassis');
    assert.includes(content, 'w-28 h-6 bg-black rounded-full', 'Must render dynamic island pill');
    assert.includes(content, 'w-32 h-1 bg-zinc-500/60 rounded-full', 'Must render home indicator bar');

    // Desktop frame macOS window & traffic lights
    assert.includes(content, 'bg-rose-500', 'Must render red macOS dot');
    assert.includes(content, 'bg-amber-500', 'Must render yellow macOS dot');
    assert.includes(content, 'bg-emerald-500', 'Must render green macOS dot');
    assert.includes(content, 'sakura-birthday.app/birthday/', 'Must render simulated SSL URL bar');

    // Zoom Scaler
    assert.includes(content, 'previewZoom', 'Must track preview zoom state');
    assert.includes(content, 'setPreviewZoom(scale)', 'Must support zoom scaler buttons');
  });

  // =========================================================================
  // 7. Live Preview Real-time Keystroke Synchronization Stress
  // =========================================================================
  it('C2.12 Rapid keystroke typing simulation (500 keystrokes) triggers instant synchronous preview sync', () => {
    const editor = new StudioEditorModel();
    const initialSyncCount = editor.previewSyncCount;

    const testText = 'Hanamizuki blooming beneath the spring azure skies... ';
    for (let i = 0; i < 500; i++) {
      const char = testText[i % testText.length];
      editor.updateField('name', editor.formData.name + char);
      assert.strictEqual(editor.previewState.renderedName, editor.formData.name);
    }

    assert.strictEqual(editor.previewSyncCount, initialSyncCount + 500, 'Every keystroke must trigger real-time preview sync');
    assert.strictEqual(editor.previewState.hasAudioAutoplay, false, 'Contract: live preview must never autoplay audio');
    assert.strictEqual(editor.previewState.cinematicOpeningActive, false, 'Contract: live preview must suppress opening blocking overlay');
  });
});
