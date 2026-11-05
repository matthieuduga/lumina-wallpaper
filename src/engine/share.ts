/**
 * Lumina Wallpaper Studio - Ultra-Compact URL Code & Share Engine
 * 
 * Generates ultra-short, Bitly-style codes (~4 to 8 characters)
 * using dense Base62 bit-packing for preset and custom wallpapers.
 * Fully 100% client-side, zero backend, zero database.
 */

import { ColorRamp, DeviceSpec } from '../modules/types';
import { glassPillsPalettes } from '../modules/glass-pills';
import devicesData from '../data/devices.json';

const devicesList = devicesData as DeviceSpec[];
const palettesList = glassPillsPalettes;

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface ShareConfig {
  moduleId: string;
  deviceId?: string;
  customWidth?: number;
  customHeight?: number;
  isCustomRes: boolean;
  orientation: 'desktop' | 'mobile';
  paletteId?: string;
  customPalette?: {
    name: string;
    bgDark: string;
    bgLight?: string | null;
    leftRamp: ColorRamp;
    rightRamp: ColorRamp;
  };
  theme: 'auto' | 'light' | 'dark';
  quality?: number;
  params?: Record<string, unknown>;
}

function bigintToBase62(num: bigint): string {
  if (num === 0n) return BASE62[0];
  let res = '';
  while (num > 0n) {
    res = BASE62[Number(num % 62n)] + res;
    num = num / 62n;
  }
  return res;
}

function fromBase62ToBigInt(str: string): bigint | null {
  let num = 0n;
  for (let i = 0; i < str.length; i++) {
    const idx = BigInt(BASE62.indexOf(str[i]));
    if (idx === -1n) return null;
    num = num * 62n + idx;
  }
  return num;
}

export function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function fromBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function isDefaultGlassPillsParams(params?: Record<string, unknown>): boolean {
  if (!params) return true;
  const count = typeof params.pillCount === 'number' ? params.pillCount : 6;
  const scale = typeof params.pillScale === 'number' ? params.pillScale : 1.0;
  const stagger = typeof params.pillStagger === 'number' ? params.pillStagger : 0.0;
  return count === 6 && Math.abs(scale - 1.0) < 0.001 && Math.abs(stagger - 0.0) < 0.001;
}

/**
 * Encodes a ShareConfig into an ultra-short Base62 code (~4 to 10 chars)
 */
