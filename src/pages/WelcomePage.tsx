import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Pause, Play, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { KolamDivider, WingoCrestIcon } from '../components/common/HeritageIcons';
import { AppShell } from '../components/layout/AppShell';
import { detectDeviceLocale, SUPPORTED_LOCALES } from '../i18n/config';
import { useTripStore } from '../store/useTripStore';

const GREETING_KEYS = ['enIN', 'ta', 'te', 'kn', 'ml', 'hi', 'de', 'zhCN', 'enGB'] as const;

export const WelcomePage: React.FC = () => {
  const { t } = useTranslation('welcome');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const activeLocale = useTripStore((s) => s.locale);
  const setLocale = useTripStore((s) => s.setLocale);
  const detectedLocale = detectDeviceLocale();

  const [greetingIndex, setGreetingIndex] = useState(0);
  const [paused, setPaused] = useState(Boolean(prefersReducedMotion));

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % GREETING_KEYS.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const currentGreetingKey = GREETING_KEYS[greetingIndex];
  const currentGreeting = t(`greetings.${currentGreetingKey}`);

  return (
    <AppShell showBack={false} hideBottomNav>
      <div className="space-y-6 pb-8">
        {/* Hero Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon-deep via-maroon to-maroon-soft p-6 text-ivory shadow-xl">
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gold/20 blur-2xl"
            aria-hidden="true"
          />

          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <WingoCrestIcon className="h-10 w-10 shrink-0" />
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-semibold text-gold-light">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {t('missionTitle')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? t('playGreeting') : t('pauseGreeting')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/35 bg-white/10 text-gold-light transition hover:bg-white/20 active:scale-95"
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          </div>

          {/* Animated Multi-Script Greeting */}
          <div className="min-h-[68px] py-1">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentGreetingKey}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
                className="font-display text-3xl font-bold leading-snug text-gold-light sm:text-4xl"
              >
                {currentGreeting}
              </motion.h1>
            </AnimatePresence>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-ivory/90">{t('heroSubtitle')}</p>

          <div className="mt-4 rounded-2xl border border-gold/25 bg-black/20 p-3.5 text-xs leading-relaxed text-ivory/85">
            {t('missionBody')}
          </div>
        </section>

        <KolamDivider />

        {/* Language Picker */}
        <section aria-labelledby="select-language-heading" className="space-y-3">
          <div>
            <h2
              id="select-language-heading"
              className="font-display text-2xl font-bold text-maroon dark:text-gold-light"
            >
              {t('selectLanguageTitle')}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted dark:text-ivory/70">
              {t('selectLanguageHint')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {SUPPORTED_LOCALES.map((loc) => {
              const selected = loc.code === activeLocale;
              const isDetected = loc.code === detectedLocale;
              return (
                <button
                  key={loc.code}
                  type="button"
                  onClick={() => setLocale(loc.code)}
                  className={`flex min-h-[64px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                    selected
                      ? 'border-maroon bg-maroon text-ivory shadow-lg dark:border-gold dark:bg-maroon-soft'
                      : 'glass-card text-ink hover:border-gold dark:text-ivory'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold leading-snug">{loc.nativeName}</span>
                      {isDetected && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            selected
                              ? 'bg-gold/25 text-gold-light'
                              : 'bg-maroon/10 text-maroon dark:bg-gold/15 dark:text-gold-light'
                          }`}
                        >
                          {t('deviceDetectedHint')}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-xs ${
                        selected ? 'text-ivory/80' : 'text-muted dark:text-ivory/65'
                      }`}
                    >
                      {loc.englishName} · {loc.greetingSample}
                    </div>
                  </div>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? 'border-gold-light bg-gold-light text-maroon-deep'
                        : 'border-gold/30'
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Primary CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate('/towns')}
            className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-maroon to-maroon-soft px-6 py-3.5 text-base font-semibold text-ivory shadow-lg transition hover:brightness-110 active:scale-[0.98] dark:from-gold dark:to-gold-light dark:text-night"
          >
            <span>{t('startPlanningCta')}</span>
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="mt-2 text-center text-[11px] text-muted dark:text-ivory/60">
            {tCommon('cachedOffline')}
          </p>
        </div>
      </div>
    </AppShell>
  );
};

export default WelcomePage;
