import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Key, Link as LinkIcon, RefreshCw, X, ShieldCheck, Server, Table } from 'lucide-react';
import { SupabaseService } from '../../lib/supabase';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(localStorage.getItem('CUSTOM_SUPABASE_URL') || (import.meta as any).env?.VITE_SUPABASE_URL || '');
  const [anonKey, setAnonKey] = useState(localStorage.getItem('CUSTOM_SUPABASE_ANON_KEY') || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '');
  const [status, setStatus] = useState<{ type: 'idle' | 'testing' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatus({ type: 'error', message: 'Tafadhali weka Supabase URL na Anon Key.' });
      return;
    }

    setStatus({ type: 'testing', message: 'Inajaribu kuunganisha na Supabase Database...' });

    const result = await SupabaseService.testConnection(url.trim(), anonKey.trim());
    if (result.success) {
      localStorage.setItem('CUSTOM_SUPABASE_URL', url.trim());
      localStorage.setItem('CUSTOM_SUPABASE_ANON_KEY', anonKey.trim());
      setStatus({ type: 'success', message: 'Muunganisho umefanikiwa! Supabase URL & Anon Key zimehifadhiwa.' });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      setStatus({ type: 'error', message: result.message });
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('CUSTOM_SUPABASE_URL');
    localStorage.removeItem('CUSTOM_SUPABASE_ANON_KEY');
    setUrl('');
    setAnonKey('');
    setStatus({ type: 'idle', message: 'Muunganisho na Supabase umeondolewa.' });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div id="supabase-connect-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Kuunganisha na Supabase Database</h3>
              <p className="text-xs text-emerald-300">Unganisha Mfumo wako na Supabase PostgreSQL</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs">
          
          {/* Explanation Box */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-700 dark:text-slate-300">
              <p className="font-bold text-emerald-950 dark:text-emerald-200 text-xs">
                Jinsi ya Kuunganisha Supabase:
              </p>
              <p className="text-[11px] leading-relaxed">
                Ingia kwenye Dashboard yako ya Supabase (<strong>supabase.com</strong>) &rarr; Chagua Mradi Wako (Project) &rarr; Nenda <strong>Project Settings &gt; API</strong> &rarr; Nakili <strong>Project URL</strong> na <strong>anon / public API Key</strong> kisha uweke hapa chini.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Supabase Project URL
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  required
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Supabase Anon / Public Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="eyJhY2Nlc3NfdG9rZW4iOi..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Status Alert */}
            {status.message && (
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 font-semibold text-xs ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                  : status.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700'
                  : 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700'
              }`}>
                {status.type === 'testing' && <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />}
                {status.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {status.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{status.message}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-2 flex gap-3">
              {(localStorage.getItem('CUSTOM_SUPABASE_URL') || (import.meta as any).env?.VITE_SUPABASE_URL) && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold rounded-2xl border border-rose-200 dark:border-rose-800 transition-colors"
                >
                  Ondoa Muunganisho
                </button>
              )}

              <button
                type="submit"
                disabled={status.type === 'testing'}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                {status.type === 'testing' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inajaribu Database...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Thibitisha na Hifadhi Muunganisho</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Database Schema Foreign Keys Preview according to user image */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
              <Table className="w-4 h-4 text-emerald-600" />
              <span>Tables zilizogunduliwa kwenye Supabase yako:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">institutions</div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">members</div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">loans</div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">loan_guarantors</div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">savings_accounts</div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">savings_transactions</div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">shares_accounts</div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">transactions</div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">users / branches</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
