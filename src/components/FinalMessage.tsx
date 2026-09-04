import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, RotateCcw, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BirthdayData, ThemeConfig } from '../types/birthday';

interface FinalMessageProps {
  birthday: BirthdayData;
  theme: ThemeConfig;
  onReplay?: () => void;
}

export const FinalMessage: React.FC<FinalMessageProps> = ({ birthday, theme, onReplay }) => {
  const [lanternCount, setLanternCount] = useState<number[]>([]);
  const [wishMade, setWishMade] = useState(false);

  const handleMakeWish = () => {
    setWishMade(true);
    setLanternCount((prev) => [...prev, Date.now()]);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#ffb7c5', '#ff7e9e', '#ffd0da', '#ffffff', '#dfb76c'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffb7c5', '#ff7e9e', '#ffffff'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffb7c5', '#ff7e9e', '#ffffff'],
      });
    }, 250);
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 text-center max-w-2xl mx-auto overflow-hidden">
      {/* Floating Lanterns */}
      <AnimatePresence>
        {lanternCount.map((id) => (
          <motion.div
            key={id}
            initial={{ y: 200, opacity: 0, scale: 0.8 }}
            animate={{ y: -800, opacity: [0, 1, 1, 0], scale: 1.2 }}
            transition={{ duration: 7, ease: 'easeOut' }}
            className="fixed bottom-0 z-30 pointer-events-none text-4xl"
            style={{
              left: `${20 + Math.random() * 60}%`,
              filter: 'drop-shadow(0 0 15px rgba(251,191,36,0.8))',
            }}
          >
            🏮
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-8"
      >
        {/* Hanko Stamp */}
        <div className="hanko-stamp px-4 py-1 text-xs tracking-widest text-sakura-crimson border-sakura-crimson bg-white/10">
          永遠の祝福
        </div>

        {/* Closing Headline */}
        <h2 className="text-3xl sm:text-5xl font-japanese font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-pink-300 drop-shadow-md">
          {birthday.closingWish || 'May all your dreams blossom into reality.'}
        </h2>

        <p className="text-sm sm:text-base font-serif italic text-zinc-300 max-w-lg mx-auto leading-relaxed">
          "Like the spring cherry blossoms that greet the world every year, may your days always be filled with renewal, hope, and deep joy."
        </p>

        {/* Make a Birthday Wish Interactive Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleMakeWish}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-sm sm:text-base shadow-2xl shadow-pink-500/30 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95"
          >
            <Flame className="w-5 h-5 text-amber-200 animate-pulse" />
            <span>Make a Birthday Wish 🏮</span>
          </button>

          {onReplay && (
            <button
              onClick={onReplay}
              className="px-6 py-4 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium border border-zinc-700 flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay Opening</span>
            </button>
          )}
        </div>

        {wishMade && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-japanese text-pink-300 tracking-wider pt-2"
          >
            🌸 Wish released into the night sky! 🏮
          </motion.p>
        )}
      </motion.div>
    </section>
  );
};
