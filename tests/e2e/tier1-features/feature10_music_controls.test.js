import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 10: Studio Music Controls');

describe('Feature 10: Studio Music Controls', () => {
  it('10.1 should configure YouTube audio with URL and video ID', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_type', 'youtube');
    editor.updateField('youtube_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    editor.updateField('youtube_video_id', 'dQw4w9WgXcQ');
    editor.updateField('music_title', 'Never Gonna Give You Up');

    assert.strictEqual(editor.formData.music_type, 'youtube');
    assert.strictEqual(editor.formData.youtube_video_id, 'dQw4w9WgXcQ');
    assert.strictEqual(editor.formData.music_title, 'Never Gonna Give You Up');
  });

  it('10.2 should configure music start and end trimming timestamps accurately', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_duration', 240);
    editor.updateField('music_start_time', 15);
    editor.updateField('music_end_time', 120);

    assert.strictEqual(editor.formData.music_start_time, 15);
    assert.strictEqual(editor.formData.music_end_time, 120);
    assert.lessThan(editor.formData.music_start_time, editor.formData.music_end_time);
  });

  it('10.3 should support custom uploaded or linked MP3 audio URL', () => {
    const editor = new StudioEditorModel();
    const mp3Url = 'https://assets.mixkit.co/music/preview/mixkit-sakura-serenade.mp3';
    editor.updateField('music_type', 'upload_mp3');
    editor.updateField('music_url', mp3Url);

    assert.strictEqual(editor.formData.music_type, 'upload_mp3');
    assert.strictEqual(editor.formData.music_url, mp3Url);
  });

  it('10.4 should support selecting all 4 ambient synthesis presets in studio controls', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_type', 'ambient');

    const presets = ['zen-bell', 'rain-koto', 'lofi-beats', 'koto-classic'];
    for (const p of presets) {
      editor.updateField('ambient_preset', p);
      assert.strictEqual(editor.formData.ambient_preset, p);
    }
  });

  it('10.5 should allow volume slider adjustments from 0% to 100% and toggle loop', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_volume', 85);
    assert.strictEqual(editor.formData.music_volume, 85);

    editor.updateField('music_loop', false);
    assert.strictEqual(editor.formData.music_loop, false);

    editor.updateField('music_loop', true);
    assert.strictEqual(editor.formData.music_loop, true);
  });
});
