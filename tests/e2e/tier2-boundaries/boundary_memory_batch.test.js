import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 09: Memory Album Batch Boundaries');

describe('Boundary 09: Memory Album Batch Boundaries', () => {
  it('B9.1 should handle empty array batch upload as harmless no-op', () => {
    const editor = new StudioEditorModel();
    const res = editor.batchUploadPhotos([]);
    assert.strictEqual(res.addedCount, 0);
    assert.strictEqual(res.overflowCount, 0);
    assert.strictEqual(editor.formData.memories.length, 1);
  });

  it('B9.2 should correctly partition added items vs overflow items when batch exceeds remaining capacity', () => {
    const editor = new StudioEditorModel();
    // 1 item initially. Remaining capacity = 19
    const batchUrls = Array.from({ length: 25 }, (_, i) => `https://example.com/pic-${i}.jpg`);
    const res = editor.batchUploadPhotos(batchUrls);

    assert.strictEqual(res.addedCount, 19, 'Must add exactly remaining 19 slots');
    assert.strictEqual(res.overflowCount, 6, '25 - 19 = 6 overflow items');
    assert.strictEqual(editor.formData.memories.length, 20, 'Max capacity reached');
  });

  it('B9.3 should return false gracefully when attempting to delete non-existent card ID', () => {
    const editor = new StudioEditorModel();
    const deleted = editor.deleteMemoryCard('id-that-never-existed');
    assert.strictEqual(deleted, false);
  });

  it('B9.4 should allow clearing all memories down to 0 and re-adding cards', () => {
    const editor = new StudioEditorModel();
    editor.deleteMemoryCard('mem-1');
    assert.strictEqual(editor.formData.memories.length, 0);

    const newCard = editor.addBlankMemoryCard();
    assert.strictEqual(editor.formData.memories.length, 1);
    assert.ok(newCard.id.startsWith('mem-'));
  });

  it('B9.5 should accurately report memory count at boundary values (0, 1, 10, 20)', () => {
    const editor = new StudioEditorModel();
    editor.deleteMemoryCard('mem-1');
    assert.strictEqual(editor.formData.memories.length, 0);

    for (let i = 1; i <= 20; i++) {
      editor.addBlankMemoryCard();
      assert.strictEqual(editor.formData.memories.length, i);
    }
    assert.strictEqual(editor.formData.memories.length, 20);
  });
});
