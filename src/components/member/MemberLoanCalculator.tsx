import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { downloadCSV, printFormattedReport } from '../../lib/exportUtils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Calculator,
  Percent,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Download,
  Printer,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Send,
  Layers,
  Scale,
  RotateCcw,
  Sliders,
  ChevronDown,
  ShieldAlert,
  Building2,
  Wallet,
  Coins,
  Edit3
} from 'lucide-react';

interface MemberLoanCalculatorProps {
  onApplyWithTerms?: (terms: {
    amount: number;
    durationMonths: number;
    interestRate: number;
    loanType: string;
    customLoanName?: string;
  }) => void;
}

export const MemberLoanCalculator: React.FC<MemberLoanCalculatorProps> = ({ onApplyWithTerms }) => {
  const { currentMember, currentInstitution, formatTZS } = useApp();

  // Basic Calculator State
  const [loanType, setLoanType] = useState<string>('Mkopo wa Mkono');
  const [isCustomType, setIsCustomType] = useState<boolean>(false);
  const [customLoanName, setCustomLoanName] = useState<string>('');
  
  const [loanAmount, setLoanAmount] = useState<number>(2000000);
  const [interestRateAnnual, setInterestRateAnnual] = useState<number>(10);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [calculationMethod, setCalculationMethod] = useState<'reducing' | 'flat'>('reducing');
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'biweekly' | 'weekly'>('monthly');
  const [gracePeriodMonths, setGracePeriodMonths] = useState<number>(0);

  // Active View Tab: 'calculator' | 'schedule' | 'comparison'
  const [viewTab, setViewTab] = useState<'calculator' | 'schedule' | 'comparison'>('calculator');

  // Schedule Table Filter / Search
  const [scheduleSearch, setScheduleSearch] = useState<string>('');

  // Scenario Comparison State (Option B)
  const [compAmount, setCompAmount] = useState<number>(2000000);
  const [compDuration, setCompDuration] = useState<number>(24);
  const [compRate, setCompRate] = useState<number>(10);
  const [compMethod, setCompMethod] = useState<'reducing' | 'flat'>('reducing');

  // Member limits
  const totalSavings = currentMember?.totalSavings || 0;
  const maxBorrowingLimit = Math.max(1000000, totalSavings * 3);
  const currentOutstanding = currentMember?.totalLoansOutstanding || 0;
  const availableCapacity = Math.max(0, maxBorrowingLimit - currentOutstanding);

  // Handle Preset Loan Type Selection
  const handleLoanTypeSelect = (typeKey: string) => {
    if (typeKey === 'custom') {
      setIsCustomType(true);
      setLoanType('custom');
    } else {
      setIsCustomType(false);
      setLoanType(typeKey);

      // Auto-set rate from institution settings if available
      const instRates = currentInstitution?.loanInterestRates || {};
      if (instRates[typeKey] !== undefined) {
        setInterestRateAnnual(instRates[typeKey]);
      } else {
        const defaults: Record<string, number> = {
          'Mkopo wa Mkono': 10,
          'Dharura': 8,
          'Biashara': 12,
          'Kilimo': 9,
          'Elimu': 10,
          'Ujenzi': 12
        };
        setInterestRateAnnual(defaults[typeKey] || currentInstitution?.defaultInterestRateAnnual || 10);
      }
    }
  };

  // Calculations Engine
  const calculations = useMemo(() => {
    const P = Math.max(1000, loanAmount);
    const rAnnual = interestRateAnnual / 100;
    const n = Math.max(1, durationMonths);
    const grace = Math.min(gracePeriodMonths, n - 1);
    const effectiveRepayMonths = n - grace;

    let monthlyInstallment = 0;
    let totalInterest = 0;
    let totalRepayment = 0;

    const schedule: Array<{
      month: number;
      openingBalance: number;
      installment: number;
      principalPortion: number;
      interestPortion: number;
      closingBalance: number;
      totalPaidSoFar: number;
    }> = [];

    const chartData: Array<{
      month: string;
      remainingBalance: number;
      principalPaid: number;
      interestPaid: number;
    }> = [];

    if (calculationMethod === 'reducing') {
      // Amortization standard formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
      const rMonthly = rAnnual / 12;

      if (rMonthly === 0) {
        monthlyInstallment = Math.round(P / effectiveRepayMonths);
      } else {
        monthlyInstallment = Math.round(
          (P * rMonthly * Math.pow(1 + rMonthly, effectiveRepayMonths)) /
            (Math.pow(1 + rMonthly, effectiveRepayMonths) - 1)
        );
      }

      let currentBalance = P;
      let cumulativePaid = 0;
      let cumulativePrincipal = 0;
      let cumulativeInterest = 0;

      chartData.push({
        month: 'Mwanzo',
        remainingBalance: Math.round(P),
        principalPaid: 0,
        interestPaid: 0
      });

      for (let m = 1; m <= n; m++) {
        const opening = currentBalance;

        if (m <= grace) {
          // Grace period: only interest or 0 payment
          const interestPortion = Math.round(opening * rMonthly);
          totalInterest += interestPortion;
          schedule.push({
            month: m,
            openingBalance: Math.round(opening),
            installment: 0,
            principalPortion: 0,
            interestPortion: interestPortion,
            closingBalance: Math.round(opening),
            totalPaidSoFar: Math.round(cumulativePaid)
          });
          chartData.push({
            month: `M${m}`,
            remainingBalance: Math.round(opening),
            principalPaid: Math.round(cumulativePrincipal),
            interestPaid: Math.round(cumulativeInterest)
          });
          continue;
        }

        const interestPortion = Math.round(opening * rMonthly);
        let principalPortion = monthlyInstallment - interestPortion;

        if (m === n || principalPortion > opening) {
          principalPortion = opening;
          monthlyInstallment = principalPortion + interestPortion;
        }

        const closing = Math.max(0, opening - principalPortion);
        currentBalance = closing;
        totalInterest += interestPortion;
        cumulativePaid += monthlyInstallment;
        cumulativePrincipal += principalPortion;
        cumulativeInterest += interestPortion;

        schedule.push({
          month: m,
          openingBalance: Math.round(opening),
          installment: Math.round(monthlyInstallment),
          principalPortion: Math.round(principalPortion),
          interestPortion: Math.round(interestPortion),
          closingBalance: Math.round(closing),
          totalPaidSoFar: Math.round(cumulativePaid)
        });

        chartData.push({
          month: `M${m}`,
          remainingBalance: Math.round(closing),
          principalPaid: Math.round(cumulativePrincipal),
          interestPaid: Math.round(cumulativeInterest)
        });
      }

      totalRepayment = P + totalInterest;
    } else {
      // Flat Rate calculation: Total Interest = P * rAnnual * (n / 12)
      totalInterest = Math.round(P * rAnnual * (n / 12));
      totalRepayment = P + totalInterest;
      monthlyInstallment = Math.round(totalRepayment / effectiveRepayMonths);

      const fixedPrincipal = Math.round(P / effectiveRepayMonths);
      const fixedInterest = Math.round(totalInterest / effectiveRepayMonths);

      let currentBalance = P;
      let cumulativePaid = 0;
      let cumulativePrincipal = 0;
      let cumulativeInterest = 0;

      chartData.push({
        month: 'Mwanzo',
        remainingBalance: Math.round(P),
        principalPaid: 0,
        interestPaid: 0
      });

      for (let m = 1; m <= n; m++) {
        const opening = currentBalance;

        if (m <= grace) {
          schedule.push({
            month: m,
            openingBalance: Math.round(opening),
            installment: 0,
            principalPortion: 0,
            interestPortion: 0,
            closingBalance: Math.round(opening),
            totalPaidSoFar: Math.round(cumulativePaid)
          });
          chartData.push({
            month: `M${m}`,
            remainingBalance: Math.round(opening),
            principalPaid: Math.round(cumulativePrincipal),
            interestPaid: Math.round(cumulativeInterest)
          });
          continue;
        }

        const closing = Math.max(0, opening - fixedPrincipal);
        currentBalance = closing;
        cumulativePaid += monthlyInstallment;
        cumulativePrincipal += fixedPrincipal;
        cumulativeInterest += fixedInterest;

        schedule.push({
          month: m,
          openingBalance: Math.round(opening),
          installment: Math.round(monthlyInstallment),
          principalPortion: Math.round(fixedPrincipal),
          interestPortion: Math.round(fixedInterest),
          closingBalance: Math.round(closing),
          totalPaidSoFar: Math.round(cumulativePaid)
        });

        chartData.push({
          month: `M${m}`,
          remainingBalance: Math.round(closing),
          principalPaid: Math.round(cumulativePrincipal),
          interestPaid: Math.round(cumulativeInterest)
        });
      }
    }

    // Adjust for frequencies
    const biweeklyInstallment = Math.round((monthlyInstallment * 12) / 26);
    const weeklyInstallment = Math.round((monthlyInstallment * 12) / 52);
    const dailyEquivalent = Math.round(monthlyInstallment / 30);

    const interestPercentage = Math.round((totalInterest / (P || 1)) * 100);

    return {
      monthlyInstallment,
      biweeklyInstallment,
      weeklyInstallment,
      dailyEquivalent,
      totalInterest,
      totalRepayment,
      interestPercentage,
      schedule,
      chartData
    };
  }, [loanAmount, interestRateAnnual, durationMonths, calculationMethod, gracePeriodMonths]);

  // Comparison Calculations (Option B)
  const compCalculations = useMemo(() => {
    const P = Math.max(1000, compAmount);
    const rAnnual = compRate / 100;
    const n = Math.max(1, compDuration);

    let monthly = 0;
    let totalInt = 0;

    if (compMethod === 'reducing') {
      const rM = rAnnual / 12;
      monthly = rM === 0
        ? Math.round(P / n)
        : Math.round((P * rM * Math.pow(1 + rM, n)) / (Math.pow(1 + rM, n) - 1));
      let bal = P;
      for (let m = 1; m <= n; m++) {
        const intP = Math.round(bal * rM);
        const prinP = monthly - intP;
        bal = Math.max(0, bal - prinP);
        totalInt += intP;
      }
    } else {
      totalInt = Math.round(P * rAnnual * (n / 12));
      monthly = Math.round((P + totalInt) / n);
    }

    return {
      monthlyInstallment: monthly,
      totalInterest: totalInt,
      totalRepayment: P + totalInt
    };
  }, [compAmount, compDuration, compRate, compMethod]);

  // Donut chart pie data
  const pieData = [
    { name: 'Kiasi cha Mkopo (Principal)', value: loanAmount, color: '#4f46e5' },
    { name: 'Jumla ya Riba (Interest)', value: calculations.totalInterest, color: '#f59e0b' }
  ];

  // Filtered Schedule
  const filteredSchedule = calculations.schedule.filter(s => {
    if (!scheduleSearch) return true;
    return (
      s.month.toString().includes(scheduleSearch) ||
      s.installment.toString().includes(scheduleSearch)
    );
  });

  // Handle Export Schedule to CSV
  const handleExportCSV = () => {
    const resolvedName = isCustomType ? (customLoanName || 'Mkopo_Maalum') : loanType;
    const headers = [
      'Mwezi',
      'Salio la Awali (TZS)',
      'Rejesho la Mwezi (TZS)',
      'Mtaji / Principal (TZS)',
      'Riba / Interest (TZS)',
      'Salio Lililobaki (TZS)',
      'Jumla Iliyolipwa (TZS)'
    ];
    const rows = calculations.schedule.map(s => [
      `Mwezi ${s.month}`,
      s.openingBalance,
      s.installment,
      s.principalPortion,
      s.interestPortion,
      s.closingBalance,
      s.totalPaidSoFar
    ]);
    downloadCSV(`Ratiba_ya_Marejesho_${resolvedName}_${loanAmount}`, headers, rows);
  };

  // Handle Print Schedule
  const handlePrintSchedule = () => {
    const resolvedName = isCustomType ? (customLoanName || 'Mkopo Maalum') : loanType;
    const headers = ['Mwezi', 'Salio la Awali (TZS)', 'Rejesho (TZS)', 'Mtaji (TZS)', 'Riba (TZS)', 'Salio Lililobaki (TZS)'];
    const rows = calculations.schedule.map(s => [
      `Mwezi ${s.month}`,
      formatTZS(s.openingBalance),
      formatTZS(s.installment),
      formatTZS(s.principalPortion),
      formatTZS(s.interestPortion),
      formatTZS(s.closingBalance)
    ]);
    printFormattedReport(
      `Ratiba ya Marejesho ya Mkopo (Amortization Schedule)`,
      `Aina ya Mkopo: ${resolvedName} | Kiasi: ${formatTZS(loanAmount)} | Riba: ${interestRateAnnual}% | Muda: Miezi ${durationMonths}`,
      headers,
      rows
    );
  };

  // Handle Apply Transfer
  const handleApplyTransfer = () => {
    const resolvedType = isCustomType ? (customLoanName.trim() || 'Mkopo Maalum') : loanType;
    if (onApplyWithTerms) {
      onApplyWithTerms({
        amount: loanAmount,
        durationMonths,
        interestRate: interestRateAnnual,
        loanType: resolvedType,
        customLoanName: isCustomType ? customLoanName.trim() : undefined
      });
    }
  };

  const isExceedingCapacity = loanAmount > availableCapacity;

  return (
    <div id="member-loan-calculator" className="space-y-6 text-xs animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kikokotoo Mahiri cha Marejesho (Loan Calculator)</span>
              </span>
              {currentInstitution && (
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 font-bold text-[11px] border border-white/10 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{currentInstitution.name}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Kokotoa na Chungulia Marejesho ya Mkopo Wako
            </h2>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Pima makadirio ya rejesho la kila mwezi, riba ya taasisi, na ratiba nzima ya urejeshaji kabla ya kutuma maombi rasmi ya mkopo.
            </p>
          </div>

          {/* Member Savings Capacity Badge */}
          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-right self-stretch md:self-auto space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-200 block">Kikomo Chako cha Kukopa</span>
            <div className="text-xl font-black text-emerald-400">
              {formatTZS(availableCapacity)}
            </div>
            <span className="text-[9px] text-slate-300 block font-semibold">
              Kulingana na akiba zako ({formatTZS(totalSavings)})
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex-wrap">
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewTab('calculator')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewTab === 'calculator'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Kikokotoo Kikuu</span>
          </button>

          <button
            onClick={() => setViewTab('schedule')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewTab === 'schedule'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Ratiba ya Kila Mwezi ({calculations.schedule.length})</span>
          </button>

          <button
            onClick={() => setViewTab('comparison')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewTab === 'comparison'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Linganisha Chaguzi (Comparison)</span>
          </button>
        </div>

        {/* Action button to apply */}
        {onApplyWithTerms && (
          <button
            onClick={handleApplyTransfer}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Omba Mkopo Huu Sasa</span>
          </button>
        )}
      </div>

      {/* VIEW 1: MAIN CALCULATOR VIEW */}
      {viewTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Inputs (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Weka Vigezo vya Mkopo</h3>
                  <p className="text-slate-500 text-[11px]">Badilisha kiasi, muda, aina ya mkopo na mbinu ya riba.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLoanAmount(2000000);
                  setDurationMonths(12);
                  handleLoanTypeSelect('Mkopo wa Mkono');
                  setCalculationMethod('reducing');
                  setGracePeriodMonths(0);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rejesha Awali</span>
              </button>
            </div>

            {/* 1. Loan Type Selection */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                1. Chagua Aina ya Mkopo (Loan Product)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'Mkopo wa Mkono', label: 'Mkopo wa Mkono', desc: 'Pesa taslimu papo hapo' },
                  { id: 'Dharura', label: 'Dharura', desc: 'Matibabu & haraka' },
                  { id: 'Biashara', label: 'Biashara', desc: 'Mtaji & upanuzi' },
                  { id: 'Kilimo', label: 'Kilimo & Pembejeo', desc: 'Msimu wa mavuno' },
                  { id: 'Elimu', label: 'Elimu & Ada', desc: 'Ada za shule/chuo' },
                  { id: 'custom', label: '✍️ Andika kwa Mkono', desc: 'Aina nyingine maalum' }
                ].map(t => {
                  const isSelected = (isCustomType && t.id === 'custom') || (!isCustomType && loanType === t.id);
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => handleLoanTypeSelect(t.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-300 dark:ring-indigo-900'
                          : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-extrabold text-[11px] block">{t.label}</span>
                      <span className={`text-[9px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {t.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Written Loan Type */}
              {isCustomType && (
                <div className="mt-2.5 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-1 animate-in fade-in duration-150">
                  <label className="font-bold text-indigo-900 dark:text-indigo-200 block text-[11px]">
                    Andika Jina / Aina ya Mkopo kwa Mkono (Custom Loan Name):
                  </label>
                  <input
                    type="text"
                    placeholder="k.m. Mkopo wa Pikipiki/Bodaboda, Mkopo wa Mifugo, Mkopo wa Nyumba..."
                    value={customLoanName}
                    onChange={(e) => setCustomLoanName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs"
                  />
                </div>
              )}
            </div>

            {/* 2. Loan Amount Slider & Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  2. Kiasi cha Mkopo (Principal Amount)
                </label>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                  <span>{formatTZS(loanAmount)}</span>
                </div>
              </div>

              <div className="relative mb-2">
                <span className="absolute left-3.5 top-2.5 font-black text-slate-400 text-xs">TZS</span>
                <input
                  type="number"
                  min={10000}
                  step={50000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-sm"
                />
              </div>

              {/* Slider */}
              <input
                type="range"
                min={100000}
                max={Math.max(10000000, availableCapacity * 1.5)}
                step={50000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[500000, 1000000, 2000000, 3000000, 5000000, 10000000].map(amt => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setLoanAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      loanAmount === amt
                        ? 'bg-indigo-600 text-white border-indigo-600 font-extrabold'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {formatTZS(amt)}
                  </button>
                ))}
                {availableCapacity > 0 && (
                  <button
                    type="button"
                    onClick={() => setLoanAmount(availableCapacity)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  >
                    Kikomo Changu ({formatTZS(availableCapacity)})
                  </button>
                )}
              </div>

              {isExceedingCapacity && (
                <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Kiasi hiki kinazidi uwezo wako wa kawaida ({formatTZS(availableCapacity)}). Utahitaji wadhamini wa ziada au amana wakati wa kutuma ombi.
                  </span>
                </div>
              )}
            </div>

            {/* 3. Duration & Interest Rate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Duration Slider */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    3. Muda wa Mkopo
                  </label>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-lg text-[11px]">
                    Miezi {durationMonths} ({ (durationMonths / 12).toFixed(1) } Miaka)
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={48}
                  step={1}
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />

                <div className="flex flex-wrap gap-1">
                  {[3, 6, 12, 18, 24, 36].map(m => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setDurationMonths(m)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        durationMonths === m
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Rate Slider */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    4. Riba ya Taasisi (% kwa Mwaka)
                  </label>
                  <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-lg text-[11px]">
                    {interestRateAnnual}% p.a
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={30}
                  step={0.5}
                  value={interestRateAnnual}
                  onChange={(e) => setInterestRateAnnual(Number(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />

                <div className="flex flex-wrap gap-1">
                  {[6, 8, 9, 10, 12, 15].map(r => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setInterestRateAnnual(r)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        interestRateAnnual === r
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* 4. Calculation Method & Frequency Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              
              {/* Method Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mbinu ya Ukokotoaji wa Riba
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCalculationMethod('reducing')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      calculationMethod === 'reducing'
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="block font-bold text-[11px]">Kupungua Salio</span>
                    <span className="text-[9px] opacity-80">(Amortization)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCalculationMethod('flat')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      calculationMethod === 'flat'
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="block font-bold text-[11px]">Riba Moja kwa Moja</span>
                    <span className="text-[9px] opacity-80">(Flat Rate)</span>
                  </button>
                </div>
              </div>

              {/* Payment Frequency */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mzunguko wa Malipo (Frequency)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'monthly', label: 'Kila Mwezi' },
                    { id: 'biweekly', label: 'Wiki 2' },
                    { id: 'weekly', label: 'Kila Wiki' }
                  ].map(f => (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => setPaymentFrequency(f.id as any)}
                      className={`p-2 rounded-xl border text-center font-bold text-[10px] cursor-pointer ${
                        paymentFrequency === f.id
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Key Results & Visual Analytics (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Primary Payment Card */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-900 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-indigo-900/60 pb-3">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                  Rejesho Linalotarajiwa ({paymentFrequency === 'monthly' ? 'Kila Mwezi' : paymentFrequency === 'biweekly' ? 'Kila Wiki Mbili' : 'Kila Wiki'})
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30">
                  {calculationMethod === 'reducing' ? 'Reducing' : 'Flat'} • {interestRateAnnual}%
                </span>
              </div>

              {/* Big Installment Number */}
              <div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                  {formatTZS(
                    paymentFrequency === 'monthly'
                      ? calculations.monthlyInstallment
                      : paymentFrequency === 'biweekly'
                      ? calculations.biweeklyInstallment
                      : calculations.weeklyInstallment
                  )}
                </div>
                <span className="text-[11px] text-slate-300 mt-1 block">
                  {paymentFrequency === 'monthly'
                    ? `kwa miezi ${durationMonths} (${(durationMonths / 12).toFixed(1)} Mwaka)`
                    : paymentFrequency === 'biweekly'
                    ? `kila baada ya wiki 2 (jumla ya malipo ${Math.round((durationMonths * 26) / 12)})`
                    : `kila wiki (jumla ya malipo ${Math.round((durationMonths * 52) / 12)})`}
                </span>
              </div>

              {/* Daily breakdown chip */}
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300 text-[11px]">Makadirio ya Siku (Daily):</span>
                <span className="font-extrabold text-white">{formatTZS(calculations.dailyEquivalent)} / siku</span>
              </div>

              {/* Financial Metrics Grid */}
              <div className="space-y-2 pt-2 border-t border-indigo-900/60 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Kiasi cha Mkopo (Principal):</span>
                  <span className="font-bold text-white">{formatTZS(loanAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Jumla ya Riba (Total Interest):</span>
                  <span className="font-bold text-amber-400">+{formatTZS(calculations.totalInterest)}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Gharama ya Riba (%):</span>
                  <span className="font-bold text-indigo-300">{calculations.interestPercentage}% ya mkopo</span>
                </div>

                <div className="flex justify-between text-white font-black pt-2 border-t border-indigo-800/80 text-sm">
                  <span>Jumla Kuu ya Kurudisha:</span>
                  <span className="text-emerald-400">{formatTZS(calculations.totalRepayment)}</span>
                </div>
              </div>

              {/* Action: Apply directly with these terms */}
              {onApplyWithTerms && (
                <button
                  type="button"
                  onClick={handleApplyTransfer}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs transition-transform active:scale-98 cursor-pointer mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Tumia Kwenye Maombi ya Mkopo →</span>
                </button>
              )}
            </div>

            {/* Principal vs Interest Pie Chart & Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                Mchanganuo wa Mtaji dhidi ya Riba
              </span>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [formatTZS(Number(val ?? 0)), '']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                  <span>Mtaji: {((loanAmount / calculations.totalRepayment) * 100).toFixed(0)}%</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  <span>Riba: {((calculations.totalInterest / calculations.totalRepayment) * 100).toFixed(0)}%</span>
                </span>
              </div>
            </div>

          </div>

          {/* Paydown Visual Curve (12 cols) */}
          <div className="lg:col-span-12 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                  <span>Mwenendo wa Kupungua kwa Baki la Deni (Paydown Amortization Curve)</span>
                </h4>
                <p className="text-slate-500 text-[10px]">
                  Tazama jinsi deni lako linavyopungua mwezi hadi mwezi hadi kukamilika.
                </p>
              </div>

              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-xl">
                Miezi {durationMonths}
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calculations.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="#94a3b8"
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      formatTZS(Number(val ?? 0)),
                      name === 'remainingBalance'
                        ? 'Baki la Deni'
                        : name === 'principalPaid'
                        ? 'Mtaji Uliolipwa'
                        : 'Riba Iliyolipwa'
                    ]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="remainingBalance"
                    name="remainingBalance"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                  />
                  <Area
                    type="monotone"
                    dataKey="principalPaid"
                    name="principalPaid"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrincipal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-indigo-600 rounded-full" />
                <span>Baki la Deni (Remaining Balance)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-500 rounded-full" />
                <span>Mtaji Uliolipwa (Principal Paid)</span>
              </span>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: FULL AMORTIZATION SCHEDULE */}
      {viewTab === 'schedule' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Jedwali la Ratiba ya Marejesho ya Kila Mwezi ({calculations.schedule.length} Miezi)</span>
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Mchanganuo kamili wa sehemu ya mtaji, riba na baki la deni kwa kila mwezi.
              </p>
            </div>

            {/* Actions: Search + Export CSV + Print */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Tafuta mwezi..."
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />

              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pakua CSV</span>
              </button>

              <button
                onClick={handlePrintSchedule}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chapa / PDF</span>
              </button>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold text-[10px] uppercase">
                  <th className="p-3">Mwezi</th>
                  <th className="p-3">Salio la Awali</th>
                  <th className="p-3 text-emerald-600 dark:text-emerald-400">Rejesho la Mwezi</th>
                  <th className="p-3">Sehemu ya Mtaji</th>
                  <th className="p-3">Sehemu ya Riba</th>
                  <th className="p-3">Salio Lililobaki</th>
                  <th className="p-3 text-right">Jumla Iliyolipwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredSchedule.map((s) => (
                  <tr key={s.month} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      Mwezi {s.month}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {formatTZS(s.openingBalance)}
                    </td>
                    <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatTZS(s.installment)}
                    </td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {formatTZS(s.principalPortion)}
                    </td>
                    <td className="p-3 font-semibold text-amber-600 dark:text-amber-400">
                      {formatTZS(s.interestPortion)}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {formatTZS(s.closingBalance)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">
                      {formatTZS(s.totalPaidSoFar)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* VIEW 3: SCENARIO COMPARISON */}
      {viewTab === 'comparison' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
          
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>Linganisha Chaguzi Mbili za Mikopo (Loan Scenario Comparison)</span>
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Linganisha muda mfupi dhidi ya muda mrefu, au viwango tofauti vya riba ili kuona kiasi unachookoa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Option A (Current Selection) */}
            <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-3xl border-2 border-indigo-300 dark:border-indigo-800 space-y-4">
              <div className="flex justify-between items-center border-b border-indigo-200 dark:border-indigo-800 pb-2">
                <span className="font-extrabold text-xs text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                  Chaguo A (Mipangilio ya Sasa)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                  Chaguo Lako
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kiasi cha Mkopo:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{formatTZS(loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Muda wa Marejesho:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Miezi {durationMonths}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kiwango cha Riba:</span>
                  <span className="font-bold text-amber-600">{interestRateAnnual}% p.a</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mbinu ya Riba:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {calculationMethod === 'reducing' ? 'Kupungua Salio' : 'Flat Rate'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Rejesho / Mwezi</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {formatTZS(calculations.monthlyInstallment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Jumla ya Riba</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    {formatTZS(calculations.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Jumla Kuu</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {formatTZS(calculations.totalRepayment)}
                  </span>
                </div>
              </div>
            </div>

            {/* Option B (Comparison Target) */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Chaguo B (Linganisha)
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Muda / Riba Mbadala
                </span>
              </div>

              {/* Controls for Option B */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    <span>Muda: Miezi {compDuration}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={48}
                    step={1}
                    value={compDuration}
                    onChange={(e) => setCompDuration(Number(e.target.value))}
                    className="w-full accent-slate-700 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    <span>Riba: {compRate}% p.a</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    step={0.5}
                    value={compRate}
                    onChange={(e) => setCompRate(Number(e.target.value))}
                    className="w-full accent-amber-600 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Rejesho / Mwezi</span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {formatTZS(compCalculations.monthlyInstallment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Jumla ya Riba</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    {formatTZS(compCalculations.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Jumla Kuu</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {formatTZS(compCalculations.totalRepayment)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Difference / Savings Analysis Box */}
          {(() => {
            const interestDiff = calculations.totalInterest - compCalculations.totalInterest;
            const monthlyDiff = calculations.monthlyInstallment - compCalculations.monthlyInstallment;

            return (
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">Tofauti Kati ya Chaguo A na B:</h5>
                    <p className="text-slate-300 text-[11px]">
                      {interestDiff > 0 ? (
                        <span>Chaguo B linaokoa <strong className="text-emerald-400 font-extrabold">{formatTZS(interestDiff)}</strong> za riba kulinganisha na Chaguo A.</span>
                      ) : interestDiff < 0 ? (
                        <span>Chaguo A linaokoa <strong className="text-emerald-400 font-extrabold">{formatTZS(Math.abs(interestDiff))}</strong> za riba kulinganisha na Chaguo B.</span>
                      ) : (
                        <span>Gharama ya riba ni sawa kwa chaguzi zote mbili.</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Tofauti ya Rejesho la Mwezi</span>
                  <span className="font-mono font-bold text-xs text-white">
                    {monthlyDiff > 0 ? `+${formatTZS(monthlyDiff)} / mwezi` : `${formatTZS(monthlyDiff)} / mwezi`}
                  </span>
                </div>
              </div>
            );
          })()}

        </div>
      )}

    </div>
  );
};
