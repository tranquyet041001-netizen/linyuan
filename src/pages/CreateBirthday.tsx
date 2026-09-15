import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Eye, 
  Smartphone, 
  Monitor, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Sliders, 
  Palette, 
  RotateCcw, 
  Upload, 
  ArrowLeft, 
  ArrowRight,
  Music, 
  User, 
  Feather,
  CheckCircle2,
  Lock,
  GitCommit,
  Layers,
  Link as LinkIcon,
  Loader2,
  Camera,
  UploadCloud,
  Heart,
  Quote,
  Clock,
  MapPin,
  Calendar,
  Share2,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { processAndUploadImage } from '../utils/imageUpload';
import { BirthdayData, ThemeId, SakuraSettings, AnimationToggles, MemoryItem, TimelineItem, PrivacyType } from '../types/birthday';
import { THEMES } from '../data/themes';
import { DEMO_BIRTHDAY } from '../data/demoBirthday';
import { BirthdayPage } from './BirthdayPage';
import { 
  saveStoredBirthday, 
  getStoredBirthday, 
  saveAutoSaveDraft, 
  getAutoSaveDraft,
  clearAutoSaveDraft,
  getAllStoredBirthdays,
  generateUniqueSlug
} from '../utils/storage';
import { MusicEditor } from '../components/MusicEditor';
import { ShareModal } from '../components/ShareModal';
import { ErrorBoundary } from '../components/ErrorBoundary';

export type CategoryPillar = 'profile' | 'letter' | 'memories' | 'soundtrack';

interface CreateBirthdayProps {
  editBirthdayId?: string;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
];

const JAPANESE_QUOTE_PRESETS = [
  {
    jp: 'あなたの毎日が、桜のように美しくありますように。',
    en: 'May every day of your life be as radiant as cherry blossoms in spring.',
    label: 'Rạng rỡ như hoa đào (Radiant Sakura)',
  },
  {
    jp: '一期一会、あなたと出会えた奇跡に心から感謝を込めて。',
    en: 'Treasuring our encounter; deeply grateful for the miracle of meeting you.',
    label: 'Nhất kỳ nhất hội (Treasured Encounter)',
  },
  {
    jp: '満開の桜のように、あなたの笑顔がずっと輝きますように。',
    en: 'Like sakura in full bloom, may your smile forever illuminate our days.',
    label: 'Nụ cười nở rộ (Blooming Smile)',
  },
  {
    jp: '風に舞う花びらとともに、たくさんの幸せが訪れますように。',
    en: 'May boundless happiness drift to you like petals on a gentle breeze.',
    label: 'Hạnh phúc theo gió xuân (Spring Breeze)',
  },
  {
    jp: '歳月は流れても、私たちの絆は毎年新しく花開く。',
    en: 'Though seasons pass, our bond blossoms anew with every passing spring.',
    label: 'Tình bạn vĩnh cửu (Eternal Bond)',
  },
];

const CLOSING_WISH_PRESETS = [
  'Chúc cậu một tuổi mới rạng rỡ, bình an và hạnh phúc như những cánh hoa anh đào.',
  'Mong mọi ước nguyện tuổi mới của cậu đều sớm trở thành hiện thực tươi đẹp.',
  'Chúc bạn luôn an nhiên, vững vàng và rực rỡ trên mọi chặng đường phía trước.',
];

function ensureBirthdayDefaults(data: Partial<BirthdayData>): BirthdayData {
  return {
    ...DEMO_BIRTHDAY,
    ...data,
    name: data.name !== undefined ? data.name : DEMO_BIRTHDAY.name,
    age: (data.age !== undefined && data.age !== null && data.age !== '') ? data.age : (DEMO_BIRTHDAY.age ?? 25),
    birthday: data.birthday !== undefined ? data.birthday : DEMO_BIRTHDAY.birthday,
    subtitle: data.subtitle !== undefined ? data.subtitle : DEMO_BIRTHDAY.subtitle,
    japaneseMessage: data.japaneseMessage !== undefined ? data.japaneseMessage : DEMO_BIRTHDAY.japaneseMessage,
    englishMessage: data.englishMessage !== undefined ? data.englishMessage : DEMO_BIRTHDAY.englishMessage,
    message: data.message !== undefined ? data.message : DEMO_BIRTHDAY.message,
    closingWish: data.closingWish !== undefined ? data.closingWish : DEMO_BIRTHDAY.closingWish,
    avatar_url: data.avatar_url || DEMO_BIRTHDAY.avatar_url,
    cover_url: data.cover_url || DEMO_BIRTHDAY.cover_url,
    theme: data.theme || DEMO_BIRTHDAY.theme,
    show_timeline: data.show_timeline !== false,
    show_memories: data.show_memories !== false,
    music_type: data.music_type || DEMO_BIRTHDAY.music_type,
    ambient_preset: data.ambient_preset || 'zen-bell',
    youtube_url: data.youtube_url !== undefined ? data.youtube_url : DEMO_BIRTHDAY.youtube_url,
    youtube_video_id: data.youtube_video_id !== undefined ? data.youtube_video_id : DEMO_BIRTHDAY.youtube_video_id,
    music_title: data.music_title !== undefined ? data.music_title : DEMO_BIRTHDAY.music_title,
    music_duration: data.music_duration !== undefined ? data.music_duration : DEMO_BIRTHDAY.music_duration,
    music_start_time: data.music_start_time !== undefined ? data.music_start_time : DEMO_BIRTHDAY.music_start_time,
    music_end_time: data.music_end_time !== undefined ? data.music_end_time : DEMO_BIRTHDAY.music_end_time,
    music_volume: data.music_volume !== undefined ? data.music_volume : DEMO_BIRTHDAY.music_volume,
    music_loop: data.music_loop !== false,
    music_enabled: data.music_enabled !== false,
    start_with_opening: data.start_with_opening !== false,
    music_url: data.music_url || DEMO_BIRTHDAY.music_url,
    sakura_settings: {
      ...DEMO_BIRTHDAY.sakura_settings,
      ...(data.sakura_settings || {}),
    },
    animations: {
      ...DEMO_BIRTHDAY.animations,
      ...(data.animations || {}),
    },
    memories: (data.memories && data.memories.length > 0) ? data.memories : DEMO_BIRTHDAY.memories,
    timeline: (data.timeline && data.timeline.length > 0) ? data.timeline : DEMO_BIRTHDAY.timeline,
  };
}

