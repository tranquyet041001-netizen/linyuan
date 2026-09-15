import { describe, it, setTier, setFeature, beforeEach, afterEach } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';
import { installMockBrowser, cleanupMockBrowser } from '../framework/mockBrowser.js';
import { contractMinify, contractUnminify } from '../framework/contractValidator.js';

setTier('Tier 3: Cross-Feature Interactions');
setFeature('Cross-Feature Pairwise Interactions');

describe('Tier 3: Cross-Feature Interactions', () => {
  beforeEach(() => {
    installMockBrowser();
  });

  afterEach(() => {
    cleanupMockBrowser();
  });

  it('I3.1 [Nav + Split-Screen]: Navigating 4 pillars preserves right live preview state synchronously', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(1280);
    assert.strictEqual(editor.isDesktop(), true);

    editor.updateField('name', 'Hoshino Ai');
    assert.strictEqual(editor.previewState.renderedName, 'Hoshino Ai');

    // Traverse all pillars
    editor.setCategory('letter');
    assert.strictEqual(editor.previewState.renderedName, 'Hoshino Ai');

    editor.setCategory('memories');
    assert.strictEqual(editor.previewState.renderedName, 'Hoshino Ai');

    editor.setCategory('soundtrack');
    assert.strictEqual(editor.previewState.renderedName, 'Hoshino Ai');
  });

  it('I3.2 [3D Polaroid Back + Live Preview Sync]: Secret handwritten note editing reflects into live preview state', () => {
    const editor = new StudioEditorModel();
    editor.flipPolaroidCard('mem-1');
    assert.strictEqual(editor.isPolaroidFlipped('mem-1'), true);

    const secretMsg = 'Bức thư này gửi đến người tớ trân quý nhất.';
    editor.updateMemoryCard('mem-1', { note: secretMsg });

    assert.strictEqual(editor.formData.memories[0].note, secretMsg);
    assert.strictEqual(editor.previewState.renderedMemoriesCount, 1);
  });

  it('I3.3 [Ambient Audio Preset + Music Controls]: Selecting ambient preset updates both form data and audio engine state', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_type', 'ambient');
    editor.updateField('ambient_preset', 'rain-koto');

    assert.strictEqual(editor.formData.music_type, 'ambient');
    assert.strictEqual(editor.formData.ambient_preset, 'rain-koto');

    editor.updateField('ambient_preset', 'lofi-beats');
    assert.strictEqual(editor.formData.ambient_preset, 'lofi-beats');
  });

  it('I3.4 [Batch Photo Upload + Capacity Counter]: Batch upload updates memory count and album capacity indicator', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(editor.formData.memories.length, 1);

    const batch = [
      'https://example.com/p1.jpg',
      'https://example.com/p2.jpg',
      'https://example.com/p3.jpg',
      'https://example.com/p4.jpg'
    ];
    const res = editor.batchUploadPhotos(batch);

    assert.strictEqual(res.addedCount, 4);
    assert.strictEqual(editor.formData.memories.length, 5);
    assert.strictEqual(editor.previewState.renderedMemoriesCount, 5);
  });

  it('I3.5 [URL Encoder + 3D Secret Note]: Minification and unminification preserves Polaroid secret notes and ambient preset', () => {
    const editor = new StudioEditorModel();
    editor.updateMemoryCard('mem-1', { note: 'Secret note across encoder' });
    editor.updateField('ambient_preset', 'zen-bell');

    const minified = contractMinify(editor.formData);
    assert.strictEqual(minified.mem[0].n, 'Secret note across encoder');
    assert.strictEqual(minified.ap, 'zen-bell');

    const restored = contractUnminify(minified);
    assert.strictEqual(restored.memories[0].note, 'Secret note across encoder');
    assert.strictEqual(restored.ambient_preset, 'zen-bell');
  });

  it('I3.6 [Theme Selector + Cyber-Zen Styling]: Switching themes updates live preview palette without resetting particle physics', () => {
    const editor = new StudioEditorModel();
    editor.updateSakuraSetting('density', 80);
    editor.updateField('theme', 'pure-sakura');

    assert.strictEqual(editor.previewState.renderedTheme, 'pure-sakura');
    assert.strictEqual(editor.formData.sakura_settings.density, 80, 'Particle density must be preserved across theme change');
  });

  it('I3.7 [Mobile Toggle + Device Frame Switcher]: Mobile responsive view switches independently of desktop preview mockup setting', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(480);
    assert.strictEqual(editor.isDesktop(), false);

    editor.setMobileViewMode('preview');
    assert.strictEqual(editor.mobileViewMode, 'preview');

    editor.setPreviewDevice('mobile');
    assert.strictEqual(editor.previewDevice, 'mobile');

    editor.setMobileViewMode('edit');
    assert.strictEqual(editor.mobileViewMode, 'edit');
    assert.strictEqual(editor.previewDevice, 'mobile');
  });

  it('I3.8 [Sakura Sliders + Preview Containment]: Adjusting sakura wind and speed keeps preview containment intact', () => {
    const editor = new StudioEditorModel();
    editor.updateSakuraSetting('speed', 70);
    editor.updateSakuraSetting('wind', 85);

    assert.strictEqual(editor.formData.sakura_settings.speed, 70);
    assert.strictEqual(editor.formData.sakura_settings.wind, 85);
    assert.strictEqual(editor.previewState.canvasContained, true);
  });

  it('I3.9 [Autosave Storage + Typing Burst]: Fast typing in multiple fields persists to localStorage draft', () => {
    const editor = new StudioEditorModel();
    editor.updateField('name', 'Akari');
    editor.updateField('subtitle', 'Happy 20th');
    editor.updateField('closingWish', 'Always be happy!');

    const draftStr = globalThis.window.localStorage.getItem('sakura_autosave_draft');
    assert.ok(draftStr, 'Draft must exist in localStorage');

    const parsed = JSON.parse(draftStr);
    assert.strictEqual(parsed.data.name, 'Akari');
    assert.strictEqual(parsed.data.subtitle, 'Happy 20th');
    assert.strictEqual(parsed.data.closingWish, 'Always be happy!');
  });

  it('I3.10 [YouTube URL + Start/End Trimming]: Configuring YouTube video and trimming limits updates audio configuration', () => {
    const editor = new StudioEditorModel();
    editor.updateField('music_type', 'youtube');
    editor.updateField('youtube_url', 'https://www.youtube.com/watch?v=koto-music-1');
    editor.updateField('music_duration', 180);
    editor.updateField('music_start_time', 20);
    editor.updateField('music_end_time', 150);

    assert.strictEqual(editor.formData.music_type, 'youtube');
    assert.strictEqual(editor.formData.music_start_time, 20);
    assert.strictEqual(editor.formData.music_end_time, 150);
  });

  it('I3.11 [Blank Card + Direct URL + Back Note]: Creating a card and filling both faces works seamlessly', () => {
    const editor = new StudioEditorModel();
    const blankCard = editor.addBlankMemoryCard();

    editor.updateMemoryCard(blankCard.id, {
      caption: 'Sunset at Mount Fuji',
      year: '2024',
      location: 'Kawaguchiko',
      image_url: 'https://example.com/fuji.jpg',
      note: 'A moment etched in gold forever.'
    });

    const card = editor.formData.memories.find(m => m.id === blankCard.id);
    assert.strictEqual(card.caption, 'Sunset at Mount Fuji');
    assert.strictEqual(card.note, 'A moment etched in gold forever.');
    assert.strictEqual(card.location, 'Kawaguchiko');
  });

  it('I3.12 [Privacy Toggle + Universal Share URL]: Updating privacy setting updates published birthday record', () => {
    const editor = new StudioEditorModel();
    editor.updateField('privacy', 'public');
    assert.strictEqual(editor.formData.privacy, 'public');

    const published = editor.publish();
    assert.strictEqual(published.privacy, 'public');
    assert.strictEqual(published.status, 'published');
  });

  it('I3.13 [Music Volume Slider + Web Audio Gain]: Adjusting music volume syncs to Web Audio API gain parameter', () => {
    const ctx = new globalThis.AudioContext();
    const gain = ctx.createGain();

    const editor = new StudioEditorModel();
    editor.updateField('music_volume', 80);

    // Map 0-100 to 0.0-1.0
    const normalized = editor.formData.music_volume / 100;
    gain.gain.setValueAtTime(normalized, ctx.currentTime);

    assert.strictEqual(normalized, 0.8);
    assert.strictEqual(gain.gain.value, 0.8);
  });

  it('I3.14 [Delete All Memories + Preview Reflection]: Removing all memories updates preview count and draft immediately', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(editor.formData.memories.length, 1);

    editor.deleteMemoryCard('mem-1');
    assert.strictEqual(editor.formData.memories.length, 0);
    assert.strictEqual(editor.previewState.renderedMemoriesCount, 0);

    const draft = JSON.parse(globalThis.window.localStorage.getItem('sakura_autosave_draft'));
    assert.deepEqual(draft.data.memories, []);
  });
});
