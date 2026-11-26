import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Globe, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../../i18n/config';
import { useTripStore } from '../../store/useTripStore';

interface LanguageSwitcherProps {
  open: boolean;
  onClose: () => void;
}

export const LanguageSwitcherModal: React.FC<LanguageSwitcherProps> = ({ open, onClose }) => {
  const { t } = useTranslation('common');
  const activeLocale = useTripStore((s) => s.locale);
  const setLocale = useTripStore((s) => s.setLocale);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lang-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-night/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className="relative z-10 max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-gold/25 bg-ivory p-5 shadow-2xl sm:rounded-3xl dark:bg-night-card"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon/10 text-maroon dark:bg-gold/15 dark:text-gold-light">
                  <Globe className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2
                  id="lang-modal-title"
                  className="font-display text-xl font-bold text-maroon dark:text-gold-light"
                >
                  {t('chooseLanguage')}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('close')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 text-ink/80 transition hover:bg-maroon/10 dark:text-ivory/80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {SUPPORTED_LOCALES.map((loc) => {
                const isSelected = loc.code === activeLocale;
                return (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => {
                      setLocale(loc.code);
                      onClose();
                    }}
                    className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                      isSelected
                        ? 'border-maroon bg-maroon text-ivory shadow-md dark:border-gold dark:bg-maroon-soft'
                        : 'border-gold/25 bg-white/80 text-ink hover:border-gold dark:border-night-border dark:bg-night/70 dark:text-ivory'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-base font-semibold leading-snug break-words">
                        {loc.nativeName}
                      </div>
                      <div
                        className={`text-xs ${
                          isSelected ? 'text-ivory/80' : 'text-muted dark:text-ivory/60'
                        }`}
                      >
                        {loc.englishName} · {loc.greetingSample}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 shrink-0 text-gold-light" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
