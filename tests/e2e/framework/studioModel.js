/**
 * Studio Editor Behavioral Model & Simulator
 * Encapsulates state transitions, 4-pillar navigation, 3D Polaroid editing,
 * live preview synchronization, and URL serialization per PROJECT.md & ORIGINAL_REQUEST.md.
 */

export const DEFAULT_SAKURA_SETTINGS = {
  density: 55,
  speed: 40,
  wind: 45,
  petal_size: 50,
  blur: 35,
  animation_intensity: 60,
};

export const DEFAULT_ANIMATION_TOGGLES = {
  particles: true,
  parallax: true,
  floatingParticles: true,
  glow: true,
  depthBlur: true,
  mouseInteraction: true,
  touchInteraction: true,
  scrollAnimation: true,
  cinematicOpening: true,
};

export const INITIAL_BIRTHDAY_DATA = {
  id: 'bday-demo-1',
  slug: 'mai-2026',
  status: 'draft',
  privacy: 'unlisted',
  name: 'Trần Mai',
  age: '24',
  birthday: '14/09/2002',
  subtitle: 'Chúc Mừng Sinh Nhật',
  japaneseMessage: 'あなたの毎日が、桜のように美しくありますように。',
  englishMessage: 'May every day of your life be as radiant as cherry blossoms in spring.',
  message: 'Gửi Mai thân mến, cảm ơn cậu vì đã luôn đồng hành cùng tớ qua những mùa hoa nở.',
  closingWish: 'Chúc cậu một tuổi mới rạng rỡ, bình an và hạnh phúc như những cánh hoa anh đào.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  cover_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
  theme: 'sakura-night',
  show_timeline: true,
  show_memories: true,
  music_type: 'ambient',
  ambient_preset: 'zen-bell',
  youtube_url: '',
  youtube_video_id: '',
  music_title: 'Zen Temple Bell',
  music_duration: 300,
  music_start_time: 0,
  music_end_time: 180,
  music_volume: 75,
  music_loop: true,
  music_enabled: true,
  start_with_opening: false,
  sakura_settings: { ...DEFAULT_SAKURA_SETTINGS },
  animations: { ...DEFAULT_ANIMATION_TOGGLES },
  memories: [
    {
      id: 'mem-1',
      image_url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80',
      caption: 'Mùa hoa năm ấy bên hồ',
      year: '2023',
      location: 'Kyoto',
      note: 'Khoảnh khắc tớ nhận ra nụ cười của cậu còn rạng rỡ hơn cả hoa đào đầu mùa.'
    }
  ],
  timeline: [
    {
      id: 'time-1',
      year: '2022',
      title: 'Lần đầu gặp gỡ',
      description: 'Dưới gốc cây anh đào nơi giảng đường.'
    }
  ],
  created_at: '2026-09-14T00:00:00.000Z'
};

export const CATEGORY_PILLARS = [
  { id: 'profile', label: 'Thông tin cá nhân & Lời chúc', english: 'Profile & Greetings' },
  { id: 'letter', label: 'Thư viết tay', english: 'Handwritten Letter' },
  { id: 'memories', label: 'Album kỷ niệm 3D', english: '3D Memory Album' },
  { id: 'soundtrack', label: 'Nhạc nền & Hiệu ứng hoa đào', english: 'Soundtrack & Sakura' }
];

export class StudioEditorModel {
  constructor(initialData = null) {
    this.formData = JSON.parse(JSON.stringify(initialData || INITIAL_BIRTHDAY_DATA));
    this.activeCategory = 'profile';
    this.previewDevice = 'desktop'; // 'desktop' | 'mobile'
    this.mobileViewMode = 'edit';   // 'edit' | 'preview'
    this.viewportWidth = 1280;
    this.autoSaveStatus = 'saved';  // 'saved' | 'saving'
    this.history = [];
    this.previewSyncCount = 0;
    this.polaroidFlippedCards = new Set();
    this.maxMemoryCapacity = 20;
    this.previewState = {
      renderedName: this.formData.name,
      renderedTheme: this.formData.theme,
      renderedMemoriesCount: this.formData.memories.length,
      hasAudioAutoplay: false,
      cinematicOpeningActive: false,
      canvasContained: true
    };
  }

  setViewportWidth(width) {
    this.viewportWidth = width;
  }

  isDesktop() {
    return this.viewportWidth >= 1024;
  }

  // 4-Pillar Navigation
  setCategory(pillarId) {
    const valid = CATEGORY_PILLARS.some(p => p.id === pillarId);
    if (!valid) {
      throw new Error(`Invalid category pillar: "${pillarId}". Valid options are: ${CATEGORY_PILLARS.map(p => p.id).join(', ')}`);
    }
    this.activeCategory = pillarId;
  }

