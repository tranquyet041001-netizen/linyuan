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
  UploadCloud
} from 'lucide-react';
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

interface CreateBirthdayProps {
  editBirthdayId?: string;
}

export const CreateBirthday: React.FC<CreateBirthdayProps> = ({ editBirthdayId }) => {
  const [formData, setFormData] = useState<BirthdayData>(() => {
    if (editBirthdayId) {
      const existing = getStoredBirthday(editBirthdayId);
      if (existing) return existing;
    }

    const hash = window.location.hash;
    if (hash.includes('?id=')) {
      const id = hash.split('?id=')[1];
      const existing = getStoredBirthday(id);
      if (existing) return existing;
    }

    const draft = getAutoSaveDraft();
    if (draft && draft.data && draft.data.id !== 'demo-le-ngoc-han-2026') {
      return draft.data;
    }

    const newId = `bday-${Date.now()}`;
    return {
      ...DEMO_BIRTHDAY,
      id: newId,
      slug: `birthday-${Math.random().toString(36).substring(2, 7)}`,
      status: 'draft',
      privacy: 'unlisted',
      show_timeline: true,
      show_memories: true,
      created_at: new Date().toISOString(),
    };
  });

  const [activeTab, setActiveTab] = useState<'content' | 'memories' | 'timeline' | 'music' | 'theme' | 'sakura'>('content');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showShareModal, setShowShareModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    let targetId = editBirthdayId;
    if (!targetId && hash.includes('?id=')) {
      targetId = hash.split('?id=')[1];
    }

    if (targetId) {
      const existing = getStoredBirthday(targetId);
      if (existing) {
        setFormData(existing);
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

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  ];

  const presetCovers = [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1600&q=80',
  ];

  // Uploading state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingMemories, setUploadingMemories] = useState<Record<string, boolean>>({});
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [editingAvatarUrl, setEditingAvatarUrl] = useState(false);
  const [editingCoverUrl, setEditingCoverUrl] = useState(false);
  const [memoryUrlInputId, setMemoryUrlInputId] = useState<string | null>(null);

  // Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const url = await processAndUploadImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.85 });
      setFormData((prev) => ({ ...prev, avatar_url: url }));
      showToast('✓ Tải ảnh đại diện thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải ảnh đại diện');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // Cover Photo Upload Handler
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const url = await processAndUploadImage(file, { maxWidth: 1600, maxHeight: 900, quality: 0.85 });
      setFormData((prev) => ({ ...prev, cover_url: url }));
      showToast('✓ Tải ảnh bìa thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải ảnh bìa');
    } finally {
      setUploadingCover(false);
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
      showToast('✓ Cập nhật ảnh kỷ niệm thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải ảnh kỷ niệm');
    } finally {
      setUploadingMemories((prev) => ({ ...prev, [id]: false }));
      e.target.value = '';
    }
  };

  // Batch Upload Multiple Memories Photos
  const handleBatchAddMemories = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentCount = formData.memories.length;
    const availableSlots = 6 - currentCount;
    if (availableSlots <= 0) {
      alert('Bạn đã đạt giới hạn tối đa 6 ảnh kỷ niệm.');
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
        });
      }

      setFormData((prev) => ({
        ...prev,
        memories: [...prev.memories, ...newItems],
      }));
      showToast(`✓ Đã thêm ${newItems.length} ảnh kỷ niệm!`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải danh sách ảnh kỷ niệm');
    } finally {
      setIsBatchUploading(false);
      e.target.value = '';
    }
  };

  // Memories handlers
  const handleAddMemory = () => {
    if (formData.memories.length >= 6) {
      alert('Bạn có thể thêm tối đa 6 ảnh kỷ niệm.');
      return;
    }
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      image_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
      caption: 'A wonderful memory together',
      year: `${new Date().getFullYear()}`,
      location: 'Tokyo',
    };
    setFormData((prev) => ({ ...prev, memories: [...prev.memories, newMem] }));
  };

  const handleRemoveMemory = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
  };

  const handleUpdateMemory = (id: string, updates: Partial<MemoryItem>) => {
    setFormData((prev) => ({
      ...prev,
      memories: prev.memories.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  };

  // Timeline handlers
  const handleAddTimeline = () => {
    const newTimeline: TimelineItem = {
      id: `t-${Date.now()}`,
      year: `${new Date().getFullYear()}`,
      title: 'New Milestone',
      description: 'A special moment on your life journey...',
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
    showToast('✓ Draft saved successfully!');
  };

  const handlePublishBirthday = () => {
    if (!formData.name.trim()) {
      alert('Please enter a recipient name.');
      return;
    }

    const saved = saveStoredBirthday(formData, true);
    setFormData(saved);
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

      {/* Top Studio Navbar */}
      <header className="h-16 border-b border-zinc-800 bg-[#0d1326]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-3">
          <a
            href="#/my-birthdays"
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="My Birthdays"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <span className="font-japanese font-bold text-xs sm:text-sm text-pink-300 block leading-tight">
                {formData.name ? `${formData.name}'s Birthday` : 'Sakura Birthday Studio'}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                /{formData.slug} • {formData.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            {autoSaveStatus === 'saving' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Auto-Saved</span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                previewDevice === 'desktop' ? 'bg-pink-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                previewDevice === 'mobile' ? 'bg-pink-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSaveDraft}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          <button
            onClick={handlePublishBirthday}
            className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-pink-500/25 flex items-center gap-2 transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Birthday</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body (Split Editor & Live Preview) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Customization Controls & Tabs */}
        <div className="w-full lg:w-[480px] xl:w-[520px] bg-[#0d1326] border-r border-zinc-800 flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
          {/* Editor Tabs Navigation */}
          <div className="p-2 border-b border-zinc-800/80 grid grid-cols-6 gap-1 sticky top-0 bg-[#0d1326] z-20">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 px-1 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                activeTab === 'content'
                  ? 'bg-pink-950/60 text-pink-300 border border-pink-700/50'
                  : 'text-zinc-400 hover:bg-zinc-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            <button
              onClick={() => setActiveTab('memories')}
              className={`py-2 px-1 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                activeTab === 'memories'
                  ? 'bg-pink-950/60 text-pink-300 border border-pink-700/50'
                  : 'text-zinc-400 hover:bg-zinc-800/60'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-2 px-1 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                activeTab === 'timeline'
                  ? 'bg-pink-950/60 text-pink-300 border border-pink-700/50'
                  : 'text-zinc-400 hover:bg-zinc-800/60'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Milestones</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`py-2 px-1 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                activeTab === 'music'
                  ? 'bg-pink-950/60 text-pink-300 border border-pink-700/50'
                  : 'text-zinc-400 hover:bg-zinc-800/60'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Music</span>
            </button>

            <button
              onClick={() => setActiveTab('theme')}
              className={`py-2 px-1 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                activeTab === 'theme'
                  ? 'bg-pink-950/60 text-pink-300 border border-pink-700/50'
                  : 'text-zinc-400 hover:bg-zinc-800/60'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Themes</span>
            </button>

            <button
              onClick={() => setActiveTab('sakura')}
              className={`py-2 px-1 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                activeTab === 'sakura'
                  ? 'bg-pink-950/60 text-pink-300 border border-pink-700/50'
                  : 'text-zinc-400 hover:bg-zinc-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sakura</span>
            </button>
          </div>

          {/* Tab 1: Personal Details & Message */}
          {activeTab === 'content' && (
            <div className="p-5 space-y-6 text-xs">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Recipient Profile</span>
                </h3>

                <div>
                  <label className="text-zinc-400 block mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 transition-colors"
                    placeholder="e.g. Nguyễn Thảo Trang"
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
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 transition-colors"
                      placeholder="e.g. 25"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Birthday Date</label>
                    <input
                      type="text"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 transition-colors"
                      placeholder="e.g. October 4, 2001"
                    />
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-400 block text-xs font-medium">Profile Photo</label>
                    <button
                      type="button"
                      onClick={() => setEditingAvatarUrl(!editingAvatarUrl)}
                      className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{editingAvatarUrl ? 'Đóng nhập link' : 'Dán URL ảnh'}</span>
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
                        Xong
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
                          <span>Đang xử lý & tải ảnh...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-pink-400" />
                          <span>Tải ảnh đại diện mới</span>
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
                    <span className="text-[10px] text-zinc-500">Mẫu có sẵn:</span>
                    {presetAvatars.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar_url: url })}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                          formData.avatar_url === url ? 'border-pink-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover Photo */}
                <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-400 block text-xs font-medium">Cover Banner Photo</label>
                    <button
                      type="button"
                      onClick={() => setEditingCoverUrl(!editingCoverUrl)}
                      className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{editingCoverUrl ? 'Đóng nhập link' : 'Dán URL ảnh bìa'}</span>
                    </button>
                  </div>

                  {editingCoverUrl && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 animate-in fade-in">
                      <input
                        type="url"
                        value={formData.cover_url || ''}
                        onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                        className="flex-1 bg-transparent px-2 py-1 text-zinc-100 text-xs focus:outline-none"
                        placeholder="https://images.unsplash.com/..."
                      />
                      <button
                        type="button"
                        onClick={() => setEditingCoverUrl(false)}
                        className="px-2.5 py-1 rounded-lg bg-pink-600 text-white text-xs font-medium"
                      >
                        Xong
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="relative w-24 h-12 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 flex-shrink-0 group">
                      <img
                        src={formData.cover_url || presetCovers[0]}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                      {uploadingCover && (
                        <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-pink-300">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <Camera className="w-3.5 h-3.5 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingCover}
                          className="hidden"
                          onChange={handleCoverUpload}
                        />
                      </label>
                    </div>

                    <label className={`flex-1 cursor-pointer py-2 px-3 rounded-xl border text-center text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      uploadingCover 
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed' 
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 hover:border-pink-500/50 text-zinc-200'
                    }`}>
                      {uploadingCover ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
                          <span>Đang tải ảnh bìa...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-pink-400" />
                          <span>Tải ảnh bìa mới</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingCover}
                        className="hidden"
                        onChange={handleCoverUpload}
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-zinc-500">Mẫu nền:</span>
                    {presetCovers.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, cover_url: url })}
                        className={`w-10 h-6 rounded-md overflow-hidden border-2 transition-all ${
                          formData.cover_url === url ? 'border-pink-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="Preset Cover" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Japanese Quotes & Greetings */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Feather className="w-4 h-4" />
                  <span>Hero Quotes & Greetings</span>
                </h3>

                <div>
                  <label className="text-zinc-400 block mb-1">Japanese Header Quote</label>
                  <input
                    type="text"
                    value={formData.japaneseMessage}
                    onChange={(e) => setFormData({ ...formData, japaneseMessage: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 font-japanese"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">English Subtitle Translation</label>
                  <input
                    type="text"
                    value={formData.englishMessage}
                    onChange={(e) => setFormData({ ...formData, englishMessage: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-pink-500 font-serif"
                  />
                </div>
              </div>

              {/* Letter / Birthday Message */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider">
                    Birthday Letter Message
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {formData.message.length} chars
                  </span>
                </div>

                <textarea
                  rows={14}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-zinc-100 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-pink-500 font-serif resize-y min-h-[250px]"
                  placeholder="Viết bức thư sinh nhật dài và đầy cảm xúc của bạn ở đây... Không có giới hạn số lượng chữ."
                />
              </div>

              {/* Privacy Setting */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider">
                  Privacy Settings
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      formData.privacy === 'unlisted'
                        ? 'border-pink-500 bg-pink-950/40 text-pink-200'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      checked={formData.privacy === 'unlisted'}
                      onChange={() => setFormData({ ...formData, privacy: 'unlisted' })}
                      className="accent-pink-500"
                    />
                    <div>
                      <span className="font-semibold text-xs block">Unlisted</span>
                      <span className="text-[10px] text-zinc-400">Only with link</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      formData.privacy === 'public'
                        ? 'border-pink-500 bg-pink-950/40 text-pink-200'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      checked={formData.privacy === 'public'}
                      onChange={() => setFormData({ ...formData, privacy: 'public' })}
                      className="accent-pink-500"
                    />
                    <div>
                      <span className="font-semibold text-xs block">Public</span>
                      <span className="text-[10px] text-zinc-400">Discoverable</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Memory Photos */}
          {activeTab === 'memories' && (
            <div className="p-5 space-y-5 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">
                    Polaroid Memory Gallery
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Enable or disable the floating photo memories section
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
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider">
                        Photo Memories ({formData.memories.length}/6)
                      </h3>
                      <p className="text-zinc-400 text-[11px]">
                        Polaroid style cards with captions and year tags
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Batch Upload Photos button */}
                      <label className={`px-3 py-1.5 rounded-xl text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        formData.memories.length >= 6 || isBatchUploading
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                          : 'bg-pink-600 hover:bg-pink-700 shadow-md'
                      }`}>
                        {isBatchUploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>{isBatchUploading ? 'Đang tải...' : 'Upload Photos'}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={formData.memories.length >= 6 || isBatchUploading}
                          className="hidden"
                          onChange={handleBatchAddMemories}
                        />
                      </label>

                      {/* Add Blank / Custom card */}
                      <button
                        type="button"
                        onClick={handleAddMemory}
                        disabled={formData.memories.length >= 6}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-xs font-medium flex items-center gap-1 transition-colors border border-zinc-700"
                        title="Thêm thẻ trống"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thẻ trống</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.memories.map((mem) => {
                      const isUploading = uploadingMemories[mem.id] || false;
                      const isEnteringUrl = memoryUrlInputId === mem.id;

                      return (
                        <div
                          key={mem.id}
                          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Thumbnail with visible action badges */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 relative group border border-zinc-700 shadow-inner">
                              <img src={mem.image_url} alt="Memory" className="w-full h-full object-cover" />
                              
                              {/* Spinner during upload */}
                              {isUploading && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-pink-300">
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                              )}

                              {/* Camera icon badge always visible in bottom corner */}
                              {!isUploading && (
                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] flex items-center gap-0.5 pointer-events-none">
                                  <Camera className="w-2.5 h-2.5" />
                                </div>
                              )}

                              {/* Click / Tap to change photo */}
                              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-medium gap-1">
                                <Camera className="w-4 h-4" />
                                <span>Đổi ảnh</span>
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
                              {/* Quick Actions for this photo */}
                              <div className="flex items-center gap-2">
                                <label className="cursor-pointer text-[10px] text-pink-400 hover:text-pink-300 flex items-center gap-1 font-medium">
                                  <Upload className="w-3 h-3" />
                                  <span>{isUploading ? 'Đang tải...' : 'Tải ảnh mới'}</span>
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
                                  <span>{isEnteringUrl ? 'Ẩn URL' : 'Nhập URL'}</span>
                                </button>
                              </div>

                              {/* URL text input when toggled */}
                              {isEnteringUrl && (
                                <div className="flex items-center gap-1.5 animate-in fade-in">
                                  <input
                                    type="url"
                                    value={mem.image_url}
                                    onChange={(e) => handleUpdateMemory(mem.id, { image_url: e.target.value })}
                                    placeholder="https://..."
                                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-100 text-[11px] focus:outline-none focus:border-pink-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setMemoryUrlInputId(null)}
                                    className="px-2 py-1 rounded-lg bg-pink-600 text-white text-[10px] font-medium"
                                  >
                                    Lưu
                                  </button>
                                </div>
                              )}

                              <input
                                type="text"
                                value={mem.caption}
                                onChange={(e) => handleUpdateMemory(mem.id, { caption: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-pink-500"
                                placeholder="Caption (lời chú thích)..."
                              />

                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={mem.year || ''}
                                  onChange={(e) => handleUpdateMemory(mem.id, { year: e.target.value })}
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-100 text-[11px] focus:outline-none focus:border-pink-500"
                                  placeholder="Year (e.g. 2024)"
                                />
                                <input
                                  type="text"
                                  value={mem.location || ''}
                                  onChange={(e) => handleUpdateMemory(mem.id, { location: e.target.value })}
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-100 text-[11px] focus:outline-none focus:border-pink-500"
                                  placeholder="Location (e.g. Kyoto)"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveMemory(mem.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors rounded-lg hover:bg-zinc-800/80"
                              title="Xóa kỷ niệm này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 3: Memorable Milestones / Timeline (Toggle & Manager) */}
          {activeTab === 'timeline' && (
            <div className="p-5 space-y-5 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-pink-500/30 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-xs font-semibold text-pink-300 block">
                    Memorable Milestones Timeline
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Enable or disable the milestone timeline section
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.show_timeline !== false}
                  onChange={(e) => setFormData({ ...formData, show_timeline: e.target.checked })}
                  className="w-5 h-5 rounded accent-pink-500 cursor-pointer"
                />
              </div>

              {formData.show_timeline !== false && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider">
                        Milestones ({formData.timeline?.length || 0})
                      </h3>
                      <p className="text-zinc-400 text-[11px]">
                        Add key life moments and cherished years
                      </p>
                    </div>
                    <button
                      onClick={handleAddTimeline}
                      className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
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
                            placeholder="Milestone title..."
                          />
                          <button
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
                          placeholder="Short description of this milestone..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Music System (YouTube & Ambient) */}
          {activeTab === 'music' && (
            <MusicEditor
              data={formData}
              onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
            />
          )}

          {/* Tab 5: Themes Selector */}
          {activeTab === 'theme' && (
            <div className="p-5 space-y-5 text-xs">
              <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider">
                Select Japanese Theme
              </h3>

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
          )}

          {/* Tab 6: Sakura Physics & Animation Toggles */}
          {activeTab === 'sakura' && (
            <div className="p-5 space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider">
                  Sakura Petal Physics
                </h3>
                <button
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
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Sakura Density</span>
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
                    <span>Falling Speed</span>
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
                    <span>Wind Drift</span>
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
                    <span>Petal Size</span>
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

              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <h4 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
                  Visual Effects Toggles
                </h4>

                <div className="grid grid-cols-2 gap-2 text-zinc-300">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer">
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
                    <span>Sakura Particles</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer">
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

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer">
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
                    <span>Mouse Wind Effect</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer">
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
            </div>
          )}
        </div>

        {/* Right Side: Real-time Live Interactive Preview */}
        <div className="flex-1 bg-[#050811] p-4 sm:p-6 flex items-center justify-center overflow-hidden relative">
          {previewDevice === 'mobile' ? (
            <div className="w-[375px] h-[720px] rounded-[48px] border-[10px] border-zinc-800 shadow-2xl overflow-hidden relative bg-black flex flex-col">
              <div className="h-6 bg-zinc-800 w-36 mx-auto rounded-b-2xl z-50 flex-shrink-0" />
              <div className="flex-1 overflow-y-auto">
                <BirthdayPage initialData={formData} isPreview={true} />
              </div>
            </div>
          ) : (
            <div className="w-full h-full max-h-[840px] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col bg-black">
              <div className="h-8 bg-zinc-900/90 border-b border-zinc-800 px-4 flex items-center gap-2 z-30">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 max-w-sm mx-auto bg-zinc-800/80 rounded-md py-0.5 px-3 text-[10px] text-zinc-400 font-mono text-center truncate">
                  sakura-birthday.app/birthday/{formData.slug || 'special-day'}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <BirthdayPage initialData={formData} isPreview={true} />
              </div>
            </div>
          )}
        </div>
      </div>

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
