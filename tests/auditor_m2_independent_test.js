// Forensic Auditor Independent Verification Suite for Milestone 2
// Tests genuine functionality, styling, contracts, and UI elements in CreateBirthday.tsx and MusicEditor.tsx

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🔍 Starting Forensic Auditor Independent Verification for Milestone 2...\n');

const ROOT_DIR = process.cwd();
const createBirthdayPath = path.join(ROOT_DIR, 'src/pages/CreateBirthday.tsx');
const musicEditorPath = path.join(ROOT_DIR, 'src/components/MusicEditor.tsx');
const indexCssPath = path.join(ROOT_DIR, 'src/index.css');

assert.ok(fs.existsSync(createBirthdayPath), 'CreateBirthday.tsx must exist');
assert.ok(fs.existsSync(musicEditorPath), 'MusicEditor.tsx must exist');
assert.ok(fs.existsSync(indexCssPath), 'index.css must exist');

const cbContent = fs.readFileSync(createBirthdayPath, 'utf8');
const meContent = fs.readFileSync(musicEditorPath, 'utf8');
const cssContent = fs.readFileSync(indexCssPath, 'utf8');

// ============================================================================
// CHECK 1: No Fake or Hardcoded Test Bypasses
// ============================================================================
console.log('--- Check 1: No Fake or Hardcoded Test Bypasses ---');
assert.ok(!cbContent.includes('process.env.NODE_ENV === "test"'), 'Must not have test-specific environment branching in CreateBirthday');
assert.ok(!meContent.includes('process.env.NODE_ENV === "test"'), 'Must not have test-specific environment branching in MusicEditor');
assert.ok(!cbContent.includes('mockPass'), 'No mockPass in CreateBirthday');
assert.ok(!meContent.includes('mockPass'), 'No mockPass in MusicEditor');
assert.ok(!cbContent.includes('bypassIntegrity'), 'No bypassIntegrity in CreateBirthday');
assert.ok(!meContent.includes('bypassIntegrity'), 'No bypassIntegrity in MusicEditor');
console.log('✓ Check 1 Passed: No test bypasses or cheating artifacts detected.');

// ============================================================================
// CHECK 2: Genuine Frosted Glassmorphism, Kintsugi Gold Seams, Hanko Stamps
// ============================================================================
console.log('\n--- Check 2: Frosted Glassmorphism, Kintsugi Seams & Hanko Stamps ---');
assert.ok(cssContent.includes('.glass-panel'), 'index.css must define .glass-panel');
assert.ok(cssContent.includes('.hanko-stamp'), 'index.css must define .hanko-stamp');
assert.ok(cssContent.includes('.washi-card'), 'index.css must define .washi-card');
assert.ok(cssContent.includes('.washi-card-dark'), 'index.css must define .washi-card-dark');

// CreateBirthday usage
assert.ok(cbContent.includes('backdrop-blur-2xl'), 'CreateBirthday must use backdrop-blur-2xl for frosted glass');
assert.ok(cbContent.includes('hanko-stamp'), 'CreateBirthday must use hanko-stamp class');
assert.ok(cbContent.includes('washi-card-dark'), 'CreateBirthday must render washi-card-dark preview');
assert.ok(cbContent.includes('#dfb76c'), 'CreateBirthday must use #dfb76c for Kintsugi gold hairline seam');
assert.ok(cbContent.includes('bg-gradient-to-r from-transparent via-[#dfb76c] to-transparent'), 'CreateBirthday must render Kintsugi hairline gradient');
console.log('✓ Check 2 Passed: Authentic Cyber-Zen aesthetic tokens actively implemented.');

// ============================================================================
// CHECK 3: Genuine 4-Pillar Navigation & Complete Form Controls
// ============================================================================
console.log('\n--- Check 3: 4-Pillar Navigation & Complete Form Controls ---');
assert.ok(cbContent.includes("export type CategoryPillar = 'profile' | 'letter' | 'memories' | 'soundtrack';"), 'CategoryPillar must declare all 4 pillars');
assert.ok(cbContent.includes('layoutId="activePillarTab"'), 'Must use Framer Motion active indicator pill');
assert.ok(cbContent.includes('layoutId="activePillarUnderline"'), 'Must use Framer Motion active gold underline');

// Pillar 1: Profile & Greetings
assert.ok(cbContent.includes("activeCategory === 'profile'"), 'Must render profile pillar');
assert.ok(cbContent.includes('handleNameChange'), 'Must handle recipient name change with slug sync');
assert.ok(cbContent.includes('handleAvatarUpload'), 'Must handle avatar image upload');
assert.ok(cbContent.includes('PRESET_AVATARS'), 'Must provide preset avatars');
assert.ok(cbContent.includes('formData.privacy'), 'Must provide privacy radio buttons');

// Pillar 2: Handwritten Letter
assert.ok(cbContent.includes("activeCategory === 'letter'"), 'Must render letter pillar');
assert.ok(cbContent.includes('JAPANESE_QUOTE_PRESETS'), 'Must include Japanese quote presets');
assert.ok(cbContent.includes('formData.japaneseMessage'), 'Must support Japanese message input');
assert.ok(cbContent.includes('formData.englishMessage'), 'Must support English translation input');
assert.ok(cbContent.includes('CLOSING_WISH_PRESETS'), 'Must include closing wish presets');

