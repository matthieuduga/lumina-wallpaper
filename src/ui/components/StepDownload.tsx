import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { DeviceSpec, PaletteSpec, RenderOptions, ThemeMode, WallpaperModule } from '../../modules/types';
import { createDynamicZip, createDynamicHeic, isHeicSupported, renderToBlob, triggerDownload } from '../../engine/exporter';
import { OS_GUIDES } from '../../guides/guideContent';
import confetti from 'canvas-confetti';
import { Download, Archive, Share2, Check, Loader2, Sparkles, Copy } from 'lucide-react';

interface StepDownloadProps {
  module: WallpaperModule<any>;
  device: DeviceSpec;
  palette: PaletteSpec;
  theme: ThemeMode;
  renderOptions: RenderOptions<any>;
  lightRenderOptions: RenderOptions<any>;
  darkRenderOptions: RenderOptions<any>;
  shareUrl?: string;
}

export const StepDownload: React.FC<StepDownloadProps> = ({
  module,
  device,
  palette,
  theme,
  renderOptions,
  lightRenderOptions,
  darkRenderOptions,
  shareUrl,
}) => {
  const { locale, t } = useI18n();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<number | null>(null);
  const [heicSupported, setHeicSupported] = useState<boolean | null>(null);

  const isMac = device.category === 'mac';

  // Check WebCodecs HEVC support on mount or resolution change
  useEffect(() => {
    let active = true;
    isHeicSupported(renderOptions.width, renderOptions.height)
      .then((supported) => {
        if (active) setHeicSupported(supported);
      })
      .catch(() => {
        if (active) setHeicSupported(false);
      });
    return () => {
      active = false;
    };
  }, [renderOptions.width, renderOptions.height]);

  const guide = OS_GUIDES[device.category]?.[locale] || OS_GUIDES.mac[locale];

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#38bdf8', '#818cf8', '#c084fc', '#34d399'],
    });
  };

  const handleDownloadSingle = async (selectedTheme: 'light' | 'dark') => {
    setIsExporting(true);
    setExportStatus(t('step5.rendering'));
    try {
      const opts = selectedTheme === 'light' ? lightRenderOptions : darkRenderOptions;
      const blob = await renderToBlob(module, opts);
      const filename = `Lumina_${palette.name.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedTheme}_${opts.width}x${opts.height}.png`;
      triggerDownload(blob, filename);
      triggerCelebration();
    } catch (err) {
      console.error(err);
      alert('Failed to generate image. Please try reducing supersampling.');
    } finally {
      setIsExporting(false);
      setExportStatus(null);
    }
  };

  const handleDownloadHeic = async () => {
    setIsExporting(true);
    setExportStatus(t('step5.encodingHeic'));
    try {
      const blob = await createDynamicHeic(module, lightRenderOptions, darkRenderOptions);
      const filename = `Lumina_${palette.name.replace(/[^a-zA-Z0-9]/g, '_')}_Dynamic.heic`;
      triggerDownload(blob, filename);
      triggerCelebration();
    } catch (err) {
      console.error('Failed to generate dynamic HEIC:', err);
      alert('Dynamic HEIC generation failed on this browser. You can download the individual Light & Dark PNGs below.');
    } finally {
      setIsExporting(false);
      setExportStatus(null);
    }
  };

  const handleDownloadZip = async () => {
    setIsExporting(true);
    setExportStatus(t('step5.rendering'));
    try {
      const baseName = `Lumina_${palette.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const zipBlob = await createDynamicZip(
        module,
        lightRenderOptions,
        darkRenderOptions,
        baseName
      );

      triggerDownload(zipBlob, `${baseName}_Wallpapers.zip`);
      triggerCelebration();
    } catch (err) {
      console.error(err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsExporting(false);
      setExportStatus(null);
    }
  };

  const effectiveShareUrl =
    shareUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(effectiveShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Lumina - ${palette.name} (${device.name})`,
          text: `Check out my custom wallpaper configuration on Lumina Studio!`,
          url: effectiveShareUrl,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  const handleCopyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(index);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const resString = `${renderOptions.width} × ${renderOptions.height} px`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          {t('step5.title')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-neutral-400">{t('step5.subtitle')}</p>
      </div>

      {/* Main Download Actions Box */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-purple-500/10 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col gap-3">
          {theme === 'auto' ? (
            isMac && heicSupported !== false ? (
              /* Mac Auto Mode: Direct Dynamic .HEIC Download */
              <>
                <button
                  onClick={handleDownloadHeic}
                  disabled={isExporting}
                  className="group relative flex flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-5 py-3 text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {isExporting ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Sparkles size={17} className="text-sky-200" />
                    )}
                    <span>{t('step5.downloadHeic', { res: resString })}</span>
                  </div>
                  <span className="text-[11px] text-white/80 font-normal">
                    {exportStatus || t('step5.downloadHeicDesc')}
                  </span>
                </button>

                {/* Secondary Individual PNGs */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleDownloadSingle('light')}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>{t('step5.downloadLightPng')}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadSingle('dark')}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>{t('step5.downloadDarkPng')}</span>
                  </button>
                </div>
              </>
            ) : (
              /* Non-Mac or HEIC Fallback: Dual ZIP + PNGs */
              <>
                {isMac && heicSupported === false && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300">
                    {t('step5.heicUnsupported')}
                  </div>
                )}
                <button
                  onClick={handleDownloadZip}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isExporting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Archive size={16} />
                  )}
                  <span>{exportStatus || t('step5.downloadZip')}</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleDownloadSingle('light')}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>{t('step5.downloadLightPng')}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadSingle('dark')}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>{t('step5.downloadDarkPng')}</span>
                  </button>
                </div>
              </>
            )
          ) : (
            /* Single Theme PNG Download */
            <button
              onClick={() => handleDownloadSingle(theme)}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>{exportStatus || t('step5.downloadSingle', { res: resString })}</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Shareable Link Card */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 sm:p-5 backdrop-blur-xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
              <Share2 size={15} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                {t('step5.shareCardTitle')}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                {t('step5.shareCardSubtitle')}
              </p>
            </div>
          </div>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              <Share2 size={12} />
              <span>{t('step5.nativeShare')}</span>
            </button>
          )}
        </div>

        {/* Short Code & Copy Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3 py-2 text-xs font-mono text-slate-600 dark:text-neutral-300">
            <span className="block truncate select-all">{effectiveShareUrl}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-500/20 transition cursor-pointer"
          >
            {copiedLink ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedLink ? t('step5.copied') : t('step5.copyButton')}</span>
          </button>
        </div>
      </div>

      {/* Contextual Installation Guide */}
      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-sky-600 dark:text-sky-400" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('step5.guideTitle', { os: guide.osName })}
          </h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">{guide.summary}</p>

        <div className="space-y-3 pt-1">
          {guide.steps.map((st, i) => (
            <div key={i} className="rounded-lg border border-slate-200/80 dark:border-white/5 bg-white dark:bg-black/30 p-3 space-y-1.5">
              <h5 className="text-xs font-semibold text-slate-900 dark:text-neutral-200">{st.title}</h5>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">{st.description}</p>

              {st.command && (
                <div className="relative mt-2 flex items-center justify-between rounded-md bg-slate-100 dark:bg-neutral-950 p-2 font-mono text-[11px] text-sky-700 dark:text-sky-300">
                  <span className="truncate pr-8">{st.command}</span>
                  <button
                    onClick={() => handleCopyCommand(st.command!, i)}
                    className="absolute right-2 rounded p-1 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    title="Copy command"
                  >
                    {copiedCmd === i ? (
                      <Check size={12} className="text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              )}

              {st.tip && (
                <div className="mt-1 text-[11px] text-slate-500 dark:text-neutral-400 italic">
                  💡 {st.tip}
                </div>
              )}
            </div>
          ))}
        </div>

        {guide.notes && (
          <p className="text-[11px] text-slate-400 dark:text-neutral-500 italic pt-1">{guide.notes}</p>
        )}
      </div>
    </div>
  );
};
