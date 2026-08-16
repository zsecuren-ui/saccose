import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentProof, Transaction } from '../../types';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Calendar,
  CreditCard,
  PiggyBank,
  PieChart,
  Printer,
  Plus,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';

export const MemberPaymentHistoryAndPassbook: React.FC = () => {
  const {
    currentMember,
    currentInstitution,
    paymentProofs,
    transactions,
    loans,
    formatTZS
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'history' | 'passbook'>('history');
  
  // Payment History Filters
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');
  const [historySearchTerm, setHistorySearchTerm] = useState<string>('');
  const [selectedProofModal, setSelectedProofModal] = useState<PaymentProof | null>(null);

  // Passbook Filters & Custom Entries
  const [passbookCategoryFilter, setPassbookCategoryFilter] = useState<string>('all');
  const [passbookSearchTerm, setPassbookSearchTerm] = useState<string>('');
  const [passbookStartDate, setPassbookStartDate] = useState<string>('');
  const [passbookEndDate, setPassbookEndDate] = useState<string>('');

  // Get member's uploaded payment proofs
  const memberProofs = useMemo(() => {
    return paymentProofs.filter(p => p.memberId === currentMember.id);
  }, [paymentProofs, currentMember.id]);

  // Filtered proofs
  const filteredProofs = useMemo(() => {
    return memberProofs.filter(p => {
      const matchesStatus = historyStatusFilter === 'all' || p.status.toLowerCase() === historyStatusFilter.toLowerCase();
      const matchesSearch =
        (p.receiptNumber || '').toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        (p.paymentChannel || '').toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        (p.paymentType || '').toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        (p.notes || '').toLowerCase().includes(historySearchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [memberProofs, historyStatusFilter, historySearchTerm]);

  // Proof Totals KPI Calculation
  const totalSubmitted = memberProofs.reduce((sum, p) => sum + p.amount, 0);
  const totalApproved = memberProofs.filter(p => p.status === 'Approved').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = memberProofs.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

  // Active Loan Obligations
  const memberLoans = loans.filter(l => l.memberId === currentMember.id);
  const activeLoan = memberLoans.find(l => l.status === 'Active');
  const totalLoanRepaymentsMade = memberProofs
    .filter(p => p.status === 'Approved' && p.paymentType === 'LoanRepayment')
    .reduce((sum, p) => sum + p.amount, 0);

  // Member Passbook Ledger Entries (Combined Transactions + Approved Proofs)
  const passbookEntries = useMemo(() => {
    const memberTxs = transactions.filter(t => t.memberId === currentMember.id);
    
    // Map Transactions
    const txEntries = memberTxs.map(t => ({
      id: t.id,
      date: t.date,
      type: t.type,
      category: t.type === 'SavingsDeposit' ? 'Akiba' : t.type === 'LoanRepayment' ? 'Rejesho la Mkopo' : t.type === 'SharePurchase' ? 'Hisa' : 'Mengineyo',
      amount: t.amount,
      channel: t.paymentChannel,
      reference: t.referenceNumber,
      status: t.status,
      description: t.description || `Muamala wa ${t.type}`
    }));

    // Sort by Date Descending
    return txEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentMember.id]);

  const filteredPassbook = useMemo(() => {
    return passbookEntries.filter(entry => {
      const matchesCategory = passbookCategoryFilter === 'all' || entry.category.toLowerCase() === passbookCategoryFilter.toLowerCase();
      const matchesSearch =
        entry.reference.toLowerCase().includes(passbookSearchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(passbookSearchTerm.toLowerCase()) ||
        entry.channel.toLowerCase().includes(passbookSearchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(passbookSearchTerm.toLowerCase());

      let matchesDate = true;
      if (passbookStartDate) {
        const entryDate = new Date(entry.date).getTime();
        const startDate = new Date(passbookStartDate).getTime();
        if (!isNaN(entryDate) && !isNaN(startDate)) {
          matchesDate = matchesDate && entryDate >= startDate;
        }
      }

      if (passbookEndDate) {
        const entryDate = new Date(entry.date).getTime();
        const endDate = new Date(`${passbookEndDate}T23:59:59`).getTime();
        if (!isNaN(entryDate) && !isNaN(endDate)) {
          matchesDate = matchesDate && entryDate <= endDate;
        }
      }

      return matchesCategory && matchesSearch && matchesDate;
    });
  }, [passbookEntries, passbookCategoryFilter, passbookSearchTerm, passbookStartDate, passbookEndDate]);

  // Print Passbook Functionality
  const handlePrintPassbook = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Module Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-900/50 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Kitabu cha Kumbukumbu & Historia ya Malipo (Payment History & Passbook)
            </h2>
          </div>
          <p className="text-slate-300 text-xs">
            Mwanachama: <span className="font-bold text-white">{currentMember.fullName}</span> ({currentMember.memberNumber}) • {currentInstitution.name}
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700 text-xs shrink-0">
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Risiti Zilizotumwa ({memberProofs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('passbook')}
            className={`px-4 py-2 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'passbook'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Kitabu cha Kumbukumbu (Passbook Ledger)</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PAYMENT HISTORY & RECEIPT VERIFICATION TRACKER */}
      {activeSubTab === 'history' && (
        <div className="space-y-6">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Jumla Risiti Zilizowasilishwa</span>
              <span className="text-xl font-black text-slate-900 dark:text-white block">
                {formatTZS(totalSubmitted)}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {memberProofs.length} Risiti zote
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Zilizoidhinishwa (Approved)</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">
                {formatTZS(totalApproved)}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">
                Zimesajiliwa kwenye Salio
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Inasubiri Uhakiki (Pending)</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 block">
                {formatTZS(totalPending)}
              </span>
              <span className="text-[10px] text-amber-600 font-bold block">
                Admin anaipitia hivi karibuni
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Wajibu wa Mkopo Uliosalia</span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400 block">
                {formatTZS(currentMember.totalLoansOutstanding)}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {activeLoan ? `Rejesho la mwezi: ${formatTZS(activeLoan.monthlyInstallment)}` : 'Huna mkopo wa sasa'}
              </span>
            </div>

          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Tafuta kwa namba ya muamala, mfereji, au dhumuni..."
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
                className="w-full sm:w-80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
              >
                <option value="all">Hali Zote (All Statuses)</option>
                <option value="Approved">Zilizoidhinishwa (Approved)</option>
                <option value="Pending Verification">Zinazosubiri Uhakiki (Pending)</option>
                <option value="Rejected">Zilizokataliwa (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Table list of submitted receipts */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Orodha ya Risiti na Vilivyowasilishwa ({filteredProofs.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-700 font-bold">
                    <th className="p-3.5">Tarehe</th>
                    <th className="p-3.5">Namba ya Muamala (Ref)</th>
                    <th className="p-3.5">Mfereji (Channel)</th>
                    <th className="p-3.5">Dhumuni la Malipo</th>
                    <th className="p-3.5 text-right">Kiasi (TZS)</th>
                    <th className="p-3.5 text-center">Hali ya Uhakiki</th>
                    <th className="p-3.5 text-right">Kitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredProofs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                        Hakuna risiti zilizopatikana katika vigezo hivi.
                      </td>
                    </tr>
                  ) : (
                    filteredProofs.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="p-3.5 font-medium whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {p.submittedDate}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {p.receiptNumber}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                          {p.paymentChannel}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                          {p.paymentType}
                        </td>
                        <td className="p-3.5 text-right font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {formatTZS(p.amount)}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            p.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : p.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {p.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                            {p.status === 'Pending' && <Clock className="w-3 h-3" />}
                            {p.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                            <span>{p.status}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedProofModal(p)}
                            className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Angalia</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: MEMBER BOOKKEEPING & PASSBOOK LEDGER */}
      {activeSubTab === 'passbook' && (
        <div id="printable-passbook" className="space-y-6">
          
          {/* Passbook Controls */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Kitabu cha Kumbukumbu za Kifedha (Member Passbook Ledger)</span>
              </h3>
              <p className="text-slate-500 text-[11px]">
                Inahifadhi kumbukumbu rasmi za kila mwezi za Akiba, Hisa, Marejesho ya Mikopo na Faini.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrintPassbook}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Chapa Passbook (PDF/Print)</span>
              </button>
            </div>
          </div>

          {/* Search & Date-Range Filter Bar for Passbook */}
          <div className="bg-white dark:bg-slate-800 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-center">
              
              {/* Search Bar */}
              <div className="md:col-span-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Search className="w-4 h-4 text-indigo-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Tafuta kumbukumbu, ref, au mfereji..."
                  value={passbookSearchTerm}
                  onChange={(e) => setPassbookSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none font-medium text-slate-900 dark:text-white"
                />
                {passbookSearchTerm && (
                  <button
                    onClick={() => setPassbookSearchTerm('')}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Filter className="w-4 h-4 text-indigo-500 shrink-0" />
                <select
                  value={passbookCategoryFilter}
                  onChange={(e) => setPassbookCategoryFilter(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none font-bold text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="all">Kipengele Chote (All Categories)</option>
                  <option value="Akiba">Akiba (Savings)</option>
                  <option value="Rejesho la Mkopo">Rejesho la Mkopo (Loan Repayments)</option>
                  <option value="Hisa">Hisa (Shares)</option>
                </select>
              </div>

              {/* Date Range Start & End */}
              <div className="md:col-span-5 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <div className="w-full">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block -mb-0.5">Anzia (From):</span>
                    <input
                      type="date"
                      value={passbookStartDate}
                      onChange={(e) => setPassbookStartDate(e.target.value)}
                      className="w-full bg-transparent text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <div className="w-full">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block -mb-0.5">Mwisho (To):</span>
                    <input
                      type="date"
                      value={passbookEndDate}
                      onChange={(e) => setPassbookEndDate(e.target.value)}
                      className="w-full bg-transparent text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Filter Summary & Clear Action */}
            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 font-medium border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full font-extrabold text-[10px] border border-indigo-200 dark:border-indigo-800">
                  Kumbukumbu {filteredPassbook.length} kati ya {passbookEntries.length}
                </span>
                {(passbookSearchTerm || passbookCategoryFilter !== 'all' || passbookStartDate || passbookEndDate) && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">
                    ✓ Filter inafanya kazi
                  </span>
                )}
              </div>

              {(passbookSearchTerm || passbookCategoryFilter !== 'all' || passbookStartDate || passbookEndDate) && (
                <button
                  onClick={() => {
                    setPassbookSearchTerm('');
                    setPassbookCategoryFilter('all');
                    setPassbookStartDate('');
                    setPassbookEndDate('');
                  }}
                  className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Odoa Filters Zote</span>
                </button>
              )}
            </div>
          </div>

          {/* Passbook Table View */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">PASSBOOK SERIAL: ZANZ-PB-2026</span>
                <span className="font-extrabold text-sm">{currentMember.fullName} ({currentMember.memberNumber})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Jumla ya Salio la Akiba</span>
                <span className="font-black text-emerald-400 text-base">{formatTZS(currentMember.totalSavings)}</span>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 border-b border-slate-200 dark:border-slate-700 font-extrabold">
                    <th className="p-3.5">Tarehe</th>
                    <th className="p-3.5">Kipengele (Category)</th>
                    <th className="p-3.5">Maelezo</th>
                    <th className="p-3.5">Namba ya Kumbukumbu</th>
                    <th className="p-3.5">Mfereji</th>
                    <th className="p-3.5 text-right">Kiasi (TZS)</th>
                    <th className="p-3.5 text-center">Hali</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                  {filteredPassbook.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Hakuna kumbukumbu zilizoingizwa kwenye kitabu katika vigezo hivi.
                      </td>
                    </tr>
                  ) : (
                    filteredPassbook.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                        <td className="p-3.5 whitespace-nowrap text-slate-500">
                          {entry.date}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            entry.category === 'Akiba'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : entry.category === 'Rejesho la Mkopo'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {entry.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-900 dark:text-white font-semibold">
                          {entry.description}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                          {entry.reference}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {entry.channel}
                        </td>
                        <td className="p-3.5 text-right font-black text-slate-900 dark:text-white whitespace-nowrap">
                          +{formatTZS(entry.amount)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {entry.status || 'COMPLETED'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (Visible < 640px) */}
            <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredPassbook.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  Hakuna kumbukumbu zilizoingizwa kwenye kitabu katika vigezo hivi.
                </div>
              ) : (
                filteredPassbook.map((entry) => (
                  <div key={entry.id} className="p-4 space-y-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                        entry.category === 'Akiba'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : entry.category === 'Rejesho la Mkopo'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {entry.category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">{entry.date}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-extrabold text-xs text-slate-900 dark:text-white">{entry.description}</p>
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">Ref: {entry.reference}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-sm text-slate-900 dark:text-white">+{formatTZS(entry.amount)}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-extrabold">
                          {entry.status || 'COMPLETED'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
                      <span>Mfereji: <strong className="text-slate-700 dark:text-slate-300">{entry.channel}</strong></span>
                      <span>Passbook ID: <strong className="font-mono text-indigo-600 dark:text-indigo-400">PB-{entry.id.substring(0, 6)}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* Proof Preview Modal */}
      {selectedProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Kielelezo cha Risiti (Receipt Proof Details)</span>
              </h3>
              <button
                onClick={() => setSelectedProofModal(null)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref Number:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedProofModal.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mfereji:</span>
                  <span className="font-semibold">{selectedProofModal.paymentChannel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dhumuni:</span>
                  <span className="font-semibold">{selectedProofModal.paymentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kiasi:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatTZS(selectedProofModal.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hali:</span>
                  <span className="font-bold">{selectedProofModal.status}</span>
                </div>
              </div>

              {selectedProofModal.receiptImage && (
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold block">Picha/Scan ya Risiti:</span>
                  <img
                    src={selectedProofModal.receiptImage}
                    alt="Scan Receipt"
                    className="w-full max-h-60 object-contain rounded-2xl border bg-slate-950 p-2"
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedProofModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-2xl"
            >
              Funga
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
