import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Coffee, Landmark, Store, Trees } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { VisitorTipsCard } from '../components/common/VisitorTipsCard';
import { AppShell } from '../components/layout/AppShell';
import { useTripStore } from '../store/useTripStore';
import type { ExperienceCategory } from '../types/tourism';

const CATEGORIES: {
  id: ExperienceCategory;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}[] = [
  { id: 'temples', icon: Landmark, accent: 'from-maroon to-maroon-soft' },
  { id: 'localPlaces', icon: Store, accent: 'from-amber-800 to-amber-600' },
  { id: 'riversNature', icon: Trees, accent: 'from-emerald-800 to-emerald-600' },
  { id: 'chillVibes', icon: Coffee, accent: 'from-stone-800 to-amber-800' },
];

export const ExperienceSelectPage: React.FC = () => {
  const { t } = useTranslation('places');
  const navigate = useNavigate();
  const selectedTown = useTripStore((s) => s.selectedTown);
  const selectedCategory = useTripStore((s) => s.selectedCategory);
  const setCategory = useTripStore((s) => s.setCategory);

  const handleSelect = (cat: ExperienceCategory) => {
    setCategory(cat);
    navigate('/day');
  };

  return (
    <AppShell backTo="/towns">
      <div className="space-y-5">
        <header>
          <span className="inline-block rounded-full bg-maroon/10 px-3 py-1 text-xs font-semibold text-maroon dark:bg-gold/15 dark:text-gold-light">
            {t(`towns.${selectedTown}.name`)}
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-maroon sm:text-3xl dark:text-gold-light">
            {t('categoriesTitle')}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted dark:text-ivory/75">
            {t('categoriesSubtitle')}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const active = cat.id === selectedCategory;
            return (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                className={`glass-card flex min-h-[124px] flex-col justify-between rounded-3xl p-4 text-left transition active:scale-[0.98] ${
                  active ? 'ring-2 ring-maroon dark:ring-gold' : 'hover:border-gold'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-ivory shadow ${cat.accent}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted dark:text-ivory/60" aria-hidden="true" />
                </div>

                <div className="mt-3">
                  <h2 className="font-display text-xl font-bold text-maroon dark:text-gold-light">
                    {t(`categories.${cat.id}.title`)}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-ink/80 dark:text-ivory/75">
                    {t(`categories.${cat.id}.subtitle`)}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Visitor Tips card for international guests (en-GB, de, zh-CN) */}
        <VisitorTipsCard />
      </div>
    </AppShell>
  );
};

export default ExperienceSelectPage;
