import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import {
  CreditCard,
  Smartphone,
  Landmark,
  ShieldCheck,
  Zap,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  FileCheck2,
  Activity,
  ArrowDownRight,
  Send,
  Lock,
  DollarSign
} from 'lucide-react';

interface GatewayConfig {
  id: string;
  name: string;
  category: 'mobile' | 'bank' | 'gepg' | 'card';
  iconColor: string;
  bgColor: string;
  status: 'Active' | 'Inactive' | 'Testing';
  paybillOrAccount: string;
  autoRecord: boolean;
  transactionsToday: number;
  totalVolume: number;
}

export const PaymentGatewaysModule: React.FC = () => {
  const { currentInstitution, members, addTransaction, formatTZS } = useApp();

  const [gateways, setGateways] = useState<GatewayConfig[]>([
    {
      id: 'mpesa',
      name: 'M-Pesa (Vodacom)',
      category: 'mobile',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/40',
      status: 'Active',
      paybillOrAccount: 'Paybill: 554422',
      autoRecord: true,
      transactionsToday: 42,
      totalVolume: 12500000
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      category: 'mobile',
      iconColor: 'text-red-500',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      status: 'Active',
      paybillOrAccount: 'Merchant: 887711',
      autoRecord: true,
      transactionsToday: 28,
      totalVolume: 8400000
    },
    {
      id: 'mixx_yas',
      name: 'Mixx by Yas (Tigo / Yas)',
      category: 'mobile',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      status: 'Active',
      paybillOrAccount: 'Paybill: 663322',
      autoRecord: true,
      transactionsToday: 19,
      totalVolume: 4900000
    },
    {
      id: 'halopesa',
      name: 'HaloPesa (Halotel)',
      category: 'mobile',
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/40',
      status: 'Active',
      paybillOrAccount: 'Till: 334411',
      autoRecord: true,
      transactionsToday: 11,
      totalVolume: 2100000
    },
    {
      id: 'banks',
      name: 'Benki (CRDB, PBZ, NMB, NBC, Azania)',
      category: 'bank',
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      status: 'Active',
      paybillOrAccount: currentInstitution.bankAccountNumber ? `${currentInstitution.bankName} - ${currentInstitution.bankAccountNumber}` : 'PBZ Bank: 040011223344',
      autoRecord: true,
      transactionsToday: 15,
      totalVolume: 35000000
    },
    {
      id: 'gepg',
      name: 'GePG (Government e-Payment Gateway)',
      category: 'gepg',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      status: 'Active',
      paybillOrAccount: 'Control No. Generator: Active',
      autoRecord: true,
      transactionsToday: 8,
      totalVolume: 18000000
    },
    {
      id: 'visa',
      name: 'Visa Card Payments',
      category: 'card',
      iconColor: 'text-blue-700',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      status: 'Active',
      paybillOrAccount: 'Acquirer ID: 40029188',
      autoRecord: true,
      transactionsToday: 6,
      totalVolume: 7500000
    },
    {
      id: 'mastercard',
      name: 'Mastercard Payments',
      category: 'card',
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      status: 'Active',
      paybillOrAccount: 'Merchant ID: MC-88910',
      autoRecord: true,
      transactionsToday: 4,
      totalVolume: 5200000
    }
  ]);

  // Simulation Form State
  const [selectedGateway, setSelectedGateway] = useState<string>('M-Pesa');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [amount, setAmount] = useState<number>(50000);
  const [paymentType, setPaymentType] = useState<'SavingsDeposit' | 'LoanRepayment' | 'SharePurchase'>('SavingsDeposit');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastAutoRecordedTx, setLastAutoRecordedTx] = useState<any | null>(null);

  const tenantMembers = members.filter(m => m.tenantId === currentInstitution.id || !m.tenantId);

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || amount <= 0) return;

    setIsProcessing(true);
    const member = members.find(m => m.id === selectedMemberId);

    setTimeout(() => {
      const refPrefix = selectedGateway.substring(0, 3).toUpperCase();
      const refNo = `${refPrefix}-${Date.now().toString().slice(-8)}`;

      const getChannel = (gw: string): Transaction['paymentChannel'] => {
        if (gw.includes('M-Pesa')) return 'M-Pesa';
        if (gw.includes('Airtel')) return 'Airtel Money';
        if (gw.includes('Mixx') || gw.includes('Yas')) return 'Mixx by Yas';
        if (gw.includes('HaloPesa')) return 'HaloPesa';
        if (gw.includes('GePG')) return 'GePG';
        if (gw.includes('Visa') || gw.includes('Mastercard')) return 'Visa/Mastercard';
        return 'Bank Transfer';
      };

      const newTx: Transaction = {
        id: `tx_auto_${Date.now()}`,
        referenceNumber: refNo,
        tenantId: currentInstitution.id,
        tenantName: currentInstitution.name,
        memberId: member?.id || 'mb_unknown',
        memberName: member?.fullName || 'Mwanachama',
        type: paymentType,
        amount: Number(amount),
        paymentChannel: getChannel(selectedGateway),
        status: 'Completed' as const,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        description: `Malipo ya papo hapo kupitia ${selectedGateway} (Auto-recorded)`
      };

      addTransaction(newTx);
      setLastAutoRecordedTx(newTx);
      setIsProcessing(false);

      // Update gateway metrics
      setGateways(prev => prev.map(g => {
        if (g.name.toLowerCase().includes(selectedGateway.toLowerCase())) {
          return {
            ...g,
            transactionsToday: g.transactionsToday + 1,
            totalVolume: g.totalVolume + Number(amount)
          };
        }
        return g;
      }));
    }, 1200);
  };

  const toggleAutoRecord = (id: string) => {
    setGateways(prev => prev.map(g => g.id === id ? { ...g, autoRecord: !g.autoRecord } : g));
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
            <h2 className="text-xl font-black">Mfumo wa Malipo (Payment Gateways Integration)</h2>
          </div>
          <p className="text-slate-300 text-xs mt-1">
            Uunganishaji wa moja kwa moja wa M-Pesa, Airtel Money, Mixx by Yas, HaloPesa, Benki, GePG, Visa na Mastercard.
            <strong className="text-emerald-400 font-semibold ml-1">Malipo yote yanarekodiwa moja kwa moja (Real-time Instant Ledger Recording).</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real-Time Webhook Active</span>
        </div>
      </div>

      {/* Gateway Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gateways.map((g) => (
          <div
            key={g.id}
            className={`p-4 rounded-2xl border bg-white dark:bg-slate-800 flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md transition-shadow`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${g.bgColor} ${g.iconColor}`}>
                  {g.category.toUpperCase()}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  {g.status}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2 flex items-center gap-1.5">
                {g.category === 'mobile' && <Smartphone className={`w-4 h-4 ${g.iconColor}`} />}
                {g.category === 'bank' && <Landmark className={`w-4 h-4 ${g.iconColor}`} />}
                {g.category === 'gepg' && <ShieldCheck className={`w-4 h-4 ${g.iconColor}`} />}
                {g.category === 'card' && <CreditCard className={`w-4 h-4 ${g.iconColor}`} />}
                {g.name}
              </h3>

              <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {g.paybillOrAccount}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Miamala Leo:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{g.transactionsToday}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Jumla ya Fedha:</span>
                <span className="font-bold text-emerald-600">{formatTZS(g.totalVolume)}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">Kurekodisha Moja kwa Moja:</span>
                <button
                  onClick={() => toggleAutoRecord(g.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    g.autoRecord
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {g.autoRecord ? 'IMEWEZESHWA' : 'IMEZIMIWA'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instant Payment Simulator & Live Webhook Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Simulator Box */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <Zap className="w-5 h-5 text-amber-500" />
              Jaribu Malipo ya Papo hapo (Instant Gateway Simulator)
            </h3>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold px-2.5 py-1 rounded-full">
              Auto-Posting Test
            </span>
          </div>

          <form onSubmit={handleSimulatePayment} className="space-y-4">
            <div>
              <label className="font-semibold block mb-1">Chagua Mwanachama</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-semibold"
                required
              >
                {tenantMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberNumber}) - {m.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Kituo cha Malipo (Gateway)</label>
                <select
                  value={selectedGateway}
                  onChange={(e) => setSelectedGateway(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                >
                  <option value="M-Pesa">M-Pesa (Vodacom)</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Mixx by Yas">Mixx by Yas (Tigo)</option>
                  <option value="HaloPesa">HaloPesa (Halotel)</option>
                  <option value="Benki (CRDB/PBZ/NMB)">Benki (PBZ, CRDB, NMB, NBC)</option>
                  <option value="GePG">GePG Control No.</option>
                  <option value="Visa Card">Visa Card</option>
                  <option value="Mastercard">Mastercard</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Aina ya Malipo</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-semibold"
                >
                  <option value="SavingsDeposit">Kuweka Akiba (Akiba/Savings)</option>
                  <option value="LoanRepayment">Rejesho la Mkopo (Loan Repayment)</option>
                  <option value="SharePurchase">Kununua Hisa (Shares)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Kiasi cha Fedha (TZS)</label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold text-base text-emerald-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Inathibitisha na Kurekodi Moja kwa Moja...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Lipa Sasa (Simulate Instant Payment)
                </>
              )}
            </button>
          </form>

          {lastAutoRecordedTx && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Malipo Yamepokewa na Kurekodiwa Moja kwa Moja!
              </div>
              <p className="font-mono text-[11px] text-slate-700 dark:text-slate-200">
                Kumbukumbu No: <strong>{lastAutoRecordedTx.referenceNumber}</strong> • {formatTZS(lastAutoRecordedTx.amount)} kupitia {lastAutoRecordedTx.paymentChannel}
              </p>
              <p className="text-[10px] text-slate-500">
                Mwanachama: {lastAutoRecordedTx.memberName} | Akaunti / Ledger updated instantly.
              </p>
            </div>
          )}
        </div>

        {/* Live Technical Integration Specs & Rules */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm border-b pb-3">
            <Lock className="w-5 h-5 text-indigo-600" />
            Vigezo na Mfumo wa Usalama wa Miamala (Gateway Security & Callbacks)
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-start gap-3">
              <Activity className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Real-Time Webhooks & Instant Reconciliation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Miamala yote kutoka M-Pesa, Airtel, Yas, HaloPesa na Benki inaingia kwa kupitia Secure SSL/TLS Callbacks yenye HMAC Signature Validation.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">GePG Control Number Automated Reconciliation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mfumo unatengeneza Control Number rasmi ya Serikali kwa kila mwanachama anayetaka kulipa ada, hisa au marejesho.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Card Payment Processing (Visa / Mastercard)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Inaruhusu wanachama waliopo nje ya nchi au wenye kadi za benki kulipia akiba au kununua hisa kwa njia salama ya 3D-Secure.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Status ya API Callbacks:</span>
            <span className="font-mono text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              ONLINE 100%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
