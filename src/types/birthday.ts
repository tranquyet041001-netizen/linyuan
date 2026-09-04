export type ThemeId = 'sakura-day' | 'sakura-night' | 'sunset-sakura' | 'pure-sakura';

export type MusicType = 'none' | 'youtube' | 'ambient' | 'upload_mp3';

export type BirthdayStatus = 'draft' | 'published' | 'archived';

export type PrivacyType = 'public' | 'unlisted';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  japaneseName: string;
  description: string;
  bgGradient: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  cardBg: string;
  cardBorder: string;
  isDark: boolean;
  sakuraPrimary: string;
  sakuraSecondary: string;
  petalShadow: string;
}

export interface MemoryItem {
  id: string;
  image_url: string;
  caption: string;
  year?: string;
  location?: string;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface SakuraSettings {
  density: number; // 0 - 100 (maps to particle count: 20 - 150)
  speed: number;   // 0 - 100
  wind: number;    // 0 - 100
  petal_size: number; // 0 - 100
  blur: number;    // 0 - 100
  animation_intensity: number; // 0 - 100
}

export interface AnimationToggles {
  particles: boolean;
  parallax: boolean;
  floatingParticles: boolean;
  glow: boolean;
  depthBlur: boolean;
  mouseInteraction: boolean;
  touchInteraction: boolean;
  scrollAnimation: boolean;
  cinematicOpening: boolean;
}

export interface BirthdayData {
  id: string;
  slug: string;
  status: BirthdayStatus;
  privacy: PrivacyType;
  name: string;
  age: number | string;
  birthday: string;
  subtitle: string;
  japaneseMessage: string;
  englishMessage: string;
  message: string;
  closingWish: string;
  avatar_url: string;
  cover_url?: string;
  theme: ThemeId;
  
  // Section visibility toggles
  show_timeline?: boolean;
  show_memories?: boolean;

  // Advanced Music System
  music_type: MusicType;
  youtube_url?: string;
  youtube_video_id?: string;
  music_title?: string;
  music_duration?: number;   // In seconds
  music_start_time?: number; // In seconds
  music_end_time?: number;   // In seconds
  music_volume?: number;     // 0 - 100
  music_loop?: boolean;      // Loop the section
  music_enabled?: boolean;
  start_with_opening?: boolean;
  music_url?: string;        // Custom MP3 URL or fallback

  sakura_settings: SakuraSettings;
  animations: AnimationToggles;
  memories: MemoryItem[];
  timeline: TimelineItem[];
  created_at: string;
  updated_at?: string;
  published_at?: string;
}
