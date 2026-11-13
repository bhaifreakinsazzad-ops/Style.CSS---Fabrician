import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { Sparkles, X, ArrowRight, RotateCcw, ShoppingBag, Check, Box } from 'lucide-react';
import { Language, CartItem } from '../../types';
import { ThreePieceItem } from '../../data/threePieceCatalog';
import { useStoreData } from '../../context/StoreDataContext';

interface StyleQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onOpen3DStudio?: (item: ThreePieceItem) => void;
}

interface Question {
  id: number;
  questionEn: string;
  questionBn: string;
  options: {
    labelEn: string;
    labelBn: string;
    tag: string;
  }[];
}

export const StyleQuizModal: React.FC<StyleQuizModalProps> = ({
  isOpen,
  onClose,
  language,
  onAddToCart,
  onOpen3DStudio,
}) => {
  const { liveThreePieceItems, liveGraphicArchiveProducts } = useStoreData();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);

  const questions: Question[] = [
    {
      id: 1,
      questionEn: 'Which collab collection best captures your sartorial identity?',
      questionBn: 'কোন কালেকশন আপনার নিজস্ব স্টাইলকে সবচেয়ে ভালো প্রকাশ করে?',
      options: [
        { labelEn: "Fariza's Territory · Unstitched 3-Piece Sets", labelBn: 'ফারিজাস টেরিটরি · আনস্টিচড থ্রি-পিস', tag: 'threepiece' },
        { labelEn: 'StarKiT · Dhaka Heritage & City Hoodies', labelBn: 'স্টারকিট · ঢাকা হেরিটেজ ও সিটি হুডি', tag: 'heritage_hoodie' },
        { labelEn: 'StarKiT · Anime & Moto Graphic Streetwear', labelBn: 'স্টারকিট · অ্যানিমে ও মোটো গ্রাফিক স্ট্রিটওয়্যার', tag: 'streetwear' },
        { labelEn: "Fariza's Territory · Mirror-Work & Swiss Lawn", labelBn: 'ফারিজাস টেরিটরি · মিরর ওয়ার্ক ও সুইস লন', tag: 'mirror_lawn' },
      ],
    },
    {
      id: 2,
      questionEn: 'For what moment are you curating this ensemble?',
      questionBn: 'কোন উপলক্ষ বা সময়ের জন্য পোশাক খুঁজছেন?',
      options: [
        { labelEn: 'Festive Family Gatherings & Invitations', labelBn: 'উৎসব, দাওয়াত ও পারিবারিক আয়োজন', tag: 'festive' },
        { labelEn: 'Creative Studio & Everyday Comfort', labelBn: 'দৈনন্দিন অফিস, স্টুডিও ও আরামদায়ক ক্যাজুয়াল', tag: 'everyday' },
        { labelEn: 'Nocturnal City Drive & Evening Statement', labelBn: 'রাতের আড্ডা ও স্টেটমেন্ট ইভিনিং লুক', tag: 'evening' },
        { labelEn: 'Weekend Gallery & Cultural Hangouts', labelBn: 'ছুটির দিন ও সাংস্কৃতিক অনুষ্ঠান', tag: 'relaxed' },
      ],
    },
    {
      id: 3,
      questionEn: 'What chromatic palette speaks to your mood?',
      questionBn: 'কোন রঙের আবহ আপনার ব্যক্তিত্বের সাথে মানানসই?',
      options: [
        { labelEn: 'Nocturnal Obsidian, Maroon & Deep Charcoal', labelBn: 'গভীর কালো, মেরুন ও চারকোল', tag: 'dark' },
        { labelEn: 'Vivid Jewel Tones (Plum, Magenta & Cobalt)', labelBn: 'উজ্জ্বল রত্নসম রঙ (প্লাম, ম্যাজেন্টা ও ব্লু)', tag: 'jewel' },
        { labelEn: 'Earth, Chocolate Brown & Olive Moss', labelBn: 'মাটির রঙ, চকলেট ব্রাউন ও অলিভ', tag: 'earth' },
        { labelEn: 'Serene Neutrals (Natural Cream & Dusty Mauve)', labelBn: 'শান্ত ক্রিম, আইভরি ও ডাস্টি মভ', tag: 'neutral' },
      ],
    },
    {
      id: 4,
      questionEn: 'Which textile surface craftsmanship intrigues you most?',
      questionBn: 'পোশাকের কোন ধরনের বুনন ও কারুশিল্প আপনার পছন্দ?',
      options: [
        { labelEn: 'Hand-Dyed Wax Batik & Organic Crackle', labelBn: 'হাতে করা মোম বাটিক ও অর্গানিক ক্র্যাকল', tag: 'batik' },
        { labelEn: 'Reflective Mirror-Work & Diamond Trellis', labelBn: 'ঝলমলে মিরর ওয়ার্ক ও ডায়মন্ড এমব্রয়ডারি', tag: 'mirror' },
        { labelEn: 'Silky Fine Swiss Lawn with Paisley Borders', labelBn: 'কোমল সুইস লন ও সূক্ষ্ম পেইসলি বর্ডার', tag: 'lawn' },
        { labelEn: 'StarKiT 330–350 GSM One-Side Brushed Fleece', labelBn: 'স্টারকিট ৩৩০–৩৫০ জিএসএম ব্রাশড ফ্লিস', tag: 'fleece' },
      ],
    },
    {
      id: 5,
      questionEn: 'What is your preferred silhouette & ease of wear?',
      questionBn: 'পোশাকের ফিটিংস ও পরার ধরন কেমন পছন্দ করেন?',
      options: [
        { labelEn: 'Flowing 3-Piece Drape with Statement Dupatta', labelBn: 'আরামদায়ক ও জমকালো ওড়নাযুক্ত ড্র্যাপ', tag: 'drape' },
        { labelEn: 'Unstitched Set Tailored to Exact Measurements', labelBn: 'নিজের মাপমতো সেলাইযোগ্য আনস্টিচড থ্রি-পিস', tag: 'unstitched' },
        { labelEn: 'Contemporary Relaxed Fleece Hoodie Fit', labelBn: 'সমসাময়িক রিল্যাক্সড ফ্লিস হুডি ফিট', tag: 'relaxed_hoodie' },
        { labelEn: 'Boxy Drop-Shoulder Graphic Layering', labelBn: 'বক্সি ড্রপ-শোল্ডার গ্রাফিক লেয়ারিং', tag: 'oversized' },
      ],
    },
  ];

  // Anime.js Animate progress bar width on step change
  useEffect(() => {
    if (!progressLineRef.current) return;
    const progressPercent = ((currentStep + 1) / questions.length) * 100;
    animate(progressLineRef.current, {
      width: `${progressPercent}%`,
      duration: 350,
      ease: 'outQuad',
    });
  }, [currentStep, questions.length]);

  // Anime.js Animate curated products entrance when quiz completes
  useEffect(() => {
    if (isCompleted && cardContainerRef.current) {
      const cards = cardContainerRef.current.querySelectorAll('.quiz-result-card');
      animate(cards, {
        opacity: [0, 1],
        translateY: [35, 0],
        scale: [0.94, 1],
        delay: stagger(120, { start: 100 }),
        duration: 650,
        ease: 'outCubic',
      });
    }
  }, [isCompleted]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle question response
  const handleSelectOption = (tag: string) => {
    const nextAnswers = [...selectedAnswers, tag];
    setSelectedAnswers(nextAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed! Run brief intelligent analysis transition
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setIsCompleted(true);
      }, 700);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedAnswers([]);
    setIsAnalyzing(false);
    setIsCompleted(false);
  };

  interface CuratedQuizResult {
    id: string;
    nameEn: string;
    nameBn: string;
    priceBDT: number;
    image: string;
    subtitle: string;
    detailText: string;
    colorName: string;
    size: string;
    threePieceItem?: ThreePieceItem;
  }

  const toQuizThreePiece = (code: string, fallbackIndex: number): CuratedQuizResult => {
    const tp = liveThreePieceItems.find((p) => p.code === code) || liveThreePieceItems[fallbackIndex];
    return {
      id: tp.id,
      nameEn: `${tp.code} — ${tp.nameEn}`,
      nameBn: `${tp.code} — ${tp.nameBn}`,
      priceBDT: tp.priceBDT,
      image: tp.flatLayImage || tp.modelImage,
      subtitle: tp.subCollection,
      detailText: tp.kameezEn,
      colorName: tp.colors?.[0]?.name || 'Standard',
      size: 'Unstitched Set',
      threePieceItem: tp,
    };
  };

  const toQuizHoodie = (id: string): CuratedQuizResult => {
    const h = liveGraphicArchiveProducts.find((p) => p.id === id) || liveGraphicArchiveProducts[0];
    const v = h.variants[0];
    return {
      id: h.id,
      nameEn: `${h.name} Hoodie (${h.id})`,
      nameBn: `${h.name} হুডি (${h.id})`,
      priceBDT: h.basePrice,
      image: v.previewImage,
      subtitle: `StarKiT · ${h.category}`,
      detailText: `${v.fabric} · ${h.feature}`,
      colorName: v.color,
      size: 'L',
    };
  };

  // Deterministic 3-product recommendation engine based on authentic StarKiT & Fariza's Territory SKUs
  const getCuratedResults = (): CuratedQuizResult[] => {
    const wardrobeChoice = selectedAnswers[0] || 'threepiece';
    const colorChoice = selectedAnswers[2] || 'jewel';
    const craftChoice = selectedAnswers[3] || 'batik';

    if (wardrobeChoice === 'heritage_hoodie') {
      return [
        toQuizHoodie('FAB-H003'),
        toQuizHoodie('FAB-H007'),
        toQuizHoodie('FAB-H009'),
      ];
    }

    if (wardrobeChoice === 'streetwear' || craftChoice === 'fleece') {
      if (colorChoice === 'neutral') {
        return [
          toQuizHoodie('FAB-H001'),
          toQuizHoodie('FAB-H010'),
          toQuizHoodie('FAB-H006'),
        ];
      }
      return [
        toQuizHoodie('FAB-H002'),
        toQuizHoodie('FAB-H005'),
        toQuizHoodie('FAB-H004'),
      ];
    }

    if (craftChoice === 'batik') {
      return [
        toQuizThreePiece('CAT-002', 1),
        toQuizThreePiece('MB-BT-01', 3),
        toQuizThreePiece('CAT-003', 2),
      ];
    }

    if (craftChoice === 'mirror' || wardrobeChoice === 'mirror_lawn') {
      return [
        toQuizThreePiece('FS-D01', 13),
        toQuizThreePiece('FS-D02', 14),
        toQuizThreePiece('FS-D04', 16),
      ];
    }

    if (colorChoice === 'dark') {
      return [
        toQuizThreePiece('ZSL-03', 9),
        toQuizThreePiece('FS-D02', 14),
        toQuizHoodie('FAB-H008'),
      ];
    }

    if (colorChoice === 'earth') {
      return [
        toQuizThreePiece('ZSL-04', 10),
        toQuizThreePiece('MB-BT-01', 3),
        toQuizThreePiece('ZSL-02', 8),
      ];
    }

    return [
      toQuizThreePiece('CAT-001', 0),
      toQuizThreePiece('FS-D03', 15),
      toQuizThreePiece('ZSL-05', 11),
    ];
  };

  const curatedProducts = getCuratedResults();

  const handleAddProduct = (item: CuratedQuizResult) => {
    onAddToCart({
      productId: item.id,
      nameEn: item.nameEn,
      nameBn: item.nameBn,
      priceBDT: item.priceBDT,
      image: item.image,
      color: item.colorName,
      size: item.size,
      quantity: 1,
    });
    setAddedItemIds((prev) => [...prev, item.id]);
  };

  const handleAddAllCurated = () => {
    curatedProducts.forEach((item) => {
      handleAddProduct(item);
    });
    setTimeout(() => {
      onClose();
    }, 350);
  };

  const activeQuestion = questions[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-md" />

      {/* Modal Surface */}
      <div className="relative w-full max-w-3xl bg-[#171719] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#B69A60]" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D5BA80] block">
                FABRICIAN · STYLE AI
              </span>
              <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#F5F2EB] font-light">
                {language === 'en' ? 'Sartorial Discovery Engine' : 'স্টাইল ডিসকভারি কুইজ'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isCompleted && !isAnalyzing && (
              <span className="text-xs font-mono text-[#77777D] tabular-nums">
                Question {currentStep + 1} of {questions.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#D8D3C9] hover:text-white rounded-full bg-white/5 hover:bg-white/10 cursor-pointer"
              aria-label="Close Quiz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!isCompleted && (
          <div className="w-full bg-black/80 h-1">
            <div
              ref={progressLineRef}
              className="bg-[#B69A60] h-full transition-all"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        )}

        {/* Quiz Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Active Question View */}
          {!isCompleted && !isAnalyzing && activeQuestion && (
            <div>
              <div className="mb-6">
                <span className="text-xs font-mono text-[#B69A60] uppercase tracking-wider block mb-2">
                  0{activeQuestion.id} · Step {activeQuestion.id}
                </span>
                <h4 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F2EB] font-light leading-snug">
                  {language === 'en' ? activeQuestion.questionEn : activeQuestion.questionBn}
                </h4>
              </div>

              {/* Options Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                {activeQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt.tag)}
                    className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#B69A60] hover:bg-white/5 text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#77777D] group-hover:text-[#D5BA80]">
                        0{idx + 1}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#77777D] group-hover:text-[#D5BA80] group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="font-medium text-sm text-[#F5F2EB] group-hover:text-[#D5BA80] transition-colors">
                      {language === 'en' ? opt.labelEn : opt.labelBn}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Analyzing State */}
          {isAnalyzing && (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#B69A60] border-t-transparent animate-spin mb-6" />
              <h4 className="font-serif-luxury text-2xl text-[#F5F2EB] font-light mb-2">
                Harmonizing Style Blueprint
              </h4>
              <p className="text-xs text-[#77777D] font-mono">
                Matching silhouette, Bangladeshi fabric weave, and color resonance...
              </p>
            </div>
          )}

          {/* Results View: 3 Curated Products with Anime.js Animation */}
          {isCompleted && (
            <div ref={cardContainerRef}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono text-[#B69A60] uppercase tracking-widest block mb-1">
                    Your Curated Wardrobe
                  </span>
                  <h4 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F2EB] font-light">
                    {language === 'en' ? '3 Tailored Pieces for Your Presence' : 'আপনার জন্য নির্বাচিত ৩টি বিশেষ পোশাক'}
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-[#D8D3C9] hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>

                  <button
                    onClick={handleAddAllCurated}
                    className="px-4 py-1.5 rounded bg-[#B69A60] text-[#09090B] font-semibold text-xs uppercase tracking-wider hover:bg-[#D5BA80] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add All 3 to Bag</span>
                  </button>
                </div>
              </div>

              {/* 3 Curated Product Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {curatedProducts.map((item, idx) => {
                  const isAdded = addedItemIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className="quiz-result-card bg-[#09090B] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between shadow-xl group hover:border-[#B69A60]/50 transition-all"
                    >
                      <div className="relative aspect-[4/3] bg-black/60 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.nameEn}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-mono font-bold text-[#09090B] bg-[#D5BA80] px-2 py-0.5 rounded shadow">
                            Pick 0{idx + 1}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-mono text-[#77777D] uppercase tracking-wider mb-1 truncate">
                            {item.subtitle}
                          </div>
                          <h5 className="font-serif-luxury text-base text-[#F5F2EB] group-hover:text-[#D5BA80] transition-colors font-medium mb-1 line-clamp-1">
                            {language === 'en' ? item.nameEn : item.nameBn}
                          </h5>
                          <p className="text-[11px] text-[#77777D] line-clamp-2 font-light mb-3">
                            {item.detailText}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="font-mono text-sm text-[#D5BA80] font-semibold tabular-nums">
                            ৳ {item.priceBDT.toLocaleString()}
                          </span>

                          <div className="flex items-center gap-2">
                            {item.threePieceItem && onOpen3DStudio && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpen3DStudio(item.threePieceItem!);
                                }}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-[#D8D3C9] rounded"
                                title="Inspect in 3D"
                              >
                                <Box className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleAddProduct(item)}
                              disabled={isAdded}
                              className={`py-1.5 px-3 rounded text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ${
                                isAdded
                                  ? 'bg-[#B69A60] text-[#09090B]'
                                  : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80]'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>Bag</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
