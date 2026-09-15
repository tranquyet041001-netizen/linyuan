import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 08: 3D Polaroid Card Boundaries');

describe('Boundary 08: 3D Polaroid Card Boundaries', () => {
  it('B8.1 should store and preserve a very long secret note (1,000 characters) on back face', () => {
    const editor = new StudioEditorModel();
    const longNote = 'Dòng thư bí mật gửi tặng bạn nhân dịp sinh nhật tròn 20 tuổi tươi đẹp. '.repeat(15);
    editor.updateMemoryCard('mem-1', { note: longNote });

    const mem = editor.formData.memories.find(m => m.id === 'mem-1');
    assert.strictEqual(mem.note, longNote);
    assert.greaterThan(mem.note.length, 900);
  });

  it('B8.2 should endure 50 rapid flip toggles on the same card without getting out of sync', () => {
    const editor = new StudioEditorModel();
    for (let i = 0; i < 50; i++) {
      editor.flipPolaroidCard('mem-1');
    }
    // 50 flips from false -> false (front)
    assert.strictEqual(editor.isPolaroidFlipped('mem-1'), false);
  });

  it('B8.3 should handle arbitrary text strings in year field (e.g. "Mùa xuân 2023", "2020 - 2025")', () => {
    const editor = new StudioEditorModel();
    editor.updateMemoryCard('mem-1', { year: 'Mùa xuân 2023' });
    assert.strictEqual(editor.formData.memories[0].year, 'Mùa xuân 2023');

    editor.updateMemoryCard('mem-1', { year: '2020 - 2025' });
    assert.strictEqual(editor.formData.memories[0].year, '2020 - 2025');
  });

  it('B8.4 should handle missing or empty location string gracefully', () => {
    const editor = new StudioEditorModel();
    editor.updateMemoryCard('mem-1', { location: '' });
    assert.strictEqual(editor.formData.memories[0].location, '');
  });

  it('B8.5 should clean up flip state when cards are removed and reset', () => {
    const editor = new StudioEditorModel();
    editor.flipPolaroidCard('mem-1');
    assert.strictEqual(editor.isPolaroidFlipped('mem-1'), true);

    editor.deleteMemoryCard('mem-1');
    assert.strictEqual(editor.isPolaroidFlipped('mem-1'), false);
  });
});
