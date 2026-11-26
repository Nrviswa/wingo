import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bus, Clock, Navigation, Route } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { AppShell } from '../components/layout/AppShell';
import { RouteMap } from '../components/map/RouteMap';
import { getPlaceById } from '../data/places';
import { getTownById } from '../data/towns';
import { fareService } from '../services/fareService';
import { buildMapAdapterConfig } from '../services/map/MapAdapter';
import { useTripStore } from '../store/useTripStore';
import type { AutoFareQuote, Place } from '../types/tourism';
import { formatNumber } from '../utils/format';

export const MapPage: React.FC = () => {
  const { t } = useTranslation('booking');
  const { t: tPlaces } = useTranslation('places');
  const navigate = useNavigate();

  const locale = useTripStore((s) => s.locale);
  const selectedTown = useTripStore((s) => s.selectedTown);
  const selectedPlaceIds = useTripStore((s) => s.selectedPlaceIds);
  const autoMode = useTripStore((s) => s.autoMode);

  const [quote, setQuote] = useState<AutoFareQuote | null>(null);
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
      if (townPlaces.length === 0) {
        setQuote(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const q = await fareService.calculateFare(
        selectedTown,
        townPlaces.map((p) => p.id),
        autoMode
      );
      if (!active) return;
      setQuote(q);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [selectedTown, townPlaces, autoMode]);

  const mapConfig = useMemo(() => {
    const town = getTownById(selectedTown);
    const orderedIds = quote?.orderedPlaceIds ?? townPlaces.map((p) => p.id);
    const markers = orderedIds
      .map((id, idx) => {
        const place = getPlaceById(id);
        if (!place) return null;
        return {
          place,
          orderNumber: idx + 1,
          timeSlot: place.defaultTimeSlot,
        };
      })
      .filter((m): m is NonNullable<typeof m> => Boolean(m));

    return buildMapAdapterConfig(markers, town.coordinates);
  }, [quote, townPlaces, selectedTown]);

  return (
    <AppShell backTo="/plan">
      <div className="space-y-5">
        <header>
          <h1 className="font-display text-2xl font-bold text-maroon sm:text-3xl dark:text-gold-light">
            {t('mapTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-ivory/75">{t('mapSubtitle')}</p>
        </header>

        {loading ? (
          <SkeletonCard lines={4} />
        ) : townPlaces.length === 0 ? (
          <div className="glass-card space-y-4 rounded-3xl p-6 text-center">
            <p className="text-sm text-muted dark:text-ivory/75">{t('noStopsSelected')}</p>
            <button
              type="button"
              onClick={() => navigate('/plan')}
              className="min-h-[44px] rounded-2xl bg-maroon px-5 py-2.5 text-sm font-semibold text-ivory dark:bg-gold dark:text-night"
            >
              {t('goBackToItinerary')}
            </button>
          </div>
        ) : (
          <>
            <RouteMap config={mapConfig} />

            {/* Route Stats */}
            {quote && (
              <div className="grid grid-cols-3 gap-2.5">
                <div className="glass-card rounded-2xl p-3 text-center">
                  <div className="text-[11px] text-muted dark:text-ivory/65">
                    {t('stopsCount', { count: mapConfig.markers.length })}
                  </div>
                  <div className="mt-0.5 font-display text-xl font-bold text-maroon dark:text-gold-light">
                    {formatNumber(mapConfig.markers.length, locale)}
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-3 text-center">
                  <div className="text-[11px] text-muted dark:text-ivory/65">
                    {t('totalRouteDistance')}
                  </div>
                  <div className="mt-0.5 font-display text-xl font-bold text-maroon dark:text-gold-light">
                    {formatNumber(quote.totalDistanceKm, locale, 1)} km
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-3 text-center">
                  <div className="text-[11px] text-muted dark:text-ivory/65">
                    {t('totalDriveTime')}
                  </div>
                  <div className="mt-0.5 font-display text-xl font-bold text-maroon dark:text-gold-light">
                    {formatNumber(quote.totalTravelMinutes, locale)} min
                  </div>
                </div>
              </div>
            )}

            {/* Ordered Stops & Leg Distances */}
            <section className="space-y-2.5">
              {mapConfig.markers.map((marker, idx) => {
                const leg = quote?.legs.find((l) => l.toPlaceId === marker.place.id);
                return (
                  <div key={marker.place.id} className="space-y-2">
                    {leg && idx > 0 && (
                      <div className="ml-5 flex items-center gap-2 border-l-2 border-dashed border-gold/50 py-1 pl-4 text-xs text-muted dark:text-ivory/70">
                        <Navigation className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                        <span>
                          {t('legLabel', { index: idx })}:{' '}
                          <strong>{formatNumber(leg.distanceKm, locale, 1)} km</strong> ·{' '}
                          <Clock className="inline h-3 w-3" aria-hidden="true" />{' '}
                          {formatNumber(leg.travelMinutes, locale)} min
                        </span>
                      </div>
                    )}

                    <div className="glass-card flex items-center gap-3 rounded-2xl p-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon text-sm font-bold text-ivory ring-2 ring-gold/60">
                        {marker.orderNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-base font-bold text-maroon break-words dark:text-gold-light">
                          {tPlaces(`items.${marker.place.id}.name`)}
                        </div>
                        {locale !== 'ta' && (
                          <div lang="ta" className="text-[11px] text-muted dark:text-ivory/65">
                            {marker.place.originalTamilName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Next Actions */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate('/transit')}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-gold/40 bg-white/80 px-4 py-3 text-sm font-semibold text-maroon transition hover:border-maroon dark:bg-night-card dark:text-gold-light"
              >
                <Bus className="h-4 w-4" aria-hidden="true" />
                <span>{t('viewTransitCta')}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/booking')}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-maroon px-4 py-3 text-sm font-semibold text-ivory shadow-md transition hover:brightness-110 dark:bg-gold dark:text-night"
              >
                <Route className="h-4 w-4" aria-hidden="true" />
                <span>{t('autoBookingTitle')}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default MapPage;
