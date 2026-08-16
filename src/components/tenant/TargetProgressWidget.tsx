import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InstitutionProject } from '../../types';
import {
  Target,
  TrendingUp,
  Edit3,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  AlertCircle,
  Plus
} from 'lucide-react';

interface TargetProgressWidgetProps {
  compact?: boolean;
}

export const TargetProgressWidget: React.FC<TargetProgressWidgetProps> = ({ compact = false }) => {
  const { currentInstitution, projects, updateInstitution, updateProject, formatTZS } = useApp();

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState<number>(
    currentInstitution.monthlyCapitalTarget || 50000000
  );

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectTargetInput, setProjectTargetInput] = useState<number>(0);

  const [showProjectBreakdown, setShowProjectBreakdown] = useState(!compact);

  // Filter projects for current institution
  const tenantProjects = projects.filter(p => p.tenantId === currentInstitution.id);

  // Calculate current month / overall capital growth
  let totalInitialCapital = 0;
  let totalCurrentValuation = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  tenantProjects.forEach(p => {
    totalInitialCapital += p.initialCapital || 0;
    totalCurrentValuation += p.currentValuation || 0;
    p.financialLogs?.forEach(log => {
      if (log.type === 'Income') totalIncome += log.amount || 0;
      if (log.type === 'Expense') totalExpense += log.amount || 0;
      if (log.type === 'CapitalAdd') totalCurrentValuation += log.amount || 0;
      if (log.type === 'CapitalWithdraw') totalCurrentValuation -= log.amount || 0;
    });
  });

  const netProfit = totalIncome - totalExpense;
  const currentTotalAssets = totalCurrentValuation + netProfit;
  const achievedCapitalGrowth = Math.max(0, currentTotalAssets - totalInitialCapital);

  // Overall Target
  const overallTarget = currentInstitution.monthlyCapitalTarget || 50000000;
  const overallProgressPercentage = Math.min(100, Math.max(0, (achievedCapitalGrowth / overallTarget) * 100));
  const remainingTarget = Math.max(0, overallTarget - achievedCapitalGrowth);

  // Status helper
  const getProgressStatus = (pct: number) => {
    if (pct >= 100) return { label: '🎉 Lengo Limetimizwa!', color: 'bg-emerald-500 text-white', text: 'emerald' };
    if (pct >= 75) return { label: '🚀 Karibu Kufikia Lengo', color: 'bg-teal-500 text-white', text: 'teal' };
    if (pct >= 50) return { label: '📈 Hatua Nzuri ya Ukuaji', color: 'bg-blue-500 text-white', text: 'blue' };
    return { label: '⏳ Inahitaji Kasi Zaidi', color: 'bg-amber-500 text-white', text: 'amber' };
  };

  const statusInfo = getProgressStatus(overallProgressPercentage);

  const handleSaveOverallTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(targetInput);
    if (parsed > 0) {
      updateInstitution(currentInstitution.id, { monthlyCapitalTarget: parsed });
      setIsEditingTarget(false);
    }
  };

  const handleSaveProjectTarget = (projectId: string) => {
    const parsed = Number(projectTargetInput);
    if (parsed >= 0) {
      updateProject(projectId, { monthlyCapitalTarget: parsed });
      setEditingProjectId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-md space-y-5 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Lengo la Ukuaji wa Mtaji kwa Mwezi (Monthly Target Progress)
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Weka malengo ya mwezi ya ukuaji wa mtaji kwenye miradi ya taasisi na ufuatilie maendeleo kwa ufasaha.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setTargetInput(overallTarget);
            setIsEditingTarget(!isEditingTarget);
          }}
          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 text-xs transition-colors shrink-0 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditingTarget ? 'Ghairi Mabadiliko' : 'Weka / Badilisha Lengo'}</span>
        </button>
      </div>

      {/* Edit Target Inline Form */}
      {isEditingTarget && (
        <form onSubmit={handleSaveOverallTarget} className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in fade-in duration-150">
          <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200">
            Kiasi cha Lengo la Mtaji kwa Mwezi (TZS):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">TZS</span>
              <input
                type="number"
                min={1000000}
                step={1000000}
                required
                value={targetInput}
                onChange={(e) => setTargetInput(Number(e.target.value))}
                className="w-full pl-12 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div className="flex gap-2">
              {[20000000, 50000000, 100000000, 200000000].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setTargetInput(val)}
                  className={`px-2.5 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    targetInput === val
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {(val / 1000000).toFixed(0)}M
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-xs text-xs transition-colors shrink-0 cursor-pointer"
            >
              Hifadhi Lengo
            </button>
          </div>
        </form>
      )}

      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/70">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
            Uliyoikia (Achieved Growth)
          </span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatTZS(achievedCapitalGrowth)}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            Ongezeko la Mtaji Miradini
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
          <span className="text-[10px] uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-bold">
            Lengo la Mwezi (Monthly Target)
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatTZS(overallTarget)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
            Lengo Lililowekwa na Admin
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
          <span className="text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-300 font-bold">
            Zalio / Bado Kufikia Lengo
          </span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatTZS(remainingTarget)}
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold block mt-0.5">
            {overallProgressPercentage >= 100 ? 'Lengo Limeratibiwa kikamilifu!' : `Unahitaji ${formatTZS(remainingTarget)} kufikia 100%`}
          </span>
        </div>
      </div>

      {/* Interactive Progress Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-xs font-extrabold">
          <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Maendeleo ya Lengo la Mtaji:</span>
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 text-sm font-black">
            {overallProgressPercentage.toFixed(1)}% Imefikiwa
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-5 bg-slate-100 dark:bg-slate-700/70 rounded-2xl p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-xl transition-all duration-700 shadow-sm relative overflow-hidden"
            style={{ width: `${Math.max(3, overallProgressPercentage)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>

          {/* Milestone markers */}
          <div className="absolute inset-0 flex justify-between px-1 pointer-events-none items-center text-[9px] font-black text-slate-400 opacity-60">
            <span className="pl-4">25%</span>
            <span>50%</span>
            <span>75%</span>
            <span className="pr-4">100%</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold px-1">
          <span>0 TZS</span>
          <span>50% ({formatTZS(overallTarget / 2)})</span>
          <span>100% ({formatTZS(overallTarget)})</span>
        </div>
      </div>

      {/* Expandable Project Breakdown Section */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
        <button
          onClick={() => setShowProjectBreakdown(!showProjectBreakdown)}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Malengo ya Kila Mradi (Project-by-Project Targets) ({tenantProjects.length} Miradi)</span>
          </div>
          {showProjectBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showProjectBreakdown && (
          <div className="space-y-2.5 pt-1 animate-in slide-in-from-top-2 duration-150">
            {tenantProjects.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                Bado hakuna miradi iliyosajiliwa. Nenda kwenye sehemu ya Miradi kusajili mradi mpya.
              </p>
            ) : (
              tenantProjects.map(proj => {
                let pIncome = 0;
                let pExpense = 0;
                let pValuation = proj.currentValuation || 0;
                proj.financialLogs?.forEach(l => {
                  if (l.type === 'Income') pIncome += l.amount || 0;
                  if (l.type === 'Expense') pExpense += l.amount || 0;
                });
                const pNet = pIncome - pExpense;
                const pAchieved = Math.max(0, (pValuation + pNet) - proj.initialCapital);
                const pTarget = proj.monthlyCapitalTarget || Math.round(overallTarget / tenantProjects.length);
                const pPct = Math.min(100, Math.max(0, (pAchieved / pTarget) * 100));

                return (
                  <div key={proj.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">{proj.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          {proj.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {editingProjectId === proj.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1000000}
                              step={500000}
                              value={projectTargetInput}
                              onChange={(e) => setProjectTargetInput(Number(e.target.value))}
                              className="w-28 px-2 py-1 rounded-lg border text-xs font-bold bg-white dark:bg-slate-800"
                            />
                            <button
                              onClick={() => handleSaveProjectTarget(proj.id)}
                              className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"
                            >
                              Hifadhi
                            </button>
                            <button
                              onClick={() => setEditingProjectId(null)}
                              className="px-2 py-1 bg-slate-300 dark:bg-slate-700 text-xs font-bold rounded-lg"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingProjectId(proj.id);
                              setProjectTargetInput(pTarget);
                            }}
                            className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Lengo: {formatTZS(pTarget)}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Uliyoikia: <strong className="text-emerald-600">{formatTZS(pAchieved)}</strong></span>
                      <span>Lengo: <strong className="text-slate-900 dark:text-white">{formatTZS(pTarget)}</strong></span>
                      <span className="font-bold text-teal-600">{pPct.toFixed(0)}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.max(2, pPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