export const CreateBirthday: React.FC<CreateBirthdayProps> = ({ editBirthdayId }) => {
  const [formData, setFormData] = useState<BirthdayData>(() => {
    if (editBirthdayId) {
      const existing = getStoredBirthday(editBirthdayId);
      if (existing) return ensureBirthdayDefaults(existing);
    }

    const hash = window.location.hash;
    if (hash.includes('/edit/')) {
      const id = hash.replace('#/edit/', '').split('?')[0];
      const existing = getStoredBirthday(id);
      if (existing) return ensureBirthdayDefaults(existing);
    }
    if (hash.includes('?id=')) {
      const id = hash.split('?id=')[1]?.split('&')[0];
      const existing = getStoredBirthday(id);
      if (existing) return ensureBirthdayDefaults(existing);
    }

    const draft = getAutoSaveDraft();
    if (draft && draft.data && draft.data.id !== 'demo-le-ngoc-han-2026') {
      return ensureBirthdayDefaults(draft.data);
    }

    const newId = `bday-${Date.now()}`;
    return ensureBirthdayDefaults({
      ...DEMO_BIRTHDAY,
      id: newId,
      slug: `birthday-${Math.random().toString(36).substring(2, 7)}`,
      status: 'draft',
      privacy: 'unlisted',
      show_timeline: true,
      show_memories: true,
      created_at: new Date().toISOString(),
    });
  });

  // 4-Pillar Category State ('profile' | 'letter' | 'memories' | 'soundtrack')
  const [activeCategory, setActiveCategory] = useState<CategoryPillar>('profile');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [mobileViewMode, setMobileViewMode] = useState<'edit' | 'preview'>('edit');
  const [showShareModal, setShowShareModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [previewZoom, setPreviewZoom] = useState<1 | 0.85 | 0.75>(1);

  // Per-card 3D Polaroid flip state tracking
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});

  // Uploading state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingMemories, setUploadingMemories] = useState<Record<string, boolean>>({});
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [editingAvatarUrl, setEditingAvatarUrl] = useState(false);
  const [memoryUrlInputId, setMemoryUrlInputId] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    let targetId = editBirthdayId;
    if (!targetId && hash.includes('/edit/')) {
      targetId = hash.replace('#/edit/', '').split('?')[0];
    }
    if (!targetId && hash.includes('?id=')) {
      targetId = hash.split('?id=')[1]?.split('&')[0];
    }

    if (targetId) {
      const existing = getStoredBirthday(targetId);
      if (existing) {
        setFormData(ensureBirthdayDefaults(existing));
      }
    }
  }, [editBirthdayId]);

  useEffect(() => {
    setAutoSaveStatus('saving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(() => {
      saveAutoSaveDraft(formData);
      setAutoSaveStatus('saved');
    }, 600);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNameChange = (newName: string) => {
    let newSlug = formData.slug;
    if (!formData.slug || formData.slug === 'le-ngoc-han-2026' || formData.slug.startsWith('birthday-')) {
      const all = getAllStoredBirthdays();
      newSlug = generateUniqueSlug(newName, formData.id, all);
    }
    setFormData({
      ...formData,
      name: newName,
      slug: newSlug,
    });
  };

  // Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const url = await processAndUploadImage(file, { maxWidth: 480, maxHeight: 480, quality: 0.78 });
      setFormData((prev) => ({ ...prev, avatar_url: url }));
      showToast('✓ Profile photo uploaded successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to upload profile photo');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // Memory Single Image Upload Handler
  const handleMemoryImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingMemories((prev) => ({ ...prev, [id]: true }));
      const url = await processAndUploadImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
      handleUpdateMemory(id, { image_url: url });
      showToast('✓ Memory photo updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to upload memory photo');
    } finally {
      setUploadingMemories((prev) => ({ ...prev, [id]: false }));
      e.target.value = '';
    }
  };

  // Batch Upload Multiple Memories Photos
  const handleBatchAddMemories = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxPhotos = 20;
    const availableSlots = maxPhotos - formData.memories.length;

    if (availableSlots <= 0) {
      alert(`You have reached the maximum limit of ${maxPhotos} memory photos.`);
      e.target.value = '';
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    setIsBatchUploading(true);

    try {
      const newItems: MemoryItem[] = [];
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const url = await processAndUploadImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
        const nameClean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
        newItems.push({
          id: `mem-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          image_url: url,
          caption: nameClean || 'A cherished memory',
          year: `${new Date().getFullYear()}`,
          location: '',
          note: '',
        });
      }

      setFormData((prev) => ({
        ...prev,
        memories: [...prev.memories, ...newItems],
      }));
      showToast(`✓ Added ${newItems.length} memory photos successfully!`);
    } catch (err: any) {
      alert(err.message || 'Failed to upload memory photos');
    } finally {
      setIsBatchUploading(false);
      e.target.value = '';
    }
  };

  // Memories handlers
  const handleAddMemory = () => {
    if (formData.memories.length >= 20) {
      alert('You can add up to 20 memory photos.');
      return;
    }
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      image_url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80',
      caption: 'Kỷ niệm mới',
      year: `${new Date().getFullYear()}`,
      location: 'Việt Nam',
      note: '',
    };
    setFormData((prev) => ({ ...prev, memories: [...prev.memories, newMem] }));
    showToast('✓ Added new memory card!');
  };

  const handleClearDemoMemories = () => {
    setFormData((prev) => ({ ...prev, memories: [] }));
    setFlippedCardIds({});
    showToast('✓ Cleared demo photos to add your own!');
  };

  const handleRemoveMemory = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
    setFlippedCardIds((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleUpdateMemory = (id: string, updates: Partial<MemoryItem>) => {
    setFormData((prev) => ({
      ...prev,
      memories: prev.memories.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  };

  const handleToggleFlipCard = (id: string) => {
    setFlippedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Timeline handlers
  const handleAddTimeline = () => {
    const newTimeline: TimelineItem = {
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      year: `${new Date().getFullYear()}`,
      title: 'Cột mốc đáng nhớ',
      description: 'Một khoảnh khắc ý nghĩa trên hành trình cuộc đời...',
    };
    setFormData((prev) => ({
      ...prev,
      timeline: [...(prev.timeline || []), newTimeline],
    }));
  };

  const handleRemoveTimeline = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      timeline: (prev.timeline || []).filter((t) => t.id !== id),
    }));
  };

  const handleUpdateTimeline = (id: string, updates: Partial<TimelineItem>) => {
    setFormData((prev) => ({
      ...prev,
      timeline: (prev.timeline || []).map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const handleSaveDraft = () => {
    if (!formData.name.trim()) {
      alert('Please enter a recipient name.');
      return;
    }
    const saved = saveStoredBirthday({ ...formData, status: 'draft' }, false);
    setFormData(saved);
    saveAutoSaveDraft(saved);
    if (!window.location.hash.includes(saved.id)) {
      window.history.replaceState(null, '', `#/edit/${saved.id}`);
    }
    showToast('✓ Draft saved successfully!');
  };

  const handleRefreshPreview = () => {
    setPreviewKey((prev) => prev + 1);
    showToast('🌸 Đã làm mới hiệu ứng xem trước');
  };

  const handleOpenInNewTab = () => {
    const slug = formData.slug || 'preview';
    const previewUrl = `#/birthday/${slug}?preview=true`;
    window.open(previewUrl, '_blank');
  };

  const handlePublishBirthday = () => {
    if (!formData.name.trim()) {
      alert('Please enter a recipient name.');
      return;
    }

    const saved = saveStoredBirthday(formData, true);
    setFormData(saved);
    saveAutoSaveDraft(saved);
    if (!window.location.hash.includes(saved.id)) {
      window.history.replaceState(null, '', `#/edit/${saved.id}`);
    }
    setShowShareModal(true);
  };

  return (
    <div className="min-h-screen bg-[#080c18] text-zinc-100 flex flex-col font-sans">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900/95 border border-pink-500/40 text-pink-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Studio Navbar (h-16 / 64px) — Frosted Glassmorphism with Kintsugi & Hanko Accents */}
      <header className="h-16 border-b border-white/10 bg-[#0d1326]/85 backdrop-blur-2xl px-4 sm:px-6 flex items-center justify-between z-40 sticky top-0 shadow-lg shadow-black/30">
        <div className="flex items-center gap-3">
          <a
            href="#/my-birthdays"
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-sakura-gold border border-white/10 hover:border-sakura-gold/40 transition-all"
            title="Danh sách thiệp"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-2.5">
            <div className="hanko-stamp px-1.5 py-0.5 text-[10px] select-none shadow-sm">
              <span>祝</span>
            </div>
            <div>
              <span className="font-japanese font-bold text-xs sm:text-sm text-pink-200 block leading-tight tracking-wide">
                {formData.name ? `${formData.name} • 誕生日の祝` : 'Sakura Cyber-Zen Studio'}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
                <span>/{formData.slug}</span>
                <span className="text-zinc-600">•</span>
                <span className={formData.status === 'published' ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                  {formData.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Auto-save Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/5">
            {autoSaveStatus === 'saving' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-300">Đang lưu...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-zinc-300">Đã lưu tự động</span>
              </>
            )}
          </div>

          {/* Mobile Edit / Preview Switcher (<1024px) */}
          <div className="flex lg:hidden items-center bg-black/40 border border-white/10 rounded-xl p-0.5 shadow-inner">
            <button
              onClick={() => setMobileViewMode('edit')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mobileViewMode === 'edit'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Chỉnh sửa
            </button>
            <button
              onClick={() => setMobileViewMode('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                mobileViewMode === 'preview'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước</span>
            </button>
          </div>

          {/* Desktop Device Mockup Switcher (>=1024px) */}
          <div className="hidden lg:flex items-center bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                previewDevice === 'desktop' ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Chế độ Máy tính (Desktop View)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                previewDevice === 'mobile' ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Chế độ Điện thoại (Mobile Frame)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSaveDraft}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 text-xs font-semibold border border-white/10 hover:border-sakura-gold/40 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5 text-sakura-gold" />
            <span className="hidden sm:inline">Lưu bản nháp</span>
          </button>

          <button
            onClick={handlePublishBirthday}
            className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-pink-500/30 flex items-center gap-2 border border-pink-400/30 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Xuất bản thiệp</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body (Split Editor & Live Preview) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Customization Controls & 4-Pillar Tabs */}
        <div className={`w-full lg:w-[480px] xl:w-[520px] bg-[#0d1326] border-r border-zinc-800 flex flex-col h-[calc(100vh-64px)] overflow-hidden ${
          mobileViewMode === 'preview' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* 4-Pillar Category Navigation: Pinned at top with Animated Motion Indicators */}
          <div className="sticky top-0 z-30 flex-shrink-0 bg-[#0a0f1d]/95 backdrop-blur-2xl border-b border-white/10 p-2 sm:p-2.5 shadow-lg shadow-black/40">
            <nav className="grid grid-cols-4 gap-1 sm:gap-1.5 relative" aria-label="Studio Category Navigation">
              {[
                { id: 'profile', label: 'Thông tin cá nhân & Lời chúc', shortLabel: 'Thông tin', kanji: '基本', english: 'Profile & Greetings', icon: User },
                { id: 'letter', label: 'Thư viết tay', shortLabel: 'Thư tay', kanji: '手紙', english: 'Handwritten Letter', icon: Feather },
                { id: 'memories', label: 'Album kỷ niệm 3D', shortLabel: 'Kỷ niệm', kanji: '記憶', english: '3D Memory Album', icon: ImageIcon, badge: formData.memories?.length },
                { id: 'soundtrack', label: 'Nhạc nền & Hiệu ứng hoa đào', shortLabel: 'Nhạc & Hoa', kanji: '音桜', english: 'Soundtrack & Sakura', icon: Sparkles },
              ].map((pillar) => {
                const Icon = pillar.icon;
                const isActive = activeCategory === pillar.id;

                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setActiveCategory(pillar.id as CategoryPillar)}
                    className={`relative py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 group ${
                      isActive ? 'text-pink-200 font-semibold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Framer Motion Active Indicator Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="activePillarTab"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-sakura-gold/20 border border-pink-500/50 shadow-[0_0_15px_rgba(244,63,119,0.25)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Active Underline Gold Accent (Kintsugi hairline) */}
                    {isActive && (
                      <motion.div
                        layoutId="activePillarUnderline"
                        className="absolute -bottom-1 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#dfb76c] to-transparent"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-center">
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isActive ? 'text-pink-300 scale-110' : 'group-hover:scale-105 text-zinc-400'}`} />
                      {pillar.badge !== undefined && pillar.badge > 0 && (
                        <span className="absolute -top-1.5 -right-3 px-1 rounded-full bg-pink-600 text-[9px] text-white font-mono leading-tight shadow-sm">
                          {pillar.badge}
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <span className="text-[10px] sm:text-[11px] leading-tight truncate max-w-full font-medium">
                        {pillar.shortLabel}
                      </span>
                      <span className="text-[8px] text-zinc-500 font-japanese hidden sm:block">
                        {pillar.kanji}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Scrollable Form Content Container (Only this scrolls) */}
          <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* ========================================================================= */}
          {/* CATEGORY 1: Profile & Greetings ('profile' / 'info')                      */}
          {/* ========================================================================= */}
          {activeCategory === 'profile' && (
            <div className="p-5 space-y-6 text-xs animate-in fade-in duration-200">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Recipient Profile & Details</span>
                </h3>

                <div>
                  <label className="text-zinc-400 block mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 transition-colors"
                    placeholder="e.g. Trần Mai / Sarah Jenkins"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Custom Link Slug (/birthday/your-slug)</label>
                  <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 font-mono text-xs">
                    <span className="text-pink-400 mr-1 font-bold">/birthday/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      className="flex-1 bg-transparent text-white focus:outline-none"
                      placeholder="custom-link-name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Age (Optional)</label>
                    <input
                      type="text"
                      value={formData.age ?? ''}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 transition-colors"
                      placeholder="e.g. 24"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Birthday Date</label>
                    <input
                      type="text"
                      value={formData.birthday ?? ''}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 transition-colors"
                      placeholder="e.g. 14/09/2002"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Subtitle / Greeting Tag</label>
                  <input
                    type="text"
                    value={formData.subtitle ?? ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 transition-colors"
                    placeholder="e.g. Chúc Mừng Sinh Nhật / Happy Birthday"
                  />
                </div>

                {/* Profile Avatar Upload & Presets */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-400 block text-xs font-medium">Profile Avatar</label>
                    <button
                      type="button"
                      onClick={() => setEditingAvatarUrl(!editingAvatarUrl)}
                      className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{editingAvatarUrl ? 'Hide URL' : 'Paste URL'}</span>
                    </button>
                  </div>

                  {editingAvatarUrl && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 animate-in fade-in">
                      <input
                        type="url"
                        value={formData.avatar_url}
                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                        className="flex-1 bg-transparent px-2 py-1 text-zinc-100 text-xs focus:outline-none"
                        placeholder="https://images.unsplash.com/..."
                      />
                      <button
                        type="button"
                        onClick={() => setEditingAvatarUrl(false)}
                        className="px-2.5 py-1 rounded-lg bg-pink-600 text-white text-xs font-medium"
                      >
                        Done
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-pink-400/60 shadow-lg bg-zinc-800 flex-shrink-0 group">
                      <img
                        src={formData.avatar_url}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-pink-300">
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <Camera className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingAvatar}
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </label>
                    </div>

                    <label className={`flex-1 cursor-pointer py-2.5 px-4 rounded-xl border text-center text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      uploadingAvatar 
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed' 
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 hover:border-pink-500/50 text-zinc-200 shadow-md'
                    }`}>
                      {uploadingAvatar ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                          <span>Processing & uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-pink-400" />
                          <span>Upload Avatar Photo</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingAvatar}
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-zinc-500">Presets:</span>
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar_url: url })}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                          formData.avatar_url === url ? 'border-pink-500 scale-110 shadow-sm shadow-pink-500/50' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy Radio Settings */}
                <div className="space-y-3 pt-4 border-t border-zinc-800">
                  <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>Privacy Settings</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        formData.privacy === 'unlisted'
                          ? 'border-pink-500 bg-pink-950/40 text-pink-200 ring-2 ring-pink-500/20'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="privacy"
                        checked={formData.privacy === 'unlisted'}
                        onChange={() => setFormData({ ...formData, privacy: 'unlisted' })}
                        className="accent-pink-500 w-4 h-4"
                      />
                      <div>
                        <span className="font-semibold text-xs block text-zinc-100">Unlisted (Riêng tư)</span>
                        <span className="text-[10px] text-zinc-400">Only accessible via direct link</span>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        formData.privacy === 'public'
                          ? 'border-pink-500 bg-pink-950/40 text-pink-200 ring-2 ring-pink-500/20'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="privacy"
                        checked={formData.privacy === 'public'}
                        onChange={() => setFormData({ ...formData, privacy: 'public' })}
                        className="accent-pink-500 w-4 h-4"
                      />
                      <div>
                        <span className="font-semibold text-xs block text-zinc-100">Public (Công khai)</span>
                        <span className="text-[10px] text-zinc-400">Discoverable on gallery</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Navigation to Next Pillar */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setActiveCategory('letter')}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-pink-600/25 active:scale-95"
                >
                  <span>Next: Handwritten Letter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CATEGORY 2: Handwritten Letter & Quotes ('letter')                        */}
          {/* ========================================================================= */}
          {activeCategory === 'letter' && (
            <div className="p-5 space-y-6 text-xs animate-in fade-in duration-200">
              {/* Japanese Quote Presets & Header Quote */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Feather className="w-4 h-4" />
                    <span>Japanese Quote Presets & Translation</span>
                  </h3>
                  <span className="text-[10px] text-pink-400 font-japanese">日本の名言</span>
                </div>

                {/* Preset Chips */}
                <div className="space-y-2">
                  <span className="text-[11px] text-zinc-400 block font-medium">Quick Quote Presets:</span>
                  <div className="flex flex-col gap-2">
                    {JAPANESE_QUOTE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          japaneseMessage: preset.jp,
                          englishMessage: preset.en,
                        })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          formData.japaneseMessage === preset.jp
                            ? 'bg-pink-950/40 border-pink-500 text-pink-200 ring-1 ring-pink-500/30'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-xs font-japanese font-semibold block text-pink-300 mb-0.5">
                          {preset.jp}
                        </span>
                        <span className="text-[10px] font-serif italic text-zinc-400 block">
                          {preset.en}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Japanese Header Quote (Kanji/Kana)</label>
                  <input
                    type="text"
                    value={formData.japaneseMessage}
                    onChange={(e) => setFormData({ ...formData, japaneseMessage: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 font-japanese text-sm"
                    placeholder="あなたの毎日が、桜のように美しくありますように。"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">English Subtitle Translation</label>
                  <input
                    type="text"
                    value={formData.englishMessage}
                    onChange={(e) => setFormData({ ...formData, englishMessage: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 font-serif text-xs"
                    placeholder="May every day of your life be as radiant as cherry blossoms in spring."
                  />
                </div>
              </div>

              {/* Handwritten Letter Message */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Quote className="w-4 h-4" />
                    <span>Handwritten Birthday Letter</span>
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {formData.message.length} chars
                  </span>
                </div>

                <textarea
                  rows={10}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-zinc-100 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-pink-500 font-serif resize-y min-h-[220px]"
                  placeholder="Viết bức thư tay chân thành và sâu lắng gửi tặng người ấy..."
                />
              </div>

              {/* Washi Paper Card Preview */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] text-zinc-400 font-medium block">
                  Washi Paper Card Preview (Hiển thị thẻ giấy Washi):
                </span>
                <div className="washi-card-dark p-5 rounded-2xl border border-[#dfb76c]/40 relative overflow-hidden shadow-xl">
                  {/* Kintsugi Gold Hairline Seam */}
                  <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#dfb76c] to-transparent mb-3" />
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-japanese text-pink-300 tracking-wider">
                      心からの手紙 • Washi Letter
                    </span>
                    <span className="hanko-stamp px-2 py-0.5 text-[9px] font-japanese">
                      落款
                    </span>
                  </div>

                  <p className="font-serif italic text-xs leading-relaxed text-zinc-200 line-clamp-4 whitespace-pre-wrap">
                    {formData.message || 'Nội dung bức thư của bạn sẽ xuất hiện trang nhã tại đây...'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 font-serif">
                    <span>{formData.name ? `Gửi ${formData.name}` : 'Thân gửi'}</span>
                    <span className="font-japanese text-pink-400">祝・誕生日</span>
                  </div>
                </div>
              </div>

              {/* Closing Wish */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Closing Wish (Lời chúc kết thúc)</span>
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {CLOSING_WISH_PRESETS.map((wish, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, closingWish: wish })}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 text-[10px] text-zinc-300 hover:text-white hover:border-pink-500/60 transition-colors"
                    >
                      {wish.slice(0, 32)}...
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={formData.closingWish}
                  onChange={(e) => setFormData({ ...formData, closingWish: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 font-serif text-xs"
                  placeholder="Chúc cậu một tuổi mới rạng rỡ, bình an và hạnh phúc như những cánh hoa anh đào."
                />
              </div>

              {/* Navigation Between Pillars */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveCategory('profile')}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700 active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back: Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('memories')}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-pink-600/20 active:scale-95"
                >
                  <span>Next: 3D Memory Album</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CATEGORY 3: 3D Memory Album & Milestones ('memories')                     */}
          {/* ========================================================================= */}
          {activeCategory === 'memories' && (
            <div className="p-5 space-y-6 text-xs animate-in fade-in duration-200">
              {/* Polaroid Memory Gallery Visibility Toggle */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">
                    Polaroid Memory Scrapbook Gallery
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Enable or disable the interactive 3D photo memory album
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.show_memories !== false}
                  onChange={(e) => setFormData({ ...formData, show_memories: e.target.checked })}
                  className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
                />
              </div>

              {formData.show_memories !== false && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" />
                        <span>3D Polaroid Cards ({formData.memories.length}/20)</span>
                      </h3>
                      <p className="text-zinc-400 text-[11px]">
                        Front: Photo & Caption • Back: Hanko Seal & Secret Note
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Clear Demo Photos */}
                      {formData.memories.length > 0 && 
                        formData.memories.some((m) => ['mem-1', 'mem-2', 'mem-3', 'mem-4', 'mem-5', 'mem-6'].includes(m.id)) && (
                        <button
                          type="button"
                          onClick={handleClearDemoMemories}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors border border-zinc-700"
                          title="Clear all demo photos to add your own"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Clear Demo</span>
                        </button>
                      )}

                      {/* Batch Upload Photos */}
                      <label className={`px-3 py-1.5 rounded-xl text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        formData.memories.length >= 20 || isBatchUploading
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                          : 'bg-pink-600 hover:bg-pink-700 shadow-md'
                      }`}>
                        {isBatchUploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>{isBatchUploading ? 'Uploading...' : 'Batch Upload'}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={formData.memories.length >= 20 || isBatchUploading}
                          className="hidden"
                          onChange={handleBatchAddMemories}
                        />
                      </label>

                      {/* Add Blank Card */}
                      <button
                        type="button"
                        onClick={handleAddMemory}
                        disabled={formData.memories.length >= 20}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-xs font-medium flex items-center gap-1 transition-colors border border-zinc-700"
                        title="Add blank card"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Blank Card</span>
                      </button>
                    </div>
                  </div>

                  {/* Polaroid Card List with 3D Flip Editor */}
                  <div className="space-y-5">
                    {formData.memories.map((mem, index) => {
                      const isFlipped = !!flippedCardIds[mem.id];
                      const isUploading = uploadingMemories[mem.id] || false;
                      const isEnteringUrl = memoryUrlInputId === mem.id;

                      return (
                        <div
                          key={mem.id}
                          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-lg"
                        >
                          {/* Card Header with 3D Flip Button and Delete */}
                          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-pink-400 bg-pink-950/60 px-2 py-0.5 rounded-md border border-pink-500/30">
                                #{index + 1}
                              </span>
                              <span className="text-xs font-medium text-zinc-300">
                                {isFlipped ? 'Mặt sau (Secret Note)' : 'Mặt trước (Photo)'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* 3D Flip Toggle Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleFlipCard(mem.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                                  isFlipped
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-pink-300 border border-zinc-700'
                                }`}
                                title="3D Flip Card"
                              >
                                <RotateCcw className={`w-3.5 h-3.5 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
                                <span>{isFlipped ? 'Lật về ảnh' : 'Lật mặt sau (Thư)'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveMemory(mem.id)}
                                className="text-zinc-500 hover:text-rose-400 p-1 transition-colors rounded-lg hover:bg-zinc-800"
                                title="Xóa thẻ này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* 3D Flip Face Container */}
                          <div
                            className="relative transition-all duration-500"
                            style={{ perspective: 1000 }}
                          >
                            {!isFlipped ? (
                              /* FRONT FACE: Photo, Caption, Year, Location */
                              <div className="space-y-3 animate-in fade-in duration-200">
                                <div className="flex items-start gap-3">
                                  {/* Photo with Camera Upload */}
                                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 relative group border border-zinc-700 shadow-inner">
                                    <img src={mem.image_url} alt="Memory" className="w-full h-full object-cover" />
                                    {isUploading && (
                                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-pink-300">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                      </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-medium gap-1">
                                      <Camera className="w-4 h-4" />
                                      <span>Change</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        disabled={isUploading}
                                        className="hidden"
                                        onChange={(e) => handleMemoryImageUpload(mem.id, e)}
                                      />
                                    </label>
                                  </div>

                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <label className="cursor-pointer text-[10px] text-pink-400 hover:text-pink-300 flex items-center gap-1 font-medium">
                                        <Upload className="w-3 h-3" />
                                        <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          disabled={isUploading}
                                          className="hidden"
                                          onChange={(e) => handleMemoryImageUpload(mem.id, e)}
                                        />
                                      </label>
                                      <span className="text-zinc-700">•</span>
                                      <button
                                        type="button"
                                        onClick={() => setMemoryUrlInputId(isEnteringUrl ? null : mem.id)}
                                        className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                                      >
                                        <LinkIcon className="w-3 h-3" />
                                        <span>{isEnteringUrl ? 'Hide URL' : 'Paste URL'}</span>
                                      </button>
                                    </div>

                                    {isEnteringUrl && (
                                      <div className="flex items-center gap-1.5 animate-in fade-in">
                                        <input
                                          type="url"
                                          value={mem.image_url}
                                          onChange={(e) => handleUpdateMemory(mem.id, { image_url: e.target.value })}
                                          placeholder="https://..."
                                          className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-100 text-[11px] focus:outline-none focus:border-pink-500 font-mono"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setMemoryUrlInputId(null)}
                                          className="px-2 py-1 rounded-lg bg-pink-600 text-white text-[10px] font-medium"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    )}

                                    <input
                                      type="text"
                                      value={mem.caption}
                                      onChange={(e) => handleUpdateMemory(mem.id, { caption: e.target.value })}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-pink-500 font-serif"
                                      placeholder="Chú thích ảnh (caption)..."
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1">
                                    <Calendar className="w-3 h-3 text-pink-400 mr-1.5" />
                                    <input
                                      type="text"
                                      value={mem.year || ''}
                                      onChange={(e) => handleUpdateMemory(mem.id, { year: e.target.value })}
                                      className="w-full bg-transparent text-zinc-100 text-[11px] focus:outline-none"
                                      placeholder="Năm (e.g. 2024)"
                                    />
                                  </div>

                                  <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1">
                                    <MapPin className="w-3 h-3 text-rose-400 mr-1.5" />
                                    <input
                                      type="text"
                                      value={mem.location || ''}
                                      onChange={(e) => handleUpdateMemory(mem.id, { location: e.target.value })}
                                      className="w-full bg-transparent text-zinc-100 text-[11px] focus:outline-none"
                                      placeholder="Địa điểm (e.g. Kyoto)"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* BACK FACE: Hanko Seal Stamp & Secret Note (mem.note) */
                              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-[#1c1824] via-[#161420] to-[#100e18] border border-amber-500/30 text-zinc-200 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-serif font-semibold">
                                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                                    <span>Secret Note Behind Polaroid</span>
                                  </div>
                                  <span className="hanko-stamp px-2 py-0.5 text-[9px] text-red-500 border-red-600 bg-red-950/30">
                                    記憶・落款
                                  </span>
                                </div>

                                <textarea
                                  rows={4}
                                  value={mem.note || ''}
                                  onChange={(e) => handleUpdateMemory(mem.id, { note: e.target.value })}
                                  className="w-full bg-black/40 border border-amber-500/30 rounded-xl p-3 text-amber-100/90 text-xs leading-relaxed focus:outline-none focus:border-amber-400 font-serif italic resize-y"
                                  placeholder="Viết lời nhắn bí mật ở mặt sau thẻ ảnh này... Người nhận có thể lật thẻ Polaroid trên thiệp để khám phá."
                                />

                                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                                  <span>{mem.year ? `Kỷ niệm năm ${mem.year}` : 'Mãi mãi trân quý'}</span>
                                  <span>{(mem.note || '').length} ký tự</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Milestones Timeline Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-purple-500/30 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-purple-300 block">
                      Memorable Milestones Timeline (Dòng thời gian)
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Enable or disable the milestone timeline section
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.show_timeline !== false}
                    onChange={(e) => setFormData({ ...formData, show_timeline: e.target.checked })}
                    className="w-5 h-5 rounded accent-purple-500 cursor-pointer"
                  />
                </div>

                {formData.show_timeline !== false && (
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                          <GitCommit className="w-4 h-4" />
                          <span>Milestones ({formData.timeline?.length || 0})</span>
                        </h3>
                        <p className="text-zinc-400 text-[11px]">
                          Add key life moments and cherished years
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTimeline}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Milestone</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(formData.timeline || []).map((t, idx) => (
                        <div
                          key={t.id || idx}
                          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={t.year}
                              onChange={(e) => handleUpdateTimeline(t.id, { year: e.target.value })}
                              className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-pink-300 font-mono font-bold"
                              placeholder="Year (2024)"
                            />
                            <input
                              type="text"
                              value={t.title}
                              onChange={(e) => handleUpdateTimeline(t.id, { title: e.target.value })}
                              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-100 font-semibold"
                              placeholder="Tiêu đề cột mốc..."
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveTimeline(t.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                              title="Delete Milestone"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={t.description}
                            onChange={(e) => handleUpdateTimeline(t.id, { description: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 leading-relaxed focus:outline-none focus:border-pink-500"
                            placeholder="Mô tả ngắn về cột mốc đáng nhớ này..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Between Pillars */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveCategory('letter')}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700 active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back: Letter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('soundtrack')}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-pink-600/20 active:scale-95"
                >
                  <span>Next: Soundtrack & Sakura</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CATEGORY 4: Soundtrack & Sakura Effects ('soundtrack' / 'effects')         */}
          {/* ========================================================================= */}
          {activeCategory === 'soundtrack' && (
            <div className="p-5 space-y-6 text-xs animate-in fade-in duration-200">
              {/* Japanese Cyber-Zen Theme Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4" />
                    <span>Japanese Cyber-Zen Themes</span>
                  </h3>
                  <span className="text-[10px] font-japanese text-pink-400">テーマ選択</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                    const t = THEMES[themeKey];
                    const isSelected = formData.theme === themeKey;

                    return (
                      <div
                        key={themeKey}
                        onClick={() => setFormData({ ...formData, theme: themeKey })}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all relative overflow-hidden ${
                          isSelected
                            ? 'border-pink-500 ring-2 ring-pink-500/30 bg-pink-950/30 shadow-lg'
                            : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-japanese font-bold text-sm text-zinc-100">
                            {t.japaneseName}
                          </span>
                          <span className="text-[11px] font-sans text-pink-300">
                            {t.name}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                          {t.description}
                        </p>

                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: t.sakuraPrimary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: t.sakuraSecondary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: t.accentColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MusicEditor Integration */}
              <div className="pt-4 border-t border-zinc-800">
                <ErrorBoundary fallbackTitle="Không thể nạp trình chỉnh sửa nhạc (Music Editor)">
                  <MusicEditor
                    data={formData}
                    onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
                  />
                </ErrorBoundary>
              </div>

              {/* Sakura Petal Physics Controls */}
              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    <span>Sakura Petal Physics Engine</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        sakura_settings: {
                          density: 55,
                          speed: 40,
                          wind: 45,
                          petal_size: 50,
                          blur: 35,
                          animation_intensity: 60,
                        },
                      })
                    }
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Sakura Density (Mật độ hoa)</span>
                      <span className="font-mono">{formData.sakura_settings.density}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formData.sakura_settings.density}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sakura_settings: {
                            ...formData.sakura_settings,
                            density: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Falling Speed (Tốc độ rơi)</span>
                      <span className="font-mono">{formData.sakura_settings.speed}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formData.sakura_settings.speed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sakura_settings: {
                            ...formData.sakura_settings,
                            speed: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Wind Drift (Gió thổi ngang)</span>
                      <span className="font-mono">{formData.sakura_settings.wind}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.sakura_settings.wind}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sakura_settings: {
                            ...formData.sakura_settings,
                            wind: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Petal Size (Kích thước cánh)</span>
                      <span className="font-mono">{formData.sakura_settings.petal_size}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={formData.sakura_settings.petal_size}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sakura_settings: {
                            ...formData.sakura_settings,
                            petal_size: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* Atmosphere & Visual Effects Checkboxes */}
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <h4 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Atmosphere & Visual Effects</span>
                </h4>

                <div className="grid grid-cols-2 gap-2 text-zinc-300">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700">
                    <input
                      type="checkbox"
                      checked={formData.animations.particles}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          animations: { ...formData.animations, particles: e.target.checked },
                        })
                      }
                      className="rounded accent-pink-500"
                    />
                    <span>Sakura Petals</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700">
                    <input
                      type="checkbox"
                      checked={formData.animations.cinematicOpening}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          animations: { ...formData.animations, cinematicOpening: e.target.checked },
                        })
                      }
                      className="rounded accent-pink-500"
                    />
                    <span>Cinematic Intro</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700">
                    <input
                      type="checkbox"
                      checked={formData.animations.mouseInteraction}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          animations: { ...formData.animations, mouseInteraction: e.target.checked },
                        })
                      }
                      className="rounded accent-pink-500"
                    />
                    <span>Mouse Wind Drift</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700">
                    <input
                      type="checkbox"
                      checked={formData.animations.glow}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          animations: { ...formData.animations, glow: e.target.checked },
                        })
                      }
                      className="rounded accent-pink-500"
                    />
                    <span>Atmosphere Glow</span>
                  </label>
                </div>
              </div>

              {/* Navigation & Publish Action */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveCategory('memories')}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700 active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back: 3D Memories</span>
                </button>
                <button
                  type="button"
                  onClick={handlePublishBirthday}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-pink-500/25 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish Birthday</span>
                </button>
              </div>
            </div>
          )}

          {/* End of Scrollable Form Content */}
          </div>
        </div>

        {/* Right Side: Real-time Live Interactive Preview */}
        <div className={`flex-1 bg-[#050811] flex flex-col overflow-hidden relative h-[calc(100vh-64px)] ${
          mobileViewMode === 'edit' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* 1. Preview Utility Toolbar */}
          <div className="h-12 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl px-4 flex items-center justify-between z-20 flex-shrink-0 select-none">
            {/* Left: Device Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-0.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    previewDevice === 'mobile'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                  title="Mobile Device Frame"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">📱 Mobile Frame</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    previewDevice === 'desktop'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                  title="Desktop Full View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">🖥️ Desktop Full View</span>
                </button>
              </div>

              {/* Live sync badge */}
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Sync • 60fps</span>
              </div>
            </div>

            {/* Right: Actions & Zoom Scaler */}
            <div className="flex items-center gap-2">
              {/* Zoom Scaler */}
              <div className="hidden sm:flex items-center bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-0.5 shadow-inner text-xs">
                {([1, 0.85, 0.75] as const).map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setPreviewZoom(scale)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all ${
                      previewZoom === scale
                        ? 'bg-zinc-800 text-pink-300 font-bold border border-pink-500/30 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {Math.round(scale * 100)}%
                  </button>
                ))}
              </div>

              {/* Refresh / Replay button */}
              <button
                type="button"
                onClick={handleRefreshPreview}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-pink-300 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                title="Làm mới hiệu ứng và phát lại animation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Làm mới</span>
              </button>

              {/* Open in new tab */}
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-pink-300 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                title="Mở bản nháp trong tab mới"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Mở tab mới</span>
              </button>
            </div>
          </div>

          {/* 2. Preview Frame Container */}
          <div className="flex-1 w-full p-2 sm:p-6 flex items-center justify-center overflow-hidden relative">
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-200"
              style={{
                transform: previewZoom !== 1 ? `scale(${previewZoom})` : undefined,
                transformOrigin: 'center center',
              }}
            >
              {previewDevice === 'mobile' || mobileViewMode === 'preview' ? (
                /* Smartphone Device Frame Mockup */
                <div className="w-full max-w-[420px] h-full lg:h-[780px] max-h-[calc(100vh-140px)] rounded-[48px] border-[10px] sm:border-[12px] border-zinc-800/95 ring-1 ring-zinc-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(236,72,153,0.08)] overflow-hidden relative bg-black flex flex-col">
                  {/* Dynamic Island Notch */}
                  <div className="relative z-50 flex-shrink-0 pt-2 pb-1 bg-transparent flex justify-center items-center pointer-events-none">
                    <div className="w-28 h-6 bg-black rounded-full border border-zinc-800/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-between px-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700/60 flex items-center justify-center">
                          <span className="w-1 h-1 rounded-full bg-blue-500/40" />
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 animate-pulse" />
                    </div>
                  </div>

                  {/* Screen Gloss Highlight Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.04] z-40 rounded-[36px]" />

                  {/* Viewport with CSS Containment for SakuraCanvas */}
                  <div
                    className="flex-1 overflow-y-auto overflow-x-hidden relative"
                    style={{ contain: 'paint', transform: 'translateZ(0)' }}
                  >
                    <ErrorBoundary fallbackTitle="Không thể nạp khung xem trước">
                      <BirthdayPage key={previewKey} initialData={formData} isPreview={true} />
                    </ErrorBoundary>
                  </div>

                  {/* Bottom Home Indicator Bar */}
                  <div className="h-4 bg-transparent flex items-center justify-center pointer-events-none relative z-50 flex-shrink-0">
                    <div className="w-32 h-1 bg-zinc-500/60 rounded-full" />
                  </div>
                </div>
              ) : (
                /* Desktop Browser Frame Mockup */
                <div className="w-full h-full max-h-[calc(100vh-140px)] max-w-5xl rounded-2xl border border-zinc-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative bg-black">
                  {/* macOS Window Titlebar */}
                  <div className="h-9 bg-zinc-900/95 border-b border-zinc-800 px-4 flex items-center justify-between z-30 select-none backdrop-blur-md flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm inline-block cursor-pointer hover:opacity-80 transition-opacity" title="Close" />
                      <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm inline-block cursor-pointer hover:opacity-80 transition-opacity" title="Minimize" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm inline-block cursor-pointer hover:opacity-80 transition-opacity" title="Maximize" />
                      
                      <div className="hidden sm:flex items-center gap-1.5 ml-2 text-zinc-500">
                        <ArrowLeft className="w-3.5 h-3.5 cursor-not-allowed opacity-50" />
                        <ArrowRight className="w-3.5 h-3.5 cursor-not-allowed opacity-50" />
                        <button
                          type="button"
                          onClick={handleRefreshPreview}
                          className="hover:text-zinc-300 transition-colors p-0.5 rounded"
                          title="Làm mới trang"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Simulated SSL URL bar */}
                    <div className="flex-1 max-w-md mx-3 bg-zinc-950/80 border border-zinc-800/90 rounded-lg py-1 px-3 flex items-center justify-center gap-1.5 text-[11px] font-mono shadow-inner transition-colors">
                      <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="text-zinc-500">https://</span>
                      <span className="text-zinc-400">sakura-birthday.app/birthday/</span>
                      <span className="text-pink-400 font-semibold">{formData.slug || 'special-day'}</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800/60 border border-zinc-700/40 text-zinc-400">
                        {Math.round(previewZoom * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Viewport with CSS Containment for SakuraCanvas */}
                  <div
                    className="flex-1 overflow-y-auto overflow-x-hidden relative"
                    style={{ contain: 'paint', transform: 'translateZ(0)' }}
                  >
                    <ErrorBoundary fallbackTitle="Không thể nạp khung xem trước">
                      <BirthdayPage key={previewKey} initialData={formData} isPreview={true} />
                    </ErrorBoundary>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Floating Action Buttons (FAB) */}
      {mobileViewMode === 'edit' && (
        <button
          type="button"
          onClick={() => setMobileViewMode('preview')}
          className="lg:hidden fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-sakura-gold text-white font-medium text-xs shadow-2xl shadow-pink-500/40 flex items-center gap-2 border border-white/20 active:scale-95 transition-transform"
        >
          <Eye className="w-4 h-4" />
          <span>Xem trước</span>
        </button>
      )}

      {mobileViewMode === 'preview' && (
        <button
          type="button"
          onClick={() => setMobileViewMode('edit')}
          className="lg:hidden fixed bottom-6 left-6 z-40 px-4 py-2.5 rounded-full bg-[#0d1326]/90 border border-white/20 text-white backdrop-blur-xl font-medium text-xs shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại chỉnh sửa</span>
        </button>
      )}

      {showShareModal && (
        <ShareModal
          birthday={formData}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
