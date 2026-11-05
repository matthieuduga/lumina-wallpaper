import JSZip from 'jszip';
import { RenderOptions, WallpaperModule } from '../modules/types';
import { createDynamicHeicBlob, isHeicSupported } from './heic';

export { isHeicSupported };

/**
 * Triggers a browser download for a given Blob.
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Renders a wallpaper module offscreen onto an HTMLCanvasElement with WebGL 2.0.
 */
export function renderToCanvas<TParams>(
  module: WallpaperModule<TParams>,
  options: RenderOptions<TParams>
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;

  const gl = canvas.getContext('webgl2', {
    preserveDrawingBuffer: true,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });

  if (!gl) {
    throw new Error('WebGL 2.0 is not supported on this browser/device.');
  }

  // Execute module render pass
  module.renderWebGL(gl, options);
  gl.finish();

  return canvas;
}

/**
 * Renders a lightweight thumbnail data URL for history/cache storage.
 */
export function renderThumbnail<TParams>(
  module: WallpaperModule<TParams>,
  options: RenderOptions<TParams>,
  maxDim = 260
): string {
  const aspect = options.width / options.height;
  let thumbWidth = maxDim;
  let thumbHeight = Math.round(maxDim / aspect);
  if (aspect < 1) {
    thumbHeight = maxDim;
    thumbWidth = Math.round(maxDim * aspect);
  }

  const thumbOptions: RenderOptions<TParams> = {
    ...options,
    width: Math.max(64, thumbWidth),
    height: Math.max(64, thumbHeight),
  };

  const canvas = renderToCanvas(module, thumbOptions);
  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Renders a wallpaper module offscreen at target resolution into a PNG Blob.
 */
export async function renderToBlob<TParams>(
  module: WallpaperModule<TParams>,
  options: RenderOptions<TParams>
): Promise<Blob> {
  const canvas = renderToCanvas(module, options);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate PNG blob from canvas.'));
        }
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Generates an official Apple Dynamic .HEIC file containing both Light and Dark modes.
 */
export async function createDynamicHeic<TParams>(
  module: WallpaperModule<TParams>,
  lightOptions: RenderOptions<TParams>,
  darkOptions: RenderOptions<TParams>
): Promise<Blob> {
  const lightCanvas = renderToCanvas(module, lightOptions);
  const darkCanvas = renderToCanvas(module, darkOptions);

  return createDynamicHeicBlob(
    lightCanvas,
    darkCanvas,
    lightOptions.width,
    lightOptions.height
  );
}

/**
 * Bundles Light and Dark PNGs along with a clear setup guide into a clean ZIP archive.
 */
export async function createDynamicZip<TParams>(
  module: WallpaperModule<TParams>,
  lightOptions: RenderOptions<TParams>,
  darkOptions: RenderOptions<TParams>,
  baseName: string
): Promise<Blob> {
  const zip = new JSZip();

  // Render both themes in parallel
  const [lightBlob, darkBlob] = await Promise.all([
    renderToBlob(module, lightOptions),
    renderToBlob(module, darkOptions),
  ]);

  const sanitized = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const lightFilename = `${sanitized}_light.png`;
  const darkFilename = `${sanitized}_dark.png`;

  zip.file(lightFilename, lightBlob);
  zip.file(darkFilename, darkBlob);

  const readmeContent = `# ${baseName} - Wallpaper Pack
Created with Lumina Wallpaper Studio (https://github.com/matthieuduga/lumina-wallpaper)

This archive contains:
- ${lightFilename} : Light theme wallpaper (${lightOptions.width} x ${lightOptions.height} px)
- ${darkFilename} : Dark theme wallpaper (${darkOptions.width} x ${darkOptions.height} px)

-------------------------------------------------------------------------------
HOW TO USE ON MACOS (EASY STEP-BY-STEP):
-------------------------------------------------------------------------------
Method 1: Direct Wallpaper
- Right-click either PNG file in Finder -> "Set Desktop Picture".

Method 2: Wallpaper Folder (Recommended)
1. Move both images into a folder of your choice (e.g. Pictures / Wallpapers).
2. Open System Settings > Wallpaper.
3. Scroll down, click "Add Folder...", and select this folder.
4. Choose your favorite wallpaper, or enable automatic changing.

Method 3: Native Dynamic .HEIC (Optional)
- You can upload both PNGs to the free online creator https://dynamicwallpaper.club to download an official Apple Dynamic HEIC file with zero software installation required.
`;

  zip.file('README.txt', readmeContent);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
