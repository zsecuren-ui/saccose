import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Loan } from '../../types';
import { downloadCSV, printFormattedReport } from '../../lib/exportUtils';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  UserCheck,
  ChevronRight,
  AlertCircle,
  Download,
  Printer,
  PlusCircle,
  Settings,
  Percent,
  Calculator,
  User,
  Sparkles,
  Edit3,
  Save,
  Info
} from 'lucide-react';

export const LoanManagement: React.FC = () => {
  const {
    loans,
    members,
    currentInstitution,
    approveLoanStep,
    rejectLoan,
    formatTZS,
    makeRepayment,
    issueDirectLoan,
    updateLoanTerms,
    updateInstitutionLoanRates
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [approverName, setApproverName] = useState('Jane Lyimo (Meneja)');
  const [approvalComment, setApprovalComment] = useState('Imeidhinishwa baada ya kukagua dhamana.');
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayAmount, setRepayAmount] = useState<number>(444243);

  // Direct Loan Creation State
  const [showCreateLoanModal, setShowCreateLoanModal] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState<string>('');
  const [newLoanType, setNewLoanType] = useState<string>('Mkopo wa Mkono');
  const [isCustomLoanType, setIsCustomLoanType] = useState<boolean>(false);
  const [customLoanName, setCustomLoanName] = useState<string>('');
  const [newLoanAmount, setNewLoanAmount] = useState<number>(1000000);
  const [newLoanInterestRate, setNewLoanInterestRate] = useState<number>(10);
  const [newLoanDuration, setNewLoanDuration] = useState<number>(12);
  const [newLoanPurpose, setNewLoanPurpose] = useState<string>('Mkopo wa dharura/mkono kwa ajili ya mahitaji binafsi');
  const [disburseImmediately, setDisburseImmediately] = useState<boolean>(true);

  // Institution Rate Settings Modal State
  const [showRateSettingsModal, setShowRateSettingsModal] = useState(false);
  const [handLoanRate, setHandLoanRate] = useState<number>(
    currentInstitution.loanInterestRates?.['Mkopo wa Mkono'] || 10
  );
  const [emergencyRate, setEmergencyRate] = useState<number>(
    currentInstitution.loanInterestRates?.['Dharura'] || 8
  );
  const [businessRate, setBusinessRate] = useState<number>(
    currentInstitution.loanInterestRates?.['Biashara'] || 12
  );
  const [agriRate, setAgriRate] = useState<number>(
    currentInstitution.loanInterestRates?.['Kilimo'] || 9
  );
  const [eduRate, setEduRate] = useState<number>(
    currentInstitution.loanInterestRates?.['Elimu'] || 10
  );
  const [constructionRate, setConstructionRate] = useState<number>(
    currentInstitution.loanInterestRates?.['Ujenzi'] || 12
  );
  const [defaultRate, setDefaultRate] = useState<number>(
    currentInstitution.defaultInterestRateAnnual || 10
  );

  // In-review adjustment state
  const [editAmountApproved, setEditAmountApproved] = useState<number>(0);
  const [editInterestRate, setEditInterestRate] = useState<number>(0);
  const [editDurationMonths, setEditDurationMonths] = useState<number>(0);
  const [isEditingTerms, setIsEditingTerms] = useState(false);

  const tenantLoans = loans.filter(l => l.tenantId === currentInstitution.id);
  const tenantMembers = members.filter(m => m.tenantId === currentInstitution.id);

  const filteredLoans = tenantLoans.filter(l => {
    if (statusFilter === 'All') return true;
    return l.status === statusFilter;
  });

  const totalOutstanding = tenantLoans
    .filter(l => l.status === 'Active')
    .reduce((acc, curr) => acc + curr.remainingBalance, 0);

  const totalRepaidAmount = tenantLoans
    .reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);

  const totalDisbursed = tenantLoans
    .filter(l => l.status === 'Active' || l.status === 'Completed')
    .reduce((acc, curr) => acc + (curr.amountApproved || curr.amountRequested || 0), 0);

  const pendingCount = tenantLoans.filter(l => l.status === 'Under Review' || l.status === 'Applied').length;

  const handleOpenReview = (loan: Loan) => {
    setSelectedLoan(loan);
    setEditAmountApproved(loan.amountApproved || loan.amountRequested);
    setEditInterestRate(loan.interestRateAnnual || 10);
    setEditDurationMonths(loan.durationMonths || 12);
    setIsEditingTerms(false);
  };

  const handleSaveTerms = (loanId: string) => {
    updateLoanTerms(loanId, {
      amountApproved: editAmountApproved,
      interestRateAnnual: editInterestRate,
      durationMonths: editDurationMonths
    });
    // update local reference
    if (selectedLoan && selectedLoan.id === loanId) {
      setSelectedLoan({
        ...selectedLoan,
        amountApproved: editAmountApproved,
        interestRateAnnual: editInterestRate,
        durationMonths: editDurationMonths
      });
    }
    setIsEditingTerms(false);
    alert('Masharti ya mkopo (kiasi & riba) yamesasishwa kikamilifu!');
  };

  const handleApproveStep = (loan: Loan, stepNum: number) => {
    // If terms were adjusted, make sure they are saved first
    if (isEditingTerms) {
      updateLoanTerms(loan.id, {
        amountApproved: editAmountApproved,
        interestRateAnnual: editInterestRate,
        durationMonths: editDurationMonths
      });
    }
    approveLoanStep(loan.id, stepNum, approverName, approvalComment);
    setSelectedLoan(null);
  };

  const handleReject = (loan: Loan) => {
    rejectLoan(loan.id, approvalComment || 'Maombi yamekataliwa.');
    setSelectedLoan(null);
  };

  const handleManualRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || repayAmount <= 0) return;

    makeRepayment(selectedLoan.id, repayAmount, 'M-Pesa');
    setShowRepayModal(false);
    setSelectedLoan(null);
    alert('Marejesho yamesajiliwa kikamilifu!');
  };

  // Direct Loan Form Handlers
  const handleLoanTypeSelect = (type: string) => {
    setNewLoanType(type);
    if (type === 'custom') {
      setIsCustomLoanType(true);
    } else {
      setIsCustomLoanType(false);
      // Auto-populate interest rate based on institution config
      if (currentInstitution.loanInterestRates && currentInstitution.loanInterestRates[type]) {
        setNewLoanInterestRate(currentInstitution.loanInterestRates[type]);
      } else if (type === 'Mkopo wa Mkono') {
        setNewLoanInterestRate(10);
      } else if (type === 'Dharura') {
        setNewLoanInterestRate(8);
      } else if (type === 'Biashara') {
        setNewLoanInterestRate(12);
      } else if (type === 'Kilimo') {
        setNewLoanInterestRate(9);
      } else if (type === 'Elimu') {
        setNewLoanInterestRate(10);
      } else {
        setNewLoanInterestRate(currentInstitution.defaultInterestRateAnnual || 10);
      }
    }
  };

  const handleCreateDirectLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveMemberId = targetMemberId || (tenantMembers[0]?.id ?? '');
    if (!effectiveMemberId) {
      alert('Tafadhali chagua mwanachama.');
      return;
    }

    if (newLoanAmount <= 0) {
      alert('Tafadhali ingiza kiasi halali cha mkopo.');
      return;
    }

    const resolvedLoanType = isCustomLoanType ? (customLoanName.trim() || 'Mkopo Maalum') : newLoanType;

    issueDirectLoan({
      memberId: effectiveMemberId,
      amount: newLoanAmount,
      durationMonths: newLoanDuration,
      interestRateAnnual: newLoanInterestRate,
      loanType: resolvedLoanType,
      customLoanTypeName: isCustomLoanType ? customLoanName.trim() : undefined,
      purpose: newLoanPurpose,
      disburseImmediately
    });

    setShowCreateLoanModal(false);
    alert(`Mkopo wa ${formatTZS(newLoanAmount)} (${resolvedLoanType}) wenye riba ya ${newLoanInterestRate}% umesajiliwa kikamilifu!`);
  };

  const handleSaveInstitutionRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstitutionLoanRates(
      {
        'Mkopo wa Mkono': handLoanRate,
        'Dharura': emergencyRate,
        'Biashara': businessRate,
        'Kilimo': agriRate,
        'Elimu': eduRate,
        'Ujenzi': constructionRate
      },
      defaultRate
    );
    setShowRateSettingsModal(false);
    alert('Viwango vya riba vya taasisi vimesasishwa kikamilifu!');
  };

  // Preview calculations for new loan
  const calcRate = newLoanInterestRate / 100 / 12;
  const calcInstallment = calcRate === 0
    ? Math.round(newLoanAmount / newLoanDuration)
    : Math.round((newLoanAmount * calcRate * Math.pow(1 + calcRate, newLoanDuration)) / (Math.pow(1 + calcRate, newLoanDuration) - 1));
  const calcTotalRepayable = calcInstallment * newLoanDuration;
  const calcTotalInterest = Math.max(0, calcTotalRepayable - newLoanAmount);

  return (
    <div id="loan-management-view" className="space-y-6 text-xs">
      
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Disbursed Loans */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Jumla ya Mikopo Iliyotolewa</span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
              {formatTZS(totalDisbursed)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{tenantLoans.length} Mikopo Yote</span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Repaid Amount - KIASI CHA MKOPO KILICHOREJESHWA */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold">Kiasi cha Mkopo Kilichorejeshwa</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatTZS(totalRepaidAmount)}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
              {totalDisbursed > 0 ? `${((totalRepaidAmount / totalDisbursed) * 100).toFixed(1)}% Imerejeshwa` : '0%'}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Remaining / Outstanding */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Baki la Mikopo Inayoendelea</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {formatTZS(totalOutstanding)}
            </span>
            <span className="text-[10px] text-amber-600 mt-0.5 block font-semibold">
              Mikopo {tenantLoans.filter(l => l.status === 'Active').length} Hai
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/40 text-amber-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Maombi Yanayosubiri Idhini</span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
              {pendingCount} Maombi
            </span>
            <span className="text-[10px] text-indigo-500 mt-0.5 block font-semibold">Hatua za Idhini (Pipeline)</span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Action Bar & Quick Buttons */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        
        {/* Status Filters */}
        <div className="flex gap-1.5 overflow-x-auto w-full lg:w-auto text-xs font-semibold">
          {['All', 'Under Review', 'Active', 'Completed', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl border transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {st === 'All' ? 'Mikopo Yote' : st === 'Under Review' ? 'Inayopitiwa' : st === 'Active' ? 'Mikopo Hai' : st === 'Completed' ? 'Imemalizika' : 'Imekataliwa'}
            </button>
          ))}
        </div>

        {/* Action Buttons: Toa Mkopo Mpya + Mipangilio ya Riba + Export */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          
          {/* TOA MKOPO MPYA BUTTON */}
          <button
            onClick={() => {
              if (tenantMembers.length > 0) setTargetMemberId(tenantMembers[0].id);
              setShowCreateLoanModal(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl flex items-center gap-1.5 shadow-sm transition-all text-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Toa Mkopo Mpya</span>
          </button>

          {/* MIPANGILIO YA RIBA YA TAASISI BUTTON */}
          <button
            onClick={() => setShowRateSettingsModal(true)}
            className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 font-bold rounded-xl flex items-center gap-1.5 transition-colors text-xs cursor-pointer"
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Viwango vya Riba (%)</span>
          </button>

          <button
            onClick={() => {
              const headers = ['Mwanachama', 'Aina ya Mkopo', 'Kiasi Kilichoidhinishwa (TZS)', 'Kiasi Kilichorejeshwa (TZS)', 'Baki la Deni (TZS)', 'Riba (%)', 'Muda (Miezi)', 'Hali'];
              const rows = filteredLoans.map(l => [l.memberName, l.loanType, l.amountApproved || l.amountRequested, l.totalPaid || 0, l.remainingBalance, `${l.interestRateAnnual || 10}%`, l.durationMonths, l.status]);
              downloadCSV(`Ripoti_ya_Mikopo_${currentInstitution.name.replace(/\s+/g, '_')}`, headers, rows);
            }}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors text-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          
          <button
            onClick={() => {
              const headers = ['Mwanachama', 'Aina', 'Idhinisho (TZS)', 'Kiasi Kilichorejeshwa (TZS)', 'Baki (TZS)', 'Riba', 'Hali'];
              const rows = filteredLoans.map(l => [l.memberName, l.loanType, l.amountApproved || l.amountRequested, l.totalPaid || 0, l.remainingBalance, `${l.interestRateAnnual || 10}%`, l.status]);
              printFormattedReport(`Ripoti Kuu ya Mikopo`, `Taasisi: ${currentInstitution.name}`, headers, rows);
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors text-xs border border-slate-700 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Chapa</span>
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="p-4">Mwanachama</th>
                <th className="p-4">Aina ya Mkopo</th>
                <th className="p-4">Kiasi cha Mkopo</th>
                <th className="p-4 text-emerald-600 dark:text-emerald-400">Kiasi Kilichorejeshwa</th>
                <th className="p-4">Baki la Deni</th>
                <th className="p-4">Riba & Muda</th>
                <th className="p-4">Hali</th>
                <th className="p-4 text-right">Hatua</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    Hakuna mikopo inayopatikana kwenye kichujio hiki.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const totalTarget = loan.totalRepayable || loan.amountApproved || loan.amountRequested || 1;
                  const percentRepaid = Math.min(100, Math.max(0, ((loan.totalPaid || 0) / totalTarget) * 100));
                  const effectiveRate = loan.interestRateAnnual !== undefined ? loan.interestRateAnnual : 10;

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <span>{loan.memberName}</span>
                        <span className="block text-[10px] text-slate-400 font-mono font-normal">{loan.memberNumber}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                            {loan.loanType}
                          </span>
                          {loan.customLoanTypeName && (
                            <span className="text-[9px] text-slate-400 italic">Imeandikwa kwa mkono</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <span>{formatTZS(loan.amountApproved || loan.amountRequested)}</span>
                        {loan.amountApproved && loan.amountApproved !== loan.amountRequested && (
                          <span className="block text-[10px] text-slate-400 font-normal">Ombi: {formatTZS(loan.amountRequested)}</span>
                        )}
                      </td>
                      {/* KIASI KILICHOREJESHWA COLUMN */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block text-xs">
                            {formatTZS(loan.totalPaid || 0)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${percentRepaid}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              {percentRepaid.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-amber-600 dark:text-amber-400">
                        {formatTZS(loan.remainingBalance)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                          <span>{effectiveRate}% p.a</span>
                          <span className="text-slate-400 font-normal">• {loan.durationMonths} Miezi</span>
                        </div>
                        <span className="block text-[10px] text-slate-400">{formatTZS(loan.monthlyInstallment)} / mwezi</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            loan.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                              : loan.status === 'Under Review'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 animate-pulse'
                              : loan.status === 'Completed'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenReview(loan)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-[10px] cursor-pointer"
                        >
                          Kagua / Rekebisha Riba
                        </button>
                        {loan.status === 'Active' && (
                          <button
                            onClick={() => {
                              setSelectedLoan(loan);
                              setShowRepayModal(true);
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                          >
                            Rekodi Rejesho
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TOA MKOPO MPYA / SAJILI MKOPO WA MWANACHAMA */}
      {showCreateLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-2xl w-full space-y-5 shadow-2xl my-8">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Toa Mkopo Mpya kwa Mwanachama</h3>
                  <p className="text-slate-500 text-xs">Weka kiwango cha riba, muda na aina ya mkopo kulingana na sera ya taasisi.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateLoanModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDirectLoanSubmit} className="space-y-4 text-xs">
              
              {/* Member Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chagua Mwanachama (Member) *
                </label>
                <select
                  required
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                >
                  <option value="">-- Chagua Mwanachama --</option>
                  {tenantMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberNumber}) - Akiba: {formatTZS(m.totalSavings)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Type Selection (Includes Mkopo wa Mkono & Custom Typed) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Aina ya Mkopo (Loan Product / Type) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Mkopo wa Mkono', label: 'Mkopo wa Mkono', defaultR: 10, desc: 'Pesa taslimu / Papo hapo' },
                    { id: 'Dharura', label: 'Mkopo wa Dharura', defaultR: 8, desc: 'Dharura za haraka' },
                    { id: 'Biashara', label: 'Mkopo wa Biashara', defaultR: 12, desc: 'Mtaji wa biashara' },
                    { id: 'Kilimo', label: 'Mkopo wa Kilimo', defaultR: 9, desc: 'Pembejeo & Mazao' },
                    { id: 'Elimu', label: 'Mkopo wa Elimu', defaultR: 10, desc: 'Ada za shule/chuo' },
                    { id: 'custom', label: '✍️ Andika kwa Mkono', defaultR: 10, desc: 'Aina nyingine maalum' }
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => handleLoanTypeSelect(t.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        (isCustomLoanType && t.id === 'custom') || (!isCustomLoanType && newLoanType === t.id)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-300 dark:ring-indigo-900 font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-extrabold text-[11px] block">{t.label}</span>
                      <span className={`text-[9px] ${((isCustomLoanType && t.id === 'custom') || (!isCustomLoanType && newLoanType === t.id)) ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Loan Type Input */}
                {isCustomLoanType && (
                  <div className="mt-2.5 p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 animate-in fade-in duration-150 space-y-1">
                    <label className="font-extrabold text-indigo-900 dark:text-indigo-300 block text-[11px]">
                      Andika Jina / Aina ya Mkopo kwa Mkono (Custom Loan Name):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="k.m. Mkopo wa Bodaboda, Mkopo wa Mifugo, Mkopo wa Nyumba..."
                      value={customLoanName}
                      onChange={(e) => setCustomLoanName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Amount, Interest Rate %, and Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Loan Amount */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kiasi cha Mkopo (TZS) *
                  </label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={10000}
                    value={newLoanAmount}
                    onChange={(e) => setNewLoanAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-sm"
                  />
                </div>

                {/* RIBA YA MKOPO (%) - SET BY INSTITUTION */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Riba ya Mkopo (% kwa Mwaka) *
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      step={0.5}
                      value={newLoanInterestRate}
                      onChange={(e) => setNewLoanInterestRate(Number(e.target.value))}
                      className="w-full p-2.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-sm text-indigo-600 dark:text-indigo-400"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400">%</span>
                  </div>
                </div>

                {/* Duration in Months */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Muda (Miezi) *
                  </label>
                  <select
                    value={newLoanDuration}
                    onChange={(e) => setNewLoanDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  >
                    {[1, 2, 3, 6, 9, 12, 18, 24, 36, 48].map(m => (
                      <option key={m} value={m}>{m} Miezi {m >= 12 ? `(${(m/12).toFixed(1)} Mwaka)` : ''}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Purpose / Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lengo / Madhumuni ya Mkopo
                </label>
                <input
                  type="text"
                  required
                  value={newLoanPurpose}
                  onChange={(e) => setNewLoanPurpose(e.target.value)}
                  placeholder="k.m. Mtaji wa kuendeleza biashara..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {/* Calculation Preview Box */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs">Makadirio ya Marejesho (Riba: {newLoanInterestRate}%)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Miezi {newLoanDuration}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Rejesho / Mwezi</span>
                    <span className="font-extrabold text-emerald-400 text-xs">{formatTZS(calcInstallment)}</span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Jumla ya Riba</span>
                    <span className="font-extrabold text-amber-400 text-xs">{formatTZS(calcTotalInterest)}</span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Jumla ya Kurudisha</span>
                    <span className="font-extrabold text-white text-xs">{formatTZS(calcTotalRepayable)}</span>
                  </div>
                </div>
              </div>

              {/* Immediate Disbursement Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-xs">Kutoa Pesa Moja kwa Moja (Disburse Immediately)</span>
                  <span className="text-[10px] text-slate-500">Mkopo utakuwa "Active" na kuingizwa kwenye leja ya mwanachama sasa hivi.</span>
                </div>
                <input
                  type="checkbox"
                  checked={disburseImmediately}
                  onChange={(e) => setDisburseImmediately(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Thibitisha na Sajili Mkopo
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateLoanModal(false)}
                  className="py-3 px-5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Ghairi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: MIPANGILIO YA VIWANGO VYA RIBA VYA TAASISI */}
      {showRateSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg w-full space-y-5 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-2xl">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Viwango vya Riba vya Taasisi</h3>
                  <p className="text-slate-500 text-xs">Sanidi viwango vya riba vya mikopo kwa ajili ya {currentInstitution.name}.</p>
                </div>
              </div>
              <button
                onClick={() => setShowRateSettingsModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInstitutionRates} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                
                {/* Mkopo wa Mkono Rate */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                    Mkopo wa Mkono (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={handLoanRate}
                      onChange={(e) => setHandLoanRate(Number(e.target.value))}
                      className="w-full p-2 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-extrabold text-indigo-600"
                    />
                    <span className="absolute right-2.5 top-2 font-bold text-slate-400">%</span>
                  </div>
                </div>

                {/* Mkopo wa Dharura Rate */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                    Mkopo wa Dharura (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={emergencyRate}
                      onChange={(e) => setEmergencyRate(Number(e.target.value))}
                      className="w-full p-2 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-extrabold text-indigo-600"
                    />
                    <span className="absolute right-2.5 top-2 font-bold text-slate-400">%</span>
                  </div>
                </div>

                {/* Mkopo wa Biashara Rate */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                    Mkopo wa Biashara (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={businessRate}
                      onChange={(e) => setBusinessRate(Number(e.target.value))}
                      className="w-full p-2 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-extrabold text-indigo-600"
                    />
                    <span className="absolute right-2.5 top-2 font-bold text-slate-400">%</span>
                  </div>
                </div>

                {/* Mkopo wa Kilimo Rate */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                    Mkopo wa Kilimo (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={agriRate}
                      onChange={(e) => setAgriRate(Number(e.target.value))}
                      className="w-full p-2 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-extrabold text-indigo-600"
                    />
                    <span className="absolute right-2.5 top-2 font-bold text-slate-400">%</span>
                  </div>
                </div>

                {/* Mkopo wa Elimu Rate */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                    Mkopo wa Elimu (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={eduRate}
                      onChange={(e) => setEduRate(Number(e.target.value))}
                      className="w-full p-2 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-extrabold text-indigo-600"
                    />
                    <span className="absolute right-2.5 top-2 font-bold text-slate-400">%</span>
                  </div>
                </div>

                {/* Mkopo wa Ujenzi Rate */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                    Mkopo wa Ujenzi (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={constructionRate}
                      onChange={(e) => setConstructionRate(Number(e.target.value))}
                      className="w-full p-2 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-extrabold text-indigo-600"
                    />
                    <span className="absolute right-2.5 top-2 font-bold text-slate-400">%</span>
                  </div>
                </div>

              </div>

              {/* Default General Rate */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                  Riba ya Msingi kwa Mikopo Mipya / Maalum (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={defaultRate}
                    onChange={(e) => setDefaultRate(Number(e.target.value))}
                    className="w-full p-2 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-extrabold text-indigo-600"
                  />
                  <span className="absolute right-2.5 top-2 font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Hifadhi Viwango vya Riba
                </button>
                <button
                  type="button"
                  onClick={() => setShowRateSettingsModal(false)}
                  className="py-3 px-5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Funga
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Approval Workflow & In-Review Interest Adjustment Modal */}
      {selectedLoan && !showRepayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-2xl w-full space-y-4 shadow-2xl my-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Kagua & Idhinisha Mkopo (Loan Review & Custom Terms)
                </h3>
                <p className="text-slate-500 text-xs">
                  Mkopo #{selectedLoan.id} • {selectedLoan.memberName} ({selectedLoan.memberNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedLoan(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Loan Overview & Terms Adjustment Section */}
            <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Masharti ya Mkopo (Kiasi & Riba Iliyowekwa na Taasisi)</span>
                </span>
                
                {!isEditingTerms ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingTerms(true)}
                    className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-100"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Rekebisha Riba / Kiasi</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveTerms(selectedLoan.id)}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-emerald-500 shadow-xs"
                  >
                    <Save className="w-3 h-3" />
                    <span>Hifadhi Mabadiliko</span>
                  </button>
                )}
              </div>

              {!isEditingTerms ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Kiasi cha Mkopo</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {formatTZS(selectedLoan.amountApproved || selectedLoan.amountRequested)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Riba ya Mkopo</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">
                      {selectedLoan.interestRateAnnual || 10}% p.a
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Muda & Rejesho</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedLoan.durationMonths} Miezi ({formatTZS(selectedLoan.monthlyInstallment)}/mwezi)
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Aina ya Mkopo</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedLoan.loanType}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="font-bold text-[10px] text-slate-600 dark:text-slate-300 block mb-1">
                        Kiasi Kilichoidhinishwa (TZS)
                      </label>
                      <input
                        type="number"
                        min={10000}
                        step={10000}
                        value={editAmountApproved}
                        onChange={(e) => setEditAmountApproved(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[10px] text-slate-600 dark:text-slate-300 block mb-1">
                        Riba ya Mkopo (% kwa Mwaka)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={editInterestRate}
                        onChange={(e) => setEditInterestRate(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 font-extrabold text-indigo-600 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[10px] text-slate-600 dark:text-slate-300 block mb-1">
                        Muda wa Marejesho (Miezi)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={editDurationMonths}
                        onChange={(e) => setEditDurationMonths(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 italic">
                      * Mabadiliko haya yatakokotoa upya rejesho la mwezi na ratiba ya marejesho.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSaveTerms(selectedLoan.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
                    >
                      Hifadhi Masharti Mapya
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Purpose */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block">Lengo / Madhumuni ya Mkopo:</span>
              <p className="text-slate-700 dark:text-slate-300 font-medium italic mt-0.5">"{selectedLoan.purpose}"</p>
            </div>

            {/* Approval Workflow Steps */}
            <div className="space-y-2.5 pt-1">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Hatua za Idhini (Approval Pipeline)</h4>
              
              {selectedLoan.approvalSteps.map((step) => (
                <div key={step.step} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Hatua {step.step}: {step.roleName}
                    </span>
                    {step.approverName && (
                      <span className="text-[10px] text-slate-500 block">Imeidhinishwa na {step.approverName} ({step.date})</span>
                    )}
                    {step.comment && (
                      <span className="text-[10px] text-slate-600 italic block">"{step.comment}"</span>
                    )}
                  </div>

                  <div>
                    {step.status === 'Approved' ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Imethibitishwa
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApproveStep(selectedLoan, step.step)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-[11px] cursor-pointer shadow-xs"
                      >
                        Thibitisha Hatua Hii
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
              <button
                onClick={() => handleReject(selectedLoan)}
                className="py-2.5 px-4 bg-rose-100 text-rose-800 hover:bg-rose-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                Kataa Maombi
              </button>
              <button
                onClick={() => setSelectedLoan(null)}
                className="py-2.5 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Funga
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Manual Repayment Entry Modal */}
      {showRepayModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Rekodi Marejesho ya Mkopo</h3>
            <p className="text-slate-500 text-xs">Mwanachama: {selectedLoan.memberName}</p>

            <form onSubmit={handleManualRepaySubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Kiasi cha Marejesho (TZS)</label>
                <input
                  type="number"
                  required
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-emerald-600 text-sm"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer">
                  Thibitisha Malipo
                </button>
                <button type="button" onClick={() => setShowRepayModal(false)} className="py-2.5 px-4 bg-slate-200 dark:bg-slate-700 rounded-xl cursor-pointer">
                  Ghairi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
