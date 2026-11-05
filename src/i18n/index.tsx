import React, { useContext, useState, useEffect } from 'react';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import { I18nContext, Locale } from './context';

export * from './context';

type TranslationTree = Record<string, unknown>;

const translations: Record<Locale, TranslationTree> = {
  en: enTranslations as TranslationTree,
  fr: frTranslations as TranslationTree,
};

function detectInitialLocale(): Locale {
  const saved = localStorage.getItem('lumina_lang') as Locale | null;
  if (saved === 'en' || saved === 'fr') return saved;

  const browserLangs = navigator.languages || [navigator.language || 'en'];
  for (const lang of browserLangs) {
    if (lang.toLowerCase().startsWith('fr')) return 'fr';
    if (lang.toLowerCase().startsWith('en')) return 'en';
  }
  return 'en';
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('lumina_lang', l);
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to English
        let fallbackVal: unknown = translations.en;
        for (const fk of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && fk in fallbackVal) {
            fallbackVal = (fallbackVal as Record<string, unknown>)[fk];
          } else {
            return key;
          }
        }
        value = fallbackVal;
        break;
      }
    }

    if (typeof value !== 'string') return key;

    if (params) {
      return Object.entries(params).reduce((str, [pKey, pVal]) => {
        return str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      }, value);
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
