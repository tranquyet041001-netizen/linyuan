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
        <span className="text-xs font-japanese tracking-[0.3em] text-pink-400 uppercase block mb-1">
          歩んできた軌跡
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
          Memorable Milestones
        </h2>
        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mt-3" />
      </div>

      {/* Central Spine Tree */}
      <div className="relative border-l-2 border-pink-500/30 ml-4 sm:ml-32 space-y-12">
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
            <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-[#080c18] border-2 border-pink-400 flex items-center justify-center text-xs shadow-md shadow-pink-500/30">
              🌸
            </div>

            {/* Year Tag */}
            <span className="inline-block px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs font-mono font-bold mb-2">
              {item.year}
            </span>

            {/* Card Content */}
            <div className="p-5 rounded-2xl bg-[#0f172a]/70 border border-pink-500/20 backdrop-blur-md space-y-1.5">
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed font-sans">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
