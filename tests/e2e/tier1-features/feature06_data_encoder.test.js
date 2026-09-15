import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { INITIAL_BIRTHDAY_DATA } from '../framework/studioModel.js';
import {
  validateBirthdayDataContract,
  validateMemoryItemContract,
  contractMinify,
  contractUnminify
} from '../framework/contractValidator.js';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 06: Data Types & URL Encoder Integrity');

describe('Feature 06: Data Types & URL Encoder Integrity', () => {
  it('6.1 should enforce MemoryItem contract with optional note field', () => {
    const validItem = {
      id: 'mem-1',
      image_url: 'https://example.com/pic.jpg',
      caption: 'Kyoto autumn',
      year: '2024',
      location: 'Arashiyama',
      note: 'Lời nhắn bí mật viết bằng cả tấm lòng.'
    };
    const res = validateMemoryItemContract(validItem);
    assert.ok(res.valid, `Expected valid memory item: ${res.reason}`);

    // Missing id is invalid
    const invalidItem = { ...validItem, id: '' };
    assert.strictEqual(validateMemoryItemContract(invalidItem).valid, false);
  });

  it('6.2 should enforce BirthdayData contract including ambient_preset and theme validation', () => {
    const res = validateBirthdayDataContract(INITIAL_BIRTHDAY_DATA);
    assert.ok(res.valid, `Initial birthday data must pass contract validation: ${res.reason}`);

    const invalidTheme = { ...INITIAL_BIRTHDAY_DATA, theme: 'non-existent-theme' };
    assert.strictEqual(validateBirthdayDataContract(invalidTheme).valid, false);
  });

  it('6.3 should serialize Polaroid note into "n" key during minification and restore during unminification', () => {
    const testData = {
      ...INITIAL_BIRTHDAY_DATA,
      memories: [
        {
          id: 'mem-note-test',
          image_url: 'https://example.com/photo.jpg',
          caption: 'Secret memory',
          year: '2025',
          location: 'Tokyo',
          note: 'Mặt sau thiệp có lời nhắn bí mật đặc biệt.'
        }
      ]
    };

    const minified = contractMinify(testData);
    assert.ok(minified.mem, 'Minified object must contain mem array');
    assert.strictEqual(minified.mem[0].n, 'Mặt sau thiệp có lời nhắn bí mật đặc biệt.', 'Must store note as m.n');

    const restored = contractUnminify(minified);
    assert.strictEqual(restored.memories[0].note, 'Mặt sau thiệp có lời nhắn bí mật đặc biệt.', 'Must restore note from m.n');
  });

  it('6.4 should maintain 100% fidelity for Vietnamese diacritics and Japanese Kanji in payload', () => {
    const testData = {
      ...INITIAL_BIRTHDAY_DATA,
      name: 'Nguyễn Thị Ánh Dương',
      japaneseMessage: '桜の花びらが舞い散るように、美しい一年になりますように。',
      message: 'Chúc mừng sinh nhật tuổi 25 rạng ngời!'
    };

    const minified = contractMinify(testData);
    const json = JSON.stringify(minified);
    const parsed = JSON.parse(json);
    const restored = contractUnminify(parsed);

    assert.strictEqual(restored.name, 'Nguyễn Thị Ánh Dương');
    assert.strictEqual(restored.japaneseMessage, '桜の花びらが舞い散るように、美しい一年になりますように。');
    assert.strictEqual(restored.message, 'Chúc mừng sinh nhật tuổi 25 rạng ngời!');
  });

  it('6.5 should preserve ambient_preset across serialization roundtrip', () => {
    const testData = {
      ...INITIAL_BIRTHDAY_DATA,
      music_type: 'ambient',
      ambient_preset: 'rain-koto'
    };

    const minified = contractMinify(testData);
    assert.strictEqual(minified.ap, 'rain-koto');

    const restored = contractUnminify(minified);
    assert.strictEqual(restored.ambient_preset, 'rain-koto');
  });
});
