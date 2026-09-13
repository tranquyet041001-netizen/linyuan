import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Flame, Wind } from 'lucide-react';
import { ThemeConfig } from '../types/birthday';
import { sakuraAudio } from '../utils/audioSynthesizer';

interface BirthdayOpeningProps {
  name: string;
  theme: ThemeConfig;
  onOpen: () => void;
  onStartMusic?: () => void;
}

export const BirthdayOpening: React.FC<BirthdayOpeningProps> = ({
  name,
  theme,
  onOpen,
  onStartMusic,
}) => {
  const [isBlownOut, setIsBlownOut] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [wishMade, setWishMade] = useState(false);

  const handleBlowCandle = () => {
    if (isBlownOut) return;

    // 1. Synchronously trigger music playback to maintain browser user gesture permission
    if (onStartMusic) {
      try {
        onStartMusic();
      } catch (e) {
        console.warn('Audio start error:', e);
      }
    }

    // 2. Play magical Japanese pentatonic chime
    sakuraAudio.playCelebrationChime();

    // 3. Trigger candle extinguish animation & wish confirmation
    setIsBlownOut(true);
    setWishMade(true);

    // 4. Open after celebration animation
    setTimeout(() => {
      setIsOpening(true);
      setTimeout(() => {
        onOpen();
      }, 950);
    }, 1400);
  };

  const handleDirectOpen = () => {
    if (onStartMusic) {
      try {
        onStartMusic();
      } catch (e) {}
    }
    sakuraAudio.playCelebrationChime();
    setIsOpening(true);
    setTimeout(() => {
      onOpen();
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isOpening ? 0 : 1, scale: isOpening ? 1.08 : 1 }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${theme.bgGradient} ${theme.textColor} overflow-hidden p-4 sm:p-6 select-none`}
    >
      {/* Ambient Radial Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,183,197,0.18)_0,transparent_70%)] pointer-events-none" />

      {/* Floating Starfield Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-pink-300/30"
            style={{
              width: `${(i % 3) * 2 + 3}px`,
              height: `${(i % 3) * 2 + 3}px`,
              top: `${(i * 17) % 100}%`,
              left: `${(i * 23) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (i % 5) * 0.4,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-xl w-full text-center flex flex-col items-center">
        {/* Japanese Hanko Seal Stamp */}
        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: -4 }}
          transition={{ type: 'spring', damping: 14, delay: 0.15 }}
          className={`mb-6 hanko-stamp px-4 py-1.5 text-xs sm:text-sm tracking-widest ${
            theme.id === 'pure-sakura'
              ? 'text-amber-900 border-amber-700 bg-amber-50/90 shadow-sm'
              : 'text-sakura-crimson border-sakura-crimson bg-white/20'
          } backdrop-blur-sm`}
        >
          祝 • 誕生日の贈り物
        </motion.div>

        {/* Heading & Recipient */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="space-y-3 mb-6 w-full"
        >
          <span
            className={`text-xs sm:text-sm font-japanese tracking-[0.35em] ${
              theme.id === 'pure-sakura'
                ? 'text-amber-800 font-bold'
                : theme.isDark
                ? 'text-pink-400 font-semibold'
                : 'text-pink-600 font-bold'
            } block uppercase`}
          >
            A Special Birthday Wish for
          </span>

          <h1
            className={`text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-transparent bg-clip-text ${
              theme.id === 'pure-sakura'
                ? 'bg-gradient-to-r from-stone-950 via-amber-950 to-stone-800 drop-shadow-sm'
                : theme.id === 'sakura-day'
                ? 'bg-gradient-to-r from-rose-950 via-pink-900 to-rose-800 drop-shadow-sm'
                : theme.isDark
                ? 'bg-gradient-to-r from-pink-300 via-rose-200 to-pink-100 drop-shadow-md'
                : 'bg-gradient-to-r from-rose-950 via-pink-900 to-rose-800 drop-shadow-sm'
            } tracking-normal py-1 px-2 leading-[1.3] break-words`}
          >
            {name}
          </h1>

          <div className="flex items-center justify-center gap-3 pt-1">
            <span
              className={`h-[1px] w-12 ${
                theme.id === 'pure-sakura'
                  ? 'bg-amber-600/40'
                  : theme.isDark
                  ? 'bg-pink-400/40'
                  : 'bg-pink-500/40'
              }`}
            />
            <span
              className={`text-xs sm:text-sm font-serif italic ${
                theme.id === 'pure-sakura'
                  ? 'text-amber-900 font-medium'
                  : theme.isDark
                  ? 'text-pink-300/90 font-light'
                  : 'text-pink-800 font-medium'
              } tracking-widest`}
            >
              お誕生日おめでとう
            </span>
            <span
              className={`h-[1px] w-12 ${
                theme.id === 'pure-sakura'
                  ? 'bg-amber-600/40'
                  : theme.isDark
                  ? 'bg-pink-400/40'
                  : 'bg-pink-500/40'
              }`}
            />
          </div>
        </motion.div>

        {/* 3D Interactive Birthday Cake & Candle Ritual */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative my-4 flex flex-col items-center cursor-pointer group"
          onClick={handleBlowCandle}
        >
          {/* Flame Glow Ambient Pulse */}
          {!isBlownOut && (
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-8 w-28 h-28 rounded-full bg-amber-400/30 blur-2xl pointer-events-none"
            />
          )}

          {/* Candle Flame & Smoke Animation */}
          <div className="relative h-16 flex items-center justify-center">
            <AnimatePresence>
              {!isBlownOut ? (
                <motion.div
                  key="flame"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [1, 1.08, 0.96, 1.04, 1],
                    y: [0, -2, 1, -1, 0],
                    rotate: [-2, 3, -1, 2, -2],
                  }}
                  exit={{
                    scale: 0,
                    y: -20,
                    opacity: 0,
                    transition: { duration: 0.35 },
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative z-20 flex flex-col items-center"
                >
                  {/* Outer Warm Flame Halo */}
                  <div className="w-6 h-8 rounded-full bg-gradient-to-t from-amber-500 via-rose-400 to-yellow-200 blur-[1px] shadow-[0_0_16px_rgba(251,191,36,0.8)]" />
                  {/* Inner Blue-White Core */}
                  <div className="absolute top-2 w-2.5 h-4 rounded-full bg-gradient-to-t from-sky-400 to-white opacity-90" />
                </motion.div>
              ) : (
                <motion.div
                  key="smoke"
                  initial={{ opacity: 0, scale: 0.6, y: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0.8, 2, 3.2],
                    y: [-5, -35, -60],
                    x: [0, 8, -6],
                  }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                  className="absolute z-20 flex flex-col items-center"
                >
                  <Wind className="w-8 h-8 text-stone-300/80 blur-[0.5px]" />
                  <span className="text-[10px] font-japanese text-amber-200 font-bold tracking-widest mt-1">
                    願いが届きました ✨
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Candle Wick */}
            <div className="absolute bottom-0 w-1 h-3 bg-stone-700 rounded-t-sm" />
          </div>

          {/* Candle Cylinder */}
          <div className="w-4 h-9 bg-gradient-to-b from-rose-100 via-pink-200 to-rose-300 rounded-t-sm shadow-inner relative border border-pink-300/40">
            {/* Wax drip details */}
            <div className="absolute top-1 left-0.5 w-1 h-2 bg-pink-100 rounded-full" />
            <div className="absolute top-2 right-0.5 w-1 h-3 bg-pink-100 rounded-full" />
          </div>

          {/* Cake Top Tier */}
          <div className="relative -mt-0.5 w-32 sm:w-36 h-9 rounded-2xl bg-gradient-to-r from-pink-200 via-rose-100 to-pink-200 shadow-md border border-pink-300/60 flex items-center justify-around px-2">
            <span className="text-xs">🍓</span>
            <span className="text-[10px] font-japanese text-rose-800 font-semibold tracking-wider">
              {wishMade ? '心願成就' : 'お祝い'}
            </span>
            <span className="text-xs">🍓</span>
          </div>

          {/* Cake Base Tier with Kintsugi Gold Accent */}
          <div className="relative -mt-1 w-44 sm:w-48 h-10 rounded-2xl bg-gradient-to-r from-rose-300 via-pink-200 to-rose-300 shadow-xl border-2 border-amber-300/60 flex items-center justify-center">
            <div className="h-[1px] w-3/4 bg-amber-400/80 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
          </div>

          {/* Lacquer Cake Pedestal Stand */}
          <div className="w-28 h-2 rounded-full bg-stone-800/40 blur-[1px] mt-1" />

          {/* Interactive Cue Prompt */}
          <motion.div
            animate={
              isBlownOut
                ? { opacity: 0 }
                : {
                    y: [0, -3, 0],
                    opacity: [0.85, 1, 0.85],
                  }
            }
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-3 flex items-center gap-1.5 text-xs sm:text-sm font-serif italic text-pink-300/90 group-hover:text-pink-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{isBlownOut ? 'Điều ước đã được gửi đi...' : 'Chạm vào nến để ước & mở thiệp'}</span>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4">
          {/* Primary Button */}
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            onClick={handleBlowCandle}
            disabled={isBlownOut}
            className={`group relative w-full sm:w-auto px-8 py-3.5 rounded-full ${
              theme.id === 'pure-sakura'
                ? 'bg-gradient-to-r from-amber-700 via-stone-800 to-amber-900 text-amber-50 shadow-amber-900/25 border-amber-300/40'
                : 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-pink-500/40 border-white/40'
            } font-semibold text-sm sm:text-base shadow-2xl border flex items-center justify-center gap-3 overflow-hidden cursor-pointer`}
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Flame className={`w-4 h-4 ${isBlownOut ? 'text-stone-400' : 'text-amber-200 animate-pulse'}`} />
            <span className="font-japanese tracking-wide font-bold">
              {isBlownOut ? 'Đang mở món quà...' : 'Thổi Nến & Mở Quà'}
            </span>
            <Sparkles
              className={`w-4 h-4 ${
                theme.id === 'pure-sakura' ? 'text-amber-200' : 'text-pink-200'
              } group-hover:rotate-12 transition-transform`}
            />
          </motion.button>

          {/* Quick Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            onClick={handleDirectOpen}
            className={`text-xs ${
              theme.isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-800'
            } underline underline-offset-4 decoration-pink-400/40 py-2 px-3 transition-colors cursor-pointer`}
          >
            Mở trực tiếp
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
