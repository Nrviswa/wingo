import React, { useState } from 'react';
import { Briefcase, Bus, CheckCircle2, Share2, WifiOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay';
import { AppShell } from '../components/layout/AppShell';
import { getPlaceById } from '../data/places';
import { useTripStore } from '../store/useTripStore';

export const ConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { t } = useTranslation('booking');
  const { t: tPlaces } = useTranslation('places');
  const { t: tItin } = useTranslation('itinerary');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();

  const trips = useTripStore((s) => s.trips);
  const booking = trips.find((tr) => tr.bookingId === bookingId) ?? trips[0];
  const [shareFeedback, setShareFeedback] = useState(false);

  const handleShare = async () => {
    if (!booking) return;
    const stopNames = booking.placeIds
      .map((id, idx) => `${idx + 1}. ${tPlaces(`items.${id}.name`)}`)
      .join('\n');
    const text = `${tCommon('brandName')} — ${booking.bookingId}\n${tPlaces(
      `towns.${booking.townId}.name`
    )} (${tItin(`days.${booking.day}`)})\n${stopNames}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: tCommon('brandName'), text });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareFeedback(true);
      window.setTimeout(() => setShareFeedback(false), 2600);
    } catch {
      setShareFeedback(true);
    }
  };

  if (!booking) {
    return (
      <AppShell backTo="/plan">
        <div className="glass-card rounded-3xl p-6 text-center text-sm">{t('noTripsYet')}</div>
      </AppShell>
    );
  }

  const qrPayload = JSON.stringify({
    id: booking.bookingId,
    town: booking.townId,
    day: booking.day,
    stops: booking.placeIds,
  });

  return (
    <AppShell backTo="/plan">
      <div className="space-y-5">
        <section className="glass-card rounded-3xl p-5 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-badge/15 text-emerald-badge dark:text-emerald-300">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl font-bold text-maroon sm:text-3xl dark:text-gold-light">
            {t('confirmationTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-ivory/75">{t('confirmationSubtitle')}</p>

          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-ivory px-4 py-2 dark:bg-night">
            <span className="text-xs text-muted dark:text-ivory/70">{t('bookingIdLabel')}:</span>
            <span className="font-mono text-sm font-bold text-maroon dark:text-gold-light">
              {booking.bookingId}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-badge/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-badge dark:text-emerald-300">
              <WifiOff className="h-3 w-3" aria-hidden="true" />
              {tCommon('offlineReady')}
            </span>
          </div>
        </section>

        {/* QR Code Pass */}
        <section className="glass-card flex flex-col items-center rounded-3xl p-5 text-center">
          <h2 className="font-display text-lg font-bold text-maroon dark:text-gold-light">
            {t('qrPassTitle')}
          </h2>
          <div className="my-4 rounded-2xl bg-white p-4 shadow-inner">
            <QRCodeSVG value={qrPayload} size={168} fgColor="#3E0B17" bgColor="#FFFFFF" />
          </div>
          <p className="text-xs text-muted dark:text-ivory/70">{t('qrPassHint')}</p>

          <div className="mt-4 w-full space-y-2 border-t border-gold/20 pt-3 text-left text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-muted dark:text-ivory/70">
                {tPlaces(`towns.${booking.townId}.name`)} · {tItin(`days.${booking.day}`)}
              </span>
              <CurrencyDisplay amountInr={booking.totalPaidInr} className="font-bold text-maroon dark:text-gold-light" />
            </div>
            <ul className="space-y-1 text-ink/85 dark:text-ivory/80">
              {booking.placeIds.map((id, idx) => {
                const place = getPlaceById(id);
                return (
                  <li key={id}>
                    {idx + 1}. {tPlaces(`items.${id}.name`)}{' '}
                    {place && (
                      <span lang="ta" className="text-[11px] text-muted dark:text-ivory/60">
                        ({place.originalTamilName})
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {booking.driver && (
              <div className="rounded-xl bg-gold/10 px-3 py-2 font-medium text-maroon-deep dark:text-gold-light">
                {booking.driver.name} · {booking.driver.autoNumber}
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-gold/40 bg-white/85 px-4 py-3 text-sm font-semibold text-maroon transition hover:border-maroon dark:bg-night-card dark:text-gold-light"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            <span>{t('shareItinerary')}</span>
          </button>

          {shareFeedback && (
            <div
              role="status"
              className="rounded-xl bg-emerald-badge/15 px-3 py-2 text-center text-xs font-semibold text-emerald-badge dark:text-emerald-300"
            >
              {t('copiedToClipboard')}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate('/transit')}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-maroon px-4 py-3 text-sm font-semibold text-ivory shadow dark:bg-gold dark:text-night"
            >
              <Bus className="h-4 w-4" aria-hidden="true" />
              <span>{t('viewTransitCta')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/trips')}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-maroon/30 bg-white/80 px-4 py-3 text-sm font-semibold text-maroon dark:border-gold/30 dark:bg-night-card dark:text-gold-light"
            >
              <Briefcase className="h-4 w-4" aria-hidden="true" />
              <span>{t('viewMyTripsCta')}</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ConfirmationPage;
