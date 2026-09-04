// YouTube IFrame API Singleton Controller
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export type PlayerStateCallback = (state: {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isReady: boolean;
  error: string | null;
}) => void;

class YouTubePlayerController {
  private player: any = null;
  private isApiLoaded = false;
  private isReady = false;
  private isPlaying = false;
  private currentVideoId: string | null = null;
  private startTime = 0;
  private endTime = 0;
  private duration = 0;
  private volume = 65;
  private isLoop = true;
  private timeCheckInterval: number | null = null;
  private listeners: Set<PlayerStateCallback> = new Set();
  private hostElementId = 'sakura-yt-audio-host';
  private error: string | null = null;
  private unmuteTimer: number | null = null;

  constructor() {
    this.loadYouTubeIframeAPI();
  }

  private loadYouTubeIframeAPI() {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      this.isApiLoaded = true;
      return;
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      this.isApiLoaded = true;
      this.notifyListeners();
    };

    if (!document.getElementById('youtube-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }

  private ensureHostElement(): HTMLElement {
    let host = document.getElementById(this.hostElementId);
    if (!host) {
      host = document.createElement('div');
      host.id = this.hostElementId;
      host.style.position = 'fixed';
      host.style.bottom = '-9999px';
      host.style.left = '-9999px';
      host.style.width = '240px';
      host.style.height = '160px';
      host.style.opacity = '0.01';
      host.style.pointerEvents = 'none';
      host.style.zIndex = '-9999';
      document.body.appendChild(host);
    }
    return host;
  }

  public initPlayer(
    videoId: string,
    startTime = 0,
    endTime = 0,
    volume = 65,
    loop = true,
    autoPlay = false
  ): Promise<void> {
    return new Promise((resolve) => {
      this.currentVideoId = videoId;
      this.startTime = startTime;
      this.endTime = endTime;
      this.volume = volume;
      this.isLoop = loop;
      this.error = null;

      const create = () => {
        const host = this.ensureHostElement();

        if (this.player && typeof this.player.cueVideoById === 'function') {
          try {
            this.player.cueVideoById({
              videoId,
              startSeconds: startTime,
            });
            this.player.setVolume(this.volume);
            if (autoPlay) {
              this.playMutedThenUnmute();
            }
            resolve();
            return;
          } catch (e) {
            console.warn('Error reusing YouTube player, recreating...', e);
          }
        }

        host.innerHTML = '<div id="sakura-yt-player-target"></div>';

        this.player = new window.YT.Player('sakura-yt-player-target', {
          height: '160',
          width: '240',
          videoId,
          playerVars: {
            // autoplay muted — allowed by all browsers
            autoplay: autoPlay ? 1 : 0,
            mute: autoPlay ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            start: startTime,
          },
          events: {
            onReady: (event: any) => {
              this.isReady = true;
              this.player = event.target;
              this.duration = this.player.getDuration() || 0;
              if (this.endTime === 0 && this.duration > 0) {
                this.endTime = Math.floor(this.duration);
              }
              if (autoPlay) {
                // Player is already autoplaying muted — now unmute after 800ms
                this.scheduleUnmute();
              } else {
                // Set proper volume for when user manually presses play
                this.player.setVolume(this.volume);
              }
              this.notifyListeners();
              resolve();
            },
            onStateChange: (event: any) => {
              if (event.data === 1) {
                // Playing
                this.isPlaying = true;
                this.startTimeChecker();
              } else {
                this.isPlaying = false;
                if (event.data === 0) {
                  // Ended
                  if (this.isLoop) {
                    this.seekTo(this.startTime);
                    this.player.playVideo();
                  } else {
                    this.stopTimeChecker();
                  }
                }
              }
              this.notifyListeners();
            },
            onError: (event: any) => {
              const code = event.data;
              let msg = 'Could not load YouTube audio.';
              if (code === 2) msg = 'Invalid YouTube Video ID.';
              else if (code === 100) msg = 'Video not found or is private.';
              else if (code === 101 || code === 150) msg = 'Embedding disabled for this video by owner.';

              this.error = msg;
              this.isPlaying = false;
              this.stopTimeChecker();
              this.notifyListeners();
            },
          },
        });
      };

      if (window.YT && window.YT.Player) {
        create();
      } else {
        const interval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(interval);
            create();
          }
        }, 100);
      }
    });
  }

  /**
   * Start muted (allowed by browser) then gradually unmute.
   * This is the only reliable cross-browser autoplay approach.
   */
  private scheduleUnmute() {
    if (this.unmuteTimer) clearTimeout(this.unmuteTimer);
    this.unmuteTimer = window.setTimeout(() => {
      if (this.player && typeof this.player.unMute === 'function') {
        try {
          this.player.unMute();
          this.player.setVolume(this.volume);
          this.isPlaying = true;
          this.startTimeChecker();
          this.notifyListeners();
        } catch (e) {
          console.warn('Unmute error', e);
        }
      }
    }, 800);
  }

  /**
   * Play video muted first, then unmute — bypasses autoplay restrictions.
   */
  private playMutedThenUnmute() {
    if (!this.player) return;
    try {
      this.player.mute();
      const cur = this.player.getCurrentTime?.() ?? 0;
      if (cur < this.startTime || (this.endTime > 0 && cur >= this.endTime)) {
        this.player.seekTo(this.startTime, true);
      }
      this.player.playVideo();
      this.scheduleUnmute();
    } catch (e) {
      console.warn('Muted autoplay error', e);
    }
  }

  private startTimeChecker() {
    this.stopTimeChecker();
    this.timeCheckInterval = window.setInterval(() => {
      if (!this.player || typeof this.player.getCurrentTime !== 'function') return;

      const current = this.player.getCurrentTime();
      this.duration = this.player.getDuration() || this.duration;

      if (this.endTime > 0 && current >= this.endTime) {
        if (this.isLoop) {
          this.player.seekTo(this.startTime, true);
        } else {
          this.pause();
          this.player.seekTo(this.startTime, true);
        }
      }

      this.notifyListeners();
    }, 250);
  }

  private stopTimeChecker() {
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
      this.timeCheckInterval = null;
    }
  }

  public play() {
    if (this.player && typeof this.player.playVideo === 'function') {
      try {
        const cur = this.player.getCurrentTime?.() ?? 0;
        if (cur < this.startTime || (this.endTime > 0 && cur >= this.endTime)) {
          this.player.seekTo(this.startTime, true);
        }
        // Use muted-then-unmute trick for manual play too (safer)
        this.playMutedThenUnmute();
      } catch (e) {
        console.warn('Autoplay blocked or player error', e);
      }
    }
  }

  public pause() {
    if (this.unmuteTimer) {
      clearTimeout(this.unmuteTimer);
      this.unmuteTimer = null;
    }
    if (this.player && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
        this.isPlaying = false;
        this.stopTimeChecker();
        this.notifyListeners();
      } catch (e) {
        console.warn('Pause error', e);
      }
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public seekTo(seconds: number) {
    if (this.player && typeof this.player.seekTo === 'function') {
      this.player.seekTo(seconds, true);
      this.notifyListeners();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(100, vol));
    if (this.player && typeof this.player.setVolume === 'function') {
      this.player.setVolume(this.volume);
    }
    this.notifyListeners();
  }

  public setTimeRange(start: number, end: number) {
    this.startTime = start;
    this.endTime = end;
    this.notifyListeners();
  }

  public setLoop(loop: boolean) {
    this.isLoop = loop;
    this.notifyListeners();
  }

  public getCurrentTime(): number {
    if (this.player && typeof this.player.getCurrentTime === 'function') {
      return this.player.getCurrentTime() || 0;
    }
    return 0;
  }

  public getDuration(): number {
    if (this.player && typeof this.player.getDuration === 'function') {
      return this.player.getDuration() || this.duration;
    }
    return this.duration;
  }

  public subscribe(cb: PlayerStateCallback): () => void {
    this.listeners.add(cb);
    cb({
      isPlaying: this.isPlaying,
      currentTime: this.getCurrentTime(),
      duration: this.getDuration(),
      isReady: this.isReady,
      error: this.error,
    });
    return () => this.listeners.delete(cb);
  }

  private notifyListeners() {
    const payload = {
      isPlaying: this.isPlaying,
      currentTime: this.getCurrentTime(),
      duration: this.getDuration(),
      isReady: this.isReady,
      error: this.error,
    };
    this.listeners.forEach((cb) => cb(payload));
  }

  public destroy() {
    this.stopTimeChecker();
    if (this.unmuteTimer) clearTimeout(this.unmuteTimer);
    this.pause();
    this.listeners.clear();
  }
}

export const youtubeAudioPlayer = new YouTubePlayerController();
