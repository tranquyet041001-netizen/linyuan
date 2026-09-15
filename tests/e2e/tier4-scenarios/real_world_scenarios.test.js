import { describe, it, setTier, setFeature, beforeEach, afterEach } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';
import { installMockBrowser, cleanupMockBrowser } from '../framework/mockBrowser.js';
import { contractMinify, contractUnminify } from '../framework/contractValidator.js';

setTier('Tier 4: Real-World Scenarios');
setFeature('End-to-End User Workflows');

describe('Tier 4: Real-World Scenarios', () => {
  beforeEach(() => {
    installMockBrowser();
  });

  afterEach(() => {
    cleanupMockBrowser();
  });

  it('S4.1 [Workflow 1]: Complete New Birthday Card Creation & Publishing Workflow', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(1280);

    // Pillar 1: Profile & Greetings
    editor.setCategory('profile');
    editor.updateField('name', 'Trần Mai Phương');
    editor.updateField('age', '22');
    editor.updateField('birthday', '20/10/2004');
    editor.updateField('japaneseMessage', '春風とともに、笑顔あふれる一年になりますように。');
    editor.updateField('englishMessage', 'May your days bloom with joy like spring blossoms.');

    // Pillar 2: Handwritten Letter
    editor.setCategory('letter');
    editor.updateField('message', 'Gửi Mai Phương thân yêu! Chúc cậu tuổi 22 thật rực rỡ và luôn nở nụ cười.');

    // Pillar 3: 3D Memory Album
    editor.setCategory('memories');
    const newCard = editor.addBlankMemoryCard();
    editor.updateMemoryCard(newCard.id, {
      caption: 'Chuyến đi Kyoto mùa thu',
      year: '2023',
      location: 'Kyoto',
      note: 'Lời nhắn bí mật: Cảm ơn vì đã luôn ở bên tớ.'
    });

    // Pillar 4: Soundtrack & Sakura
    editor.setCategory('soundtrack');
    editor.updateField('music_type', 'ambient');
    editor.updateField('ambient_preset', 'zen-bell');
    editor.updateField('theme', 'pure-sakura');
    editor.updateSakuraSetting('density', 70);

    // Review on mobile preview
    editor.setPreviewDevice('mobile');
    assert.strictEqual(editor.previewState.renderedName, 'Trần Mai Phương');
    assert.strictEqual(editor.previewState.renderedTheme, 'pure-sakura');

    // Publish card
    const published = editor.publish();
    assert.strictEqual(published.status, 'published');
    assert.ok(published.published_at);

    // Verify localStorage storage
    const storedStr = globalThis.window.localStorage.getItem('sakura_birthdays_v2');
    const storedList = JSON.parse(storedStr);
    assert.strictEqual(storedList.length, 1);
    assert.strictEqual(storedList[0].name, 'Trần Mai Phương');
    assert.strictEqual(storedList[0].theme, 'pure-sakura');
  });

  it('S4.2 [Workflow 2]: Draft Restoration & Continuation Lifecycle', () => {
    // Step 1: User enters partial content
    const editorSession1 = new StudioEditorModel();
    editorSession1.updateField('name', 'Nguyễn Hoàng Yến');
    editorSession1.updateField('theme', 'sunset-sakura');
    editorSession1.updateMemoryCard('mem-1', { note: 'Draft secret message' });

    // Verify draft was saved
    const draftStr = globalThis.window.localStorage.getItem('sakura_autosave_draft');
    assert.ok(draftStr);
    const draftObj = JSON.parse(draftStr);
    assert.strictEqual(draftObj.data.name, 'Nguyễn Hoàng Yến');

    // Step 2: User reopens studio editor in new session
    const editorSession2 = new StudioEditorModel(draftObj.data);
    assert.strictEqual(editorSession2.formData.name, 'Nguyễn Hoàng Yến');
    assert.strictEqual(editorSession2.formData.theme, 'sunset-sakura');
    assert.strictEqual(editorSession2.formData.memories[0].note, 'Draft secret message');

    // Continue editing
    editorSession2.updateField('closingWish', 'Mãi mãi tuổi đôi mươi!');
    assert.strictEqual(editorSession2.formData.closingWish, 'Mãi mãi tuổi đôi mươi!');
  });

  it('S4.3 [Workflow 3]: Mobile Creator Full Editing & Preview Lifecycle', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(390); // Mobile iPhone width
    assert.strictEqual(editor.isDesktop(), false);
    assert.strictEqual(editor.mobileViewMode, 'edit');

    // Edit profile
    editor.setCategory('profile');
    editor.updateField('name', 'Võ Hoàng Lan');

    // Switch to preview mode via segmented toggle
    editor.setMobileViewMode('preview');
    assert.strictEqual(editor.mobileViewMode, 'preview');
    assert.strictEqual(editor.previewState.renderedName, 'Võ Hoàng Lan');
    assert.strictEqual(editor.previewState.hasAudioAutoplay, false);

    // Switch back to edit to tune atmosphere
    editor.setMobileViewMode('edit');
    editor.setCategory('soundtrack');
    editor.updateSakuraSetting('wind', 60);

    // Review preview again
    editor.setMobileViewMode('preview');
    assert.strictEqual(editor.formData.sakura_settings.wind, 60);
  });

  it('S4.4 [Workflow 4]: Soundtrack & Ambient Atmosphere Curation Workflow', () => {
    const editor = new StudioEditorModel();

    // User tests YouTube soundtrack
    editor.updateField('music_type', 'youtube');
    editor.updateField('youtube_url', 'https://www.youtube.com/watch?v=sample-video-id');
    editor.updateField('music_start_time', 15);
    editor.updateField('music_end_time', 90);
    editor.updateField('music_volume', 60);

    assert.strictEqual(editor.formData.music_type, 'youtube');
    assert.strictEqual(editor.formData.music_volume, 60);

    // User decides to switch to Cyber-Zen Ambient Koto
    editor.updateField('music_type', 'ambient');
    editor.updateField('ambient_preset', 'rain-koto');
    editor.updateField('music_volume', 75);

    assert.strictEqual(editor.formData.music_type, 'ambient');
    assert.strictEqual(editor.formData.ambient_preset, 'rain-koto');
    assert.strictEqual(editor.previewState.hasAudioAutoplay, false, 'Preview remains silent');
  });

  it('S4.5 [Workflow 5]: Curated 3D Memory Scrapbook Management Workflow', () => {
    const editor = new StudioEditorModel();

    // Clear initial demo card
    editor.deleteMemoryCard('mem-1');
    assert.strictEqual(editor.formData.memories.length, 0);

    // Batch upload 3 new photos
    const batchResult = editor.batchUploadPhotos([
      'https://images.unsplash.com/photo-1?auto=format',
      'https://images.unsplash.com/photo-2?auto=format',
      'https://images.unsplash.com/photo-3?auto=format'
    ]);
    assert.strictEqual(batchResult.addedCount, 3);

    // Personalize each card's front and back
    const memories = editor.formData.memories;
    editor.updateMemoryCard(memories[0].id, {
      caption: 'Tốt nghiệp Đại học',
      year: '2023',
      location: 'Hà Nội',
      note: 'Một cột mốc đáng nhớ của hai đứa.'
    });

    editor.updateMemoryCard(memories[1].id, {
      caption: 'Chuyến phượt Đà Lạt',
      year: '2024',
      location: 'Lâm Đồng',
      note: 'Đêm ngắm sao trời lạnh buốt nhưng ấm áp.'
    });

    // Check preview memory count
    assert.strictEqual(editor.previewState.renderedMemoriesCount, 3);

    // Flip card 1 to check back face
    editor.flipPolaroidCard(memories[0].id);
    assert.strictEqual(editor.isPolaroidFlipped(memories[0].id), true);
  });

  it('S4.6 [Workflow 6]: Visual Atmosphere & Canvas Containment Tuning Workflow', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(1440);

    // Cycle through themes
    const themeSequence = ['sakura-day', 'sunset-sakura', 'pure-sakura', 'sakura-night'];
    for (const theme of themeSequence) {
      editor.updateField('theme', theme);
      assert.strictEqual(editor.previewState.renderedTheme, theme);
    }

    // Adjust sakura particle physics
    editor.updateSakuraSetting('density', 85);
    editor.updateSakuraSetting('speed', 65);
    editor.updateSakuraSetting('wind', 70);
    editor.updateSakuraSetting('petal_size', 55);

    assert.strictEqual(editor.formData.sakura_settings.density, 85);
    assert.strictEqual(editor.previewState.canvasContained, true, 'Canvas must remain strictly contained inside preview frame');
  });

  it('S4.7 [Workflow 7]: Full Universal Sharing & End-to-End Recipient Experience', () => {
    // Creator designs card
    const creatorEditor = new StudioEditorModel();
    creatorEditor.updateField('name', 'Đỗ Minh Anh');
    creatorEditor.updateField('theme', 'pure-sakura');
    creatorEditor.updateField('music_type', 'ambient');
    creatorEditor.updateField('ambient_preset', 'zen-bell');
    creatorEditor.updateMemoryCard('mem-1', {
      caption: 'Sinh nhật 20 tuổi',
      note: 'Món quà đặc biệt dành riêng cho Minh Anh.'
    });

    // Creator generates minified share payload
    const minifiedPayload = contractMinify(creatorEditor.formData);
    assert.ok(minifiedPayload);

    // Recipient receives payload and unminifies
    const recipientData = contractUnminify(minifiedPayload);

    // Recipient views birthday card
    assert.strictEqual(recipientData.name, 'Đỗ Minh Anh');
    assert.strictEqual(recipientData.theme, 'pure-sakura');
    assert.strictEqual(recipientData.music_type, 'ambient');
    assert.strictEqual(recipientData.ambient_preset, 'zen-bell');
    assert.strictEqual(recipientData.memories[0].caption, 'Sinh nhật 20 tuổi');
    assert.strictEqual(recipientData.memories[0].note, 'Món quà đặc biệt dành riêng cho Minh Anh.');
  });
});
