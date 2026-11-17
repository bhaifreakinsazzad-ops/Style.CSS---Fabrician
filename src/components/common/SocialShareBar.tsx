import React, { useState, useEffect } from 'react';
import { Check, Link2, MessageCircle, Share2 } from 'lucide-react';
import { Language } from '../../types';
import { buildFacebookShareHref, buildWhatsAppShareHref } from '../../utils/shareUrl';

export type SocialShareChannel = 'whatsapp' | 'facebook' | 'copy' | 'native';
export type SocialShareTheme = 'dark-gold' | 'starkit-light' | 'starkit-dark' | 'fariza-light';

interface SocialShareBarProps {
  url: string;
  title: string;
  description?: string;
  language: Language;
  theme?: SocialShareTheme;
  compact?: boolean;
  onShare?: (channel: SocialShareChannel) => void;
}

const FacebookMark: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M13.5 22v-8.2h2.75l.41-3.2H13.5V8.56c0-.93.26-1.56 1.59-1.56h1.7V4.14c-.3-.04-1.31-.13-2.48-.13-2.46 0-4.14 1.5-4.14 4.25v2.34H7.4v3.2h2.77V22h3.33z" />
  </svg>
);

const THEME_STYLES: Record<
  SocialShareTheme,
  {
    wrapper: string;
    label: string;
    button: string;
    copiedButton: string;
  }
> = {
  'dark-gold': {
    wrapper: 'bg-white/[0.03] border border-white/10 rounded-xl p-2.5',
    label: 'text-[#9A9892]',
    button:
      'bg-white/[0.06] hover:bg-[#B69A60] border border-white/15 hover:border-[#B69A60] text-[#D8D3C9] hover:text-[#09090B]',
    copiedButton: 'bg-[#B69A60] border-[#B69A60] text-[#09090B]',
  },
  'starkit-light': {
    wrapper: 'bg-[#ECEAEA]/70 border border-[#170000]/15 rounded-xl p-2.5',
    label: 'text-[#524B4B]',
    button:
      'bg-white hover:bg-[#170000] border border-[#170000]/25 hover:border-[#170000] text-[#170000] hover:text-white',
    copiedButton: 'bg-[#170000] border-[#170000] text-white',
  },
  'starkit-dark': {
    wrapper: 'bg-white/[0.05] border border-white/15 rounded-xl p-2.5',
    label: 'text-[#C7C1BF]',
    button:
      'bg-white/10 hover:bg-white border border-white/20 text-white hover:text-[#170000]',
    copiedButton: 'bg-white border-white text-[#170000]',
  },
  'fariza-light': {
    wrapper: 'bg-[#F0F2F5] border border-[#050505]/12 rounded-xl p-2.5',
    label: 'text-[#4B5563]',
    button:
      'bg-white hover:bg-[#0866FF] border border-[#050505]/15 hover:border-[#0866FF] text-[#050505] hover:text-white',
    copiedButton: 'bg-[#31A24C] border-[#31A24C] text-white',
  },
};

export const SocialShareBar: React.FC<SocialShareBarProps> = ({
  url,
  title,
  description,
  language,
  theme = 'dark-gold',
  compact = false,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    );
  }, []);

  const styles = THEME_STYLES[theme];
  const whatsappHref = buildWhatsAppShareHref(title, url, description);
  const facebookHref = buildFacebookShareHref(
    url,
    description ? `${title} — ${description}` : title
  );

  const handleCopyLink = async () => {
    let success = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        success = true;
      }
    } catch {
      success = false;
    }

    if (!success && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      onShare?.('copy');
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return;
    try {
      await navigator.share({
        title,
        text: description || title,
        url,
      });
      onShare?.('native');
    } catch {
      // User dismissed share sheet; ignore silently
    }
  };

  return (
    <div className={styles.wrapper} aria-label={language === 'en' ? 'Share product' : 'শেয়ার করুন'}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`text-[10px] font-mono uppercase tracking-[0.16em] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${styles.label}`}
        >
          <Share2 className="w-3 h-3" />
          <span>{language === 'en' ? 'Share Piece' : 'শেয়ার করুন'}</span>
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShare?.('whatsapp')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${styles.button}`}
            aria-label={language === 'en' ? 'Share on WhatsApp' : 'হোয়াটসঅ্যাপে শেয়ার করুন'}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'WhatsApp' : 'হোয়াটসঅ্যাপ'}</span>
          </a>

          <a
            href={facebookHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShare?.('facebook')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${styles.button}`}
            aria-label={language === 'en' ? 'Share on Facebook' : 'ফেসবুকে শেয়ার করুন'}
          >
            <FacebookMark className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Facebook' : 'ফেসবুক'}</span>
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              copied ? styles.copiedButton : styles.button
            }`}
            aria-label={language === 'en' ? 'Copy product link' : 'লিঙ্ক কপি করুন'}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
            <span>
              {copied
                ? language === 'en'
                  ? 'Copied'
                  : 'কপি হয়েছে'
                : compact
                ? language === 'en'
                  ? 'Copy'
                  : 'কপি'
                : language === 'en'
                ? 'Copy Link'
                : 'লিঙ্ক কপি'}
            </span>
          </button>

          {canNativeShare && !compact && (
            <button
              type="button"
              onClick={handleNativeShare}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${styles.button}`}
              aria-label={language === 'en' ? 'Share via device' : 'অন্যান্য মাধ্যমে শেয়ার'}
            >
              <Share2 className="w-3 h-3" />
              <span>{language === 'en' ? 'More' : 'আরও'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
