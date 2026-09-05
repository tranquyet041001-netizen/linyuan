import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Heart } from 'lucide-react';
import { BirthdayData, ThemeConfig } from '../types/birthday';

interface BirthdayHeroProps {
  birthday: BirthdayData;
  theme: ThemeConfig;
}

export const BirthdayHero: React.FC<BirthdayHeroProps> = ({ birthday, theme }) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 sm:pt-32 pb-20 overflow-visible">
      {/* Background Soft Glow Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] rounded-full bg-pink-500/15 blur-[130px] pointer-events-none" />

      {/* Hanko Stamp */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`mb-8 hanko-stamp px-4 py-1.5 text-xs sm:text-sm tracking-widest text-sakura-crimson border-sakura-crimson ${
          theme.isDark ? 'bg-white/10' : 'bg-rose-50/90 shadow-sm'
        } backdrop-blur-md`}
      >
        御祝い • 特別な日
      </motion.div>

      {/* Avatar with Halo Ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative mb-10 group"
      >
        <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 opacity-70 blur-md group-hover:opacity-100 transition-opacity animate-pulse" />
        
        <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full p-1.5 bg-gradient-to-b from-white/90 to-pink-200/60 shadow-2xl overflow-hidden">
          <img
            src={birthday.avatar_url}
            alt={birthday.name}
            className="w-full h-full object-cover rounded-full filter brightness-95 contrast-105"
          />
        </div>

        {birthday.age && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.6 }}
            className="absolute bottom-1 right-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-cinzel font-bold text-xs sm:text-sm shadow-xl border border-white/50"
          >
            {birthday.age}th Chapter
          </motion.div>
        )}
      </motion.div>

      {/* Recipient Name Heading — Expanded & Optimized for Full Name & Accents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="space-y-4 max-w-4xl w-full px-4"
      >
        <span className={`text-xs sm:text-sm font-japanese tracking-[0.35em] ${
          theme.isDark ? 'text-pink-400' : 'text-pink-600 font-bold'
        } uppercase block`}>
          Happy Birthday
        </span>

        {/* Name with ample padding & line-height so descenders and dots are never clipped */}
        <h1 className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold tracking-normal text-transparent bg-clip-text ${
          theme.isDark 
            ? 'bg-gradient-to-b from-white via-pink-100 to-pink-300 drop-shadow-[0_2px_24px_rgba(255,183,197,0.35)]'
            : 'bg-gradient-to-b from-rose-950 via-pink-900 to-rose-800 drop-shadow-[0_2px_12px_rgba(244,63,94,0.15)]'
        } py-2 px-2 leading-[1.3] select-text break-words`}>
          {birthday.name}
        </h1>

        {birthday.birthday && (
          <div className={`flex items-center justify-center gap-2 text-xs sm:text-sm ${
            theme.isDark ? 'text-zinc-400' : 'text-zinc-600 font-medium'
          } font-mono pt-1`}>
            <Calendar className={`w-4 h-4 ${theme.isDark ? 'text-pink-400' : 'text-pink-600'}`} />
            <span>{birthday.birthday}</span>
          </div>
        )}
      </motion.div>

      {/* Bilingual Quotes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-10 max-w-2xl w-full space-y-3.5 px-4"
      >
        <p className={`text-lg sm:text-2xl font-japanese ${
          theme.isDark ? 'text-pink-200/95 font-light' : 'text-rose-950/90 font-normal'
        } leading-relaxed tracking-wide`}>
          "{birthday.japaneseMessage}"
        </p>

        <p className={`text-xs sm:text-sm font-serif italic ${
          theme.isDark ? 'text-zinc-400 font-light' : 'text-zinc-600 font-normal'
        } leading-relaxed`}>
          — {birthday.englishMessage}
        </p>
      </motion.div>
    </section>
  );
};
