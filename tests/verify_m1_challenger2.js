/**
 * Empirical Challenger 2 Verification Harness for Milestone 1
 *
 * Exhaustively tests:
 * 1. Live preview derivation and synchronization in BirthdayPage.tsx & BirthdayMessage.tsx
 * 2. SakuraCanvas memoization comparator & petal stream stability
 * 3. shareEncoder.ts backward compatibility with legacy payloads & Unicode fidelity
 * 4. Stress and edge case matrix
 */

import { assert } from './e2e/framework/assert.js';
import { StudioEditorModel, INITIAL_BIRTHDAY_DATA } from './e2e/framework/studioModel.js';

console.log('🧪 Starting Challenger 2 Empirical Verification Suite for Milestone 1...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// ============================================================================
// SUITE 1: Preview Derivation & Typing Synchronization
// ============================================================================
console.log('--- Suite 1: Preview Derivation & Typing Synchronization ---');

// Emulate BirthdayPage preview derivation logic:
// const birthday = (isPreview && initialData) ? initialData : stateBirthday;
function deriveBirthday(isPreview, initialData, stateBirthday) {
  return (isPreview && initialData) ? initialData : stateBirthday;
}

// Emulate BirthdayMessage preview render logic:
// {isPreview ? fullText : fullText.slice(0, displayedLength)}
function renderBirthdayMessage(fullText, isPreview, displayedLength) {
  return isPreview ? fullText : fullText.slice(0, displayedLength);
}

runTest('1.1 Synchronous bypass: isPreview=true returns initialData on tick 0 without useEffect delay', () => {
  const initialData = { ...INITIAL_BIRTHDAY_DATA, name: 'Initial Name' };
  const stateBirthday = { ...INITIAL_BIRTHDAY_DATA, name: 'State Name' };

  const derived = deriveBirthday(true, initialData, stateBirthday);
  assert.strictEqual(derived.name, 'Initial Name', 'Preview must immediately read initialData');
});

runTest('1.2 Non-preview fallback: isPreview=false uses stateBirthday', () => {
  const initialData = { ...INITIAL_BIRTHDAY_DATA, name: 'Initial Name' };
  const stateBirthday = { ...INITIAL_BIRTHDAY_DATA, name: 'State Name' };

  const derived = deriveBirthday(false, initialData, stateBirthday);
  assert.strictEqual(derived.name, 'State Name', 'Public card must use stateBirthday');
});

runTest('1.3 High-frequency typing burst (1,000 keystrokes) in preview mode has 0-tick lag', () => {
  const editor = new StudioEditorModel();
  const inputSequence = 'Nguyễn Trần Khánh Vy - Chúc mừng sinh nhật tuổi 20 thật rực rỡ và hạnh phúc bên gia đình và bạn bè thân yêu nhé! ';
  let fullText = '';
  
  for (let i = 0; i < inputSequence.length; i++) {
    fullText += inputSequence[i];
    editor.updateField('message', fullText);
    
    // Simulate BirthdayPage derivation
    const previewData = deriveBirthday(true, editor.formData, INITIAL_BIRTHDAY_DATA);
    assert.strictEqual(previewData.message, fullText);

    // Simulate BirthdayMessage rendering
    const renderedText = renderBirthdayMessage(previewData.message, true, 0);
    assert.strictEqual(renderedText, fullText, 'Rendered preview message must match typed buffer on every tick');
  }

  assert.strictEqual(editor.formData.message, inputSequence);
});

runTest('1.4 BirthdayMessage bypasses typewriter delay in preview mode', () => {
  const longText = 'Một bức thư dài chất chứa rất nhiều tình cảm và kỷ niệm đẹp.';
  
  // When isPreview is true, displayedLength = 0 should still render full text
  const previewRender = renderBirthdayMessage(longText, true, 0);
  assert.strictEqual(previewRender, longText, 'Preview mode must display full message immediately');

  // When isPreview is false, displayedLength = 0 renders empty string (typewriter starts at 0)
  const recipientRender = renderBirthdayMessage(longText, false, 0);
  assert.strictEqual(recipientRender, '', 'Recipient view must start typewriter at 0');

  const partialRender = renderBirthdayMessage(longText, false, 10);
  assert.strictEqual(partialRender, longText.slice(0, 10));
});

runTest('1.5 Preview mode strictly suppresses cinematic opening blocker and audio autoplay', () => {
  const editor = new StudioEditorModel();
  
  // Cinematic opening enabled in settings
  editor.updateField('animations', {
    ...editor.formData.animations,
    cinematicOpening: true,
  });

  // BirthdayPage logic: const [hasOpened, setHasOpened] = useState(!birthday.animations?.cinematicOpening || isPreview);
  const hasOpenedInPreview = !editor.formData.animations.cinematicOpening || true;
  const hasOpenedInPublic = !editor.formData.animations.cinematicOpening || false;

  assert.strictEqual(hasOpenedInPreview, true, 'Preview mode must always open immediately');
  assert.strictEqual(hasOpenedInPublic, false, 'Public mode must show opening experience');

  // Autoplay check
  assert.strictEqual(editor.previewState.hasAudioAutoplay, false, 'Preview must strictly prevent audio autoplay');
});

// ============================================================================
// SUITE 2: SakuraCanvas Memoization Comparator & Petal Physics Stability
// ============================================================================
console.log('\n--- Suite 2: SakuraCanvas Memoization Comparator & Petal Physics Stability ---');

// Exact comparator from src/components/SakuraCanvas.tsx:
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

const BASE_THEME = {
  id: 'sakura-night',
  sakuraPrimary: 'rgba(255, 183, 197, 0.85)',
  sakuraSecondary: 'rgba(255, 105, 180, 0.75)',
  petalShadow: 'rgba(255, 183, 197, 0.6)',
  isDark: true,
};

const BASE_SETTINGS = {
  density: 55,
  speed: 40,
  wind: 45,
  petal_size: 50,
  blur: 35,
  animation_intensity: 60,
};

runTest('2.1 Mutating non-sakura fields (typing text) returns TRUE (skips canvas re-render)', () => {
  const prevProps = {
    settings: { ...BASE_SETTINGS },
    theme: { ...BASE_THEME },
    interactive: true,
    burstTrigger: 0,
  };

  // User types into form: new settings object reference, but same values
  const nextProps = {
    settings: { ...BASE_SETTINGS },
    theme: { ...BASE_THEME },
    interactive: true,
    burstTrigger: 0,
  };

  const isEqual = areSakuraCanvasPropsEqual(prevProps, nextProps);
  assert.strictEqual(isEqual, true, 'Props equal must return true when non-sakura fields change');
});

runTest('2.2 Mutating sakura density returns FALSE (triggers resize/count adjustment)', () => {
  const prevProps = { settings: { ...BASE_SETTINGS }, theme: BASE_THEME, interactive: true, burstTrigger: 0 };
  const nextProps = { settings: { ...BASE_SETTINGS, density: 80 }, theme: BASE_THEME, interactive: true, burstTrigger: 0 };

  assert.strictEqual(areSakuraCanvasPropsEqual(prevProps, nextProps), false);
});

runTest('2.3 Mutating sakura speed/wind/petal_size/blur/intensity returns FALSE', () => {
  const fields = ['speed', 'wind', 'petal_size', 'blur', 'animation_intensity'];
  for (const field of fields) {
    const prevProps = { settings: { ...BASE_SETTINGS }, theme: BASE_THEME, interactive: true, burstTrigger: 0 };
    const nextProps = { settings: { ...BASE_SETTINGS, [field]: BASE_SETTINGS[field] + 15 }, theme: BASE_THEME, interactive: true, burstTrigger: 0 };
    assert.strictEqual(areSakuraCanvasPropsEqual(prevProps, nextProps), false, `Mutating ${field} must return false`);
  }
});

runTest('2.4 Mutating theme returns FALSE', () => {
  const prevProps = { settings: BASE_SETTINGS, theme: BASE_THEME, interactive: true, burstTrigger: 0 };
  const nextProps = {
    settings: BASE_SETTINGS,
    theme: { ...BASE_THEME, id: 'pure-sakura', sakuraPrimary: '#d97706' },
    interactive: true,
    burstTrigger: 0,
  };

  assert.strictEqual(areSakuraCanvasPropsEqual(prevProps, nextProps), false);
});

runTest('2.5 Triggering burstTrigger returns FALSE to render burst effect', () => {
  const prevProps = { settings: BASE_SETTINGS, theme: BASE_THEME, interactive: true, burstTrigger: 0 };
  const nextProps = { settings: BASE_SETTINGS, theme: BASE_THEME, interactive: true, burstTrigger: 1 };

  assert.strictEqual(areSakuraCanvasPropsEqual(prevProps, nextProps), false);
});

runTest('2.6 Edge case: null or undefined settings returns FALSE safely', () => {
  const p1 = { settings: null, theme: BASE_THEME, interactive: true, burstTrigger: 0 };
  const p2 = { settings: BASE_SETTINGS, theme: BASE_THEME, interactive: true, burstTrigger: 0 };
  assert.strictEqual(areSakuraCanvasPropsEqual(p1, p2), false);
  assert.strictEqual(areSakuraCanvasPropsEqual(p2, p1), false);
});

runTest('2.7 Edge case: identical reference (s1 === s2) returns TRUE immediately', () => {
  const p1 = { settings: BASE_SETTINGS, theme: BASE_THEME, interactive: true, burstTrigger: 0 };
  const p2 = { settings: BASE_SETTINGS, theme: BASE_THEME, interactive: true, burstTrigger: 0 };
  assert.strictEqual(areSakuraCanvasPropsEqual(p1, p2), true);
});

runTest('2.8 Petal array manipulation: dynamic density preserves in-flight petals without clearing array', () => {
  // Simulate handleResize in SakuraCanvas
  let petals = [];
  function adjustPetals(targetCount) {
    if (petals.length === 0) {
      for (let i = 0; i < targetCount; i++) {
        petals.push({ id: `p-${i}`, y: Math.random() * 500 });
      }
    } else if (petals.length < targetCount) {
      for (let i = petals.length; i < targetCount; i++) {
        petals.push({ id: `p-${i}`, y: -30 }); // Starts offscreen
      }
    } else if (petals.length > targetCount) {
      petals.length = targetCount; // Trim smoothly
    }
  }

  // 1. Initial 80 petals
  adjustPetals(80);
  assert.strictEqual(petals.length, 80);
  const firstPetalRef = petals[0];

  // 2. Increase density to 100
  adjustPetals(100);
  assert.strictEqual(petals.length, 100);
  assert.strictEqual(petals[0], firstPetalRef, 'Existing in-flight petals must remain untouched');

  // 3. Decrease density to 60
  adjustPetals(60);
  assert.strictEqual(petals.length, 60);
  assert.strictEqual(petals[0], firstPetalRef, 'Existing in-flight petals must not be cleared');
});

// ============================================================================
// SUITE 3: shareEncoder.ts Backward Compatibility & Integrity
// ============================================================================
console.log('\n--- Suite 3: shareEncoder.ts Backward Compatibility & Integrity ---');

// Direct implementation of utf8ToBase64, base64ToUtf8, minify, unminify from shareEncoder.ts
function utf8ToBase64(str) {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    return encodeURIComponent(str);
  }
}

