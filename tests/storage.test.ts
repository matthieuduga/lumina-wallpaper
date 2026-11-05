import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedCreations,
  saveCreation,
  deleteCreation,
  clearAllCreations,
  SavedCreation,
} from '../src/engine/storage';

describe('Local Creations Storage', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = String(val);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
    (globalThis as unknown as { localStorage: typeof mockStorage }).localStorage = mockStorage;
    clearAllCreations();
  });

  const mockCreation: SavedCreation = {
    id: 'test_1',
    code: 'code_abc',
    createdAt: Date.now(),
    thumbnail: 'data:image/jpeg;base64,1234',
    moduleName: 'Glass Pills',
    deviceName: 'MacBook Air M2',
    paletteName: 'Deep Space',
    theme: 'auto',
    orientation: 'desktop',
    config: {
      moduleId: 'glass-pills',
      deviceId: 'macbook-air-m2',
      isCustomRes: false,
      orientation: 'desktop',
      paletteId: 'deep-space',
      theme: 'auto',
    },
  };

  it('initially returns an empty list', () => {
    expect(getSavedCreations()).toEqual([]);
  });

  it('saves new creation and prepends it to the list', () => {
    const list = saveCreation(mockCreation);
    expect(list.length).toBe(1);
    expect(list[0].id).toBe('test_1');

    const second: SavedCreation = {
      ...mockCreation,
      id: 'test_2',
      code: 'code_def',
      paletteName: 'Ocean Breeze',
    };
    const updated = saveCreation(second);
    expect(updated.length).toBe(2);
    expect(updated[0].id).toBe('test_2'); // newest first
  });

  it('deduplicates creations with identical share code', () => {
    saveCreation(mockCreation);
    const updated = saveCreation({ ...mockCreation, id: 'test_duplicate' });
    expect(updated.length).toBe(1);
    expect(updated[0].id).toBe('test_duplicate');
  });

  it('deletes creation by id', () => {
    saveCreation(mockCreation);
    const afterDelete = deleteCreation('test_1');
    expect(afterDelete.length).toBe(0);
  });

  it('clears all creations', () => {
    saveCreation(mockCreation);
    clearAllCreations();
    expect(getSavedCreations()).toEqual([]);
  });
});
