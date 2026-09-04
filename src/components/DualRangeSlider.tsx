import React from 'react';
import { formatTime, parseTimeToSeconds } from '../utils/youtube';

interface DualRangeSliderProps {
  duration: number; // in seconds
  startTime: number; // in seconds
  endTime: number; // in seconds
  onChange: (start: number, end: number) => void;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  duration,
  startTime,
  endTime,
  onChange,
}) => {
  const max = Math.max(duration || 300, 10);
  const startPercent = Math.min(100, Math.max(0, (startTime / max) * 100));
  const endPercent = Math.min(100, Math.max(0, (endTime / max) * 100));

  const handleStartSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(parseFloat(e.target.value), endTime - 1);
    onChange(Math.max(0, val), endTime);
  };

  const handleEndSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(parseFloat(e.target.value), startTime + 1);
    onChange(startTime, Math.min(max, val));
  };

  const handleStartTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const secs = parseTimeToSeconds(e.target.value);
    if (secs < endTime) {
      onChange(secs, endTime);
    }
  };

  const handleEndTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const secs = parseTimeToSeconds(e.target.value);
    if (secs > startTime) {
      onChange(startTime, Math.min(max, secs));
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <label className="text-[11px] font-medium text-pink-300 block mb-1">
            Start Time
          </label>
          <input
            type="text"
            defaultValue={formatTime(startTime)}
            key={`start-${startTime}`}
            onBlur={handleStartTimeInput}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="w-full bg-zinc-950 border border-zinc-700 focus:border-pink-500 rounded-lg px-3 py-1.5 font-mono text-zinc-100 text-xs focus:outline-none"
            placeholder="00:00"
          />
        </div>

        <div className="text-center pt-4 text-zinc-500 font-mono">
          →
        </div>

        <div className="flex-1">
          <label className="text-[11px] font-medium text-pink-300 block mb-1">
            End Time
          </label>
          <input
            type="text"
            defaultValue={formatTime(endTime || max)}
            key={`end-${endTime}`}
            onBlur={handleEndTimeInput}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="w-full bg-zinc-950 border border-zinc-700 focus:border-pink-500 rounded-lg px-3 py-1.5 font-mono text-zinc-100 text-xs focus:outline-none"
            placeholder="03:00"
          />
        </div>
      </div>

      <div className="pt-2 pb-1 relative">
        <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
          <span>00:00</span>
          <span className="text-pink-300 font-semibold">
            Selected: {formatTime(Math.max(0, endTime - startTime))}
          </span>
          <span>{formatTime(max)}</span>
        </div>

        <div className="relative h-6 flex items-center">
          <div className="absolute left-0 right-0 h-2 bg-zinc-800 rounded-full" />

          <div
            className="absolute h-2 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full pointer-events-none"
            style={{
              left: `${startPercent}%`,
              width: `${Math.max(0, endPercent - startPercent)}%`,
            }}
          />

          <input
            type="range"
            min="0"
            max={max}
            step="1"
            value={startTime}
            onChange={handleStartSlider}
            className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto cursor-pointer accent-pink-400 h-2 opacity-0 focus:outline-none z-30"
          />

          <input
            type="range"
            min="0"
            max={max}
            step="1"
            value={endTime || max}
            onChange={handleEndSlider}
            className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto cursor-pointer accent-rose-500 h-2 opacity-0 focus:outline-none z-30"
          />

          <div
            className="absolute w-4 h-4 rounded-full bg-white border-2 border-pink-500 shadow-md pointer-events-none transform -translate-x-1/2 z-20"
            style={{ left: `${startPercent}%` }}
          />
          <div
            className="absolute w-4 h-4 rounded-full bg-white border-2 border-rose-500 shadow-md pointer-events-none transform -translate-x-1/2 z-20"
            style={{ left: `${endPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
