// YouTube Utility for URL Parsing, ID Extraction, and Time Formatting

/**
 * Extracts an 11-character YouTube video ID from various YouTube URL formats.
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const candidate = match[1] || match[7];
      if (candidate && candidate.length === 11) {
        return candidate;
      }
    }
  }

  return null;
}

/**
 * Formats seconds into MM:SS format (e.g. 83 -> 01:23)
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parses MM:SS or raw number string to seconds
 */
export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const str = timeStr.trim();
  if (str.includes(':')) {
    const parts = str.split(':');
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return Math.max(0, mins * 60 + secs);
  }
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Fetches basic YouTube video metadata (title, author) via noembed/oembed
 */
export async function fetchYouTubeMetadata(videoId: string): Promise<{ title: string; author: string; thumbnail: string }> {
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return {
          title: data.title,
          author: data.author_name || 'YouTube Music',
          thumbnail: data.thumbnail_url || thumbnail,
        };
      }
    }
  } catch (e) {
    console.warn('Could not fetch oEmbed metadata for YouTube video', e);
  }

  return {
    title: 'YouTube Birthday Background Track',
    author: 'YouTube Audio',
    thumbnail,
  };
}
