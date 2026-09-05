import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { TimelineItem, ThemeConfig } from '../types/birthday';

interface BirthdayTimelineProps {
  timeline: TimelineItem[];
  theme: ThemeConfig;
}

export const BirthdayTimeline: React.FC<BirthdayTimelineProps> = ({ timeline, theme }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <section className="relative py-16 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <span className={`text-xs font-japanese tracking-[0.3em] ${
          theme.isDark ? 'text-pink-400' : 'text-pink-600 font-bold'
        } uppercase block mb-1`}>
          歩んできた軌跡
        </span>
        <h2 className={`text-2xl sm:text-4xl font-serif font-bold ${
          theme.isDark ? 'text-white' : 'text-zinc-900'
        } tracking-wide`}>
          Memorable Milestones
        </h2>
        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mt-3" />
      </div>

      {/* Central Spine Tree */}
      <div className={`relative border-l-2 ${
        theme.isDark ? 'border-pink-500/30' : 'border-pink-300'
      } ml-4 sm:ml-32 space-y-12`}>
        {timeline.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className="relative pl-8 sm:pl-10"
          >
            {/* Blooming Sakura Blossom Node */}
            <div className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full ${
              theme.isDark ? 'bg-[#080c18] border-pink-400 shadow-pink-500/30' : 'bg-white border-pink-400 shadow-md'
            } border-2 flex items-center justify-center text-xs`}>
              🌸
            </div>

            {/* Year Tag */}
            <span className={`inline-block px-3 py-1 rounded-full ${
              theme.isDark 
                ? 'bg-pink-950/80 border-pink-500/40 text-pink-300' 
                : 'bg-pink-100 border-pink-300 text-pink-800'
            } border text-xs font-mono font-bold mb-2`}>
              {item.year}
            </span>

            {/* Card Content */}
            <div className={`p-5 rounded-2xl border backdrop-blur-md space-y-1.5 ${
              theme.isDark 
                ? 'bg-[#0f172a]/70 border-pink-500/20 text-zinc-300' 
                : 'bg-white/90 border-pink-200/80 text-zinc-800 shadow-md'
            }`}>
              <h3 className={`font-serif text-lg font-bold ${
                theme.isDark ? 'text-white' : 'text-zinc-900'
              } tracking-wide`}>
                {item.title}
              </h3>
              <p className={`text-xs sm:text-sm ${
                theme.isDark ? 'text-zinc-300/90 font-light' : 'text-zinc-600 font-normal'
              } leading-relaxed font-sans`}>
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
