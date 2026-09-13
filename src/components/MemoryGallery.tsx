import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Calendar, X, ZoomIn, RotateCw, Heart } from 'lucide-react';
import { MemoryItem, ThemeConfig } from '../types/birthday';

interface MemoryGalleryProps {
  memories: MemoryItem[];
  theme: ThemeConfig;
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({ memories, theme }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryItem | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  if (!memories || memories.length === 0) return null;

  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const rotations = [-2.5, 1.8, -1.2, 2.2, -1.8, 1.5];
  const washiColors = [
    'bg-rose-200/80 border-rose-300/60',
    'bg-amber-100/80 border-amber-200/60',
    'bg-pink-200/80 border-pink-300/60',
    'bg-teal-100/80 border-teal-200/60',
  ];

  return (
    <section className="relative py-16 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-xs font-japanese tracking-[0.3em] ${
            theme.isDark ? 'text-pink-400' : 'text-pink-600 font-bold'
          } uppercase block mb-1`}
        >
          思い出の風景
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`text-2xl sm:text-4xl font-serif font-bold ${
            theme.isDark ? 'text-white' : 'text-zinc-900'
          } tracking-wide`}
        >
          Cherished Moments
        </motion.h2>
        <p
          className={`text-xs sm:text-sm ${
            theme.isDark ? 'text-zinc-400' : 'text-zinc-600'
          } mt-2 font-serif italic`}
        >
          "Mỗi bức ảnh là một cánh hoa lưu giữ những ký ức ngọt ngào nhất."
        </p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mt-3" />
      </div>

      {/* 3D Polaroid Scrapbook Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {memories.map((mem, idx) => {
          const rotation = rotations[idx % rotations.length];
          const isFlipped = !!flippedCards[mem.id];
          const washiTapeColor = washiColors[idx % washiColors.length];

          return (
            <motion.div
              key={mem.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, rotate: 0, zIndex: 30 }}
              style={{
                transform: `rotate(${rotation}deg)`,
                perspective: 1000,
              }}
              className="relative cursor-pointer transition-all duration-300"
            >
              {/* Decorative Washi Tape on Top */}
              <div
                className={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-6 ${washiTapeColor} backdrop-blur-sm border shadow-sm z-30 transform -rotate-2 opacity-90`}
                style={{
                  clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
                }}
              />

              {/* 3D Flip Card Container */}
              <div
                className="relative w-full min-h-[380px] rounded-2xl transition-transform duration-700 [transform-style:preserve-3d]"
                style={{
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* FRONT FACE: Polaroid Photo */}
                <div
                  className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white p-4 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-pink-500/15 border border-zinc-200/80 flex flex-col justify-between"
                  onClick={() => setSelectedPhoto(mem)}
                >
                  {/* Photo Frame */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 group">
                    <img
                      src={mem.image_url}
                      alt={mem.caption}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <div className="p-2 rounded-full bg-white/80 text-zinc-900 shadow-md">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Caption & Metadata Footer */}
                  <div className="pt-3 pb-1 px-1 text-zinc-800">
                    <p className="text-xs sm:text-sm font-serif italic leading-snug line-clamp-2 mb-2.5 text-zinc-700">
                      {mem.caption}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono border-t border-zinc-100 pt-2">
                      <div className="flex items-center gap-2">
                        {mem.year && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-pink-500" />
                            <span>{mem.year}</span>
                          </span>
                        )}
                        {mem.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>{mem.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Flip to Secret Note Button */}
                      <button
                        onClick={(e) => toggleFlip(mem.id, e)}
                        className="flex items-center gap-1 text-[11px] font-sans text-pink-600 hover:text-pink-700 font-medium px-2 py-0.5 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors"
                        title="Lật xem lời nhắn phía sau"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Xem thư</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* BACK FACE: Secret Handwritten Note & Stamp */}
                <div
                  className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-amber-50 via-white to-amber-50/70 p-5 rounded-2xl shadow-xl border-2 border-amber-200/80 flex flex-col justify-between text-stone-800"
                  onClick={(e) => toggleFlip(mem.id, e)}
                >
                  <div>
                    {/* Header Stamp */}
                    <div className="flex items-center justify-between border-b border-amber-200/80 pb-3 mb-4">
                      <div className="flex items-center gap-1.5 text-amber-800 text-xs font-serif font-semibold">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>Ký ức & Lời Nhắn</span>
                      </div>
                      <div className="hanko-stamp px-2 py-0.5 text-[9px] text-amber-800 border-amber-700 bg-amber-50">
                        記憶
                      </div>
                    </div>

                    {/* Handwritten Secret Message */}
                    <div className="font-serif text-xs sm:text-sm leading-relaxed text-stone-700 italic space-y-2">
                      <p>
                        {mem.note ||
                          `"Những ngày cùng nhau bước qua bốn mùa luôn là món quà đẹp đẽ nhất. Cảm ơn vì đã luôn ở đây và nở nụ cười rạng rỡ."`}
                      </p>
                    </div>
                  </div>

                  {/* Back Footer */}
                  <div className="border-t border-amber-200/80 pt-3 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                    <span>{mem.year ? `Năm ${mem.year}` : 'Mãi mãi trân quý'}</span>
                    <button
                      onClick={(e) => toggleFlip(mem.id, e)}
                      className="flex items-center gap-1 text-[11px] font-sans text-amber-800 hover:text-amber-900 font-medium px-2 py-0.5 rounded-full bg-amber-100/80 hover:bg-amber-200 transition-colors"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Xem ảnh</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Zoom Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-4 sm:p-6 rounded-3xl max-w-2xl w-full shadow-2xl space-y-4 text-zinc-800 relative"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="rounded-2xl overflow-hidden max-h-[60vh] bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.caption}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-contain max-h-[60vh] mx-auto"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-serif text-base sm:text-lg font-bold text-zinc-900">
                    {selectedPhoto.caption}
                  </h4>
                  <span className="text-[11px] font-mono text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                    {memories.findIndex((m) => m.id === selectedPhoto.id) + 1} / {memories.length}
                  </span>
                </div>

                {selectedPhoto.note && (
                  <p className="text-xs sm:text-sm font-serif italic text-zinc-600 bg-pink-50/50 p-3 rounded-xl border border-pink-100 my-2">
                    "{selectedPhoto.note}"
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono mt-2">
                  {selectedPhoto.year && <span>Year: {selectedPhoto.year}</span>}
                  {selectedPhoto.location && <span>Location: {selectedPhoto.location}</span>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

