import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 10: Studio Music Controls Boundaries');

describe('Boundary 10: Studio Music Controls Boundaries', () => {
  it('B10.1 should handle start time equal to 0 and end time equal to total duration', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_duration', 300);
    editor.updateField('music_start_time', 0);
    editor.updateField('music_end_time', 300);

    assert.strictEqual(editor.formData.music_start_time, 0);
    assert.strictEqual(editor.formData.music_end_time, 300);
  });

  it('B10.2 should handle 0-second segment boundary (start === end)', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_start_time', 60);
    editor.updateField('music_end_time', 60);

    assert.strictEqual(editor.formData.music_start_time, 60);
    assert.strictEqual(editor.formData.music_end_time, 60);
  });

  it('B10.3 should handle volume percentage boundaries (0% and 100%)', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_volume', 0);
    assert.strictEqual(editor.formData.music_volume, 0);

    editor.updateField('music_volume', 100);
    assert.strictEqual(editor.formData.music_volume, 100);
  });

  it('B10.4 should handle diverse YouTube URL formats (shortened youtu.be, embed, timestamped)', () => {
    const extractVideoId = (url) => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      return match ? match[1] : null;
    };

    assert.strictEqual(extractVideoId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
    assert.strictEqual(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
    assert.strictEqual(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s'), 'dQw4w9WgXcQ');
  });

  it('B10.5 should handle setting music type to "none" cleanly', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_type', 'none');
    editor.updateField('music_enabled', false);

    assert.strictEqual(editor.formData.music_type, 'none');
    assert.strictEqual(editor.formData.music_enabled, false);
  });
});
