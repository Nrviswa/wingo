import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Clock, IndianRupee, Shirt, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTripStore } from '../../store/useTripStore';
import type { ItinerarySlot, Place, TempleOpenStatus } from '../../types/tourism';
import { formatDurationParts, formatTime24ToLocale } from '../../utils/format';
import { BadgePill } from '../common/BadgePill';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { ResponsiveImage } from '../common/ResponsiveImage';

interface PlaceCardProps {
  place: Place;
  slot: ItinerarySlot;
  selected: boolean;
  openStatus?: TempleOpenStatus;
  onToggle: (placeId: string) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = React.memo(
  ({ place, slot, selected, openStatus, onToggle }) => {
    const { t: tPlaces } = useTranslation('places');
    const { t: tItin } = useTranslation('itinerary');
    const { t: tCommon } = useTranslation('common');
    const locale = useTripStore((s) => s.locale);

    const placeName = tPlaces(`items.${place.id}.name`);
    const summary = tPlaces(`items.${place.id}.summary`);
    const darshanInfo = tPlaces(`items.${place.id}.darshanInfo`);
    const dressCode = tPlaces(`items.${place.id}.dressCode`);
    const feeNote = tPlaces(`items.${place.id}.feeNote`);

    const formattedTime = formatTime24ToLocale(slot.timeSlot, locale);
    const { hours, mins } = formatDurationParts(slot.durationMinutes);
    const durationText =
      hours > 0
        ? `${hours}${tItin('hoursShort')} ${mins > 0 ? `${mins}${tItin('minsShort')}` : ''}`
        : `${mins}${tItin('minsShort')}`;

    const statusBadgeClass =
      openStatus?.statusKey === 'closedToday'
        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200'
        : openStatus?.statusKey === 'noonBreak'
          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
          : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200';

    return (
      <motion.article
        layout="position"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className={`glass-card relative rounded-3xl p-3.5 transition-shadow sm:p-4 ${
          selected
            ? 'ring-2 ring-maroon dark:ring-gold'
            : 'opacity-95 hover:shadow-lg'
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {/* Image Thumbnail */}
          <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-36">
            <ResponsiveImage
              src={place.image}
              srcSet={place.imageSrcSet}
              alt={placeName}
              className="h-full w-full"
            />
            <div className="absolute left-2.5 top-2.5 rounded-full bg-maroon/90 px-2.5 py-1 text-xs font-semibold text-ivory shadow">
              {formattedTime}
            </div>
          </div>

          {/* Card Content */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold leading-snug text-maroon break-words dark:text-gold-light">
                  {placeName}
                </h3>
                {/* Show original Tamil name beneath translated name */}
                {locale !== 'ta' && (
                  <p
                    lang="ta"
                    className="mt-0.5 text-xs font-medium text-muted break-words dark:text-ivory/65"
                  >
                    {place.originalTamilName}
                  </p>
                )}
              </div>

              {/* Tactile Add Checkbox */}
              <button
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={() => onToggle(place.id)}
                className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-semibold transition active:scale-95 ${
                  selected
                    ? 'border-maroon bg-maroon text-ivory shadow-sm dark:border-gold dark:bg-gold dark:text-night'
                    : 'border-gold/40 bg-white/80 text-maroon hover:border-maroon dark:bg-night/70 dark:text-gold-light'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    selected
                      ? 'border-ivory bg-ivory/20 dark:border-night'
                      : 'border-maroon/40 dark:border-gold/50'
                  }`}
                >
                  {selected && <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />}
                </span>
                <span>{selected ? tItin('addedPlace') : tItin('addPlace')}</span>
              </button>
            </div>

            {/* Meta Chips: Duration, Open Status, Day Highlight */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-ivory-warm px-2.5 py-0.5 text-[11px] font-medium text-ink dark:bg-night-border dark:text-ivory/85">
                <Clock className="h-3 w-3 text-maroon dark:text-gold" aria-hidden="true" />
                {durationText}
              </span>

              {openStatus && (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadgeClass}`}>
                  {tItin(`openStatus.${openStatus.statusKey}`)}
                </span>
              )}

              {slot.dayHighlightKey && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-semibold text-maroon-deep dark:text-gold-light">
                  <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>{tItin(`highlights.${slot.dayHighlightKey}`)}</span>
                </span>
              )}
            </div>

            <p className="text-xs leading-relaxed text-ink/85 break-words dark:text-ivory/80">
              {summary}
            </p>

            {/* Darshan, Dress Code, Fee Details */}
            <dl className="grid grid-cols-1 gap-1.5 rounded-2xl border border-gold/15 bg-ivory/65 p-2.5 text-xs dark:border-night-border dark:bg-night/50">
              <div>
                <dt className="font-semibold text-maroon dark:text-gold-light">
                  {tItin('darshanLabel')}
                </dt>
                <dd className="text-ink/80 dark:text-ivory/75">{darshanInfo}</dd>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <div className="flex items-start gap-1">
                  <Shirt className="mt-0.5 h-3.5 w-3.5 shrink-0 text-maroon/80 dark:text-gold" aria-hidden="true" />
                  <span>
                    <strong className="font-medium">{tItin('dressCodeLabel')}:</strong> {dressCode}
                  </span>
                </div>
                <div className="flex items-start gap-1">
                  <IndianRupee className="mt-0.5 h-3.5 w-3.5 shrink-0 text-maroon/80 dark:text-gold" aria-hidden="true" />
                  <span>
                    <strong className="font-medium">{tItin('entryFeeLabel')}:</strong>{' '}
                    <CurrencyDisplay amountInr={place.entryFeeInr} showFreeLabel /> — {feeNote}
                  </span>
                </div>
              </div>
            </dl>

            {/* Empowerment Badges & Verify Before Launch */}
            {(place.badges?.length || place.verifyBeforeLaunch) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {place.badges?.map((badge) => (
                  <BadgePill key={badge} badge={badge} />
                ))}
                {place.verifyBeforeLaunch && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                    <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span>{tCommon('verifyBeforeLaunch')}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.article>
    );
  }
);

PlaceCard.displayName = 'PlaceCard';
