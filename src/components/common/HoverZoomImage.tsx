import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { Language } from '../../types';

interface HoverZoomImageProps {
  src: string;
  alt: string;
  zoomScale?: number;
  containerClassName?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
  showHint?: boolean;
  hintPosition?: 'bottom-left' | 'bottom-right' | 'top-right';
  language?: Language;
}

export const HoverZoomImage: React.FC<HoverZoomImageProps> = ({
  src,
  alt,
  zoomScale = 1.75,
  containerClassName = '',
  imgClassName = '',
  loading,
  referrerPolicy = 'no-referrer',
  onError,
  onClick,
  disabled = false,
  showHint = false,
  hintPosition = 'bottom-right',
  language = 'en',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [supportsHoverZoom, setSupportsHoverZoom] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setSupportsHoverZoom(hoverQuery.matches && !motionQuery.matches);
    };
    update();
    hoverQuery.addEventListener?.('change', update);
    motionQuery.addEventListener?.('change', update);
    return () => {
      hoverQuery.removeEventListener?.('change', update);
      motionQuery.removeEventListener?.('change', update);
    };
  }, []);

  const canZoom = !disabled && supportsHoverZoom;

  const updateOrigin = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    setOrigin({ x, y });
  };

  const hintPlacementClass =
    hintPosition === 'bottom-left'
      ? 'bottom-3 left-3'
      : hintPosition === 'top-right'
      ? 'top-3 right-3'
      : 'bottom-3 right-3';

  return (
    <div
      ref={containerRef}
      onMouseEnter={(e) => {
        if (!canZoom) return;
        updateOrigin(e.clientX, e.clientY);
        setIsZoomed(true);
      }}
      onMouseMove={(e) => {
        if (!canZoom) return;
        updateOrigin(e.clientX, e.clientY);
        if (!isZoomed) setIsZoomed(true);
      }}
      onMouseLeave={() => {
        if (isZoomed) {
          setIsZoomed(false);
          setOrigin({ x: 50, y: 50 });
        }
      }}
      onClick={onClick}
      className={`relative overflow-hidden ${canZoom ? 'cursor-zoom-in' : ''} ${containerClassName}`}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        referrerPolicy={referrerPolicy}
        onError={onError}
        style={{
          transformOrigin: `${origin.x.toFixed(1)}% ${origin.y.toFixed(1)}%`,
          transform: canZoom && isZoomed ? `scale(${zoomScale})` : 'scale(1)',
        }}
        className={`transition-transform duration-200 ease-out will-change-transform ${imgClassName}`}
      />

      {showHint && canZoom && (
        <span
          className={`pointer-events-none absolute ${hintPlacementClass} z-10 inline-flex items-center gap-1 px-2 py-1 rounded bg-black/75 backdrop-blur-sm border border-white/20 text-[10px] font-mono text-white transition-opacity duration-200 ${
            isZoomed ? 'opacity-0' : 'opacity-85'
          }`}
        >
          <ZoomIn className="w-3 h-3" />
          <span className="whitespace-nowrap">
            {language === 'en' ? 'Hover to Zoom' : 'জুম করতে হোভার করুন'}
          </span>
        </span>
      )}
    </div>
  );
};
