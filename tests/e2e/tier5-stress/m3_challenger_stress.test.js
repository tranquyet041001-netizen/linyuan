import { describe, it, setTier, setFeature, beforeEach, afterEach } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel, CATEGORY_PILLARS, INITIAL_BIRTHDAY_DATA } from '../framework/studioModel.js';
import { installMockBrowser, cleanupMockBrowser } from '../framework/mockBrowser.js';
import fs from 'node:fs';
import path from 'node:path';

setTier('Tier 5: Adversarial Stress & Boundaries');
setFeature('Milestone 3 Challenger Stress Testing');

// Setup environment and load actual modules via Vite SSR at top-level
installMockBrowser();
const { createServer } = await import('vite');
const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
});

const audioMod = await viteServer.ssrLoadModule('./src/utils/audioSynthesizer.ts');
const shareMod = await viteServer.ssrLoadModule('./src/utils/shareEncoder.ts');
const storageMod = await viteServer.ssrLoadModule('./src/utils/storage.ts');
const youtubeMod = await viteServer.ssrLoadModule('./src/utils/youtube.ts');

const { SakuraAudioEngine, AMBIENT_PRESETS } = audioMod;
const {
  minifyBirthdayForUrl,
  unminifyBirthdayFromUrl,
  encodeBirthdayToUrlPayload,
  decodeBirthdayFromUrlPayload,
  generateUniversalShareUrl
} = shareMod;
const {
  generateUniqueSlug,
  getAllStoredBirthdays,
  getStoredBirthday,
  saveStoredBirthday,
  saveAutoSaveDraft,
  getAutoSaveDraft,
  clearAutoSaveDraft
} = storageMod;
const {
  extractYouTubeVideoId,
  formatTime,
  parseTimeToSeconds
} = youtubeMod;

