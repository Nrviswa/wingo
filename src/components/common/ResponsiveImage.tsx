import React, { useState } from 'react';

interface ResponsiveImageProps {
  src: string;
  srcSet?: string;
  alt: string;
  className?: string;
  priority?: 'high' | 'normal';
  sizes?: string;
  width?: number;
  height?: number;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  srcSet,
  alt,
  className = '',
  priority = 'normal',
  sizes = '(max-width: 640px) 100vw, 480px',
  width = 800,
  height = 450,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-ivory-warm dark:bg-night-border ${className}`}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-ivory-warm via-gold/10 to-ivory-warm dark:from-night-card dark:via-gold/10 dark:to-night-card"
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority === 'high' ? undefined : 'lazy'}
        fetchPriority={priority === 'high' ? 'high' : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
