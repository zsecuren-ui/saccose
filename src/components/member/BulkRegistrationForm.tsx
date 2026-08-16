import React, { useState } from 'react';
import { UserPlus, Download, Upload, AlertCircle, CheckCircle2, ShieldCheck, FileText, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BulkRegistrationFormProps {
  onClose?: () => void;
  onSuccess?: (count: number) => void;
}

export const BulkRegistrationForm: React.FC<BulkRegistrationFormProps> = ({ onClose, onSuccess }) => {
  const { currentMember, currentInstitution, addBatchMembers, members } = useApp();

  const [mode, setMode] = useState<'generator' | 'import'>('generator');
  const [subMemberCount, setSubMemberCount] = useState<number>(10);
  const [subMemberPrefix, setSubMemberPrefix] = useState<string>(
    currentMember ? `Mwanachama - ${currentMember.fullName.split(' ')[0]}` : 'Mwanachama Mpya'
  );
  const [branchName, setBranchName] = useState<string>(
    currentMember ? `Tawi la ${currentMember.fullName.split(' ')[0]}` : 'Tawi Kuu'
  );

  const [validationError, setValidationError] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRowsPreview, setCsvRowsPreview] = useState<Array<{ fullName: string; phone?: string; branch?: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation function for numeric range 1 - 5000
  const handleCountChange = (val: number) => {
    if (isNaN(val)) {
      setSubMemberCount(1);
      setValidationError('Tafadhali weka namba iliyo halali (1 - 5000).');
      return;
    }
    if (val < 1) {
      setSubMemberCount(1);
      setValidationError('Idadi ya chini kabisa ya kusajili ni mwanachama 1.');
    } else if (val > 5000) {
      setSubMemberCount(5000);
      setValidationError('Idadi ya juu kabisa ya kusajili kwa mkupuo ni wanachama 5000.');
    } else {
      setValidationError(null);
      setSubMemberCount(val);
    }
  };

  // Preview generated members list
  const getGeneratedPreview = () => {
    const startNum = members.length + 1;
    return Array.from({ length: Math.min(20, Math.max(1, subMemberCount)) }, (_, idx) => {
      const numStr = String(startNum + idx).padStart(4, '0');
      return {
        id: `preview-${idx}`,
        memberNumber: `MEM-${numStr}`,
        fullName: `${subMemberPrefix} #${idx + 1}`,
        branch: branchName,
        shares: 10,
        status: 'Active'
      };
    });
  };

  // Handle CSV file selection and parsing
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setValidationError('Tafadhali pakia faili la CSV (.csv).');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      // Skip header if present
      const hasHeader = lines[0].toLowerCase().includes('jina') || lines[0].toLowerCase().includes('name');
      const dataLines = hasHeader ? lines.slice(1) : lines;

      if (dataLines.length === 0) {
        setValidationError('Faili haina taarifa za wanachama.');
        setCsvRowsPreview([]);
        return;
      }

      if (dataLines.length > 5000) {
        setValidationError(`Faili lina wanachama ${dataLines.length}. Tumechukua 5,000 wa kwanza kulingana na kikomo cha taasisi.`);
      } else {
        setValidationError(null);
      }

      const parsed = dataLines.slice(0, 5000).map((line, idx) => {
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        return {
          fullName: parts[0] || `Mwanachama #${idx + 1}`,
          phone: parts[1] || '+255700000000',
          branch: parts[2] || branchName
        };
      });

      setCsvRowsPreview(parsed);
      setSubMemberCount(parsed.length);
    };
    reader.readAsText(file);
  };

  // Download Sample CSV Template
  const handleDownloadSampleCsv = () => {
    const sampleContent = `Jina La Mwanachama,Namba Ya Simu,Tawi\nAmina Hassan Juma,+255712345678,Unguja Stone Town\nJuma Bakari Khamis,+255788990011,Pemba Chake Chake\nSalma Rashidi Said,+255766554433,Kiembe Samaki\n`;
    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Mfano_Wa_Wanachama_5000.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subMemberCount < 1 || subMemberCount > 5000) {
      setValidationError('Idadi lazima iwe kati ya 1 na 5000.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'generator') {
        addBatchMembers(subMemberCount, subMemberPrefix, branchName);
      } else {
        // If import mode, pass count or parsed names
        addBatchMembers(subMemberCount, subMemberPrefix, branchName);
      }

      setSuccessMessage(`Hongera! Wanachama ${subMemberCount} wamesajiliwa kikamilifu kuanzia MEM-${String(members.length + 1).padStart(4, '0')} mpaka MEM-${String(members.length + subMemberCount).padStart(4, '0')}!`);
      if (onSuccess) onSuccess(subMemberCount);

      setTimeout(() => {
        setIsSubmitting(false);
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setValidationError('Kuna hitilafu imetokea wakati wa kusajili wanachama.');
      setIsSubmitting(false);
    }
  };

  const previewList = mode === 'generator' ? getGeneratedPreview() : csvRowsPreview.map((row, idx) => ({
    id: `csv-${idx}`,
    memberNumber: `MEM-${String(members.length + idx + 1).padStart(4, '0')}`,
    fullName: row.fullName,
    branch: row.branch || branchName,
    shares: 10,
    status: 'Active'
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 max-w-2xl w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Fomu ya Usajili wa Mkupuo (Bulk Member Registration)
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                1 - 5,000 Wanachama
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Taasisi: <strong className="text-slate-700 dark:text-slate-300">{currentInstitution.name}</strong>
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => { setMode('generator'); setValidationError(null); }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
            mode === 'generator'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Kuzalisha Wanachama (Auto Generator)</span>
        </button>
        <button
          type="button"
          onClick={() => { setMode('import'); setValidationError(null); }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
            mode === 'import'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Pakia Faili la CSV (Import CSV)</span>
        </button>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'generator' ? (
          <div className="space-y-4">
            {/* Range Slider & Manual Input */}
            <div className="space-y-2 bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                  Chagua Idadi ya Wanachama (Min: 1 - Max: 5000)
                </label>
                <span className="text-amber-600 dark:text-amber-400 font-black text-sm bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full">
                  {subMemberCount} Wanachama
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="5000"
                  value={subMemberCount}
                  onChange={(e) => handleCountChange(Number(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={subMemberCount}
                  onChange={(e) => handleCountChange(Number(e.target.value))}
                  className="w-24 p-2 text-center font-black text-amber-800 dark:text-amber-300 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Chagua Haraka:</span>
                {[10, 50, 100, 250, 500, 1000, 2500, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleCountChange(val)}
                    className={`px-2.5 py-1 rounded-xl font-extrabold text-[11px] transition-colors border ${
                      subMemberCount === val
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Prefix & Branch Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300 text-xs">
                  Jina la Msingi la Kikundi / Prefix
                </label>
                <input
                  type="text"
                  required
                  value={subMemberPrefix}
                  onChange={(e) => setSubMemberPrefix(e.target.value)}
                  placeholder="Mfano: Kikundi cha Pemba"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300 text-xs">
                  Tawi au Eneo la Wanachama
                </label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Mfano: Unguja Stone Town"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-2 bg-slate-50 dark:bg-slate-800/50">
              <Upload className="w-8 h-8 mx-auto text-amber-500" />
              <div>
                <label htmlFor="csv-file-input" className="cursor-pointer font-bold text-xs text-amber-600 dark:text-amber-400 hover:underline">
                  Bonyeza hapa kupakia faili la CSV
                </label>
                <p className="text-[10px] text-slate-400">Faili linatakiwa liwe na safu za (Jina, Namba ya Simu, Tawi). Wanachama hadi 50.</p>
              </div>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv, .txt"
                onChange={handleCsvUpload}
                className="hidden"
              />
              {csvFile && (
                <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-3 py-1 rounded-full text-xs font-extrabold">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{csvFile.name}</span>
                  <button type="button" onClick={() => { setCsvFile(null); setCsvRowsPreview([]); }} className="text-rose-600 hover:text-rose-800">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Hujapata muundo wa mfano?</span>
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline flex items-center gap-1 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pakua Mfano wa CSV (Sample Template)</span>
              </button>
            </div>
          </div>
        )}

        {/* Preview Table of Members to be created */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Hakiki Wanachama Watakaosajiliwa ({previewList.length})</span>
            </h4>
            <span className="text-[10px] text-slate-400">Namba za uanachama za mfululizo</span>
          </div>

          <div className="max-h-40 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-2">
            {previewList.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-4">Pakia CSV au chagua idadi kusajili wanachama.</p>
            ) : (
              <div className="space-y-1.5">
                {previewList.map((item, i) => (
                  <div key={item.id || i} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold flex items-center justify-center text-[10px]">
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{item.fullName}</span>
                        <span className="text-[10px] text-slate-400">{item.branch}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                        {item.memberNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-3 flex items-center gap-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting || previewList.length === 0}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs transition-transform active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'Inasajili...' : `Kamilisha Usajili wa Wanachama ${previewList.length}`}</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Ghairi
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
