import React from 'react';

interface StarKiTLogoProps {
  variant?: 'light-on-dark' | 'dark-on-light';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Official Bilingual StarKiT Geometric Vector Identity
 * Mirrors StarKiT Brand Book: Arabic geometric wordmark ("ستاركيت") paired with spaced S T Λ R K I T apex glyph.
 */
export const StarKiTLogo: React.FC<StarKiTLogoProps> = ({
  variant = 'light-on-dark',
  showTagline = false,
  size = 'md',
  className = '',
}) => {
  const fg = variant === 'light-on-dark' ? '#FFFFFF' : '#170000';
  const muted = variant === 'light-on-dark' ? 'rgba(255,255,255,0.68)' : 'rgba(23,0,0,0.65)';
  const accent = '#FF2E2E';

  const dimensions =
    size === 'sm'
      ? { svg: 'h-8 w-auto', wordmark: 'text-sm tracking-[0.28em]', arabic: 'text-sm', tag: 'text-[9px]' }
      : size === 'lg'
      ? { svg: 'h-14 w-auto', wordmark: 'text-xl sm:text-2xl tracking-[0.38em]', arabic: 'text-2xl', tag: 'text-[10px]' }
      : { svg: 'h-10 w-auto', wordmark: 'text-base tracking-[0.32em]', arabic: 'text-lg', tag: 'text-[9px]' };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Spaced Geometric Apex Shield Mark */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className={dimensions.svg}
      >
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="10"
          stroke={fg}
          strokeWidth="2.5"
          fill={variant === 'light-on-dark' ? '#170000' : '#FFFFFF'}
        />
        {/* Sharp Kinetic Apex Lambda (Λ) + Crosshair Star */}
        <path
          d="M17 48L32 15L47 48H39.5L32 30.5L24.5 48H17Z"
          fill={fg}
        />
        <circle cx="32" cy="11" r="2.75" fill={accent} />
        <rect x="26" y="45" width="12" height="3" fill={accent} />
      </svg>

      {/* Bilingual Wordmark Stack */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-2.5">
          <span
            className={`font-starkit font-black uppercase ${dimensions.wordmark}`}
            style={{ color: fg }}
          >
            S T Λ R K I T
          </span>
          <span
            dir="rtl"
            lang="ar"
            className={`font-semibold ${dimensions.arabic}`}
            style={{ color: accent }}
          >
            ستاركيت
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-starkit-tech uppercase tracking-[0.26em] mt-1 ${dimensions.tag}`}
            style={{ color: muted }}
          >
            Wear Your World · Est. Dhaka
          </span>
        )}
      </div>
    </div>
  );
};
