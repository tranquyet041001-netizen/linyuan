import React, { useState, useEffect } from 'react';
import { formatTime, parseTimeToSeconds } from '../utils/youtube';
import { Clock, RotateCcw } from 'lucide-react';

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
  const safeDuration = Number.isFinite(duration) && duration > 0 ? Math.floor(duration) : 300;
  const max = Math.max(safeDuration, 10);
  const safeStart = Number.isFinite(startTime) ? Math.max(0, Math.min(max - 1, Math.floor(startTime))) : 0;
  const safeEnd = Number.isFinite(endTime) && endTime > 0 ? Math.max(safeStart + 1, Math.min(max, Math.floor(endTime))) : max;

  const [startInput, setStartInput] = useState(formatTime(safeStart));
  const [endInput, setEndInput] = useState(formatTime(safeEnd));

  useEffect(() => {
    setStartInput(formatTime(safeStart));
  }, [safeStart]);

  useEffect(() => {
    setEndInput(formatTime(safeEnd));
  }, [safeEnd]);

  const handleStartChange = (val: number) => {
    const clamped = Math.max(0, Math.min(val, safeEnd - 1));
    onChange(clamped, safeEnd);
  };

  const handleEndChange = (val: number) => {
    const clamped = Math.min(max, Math.max(val, safeStart + 1));
    onChange(safeStart, clamped);
  };

  const commitStartInput = () => {
    const secs = parseTimeToSeconds(startInput);
    if (secs < safeEnd) {
      onChange(Math.max(0, secs), safeEnd);
    } else {
      setStartInput(formatTime(safeStart));
    }
  };

  const commitEndInput = () => {
    const secs = parseTimeToSeconds(endInput);
    if (secs > safeStart) {
      onChange(safeStart, Math.min(max, secs));
    } else {
      setEndInput(formatTime(safeEnd));
    }
  };

  const startPercent = Math.min(100, Math.max(0, (safeStart / max) * 100));
  const endPercent = Math.min(100, Math.max(0, (safeEnd / max) * 100));
  const selectedDuration = Math.max(0, safeEnd - safeStart);

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300">
      {/* Visual Timeline Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
          <span className="flex items-center gap-1 text-pink-400">
            <Clock className="w-3 h-3" />
            <span>Đoạn phát: {formatTime(selectedDuration)}</span>
          </span>
          <span>Tổng: {formatTime(max)}</span>
        </div>

        <div className="relative h-3 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden">
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 rounded-full transition-all duration-150 shadow-md shadow-pink-500/30"
            style={{
              left: `${startPercent}%`,
              width: `${Math.max(1, endPercent - startPercent)}%`,
            }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
          <span>00:00</span>
          <span className="text-pink-300 font-semibold">{formatTime(safeStart)} → {formatTime(safeEnd)}</span>
          <span>{formatTime(max)}</span>
        </div>
      </div>

      {/* Two dedicated smooth sliders for Start and End */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Start Slider */}
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-pink-300">
              Điểm bắt đầu (Start)
            </label>
            <input
              type="text"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              onBlur={commitStartInput}
              onKeyDown={(e) => e.key === 'Enter' && commitStartInput()}
              className="w-16 bg-zinc-900 border border-zinc-700 focus:border-pink-500 rounded-md px-2 py-0.5 text-center font-mono text-zinc-100 text-[11px] focus:outline-none"
              placeholder="00:00"
            />
          </div>
          <input
            type="range"
            min="0"
            max={Math.max(1, safeEnd - 1)}
            step="1"
            value={safeStart}
            onChange={(e) => handleStartChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>

        {/* End Slider */}
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-rose-300">
              Điểm kết thúc (End)
            </label>
            <input
              type="text"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              onBlur={commitEndInput}
              onKeyDown={(e) => e.key === 'Enter' && commitEndInput()}
              className="w-16 bg-zinc-900 border border-zinc-700 focus:border-pink-500 rounded-md px-2 py-0.5 text-center font-mono text-zinc-100 text-[11px] focus:outline-none"
              placeholder="03:00"
            />
          </div>
          <input
            type="range"
            min={safeStart + 1}
            max={max}
            step="1"
            value={safeEnd}
            onChange={(e) => handleEndChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-800/80">
        <span className="text-[10px] text-zinc-500 mr-1">Cắt nhanh:</span>
        <button
          type="button"
          onClick={() => onChange(0, max)}
          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-medium transition-colors"
        >
          Toàn bài (Full)
        </button>
        <button
          type="button"
          onClick={() => onChange(0, Math.min(max, 60))}
          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-medium transition-colors"
        >
          60 giây đầu
        </button>
        <button
          type="button"
          onClick={() => onChange(0, Math.min(max, 120))}
          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-medium transition-colors"
        >
          2 phút đầu
        </button>
        <button
          type="button"
          onClick={() => onChange(0, max)}
          className="ml-auto p-1 text-zinc-500 hover:text-pink-400 transition-colors"
          title="Đặt lại"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
