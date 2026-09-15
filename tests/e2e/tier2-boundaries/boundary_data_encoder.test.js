import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { INITIAL_BIRTHDAY_DATA } from '../framework/studioModel.js';
import { contractMinify, contractUnminify } from '../framework/contractValidator.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 06: Data Types & URL Encoder Boundaries');

describe('Boundary 06: Data Types & URL Encoder Boundaries', () => {
  it('B6.1 should handle completely empty memories and timeline arrays without error', () => {
    const emptyData = {
      ...INITIAL_BIRTHDAY_DATA,
      memories: [],
      timeline: []
    };

    const minified = contractMinify(emptyData);
    assert.deepEqual(minified.mem, []);
    assert.deepEqual(minified.tl, []);

    const restored = contractUnminify(minified);
    assert.deepEqual(restored.memories, []);
    assert.deepEqual(restored.timeline, []);
  });

  it('B6.2 should handle memory items with all empty string optional fields', () => {
    const sparseData = {
      ...INITIAL_BIRTHDAY_DATA,
      memories: [
        {
          id: 'sparse-1',
          image_url: 'https://example.com/sparse.jpg',
          caption: '',
          year: '',
          location: '',
          note: ''
        }
      ]
    };

    const minified = contractMinify(sparseData);
    const restored = contractUnminify(minified);

    assert.strictEqual(restored.memories[0].caption, '');
    assert.strictEqual(restored.memories[0].year, '');
    assert.strictEqual(restored.memories[0].location, '');
    assert.strictEqual(restored.memories[0].note, '');
  });

  it('B6.3 should serialize and deserialize emojis, symbols, and multilingual text flawlessly', () => {
    const emojiData = {
      ...INITIAL_BIRTHDAY_DATA,
      name: '🌸 Sakura & 🌟 Hoshizora 💖',
      message: 'Chúc mừng sinh nhật! 🎉🎂✨ Hãy luôn tỏa sáng nhé! 🌺🌸',
      japaneseMessage: '桜の花びらが舞う春の日に…🌸🏯🎋'
    };

    const minified = contractMinify(emojiData);
    const restored = contractUnminify(minified);

    assert.strictEqual(restored.name, emojiData.name);
    assert.strictEqual(restored.message, emojiData.message);
    assert.strictEqual(restored.japaneseMessage, emojiData.japaneseMessage);
  });

  it('B6.4 should handle missing optional flags (show_timeline, show_memories, music_loop)', () => {
    const minimalData = {
      ...INITIAL_BIRTHDAY_DATA,
      show_timeline: false,
      show_memories: false,
      music_loop: false
    };

    const minified = contractMinify(minimalData);
    const restored = contractUnminify(minified);

    assert.strictEqual(restored.music_loop, false);
  });

  it('B6.5 should ensure JSON serialization size remains compact under 10KB for standard birthday cards', () => {
    const minified = contractMinify(INITIAL_BIRTHDAY_DATA);
    const jsonString = JSON.stringify(minified);
    const byteLength = Buffer.byteLength(jsonString, 'utf8');

    assert.lessThan(byteLength, 10240, 'Standard minified JSON must stay under 10KB');
  });
});
