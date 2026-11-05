/**
 * Lumina Wallpaper Studio - Local Creations Cache & Storage
 * 
 * Persists generated wallpapers in localStorage with rendered thumbnails,
 * allowing users to view, restore, share, or delete past creations.
 */

import { ShareConfig } from './share';

export interface SavedCreation {
  id: string;
  code: string;
  createdAt: number;
  thumbnail: string;
  moduleName: string;
  deviceName: string;
  paletteName: string;
  theme: 'auto' | 'light' | 'dark';
  orientation: 'desktop' | 'mobile';
  config: ShareConfig;
}

const STORAGE_KEY = 'lumina_saved_creations';
const MAX_SAVED = 30;

/**
 * Retrieves all saved creations from localStorage ordered by newest first
 */
export function getSavedCreations(): SavedCreation[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedCreation[];
  } catch (err) {
    console.warn('Failed to read saved creations from localStorage:', err);
    return [];
  }
}

/**
 * Adds a new creation to localStorage history (keeps up to MAX_SAVED)
 */
export function saveCreation(creation: SavedCreation): SavedCreation[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const current = getSavedCreations();
    // Avoid exact duplicate codes in history
    const filtered = current.filter((c) => c.code !== creation.code);
    const updated = [creation, ...filtered].slice(0, MAX_SAVED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save creation to localStorage:', err);
    return [];
  }
}

/**
 * Deletes a single creation from localStorage
 */
export function deleteCreation(id: string): SavedCreation[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const current = getSavedCreations();
    const updated = current.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete creation from localStorage:', err);
    return [];
  }
}

/**
 * Clears all creations from history
 */
export function clearAllCreations(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
