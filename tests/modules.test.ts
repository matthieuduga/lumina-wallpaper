import { describe, it, expect } from 'vitest';
import { getAllModules, getModule, registerModule } from '../src/modules';
import { WallpaperModule } from '../src/modules/types';

describe('Wallpaper Module Registry & Architecture', () => {
  it('registers the flagship Glass Pills module by default with its 16 curated palettes', () => {
    const glassPills = getModule('glass-pills');
    expect(glassPills).toBeDefined();
    expect(glassPills?.name).toBe('Glass Pills');
    expect(glassPills?.defaultParams).toBeDefined();
    expect(glassPills?.defaultParams.pillCount).toBe(6);
    expect(glassPills?.renderWebGL).toBeTypeOf('function');
    expect(glassPills?.palettes).toHaveLength(16);
    expect(glassPills?.defaultPalette).toBeDefined();
  });

  it('allows registering a custom wallpaper module dynamically', () => {
    const mockModule: WallpaperModule<{ waveSpeed: number }> = {
      id: 'mock-wave',
      name: 'Mock Wave Generator',
      description: 'Test module for dynamic registration.',
      defaultParams: { waveSpeed: 1.5 },
      renderWebGL: () => {},
    };

    registerModule(mockModule);
    const retrieved = getModule('mock-wave');
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe('mock-wave');

    const all = getAllModules();
    expect(all.some((m) => m.id === 'mock-wave')).toBe(true);
  });
});
