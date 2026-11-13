import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/translations';

interface FooterProps {
  language: Language;
  onNavigate: (sectionId: string) => void;
  onOpenSizeGuide?: () => void;
  onOpenTrackOrder?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  language, 
  onNavigate, 
  onOpenSizeGuide, 
  onOpenTrackOrder 
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const t = translations[language];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setIsSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-[#09090B] border-t border-white/10 text-[#D8D3C9] pt-20 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3.5 mb-4">
              <img
                src="/assets/aistudio/Untitled_design_a468bd14.png"
                alt="Fabrician Emblem"
                className="w-12 h-12 object-contain drop-shadow"
              />
              <div>
                <span className="font-serif-luxury text-2xl sm:text-3xl tracking-[0.22em] text-[#F5F2EB] font-semibold block">
                  FABRICIAN
                </span>
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#B69A60] uppercase block -mt-1">
                  Made in Bangladesh
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#77777D] font-light leading-relaxed mb-6 max-w-sm">
              {t.footer.heritageStatement}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-[#D5BA80]">
              <Sparkles className="w-3 h-3 text-[#B69A60]" />
              <span>{t.brand.originBadge}</span>
              <span className="text-white/20">·</span>
              <span>Est. 2021 / Relaunch 2026</span>
            </div>
          </div>

          {/* Navigation Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#F5F2EB] font-medium mb-4">
              {t.footer.navigation}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#77777D]">
              <li>
                <button
                  onClick={() => onNavigate('lookbook')}
                  className="hover:text-[#F5F2EB] transition-colors cursor-pointer text-left"
                >
                  {t.nav.lookbook}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('collections')}
                  className="hover:text-[#F5F2EB] transition-colors cursor-pointer text-left"
                >
                  {t.nav.collections}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('essentials')}
                  className="hover:text-[#F5F2EB] transition-colors cursor-pointer text-left"
                >
                  {t.nav.men} &amp; {t.nav.women}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('craft')}
                  className="hover:text-[#F5F2EB] transition-colors cursor-pointer text-left"
                >
                  {t.nav.craft}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('style-intelligence')}
                  className="hover:text-[#F5F2EB] transition-colors cursor-pointer text-left"
                >
                  {t.nav.styleIntelligence}
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#F5F2EB] font-medium mb-4">
              {t.footer.customerCare}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#77777D]">
              <li>
                <button
                  type="button"
                  onClick={onOpenTrackOrder}
                  className="hover:text-[#F5F2EB] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>{t.footer.shippingReturns}</span>
                  <span className="text-[10px] text-[#B69A60] font-mono">(Track)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="hover:text-[#F5F2EB] transition-colors cursor-pointer text-left"
                >
                  {t.footer.sizeGuide}
                </button>
              </li>
              <li>
                <span className="hover:text-[#F5F2EB] transition-colors cursor-pointer">
                  {t.footer.contact}
                </span>
              </li>
              <li>
                <span className="hover:text-[#F5F2EB] transition-colors cursor-pointer">
                  {t.footer.legal}
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Dispatch (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#F5F2EB] font-medium mb-2">
              {t.footer.newsletterTitle}
            </h4>
            <p className="text-xs text-[#77777D] font-light leading-relaxed mb-4">
              {t.footer.newsletterDesc}
            </p>

            {isSubscribed ? (
              <div className="p-3 bg-[#B69A60]/10 border border-[#B69A60]/40 rounded text-xs text-[#D5BA80] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B69A60]" />
                <span>{t.footer.subscribed}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.footer.newsletterPlaceholder}
                  className="bg-black/50 border border-white/15 rounded px-3 py-2 text-xs text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60] flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer shrink-0"
                >
                  {t.footer.subscribe}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77777D]">
          <p>© 2026 {t.footer.copyright}</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>BDT (৳) Currency</span>
            <span>Dhaka Atelier</span>
            <span>Worldwide Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
