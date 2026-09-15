import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 11: Device Frame Switcher Boundaries');

describe('Boundary 11: Device Frame Switcher Boundaries', () => {
  it('B11.1 should rapidly toggle preview device 50 times without desynchronization', () => {
    const editor = new StudioEditorModel();
    for (let i = 0; i < 25; i++) {
      editor.setPreviewDevice('mobile');
      assert.strictEqual(editor.previewDevice, 'mobile');
      editor.setPreviewDevice('desktop');
      assert.strictEqual(editor.previewDevice, 'desktop');
    }
  });

  it('B11.2 should reject null, undefined, or empty string device parameters', () => {
    const editor = new StudioEditorModel();
    assert.throws(() => editor.setPreviewDevice(null), /Invalid preview device/);
    assert.throws(() => editor.setPreviewDevice(undefined), /Invalid preview device/);
    assert.throws(() => editor.setPreviewDevice(''), /Invalid preview device/);
  });

  it('B11.3 should maintain preview synchronization in mobile frame when memory list is empty', () => {
    const editor = new StudioEditorModel();
    editor.deleteMemoryCard('mem-1');
    editor.setPreviewDevice('mobile');

    assert.strictEqual(editor.previewState.renderedMemoriesCount, 0);
    assert.strictEqual(editor.previewDevice, 'mobile');
  });

  it('B11.4 should maintain preview synchronization in desktop frame when memory list is empty', () => {
    const editor = new StudioEditorModel();
    editor.deleteMemoryCard('mem-1');
    editor.setPreviewDevice('desktop');

    assert.strictEqual(editor.previewState.renderedMemoriesCount, 0);
    assert.strictEqual(editor.previewDevice, 'desktop');
  });

  it('B11.5 should preserve device selection when updating form content fields', () => {
    const editor = new StudioEditorModel();
    editor.setPreviewDevice('mobile');
    editor.updateField('name', 'Updated In Mobile');

    assert.strictEqual(editor.previewDevice, 'mobile');
    assert.strictEqual(editor.previewState.renderedName, 'Updated In Mobile');
  });
});
