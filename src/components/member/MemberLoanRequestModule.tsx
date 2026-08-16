import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MemberLoanCalculator } from './MemberLoanCalculator';
import {
  CreditCard,
  Building2,
  Wallet,
  PiggyBank,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
  FileText,
  Users,
  Percent,
  Calculator,
  Send,
  XCircle,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Edit3,
  Sliders,
  History
} from 'lucide-react';

export const MemberLoanRequestModule: React.FC = () => {
  const {
    currentMember,
    currentInstitution,
    loans,
    applyLoan,
    formatTZS
  } = useApp();

  const [activeModuleTab, setActiveModuleTab] = useState<'form' | 'calculator' | 'history'>('form');

  const [loanType, setLoanType] = useState<string>('Mkopo wa Mkono');
  const [isCustomType, setIsCustomType] = useState<boolean>(false);
  const [customLoanTypeName, setCustomLoanTypeName] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [loanDuration, setLoanDuration] = useState<number>(12);
  const [loanPurpose, setLoanPurpose] = useState<string>('Mkopo wa dharura/mkono kwa ajili ya mahitaji ya haraka');
  const [selectedPurposePreset, setSelectedPurposePreset] = useState<string>('Binafsi');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [appliedFromCalcBanner, setAppliedFromCalcBanner] = useState<string | null>(null);

  if (!currentMember || !currentInstitution) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        Taarifa za Mwanachama au SACCOS hazikupatikana.
      </div>
    );
  }

  // Calculate Member Borrowing Limit (3x Total Savings or minimum 1,000,000 TZS)
  const totalSavings = currentMember.totalSavings || 0;
  const maxBorrowingLimit = Math.max(1000000, totalSavings * 3);
  const currentOutstanding = currentMember.totalLoansOutstanding || 0;
  const availableCapacity = Math.max(0, maxBorrowingLimit - currentOutstanding);

  // Interest Rates set by the Institution
  const institutionRates = currentInstitution.loanInterestRates || {};
  const getAnnualRate = (type: string): number => {
    if (institutionRates[type] !== undefined) {
      return institutionRates[type] / 100;
    }
    const defaultRates: Record<string, number> = {
      'Mkopo wa Mkono': 0.10, // 10% p.a
      'Dharura': 0.08,        // 8% p.a
      'Biashara': 0.12,       // 12% p.a
      'Elimu': 0.10,          // 10% p.a
      'Kilimo': 0.09,         // 9% p.a
      'Ujenzi': 0.12          // 12% p.a
    };
    return defaultRates[type] !== undefined ? defaultRates[type] : (currentInstitution.defaultInterestRateAnnual ? currentInstitution.defaultInterestRateAnnual / 100 : 0.10);
  };

  const annualRate = getAnnualRate(isCustomType ? 'custom' : loanType);
  const monthlyRate = annualRate / 12;
  const totalInterest = Math.round(loanAmount * (annualRate * (loanDuration / 12)));
  const totalRepayable = loanAmount + totalInterest;
  const monthlyInstallment = Math.round(totalRepayable / loanDuration);

  // Member's existing loan applications
  const myLoans = (loans || []).filter(l => l && l.memberId === currentMember.id);

  const presetPurposes = [
    { label: 'Mahitaji ya Papo Hapo', value: 'Mahitaji binafsi ya dharura/mkono' },
    { label: 'Upanuzi wa Biashara', value: 'Upanuzi wa duka na ununuzi wa bidhaa mpya' },
    { label: 'Ada za Shule/Chuo', value: 'Malipo ya ada ya masomo ya mhula ujao' },
    { label: 'Kilimo & Pembejeo', value: 'Ununuzi wa mbolea, mbegu bora na maandalizi ya shamba' },
    { label: 'Ujenzi wa Nyumba', value: 'Ujenzi na ukarabati wa makazi ya familia' },
    { label: 'Dharura ya Matibabu', value: 'Gharama za dharura za matibabu ya familia' }
  ];

  const handleTypeChange = (typeKey: string) => {
    if (typeKey === 'custom') {
      setIsCustomType(true);
      setLoanType('custom');
    } else {
      setIsCustomType(false);
      setLoanType(typeKey);
    }
  };

  // Pre-fill from Interactive Calculator
  const handleApplyWithCalculatorTerms = (terms: {
    amount: number;
    durationMonths: number;
    interestRate: number;
    loanType: string;
    customLoanName?: string;
  }) => {
    setLoanAmount(terms.amount);
    setLoanDuration(terms.durationMonths);

    const standardTypes = ['Mkopo wa Mkono', 'Dharura', 'Biashara', 'Kilimo', 'Elimu', 'Ujenzi'];
    if (terms.customLoanName || !standardTypes.includes(terms.loanType)) {
      setIsCustomType(true);
      setCustomLoanTypeName(terms.customLoanName || terms.loanType);
      setLoanType('custom');
    } else {
      setIsCustomType(false);
      setLoanType(terms.loanType);
    }

    setActiveModuleTab('form');
    setAppliedFromCalcBanner(`Makadirio ya ${formatTZS(terms.amount)} kwa miezi ${terms.durationMonths} (${terms.loanType}) yamewekwa kwenye fomu ya maombi!`);
    setTimeout(() => setAppliedFromCalcBanner(null), 8000);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (loanAmount <= 0) {
      alert('Tafadhali ingiza kiasi halali cha mkopo.');
      return;
    }

    if (isCustomType && !customLoanTypeName.trim()) {
      alert('Tafadhali andika aina ya mkopo unaoomba.');
      return;
    }

    if (!loanPurpose.trim()) {
      alert('Tafadhali eleza sababu/madhumuni ya mkopo huu.');
      return;
    }

    const effectiveType = isCustomType ? customLoanTypeName.trim() : loanType;
    const effectiveInterest = Math.round(annualRate * 100);

    setIsSubmitting(true);

    setTimeout(() => {
      applyLoan({
        amountRequested: loanAmount,
        durationMonths: loanDuration,
        loanType: effectiveType,
        customLoanTypeName: isCustomType ? customLoanTypeName.trim() : undefined,
        interestRateAnnual: effectiveInterest,
        purpose: loanPurpose
      });

      setIsSubmitting(false);
      setSuccessMessage(`Maombi yako ya mkopo wa ${formatTZS(loanAmount)} (${effectiveType}) wenye riba ya ${effectiveInterest}% yametumwa kikamilifu kwa ${currentInstitution.name}!`);
      setTimeout(() => setSuccessMessage(null), 6000);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Eligibility Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] border border-indigo-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>SACCOS: {currentInstitution.name}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Namba: {currentMember.memberNumber}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Kitengo cha Mikopo & Kikokotoo cha Marejesho
            </h2>
            <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
              Kokotoa marejesho ya kila mwezi, chungulia riba ya taasisi, na uombe mkopo kwa urahisi kutoka kwenye mfuko wa <strong className="text-white font-bold">{currentInstitution.name}</strong>.
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-right self-stretch md:self-auto space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-200 block">Kikomo chako cha Kukopa (Loan Limit)</span>
            <div className="text-2xl font-black text-emerald-400">
              {formatTZS(availableCapacity)}
            </div>
            <span className="text-[10px] text-slate-300 block">
              3x Ya Akiba Zako ({formatTZS(totalSavings)}) - Deni ({formatTZS(currentOutstanding)})
            </span>
          </div>
        </div>
      </div>

      {/* Module Subtabs: Form vs Calculator vs History */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveModuleTab('form')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeModuleTab === 'form'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Fomu ya Maombi ya Mkopo</span>
        </button>

        <button
          onClick={() => setActiveModuleTab('calculator')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeModuleTab === 'calculator'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border hover:bg-slate-50'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-500" />
          <span>Kikokotoo Mahiri & Ratiba (Calculator)</span>
          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded text-[9px] font-black">
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveModuleTab('history')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeModuleTab === 'history'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4 text-amber-500" />
          <span>Historia ya Maombi Yangu ({myLoans.length})</span>
        </button>
      </div>

      {/* Applied From Calculator Banner Notification */}
      {appliedFromCalcBanner && (
        <div className="p-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2.5 text-xs">
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
            <span>{appliedFromCalcBanner}</span>
          </div>
          <button onClick={() => setAppliedFromCalcBanner(null)} className="text-white/80 hover:text-white font-black text-sm">
            ✕
          </button>
        </div>
      )}

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
            <span className="text-xs">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-white/80 hover:text-white font-black text-sm">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: INTERACTIVE CALCULATOR */}
      {activeModuleTab === 'calculator' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <MemberLoanCalculator onApplyWithTerms={handleApplyWithCalculatorTerms} />
        </div>
      )}

      {/* TAB 2: LOAN APPLICATION FORM */}
      {activeModuleTab === 'form' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Loan Request Form (2 cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Fomu ya Maombi ya Mkopo</h3>
                    <p className="text-slate-500 text-xs">Jaza kiasi, aina ya mkopo na riba inayotolewa na {currentInstitution.name}.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModuleTab('calculator')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Kikokotoo & Simulizi →</span>
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-5">
                
                {/* Sacco Name Display */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Taasisi Inayotoa Mkopo (SACCOS)
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>{currentInstitution.name}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px]">
                      Hai & Imethibitishwa
                    </span>
                  </div>
                </div>

                {/* Loan Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Aina ya Mkopo (Loan Category) & Riba ya Taasisi
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'Mkopo wa Mkono', label: 'Mkopo wa Mkono', desc: 'Pesa taslimu / Papo hapo' },
                      { id: 'Dharura', label: 'Mkopo wa Dharura', desc: 'Dharura za haraka' },
                      { id: 'Biashara', label: 'Mkopo wa Biashara', desc: 'Upanuzi wa biashara' },
                      { id: 'Kilimo', label: 'Mkopo wa Kilimo', desc: 'Mbolea & Pembejeo' },
                      { id: 'Elimu', label: 'Mkopo wa Elimu', desc: 'Ada za Shule / Chuo' },
                      { id: 'custom', label: '✍️ Andika kwa Mkono', desc: 'Aina nyingine ya mkopo' }
                    ].map(item => {
                      const itemRate = (getAnnualRate(item.id) * 100).toFixed(0);
                      const isSelected = (isCustomType && item.id === 'custom') || (!isCustomType && loanType === item.id);

                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => handleTypeChange(item.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300 dark:ring-indigo-900'
                              : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-extrabold text-xs block">{item.label}</span>
                          <div className="flex justify-between items-center mt-1">
                            <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {item.desc}
                            </span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-indigo-500 text-white' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold'
                            }`}>
                              {itemRate}% p.a
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Written Loan Type Input */}
                  {isCustomType && (
                    <div className="mt-3 p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-1.5 animate-in fade-in duration-200">
                      <label className="font-bold text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Andika Aina ya Mkopo Unaoomba (Custom Loan Type): *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="k.m. Mkopo wa Bodaboda, Mkopo wa Matibabu, Mkopo wa Mifugo, Mkopo Binafsi..."
                        value={customLoanTypeName}
                        onChange={(e) => setCustomLoanTypeName(e.target.value)}
                        className="w-full p-3 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        Taasisi itapokea maombi haya na kurekebisha au kuthibitisha riba rasmi kulingana na sera ya mkopo huo.
                      </span>
                    </div>
                  )}
                </div>

                {/* Loan Amount Input & Presets */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kiasi Unachoomba (TZS)
                    </label>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      Max: {formatTZS(availableCapacity)}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs font-black text-slate-400">TZS</span>
                    <input
                      type="number"
                      min={50000}
                      step={50000}
                      required
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-base shadow-xs focus:ring-2 focus:ring-indigo-500/30 outline-none"
                    />
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[500000, 1000000, 2500000, 5000000, 10000000].map(amt => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setLoanAmount(amt)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
                          loanAmount === amt
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {formatTZS(amt)}
                      </button>
                    ))}
                  </div>

                  {loanAmount > availableCapacity && (
                    <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>
                        Kiasi ulichoingiza kinazidi kikomo chako cha mkopo ({formatTZS(availableCapacity)}). Kamati ya Mikopo itahitaji udhamini wa ziada.
                      </span>
                    </div>
                  )}
                </div>

                {/* Duration & Installment Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Muda wa Marejesho (Miezi)
                    </label>
                    <select
                      value={loanDuration}
                      onChange={(e) => setLoanDuration(Number(e.target.value))}
                      className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={1}>Mwezi 1 (Siku 30)</option>
                      <option value={3}>Miezi 3</option>
                      <option value={6}>Miezi 6</option>
                      <option value={12}>Miezi 12 (Mwaka 1)</option>
                      <option value={18}>Miezi 18 (Mwaka 1.5)</option>
                      <option value={24}>Miezi 24 (Miaka 2)</option>
                      <option value={36}>Miezi 36 (Miaka 3)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Rejesho la Kila Mwezi (Makadirio)
                    </label>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                        {formatTZS(monthlyInstallment)} / mwezi
                      </span>
                      <span className="text-[10px] text-emerald-600 font-extrabold">
                        Riba: {(annualRate * 100).toFixed(0)}% p.a
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purpose Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Sababu / Madhumuni ya Mkopo
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {presetPurposes.map(preset => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => {
                          setSelectedPurposePreset(preset.label);
                          setLoanPurpose(preset.value);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                          selectedPurposePreset === preset.label
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    placeholder="Eleza kwa ufupi madhumuni ya mkopo huu..."
                    className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Submit Application Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || loanAmount <= 0}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Inatuma Maombi...' : 'Tuma Maombi ya Mkopo kwa Idhini'}</span>
                </button>
              </form>
            </div>

            {/* Right Summary & Policy Card (1 col) */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Muhtasari wa Makadirio</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aina ya Mkopo:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {isCustomType ? (customLoanTypeName || 'Maalum (Custom)') : loanType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kiasi cha Mkopo:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatTZS(loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kiwango cha Riba (SACCOS):</span>
                    <span className="font-bold text-amber-600">{(annualRate * 100).toFixed(0)}% p.a</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Muda:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Miezi {loanDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jumla ya Riba:</span>
                    <span className="font-bold text-amber-600">+{formatTZS(totalInterest)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-2 text-sm">
                    <span className="font-extrabold text-slate-900 dark:text-white">Jumla ya Kulipa:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">{formatTZS(totalRepayable)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-2 text-xs">
                    <span className="text-slate-500 font-bold">Rejesho la Kila Mwezi:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatTZS(monthlyInstallment)} / mwezi</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Sera ya Mikopo ya {currentInstitution.name}</span>
                  </div>
                  <p className="leading-relaxed">
                    Maombi yote hupitia hatua za idhini (Afisa Mikopo na Meneja). Riba huhesabiwa kulingana na muundo uliowekwa na taasisi.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: MEMBER'S LOAN HISTORY & PIPELINE */}
      {activeModuleTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-5 animate-in fade-in duration-150">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Historia ya Maombi Yangu ya Mikopo ({myLoans.length})</span>
              </h3>
              <p className="text-slate-500 text-xs">Fuatilia hatua za idhini, salio la marejesho na mikopo iliyopita.</p>
            </div>

            <button
              onClick={() => setActiveModuleTab('form')}
              className="px-3.5 py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Omba Mkopo Mpya</span>
            </button>
          </div>

          {myLoans.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-bold text-sm">Hujatuma maombi ya mkopo bado.</p>
              <button
                onClick={() => setActiveModuleTab('form')}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
              >
                <span>Omba Mkopo Sasa</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myLoans.map((loan) => {
                const statusColors: Record<string, string> = {
                  'Under Review': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
                  'Approved': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
                  'Active': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
                  'Completed': 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
                  'Rejected': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                };

                return (
                  <div
                    key={loan.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {loan.loanType} {loan.customLoanTypeName ? `(${loan.customLoanTypeName})` : ''}
                            </span>
                            <span className="text-[10px] font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border text-slate-500">
                              {loan.id}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Tarehe ya Maombi: {loan.appliedDate} • Riba: {loan.interestRateAnnual || 10}% p.a • Muda: Miezi {loan.durationMonths}
                          </span>
                        </div>
                      </div>

                      <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-black border ${statusColors[loan.status] || 'bg-slate-100 text-slate-800'}`}>
                        {loan.status === 'Under Review' ? '⏳ Inaangaliwa (Under Review)' : loan.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 italic">
                      "{loan.purpose}"
                    </p>

                    {/* Financial Breakdown */}
                    <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block">Kiasi cha Mkopo</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatTZS(loan.amountApproved || loan.amountRequested)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">Kilichorejeshwa</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            {formatTZS(loan.totalPaid || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-500 font-bold block">Baki la Deni</span>
                          <span className="font-black text-amber-600 dark:text-amber-400">
                            {formatTZS(loan.remainingBalance || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Repayment Progress Bar */}
                      {(loan.status === 'Active' || loan.status === 'Completed') && (
                        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400 font-medium">Maendeleo ya Marejesho</span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                              {Math.min(100, Math.max(0, (((loan.totalPaid || 0) / (loan.totalRepayable || loan.amountApproved || loan.amountRequested || 1)) * 100))).toFixed(0)}% Imelipwa
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, Math.max(0, (((loan.totalPaid || 0) / (loan.totalRepayable || loan.amountApproved || loan.amountRequested || 1)) * 100)))}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stepper logic */}
                    {loan.approvalSteps && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Hatua za Idhini (Approval Pipeline)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {loan.approvalSteps.map(st => (
                            <div
                              key={st.step}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                                st.status === 'Approved'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <div>
                                <span className="font-bold block text-[11px]">Hatua {st.step}: {st.roleName.split('(')[0]}</span>
                                <span className="text-[9px] text-slate-400 block">
                                  {st.status === 'Approved' ? `Imepitishwa (${st.approverName || 'Afisa'})` : 'Inasubiri...'}
                                </span>
                              </div>
                              {st.status === 'Approved' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
