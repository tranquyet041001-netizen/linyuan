import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Youtube, 
  Trash2, 
  Volume2, 
  RotateCw, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Loader2,
  ExternalLink,
  Radio,
  FileAudio
} from 'lucide-react';
import { BirthdayData, MusicType } from '../types/birthday';
import { extractYouTubeVideoId, formatTime, fetchYouTubeMetadata } from '../utils/youtube';
import { youtubeAudioPlayer } from '../utils/youtubePlayer';
import { sakuraAudio } from '../utils/audioSynthesizer';
import { DualRangeSlider } from './DualRangeSlider';

interface MusicEditorProps {
  data: BirthdayData;
  onChange: (updates: Partial<BirthdayData>) => void;
}

export const MusicEditor: React.FC<MusicEditorProps> = ({ data, onChange }) => {
  const [urlInput, setUrlInput] = useState(data.youtube_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  useEffect(() => {
    const unsub = youtubeAudioPlayer.subscribe((state) => {
      setIsPreviewPlaying(state.isPlaying);
      if (state.error) {
        setErrorMessage(state.error);
      }
    });
    return () => {
      unsub();
      youtubeAudioPlayer.pause();
    };
  }, []);

  const handleLoadYouTube = async () => {
    setErrorMessage(null);
    const videoId = extractYouTubeVideoId(urlInput);

    if (!videoId) {
      setErrorMessage('Please enter a valid YouTube URL (e.g. youtube.com/watch?v=... or youtu.be/...)');
      return;
    }

    setIsLoading(true);

    try {
      const meta = await fetchYouTubeMetadata(videoId);
      
      await youtubeAudioPlayer.initPlayer(
        videoId,
        0,
        0,
        data.music_volume ?? 65,
        data.music_loop ?? true,
        false
      );

      setTimeout(() => {
        const dur = Math.floor(youtubeAudioPlayer.getDuration()) || 240;
        const initialStart = 0;
        const initialEnd = dur;

        onChange({
          music_type: 'youtube',
          youtube_url: urlInput,
          youtube_video_id: videoId,
          music_title: meta.title,
          music_duration: dur,
          music_start_time: initialStart,
          music_end_time: initialEnd,
          music_volume: data.music_volume ?? 65,
          music_loop: data.music_loop ?? true,
          music_enabled: true,
          start_with_opening: data.start_with_opening ?? true,
        });

        setIsLoading(false);
      }, 800);
    } catch (e) {
      setErrorMessage('Failed to load YouTube video details. Please verify the URL.');
      setIsLoading(false);
    }
  };

  const handleRemoveYouTube = () => {
    youtubeAudioPlayer.pause();
    setUrlInput('');
    onChange({
      youtube_url: '',
      youtube_video_id: '',
      music_title: '',
      music_start_time: 0,
      music_end_time: 0,
      music_duration: 0,
    });
  };

  const handleTogglePreview = () => {
    if (!data.youtube_video_id) return;

    if (isPreviewPlaying) {
      youtubeAudioPlayer.pause();
    } else {
      youtubeAudioPlayer.setTimeRange(data.music_start_time || 0, data.music_end_time || 0);
      youtubeAudioPlayer.setVolume(data.music_volume ?? 65);
      youtubeAudioPlayer.setLoop(data.music_loop ?? true);
      youtubeAudioPlayer.play();
    }
  };

  const handleRangeChange = (start: number, end: number) => {
    onChange({
      music_start_time: start,
      music_end_time: end,
    });
    youtubeAudioPlayer.setTimeRange(start, end);
  };

  const handleVolumeChange = (vol: number) => {
    onChange({ music_volume: vol });
    youtubeAudioPlayer.setVolume(vol);
  };

  const handleLoopChange = (loop: boolean) => {
    onChange({ music_loop: loop });
    youtubeAudioPlayer.setLoop(loop);
  };

  return (
    <div className="p-5 space-y-6 text-xs text-zinc-300">
      <div>
        <h3 className="font-semibold text-sm text-pink-300 uppercase tracking-wider flex items-center gap-2 mb-1">
          <Music className="w-4 h-4" />
          <span>Background Music System</span>
        </h3>
        <p className="text-zinc-400 text-[11px]">
          Choose the atmosphere soundtrack that accompanies your Sakura experience
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-zinc-400 font-medium block">Music Source</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'youtube', label: 'YouTube Music', icon: Youtube, badge: 'Popular' },
            { id: 'ambient', label: 'Japanese Koto', icon: Sparkles },
            { id: 'upload_mp3', label: 'Custom MP3', icon: FileAudio },
            { id: 'none', label: 'No Music', icon: Radio },
          ].map((src) => {
            const Icon = src.icon;
            const isSelected = data.music_type === src.id;

            return (
              <button
                key={src.id}
                type="button"
                onClick={() => {
                  onChange({ music_type: src.id as MusicType });
                  if (src.id !== 'youtube') {
                    youtubeAudioPlayer.pause();
                  }
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center relative overflow-hidden ${
                  isSelected
                    ? 'border-pink-500 bg-pink-950/40 text-pink-200 ring-2 ring-pink-500/20 shadow-md'
                    : 'border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-400'
                }`}
              >
                {src.badge && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[8px] font-bold bg-pink-600 text-white">
                    {src.badge}
                  </span>
                )}
                <Icon className={`w-4 h-4 ${isSelected ? 'text-pink-400' : 'text-zinc-500'}`} />
                <span className="text-[11px] font-medium">{src.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {data.music_type === 'youtube' && (
        <div className="space-y-5 pt-2 animate-in fade-in duration-200">
          {!data.youtube_video_id ? (
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <label className="text-zinc-300 font-medium block">
                Paste YouTube Link
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-pink-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleLoadYouTube}
                  disabled={isLoading || !urlInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2 transition-colors flex-shrink-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Youtube className="w-4 h-4" />
                      <span>Load Music</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 flex items-center gap-2 text-[10px] text-zinc-500 flex-wrap">
                <span>Recommendations:</span>
                <button
                  type="button"
                  onClick={() => setUrlInput('https://www.youtube.com/watch?v=lTRiuFIWV54')}
                  className="text-pink-400 hover:underline"
                >
                  Lofi Chill Beats
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setUrlInput('https://www.youtube.com/watch?v=3jWRrafhO7M')}
                  className="text-pink-400 hover:underline"
                >
                  Ghibli Piano & Jazz
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-pink-500/30 space-y-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-24 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 relative group border border-zinc-700">
                  <img
                    src={`https://img.youtube.com/vi/${data.youtube_video_id}/hqdefault.jpg`}
                    alt="YouTube Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono text-white">
                    {formatTime(data.music_duration || 0)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5">
                    <Youtube className="w-3 h-3" /> YouTube Audio Track
                  </span>
                  <h4 className="text-xs font-semibold text-zinc-100 truncate">
                    {data.music_title || 'YouTube Background Music'}
                  </h4>
                  <p className="text-[10px] font-mono text-zinc-400 mt-1">
                    ID: {data.youtube_video_id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveYouTube}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                  title="Remove track"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-200">
                    Select Section to Play
                  </span>
                  <span className="text-[10px] font-mono text-pink-400">
                    {formatTime(data.music_start_time || 0)} - {formatTime(data.music_end_time || data.music_duration || 0)}
                  </span>
                </div>

                <DualRangeSlider
                  duration={data.music_duration || 300}
                  startTime={data.music_start_time || 0}
                  endTime={data.music_end_time || data.music_duration || 300}
                  onChange={handleRangeChange}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTogglePreview}
                  className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isPreviewPlaying
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-pink-300 border border-pink-500/30'
                  }`}
                >
                  {isPreviewPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Preview</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Preview Selected Section</span>
                    </>
                  )}
                </button>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 select-none">
                  <input
                    type="checkbox"
                    checked={data.music_loop ?? true}
                    onChange={(e) => handleLoopChange(e.target.checked)}
                    className="rounded accent-pink-500"
                  />
                  <span>Loop selected section</span>
                </label>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Playback Volume</span>
              </span>
              <span className="font-mono text-zinc-400">{data.music_volume ?? 65}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={data.music_volume ?? 65}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">
                Start Music with Opening Animation
              </span>
              <span className="text-[10px] text-zinc-500">
                Begins playback immediately when recipient taps "Open Birthday"
              </span>
            </div>
            <input
              type="checkbox"
              checked={data.start_with_opening ?? true}
              onChange={(e) => onChange({ start_with_opening: e.target.checked })}
              className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {data.music_type === 'ambient' && (
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-pink-300">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold text-xs">Japanese Ambient Synthesizer (Insen scale)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = sakuraAudio.toggle();
                setIsPreviewPlaying(next);
              }}
              className="px-3 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium flex items-center gap-1 transition-colors shadow-md"
            >
              {isPreviewPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPreviewPlaying ? 'Stop' : 'Preview'}</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Serene Japanese Koto & ambient pentatonic piano synthesized directly with Web Audio API. 100% offline & zero dependencies.
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
            <span className="text-[11px] text-zinc-400">Volume</span>
            <span className="font-mono text-zinc-300">{data.music_volume ?? 65}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={data.music_volume ?? 65}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>
      )}

      {data.music_type === 'upload_mp3' && (
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 animate-in fade-in duration-200">
          <label className="text-zinc-300 font-medium block">
            Direct MP3 / Audio URL
          </label>
          <input
            type="text"
            value={data.music_url || ''}
            onChange={(e) => onChange({ music_url: e.target.value })}
            placeholder="https://example.com/song.mp3"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-pink-500 font-mono"
          />
          <div>
            <label className="text-zinc-400 block mb-1">Track Title</label>
            <input
              type="text"
              value={data.music_title || ''}
              onChange={(e) => onChange({ music_title: e.target.value })}
              placeholder="e.g. Spring Sakura Melody"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex flex-col gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              onChange({ music_type: 'ambient' });
              sakuraAudio.play();
              setIsPreviewPlaying(true);
            }}
            className="self-start px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-medium transition-colors"
          >
            Switch to Japanese Koto Ambient (100% Reliable)
          </button>
        </div>
      )}
    </div>
  );
};
