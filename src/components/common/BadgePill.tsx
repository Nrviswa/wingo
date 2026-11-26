import React from 'react';
import { Award, HeartHandshake, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EmpowermentBadge } from '../../types/tourism';

export const BadgePill: React.FC<{ badge: EmpowermentBadge }> = ({ badge }) => {
  const { t } = useTranslation('common');

  const styles: Record<
    EmpowermentBadge,
    { icon: React.ComponentType<{ className?: string }>; cls: string }
  > = {
    localOwned: {
      icon: Award,
      cls: 'bg-maroon/10 text-maroon border-maroon/20 dark:bg-maroon-soft/30 dark:text-gold-light dark:border-gold/25',
    },
    womenRun: {
      icon: HeartHandshake,
      cls: 'bg-gold/15 text-maroon-deep border-gold/35 dark:bg-gold/15 dark:text-gold-light dark:border-gold/30',
    },
    ecoFriendly: {
      icon: Leaf,
      cls: 'bg-emerald-badge/12 text-emerald-badge border-emerald-badge/25 dark:bg-emerald-badge/25 dark:text-emerald-300 dark:border-emerald-400/25',
    },
  };

  const { icon: Icon, cls } = styles[badge];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{t(`badges.${badge}`)}</span>
    </span>
  );
};
