import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, BarChart3, ShieldAlert, DollarSign, Award } from 'lucide-react';

export const BusinessIntelligence: React.FC = () => {
  const { formatTZS } = useApp();

  const [activeDashboard, setActiveDashboard] = useState<'growth' | 'loan' | 'risk' | 'executive'>('executive');

  const monthlyTrendData = [
    { month: 'Jan', savings: 120, loans: 95, collections: 88 },
    { month: 'Feb', savings: 145, loans: 110, collections: 102 },
    { month: 'Mar', savings: 170, loans: 135, collections: 125 },
    { month: 'Apr', savings: 210, loans: 160, collections: 150 },
    { month: 'May', savings: 260, loans: 190, collections: 180 },
    { month: 'Jun', savings: 310, loans: 230, collections: 215 },
    { month: 'Jul', savings: 380, loans: 280, collections: 265 }
  ];

  const loanRiskData = [
    { name: 'Kawaida (0-30 Days)', value: 82, color: '#10b981' },
    { name: 'Uangalizi (31-60 Days)', value: 11, color: '#f59e0b' },
    { name: 'Hatarini (61-90 Days)', value: 5, color: '#f97316' },
    { name: 'Hasara (>90 Days)', value: 2, color: '#ef4444' }
  ];

  return (
    <div id="bi-analytics-view" className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            Dashibodi za Uchambuzi (Business Intelligence & Executive Analytics)
          </h2>
          <p className="text-slate-300 text-xs mt-0.5">
            Uchambuzi wa kina wa mwenendo wa Akiba, Mikopo, Vihatarishi na Mapato.
          </p>
        </div>
      </div>

      {/* Dashboard Sub-Tabs */}
      <div className="flex gap-2 border-b pb-2 font-semibold text-xs">
        {[
          { id: 'executive', label: 'Executive Dashboard' },
          { id: 'growth', label: 'Growth Dashboard' },
          { id: 'loan', label: 'Loan Portfolio Dashboard' },
          { id: 'risk', label: 'Risk & Collection Dashboard' }
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDashboard(d.id as any)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeDashboard === d.id
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Mwenendo wa Akiba na Mikopo (Million TZS)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="savings" name="Akiba Zote" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Area type="monotone" dataKey="loans" name="Portfolio ya Mikopo" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Uchambuzi wa Vihatarishi (Loan Portfolio Risk)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={loanRiskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {loanRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
