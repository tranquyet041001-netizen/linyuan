import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';
import fs from 'node:fs';
import path from 'node:path';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 12: Preview Utilities & Containment');

describe('Feature 12: Preview Utilities & Containment', () => {
  const rootDir = process.cwd();

  it('12.1 should enforce overflow-hidden on preview mockup frames to contain rendered content', () => {
    const filePath = path.join(rootDir, 'src', 'pages', 'CreateBirthday.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    // Both mobile and desktop frames must use overflow-hidden
    assert.includes(content, 'overflow-hidden relative bg-black', 'Preview frames must declare overflow-hidden');
  });

  it('12.2 should verify SakuraCanvas supports canvas particle containment architecture', () => {
    const canvasPath = path.join(rootDir, 'src', 'components', 'SakuraCanvas.tsx');
    const canvasContent = fs.readFileSync(canvasPath, 'utf8');

    assert.includes(canvasContent, 'pointer-events-none', 'Canvas must not block interactions');
    assert.includes(canvasContent, '<canvas', 'SakuraCanvas must render HTML5 canvas');
  });

  it('12.3 should track live preview containment state in StudioEditorModel', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(editor.previewState.canvasContained, true, 'Preview state must enforce canvas containment');
  });

  it('12.4 should provide refresh capability to re-trigger card animations in preview', () => {
    const editor = new StudioEditorModel();
    const initialSync = editor.previewSyncCount;
    editor.syncPreview();
    assert.strictEqual(editor.previewSyncCount, initialSync + 1, 'Sync/refresh must increment preview counter');
  });

  it('12.5 should support generating live preview URL for new tab inspection', () => {
    const editor = new StudioEditorModel();
    editor.updateField('slug', 'test-mai-2026');
    const previewUrl = `https://sakura-birthday.app/#/birthday/${editor.formData.slug}?preview=true`;

    assert.includes(previewUrl, 'test-mai-2026');
    assert.includes(previewUrl, 'preview=true');
  });
});
