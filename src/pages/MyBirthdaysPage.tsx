import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Copy, 
  Share2, 
  Sparkles, 
  Calendar, 
  ArrowLeft,
  AlertTriangle,
  Music,
  Palette
} from 'lucide-react';
import { BirthdayData } from '../types/birthday';
import { THEMES } from '../data/themes';
import { getAllStoredBirthdays, duplicateBirthday, deleteStoredBirthday } from '../utils/storage';
import { ShareModal } from '../components/ShareModal';
import { SakuraCanvas } from '../components/SakuraCanvas';

export const MyBirthdaysPage: React.FC = () => {
  const [birthdays, setBirthdays] = useState<BirthdayData[]>([]);
  const [selectedBirthdayForShare, setSelectedBirthdayForShare] = useState<BirthdayData | null>(null);
  const [birthdayToDelete, setBirthdayToDelete] = useState<BirthdayData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadBirthdays = () => {
    const list = getAllStoredBirthdays();
    setBirthdays(list);
  };

  useEffect(() => {
    loadBirthdays();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicateBirthday(id);
    if (dup) {
      loadBirthdays();
      showToast(`Duplicated "${dup.name}" successfully! 📑`);
    }
  };

  const handleDeleteConfirm = () => {
    if (!birthdayToDelete) return;
    const success = deleteStoredBirthday(birthdayToDelete.id);
    if (success) {
      loadBirthdays();
      showToast(`Deleted "${birthdayToDelete.name}" 🗑️`);
    } else {
      showToast('Cannot delete default demo birthday.');
    }
    setBirthdayToDelete(null);
  };

  const theme = THEMES['sakura-night'];

  return (
    <div className="relative min-h-screen bg-[#080c18] text-zinc-100 font-sans overflow-x-hidden selection:bg-pink-500 selection:text-white">
      <SakuraCanvas
        settings={{
          density: 45,
          speed: 30,
          wind: 45,
          petal_size: 45,
          blur: 25,
          animation_intensity: 50,
        }}
        theme={theme}
        interactive={true}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900/95 border border-pink-500/40 text-pink-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800 bg-[#0d1326]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-3">
          <a
            href="#/"
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <span className="font-japanese font-bold text-sm sm:text-base text-pink-300">
              My Birthday Creations
            </span>
          </div>
        </div>

        <a
          href="#/create"
          className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-pink-500/25 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Birthday</span>
        </a>
      </header>

      {/* Main Content Area */}
      <main className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800/80">
          <div>
            <span className="text-xs font-japanese tracking-[0.3em] text-pink-400 uppercase block mb-1">
              保存された作品
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              My Birthdays ({birthdays.length})
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
              Manage, edit, duplicate, and share all your personalized Sakura birthday websites
            </p>
          </div>

          <a
            href="#/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 hover:border-pink-500 text-zinc-200 text-xs font-medium transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-pink-400" />
            <span>Create Another Birthday</span>
          </a>
        </div>

        {birthdays.length === 0 ? (
          <div className="p-16 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
            <div className="text-4xl">🌸</div>
            <h3 className="font-serif text-xl font-bold text-white">No Birthdays Created Yet</h3>
            <p className="text-xs text-zinc-400">
              Start by creating your first Japanese Sakura birthday surprise for someone special!
            </p>
            <a
              href="#/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-lg shadow-pink-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Birthday Now</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {birthdays.map((item) => {
              const itemTheme = THEMES[item.theme] || THEMES['sakura-night'];
              const isDemo = item.id === 'demo-le-ngoc-han-2026' || item.id === 'demo-mai-2026';

              return (
                <div
                  key={item.id}
                  className="rounded-3xl bg-[#0f172a]/90 border border-pink-500/20 hover:border-pink-400/40 shadow-xl backdrop-blur-xl overflow-hidden transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between group"
                >
                  {/* Card Banner / Cover Image */}
                  <div className="relative h-44 bg-zinc-900 overflow-hidden">
                    <img
                      src={item.cover_url || item.avatar_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/30 to-transparent" />

                    <div className="absolute top-3 left-3">
                      {item.status === 'published' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                          Draft
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-japanese bg-black/60 text-pink-300 border border-white/10 backdrop-blur-md flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      <span>{itemTheme.japaneseName}</span>
                    </div>

                    <div className="absolute bottom-3 left-4 flex items-end gap-3">
                      <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-rose-400 shadow-md">
                        <img
                          src={item.avatar_url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-white tracking-tight leading-none mb-1">
                          {item.name}
                        </h3>
                        <p className="text-[11px] font-mono text-zinc-300">
                          {item.age ? `${item.age} years old` : 'Birthday'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-pink-400" />
                          <span>{item.birthday || 'No date set'}</span>
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">
                          /{item.slug}
                        </span>
                      </div>

                      {item.music_type === 'youtube' && item.music_title && (
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                          <Music className="w-3 h-3 text-red-400 flex-shrink-0" />
                          <span className="truncate">{item.music_title}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`#/birthday/${item.slug}`}
                          className="py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-pink-600/20"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open</span>
                        </a>

                        <a
                          href={`#/create?id=${item.id}`}
                          className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                          <span>Edit</span>
                        </a>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                        <button
                          onClick={() => setSelectedBirthdayForShare(item)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-pink-300 hover:bg-zinc-800 transition-colors flex items-center gap-1"
                          title="Share & QR Code"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>

                        <button
                          onClick={() => handleDuplicate(item.id)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-pink-300 hover:bg-zinc-800 transition-colors flex items-center gap-1"
                          title="Duplicate Design"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplicate</span>
                        </button>

                        {!isDemo && (
                          <button
                            onClick={() => setBirthdayToDelete(item)}
                            className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedBirthdayForShare && (
        <ShareModal
          birthday={selectedBirthdayForShare}
          isOpen={!!selectedBirthdayForShare}
          onClose={() => setSelectedBirthdayForShare(null)}
        />
      )}

      {birthdayToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-rose-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-600/40 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-1">
                Delete this birthday?
              </h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to delete the birthday page for <strong className="text-rose-300">{birthdayToDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setBirthdayToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
