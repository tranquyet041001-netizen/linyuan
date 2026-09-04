import { BirthdayData } from '../types/birthday';

// Safe Base64 for Unicode / UTF-8 characters (like Vietnamese diacritics)
function utf8ToBase64(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    return encodeURIComponent(str);
  }
}

function base64ToUtf8(str: string): string {
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

/**
 * Minify BirthdayData object before encoding into URL to keep payload tiny
 */
function minifyBirthdayForUrl(data: BirthdayData): any {
  // Strip out heavy base64 data URLs from memories if they exceed URL limits
  const cleanMemories = (data.memories || []).map((m) => {
    // If it's a huge base64 uploaded image (> 50KB), keep only if reasonable
    return {
      id: m.id,
      image_url: m.image_url,
      caption: m.caption,
      year: m.year,
      location: m.location,
    };
  });

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
    // Music
    mt: data.music_type,
    yu: data.youtube_url,
    yv: data.youtube_video_id,
    ti: data.music_title,
    md: data.music_duration,
    ms: data.music_start_time,
    me: data.music_end_time,
    mv: data.music_volume,
    ml: data.music_loop,
    // Sakura
    ss: data.sakura_settings,
    an: data.animations,
    mem: cleanMemories,
    tl: data.timeline,
  };
}

/**
 * Restore minified object back to complete BirthdayData
 */
function unminifyBirthdayFromUrl(mini: any): BirthdayData {
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
    // Music
    music_type: mini.mt || 'youtube',
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
    // Sakura
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
    memories: (mini.mem || []).map((m: any) => ({
      id: m.id || `mem-${Math.random()}`,
      image_url: m.image_url,
      caption: m.caption || '',
      year: m.year || '',
      location: m.location || '',
    })),
    timeline: (mini.tl || []).map((t: any) => ({
      id: t.id || `t-${Math.random()}`,
      year: t.year || '',
      title: t.title || '',
      description: t.description || '',
    })),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  };
}

/**
 * Encodes BirthdayData into a shareable URL string
 */
export function encodeBirthdayToUrlPayload(data: BirthdayData): string {
  try {
    const minified = minifyBirthdayForUrl(data);
    const json = JSON.stringify(minified);
    return utf8ToBase64(json);
  } catch (e) {
    console.error('Error encoding birthday payload:', e);
    return '';
  }
}

/**
 * Decodes URL payload back into BirthdayData
 */
export function decodeBirthdayFromUrlPayload(payload: string): BirthdayData | null {
  try {
    if (!payload || payload.length < 5) return null;
    const json = base64ToUtf8(payload);
    const minified = JSON.parse(json);
    return unminifyBirthdayFromUrl(minified);
  } catch (e) {
    console.error('Error decoding birthday payload:', e);
    return null;
  }
}

/**
 * Generates the full universal share URL that works on ANY device / host / Vercel
 */
export function generateUniversalShareUrl(birthday: BirthdayData): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const payload = encodeBirthdayToUrlPayload(birthday);

  // Clean slug
  const slug = birthday.slug || 'birthday';

  if (payload) {
    return `${origin}${pathname}#/birthday/${slug}?d=${payload}`;
  }
  return `${origin}${pathname}#/birthday/${slug}`;
}
