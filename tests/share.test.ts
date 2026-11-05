import { describe, it, expect } from 'vitest';
import {
  toBase64Url,
  fromBase64Url,
  encodeShareCode,
  decodeShareCode,
  parseUrlHash,
  ShareConfig,
} from '../src/engine/share';

describe('Ultra-Compact Shareable Code Engine', () => {
  it('correctly encodes and decodes Base64URL strings with UTF-8 characters', () => {
    const original = 'Lumina ✨ Studio - Élégance & Verre';
    const encoded = toBase64Url(original);
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
    expect(fromBase64Url(encoded)).toBe(original);
  });

  it('compresses a preset ShareConfig with default params into an ultra-short code (<= 5 characters)', () => {
    const config: ShareConfig = {
      moduleId: 'glass-pills',
      deviceId: 'mac-air-13',
      isCustomRes: false,
      orientation: 'desktop',
      paletteId: 'bleu_cyan',
      theme: 'auto',
      quality: 1,
      params: { pillCount: 6, pillScale: 1, pillStagger: 0 },
    };

    const code = encodeShareCode(config);
    expect(code.length).toBeLessThanOrEqual(5); // e.g. 4 chars (like 'zcg8')!
    expect(code.startsWith('_')).toBe(false);

    const restored = decodeShareCode(code);
    expect(restored).not.toBeNull();
    expect(restored?.moduleId).toBe('glass-pills');
    expect(restored?.deviceId).toBe('mac-air-13');
    expect(restored?.orientation).toBe('desktop');
    expect(restored?.paletteId).toBe('bleu_cyan');
    expect(restored?.theme).toBe('auto');
    expect(restored?.params?.pillCount).toBe(6);
  });

  it('compresses customized capsule params into a short code (<= 8 characters)', () => {
    const config: ShareConfig = {
      moduleId: 'glass-pills',
      deviceId: 'mac-air-13',
      isCustomRes: false,
      orientation: 'desktop',
      paletteId: 'aurore',
      theme: 'dark',
      quality: 1,
      params: { pillCount: 8, pillScale: 1.25, pillStagger: 0.25 },
    };

    const code = encodeShareCode(config);
    expect(code.length).toBeLessThanOrEqual(8);
    expect(code.startsWith('_')).toBe(false);

    const restored = decodeShareCode(code);
    expect(restored?.params?.pillCount).toBe(8);
    expect(restored?.params?.pillScale).toBe(1.25);
    expect(restored?.params?.pillStagger).toBe(0.25);
  });

  it('compresses custom resolution into a short code (<= 8 characters)', () => {
    const config: ShareConfig = {
      moduleId: 'glass-pills',
      customWidth: 5120,
      customHeight: 3328,
      isCustomRes: true,
      orientation: 'desktop',
      paletteId: 'aurore',
      theme: 'dark',
      quality: 1,
    };

    const code = encodeShareCode(config);
    expect(code.length).toBeLessThanOrEqual(8);

    const restored = decodeShareCode(code);
    expect(restored?.isCustomRes).toBe(true);
    expect(restored?.customWidth).toBe(5120);
    expect(restored?.customHeight).toBe(3328);
    expect(restored?.paletteId).toBe('aurore');
    expect(restored?.theme).toBe('dark');
  });

  it('encodes and decodes custom palette colors', () => {
    const config: ShareConfig = {
      moduleId: 'glass-pills',
      deviceId: 'iphone-16-pro',
      isCustomRes: false,
      orientation: 'mobile',
      customPalette: {
        name: 'Neon Sunset',
        bgDark: '#080512',
        bgLight: '#fdfbfe',
        leftRamp: ['#1a0826', '#3b1259', '#782390', '#c242b5', '#f87ed9'],
        rightRamp: ['#230a10', '#541525', '#99243a', '#d94852', '#fca082'],
      },
      theme: 'dark',
      quality: 1.5,
    };

    const code = encodeShareCode(config);
    expect(code.startsWith('_')).toBe(true);
    const restored = decodeShareCode(code);

    expect(restored?.customPalette?.name).toBe('Neon Sunset');
    expect(restored?.customPalette?.leftRamp.length).toBe(5);
    expect(restored?.quality).toBe(1.5);
  });

  it('parses ultra-short #c/<code> format and legacy query parameter format', () => {
    const config: ShareConfig = {
      moduleId: 'glass-pills',
      deviceId: 'iphone-16-pro',
      isCustomRes: false,
      orientation: 'mobile',
      paletteId: 'vert_lime',
      theme: 'light',
    };
    const code = encodeShareCode(config);

    // Test compact format #c/<code>
    const fromCompact = parseUrlHash(`#c/${code}`);
    expect(fromCompact?.deviceId).toBe('iphone-16-pro');
    expect(fromCompact?.paletteId).toBe('vert_lime');
    expect(fromCompact?.theme).toBe('light');

    // Test legacy query format #module=...
    const fromLegacy = parseUrlHash(
      '#module=glass-pills&device=macbook-air-m2&orient=desktop&palette=ocean-breeze&theme=dark'
    );
    expect(fromLegacy?.deviceId).toBe('macbook-air-m2');
    expect(fromLegacy?.paletteId).toBe('ocean-breeze');
    expect(fromLegacy?.theme).toBe('dark');
  });
});
