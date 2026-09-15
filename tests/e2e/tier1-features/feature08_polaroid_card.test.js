import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 08: Interactive 3D Polaroid Card Editor');

describe('Feature 08: Interactive 3D Polaroid Card Editor', () => {
  it('8.1 should allow updating front face fields (caption, year, location, image_url)', () => {
    const editor = new StudioEditorModel();
    editor.updateMemoryCard('mem-1', {
      caption: 'Kỷ niệm Đà Lạt sương mù',
      year: '2024',
      location: 'Đà Lạt',
      image_url: 'https://example.com/dalat.jpg'
    });

    const mem = editor.formData.memories.find(m => m.id === 'mem-1');
    assert.strictEqual(mem.caption, 'Kỷ niệm Đà Lạt sương mù');
    assert.strictEqual(mem.year, '2024');
    assert.strictEqual(mem.location, 'Đà Lạt');
    assert.strictEqual(mem.image_url, 'https://example.com/dalat.jpg');
  });

  it('8.2 should allow writing and persisting secret handwritten note on the back face', () => {
    const editor = new StudioEditorModel();
    const secretMsg = 'Dù mai này có đi đến đâu, mong cậu vẫn luôn nhớ về ngày bình yên này.';
    editor.updateMemoryCard('mem-1', { note: secretMsg });

    const mem = editor.formData.memories.find(m => m.id === 'mem-1');
    assert.strictEqual(mem.note, secretMsg, 'Card back note must be stored in memory object');
  });

  it('8.3 should toggle 3D flip state between front (0deg) and back (180deg)', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(editor.isPolaroidFlipped('mem-1'), false, 'Card starts on front face');

    const flippedToBack = editor.flipPolaroidCard('mem-1');
    assert.strictEqual(flippedToBack, true, 'Card flips to back face');
    assert.strictEqual(editor.isPolaroidFlipped('mem-1'), true);

    const flippedToFront = editor.flipPolaroidCard('mem-1');
    assert.strictEqual(flippedToFront, false, 'Card flips back to front face');
    assert.strictEqual(editor.isPolaroidFlipped('mem-1'), false);
  });

  it('8.4 should preserve secret notes independently across multiple Polaroid cards', () => {
    const editor = new StudioEditorModel();
    const newCard = editor.addBlankMemoryCard();

    editor.updateMemoryCard('mem-1', { note: 'Note for Card 1' });
    editor.updateMemoryCard(newCard.id, { note: 'Note for Card 2' });

    const card1 = editor.formData.memories.find(m => m.id === 'mem-1');
    const card2 = editor.formData.memories.find(m => m.id === newCard.id);

    assert.strictEqual(card1.note, 'Note for Card 1');
    assert.strictEqual(card2.note, 'Note for Card 2');
  });

  it('8.5 should throw error when attempting to update a non-existent memory card', () => {
    const editor = new StudioEditorModel();
    assert.throws(
      () => editor.updateMemoryCard('non-existent-card-id', { caption: 'Test' }),
      /Memory card non-existent-card-id not found/
    );
  });
});
