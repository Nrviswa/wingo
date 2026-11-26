import React, { useState } from 'react';
import { ArrowLeft, Briefcase, Compass, Globe, MapPin, Moon, Sun, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getLocaleMeta } from '../../i18n/config';
import { useTripStore } from '../../store/useTripStore';
import { WingoCrestIcon } from '../common/HeritageIcons';
import { LanguageSwitcherModal } from '../common/LanguageSwitcher';
import { SosEmergencySheet } from '../common/SosEmergencySheet';

interface AppShellProps {
  children: React.ReactNode;
  showBack?: boolean;
  backTo?: string;
  hideBottomNav?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  showBack = true,
  backTo,
  hideBottomNav = false,
}) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const locale = useTripStore((s) => s.locale);
  const darkMode = useTripStore((s) => s.darkMode);
  const toggleDarkMode = useTripStore((s) => s.toggleDarkMode);
  const [langModalOpen, setLangModalOpen] = useState(false);

  const localeMeta = getLocaleMeta(locale);

  const navItems = [
    { path: '/towns', label: t('nav.explore'), icon: Compass, match: ['/towns', '/experience', '/day', '/plan'] },
    { path: '/map', label: t('nav.map'), icon: MapPin, match: ['/map', '/booking', '/confirmation', '/transit'] },
    { path: '/locals', label: t('nav.locals'), icon: Users, match: ['/locals'] },
    { path: '/trips', label: t('nav.trips'), icon: Briefcase, match: ['/trips'] },
  ];

  return (
    <div className="min-h-dvh bg-ivory text-ink transition-colors duration-200 dark:bg-night dark:text-ivory">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-maroon focus:px-4 focus:py-2 focus:text-ivory"
      >
        {t('skipToContent')}
      </a>

      {/* Sticky Top Header */}
      <header className="glass-bar sticky top-0 z-30 border-b border-gold/20">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {showBack && (
              <button
                type="button"
                onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                aria-label={t('back')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-white/75 text-maroon transition hover:bg-maroon/10 active:scale-95 dark:bg-night-card dark:text-gold-light"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Link to="/" className="flex min-w-0 items-center gap-2">
              <WingoCrestIcon className="h-8 w-8 shrink-0" />
              <div className="min-w-0">
                <div className="truncate font-display text-base font-bold leading-tight text-maroon dark:text-gold-light sm:text-lg">
                  {t('brandName')}
                </div>
                <div className="truncate text-[11px] font-medium text-muted dark:text-ivory/65">
                  {t('brandTagline')}
                </div>
              </div>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLangModalOpen(true)}
              aria-label={`${t('languageLabel')}: ${localeMeta.nativeName}`}
              className="flex min-h-[40px] items-center gap-1.5 rounded-full border border-gold/30 bg-white/80 px-3 py-1.5 text-xs font-semibold text-maroon transition hover:border-gold active:scale-95 dark:bg-night-card dark:text-gold-light"
            >
              <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="max-w-[96px] truncate">{localeMeta.nativeName}</span>
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? t('lightMode') : t('darkMode')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-white/80 text-maroon transition hover:border-gold active:scale-95 dark:bg-night-card dark:text-gold-light"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="mx-auto w-full max-w-2xl px-4 pb-28 pt-4">
        {children}
      </main>

      {/* Mobile-First Bottom Navigation */}
      {!hideBottomNav && (
        <nav
          aria-label="Primary navigation"
          className="glass-bar fixed inset-x-0 bottom-0 z-30 border-t border-gold/25 pb-[env(safe-area-inset-bottom)]"
        >
          <div className="mx-auto grid max-w-2xl grid-cols-4 gap-1 px-2 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match.some((m) => location.pathname.includes(m));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 text-[11px] font-medium transition ${
                    isActive
                      ? 'bg-maroon text-ivory shadow-sm dark:bg-maroon-soft dark:text-gold-light'
                      : 'text-muted hover:bg-maroon/5 hover:text-maroon dark:text-ivory/70 dark:hover:text-gold-light'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="max-w-full truncate text-center leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <SosEmergencySheet />
      <LanguageSwitcherModal open={langModalOpen} onClose={() => setLangModalOpen(false)} />
    </div>
  );
};
