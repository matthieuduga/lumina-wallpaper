import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { Sun, Moon, Laptop, Globe, ChevronDown, Layers } from 'lucide-react';
import { LanguageModal } from './LanguageModal';
import { ThemeModal } from './ThemeModal';

export type SiteTheme = 'auto' | 'light' | 'dark';

interface HeaderProps {
  siteTheme: SiteTheme;
  onChangeSiteTheme: (theme: SiteTheme) => void;
  creationsCount?: number;
  onOpenCreations?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  siteTheme,
  onChangeSiteTheme,
  creationsCount = 0,
  onOpenCreations,
}) => {
  const { locale, t } = useI18n();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-sky-500/20">
            <div className="h-5 w-2.5 rounded-full border border-white/60 bg-white/20 backdrop-blur-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {t('app.title')}
              </span>
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                Studio v1.0
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 dark:text-neutral-400 sm:block">
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* My Creations Trigger */}
          {onOpenCreations && (
            <button
              onClick={onOpenCreations}
              title={t('creations.title')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-neutral-300 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <Layers size={14} className="text-sky-500" />
              <span className="hidden sm:inline">{t('creations.shortTitle')}</span>
              {creationsCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500/20 px-1 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                  {creationsCount}
                </span>
              )}
            </button>
          )}

          {/* Language Command Palette Trigger */}
          <button
            onClick={() => setIsLangOpen(true)}
            title={t('language.title')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-neutral-300 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <Globe size={14} className="text-sky-500" />
            <span className="font-medium">{locale === 'fr' ? 'Français' : 'English'}</span>
            <ChevronDown size={12} className="opacity-60" />
          </button>

          {/* Theme Command Palette Trigger */}
          <button
            onClick={() => setIsThemeOpen(true)}
            title={t('themeModal.title')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-neutral-300 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            {siteTheme === 'auto' && <Laptop size={14} className="text-sky-500" />}
            {siteTheme === 'light' && <Sun size={14} className="text-amber-500" />}
            {siteTheme === 'dark' && <Moon size={14} className="text-indigo-400" />}
            <span className="font-medium">
              {siteTheme === 'auto'
                ? 'Auto'
                : siteTheme === 'light'
                ? locale === 'fr'
                  ? 'Clair'
                  : 'Light'
                : locale === 'fr'
                ? 'Sombre'
                : 'Dark'}
            </span>
            <ChevronDown size={12} className="opacity-60" />
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/matthieuduga/lumina-wallpaper"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-neutral-300 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>

      {/* Language Command Palette Modal */}
      <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />

      {/* Theme Command Palette Modal */}
      <ThemeModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        siteTheme={siteTheme}
        onChangeSiteTheme={onChangeSiteTheme}
      />
    </header>
  );
};
