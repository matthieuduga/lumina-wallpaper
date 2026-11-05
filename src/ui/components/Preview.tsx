import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n';
import { DeviceSpec, RenderOptions, ThemeMode, WallpaperModule } from '../../modules/types';
import { Maximize2, Minimize2, Smartphone, Monitor, Sun, Moon } from 'lucide-react';

interface PreviewProps {
  module: WallpaperModule<any>;
  renderOptions: RenderOptions<any>;
  device: DeviceSpec;
  isCustomRes: boolean;
  themeMode?: ThemeMode;
  previewAutoTheme?: 'light' | 'dark';
  onTogglePreviewAutoTheme?: (mode: 'light' | 'dark') => void;
}

export const Preview: React.FC<PreviewProps> = ({
  module,
  renderOptions,
  device,
  isCustomRes,
  themeMode = 'dark',
  previewAutoTheme = 'dark',
  onTogglePreviewAutoTheme,
}) => {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Compute preview dimensions matching device aspect ratio while fitting the viewport container
  const deviceRatio = renderOptions.width / renderOptions.height;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.warn('WebGL 2.0 context unavailable for live preview');
      return;
    }

    // Live preview resolution (scaled down for butter-smooth 60fps interaction)
    const previewScale = Math.min(
      1.0,
      1200 / Math.max(renderOptions.width, renderOptions.height)
    );
    const pw = Math.round(renderOptions.width * previewScale);
    const ph = Math.round(renderOptions.height * previewScale);

    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }

    try {
      module.renderWebGL(gl, {
        ...renderOptions,
        width: pw,
        height: ph,
      });
    } catch (err) {
      console.error('Error rendering WebGL preview:', err);
    }
  }, [module, renderOptions]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const shortDeviceName = isCustomRes
    ? 'Custom Screen'
    : device.name.split('/')[0].trim();

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/90 dark:bg-neutral-900/60 backdrop-blur-xl transition-all shadow-md dark:shadow-none ${
        isFullscreen
          ? 'h-screen w-screen p-6 bg-slate-100 dark:bg-neutral-950'
          : 'h-full min-h-[460px] lg:h-[580px] p-4'
      }`}
    >
      {/* Top Device Specs Bar (Header in flow, never overlapping) */}
      <div className="w-full flex items-center justify-between gap-2 text-xs shrink-0 pb-2">
        <div
          title={
            isCustomRes
              ? `Custom: ${renderOptions.width} × ${renderOptions.height} px`
              : `${device.name} (${renderOptions.width} × ${renderOptions.height} px)`
          }
          className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/15 bg-white/90 dark:bg-black/40 px-3 py-1 font-medium text-slate-700 dark:text-neutral-300 backdrop-blur-md shadow-xs min-w-0 max-w-[62%]"
        >
          {renderOptions.orientation === 'mobile' ? (
            <Smartphone size={13} className="text-sky-600 dark:text-sky-400 shrink-0" />
          ) : (
            <Monitor size={13} className="text-sky-600 dark:text-sky-400 shrink-0" />
          )}
          <span className="truncate text-xs font-semibold">{shortDeviceName}</span>
          <span className="font-mono text-[10px] text-slate-500 dark:text-neutral-400 shrink-0 hidden sm:inline">
            {renderOptions.width} × {renderOptions.height}
          </span>
        </div>

        {/* Action icons & Auto mode toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {themeMode === 'auto' && onTogglePreviewAutoTheme && (
            <div className="flex items-center rounded-full border border-slate-200 dark:border-white/15 bg-white/90 dark:bg-black/40 p-0.5 backdrop-blur-md shadow-xs">
              <button
                type="button"
                onClick={() => onTogglePreviewAutoTheme('dark')}
                title={t('preview.dark')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer ${
                  previewAutoTheme === 'dark'
                    ? 'bg-neutral-900 text-white dark:bg-white/20 shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Moon size={11} />
                <span>{t('preview.dark')}</span>
              </button>
              <button
                type="button"
                onClick={() => onTogglePreviewAutoTheme('light')}
                title={t('preview.light')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer ${
                  previewAutoTheme === 'light'
                    ? 'bg-amber-100 text-amber-950 dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sun size={11} />
                <span>{t('preview.light')}</span>
              </button>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-white/15 bg-white/90 dark:bg-black/40 text-slate-700 dark:text-neutral-300 transition hover:bg-slate-200/80 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-xs cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Render Canvas Container (flex-1 strictly between header and footer) */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center py-2 overflow-hidden">
        <div
          className="relative max-h-full max-w-full overflow-hidden rounded-xl border border-slate-300 dark:border-white/20 shadow-2xl glass-pill-preview transition-all"
          style={{
            aspectRatio: `${deviceRatio}`,
          }}
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full object-contain block"
          />
        </div>
      </div>

      {/* Bottom Live Status Bar (Footer in flow, never overlapping) */}
      <div className="w-full flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 shrink-0 pt-2 border-t border-slate-200/60 dark:border-white/5">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          {t('preview.livePreview')}
        </span>
        <span className="capitalize">{renderOptions.theme} Mode</span>
      </div>
    </div>
  );
};
