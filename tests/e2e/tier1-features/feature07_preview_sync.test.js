import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 07: Live Preview Real-time Optimization');

describe('Feature 07: Live Preview Real-time Optimization', () => {
  it('7.1 should synchronously reflect recipient name changes in live preview', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(editor.previewState.renderedName, 'Trần Mai');

    editor.updateField('name', 'Lê Quỳnh Nga');
    assert.strictEqual(editor.previewState.renderedName, 'Lê Quỳnh Nga', 'Preview must update name synchronously');
  });

  it('7.2 should suppress cinematic opening blocker when isPreview is active', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(
      editor.previewState.cinematicOpeningActive,
      false,
      'Cinematic opening must remain non-blocking in preview'
    );
  });

  it('7.3 should guarantee zero audio autoplay in preview mode to prevent user disruption', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_type', 'youtube');
    editor.updateField('youtube_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    assert.strictEqual(
      editor.previewState.hasAudioAutoplay,
      false,
      'Live preview must strictly prevent automatic audio playback'
    );
  });

  it('7.4 should handle rapid keystroke bursts without desynchronizing state', () => {
    const editor = new StudioEditorModel();
    const chars = 'Happy 21st Birthday To My Best Friend!';
    let current = '';

    for (const char of chars) {
      current += char;
      editor.updateField('message', current);
    }

    assert.strictEqual(editor.formData.message, chars);
    assert.strictEqual(editor.previewSyncCount, chars.length);
  });

  it('7.5 should immediately reflect theme color scheme changes in live preview', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(editor.previewState.renderedTheme, 'sakura-night');

    editor.updateField('theme', 'pure-sakura');
    assert.strictEqual(editor.previewState.renderedTheme, 'pure-sakura', 'Preview theme must switch instantly to pure-sakura');
  });
});
