import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Play, Pause, Disc, RotateCw, X, Youtube } from 'lucide-react';
import { sakuraAudio } from '../utils/audioSynthesizer';
import { youtubeAudioPlayer } from '../utils/youtubePlayer';
import { formatTime } from '../utils/youtube';
import { BirthdayData, ThemeConfig } from '../types/birthday';

interface MusicPlayerProps {
  birthday: BirthdayData;
  theme: ThemeConfig;
  autoPlayTrigger?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  birthday,
  theme,
  autoPlayTrigger = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(birthday.music_volume ?? 65);
  const [isMuted, setIsMuted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoop, setIsLoop] = useState(birthday.music_loop ?? true);

  const isYouTube = birthday.music_type === 'youtube' && !!birthday.youtube_video_id;
  const isAmbient = birthday.music_type === 'ambient';
  const isCustomMp3 = birthday.music_type === 'upload_mp3';
  const isNone = birthday.music_type === 'none';

  const { 
    music_type, 
    youtube_video_id, 
    music_start_time, 
    music_end_time, 
    music_volume, 
    music_loop, 
    music_url 
  } = birthday;

  useEffect(() => {
    if (isNone) {
      youtubeAudioPlayer.pause();
      sakuraAudio.pause();
      setIsPlaying(false);
      return;
    }

    if (isYouTube && youtube_video_id) {
      sakuraAudio.pause();
      youtubeAudioPlayer.initPlayer(
        youtube_video_id,
        music_start_time || 0,
        music_end_time || 0,
        music_volume ?? 65,
        music_loop ?? true,
        false  // don't autoplay on init — autoPlayTrigger handles this
      );
    } else if (isCustomMp3) {
      youtubeAudioPlayer.pause();
      sakuraAudio.setCustomAudioUrl(music_url);
      sakuraAudio.setVolume((music_volume ?? 65) / 100);
    } else if (isAmbient) {
      youtubeAudioPlayer.pause();
      sakuraAudio.setCustomAudioUrl('');
      sakuraAudio.setVolume((music_volume ?? 65) / 100);
    }
  }, [
    isYouTube, isAmbient, isCustomMp3, isNone, 
    youtube_video_id, music_start_time, music_end_time, music_volume, music_loop, music_url
  ]);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isYouTube) {
      setIsReady(true);
      return;
    }
    const unsub = youtubeAudioPlayer.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
      setIsReady(state.isReady);
    });
    return () => unsub();
  }, [isYouTube]);

  useEffect(() => {
    if (autoPlayTrigger && !isPlaying && !isNone) {
      if (isYouTube) {
        youtubeAudioPlayer.play();
        // Only fallback to ambient if YouTube definitively errors out
        const fallbackTimer = setTimeout(() => {
          if (!youtubeAudioPlayer.getIsPlaying() && youtubeAudioPlayer.getError()) {
            console.log('YouTube error encountered, falling back to ambient audio');
            sakuraAudio.play();
            setIsPlaying(true);
          }
        }, 4000);
        return () => clearTimeout(fallbackTimer);
      } else {
        sakuraAudio.play();
        setIsPlaying(true);
      }
    }
  }, [autoPlayTrigger, isPlaying, isYouTube, isNone, isReady]);

  if (isNone) return null;

  const handleTogglePlay = () => {
    if (isYouTube) {
      const next = youtubeAudioPlayer.toggle();
      setIsPlaying(next);
      if (!next && youtubeAudioPlayer.getError()) {
        sakuraAudio.play();
        setIsPlaying(true);
      }
    } else {
      const next = sakuraAudio.toggle();
      setIsPlaying(next);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);
    
    if (isYouTube) {
      youtubeAudioPlayer.setVolume(newVol);
    } else {
      sakuraAudio.setVolume(newVol / 100);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      handleVolumeChange(volume || 65);
    } else {
      setIsMuted(true);
      if (isYouTube) {
        youtubeAudioPlayer.setVolume(0);
      } else {
        sakuraAudio.setVolume(0);
      }
    }
  };

  const handleToggleLoop = () => {
    const next = !isLoop;
    setIsLoop(next);
    if (isYouTube) {
      youtubeAudioPlayer.setLoop(next);
    }
  };

  const trackTitle = birthday.music_title || (isYouTube ? 'YouTube Background Soundtrack' : 'Koto Serenade — Spring Dream');

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {showModal && (
        <div className={`mb-3 w-72 p-4 rounded-3xl shadow-2xl border ${theme.cardBg} ${theme.cardBorder} backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs text-zinc-100 select-none`}>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">🎵</span>
              <div className="min-w-0">
                <h4 className="font-semibold text-zinc-100 truncate text-[11px]">
                  Birthday Music
                </h4>
                <p className="text-[10px] text-pink-300/80 truncate">
                  {trackTitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePlay}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-pink-500/25 transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>
                    {isYouTube && birthday.music_end_time
                      ? formatTime(birthday.music_end_time)
                      : isYouTube && birthday.music_duration
                      ? formatTime(birthday.music_duration)
                      : 'Ambient'}
                  </span>
                </div>
                <div className="w-full h-1 bg-zinc-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-300"
                    style={{
                      width: isYouTube && birthday.music_duration
                        ? `${Math.min(100, (currentTime / birthday.music_duration) * 100)}%`
                        : isPlaying ? '100%' : '0%',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleToggleMute}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <span className="font-mono text-[10px] text-zinc-400 w-7 text-right">
                {isMuted ? 0 : volume}%
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 text-pink-400" />
                <span>Loop Section</span>
              </span>
              <button
                onClick={handleToggleLoop}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                  isLoop
                    ? 'bg-pink-600/80 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isLoop ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (!isPlaying) {
            handleTogglePlay();
          }
          setShowModal(!showModal);
        }}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border transition-all duration-300 ${
          isPlaying
            ? 'bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-500 border-pink-300/60 shadow-pink-500/40 scale-105 ring-4 ring-pink-500/20'
            : 'bg-[#0f172a]/90 hover:bg-[#1a233d] border-pink-500/30 text-zinc-300 hover:text-white shadow-black/50'
        }`}
        title="Background Music Controls"
      >
        {isPlaying ? (
          <div className="flex items-center gap-0.5 h-4">
            <span className="w-0.5 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-3" />
            <span className="w-0.5 bg-white rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-4" />
            <span className="w-0.5 bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
            <span className="w-0.5 bg-white rounded-full animate-[pulse_1.0s_ease-in-out_infinite] h-3.5" />
          </div>
        ) : (
          <Music className="w-5 h-5 text-pink-300" />
        )}
      </button>
    </div>
  );
};
