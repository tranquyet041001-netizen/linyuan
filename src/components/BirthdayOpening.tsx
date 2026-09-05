import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import { ThemeConfig } from '../types/birthday';

interface BirthdayOpeningProps {
  name: string;
  theme: ThemeConfig;
  onOpen: () => void;
}

export const BirthdayOpening: React.FC<BirthdayOpeningProps> = ({
  name,
  theme,
  onOpen,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleTrigger = () => {
    setIsOpening(true);
    setTimeout(() => {
      onOpen();
    }, 900);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isOpening ? 0 : 1, scale: isOpening ? 1.08 : 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${theme.bgGradient} ${theme.textColor} overflow-hidden p-6`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,183,197,0.15)_0,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center flex flex-col items-center">
        {/* Japanese Hanko Seal Stamp */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: -4 }}
          transition={{ type: 'spring', damping: 14, delay: 0.2 }}
          className={`mb-8 hanko-stamp px-4 py-1.5 text-xs sm:text-sm tracking-widest ${
            theme.id === 'pure-sakura'
              ? 'text-amber-900 border-amber-700 bg-amber-50/90 shadow-sm'
              : 'text-sakura-crimson border-sakura-crimson bg-white/20'
          } backdrop-blur-sm`}
        >
          祝 • 誕生日の贈り物
        </motion.div>

        {/* Japanese Calligraphy Greeting & Recipient Name */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="space-y-4 mb-8 w-full"
        >
          <span className={`text-xs sm:text-sm font-japanese tracking-[0.35em] ${
            theme.id === 'pure-sakura'
              ? 'text-amber-800 font-bold'
              : theme.isDark 
              ? 'text-pink-400 font-semibold' 
              : 'text-pink-600 font-bold'
          } block uppercase`}>
            A Special Day for
          </span>
          
          <h1 className={`text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-transparent bg-clip-text ${
            theme.id === 'pure-sakura'
              ? 'bg-gradient-to-r from-stone-950 via-amber-950 to-stone-800 drop-shadow-sm'
              : theme.id === 'sakura-day'
              ? 'bg-gradient-to-r from-rose-950 via-pink-900 to-rose-800 drop-shadow-sm'
              : theme.isDark 
              ? 'bg-gradient-to-r from-pink-300 via-rose-200 to-pink-100 drop-shadow-md' 
              : 'bg-gradient-to-r from-rose-950 via-pink-900 to-rose-800 drop-shadow-sm'
          } tracking-normal py-2 px-2 leading-[1.3] break-words`}>
            {name}
          </h1>

          <div className="flex items-center justify-center gap-3 pt-2">
            <span className={`h-[1px] w-12 ${theme.id === 'pure-sakura' ? 'bg-amber-600/40' : theme.isDark ? 'bg-pink-400/40' : 'bg-pink-500/40'}`} />
            <span className={`text-sm sm:text-base font-serif italic ${
              theme.id === 'pure-sakura'
                ? 'text-amber-900 font-medium'
                : theme.isDark 
                ? 'text-pink-300/90 font-light' 
                : 'text-pink-800 font-medium'
            } tracking-widest`}>
              お誕生日おめでとう
            </span>
            <span className={`h-[1px] w-12 ${theme.id === 'pure-sakura' ? 'bg-amber-600/40' : theme.isDark ? 'bg-pink-400/40' : 'bg-pink-500/40'}`} />
          </div>
        </motion.div>

        {/* Invitation Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className={`text-xs sm:text-sm ${
            theme.id === 'pure-sakura'
              ? 'text-stone-600 font-normal'
              : theme.isDark 
              ? 'text-zinc-300 font-light' 
              : 'text-zinc-600 font-normal'
          } max-w-sm font-serif leading-relaxed mb-10 italic`}
        >
          "A quiet sanctuary of cherry blossoms and treasured memories, crafted especially for your celebration."
        </motion.p>

        {/* Open Button */}
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          onClick={handleTrigger}
          className={`group relative px-8 py-4 rounded-full ${
            theme.id === 'pure-sakura'
              ? 'bg-gradient-to-r from-amber-700 via-stone-800 to-amber-900 text-amber-50 shadow-amber-900/25 border-amber-300/30'
              : 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-pink-500/30 border-white/30'
          } font-semibold text-sm sm:text-base shadow-2xl border flex items-center gap-3 overflow-hidden cursor-pointer`}
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <span className="text-lg">{theme.id === 'pure-sakura' ? '🤍' : '🌸'}</span>
          <span className="font-japanese tracking-wide font-bold">
            Open Birthday
          </span>
          <Sparkles className={`w-4 h-4 ${theme.id === 'pure-sakura' ? 'text-amber-200' : 'text-pink-200'} group-hover:rotate-12 transition-transform`} />
        </motion.button>
      </div>
    </motion.div>
  );
};