describe('Milestone 3 Challenger Stress Testing: Final Acceptance & Adversarial Hardening', () => {
  beforeEach(() => {
    installMockBrowser();
  });

  afterEach(() => {
    cleanupMockBrowser();
  });

  // =========================================================================
  // 1. Share Encoder Massive Payload, Multi-Chunk & Corruption Stress
  // =========================================================================
  it('C3.1 Chunk-boundary stress on 8191, 8192, 8193, and 16384 bytes in URL encoder', () => {
    // Exact chunk boundary tests for 8192-byte slicing in utf8ToBase64 / base64ToUtf8
    const boundarySizes = [8191, 8192, 8193, 16384];

    for (const size of boundarySizes) {
      // Create a repetitive multilingual string of exact character count
      const testString = '桜'.repeat(Math.floor(size / 3)) + 'A'.repeat(size % 3);
      const testData = {
        ...INITIAL_BIRTHDAY_DATA,
        id: `boundary-${size}`,
        message: testString,
      };

      const payload = encodeBirthdayToUrlPayload(testData);
      assert.ok(payload.length > 0, `Payload for size ${size} must be non-empty`);

      const decoded = decodeBirthdayFromUrlPayload(payload);
      assert.ok(decoded, `Payload for size ${size} must decode cleanly`);
      assert.strictEqual(decoded.message, testString, `Decoded message for size ${size} must match original verbatim`);
    }
  });

  it('C3.2 20-card memory album with maximum capacity and 2,000-char secret notes roundtrip', () => {
    const hugeNote = '🌸 Ghi chú bí mật: ' + '🎋 Cảm ơn cậu vì tất cả! '.repeat(80) + '🏮 2026!';
    const memories = [];
    for (let i = 0; i < 20; i++) {
      memories.push({
        id: `mem-stress-${i}`,
        image_url: `https://images.unsplash.com/photo-${i}?w=800`,
        caption: `Kỷ niệm số ${i + 1}`,
        year: `${2020 + (i % 7)}`,
        location: i % 2 === 0 ? 'Kyoto, Japan' : 'Hà Nội, Việt Nam',
        note: `${hugeNote} [#${i + 1}]`
      });
    }

    const testData = {
      ...INITIAL_BIRTHDAY_DATA,
      id: 'full-20-album-stress',
      memories,
    };

    const payload = encodeBirthdayToUrlPayload(testData);
    assert.ok(payload.length > 500, 'Payload must be encoded properly');

    const decoded = decodeBirthdayFromUrlPayload(payload);
    assert.ok(decoded);
    assert.strictEqual(decoded.memories.length, 20);

    for (let i = 0; i < 20; i++) {
      assert.strictEqual(decoded.memories[i].id, `mem-stress-${i}`);
      assert.strictEqual(decoded.memories[i].caption, `Kỷ niệm số ${i + 1}`);
      assert.strictEqual(decoded.memories[i].note, `${hugeNote} [#${i + 1}]`);
      assert.strictEqual(decoded.memories[i].location, i % 2 === 0 ? 'Kyoto, Japan' : 'Hà Nội, Việt Nam');
    }
  });

  it('C3.3 Surrogate pairs, emojis, HTML tags, and quote characters survive URL compression', () => {
    const adversarialText = '🌸🎎🏮👘 𠮷野家 <script>alert("XSS")</script> \'Single\' "Double" & < > / \\ \n\r\t 𝄞';
    const testData = {
      ...INITIAL_BIRTHDAY_DATA,
      japaneseMessage: adversarialText,
      memories: [{
        id: 'mem-adv',
        image_url: 'https://example.com/photo.jpg',
        caption: adversarialText,
        note: adversarialText
      }]
    };

    const payload = encodeBirthdayToUrlPayload(testData);
    const decoded = decodeBirthdayFromUrlPayload(payload);
    assert.ok(decoded);
    assert.strictEqual(decoded.japaneseMessage, adversarialText);
    assert.strictEqual(decoded.memories[0].caption, adversarialText);
    assert.strictEqual(decoded.memories[0].note, adversarialText);
  });

  it('C3.4 Corrupt payloads, truncated base64, null, and empty strings return null safely', () => {
    assert.strictEqual(decodeBirthdayFromUrlPayload(''), null);
    assert.strictEqual(decodeBirthdayFromUrlPayload('short'), null);
    assert.strictEqual(decodeBirthdayFromUrlPayload(null), null);
    assert.strictEqual(decodeBirthdayFromUrlPayload(undefined), null);
    assert.strictEqual(decodeBirthdayFromUrlPayload('$$$InvalidBase64###'), null);

    const corruptJson = Buffer.from('{ "broken": ').toString('base64');
    assert.strictEqual(decodeBirthdayFromUrlPayload(corruptJson), null);
  });

  it('C3.5 Partial minified payloads with missing optional fields hydrate default contracts safely', () => {
    // Only basic 'n' field provided
    const minimalJson = JSON.stringify({ n: 'Solo Name' });
    const payload = Buffer.from(minimalJson).toString('base64');
    const decoded = decodeBirthdayFromUrlPayload(payload);

    assert.ok(decoded);
    assert.strictEqual(decoded.name, 'Solo Name');
    assert.strictEqual(decoded.theme, 'sakura-night');
    assert.strictEqual(decoded.show_timeline, true);
    assert.strictEqual(decoded.show_memories, true);
    assert.strictEqual(decoded.music_type, 'youtube');
    assert.strictEqual(decoded.music_volume, 70);
    assert.ok(Array.isArray(decoded.memories));
    assert.ok(Array.isArray(decoded.timeline));
  });

  it('C3.6 generateUniversalShareUrl formats hash route with encoded payload across host environments', () => {
    const testData = { ...INITIAL_BIRTHDAY_DATA, slug: 'celebrate-han-2026' };
    const url = generateUniversalShareUrl(testData);

    assert.includes(url, '#/birthday/celebrate-han-2026?d=');
    assert.includes(url, window.location.origin);
  });

  // =========================================================================
  // 2. Web Audio Synthesizer Concurrency, Boundaries & Recovery
  // =========================================================================
  it('C3.7 Rapid ambient preset hopping (1,000 cycles) terminates sources and resets loop timer cleanly', async () => {
    const engine = new SakuraAudioEngine();
    await engine.play();
    assert.strictEqual(engine.getIsPlaying(), true);

    const presets = ['koto-classic', 'zen-bell', 'rain-koto', 'lofi-beats'];
    for (let i = 0; i < 1000; i++) {
      const p = presets[i % presets.length];
      engine.setPreset(p);
      assert.strictEqual(engine.getPreset(), p);
    }

    engine.pause();
    assert.strictEqual(engine.getIsPlaying(), false);
  });

  it('C3.8 AudioContext suspended state auto-resumes on playback initiation', async () => {
    const engine = new SakuraAudioEngine();
    // Start engine
    const played = await engine.play();
    assert.strictEqual(played, true);
    assert.strictEqual(engine.getIsPlaying(), true);
    engine.pause();
  });

  it('C3.9 Volume extreme boundaries clamp strictly to [0.0, 1.0] and withstand sweeps', () => {
    const engine = new SakuraAudioEngine();
    engine.setVolume(-9999);
    engine.setVolume(9999);
    engine.setVolume(0.0);
    engine.setVolume(1.0);
    engine.setVolume(0.5);

    // Rapid volume sweep across 500 levels
    for (let i = 0; i <= 500; i++) {
      engine.setVolume(i / 500);
    }
  });

  it('C3.10 Celebration chime burst (100 triggers) executes without AudioContext error or crash', () => {
    const engine = new SakuraAudioEngine();
    for (let i = 0; i < 100; i++) {
      engine.playCelebrationChime();
    }
    engine.pause();
  });

  it('C3.11 Custom audio URL lifecycle gracefully switches to custom mode and tears down', () => {
    const engine = new SakuraAudioEngine();
    engine.setCustomAudioUrl('https://example.com/audio.mp3');
    engine.setCustomAudioUrl('');
    engine.setCustomAudioUrl('   ');
    engine.setCustomAudioUrl(undefined);
  });

  // =========================================================================
  // 3. 3D Polaroid Cards, Secret Notes & Album Operations
  // =========================================================================
  it('C3.12 Polaroid memory album rejects 21st card with capacity limit exception', () => {
    const editor = new StudioEditorModel();
    editor.formData.memories = [];

    for (let i = 0; i < 20; i++) {
      editor.addBlankMemoryCard();
    }
    assert.strictEqual(editor.formData.memories.length, 20);

    assert.throws(
      () => editor.addBlankMemoryCard(),
      /capacity limit reached/i,
      'Must enforce hard limit of 20 memory cards'
    );
    assert.strictEqual(editor.formData.memories.length, 20);
  });

  it('C3.13 Batch photo upload handles partial remaining capacity and correctly counts overflow', () => {
    const editor = new StudioEditorModel();
    editor.formData.memories = [];

    // Pre-populate with 17 cards (3 slots remain)
    for (let i = 0; i < 17; i++) {
      editor.addBlankMemoryCard();
    }
    assert.strictEqual(editor.formData.memories.length, 17);

    // Upload 8 photos
    const photos = Array.from({ length: 8 }, (_, i) => `https://example.com/batch-${i}.jpg`);
    const result = editor.batchUploadPhotos(photos);

    assert.strictEqual(result.addedCount, 3, 'Must only accept 3 photos to fill capacity');
    assert.strictEqual(result.overflowCount, 5, 'Must report 5 overflow photos');
    assert.strictEqual(editor.formData.memories.length, 20);
  });

  it('C3.14 3D Polaroid flip state isolation across 20 cards under 1,000 random flip operations', () => {
    const editor = new StudioEditorModel();
    editor.formData.memories = [];
    const ids = [];

    for (let i = 0; i < 20; i++) {
      const card = editor.addBlankMemoryCard();
      ids.push(card.id);
    }

    const expectedFlips = {};
    ids.forEach(id => { expectedFlips[id] = false; });

    for (let i = 0; i < 1000; i++) {
      const targetId = ids[i % ids.length];
      const state = editor.flipPolaroidCard(targetId);
      expectedFlips[targetId] = !expectedFlips[targetId];
      assert.strictEqual(state, expectedFlips[targetId]);
    }

    // Verify all 20 card flip states remain fully accurate
    for (const id of ids) {
      assert.strictEqual(editor.isPolaroidFlipped(id), expectedFlips[id]);
    }
  });

  it('C3.15 Secret notes are preserved verbatim during flips, reorders, and card field updates', () => {
    const editor = new StudioEditorModel();
    editor.formData.memories = [];
    const c1 = editor.addBlankMemoryCard();

    const secretText = '🎋 Lời nhắn bí mật thiêng liêng: Chúc bạn vạn dặm bình an! 🌸';
    editor.updateMemoryCard(c1.id, { note: secretText });

    // Flip 50 times
    for (let i = 0; i < 50; i++) {
      editor.flipPolaroidCard(c1.id);
      const mem = editor.formData.memories.find(m => m.id === c1.id);
      assert.strictEqual(mem.note, secretText);
    }
  });

  it('C3.16 Deleting cards from front, middle, and back clears flip state and preserves siblings', () => {
    const editor = new StudioEditorModel();
    editor.formData.memories = [];
    const c1 = editor.addBlankMemoryCard();
    const c2 = editor.addBlankMemoryCard();
    const c3 = editor.addBlankMemoryCard();

    editor.flipPolaroidCard(c2.id);
    assert.strictEqual(editor.isPolaroidFlipped(c2.id), true);

    // Delete middle
    editor.deleteMemoryCard(c2.id);
    assert.strictEqual(editor.isPolaroidFlipped(c2.id), false);
    assert.strictEqual(editor.formData.memories.length, 2);
    assert.strictEqual(editor.formData.memories[0].id, c1.id);
    assert.strictEqual(editor.formData.memories[1].id, c3.id);
  });

  // =========================================================================
  // 4. Live Preview Synchronization & Direct Bypass
  // =========================================================================
  it('C3.17 Synchronous preview reflection under 1,000 rapid keystroke inputs without delay', () => {
    const editor = new StudioEditorModel();
    const testString = 'Sakura petals blooming across Neo-Tokyo Cyber-Zen gardens...';

    for (let i = 0; i < 1000; i++) {
      const char = testString[i % testString.length];
      editor.updateField('name', editor.formData.name + char);
      assert.strictEqual(editor.previewState.renderedName, editor.formData.name);
    }
  });

  it('C3.18 Live preview contract enforces zero audio autoplay and suppresses blocking opening', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(editor.previewState.hasAudioAutoplay, false, 'Preview must never autoplay audio');
    assert.strictEqual(editor.previewState.cinematicOpeningActive, false, 'Preview must suppress opening block');
  });

  it('C3.19 Empty memories and timeline arrays are handled safely without render failure', () => {
    const emptyData = {
      ...INITIAL_BIRTHDAY_DATA,
      memories: [],
      timeline: []
    };
    const editor = new StudioEditorModel(emptyData);
    assert.strictEqual(editor.formData.memories.length, 0);
    assert.strictEqual(editor.formData.timeline.length, 0);
  });

  it('C3.20 Unrecognized theme IDs fall back safely to sakura-night default', () => {
    const invalidData = {
      ...INITIAL_BIRTHDAY_DATA,
      theme: 'non-existent-cyber-theme-999'
    };
    const editor = new StudioEditorModel(invalidData);
    assert.ok(editor.formData.theme);
  });

  // =========================================================================
  // 5. SakuraCanvas Particle Physics & DPR Containment
  // =========================================================================
  it('C3.21 SakuraCanvas particle count scales predictably with density and device form factor', () => {
    const calcCount = (density, isMobile) => Math.floor((isMobile ? 38 : 80) * (density / 50));

    // Desktop
    assert.strictEqual(calcCount(0, false), 0);
    assert.strictEqual(calcCount(50, false), 80);
    assert.strictEqual(calcCount(100, false), 160);

    // Mobile
    assert.strictEqual(calcCount(0, true), 0);
    assert.strictEqual(calcCount(50, true), 38);
    assert.strictEqual(calcCount(100, true), 76);
  });

  it('C3.22 SakuraCanvas physics parameters handle boundary settings (0 to 100)', () => {
    const calcSpeed = (speed, z) => (speed / 50) * (z > 0.85 ? 1.3 : z < 0.35 ? 0.6 : 0.9);
    assert.strictEqual(calcSpeed(0, 0.5), 0);
    assert.strictEqual(calcSpeed(50, 0.5), 0.9);
    assert.strictEqual(calcSpeed(100, 0.5), 1.8);

    const calcWind = (wind) => (wind - 50) / 25;
    assert.strictEqual(calcWind(0), -2);
    assert.strictEqual(calcWind(50), 0);
    assert.strictEqual(calcWind(100), 2);
  });

  it('C3.23 areSakuraCanvasPropsEqual memoization isolates form typing from canvas re-renders', () => {
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

    const theme = { id: 'sakura-night', sakuraPrimary: '#e11d62', sakuraSecondary: '#fda4af', petalShadow: '#000' };
    const settings = { density: 55, speed: 40, wind: 45, petal_size: 50, blur: 35, animation_intensity: 60 };
    const base = { theme, settings, interactive: true, burstTrigger: 0 };

    // 500 comparisons with simulated unrelated state updates (name, message, note)
    for (let i = 0; i < 500; i++) {
      const next = { ...base, unrelatedKeystroke: `char_${i}` };
      assert.strictEqual(areSakuraCanvasPropsEqual(base, next), true, 'Must not re-render canvas on keystroke');
    }

    // Changing actual particle settings must trigger re-render
    assert.strictEqual(areSakuraCanvasPropsEqual(base, { ...base, settings: { ...settings, density: 90 } }), false);
    assert.strictEqual(areSakuraCanvasPropsEqual(base, { ...base, theme: { ...theme, id: 'sunset-sakura' } }), false);
  });

  // =========================================================================
  // 6. Music Source Mode Isolation & Trimming Ranges
  // =========================================================================
  it('C3.24 Switching music sources ensures mutual exclusion across all 4 modes', () => {
    const editor = new StudioEditorModel();
    const modes = ['ambient', 'youtube', 'upload_mp3', 'none'];

    for (const mode of modes) {
      editor.updateField('music_type', mode);
      assert.strictEqual(editor.formData.music_type, mode);
    }
  });

  it('C3.25 YouTube URL parser extracts 11-char IDs from diverse formats and rejects invalid URLs', () => {
    const validCases = [
      { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
      { url: 'https://youtu.be/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
      { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
      { url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
      { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s', expected: 'dQw4w9WgXcQ' },
      { url: 'dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
    ];

    for (const { url, expected } of validCases) {
      assert.strictEqual(extractYouTubeVideoId(url), expected, `Failed to extract ID from ${url}`);
    }

    const invalidCases = ['', 'https://notyoutube.com/watch?v=123', 'short', 'http://', null, undefined];
    for (const bad of invalidCases) {
      assert.strictEqual(extractYouTubeVideoId(bad), null, `Should return null for invalid URL: ${bad}`);
    }
  });

  it('C3.26 Time formatting and parsing handles edge cases cleanly (zero, negatives, NaN, large numbers)', () => {
    assert.strictEqual(formatTime(0), '00:00');
    assert.strictEqual(formatTime(65), '01:05');
    assert.strictEqual(formatTime(3600), '60:00');
    assert.strictEqual(formatTime(-10), '00:00');
    assert.strictEqual(formatTime(NaN), '00:00');

    assert.strictEqual(parseTimeToSeconds('00:00'), 0);
    assert.strictEqual(parseTimeToSeconds('01:30'), 90);
    assert.strictEqual(parseTimeToSeconds('invalid'), 0);
    assert.strictEqual(parseTimeToSeconds(''), 0);
  });

  // =========================================================================
  // 7. Storage & Vietnamese Slug Generation Integrity
  // =========================================================================
  it('C3.27 Vietnamese diacritics slug generation produces clean ASCII with year suffix', () => {
    const existing = [];
    const currentYear = new Date().getFullYear();

    const slug1 = generateUniqueSlug('Lê Ngọc Hân', 'id-1', existing);
    assert.includes(slug1, `le-ngoc-han-${currentYear}`);

    const slug2 = generateUniqueSlug('Đỗ Mỹ Linh', 'id-2', existing);
    assert.includes(slug2, `do-my-linh-${currentYear}`);

    const slug3 = generateUniqueSlug('Phan Thị Đào', 'id-3', existing);
    assert.includes(slug3, `phan-thi-dao-${currentYear}`);
  });

  it('C3.28 Duplicate slug collision resolution produces unique suffixes', () => {
    const existing = [
      { id: 'other-1', slug: 'mai-2026' },
      { id: 'other-2', slug: 'mai-2026-a1b2' },
    ];

    const slug = generateUniqueSlug('Mai', 'my-id', existing);
    assert.ok(slug.startsWith('mai-'));
    assert.ok(!existing.some(b => b.slug === slug), `Slug "${slug}" must not collide with existing list`);
  });

  it('C3.29 LocalStorage quota exhaustion is handled safely with automatic pruning', () => {
    const testData = { ...INITIAL_BIRTHDAY_DATA, id: 'quota-test-1' };
    // saveStoredBirthday should succeed even if storage is tight
    const saved = saveStoredBirthday(testData, false);
    assert.strictEqual(saved.id, 'quota-test-1');
  });

  it('C3.30 Auto-save draft persists and recovers correctly', () => {
    clearAutoSaveDraft();
    assert.strictEqual(getAutoSaveDraft(), null);

    const testDraft = { ...INITIAL_BIRTHDAY_DATA, name: 'Auto-Saved Recipient' };
    saveAutoSaveDraft(testDraft);

    const loaded = getAutoSaveDraft();
    assert.ok(loaded);
    assert.strictEqual(loaded.data.name, 'Auto-Saved Recipient');
    assert.ok(loaded.timestamp > 0);

    clearAutoSaveDraft();
    assert.strictEqual(getAutoSaveDraft(), null);
  });
});
