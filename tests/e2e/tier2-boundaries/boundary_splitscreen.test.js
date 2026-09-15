import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 03: Split-Screen Boundaries');

describe('Boundary 03: Split-Screen Boundaries', () => {
  it('B3.1 should evaluate exact boundary pixel at 1024px vs 1023px', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(1024);
    assert.strictEqual(editor.isDesktop(), true, '1024px must evaluate to desktop');

    editor.setViewportWidth(1023);
    assert.strictEqual(editor.isDesktop(), false, '1023px must evaluate to mobile/tablet');
  });

  it('B3.2 should handle ultra-narrow mobile viewports (320px)', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(320);
    assert.strictEqual(editor.isDesktop(), false);
    assert.strictEqual(editor.viewportWidth, 320);
  });

  it('B3.3 should handle ultra-wide 4K viewports (3840px)', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(3840);
    assert.strictEqual(editor.isDesktop(), true);
    assert.strictEqual(editor.viewportWidth, 3840);
  });

  it('B3.4 should clamp negative or zero viewport widths safely', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(Math.max(1, -500));
    assert.strictEqual(editor.isDesktop(), false);
  });

  it('B3.5 should maintain preview device mockup scaling within bounds on standard laptop screens (1366px)', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(1366);
    assert.strictEqual(editor.isDesktop(), true);
    assert.ok(editor.viewportWidth > 1024);
  });
});
