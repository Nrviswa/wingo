import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CloudSun, MapPin, Sunrise, Sunset } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ResponsiveImage } from '../components/common/ResponsiveImage';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { AppShell } from '../components/layout/AppShell';
import { liveStatusService } from '../services/liveStatusService';
import { placesService } from '../services/placesService';
import { useTripStore } from '../store/useTripStore';
import type { TownId, TownInfo, WeatherStatus } from '../types/tourism';
import { formatTime24ToLocale } from '../utils/format';

export const TownSelectPage: React.FC = () => {
  const { t } = useTranslation('places');
  const navigate = useNavigate();
  const locale = useTripStore((s) => s.locale);
  const selectedTown = useTripStore((s) => s.selectedTown);
  const setTown = useTripStore((s) => s.setTown);

  const [towns, setTowns] = useState<TownInfo[]>([]);
  const [weatherByTown, setWeatherByTown] = useState<Record<string, WeatherStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const list = await placesService.listTowns();
      const weatherEntries = await Promise.all(
        list.map(async (town) => [town.id, await liveStatusService.getWeather(town.id)] as const)
      );
      if (!active) return;
      setTowns(list);
      setWeatherByTown(Object.fromEntries(weatherEntries));
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleSelectTown = (townId: TownId) => {
    setTown(townId);
    navigate('/experience');
  };

  return (
    <AppShell backTo="/">
      <div className="space-y-5">
        <header>
          <h1 className="font-display text-2xl font-bold text-maroon sm:text-3xl dark:text-gold-light">
            {t('townSelectTitle')}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted dark:text-ivory/75">
            {t('townSelectSubtitle')}
          </p>
        </header>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="space-y-4">
            {towns.map((town, index) => {
              const weather = weatherByTown[town.id];
              const isSelected = town.id === selectedTown;
              return (
                <motion.button
                  key={town.id}
                  type="button"
                  onClick={() => handleSelectTown(town.id)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.24 }}
                  className={`glass-card group w-full overflow-hidden rounded-3xl text-left transition active:scale-[0.99] ${
                    isSelected ? 'ring-2 ring-maroon dark:ring-gold' : ''
                  }`}
                >
                  <div className="relative h-48 w-full overflow-hidden sm:h-56">
                    <ResponsiveImage
                      src={town.heroImage}
                      srcSet={town.heroSrcSet}
                      alt={t(`towns.${town.id}.name`)}
                      priority={index === 0 ? 'high' : 'normal'}
                      className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                      aria-hidden="true"
                    />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 text-ivory">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gold-light">
                          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span lang="ta">{town.tamilName}</span>
                        </div>
                        <h2 className="font-display text-2xl font-bold leading-tight">
                          {t(`towns.${town.id}.name`)}
                        </h2>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-night shadow">
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="text-sm font-semibold text-maroon dark:text-gold-light">
                      {t(`towns.${town.id}.tagline`)}
                    </div>
                    <p className="text-xs leading-relaxed text-ink/85 dark:text-ivory/80">
                      {t(`towns.${town.id}.description`)}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gold/20 pt-3 text-[11px]">
                      <span className="font-medium text-maroon/90 dark:text-gold-light">
                        {t(`towns.${town.id}.highlights`)}
                      </span>
                      {weather && (
                        <div className="flex flex-wrap items-center gap-2.5 text-muted dark:text-ivory/75">
                          <span className="inline-flex items-center gap-1 font-semibold text-ink dark:text-ivory">
                            <CloudSun className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                            {weather.tempC}°C · {t(`weatherConditions.${weather.conditionKey}`)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Sunrise className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                            {formatTime24ToLocale(weather.sunrise, locale)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Sunset className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                            {formatTime24ToLocale(weather.sunset, locale)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default TownSelectPage;
