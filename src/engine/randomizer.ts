import { ColorRamp, PaletteSpec } from '../modules/types';
import { oklchToRgb, rgbFloatToHex } from './math';

/**
 * Fast seedable pseudo-random number generator (Mulberry32).
 */
export function createRng(seed: number) {
  let s = seed | 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type HarmonyMode = 'analogous' | 'complementary' | 'split-complementary' | 'triadic';

export interface GeneratePaletteOptions {
  seed?: number;
  mode?: HarmonyMode;
  lockedLeft?: ColorRamp | null;
  lockedRight?: ColorRamp | null;
}

/**
 * Builds a 5-stop color ramp using OkLCH color space for perceptually smooth gradients.
 * Stops progress from very dark/deep -> rich mid-tone -> vibrant tint -> bright pastel -> near white.
 */
function buildRamp(baseHue: number, rng: () => number): ColorRamp {
  const hueVariation = (rng() - 0.5) * 20;
  const h = (baseHue + hueVariation + 360) % 360;

  // L (Lightness): 0.05 -> 0.25 -> 0.55 -> 0.82 -> 0.96
  // C (Chroma):    0.04 -> 0.12 -> 0.18 -> 0.12 -> 0.03
  const stops = [
    oklchToRgb(0.04 + rng() * 0.02, 0.03 + rng() * 0.02, h),
    oklchToRgb(0.22 + rng() * 0.05, 0.10 + rng() * 0.04, (h + 5) % 360),
    oklchToRgb(0.55 + rng() * 0.06, 0.16 + rng() * 0.05, (h + 8) % 360),
    oklchToRgb(0.82 + rng() * 0.04, 0.11 + rng() * 0.03, (h + 10) % 360),
    oklchToRgb(0.96 + rng() * 0.02, 0.03 + rng() * 0.02, (h + 12) % 360),
  ];

  return stops.map(rgbFloatToHex) as unknown as ColorRamp;
}

/**
 * Generates a deep, subtly tinted background color.
 */
function buildDarkBackground(hue: number, rng: () => number): string {
  const bgRgb = oklchToRgb(0.03 + rng() * 0.02, 0.02 + rng() * 0.015, hue);
  return rgbFloatToHex(bgRgb);
}

/**
 * Generates a clean light background with subtle tinting.
 */
function buildLightBackground(hue: number, rng: () => number): string {
  const bgRgb = oklchToRgb(0.94 + rng() * 0.02, 0.015 + rng() * 0.01, hue);
  return rgbFloatToHex(bgRgb);
}

/**
 * Generates a fresh, harmonious palette according to color harmony rules.
 */
export function generateRandomPalette(options: GeneratePaletteOptions = {}): PaletteSpec {
  const seed = options.seed ?? Math.floor(Math.random() * 1000000);
  const rng = createRng(seed);

  const baseHue = rng() * 360;
  const modes: HarmonyMode[] = ['analogous', 'complementary', 'split-complementary', 'triadic'];
  const mode = options.mode ?? modes[Math.floor(rng() * modes.length)];

  let rightHue = baseHue;
  switch (mode) {
    case 'analogous':
      rightHue = (baseHue + 30 + rng() * 25) % 360;
      break;
    case 'complementary':
      rightHue = (baseHue + 180 + (rng() - 0.5) * 20) % 360;
      break;
    case 'split-complementary':
      rightHue = (baseHue + 150 + (rng() - 0.5) * 30) % 360;
      break;
    case 'triadic':
      rightHue = (baseHue + 120 + (rng() - 0.5) * 20) % 360;
      break;
  }

  const leftRamp = options.lockedLeft ? options.lockedLeft : buildRamp(baseHue, rng);
  const rightRamp = options.lockedRight ? options.lockedRight : buildRamp(rightHue, rng);

  const midHue = (baseHue + rightHue) / 2;
  const bgDark = buildDarkBackground(midHue, rng);
  const bgLight = buildLightBackground(midHue, rng);

  return {
    id: `custom-random-${seed}`,
    name: `Random #${seed.toString().slice(-4)}`,
    bgDark,
    bgLight,
    leftRamp,
    rightRamp,
  };
}
