import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, WifiOff, X, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Language } from '../../types';

interface PWAInstallButtonProps {
  language: Language;
  variant?: 'compact' | 'drawer';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language,
  variant = 'compact',
  className = '',
}) => {
  const { canPromptInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    if (!showGuideModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGuideModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showGuideModal]);

  if (isInstalled && !justInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (canPromptInstall) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
        return;
      }
      if (outcome === 'dismissed') {
        return;
      }
    }
    setShowGuideModal(true);
  };

  const buttonLabel =
    language === 'en'
      ? justInstalled
        ? 'App Installed'
        : variant === 'compact'
        ? 'Get App'
        : 'Install FABRICIAN App'
      : justInstalled
      ? 'ইনস্টল সম্পন্ন'
      : variant === 'compact'
      ? 'অ্যাপ'
      : 'অ্যাপ ইনস্টল করুন';

  return (
    <>
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#D5BA80] hover:text-[#09090B] hover:bg-[#D5BA80] border border-[#B69A60]/40 rounded transition-colors cursor-pointer whitespace-nowrap ${className}`}
          title={
            language === 'en'
              ? 'Install FABRICIAN Web App on your device'
              : 'ডিভাইসে ফ্যাব্রিশিয়ান অ্যাপ ইনস্টল করুন'
          }
          aria-label="Install App"
        >
          {justInstalled ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span className="hidden xl:inline tracking-wider">{buttonLabel}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full p-3.5 rounded-xl bg-gradient-to-r from-[#B69A60]/18 to-[#171719] border border-[#B69A60]/45 hover:border-[#B69A60] text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#09090B] border border-[#B69A60]/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-[#D5BA80]" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#F5F2EB]">
                {buttonLabel}
              </div>
              <div className="text-[11px] font-mono text-[#B69A60]">
                {language === 'en'
                  ? 'Offline catalog & instant launch'
                  : 'অফলাইন ক্যাটালগ ও দ্রুত অ্যাক্সেস'}
              </div>
            </div>
          </div>
          <Download className="w-4 h-4 text-[#D5BA80] shrink-0" />
        </button>
      )}

      <AnimatePresence>
        {showGuideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85"
            onClick={() => setShowGuideModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#11141C] border border-[#B69A60]/40 rounded-2xl p-6 shadow-2xl text-[#F5F2EB]"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/pwa-192x192.png"
                    alt="FABRICIAN App Icon"
                    className="w-11 h-11 rounded-xl border border-[#B69A60]/40 object-cover"
                  />
                  <div>
                    <h3 className="font-serif-luxury text-xl text-[#F5F2EB] font-light">
                      {language === 'en' ? 'Install FABRICIAN App' : 'ফ্যাব্রিশিয়ান অ্যাপ ইনস্টল'}
                    </h3>
                    <p className="text-[11px] font-mono text-[#D5BA80]">
                      Progressive Web Application
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="p-1.5 rounded-lg text-[#9A9892] hover:text-white hover:bg-white/5 cursor-pointer"
                  aria-label="Close install instructions"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIOS ? (
                <div className="space-y-3 text-xs text-[#D8D3C9] leading-relaxed">
                  <p>
                    {language === 'en'
                      ? 'Add FABRICIAN directly to your iPhone or iPad Home Screen for full-screen atelier browsing:'
                      : 'আপনার আইফোন বা আইপ্যাডের হোম স্ক্রিনে ফ্যাব্রিশিয়ান যুক্ত করুন:'}
                  </p>
                  <ol className="space-y-2.5 bg-[#09090B] border border-white/10 rounded-xl p-4 font-mono text-[11px]">
                    <li className="flex items-center gap-2.5">
                      <Share className="w-4 h-4 text-[#D5BA80] shrink-0" />
                      <span>
                        1. {language === 'en' ? 'Tap the Share icon in Safari' : 'সাফারিতে Share আইকনে ট্যাপ করুন'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <PlusSquare className="w-4 h-4 text-[#D5BA80] shrink-0" />
                      <span>
                        2. {language === 'en' ? 'Select "Add to Home Screen"' : '"Add to Home Screen" সিলেক্ট করুন'}
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-[#D8D3C9] leading-relaxed">
                  <p>
                    {language === 'en'
                      ? 'Install FABRICIAN directly from your browser address bar or menu for native app speed and offline catalog browsing:'
                      : 'দ্রুত ব্রাউজিং ও অফলাইন অ্যাক্সেসের জন্য ব্রাউজার মেনু থেকে অ্যাপটি ইনস্টল করুন:'}
                  </p>
                  <div className="bg-[#09090B] border border-white/10 rounded-xl p-4 font-mono text-[11px] space-y-1.5 text-[#D5BA80]">
                    <div>Chrome / Edge: Address Bar → Install icon</div>
                    <div>Android Chrome: Menu (⋮) → Install app</div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="mt-5 w-full py-2.5 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] font-semibold text-xs uppercase tracking-widest cursor-pointer transition-colors"
              >
                {language === 'en' ? 'Got It' : 'বুঝেছি'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MOBILE_BANNER_DISMISS_KEY = 'fabrician_mobile_pwa_banner_dismissed';

export const MobilePWAInstallPrompt: React.FC<{ language: Language }> = ({ language }) => {
  const { canPromptInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(MOBILE_BANNER_DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || dismissed || (!canPromptInstall && !isIOS)) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(MOBILE_BANNER_DISMISS_KEY, '1');
    } catch {
      // ignore storage errors
    }
  };

  const handleAction = async () => {
    if (canPromptInstall) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        handleDismiss();
        return;
      }
    }
    if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40">
        <div className="bg-[#11141C]/95 backdrop-blur-md border border-[#B69A60]/45 rounded-xl p-3 shadow-2xl flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/pwa-192x192.png"
              alt="FABRICIAN App"
              className="w-9 h-9 rounded-lg border border-[#B69A60]/40 shrink-0 object-cover"
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#F5F2EB] truncate">
                {language === 'en' ? 'Install FABRICIAN App' : 'ফ্যাব্রিশিয়ান অ্যাপ ইনস্টল'}
              </div>
              <div className="text-[10px] font-mono text-[#D5BA80] truncate">
                {isIOS
                  ? language === 'en'
                    ? 'Add to iPhone Home Screen'
                    : 'হোম স্ক্রিনে যুক্ত করুন'
                  : language === 'en'
                  ? 'Fast app launch · Offline ready'
                  : 'দ্রুত ও অফলাইন ব্রাউজিং'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleAction}
              className="px-3 py-1.5 rounded-lg bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B] text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              {language === 'en' ? 'Install' : 'ইনস্টল'}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 text-[#9A9892] hover:text-white cursor-pointer"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85"
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#11141C] border border-[#B69A60]/40 rounded-2xl p-5 shadow-2xl text-[#F5F2EB]"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif-luxury text-lg text-[#F5F2EB]">
                  {language === 'en' ? 'Add to Home Screen' : 'হোম স্ক্রিনে যুক্ত করুন'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-[#9A9892] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="space-y-2.5 bg-[#09090B] border border-white/10 rounded-xl p-3.5 font-mono text-[11px] text-[#D8D3C9]">
                <li className="flex items-center gap-2.5">
                  <Share className="w-4 h-4 text-[#D5BA80] shrink-0" />
                  <span>
                    1. {language === 'en' ? 'Tap Share in Safari toolbar' : 'সাফারির Share বাটনে ট্যাপ করুন'}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <PlusSquare className="w-4 h-4 text-[#D5BA80] shrink-0" />
                  <span>
                    2. {language === 'en' ? 'Tap "Add to Home Screen"' : '"Add to Home Screen" ট্যাপ করুন'}
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2 rounded-lg bg-[#F5F2EB] text-[#09090B] text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                {language === 'en' ? 'Done' : 'সম্পন্ন'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const OfflineIndicator: React.FC<{ language: Language }> = ({ language }) => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 left-4 z-[60] flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#11141C] border border-[#B69A60]/45 text-xs font-mono text-[#D5BA80] shadow-xl"
          role="status"
        >
          <WifiOff className="w-3.5 h-3.5 text-[#B69A60] shrink-0" />
          <span>
            {language === 'en'
              ? 'Offline mode · Viewing cached catalog'
              : 'অফলাইন মোড · সংরক্ষিত ক্যাটালগ দেখানো হচ্ছে'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
