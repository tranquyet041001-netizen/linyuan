import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel, CATEGORY_PILLARS } from '../framework/studioModel.js';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 02: 4-Pillar Category Navigation');

describe('Feature 02: 4-Pillar Category Navigation', () => {
  it('2.1 should define exactly the 4 required category pillars per R1 requirement', () => {
    assert.strictEqual(CATEGORY_PILLARS.length, 4, 'Must have exactly 4 category pillars');
    const ids = CATEGORY_PILLARS.map(p => p.id);
    assert.includes(ids, 'profile', 'Pillar 1: Profile & Greetings');
    assert.includes(ids, 'letter', 'Pillar 2: Handwritten Letter');
    assert.includes(ids, 'memories', 'Pillar 3: 3D Memory Album');
    assert.includes(ids, 'soundtrack', 'Pillar 4: Soundtrack & Sakura');
  });

  it('2.2 should initialize default active category to profile and allow navigation switching', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(editor.activeCategory, 'profile', 'Default pillar must be profile');

    editor.setCategory('letter');
    assert.strictEqual(editor.activeCategory, 'letter', 'Active category should switch to letter');

    editor.setCategory('memories');
    assert.strictEqual(editor.activeCategory, 'memories', 'Active category should switch to memories');

    editor.setCategory('soundtrack');
    assert.strictEqual(editor.activeCategory, 'soundtrack', 'Active category should switch to soundtrack');
  });

  it('2.3 should preserve all form state completely when switching between categories', () => {
    const editor = new StudioEditorModel();
    editor.updateField('name', 'Sakura Heroine');
    editor.updateField('message', 'A very special heartfelt handwritten message.');

    // Switch categories back and forth
    editor.setCategory('letter');
    editor.setCategory('memories');
    editor.setCategory('soundtrack');
    editor.setCategory('profile');

    assert.strictEqual(editor.formData.name, 'Sakura Heroine', 'Recipient name must not be mutated or cleared');
    assert.strictEqual(editor.formData.message, 'A very special heartfelt handwritten message.', 'Letter message must be intact');
  });

  it('2.4 should provide bilingual Japanese and English descriptors for all 4 pillars', () => {
    for (const pillar of CATEGORY_PILLARS) {
      assert.ok(pillar.label && pillar.label.length > 5, `Pillar ${pillar.id} must have descriptive label`);
      assert.ok(pillar.english && pillar.english.length > 5, `Pillar ${pillar.id} must have English description`);
    }
  });

  it('2.5 should reject invalid or out-of-bounds category IDs with descriptive error', () => {
    const editor = new StudioEditorModel();
    assert.throws(
      () => editor.setCategory('invalid-pillar-xyz'),
      /Invalid category pillar/
    );
  });
});
