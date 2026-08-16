import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { downloadCSV, printFormattedReport } from '../../lib/exportUtils';
import {
  PieChart,
  PiggyBank,
  TrendingUp,
  Award,
  Plus,
  ArrowUpRight,
  DollarSign,
  CheckCircle2,
  Gift,
  Download,
  Printer
} from 'lucide-react';

export const SavingsAndShares: React.FC = () => {
  const {
    savingsAccounts,
    sharesAccounts,
    members,
    currentInstitution,
    makeSavingsDeposit,
    purchaseShares,
    formatTZS
  } = useApp();

  const [activeTab, setActiveTab] = useState<'savings' | 'shares' | 'dividends'>('savings');
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || 'mb_001');
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [savingsType, setSavingsType] = useState<'Mandatory' | 'Voluntary' | 'Amana' | 'EntranceFee'>('Mandatory');
  const [shareUnits, setShareUnits] = useState<number>(10);

  // Dividend Calculator state
  const [netProfit, setNetProfit] = useState<number>(45000000);
  const [dividendPercentage, setDividendPercentage] = useState<number>(15);
  const [dividendExecuted, setDividendExecuted] = useState(false);

  const tenantSavings = savingsAccounts.filter(s => s.tenantId === currentInstitution.id);
  const tenantShares = sharesAccounts.filter(s => s.tenantId === currentInstitution.id);

  const totalMandatory = tenantSavings.reduce((a, b) => a + b.mandatorySavings, 0);
  const totalVoluntary = tenantSavings.reduce((a, b) => a + b.voluntarySavings, 0);
  const totalAmana = tenantSavings.reduce((a, b) => a + (b.fixedDeposit || 0), 0);
  const totalEntranceFees = tenantSavings.length * 20000; // Standard Entrance Fee TZS 20,000 per member
  const grandTotalSavings = totalMandatory + totalVoluntary + totalAmana;

  const totalShareUnits = tenantShares.reduce((a, b) => a + b.shareUnits, 0);
  const totalSharesValue = tenantShares.reduce((a, b) => a + b.totalSharesValue, 0);

  const totalDividendPool = Math.round((netProfit * dividendPercentage) / 100);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;

    if (savingsType === 'EntranceFee') {
      alert(`Malipo ya Ada ya Kiingilio ya TZS ${formatTZS(depositAmount)} yamerekodiwa kikamilifu!`);
    } else {
      const dbType = savingsType === 'Amana' ? 'FixedDeposit' : savingsType;
      makeSavingsDeposit(selectedMemberId, depositAmount, 'M-Pesa', dbType as any);
      alert('Akiba/Amana imewekwa kikamilifu!');
    }
  };

  const handleSharesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shareUnits <= 0) return;

    purchaseShares(selectedMemberId, shareUnits, 'M-Pesa');
    alert('Hisa zimenunuliwa kikamilifu!');
  };

  const handleExecuteDividend = () => {
    setDividendExecuted(true);
    alert(`Ugawaji wa Gawio la TZS ${totalDividendPool.toLocaleString()} kwa Wanachama Wote Umekamilika!`);
  };

  return (
    <div id="savings-shares-view" className="space-y-6 text-xs">
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Jumla ya Akiba za Wanachama</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatTZS(grandTotalSavings)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Lazima: {formatTZS(totalMandatory)} | Hiari: {formatTZS(totalVoluntary)}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Jumla ya Amana (Fixed Deposits)</span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              {formatTZS(totalAmana)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Amana za Muda
            </span>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Ada za Kiingilio (Entrance Fees)</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {formatTZS(totalEntranceFees)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Wanachama {tenantSavings.length} x TZS 20,000
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Jumla ya Mtaji wa Hisa</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
              {formatTZS(totalSharesValue)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {totalShareUnits} Units (@ TZS 10,000)
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Navigation Tabs & Export Buttons */}
      <div className="border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold pb-2">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('savings')}
            className={`pb-2 border-b-2 flex items-center gap-2 ${
              activeTab === 'savings'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-500'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Akiba za Wanachama</span>
          </button>
          <button
            onClick={() => setActiveTab('shares')}
            className={`pb-2 border-b-2 flex items-center gap-2 ${
              activeTab === 'shares'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-500'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Daftari la Hisa</span>
          </button>
          <button
            onClick={() => setActiveTab('dividends')}
            className={`pb-2 border-b-2 flex items-center gap-2 ${
              activeTab === 'dividends'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Ugawaji wa Gawio (Dividends)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const getMemberNo = (memberId: string) => members.find(m => m.id === memberId)?.memberNumber || memberId;
              if (activeTab === 'savings') {
                const headers = ['Mwanachama', 'Namba', 'Akiba Lazima (TZS)', 'Akiba Hiari (TZS)', 'Amana Muda (TZS)', 'Jumla (TZS)'];
                const rows = tenantSavings.map(s => [s.memberName, getMemberNo(s.memberId), s.mandatorySavings, s.voluntarySavings, s.fixedDeposit, s.totalSavings]);
                downloadCSV(`Ripoti_ya_Akiba_${currentInstitution.name.replace(/\s+/g, '_')}`, headers, rows);
              } else {
                const headers = ['Mwanachama', 'Namba', 'Idadi ya Hisa', 'Thamani ya Hisa (TZS)'];
                const rows = tenantShares.map(s => [s.memberName, getMemberNo(s.memberId), s.shareUnits, s.totalSharesValue]);
                downloadCSV(`Daftari_la_Hisa_${currentInstitution.name.replace(/\s+/g, '_')}`, headers, rows);
              }
            }}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel (CSV)</span>
          </button>
          <button
            onClick={() => {
              const getMemberNo = (memberId: string) => members.find(m => m.id === memberId)?.memberNumber || memberId;
              const headers = ['Mwanachama', 'Namba', 'Akiba Lazima (TZS)', 'Akiba Hiari (TZS)', 'Jumla (TZS)'];
              const rows = tenantSavings.map(s => [s.memberName, getMemberNo(s.memberId), s.mandatorySavings, s.voluntarySavings, s.totalSavings]);
              printFormattedReport(`Ripoti ya Akiba na Hisa`, `Taasisi: ${currentInstitution.name}`, headers, rows);
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1 shadow-xs text-[11px] border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Chapa / PDF</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Savings */}
      {activeTab === 'savings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            <div className="p-4 border-b font-bold text-slate-900 dark:text-white">
              Akaunti za Akiba za Wanachama
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="p-3">Mwanachama</th>
                    <th className="p-3">Akiba ya Lazima</th>
                    <th className="p-3">Akiba ya Hiari</th>
                    <th className="p-3">Amana (Fixed Deposit)</th>
                    <th className="p-3 text-amber-600 font-bold">Ada ya Kiingilio</th>
                    <th className="p-3">Jumla</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {tenantSavings.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{s.memberName}</td>
                      <td className="p-3">{formatTZS(s.mandatorySavings)}</td>
                      <td className="p-3">{formatTZS(s.voluntarySavings)}</td>
                      <td className="p-3 font-medium text-purple-600 dark:text-purple-400">{formatTZS(s.fixedDeposit)}</td>
                      <td className="p-3 font-bold text-amber-600 dark:text-amber-400">{formatTZS(20000)}</td>
                      <td className="p-3 font-bold text-emerald-600">{formatTZS(s.totalSavings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Deposit Form */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Weka Akiba Mpya</h3>
            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Mwanachama</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Aina ya Akiba</label>
                <select
                  value={savingsType}
                  onChange={(e) => setSavingsType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-semibold"
                >
                  <option value="Mandatory">Akiba ya Lazima</option>
                  <option value="Voluntary">Akiba ya Hiari</option>
                  <option value="Amana">Amana (Fixed Deposit)</option>
                  <option value="EntranceFee">Kiingilio (Ada ya Kiingilio)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Kiasi (TZS)</label>
                <input
                  type="number"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold text-emerald-600"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
                Weka Akiba Sasa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Shares */}
      {activeTab === 'shares' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            <div className="p-4 border-b font-bold text-slate-900 dark:text-white">
              Daftari la Hisa za Wanachama
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="p-3">Mwanachama</th>
                    <th className="p-3">Idadi ya Hisa (Units)</th>
                    <th className="p-3">Bei kwa Hisa</th>
                    <th className="p-3">Thamani ya Hisa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {tenantShares.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{s.memberName}</td>
                      <td className="p-3 font-mono font-bold text-blue-600">{s.shareUnits} Units</td>
                      <td className="p-3">{formatTZS(s.pricePerShare)}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{formatTZS(s.totalSharesValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shares Purchase Form */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nunuzi wa Hisa Mpya</h3>
            <form onSubmit={handleSharesSubmit} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Mwanachama</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Idadi ya Hisa (1 Unit = TZS 10,000)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={shareUnits}
                  onChange={(e) => setShareUnits(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border text-center">
                <span className="text-slate-400 text-[10px] block">Jumla ya Gharama</span>
                <span className="font-bold text-blue-600 text-sm">{formatTZS(shareUnits * 10000)}</span>
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                Nunua Hisa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Dividend Distribution */}
      {activeTab === 'dividends' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Kikokotoo na Ugawaji wa Gawio (Annual Dividend Runner)</h3>
              <p className="text-slate-500 text-xs">Hesabu na gawanya faida ya mwaka kwa wanachama wote kulingana na hisa na akiba zao.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div>
                <label className="font-semibold block mb-1">Faida Safi ya Mwaka (Net Annual Profit TZS)</label>
                <input
                  type="number"
                  value={netProfit}
                  onChange={(e) => setNetProfit(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Kiwango cha Gawio kinachogawiwa (%)</label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={dividendPercentage}
                  onChange={(e) => setDividendPercentage(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="text-xs font-bold text-amber-600">{dividendPercentage}% ya faida inatolewa kama gawio</span>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3">
              <span className="text-slate-400 block text-xs">Jumla ya Mfuko wa Gawio</span>
              <span className="block text-3xl font-black text-amber-400">{formatTZS(totalDividendPool)}</span>
              
              <button
                onClick={handleExecuteDividend}
                disabled={dividendExecuted}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-colors mt-4"
              >
                {dividendExecuted ? 'Gawio Limeshagawiwa!' : 'Tekeleza Ugawaji wa Gawio Sasa'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
