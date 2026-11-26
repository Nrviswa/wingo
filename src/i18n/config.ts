import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { SupportedLocale } from '../types/tourism';

export interface LocaleMeta {
  code: SupportedLocale;
  intlTag: string;
  nativeName: string;
  englishName: string;
  greetingSample: string;
  scriptFamily: string;
  googleFontQuery?: string;
  cssFontFamily: string;
  isInternationalVisitor: boolean;
  secondaryCurrency?: {
    code: 'GBP' | 'EUR' | 'CNY';
    ratePerInr: number; // Mock rate — verify / plug live FX API before launch
  };
}

export const SUPPORTED_LOCALES: LocaleMeta[] = [
  {
    code: 'ta',
    intlTag: 'ta-IN',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    greetingSample: 'வணக்கம்',
    scriptFamily: 'Tamil',
    googleFontQuery: 'Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Serif+Tamil:wght@500;600;700',
    cssFontFamily: '"Noto Sans Tamil", "Inter", sans-serif',
    isInternationalVisitor: false,
  },
  {
    code: 'te',
    intlTag: 'te-IN',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    greetingSample: 'స్వాగతం',
    scriptFamily: 'Telugu',
    googleFontQuery: 'Noto+Sans+Telugu:wght@400;500;600;700',
    cssFontFamily: '"Noto Sans Telugu", "Inter", sans-serif',
    isInternationalVisitor: false,
  },
  {
    code: 'kn',
    intlTag: 'kn-IN',
    nativeName: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    greetingSample: 'ಸ್ವಾಗತ',
    scriptFamily: 'Kannada',
    googleFontQuery: 'Noto+Sans+Kannada:wght@400;500;600;700',
    cssFontFamily: '"Noto Sans Kannada", "Inter", sans-serif',
    isInternationalVisitor: false,
  },
  {
    code: 'ml',
    intlTag: 'ml-IN',
    nativeName: 'മലയാളം',
    englishName: 'Malayalam',
    greetingSample: 'സ്వాഗതം',
    scriptFamily: 'Malayalam',
    googleFontQuery: 'Noto+Sans+Malayalam:wght@400;500;600;700',
    cssFontFamily: '"Noto Sans Malayalam", "Inter", sans-serif',
    isInternationalVisitor: false,
  },
  {
    code: 'hi',
    intlTag: 'hi-IN',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    greetingSample: 'स्वागत है',
    scriptFamily: 'Devanagari',
    googleFontQuery: 'Noto+Sans+Devanagari:wght@400;500;600;700',
    cssFontFamily: '"Noto Sans Devanagari", "Inter", sans-serif',
    isInternationalVisitor: false,
  },
  {
    code: 'en-IN',
    intlTag: 'en-IN',
    nativeName: 'English (India)',
    englishName: 'English (India)',
    greetingSample: 'Welcome',
    scriptFamily: 'Latin',
    cssFontFamily: '"Inter", system-ui, sans-serif',
    isInternationalVisitor: false,
  },
  {
    code: 'en-GB',
    intlTag: 'en-GB',
    nativeName: 'English (UK)',
    englishName: 'English (UK)',
    greetingSample: 'Welcome (UK)',
    scriptFamily: 'Latin',
    cssFontFamily: '"Inter", system-ui, sans-serif',
    isInternationalVisitor: true,
    secondaryCurrency: { code: 'GBP', ratePerInr: 0.0094 },
  },
  {
    code: 'de',
    intlTag: 'de-DE',
    nativeName: 'Deutsch',
    englishName: 'German',
    greetingSample: 'Willkommen',
    scriptFamily: 'Latin',
    cssFontFamily: '"Inter", system-ui, sans-serif',
    isInternationalVisitor: true,
    secondaryCurrency: { code: 'EUR', ratePerInr: 0.011 },
  },
  {
    code: 'zh-CN',
    intlTag: 'zh-CN',
    nativeName: '简体中文',
    englishName: 'Chinese (Simplified)',
    greetingSample: '欢迎',
    scriptFamily: 'Simplified Chinese',
    googleFontQuery: 'Noto+Sans+SC:wght@400;500;600;700',
    cssFontFamily: '"Noto Sans SC", "Inter", sans-serif',
    isInternationalVisitor: true,
    secondaryCurrency: { code: 'CNY', ratePerInr: 0.085 },
  },
];

export const NAMESPACES = ['common', 'welcome', 'places', 'itinerary', 'booking', 'transit', 'sos'] as const;

const STORAGE_LOCALE_KEY = 'wingo-locale';

export function getLocaleMeta(code: string): LocaleMeta {
  return SUPPORTED_LOCALES.find((l) => l.code === code) ?? SUPPORTED_LOCALES[5];
}

export function detectDeviceLocale(): SupportedLocale {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_LOCALE_KEY);
    if (saved && SUPPORTED_LOCALES.some((l) => l.code === saved)) {
      return saved as SupportedLocale;
    }
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const raw of candidates) {
      if (!raw) continue;
      const lower = raw.toLowerCase();
      if (lower.startsWith('ta')) return 'ta';
      if (lower.startsWith('te')) return 'te';
      if (lower.startsWith('kn')) return 'kn';
      if (lower.startsWith('ml')) return 'ml';
      if (lower.startsWith('hi')) return 'hi';
      if (lower.startsWith('de')) return 'de';
      if (lower.startsWith('zh')) return 'zh-CN';
      if (lower === 'en-gb') return 'en-GB';
      if (lower.startsWith('en')) return 'en-IN';
    }
  }
  return 'en-IN';
}

/**
 * Dynamically loads ONLY the Noto font stylesheet required for the active language,
 * keeping font-display=swap and avoiding downloading unused Indic/CJK font bundles.
 */
export function applyLocaleFontAndLang(locale: SupportedLocale): void {
  if (typeof document === 'undefined') return;
  const meta = getLocaleMeta(locale);
  document.documentElement.lang = meta.intlTag;
  document.documentElement.style.setProperty('--active-locale-font', meta.cssFontFamily);

  const linkId = 'wingo-active-locale-font';
  const existing = document.getElementById(linkId) as HTMLLinkElement | null;

  if (!meta.googleFontQuery) {
    if (existing) existing.remove();
    return;
  }

  const href = `https://fonts.googleapis.com/css2?family=${meta.googleFontQuery}&display=swap`;
  if (existing) {
    if (existing.href !== href) existing.href = href;
  } else {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

// Eagerly bundle JSON translation namespaces via Vite import.meta.glob so switching languages is instant and offline-safe
const localeModules = import.meta.glob('./locales/*/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>;

const resources: Record<string, Record<string, Record<string, unknown>>> = {};

for (const [path, mod] of Object.entries(localeModules)) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, locale, ns] = match;
  resources[locale] ??= {};
  resources[locale][ns] = mod.default;
}

const initialLocale = detectDeviceLocale();

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: 'en-IN',
  ns: [...NAMESPACES],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

applyLocaleFontAndLang(initialLocale);

export function setAppLanguage(locale: SupportedLocale): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_LOCALE_KEY, locale);
  }
  applyLocaleFontAndLang(locale);
  void i18n.changeLanguage(locale);
}

export default i18n;