  // Form Field Updates
  updateField(field, value) {
    this.formData[field] = value;
    this.syncPreview();
    this.triggerAutosave();
  }

  updateSakuraSetting(key, value) {
    this.formData.sakura_settings[key] = value;
    this.syncPreview();
    this.triggerAutosave();
  }

  updateAnimationToggle(key, value) {
    this.formData.animations[key] = value;
    this.syncPreview();
    this.triggerAutosave();
  }

  // 3D Polaroid Card Operations
  flipPolaroidCard(memoryId) {
    if (this.polaroidFlippedCards.has(memoryId)) {
      this.polaroidFlippedCards.delete(memoryId);
      return false; // now front
    } else {
      this.polaroidFlippedCards.add(memoryId);
      return true; // now back
    }
  }

  isPolaroidFlipped(memoryId) {
    return this.polaroidFlippedCards.has(memoryId);
  }

  updateMemoryCard(id, updates) {
    const mem = this.formData.memories.find(m => m.id === id);
    if (!mem) throw new Error(`Memory card ${id} not found`);
    Object.assign(mem, updates);
    this.syncPreview();
    this.triggerAutosave();
  }

  addBlankMemoryCard() {
    if (this.formData.memories.length >= this.maxMemoryCapacity) {
      throw new Error(`Memory capacity limit reached (${this.maxMemoryCapacity} cards maximum)`);
    }
    const newCard = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      image_url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80',
      caption: 'Kỷ niệm mới',
      year: `${new Date().getFullYear()}`,
      location: 'Việt Nam',
      note: ''
    };
    this.formData.memories.push(newCard);
    this.syncPreview();
    this.triggerAutosave();
    return newCard;
  }

  batchUploadPhotos(photoUrls) {
    const availableSlot = this.maxMemoryCapacity - this.formData.memories.length;
    const toAdd = photoUrls.slice(0, availableSlot);
    const addedCards = toAdd.map((url, idx) => ({
      id: `mem-batch-${Date.now()}-${idx}`,
      image_url: url,
      caption: `Khoảnh khắc đẹp ${this.formData.memories.length + idx + 1}`,
      year: `${new Date().getFullYear()}`,
      location: 'Kỷ niệm',
      note: ''
    }));
    this.formData.memories.push(...addedCards);
    this.syncPreview();
    this.triggerAutosave();
    return {
      addedCount: addedCards.length,
      overflowCount: Math.max(0, photoUrls.length - availableSlot)
    };
  }

  deleteMemoryCard(id) {
    const initialLen = this.formData.memories.length;
    this.formData.memories = this.formData.memories.filter(m => m.id !== id);
    this.polaroidFlippedCards.delete(id);
    if (this.formData.memories.length !== initialLen) {
      this.syncPreview();
      this.triggerAutosave();
      return true;
    }
    return false;
  }

  // Device Switcher & Responsive
  setPreviewDevice(device) {
    if (device !== 'desktop' && device !== 'mobile') {
      throw new Error(`Invalid preview device: "${device}". Expected "desktop" | "mobile"`);
    }
    this.previewDevice = device;
  }

  setMobileViewMode(mode) {
    if (mode !== 'edit' && mode !== 'preview') {
      throw new Error(`Invalid mobile view mode: "${mode}". Expected "edit" | "preview"`);
    }
    this.mobileViewMode = mode;
  }

  // Live Preview Reflection
  syncPreview() {
    this.previewSyncCount++;
    this.previewState = {
      renderedName: this.formData.name,
      renderedTheme: this.formData.theme,
      renderedMemoriesCount: this.formData.memories.length,
      hasAudioAutoplay: false, // Contract: preview never autoplays audio
      cinematicOpeningActive: false, // Contract: preview suppresses opening blocker
      canvasContained: true // Contract: canvas particle isolation
    };
  }

  triggerAutosave() {
    this.autoSaveStatus = 'saving';
    if (typeof globalThis.window !== 'undefined' && globalThis.window.localStorage) {
      globalThis.window.localStorage.setItem(
        'sakura_autosave_draft',
        JSON.stringify({ data: this.formData, timestamp: Date.now() })
      );
    }
    this.autoSaveStatus = 'saved';
  }

  publish() {
    this.formData.status = 'published';
    this.formData.published_at = new Date().toISOString();
    if (typeof globalThis.window !== 'undefined' && globalThis.window.localStorage) {
      const existingStr = globalThis.window.localStorage.getItem('sakura_birthdays_v2');
      const list = existingStr ? JSON.parse(existingStr) : [];
      const idx = list.findIndex(b => b.id === this.formData.id);
      if (idx >= 0) list[idx] = this.formData;
      else list.push(this.formData);
      globalThis.window.localStorage.setItem('sakura_birthdays_v2', JSON.stringify(list));
    }
    return this.formData;
  }
}
