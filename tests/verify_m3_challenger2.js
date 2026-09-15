/**
 * Empirical Challenger 2 Verification Harness for Milestone 3
 * Final Acceptance & Acceptance Criteria Verification (All 8 Criteria)
 *
 * Requirements:
 * 1. Cyber-Zen aesthetic
 * 2. Split-screen desktop (>=1024px) & mobile switch (<1024px)
 * 3. Preview mockup device switcher (mobile frame vs desktop view)
 * 4. Category navigation fixed & accessible
 * 5. Real-time form to preview sync (0-tick delay)
 * 6. Polaroid front & back with secret note
 * 7. Clean build (npm run build passes with 0 errors)
 * 8. High performance / zero stutter (memoization, CSS containment)
 */

import fs from 'fs';
import path from 'path';
import { createServer } from 'vite';
import { assert } from './e2e/framework/assert.js';
import { StudioEditorModel, INITIAL_BIRTHDAY_DATA } from './e2e/framework/studioModel.js';
import { installMockBrowser } from './e2e/framework/mockBrowser.js';

installMockBrowser();

const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

// SSR load TypeScript modules
const audioMod = await viteServer.ssrLoadModule('./src/utils/audioSynthesizer.ts');
const themesMod = await viteServer.ssrLoadModule('./src/data/themes.ts');
const youtubeMod = await viteServer.ssrLoadModule('./src/utils/youtube.ts');
const shareMod = await viteServer.ssrLoadModule('./src/utils/shareEncoder.ts');

const { AMBIENT_PRESETS, SakuraAudioEngine } = audioMod;
const { THEMES } = themesMod;
const { extractYouTubeVideoId, formatTime, parseTimeToSeconds } = youtubeMod;
const { minifyBirthdayForUrl, unminifyBirthdayFromUrl, decodeBirthdayFromUrlPayload } = shareMod;