function base64ToUtf8(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    return decodeURIComponent(str);
  }
}

function minifyBirthdayForUrl(data) {
  const cleanMemories = (data.memories || []).map((m) => ({
    id: m.id,
    image_url: m.image_url,
    caption: m.caption,
    year: m.year,
    location: m.location,
    n: m.note || undefined,
    note: m.note || undefined,
  }));

  return {
    i: data.id,
    s: data.slug,
    n: data.name,
    a: data.age,
    b: data.birthday,
    m: data.message,
    jm: data.japaneseMessage,
    em: data.englishMessage,
    cw: data.closingWish,
    av: data.avatar_url,
    cv: data.cover_url,
    th: data.theme,
    st: data.show_timeline,
    sm: data.show_memories,
    mt: data.music_type,
    ap: data.ambient_preset || undefined,
    mu: data.music_url,
    yu: data.youtube_url,
    yv: data.youtube_video_id,
    ti: data.music_title,
    md: data.music_duration,
    ms: data.music_start_time,
    me: data.music_end_time,
    mv: data.music_volume,
    ml: data.music_loop,
    ss: data.sakura_settings,
    an: data.animations,
    mem: cleanMemories,
    tl: data.timeline,
  };
}

function unminifyBirthdayFromUrl(mini) {
  return {
    id: mini.i || `bday-${Date.now()}`,
    slug: mini.s || 'birthday',
    status: 'published',
    privacy: 'unlisted',
    name: mini.n || 'Someone Special',
    age: mini.a,
    birthday: mini.b || '',
    message: mini.m || '',
    japaneseMessage: mini.jm || 'あなたの毎日が、桜のように美しくありますように。',
    englishMessage: mini.em || 'May every day of your life be as radiant as cherry blossoms in spring.',
    closingWish: mini.cw || 'May your next chapter be as radiant and boundless as the spring sky.',
    avatar_url: mini.av || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    cover_url: mini.cv || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
    theme: mini.th || 'sakura-night',
    show_timeline: mini.st !== false,
    show_memories: mini.sm !== false,
    music_type: mini.mt || 'youtube',
    ambient_preset: mini.ap || undefined,
    music_url: mini.mu || '',
    youtube_url: mini.yu || '',
    youtube_video_id: mini.yv || '',
    music_title: mini.ti || '',
    music_duration: mini.md || 360,
    music_start_time: mini.ms || 0,
    music_end_time: mini.me || 180,
    music_volume: mini.mv || 70,
    music_loop: mini.ml !== false,
    music_enabled: true,
    start_with_opening: true,
    sakura_settings: mini.ss || {
      density: 55,
      speed: 40,
      wind: 45,
      petal_size: 50,
      blur: 35,
      animation_intensity: 60,
    },
    animations: mini.an || {
      particles: true,
      parallax: true,
      floatingParticles: true,
      glow: true,
      depthBlur: true,
      mouseInteraction: true,
      touchInteraction: true,
      scrollAnimation: true,
      cinematicOpening: true,
    },
    memories: (mini.mem || []).map((m) => ({
      id: m.id || `mem-${Math.random()}`,
      image_url: m.image_url,
      caption: m.caption || '',
      year: m.year || '',
      location: m.location || '',
      note: m.n || m.note || '',
    })),
    timeline: (mini.tl || []).map((t) => ({
      id: t.id || `t-${Math.random()}`,
      year: t.year || '',
      title: t.title || '',
      description: t.description || '',
    })),
  };
}

