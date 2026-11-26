import React from 'react';
import { Camera, Footprints, HandCoins, ShieldCheck, Shirt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocaleMeta } from '../../i18n/config';
import { useTripStore } from '../../store/useTripStore';

export const VisitorTipsCard: React.FC = () => {
  const { t } = useTranslation('places');
  const locale = useTripStore((s) => s.locale);
  const meta = getLocaleMeta(locale);

  if (!meta.isInternationalVisitor) return null;

  const tips = [
    { icon: Shirt, title: t('visitorTips.dressCodeTitle'), body: t('visitorTips.dressCodeBody') },
    { icon: Footprints, title: t('visitorTips.shoesTitle'), body: t('visitorTips.shoesBody') },
    { icon: Camera, title: t('visitorTips.photoTitle'), body: t('visitorTips.photoBody') },
    { icon: HandCoins, title: t('visitorTips.bargainingTitle'), body: t('visitorTips.bargainingBody') },
    { icon: ShieldCheck, title: t('visitorTips.safetyTitle'), body: t('visitorTips.safetyBody') },
  ];

  return (
    <section
      aria-label={t('visitorTips.title')}
      className="glass-card rounded-3xl p-4 sm:p-5"
    >
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-maroon dark:text-gold-light">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-maroon dark:text-gold-light">
            {t('visitorTips.title')}
          </h3>
          <p className="text-xs text-muted dark:text-ivory/70">{t('visitorTips.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {tips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.title}
              className="rounded-2xl border border-gold/20 bg-ivory/70 p-3 dark:border-night-border dark:bg-night/60"
            >
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-maroon dark:text-gold-light">
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{tip.title}</span>
              </div>
              <p className="text-xs leading-relaxed text-ink/85 dark:text-ivory/80">{tip.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
