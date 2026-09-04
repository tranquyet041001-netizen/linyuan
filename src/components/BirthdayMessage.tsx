import React from 'react';
import { motion } from 'framer-motion';
import { Feather, Heart } from 'lucide-react';
import { BirthdayData, ThemeConfig } from '../types/birthday';

interface BirthdayMessageProps {
  birthday: BirthdayData;
  theme: ThemeConfig;
}

export const BirthdayMessage: React.FC<BirthdayMessageProps> = ({ birthday, theme }) => {
  return (
    <section className="relative py-16 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-japanese tracking-[0.3em] text-pink-400 uppercase block mb-1">
          心からの手紙
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
          A Letter From the Heart
        </h2>
        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mt-3" />
      </div>

      {/* Washi Paper Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative rounded-3xl p-6 sm:p-12 shadow-2xl border border-pink-500/20 bg-[#0f172a]/80 backdrop-blur-xl text-zinc-200 overflow-hidden"
      >
        {/* Subtle Watermark Flower Icon */}
        <div className="absolute top-6 right-6 text-7xl text-pink-500/5 select-none pointer-events-none font-japanese">
          桜
        </div>

        {/* Top Japanese Stamp */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-2 text-pink-300">
            <Feather className="w-4 h-4" />
            <span className="text-xs font-japanese tracking-widest">
              親愛なる {birthday.name} へ
            </span>
          </div>

          <div className="hanko-stamp px-2.5 py-0.5 text-[10px] text-sakura-crimson border-sakura-crimson bg-white/10">
            想い
          </div>
        </div>

        {/* Letter Body Message */}
        <div className="space-y-6 font-serif text-sm sm:text-base leading-relaxed text-zinc-200/90 whitespace-pre-line tracking-wide">
          {birthday.message}
        </div>

        {/* Handwriting Signature and Stamp */}
        <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="font-handwriting text-2xl sm:text-3xl text-pink-300">
            With eternal warmth & blessings
          </div>

          <div className="w-9 h-9 rounded-lg border-2 border-sakura-crimson text-sakura-crimson flex items-center justify-center font-japanese font-bold text-xs shadow-md">
            絆
          </div>
        </div>
      </motion.div>
    </section>
  );
};
