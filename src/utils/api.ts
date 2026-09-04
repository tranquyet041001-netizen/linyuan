import { BirthdayData } from '../types/birthday';

const API_BASE = '/api';

export async function fetchBirthdaysFromApi(): Promise<BirthdayData[] | null> {
  try {
    const res = await fetch(`${API_BASE}/birthdays`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Graceful fallback to localStorage
  }
  return null;
}

export async function fetchBirthdayByIdOrSlug(idOrSlug: string): Promise<BirthdayData | null> {
  try {
    const res = await fetch(`${API_BASE}/birthdays/${encodeURIComponent(idOrSlug)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }
  return null;
}

export async function saveBirthdayToApi(data: BirthdayData): Promise<BirthdayData | null> {
  try {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `${API_BASE}/birthdays/${encodeURIComponent(data.id)}` : `${API_BASE}/birthdays`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API save failed, saved locally instead', e);
  }
  return null;
}

export async function uploadImageToApi(file: File | Blob, fileName?: string): Promise<string | null> {
  try {
    const formData = new FormData();
    const name = fileName || (file instanceof File ? file.name : `photo-${Date.now()}.jpg`);
    formData.append('image', file, name);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return data.url || data.absoluteUrl || null;
    }
  } catch (e) {
    console.warn('Image upload to server failed', e);
  }
  return null;
}

export async function duplicateBirthdayOnApi(id: string): Promise<BirthdayData | null> {
  try {
    const res = await fetch(`${API_BASE}/birthdays/${encodeURIComponent(id)}/duplicate`, {
      method: 'POST',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }
  return null;
}

export async function deleteBirthdayOnApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/birthdays/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