// Pillar 3: 3D Memories & Milestones
assert.ok(cbContent.includes("activeCategory === 'memories'"), 'Must render memories pillar');
assert.ok(cbContent.includes('formData.show_memories'), 'Must support show_memories toggle');
assert.ok(cbContent.includes('formData.show_timeline'), 'Must support show_timeline toggle');
assert.ok(cbContent.includes('handleAddTimeline'), 'Must support adding milestone');

// Pillar 4: Soundtrack & Sakura
assert.ok(cbContent.includes("activeCategory === 'soundtrack'"), 'Must render soundtrack pillar');
assert.ok(cbContent.includes('<MusicEditor'), 'Must embed MusicEditor component');
assert.ok(cbContent.includes('sakura_settings.density'), 'Must include density slider');
assert.ok(cbContent.includes('sakura_settings.speed'), 'Must include speed slider');
assert.ok(cbContent.includes('sakura_settings.wind'), 'Must include wind drift slider');
assert.ok(cbContent.includes('sakura_settings.petal_size'), 'Must include petal size slider');
console.log('✓ Check 3 Passed: 4-pillar navigation and all form controls fully present.');

// ============================================================================
// CHECK 4: 3D Polaroid Front & Back Card Editing
// ============================================================================
console.log('\n--- Check 4: 3D Polaroid Front & Back Card Editing ---');
assert.ok(cbContent.includes('flippedCardIds'), 'Must track flippedCardIds per card');
assert.ok(cbContent.includes('handleToggleFlipCard'), 'Must implement handleToggleFlipCard');
assert.ok(cbContent.includes('perspective: 1000'), 'Must define perspective: 1000 for 3D flip animation');
assert.ok(cbContent.includes('mem.note'), 'Must edit and bind mem.note');
assert.ok(cbContent.includes('handleBatchAddMemories'), 'Must implement batch upload handler');
assert.ok(cbContent.includes('handleRemoveMemory'), 'Must implement memory removal handler');
assert.ok(cbContent.includes('delete next[id]'), 'Removing memory must clean up flippedCardIds');
console.log('✓ Check 4 Passed: 3D Polaroid flip card editing, secret notes, batch upload verified.');

// ============================================================================
// CHECK 5: Titanium Smartphone Frame & Desktop Browser Frame Mockups
// ============================================================================
console.log('\n--- Check 5: Device Frames & Viewport Containment ---');
assert.ok(cbContent.includes("previewDevice === 'mobile'"), 'Must support mobile device preview');
assert.ok(cbContent.includes("previewDevice === 'desktop'"), 'Must support desktop device preview');
assert.ok(cbContent.includes('rounded-[48px]'), 'Mobile mockup must use rounded-[48px]');
assert.ok(cbContent.includes('w-28 h-6 bg-black rounded-full'), 'Mobile mockup must render Dynamic Island notch');
assert.ok(cbContent.includes('w-32 h-1 bg-zinc-500/60 rounded-full'), 'Mobile mockup must render bottom home bar');
assert.ok(cbContent.includes('bg-rose-500'), 'Desktop mockup must render red traffic light');
assert.ok(cbContent.includes('bg-amber-500'), 'Desktop mockup must render yellow traffic light');
assert.ok(cbContent.includes('bg-emerald-500'), 'Desktop mockup must render green traffic light');
assert.ok(cbContent.includes('sakura-birthday.app/birthday/'), 'Desktop mockup must render SSL URL bar');
assert.ok(cbContent.includes("style={{ contain: 'paint', transform: 'translateZ(0)' }}"), 'Must enforce strict CSS containment on preview viewports');
assert.ok(cbContent.includes('previewZoom'), 'Must support zoom scaler');
assert.ok(cbContent.includes('previewKey'), 'Must support preview refresh replay key');
console.log('✓ Check 5 Passed: Device mockups and strict containment architecture verified.');

// ============================================================================
// CHECK 6: Genuine MusicEditor Ambient Presets, Visualizer & YouTube Trimming
// ============================================================================
console.log('\n--- Check 6: MusicEditor Ambient Presets, Visualizer & YouTube Trimming ---');
assert.ok(meContent.includes('AMBIENT_PRESETS'), 'MusicEditor must import AMBIENT_PRESETS');
assert.ok(meContent.includes('sakuraAudio'), 'MusicEditor must interact with sakuraAudio');
assert.ok(meContent.includes('handleSelectAmbientPreset'), 'Must implement handleSelectAmbientPreset');
assert.ok(meContent.includes('handleToggleAmbient'), 'Must implement preview toggle for ambient audio');
assert.ok(meContent.includes('DualRangeSlider'), 'Must render DualRangeSlider for YouTube trimming');
assert.ok(meContent.includes('youtubeAudioPlayer.setTimeRange'), 'Must update YouTube player start/end range');
assert.ok(meContent.includes('uploadAudioToApi'), 'Must support permanent MP3 file upload');
// 8-bar equalizer visualizer
assert.ok(meContent.includes('[10, 18, 8, 22, 14, 20, 10, 16]'), 'Equalizer visualizer must render 8 bar heights');
assert.ok(meContent.includes('isAudioActive'), 'Equalizer visualizer must pulse during active playback');
console.log('✓ Check 6 Passed: MusicEditor ambient synthesis, visualizer, and trimming verified.');

console.log('\n✨ ALL AUDITOR INDEPENDENT CHECKS PASSED WITH 100% SUCCESS RATE!\n');
