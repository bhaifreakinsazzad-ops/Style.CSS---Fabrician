import React from 'react';

interface StarKiTLogoProps {
  variant?: 'light-on-dark' | 'dark-on-light';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Official StarkiT Rectangular Monochrome Plaque Logo (Brand Book Page 03 & Page 06)
 * - Arabic "ستاركيت" centered over spaced "S T Λ R K I T" (barless apex lambda glyph)
 * - Strictly Pure White (#FFFFFF) & Jet Black (#170000)
 * - Honors minimum 152px width & generous perimeter clear space
 */
export const StarKiTLogo: React.FC<StarKiTLogoProps> = ({
  variant = 'light-on-dark',
  showTagline = false,
  size = 'md',
  className = '',
}) => {
  const isPlaqueDark = variant === 'light-on-dark';
  const bg = isPlaqueDark ? '#170000' : '#FFFFFF';
  const fg = isPlaqueDark ? '#FFFFFF' : '#170000';
  const border = isPlaqueDark ? 'rgba(255,255,255,0.22)' : 'rgba(23,0,0,0.2)';

  const dimensions =
    size === 'sm'
      ? {
          plaque: 'min-w-[152px] px-5 py-3',
          arabic: 'text-xl',
          latin: 'text-[10px] tracking-[0.55em]',
          sub: 'text-[9px]',
        }
      : size === 'lg'
      ? {
          plaque: 'min-w-[220px] sm:min-w-[260px] px-8 py-5',
          arabic: 'text-3xl sm:text-4xl',
          latin: 'text-xs sm:text-sm tracking-[0.65em]',
          sub: 'text-[10px]',
        }
      : {
          plaque: 'min-w-[176px] px-6 py-4',
          arabic: 'text-2xl',
          latin: 'text-[11px] tracking-[0.58em]',
          sub: 'text-[9px]',
        };

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <div
        className={`flex flex-col items-center justify-center border ${dimensions.plaque}`}
        style={{ backgroundColor: bg, borderColor: border }}
      >
        <span
          dir="rtl"
          lang="ar"
          className={`font-starkit-arabic font-bold leading-none ${dimensions.arabic}`}
          style={{ color: fg }}
        >
          ستاركيت
        </span>
        <span
          className={`font-starkit font-medium uppercase leading-none mt-2.5 pl-[0.58em] ${dimensions.latin}`}
          style={{ color: fg }}
        >
          STΛRKIT
        </span>
      </div>

      {showTagline && (
        <span
          className={`font-starkit uppercase tracking-[0.24em] mt-2 ${dimensions.sub}`}
          style={{ color: isPlaqueDark ? 'rgba(255,255,255,0.68)' : 'rgba(23,0,0,0.65)' }}
        >
          Dhaka Clothing Brand · By Nafe Munawer
        </span>
      )}
    </div>
  );
};
