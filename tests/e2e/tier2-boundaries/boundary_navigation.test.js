import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel, CATEGORY_PILLARS } from '../framework/studioModel.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 02: Navigation Boundaries');

describe('Boundary 02: Navigation Boundaries', () => {
  it('B2.1 should remain stable and deterministic during rapid cyclical category switching', () => {
    const editor = new StudioEditorModel();
    const pillarIds = CATEGORY_PILLARS.map(p => p.id);

    for (let cycle = 0; cycle < 10; cycle++) {
      for (const id of pillarIds) {
        editor.setCategory(id);
        assert.strictEqual(editor.activeCategory, id);
      }
    }
    assert.strictEqual(editor.activeCategory, pillarIds[pillarIds.length - 1]);
  });

  it('B2.2 should handle re-selecting the currently active category as a no-op without side effects', () => {
    const editor = new StudioEditorModel();
    editor.setCategory('letter');
    assert.strictEqual(editor.activeCategory, 'letter');

    editor.setCategory('letter');
    assert.strictEqual(editor.activeCategory, 'letter');
  });

  it('B2.3 should trim and case-sensitively validate pillar identifiers', () => {
    const editor = new StudioEditorModel();
    // Uppercase or trailing space should be rejected by strict contract
    assert.throws(() => editor.setCategory('PROFILE'), /Invalid category pillar/);
    assert.throws(() => editor.setCategory('profile '), /Invalid category pillar/);
    assert.throws(() => editor.setCategory(''), /Invalid category pillar/);
  });

  it('B2.4 should maintain data integrity across category navigation during active editing', () => {
    const editor = new StudioEditorModel();
    editor.setCategory('profile');
    editor.updateField('name', 'Boundary Name');

    editor.setCategory('letter');
    editor.updateField('message', 'Boundary Message');

    editor.setCategory('soundtrack');
    editor.updateField('music_volume', 92);

    editor.setCategory('profile');
    assert.strictEqual(editor.formData.name, 'Boundary Name');
    assert.strictEqual(editor.formData.message, 'Boundary Message');
    assert.strictEqual(editor.formData.music_volume, 92);
  });

  it('B2.5 should handle all 4 pillar items without undefined or null properties', () => {
    for (const p of CATEGORY_PILLARS) {
      assert.strictEqual(typeof p.id, 'string');
      assert.strictEqual(typeof p.label, 'string');
      assert.strictEqual(typeof p.english, 'string');
      assert.ok(p.id.length > 0);
      assert.ok(p.label.length > 0);
      assert.ok(p.english.length > 0);
    }
  });
});
