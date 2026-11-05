/**
 * Lumina Wallpaper Studio - In-Browser Apple Dynamic HEIC Generator
 * 
 * Assembles a multi-image ISOBMFF HEIC container with embedded
 * Apple Dynamic Desktop `apple_desktop:apr` XMP metadata.
 * Uses the native WebCodecs VideoEncoder for hardware-accelerated
 * HEVC encoding directly in the browser (100% client-side, zero backend).
 */

export interface DynamicHeicOptions {
  lightNal: Uint8Array;
  darkNal: Uint8Array;
  description: Uint8Array;
  width: number;
  height: number;
}

// Pre-serialized binary Apple property list for {"l": 0, "d": 1}
// l = Light image index (0), d = Dark image index (1)
export const APR_PLIST_B64 =
  'YnBsaXN0MDDSAQIDBFFsUWQQABABCA0PERMAAAAAAAABAQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAFQ==';

export const APPLE_DESKTOP_XMP =
  `<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="XMP Core 6.0.0">` +
  `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">` +
  `<rdf:Description rdf:about="" xmlns:apple_desktop="http://ns.apple.com/namespace/1.0/" ` +
  `apple_desktop:apr="${APR_PLIST_B64}"/>` +
  `</rdf:RDF></x:xmpmeta>`;

/**
 * Encodes a 16-bit unsigned integer as big-endian bytes
 */
export function u16(n: number): Uint8Array {
  const buf = new Uint8Array(2);
  buf[0] = (n >> 8) & 0xff;
  buf[1] = n & 0xff;
  return buf;
}

/**
 * Encodes a 32-bit unsigned integer as big-endian bytes
 */
export function u32(n: number): Uint8Array {
  const buf = new Uint8Array(4);
  buf[0] = (n >> 24) & 0xff;
  buf[1] = (n >> 16) & 0xff;
  buf[2] = (n >> 8) & 0xff;
  buf[3] = n & 0xff;
  return buf;
}

/**
 * Encodes an ASCII string to Uint8Array
 */
