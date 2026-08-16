import React, { useState, useMemo } from 'react';
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
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PiggyBank,
  CreditCard,
  Building2,
  PieChart as PieIcon,
  DollarSign,
  ArrowUpRight,
  Filter,
  Layers
} from 'lucide-react';

export const AggregatedGrowthWidget: React.FC = () => {
  const { institutions, savingsAccounts, loans, formatTZS } = useApp();

  const [timeframe, setTimeframe] = useState<'6m' | '12m' | 'ytd'>('6m');
  const [chartType, setChartType] = useState<'trend' | 'comparison' | 'distribution'>('trend');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  // Filter institutions based on type filter
  const filteredInstitutions = useMemo(() => {
    if (selectedTypeFilter === 'ALL') return institutions;
    return institutions.filter(i => i.type === selectedTypeFilter);
  }, [institutions, selectedTypeFilter]);

  // Aggregate totals across filtered tenants
  const aggregateData = useMemo(() => {
    let grandSavings = 0;
    let grandActiveLoans = 0;
    let grandApprovedLoans = 0;

    const tenantBreakdown = filteredInstitutions.map(inst => {
      const instSavings = savingsAccounts
        .filter(s => s.tenantId === inst.id)
        .reduce((sum, s) => sum + s.totalSavings, 0);

      const instLoans = loans
        .filter(l => l.tenantId === inst.id)
        .reduce(
          (acc, l) => {
            if (l.status === 'Active' || l.status === 'Disbursed') {
              acc.outstanding += l.remainingBalance;
            }
            acc.approved += l.amountApproved;
            return acc;
          },
          { outstanding: 0, approved: 0 }
        );

      grandSavings += instSavings;
      grandActiveLoans += instLoans.outstanding;
      grandApprovedLoans += instLoans.approved;

      return {
        id: inst.id,
        name: inst.name.length > 18 ? inst.name.slice(0, 15) + '...' : inst.name,
        fullName: inst.name,
        type: inst.type,
        savings: instSavings,
        activeLoans: instLoans.outstanding,
        approvedLoans: instLoans.approved,
        memberCount: inst.memberCount
      };
    });

    return {
      grandSavings,
      grandActiveLoans,
      grandApprovedLoans,
      tenantBreakdown
    };
  }, [filteredInstitutions, savingsAccounts, loans]);

  // Generate historical growth data points (simulated baseline + current accumulation)
  const growthTrendData = useMemo(() => {
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();

    const count = timeframe === '6m' ? 6 : timeframe === '12m' ? 12 : currentMonthIdx + 1;
    const data = [];

    const totalSav = aggregateData.grandSavings || 450000000;
    const totalLn = aggregateData.grandActiveLoans || 320000000;

    for (let i = count - 1; i >= 0; i--) {
      const monthIndex = (currentMonthIdx - i + 12) % 12;
      const monthLabel = monthsShort[monthIndex];
      const factor = 0.55 + (0.45 * (count - i)) / count;
      const savingsVal = Math.round(totalSav * factor * (0.95 + Math.random() * 0.1));
      const loansVal = Math.round(totalLn * factor * (0.93 + Math.random() * 0.12));

      data.push({
        month: monthLabel,
        "Jumla ya Akiba (Savings)": savingsVal,
        "Deni la Mikopo (Loans)": loansVal
      });
    }

    return data;
  }, [aggregateData, timeframe]);

  // Institution Type Distribution Data
  const typeDistributionData = useMemo(() => {
    const distribution: Record<string, { savings: number; loans: number; count: number }> = {
      SACCOS: { savings: 0, loans: 0, count: 0 },
      VICOBA: { savings: 0, loans: 0, count: 0 },
      AMCOS: { savings: 0, loans: 0, count: 0 }
    };

    institutions.forEach(inst => {
      const typeKey = inst.type in distribution ? inst.type : 'SACCOS';
      const instSavings = savingsAccounts
        .filter(s => s.tenantId === inst.id)
        .reduce((sum, s) => sum + s.totalSavings, 0);
      const instLoans = loans
        .filter(l => l.tenantId === inst.id && (l.status === 'Active' || l.status === 'Disbursed'))
        .reduce((sum, l) => sum + l.remainingBalance, 0);

      distribution[typeKey].savings += instSavings;
      distribution[typeKey].loans += instLoans;
      distribution[typeKey].count += 1;
    });

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

    return Object.keys(distribution).map((key, index) => ({
      name: key,
      value: distribution[key].savings,
      loanValue: distribution[key].loans,
      tenantCount: distribution[key].count,
      color: COLORS[index % COLORS.length]
    }));
  }, [institutions, savingsAccounts, loans]);

  // Loan to Savings ratio calculation
  const loanToSavingsRatio = aggregateData.grandSavings > 0
    ? Math.round((aggregateData.grandActiveLoans / aggregateData.grandSavings) * 100)
    : 0;

  return (
    <div id="aggregated-growth-widget" className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xs">
      
      {/* Widget Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Ukuaji wa Akiba na Mikopo (Aggregated Platform Growth)
            </h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Uchambuzi wa jumla wa mtaji wa akiba na portfolio ya mikopo kwenye taasisi zote za mfumo.
          </p>
        </div>

        {/* View Mode & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Institution Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 text-[11px] focus:outline-none pr-1"
            >
              <option value="ALL">Aina Zote</option>
              <option value="SACCOS">SACCOS Tu</option>
              <option value="VICOBA">VICOBA Tu</option>
              <option value="AMCOS">AMCOS Tu</option>
            </select>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setChartType('trend')}
              className={`px-3 py-1 rounded-lg transition-all ${
                chartType === 'trend'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Trend Line
            </button>
            <button
              onClick={() => setChartType('comparison')}
              className={`px-3 py-1 rounded-lg transition-all ${
                chartType === 'comparison'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kwa Taasisi
            </button>
            <button
              onClick={() => setChartType('distribution')}
              className={`px-3 py-1 rounded-lg transition-all ${
                chartType === 'distribution'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mgawanyo
            </button>
          </div>

          {/* Timeframe selector (visible for trend chart) */}
          {chartType === 'trend' && (
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-semibold">
              <button
                onClick={() => setTimeframe('6m')}
                className={`px-2.5 py-1 rounded-lg ${
                  timeframe === '6m' ? 'bg-white dark:bg-slate-800 text-indigo-600 font-bold shadow-2xs' : 'text-slate-500'
                }`}
              >
                Miezi 6
              </button>
              <button
                onClick={() => setTimeframe('12m')}
                className={`px-2.5 py-1 rounded-lg ${
                  timeframe === '12m' ? 'bg-white dark:bg-slate-800 text-indigo-600 font-bold shadow-2xs' : 'text-slate-500'
                }`}
              >
                Miezi 12
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Aggregate Key Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
          <div>
            <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] font-semibold">
              Jumla ya Akiba (All Tenants)
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5 block">
              {formatTZS(aggregateData.grandSavings)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80 mt-0.5 flex items-center gap-0.5 font-bold">
              <ArrowUpRight className="w-3 h-3" /> Akiba za Lazima & Hiari
            </span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
          <div>
            <span className="text-blue-700 dark:text-blue-400 block text-[11px] font-semibold">
              Mikopo Inayoendelea (Active Loans)
            </span>
            <span className="text-lg sm:text-xl font-black text-blue-800 dark:text-blue-300 mt-0.5 block">
              {formatTZS(aggregateData.grandActiveLoans)}
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400/80 mt-0.5 block font-semibold">
              Kuwahudumia Wanachama wote
            </span>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
          <div>
            <span className="text-amber-700 dark:text-amber-400 block text-[11px] font-semibold">
              Wastani wa Mikopo vs Akiba (Ratio)
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-800 dark:text-amber-300 mt-0.5 block">
              {loanToSavingsRatio}%
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-0.5 block font-semibold">
              Afya ya Mtaji (Healthy Portfolio Threshold &lt; 90%)
            </span>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Chart Visualization */}
      <div className="pt-2">
        
        {/* CHART 1: Aggregated Growth Area Chart */}
        {chartType === 'trend' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Mwenendo wa Akiba na Mikopo (Miezi {growthTrendData.length} iliyopita)
              </span>
              <span className="text-[10px]">TZS Aggregated Totals</span>
            </div>
            
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="loansGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatTZS(Number(value) || 0), '']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="Jumla ya Akiba (Savings)"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#savingsGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Deni la Mikopo (Loans)"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#loansGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: Per-Tenant Comparison Bar Chart */}
        {chartType === 'comparison' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Ulinganisho wa Akiba na Mikopo kwa kila Taasisi (Per-Tenant Comparison)
              </span>
              <span className="text-[10px]">TZS Volume</span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregateData.tenantBreakdown} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [formatTZS(Number(value) || 0), name]}
                    labelFormatter={(label, items) => items[0]?.payload?.fullName || label}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                  <Bar
                    dataKey="savings"
                    name="Akiba za Wanachama"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="activeLoans"
                    name="Mikopo Inayoendelea"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 3: Type Breakdown Pie Chart */}
        {chartType === 'distribution' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {typeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatTZS(Number(value) || 0), 'Akiba Zote']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Mgawanyo kwa Aina ya Taasisi
              </h4>
              <div className="space-y-2">
                {typeDistributionData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-xs border-b border-slate-200/60 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.name} ({item.tenantCount} Taasisi)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold block text-emerald-600">{formatTZS(item.value)}</span>
                      <span className="text-[10px] text-slate-400">Mikopo: {formatTZS(item.loanValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
