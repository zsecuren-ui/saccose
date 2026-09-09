import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { MemberEditProfileModal } from '../common/MemberEditProfileModal';
import { MemberAvatar } from '../common/MemberAvatar';
import { MemberPhotoModal } from '../common/MemberPhotoModal';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { BulkRegistrationForm } from '../member/BulkRegistrationForm';
import { downloadCSV, printFormattedReport } from '../../lib/exportUtils';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  FileText,
  Phone,
  Mail,
  CreditCard,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Download,
  Edit3,
  Trash2,
  Printer,
  KeyRound,
  Camera,
  Upload,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

export const MemberManagement: React.FC = () => {
  const { members, currentInstitution, addMember, addBatchMembers, deleteMember, updateMemberCredentials, formatTZS, setCurrentMemberId, setActiveRole } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [addMode, setAddMode] = useState<'single' | 'batch'>('single');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [credMember, setCredMember] = useState<Member | null>(null);
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);

  // Single Member Form State
  const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
  const [showRegCameraModal, setShowRegCameraModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idType, setIdType] = useState<'NIDA' | 'Voter ID' | 'Passport'>('NIDA');
  const [idNumber, setIdNumber] = useState('');
  const [occupation, setOccupation] = useState('');
  const [branch, setBranch] = useState('Makao Makuu - Mwenge');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinRel, setNextOfKinRel] = useState('Mke');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');

  // Batch Form State
  const [batchCount, setBatchCount] = useState<number>(50);
  const [batchPrefix, setBatchPrefix] = useState('Mwanachama');
  const [batchBranch, setBatchBranch] = useState('Makao Makuu - Mwenge');

  const maxCapacity = currentInstitution.maxMembers || 5000;
  const tenantMembers = members.filter(m => m.tenantId === currentInstitution.id);
  const remainingSlots = Math.max(0, maxCapacity - tenantMembers.length);
  const capacityPercent = Math.min(100, Math.round((tenantMembers.length / maxCapacity) * 100));

  const normalizedSearchTerm = String(searchTerm ?? '').toLowerCase();
  const filteredMembers = tenantMembers.filter(m =>
    String(m?.fullName ?? '').toLowerCase().includes(normalizedSearchTerm) ||
    String(m?.memberNumber ?? '').toLowerCase().includes(normalizedSearchTerm) ||
    String(m?.phone ?? '').includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (addMode === 'batch') {
      if (batchCount < 1) return;
      if (batchCount > 5000) {
        alert('Kikomo cha kusajili kwa mkupuo ni wanachama 5,000 kwa mara moja.');
        return;
      }
      addBatchMembers(batchCount, batchPrefix, batchBranch);
      alert(`Wanachama ${batchCount} wamesajiliwa kwa mkupuo kikamilifu!`);
      setShowAddModal(false);
      return;
    }

    if (!fullName || !phone) return;

    addMember({
      tenantId: currentInstitution.id,
      fullName,
      phone,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      idType,
      idNumber: idNumber || '19900101-11111-00001-00',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      occupation: occupation || 'Mjasiriamali',
      status: 'Active',
      branch,
      nextOfKin: {
        fullName: nextOfKinName || 'N/A',
        relationship: nextOfKinRel,
        phone: nextOfKinPhone || phone,
        percentageShare: 100
      }
    });

    setFullName('');
    setPhone('');
    setEmail('');
    setIdNumber('');
    setShowAddModal(false);
  };

  return (
    <div id="member-management-view" className="space-y-6 text-xs">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Usimamizi wa Wanachama ({tenantMembers.length.toLocaleString()} / {maxCapacity.toLocaleString()})
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Orodha na usajili wa wanachama wote wa {currentInstitution.name} (Uwezo: Hadi wanachama {maxCapacity.toLocaleString()})
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const headers = ['Namba Mwanachama', 'Jina Bupe', 'Simu', 'Barua Pepe', 'Tawi', 'Kazi', 'Akiba Zote', 'Hisa Zote', 'Baki la Mkopo', 'Hali'];
              const rows = filteredMembers.map(m => [m.memberNumber, m.fullName, m.phone, m.email, m.branch, m.occupation, m.totalSavings, m.totalShares, m.totalLoansOutstanding, m.status]);
              downloadCSV(`Orodha_ya_Wanachama_${currentInstitution.name.replace(/\s+/g, '_')}`, headers, rows);
            }}
            className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Excel (CSV)</span>
          </button>
          <button
            onClick={() => {
              const headers = ['Namba', 'Jina Bupe', 'Simu', 'Tawi', 'Akiba (TZS)', 'Hisa (TZS)', 'Mkopo (TZS)'];
              const rows = filteredMembers.map(m => [m.memberNumber, m.fullName, m.phone, m.branch, m.totalSavings, m.totalShares, m.totalLoansOutstanding]);
              printFormattedReport(`Orodha Kuu ya Wanachama`, `Taasisi: ${currentInstitution.name}`, headers, rows);
            }}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors text-xs border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Chapa / PDF</span>
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors text-xs"
            title="Sajili wanachama kwa mkupuo au pakia CSV ya wanachama hadi 5,000"
          >
            <Upload className="w-4 h-4" />
            <span>Sajili kwa Mkupuo / CSV (5,000)</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Sajili Mwanachama Mpya</span>
          </button>
        </div>
      </div>

      {/* Capacity & Subscription Banner */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-emerald-950 dark:text-emerald-200 text-xs">
                Uwezo wa Kusajili Wanachama: {tenantMembers.length.toLocaleString()} / {maxCapacity.toLocaleString()}
              </span>
              <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 rounded-full font-black text-[10px]">
                {capacityPercent}% Imetumika
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              Taasisi yako imeruhusiwa kusajili hadi <strong>wanachama 5,000</strong>. Nafasi zilizobaki: <strong>{remainingSlots.toLocaleString()}</strong>.
            </p>
          </div>
        </div>
        <div className="w-full md:w-56 space-y-1">
          <div className="h-2.5 w-full bg-emerald-200 dark:bg-emerald-900/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
            <span>0</span>
            <span>Upeo: {maxCapacity.toLocaleString()} Wanachama</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tafuta mwanachama kwa jina, namba, au simu..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
          <span>Inaonyesha kwa ukurasa:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="p-4">Mwanachama</th>
                <th className="p-4">Namba ya Uanachama</th>
                <th className="p-4">Mawasiliano</th>
                <th className="p-4">Akiba Zote</th>
                <th className="p-4">Hisa Zote</th>
                <th className="p-4">Mkopo Unaoendelea</th>
                <th className="p-4 text-right">Vitendo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <MemberAvatar
                        name={m.fullName}
                        photoUrl={m.photoUrl}
                        size="sm"
                        shape="xl"
                        showZoomIcon
                        onClick={() => setSelectedMember(m)}
                      />
                      <div>
                        <span className="block text-xs">{m.fullName}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{m.occupation}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {m.memberNumber}
                    </td>
                    <td className="p-4">
                      <span className="block font-medium">{m.phone}</span>
                      <span className="block text-[10px] text-slate-400">{m.email}</span>
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatTZS(m.totalSavings)}
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                      {formatTZS(m.totalShares)}
                    </td>
                    <td className="p-4 font-bold text-amber-600 dark:text-amber-400">
                      {formatTZS(m.totalLoansOutstanding)}
                    </td>
                    <td className="p-4 text-right space-x-1.5 flex items-center justify-end">
                      <button
                        onClick={() => {
                          setCredMember(m);
                          setCredUsername(m.username || m.fullName.toLowerCase().replace(/\s+/g, '_'));
                          setCredPassword(m.password || 'Password123!');
                        }}
                        className="p-2 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded-lg flex items-center gap-1 font-semibold text-[11px]"
                        title="Set / Update Member Password & Username"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </button>
                      <button
                        onClick={() => setMemberToEdit(m)}
                        className="p-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center gap-1 font-semibold text-[11px]"
                        title="Badilisha Picha au Jina"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingMember(m)}
                        className="p-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-lg flex items-center gap-1 font-semibold text-[11px]"
                        title="Futa Mwanachama Asiyehitajika"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Futa</span>
                      </button>
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg"
                        title="Angalia Taarifa"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentMemberId(m.id);
                          setActiveRole('member');
                        }}
                        className="px-2.5 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-lg text-[10px]"
                      >
                        Ingia Kama Yeye
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Hakuna mwanachama aliyepatikana kwa utafutaji huu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Inaonyesha{' '}
            <strong className="text-slate-900 dark:text-white">
              {filteredMembers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredMembers.length)}
            </strong>{' '}
            kati ya <strong className="text-slate-900 dark:text-white">{filteredMembers.length.toLocaleString()}</strong> wanachama
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                title="Ukurasa Uliotangulia"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 font-bold">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        currentPage === pageNum
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                title="Ukurasa Unaofuata"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg w-full space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Usajili wa Wanachama ({currentInstitution.name})</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500">✕</button>
            </div>

            {/* Registration Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAddMode('single')}
                className={`py-2 rounded-xl transition-all ${addMode === 'single' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Mwanachama Mmoja (Single)
              </button>
              <button
                type="button"
                onClick={() => setAddMode('batch')}
                className={`py-2 rounded-xl transition-all ${addMode === 'batch' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Sajili kwa Mkupuo (1 - 5,000)
              </button>
            </div>
            
            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              
              {addMode === 'single' ? (
                <>
                  {/* Photo Upload & Preset Selection for New Member */}
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <img
                      src={photoUrl}
                      alt="New Member Photo"
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <label className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                        Picha ya Mwanachama (Profile Photo)
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setShowRegCameraModal(true)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Piga Picha (Kamera)</span>
                        </button>
                        <label className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg cursor-pointer text-[10px] flex items-center gap-1 transition-colors">
                          <Upload className="w-3 h-3" />
                          <span>Pakia Faili</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const data = await new Promise<string>((res, rej) => {
                                    const r = new FileReader();
                                    r.onloadend = () => res(r.result as string);
                                    r.onerror = rej;
                                    r.readAsDataURL(file);
                                  });
                                  const { compressDataUrl } = await import('../../lib/imageUtils');
                                  const compressed = await compressDataUrl(data, 800, 800, 0.8, 'image/jpeg');
                                  setPhotoUrl(compressed);
                                } catch (err) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') setPhotoUrl(reader.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Majina Kamili *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mfano: John Joseph Massawe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold block mb-1">Namba ya Simu *</label>
                      <input
                        type="text"
                        required
                        placeholder="+255 7..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Kazi / Shughuli</label>
                      <input
                        type="text"
                        placeholder="Mfano: Biashara / Ajira"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold block mb-1">Aina ya Kitambulisho</label>
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        <option value="NIDA">NIDA</option>
                        <option value="Voter ID">Kadi ya Mpiga Kura</option>
                        <option value="Passport">Pasipoti</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Namba ya Kitambulisho</label>
                      <input
                        type="text"
                        placeholder="1990..."
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-2 border">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Taarifa za Mfano wa Msaada (Next of Kin - Mwarithi)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Jina la Mwarithi"
                        value={nextOfKinName}
                        onChange={(e) => setNextOfKinName(e.target.value)}
                        className="p-2 rounded-lg border text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Uhusiano (Mfano: Mke)"
                        value={nextOfKinRel}
                        onChange={(e) => setNextOfKinRel(e.target.value)}
                        className="p-2 rounded-lg border text-xs"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <div className="space-y-1">
                    <label className="font-bold block text-slate-800 dark:text-slate-200">
                      Idadi ya Wanachama wa Kusajili (1 hadi 5,000) *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="5000"
                        value={batchCount}
                        onChange={(e) => setBatchCount(Number(e.target.value))}
                        className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                      />
                      <input
                        type="number"
                        min="1"
                        max="5000"
                        value={batchCount}
                        onChange={(e) => setBatchCount(Math.min(5000, Math.max(1, Number(e.target.value))))}
                        className="w-24 p-2 text-center font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Mfumo utazalisha wanachama {batchCount.toLocaleString()} kiotomatiki na kuwapa namba za uanachama mfululizo.
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Jina la Msingi (Prefix)</label>
                    <input
                      type="text"
                      placeholder="Mfano: Wanachama Vikundi"
                      value={batchPrefix}
                      onChange={(e) => setBatchPrefix(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Tawi au Shehia</label>
                    <input
                      type="text"
                      placeholder="Mfano: Tawi la Mwenge"
                      value={batchBranch}
                      onChange={(e) => setBatchBranch(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1.5 pt-1">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 block text-[11px]">Chagua Haraka:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[25, 50, 100, 250, 500, 1000, 2500, 5000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBatchCount(val)}
                          className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] ${batchCount === val ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          {val.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-transform active:scale-95">
                  {addMode === 'single' ? 'Hifadhi Mwanachama' : `Sajili Wanachama ${batchCount.toLocaleString()} kwa Mkupuo`}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="py-3 px-4 bg-slate-200 dark:bg-slate-700 font-bold rounded-xl">
                  Ghairi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Registration / CSV Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <BulkRegistrationForm
            onClose={() => setShowBulkModal(false)}
            onSuccess={(count) => {
              setShowBulkModal(false);
            }}
          />
        </div>
      )}

      {/* Member Profile Drawer / Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <MemberAvatar
                  name={selectedMember.fullName}
                  photoUrl={selectedMember.photoUrl}
                  size="md"
                  shape="2xl"
                  showZoomIcon
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{selectedMember.fullName}</h3>
                  <span className="text-emerald-600 font-mono font-bold text-xs">{selectedMember.memberNumber}</span>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Simu</span>
                <span className="font-bold">{selectedMember.phone}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px]">NIDA ID</span>
                <span className="font-mono">{selectedMember.idNumber}</span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 block text-[10px]">Akiba Zote</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-200 text-sm">{formatTZS(selectedMember.totalSavings)}</span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl">
                <span className="text-amber-700 dark:text-amber-300 block text-[10px]">Mkopo Unaoendelea</span>
                <span className="font-bold text-amber-800 dark:text-amber-200 text-sm">{formatTZS(selectedMember.totalLoansOutstanding)}</span>
              </div>
            </div>

            {selectedMember.bankName && (
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800 text-xs">
                <span className="text-blue-700 dark:text-blue-300 font-bold block text-[10px] flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  Kadi / Akaunti ya Benki ({selectedMember.bankName})
                </span>
                <p className="font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {selectedMember.bankAccountNumber || 'N/A'}
                </p>
                {selectedMember.bankAccountName && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">Jina: {selectedMember.bankAccountName}</p>
                )}
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  const m = selectedMember;
                  setSelectedMember(null);
                  setMemberToEdit(m);
                }}
                className="flex-1 py-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-center flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Badilisha Picha/Jina</span>
              </button>
              <button
                onClick={() => {
                  setCurrentMemberId(selectedMember.id);
                  setActiveRole('member');
                }}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-center"
              >
                Kuingia Kama Yeye
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Profile Modal */}
      {memberToEdit && (
        <MemberEditProfileModal
          member={memberToEdit}
          isOpen={!!memberToEdit}
          onClose={() => setMemberToEdit(null)}
          title="Badilisha Taarifa na Picha za Mwanachama"
        />
      )}

      {/* Delete Member Confirmation Modal */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/80 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Futa Mwanachama</h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{currentInstitution.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Je, una uhakika unataka kumfuta mwanachama <strong className="text-slate-900 dark:text-white">{deletingMember.fullName}</strong> ({deletingMember.memberNumber}) kwenye mfumo wa {currentInstitution.name}?
            </p>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300">
              Mwanachama huyu ataondolewa kwenye orodha ya wanachama. Action hii haiwezi kurudishwa.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  deleteMember(deletingMember.id);
                  setDeletingMember(null);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md active:scale-95 transition-transform"
              >
                Ndio, Futa Mwanachama
              </button>
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="py-3 px-5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
              >
                Ghairi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Credential Management Modal */}
      {credMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Weka Password & Username ya Mwanachama</h3>
                  <p className="text-[11px] text-slate-500">{credMember.fullName} ({credMember.memberNumber})</p>
                </div>
              </div>
              <button onClick={() => setCredMember(null)} className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateMemberCredentials(credMember.id, credUsername, credPassword);
              alert(`Credentials za mwanachama ${credMember.fullName} zimesasishwa kikamilifu! Username: ${credUsername}`);
              setCredMember(null);
            }} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-xs text-slate-700 dark:text-slate-300">
                  Username ya Mwanachama (Member Username):
                </label>
                <input
                  type="text"
                  required
                  value={credUsername}
                  onChange={(e) => setCredUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-xs text-slate-700 dark:text-slate-300">
                  Neno la Siri (Password):
                </label>
                <input
                  type="text"
                  required
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200">
                Admin wa Taasisi ana uwezo wa kuweka au kubadilisha password ya mwanachama ili aweze kuingia katika Mfumo.
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs">
                  Hifadhi Password
                </button>
                <button type="button" onClick={() => setCredMember(null)} className="py-2.5 px-4 bg-slate-200 dark:bg-slate-700 font-bold rounded-xl text-xs">
                  Ghairi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Edit Profile & Photo Modal (Admin Edit) */}
      {memberToEdit && (
        <MemberEditProfileModal
          member={memberToEdit}
          isOpen={!!memberToEdit}
          onClose={() => setMemberToEdit(null)}
          title={`Badilisha Taarifa & Picha za ${memberToEdit.fullName} (Admin Edit)`}
        />
      )}

      {/* Staff/Admin Member Registration Camera Modal */}
      <CameraCaptureModal
        isOpen={showRegCameraModal}
        onClose={() => setShowRegCameraModal(false)}
        onCapture={(dataUrl) => {
          setPhotoUrl(dataUrl);
          setShowRegCameraModal(false);
        }}
        title="Piga Picha ya Mwanachama Mpya"
        subtitle="Picha itahifadhiwa kwenye rekodi za uanachama na kitambulisho chake."
      />

    </div>
  );
};
