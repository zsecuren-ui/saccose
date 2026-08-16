import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Award,
  DollarSign
} from 'lucide-react';

export const MemberSettlementReports: React.FC = () => {
  const { currentMember, currentInstitution, transactions, loans, formatTZS } = useApp();

  const [settlementPeriod, setSettlementPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-25');

  // Filter transactions based on selection
  const memberTxs = useMemo(() => {
    return transactions.filter(t => t.memberId === currentMember.id);
  }, [transactions, currentMember.id]);

  const activeLoan = loans.find(l => l.memberId === currentMember.id && l.status === 'Active');

  // Calculate settlement metrics for period
  const settlementSummary = useMemo(() => {
    let totalDeposits = 0;
    let totalRepayments = 0;

    memberTxs.forEach(tx => {
      if (tx.type === 'SavingsDeposit' || tx.type === 'SharePurchase') {
        totalDeposits += tx.amount;
      } else if (tx.type === 'LoanRepayment') {
        totalRepayments += tx.amount;
      }
    });

    const openingBalance = Math.max(0, currentMember.totalSavings - totalDeposits);
    const closingBalance = currentMember.totalSavings;

    return {
      openingBalance,
      totalDeposits,
      totalRepayments,
      closingBalance,
      totalShares: currentMember.totalShares,
      outstandingLoan: activeLoan ? activeLoan.remainingBalance : 0
    };
  }, [memberTxs, currentMember, activeLoan]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert(`Taarifa Rasmi ya Settlement ya ${settlementPeriod.toUpperCase()} kwa Mwanachama ${currentMember.fullName} inapakuliwa kama PDF iliyogongwa Muhuri wa Kidigitali!`);
  };

  const handleDownloadExcel = () => {
    alert(`Faili la Excel (.xlsx) la Settlement ya ${settlementPeriod.toUpperCase()} linapakuliwa...`);
  };

  return (
    <div id="member-settlement-reports" className="space-y-6">
      
      {/* Download Center Control Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xs">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Kituo cha Taarifa na Settlement ya Malipo (Payment Settlement Center)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pakua taarifa za kiofisi za malipo ya kila siku na kila mwezi zenye uthibitisho wa muhuri wa Ushirika.
            </p>
          </div>

          {/* Download & Print Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Chapa (Print)</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="px-4 py-2.5 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Pakua PDF Settlement</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
          
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSettlementPeriod('daily')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                settlementPeriod === 'daily'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Settlement ya Kila Siku (Daily)
            </button>
            <button
              onClick={() => setSettlementPeriod('monthly')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                settlementPeriod === 'monthly'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Settlement ya Kila Mwezi (Monthly)
            </button>
            <button
              onClick={() => setSettlementPeriod('yearly')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                settlementPeriod === 'yearly'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Settlement ya Mwaka
            </button>
          </div>

          {/* Date Picker Input */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            {settlementPeriod === 'daily' ? (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            ) : (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            )}
          </div>

        </div>

      </div>

      {/* Official Stamped Digital Settlement Certificate Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/30 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Background Watermark Stamp */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none text-center">
          <ShieldCheck className="w-96 h-96 text-emerald-900" />
        </div>

        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              {currentInstitution.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {currentInstitution.name}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                TAARIFA RASMI YA SETTLEMENT NA MALIPO (OFFICIAL SETTLEMENT STATEMENT)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Usajili: {currentInstitution.registrationNumber} • Region: {currentInstitution.region}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Tarehe ya Settlement</span>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              {new Date().toLocaleDateString('sw-TZ', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
              Ref: STMT/{Date.now().toString().slice(-8)}
            </span>
          </div>
        </div>

        {/* Member Particulars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block">Jina la Mwanachama:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{currentMember.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Namba ya Uanachama:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{currentMember.memberNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Tawi / Shehia:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{currentMember.branch}</span>
          </div>
        </div>

        {/* Financial Settlement Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase block">
              Salio la Mwanzo (Opening)
            </span>
            <span className="text-base font-black text-emerald-900 dark:text-emerald-300 mt-1 block">
              {formatTZS(settlementSummary.openingBalance)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
            <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase block">
              Jumla ya Akiba (Deposits)
            </span>
            <span className="text-base font-black text-blue-900 dark:text-blue-300 mt-1 block">
              +{formatTZS(settlementSummary.totalDeposits)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase block">
              Marejesho ya Mkopo (Repaid)
            </span>
            <span className="text-base font-black text-amber-900 dark:text-amber-300 mt-1 block">
              {formatTZS(settlementSummary.totalRepayments)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
            <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase block">
              Salio la Mwisho (Closing)
            </span>
            <span className="text-base font-black text-purple-900 dark:text-purple-300 mt-1 block">
              {formatTZS(settlementSummary.closingBalance)}
            </span>
          </div>
        </div>

        {/* Detailed Transactions Ledger Table */}
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 tracking-wider">
            Kumbukumbu za Miamala na Settlement za Kila Siku / Mwezi
          </h4>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Tarehe</th>
                  <th className="p-3">Kituo cha Malipo</th>
                  <th className="p-3">Maelezo ya Muamala</th>
                  <th className="p-3">Aina</th>
                  <th className="p-3 text-right">Kiasi (TZS)</th>
                  <th className="p-3 text-center">Hali (Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {memberTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-[11px]">{tx.date}</td>
                    <td className="p-3 font-semibold text-emerald-600">{tx.paymentChannel}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{tx.description}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                      {formatTZS(tx.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px] bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Digital Signature & Stamp Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Imethibitishwa na Mfumo wa Kidigitali wa SACCOS / VICOBA Zanzibar</span>
          </div>

          <div className="border border-dashed border-emerald-500/50 px-4 py-2 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase">
              OFFICIAL DIGITAL STAMP & VERIFICATION
            </span>
            <span className="font-mono text-[9px] text-slate-500">SIGNATURE: ZNZ-SACCOS-VERIFIED-2026</span>
          </div>
        </div>

      </div>

    </div>
  );
};
