import React, { useState } from 'react';
import { FARIZA_BRAND_ASSETS, FARIZA_BRAND_BOOK } from '../../data/farizaBrandData';

interface FarizaLogoProps {
  /** 'full' enforces >= 152px minimum width per Brand Book Page 3; 'compact' is for compact cards/sub-bars */
  size?: 'compact' | 'medium' | 'specimen';
  /** Surface variant: 'chalk' | 'white' | 'dark' */
  surface?: 'chalk' | 'white' | 'dark';
  showClearSpaceFrame?: boolean;
  className?: string;
}

export const FarizaLogo: React.FC<FarizaLogoProps> = ({
  size = 'medium',
  surface = 'white',
  showClearSpaceFrame = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  // Enforce Brand Book Page 3 minimum width: 1.58 in / 152px on medium & specimen sizes
  const widthClasses =
    size === 'specimen'
      ? 'w-[220px] sm:w-[270px] min-w-[152px]'
      : size === 'medium'
      ? 'w-[168px] sm:w-[196px] min-w-[152px]'
      : 'w-[152px] min-w-[152px]';

  const frameBg =
    surface === 'dark'
      ? 'bg-white border border-white/20'
      : surface === 'chalk'
      ? 'bg-white border border-[#050505]/12'
      : 'bg-[#F0F2F5]/60 border border-[#050505]/10';

  if (imgError) {
    return (
      <div
        className={`inline-flex flex-col items-center justify-center rounded-xl px-5 py-3 bg-white border border-[#050505]/15 text-[#050505] min-w-[152px] ${className}`}
      >
        <span className="font-fariza text-xl tracking-tight font-normal text-[#050505]">
          Fariza&apos;s <strong className="font-bold">TERRITORY</strong>
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#0866FF] mt-0.5">
          {FARIZA_BRAND_BOOK.subtitleEn}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-center ${
        showClearSpaceFrame ? `p-5 sm:p-6 rounded-2xl ${frameBg}` : ''
      } ${className}`}
    >
      <img
        src={FARIZA_BRAND_ASSETS.logo}
        alt="Fariza's Territory — Handmade & Crafts Official Brand Book Logo"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${widthClasses} h-auto object-contain select-none rounded-lg`}
      />
      {showClearSpaceFrame && (
        <div className="mt-2.5 text-[10px] font-mono text-[#4B5563] uppercase tracking-wider text-center">
          Clear Space: {FARIZA_BRAND_BOOK.logoRules.clearSpacePx}px · Min Width:{' '}
          {FARIZA_BRAND_BOOK.logoRules.minWidthPx}px ({FARIZA_BRAND_BOOK.logoRules.minWidthInches})
        </div>
      )}
    </div>
  );
};
