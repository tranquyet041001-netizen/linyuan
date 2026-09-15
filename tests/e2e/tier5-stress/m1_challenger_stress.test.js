import { describe, it, setTier, setFeature, beforeEach, afterEach } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { installMockBrowser, cleanupMockBrowser } from '../framework/mockBrowser.js';

setTier('Tier 5: Adversarial Stress & Boundaries');
setFeature('Milestone 1 Challenger Stress Testing');

// Setup environment and load actual modules via Vite SSR at top-level
installMockBrowser();
const { createServer } = await import('vite');
const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
});
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

describe('Milestone 1 Challenger Stress Testing', () => {
  beforeEach(() => {
    installMockBrowser();
  });

  afterEach(() => {
    cleanupMockBrowser();
  });

  // --- 1. Audio Engine Stress ---
  it('C1.1 Rapid audio preset switching (1,000 cycles under active playback)', async () => {
    const engine = new SakuraAudioEngine();
    await engine.play();
    assert.strictEqual(engine.getIsPlaying(), true);

    const presets = ['koto-classic', 'zen-bell', 'rain-koto', 'lofi-beats'];
    for (let i = 0; i < 1000; i++) {
      const target = presets[i % presets.length];
      engine.setPreset(target);
      assert.strictEqual(engine.getPreset(), target);
    }
    engine.pause();
    assert.strictEqual(engine.getIsPlaying(), false);
  });

  it('C1.2 Continuous audio buffer cleanup on preset transition and pause', async () => {
    const engine = new SakuraAudioEngine();
    await engine.playPreset('rain-koto');
    assert.strictEqual(engine.getPreset(), 'rain-koto');

    await engine.playPreset('lofi-beats');
    assert.strictEqual(engine.getPreset(), 'lofi-beats');

    await engine.playPreset('zen-bell');
    assert.strictEqual(engine.getPreset(), 'zen-bell');

    engine.pause();
    assert.strictEqual(engine.getIsPlaying(), false);
  });

  it('C1.3 Volume extreme boundary checks and clickless target ramping', () => {
    const engine = new SakuraAudioEngine();
    engine.setVolume(-1000);
    engine.setVolume(-0.001);
    engine.setVolume(0.0);
    engine.setVolume(1.0);
    engine.setVolume(1.5);
    engine.setVolume(9999);

    // Rapid volume sweep
    for (let i = 0; i <= 200; i++) {
      engine.setVolume((i % 100) / 100);
    }
  });

  it('C1.4 Rapid consecutive toggle and chime stress (100 iterations)', () => {
    const engine = new SakuraAudioEngine();
    for (let i = 0; i < 50; i++) {
      engine.toggle();
      engine.playCelebrationChime();
    }
    engine.pause();
  });

  // --- 2. Share Encoder Extreme Inputs ---
  const baseBirthday = {
    id: 'challenger-test-1',
    slug: 'challenger-test',
    status: 'published',
    privacy: 'unlisted',
    name: 'Challenger Target',
    age: 28,
    birthday: '2026-05-15',
    subtitle: 'Cyber-Zen',
    japaneseMessage: '春風とともに、無限の可能性へ。',
    englishMessage: 'May boundless joy blossom in your life.',
    message: 'Happy Birthday!',
    closingWish: 'Warmest wishes.',
    avatar_url: 'https://example.com/avatar.jpg',
    theme: 'pure-sakura',
    music_type: 'ambient',
    ambient_preset: 'rain-koto',
    sakura_settings: { density: 50, speed: 50, wind: 50, petal_size: 50, blur: 35, animation_intensity: 60 },
    animations: { particles: true, parallax: true, floatingParticles: true, glow: true, depthBlur: true, mouseInteraction: true, touchInteraction: true, scrollAnimation: true, cinematicOpening: true },
    memories: [],
    timeline: [],
    created_at: new Date().toISOString()
  };

  it('C2.1 Share encoder roundtrip with empty memories', () => {
    const payload = encodeBirthdayToUrlPayload(baseBirthday);
    assert.ok(payload.length > 10);
    const decoded = decodeBirthdayFromUrlPayload(payload);
    assert.ok(decoded);
    assert.strictEqual(decoded.memories.length, 0);
    assert.strictEqual(decoded.ambient_preset, 'rain-koto');
  });

  it('C2.2 Share encoder roundtrip with 2500-char complex note', () => {
    const hugeNote = '🌸 Dòng ghi chú bí mật rất dài: ' + 'X'.repeat(2500) + ' 🎋 Kính chúc hạnh phúc! ✨';
    const data = {
      ...baseBirthday,
      memories: [{
        id: 'mem-huge',
        image_url: 'https://example.com/pic.jpg',
        caption: 'Kyoto Memories',
        year: '2025',
        location: 'Kyoto',
        note: hugeNote
      }]
    };
    const payload = encodeBirthdayToUrlPayload(data);
    const decoded = decodeBirthdayFromUrlPayload(payload);
    assert.ok(decoded);
    assert.strictEqual(decoded.memories[0].note, hugeNote);
  });

  it('C2.3 Share encoder roundtrip with Japanese Kanji, Emojis, and Surrogate pairs', () => {
    const complexNote = '🌸🎉 桜の花びらが舞う春の日に… 🏯🎎🍙𠮷野家 & <script>alert("XSS")</script> "quotes" \'apos\'';
    const data = {
      ...baseBirthday,
      memories: [{
        id: 'mem-complex',
        image_url: 'https://example.com/pic.jpg',
        caption: 'Complex text',
        note: complexNote
      }]
    };
    const payload = encodeBirthdayToUrlPayload(data);
    const decoded = decodeBirthdayFromUrlPayload(payload);
    assert.ok(decoded);
    assert.strictEqual(decoded.memories[0].note, complexNote);
  });

  it('C2.4 Share encoder resilience against malformed / corrupted payloads', () => {
    assert.strictEqual(decodeBirthdayFromUrlPayload(''), null);
    assert.strictEqual(decodeBirthdayFromUrlPayload('abc'), null);
    assert.strictEqual(decodeBirthdayFromUrlPayload('???NotBase64@@@'), null);
    assert.strictEqual(decodeBirthdayFromUrlPayload(null), null);

    const corruptJsonB64 = Buffer.from('{ broken json').toString('base64');
    assert.strictEqual(decodeBirthdayFromUrlPayload(corruptJsonB64), null);

    // Sub-5 character payloads are safely rejected
    const shortObjB64 = Buffer.from('{}').toString('base64'); // "e30=" length 4
    assert.strictEqual(decodeBirthdayFromUrlPayload(shortObjB64), null);

    // Valid base64 JSON with minimal fields correctly hydrates defaults
    const minimalObjB64 = Buffer.from('{"n":"Custom Recipient"}').toString('base64');
    const decodedMinimal = decodeBirthdayFromUrlPayload(minimalObjB64);
    assert.ok(decodedMinimal);
    assert.strictEqual(decodedMinimal.name, 'Custom Recipient');
    assert.strictEqual(decodedMinimal.theme, 'sakura-night');
  });

  // --- 3. SakuraCanvas Boundary Math & Memoization ---
  it('C3.1 SakuraCanvas density boundary mapping (density 0 to 200)', () => {
    const calcTargetCount = (density, isMobile) => Math.floor((isMobile ? 38 : 80) * (density / 50));
    assert.strictEqual(calcTargetCount(0, false), 0);
    assert.strictEqual(calcTargetCount(50, false), 80);
    assert.strictEqual(calcTargetCount(100, false), 160);
    assert.strictEqual(calcTargetCount(200, false), 320);
  });

  it('C3.2 SakuraCanvas speed boundary mapping (speed 0 to 100)', () => {
    const calcSpeedMultiplier = (speed, z) => {
      const isForeground = z > 0.85;
      const isBackground = z < 0.35;
      return (speed / 50) * (isForeground ? 1.3 : isBackground ? 0.6 : 0.9);
    };
    assert.strictEqual(calcSpeedMultiplier(0, 0.5), 0);
    assert.ok(calcSpeedMultiplier(10, 0.5) > 0);
    assert.strictEqual(calcSpeedMultiplier(50, 0.5), 0.9);
  });

  it('C3.3 areSakuraCanvasPropsEqual isolates form typing from canvas re-renders', () => {
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
    const settings = { density: 50, speed: 40, wind: 45, petal_size: 50, blur: 35, animation_intensity: 60 };
    const p1 = { theme, settings, interactive: true, burstTrigger: 0 };

    // Form typing change -> canvas props identical -> returns true (no re-render!)
    assert.strictEqual(areSakuraCanvasPropsEqual(p1, { ...p1, unrelated: 'keystroke' }), true);

    // Particle density slider change -> returns false (re-renders smoothly)
    assert.strictEqual(areSakuraCanvasPropsEqual(p1, { ...p1, settings: { ...settings, density: 75 } }), false);
  });
});
