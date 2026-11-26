import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AlertTriangle, ArrowRight, Calendar, QrCode, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay';
import { AppShell } from '../components/layout/AppShell';
import { useTripStore } from '../store/useTripStore';
import { formatDateLocale } from '../utils/format';

export const MyTripsPage: React.FC = () => {
  const { t } = useTranslation('booking');
  const { t: tPlaces } = useTranslation('places');
  const { t: tItin } = useTranslation('itinerary');
  const { t: tCommon } = useTranslation('common');
  const { t: tSos } = useTranslation('sos');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReportingIssue = searchParams.get('issue') === '1';

  const locale = useTripStore((s) => s.locale);
  const trips = useTripStore((s) => s.trips);
  const loadTripIntoPlanner = useTripStore((s) => s.loadTripIntoPlanner);

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: trips.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 210,
    overscan: 3,
  });

  return (
    <AppShell backTo="/towns">
      <div className="space-y-4">
        <header>
          <h1 className="font-display text-2xl font-bold text-maroon sm:text-3xl dark:text-gold-light">
            {t('myTripsTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-ivory/75">{t('myTripsSubtitle')}</p>
        </header>

        {isReportingIssue && trips.length > 0 && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-950 dark:text-amber-200"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
            <div>
              <div className="font-bold">{tSos('issueBannerTitle')}</div>
              <p className="mt-0.5 leading-relaxed">
                {tSos('issueBannerBody', { bookingId: trips[0].bookingId })}
              </p>
            </div>
          </div>
        )}

        {trips.length === 0 ? (
          <div className="glass-card rounded-3xl p-6 text-center text-sm text-muted dark:text-ivory/75">
            {t('noTripsYet')}
          </div>
        ) : (
          <div
            ref={parentRef}
            className="h-[68dvh] overflow-y-auto pr-1"
            aria-label={t('myTripsTitle')}
          >
            <div
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
              className="relative w-full"
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const trip = trips[virtualRow.index];
                return (
                  <div
                    key={trip.bookingId}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualRow.index}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="absolute left-0 top-0 w-full pb-3"
                  >
                    <article
                      className={`glass-card space-y-3 rounded-3xl p-4 ${
                        isReportingIssue && virtualRow.index === 0
                          ? 'ring-2 ring-red-600 dark:ring-red-400'
                          : ''
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-mono text-xs font-bold text-maroon dark:text-gold-light">
                            {trip.bookingId}
                          </div>
                          <h2 className="font-display text-xl font-bold text-maroon dark:text-gold-light">
                            {tPlaces(`towns.${trip.townId}.name`)} ·{' '}
                            {tPlaces(`categories.${trip.category}.title`)}
                          </h2>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            trip.status === 'confirmed'
                              ? 'bg-emerald-badge/15 text-emerald-badge dark:text-emerald-300'
                              : 'bg-gold/20 text-maroon-deep dark:text-gold-light'
                          }`}
                        >
                          {trip.status === 'confirmed' ? t('statusConfirmed') : t('statusCompleted')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted dark:text-ivory/75">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                          {tItin(`days.${trip.day}`)} · {formatDateLocale(trip.createdAt, locale)}
                        </span>
                        {trip.cachedOffline && (
                          <span className="inline-flex items-center gap-1 text-emerald-badge dark:text-emerald-300">
                            <WifiOff className="h-3 w-3" aria-hidden="true" />
                            {tCommon('offlineReady')}
                          </span>
                        )}
                      </div>

                      <p className="text-xs leading-relaxed text-ink/85 dark:text-ivory/80">
                        {trip.placeIds.map((id) => tPlaces(`items.${id}.name`)).join(' → ')}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gold/20 pt-3">
                        <CurrencyDisplay
                          amountInr={trip.totalPaidInr}
                          className="font-display text-lg font-bold text-maroon dark:text-gold-light"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/confirmation/${trip.bookingId}`)}
                            className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-gold/35 px-3 py-1.5 text-xs font-semibold text-maroon dark:text-gold-light"
                          >
                            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>QR</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              loadTripIntoPlanner(trip);
                              navigate('/plan');
                            }}
                            className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-maroon px-3.5 py-1.5 text-xs font-semibold text-ivory dark:bg-gold dark:text-night"
                          >
                            <span>{t('reloadPlan')}</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default MyTripsPage;
