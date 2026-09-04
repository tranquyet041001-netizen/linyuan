import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Eye, FolderHeart } from 'lucide-react';
import { SakuraCanvas } from '../components/SakuraCanvas';
import { THEMES } from '../data/themes';

export const HomePage: React.FC = () => {
  const theme = THEMES['sakura-night'];

  const features = [
    {
      icon: '🌸',
      title: '3D Sakura Physics Engine',
      description: 'Ultra-smooth 60 FPS HTML5 Canvas particle system with organic petal flutter, wind resistance, and mouse interaction.',
    },
    {
      icon: '🏮',
      title: 'Cinematic Opening Chapter',
      description: 'An atmospheric Japanese prologue that sweeps the recipient into an emotional, personalized birthday journey.',
    },
    {
      icon: '📜',
      title: 'Washi Paper Letter & Hanko',
      description: 'Personalized handwritten typography, subtle paper textures, and traditional Japanese seal stamps.',
    },
    {
      icon: '📷',
      title: 'Polaroid Memory Gallery',
      description: 'Editorial floating cards with natural scatter tilt, zoom lightbox, and mobile touch swipe.',
    },
    {
      icon: '🎵',
      title: 'YouTube & Ambient Audio',
      description: 'Choose your soundtrack from any YouTube URL with custom start/end slice range or built-in Japanese Koto melodies.',
    },
    {
      icon: '💾',
      title: 'Save, Edit & QR Sharing',
      description: 'Complete birthday creation platform with drafts, auto-save, duplication, instant QR code generator, and stable URLs.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#080c18] text-zinc-100 font-sans overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* Background Sakura Particles */}
      <SakuraCanvas
        settings={{
          density: 50,
          speed: 35,
          wind: 45,
          petal_size: 50,
          blur: 30,
          animation_intensity: 60,
        }}
        theme={theme}
        interactive={true}
      />

      {/* Atmospheric Moon Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 sm:w-[600px] h-80 sm:h-[600px] rounded-full bg-pink-500/10 blur-[140px] pointer-events-none" />

      {/* Top Floating Navbar */}
      <header className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="font-japanese font-bold text-lg text-pink-300">
            Sakura Birthday
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#/my-birthdays"
            className="px-4 py-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium backdrop-blur-md flex items-center gap-1.5 transition-colors"
          >
            <FolderHeart className="w-3.5 h-3.5 text-pink-400" />
            <span>My Birthdays</span>
          </a>

          <a
            href="#/create"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold shadow-lg shadow-pink-500/25 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 flex flex-col items-center">
        {/* Hanko Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 hanko-stamp px-3 py-1 text-xs tracking-widest text-sakura-crimson border-sakura-crimson bg-white/10 dark:bg-red-950/20 backdrop-blur-md"
        >
          桜の誕生日 • 贈り物
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl font-japanese font-extrabold text-center tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-100 to-pink-300 drop-shadow-[0_4px_30px_rgba(255,183,197,0.3)] mb-4"
        >
          Sakura Birthday
        </motion.h1>

        {/* Japanese Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-2xl font-japanese text-pink-300 text-center mb-6 tracking-widest"
        >
          お誕生日おめでとう
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm sm:text-lg font-serif italic text-zinc-300 text-center max-w-2xl leading-relaxed mb-10"
        >
          "A digital birthday gift platform inspired by Japanese cherry blossoms, cinematic storytelling, and unforgettable memories."
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto"
        >
          <a
            href="#/create"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-sm sm:text-base shadow-2xl shadow-pink-500/30 border border-white/20 flex items-center justify-center gap-2.5 transition-all transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create a Birthday Experience</span>
          </a>

          <a
            href="#/birthday/le-ngoc-han-2026"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-pink-400/30 text-white font-medium text-sm sm:text-base backdrop-blur-md flex items-center justify-center gap-2.5 transition-all shadow-lg"
          >
            <Eye className="w-4 h-4 text-pink-300" />
            <span>View Demo (Lê Ngọc Hân)</span>
          </a>
        </motion.div>

        {/* Features Showcase Grid */}
        <div className="w-full mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-japanese tracking-[0.3em] text-pink-400 uppercase block mb-1">
              洗練された機能
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Crafted for Emotional Beauty
            </h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-[#0f172a]/70 border border-pink-500/20 backdrop-blur-xl shadow-xl hover:border-pink-400/40 transition-all group"
              >
                <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-serif text-lg font-bold text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Theme Showcase Row */}
        <div className="w-full mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-japanese tracking-[0.3em] text-pink-400 uppercase block mb-1">
              四季の彩り
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              4 Distinct Aesthetic Themes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(THEMES).map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-[#0f172a]/80 border border-pink-500/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-japanese font-bold text-pink-300">
                      {t.japaneseName}
                    </span>
                    <span className="text-xs text-zinc-400 font-sans">{t.name}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {t.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full border-t border-zinc-800/80 pt-8 text-center text-xs text-zinc-500 font-sans">
          <p>
            🌸 Sakura Birthday — An artistic digital birthday gift platform.
          </p>
        </footer>
      </div>
    </div>
  );
};