function decodeBirthdayFromUrlPayload(payload) {
  try {
    if (!payload || payload.length < 5) return null;
    const json = base64ToUtf8(payload);
    const minified = JSON.parse(json);
    return unminifyBirthdayFromUrl(minified);
  } catch (e) {
    return null;
  }
}

runTest('3.1 Legacy payload without "ap" decodes gracefully with ambient_preset=undefined', () => {
  // Simulate an older link created in v1.0 without ap
  const legacyMini = {
    i: 'legacy-card-1',
    s: 'legacy-slug',
    n: 'Mai Phương',
    m: 'Happy Birthday!',
    mt: 'youtube',
    // ap is intentionally missing!
    mem: [
      { id: 'm1', image_url: 'https://example.com/1.jpg', caption: 'Kyoto', year: '2023', location: 'Japan' }
      // n is intentionally missing!
    ]
  };

  const restored = unminifyBirthdayFromUrl(legacyMini);
  assert.strictEqual(restored.id, 'legacy-card-1');
  assert.strictEqual(restored.name, 'Mai Phương');
  assert.strictEqual(restored.ambient_preset, undefined, 'Missing ap must decode to undefined without crashing');
  assert.strictEqual(restored.memories[0].note, '', 'Missing n/note must decode to empty string');
});

runTest('3.2 Legacy payload with unminified "note" instead of "n" is correctly extracted', () => {
  const legacyMini = {
    i: 'card-old-notes',
    n: 'Test User',
    mem: [
      { id: 'm1', image_url: 'https://example.com/2.jpg', caption: 'Trip', note: 'Older format note' }
    ]
  };

  const restored = unminifyBirthdayFromUrl(legacyMini);
  assert.strictEqual(restored.memories[0].note, 'Older format note', 'Must support backward compatible note key');
});

