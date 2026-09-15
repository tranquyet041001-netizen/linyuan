import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';
import { contractMinify, contractUnminify } from '../framework/contractValidator.js';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 14: Adversarial Coverage Hardening');

describe('Feature 14: Adversarial Coverage Hardening', () => {
  it('14.1 should safely treat XSS script injection payloads as plain text strings', () => {
    const editor = new StudioEditorModel();
    const xssPayload = '<script>alert("XSS Attack!");</script><img src="x" onerror="alert(1)" />';

    editor.updateField('name', xssPayload);
    editor.updateField('message', xssPayload);
    editor.updateMemoryCard('mem-1', { note: xssPayload });

    assert.strictEqual(editor.formData.name, xssPayload);
    assert.strictEqual(editor.formData.message, xssPayload);
    assert.strictEqual(editor.formData.memories[0].note, xssPayload);
    assert.strictEqual(editor.previewState.renderedName, xssPayload);
  });

  it('14.2 should gracefully handle empty, null, or corrupted objects during unminification', () => {
    // Malformed mini object missing required fields
    const corruptedMini = { i: 'corrupt-1', mem: null, tl: null };
    const restored = contractUnminify(corruptedMini);

    assert.strictEqual(restored.id, 'corrupt-1');
    assert.deepEqual(restored.memories, []);
    assert.deepEqual(restored.timeline, []);
    assert.strictEqual(restored.theme, 'sakura-night', 'Must supply fallback default theme');
  });

  it('14.3 should handle extreme character lengths without crashing or truncation', () => {
    const editor = new StudioEditorModel();
    const hugeLetter = '🌸 A '.repeat(1500); // ~6,000 characters

    editor.updateField('message', hugeLetter);
    assert.strictEqual(editor.formData.message.length, hugeLetter.length);

    const minified = contractMinify(editor.formData);
    const restored = contractUnminify(minified);
    assert.strictEqual(restored.message.length, hugeLetter.length);
  });

  it('14.4 should be resilient against object prototype pollution attempts', () => {
    const maliciousJson = '{"__proto__": {"polluted": true}, "name": "Safe Name"}';
    const parsed = JSON.parse(maliciousJson);

    const editor = new StudioEditorModel();
    editor.updateField('name', parsed.name);

    assert.strictEqual(editor.formData.name, 'Safe Name');
    assert.strictEqual(Object.prototype.polluted, undefined, 'Prototype must not be polluted');
  });

  it('14.5 should deterministically process 100 consecutive rapid state updates without corruption', () => {
    const editor = new StudioEditorModel();
    for (let i = 1; i <= 100; i++) {
      editor.updateField('name', `Test Iteration ${i}`);
    }

    assert.strictEqual(editor.formData.name, 'Test Iteration 100');
    assert.strictEqual(editor.previewState.renderedName, 'Test Iteration 100');
    assert.greaterOrEqual(editor.previewSyncCount, 100);
  });
});
