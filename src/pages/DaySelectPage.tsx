import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { DAYS_OF_WEEK } from '../data/itineraries';
import { useTripStore } from '../store/useTripStore';
import type { DayOfWeek } from '../types/tourism';

const THEME_BY_DAY: Record<DayOfWeek, string> = {
  monday: 'dayThemeMonday',
  tuesday: 'dayThemeTuesday',
  wednesday: 'dayThemeWednesday',
  thursday: 'dayThemeThursday',
  friday: 'dayThemeFriday',
  saturday: 'dayThemeSaturday',
  sunday: 'dayThemeSunday',
};

export const DaySelectPage: React.FC = () => {
  const { t } = useTranslation('itinerary');
  const { t: tPlaces } = useTranslation('places');
  const navigate = useNavigate();

  const selectedTown = useTripStore((s) => s.selectedTown);
  const selectedCategory = useTripStore((s) => s.selectedCategory);
  const selectedDay = useTripStore((s) => s.selectedDay);
  const setDay = useTripStore((s) => s.setDay);

  const handleSelectDay = (day: DayOfWeek) => {
    setDay(day);
    navigate('/plan');
  };

  return (
    <AppShell backTo="/experience">
      <div className="space-y-5">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-maroon/10 px-3 py-1 text-xs font-semibold text-maroon dark:bg-gold/15 dark:text-gold-light">
              {tPlaces(`towns.${selectedTown}.name`)}
            </span>
            <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-maroon-deep dark:text-gold-light">
              {tPlaces(`categories.${selectedCategory}.title`)}
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold text-maroon sm:text-3xl dark:text-gold-light">
            {t('daySelectTitle')}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted dark:text-ivory/75">
            {t('daySelectSubtitle')}
          </p>
        </header>

        <div className="space-y-2.5">
          {DAYS_OF_WEEK.map((day, idx) => {
            const active = day === selectedDay;
            return (
              <motion.button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.2 }}
                className={`glass-card flex min-h-[68px] w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition active:scale-[0.99] ${
                  active ? 'ring-2 ring-maroon dark:ring-gold' : 'hover:border-gold'
                }`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      active
                        ? 'bg-maroon text-ivory dark:bg-gold dark:text-night'
                        : 'bg-ivory-warm text-maroon dark:bg-night-border dark:text-gold-light'
                    }`}
                  >
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-lg font-bold text-maroon dark:text-gold-light">
                      {t(`days.${day}`)}
                    </div>
                    <p className="text-xs leading-relaxed text-ink/80 break-words dark:text-ivory/75">
                      {t(`dayThemes.${THEME_BY_DAY[day]}`)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted dark:text-ivory/60" aria-hidden="true" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default DaySelectPage;