export function ascii(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

/**
 * Concatenates multiple Uint8Arrays
 */
export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (let i = 0; i < arrays.length; i++) {
    totalLength += arrays[i].length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (let i = 0; i < arrays.length; i++) {
    result.set(arrays[i], offset);
    offset += arrays[i].length;
  }
  return result;
}

/**
 * Constructs an ISOBMFF standard Box: [size (4B)][type (4B)][payload]
 */
export function makeBox(type: string, ...payloads: Uint8Array[]): Uint8Array {
  const payload = concatBytes(...payloads);
  const size = payload.length + 8;
  return concatBytes(u32(size), ascii(type), payload);
}

/**
 * Constructs an ISOBMFF FullBox: [size (4B)][type (4B)][version (1B)][flags (3B)][payload]
 */
export function makeFullBox(
  type: string,
  version: number,
  flags: number,
  ...payloads: Uint8Array[]
): Uint8Array {
  const fl = new Uint8Array(4);
  fl[0] = version & 0xff;
  fl[1] = (flags >> 16) & 0xff;
  fl[2] = (flags >> 8) & 0xff;
  fl[3] = flags & 0xff;
  return makeBox(type, fl, ...payloads);
}

/**
 * Builds the complete multi-image ISOBMFF HEIC container with apple_desktop:apr XMP
 */
export function buildDynamicHeic(options: DynamicHeicOptions): Uint8Array {
  const { lightNal, darkNal, description, width, height } = options;
  const xmpBytes = new TextEncoder().encode(APPLE_DESKTOP_XMP);

  // 1. ftyp box
  const ftyp = makeBox('ftyp', ascii('heic'), u32(0), ascii('mif1heicmiafmsf1'));

  // 2. hdlr box (handler type = 'pict')
  const hdlr = makeFullBox('hdlr', 0, 0, u32(0), ascii('pict'), new Uint8Array(12), new Uint8Array([0]));

  // 3. pitm box (primary item ID = 1, Light wallpaper)
  const pitm = makeFullBox('pitm', 0, 0, u16(1));

  // 4. iinf box (item info entries)
  // Item 1: Light image (hvc1)
  const infe1 = makeFullBox('infe', 2, 1, u16(1), u16(0), ascii('hvc1'), new Uint8Array([0]));
  // Item 2: Dark image (hvc1)
  const infe2 = makeFullBox('infe', 2, 1, u16(2), u16(0), ascii('hvc1'), new Uint8Array([0]));
  // Item 3: XMP metadata (mime: application/rdf+xml)
  const infe3 = makeFullBox(
    'infe',
    2,
    1,
    u16(3),
    u16(0),
    ascii('mime'),
    new Uint8Array([0]),
    ascii('application/rdf+xml\0')
  );
  const iinf = makeFullBox('iinf', 0, 0, u16(3), infe1, infe2, infe3);

  // 5. iref box (item references): links XMP metadata (item 3) to primary image (item 1)
  const cdsc = makeBox('cdsc', u16(3), u16(1), u16(1));
  const iref = makeFullBox('iref', 0, 0, cdsc);

  // 6. iprp box (item properties)
  // ispe: image spatial extents
  const ispe = makeFullBox('ispe', 0, 0, u32(width), u32(height));
  // colr: nclx profile (sRGB / BT.709 full range)
  const colr = concatBytes(u32(19), ascii('colrnclx'), u16(1), u16(1), u16(1), new Uint8Array([0x80]));
  // pixi: 8-bit RGB
  const pixi = makeFullBox('pixi', 0, 0, new Uint8Array([3, 8, 8, 8]));
  // hvcC: HEVC decoder configuration record
  const hvcC = makeBox('hvcC', description);

  const ipco = makeBox('ipco', hvcC, ispe, colr, pixi);
  // ipma: associate items 1 & 2 with properties [hvcC (essential 0x81), ispe (0x02), colr (0x03), pixi (0x04)]
  const ipma = makeFullBox(
    'ipma',
    0,
    0,
    u32(2),
    u16(1),
    new Uint8Array([4, 0x81, 0x02, 0x03, 0x04]),
    u16(2),
    new Uint8Array([4, 0x81, 0x02, 0x03, 0x04])
  );
  const iprp = makeBox('iprp', ipco, ipma);

  // 7. iloc calculation: we calculate exact offsets inside mdat box
  // Dummy iloc to measure meta box size precisely
  const dummyIloc = makeFullBox(
    'iloc',
    0,
    0,
    new Uint8Array([0x44, 0x00]),
    u16(3),
    u16(1),
    u16(0),
    u16(1),
    u32(0),
    u32(lightNal.length),
    u16(2),
    u16(0),
    u16(1),
    u32(0),
    u32(darkNal.length),
    u16(3),
    u16(0),
    u16(1),
    u32(0),
    u32(xmpBytes.length)
  );

  const dummyMeta = makeFullBox('meta', 0, 0, hdlr, pitm, iinf, iref, iprp, dummyIloc);
  const mdatPayloadOffset = ftyp.length + dummyMeta.length + 8; // 8 bytes for mdat header

  const off1 = mdatPayloadOffset;
  const off2 = off1 + lightNal.length;
  const off3 = off2 + darkNal.length;

  const realIloc = makeFullBox(
    'iloc',
    0,
    0,
    new Uint8Array([0x44, 0x00]),
    u16(3),
    u16(1),
    u16(0),
    u16(1),
    u32(off1),
    u32(lightNal.length),
    u16(2),
    u16(0),
    u16(1),
    u32(off2),
    u32(darkNal.length),
    u16(3),
    u16(0),
    u16(1),
    u32(off3),
    u32(xmpBytes.length)
  );

  const meta = makeFullBox('meta', 0, 0, hdlr, pitm, iinf, iref, iprp, realIloc);
  const mdat = makeBox('mdat', lightNal, darkNal, xmpBytes);

  return concatBytes(ftyp, meta, mdat);
}

/**
 * Candidate HEVC codec profiles in descending order of capabilities
 */
const HEVC_PROFILES = [
  'hvc1.1.6.L180.B0', // Level 6.0 (up to 8K)
  'hvc1.1.6.L153.B0', // Level 5.1 (up to 4K 60fps)
  'hvc1.1.6.L150.B0', // Level 5.0 (up to 4K 30fps)
  'hvc1.1.6.L120.B0', // Level 4.0 (1080p)
  'hvc1.1.6.L93.B0',  // Level 3.1
  'hvc1.1.6.L90.B0',  // Level 3.0
];

/**
 * Checks whether native hardware-accelerated HEVC encoding is supported in the current browser
 */
export async function isHeicSupported(width: number, height: number): Promise<boolean> {
  if (typeof window === 'undefined' || typeof (window as unknown as { VideoEncoder: unknown }).VideoEncoder === 'undefined') {
    return false;
  }
  for (const codec of HEVC_PROFILES) {
    try {
      const res = await VideoEncoder.isConfigSupported({
        codec,
        width,
        height,
        bitrate: 15_000_000,
      });
      if (res.supported) return true;
    } catch {
      // test next profile
    }
  }
  return false;
}

/**
 * Finds the first supported HEVC codec configuration for the given resolution
 */
async function getSupportedConfig(width: number, height: number): Promise<VideoEncoderConfig> {
  for (const codec of HEVC_PROFILES) {
    try {
      const res = await VideoEncoder.isConfigSupported({
        codec,
        width,
        height,
        bitrate: 20_000_000,
      });
      if (res.supported && res.config) {
        return res.config;
      }
    } catch {
      // continue
    }
  }
  throw new Error('Hardware HEVC encoding is not supported in this browser.');
}

/**
 * Encodes a single canvas into an HEVC keyframe NAL unit stream using WebCodecs
 */
export async function encodeCanvasToHevc(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  width: number,
  height: number,
  config?: VideoEncoderConfig
): Promise<{ nalData: Uint8Array; description: Uint8Array }> {
  const encConfig = config || (await getSupportedConfig(width, height));

  return new Promise((resolve, reject) => {
    let nalChunk: Uint8Array | null = null;
    let description: Uint8Array | null = null;

    const encoder = new VideoEncoder({
      output: (chunk, metadata) => {
        const buf = new Uint8Array(chunk.byteLength);
        chunk.copyTo(buf);
        nalChunk = buf;

        if (metadata?.decoderConfig?.description) {
          const desc = metadata.decoderConfig.description;
          if (desc instanceof ArrayBuffer) {
            description = new Uint8Array(desc);
          } else if (ArrayBuffer.isView(desc)) {
            description = new Uint8Array(desc.buffer, desc.byteOffset, desc.byteLength);
          }
        }
      },
      error: (err) => {
        reject(err);
      },
    });

    try {
      encoder.configure(encConfig);

      // Create a VideoFrame from canvas
      const frame = new VideoFrame(canvas as CanvasImageSource, { timestamp: 0 });
      encoder.encode(frame, { keyFrame: true });
      frame.close();

      encoder
        .flush()
        .then(() => {
          encoder.close();
          if (!nalChunk) {
            reject(new Error('No encoded video chunk received from hardware encoder.'));
            return;
          }
          if (!description) {
            reject(new Error('No HEVCDecoderConfigurationRecord description received.'));
            return;
          }
          resolve({ nalData: nalChunk, description });
        })
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Encodes paired Light and Dark canvases into a single macOS Dynamic .HEIC file Blob
 */
export async function createDynamicHeicBlob(
  lightCanvas: HTMLCanvasElement | OffscreenCanvas,
  darkCanvas: HTMLCanvasElement | OffscreenCanvas,
  width: number,
  height: number
): Promise<Blob> {
  const config = await getSupportedConfig(width, height);

  // Encode Light canvas (Frame 0)
  const lightResult = await encodeCanvasToHevc(lightCanvas, width, height, config);

  // Encode Dark canvas (Frame 1)
  const darkResult = await encodeCanvasToHevc(darkCanvas, width, height, config);

  // Assemble ISOBMFF HEIC container
  const heicBytes = buildDynamicHeic({
    lightNal: lightResult.nalData,
    darkNal: darkResult.nalData,
    description: lightResult.description || darkResult.description,
    width,
    height,
  });

  return new Blob([heicBytes], { type: 'image/heic' });
}
