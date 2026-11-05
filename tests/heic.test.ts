import { describe, it, expect } from 'vitest';
import {
  u16,
  u32,
  ascii,
  concatBytes,
  makeBox,
  makeFullBox,
  buildDynamicHeic,
  APR_PLIST_B64,
  APPLE_DESKTOP_XMP,
} from '../src/engine/heic';

describe('HEIC ISOBMFF Box Builder', () => {
  it('encodes integers and ascii correctly', () => {
    expect(Array.from(u16(0x1234))).toEqual([0x12, 0x34]);
    expect(Array.from(u32(0x12345678))).toEqual([0x12, 0x34, 0x56, 0x78]);
    expect(Array.from(ascii('heic'))).toEqual([104, 101, 105, 99]);
    expect(Array.from(concatBytes(new Uint8Array([1, 2]), new Uint8Array([3, 4])))).toEqual([1, 2, 3, 4]);
  });

  it('constructs basic Box and FullBox correctly', () => {
    const payload = new Uint8Array([1, 2, 3, 4]);
    const box = makeBox('test', payload);

    expect(box.length).toBe(12); // 4 (size) + 4 (type) + 4 (payload)
    expect(box[0]).toBe(0);
    expect(box[3]).toBe(12); // size = 12
    expect(String.fromCharCode(...box.subarray(4, 8))).toBe('test');
    expect(Array.from(box.subarray(8))).toEqual([1, 2, 3, 4]);

    const fullBox = makeFullBox('full', 1, 0x010203, payload);
    expect(fullBox.length).toBe(16); // 8 + 4 (ver/flags) + 4 (payload)
    expect(fullBox[3]).toBe(16);
    expect(String.fromCharCode(...fullBox.subarray(4, 8))).toBe('full');
    expect(fullBox[8]).toBe(1); // version 1
    expect(fullBox[9]).toBe(0x01); // flags
    expect(fullBox[10]).toBe(0x02);
    expect(fullBox[11]).toBe(0x03);
  });

  it('assembles a compliant multi-image Dynamic HEIC container', () => {
    const fakeNal1 = new Uint8Array([0x00, 0x00, 0x00, 0x02, 0x40, 0x01]);
    const fakeNal2 = new Uint8Array([0x00, 0x00, 0x00, 0x02, 0x42, 0x01]);
    const fakeDesc = new Uint8Array([0x01, 0x01, 0x60, 0x00, 0x00, 0x00]);

    const heic = buildDynamicHeic({
      lightNal: fakeNal1,
      darkNal: fakeNal2,
      description: fakeDesc,
      width: 3840,
      height: 2160,
    });

    expect(heic.length).toBeGreaterThan(100);

    // Verify ftyp header
    const ftypSize = (heic[0] << 24) | (heic[1] << 16) | (heic[2] << 8) | heic[3];
    expect(ftypSize).toBe(32);
    expect(String.fromCharCode(...heic.subarray(4, 8))).toBe('ftyp');
    expect(String.fromCharCode(...heic.subarray(8, 12))).toBe('heic');

    // Verify meta box presence
    const metaOffset = 32;
    expect(String.fromCharCode(...heic.subarray(metaOffset + 4, metaOffset + 8))).toBe('meta');

    // Verify mdat box presence
    const textDecoder = new TextDecoder();
    const str = textDecoder.decode(heic);
    expect(str).toContain('mdat');
    expect(str).toContain('apple_desktop:apr');
    expect(str).toContain(APR_PLIST_B64);
  });

  it('contains valid apple_desktop:apr XMP metadata', () => {
    expect(APPLE_DESKTOP_XMP).toContain('xmlns:apple_desktop="http://ns.apple.com/namespace/1.0/"');
    expect(APPLE_DESKTOP_XMP).toContain(`apple_desktop:apr="${APR_PLIST_B64}"`);
  });
});
