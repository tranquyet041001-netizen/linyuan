-- ==========================================================
-- 🌸 SAKURA BIRTHDAY — SUPABASE / POSTGRESQL DATABASE SCHEMA
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: birthdays
CREATE TABLE IF NOT EXISTS birthdays (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID DEFAULT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    privacy VARCHAR(20) DEFAULT 'unlisted' CHECK (privacy IN ('public', 'unlisted')),
    name VARCHAR(255) NOT NULL,
    age VARCHAR(32),
    birthday VARCHAR(128),
    subtitle TEXT,
    japanese_message TEXT,
    english_message TEXT,
    message TEXT,
    closing_wish TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    theme VARCHAR(64) DEFAULT 'sakura-night',
    
    -- Section toggles
    show_timeline BOOLEAN DEFAULT TRUE,
    show_memories BOOLEAN DEFAULT TRUE,

    -- Music settings
    music_type VARCHAR(32) DEFAULT 'ambient',
    youtube_url TEXT,
    youtube_video_id VARCHAR(64),
    music_title TEXT,
    music_duration INT DEFAULT 0,
    music_start_time INT DEFAULT 0,
    music_end_time INT DEFAULT 0,
    music_volume INT DEFAULT 65,
    music_loop BOOLEAN DEFAULT TRUE,
    music_enabled BOOLEAN DEFAULT TRUE,
    start_with_opening BOOLEAN DEFAULT TRUE,
    music_url TEXT,

    -- Sakura physics & animation config (Stored as JSONB)
    sakura_settings JSONB DEFAULT '{"density":55,"speed":40,"wind":45,"petal_size":50,"blur":35,"animation_intensity":60}'::jsonb,
    animations JSONB DEFAULT '{"particles":true,"parallax":true,"floatingParticles":true,"glow":true,"depthBlur":true,"mouseInteraction":true,"touchInteraction":true,"scrollAnimation":true,"cinematicOpening":true}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Index on slug for quick lookup
CREATE INDEX IF NOT EXISTS idx_birthdays_slug ON birthdays(slug);
CREATE INDEX IF NOT EXISTS idx_birthdays_status ON birthdays(status);

-- 2. Table: birthday_memories
CREATE TABLE IF NOT EXISTS birthday_memories (
    id VARCHAR(64) PRIMARY KEY,
    birthday_id VARCHAR(64) NOT NULL REFERENCES birthdays(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    year VARCHAR(32),
    location VARCHAR(128),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_birthday_id ON birthday_memories(birthday_id);

-- 3. Table: birthday_timeline
CREATE TABLE IF NOT EXISTS birthday_timeline (
    id VARCHAR(64) PRIMARY KEY,
    birthday_id VARCHAR(64) NOT NULL REFERENCES birthdays(id) ON DELETE CASCADE,
    year VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_birthday_id ON birthday_timeline(birthday_id);

-- Row Level Security (RLS) policies for Supabase
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_timeline ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published / unlisted birthdays
CREATE POLICY "Public Read Access" ON birthdays
    FOR SELECT USING (status = 'published' OR status = 'draft');

CREATE POLICY "Public Memories Read Access" ON birthday_memories
    FOR SELECT USING (true);

CREATE POLICY "Public Timeline Read Access" ON birthday_timeline
    FOR SELECT USING (true);

-- Allow all insert/update operations for anonymous creation
CREATE POLICY "Public Insert Access" ON birthdays
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Access" ON birthdays
    FOR UPDATE USING (true);

CREATE POLICY "Public Delete Access" ON birthdays
    FOR DELETE USING (true);

CREATE POLICY "Public Memories Insert" ON birthday_memories FOR ALL USING (true);
CREATE POLICY "Public Timeline Insert" ON birthday_timeline FOR ALL USING (true);
