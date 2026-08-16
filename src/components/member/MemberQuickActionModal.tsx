import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import {
  X,
  PiggyBank,
  CreditCard,
  Send,
  Download,
  FileText,
  Sparkles,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Building2,
  Smartphone,
  Camera,
  Upload,
  Scan,
  FileCheck2,
  Check,
  QrCode,
  Zap
} from 'lucide-react';
import { RealReceiptAndQRScannerModal, ScannedReceiptResult } from '../common/RealReceiptAndQRScannerModal';

interface MemberQuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'deposit' | 'loan' | 'repayment' | 'statement' | 'proof';
}

export const MemberQuickActionModal: React.FC<MemberQuickActionModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'deposit'
}) => {
  const {
    currentMember,
    currentInstitution,
    loans,
    applyLoan,
    makeSavingsDeposit,
    makeRepayment,
    submitPaymentProof,
    formatTZS
  } = useApp();

  const [activeTab, setActiveTab] = useState<'deposit' | 'loan' | 'repayment' | 'statement' | 'proof'>(initialTab);

  // Payment Proof Form State
  const [proofType, setProofType] = useState<'SavingsDeposit' | 'LoanRepayment' | 'SharePurchase' | 'FinePayment'>('SavingsDeposit');
  const [proofAmount, setProofAmount] = useState<number>(150000);
  const [proofChannel, setProofChannel] = useState<string>('PBZ Bank (Benki ya Watu wa Zanzibar)');
  const [proofReceiptNo, setProofReceiptNo] = useState<string>('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofNotes, setProofNotes] = useState<string>('Malipo ya hisa na akiba yaliyofanyika dirishani Stone Town');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scannerInitialMode, setScannerInitialMode] = useState<'camera' | 'upload'>('camera');
  const [lastScannedQR, setLastScannedQR] = useState<string | null>(null);
  const [verifiedMerchant, setVerifiedMerchant] = useState<string | null>(null);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [depositType, setDepositType] = useState<'Voluntary' | 'Mandatory'>('Voluntary');
  const [depositChannel, setDepositChannel] = useState<Transaction['paymentChannel']>('M-Pesa');
  const [phoneNo, setPhoneNo] = useState<string>('+255 777 123 456');

  // Loan Application Form State
  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [loanDuration, setLoanDuration] = useState<number>(12);
  const [loanType, setLoanType] = useState<string>('Mkopo wa Mkono');
  const [customLoanName, setCustomLoanName] = useState<string>('');
  const [loanPurpose, setLoanPurpose] = useState<string>('Mahitaji ya haraka / dharura');

  // Repayment State
  const activeLoan = loans.find(l => l.memberId === currentMember.id && l.status === 'Active');
  const [repaymentAmount, setRepaymentAmount] = useState<number>(activeLoan ? activeLoan.monthlyInstallment : 150000);
  const [repaymentChannel, setRepaymentChannel] = useState<Transaction['paymentChannel']>('M-Pesa');

  // Statement Download State
  const [statementRange, setStatementRange] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;

    makeSavingsDeposit(currentMember.id, depositAmount, depositChannel, depositType);
    alert(`Amana ya TZS ${depositAmount.toLocaleString()} imefanikiwa! Risiti ya muamala imezalishwa.`);
    onClose();
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loanAmount <= 0) return;

    const resolvedType = loanType === 'custom' ? (customLoanName.trim() || 'Mkopo Maalum') : loanType;

    applyLoan({
      amountRequested: loanAmount,
      durationMonths: loanDuration,
      loanType: resolvedType,
      customLoanTypeName: loanType === 'custom' ? customLoanName.trim() : undefined,
      purpose: loanPurpose
    });

    alert('Maombi yako ya mkopo yamewasilishwa kikamilifu! Kamati ya mikopo itayapitia hivi punde.');
    onClose();
  };

  const handleRepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoan) {
      alert('Huna mkopo unaoendelea kwa sasa.');
      return;
    }

    makeRepayment(activeLoan.id, repaymentAmount, repaymentChannel);
    alert(`Rejesho la TZS ${repaymentAmount.toLocaleString()} kupitia ${repaymentChannel} limekamilika!`);
    onClose();
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (proofAmount <= 0) {
      alert('Tafadhali ingiza kiasi halali cha fedha.');
      return;
    }
    if (!proofReceiptNo.trim()) {
      alert('Tafadhali ingiza namba ya resiti au kumbu kumbu ya muamala uliothibitishwa.');
      return;
    }
    if (!proofImage) {
      alert('Tafadhali pakia au piga picha ya risiti halisi ya malipo ya benki au mtandao wa simu ili mfumo uihakiki kabla ya kuwasilisha.');
      setScannerInitialMode('upload');
      setIsScannerOpen(true);
      return;
    }

    submitPaymentProof({
      memberId: currentMember.id,
      memberName: currentMember.fullName,
      memberNumber: currentMember.memberNumber,
      tenantId: currentInstitution.id,
      tenantName: currentInstitution.name,
      paymentType: proofType,
      amount: proofAmount,
      paymentChannel: proofChannel,
      receiptNumber: proofReceiptNo,
      receiptImage: proofImage,
      notes: lastScannedQR ? `${proofNotes} [QR: ${lastScannedQR}]` : proofNotes
    });

    alert(`Kithibitisho cha TZS ${proofAmount.toLocaleString()} (Resiti #: ${proofReceiptNo}) kimepelekwa kwa Uongozi wa ${currentInstitution.name} kwa ajili ya kuhakikiwa!`);
    onClose();
  };

  // Callback when a real receipt is analyzed and accepted from scanner
  const handleReceiptScanned = (scanned: ScannedReceiptResult) => {
    if (scanned.isValidPaymentReceipt === false) {
      alert('Picha imekataliwa: Siyo stakabadhi halali ya malipo.');
      return;
    }

    if (scanned.receiptNumber) {
      setProofReceiptNo(scanned.receiptNumber);
    }
    if (scanned.amount && scanned.amount > 0) {
      setProofAmount(scanned.amount);
    }
    if (scanned.paymentMethod || scanned.merchantOrBank) {
      setProofChannel(scanned.paymentMethod || scanned.merchantOrBank);
      setVerifiedMerchant(scanned.merchantOrBank);
    }
    if (scanned.paymentType && ['SavingsDeposit', 'LoanRepayment', 'SharePurchase', 'FinePayment'].includes(scanned.paymentType)) {
      setProofType(scanned.paymentType as any);
    }
    if (scanned.imageDataUrl) {
      setProofImage(scanned.imageDataUrl);
    }
    if (scanned.rawSummary) {
      setProofNotes(scanned.rawSummary);
    }
    if (scanned.qrCodeData) {
      setLastScannedQR(scanned.qrCodeData);
    }
  };

  const handleDownloadStatement = () => {
    alert(`Taarifa ya Settlement ya ${statementRange.toUpperCase()} ya TZS ${currentMember.totalSavings.toLocaleString()} inapakuliwa kama PDF/Excel...`);
    onClose();
  };

  return (
    <>
      <div id="member-quick-action-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
          
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold">Quick Actions Portal</h2>
                <p className="text-xs text-emerald-300 font-medium">
                  {currentMember.fullName} ({currentInstitution.name})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Type Selector Tabs */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'deposit'
                  ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              <span>Weka Akiba</span>
            </button>

            <button
              onClick={() => setActiveTab('loan')}
              className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'loan'
                  ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Omba Mkopo</span>
            </button>

            <button
              onClick={() => setActiveTab('repayment')}
              className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'repayment'
                  ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Lipa Mkopo</span>
            </button>

            <button
              onClick={() => setActiveTab('statement')}
              className={`flex-1 min-w-[100px] py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'statement'
                  ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Settlement</span>
            </button>

            <button
              onClick={() => setActiveTab('proof')}
              className={`flex-1 min-w-[120px] py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'proof'
                  ? 'bg-amber-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-amber-300" />
              <span>Scan / Resiti</span>
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-6">
            
            {/* TAB 1: DEPOSIT SAVINGS */}
            {activeTab === 'deposit' && (
              <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3">
                  <PiggyBank className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Weka Akiba kwenye Akaunti Yako</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Salio la Akiba za Sasa: <strong>{formatTZS(currentMember.totalSavings)}</strong>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Aina ya Akiba</label>
                    <select
                      value={depositType}
                      onChange={(e) => setDepositType(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    >
                      <option value="Voluntary">Akiba ya Hiari (Voluntary)</option>
                      <option value="Mandatory">Akiba ya Lazima (Mandatory)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kituo cha Malipo</label>
                    <select
                      value={depositChannel}
                      onChange={(e) => setDepositChannel(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
                    >
                      <option value="M-Pesa">Vodacom M-Pesa</option>
                      <option value="Airtel Money">Airtel Money</option>
                      <option value="Mixx by Yas">Mixx by Yas (Tigo)</option>
                      <option value="HaloPesa">HaloPesa</option>
                      <option value="Bank Transfer">Benki (PBZ, CRDB, NMB, NBC)</option>
                      <option value="GePG">GePG Control Number</option>
                      <option value="Visa">Visa Card</option>
                      <option value="Mastercard">Mastercard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kiasi cha Kuweka (TZS) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={5000}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-lg text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Namba ya Simu ya Malipo</label>
                  <input
                    type="text"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Weka Akiba Sasa ({formatTZS(depositAmount)})</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: APPLY FOR A LOAN */}
            {activeTab === 'loan' && (
              <form onSubmit={handleLoanSubmit} className="space-y-4 text-xs">
                <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Omba Mkopo Mpya wa VICOBA / SACCOS</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Kikomo cha Mkopo wako (3x Savings): <strong>{formatTZS(currentMember.totalSavings * 3)}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Aina ya Mkopo</label>
                      <select
                        value={loanType}
                        onChange={(e) => setLoanType(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs"
                      >
                        <option value="Mkopo wa Mkono">Mkopo wa Mkono (10% p.a)</option>
                        <option value="Dharura">Dharura (8% p.a)</option>
                        <option value="Biashara">Biashara (12% p.a)</option>
                        <option value="Elimu">Elimu (10% p.a)</option>
                        <option value="Kilimo">Kilimo na Uvuvi (9% p.a)</option>
                        <option value="Ujenzi">Ujenzi (12% p.a)</option>
                        <option value="custom">✍️ Andika kwa Mkono</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Muda (Miezi)</label>
                      <select
                        value={loanDuration}
                        onChange={(e) => setLoanDuration(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs"
                      >
                        <option value={1}>Mwezi 1</option>
                        <option value={3}>Miezi 3</option>
                        <option value={6}>Miezi 6</option>
                        <option value={12}>Miezi 12 (Mwaka 1)</option>
                        <option value={18}>Miezi 18</option>
                        <option value={24}>Miezi 24 (Miaka 2)</option>
                      </select>
                    </div>
                  </div>

                  {loanType === 'custom' && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1">
                      <label className="font-bold text-xs text-blue-900 dark:text-blue-200 block">
                        Andika Jina / Aina ya Mkopo kwa Mkono:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="k.m. Mkopo wa Pikipiki / Bodaboda, Mkopo wa Matibabu..."
                        value={customLoanName}
                        onChange={(e) => setCustomLoanName(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kiasi Unachoomba (TZS) *</label>
                  <input
                    type="number"
                    required
                    min={100000}
                    step={100000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-lg text-blue-600 dark:text-blue-400"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Lengo la Mkopo / Maelezo</label>
                  <input
                    type="text"
                    required
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    placeholder="Mfano: Kununua bidhaa za duka"
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Tuma Maombi ya Mkopo</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: LOAN REPAYMENT */}
            {activeTab === 'repayment' && (
              <form onSubmit={handleRepaymentSubmit} className="space-y-4 text-xs">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/60 flex items-center gap-3">
                  <Send className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Lipa Rejesho la Mkopo</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {activeLoan
                        ? `Deni la Mkopo lililobaki: ${formatTZS(activeLoan.remainingBalance)}`
                        : 'Huna mkopo unaoendelea kwa sasa.'}
                    </p>
                  </div>
                </div>

                {activeLoan ? (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kituo cha Malipo</label>
                      <select
                        value={repaymentChannel}
                        onChange={(e) => setRepaymentChannel(e.target.value as any)}
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-amber-600"
                      >
                        <option value="M-Pesa">Vodacom M-Pesa</option>
                        <option value="Airtel Money">Airtel Money</option>
                        <option value="Mixx by Yas">Mixx by Yas (Tigo)</option>
                        <option value="HaloPesa">HaloPesa</option>
                        <option value="Bank Transfer">Benki (PBZ, CRDB, NMB)</option>
                        <option value="GePG">GePG Control Number</option>
                        <option value="Visa">Visa Card</option>
                        <option value="Mastercard">Mastercard</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kiasi cha Rejesho (TZS) *</label>
                      <input
                        type="number"
                        required
                        value={repaymentAmount}
                        onChange={(e) => setRepaymentAmount(Number(e.target.value))}
                        className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-lg text-amber-600 dark:text-amber-400"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Lipa Rejesho ({formatTZS(repaymentAmount)})</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>Huna mkopo unaohitaji marejesho kwa sasa.</p>
                  </div>
                )}
              </form>
            )}

            {/* TAB 4: SETTLEMENT REPORT DOWNLOAD */}
            {activeTab === 'statement' && (
              <div className="space-y-4 text-xs">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Pakua Taarifa ya Settlement na Malipo</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ripoti rasmi ya miamala yako ya kila siku na kila mwezi yenye Muhuri wa Digitali.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kipindi cha Taarifa</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatementRange('daily')}
                      className={`py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                        statementRange === 'daily'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Kila Siku (Daily)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatementRange('monthly')}
                      className={`py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                        statementRange === 'monthly'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Kila Mwezi
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatementRange('yearly')}
                      className={`py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                        statementRange === 'yearly'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Mwaka 2026
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mwanachama:</span>
                    <span className="font-bold">{currentMember.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Akaunti Namba:</span>
                    <span className="font-mono font-bold">{currentMember.memberNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jumla ya Akiba:</span>
                    <span className="font-bold text-emerald-600">{formatTZS(currentMember.totalSavings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jumla ya Hisa:</span>
                    <span className="font-bold text-blue-600">{formatTZS(currentMember.totalShares)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadStatement}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Pakua Settlement Report (PDF / Excel)</span>
                </button>
              </div>
            )}

            {/* TAB 5: SUBMIT PAYMENT PROOF & SCAN RECEIPT */}
            {activeTab === 'proof' && (
              <form onSubmit={handleProofSubmit} className="space-y-4 text-xs">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck2 className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Tuma Kithibitisho cha Malipo au Scan Resiti Halisi</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Scan kamera ya moja kwa moja ya PBZ, CRDB, NMB, M-Pesa au GePG kusoma namba na QR code kiotomatiki.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setScannerInitialMode('camera');
                      setIsScannerOpen(true);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Fungua Live Scanner</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Aina ya Malipo
                    </label>
                    <select
                      value={proofType}
                      onChange={(e) => setProofType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    >
                      <option value="SavingsDeposit">Akiba ya Mwanachama (Savings)</option>
                      <option value="LoanRepayment">Rejesho la Mkopo (Loan Repayment)</option>
                      <option value="SharePurchase">Ununuzi wa Hisa (Shares)</option>
                      <option value="FinePayment">Malipo ya Adhabu / Faini</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Kiasi Kilicholipwa (TZS)
                    </label>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      required
                      value={proofAmount}
                      onChange={(e) => setProofAmount(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Njia / Benki Yako
                    </label>
                    <input
                      type="text"
                      required
                      value={proofChannel}
                      onChange={(e) => setProofChannel(e.target.value)}
                      placeholder="PBZ Bank, CRDB, M-Pesa..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Namba ya Resiti au Muamala
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Mf. PBZ-882190 au 918239..."
                        value={proofReceiptNo}
                        onChange={(e) => setProofReceiptNo(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setScannerInitialMode('camera');
                          setIsScannerOpen(true);
                        }}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl flex items-center gap-1 transition shrink-0 cursor-pointer"
                        title="Scan Resiti kwa Kamera / AI"
                      >
                        <Scan className="w-4 h-4" />
                        <span>Scan AI</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Receipt Image Upload & Camera Box */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Picha / Kipande cha Resiti ya Malipo (OCR & QR)
                  </label>
                  <div
                    onClick={() => {
                      setScannerInitialMode('upload');
                      setIsScannerOpen(true);
                    }}
                    className="border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-4 text-center relative hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                  >
                    {proofImage ? (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <img
                          src={proofImage}
                          alt="Preview Receipt"
                          className="w-24 h-24 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs"
                        />
                        <div className="text-left space-y-1">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Picha ya Resiti Imehifadhiwa
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Picha hii itakaguliwa na Afisa wa Fedha kabla ya kuitimiza.
                          </p>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setScannerInitialMode('upload');
                                setIsScannerOpen(true);
                              }}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Pakia Picha Mpya
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setScannerInitialMode('camera');
                                setIsScannerOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Camera className="w-3 h-3" />
                              <span>Piga Live Kamera</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-2">
                        <Camera className="w-8 h-8 text-amber-500 mx-auto" />
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Bofya Hapa Kupiga Picha au Kupakia Risiti Halisi
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Inasoma namba za risiti, kiasi na QR codes za benki zote za Tanzania na Zanzibar.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {lastScannedQR && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">QR Code Data:</span>
                      <span className="text-[11px] font-mono text-emerald-900 dark:text-emerald-200 truncate block">
                        {lastScannedQR}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Maelezo ya Ziada (Ujumbe)
                  </label>
                  <input
                    type="text"
                    placeholder="Maelezo ya ziada ya malipo..."
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileCheck2 className="w-5 h-5" />
                    <span>Wasilisha Resiti ({formatTZS(proofAmount)})</span>
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>
      </div>

      {/* Real Receipt & QR Scanner Modal */}
      <RealReceiptAndQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        initialMode={scannerInitialMode}
        onReceiptScanned={handleReceiptScanned}
        onQRCodeScanned={(qr) => {
          setLastScannedQR(qr);
        }}
      />
    </>
  );
};
