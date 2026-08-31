import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Pause,
  Play,
  ShieldCheck,
  MapPin,
  Video,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Megaphone,
  ExternalLink,
  X,
  Phone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PublicAdvertisement } from '../../types';

interface CarouselItem {
  id: string | number;
  title: string;
  subtitle: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  tag: string;
  badge: string;
  location: string;
  ctaText: string;
  isSuperAdminAd?: boolean;
  contact?: string;
  linkUrl?: string;
  originalAd?: PublicAdvertisement;
}

const defaultSlides: CarouselItem[] = [
  {
    id: 'default-1',
    title: 'Mfumo wa Kidigitali wa VICOBA na SACCOS Zanzibar',
    subtitle: 'Boresha usimamizi wa akiba, hisa na mikopo kwa vikundi vya ushirika Unguja na Pemba kwa Mfumo wa Kisasa wa Kidigitali.',
    mediaUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
    mediaType: 'image',
    tag: 'Zanzibar Digital Transformation',
    badge: 'Unguja & Pemba VICOBA',
    location: 'Stone Town & Zanzibar Regions',
    ctaText: 'Anza Kutumia Bure na uhakika Sasa'
  },
  {
    id: 'default-2',
    title: 'Fursa ya Mikopo ya Uchumi wa Buluu (Blue Economy)',
    subtitle: 'Mikopo na ruzuku za uwezeshaji kwa Vikoba vya Wakulima wa Mwani, Wavuvi, na Wajasiriamali Wanawake wa Zanzibar.',
    mediaUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
    mediaType: 'image',
    tag: 'Blue Economy Zanzibar 2026',
    badge: 'Mikopo na Ruzuku',
    location: 'Paje, Jambiani, Nungwi & Mkoani',
    ctaText: 'Tazama Fursa za Mikopo'
  },
  {
    id: 'default-3',
    title: 'Malipo ya Papo hapo via M-Pesa, Mixx & PBZ Bank',
    subtitle: 'Weka akiba, nunua hisa na rejesha mikopo kwa njia salama ya simu kupitia M-Pesa, Airtel Money, Mixx au Benki ya PBZ.',
    mediaUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef08018e?w=1200&auto=format&fit=crop&q=80',
    mediaType: 'image',
    tag: 'Seamless Integration',
    badge: 'PBZ & Mobile Money',
    location: 'Tanzania & Zanzibar Interoperability',
    ctaText: 'Jaribu Mfumo wa Malipo'
  },
  {
    id: 'default-4',
    title: 'Semina na Mafunzo ya Uhasibu ya VICOBA Zanzibar',
    subtitle: 'Programu maalum ya mafunzo ya vitabu vya fedha, ugawaji wa gawio (dividends) na utawala bora wa Ushirika.',
    mediaUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
    mediaType: 'image',
    tag: 'Uwezeshaji wa Vikundi',
    badge: 'Mafunzo ya Bure',
    location: 'Chake Chake, Wete, Mkoani & Urban West',
    ctaText: 'Sajili Kikundi Chako'
  }
];

