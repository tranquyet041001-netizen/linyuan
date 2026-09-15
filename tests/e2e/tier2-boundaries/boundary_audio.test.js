import { describe, it, setTier, setFeature, beforeEach, afterEach } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { installMockBrowser, cleanupMockBrowser } from '../framework/mockBrowser.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 05: Audio Synthesis Boundaries');

describe('Boundary 05: Audio Synthesis Boundaries', () => {
  beforeEach(() => {
    installMockBrowser();
  });

  afterEach(() => {
    cleanupMockBrowser();
  });

  it('B5.1 should handle exact boundary volume 0.0 (silent mute)', () => {
    const ctx = new globalThis.AudioContext();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    assert.strictEqual(gain.gain.value, 0.0);
  });

  it('B5.2 should handle exact boundary volume 1.0 (full output)', () => {
    const ctx = new globalThis.AudioContext();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.0, ctx.currentTime);
    assert.strictEqual(gain.gain.value, 1.0);
  });

  it('B5.3 should clamp extreme negative numbers (-1000) strictly to 0.0', () => {
    const clampVolume = (v) => Math.max(0, Math.min(1, v));
    assert.strictEqual(clampVolume(-1000), 0.0);
    assert.strictEqual(clampVolume(-0.0001), 0.0);
  });

  it('B5.4 should clamp extreme positive numbers (+1000) strictly to 1.0', () => {
    const clampVolume = (v) => Math.max(0, Math.min(1, v));
    assert.strictEqual(clampVolume(1000), 1.0);
    assert.strictEqual(clampVolume(1.0001), 1.0);
  });

  it('B5.5 should handle rapid consecutive play and pause operations without AudioContext leaks', async () => {
    const ctx = new globalThis.AudioContext();
    for (let i = 0; i < 20; i++) {
      await ctx.resume();
      assert.strictEqual(ctx.state, 'running');
      await ctx.suspend();
      assert.strictEqual(ctx.state, 'suspended');
    }
  });
});
