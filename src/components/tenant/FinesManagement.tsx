import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FinePenalty } from '../../types';
import {
  AlertTriangle,
  PlusCircle,
  CheckCircle,
  XCircle,
  Search,
  DollarSign,
  User,
  Calendar,
  FileText,
  ShieldAlert,
  Clock,
  Filter
} from 'lucide-react';

export const FinesManagement: React.FC = () => {
  const {
    fines,
    members,
    currentInstitution,
    addFine,
    payFine,
    waiveFine,
    formatTZS
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Paid' | 'Waived'>('All');
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Form state for issuing fine
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [fineReason, setFineReason] = useState('Kuchelewa Kikao cha Mwezi');
  const [customReason, setCustomReason] = useState('');
  const [fineAmount, setFineAmount] = useState<number>(10000);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  const tenantMembers = members.filter(m => m.tenantId === currentInstitution.id);
  const tenantFines = fines.filter(f => f.tenantId === currentInstitution.id);

  const filteredFines = tenantFines.filter(f => {
    const matchesSearch = f.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || f.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPendingFines = tenantFines
    .filter(f => f.status === 'Pending')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPaidFines = tenantFines
    .filter(f => f.status === 'Paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const presetReasons = [
    'Kuchelewa Kikao cha Mwezi',
    'Kutohudhuria Mkutano Mkuu Bila Udhuru',
    'Kuchelewa Marejesho ya Mkopo (Penalti)',
    'Ukiukaji wa Kanuni & Akiba za Lazima',
    'Nidhamu Mbaya Kwenye Kikao',
    'Nyenginezo (Bainisha)'
  ];

  const handleIssueFineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      alert('Tafadhali chagua mwanachama!');
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    const finalReason = fineReason === 'Nyenginezo (Bainisha)' ? customReason : fineReason;

    if (!finalReason) {
      alert('Tafadhali ingiza sababu ya faini!');
      return;
    }

    addFine({
      tenantId: currentInstitution.id,
      memberId: member.id,
      memberName: member.fullName,
      reason: finalReason,
      amount: Number(fineAmount),
      dueDate,
      notes
    });

    alert(`Faini ya ${formatTZS(Number(fineAmount))} imewekwa kwa mwanachama ${member.fullName}!`);
    setShowIssueModal(false);
    setSelectedMemberId('');
    setCustomReason('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-900 via-rose-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h2 className="text-xl font-extrabold tracking-tight">Usimamizi wa Faini na Nidhamu ({currentInstitution.name})</h2>
          </div>
          <p className="text-xs text-rose-200/80">
            Kurekodi, kufuatilia, na kukusanya faini za ukiukaji wa sheria, kuchelewa vikao, na penalti za marejesho.
          </p>
        </div>

        <button
          onClick={() => {
            if (tenantMembers.length > 0) {
              setSelectedMemberId(tenantMembers[0].id);
            }
            setShowIssueModal(true);
          }}
          className="px-5 py-3 bg-rose-500 hover:bg-rose-400 text-white font-extrabold rounded-2xl shadow-lg flex items-center gap-2 text-xs transition-transform active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Toa Faini / Adhabu Mpya</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Faini Zinazodaiwa (Pending)</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-rose-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {formatTZS(totalPendingFines)}
          </p>
          <span className="text-[11px] text-slate-500 block">
            {tenantFines.filter(f => f.status === 'Pending').length} Miamala ya Faini
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Faini Zilizolipwa (Collected)</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {formatTZS(totalPaidFines)}
          </p>
          <span className="text-[11px] text-slate-500 block">
            {tenantFines.filter(f => f.status === 'Paid').length} Miamala Zilizolipwa
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Jumla ya Faini Zote</span>
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {tenantFines.length}
          </p>
          <span className="text-[11px] text-slate-500 block">
            Matukio yaliyorekodiwa
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tafuta faini kwa jina la mwanachama au sababu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="All">Hali Zote</option>
            <option value="Pending">Zinazodaiwa (Pending)</option>
            <option value="Paid">Zilizolipwa (Paid)</option>
            <option value="Waived">Zilizosamehewa (Waived)</option>
          </select>
        </div>
      </div>

      {/* Fines Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="p-4">Mwanachama</th>
                <th className="p-4">Sababu ya Faini / Adhabu</th>
                <th className="p-4">Kiasi cha Faini</th>
                <th className="p-4">Tarehe ya Kutoa</th>
                <th className="p-4">Mwisho wa Kulipa</th>
                <th className="p-4">Hali</th>
                <th className="p-4 text-right">Vitendo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredFines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-400 text-xs">
                    Hakuna kumbukumbu za faini au adhabu zilizopatikana.
                  </td>
                </tr>
              ) : (
                filteredFines.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white text-xs">
                      {f.memberName}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-700 dark:text-slate-300 max-w-xs">
                      <div>{f.reason}</div>
                      {f.notes && <span className="text-[10px] text-slate-400 block">{f.notes}</span>}
                    </td>
                    <td className="p-4 font-black text-rose-600 dark:text-rose-400 text-xs">
                      {formatTZS(f.amount)}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {f.issuedDate}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {f.dueDate}
                    </td>
                    <td className="p-4">
                      {f.status === 'Pending' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Inasubiri Malipo
                        </span>
                      )}
                      {f.status === 'Paid' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Imelipwa ({f.paidDate})
                        </span>
                      )}
                      {f.status === 'Waived' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          Imesamehewa
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      {f.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => {
                              if (confirm(`Thibitisha kuwa mwanachama ${f.memberName} amelipa faini ya ${formatTZS(f.amount)}?`)) {
                                payFine(f.id);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-transform active:scale-95"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Unathibitisha kumsamehe faini mwanachama ${f.memberName}?`)) {
                                waiveFine(f.id);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg text-[10px]"
                          >
                            Samehe
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Toa Faini / Adhabu Mpya */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base text-slate-900 dark:text-white">Weka Faini / Adhabu ya Nidhamu</h3>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueFineSubmit} className="space-y-4">
              <div>
                <label className="font-semibold block mb-1 text-xs text-slate-700 dark:text-slate-300">
                  Mwanachama Anayeadhibiwa *
                </label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                >
                  {tenantMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberNumber}) - {m.branch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-xs text-slate-700 dark:text-slate-300">
                  Sababu ya Faini / Aina ya Ukiukaji *
                </label>
                <select
                  value={fineReason}
                  onChange={(e) => setFineReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium"
                >
                  {presetReasons.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {fineReason === 'Nyenginezo (Bainisha)' && (
                <div>
                  <label className="font-semibold block mb-1 text-xs text-slate-700 dark:text-slate-300">
                    Bainisha Sababu ya Faini *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bainisha ukiukaji wa sheria..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-xs text-slate-700 dark:text-slate-300">
                    Kiasi cha Faini (TZS) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={fineAmount}
                    onChange={(e) => setFineAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-rose-600"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-xs text-slate-700 dark:text-slate-300">
                    Mwisho wa Kulipa (Due Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-xs text-slate-700 dark:text-slate-300">
                  Maelezo ya Ziada (Maamuzi ya Kamati ya Nidhamu)
                </label>
                <textarea
                  rows={2}
                  placeholder="Kumbukumbu za kikao au vifungu vya sheria iliyovunjwa..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md transition-transform active:scale-95 text-xs"
                >
                  Sajili na Toa Faini
                </button>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="py-3 px-4 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
                >
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
