import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { initialSubscriptionPlans } from '../../data/initialData';
import {
  CreditCard,
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Download,
  Clock,
  Sparkles,
  Building2,
  Lock,
  Layers
} from 'lucide-react';

export const SubscriptionManagementModule: React.FC = () => {
  const { currentInstitution, members, formatTZS, updateInstitutionPlan } = useApp();

  const [activeBillingCycle, setActiveBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgradedPlanId, setUpgradedPlanId] = useState<string | null>(null);

  const tenantMembers = members.filter(m => m.tenantId === currentInstitution.id || !m.tenantId);
  const currentPlan = initialSubscriptionPlans.find(p => p.id === currentInstitution.planId) || initialSubscriptionPlans[0];

  const usagePercentage = Math.min(100, Math.round((tenantMembers.length / currentInstitution.maxMembers) * 100));

  const handleSelectPlan = (planId: string, planName: string) => {
    updateInstitutionPlan(currentInstitution.id, planId, planName);
    setUpgradedPlanId(planId);
    setTimeout(() => setUpgradedPlanId(null), 3500);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-black">Subscription Management & Vifurushi vya Mfumo</h2>
          </div>
          <p className="text-slate-300 text-xs mt-1">
            Chagua kifurushi kinachofaa mahitaji ya taasisi yako. Kuanzia kifurushi cha <strong>STARTER (Wanachama hadi 500)</strong>, <strong>STANDARD (Wanachama hadi 2,500)</strong>, <strong>PROFESSIONAL (Wanachama hadi 5,000)</strong> hadi Enterprise (10,000+).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-2 rounded-xl border border-emerald-500/30 font-bold shrink-0">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>Kifurushi cha Sasa: {currentInstitution.planName}</span>
        </div>
      </div>

      {upgradedPlanId && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center gap-3 font-bold text-xs shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          Hongera! Mfumo na Kifurushi chako vimesasishwa kikamilifu kuwa Kifurushi Kipya!
        </div>
      )}

      {/* Current Plan Overview & Usage Widget */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Kifurushi Kinalipiwa:</span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{currentInstitution.planName}</h3>
          <p className="text-emerald-600 font-bold text-xs mt-0.5">
            Ada ya Mwezi: {formatTZS(currentInstitution.customPriceMonthly || currentPlan.priceMonthly)}/mwezi
          </p>
          <p className="text-slate-500 text-xs mt-1">Hali: <strong className="text-emerald-600">Active (Inafanya kazi)</strong></p>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-slate-600 dark:text-slate-300">Kipimo cha Wanachama:</span>
            <span className="text-emerald-600">{tenantMembers.length} / {currentInstitution.maxMembers} Wanachama</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Umetumia {usagePercentage}% ya nafasi zote za wanachama kulingana na kifurushi.
          </p>
        </div>

        <div className="flex flex-col justify-center items-start md:items-end">
          <button
            onClick={() => {
              const el = document.getElementById('pricing-plans-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 text-xs transition-all"
          >
            <Zap className="w-4 h-4" />
            Boresha Kifurushi (Upgrade Plan)
          </button>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center items-center gap-3 pt-2">
        <span className={`font-bold text-xs ${activeBillingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
          Kipindi cha Mwezi (Monthly)
        </span>
        <button
          onClick={() => setActiveBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
          className="w-14 h-7 bg-emerald-600 rounded-full p-1 transition-all relative flex items-center"
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${activeBillingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`} />
        </button>
        <span className={`font-bold text-xs flex items-center gap-1 ${activeBillingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
          Kipindi cha Mwaka (Yearly)
          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold">Punguzo la 20%</span>
        </span>
      </div>

      {/* Vifurushi Vya Mfumo Pricing Cards Grid */}
      <div id="pricing-plans-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {initialSubscriptionPlans.map((plan) => {
          const isCurrent = currentInstitution.planId === plan.id;
          const price = activeBillingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl border bg-white dark:bg-slate-800 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-lg transition-all relative ${
                plan.popular ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Kifurushi Maarufu Zaidi
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{plan.name}</h3>
                  {isCurrent && (
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-slate-500 text-[11px] leading-relaxed min-h-[36px]">{plan.description}</p>

                <div className="pt-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatTZS(price)}
                  </span>
                  <span className="text-slate-400 text-xs">/{activeBillingCycle === 'monthly' ? 'mwezi' : 'mwaka'}</span>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Vipengele Vilivyopo:</span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id, plan.name)}
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                    : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800'
                }`}
              >
                {isCurrent ? (
                  'Kifurushi Chako cha Sasa'
                ) : (
                  <>
                    <span>Chagua {plan.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment History Invoices Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border space-y-4 shadow-xs">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm border-b pb-3">
          <Clock className="w-4 h-4 text-emerald-600" />
          Kumbukumbu za Malipo ya SaaS & Invoices (Billing History)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-[11px]">
                <th className="p-2.5">Invoice #</th>
                <th className="p-2.5">Tarehe</th>
                <th className="p-2.5">Kifurushi</th>
                <th className="p-2.5">Kiasi (TZS)</th>
                <th className="p-2.5">Njia ya Malipo</th>
                <th className="p-2.5">Hali</th>
                <th className="p-2.5 text-right">Pakua Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">INV-2026-0081</td>
                <td className="p-2.5 text-slate-600">2026-07-01</td>
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{currentInstitution.planName}</td>
                <td className="p-2.5 font-bold text-emerald-600">{formatTZS(250000)}</td>
                <td className="p-2.5 text-slate-600">CRDB Bank Transfer</td>
                <td className="p-2.5">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    LIPWA (PAID)
                  </span>
                </td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => alert(`Inapakua Stakabadhi rasmi ya SaaS ya invoice INV-2026-0081...`)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    title="Pakua Stakabadhi"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">INV-2026-0042</td>
                <td className="p-2.5 text-slate-600">2026-06-01</td>
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{currentInstitution.planName}</td>
                <td className="p-2.5 font-bold text-emerald-600">{formatTZS(250000)}</td>
                <td className="p-2.5 text-slate-600">M-Pesa Paybill</td>
                <td className="p-2.5">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    LIPWA (PAID)
                  </span>
                </td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => alert(`Inapakua Stakabadhi rasmi ya SaaS ya invoice INV-2026-0042...`)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    title="Pakua Stakabadhi"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
