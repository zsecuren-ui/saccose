import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentProof } from '../../types';
import { downloadCSV, printFormattedReport } from '../../lib/exportUtils';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  User,
  CreditCard,
  Building2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Download,
  CheckSquare,
  Square,
  ListFilter,
  LayoutGrid,
  Printer
} from 'lucide-react';

export const PaymentReceiptVerificationModule: React.FC = () => {
  const { paymentProofs, verifyPaymentProof, currentInstitution, formatTZS } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [rejectionModalProof, setRejectionModalProof] = useState<PaymentProof | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Filter proofs for current institution
  const instProofs = paymentProofs.filter(p => p.tenantId === currentInstitution.id || !p.tenantId);

  const filteredProofs = instProofs.filter(p => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch =
      p.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paymentChannel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = instProofs.filter(p => p.status === 'Pending').length;
  const approvedCount = instProofs.filter(p => p.status === 'Approved').length;
  const rejectedCount = instProofs.filter(p => p.status === 'Rejected').length;
  const approvedSum = instProofs
    .filter(p => p.status === 'Approved')
    .reduce((acc, p) => acc + p.amount, 0);

  // Bulk selection logic
  const handleSelectAll = () => {
    if (selectedIds.length === filteredProofs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProofs.map(p => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    const pendingToApprove = filteredProofs.filter(p => selectedIds.includes(p.id) && p.status === 'Pending');
    if (pendingToApprove.length === 0) {
      alert('Hakuna risiti zinazosubiri idhini kati ya ulizochagua.');
      return;
    }

    if (confirm(`Je, unathibitisha kwa pamoja risiti ${pendingToApprove.length} zenye thamani ya jumla ya TZS ${pendingToApprove.reduce((a, b) => a + b.amount, 0).toLocaleString()}?`)) {
      pendingToApprove.forEach(proof => {
        verifyPaymentProof(proof.id, 'Approved', 'Afisa wa Fedha (Admin)');
      });
      setSelectedIds([]);
      setNotification(`Risiti ${pendingToApprove.length} zimeidhinishwa na kuakisiwa kwenye akiba za wanachama!`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    const pendingToReject = filteredProofs.filter(p => selectedIds.includes(p.id) && p.status === 'Pending');
    if (pendingToReject.length === 0) {
      alert('Hakuna risiti zinazosubiri kati ya ulizochagua.');
      return;
    }

    const reason = prompt(`Andika sababu ya kukataa risiti hizi ${pendingToReject.length}:`, 'Miamala haijapatikana kwenye benki au picha hazisomeki.');
    if (reason !== null) {
      pendingToReject.forEach(proof => {
        verifyPaymentProof(proof.id, 'Rejected', 'Afisa wa Fedha (Admin)', reason);
      });
      setSelectedIds([]);
      setNotification(`Risiti ${pendingToReject.length} zimekataliwa.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleApprove = (proof: PaymentProof) => {
    if (confirm(`Je, unathibitisha kupokea TZS ${proof.amount.toLocaleString()} kutoka kwa ${proof.memberName} (Resiti #: ${proof.receiptNumber})?`)) {
      verifyPaymentProof(proof.id, 'Approved', 'Afisa wa Fedha (Admin)');
      setNotification(`Risiti ya ${proof.memberName} imethibitishwa!`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModalProof) return;
    verifyPaymentProof(rejectionModalProof.id, 'Rejected', 'Afisa wa Fedha (Admin)', rejectionReason || 'Resiti haikusomeka au muamala haukupatikana benki.');
    setRejectionModalProof(null);
    setRejectionReason('');
    setNotification(`Risiti imekataliwa.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = ['Tarehe', 'Mwanachama', 'Namba Mwanachama', 'Aina ya Malipo', 'Kiasi (TZS)', 'Njia/Benki', 'Resiti #', 'Hali', 'Aliyehakiki'];
    const rows = filteredProofs.map(p => [
      p.submittedDate,
      p.memberName,
      p.memberNumber,
      getPaymentTypeLabel(p.paymentType),
      p.amount,
      p.paymentChannel,
      p.receiptNumber,
      p.status,
      p.verifiedBy || '-'
    ]);
    downloadCSV(`Uhakiki_wa_Risiti_${currentInstitution.name.replace(/\s+/g, '_')}`, headers, rows);
  };

  const handlePrintAuditReport = () => {
    const headers = ['Tarehe', 'Mwanachama', 'Namba', 'Aina', 'Kiasi (TZS)', 'Benki/Simu', 'Resiti #', 'Hali'];
    const rows = filteredProofs.map(p => [
      p.submittedDate,
      p.memberName,
      p.memberNumber,
      getPaymentTypeLabel(p.paymentType),
      p.amount,
      p.paymentChannel,
      p.receiptNumber,
      p.status
    ]);
    printFormattedReport(
      `Ripoti ya Audit Log ya Uhakiki wa Risiti za Malipo`,
      `Taasisi: ${currentInstitution.name}`,
      headers,
      rows
    );
  };

  const getPaymentTypeLabel = (type: PaymentProof['paymentType']) => {
    switch (type) {
      case 'SavingsDeposit':
        return 'Akiba ya Mwanachama';
      case 'LoanRepayment':
        return 'Rejesho la Mkopo';
      case 'SharePurchase':
        return 'Ununuzi wa Hisa';
      case 'FinePayment':
        return 'Malipo ya Adhabu/Faini';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
              <FileCheck2 className="w-5 h-5" />
              <span>Audit Log & Centralized Payment Receipts Approval</span>
            </div>
            <h2 className="text-2xl font-black">Uhakiki wa Risiti & Audit Log ya Malipo</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Kagua, idhinisha au kataa risiti za benki na simu za wanachama kwa pamoja (Bulk Verification). Mfumo huakisi salio papo hapo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-md flex items-center gap-2 text-xs transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Pakua Excel (CSV)</span>
            </button>
            <button
              onClick={handlePrintAuditReport}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-md flex items-center gap-2 text-xs transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Chapa / PDF</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Zinazosubiri (Pending)</span>
            <p className="font-black text-amber-400 text-xl">{pendingCount}</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Zilizoakisiwa (Approved)</span>
            <p className="font-black text-emerald-400 text-xl">{approvedCount}</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Jumla ya Fedha Zilizoidhinishwa</span>
            <p className="font-black text-white text-base">{formatTZS(approvedSum)}</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Zilizokataliwa (Rejected)</span>
            <p className="font-black text-rose-400 text-xl">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tafuta mwanachama, resiti # au namba..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Zote ({instProofs.length})
          </button>
          <button
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
              statusFilter === 'Pending'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('Approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
              statusFilter === 'Approved'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('Rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
              statusFilter === 'Rejected'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" /> Rejected ({rejectedCount})
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
              viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
            }`}
            title="Meza ya Audit (Table View)"
          >
            <ListFilter className="w-4 h-4" />
            <span className="hidden sm:inline">Audit Table</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
              viewMode === 'cards' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
            }`}
            title="Kadi (Grid View)"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Kadi</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Controls Bar (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 font-black text-xs">
            <CheckSquare className="w-5 h-5" />
            <span>Zimechaguliwa risiti {selectedIds.length} za wanachama</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Thibitisha Zote ({selectedIds.length})</span>
            </button>
            <button
              onClick={handleBulkReject}
              className="px-4 py-2 bg-rose-900 hover:bg-rose-950 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Kataa Zilizochaguliwa</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 bg-slate-900/20 text-slate-950 font-bold text-xs rounded-xl hover:bg-slate-900/30"
            >
              Ondoa
            </button>
          </div>
        </div>
      )}

      {/* AUDIT LOG CENTRALIZED TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="p-3 w-10 text-center">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      {selectedIds.length === filteredProofs.length && filteredProofs.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Tarehe</th>
                  <th className="p-3">Mwanachama</th>
                  <th className="p-3">Aina ya Malipo</th>
                  <th className="p-3">Kiasi Kilicholipwa</th>
                  <th className="p-3">Njia / Benki</th>
                  <th className="p-3">Resiti / Reference #</th>
                  <th className="p-3">Picha Proof</th>
                  <th className="p-3">Hali</th>
                  <th className="p-3 text-right">Vitendo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                {filteredProofs.map((proof) => {
                  const isChecked = selectedIds.includes(proof.id);
                  return (
                    <tr
                      key={proof.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition ${
                        isChecked ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(proof.id)}
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {proof.submittedDate}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        <div>{proof.memberName}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{proof.memberNumber}</span>
                      </td>
                      <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400">
                        {getPaymentTypeLabel(proof.paymentType)}
                      </td>
                      <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">
                        {formatTZS(proof.amount)}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {proof.paymentChannel}
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border text-slate-900 dark:text-white text-[11px]">
                          {proof.receiptNumber}
                        </span>
                      </td>
                      <td className="p-3">
                        {proof.receiptImage ? (
                          <button
                            onClick={() => setSelectedProof(proof)}
                            className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded-lg flex items-center gap-1 hover:bg-indigo-100 font-bold text-[10px]"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Angalia</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Bila picha</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 w-fit ${
                            proof.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : proof.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {proof.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {proof.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {proof.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                          <span>{proof.status}</span>
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {proof.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(proof)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow-xs flex items-center gap-1"
                              title="Thibitisha"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Thibitisha</span>
                            </button>
                            <button
                              onClick={() => setRejectionModalProof(proof)}
                              className="p-1.5 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200 rounded-lg font-bold text-[11px]"
                              title="Kataa"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {proof.verifiedBy || 'Tayari'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProofs.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <FileCheck2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-slate-600 dark:text-slate-300">Hakuna risiti zilizopatikana kwenye audit log.</p>
            </div>
          )}
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProofs.map(proof => (
            <div
              key={proof.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                proof.status === 'Pending'
                  ? 'border-amber-300 dark:border-amber-900/60'
                  : proof.status === 'Approved'
                  ? 'border-emerald-200 dark:border-emerald-900/60'
                  : 'border-rose-200 dark:border-rose-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                    {proof.memberName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {proof.memberName}
                    </h4>
                    <span className="text-xs text-slate-400">{proof.memberNumber}</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                    proof.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse'
                      : proof.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                  }`}
                >
                  {proof.status === 'Pending' && <Clock className="w-3 h-3" />}
                  {proof.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                  {proof.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                  <span>{proof.status}</span>
                </span>
              </div>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Aina ya Malipo:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {getPaymentTypeLabel(proof.paymentType)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Kiasi Kilicholipwa:</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {formatTZS(proof.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Njia / Benki:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {proof.paymentChannel}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Resiti / Reference #:</span>
                  <span className="font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border text-slate-900 dark:text-white">
                    {proof.receiptNumber}
                  </span>
                </div>
              </div>

              {/* Receipt Image Thumbnail */}
              {proof.receiptImage && (
                <div className="mt-3 flex items-center justify-between bg-slate-100 dark:bg-slate-700/50 p-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <img
                      src={proof.receiptImage}
                      alt="Receipt Proof"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-300 dark:border-slate-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Picha ya Resiti</span>
                      <span className="text-[10px] text-slate-400">Kutoka kwa simu/benki</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProof(proof)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-indigo-500 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Photo
                  </button>
                </div>
              )}

              {proof.notes && (
                <p className="mt-2 text-xs text-slate-500 italic">
                  "{proof.notes}"
                </p>
              )}

              <div className="mt-3 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Iliwasilishwa: {proof.submittedDate}</span>
                {proof.verifiedBy && (
                  <span>Ilihakikiwa na: {proof.verifiedBy}</span>
                )}
              </div>

              {/* Action Buttons for Pending */}
              {proof.status === 'Pending' && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(proof)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Thibitisha & Akisi Salio</span>
                  </button>
                  <button
                    onClick={() => setRejectionModalProof(proof)}
                    className="py-2 px-3 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Kataa</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PHOTO ZOOM MODAL */}
      {selectedProof && selectedProof.receiptImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Picha ya Resiti ya Malipo</h3>
                <p className="text-xs text-slate-500">{selectedProof.memberName} ({selectedProof.receiptNumber})</p>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl overflow-hidden max-h-96 flex items-center justify-center">
              <img
                src={selectedProof.receiptImage}
                alt="Receipt Full"
                className="max-h-96 object-contain w-full"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <span>Kiasi: </span>
                <strong className="text-emerald-600">{formatTZS(selectedProof.amount)}</strong>
              </div>
              <div>
                <span>Kituo: </span>
                <strong>{selectedProof.paymentChannel}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedProof(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 font-bold text-xs rounded-xl"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectionModalProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-rose-600 text-base">Kataa Kithibitisho cha Malipo</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tafadhali andika sababu ya kukataa kithibitisho hiki cha TZS {rejectionModalProof.amount.toLocaleString()} cha {rejectionModalProof.memberName}:
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Mfano: Resiti haionekani vizuri, au namba ya muamala haipo kwenye taarifa ya benki..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setRejectionModalProof(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Thibitisha Kukataa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-emerald-600 dark:text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};