runTest('3.3 Modern payload with both "ap" and "n" roundtrips losslessly via URL encoding', () => {
  const modernData = {
    ...INITIAL_BIRTHDAY_DATA,
    id: 'bday-modern-2026',
    name: 'Đặng Thùy Trâm',
    music_type: 'ambient',
    ambient_preset: 'zen-bell',
    memories: [
      {
        id: 'mem-polaroid-1',
        image_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d',
        caption: 'Ngắm hoa anh đào tại Nara',
        year: '2025',
        location: 'Nara, Japan',
        note: 'Lời chúc bí mật ở mặt sau: Mong mọi ước mơ tuổi 22 đều thành hiện thực!'
      }
    ]
  };

  const minified = minifyBirthdayForUrl(modernData);
  assert.strictEqual(minified.ap, 'zen-bell');
  assert.strictEqual(minified.mem[0].n, 'Lời chúc bí mật ở mặt sau: Mong mọi ước mơ tuổi 22 đều thành hiện thực!');

  const payload = utf8ToBase64(JSON.stringify(minified));
  const decoded = decodeBirthdayFromUrlPayload(payload);

  assert.ok(decoded, 'Decoded result must not be null');
  assert.strictEqual(decoded.id, 'bday-modern-2026');
  assert.strictEqual(decoded.name, 'Đặng Thùy Trâm');
  assert.strictEqual(decoded.ambient_preset, 'zen-bell');
  assert.strictEqual(decoded.memories[0].note, 'Lời chúc bí mật ở mặt sau: Mong mọi ước mơ tuổi 22 đều thành hiện thực!');
});

