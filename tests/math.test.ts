import { describe, it, expect } from 'vitest';
import {
  hexToRgbFloat,
  rgbFloatToHex,
  mix,
  mixRgb,
  sigmoid,
  lightOfRamp,
  interpCmap,
  hslToRgb,
  oklchToRgb,
  STOPS,
} from '../src/engine/math';
import { RGBFloat } from '../src/modules/types';

describe('Math Engine & Color Transformations', () => {
  it('converts hex to RGB float accurately', () => {
    expect(hexToRgbFloat('#000000')).toEqual([0, 0, 0]);
    expect(hexToRgbFloat('#ffffff')).toEqual([1, 1, 1]);

    const cyan = hexToRgbFloat('#006be6');
    expect(cyan[0]).toBeCloseTo(0.0, 3);
    expect(cyan[1]).toBeCloseTo(107 / 255, 3);
    expect(cyan[2]).toBeCloseTo(230 / 255, 3);
  });

  it('converts RGB float back to 6-digit hex accurately', () => {
    expect(rgbFloatToHex([0, 0, 0])).toBe('#000000');
    expect(rgbFloatToHex([1, 1, 1])).toBe('#ffffff');
    expect(rgbFloatToHex([0, 107 / 255, 230 / 255])).toBe('#006be6');
  });

  it('sigmoid function produces correct values', () => {
    expect(sigmoid(0)).toBeCloseTo(0.5, 5);
    expect(sigmoid(-100)).toBe(0);
    expect(sigmoid(100)).toBe(1);
    expect(sigmoid(2)).toBeCloseTo(1 / (1 + Math.exp(-2)), 5);
  });

  it('linear mix works for floats and RGB tuples', () => {
    expect(mix(0, 10, 0.5)).toBe(5);
    expect(mixRgb([0, 0, 0], [1, 1, 1], 0.5)).toEqual([0.5, 0.5, 0.5]);
  });

  it('lightOfRamp reproduces the original Python transformation formula', () => {
    // 5 dummy stops: dark to light
    const ramp: RGBFloat[] = [
      [0.0, 0.0, 0.0],
      [0.1, 0.2, 0.3],
      [0.3, 0.5, 0.7],
      [0.6, 0.8, 0.9],
      [0.9, 0.9, 0.9],
    ];

    const lightRamp = lightOfRamp(ramp);
    expect(lightRamp).toHaveLength(5);

    // Stop 0: mix(r[1], r[2], .35)
    expect(lightRamp[0][0]).toBeCloseTo(mix(ramp[1][0], ramp[2][0], 0.35), 4);
    // Stop 4: mix(r[4], WHITE, .5)
    expect(lightRamp[4][0]).toBeCloseTo(mix(ramp[4][0], 1.0, 0.5), 4);
  });

  it('interpCmap accurately interpolates across stops', () => {
    const ramp: RGBFloat[] = [
      [0.0, 0.0, 0.0],
      [0.2, 0.2, 0.2],
      [0.5, 0.5, 0.5],
      [0.8, 0.8, 0.8],
      [1.0, 1.0, 1.0],
    ];

    // Boundary stops
    expect(interpCmap(0.0, ramp)).toEqual(ramp[0]);
    expect(interpCmap(1.0, ramp)).toEqual(ramp[4]);

    // Exact intermediate stop: STOPS[2] = 0.5
    expect(interpCmap(STOPS[2], ramp)[0]).toBeCloseTo(0.5, 3);
  });

  it('hslToRgb converts primary hues correctly', () => {
    expect(hslToRgb(0, 1, 0.5)).toEqual([1, 0, 0]);
    expect(hslToRgb(120, 1, 0.5)).toEqual([0, 1, 0]);
    expect(hslToRgb(240, 1, 0.5)).toEqual([0, 0, 1]);
  });

  it('oklchToRgb produces valid clamped sRGB floats', () => {
    const rgb = oklchToRgb(0.7, 0.15, 140);
    expect(rgb[0]).toBeGreaterThanOrEqual(0);
    expect(rgb[0]).toBeLessThanOrEqual(1);
    expect(rgb[1]).toBeGreaterThanOrEqual(0);
    expect(rgb[1]).toBeLessThanOrEqual(1);
    expect(rgb[2]).toBeGreaterThanOrEqual(0);
    expect(rgb[2]).toBeLessThanOrEqual(1);
  });
});
