import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header, SiteTheme } from './components/Header';
import { Preview } from './components/Preview';
import { Stepper, StepId } from './components/Stepper';
import { StepType } from './components/StepType';
import { StepDevice } from './components/StepDevice';
import { StepColors } from './components/StepColors';
import { StepTheme } from './components/StepTheme';
import { StepDownload } from './components/StepDownload';
import { CreationsModal } from './components/CreationsModal';

import { DeviceSpec, OrientationMode, PaletteSpec, QualityMultiplier, RenderOptions, ThemeMode, WallpaperModule } from '../modules/types';
import { getModule } from '../modules';
import { glassPillsModule, glassPillsPalettes } from '../modules/glass-pills';
import devicesData from '../data/devices.json';
import { hexToRgbFloat } from '../engine/math';
import { encodeShareCode, parseUrlHash, ShareConfig, buildShareUrl } from '../engine/share';
import { getSavedCreations, saveCreation, SavedCreation } from '../engine/storage';
import { renderThumbnail } from '../engine/exporter';
import { useI18n } from '../i18n';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { t } = useI18n();

  // App Site Theme (auto / light / dark). Default is AUTO.
  const [siteTheme, setSiteTheme] = useState<SiteTheme>(() => {
    const saved = localStorage.getItem('lumina_site_theme') as SiteTheme | null;
    if (saved === 'auto' || saved === 'light' || saved === 'dark') return saved;
    return 'auto';
  });

  const handleSiteThemeChange = (newTheme: SiteTheme) => {
    setSiteTheme(newTheme);
    localStorage.setItem('lumina_site_theme', newTheme);
  };

  // Sync class on documentElement based on siteTheme & prefers-color-scheme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        siteTheme === 'auto' ? mediaQuery.matches : siteTheme === 'dark';

      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();

    const handleChange = () => {
      if (siteTheme === 'auto') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [siteTheme]);

  // Stepper State
  const [currentStep, setCurrentStep] = useState<StepId>(1);

  // Studio Configuration State
  const [activeModule, setActiveModule] = useState<WallpaperModule<any>>(() => glassPillsModule);
  const [moduleParams, setModuleParams] = useState<any>(() => glassPillsModule.defaultParams);

  const handleSelectModule = (mod: WallpaperModule<any>) => {
    setActiveModule(mod);
    setModuleParams(mod.defaultParams);
    if (mod.defaultPalette) {
      setActivePalette(mod.defaultPalette);
    } else if (mod.palettes && mod.palettes.length > 0) {
      setActivePalette(mod.palettes[0]);
    }
  };

  const defaultDevice = devicesData[0] as DeviceSpec;
  const [selectedDevice, setSelectedDevice] = useState<DeviceSpec>(defaultDevice);
  const [isCustomRes, setIsCustomRes] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(defaultDevice.width);
  const [customHeight, setCustomHeight] = useState<number>(defaultDevice.height);

  const [orientation, setOrientation] = useState<OrientationMode>(defaultDevice.orientation);
  const [quality, setQuality] = useState<QualityMultiplier>(1);

  const defaultPalette = glassPillsPalettes[0];
  const [activePalette, setActivePalette] = useState<PaletteSpec>(defaultPalette);
  const [theme, setTheme] = useState<ThemeMode>('auto');
  const [previewAutoTheme, setPreviewAutoTheme] = useState<'light' | 'dark'>('dark');

  // LocalStorage Creations History
  const [creations, setCreations] = useState<SavedCreation[]>(getSavedCreations);
  const [isCreationsOpen, setIsCreationsOpen] = useState(false);

  // Sync orientation when device changes unless user manually toggles
  const handleSelectDevice = (d: DeviceSpec) => {
    setSelectedDevice(d);
    setOrientation(d.orientation);
    setIsCustomRes(false);
  };

  const handleToggleOrientation = () => {
    setOrientation((prev) => (prev === 'desktop' ? 'mobile' : 'desktop'));
  };

  // Apply a ShareConfig
  const applyConfig = useCallback((cfg: ShareConfig) => {
    const mod = getModule(cfg.moduleId);
    if (mod) setActiveModule(mod);

    if (cfg.isCustomRes && cfg.customWidth && cfg.customHeight) {
      setIsCustomRes(true);
      setCustomWidth(cfg.customWidth);
      setCustomHeight(cfg.customHeight);
    } else if (cfg.deviceId) {
      const dev = (devicesData as DeviceSpec[]).find((d) => d.id === cfg.deviceId);
      if (dev) {
        setSelectedDevice(dev);
        setIsCustomRes(false);
      }
    }

    if (cfg.orientation) setOrientation(cfg.orientation);

    if (cfg.customPalette) {
      setActivePalette({
        id: 'custom',
        name: cfg.customPalette.name,
        bgDark: cfg.customPalette.bgDark,
        bgLight: cfg.customPalette.bgLight || undefined,
        leftRamp: cfg.customPalette.leftRamp,
        rightRamp: cfg.customPalette.rightRamp,
      });
    } else if (cfg.paletteId) {
      const availablePalettes = mod?.palettes || glassPillsPalettes;
      const pal = availablePalettes.find((p) => p.id === cfg.paletteId);
      if (pal) setActivePalette(pal);
    }

    if (cfg.theme) setTheme(cfg.theme);
    if (cfg.quality) setQuality(cfg.quality as QualityMultiplier);
    if (cfg.params) setModuleParams((prev: Record<string, unknown>) => ({ ...prev, ...cfg.params }));
  }, []);

  // Parse URL on mount: compact #c/<code> or legacy #module=...
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (!hash) return;
      const parsed = parseUrlHash(hash);
      if (parsed) {
        applyConfig(parsed);
      }
    } catch (e) {
      console.warn('Could not parse URL share code', e);
    }
  }, [applyConfig]);

  // Current ShareConfig
  const currentShareConfig = useMemo<ShareConfig>(() => ({
    moduleId: activeModule.id,
    deviceId: isCustomRes ? undefined : selectedDevice.id,
    customWidth: isCustomRes ? customWidth : undefined,
    customHeight: isCustomRes ? customHeight : undefined,
    isCustomRes,
    orientation,
    paletteId: activePalette.id !== 'custom' ? activePalette.id : undefined,
    customPalette: activePalette.id === 'custom' ? {
      name: activePalette.name,
      bgDark: activePalette.bgDark,
      bgLight: activePalette.bgLight || undefined,
      leftRamp: activePalette.leftRamp,
      rightRamp: activePalette.rightRamp,
    } : undefined,
    theme,
    quality,
    params: moduleParams,
  }), [activeModule.id, isCustomRes, selectedDevice.id, customWidth, customHeight, orientation, activePalette, theme, quality, moduleParams]);

  // Sync compact code #c/<code> in URL without reload
  useEffect(() => {
    const code = encodeShareCode(currentShareConfig);
    window.history.replaceState(null, '', `#c/${code}`);
  }, [currentShareConfig]);

  // Derived Render Options
  const targetWidth = Math.round((isCustomRes ? customWidth : selectedDevice.width) * quality);
  const targetHeight = Math.round((isCustomRes ? customHeight : selectedDevice.height) * quality);

  const baseRenderOptions = useMemo<RenderOptions<any>>(() => {
    const bgDark = hexToRgbFloat(activePalette.bgDark);
    const bgLight = hexToRgbFloat(activePalette.bgLight || '#f4f5f8');
    const leftRamp = activePalette.leftRamp.map(hexToRgbFloat);
    const rightRamp = activePalette.rightRamp.map(hexToRgbFloat);

    return {
      width: targetWidth,
      height: targetHeight,
      orientation,
      theme: theme === 'auto' ? previewAutoTheme : theme,
      bgDark,
      bgLight,
      leftRamp,
      rightRamp,
      params: moduleParams,
    };
  }, [targetWidth, targetHeight, orientation, theme, previewAutoTheme, activePalette, moduleParams]);

  const lightRenderOptions = useMemo<RenderOptions<any>>(() => {
    return { ...baseRenderOptions, theme: 'light' };
  }, [baseRenderOptions]);

  const darkRenderOptions = useMemo<RenderOptions<any>>(() => {
    return { ...baseRenderOptions, theme: 'dark' };
  }, [baseRenderOptions]);

  // Stepper Navigation
  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as StepId);
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as StepId);
  };

  const handleGenerate = () => {
    // Render fast offscreen thumbnail (JPEG ~6KB)
    const thumbnail = renderThumbnail(activeModule, baseRenderOptions);
    const code = encodeShareCode(currentShareConfig);

    const creation: SavedCreation = {
      id: `lumina_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      code,
      createdAt: Date.now(),
      thumbnail,
      moduleName: activeModule.name,
      deviceName: isCustomRes ? `${customWidth}×${customHeight} px` : selectedDevice.name,
      paletteName: activePalette.name,
      theme,
      orientation,
      config: currentShareConfig,
    };

    const updated = saveCreation(creation);
    setCreations(updated);

    confetti({
      particleCount: 75,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#38bdf8', '#818cf8', '#c084fc', '#34d399'],
    });

    setCurrentStep(5);
  };

  const handleRestoreCreation = (config: ShareConfig) => {
    applyConfig(config);
    setCurrentStep(5);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white transition-colors">
      <div>
        <Header
          siteTheme={siteTheme}
          onChangeSiteTheme={handleSiteThemeChange}
          creationsCount={creations.length}
          onOpenCreations={() => setIsCreationsOpen(true)}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-start">
            {/* Left Column: Stepper & Controls (7 Cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* 5-Step Navigation */}
              <Stepper currentStep={currentStep} onSelectStep={setCurrentStep} />

              {/* Active Step Content Container */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-neutral-900/50 p-5 sm:p-6 backdrop-blur-xl shadow-lg dark:shadow-xl min-h-[420px] flex flex-col justify-between transition-colors">
                <div>
                  {currentStep === 1 && (
                    <StepType
                      activeModule={activeModule}
                      onSelectModule={handleSelectModule}
                      moduleParams={moduleParams}
                      onChangeParams={setModuleParams}
                    />
                  )}
                  {currentStep === 2 && (
                    <StepDevice
                      selectedDevice={selectedDevice}
                      onSelectDevice={handleSelectDevice}
                      orientation={orientation}
                      onToggleOrientation={handleToggleOrientation}
                      quality={quality}
                      onChangeQuality={setQuality}
                      customWidth={customWidth}
                      customHeight={customHeight}
                      onUpdateCustomRes={(w, h) => {
                        setCustomWidth(w);
                        setCustomHeight(h);
                      }}
                      isCustom={isCustomRes}
                      setIsCustom={setIsCustomRes}
                    />
                  )}
                  {currentStep === 3 && (
                    <StepColors
                      palettes={activeModule.palettes || glassPillsPalettes}
                      activePalette={activePalette}
                      onSelectPalette={setActivePalette}
                      onUpdateCustomColors={setActivePalette}
                    />
                  )}
                  {currentStep === 4 && (
                    <StepTheme
                      theme={theme}
                      onSelectTheme={setTheme}
                      previewAutoTheme={previewAutoTheme}
                      onTogglePreviewAutoTheme={setPreviewAutoTheme}
                    />
                  )}
                  {currentStep === 5 && (
                    <StepDownload
                      module={activeModule}
                      device={selectedDevice}
                      palette={activePalette}
                      theme={theme}
                      renderOptions={baseRenderOptions}
                      lightRenderOptions={lightRenderOptions}
                      darkRenderOptions={darkRenderOptions}
                      shareUrl={buildShareUrl(currentShareConfig)}
                    />
                  )}
                </div>

                {/* Next / Previous Action Buttons */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-neutral-300 transition hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                    <span>{t('common.prev')}</span>
                  </button>

                  {currentStep === 4 ? (
                    <button
                      onClick={handleGenerate}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
                    >
                      <Sparkles size={15} />
                      <span>{t('step4.generateButton')}</span>
                      <ChevronRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={currentStep === 5}
                      className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-500/20 transition hover:bg-sky-400 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <span>{t('common.next')}</span>
                      <ChevronRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Live Viewport (5 Cols on desktop) */}
            <div className="lg:col-span-5 lg:sticky lg:top-20">
              <Preview
                module={activeModule}
                renderOptions={baseRenderOptions}
                device={selectedDevice}
                isCustomRes={isCustomRes}
                themeMode={theme}
                previewAutoTheme={previewAutoTheme}
                onTogglePreviewAutoTheme={setPreviewAutoTheme}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-neutral-950/80 py-6 text-center text-xs text-slate-500 dark:text-neutral-400 transition-colors">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 <strong>Lumina Wallpaper Studio</strong>. 100% Client-Side. Open source under MIT License.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/matthieuduga/lumina-wallpaper"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition"
            >
              GitHub
            </a>
            <span>•</span>
            <span>Private & Zero Telemetry</span>
          </div>
        </div>
      </footer>

      {/* Saved Creations Command Palette Modal */}
      <CreationsModal
        isOpen={isCreationsOpen}
        onClose={() => setIsCreationsOpen(false)}
        creations={creations}
        onRefreshCreations={() => setCreations(getSavedCreations())}
        onRestoreCreation={handleRestoreCreation}
      />
    </div>
  );
};