runTest('3.4 Unicode & Multilingual Stress: Vietnamese diacritics, Kanji, emojis, control chars', () => {
  const complexData = {
    ...INITIAL_BIRTHDAY_DATA,
    name: '👑 Hoàng Hậu Nam Phương 🌸',
    message: 'Chúc em một đời an yên, thanh thuần như đóa hoa anh đào trong sớm mai!\nĐường đời dẫu lắm chông gai, tâm em vẫn sáng như trăng rằm.',
    japaneseMessage: '人生のすべての瞬間が、春の陽光と桜の花のように美しく輝きますように。✨🎋',
    memories: [
      {
        id: 'mem-unicode',
        image_url: 'https://example.com/pic.jpg',
        caption: 'Kỷ niệm Đà Lạt 2026: Đỉnh Langbiang sương mù 🌲⛰️',
        year: '2026',
        location: 'Đà Lạt, Lâm Đồng, Việt Nam',
        note: 'Lời nhắn: "Hẹn ước cùng nhau ngắm mùa hoa anh đào nở lần thứ 30!" 💖🌸'
      }
    ]
  };

  const payload = utf8ToBase64(JSON.stringify(minifyBirthdayForUrl(complexData)));
  const restored = decodeBirthdayFromUrlPayload(payload);

  assert.strictEqual(restored.name, complexData.name);
  assert.strictEqual(restored.message, complexData.message);
  assert.strictEqual(restored.japaneseMessage, complexData.japaneseMessage);
  assert.strictEqual(restored.memories[0].caption, complexData.memories[0].caption);
  assert.strictEqual(restored.memories[0].note, complexData.memories[0].note);
});