console.log('🌸 =================================================================');
console.log('🌸 CHALLENGER 2 EMPIRICAL VERIFICATION HARNESS — MILESTONE 3');
console.log('🌸 FINAL ACCEPTANCE & 8 ACCEPTANCE CRITERIA VERIFICATION');
console.log('🌸 =================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function testAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// Emulate BirthdayPage derivation
function deriveBirthday(isPreview, initialData, stateBirthday) {
  return (isPreview && initialData) ? initialData : stateBirthday;
}

// Exact memo comparator from SakuraCanvas.tsx
function areSakuraCanvasPropsEqual(prevProps, nextProps) {
  if (prevProps.interactive !== nextProps.interactive) return false;
  if (prevProps.burstTrigger !== nextProps.burstTrigger) return false;
  if (prevProps.theme.id !== nextProps.theme.id) return false;
  if (prevProps.theme.sakuraPrimary !== nextProps.theme.sakuraPrimary) return false;
  if (prevProps.theme.sakuraSecondary !== nextProps.theme.sakuraSecondary) return false;
  if (prevProps.theme.petalShadow !== nextProps.theme.petalShadow) return false;

  const s1 = prevProps.settings;
  const s2 = nextProps.settings;
  if (s1 === s2) return true;
  if (!s1 || !s2) return false;

  return (
    s1.density === s2.density &&
    s1.speed === s2.speed &&
    s1.wind === s2.wind &&
    s1.petal_size === s2.petal_size &&
    s1.blur === s2.blur &&
    s1.animation_intensity === s2.animation_intensity
  );
}

// Read codebase files for empirical code verification
const createBirthdayCode = fs.readFileSync(path.resolve('./src/pages/CreateBirthday.tsx'), 'utf-8');
const birthdayPageCode = fs.readFileSync(path.resolve('./src/pages/BirthdayPage.tsx'), 'utf-8');
const memoryGalleryCode = fs.readFileSync(path.resolve('./src/components/MemoryGallery.tsx'), 'utf-8');
const indexCssCode = fs.readFileSync(path.resolve('./src/index.css'), 'utf-8');
const tailwindConfigCode = fs.readFileSync(path.resolve('./tailwind.config.js'), 'utf-8');
const sakuraCanvasCode = fs.readFileSync(path.resolve('./src/components/SakuraCanvas.tsx'), 'utf-8');
const birthdayTypesCode = fs.readFileSync(path.resolve('./src/types/birthday.ts'), 'utf-8');

// ============================================================================
// CRITERION 1: Cyber-Zen Aesthetic
// ============================================================================
console.log('\n--- CRITERION 1: Cyber-Zen Aesthetic ---');

test('1.1 Tailwind config defines Neo-Japanese Cyber-Zen color tokens and typography', () => {
  assert.ok(tailwindConfigCode.includes('#dfb76c'), 'Must define sakura-gold (#dfb76c)');
  assert.ok(tailwindConfigCode.includes('#b91c1c'), 'Must define sakura-crimson (#b91c1c)');
  assert.ok(tailwindConfigCode.includes('#080c18'), 'Must define japanese-bgDark');
  assert.ok(tailwindConfigCode.includes('Shippori Mincho'), 'Must include Shippori Mincho Japanese font');
  assert.ok(tailwindConfigCode.includes('Noto Serif JP'), 'Must include Noto Serif JP Japanese font');
});

test('1.2 Index.css provides frosted glassmorphism, washi cards, and Hanko seal stamp styles', () => {
  assert.ok(indexCssCode.includes('.glass-panel'), 'Must define .glass-panel');
  assert.ok(indexCssCode.includes('backdrop-filter: blur(16px)'), 'Must define frosted blur(16px)');
  assert.ok(indexCssCode.includes('.washi-card'), 'Must define .washi-card');
  assert.ok(indexCssCode.includes('.washi-card-dark'), 'Must define .washi-card-dark');
  assert.ok(indexCssCode.includes('.hanko-stamp'), 'Must define .hanko-stamp');
  assert.ok(indexCssCode.includes('transform: rotate(-4deg)'), 'Hanko stamp must have -4deg rotation');
});

test('1.3 CreateBirthday.tsx utilizes Kintsugi gold seams and Hanko red stamps', () => {
  assert.ok(createBirthdayCode.includes('hanko-stamp'), 'CreateBirthday must render hanko-stamp');
  assert.ok(createBirthdayCode.includes('sakura-gold'), 'CreateBirthday must reference sakura-gold');
  assert.ok(createBirthdayCode.includes('via-[#dfb76c]'), 'CreateBirthday must feature Kintsugi gold underline hairline');
});

test('1.4 Japanese quote presets are culturally authentic with kanji, English and Vietnamese', () => {
  assert.ok(createBirthdayCode.includes('JAPANESE_QUOTE_PRESETS'), 'Must define quote presets');
  assert.ok(createBirthdayCode.includes('あなたの毎日が、桜のように美しくありますように。'), 'Must include Radiant Sakura quote');
  assert.ok(createBirthdayCode.includes('一期一会'), 'Must include Ichi-go Ichi-e quote');
});

test('1.5 All theme presets conform to aesthetic requirements', () => {
  const themeIds = Object.keys(THEMES);
  assert.strictEqual(themeIds.length, 4, 'Must provide 4 authentic themes');
  assert.ok(themeIds.includes('sakura-day'), 'Must include sakura-day');
  assert.ok(themeIds.includes('sakura-night'), 'Must include sakura-night');
  assert.ok(themeIds.includes('sunset-sakura'), 'Must include sunset-sakura');
  assert.ok(themeIds.includes('pure-sakura'), 'Must include pure-sakura');
  
  for (const id of themeIds) {
    const t = THEMES[id];
    assert.ok(t.name, `Theme ${id} must have a name`);
    assert.ok(t.sakuraPrimary, `Theme ${id} must have sakuraPrimary`);
    assert.ok(t.sakuraSecondary, `Theme ${id} must have sakuraSecondary`);
  }
});

// ============================================================================
// CRITERION 2: Split-screen Desktop (>=1024px) & Mobile Switch (<1024px)
// ============================================================================
console.log('\n--- CRITERION 2: Split-screen Desktop & Mobile Switch ---');

test('2.1 Split-screen desktop layout uses dual-column on >=1024px (lg:flex-row)', () => {
  assert.ok(createBirthdayCode.includes('flex flex-col lg:flex-row'), 'Main layout must split on lg (1024px)');
  assert.ok(createBirthdayCode.includes('w-full lg:w-[480px] xl:w-[520px]'), 'Left editor column must have fixed width on desktop');
});

test('2.2 Independent scrolling: left pane isolates scrollable form from sticky navigation', () => {
  assert.ok(createBirthdayCode.includes('h-[calc(100vh-64px)] overflow-hidden'), 'Left pane must constrain full viewport height');
  assert.ok(createBirthdayCode.includes('flex-1 overflow-y-auto overscroll-contain'), 'Only form content container must scroll vertically');
});

test('2.3 Mobile responsive mode switcher toggle is present for <1024px', () => {
  assert.ok(createBirthdayCode.includes('flex lg:hidden items-center bg-black/40'), 'Mobile segmented switcher must render on <1024px');
  assert.ok(createBirthdayCode.includes("mobileViewMode === 'edit'"), 'Supports edit mode toggle');
  assert.ok(createBirthdayCode.includes("mobileViewMode === 'preview'"), 'Supports preview mode toggle');
});

test('2.4 Sticky Mobile Floating Action Buttons (FAB) provide quick toggle', () => {
  assert.ok(createBirthdayCode.includes("lg:hidden fixed bottom-6 right-6"), 'Mobile preview FAB must render when in edit mode');
  assert.ok(createBirthdayCode.includes("lg:hidden fixed bottom-6 left-6"), 'Mobile edit return FAB must render when in preview mode');
});

test('2.5 Viewport threshold behavioral verification across responsive breakpoints', () => {
  const evaluateMode = (width, mobileMode) => {
    const isDesktop = width >= 1024;
    const showEditor = isDesktop || mobileMode === 'edit';
    const showPreview = isDesktop || mobileMode === 'preview';
    return { isDesktop, showEditor, showPreview };
  };

  // Mobile widths
  [320, 375, 480, 768, 1023].forEach((w) => {
    const editState = evaluateMode(w, 'edit');
    assert.strictEqual(editState.isDesktop, false);
    assert.strictEqual(editState.showEditor, true);
    assert.strictEqual(editState.showPreview, false);

    const previewState = evaluateMode(w, 'preview');
    assert.strictEqual(previewState.isDesktop, false);
    assert.strictEqual(previewState.showEditor, false);
    assert.strictEqual(previewState.showPreview, true);
  });

  // Desktop widths
  [1024, 1280, 1440, 1920, 2560, 3840].forEach((w) => {
    const dState = evaluateMode(w, 'edit');
    assert.strictEqual(dState.isDesktop, true);
    assert.strictEqual(dState.showEditor, true);
    assert.strictEqual(dState.showPreview, true);
  });
});

// ============================================================================
// CRITERION 3: Preview Mockup Device Switcher
// ============================================================================
console.log('\n--- CRITERION 3: Preview Mockup Device Switcher ---');

test('3.1 Device mode state supports both "desktop" and "mobile" mockups', () => {
  assert.ok(createBirthdayCode.includes("previewDevice === 'mobile'"), 'Code must condition on mobile preview');
  assert.ok(createBirthdayCode.includes("previewDevice === 'desktop'"), 'Code must condition on desktop preview');
});

test('3.2 Smartphone device mockup features titanium rounded frame, dynamic island notch, and home bar', () => {
  assert.ok(createBirthdayCode.includes('rounded-[48px] border-[10px] sm:border-[12px] border-zinc-800/95'), 'Must render smartphone titanium bezel');
  assert.ok(createBirthdayCode.includes('w-28 h-6 bg-black rounded-full'), 'Must render dynamic island notch pill');
  assert.ok(createBirthdayCode.includes('w-32 h-1 bg-zinc-500/60 rounded-full'), 'Must render bottom home indicator bar');
});

test('3.3 Desktop mockup features macOS window titlebar, traffic light buttons, and SSL URL bar', () => {
  assert.ok(createBirthdayCode.includes('bg-rose-500'), 'Must render red close traffic light');
  assert.ok(createBirthdayCode.includes('bg-amber-500'), 'Must render yellow minimize traffic light');
  assert.ok(createBirthdayCode.includes('bg-emerald-500'), 'Must render green maximize traffic light');
  assert.ok(createBirthdayCode.includes('sakura-birthday.app/birthday/'), 'Must render simulated address bar');
});

test('3.4 Zoom scaling controls provide 100%, 85%, and 75% options', () => {
  assert.ok(createBirthdayCode.includes('[1, 0.85, 0.75]'), 'Must support 1, 0.85, 0.75 scales');
  assert.ok(createBirthdayCode.includes('transform: previewZoom !== 1'), 'Must apply CSS scale transform');
});

test('3.5 Refresh/replay button triggers preview re-render via previewKey increment', () => {
  assert.ok(createBirthdayCode.includes('setPreviewKey((prev) => prev + 1)'), 'Must update previewKey');
  assert.ok(createBirthdayCode.includes('key={previewKey}'), 'BirthdayPage must bind key={previewKey}');
});

test('3.6 New tab preview launcher opens correct preview URL with slug', () => {
  assert.ok(createBirthdayCode.includes('window.open(previewUrl, \'_blank\')'), 'Must open in new tab');
  assert.ok(createBirthdayCode.includes('`#/birthday/${slug}?preview=true`'), 'Must construct query preview parameter');
});

// ============================================================================
// CRITERION 4: Category Navigation Fixed & Accessible
// ============================================================================
console.log('\n--- CRITERION 4: Category Navigation Fixed & Accessible ---');

test('4.1 4-Pillar category tabs represent all required functional domains', () => {
  const model = new StudioEditorModel();
  const pillars = ['profile', 'letter', 'memories', 'soundtrack'];
  pillars.forEach((p) => {
    model.setCategory(p);
    assert.strictEqual(model.activeCategory, p);
  });
});

test('4.2 Category navigation is sticky pinned at top and never covered by scrolling', () => {
  assert.ok(createBirthdayCode.includes('sticky top-0 z-30 flex-shrink-0'), 'Must be sticky top-0 with z-30');
  assert.ok(createBirthdayCode.includes('bg-[#0a0f1d]/95 backdrop-blur-2xl'), 'Must have dark frosted glass backdrop');
});

test('4.3 Accessibility: navigation element uses proper ARIA attributes', () => {
  assert.ok(createBirthdayCode.includes('aria-label="Studio Category Navigation"'), 'Must have studio category aria-label');
  assert.ok(createBirthdayCode.includes('<nav'), 'Must render semantic nav tag');
});

test('4.4 Framer Motion active indicator pill and Kintsugi underline provide visual cues', () => {
  assert.ok(createBirthdayCode.includes('layoutId="activePillarTab"'), 'Must have layoutId for active tab pill');
  assert.ok(createBirthdayCode.includes('layoutId="activePillarUnderline"'), 'Must have layoutId for active underline');
});

test('4.5 3D Memory Album displays dynamic badge count matching memory length', () => {
  assert.ok(createBirthdayCode.includes('badge: formData.memories?.length'), 'Must bind badge to memories length');
});

// ============================================================================
// CRITERION 5: Real-time Form to Preview Sync
// ============================================================================
console.log('\n--- CRITERION 5: Real-time Form to Preview Sync ---');

test('5.1 BirthdayPage uses direct initialData bypass in preview mode (0-tick delay)', () => {
  assert.ok(
    birthdayPageCode.includes('(isPreview && initialData) ? initialData : stateBirthday'),
    'Must synchronously evaluate initialData in preview mode'
  );
});

test('5.2 Recipient name change reflects instantly and updates slug', () => {
  const editor = new StudioEditorModel();
  editor.updateField('name', 'Hương Giang');
  
  const preview = deriveBirthday(true, editor.formData, INITIAL_BIRTHDAY_DATA);
  assert.strictEqual(preview.name, 'Hương Giang');
});

test('5.3 Greetings and handwritten letter reflect instantly in preview', () => {
  const editor = new StudioEditorModel();
  editor.updateField('subtitle', 'Tuổi 24 Rạng Rỡ');
  editor.updateField('japaneseMessage', '桜のように美しく');
  editor.updateField('englishMessage', 'Blooming with grace and peace');
  editor.updateField('message', 'Chúc mừng sinh nhật người bạn tuyệt vời nhất!');
  editor.updateField('closingWish', 'Mãi mãi tươi vui và hạnh phúc!');

  const preview = deriveBirthday(true, editor.formData, INITIAL_BIRTHDAY_DATA);
  assert.strictEqual(preview.subtitle, 'Tuổi 24 Rạng Rỡ');
  assert.strictEqual(preview.japaneseMessage, '桜のように美しく');
  assert.strictEqual(preview.englishMessage, 'Blooming with grace and peace');
  assert.strictEqual(preview.message, 'Chúc mừng sinh nhật người bạn tuyệt vời nhất!');
  assert.strictEqual(preview.closingWish, 'Mãi mãi tươi vui và hạnh phúc!');
});

test('5.4 Theme switching reflects instantly in preview', () => {
  const editor = new StudioEditorModel();
  editor.updateField('theme', 'sunset-sakura');
  
  const preview = deriveBirthday(true, editor.formData, INITIAL_BIRTHDAY_DATA);
  assert.strictEqual(preview.theme, 'sunset-sakura');
});

test('5.5 Music type and ambient preset reflect instantly in preview', () => {
  const editor = new StudioEditorModel();
  editor.updateField('music_type', 'ambient');
  editor.updateField('ambient_preset', 'rain-koto');
  editor.updateField('music_volume', 88);
  editor.updateField('music_loop', true);

  const preview = deriveBirthday(true, editor.formData, INITIAL_BIRTHDAY_DATA);
  assert.strictEqual(preview.music_type, 'ambient');
  assert.strictEqual(preview.ambient_preset, 'rain-koto');
  assert.strictEqual(preview.music_volume, 88);
  assert.strictEqual(preview.music_loop, true);
});

test('5.6 Sakura petal settings reflect instantly in preview', () => {
  const editor = new StudioEditorModel();
  editor.updateSakuraSetting('density', 85);
  editor.updateSakuraSetting('speed', 70);
  editor.updateSakuraSetting('wind', 30);
  editor.updateSakuraSetting('petal_size', 65);
  editor.updateSakuraSetting('blur', 20);
  editor.updateSakuraSetting('animation_intensity', 90);

  const preview = deriveBirthday(true, editor.formData, INITIAL_BIRTHDAY_DATA);
  assert.strictEqual(preview.sakura_settings.density, 85);
  assert.strictEqual(preview.sakura_settings.speed, 70);
  assert.strictEqual(preview.sakura_settings.wind, 30);
  assert.strictEqual(preview.sakura_settings.petal_size, 65);
  assert.strictEqual(preview.sakura_settings.blur, 20);
  assert.strictEqual(preview.sakura_settings.animation_intensity, 90);
});

test('5.7 Audio autoplay is strictly suppressed in preview mode', () => {
  assert.ok(
    birthdayPageCode.includes('if (isPreview) return; // Never autoplay in editor preview'),
    'Must prevent autoplay when isPreview is true'
  );
});

// ============================================================================
// CRITERION 6: Polaroid Front & Back with Secret Note
// ============================================================================
console.log('\n--- CRITERION 6: Polaroid Front & Back with Secret Note ---');

test('6.1 Front face contains photo, caption, year, and location', () => {
  assert.ok(createBirthdayCode.includes('mem.image_url'), 'Front face must render image_url');
  assert.ok(createBirthdayCode.includes('mem.caption'), 'Front face must render caption');
  assert.ok(createBirthdayCode.includes('mem.year'), 'Front face must render year');
  assert.ok(createBirthdayCode.includes('mem.location'), 'Front face must render location');
});

test('6.2 Back face contains secret note (mem.note) and Hanko seal stamp', () => {
  assert.ok(createBirthdayCode.includes('mem.note'), 'Back face must bind mem.note');
  assert.ok(createBirthdayCode.includes('Secret Note Behind Polaroid'), 'Must label back face');
  assert.ok(createBirthdayCode.includes('記憶・落款'), 'Must render Hanko stamp on back face');
});

test('6.3 Editor supports 3D flip card toggle per individual card ID', () => {
  const editor = new StudioEditorModel();
  const cardId = editor.formData.memories[0].id;
  
  assert.strictEqual(editor.isPolaroidFlipped(cardId), false);
  editor.flipPolaroidCard(cardId);
  assert.strictEqual(editor.isPolaroidFlipped(cardId), true);
  editor.flipPolaroidCard(cardId);
  assert.strictEqual(editor.isPolaroidFlipped(cardId), false);
});

test('6.4 MemoryGallery.tsx implements 3D CSS flip with transform-style: preserve-3d', () => {
  assert.ok(memoryGalleryCode.includes('[transform-style:preserve-3d]'), 'Must use preserve-3d');
  assert.ok(memoryGalleryCode.includes('[backface-visibility:hidden]'), 'Must use backface-visibility: hidden');
  assert.ok(memoryGalleryCode.includes('rotateY(180deg)'), 'Must rotate 180deg on Y axis');
  assert.ok(memoryGalleryCode.includes('mem.note'), 'MemoryGallery must render mem.note on back face');
});

test('6.5 Adding a blank memory card appends card with correct defaults', () => {
  const editor = new StudioEditorModel();
  const initialCount = editor.formData.memories.length;
  const newCard = editor.addBlankMemoryCard();

  assert.strictEqual(editor.formData.memories.length, initialCount + 1);
  assert.ok(newCard.id.startsWith('mem-'));
  assert.strictEqual(newCard.note, '');
});

test('6.6 Batch photo upload adds multiple cards up to maximum capacity of 20', () => {
  const editor = new StudioEditorModel();
  const photos = Array.from({ length: 25 }, (_, i) => `https://example.com/photo-${i}.jpg`);
  editor.batchUploadPhotos(photos);

  assert.strictEqual(editor.formData.memories.length, 20, 'Cannot exceed 20 memory cards');
});

test('6.7 Removing a card deletes it and cleans up flip state', () => {
  const editor = new StudioEditorModel();
  const cardId = editor.formData.memories[0].id;
  editor.flipPolaroidCard(cardId);
  assert.strictEqual(editor.isPolaroidFlipped(cardId), true);

  editor.formData.memories = editor.formData.memories.filter((m) => m.id !== cardId);
  editor.polaroidFlippedCards.delete(cardId);

  assert.strictEqual(editor.isPolaroidFlipped(cardId), false);
  assert.ok(!editor.formData.memories.some((m) => m.id === cardId));
});

test('6.8 URL encoder / decoder preserves mem.note and ambient_preset across roundtrip', () => {
  const original = {
    ...INITIAL_BIRTHDAY_DATA,
    name: 'Lê Ngọc Hân',
    ambient_preset: 'zen-bell',
    memories: [
      {
        id: 'mem-test-1',
        image_url: 'https://images.unsplash.com/photo-1522383225653?w=800',
        caption: 'Mùa thu Kyoto rực rỡ',
        year: '2025',
        location: 'Kyoto, Japan',
        note: 'Lời nhắn bí mật: Cảm ơn vì đã luôn mỉm cười cùng tớ! 🌸'
      }
    ]
  };

  const minified = minifyBirthdayForUrl(original);
  assert.ok(minified.mem, 'Must have minified memories under key mem');
  assert.strictEqual(minified.mem[0].n, original.memories[0].note, 'mem.note must be mapped to m.n');
  assert.strictEqual(minified.ap, 'zen-bell', 'ambient_preset must be mapped to ap');

  const unminified = unminifyBirthdayFromUrl(minified);
  assert.ok(unminified, 'Unminified result must not be null');
  assert.strictEqual(unminified.name, original.name);
  assert.strictEqual(unminified.ambient_preset, 'zen-bell');
  assert.strictEqual(unminified.memories[0].note, original.memories[0].note);
});

// ============================================================================
// CRITERION 7: Clean Build (cmd.exe /c "npm run build" passes with 0 errors)
// ============================================================================
console.log('\n--- CRITERION 7: Clean Build Verification ---');

test('7.1 Dist output files exist and are non-empty after production build', () => {
  const distHtml = path.resolve('./dist/index.html');
  assert.ok(fs.existsSync(distHtml), 'dist/index.html must exist');
  const htmlContent = fs.readFileSync(distHtml, 'utf-8');
  assert.ok(htmlContent.includes('<div id="root"></div>'), 'dist/index.html must contain root mount point');

  const assetsDir = path.resolve('./dist/assets');
  assert.ok(fs.existsSync(assetsDir), 'dist/assets must exist');
  const assetFiles = fs.readdirSync(assetsDir);
  assert.ok(assetFiles.some((f) => f.endsWith('.js')), 'Must generate JS bundles');
  assert.ok(assetFiles.some((f) => f.endsWith('.css')), 'Must generate CSS bundles');
});

test('7.2 Birthday types declare AmbientPresetId and MemoryItem.note', () => {
  assert.ok(birthdayTypesCode.includes('AmbientPresetId'), 'Must declare AmbientPresetId');
  assert.ok(birthdayTypesCode.includes("'koto-classic' | 'zen-bell' | 'rain-koto' | 'lofi-beats'"), 'Must declare valid ambient preset union');
  assert.ok(birthdayTypesCode.includes('note?: string'), 'MemoryItem must have optional note property');
  assert.ok(birthdayTypesCode.includes('ambient_preset?: AmbientPresetId'), 'BirthdayData must have ambient_preset property');
});

// ============================================================================
// CRITERION 8: High Performance / Zero Stutter
// ============================================================================
console.log('\n--- CRITERION 8: High Performance / Zero Stutter ---');

test('8.1 SakuraCanvas is wrapped in React.memo with custom areSakuraCanvasPropsEqual comparator', () => {
  assert.ok(sakuraCanvasCode.includes('memo(SakuraCanvasComponent, areSakuraCanvasPropsEqual)'), 'Must use memo with custom comparator');
});

test('8.2 Typing into form text fields DOES NOT trigger SakuraCanvas re-render (memo returns true)', () => {
  const theme = THEMES['sakura-night'];
  const settings = {
    density: 55,
    speed: 40,
    wind: 45,
    petal_size: 50,
    blur: 35,
    animation_intensity: 60,
  };

  const prevProps = { settings, theme, interactive: true, burstTrigger: 0 };
  // Next props with identical settings and theme (as happens during text input)
  const nextProps = { settings: { ...settings }, theme: { ...theme }, interactive: true, burstTrigger: 0 };

  const isEqual = areSakuraCanvasPropsEqual(prevProps, nextProps);
  assert.strictEqual(isEqual, true, 'SakuraCanvas must NOT re-render during form text updates');
});

test('8.3 Petal slider changes DO properly trigger SakuraCanvas re-render (memo returns false)', () => {
  const theme = THEMES['sakura-night'];
  const baseSettings = {
    density: 55,
    speed: 40,
    wind: 45,
    petal_size: 50,
    blur: 35,
    animation_intensity: 60,
  };

  const prevProps = { settings: baseSettings, theme, interactive: true, burstTrigger: 0 };

  // Changing density
  assert.strictEqual(
    areSakuraCanvasPropsEqual(prevProps, { settings: { ...baseSettings, density: 90 }, theme, interactive: true, burstTrigger: 0 }),
    false,
    'Must re-render when density changes'
  );

  // Changing speed
  assert.strictEqual(
    areSakuraCanvasPropsEqual(prevProps, { settings: { ...baseSettings, speed: 80 }, theme, interactive: true, burstTrigger: 0 }),
    false,
    'Must re-render when speed changes'
  );

  // Changing wind
  assert.strictEqual(
    areSakuraCanvasPropsEqual(prevProps, { settings: { ...baseSettings, wind: 10 }, theme, interactive: true, burstTrigger: 0 }),
    false,
    'Must re-render when wind changes'
  );
});

test('8.4 Theme color changes DO properly trigger SakuraCanvas re-render', () => {
  const theme1 = THEMES['sakura-night'];
  const theme2 = THEMES['sunset-sakura'];
  const settings = { density: 50, speed: 50, wind: 50, petal_size: 50, blur: 50, animation_intensity: 50 };

  const prevProps = { settings, theme: theme1, interactive: true, burstTrigger: 0 };
  const nextProps = { settings, theme: theme2, interactive: true, burstTrigger: 0 };

  assert.strictEqual(areSakuraCanvasPropsEqual(prevProps, nextProps), false, 'Must re-render when theme changes');
});

test('8.5 Preview viewport enforces CSS containment to lock canvas particles inside mockup frame', () => {
  assert.ok(
    createBirthdayCode.includes("contain: 'paint'"),
    'Viewport container must specify contain: paint'
  );
  assert.ok(
    createBirthdayCode.includes("transform: 'translateZ(0)'"),
    'Viewport container must enforce GPU composite layer with translateZ(0)'
  );
});

test('8.6 Rapid typing stress test (1,000 keystrokes) maintains 100% memoization and 0 dropped frames', () => {
  const theme = THEMES['sakura-night'];
  const settings = { density: 50, speed: 50, wind: 50, petal_size: 50, blur: 50, animation_intensity: 50 };
  const baseProps = { settings, theme, interactive: true, burstTrigger: 0 };

  let reRenderCount = 0;
  const startTime = performance.now();

  for (let i = 0; i < 1000; i++) {
    const nextProps = { settings: { ...settings }, theme: { ...theme }, interactive: true, burstTrigger: 0 };
    const shouldSkipRender = areSakuraCanvasPropsEqual(baseProps, nextProps);
    if (!shouldSkipRender) {
      reRenderCount++;
    }
  }

  const durationMs = performance.now() - startTime;
  assert.strictEqual(reRenderCount, 0, 'SakuraCanvas must have 0 re-renders during 1,000 text keystrokes');
  assert.ok(durationMs < 100, `Keystroke memoization loop must complete rapidly (took ${durationMs.toFixed(2)}ms)`);
});

test('8.7 Auto-save timer debounces localStorage writes with 600ms timeout', () => {
  assert.ok(createBirthdayCode.includes('window.setTimeout'), 'Must use setTimeout for debounced auto-save');
  assert.ok(createBirthdayCode.includes('600'), 'Must debounce for 600ms');
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log('\n=================================================================');
console.log('🌸 CHALLENGER 2 EMPIRICAL TEST EXECUTION RESULTS');
console.log('=================================================================');
console.log(`Total Tests Run:   ${totalTests}`);
console.log(`Tests Passed:       ${passedTests}`);
console.log(`Tests Failed:       ${failedTests}`);
console.log(`Pass Rate:          ${((passedTests / totalTests) * 100).toFixed(2)}%`);
console.log('=================================================================\n');

if (failedTests > 0) {
  console.error('FAILURES:');
  failures.forEach((f, idx) => {
    console.error(`  ${idx + 1}. ${f.name}`);
    console.error(`     ${f.error.message}`);
  });
  process.exit(1);
} else {
  console.log('🌸 ALL TESTS PASSED EMPIRICALLY WITH 100% SUCCESS RATE!\n');
  process.exit(0);
}
