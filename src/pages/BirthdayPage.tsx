import React, { useState, useEffect } from 'react';
import { BirthdayData, ThemeConfig } from '../types/birthday';
import { THEMES } from '../data/themes';
import { DEMO_BIRTHDAY } from '../data/demoBirthday';
import { SakuraCanvas } from '../components/SakuraCanvas';
import { BirthdayOpening } from '../components/BirthdayOpening';
import { BirthdayHero } from '../components/BirthdayHero';
import { BirthdayMessage } from '../components/BirthdayMessage';
import { MemoryGallery } from '../components/MemoryGallery';
import { BirthdayTimeline } from '../components/BirthdayTimeline';
import { FinalMessage } from '../components/FinalMessage';
import { MusicPlayer } from '../components/MusicPlayer';
import { getStoredBirthday, saveStoredBirthday } from '../utils/storage';
import { decodeBirthdayFromUrlPayload } from '../utils/shareEncoder';
import { fetchBirthdayByIdOrSlug } from '../utils/api';

interface BirthdayPageProps {
  birthdayId?: string;
  initialData?: BirthdayData;
  isPreview?: boolean;
}

export const BirthdayPage: React.FC<BirthdayPageProps> = ({
  birthdayId,
  initialData,
  isPreview = false,
}) => {
  const [birthday, setBirthday] = useState<BirthdayData>(() => {
    if (initialData) return initialData;

    // Check for encoded URL payload in hash or query parameters
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    let payload = '';

    if (hash.includes('?d=')) {
      payload = hash.split('?d=')[1]?.split('&')[0];
    } else if (hash.includes('?data=')) {
      payload = hash.split('?data=')[1]?.split('&')[0];
    } else if (search.includes('?d=')) {
      payload = new URLSearchParams(search).get('d') || '';
    } else if (search.includes('?data=')) {
      payload = new URLSearchParams(search).get('data') || '';
    }

    if (payload) {
      const decoded = decodeBirthdayFromUrlPayload(payload);
      if (decoded) {
        // Cache to localStorage
        try { saveStoredBirthday(decoded, true); } catch (e) {}
        return decoded;
      }
    }

    if (birthdayId) {
      const stored = getStoredBirthday(birthdayId);
      if (stored) return stored;
    }

    return DEMO_BIRTHDAY;
  });

  const [hasOpened, setHasOpened] = useState(!birthday.animations?.cinematicOpening || isPreview);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);

  // Auto-play music ONLY on public share page (not in preview/editor).
  // If cinematic opening is disabled, start after 1.5s.
  // If cinematic opening is enabled, music starts when user clicks "Open Birthday".
  useEffect(() => {
    if (isPreview) return; // Never autoplay in editor preview
    if (!birthday.animations?.cinematicOpening) {
      const timer = setTimeout(() => setAutoPlayAudio(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [birthday.animations?.cinematicOpening, isPreview]);

  useEffect(() => {
    if (initialData) {
      setBirthday(initialData);
      return;
    }

    // 1. Check URL encoded payload
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    let payload = '';

    if (hash.includes('?d=')) {
      payload = hash.split('?d=')[1]?.split('&')[0];
    } else if (hash.includes('?data=')) {
      payload = hash.split('?data=')[1]?.split('&')[0];
    } else if (search.includes('?d=')) {
      payload = new URLSearchParams(search).get('d') || '';
    } else if (search.includes('?data=')) {
      payload = new URLSearchParams(search).get('data') || '';
    }

    if (payload) {
      const decoded = decodeBirthdayFromUrlPayload(payload);
      if (decoded) {
        setBirthday(decoded);
        try { saveStoredBirthday(decoded, true); } catch (e) {}
        return;
      }
    }

    // 2. Check LocalStorage
    if (birthdayId) {
      const stored = getStoredBirthday(birthdayId);
      if (stored) {
        setBirthday(stored);
        return;
      }

      // 3. Fallback: Fetch from Backend REST API
      fetchBirthdayByIdOrSlug(birthdayId).then((fromApi) => {
        if (fromApi) {
          setBirthday(fromApi);
          try { saveStoredBirthday(fromApi, true); } catch (e) {}
        } else if (
          birthdayId === 'le-ngoc-han-2026' || 
          birthdayId === 'demo-le-ngoc-han-2026' ||
          birthdayId === 'mai-2026' || 
          birthdayId === 'demo'
        ) {
          setBirthday(DEMO_BIRTHDAY);
        }
      });
    }
  }, [birthdayId, initialData]);

  const theme: ThemeConfig = THEMES[birthday.theme] || THEMES['sakura-night'];

  const handleOpenBirthday = () => {
    setBurstTrigger((prev) => prev + 1);
    setHasOpened(true);
    setAutoPlayAudio(true);
  };

  const handleReplayOpening = () => {
    setHasOpened(false);
  };

  return (
    <div className={`relative min-h-screen ${theme.bgGradient} ${theme.textColor} transition-colors duration-700 overflow-x-hidden selection:bg-pink-500 selection:text-white`}>
      {/* 1. Realistic Sakura Canvas Particle System */}
      {birthday.animations?.particles && (
        <SakuraCanvas
          settings={birthday.sakura_settings}
          theme={theme}
          interactive={birthday.animations?.mouseInteraction}
          burstTrigger={burstTrigger}
        />
      )}

      {/* 2. Fullscreen Cinematic Opening Experience */}
      {!hasOpened && birthday.animations?.cinematicOpening && (
        <BirthdayOpening
          name={birthday.name}
          theme={theme}
          onOpen={handleOpenBirthday}
        />
      )}

      {/* 3. Main Birthday Journey Content */}
      <main className={`relative z-20 transition-opacity duration-1000 ${hasOpened ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <BirthdayHero birthday={birthday} theme={theme} />
        <BirthdayMessage birthday={birthday} theme={theme} />
        
        {/* 4. Memory Polaroid Gallery (Conditional) */}
        {birthday.show_memories !== false && birthday.memories && birthday.memories.length > 0 && (
          <MemoryGallery memories={birthday.memories} theme={theme} />
        )}

        {/* 5. Memorable Milestones Timeline (Conditional Toggle) */}
        {birthday.show_timeline !== false && birthday.timeline && birthday.timeline.length > 0 && (
          <BirthdayTimeline timeline={birthday.timeline} theme={theme} />
        )}

        <FinalMessage birthday={birthday} theme={theme} onReplay={handleReplayOpening} />
      </main>

      {/* 6. Floating Music Player */}
      <MusicPlayer
        birthday={birthday}
        theme={theme}
        autoPlayTrigger={autoPlayAudio}
      />
    </div>
  );
};
