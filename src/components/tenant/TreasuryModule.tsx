import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building, Landmark, Smartphone, RefreshCw, CheckCircle } from 'lucide-react';

export const TreasuryModule: React.FC = () => {
  const { formatTZS } = useApp();

  return (
    <div id="treasury-module-view" className="space-y-6 text-xs">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Landmark className="w-5 h-5 text-emerald-600" />
          Bank na Usimamizi wa Akaunti za Benki (Bank Accounts & Cash Management)
        </h2>
        <p className="text-slate-500 text-xs mt-1">Usimamizi wa Fedha za Benki, Salio la Bank, na Lipa Namba / Paybill za Mtandao.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>Akaunti ya CRDB Bank</span>
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          <span className="block text-2xl font-black text-slate-900 dark:text-white">{formatTZS(210000000)}</span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Imepatanishwa (Bank Reconciled)
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>Akaunti ya NMB Bank</span>
            <Building className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="block text-2xl font-black text-slate-900 dark:text-white">{formatTZS(145000000)}</span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Imepatanishwa (Bank Reconciled)
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>M-Pesa Float Paybill</span>
            <Smartphone className="w-5 h-5 text-rose-600" />
          </div>
          <span className="block text-2xl font-black text-slate-900 dark:text-white">{formatTZS(34500000)}</span>
          <span className="text-[10px] text-slate-400 block">Kituo cha Malipo ya Simu</span>
        </div>
      </div>
    </div>
  );
};
