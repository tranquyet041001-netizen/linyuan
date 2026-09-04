import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Setup directories
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'birthdays.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

if (!fs.existsSync(UPLOADS_DIR)) {
  try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (e) {}
}

// Multer storage for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp|gif|svg|bmp|heic|heif)$/i.test(file.originalname)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận tệp hình ảnh (jpg, png, webp, gif, v.v.)'));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving
app.use('/uploads', express.static(UPLOADS_DIR));

// Seed default birthday data (Lê Ngọc Hân)
export const DEMO_BIRTHDAY = {
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
  message: `Dear Ngọc Hân,\n\nHappy 25th Birthday! 🌸\n\nLooking back at all the seasons that have passed, every memory we share shines like cherry blossom petals in the morning sun. From our quiet walks under the lantern-lit trees in Meguro to our late-night conversations about dreams and futures, your presence brings warmth and light into every room you enter.\n\nAs you step into your 25th chapter of life, I hope you continue to smile with that effortless kindness that makes everyone around you feel cherished. May your journey ahead be filled with courage, deep joy, unforgettable adventures, and quiet moments of serenity.\n\nThank you for being who you are. The world is softer and more beautiful with you in it.\n\nWith all my love and warmest wishes,`,
  closingWish: 'May your 25th chapter be as radiant and boundless as the spring sky.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  cover_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
  theme: 'sakura-night',
  show_timeline: true,
  show_memories: true,

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

// In-memory cache for serverless environments (like Vercel)
let memoryCache = [DEMO_BIRTHDAY];

// Database helper functions
export function readDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const list = JSON.parse(content || '[]');
      if (list && list.length > 0) {
        memoryCache = list;
        return list;
      }
    }
  } catch (err) {
    // Fallback to memory cache
  }
  return memoryCache;
}

export function writeDatabase(data) {
  memoryCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true; // Memory cache updated
  }
}

export function generateSlug(name, currentId, list) {
  const base = (name || 'birthday')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'birthday';

  let candidate = `${base}-${new Date().getFullYear()}`;
  const isTaken = (s) => list.some((b) => b.slug === s && b.id !== currentId);

  if (!isTaken(candidate)) return candidate;

  for (let i = 0; i < 10; i++) {
    const suffix = Math.random().toString(36).substring(2, 6);
    const withSuffix = `${candidate}-${suffix}`;
    if (!isTaken(withSuffix)) return withSuffix;
  }

  return `${candidate}-${Date.now().toString(36)}`;
}

// ==========================================
// 🚀 REST API ROUTES
// ==========================================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Sakura Birthday API',
    uptime: process.uptime ? process.uptime() : 0,
    timestamp: new Date().toISOString(),
  });
});

// Upload image endpoint
app.post('/api/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Lỗi khi tải ảnh lên máy chủ' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Không tìm thấy tệp ảnh nào được gửi lên' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const relativeUrl = `/uploads/${req.file.filename}`;
    const absoluteUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      filename: req.file.filename,
      url: relativeUrl,
      absoluteUrl: absoluteUrl,
    });
  });
});

// Get all birthdays
app.get('/api/birthdays', (_req, res) => {
  const list = readDatabase();
  res.json(list);
});

// Get single birthday by ID or Slug
app.get('/api/birthdays/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const list = readDatabase();

  const found = list.find((b) => b.id === slugOrId || b.slug === slugOrId);

  if (!found) {
    if (
      slugOrId === 'le-ngoc-han-2026' || 
      slugOrId === 'demo-le-ngoc-han-2026' ||
      slugOrId === 'mai-2026' || 
      slugOrId === 'demo'
    ) {
      return res.json(DEMO_BIRTHDAY);
    }
    return res.status(404).json({ error: 'Birthday not found' });
  }

  res.json(found);
});

// Create new birthday
app.post('/api/birthdays', (req, res) => {
  const data = req.body;
  if (!data || !data.name) {
    return res.status(400).json({ error: 'Recipient name is required' });
  }

  const list = readDatabase();
  const id = data.id || `bday-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const slug = data.slug || generateSlug(data.name, id, list);
  const now = new Date().toISOString();

  const record = {
    ...data,
    id,
    slug,
    status: data.status || 'draft',
    privacy: data.privacy || 'unlisted',
    show_timeline: data.show_timeline !== false,
    show_memories: data.show_memories !== false,
    created_at: data.created_at || now,
    updated_at: now,
    published_at: data.status === 'published' ? (data.published_at || now) : undefined,
  };

  list.unshift(record);
  writeDatabase(list);

  res.status(201).json(record);
});

// Update existing birthday
app.put('/api/birthdays/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const list = readDatabase();

  const index = list.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Birthday not found' });
  }

  const now = new Date().toISOString();
  const current = list[index];

  const updatedRecord = {
    ...current,
    ...updates,
    id: current.id,
    slug: current.slug, // Keep stable slug on update
    updated_at: now,
    published_at: updates.status === 'published' ? (current.published_at || now) : current.published_at,
  };

  list[index] = updatedRecord;
  writeDatabase(list);

  res.json(updatedRecord);
});

// Duplicate birthday
app.post('/api/birthdays/:id/duplicate', (req, res) => {
  const { id } = req.params;
  const list = readDatabase();

  const original = list.find((b) => b.id === id);
  if (!original) {
    return res.status(404).json({ error: 'Birthday to duplicate not found' });
  }

  const newId = `bday-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newSlug = generateSlug(`${original.name}-copy`, newId, list);
  const now = new Date().toISOString();

  const copy = {
    ...original,
    id: newId,
    slug: newSlug,
    name: `${original.name} (Copy)`,
    status: 'draft',
    created_at: now,
    updated_at: now,
    published_at: undefined,
  };

  list.unshift(copy);
  writeDatabase(list);

  res.status(201).json(copy);
});

// Delete birthday
app.delete('/api/birthdays/:id', (req, res) => {
  const { id } = req.params;
  if (
    id === 'demo-le-ngoc-han-2026' ||
    id === 'le-ngoc-han-2026' ||
    id === 'demo-mai-2026' || 
    id === 'mai-2026'
  ) {
    return res.status(400).json({ error: 'Cannot delete demo birthday' });
  }

  const list = readDatabase();
  const filtered = list.filter((b) => b.id !== id && b.slug !== id);

  if (filtered.length === list.length) {
    return res.status(404).json({ error: 'Birthday not found' });
  }

  writeDatabase(filtered);
  res.json({ success: true, message: 'Birthday deleted successfully' });
});

export default app;
