import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { Language } from '../../types';
import {
  trackPathaoOrder,
  PathaoTrackingData,
  PathaoDeliveryStatus,
} from '../../services/pathaoCourier';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialOrderId?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  language,
  initialOrderId = 'FAB-2026',
}) => {
  const [orderQuery, setOrderQuery] = useState(initialOrderId);
  const [trackingData, setTrackingData] = useState<PathaoTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedConsignment, setCopiedConsignment] = useState(false);

  const handleTrack = async (idToSearch?: string) => {
    const query = (idToSearch || orderQuery).trim();
    if (!query) {
      setErrorMessage(
        language === 'en' ? 'Please enter a valid Order ID' : 'অনুগ্রহ করে সঠিক অর্ডার আইডি লিখুন'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await trackPathaoOrder(query);
      setTrackingData(data);
    } catch {
      setErrorMessage(
        language === 'en'
          ? 'Unable to retrieve Pathao tracking status. Please verify the ID or try again.'
          : 'পাঠাও ট্র্যাকিং তথ্য পাওয়া যায়নি। অনুগ্রহ করে আইডি যাচাই করুন।'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const targetId = initialOrderId || 'FAB-2026';
      setOrderQuery(targetId);
      handleTrack(targetId);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, initialOrderId, onClose]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedConsignment(true);
    setTimeout(() => setCopiedConsignment(false), 2000);
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: PathaoDeliveryStatus) => {
    switch (status) {
      case 'Out_for_Delivery':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          label: language === 'en' ? 'Out for Delivery (Doorstep)' : 'ডেলিভারির জন্য বের হয়েছে',
        };
      case 'In_Transit':
        return {
          bg: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
          dot: 'bg-blue-400',
          label: language === 'en' ? 'In Transit to Hub' : 'হাবের পথে ট্রানজিটে রয়েছে',
        };
      case 'Delivered':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          label: language === 'en' ? 'Delivered & Completed' : 'সফলভাবে ডেলিভারি সম্পন্ন',
        };
      case 'Picked':
        return {
          bg: 'bg-purple-500/15 border-purple-500/40 text-purple-300',
          dot: 'bg-purple-400',
          label: language === 'en' ? 'Picked from Atelier' : 'আতেলিয়ে থেকে পিকড আপ',
        };
      default:
        return {
          bg: 'bg-zinc-500/15 border-zinc-500/40 text-zinc-300',
          dot: 'bg-zinc-400',
          label: language === 'en' ? 'Order Registered' : 'অর্ডার নিবন্ধিত হয়েছে',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      <div className="relative w-full max-w-3xl bg-[#121215] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/Untitled_design_a468bd14.png"
              alt="Fabrician Emblem"
              className="w-11 h-11 object-contain drop-shadow shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#F5F2EB] font-light">
                  {language === 'en'
                    ? 'Track Your Fabrician Consignment'
                    : 'অর্ডার ডেলিভারি ট্র্যাক করুন'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-red-600/20 text-red-300 border border-red-500/30">
                  Pathao Courier
                </span>
              </div>
              <p className="text-xs text-[#77777D] mt-0.5 font-mono">
                {language === 'en'
                  ? 'Doorstep courier tracking across 64 districts in Bangladesh'
                  : 'সারাদেশের ৬৪ জেলায় কুরিয়ার ডেলিভারি ট্র্যাকিং'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#D8D3C9] hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Order Search Bar */}
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrack();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Enter Order ID (e.g. FAB-2026, CAT-001)'
                      : 'অর্ডার আইডি দিন (যেমন: FAB-2026)'
                  }
                  className="w-full bg-black/60 border border-white/15 focus:border-[#B69A60] rounded-xl px-4 py-3 text-sm text-[#F5F2EB] font-mono placeholder:text-[#77777D] focus:outline-none transition-colors"
                />
                {orderQuery && (
                  <button
                    type="button"
                    onClick={() => setOrderQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77777D] hover:text-white p-1"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B] font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === 'en' ? 'Scanning...' : 'স্ক্যান হচ্ছে...'}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{language === 'en' ? 'Track' : 'খুঁজুন'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Sample Order Quick Lookup */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
              <span className="text-[#77777D] font-mono text-[11px]">
                {language === 'en' ? 'Sample orders:' : 'নমুনা অর্ডার:'}
              </span>
              {[
                { id: 'FAB-2026', label: 'FAB-2026 (Out for Delivery)' },
                { id: 'CAT-001', label: 'CAT-001 (In Transit - CTG)' },
                { id: 'FAB-8921', label: 'FAB-8921 (Delivered)' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setOrderQuery(chip.id);
                    handleTrack(chip.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
                    orderQuery.toUpperCase() === chip.id
                      ? 'bg-[#B69A60]/20 text-[#D5BA80] border border-[#B69A60]/50 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-[#D8D3C9] border border-white/5'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tracking Result Card */}
          {trackingData && (
            <div className="space-y-6">
              {(() => {
                const badge = getStatusBadge(trackingData.currentStatus);
                return (
                  <div className="p-4 sm:p-5 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold border flex items-center gap-1.5 ${badge.bg}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                        <span className="text-xs text-[#77777D] font-mono">
                          {trackingData.estimatedDelivery}
                        </span>
                      </div>
                      <h4 className="text-base text-[#F5F2EB] font-serif-luxury">
                        Order #{trackingData.orderId}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs text-[#D8D3C9]">
                      <span className="text-[#77777D]">Consignment:</span>
                      <span className="text-[#D5BA80] font-semibold">
                        {trackingData.consignmentId}
                      </span>
                      <button
                        onClick={() => copyToClipboard(trackingData.consignmentId)}
                        className="p-1 text-[#77777D] hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                        title="Copy Consignment ID"
                        aria-label="Copy Consignment ID"
                      >
                        {copiedConsignment ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Delivery & Rider Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#B69A60] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Destination & Hub' : 'গন্তব্য ও হাব'}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-[#F5F2EB] font-medium">{trackingData.recipientName}</p>
                    <p className="text-[#77777D]">{trackingData.recipientAddress}</p>
                    <p className="text-[#D8D3C9] font-mono pt-1">
                      <span className="text-[#77777D]">Assigned Hub: </span>
                      {trackingData.hubLocation}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#B69A60] uppercase tracking-wider">
                    <User className="w-3.5 h-3.5" />
                    <span>
                      {language === 'en' ? 'Courier Rider & Payment' : 'ডেলিভারি রাইডার ও পেমেন্ট'}
                    </span>
                  </div>
                  <div className="text-xs space-y-1.5">
                    {trackingData.riderName ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#F5F2EB] font-medium">{trackingData.riderName}</p>
                          <p className="text-[#77777D] text-[11px]">
                            Authorized Pathao Courier Hero
                          </p>
                        </div>
                        {trackingData.riderPhone && (
                          <a
                            href={`tel:${trackingData.riderPhone}`}
                            className="px-2.5 py-1 rounded bg-[#B69A60]/15 hover:bg-[#B69A60]/30 text-[#D5BA80] font-mono text-[11px] flex items-center gap-1.5 border border-[#B69A60]/40 transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call Rider</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-[#77777D]">
                        {language === 'en'
                          ? 'Assigned during Last-Mile Hub dispatch'
                          : 'ডেলিভারি হাব থেকে রাইডার নির্ধারিত হবে'}
                      </p>
                    )}

                    <div className="pt-1 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[#77777D]">{trackingData.paymentType}</span>
                      <span className="font-mono font-bold text-[#D5BA80] tabular-nums">
                        {trackingData.amountToCollectBDT > 0
                          ? `৳ ${trackingData.amountToCollectBDT.toLocaleString()} due`
                          : 'Prepaid (৳ 0 due)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pathao Tracking Timeline */}
              <div className="p-5 rounded-xl bg-black/40 border border-white/10">
                <h5 className="text-xs uppercase tracking-[0.2em] font-mono text-[#D5BA80] mb-4 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#B69A60]" />
                  <span>{language === 'en' ? 'Consignment Checkpoints' : 'ট্র্যাকিং টাইমলাইন'}</span>
                </h5>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                  {trackingData.timeline.map((event, idx) => (
                    <div key={idx} className="relative group">
                      <span
                        className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 transition-all ${
                          idx === 0
                            ? 'bg-[#B69A60] border-white ring-4 ring-[#B69A60]/20'
                            : 'bg-[#171719] border-white/40'
                        }`}
                      />

                      <div>
                        <div className="flex flex-wrap items-baseline gap-2 mb-0.5">
                          <span
                            className={`text-xs font-semibold ${
                              idx === 0 ? 'text-[#F5F2EB]' : 'text-[#D8D3C9]'
                            }`}
                          >
                            {event.status}
                          </span>
                          <span className="text-[11px] font-mono text-[#77777D]">{event.time}</span>
                        </div>
                        <p className="text-xs text-[#B69A60] font-mono mb-0.5">
                          {event.location}
                        </p>
                        {event.note && (
                          <p className="text-xs text-[#77777D] font-light">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs text-[#77777D]">
          <span className="font-mono text-[11px]">
            {language === 'en'
              ? 'Concierge Hotline: +880 1778 307704'
              : 'সহায়তা হটলাইন: +৮৮০ ১৭৭৮ ৩০৭৭০৪'}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#F5F2EB] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            {language === 'en' ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
