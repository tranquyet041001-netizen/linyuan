import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 04: Mobile Responsive Mode');

describe('Feature 04: Mobile Responsive Mode', () => {
  it('4.1 should recognize mobile mode when viewport width is below 1024px', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(768);
    assert.strictEqual(editor.isDesktop(), false, '768px tablet width should be mobile mode');

    editor.setViewportWidth(375);
    assert.strictEqual(editor.isDesktop(), false, '375px mobile width should be mobile mode');
  });

  it('4.2 should support segmented mode toggling between edit and preview', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(editor.mobileViewMode, 'edit', 'Default mobile mode should be edit');

    editor.setMobileViewMode('preview');
    assert.strictEqual(editor.mobileViewMode, 'preview', 'Mobile view mode should switch to preview');

    editor.setMobileViewMode('edit');
    assert.strictEqual(editor.mobileViewMode, 'edit', 'Mobile view mode should switch back to edit');
  });

  it('4.3 should reject invalid mobile view mode transitions', () => {
    const editor = new StudioEditorModel();
    assert.throws(
      () => editor.setMobileViewMode('unknown_mode'),
      /Invalid mobile view mode/
    );
  });

  it('4.4 should preserve all form changes across mobile view mode toggles', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(414);
    editor.updateField('name', 'Hana Nguyen');
    editor.updateField('subtitle', 'Special 25th Birthday');

    // Toggle to preview and back
    editor.setMobileViewMode('preview');
    assert.strictEqual(editor.previewState.renderedName, 'Hana Nguyen');

    editor.setMobileViewMode('edit');
    assert.strictEqual(editor.formData.name, 'Hana Nguyen');
    assert.strictEqual(editor.formData.subtitle, 'Special 25th Birthday');
  });

  it('4.5 should provide seamless state access for sticky quick action controls in mobile view', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(390);

    // When in edit mode, user can quickly trigger preview
    assert.strictEqual(editor.mobileViewMode, 'edit');
    editor.setMobileViewMode('preview');
    assert.strictEqual(editor.previewState.hasAudioAutoplay, false, 'Mobile preview must never autoplay audio');
  });
});
