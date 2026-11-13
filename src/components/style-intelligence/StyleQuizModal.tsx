import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { Sparkles, X, ArrowRight, RotateCcw, ShoppingBag, Check, Box } from 'lucide-react';
import { Language, CartItem } from '../../types';
import { THREE_PIECE_CATALOG, ThreePieceItem } from '../../data/threePieceCatalog';
import { FEATURED_PRODUCTS } from '../../data/mockData';

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
      questionEn: 'Which silhouette best captures your sartorial identity?',
      questionBn: 'কোন ধরনের পোশাক আপনার নিজস্ব স্টাইলকে সবচেয়ে ভালো প্রকাশ করে?',
      options: [
        { labelEn: 'Authentic 3-Piece & Festive Lawn Sets', labelBn: 'ঐতিহ্যবাহী থ্রি-পিস ও লন ড্রেস', tag: 'threepiece' },
        { labelEn: 'Contemporary Tailored Panjabi & Menswear', labelBn: 'আধুনিক টেইলর্ড পাঞ্জাবি ও ফরমাল', tag: 'panjabi' },
        { labelEn: 'Modern Jamdani Saree & Structural Couture', labelBn: 'মডার্ন জামদানি শাড়ি ও স্ট্রাকচারাল ব্লেজার', tag: 'couture' },
        { labelEn: 'Architectural Heavyweight Streetwear', labelBn: 'ভারী কটন হুডি ও স্ট্রিটওয়্যার', tag: 'streetwear' },
      ],
    },
    {
      id: 2,
      questionEn: 'For what moment are you curating this ensemble?',
      questionBn: 'কোন উপলক্ষ বা সময়ের জন্য পোশাক খুঁজছেন?',
      options: [
        { labelEn: 'Weddings & Festive Family Gatherings', labelBn: 'বিয়ে, উৎসব ও পারিবারিক আয়োজন', tag: 'festive' },
        { labelEn: 'Creative Studio & Everyday Elegance', labelBn: 'দৈনন্দিন অফিস, স্টুডিও ও আরামদায়ক ক্যাজুয়াল', tag: 'everyday' },
        { labelEn: 'Nocturnal Gala & Statement Evening', labelBn: 'রাতের আভিজাত্যপূর্ণ পার্টি বা গালা অনুষ্ঠান', tag: 'evening' },
        { labelEn: 'Weekend Leisure & Cultural Gatherings', labelBn: 'ছুটির দিন ও সাংস্কৃতিক অনুষ্ঠান', tag: 'relaxed' },
      ],
    },
    {
      id: 3,
      questionEn: 'What chromatic palette speaks to your mood?',
      questionBn: 'কোন রঙের আবহ আপনার ব্যক্তিত্বের সাথে মানানসই?',
      options: [
        { labelEn: 'Nocturnal Obsidian, Pitch Charcoal & Gold', labelBn: 'গভীর কালো, চারকোল ও এন্টিক গোল্ড', tag: 'dark' },
        { labelEn: 'Vivid Jewel Tones (Plum, Fuchsia & Cobalt)', labelBn: 'উজ্জ্বল রত্নসম রঙ (প্লাম, ফুশিয়া ও ব্লু)', tag: 'jewel' },
        { labelEn: 'Earth & Forest (Moss Green, Rust, Terracotta)', labelBn: 'মাটির রঙ ও বনসবুজ (সবুজ, রাস্ট ও ব্রাউন)', tag: 'earth' },
        { labelEn: 'Serene Neutrals (Stone Beige, Ivory & Dusty Mauve)', labelBn: 'শান্ত আইভরি, বেইজ ও ডাস্টি মভ', tag: 'neutral' },
      ],
    },
    {
      id: 4,
      questionEn: 'Which textile surface craftsmanship intrigues you most?',
      questionBn: 'পোশাকের কোন ধরনের বুনন ও কারুশিল্প আপনার পছন্দ?',
      options: [
        { labelEn: 'Hand-Dyed Wax Batik & Organic Crackle', labelBn: 'হাতে করা মোম বাটিক ও অর্গানিক ক্র্যাকল', tag: 'batik' },
        { labelEn: 'Reflective Mirror-Work & Diamond Trellis', labelBn: 'ঝলমলে কাঁচের কাজ ও জরি এমব্রয়ডারি', tag: 'mirror' },
        { labelEn: 'Silky Fine Swiss Lawn with Paisley Borders', labelBn: 'কোমল সুইস লন ও সূক্ষ্ম পেইসলি বর্ডার', tag: 'lawn' },
        { labelEn: '480 GSM Heavy French Terry & Combed Giza Cotton', labelBn: 'ভারী ৪৮০ জিএসএম কটন ও মার্সারাইজড কাপড়', tag: 'cotton' },
      ],
    },
    {
      id: 5,
      questionEn: 'What is your preferred ease of drape?',
      questionBn: 'পোশাকের ফিটিংস ও ড্র্যাপ কেমন পছন্দ করেন?',
      options: [
        { labelEn: 'Flowing & Layered with a Handcrafted Dupatta', labelBn: 'আরামদায়ক ও জমকালো ওড়নাযুক্ত ড্র্যাপ', tag: 'drape' },
        { labelEn: 'Tailored Architectural Fit (Crisp Collar & Cuffs)', labelBn: 'শার্প টেইলর্ড কাটিং ও নিখুঁত কলার', tag: 'tailored' },
        { labelEn: 'Unstitched Fabric Set to Custom-Tailor to Perfection', labelBn: 'নিজের মাপমতো বানানোর জন্য আনস্টিচড ফ্যাব্রিক', tag: 'unstitched' },
        { labelEn: 'Boxy Drop-Shoulder Oversized Silhouette', labelBn: 'বক্সি ড্রপ-শোল্ডার রিল্যাক্সড লুক', tag: 'oversized' },
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

  // Deterministic 3-product recommendation engine based on user answers
  const getCuratedResults = () => {
    const wardrobeChoice = selectedAnswers[0] || 'threepiece';
    const colorChoice = selectedAnswers[2] || 'jewel';
    const craftChoice = selectedAnswers[3] || 'batik';

    let curated: any[] = [];

    if (craftChoice === 'batik') {
      curated = [
        THREE_PIECE_CATALOG.find((p) => p.code === 'CAT-002') || THREE_PIECE_CATALOG[1],
        THREE_PIECE_CATALOG.find((p) => p.code === 'MB-BT-01') || THREE_PIECE_CATALOG[3],
        THREE_PIECE_CATALOG.find((p) => p.code === 'CAT-003') || THREE_PIECE_CATALOG[2],
      ];
    } else if (craftChoice === 'mirror') {
      curated = [
        THREE_PIECE_CATALOG.find((p) => p.code === 'FS-D01') || THREE_PIECE_CATALOG[13],
        THREE_PIECE_CATALOG.find((p) => p.code === 'FS-D02') || THREE_PIECE_CATALOG[14],
        THREE_PIECE_CATALOG.find((p) => p.code === 'FS-D04') || THREE_PIECE_CATALOG[16],
      ];
    } else if (wardrobeChoice === 'panjabi') {
      curated = [
        FEATURED_PRODUCTS[0], // Obsidian Tailored Panjabi
        THREE_PIECE_CATALOG.find((p) => p.code === 'ZSL-01') || THREE_PIECE_CATALOG[7],
        FEATURED_PRODUCTS[5], // Jamdani Relaxed Shirt
      ];
    } else if (wardrobeChoice === 'streetwear') {
      curated = [
        FEATURED_PRODUCTS[2], // Brutalist Hoodie
        FEATURED_PRODUCTS[4], // Essential Heavyweight Tee
        THREE_PIECE_CATALOG.find((p) => p.code === 'MB-BT-02') || THREE_PIECE_CATALOG[4],
      ];
    } else {
      // Swiss Lawn & Festive Palette
      if (colorChoice === 'dark') {
        curated = [
          THREE_PIECE_CATALOG.find((p) => p.code === 'ZSL-03') || THREE_PIECE_CATALOG[9],
          THREE_PIECE_CATALOG.find((p) => p.code === 'FS-D02') || THREE_PIECE_CATALOG[14],
          FEATURED_PRODUCTS[3], // Couture Tuxedo Blazer
        ];
      } else if (colorChoice === 'earth') {
        curated = [
          THREE_PIECE_CATALOG.find((p) => p.code === 'ZSL-04') || THREE_PIECE_CATALOG[10],
          THREE_PIECE_CATALOG.find((p) => p.code === 'MB-BT-01') || THREE_PIECE_CATALOG[3],
          THREE_PIECE_CATALOG.find((p) => p.code === 'ZSL-02') || THREE_PIECE_CATALOG[8],
        ];
      } else {
        curated = [
          THREE_PIECE_CATALOG.find((p) => p.code === 'CAT-001') || THREE_PIECE_CATALOG[0],
          THREE_PIECE_CATALOG.find((p) => p.code === 'FS-D03') || THREE_PIECE_CATALOG[15],
          THREE_PIECE_CATALOG.find((p) => p.code === 'ZSL-05') || THREE_PIECE_CATALOG[11],
        ];
      }
    }

    return curated;
  };

  const curatedProducts = getCuratedResults();

  const handleAddProduct = (item: any) => {
    onAddToCart({
      productId: item.id,
      nameEn: item.code ? `${item.code} — ${item.nameEn}` : item.nameEn,
      nameBn: item.code ? `${item.code} — ${item.nameBn}` : item.nameBn,
      priceBDT: item.priceBDT,
      image: item.flatLayImage || item.image,
      color: item.colors?.[0]?.name || 'Standard',
      size: item.code ? 'Unstitched Fabric Set' : 'M',
      quantity: 1,
    });
    setAddedItemIds((prev) => [...prev, item.id]);
  };

  const handleAddAllCurated = () => {
    curatedProducts.forEach((item) => {
      handleAddProduct(item);
    });
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
                  const imageSrc = item.flatLayImage || item.image;
                  const itemTitleEn = item.code ? `${item.code} — ${item.nameEn}` : item.nameEn;
                  const itemTitleBn = item.code ? `${item.code} — ${item.nameBn}` : item.nameBn;

                  return (
                    <div
                      key={item.id}
                      className="quiz-result-card bg-[#09090B] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between shadow-xl group hover:border-[#B69A60]/50 transition-all"
                    >
                      <div className="relative aspect-[4/3] bg-black/60 overflow-hidden">
                        <img
                          src={imageSrc}
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
                            {item.subCollection || item.collection || item.category}
                          </div>
                          <h5 className="font-serif-luxury text-base text-[#F5F2EB] group-hover:text-[#D5BA80] transition-colors font-medium mb-1 line-clamp-1">
                            {language === 'en' ? itemTitleEn : itemTitleBn}
                          </h5>
                          <p className="text-[11px] text-[#77777D] line-clamp-2 font-light mb-3">
                            {item.kameezEn || item.fabricEn || item.fabric}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="font-mono text-sm text-[#D5BA80] font-semibold tabular-nums">
                            ৳ {item.priceBDT.toLocaleString()}
                          </span>

                          <div className="flex items-center gap-2">
                            {item.code && onOpen3DStudio && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpen3DStudio(item);
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
