import { getLocaleMeta } from '../i18n/config';
import type { SupportedLocale } from '../types/tourism';

export function formatInr(amount: number, locale: SupportedLocale): string {
  const meta = getLocaleMeta(locale);
  return new Intl.NumberFormat(meta.intlTag, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatApproxSecondaryCurrency(
  amountInr: number,
  locale: SupportedLocale,
  approxLabel: string
): string | null {
  const meta = getLocaleMeta(locale);
  if (!meta.secondaryCurrency || amountInr <= 0) return null;
  const converted = amountInr * meta.secondaryCurrency.ratePerInr;
  const formatted = new Intl.NumberFormat(meta.intlTag, {
    style: 'currency',
    currency: meta.secondaryCurrency.code,
    minimumFractionDigits: converted < 10 ? 2 : 0,
    maximumFractionDigits: converted < 10 ? 2 : 0,
  }).format(converted);
  return `${approxLabel} ${formatted}`;
}

export function formatNumber(value: number, locale: SupportedLocale, decimals = 0): string {
  const meta = getLocaleMeta(locale);
  return new Intl.NumberFormat(meta.intlTag, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatTime24ToLocale(hhmm: string, locale: SupportedLocale): string {
  const [hhStr, mmStr] = hhmm.split(':');
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return hhmm;
  const date = new Date(2026, 0, 5, hh, mm, 0);
  const meta = getLocaleMeta(locale);
  return new Intl.DateTimeFormat(meta.intlTag, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatDateLocale(isoDate: string, locale: SupportedLocale): string {
  const meta = getLocaleMeta(locale);
  return new Intl.DateTimeFormat(meta.intlTag, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

export function formatDurationParts(minutes: number): { hours: number; mins: number } {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return { hours, mins };
}
