import { describe, it, setTier, setFeature, beforeEach, afterEach } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';
import { installMockBrowser, cleanupMockBrowser, MockLocalStorage } from '../framework/mockBrowser.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 14: Adversarial Stress Boundaries');

describe('Boundary 14: Adversarial Stress Boundaries', () => {
  beforeEach(() => {
    installMockBrowser();
  });

  afterEach(() => {
    cleanupMockBrowser();
  });

  it('B14.1 should treat SQL injection vectors as harmless literal string text', () => {
    const editor = new StudioEditorModel();
    const sqlVector = "admin' OR '1'='1'; DROP TABLE birthdays; --";
    editor.updateField('name', sqlVector);
    editor.updateField('message', sqlVector);

    assert.strictEqual(editor.formData.name, sqlVector);
    assert.strictEqual(editor.formData.message, sqlVector);
  });

  it('B14.2 should preserve complex nested HTML tags as plain literal strings', () => {
    const editor = new StudioEditorModel();
    const htmlPayload = '<div class="alert"><b onclick="alert(1)">Click Me</b></div>';
    editor.updateField('closingWish', htmlPayload);

    assert.strictEqual(editor.formData.closingWish, htmlPayload);
  });

  it('B14.3 should handle LocalStorage QuotaExceededError without crashing the application state', () => {
    // Simulate tiny 200-byte storage quota
    const tinyStorage = new MockLocalStorage(200);
    let errorCaught = false;

    try {
      tinyStorage.setItem('massive_data', 'A'.repeat(500));
    } catch (e) {
      errorCaught = true;
      assert.strictEqual(e.name, 'QuotaExceededError');
    }
    assert.strictEqual(errorCaught, true);
  });

  it('B14.4 should handle malformed date strings safely without throw', () => {
    const editor = new StudioEditorModel();
    const invalidDates = ['31/02/2026', '99/99/9999', 'invalid-date-string', '-2026-00-00'];

    for (const d of invalidDates) {
      editor.updateField('birthday', d);
      assert.strictEqual(editor.formData.birthday, d);
    }
  });

  it('B14.5 should survive 50 rapid publish invocations without data corruption', () => {
    const editor = new StudioEditorModel();
    for (let i = 0; i < 50; i++) {
      editor.updateField('name', `Recipient ${i}`);
      const published = editor.publish();
      assert.strictEqual(published.status, 'published');
    }
    assert.strictEqual(editor.formData.name, 'Recipient 49');
  });
});