interface HeroCarouselProps {
  onStartRegistration: () => void;
  onOpenDemo: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onStartRegistration, onOpenDemo }) => {
  const { publicAds } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedVideoModal, setSelectedVideoModal] = useState<CarouselItem | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Convert active publicAds (images & videos set by SuperAdmin) into Carousel Slides
  const activeAdSlides: CarouselItem[] = publicAds
    .filter(ad => ad.active)
    .map(ad => ({
      id: ad.id,
      title: ad.title,
      subtitle: ad.summary || ad.description.slice(0, 160) + '...',
      mediaUrl: ad.mediaUrl,
      mediaType: ad.mediaType || 'image',
      tag: ad.category || 'Tangazo Rasmi',
      badge: ad.badge || (ad.mediaType === 'video' ? 'Video ya Tangazo' : 'Tangazo Rasmi'),
      location: ad.location || 'Zanzibar & Tanzania',
      ctaText: ad.mediaType === 'video' ? 'Tazama Video Kamili' : 'Soma Tangazo Kamili',
      isSuperAdminAd: true,
      contact: ad.contact,
      linkUrl: ad.linkUrl,
      originalAd: ad
    }));

  // Combine default system slides + SuperAdmin advertisements so they all stay visible in rotation permanently
  const allSlides: CarouselItem[] = activeAdSlides.length > 0
    ? [...activeAdSlides, ...defaultSlides]
    : defaultSlides;

  // Ensure currentIndex stays within bounds if slides list changes
  useEffect(() => {
    if (currentIndex >= allSlides.length) {
      setCurrentIndex(0);
    }
  }, [allSlides.length, currentIndex]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPlaying, allSlides.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allSlides.length) % allSlides.length);
  };

  const currentSlide = allSlides[currentIndex] || allSlides[0] || defaultSlides[0];

  const handleSlideCta = () => {
    if (currentSlide.isSuperAdminAd && currentSlide.mediaType === 'video') {
      setSelectedVideoModal(currentSlide);
    } else if (currentSlide.isSuperAdminAd) {
      // Scroll to announcements section smoothly
      const el = document.getElementById('zanzibar-vicoba-announcements');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onStartRegistration();
      }
    } else {
      onStartRegistration();
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-slate-900 shadow-[0_25px_60px_-20px_rgba(15,23,42,0.8)]">
      {/* Background Media Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-[620px] flex items-center justify-between overflow-hidden"
        >
          {/* Background Video or Image */}
          {currentSlide.mediaType === 'video' ? (
            <div className="absolute inset-0 w-full h-full bg-slate-950">
              <video
                ref={videoRef}
                key={currentSlide.mediaUrl}
                src={currentSlide.mediaUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          ) : (
            <img
              src={currentSlide.mediaUrl}
              alt={currentSlide.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80";
              }}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 scale-105"
            />
          )}

          {/* Multi-layered dark & teal gradient overlay for pristine legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-teal-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />

          {/* Slide Text Content */}
          <div className="relative z-10 max-w-2xl px-4 sm:px-6 lg:px-14 py-6 sm:py-10 lg:py-12 text-white space-y-4 sm:space-y-6">
             
            {/* Badges & Media Type Tag */}
            <div className="flex flex-wrap items-center gap-2">
              {currentSlide.isSuperAdminAd && (
                <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-white text-xs font-black flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                  <Megaphone className="w-3.5 h-3.5 text-amber-300" />
                  TANGAZO RASMI
                </span>
              )}

              {currentSlide.mediaType === 'video' ? (
                <span className="px-3 py-1 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                  <Video className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  VIDEO TANGAZO
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {currentSlide.badge}
                </span>
              )}

              <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                {currentSlide.location}
              </span>
            </div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-[1.8rem] leading-[1.1] sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md"
            >
              {currentSlide.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl font-light"
            >
              {currentSlide.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="pt-1 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3"
            >
              <button
                onClick={handleSlideCta}
                className="w-full sm:w-auto px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-xs sm:text-sm transition-transform active:scale-95"
              >
                {currentSlide.mediaType === 'video' ? (
                  <Play className="w-4 h-4 fill-current" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{currentSlide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenDemo}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-600/80 font-bold rounded-2xl backdrop-blur-md flex items-center justify-center gap-2 text-xs sm:text-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Jaribu Portal ya Demo</span>
              </button>
            </motion.div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls Overlay Bar */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-6 sm:right-6 z-20 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-slate-950/75 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-slate-800/80">
        
        {/* Navigation Indicators / Dots */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full sm:max-w-[50%] pb-0.5">
          {allSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all shrink-0 ${
                index === currentIndex
                  ? 'w-8 bg-emerald-400'
                  : 'w-2.5 bg-slate-600 hover:bg-slate-400'
              }`}
              title={`Slide ${index + 1}: ${slide.title}`}
            />
          ))}
        </div>

        {/* Play/Pause, Sound Toggle & Arrow Buttons */}
        <div className="flex items-center justify-end gap-2 text-white">
          {currentSlide.mediaType === 'video' && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isMuted
                  ? 'bg-slate-800/90 text-slate-300 hover:text-white'
                  : 'bg-amber-500 text-slate-950 font-black'
              }`}
              title={isMuted ? 'Washa Sauti ya Video' : 'Zima Sauti'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
              <span className="hidden sm:inline text-[11px]">{isMuted ? 'Sauti Imezimwa' : 'Sauti Imewashwa'}</span>
            </button>
          )}

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isPlaying ? 'Sitisha auto-slide' : 'Endelea na auto-slide'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
            title="Slide iliyotoka"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
            title="Slide inayofuata"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* FULL VIDEO DETAIL MODAL */}
      {selectedVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full overflow-hidden relative my-8">
            <div className="relative h-72 sm:h-80 bg-slate-950">
              <video
                src={selectedVideoModal.mediaUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedVideoModal(null)}
                className="absolute top-4 right-4 p-2.5 text-white bg-slate-900/80 hover:bg-rose-600 rounded-full transition shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-amber-500" />
                  {selectedVideoModal.badge}
                </span>
                <span className="text-xs text-slate-400">{selectedVideoModal.location}</span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {selectedVideoModal.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                {selectedVideoModal.originalAd?.description || selectedVideoModal.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {selectedVideoModal.contact && (
                  <a
                    href={`tel:${selectedVideoModal.contact}`}
                    className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs transition flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Piga Simu ({selectedVideoModal.contact})</span>
                  </a>
                )}
                {selectedVideoModal.linkUrl && (
                  <a
                    href={selectedVideoModal.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto py-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-center text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>Tembelea Tovuti</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedVideoModal(null)}
                  className="w-full sm:w-auto py-3 px-5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
                >
                  Funga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