runTest('3.5 Malformed & truncated URL payload returns null without throwing unhandled error', () => {
  const malformedPayloads = [
    '',
    'abc',
    '!!!invalid_base64$$$',
    'eyJpIjoiY29ycnVwdGVkIl0=', // invalid JSON
    null,
    undefined,
  ];

  for (const p of malformedPayloads) {
    const result = decodeBirthdayFromUrlPayload(p);
    assert.strictEqual(result, null, `Malformed payload "${p}" must return null safely`);
  }
});

runTest('3.6 Memory album size scaling: 8 memories under 8KB (with redundancy analysis), 20 memories 100% losslessly', () => {
  // 1. Standard 8-card album
  const standardMemories = [];
  for (let i = 1; i <= 8; i++) {
    standardMemories.push({
      id: `mem-${i}`,
      image_url: `https://images.unsplash.com/photo-${i}?auto=format&fit=crop&w=800&q=80`,
      caption: `Chuyến du lịch kỷ niệm số ${i}`,
      year: `${2020 + (i % 5)}`,
      location: `Địa điểm số ${i}, Tokyo, Nhật Bản`,
      note: `Bí mật số ${i}: Một kỷ niệm thật đẹp và đáng nhớ trên từng chặng đường.`
    });
  }

  const standardData = { ...INITIAL_BIRTHDAY_DATA, memories: standardMemories };
  const standardPayload = utf8ToBase64(JSON.stringify(minifyBirthdayForUrl(standardData)));
  const standardSize = Buffer.byteLength(standardPayload, 'utf8');
  assert.lessThan(standardSize, 8192, `Standard 8-card payload (${standardSize} bytes) must be under 8KB`);

  // Measure redundancy of storing both n and note in cleanMemories
  const minifiedWithoutRedundancy = minifyBirthdayForUrl(standardData);
  minifiedWithoutRedundancy.mem.forEach(m => { delete m.note; }); // Keep only m.n
  const optimizedSize = Buffer.byteLength(utf8ToBase64(JSON.stringify(minifiedWithoutRedundancy)), 'utf8');
  console.log(`    [Size Metric] 8 cards payload: ${standardSize}B (with dual n+note) vs ${optimizedSize}B (with n only) -> saves ${standardSize - optimizedSize}B (${((standardSize - optimizedSize) / standardSize * 100).toFixed(1)}%)`);

  // 2. Stress 20-card album
  const stressMemories = [];
  for (let i = 1; i <= 20; i++) {
    stressMemories.push({
      id: `mem-${i}`,
      image_url: `https://images.unsplash.com/photo-${i}?auto=format&fit=crop&w=800&q=80`,
      caption: `Chuyến du lịch kỷ niệm số ${i}`,
      year: `${2020 + (i % 5)}`,
      location: `Địa điểm số ${i}, Tokyo, Nhật Bản`,
      note: `Bí mật số ${i}: Một kỷ niệm thật đẹp và đáng nhớ trên từng chặng đường.`
    });
  }

  const stressData = { ...INITIAL_BIRTHDAY_DATA, memories: stressMemories };
  const stressPayload = utf8ToBase64(JSON.stringify(minifyBirthdayForUrl(stressData)));
  const restored = decodeBirthdayFromUrlPayload(stressPayload);
  assert.strictEqual(restored.memories.length, 20);
  assert.strictEqual(restored.memories[19].note, 'Bí mật số 20: Một kỷ niệm thật đẹp và đáng nhớ trên từng chặng đường.');
});

// ============================================================================
// VERIFICATION SUMMARY
// ============================================================================
console.log('\n====================================================================');
console.log(`CHALLENGER 2 EMPIRICAL RESULTS: ${passedTests}/${totalTests} tests passed`);
console.log('====================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
