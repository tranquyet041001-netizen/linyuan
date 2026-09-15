import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Feather, Heart, Play, RotateCcw, Check, Sparkles } from 'lucide-react';
import { BirthdayData, ThemeConfig } from '../types/birthday';

interface BirthdayMessageProps {
  birthday: BirthdayData;
  theme: ThemeConfig;
  isPreview?: boolean;
}

export const BirthdayMessage: React.FC<BirthdayMessageProps> = ({ birthday, theme, isPreview = false }) => {
  const fullText = birthday.message || '';
  const [displayedLength, setDisplayedLength] = useState(() => (isPreview ? fullText.length : 0));
  const [isTyping, setIsTyping] = useState(() => !isPreview);

  // Smooth ink calligraphy typewriter effect (bypassed in live preview mode)
  useEffect(() => {
    if (isPreview) return;

    if (!isTyping) {
      setDisplayedLength(fullText.length);
      return;
    }

    if (displayedLength < fullText.length) {
      const char = fullText[displayedLength];
      const delay = char === '\n' ? 120 : char === '.' || char === '!' || char === '?' ? 180 : 18;
      const timeout = setTimeout(() => {
        setDisplayedLength((prev) => Math.min(prev + 1, fullText.length));
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [displayedLength, isTyping, fullText, isPreview]);

  const handleShowAll = () => {
    setIsTyping(false);
    setDisplayedLength(fullText.length);
  };

  const handleReplay = () => {
    setDisplayedLength(0);
    setIsTyping(true);
  };

  return (
    <section className="relative py-16 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-xs font-japanese tracking-[0.3em] ${
            theme.id === 'pure-sakura'
              ? 'text-amber-800 font-bold'
              : theme.isDark
              ? 'text-pink-400 font-semibold'
              : 'text-pink-600 font-bold'
          } uppercase block mb-1`}
        >
          心からの手紙
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`text-2xl sm:text-4xl font-serif font-bold ${
            theme.id === 'pure-sakura'
              ? 'text-stone-900'
              : theme.isDark
              ? 'text-white'
              : 'text-zinc-900'
          } tracking-wide`}
        >
          A Letter From the Heart
        </motion.h2>
        <div
          className={`w-16 h-0.5 bg-gradient-to-r from-transparent ${
            theme.id === 'pure-sakura' ? 'via-amber-600' : 'via-pink-400'
          } to-transparent mx-auto mt-3`}
        />
      </div>

      {/* Washi Paper Card Container with Kintsugi Gold Seams */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={`relative rounded-3xl p-6 sm:p-12 shadow-2xl border ${
          theme.id === 'pure-sakura'
            ? 'border-amber-700/30 bg-gradient-to-br from-amber-50/95 via-white/95 to-amber-50/80 text-stone-800 shadow-amber-900/10'
            : theme.isDark
            ? 'border-pink-500/30 bg-gradient-to-br from-[#131b2e]/90 via-[#0f172a]/95 to-[#1e1b4b]/90 text-zinc-100 shadow-pink-950/40'
            : 'border-pink-200/90 bg-gradient-to-br from-white/95 via-rose-50/40 to-pink-50/80 text-zinc-800 shadow-pink-200/50'
        } backdrop-blur-xl overflow-hidden`}
      >
        {/* Kintsugi Gold Seam Accent Lines */}
        <div className="absolute -top-12 left-1/4 w-32 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent rotate-12 opacity-60 pointer-events-none" />
        <div className="absolute -bottom-8 right-1/4 w-40 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent -rotate-6 opacity-60 pointer-events-none" />

        {/* Subtle Watermark Kanji */}
        <div
          className={`absolute top-6 right-6 text-7xl select-none pointer-events-none font-japanese ${
            theme.id === 'pure-sakura'
              ? 'text-amber-600/10'
              : theme.isDark
              ? 'text-pink-400/10'
              : 'text-pink-500/10'
          }`}
        >
          桜
        </div>

        {/* Top Header: Recipient & Japanese Stamp */}
        <div
          className={`flex items-center justify-between border-b ${
            theme.id === 'pure-sakura'
              ? 'border-stone-200'
              : theme.isDark
              ? 'border-white/10'
              : 'border-zinc-200/80'
          } pb-5 mb-8`}
        >
          <div
            className={`flex items-center gap-2.5 ${
              theme.id === 'pure-sakura'
                ? 'text-amber-900 font-semibold'
                : theme.isDark
                ? 'text-pink-300'
                : 'text-pink-700 font-semibold'
            }`}
          >
            <Feather className="w-4 h-4 animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="text-xs sm:text-sm font-japanese tracking-widest font-medium">
              親愛なる {birthday.name} へ
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Typewriter Speed / Replay Controls (Public share mode only) */}
            {!isPreview && (
              isTyping ? (
                <button
                  onClick={handleShowAll}
                  className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Hiện toàn bộ nội dung ngay lập tức"
                >
                  <Check className="w-3 h-3" />
                  <span>Đọc ngay</span>
                </button>
              ) : (
                <button
                  onClick={handleReplay}
                  className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Xem lại từng nét viết"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Viết lại</span>
                </button>
              )
            )}

            {/* Hanko Seal */}
            <div
              className={`hanko-stamp px-2.5 py-0.5 text-[10px] sm:text-xs ${
                theme.id === 'pure-sakura'
                  ? 'text-amber-800 border-amber-700 bg-amber-50/80'
                  : 'text-sakura-crimson border-sakura-crimson bg-white/10'
              }`}
            >
              想い
            </div>
          </div>
        </div>

        {/* Letter Body: Ink Typewriter Animation with Flowing Japanese Serif Text */}
        <div
          className={`space-y-6 font-serif text-sm sm:text-base leading-relaxed ${
            theme.id === 'pure-sakura'
              ? 'text-stone-700 font-normal'
              : theme.isDark
              ? 'text-zinc-200 font-light'
              : 'text-zinc-700 font-normal'
          } whitespace-pre-line tracking-wide min-h-[140px]`}
        >
          {isPreview ? fullText : fullText.slice(0, displayedLength)}
          {!isPreview && isTyping && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="inline-block w-2 h-4 ml-1 bg-pink-400 align-middle"
            />
          )}
        </div>

        {/* Handwriting Signature & Bond Stamp */}
        <div
          className={`mt-12 pt-6 border-t ${
            theme.id === 'pure-sakura'
              ? 'border-stone-200'
              : theme.isDark
              ? 'border-white/10'
              : 'border-zinc-200/80'
          } flex items-center justify-between`}
        >
          <div
            className={`font-handwriting text-2xl sm:text-3xl ${
              theme.id === 'pure-sakura'
                ? 'text-amber-900'
                : theme.isDark
                ? 'text-pink-300'
                : 'text-pink-700'
            }`}
          >
            With eternal warmth & blessings
          </div>

          <div
            className={`w-9 h-9 rounded-lg border-2 ${
              theme.id === 'pure-sakura'
                ? 'border-amber-700 text-amber-800 shadow-sm'
                : 'border-sakura-crimson text-sakura-crimson shadow-md'
            } flex items-center justify-center font-japanese font-bold text-xs`}
          >
            絆
          </div>
        </div>
      </motion.div>
    </section>
  );
};

