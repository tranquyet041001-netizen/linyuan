import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Calendar, X, ZoomIn } from 'lucide-react';
import { MemoryItem, ThemeConfig } from '../types/birthday';

interface MemoryGalleryProps {
  memories: MemoryItem[];
  theme: ThemeConfig;
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({ memories, theme }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryItem | null>(null);

  if (!memories || memories.length === 0) return null;

  const rotations = [-2.5, 1.8, -1.2, 2.2, -1.8, 1.5];

  return (
    <section className="relative py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-xs font-japanese tracking-[0.3em] text-pink-400 uppercase block mb-1">
          思い出の風景
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
          Cherished Moments
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-serif italic">
          "Each photograph is a blossom preserved in time."
        </p>
        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mt-3" />
      </div>

      {/* Polaroid Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {memories.map((mem, idx) => {
          const rotation = rotations[idx % rotations.length];

          return (
            <motion.div
              key={mem.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
              style={{ transform: `rotate(${rotation}deg)` }}
              onClick={() => setSelectedPhoto(mem)}
              className="cursor-pointer bg-white p-3 sm:p-4 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Photo Frame */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100">
                <img
                  src={mem.image_url}
                  alt={mem.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              </div>

              {/* Caption & Location Footer */}
              <div className="pt-3 pb-1 px-1 text-zinc-800">
                <p className="text-xs sm:text-sm font-serif italic leading-snug line-clamp-2 mb-2 text-zinc-700">
                  {mem.caption}
                </p>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
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
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="rounded-2xl overflow-hidden max-h-[60vh] bg-black">
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.caption}
                  className="w-full h-full object-contain max-h-[60vh] mx-auto"
                />
              </div>

              <div className="pt-2">
                <h4 className="font-serif text-base sm:text-lg font-bold text-zinc-900">
                  {selectedPhoto.caption}
                </h4>
                <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1 font-mono">
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
