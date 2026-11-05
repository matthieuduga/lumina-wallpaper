import React from 'react';
import { useI18n } from '../../i18n';
import { ThemeMode } from '../../modules/types';
import { Sun, Moon, Sparkles, CheckCircle2 } from 'lucide-react';

interface StepThemeProps {
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  previewAutoTheme?: 'light' | 'dark';
  onTogglePreviewAutoTheme?: (mode: 'light' | 'dark') => void;
}

export const StepTheme: React.FC<StepThemeProps> = ({
  theme,
  onSelectTheme,
  previewAutoTheme = 'dark',
  onTogglePreviewAutoTheme,
}) => {
  const { t } = useI18n();

  const themes: { id: ThemeMode; titleKey: string; descKey: string; icon: any }[] = [
    {
      id: 'dark',
      titleKey: 'step4.dark.title',
      descKey: 'step4.dark.description',
      icon: Moon,
    },
    {
      id: 'light',
      titleKey: 'step4.light.title',
      descKey: 'step4.light.description',
      icon: Sun,
    },
    {
      id: 'auto',
      titleKey: 'step4.auto.title',
      descKey: 'step4.auto.description',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          {t('step4.title')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-neutral-400">{t('step4.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {themes.map((th) => {
          const Icon = th.icon;
          const isSelected = theme === th.id;
          return (
            <div
              key={th.id}
              onClick={() => onSelectTheme(th.id)}
              className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-500/10 shadow-lg shadow-sky-500/10'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/80 dark:hover:bg-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                      isSelected
                        ? 'border-sky-400/40 bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300'
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-neutral-400'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={18} className="text-sky-500 dark:text-sky-400" />
                  )}
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t(th.titleKey)}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  {t(th.descKey)}
                </p>
              </div>

              {th.id === 'auto' && (
                <div className="mt-3 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-1 text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">
                  Pack Duo : Clair + Sombre
                </div>
              )}
            </div>
          );
        })}
      </div>

      {theme === 'auto' && onTogglePreviewAutoTheme && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-indigo-200/80 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-500/10 p-4 backdrop-blur-md transition-all">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-950 dark:text-indigo-200">
              <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>{t('step4.previewToggleLabel')}</span>
            </div>
            <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
              {t('step4.previewToggleHint')}
            </p>
          </div>

          <div className="flex items-center rounded-lg border border-indigo-200 dark:border-indigo-400/20 bg-white/90 dark:bg-neutral-900/80 p-1 shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => onTogglePreviewAutoTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                previewAutoTheme === 'dark'
                  ? 'bg-neutral-900 text-white dark:bg-white/20 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon size={13} />
              <span>{t('preview.dark')}</span>
            </button>
            <button
              type="button"
              onClick={() => onTogglePreviewAutoTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                previewAutoTheme === 'light'
                  ? 'bg-amber-100 text-amber-950 dark:bg-white dark:text-neutral-900 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun size={13} />
              <span>{t('preview.light')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