export function encodeShareCode(config: ShareConfig): string {
  const palIdx = config.paletteId
    ? palettesList.findIndex((p) => p.id === config.paletteId)
    : -1;
  const devIdx = config.deviceId
    ? devicesList.findIndex((d) => d.id === config.deviceId)
    : -1;

  const isGlassPills = config.moduleId === 'glass-pills';
  const hasCustomParams = !isDefaultGlassPillsParams(config.params);

  // Bit-pack into ultra-compact Base62 whenever using official palette and glass-pills (or default params)
  if (!config.customPalette && palIdx !== -1 && isGlassPills) {
    const isCustomRes = config.isCustomRes && !!config.customWidth && !!config.customHeight;
    const modIdx = 0; // glass-pills
    const orient = config.orientation === 'mobile' ? 1 : 0;
    const theme = config.theme === 'light' ? 1 : config.theme === 'dark' ? 2 : 0;
    const qual = config.quality === 1.5 ? 1 : config.quality === 2 ? 2 : 0;

    let n = 1n; // Sentinel bit to ensure non-ambiguous bit length and eliminate leading zero drops

    // 1. Module Index (4 bits)
    n = (n << 4n) | BigInt(modIdx & 0x0f);

    // 2. Resolution: either custom dimensions or device index + flag (1 bit)
    if (isCustomRes) {
      const w = Math.min(16383, Math.max(100, Math.round(config.customWidth!)));
      const h = Math.min(16383, Math.max(100, Math.round(config.customHeight!)));
      n = (n << 14n) | BigInt(w & 0x3fff);
      n = (n << 14n) | BigInt(h & 0x3fff);
      n = (n << 1n) | 1n; // 1 = isCustomRes
    } else {
      const validDevIdx = devIdx !== -1 ? devIdx : 0;
      n = (n << 6n) | BigInt(validDevIdx & 0x3f);
      n = (n << 1n) | 0n; // 0 = preset device
    }

    // 3. Orientation (1 bit)
    n = (n << 1n) | BigInt(orient & 0x01);

    // 4. Palette Index (6 bits)
    n = (n << 6n) | BigInt(palIdx & 0x3f);

    // 5. Theme (2 bits)
    n = (n << 2n) | BigInt(theme & 0x03);

    // 6. Quality (2 bits)
    n = (n << 2n) | BigInt(qual & 0x03);

    // 7. Custom Params (14 bits if custom for glass-pills + 1 bit flag)
    if (hasCustomParams) {
      const pc = Math.max(3, Math.min(12, Math.round(Number(config.params?.pillCount ?? 6))));
      const ps = Math.max(0.5, Math.min(2.0, Number(config.params?.pillScale ?? 1.0)));
      const pst = Math.max(0.0, Math.min(1.0, Number(config.params?.pillStagger ?? 0.0)));

      const pcBits = BigInt(pc - 3); // 0..9 (4 bits)
      const psBits = BigInt(Math.min(30, Math.max(0, Math.round((ps - 0.5) / 0.05)))); // 0..30 (5 bits)
      const pstBits = BigInt(Math.min(20, Math.max(0, Math.round(pst / 0.05)))); // 0..20 (5 bits)

      n = (n << 4n) | pcBits;
      n = (n << 5n) | psBits;
      n = (n << 5n) | pstBits;
      n = (n << 1n) | 1n; // 1 = has custom params
    } else {
      n = (n << 1n) | 0n; // 0 = default params
    }

    return bigintToBase62(n);
  }

  // Fallback for custom palettes: compact JSON prefixed with "_"
  const jsonStr = JSON.stringify({
    m: config.moduleId === 'glass-pills' ? 'gp' : config.moduleId,
    d: config.deviceId,
    w: config.customWidth,
    h: config.customHeight,
    o: config.orientation === 'mobile' ? 'm' : 'd',
    p: config.paletteId,
    cp: config.customPalette ? {
      n: config.customPalette.name,
      d: config.customPalette.bgDark,
      l: config.customPalette.bgLight,
      lr: config.customPalette.leftRamp,
      rr: config.customPalette.rightRamp,
    } : undefined,
    t: config.theme === 'light' ? 'l' : config.theme === 'dark' ? 'd' : 'a',
    q: config.quality !== 1 ? config.quality : undefined,
    params: isDefaultGlassPillsParams(config.params) ? undefined : config.params,
  });

  return `_${toBase64Url(jsonStr)}`;
}

/**
 * Decodes an ultra-short Base62 code or custom payload back into a ShareConfig
 */
