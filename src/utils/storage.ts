import { BirthdayData } from '../types/birthday';
import { DEMO_BIRTHDAY } from '../data/demoBirthday';
import { saveBirthdayToApi, duplicateBirthdayOnApi, deleteBirthdayOnApi } from './api';

const STORAGE_KEY = 'sakura_birthdays_v2';
const AUTOSAVE_DRAFT_KEY = 'sakura_autosave_draft';

export function generateUniqueSlug(name: string, currentId: string, existingList: BirthdayData[]): string {
  const baseName = (name || 'birthday')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'birthday';

  let candidate = baseName;
  const currentYear = new Date().getFullYear();
  if (!candidate.includes(currentYear.toString())) {
    candidate = `${candidate}-${currentYear}`;
  }

  const isTaken = (slug: string) => existingList.some((b) => b.slug === slug && b.id !== currentId);

  if (!isTaken(candidate)) {
    return candidate;
  }

  let attempts = 0;
  while (attempts < 10) {
    const suffix = Math.random().toString(36).substring(2, 6);
    const withSuffix = `${candidate}-${suffix}`;
    if (!isTaken(withSuffix)) {
      return withSuffix;
    }
    attempts++;
  }

  return `${candidate}-${Date.now().toString(36)}`;
}

export function getAllStoredBirthdays(): BirthdayData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = [DEMO_BIRTHDAY];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [DEMO_BIRTHDAY];
  } catch (e) {
    console.error('Failed to parse stored birthdays', e);
    return [DEMO_BIRTHDAY];
  }
}

export function getStoredBirthday(idOrSlug: string): BirthdayData | null {
  if (
    idOrSlug === 'le-ngoc-han-2026' ||
    idOrSlug === 'demo-le-ngoc-han-2026' ||
    idOrSlug === 'mai-2026' ||
    idOrSlug === 'demo-mai-2026' ||
    idOrSlug === 'demo'
  ) {
    return DEMO_BIRTHDAY;
  }

  const all = getAllStoredBirthdays();
  const found = all.find((b) => b.id === idOrSlug || b.slug === idOrSlug);
  return found || null;
}

export function saveStoredBirthday(data: BirthdayData, isPublish = false): BirthdayData {
  try {
    const all = getAllStoredBirthdays();
    const existingIndex = all.findIndex((b) => b.id === data.id);

    let slug = data.slug;
    if (!slug || existingIndex === -1) {
      slug = generateUniqueSlug(data.name, data.id, all);
    }

    const now = new Date().toISOString();
    const updatedRecord: BirthdayData = {
      ...data,
      slug,
      status: isPublish ? 'published' : (data.status || 'draft'),
      privacy: data.privacy || 'unlisted',
      show_timeline: data.show_timeline !== false,
      show_memories: data.show_memories !== false,
      updated_at: now,
      published_at: isPublish ? (data.published_at || now) : data.published_at,
    };

    if (existingIndex >= 0) {
      all[existingIndex] = updatedRecord;
    } else {
      all.unshift(updatedRecord);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    clearAutoSaveDraft();

    // Async sync to backend
    saveBirthdayToApi(updatedRecord).catch(() => {});

    return updatedRecord;
  } catch (e) {
    console.error('Failed to save birthday', e);
    return data;
  }
}

export function duplicateBirthday(id: string): BirthdayData | null {
  const original = getStoredBirthday(id);
  if (!original) return null;

  const all = getAllStoredBirthdays();
  const newId = `bday-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newSlug = generateUniqueSlug(`${original.name}-copy`, newId, all);

  const duplicate: BirthdayData = {
    ...original,
    id: newId,
    slug: newSlug,
    name: `${original.name} (Copy)`,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: undefined,
  };

  all.unshift(duplicate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  // Async sync to backend
  duplicateBirthdayOnApi(id).catch(() => {});

  return duplicate;
}

export function deleteStoredBirthday(id: string): boolean {
  if (
    id === 'demo-le-ngoc-han-2026' ||
    id === 'le-ngoc-han-2026' ||
    id === 'demo-mai-2026' ||
    id === 'mai-2026'
  ) {
    return false;
  }

  try {
    const all = getAllStoredBirthdays().filter((b) => b.id !== id && b.slug !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    // Async sync to backend
    deleteBirthdayOnApi(id).catch(() => {});

    return true;
  } catch (e) {
    console.error('Failed to delete birthday', e);
    return false;
  }
}

export function saveAutoSaveDraft(data: BirthdayData): void {
  try {
    localStorage.setItem(
      AUTOSAVE_DRAFT_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.warn('Could not save draft to local storage', e);
  }
}

export function getAutoSaveDraft(): { data: BirthdayData; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearAutoSaveDraft(): void {
  try {
    localStorage.removeItem(AUTOSAVE_DRAFT_KEY);
  } catch (e) {
    // Ignore
  }
}
