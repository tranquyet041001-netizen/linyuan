import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 04: Mobile Responsive Boundaries');

describe('Boundary 04: Mobile Responsive Boundaries', () => {
  it('B4.1 should endure 100 rapid mode flips between edit and preview without error', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(390);

    for (let i = 0; i < 50; i++) {
      editor.setMobileViewMode('preview');
      assert.strictEqual(editor.mobileViewMode, 'preview');
      editor.setMobileViewMode('edit');
      assert.strictEqual(editor.mobileViewMode, 'edit');
    }
  });

  it('B4.2 should maintain mobile mode during mobile landscape orientation (667px or 844px)', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(844); // iPhone landscape
    assert.strictEqual(editor.isDesktop(), false, '844px landscape iPhone is still mobile (<1024px)');
  });

  it('B4.3 should smoothly handle viewport resizing from mobile (800px) to desktop (1200px)', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(800);
    editor.setMobileViewMode('preview');

    // User resizes browser to desktop
    editor.setViewportWidth(1200);
    assert.strictEqual(editor.isDesktop(), true);
    // On desktop, both panes are visible concurrently
    assert.strictEqual(editor.previewState.renderedName, editor.formData.name);
  });

  it('B4.4 should reject non-standard mobile view mode values', () => {
    const editor = new StudioEditorModel();
    assert.throws(() => editor.setMobileViewMode(null), /Invalid mobile view mode/);
    assert.throws(() => editor.setMobileViewMode(''), /Invalid mobile view mode/);
    assert.throws(() => editor.setMobileViewMode(123), /Invalid mobile view mode/);
  });

  it('B4.5 should keep form dirty state and changes intact when toggling mobile modes', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(414);
    editor.updateField('closingWish', 'May your dreams take flight like cherry blossoms in wind.');

    editor.setMobileViewMode('preview');
    editor.setMobileViewMode('edit');

    assert.strictEqual(editor.formData.closingWish, 'May your dreams take flight like cherry blossoms in wind.');
  });
});
