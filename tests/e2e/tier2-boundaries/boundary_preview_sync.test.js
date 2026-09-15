import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 07: Live Preview Synchronization Boundaries');

describe('Boundary 07: Live Preview Synchronization Boundaries', () => {
  it('B7.1 should handle empty string for recipient name gracefully in preview', () => {
    const editor = new StudioEditorModel();
    editor.updateField('name', '');
    assert.strictEqual(editor.formData.name, '');
    assert.strictEqual(editor.previewState.renderedName, '');
  });

  it('B7.2 should handle long recipient names (100 characters) in preview without breaking state', () => {
    const editor = new StudioEditorModel();
    const longName = 'Công Tằng Tôn Nữ Nguyễn Thị Hoàng Diệu Linh Trang '.repeat(2).trim();
    editor.updateField('name', longName);
    assert.strictEqual(editor.formData.name, longName);
    assert.strictEqual(editor.previewState.renderedName, longName);
  });

  it('B7.3 should rapidly cycle through all 4 themes and update preview state accurately', () => {
    const editor = new StudioEditorModel();
    const themes = ['sakura-day', 'sakura-night', 'sunset-sakura', 'pure-sakura'];

    for (const th of themes) {
      editor.updateField('theme', th);
      assert.strictEqual(editor.previewState.renderedTheme, th);
    }
  });

  it('B7.4 should sync music type changes without triggering preview audio', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_type', 'none');
    assert.strictEqual(editor.previewState.hasAudioAutoplay, false);

    editor.updateField('music_type', 'youtube');
    assert.strictEqual(editor.previewState.hasAudioAutoplay, false);

    editor.updateField('music_type', 'ambient');
    assert.strictEqual(editor.previewState.hasAudioAutoplay, false);
  });

  it('B7.5 should accurately reflect memory card additions and deletions in preview item count', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(editor.previewState.renderedMemoriesCount, 1);

    const c1 = editor.addBlankMemoryCard();
    const c2 = editor.addBlankMemoryCard();
    assert.strictEqual(editor.previewState.renderedMemoriesCount, 3);

    editor.deleteMemoryCard(c1.id);
    assert.strictEqual(editor.previewState.renderedMemoriesCount, 2);
  });
});
