import { BirthdayData } from '../types/birthday';

export const DEMO_BIRTHDAY: BirthdayData = {
  id: 'demo-le-ngoc-han-2026',
  slug: 'le-ngoc-han-2026',
  status: 'published',
  privacy: 'unlisted',
  name: 'Lê Ngọc Hân',
  age: 25,
  birthday: 'October 4, 2001',
  subtitle: 'A special day for someone truly irreplaceable',
  japaneseMessage: 'あなたの毎日が、桜のように美しくありますように。',
  englishMessage: 'May every day of your life be as radiant and gentle as cherry blossoms in spring.',
  message: `Dear Ngọc Hân,

Happy 25th Birthday! 🌸

Looking back at all the seasons that have passed, every memory we share shines like cherry blossom petals in the morning sun. From our quiet walks under the lantern-lit trees in Meguro to our late-night conversations about dreams and futures, your presence brings warmth and light into every room you enter.

As you step into your 25th chapter of life, I hope you continue to smile with that effortless kindness that makes everyone around you feel cherished. May your journey ahead be filled with courage, deep joy, unforgettable adventures, and quiet moments of serenity.

Thank you for being who you are. The world is softer and more beautiful with you in it.

With all my love and warmest wishes,`,
  closingWish: 'May your 25th chapter be as radiant and boundless as the spring sky.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  cover_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
  theme: 'sakura-night',

  // Section visibility toggles
  show_timeline: true,
  show_memories: true,

  // Advanced Music System (YouTube enabled)
  music_type: 'youtube',
  youtube_url: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
  youtube_video_id: 'lTRiuFIWV54',
  music_title: '1 A.M Study Session — Lofi Hip Hop & Cherry Blossom Beats',
  music_duration: 1530,
  music_start_time: 0,
  music_end_time: 300,
  music_volume: 65,
  music_loop: true,
  music_enabled: true,
  start_with_opening: true,

  sakura_settings: {
    density: 55,
    speed: 40,
    wind: 45,
    petal_size: 50,
    blur: 35,
    animation_intensity: 60,
  },
  animations: {
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
  memories: [
    {
      id: 'mem-1',
      image_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
      caption: 'Spring afternoon under the weeping cherry blossoms in Kyoto',
      year: '2019',
      location: 'Kyoto, Japan',
    },
    {
      id: 'mem-2',
      image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      caption: 'Meguro River illuminated by soft pink paper lanterns at night',
      year: '2022',
      location: 'Tokyo, Japan',
    },
    {
      id: 'mem-3',
      image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      caption: 'Quiet matcha tea ceremony on a rainy afternoon in Kamakura',
      year: '2024',
      location: 'Kamakura',
    },
    {
      id: 'mem-4',
      image_url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80',
      caption: 'Watching the morning mist drift over Mount Fuji at sunrise',
      year: '2025',
      location: 'Lake Kawaguchi',
    },
    {
      id: 'mem-5',
      image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      caption: 'Golden hour stroll through the historic bamboo forest paths',
      year: '2025',
      location: 'Arashiyama',
    },
    {
      id: 'mem-6',
      image_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      caption: 'Celebrating your 25th birthday surrounded by warmth and blossoms',
      year: '2026',
      location: 'Tokyo',
    },
  ],
  timeline: [
    {
      id: 't-1',
      year: '2001',
      title: 'A New Journey Begins',
      description: 'Born on October 4, 2001, bringing joy and gentle sunshine into the world.',
    },
    {
      id: 't-2',
      year: '2019',
      title: 'First Blossom Encounter',
      description: 'The beginning of an unforgettable friendship in the historic heart of Kyoto.',
    },
    {
      id: 't-3',
      year: '2022',
      title: 'Night of a Thousand Lanterns',
      description: 'Walking beneath the glowing sakura canopy along Meguro canal.',
    },
    {
      id: 't-4',
      year: '2026',
      title: 'Your 25th Chapter Begins',
      description: 'Celebrating you today on October 4, with infinite hope and beauty for the year ahead.',
    },
  ],
  created_at: '2026-08-29T10:00:00.000Z',
  updated_at: '2026-08-29T10:00:00.000Z',
  published_at: '2026-08-29T10:00:00.000Z',
};
