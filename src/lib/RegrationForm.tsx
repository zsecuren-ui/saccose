import React, { useState } from 'react';
import { SupabaseService } from '../lib/supabase';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await SupabaseService.registerUser(email, password, { fullName });
      
      if (response.user) {
        setMessage({
          type: 'success',
          text: 'Usajili umefanikiwa! Angalia barua pepe yako ili kuthibitisha akaunti (Confirm Email).'
        });
        // Safisha form
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Kosa limetokea wakati wa kusajili. Jaribu tena.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Tengeneza Akaunti MPYA</h2>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' 
            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Jina Kamili</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            placeholder="Mfano: Juma Ally"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Barua Pepe (Email)</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            placeholder="juma@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nywila (Password)</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Inasajili...' : 'Sajili Akaunti'}
        </button>
      </form>
    </div>
  );
};