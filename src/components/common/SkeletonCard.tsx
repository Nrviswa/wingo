import React from 'react';

export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div
    className="glass-card animate-pulse rounded-3xl p-4"
    aria-hidden="true"
  >
    <div className="mb-3 h-40 w-full rounded-2xl bg-ivory-warm dark:bg-night-border" />
    <div className="space-y-2">
      <div className="h-4 w-2/3 rounded-full bg-ivory-warm dark:bg-night-border" />
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className="h-3 w-full rounded-full bg-ivory-warm/80 dark:bg-night-border/80"
        />
      ))}
    </div>
  </div>
);
