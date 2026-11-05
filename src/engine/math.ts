import { RGBFloat } from '../modules/types';

/**
 * Converts a hex color string (#rgb, #rrggbb) to normalized RGB float tuple in range [0, 1].
 */
export function hexToRgbFloat(hex: string): RGBFloat {
  let s = hex.trim().replace(/^#/, '');
  if (s.length === 3) {
    s = s
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (s.length !== 6) {
    return [0, 0, 0];
  }
  const r = parseInt(s.substring(0, 2), 16) / 255;
  const g = parseInt(s.substring(2, 4), 16) / 255;
  const b = parseInt(s.substring(4, 6), 16) / 255;
  return [r, g, b];
}

/**
 * Converts normalized RGB float tuple in range [0, 1] to 6-digit hex string (#rrggbb).
 */
export function rgbFloatToHex(rgb: RGBFloat): string {
  const toHex = (c: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(c * 255)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

/**
 * Linear interpolation between numbers.
 */
export function mix(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

/**
 * Linear interpolation between two RGBFloat colors.
 */
export function mixRgb(a: RGBFloat, b: RGBFloat, t: number): RGBFloat {
  return [
    mix(a[0], b[0], t),
    mix(a[1], b[1], t),
    mix(a[2], b[2], t),
  ];
}

/**
 * Standard logistic sigmoid function: 1 / (1 + exp(-x))
 */
export function sigmoid(x: number): number {
  if (x < -45) return 0;
  if (x > 45) return 1;
  return 1 / (1 + Math.exp(-x));
}

export const STOPS = [0.0, 0.22, 0.5, 0.75, 1.0] as const;

/**
 * Replicates the Python script's `light_of` ramp transformation for light theme.
 * Python code:
 * mix(r[1], r[2], .35), mix(r[1], r[2], .8), mix(r[2], r[3], .35), mix(r[3], r[4], .45), mix(r[4], WHITE, .5)
 */
export function lightOfRamp(r: RGBFloat[]): RGBFloat[] {
  if (r.length < 5) return r;
  const white: RGBFloat = [1, 1, 1];
  return [
    mixRgb(r[1], r[2], 0.35),
    mixRgb(r[1], r[2], 0.8),
    mixRgb(r[2], r[3], 0.35),
    mixRgb(r[3], r[4], 0.45),
    mixRgb(r[4], white, 0.5),
  ];
}

/**
 * Interpolates lightness L across the 5 palette stops, matching numpy's interp.
 */
export function interpCmap(L: number, ramp: RGBFloat[]): RGBFloat {
  const clampedL = Math.max(0, Math.min(1, L));

  if (clampedL <= STOPS[0]) return [...ramp[0]] as RGBFloat;
  if (clampedL >= STOPS[4]) return [...ramp[4]] as RGBFloat;

  for (let i = 0; i < 4; i++) {
    const s0 = STOPS[i];
    const s1 = STOPS[i + 1];
    if (clampedL >= s0 && clampedL <= s1) {
      const t = (clampedL - s0) / (s1 - s0);
      return mixRgb(ramp[i], ramp[i + 1], t);
    }
  }

  return [...ramp[4]] as RGBFloat;
}

/**
 * Converts HSL (h in [0, 360), s in [0, 1], l in [0, 1]) to normalized RGB float.
 */
export function hslToRgb(h: number, s: number, l: number): RGBFloat {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;

  if (hp >= 0 && hp < 1) { r1 = c; g1 = x; }
  else if (hp >= 1 && hp < 2) { r1 = x; g1 = c; }
  else if (hp >= 2 && hp < 3) { g1 = c; b1 = x; }
  else if (hp >= 3 && hp < 4) { g1 = x; b1 = c; }
  else if (hp >= 4 && hp < 5) { r1 = x; b1 = c; }
  else if (hp >= 5 && hp < 6) { r1 = c; b1 = x; }

  const m = l - c / 2;
  return [
    Math.max(0, Math.min(1, r1 + m)),
    Math.max(0, Math.min(1, g1 + m)),
    Math.max(0, Math.min(1, b1 + m)),
  ];
}

/**
 * Converts OKLCH (L in [0, 1], C in [0, 0.4], H in [0, 360)) to sRGB float.
 */
export function oklchToRgb(L: number, C: number, H: number): RGBFloat {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // sRGB gamma transfer
  const gamma = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055;

  return [
    Math.max(0, Math.min(1, gamma(r))),
    Math.max(0, Math.min(1, gamma(g))),
    Math.max(0, Math.min(1, gamma(bl))),
  ];
}