export function decodeShareCode(code: string): ShareConfig | null {
  const trimmed = code.trim();
  if (!trimmed) return null;

  // 1. Check for custom payload prefixed with "_" or legacy "eyJ"
  if (trimmed.startsWith('_') || trimmed.startsWith('eyJ')) {
    try {
      const b64 = trimmed.startsWith('_') ? trimmed.substring(1) : trimmed;
      const jsonStr = fromBase64Url(b64);
      const payload = JSON.parse(jsonStr);

      const moduleId = payload.m === 'gp' ? 'glass-pills' : payload.m || 'glass-pills';
      const orientation = payload.o === 'm' ? 'mobile' : 'desktop';
      const theme = payload.t === 'l' ? 'light' : payload.t === 'd' ? 'dark' : 'auto';
      const isCustomRes = typeof payload.w === 'number' && typeof payload.h === 'number';

      let customPalette = undefined;
      if (payload.cp) {
        const leftRamp = payload.cp.lr || payload.cp.leftRamp;
        const rightRamp = payload.cp.rr || payload.cp.rightRamp;
        if (leftRamp?.length === 5 && rightRamp?.length === 5) {
          customPalette = {
            name: payload.cp.n || payload.cp.name || 'Custom',
            bgDark: payload.cp.d || payload.cp.bgDark || '#000000',
            bgLight: payload.cp.l || payload.cp.bgLight || undefined,
            leftRamp: leftRamp as ColorRamp,
            rightRamp: rightRamp as ColorRamp,
          };
        }
      }

      return {
        moduleId,
        deviceId: payload.d,
        customWidth: payload.w,
        customHeight: payload.h,
        isCustomRes,
        orientation,
        paletteId: payload.p,
        customPalette,
        theme,
        quality: payload.q || 1,
        params: payload.params || {
          pillCount: 6,
          pillScale: 1.0,
          pillStagger: 0.0,
        },
      };
    } catch (e) {
      console.warn('Failed to parse custom payload code:', e);
      return null;
    }
  }

  // 2. Decode ultra-short Base62 bit-packed code
  try {
    let n = fromBase62ToBigInt(trimmed);
    if (n === null || n <= 0n) return null;

    // 1. Read hasCustomParams (1 bit)
    const hasCustomParams = (n & 1n) === 1n;
    n >>= 1n;

    let params: Record<string, unknown> = {
      pillCount: 6,
      pillScale: 1.0,
      pillStagger: 0.0,
    };

    if (hasCustomParams) {
      const pstBits = Number(n & 0x1fn);
      n >>= 5n;
      const psBits = Number(n & 0x1fn);
      n >>= 5n;
      const pcBits = Number(n & 0x0fn);
      n >>= 4n;

      params = {
        pillCount: pcBits + 3,
        pillScale: Math.round((psBits * 0.05 + 0.5) * 100) / 100,
        pillStagger: Math.round(pstBits * 0.05 * 100) / 100,
      };
    }

    // 2. Read Quality (2 bits)
    const qualCode = Number(n & 0x03n);
    n >>= 2n;
    const quality = qualCode === 1 ? 1.5 : qualCode === 2 ? 2.0 : 1.0;

    // 3. Read Theme (2 bits)
    const themeCode = Number(n & 0x03n);
    n >>= 2n;
    const theme = themeCode === 1 ? 'light' : themeCode === 2 ? 'dark' : 'auto';

    // 4. Read Palette Index (6 bits)
    const palIdx = Number(n & 0x3fn);
    n >>= 6n;
    const paletteId = palettesList[palIdx] ? palettesList[palIdx].id : palettesList[0].id;

    // 5. Read Orientation (1 bit)
    const orientCode = Number(n & 0x01n);
    n >>= 1n;
    const orientation = orientCode === 1 ? 'mobile' : 'desktop';

    // 6. Read isCustomRes (1 bit)
    const isCustomRes = (n & 1n) === 1n;
    n >>= 1n;

    let deviceId: string | undefined;
    let customWidth: number | undefined;
    let customHeight: number | undefined;

    if (isCustomRes) {
      customHeight = Number(n & 0x3fffn);
      n >>= 14n;
      customWidth = Number(n & 0x3fffn);
      n >>= 14n;
    } else {
      const devIdx = Number(n & 0x3fn);
      n >>= 6n;
      deviceId = devicesList[devIdx] ? devicesList[devIdx].id : devicesList[0].id;
    }

    // 7. Read Module Index (4 bits)
    const modIdx = Number(n & 0x0fn);
    n >>= 4n;
    const moduleId = modIdx === 0 ? 'glass-pills' : 'glass-pills';

    // 8. Verify Sentinel Bit
    if (n !== 1n) {
      console.warn('Bit-packing sentinel check failed for code:', trimmed);
      return null;
    }

    return {
      moduleId,
      deviceId,
      customWidth,
      customHeight,
      isCustomRes,
      orientation,
      paletteId,
      theme,
      quality,
      params,
    };
  } catch (e) {
    console.warn('Failed to decode Base62 share code:', e);
    return null;
  }
}

/**
 * Builds the full shareable URL containing the short code
 */
export function buildShareUrl(config: ShareConfig): string {
  const code = encodeShareCode(config);
  const base = window.location.origin + window.location.pathname;
  return `${base}#c/${code}`;
}

/**
 * Parses URL hash: supports ultra-short `#c/<code>` and legacy `#module=...`
 */
export function parseUrlHash(hash: string): ShareConfig | null {
  const cleanHash = hash.replace(/^#/, '').trim();
  if (!cleanHash) return null;

  if (cleanHash.startsWith('c/')) {
    const code = cleanHash.substring(2);
    return decodeShareCode(code);
  }

  // Legacy query format
  try {
    const params = new URLSearchParams(cleanHash);
    const modId = params.get('module') || 'glass-pills';
    const devId = params.get('device') || undefined;
    const w = params.get('w') ? parseInt(params.get('w')!, 10) : undefined;
    const h = params.get('h') ? parseInt(params.get('h')!, 10) : undefined;
    const orient = params.get('orient') === 'mobile' ? 'mobile' : 'desktop';
    const palId = params.get('palette') || undefined;
    const th = params.get('theme') as 'auto' | 'light' | 'dark' | null;

    return {
      moduleId: modId,
      deviceId: devId,
      customWidth: w,
      customHeight: h,
      isCustomRes: !!(w && h),
      orientation: orient,
      paletteId: palId,
      theme: th === 'light' || th === 'dark' || th === 'auto' ? th : 'auto',
      quality: 1,
    };
  } catch {
    return null;
  }
}
