import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, X, PhoneCall, MapPin, ShieldCheck, Lock } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/translations';
import { useStoreData } from '../../context/StoreDataContext';
import { subscribeNewsletter } from '../../services/storeService';

interface FooterProps {
  language: Language;
  onNavigate: (sectionId: string) => void;
  onSelectBrand?: (brand: 'store' | 'starkit' | 'farizas-territory') => void;
  onOpenSizeGuide?: () => void;
  onOpenTrackOrder?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onNavigate,
  onSelectBrand,
  onOpenSizeGuide,
  onOpenTrackOrder,
  onOpenAdmin,
}) => {
  const { storeSettings } = useStoreData();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [activeInfoModal, setActiveInfoModal] = useState<'contact' | 'legal' | null>(null);
  const t = translations[language];

  useEffect(() => {
    if (!activeInfoModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveInfoModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeInfoModal]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || isSubscribing) return;

    setIsSubscribing(true);
    setSubError(null);
    try {
      await subscribeNewsletter(trimmed, language);
      setIsSubscribed(true);
      setEmail('');
    } catch {
      setSubError(
        language === 'en'
          ? 'Unable to save subscription right now. Please try again.'
          : 'সাবস্ক্রিপশন সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
      );
    } finally {
      setIsSubscribing(false);
    }
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
              <span>Est. 2021</span>
            </div>
          </div>

          {/* Navigation Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#F5F2EB] font-medium mb-4">
              {t.footer.navigation}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#77777D]">
              {onSelectBrand && (
                <>
                  <li>
                    <button
                      onClick={() => onSelectBrand('starkit')}
                      className="text-white hover:text-[#FF2E2E] transition-colors cursor-pointer text-left font-medium"
                    >
                      {language === 'en'
                        ? 'StarKiT — Wear Your World (/starkit)'
                        : 'স্টারকিট — গ্রাফিক আর্কাইভ (/starkit)'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onSelectBrand('farizas-territory')}
                      className="text-[#F48FB1] hover:text-[#F5F2EB] transition-colors cursor-pointer text-left font-medium"
                    >
                      {language === 'en'
                        ? "Fariza's Territory (/farizas-territory)"
                        : 'ফারিজাস টেরিটরি (/farizas-territory)'}
                    </button>
                  </li>
                </>
              )}
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
                  onClick={() => onNavigate('three-piece-edit')}
                  className="hover:text-[#F5F2EB] transition-colors cursor-pointer text-left"
                >
                  {t.nav.threePiece}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('graphic-archive')}
                  className="hover:text-[#F5F2EB] transition-colors cursor-pointer text-left"
                >
                  {t.nav.graphicArchive}
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
                <button
                  type="button"
                  onClick={() => setActiveInfoModal('contact')}
                  className="hover:text-[#F5F2EB] transition-colors cursor-pointer text-left"
                >
                  {t.footer.contact}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveInfoModal('legal')}
                  className="hover:text-[#F5F2EB] transition-colors cursor-pointer text-left"
                >
                  {t.footer.legal}
                </button>
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
              <div className="p-3 bg-[#B69A60]/10 border border-[#B69A60]/40 rounded text-xs text-[#D5BA80] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B69A60] shrink-0" />
                  <span>{t.footer.subscribed}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubscribed(false)}
                  className="text-[10px] font-mono underline hover:text-white cursor-pointer"
                >
                  {language === 'en' ? 'Dismiss' : 'বাতিল'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
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
                    disabled={isSubscribing}
                    className="px-4 py-2 bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isSubscribing
                      ? language === 'en'
                        ? 'Saving...'
                        : 'সংরক্ষণ...'
                      : t.footer.subscribe}
                  </button>
                </form>
                {subError && <p className="text-[11px] text-red-400">{subError}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77777D]">
          <p>© 2026 {t.footer.copyright}</p>
          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px]">
            <span>BDT (৳) Currency</span>
            <span>Dhaka Atelier</span>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 text-[#D5BA80] hover:text-white transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Store Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Atelier Contact / Legal Info Modal */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setActiveInfoModal(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="relative w-full max-w-lg bg-[#121215] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="font-serif-luxury text-2xl text-[#F5F2EB] font-light">
                {activeInfoModal === 'contact'
                  ? language === 'en'
                    ? 'Dhaka Atelier & Concierge'
                    : 'ঢাকা আতেলিয়ে ও কনসিয়ার্জ'
                  : language === 'en'
                  ? 'Privacy, Terms & Exchange Policy'
                  : 'গোপনীয়তা, শর্তাবলী ও রিটার্ন নীতি'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#D8D3C9] hover:text-white cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeInfoModal === 'contact' ? (
              <div className="space-y-4 text-xs text-[#D8D3C9] leading-relaxed">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#B69A60] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#F5F2EB] mb-0.5">
                      {language === 'en' ? 'Flagship Studio' : 'ফ্ল্যাগশিপ স্টুডিও'}
                    </div>
                    <p className="text-[#9A9892]">{storeSettings.atelierAddress}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3">
                  <PhoneCall className="w-4 h-4 text-[#B69A60] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#F5F2EB] mb-0.5">
                      {language === 'en' ? 'Order & Bespoke Fitting Hotline' : 'অর্ডার ও ফিটিং হটলাইন'}
                    </div>
                    <a
                      href={storeSettings.hotlineTel}
                      className="font-mono text-[#D5BA80] hover:underline"
                    >
                      {storeSettings.hotlineDisplay}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-[#9A9892] leading-relaxed">
                <div className="flex items-start gap-2.5 text-[#D8D3C9]">
                  <ShieldCheck className="w-4 h-4 text-[#B69A60] shrink-0 mt-0.5" />
                  <p>
                    {language === 'en'
                      ? '7-Day Size Exchange: Unworn garments with original tags intact may be exchanged across Bangladesh via Pathao Courier.'
                      : '৭ দিনের সাইজ এক্সচেঞ্জ সুবিধা: ট্যাগ অক্ষুণ্ন থাকা সাপেক্ষে অব্যবহৃত পোশাক ৭ দিনের মধ্যে পরিবর্তনযোগ্য।'}
                  </p>
                </div>
                <p>
                  {language === 'en'
                    ? 'Customer delivery details and wishlist preferences are used strictly to fulfill orders and enhance your shopping experience.'
                    : 'গ্রাহকের ডেলিভারি তথ্য ও পছন্দসমূহ শুধুমাত্র অর্ডার সরবরাহ ও সেবার মান উন্নয়নে ব্যবহৃত হয়।'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
