/**
 * Interface Contract Validator for Studio Editor Redesign
 * Formally verifies types and operational contracts specified in PROJECT.md
 */

export const VALID_AMBIENT_PRESETS = [
  'koto-classic',
  'zen-bell',
  'rain-koto',
  'lofi-beats'
];

export const VALID_THEMES = [
  'sakura-day',
  'sakura-night',
  'sunset-sakura',
  'pure-sakura'
];

export function validateAmbientPresetId(id) {
  return VALID_AMBIENT_PRESETS.includes(id);
}

export function validateMemoryItemContract(item) {
  if (!item || typeof item !== 'object') return { valid: false, reason: 'Item is not an object' };
  if (typeof item.id !== 'string' || !item.id.trim()) return { valid: false, reason: 'Missing or empty id' };
  if (typeof item.image_url !== 'string') return { valid: false, reason: 'Missing image_url string' };
  if (typeof item.caption !== 'string') return { valid: false, reason: 'Missing caption string' };
  if (item.year !== undefined && typeof item.year !== 'string') return { valid: false, reason: 'Invalid year type' };
  if (item.location !== undefined && typeof item.location !== 'string') return { valid: false, reason: 'Invalid location type' };
  if (item.note !== undefined && typeof item.note !== 'string') return { valid: false, reason: 'Invalid note type' };
  return { valid: true };
}

export function validateBirthdayDataContract(data) {
  if (!data || typeof data !== 'object') return { valid: false, reason: 'Data is not an object' };
  const requiredStrings = ['id', 'slug', 'name', 'theme'];
  for (const field of requiredStrings) {
    if (typeof data[field] !== 'string') return { valid: false, reason: `Missing string field ${field}` };
  }
  if (!VALID_THEMES.includes(data.theme)) {
    return { valid: false, reason: `Invalid theme ${data.theme}` };
  }
  if (data.ambient_preset !== undefined && !validateAmbientPresetId(data.ambient_preset)) {
    return { valid: false, reason: `Invalid ambient_preset ${data.ambient_preset}` };
  }
  if (!Array.isArray(data.memories)) return { valid: false, reason: 'memories must be an array' };
  for (let i = 0; i < data.memories.length; i++) {
    const res = validateMemoryItemContract(data.memories[i]);
    if (!res.valid) return { valid: false, reason: `Memory item at index ${i}: ${res.reason}` };
  }
  return { valid: true };
}

/**
 * Standard contract-compliant minifier/unminifier verifying that mem.note and ambient presets
 * are strictly preserved according to PROJECT.md § Interface Contracts.
 */
export function contractMinify(data) {
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
    mt: data.music_type,
    ap: data.ambient_preset, // Ambient preset ID contract
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
    mem: (data.memories || []).map(m => ({
      id: m.id,
      image_url: m.image_url,
      caption: m.caption,
      year: m.year,
      location: m.location,
      n: m.note // Contract requirement: m.n for mem.note
    })),
    tl: data.timeline
  };
}

export function contractUnminify(mini) {
  return {
    id: mini.i,
    slug: mini.s || 'birthday',
    name: mini.n,
    age: mini.a,
    birthday: mini.b,
    message: mini.m,
    japaneseMessage: mini.jm,
    englishMessage: mini.em,
    closingWish: mini.cw,
    avatar_url: mini.av,
    cover_url: mini.cv,
    theme: mini.th || 'sakura-night',
    music_type: mini.mt || 'ambient',
    ambient_preset: mini.ap || 'zen-bell',
    youtube_url: mini.yu || '',
    youtube_video_id: mini.yv || '',
    music_title: mini.ti || '',
    music_duration: mini.md || 300,
    music_start_time: mini.ms || 0,
    music_end_time: mini.me || 180,
    music_volume: mini.mv ?? 70,
    music_loop: mini.ml !== false,
    sakura_settings: mini.ss,
    animations: mini.an,
    memories: (mini.mem || []).map(m => ({
      id: m.id,
      image_url: m.image_url,
      caption: m.caption || '',
      year: m.year || '',
      location: m.location || '',
      note: m.n || '' // Contract requirement: restore note from m.n
    })),
    timeline: mini.tl || []
  };
}
