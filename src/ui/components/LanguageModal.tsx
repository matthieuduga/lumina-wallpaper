import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useI18n, Locale } from '../../i18n';
import { Search, Check, X, Globe, Sparkles } from 'lucide-react';

interface LanguageOption {
  code: Locale;
  nativeName: string;
  englishName: string;
  region: string;
  flag: string;
  available: boolean;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    region: 'United States, United Kingdom & International',
    flag: '🇺🇸',
    available: true,
  },
  {
    code: 'fr',
    nativeName: 'Français',
    englishName: 'French',
    region: 'France, Canada, Suisse, Belgique',
    flag: '🇫🇷',
    available: true,
  },
  {
    code: 'en' as Locale, // Placeholder for showcase
    nativeName: 'Español',
    englishName: 'Spanish',
    region: 'España, América Latina',
    flag: '🇪🇸',
    available: false,
  },
  {
    code: 'en' as Locale,
    nativeName: 'Deutsch',
    englishName: 'German',
    region: 'Deutschland, Österreich, Schweiz',
    flag: '🇩🇪',
    available: false,
  },
  {
    code: 'en' as Locale,
    nativeName: '日本語',
    englishName: 'Japanese',
    region: '日本 (Japan)',
    flag: '🇯🇵',
    available: false,
  },
];

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { locale, setLocale, t } = useI18n();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter available languages according to query
  const filtered = LANGUAGES.filter((lang) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      lang.nativeName.toLowerCase().includes(q) ||
      lang.englishName.toLowerCase().includes(q) ||
      lang.region.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  // Focus search input and lock body scroll when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle keyboard events (Escape, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected && selected.available) {
          setLocale(selected.code);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filtered, setLocale, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 dark:bg-black/60 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Search */}
        <div className="border-b border-slate-200/80 dark:border-white/10 p-3.5 sm:p-4">
          <div className="flex items-center justify-between pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                <Globe size={16} />
              </div>
              <h2 id="language-modal-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('language.title')}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-neutral-400 sm:inline">
                ESC
              </span>
              <button
                onClick={onClose}
                aria-label="Close language selector"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder={t('language.searchPlaceholder')}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 py-2 pl-9 pr-8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Language Options List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-neutral-500">
              {t('language.noResults')}
            </div>
          ) : (
            filtered.map((lang, idx) => {
              const isCurrent = lang.available && lang.code === locale;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={`${lang.code}-${lang.nativeName}`}
                  disabled={!lang.available}
                  onClick={() => {
                    if (lang.available) {
                      setLocale(lang.code);
                      onClose();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-all ${
                    !lang.available
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-900 dark:text-sky-100 ring-1 ring-sky-500/30'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl leading-none" role="img" aria-label={lang.nativeName}>
                      {lang.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {lang.nativeName}
                        </span>
                        {lang.nativeName !== lang.englishName && (
                          <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                            ({lang.englishName})
                          </span>
                        )}
                        {!lang.available && (
                          <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-medium text-amber-600 dark:text-amber-400">
                            <Sparkles size={9} />
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-neutral-400 truncate max-w-xs">
                        {lang.region}
                      </p>
                    </div>
                  </div>

                  {isCurrent && (
                    <div className="flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-300 shadow-sm">
                      <Check size={11} />
                      <span>{t('language.active')}</span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 text-[11px] text-slate-500 dark:text-neutral-400 flex items-center justify-between">
          <span>{t('language.autoDetectNotice')}</span>
          <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
            ↵ to select
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
