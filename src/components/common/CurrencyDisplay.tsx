import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTripStore } from '../../store/useTripStore';
import { formatApproxSecondaryCurrency, formatInr } from '../../utils/format';

interface CurrencyDisplayProps {
  amountInr: number;
  className?: string;
  showFreeLabel?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amountInr,
  className = '',
  showFreeLabel = false,
}) => {
  const { t } = useTranslation('common');
  const locale = useTripStore((s) => s.locale);

  if (showFreeLabel && amountInr === 0) {
    return <span className={className}>{t('freeEntry')}</span>;
  }

  const primary = formatInr(amountInr, locale);
  const secondary = formatApproxSecondaryCurrency(amountInr, locale, t('approxPrefix'));

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-1.5 ${className}`}>
      <span>{primary}</span>
      {secondary && (
        <span className="text-xs font-normal opacity-80">({secondary})</span>
      )}
    </span>
  );
};
