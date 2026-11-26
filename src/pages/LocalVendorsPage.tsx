import React, { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AlertCircle, Phone, Search, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BadgePill } from '../components/common/BadgePill';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay';
import { AppShell } from '../components/layout/AppShell';
import { LOCAL_VENDORS } from '../data/locals';
import { useTripStore } from '../store/useTripStore';
import type { TownId } from '../types/tourism';
import { formatNumber } from '../utils/format';

export const LocalVendorsPage: React.FC = () => {
  const { t } = useTranslation('places');
  const { t: tCommon } = useTranslation('common');
  const { t: tBooking } = useTranslation('booking');

  const locale = useTripStore((s) => s.locale);
  const selectedTown = useTripStore((s) => s.selectedTown);

  const [townFilter, setTownFilter] = useState<'all' | TownId>(selectedTown);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LOCAL_VENDORS.filter((v) => {
      if (townFilter !== 'all' && v.townId !== townFilter) return false;
      if (!q) return true;
      const roleLabel = t(`vendors.${v.id}.roleLabel`).toLowerCase();
      const bio = t(`vendors.${v.id}.bio`).toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.tamilName.toLowerCase().includes(q) ||
        roleLabel.includes(q) ||
        bio.includes(q)
      );
    });
  }, [townFilter, query, t]);

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 235,
    overscan: 3,
  });

  return (
    <AppShell backTo="/plan">
      <div className="space-y-4">
        <header>
          <h1 className="font-display text-2xl font-bold text-maroon sm:text-3xl dark:text-gold-light">
            {t('vendorsTitle')}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted dark:text-ivory/75">
            {t('vendorsSubtitle')}
          </p>
        </header>

        {/* Town Filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'madurai', 'kumbakonam'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setTownFilter(opt)}
              className={`min-h-[38px] rounded-full border px-3.5 py-1 text-xs font-semibold transition ${
                townFilter === opt
                  ? 'border-maroon bg-maroon text-ivory dark:border-gold dark:bg-gold dark:text-night'
                  : 'border-gold/30 bg-white/80 text-maroon dark:bg-night-card dark:text-gold-light'
              }`}
            >
              {opt === 'all' ? 'Madurai + Kumbakonam' : t(`towns.${opt}.name`)}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tCommon('searchPlaceholder')}
            aria-label={tCommon('searchPlaceholder')}
            className="min-h-[44px] w-full rounded-2xl border border-gold/30 bg-white/85 pl-10 pr-4 text-sm text-ink placeholder:text-muted dark:border-night-border dark:bg-night-card dark:text-ivory"
          />
        </div>

        {toast && (
          <div
            role="status"
            className="rounded-2xl bg-emerald-badge/15 px-4 py-2.5 text-xs font-semibold text-emerald-badge dark:text-emerald-300"
          >
            {toast}
          </div>
        )}

        {/* Virtualized Directory */}
        <div ref={parentRef} className="h-[62dvh] overflow-y-auto pr-1">
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }} className="relative w-full">
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const v = filtered[virtualRow.index];
              return (
                <div
                  key={v.id}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                  className="absolute left-0 top-0 w-full pb-3"
                >
                  <article className="glass-card space-y-2.5 rounded-3xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="rounded-full bg-maroon/10 px-2.5 py-0.5 text-[11px] font-semibold text-maroon dark:bg-gold/15 dark:text-gold-light">
                          {t(`vendorRoles.${v.role}`)} · {t(`towns.${v.townId}.name`)}
                        </span>
                        <h2 className="mt-1.5 font-display text-xl font-bold text-maroon dark:text-gold-light">
                          {v.name}
                        </h2>
                        <div lang="ta" className="text-xs text-muted dark:text-ivory/65">
                          {v.tamilName}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-bold text-maroon-deep dark:text-gold-light">
                          <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                          {formatNumber(v.rating, locale, 1)}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-maroon/90 dark:text-gold-light">
                      {t(`vendors.${v.id}.roleLabel`)}
                    </div>
                    <p className="text-xs leading-relaxed text-ink/85 dark:text-ivory/80">
                      {t(`vendors.${v.id}.bio`)}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {v.badges.map((b) => (
                        <BadgePill key={b} badge={b} />
                      ))}
                      {v.verifyBeforeLaunch && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                          <AlertCircle className="h-3 w-3" aria-hidden="true" />
                          {tCommon('verifyBeforeLaunch')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gold/20 pt-2.5">
                      <div className="text-xs">
                        <span className="text-muted dark:text-ivory/70">
                          {t(`vendors.${v.id}.specialty`)} ·{' '}
                        </span>
                        <CurrencyDisplay amountInr={v.startingPriceInr} className="font-bold" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setToast(tBooking('callingToast', { name: v.name, phone: v.phoneDisplay }));
                          window.setTimeout(() => setToast(null), 3000);
                        }}
                        className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-emerald-badge px-3.5 py-1.5 text-xs font-semibold text-white"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{tBooking('callDriver')}</span>
                      </button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default LocalVendorsPage;
