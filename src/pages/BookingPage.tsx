import React, { useEffect, useMemo, useState } from 'react';
import { Banknote, CheckCircle2, CreditCard, Phone, Smartphone, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BadgePill } from '../components/common/BadgePill';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay';
import { AutoRickshawSvg } from '../components/common/HeritageIcons';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { AppShell } from '../components/layout/AppShell';
import { getPlaceById } from '../data/places';
import { bookingService } from '../services/bookingService';
import { fareService } from '../services/fareService';
import { useTripStore } from '../store/useTripStore';
import type { AutoDriver, AutoFareQuote, PaymentMethod, Place } from '../types/tourism';
import { formatNumber } from '../utils/format';

export const BookingPage: React.FC = () => {
  const { t } = useTranslation('booking');
  const { t: tPlaces } = useTranslation('places');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();

  const locale = useTripStore((s) => s.locale);
  const selectedTown = useTripStore((s) => s.selectedTown);
  const selectedCategory = useTripStore((s) => s.selectedCategory);
  const selectedDay = useTripStore((s) => s.selectedDay);
  const selectedPlaceIds = useTripStore((s) => s.selectedPlaceIds);
  const needAuto = useTripStore((s) => s.needAuto);
  const autoMode = useTripStore((s) => s.autoMode);
  const paymentMethod = useTripStore((s) => s.paymentMethod);
  const setNeedAuto = useTripStore((s) => s.setNeedAuto);
  const setAutoMode = useTripStore((s) => s.setAutoMode);
  const setPaymentMethod = useTripStore((s) => s.setPaymentMethod);
  const addBooking = useTripStore((s) => s.addBooking);

  const [quote, setQuote] = useState<AutoFareQuote | null>(null);
  const [driver, setDriver] = useState<AutoDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [callToast, setCallToast] = useState<string | null>(null);

  const selectedPlaces = useMemo(
    () =>
      selectedPlaceIds
        .map((id) => getPlaceById(id))
        .filter((p): p is Place => Boolean(p && p.townId === selectedTown)),
    [selectedPlaceIds, selectedTown]
  );

  const totals = useMemo(() => {
    const durationMin = selectedPlaces.reduce((acc, p) => acc + p.durationMinutes, 0);
    const entryFeesInr = selectedPlaces.reduce((acc, p) => acc + p.entryFeeInr, 0);
    return { durationMin, entryFeesInr };
  }, [selectedPlaces]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (selectedPlaces.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [fareQuote, assignedDriver] = await Promise.all([
        fareService.calculateFare(
          selectedTown,
          selectedPlaces.map((p) => p.id),
          autoMode
        ),
        bookingService.getAssignedDriver(selectedTown),
      ]);
      if (!active) return;
      setQuote(fareQuote);
      setDriver(assignedDriver);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [selectedTown, selectedPlaces, autoMode]);

  const autoFareInr = needAuto && quote ? quote.grandTotalInr : 0;
  const grandTotalInr = totals.entryFeesInr + autoFareInr;

  const handleCallDriver = () => {
    if (!driver) return;
    setCallToast(t('callingToast', { name: driver.name, phone: driver.phoneDisplay }));
    window.setTimeout(() => setCallToast(null), 3200);
  };

  const handleConfirmBooking = async () => {
    if (selectedPlaces.length === 0) return;
    setSubmitting(true);
    const booking = await bookingService.createBooking({
      townId: selectedTown,
      category: selectedCategory,
      day: selectedDay,
      placeIds: quote?.orderedPlaceIds ?? selectedPlaces.map((p) => p.id),
      totalDurationMin: totals.durationMin,
      entryFeesInr: totals.entryFeesInr,
      needAuto,
      autoMode,
      autoFareInr,
      driver: needAuto ? driver : null,
      paymentMethod,
    });
    addBooking(booking);
    setSubmitting(false);
    navigate(`/confirmation/${booking.bookingId}`);
  };

  const paymentOptions: { id: PaymentMethod; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'upi', icon: Smartphone },
    { id: 'card', icon: CreditCard },
    { id: 'cash', icon: Banknote },
  ];

  return (
    <AppShell backTo="/map">
      <div className="space-y-5">
        <header>
          <h1 className="font-display text-2xl font-bold text-maroon sm:text-3xl dark:text-gold-light">
            {t('autoBookingTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-ivory/75">{t('autoBookingSubtitle')}</p>
        </header>

        {loading ? (
          <SkeletonCard lines={4} />
        ) : selectedPlaces.length === 0 ? (
          <div className="glass-card space-y-3 rounded-3xl p-6 text-center">
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
            {/* Need an Auto? Toggle */}
            <section className="glass-card flex items-center justify-between gap-4 rounded-3xl p-4">
              <div className="flex items-start gap-3">
                <AutoRickshawSvg className="h-10 w-10 shrink-0" />
                <div>
                  <div className="font-display text-lg font-bold text-maroon dark:text-gold-light">
                    {t('needAutoToggle')}
                  </div>
                  <p className="text-xs text-muted dark:text-ivory/70">{t('needAutoHint')}</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={needAuto}
                aria-label={t('needAutoToggle')}
                onClick={() => setNeedAuto(!needAuto)}
                className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${
                  needAuto ? 'bg-maroon dark:bg-gold' : 'bg-stone-300 dark:bg-night-border'
                }`}
              >
                <span
                  className={`h-6 w-6 rounded-full bg-ivory shadow transition-transform ${
                    needAuto ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </section>

            {/* Fare Mode Selector + Breakdown */}
            {needAuto && quote && (
              <>
                <section className="space-y-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-ivory/70">
                    {t('fareModeLabel')}
                  </h2>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setAutoMode('perLeg')}
                      className={`glass-card rounded-2xl p-3.5 text-left transition ${
                        autoMode === 'perLeg' ? 'ring-2 ring-maroon dark:ring-gold' : ''
                      }`}
                    >
                      <div className="font-display text-base font-bold text-maroon dark:text-gold-light">
                        {t('perLegMode')}
                      </div>
                      <p className="mt-1 text-xs text-muted dark:text-ivory/75">{t('perLegDesc')}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAutoMode('fullDay')}
                      className={`glass-card rounded-2xl p-3.5 text-left transition ${
                        autoMode === 'fullDay' ? 'ring-2 ring-maroon dark:ring-gold' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-base font-bold text-maroon dark:text-gold-light">
                          {t('fullDayMode')}
                        </span>
                        <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-maroon-deep dark:text-gold-light">
                          {tCommon('verifyBeforeLaunch')}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted dark:text-ivory/75">{t('fullDayDesc')}</p>
                    </button>
                  </div>
                </section>

                {/* Driver Card */}
                {driver && (
                  <section className="glass-card rounded-3xl p-4">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted dark:text-ivory/70">
                      {t('driverCardTitle')}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-display text-xl font-bold text-maroon dark:text-gold-light">
                          {driver.name}
                        </div>
                        <div className="mt-0.5 text-xs font-semibold text-ink/80 dark:text-ivory/80">
                          {driver.autoNumber} · {driver.vehicleType}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted dark:text-ivory/75">
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-gold-light">
                            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                            {formatNumber(driver.rating, locale, 1)}
                          </span>
                          <span>{t('tripsCount', { count: driver.tripsCompleted })}</span>
                          <span>
                            {t('languagesSpoken')}: {driver.languages.join(', ')}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {driver.badges.map((b) => (
                            <BadgePill key={b} badge={b} />
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCallDriver}
                        className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-2xl bg-emerald-badge px-4 py-2 text-xs font-semibold text-white shadow transition hover:brightness-110 active:scale-95"
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        <span>{t('callDriver')}</span>
                      </button>
                    </div>
                    {callToast && (
                      <div
                        role="status"
                        className="mt-3 rounded-xl bg-emerald-badge/15 px-3 py-2 text-xs font-medium text-emerald-badge dark:text-emerald-300"
                      >
                        {callToast}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}

            {/* Fare Breakdown */}
            <section className="glass-card space-y-2.5 rounded-3xl p-4">
              <h2 className="font-display text-lg font-bold text-maroon dark:text-gold-light">
                {t('fareBreakdownTitle')}
              </h2>

              <div className="space-y-2 text-sm">
                {needAuto && quote && autoMode === 'perLeg' && (
                  <>
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="text-muted dark:text-ivory/75">{t('baseFare')}</span>
                      <CurrencyDisplay amountInr={quote.baseTotalInr} className="font-medium" />
                    </div>
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="text-muted dark:text-ivory/75">
                        {t('distanceFare', { km: formatNumber(quote.totalDistanceKm, locale, 1) })}
                      </span>
                      <CurrencyDisplay amountInr={quote.distanceTotalInr} className="font-medium" />
                    </div>
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="text-muted dark:text-ivory/75">{t('waitingCharge')}</span>
                      <CurrencyDisplay amountInr={quote.waitingTotalInr} className="font-medium" />
                    </div>
                  </>
                )}

                {needAuto && quote && autoMode === 'fullDay' && (
                  <div className="flex justify-between gap-2 text-xs">
                    <span className="text-muted dark:text-ivory/75">{t('fullDayPackage')}</span>
                    <CurrencyDisplay amountInr={quote.fullDayPackageInr} className="font-medium" />
                  </div>
                )}

                <div className="flex justify-between gap-2 text-xs">
                  <span className="text-muted dark:text-ivory/75">{t('entryFeesTotal')}</span>
                  <CurrencyDisplay amountInr={totals.entryFeesInr} showFreeLabel className="font-medium" />
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-gold/25 pt-2.5">
                  <span className="font-display text-lg font-bold text-maroon dark:text-gold-light">
                    {t('grandTotal')}
                  </span>
                  <CurrencyDisplay
                    amountInr={grandTotalInr}
                    className="font-display text-xl font-bold text-maroon dark:text-gold-light"
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-ivory/70">
                {t('paymentTitle')}
              </h2>
              <div className="space-y-2">
                {paymentOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`glass-card flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition ${
                        active ? 'ring-2 ring-maroon dark:ring-gold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-maroon dark:text-gold-light" aria-hidden="true" />
                        <span className="text-sm font-semibold">{t(`paymentMethods.${opt.id}`)}</span>
                      </div>
                      {active && (
                        <CheckCircle2 className="h-5 w-5 text-maroon dark:text-gold-light" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Stops Summary Pill */}
            <div className="rounded-2xl border border-gold/20 bg-ivory-warm/70 px-3.5 py-2.5 text-xs text-muted dark:border-night-border dark:bg-night-card dark:text-ivory/75">
              {tPlaces(`towns.${selectedTown}.name`)} ·{' '}
              {selectedPlaces.map((p) => tPlaces(`items.${p.id}.name`)).join(' → ')}
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmBooking}
              className="flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-maroon to-maroon-soft px-6 py-3.5 text-base font-semibold text-ivory shadow-lg transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60 dark:from-gold dark:to-gold-light dark:text-night"
            >
              {submitting ? t('processingPayment') : t('confirmPayCta')}
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default BookingPage;
