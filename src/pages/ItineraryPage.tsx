import React, { useEffect, useMemo, useState } from 'react';
import { CloudSun, MapPin, Search, Users, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { BadgePill } from '../components/common/BadgePill';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { VisitorTipsCard } from '../components/common/VisitorTipsCard';
import { PlaceCard } from '../components/itinerary/PlaceCard';
import { AppShell } from '../components/layout/AppShell';
import { DAYS_OF_WEEK } from '../data/itineraries';
import { LOCAL_VENDORS } from '../data/locals';
import { getPlaceById } from '../data/places';
import { itineraryService } from '../services/itineraryService';
import { liveStatusService } from '../services/liveStatusService';
import { useTripStore } from '../store/useTripStore';
import type {
  DayItinerary,
  ExperienceCategory,
  Place,
  TempleOpenStatus,
  WeatherStatus,
} from '../types/tourism';
import { formatDurationParts } from '../utils/format';

const CATEGORIES: ExperienceCategory[] = ['temples', 'localPlaces', 'riversNature', 'chillVibes'];

export const ItineraryPage: React.FC = () => {
  const { t } = useTranslation('itinerary');
  const { t: tPlaces } = useTranslation('places');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();

  const selectedTown = useTripStore((s) => s.selectedTown);
  const selectedCategory = useTripStore((s) => s.selectedCategory);
  const selectedDay = useTripStore((s) => s.selectedDay);
  const selectedPlaceIds = useTripStore((s) => s.selectedPlaceIds);
  const searchQuery = useTripStore((s) => s.searchQuery);
  const setCategory = useTripStore((s) => s.setCategory);
  const setDay = useTripStore((s) => s.setDay);
  const setSearchQuery = useTripStore((s) => s.setSearchQuery);
  const togglePlaceSelection = useTripStore((s) => s.togglePlaceSelection);
  const setSelectedPlaceIds = useTripStore((s) => s.setSelectedPlaceIds);

  const [itinerary, setItinerary] = useState<DayItinerary | null>(null);
  const [weather, setWeather] = useState<WeatherStatus | null>(null);
  const [statuses, setStatuses] = useState<Record<string, TempleOpenStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const [plan, townWeather] = await Promise.all([
        itineraryService.getDayItinerary(selectedTown, selectedCategory, selectedDay),
        liveStatusService.getWeather(selectedTown),
      ]);
      const statusEntries = await Promise.all(
        plan.slots.map(async (slot) => [
          slot.placeId,
          await liveStatusService.getPlaceOpenStatus(slot.placeId, slot.timeSlot, selectedDay),
        ] as const)
      );
      if (!active) return;
      setItinerary(plan);
      setWeather(townWeather);
      setStatuses(Object.fromEntries(statusEntries));

      // Auto-select recommended defaults for current town/category if none currently match this town
      const currentValidForTown = selectedPlaceIds.filter((id) => {
        const p = getPlaceById(id);
        return p && p.townId === selectedTown;
      });
      if (currentValidForTown.length === 0 && plan.slots.length > 0) {
        setSelectedPlaceIds(plan.slots.slice(0, 2).map((s) => s.placeId));
      }
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [selectedTown, selectedCategory, selectedDay]);

  const filteredSlots = useMemo(() => {
    if (!itinerary) return [];
    const q = searchQuery.trim().toLowerCase();
    return itinerary.slots
      .map((slot) => ({ slot, place: getPlaceById(slot.placeId) }))
      .filter((entry): entry is { slot: typeof itinerary.slots[number]; place: Place } => {
        if (!entry.place) return false;
        if (!q) return true;
        const localizedName = tPlaces(`items.${entry.place.id}.name`).toLowerCase();
        const summary = tPlaces(`items.${entry.place.id}.summary`).toLowerCase();
        const tamil = entry.place.originalTamilName.toLowerCase();
        return localizedName.includes(q) || summary.includes(q) || tamil.includes(q);
      });
  }, [itinerary, searchQuery, tPlaces]);

  const summary = useMemo(() => {
    const selectedPlaces = selectedPlaceIds
      .map((id) => getPlaceById(id))
      .filter((p): p is Place => Boolean(p && p.townId === selectedTown));

    const totalMinutes = selectedPlaces.reduce((acc, p) => acc + p.durationMinutes, 0);
    const totalEntryInr = selectedPlaces.reduce((acc, p) => acc + p.entryFeeInr, 0);
    return {
      count: selectedPlaces.length,
      totalMinutes,
      totalEntryInr,
    };
  }, [selectedPlaceIds, selectedTown]);

  const { hours, mins } = formatDurationParts(summary.totalMinutes);
  const townVendors = useMemo(
    () => LOCAL_VENDORS.filter((v) => v.townId === selectedTown).slice(0, 2),
    [selectedTown]
  );

  return (
    <AppShell backTo="/day">
      <div className="space-y-4 pb-24">
        {/* Header & Weather Pill */}
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="font-display text-2xl font-bold text-maroon sm:text-3xl dark:text-gold-light">
              {tPlaces(`towns.${selectedTown}.name`)} · {t('timelineTitle')}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-badge/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-badge dark:text-emerald-300">
              <WifiOff className="h-3 w-3" aria-hidden="true" />
              {tCommon('offlineReady')}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted dark:text-ivory/75">
            <p>{t('timelineSubtitle')}</p>
            {weather && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-white/70 px-3 py-1 font-medium text-ink dark:bg-night-card dark:text-ivory">
                <CloudSun className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                {weather.tempC}°C · {tPlaces(`weatherConditions.${weather.conditionKey}`)}
              </span>
            )}
          </div>
        </header>

        {/* Horizontal Category Switcher */}
        <div className="snap-scroller py-1" role="tablist" aria-label={tPlaces('categoriesTitle')}>
          {CATEGORIES.map((cat) => {
            const active = cat === selectedCategory;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(cat)}
                className={`min-h-[40px] rounded-full border px-4 py-1.5 text-xs font-semibold transition active:scale-95 ${
                  active
                    ? 'border-maroon bg-maroon text-ivory dark:border-gold dark:bg-gold dark:text-night'
                    : 'border-gold/30 bg-white/80 text-maroon dark:bg-night-card dark:text-gold-light'
                }`}
              >
                {tPlaces(`categories.${cat}.title`)}
              </button>
            );
          })}
        </div>

        {/* Horizontal Day Switcher */}
        <div className="snap-scroller pb-1" role="tablist" aria-label={t('daySelectTitle')}>
          {DAYS_OF_WEEK.map((day) => {
            const active = day === selectedDay;
            return (
              <button
                key={day}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setDay(day)}
                className={`min-h-[38px] rounded-xl border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                  active
                    ? 'border-gold bg-gold/25 font-bold text-maroon-deep dark:text-gold-light'
                    : 'border-gold/20 bg-white/60 text-muted dark:bg-night-card/70 dark:text-ivory/75'
                }`}
              >
                {t(`days.${day}`)}
              </button>
            );
          })}
        </div>

        {/* Day Theme Banner */}
        {itinerary && (
          <div className="rounded-2xl border border-gold/25 bg-gold/10 px-3.5 py-2.5 text-xs font-medium text-maroon-deep dark:text-gold-light">
            {t(`dayThemes.${itinerary.dayThemeKey}`)}
          </div>
        )}

        {/* Localized Search & Quick Select */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tCommon('searchPlaceholder')}
              aria-label={tCommon('searchPlaceholder')}
              className="min-h-[44px] w-full rounded-2xl border border-gold/30 bg-white/85 pl-10 pr-4 text-sm text-ink placeholder:text-muted dark:border-night-border dark:bg-night-card dark:text-ivory"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!itinerary) return;
                const allIds = itinerary.slots.map((s) => s.placeId);
                const merged = Array.from(new Set([...selectedPlaceIds, ...allIds]));
                setSelectedPlaceIds(merged);
              }}
              className="min-h-[40px] rounded-xl border border-gold/30 bg-white/80 px-3 text-xs font-semibold text-maroon hover:border-gold dark:bg-night-card dark:text-gold-light"
            >
              {t('selectAllRecommended')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlaceIds([])}
              className="min-h-[40px] rounded-xl border border-gold/25 px-3 text-xs font-medium text-muted hover:text-maroon dark:text-ivory/70"
            >
              {t('clearSelection')}
            </button>
          </div>
        </div>

        {/* Vertical Timeline */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="glass-card rounded-3xl p-6 text-center text-sm text-muted dark:text-ivory/75">
            {tCommon('noSearchResults')}
          </div>
        ) : (
          <div className="relative space-y-4 pl-4 before:absolute before:bottom-6 before:left-1.5 before:top-6 before:w-0.5 before:bg-gradient-to-b before:from-gold before:via-maroon/40 before:to-gold/20">
            {filteredSlots.map(({ slot, place }) => (
              <div key={place.id} className="relative">
                <span
                  className={`absolute -left-4 top-6 h-3.5 w-3.5 rounded-full border-2 border-ivory dark:border-night ${
                    selectedPlaceIds.includes(place.id) ? 'bg-maroon dark:bg-gold' : 'bg-gold/50'
                  }`}
                  aria-hidden="true"
                />
                <PlaceCard
                  place={place}
                  slot={slot}
                  selected={selectedPlaceIds.includes(place.id)}
                  openStatus={statuses[place.id]}
                  onToggle={togglePlaceSelection}
                />
              </div>
            ))}
          </div>
        )}

        {/* International Visitor Tips */}
        <VisitorTipsCard />

        {/* Local Empowerment Spotlight */}
        <section className="glass-card rounded-3xl p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-maroon dark:text-gold-light" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-maroon dark:text-gold-light">
                {t('localSpotlightTitle')}
              </h2>
            </div>
            <Link
              to="/locals"
              className="text-xs font-semibold text-maroon underline decoration-gold underline-offset-4 dark:text-gold-light"
            >
              {t('seeAllLocals')}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {townVendors.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-gold/20 bg-ivory/70 p-3 dark:border-night-border dark:bg-night/60"
              >
                <div className="text-sm font-bold text-maroon dark:text-gold-light">{v.name}</div>
                <div className="text-[11px] font-medium text-muted dark:text-ivory/65">
                  {tPlaces(`vendors.${v.id}.roleLabel`)}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {v.badges.map((b) => (
                    <BadgePill key={b} badge={b} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Summary Bar */}
      <div className="glass-bar fixed inset-x-0 bottom-[62px] z-20 border-t border-gold/30 shadow-xl">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          <div className="min-w-0">
            <div className="text-xs font-bold text-maroon dark:text-gold-light">
              {t('selectedCount', { count: summary.count })}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-muted dark:text-ivory/75">
              <span>
                {t('totalTime')}:{' '}
                {t('durationFmt', { hours, mins })}
              </span>
              <span>
                {t('estimatedEntry')}: <CurrencyDisplay amountInr={summary.totalEntryInr} showFreeLabel />
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={summary.count === 0}
              onClick={() => navigate('/map')}
              className="flex min-h-[42px] items-center gap-1.5 rounded-xl border border-maroon/35 bg-white px-3 py-2 text-xs font-semibold text-maroon transition hover:bg-maroon/5 disabled:opacity-45 dark:border-gold/40 dark:bg-night-card dark:text-gold-light"
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('viewMapCta')}</span>
            </button>
            <button
              type="button"
              disabled={summary.count === 0}
              onClick={() => navigate('/booking')}
              className="min-h-[42px] rounded-xl bg-maroon px-4 py-2 text-xs font-semibold text-ivory shadow transition hover:brightness-110 disabled:opacity-45 dark:bg-gold dark:text-night"
            >
              {t('proceedBookingCta')}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ItineraryPage;
