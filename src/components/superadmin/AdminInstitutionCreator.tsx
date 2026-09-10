import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export const AdminInstitutionCreator: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { t } = useApp();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [planId, setPlanId] = useState('plan_standard');
  const [customPriceMonthly, setCustomPriceMonthly] = useState<number | ''>('');
  const [createAdmin, setCreateAdmin] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name || !domain) return setError('Name and domain are required');

    const institution = {
      name,
      domain,
      registration_number: registrationNumber || undefined,
      phone: phone || undefined,
      email: email || undefined,
      status: 'Active',
      plan_id: planId,
      custom_price_monthly: customPriceMonthly || undefined
    } as any;

    const admin_user = createAdmin ? {
      email: adminEmail,
      password: adminPassword,
      full_name: adminFullName,
      phone
    } : undefined;

    setLoading(true);
    try {
      // Prefer sending Supabase session token if available
      let token = '';
      try {
        const sessionRes: any = await supabase.auth.getSession();
        token = sessionRes?.data?.session?.access_token || '';
      } catch (e) {
        // ignore
      }

      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const resp = await fetch('/api/admin/institutions', {
        method: 'POST',
        headers,
        body: JSON.stringify(admin_user ? { institution, admin_user } : institution)
      });

      const json = await resp.json().catch(() => null);
      if (!resp.ok) {
        setError((json && (json.message || JSON.stringify(json))) || `Server error: ${resp.status}`);
      } else {
        const created = json && (Array.isArray(json.data) ? json.data[0] : json.data);
        setSuccess('Institution created successfully.');
        // Update SPA state via AppContext and close modal
        try {
          const app = (window as any).__APP_CONTEXT_PREPEND_INSTITUTION__;
          if (app && typeof app === 'function') {
            app(created);
          }
        } catch (e) {
          // ignore
        }

        setTimeout(() => {
          onClose && onClose();
        }, 700);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="font-bold mb-4">Create Institution (Admin flow)</h3>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold">Name</label>
          <input className="w-full p-2 border rounded" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold">Domain</label>
          <input className="w-full p-2 border rounded" value={domain} onChange={e => setDomain(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold">Registration Number</label>
            <input className="w-full p-2 border rounded" value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold">Plan ID</label>
            <input className="w-full p-2 border rounded" value={planId} onChange={e => setPlanId(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold">Phone</label>
            <input className="w-full p-2 border rounded" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold">Email</label>
            <input className="w-full p-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={createAdmin} onChange={e => setCreateAdmin(e.target.checked)} />
            <span className="text-xs">Create tenant admin account</span>
          </label>
        </div>

        {createAdmin && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold">Admin Full Name</label>
              <input className="w-full p-2 border rounded" value={adminFullName} onChange={e => setAdminFullName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold">Admin Email</label>
              <input className="w-full p-2 border rounded" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold">Admin Password</label>
              <input type="password" autoComplete="new-password" className="w-full p-2 border rounded" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>
            {loading ? 'Creating...' : 'Create Institution'}
          </button>
          <button type="button" className="px-4 py-2 border rounded" onClick={() => onClose && onClose()} disabled={loading}>Cancel</button>
        </div>
      </form>
    </div>
  );
};
