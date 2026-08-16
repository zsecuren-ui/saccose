import React from 'react';
import { Transaction } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, Download, CheckCircle2, X } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { currentInstitution, formatTZS } = useApp();

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div id="receipt-modal-card" className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Modal Header */}
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span className="font-bold text-sm tracking-wide">RISITI YA KIDIJITALI (RECEIPT)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content Body */}
        <div id="receipt-print-area" className="p-6 text-slate-800 dark:text-slate-200 text-xs space-y-4">
          
          {/* Header Branding */}
          <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">{currentInstitution.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{currentInstitution.registrationNumber}</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">{currentInstitution.phone} • {currentInstitution.email}</p>
          </div>

          {/* Transaction Metadata */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">Kumbukumbu No:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{transaction.referenceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tarehe & Muda:</span>
              <span className="font-medium">{transaction.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kituo cha Malipo:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{transaction.paymentChannel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hali ya Muamala:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-bold text-[10px]">
                {transaction.status}
              </span>
            </div>
          </div>

          {/* Payer Information */}
          <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-700 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Jina la Mwanachama:</span>
              <span className="font-bold text-slate-900 dark:text-white">{transaction.memberName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Aina ya Muamala:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{transaction.description}</span>
            </div>
          </div>

          {/* Amount Paid Big Display */}
          <div className="text-center bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold uppercase tracking-wider block">Kiasi Kilicholipwa</span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
              {formatTZS(transaction.amount)}
            </span>
          </div>

          <div className="text-[10px] text-center text-slate-400 dark:text-slate-500">
            Risiti hii imetolewa kiotomatiki na Mfumo Mkuu wa SACCOS Enterprise SaaS. Hakuna haja ya sahihi ya mkono.
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            Chapa / Print
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Funga
          </button>
        </div>

      </div>
    </div>
  );
};
