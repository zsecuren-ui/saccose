import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HeroCarousel } from './HeroCarousel';
import { ZanzibarVicobaAnnouncements } from './ZanzibarVicobaAnnouncements';
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  PieChart,
  Lock,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Calculator,
  Sparkles,
  HelpCircle,
  Zap,
  Globe,
  Award,
  Compass,
  Anchor,
  TrendingUp,
  MapPin,
  Quote
} from 'lucide-react';

export const PublicLanding: React.FC = () => {
  const { t, subscriptionPlans, setActiveRole, formatTZS, addInstitution } = useApp();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('plan_standard');

  // Registration Form State
  const [newInstName, setNewInstName] = useState('');
  const [newInstType, setNewInstType] = useState<'SACCOS' | 'VICOBA' | 'AMCOS'>('VICOBA');
  const [newRegNo, setNewRegNo] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRegion, setNewRegion] = useState('Unguja Mjini Magharibi (Zanzibar)');

  // Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(5000000);
  const [calcMonths, setCalcMonths] = useState<number>(12);
  const [calcInterestRate, setCalcInterestRate] = useState<number>(12);

  const monthlyRate = calcInterestRate / 100 / 12;
  const calcMonthlyPayment = Math.round(
    (calcAmount * monthlyRate * Math.pow(1 + monthlyRate, calcMonths)) /
      (Math.pow(1 + monthlyRate, calcMonths) - 1)
  );
  const calcTotalPayment = calcMonthlyPayment * calcMonths;
  const calcTotalInterest = calcTotalPayment - calcAmount;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName) return;

    const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);

    addInstitution({
      name: newInstName,
      type: newInstType,
      registrationNumber: newRegNo || `ZNZ/REG/${Date.now().toString().slice(-6)}`,
      logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=150&auto=format&fit=crop&q=80',
      primaryColor: '#0d9488',
      domain: `${newInstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.vicoba.znz`,
      planId: selectedPlanId,
      planName: selectedPlan?.name || 'Standard Plan',
      memberCount: 1,
      maxMembers: selectedPlan?.maxMembers || 1000,
      userCount: 1,
      phone: newPhone || '+255 777 000 000',
      email: newEmail || 'admin@vicoba.znz',
      region: newRegion,
      currency: 'TZS'
    });

    setShowRegisterModal(false);
    alert('Taasisi yako ya VICOBA/SACCOS imesajiliwa kikamilifu! Sasa inaelekezwa kwenye Portal ya Taasisi.');
    setActiveRole('tenantadmin');
  };

  return (
    <div id="public-landing-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Hero Section with Dynamic Moving Image Slider */}
      <section className="pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <HeroCarousel
          onStartRegistration={() => {
            setSelectedPlanId('plan_standard');
            setShowRegisterModal(true);
          }}
          onOpenDemo={() => setActiveRole('tenantadmin')}
        />
      </section>

      {/* Trust & Region Badges */}
      <section className="py-6 sm:py-8 bg-gradient-to-b from-slate-100 via-slate-100 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
            
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-[0_12px_25px_-18px_rgba(15,23,42,0.8)] backdrop-blur-sm">
              <span className="block text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">120+</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">VICOBA & SACCOS Zanzibar</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-[0_12px_25px_-18px_rgba(15,23,42,0.8)] backdrop-blur-sm">
              <span className="block text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">TZS 65B+</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">Akiba na Mikopo Digital</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-[0_12px_25px_-18px_rgba(15,23,42,0.8)] backdrop-blur-sm">
              <span className="block text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">PBZ & M-Pesa</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">Malipo ya Simu & Benki</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-[0_12px_25px_-18px_rgba(15,23,42,0.8)] backdrop-blur-sm">
              <span className="block text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">Sheria za Ushirika ZNZ & TZ</span>
            </div>

          </div>
        </div>
      </section>

      {/* Matangazo na Fursa za Zanzibar VICOBA Section */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ZanzibarVicobaAnnouncements />
      </section>

      {/* Features Grid */}
      <section className="py-10 sm:py-16 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.06),transparent_40%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),transparent_30%),linear-gradient(180deg,#0f172a_0%,#020617_100%)] border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Teknolojia ya Kisasa ya Ushirika</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sifa Kuu za Mfumo wa VICOBA na SACCOS Digital
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Kila kitu kinachohitajika kuendesha Kikundi au Mfuko wa Ushirika bila makosa wala msongo wa mawazo.
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 transition-all shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{t('feature1Title')}</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('feature1Desc')}</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 transition-all shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 flex items-center justify-center font-bold">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{t('feature2Title')}</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('feature2Desc')}</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 transition-all shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 flex items-center justify-center font-bold">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{t('feature3Title')}</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('feature3Desc')}</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 transition-all shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{t('feature4Title')}</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('feature4Desc')}</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 transition-all shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 flex items-center justify-center font-bold">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{t('feature5Title')}</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('feature5Desc')}</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 transition-all shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 flex items-center justify-center font-bold">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{t('feature6Title')}</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('feature6Desc')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* Premium CTA banner */}
      <section className="py-8 sm:py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[32px] border border-emerald-200/80 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-[1px] shadow-[0_25px_70px_-25px_rgba(16,185,129,0.8)]">
            <div className="rounded-[31px] bg-slate-950/90 px-5 py-7 sm:px-8 sm:py-10 lg:px-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">Ready to scale</p>
                  <h3 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">Fungua taasisi yako ya SACCOS au VICOBA kwa mfumo wa digital-first.</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setActiveRole('tenantadmin')}
                    className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold shadow-lg shadow-white/10 transition hover:-translate-y-0.5"
                  >
                    Njia ya Demo
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black transition hover:-translate-y-0.5"
                  >
                    Sajili Taarifa Yako
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zanzibar Testimonials Section */}
      <section className="py-16 bg-slate-100/80 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Shuhuda za Viongozi wa VICOBA Zanzibar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Jinsi Mfumo wa Kidigitali ulivyosaidia kuongeza uwazi na nidhamu ya kifedha Unguja na Pemba.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
              <Quote className="w-8 h-8 text-emerald-500/40" />
              <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "Kabla ya mfumo huu, ilikuwa inatuchukua masaa 4 kila wiki kuhesabu na kuandika vitabu vya akiba Stone Town. Sasa wanachama wanaona akiba zao papo hapo kwenye simu."
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Bi. Khadija Ally"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Khadija+Ally&background=0d9488&color=fff";
                  }}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bi. Khadija Ally</h4>
                  <span className="text-[10px] text-slate-400">Mwenyekiti - Tupendane VICOBA, Stone Town</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
              <Quote className="w-8 h-8 text-emerald-500/40" />
              <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "Ukurasa wa Matangazo ya VICOBA umetuwezesha kupata ruzuku ya Mfuko wa Uchumi wa Buluu kwa haraka sana. Wanachama wetu 45 wote wamenufaika."
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Bi. Mwajuma Hassan"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Mwajuma+Hassan&background=2563eb&color=fff";
                  }}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bi. Mwajuma Hassan</h4>
                  <span className="text-[10px] text-slate-400">Katibu - Jambiani Seaweed SACCOS, Kusini Unguja</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
              <Quote className="w-8 h-8 text-emerald-500/40" />
              <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "Ujumuishaji wa Benki ya PBZ na M-Pesa unawarahisishia sana wavuvi wetu Pemba kuweka akiba na kulipa marejesho ya mikopo bila kusafiri mbali."
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Bw. Suleiman Rashid"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Suleiman+Rashid&background=059669&color=fff";
                  }}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bw. Suleiman Rashid</h4>
                  <span className="text-[10px] text-slate-400">Mwekahazina - Chake Chake Wavuvi VICOBA, Pemba</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Loan & Dividend Calculator */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-2xl">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kikokotoo cha Marejesho ya Mkopo (Interactive Calculator)</h3>
                <p className="text-xs text-slate-500">Jaribu kukokotoa rejesho la kila mwezi kulingana na kiasi na muda.</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Inputs */}
              <div className="space-y-5 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <label>Kiasi cha Mkopo (TZS)</label>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatTZS(calcAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min={500000}
                    max={50000000}
                    step={500000}
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <label>Muda wa Marejesho (Miezi)</label>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{calcMonths} Miezi</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={36}
                    value={calcMonths}
                    onChange={(e) => setCalcMonths(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <label>Riba ya Mwaka (%)</label>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{calcInterestRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={24}
                    value={calcInterestRate}
                    onChange={(e) => setCalcInterestRate(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Output Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-inner">
                <div className="text-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Rejesho la Kila Mwezi</span>
                  <span className="block text-3xl font-black text-emerald-400 mt-1">
                    {formatTZS(calcMonthlyPayment)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="bg-slate-800/80 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Jumla ya Riba</span>
                    <span className="font-bold text-amber-400">{formatTZS(calcTotalInterest)}</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Jumla ya Kurudishwa</span>
                    <span className="font-bold text-white">{formatTZS(calcTotalPayment)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Subscription Pricing */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('pricingTitle')}
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Vifurushi na ada nafuu zinazolingana na ukubwa wa SACCOS au VICOBA yako.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="mt-6 inline-flex items-center bg-slate-200/80 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-300 dark:border-slate-700">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Malipo ya Mwezi
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <span>Malipo ya Mwaka</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">Okoa 15%</span>
              </button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 flex flex-col justify-between border transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-b from-teal-900/10 to-white dark:from-teal-950/40 dark:to-slate-800 border-teal-500 shadow-xl ring-2 ring-teal-500/20'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {plan.popular && (
                      <span className="inline-block px-3 py-1 rounded-full bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider mb-3">
                        Inayopendekezwa Zaidi
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 min-h-10">{plan.description}</p>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatTZS(price)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {billingCycle === 'monthly' ? t('perMonth') : t('perYear')}
                      </span>
                    </div>

                    <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setShowRegisterModal(true);
                    }}
                    className={`mt-8 w-full py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                      plan.popular
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                        : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white'
                    }`}
                  >
                    {t('selectPlan')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sajili Kikundi cha VICOBA au SACCOS Yako</h3>
            <p className="text-xs text-slate-500 mt-1">Anza kutumia mfumo bure kwa siku 14 bila kadi ya benki.</p>

            <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Jina la VICOBA / SACCOS *</label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: Stone Town Women VICOBA"
                  value={newInstName}
                  onChange={(e) => setNewInstName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Aina ya Taasisi</label>
                  <select
                    value={newInstType}
                    onChange={(e) => setNewInstType(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="VICOBA">VICOBA</option>
                    <option value="SACCOS">SACCOS</option>
                    <option value="AMCOS">AMCOS</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Mkoa / Eneo</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Unguja Mjini Magharibi (Zanzibar)">Unguja Mjini Magharibi</option>
                    <option value="Kaskazini Unguja (Zanzibar)">Kaskazini Unguja</option>
                    <option value="Kusini Unguja (Zanzibar)">Kusini Unguja</option>
                    <option value="Kaskazini Pemba (Zanzibar)">Kaskazini Pemba</option>
                    <option value="Kusini Pemba (Zanzibar)">Kusini Pemba</option>
                    <option value="Dar es Salaam">Dar es Salaam</option>
                    <option value="Arusha">Arusha</option>
                    <option value="Mwanza">Mwanza</option>
                    <option value="Dodoma">Dodoma</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Namba ya Usajili wa Ushirika / Kikundi</label>
                <input
                  type="text"
                  placeholder="ZNZ/VICOBA/2026/..."
                  value={newRegNo}
                  onChange={(e) => setNewRegNo(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Namba ya Simu</label>
                  <input
                    type="text"
                    placeholder="+255 777..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Barua Pepe (Email)</label>
                  <input
                    type="email"
                    placeholder="info@vicoba.znz"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                >
                  Kamilisha Usajili Sasa
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="py-3 px-5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl"
                >
                  Funga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} VICOBA & SACCOS Digital SaaS Platform Zanzibar & Tanzania. Haki zote zimehifadhiwa.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Sera ya Faragha</a>
            <a href="#" className="hover:text-white">Masharti ya Matumizi</a>
            <a href="#" className="hover:text-white">Msaada wa Kiufundi</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
