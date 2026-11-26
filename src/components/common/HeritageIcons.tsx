import React from 'react';

export const WingoCrestIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="22" className="fill-maroon stroke-gold" strokeWidth="2" />
    <path
      d="M24 8L28 15H20L24 8ZM18 16H30L32 21H16L18 16ZM14 22H34L36 30H12L14 22Z"
      className="fill-gold-light"
    />
    <path d="M21 30V25C21 23.3431 22.3431 22 24 22C25.6569 22 27 23.3431 27 25V30H21Z" className="fill-maroon-deep" />
    <path
      d="M11 34C15 32 19 36 24 34C29 32 33 36 37 34"
      className="stroke-gold-light"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const KolamDivider: React.FC<{ className?: string }> = ({ className = 'w-full h-5' }) => (
  <svg
    viewBox="0 0 240 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M10 10H96M144 10H230"
      className="stroke-gold/40"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M120 3L127 10L120 17L113 10L120 3Z"
      className="stroke-gold fill-gold/15"
      strokeWidth="1.4"
    />
    <circle cx="105" cy="10" r="2" className="fill-gold/70" />
    <circle cx="135" cy="10" r="2" className="fill-gold/70" />
  </svg>
);

export const AutoRickshawSvg: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 64 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M14 14C14 10.6863 16.6863 8 20 8H42C47.5228 8 52 12.4772 52 18V33H12V20C12 16.6863 14 14 14 14Z"
      className="fill-gold-light/90 stroke-maroon"
      strokeWidth="2.2"
    />
    <path d="M18 14H36V23H16L18 14Z" className="fill-ivory stroke-maroon" strokeWidth="1.8" />
    <path d="M40 14H46C48.2091 14 50 15.7909 50 18V23H40V14Z" className="fill-ivory/80 stroke-maroon" strokeWidth="1.8" />
    <path d="M10 33H54V36C54 37.1046 53.1046 38 52 38H12C10.8954 38 10 37.1046 10 36V33Z" className="fill-maroon" />
    <circle cx="18" cy="39" r="5" className="fill-ink stroke-gold" strokeWidth="2" />
    <circle cx="46" cy="39" r="5" className="fill-ink stroke-gold" strokeWidth="2" />
  </svg>
);
