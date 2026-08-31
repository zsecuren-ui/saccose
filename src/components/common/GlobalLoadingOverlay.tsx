import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  Coins,
  TrendingUp,
  Wallet,
  Users,
  Layers,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * AppSkeleton: Rendered during initial application hydration or loading phase.
 * Features ZANZIBAR SACCOS Platform branding, animated progress, and structural skeleton placeholders.
 * Fully optimized for mobile screens (iPhone, Android) and desktop displays.
 */
export const AppSkeleton: React.FC = () => {
  const { lang } = useApp();
  const [loadingStep, setLoadingStep] = useState(0);

  const stepsSwahili = [
    'Inaandaa SACCOS PLATFORM...',
    'Inapakia daftari la wanachama, akiba, hisa na mikopo...',
    'Inathibitisha usalama wa PBZ, NMB, CRDB na mitandao ya malipo...',
    'Inakamilisha moduli za uchumi wa buluu na ripoti za fedha...'
  ];

  const stepsEnglish = [
    'Initializing SACCOS PLATFORM...',
    'Loading member records, cooperative savings, shares and loans...',
    'Verifying secure PBZ, NMB, CRDB and mobile payment gateways...',
    'Finalizing Blue Economy tools and real-time financial audits...'
  ];

  const steps = lang === 'sw' ? stepsSwahili : stepsEnglish;

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % steps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div
      id="app-skeleton-screen"
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans transition-colors overflow-x-hidden"
    >
      {/* Top Navbar Skeleton Header - Mobile & Desktop Responsive */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-3.5 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 animate-pulse">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-black text-white tracking-tight sm:tracking-wide flex items-center gap-1.5 truncate">
              <span>ZANZIBAR SACCOS</span>
              <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30 shrink-0">
                PLATFORM
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">
              ISACCOS & VICOBA Zanzibar 2026
            </div>
          </div>
        </div>

        {/* Center Pill Placeholders for Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <div className="h-8 w-24 bg-slate-800/70 rounded-lg animate-pulse" />
          <div className="h-8 w-28 bg-slate-800/70 rounded-lg animate-pulse" />
          <div className="h-8 w-20 bg-slate-800/70 rounded-lg animate-pulse" />
          <div className="h-8 w-32 bg-slate-800/70 rounded-lg animate-pulse" />
        </div>

        {/* Right Action Buttons Skeleton */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden xs:block h-7 sm:h-8 w-14 sm:w-16 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-7 sm:h-8 w-20 sm:w-24 bg-emerald-600/30 border border-emerald-500/20 rounded-lg animate-pulse" />
        </div>
      </header>

      {/* Main Skeleton Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6">
        {/* Central Brand Loading Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/30 p-4 sm:p-8 lg:p-10 shadow-2xl shadow-emerald-950/40">
          {/* Ambient Background Glows */}
          <div className="absolute top-0 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto w-full">
            {/* Animated Logo Crest with Pulsing Radar Ring */}
            <div className="relative mb-3.5 sm:mb-5">
              <div className="absolute -inset-2.5 sm:-inset-3 rounded-full bg-emerald-500/25 blur-md animate-ping" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-2xl shadow-emerald-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[14px] sm:rounded-[22px] flex items-center justify-center">
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Prominent Project Name Pill */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] sm:text-xs font-black tracking-wider uppercase mb-2 sm:mb-3 shadow-inner max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">SACCOS PLATFORM</span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-1.5 sm:mb-2">
              SACCOS PLATFORM
            </h1>
            <p className="text-[11px] sm:text-sm text-emerald-200/80 font-semibold mb-3 sm:mb-4 max-w-lg leading-relaxed px-2">
              Mfumo Mkuu wa Kidigitali wa SACCOS, VICOBA na Taasisi za Kifedha Zanzibar & Tanzania
            </p>

            {/* Dynamic Step Ticker with smooth transition */}
            <div className="min-h-[40px] w-full max-w-md flex items-center justify-center px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-2">
              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[11px] sm:text-sm text-emerald-300 font-bold flex items-center justify-center gap-2 text-center"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
                <span>{steps[loadingStep]}</span>
              </motion.p>
            </div>

            {/* Shimmering Indeterminate Progress Bar */}
            <div className="w-full max-w-md h-2 sm:h-2.5 bg-slate-800 rounded-full overflow-hidden mt-3 sm:mt-4 relative border border-slate-700/60 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full shadow-lg shadow-emerald-500/50"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeInOut'
                }}
                style={{ width: '60%' }}
              />
            </div>

            {/* Security & Feature Badges - Mobile Optimized Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 w-full max-w-2xl mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-800/80 text-[11px] sm:text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 justify-center sm:justify-start">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Ulinzi wa PBZ & CRDB</span>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 justify-center sm:justify-start">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Hesabu za Akiba & Mikopo</span>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 justify-center sm:justify-start">
                <Layers className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="truncate">Unguja & Pemba 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards Skeleton Placeholder Grid - 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[
            { label: 'Wanachama Wote', icon: Users, color: 'text-indigo-400' },
            { label: 'Akiba na Amana', icon: Wallet, color: 'text-emerald-400' },
            { label: 'Mikopo Iliyotolewa', icon: TrendingUp, color: 'text-cyan-400' },
            { label: 'Daftari la Hisa', icon: Coins, color: 'text-amber-400' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between h-24 sm:h-28 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="h-2.5 sm:h-3 w-16 sm:w-24 bg-slate-800 rounded animate-pulse" />
                <item.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${item.color} opacity-60`} />
              </div>
              <div>
                <div className="h-4 sm:h-6 w-20 sm:w-32 bg-slate-800 rounded-md animate-pulse mb-1 sm:mb-1.5" />
                <div className="h-2 sm:h-2.5 w-12 sm:w-16 bg-slate-800/60 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Detailed Content Skeletons (Bento / Grid rows) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Chart / Table Skeleton */}
          <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="h-3.5 sm:h-4 w-36 sm:w-44 bg-slate-800 rounded animate-pulse" />
              <div className="h-5 sm:h-6 w-16 sm:w-20 bg-slate-800/80 rounded-lg animate-pulse" />
            </div>
            {/* Rows */}
            <div className="space-y-2.5 sm:space-y-3 pt-1">
              {[1, 2, 3].map(row => (
                <div key={row} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800/50">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 animate-pulse shrink-0" />
                    <div className="min-w-0">
                      <div className="h-3 sm:h-3.5 w-24 sm:w-32 bg-slate-800 rounded animate-pulse mb-1" />
                      <div className="h-2 sm:h-2.5 w-14 sm:w-20 bg-slate-800/60 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3.5 sm:h-4 w-14 sm:w-20 bg-slate-800 rounded animate-pulse shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Side Info Skeleton */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="h-3.5 sm:h-4 w-28 sm:w-36 bg-slate-800 rounded animate-pulse mb-3 sm:mb-4" />
              <div className="space-y-2.5 sm:space-y-3">
                <div className="h-14 sm:h-16 rounded-xl bg-slate-900/60 border border-slate-800/50 p-2.5 sm:p-3 flex flex-col justify-between">
                  <div className="h-2.5 sm:h-3 w-24 sm:w-28 bg-slate-800 rounded animate-pulse" />
                  <div className="h-2.5 sm:h-3 w-12 sm:w-16 bg-slate-800/60 rounded animate-pulse" />
                </div>
                <div className="h-14 sm:h-16 rounded-xl bg-slate-900/60 border border-slate-800/50 p-2.5 sm:p-3 flex flex-col justify-between">
                  <div className="h-2.5 sm:h-3 w-28 sm:w-32 bg-slate-800 rounded animate-pulse" />
                  <div className="h-2.5 sm:h-3 w-16 sm:w-20 bg-slate-800/60 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="h-8 sm:h-9 w-full bg-emerald-600/20 border border-emerald-500/30 rounded-xl animate-pulse mt-3 sm:mt-4" />
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * GlobalLoadingOverlay: Displays a focused, non-blocking modal overlay during active async tasks
 * (e.g. database sync, financial audit computation, batch operations).
 * Optimized with compact mobile padding, touch clearance, and clean typography.
 */
export const GlobalLoadingOverlay: React.FC = () => {
  const { globalLoading, lang } = useApp();

  if (!globalLoading || !globalLoading.isLoading) {
    return null;
  }

  const defaultMessage =
    lang === 'sw'
      ? 'Inachakata taarifa za mfumo... Tafadhali subiri kidogo.'
      : 'Processing system request... Please wait a moment.';

  const message = globalLoading.message || defaultMessage;

  return (
    <AnimatePresence>
      <motion.div
        id="global-loading-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-sm sm:max-w-md w-full bg-slate-900/98 border-2 border-emerald-500/35 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-emerald-950/60 text-center flex flex-col items-center mx-2"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-cyan-500/25 rounded-2xl sm:rounded-3xl blur-xl pointer-events-none" />

          {/* Animated Spinner with Centered Icon */}
          <div className="relative w-14 h-14 sm:w-18 sm:h-18 mb-3 sm:mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-3 border-slate-700 border-t-emerald-400 animate-spin" />
            <div
              className="absolute inset-1.5 sm:inset-2 rounded-full border-2 border-slate-700 border-b-cyan-400 animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.4s' }}
            />
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-950 flex items-center justify-center shadow-inner border border-emerald-500/30">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Prominent Project Name */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[9px] sm:text-[10px] font-black tracking-wider uppercase mb-1.5 max-w-full truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="truncate">ZANZIBAR SACCOS PLATFORM</span>
          </div>

          <h3 className="text-sm sm:text-lg font-black text-white mb-1.5">
            ZANZIBAR SACCOS & VICOBA
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xs px-1">
            {message}
          </p>

          {/* Pulsing Dots indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-4 sm:mt-5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
