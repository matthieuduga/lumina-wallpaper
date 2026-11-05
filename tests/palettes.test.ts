import { describe, it, expect } from 'vitest';
import { glassPillsPalettes } from '../src/modules/glass-pills';

describe('Official Palettes Validation', () => {
  const hexRegex = /^#[0-9a-fA-F]{6}$/;
  const palettes = glassPillsPalettes;

  it('contains exactly 16 official palettes ported from the original script', () => {
    expect(palettes).toHaveLength(16);
  });

  it('each palette has unique ID and non-empty name', () => {
    const ids = new Set<string>();
    for (const p of palettes) {
      expect(p.id).toBeDefined();
      expect(p.name).toBeTruthy();
      expect(ids.has(p.id)).toBe(false);
      ids.add(p.id);
    }
  });

  it('each palette has valid 7-character hex colors and 5 stops per ramp', () => {
    for (const p of palettes) {
      expect(p.bgDark).toMatch(hexRegex);
      if (p.bgLight) {
        expect(p.bgLight).toMatch(hexRegex);
      }

      expect(p.leftRamp).toHaveLength(5);
      expect(p.rightRamp).toHaveLength(5);

      for (const hex of p.leftRamp) {
        expect(hex).toMatch(hexRegex);
      }
      for (const hex of p.rightRamp) {
        expect(hex).toMatch(hexRegex);
      }
    }
  });
});
