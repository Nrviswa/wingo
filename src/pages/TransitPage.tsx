import React, { useEffect, useMemo, useState } from 'react';
import { Bus, Clock, MapPin, Train } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { AppShell } from '../components/layout/AppShell';
import { getPlaceById } from '../data/places';
import { transitService } from '../services/transitService';
import { useTripStore } from '../store/useTripStore';
import type { Place, TransitHub, TransitRecommendation } from '../types/tourism';
import { formatNumber, formatTime24ToLocale } from '../utils/format';

export const TransitPage: React.FC = () => {
  const { t } = useTranslation('transit');
  const { t: tPlaces } = useTranslation('places');

  const locale = useTripStore((s) => s.locale);
  const selectedTown = useTripStore((s) => s.selectedTown);
  const selectedPlaceIds = useTripStore((s) => s.selectedPlaceIds);

  const [guidance, setGuidance] = useState<TransitRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  const townPlaces = useMemo(
    () =>
      selectedPlaceIds
        .map((id) => getPlaceById(id))
        .filter((p): p is Place => Boolean(p && p.townId === selectedTown)),
    [selectedPlaceIds, selectedTown]
  );

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const data = await transitService.getTransitGuidance(
        selectedTown,
        townPlaces.map((p) => p.id)
      );
      if (!active) return;
      setGuidance(data);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [selectedTown, townPlaces]);

  const firstStop = townPlaces[0];
  const lastStop = townPlaces[townPlaces.length - 1];

  const renderHubCard = (
    hub: TransitHub,
    badgeTitle?: string,
    stopName?: string,
    distKm?: number,
    travelMin?: number
  ) => {
    const Icon = hub.type === 'railwayStation' ? Train : Bus;
    return (
      <article key={`${badgeTitle ?? 'all'}-${hub.id}`} className="glass-card space-y-3 rounded-3xl p-4">
        {badgeTitle && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/20 pb-2">
            <span className="text-xs font-bold uppercase tracking-wide text-maroon dark:text-gold-light">
              {badgeTitle}
            </span>
            {stopName && distKm !== undefined && travelMin !== undefined && (
              <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-semibold text-maroon-deep dark:text-gold-light">
                {stopName} ·{' '}
                {t('distanceFromStop', {
                  km: formatNumber(distKm, locale, 1),
                  mins: formatNumber(travelMin, locale),
                })}
              </span>
            )}
          </div>
        )}

        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-maroon text-ivory dark:bg-gold dark:text-night">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase text-muted dark:text-ivory/65">
              {t(`hubTypes.${hub.type}`)}
            </div>
            <h2 className="font-display text-lg font-bold text-maroon dark:text-gold-light">
              {t(`hubs.${hub.id}.name`)}
            </h2>
            {locale !== 'ta' && (
              <div lang="ta" className="text-xs text-muted dark:text-ivory/65">
                {hub.tamilName}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs leading-relaxed text-ink/85 dark:text-ivory/80">
          {t(`hubs.${hub.id}.directions`)}
        </p>

        <div className="rounded-2xl border border-gold/20 bg-ivory/75 p-2.5 text-xs text-maroon-deep dark:border-night-border dark:bg-night/60 dark:text-gold-light">
          <MapPin className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          {t(`hubs.${hub.id}.platformHint`)}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded-xl bg-ivory-warm/80 p-2 dark:bg-night/70">
            <div className="text-[10px] text-muted dark:text-ivory/65">{t('firstServiceLabel')}</div>
            <div className="mt-0.5 font-semibold">
              <Clock className="mr-1 inline h-3 w-3 text-gold" aria-hidden="true" />
              {formatTime24ToLocale(hub.firstService, locale)}
            </div>
          </div>
          <div className="rounded-xl bg-ivory-warm/80 p-2 dark:bg-night/70">
            <div className="text-[10px] text-muted dark:text-ivory/65">{t('lastServiceLabel')}</div>
            <div className="mt-0.5 font-semibold">
              <Clock className="mr-1 inline h-3 w-3 text-gold" aria-hidden="true" />
              {formatTime24ToLocale(hub.lastService, locale)}
            </div>
          </div>
          <div className="rounded-xl bg-ivory-warm/80 p-2 dark:bg-night/70">
            <div className="text-[10px] text-muted dark:text-ivory/65">{t('approxBusFare')}</div>
            <div className="mt-0.5 font-semibold">
              <CurrencyDisplay amountInr={hub.approxLocalBusFareInr} />
            </div>
          </div>
          <div className="rounded-xl bg-ivory-warm/80 p-2 dark:bg-night/70">
            <div className="text-[10px] text-muted dark:text-ivory/65">{t('approxAutoFare')}</div>
            <div className="mt-0.5 font-semibold">
              <CurrencyDisplay amountInr={hub.approxAutoFareInr} />
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <AppShell backTo="/map">
      <div className="space-y-5">
        <header>
          <span className="inline-block rounded-full bg-maroon/10 px-3 py-1 text-xs font-semibold text-maroon dark:bg-gold/15 dark:text-gold-light">
            {tPlaces(`towns.${selectedTown}.name`)}
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-maroon sm:text-3xl dark:text-gold-light">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-ivory/75">{t('subtitle')}</p>
        </header>

        {loading || !guidance ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="space-y-4">
            {renderHubCard(
              guidance.arrivalHub,
              t('nearestArrivalTitle'),
              firstStop ? tPlaces(`items.${firstStop.id}.name`) : t('firstStopLabel'),
              guidance.arrivalDistanceKm,
              guidance.arrivalTravelMin
            )}

            {renderHubCard(
              guidance.departureHub,
              t('nearestDepartureTitle'),
              lastStop ? tPlaces(`items.${lastStop.id}.name`) : t('lastStopLabel'),
              guidance.departureDistanceKm,
              guidance.departureTravelMin
            )}

            <section className="space-y-3 pt-2">
              <h2 className="font-display text-xl font-bold text-maroon dark:text-gold-light">
                {t('allHubsTitle')}
              </h2>
              {guidance.allHubs.map((hub) => renderHubCard(hub))}
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default TransitPage;
