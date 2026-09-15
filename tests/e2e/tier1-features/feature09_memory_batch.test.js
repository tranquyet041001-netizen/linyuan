import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 09: Memory Album Batch Operations');

describe('Feature 09: Memory Album Batch Operations', () => {
  it('9.1 should batch upload multiple photos and add them to memory album', () => {
    const editor = new StudioEditorModel();
    const urls = [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
      'https://example.com/photo3.jpg'
    ];

    const result = editor.batchUploadPhotos(urls);
    assert.strictEqual(result.addedCount, 3, 'Should add all 3 photos');
    assert.strictEqual(result.overflowCount, 0, 'No overflow expected');
    assert.strictEqual(editor.formData.memories.length, 4, '1 initial + 3 batch = 4');
  });

  it('9.2 should create a blank card with unique id and default attributes', () => {
    const editor = new StudioEditorModel();
    const blankCard = editor.addBlankMemoryCard();

    assert.ok(blankCard.id.startsWith('mem-'), 'ID must start with mem-');
    assert.ok(blankCard.image_url.length > 0, 'Default image URL should be present');
    assert.strictEqual(blankCard.caption, 'Kỷ niệm mới');
    assert.strictEqual(blankCard.note, '');
  });

  it('9.3 should allow direct URL editing for an existing memory card', () => {
    const editor = new StudioEditorModel();
    const newUrl = 'https://images.unsplash.com/photo-custom?auto=format';
    editor.updateMemoryCard('mem-1', { image_url: newUrl });

    assert.strictEqual(editor.formData.memories[0].image_url, newUrl);
  });

  it('9.4 should successfully delete a memory card and clean up its flip state', () => {
    const editor = new StudioEditorModel();
    editor.flipPolaroidCard('mem-1');
    assert.strictEqual(editor.isPolaroidFlipped('mem-1'), true);

    const deleted = editor.deleteMemoryCard('mem-1');
    assert.strictEqual(deleted, true);
    assert.strictEqual(editor.formData.memories.length, 0);
    assert.strictEqual(editor.isPolaroidFlipped('mem-1'), false, 'Flip state must be cleaned up');
  });

  it('9.5 should enforce maximum album capacity limit and prevent exceeding quota', () => {
    const editor = new StudioEditorModel();
    // Fill up to max capacity (20)
    while (editor.formData.memories.length < 20) {
      editor.addBlankMemoryCard();
    }
    assert.strictEqual(editor.formData.memories.length, 20);

    // Attempting to add one more blank card should throw
    assert.throws(
      () => editor.addBlankMemoryCard(),
      /Memory capacity limit reached/
    );

    // Batch upload should report overflow
    const overflowResult = editor.batchUploadPhotos(['https://example.com/extra1.jpg', 'https://example.com/extra2.jpg']);
    assert.strictEqual(overflowResult.addedCount, 0);
    assert.strictEqual(overflowResult.overflowCount, 2);
  });
});
