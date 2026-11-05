import React from 'react';
import { useI18n } from '../../i18n';
import { DeviceSpec, OrientationMode, QualityMultiplier } from '../../modules/types';
import devicesData from '../../data/devices.json';
import { Smartphone, Monitor, Tablet, Sliders, CheckCircle2, RotateCw, AlertCircle } from 'lucide-react';

interface StepDeviceProps {
  selectedDevice: DeviceSpec;
  onSelectDevice: (device: DeviceSpec) => void;
  orientation: OrientationMode;
  onToggleOrientation: () => void;
  quality: QualityMultiplier;
  onChangeQuality: (q: QualityMultiplier) => void;
  customWidth: number;
  customHeight: number;
  onUpdateCustomRes: (w: number, h: number) => void;
  isCustom: boolean;
  setIsCustom: (c: boolean) => void;
}

export const StepDevice: React.FC<StepDeviceProps> = ({
  selectedDevice,
  onSelectDevice,
  orientation,
  onToggleOrientation,
  quality,
  onChangeQuality,
  customWidth,
  customHeight,
  onUpdateCustomRes,
  isCustom,
  setIsCustom,
}) => {
  const { t } = useI18n();
  const devices = devicesData as DeviceSpec[];

  const [activeCategory, setActiveCategory] = React.useState<string>(
    isCustom ? 'custom' : selectedDevice.category
  );

  const categories = [
    { id: 'mac', label: t('step2.categories.mac'), icon: Monitor },
    { id: 'iphone', label: t('step2.categories.iphone'), icon: Smartphone },
    { id: 'ipad', label: t('step2.categories.ipad'), icon: Tablet },
    { id: 'pc', label: t('step2.categories.pc'), icon: Monitor },
    { id: 'android', label: t('step2.categories.android'), icon: Smartphone },
    { id: 'custom', label: t('step2.categories.custom'), icon: Sliders },
  ];

  const filteredDevices = devices.filter((d) => d.category === activeCategory);

  const handleDetectScreen = () => {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(window.screen.width * dpr);
    const h = Math.round(window.screen.height * dpr);
    onUpdateCustomRes(w, h);
    setIsCustom(true);
    setActiveCategory('custom');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          {t('step2.title')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-neutral-400">{t('step2.subtitle')}</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 p-1 backdrop-blur-md">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setActiveCategory(c.id);
                if (c.id === 'custom') {
                  setIsCustom(true);
                } else {
                  setIsCustom(false);
                  const firstInCat = devices.find((d) => d.category === c.id);
                  if (firstInCat) onSelectDevice(firstInCat);
                }
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
              }`}
            >
              <Icon size={13} />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Resolution Form */}
      {activeCategory === 'custom' ? (
        <div className="space-y-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('step2.custom.title')}
            </h4>
            <button
              onClick={handleDetectScreen}
              className="flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/10 dark:bg-sky-500/20 px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-300 hover:bg-sky-500/20 dark:hover:bg-sky-500/30 transition"
            >
              <RotateCw size={12} />
              <span>{t('step2.custom.detect')}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-neutral-400 mb-1">
                {t('step2.custom.width')}
              </label>
              <input
                type="number"
                min="320"
                max="16000"
                value={customWidth}
                onChange={(e) =>
                  onUpdateCustomRes(
                    parseInt(e.target.value, 10) || 1920,
                    customHeight
                  )
                }
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-1.5 font-mono text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-neutral-400 mb-1">
                {t('step2.custom.height')}
              </label>
              <input
                type="number"
                min="320"
                max="16000"
                value={customHeight}
                onChange={(e) =>
                  onUpdateCustomRes(
                    customWidth,
                    parseInt(e.target.value, 10) || 1080
                  )
                }
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-1.5 font-mono text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Device List Grid */
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1">
          {filteredDevices.map((d) => {
            const isSelected = !isCustom && selectedDevice.id === d.id;
            return (
              <div
                key={d.id}
                onClick={() => {
                  setIsCustom(false);
                  onSelectDevice(d);
                }}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-500/10 shadow-md shadow-sky-500/10'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/80 dark:hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {d.name}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-neutral-400">
                    {d.width} × {d.height} px
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2 size={16} className="text-sky-500 dark:text-sky-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Orientation & Quality Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-slate-200 dark:border-white/10">
        {/* Orientation Toggle */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
              {t('step2.orientation.title')}
            </span>
            <button
              onClick={onToggleOrientation}
              className="flex items-center gap-1 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/20 transition cursor-pointer"
            >
              <RotateCw size={11} />
              <span>{t('step2.orientation.toggle')}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-neutral-400">
            {orientation === 'mobile' ? (
              <Smartphone size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
            ) : (
              <Monitor size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
            )}
            <span>
              {orientation === 'mobile'
                ? t('step2.orientation.mobile')
                : t('step2.orientation.desktop')}
            </span>
          </div>
        </div>

        {/* Quality Multiplier */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-3">
          <span className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
            {t('step2.quality.title')}
          </span>
          <div className="flex gap-1.5">
            {[1, 1.5, 2].map((q) => (
              <button
                key={q}
                onClick={() => onChangeQuality(q as QualityMultiplier)}
                className={`flex-1 rounded-lg py-1 text-xs font-medium transition cursor-pointer ${
                  quality === q
                    ? 'bg-sky-500 text-white font-semibold'
                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent'
                }`}
              >
                {q}×
              </button>
            ))}
          </div>
          {quality === 2 && (
            <div className="mt-2 flex items-start gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 leading-tight">
              <AlertCircle size={12} className="shrink-0 mt-0.5" />
              <span>{t('step2.quality.warning')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
