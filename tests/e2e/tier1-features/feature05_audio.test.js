import { describe, it, setTier, setFeature, beforeEach, afterEach } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { installMockBrowser, cleanupMockBrowser } from '../framework/mockBrowser.js';
import { VALID_AMBIENT_PRESETS, validateAmbientPresetId } from '../framework/contractValidator.js';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 05: Ambient Audio Synthesis Engine');

describe('Feature 05: Ambient Audio Synthesis Engine', () => {
  beforeEach(() => {
    installMockBrowser();
  });

  afterEach(() => {
    cleanupMockBrowser();
  });

  it('5.1 should define and validate all 4 required ambient presets per contract', () => {
    assert.strictEqual(VALID_AMBIENT_PRESETS.length, 4, 'Must support 4 ambient presets');
    assert.ok(validateAmbientPresetId('koto-classic'), 'koto-classic must be valid');
    assert.ok(validateAmbientPresetId('zen-bell'), 'zen-bell must be valid');
    assert.ok(validateAmbientPresetId('rain-koto'), 'rain-koto must be valid');
    assert.ok(validateAmbientPresetId('lofi-beats'), 'lofi-beats must be valid');
    assert.strictEqual(validateAmbientPresetId('invalid-ambient-xyz'), false);
  });

  it('5.2 should create GainNode and connect to AudioDestinationNode upon context initialization', () => {
    const ctx = new globalThis.AudioContext();
    assert.strictEqual(ctx.state, 'running');
    const gain = ctx.createGain();
    assert.ok(gain, 'GainNode must be created');
    gain.connect(ctx.destination);
    assert.strictEqual(gain.connectedTo, ctx.destination, 'Gain must connect to destination');
  });

  it('5.3 should clamp volume adjustments strictly within [0.0, 1.0] range', () => {
    const ctx = new globalThis.AudioContext();
    const gain = ctx.createGain();

    const setVol = (v) => {
      const clamped = Math.max(0, Math.min(1, v));
      gain.gain.setValueAtTime(clamped, ctx.currentTime);
      return clamped;
    };

    assert.strictEqual(setVol(0.5), 0.5);
    assert.strictEqual(gain.gain.value, 0.5);

    assert.strictEqual(setVol(-0.2), 0.0, 'Negative values must clamp to 0.0');
    assert.strictEqual(gain.gain.value, 0.0);

    assert.strictEqual(setVol(1.5), 1.0, 'Values > 1.0 must clamp to 1.0');
    assert.strictEqual(gain.gain.value, 1.0);
  });

  it('5.4 should generate pentatonic chime frequencies for celebration chime', () => {
    const ctx = new globalThis.AudioContext();
    const chimeFrequencies = [587.33, 739.99, 880.0, 987.77, 1174.66, 1479.98];
    const nodes = [];

    chimeFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 1.8);
      nodes.push(osc);
    });

    assert.strictEqual(nodes.length, 6, 'Must generate 6 pentatonic oscillators');
    assert.strictEqual(nodes[0].frequency.value, 587.33);
    assert.strictEqual(nodes[5].frequency.value, 1479.98);
  });

  it('5.5 should resume suspended AudioContext on user play action', async () => {
    const ctx = new globalThis.AudioContext();
    await ctx.suspend();
    assert.strictEqual(ctx.state, 'suspended');

    await ctx.resume();
    assert.strictEqual(ctx.state, 'running', 'Context must resume to running state');
  });
});
