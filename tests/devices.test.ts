import { describe, it, expect } from 'vitest';
import devicesData from '../src/data/devices.json';
import { DeviceSpec } from '../src/modules/types';

describe('Devices Catalog Validation', () => {
  const devices = devicesData as DeviceSpec[];

  it('contains devices across all major categories (mac, iphone, ipad, pc, android)', () => {
    const categories = new Set(devices.map((d) => d.category));
    expect(categories.has('mac')).toBe(true);
    expect(categories.has('iphone')).toBe(true);
    expect(categories.has('ipad')).toBe(true);
    expect(categories.has('pc')).toBe(true);
    expect(categories.has('android')).toBe(true);
  });

  it('all device resolutions have positive integers and valid orientations', () => {
    for (const d of devices) {
      expect(d.width).toBeGreaterThan(0);
      expect(Number.isInteger(d.width)).toBe(true);

      expect(d.height).toBeGreaterThan(0);
      expect(Number.isInteger(d.height)).toBe(true);

      expect(['desktop', 'mobile']).toContain(d.orientation);
      expect(d.scale).toBeGreaterThanOrEqual(1);
    }
  });

  it('contains latest iPhone 16 Pro, Mac Studio, iPad M4, Galaxy S25, and Pixel 9 resolutions', () => {
    const iphone16Pro = devices.find((d) => d.id === 'iphone-16-pro');
    expect(iphone16Pro).toBeDefined();
    expect(iphone16Pro?.width).toBe(1206);
    expect(iphone16Pro?.height).toBe(2622);

    const studio = devices.find((d) => d.id === 'mac-studio-27');
    expect(studio).toBeDefined();
    expect(studio?.width).toBe(5120);
    expect(studio?.height).toBe(2880);

    const ipadPro13 = devices.find((d) => d.id === 'ipad-pro-13-m4');
    expect(ipadPro13).toBeDefined();
    expect(ipadPro13?.width).toBe(2064);
    expect(ipadPro13?.height).toBe(2752);

    const s25Ultra = devices.find((d) => d.id === 'samsung-s25-ultra');
    expect(s25Ultra).toBeDefined();
    expect(s25Ultra?.width).toBe(1440);
    expect(s25Ultra?.height).toBe(3120);

    const pixel9ProXL = devices.find((d) => d.id === 'pixel-9-pro-xl');
    expect(pixel9ProXL).toBeDefined();
    expect(pixel9ProXL?.width).toBe(1344);
    expect(pixel9ProXL?.height).toBe(2992);
  });
});
