require('dotenv').config(); (async ()=>{
  const fs = require('fs');
  const { createClient } = require('@supabase/supabase-js');
  const fetch = globalThis.fetch || require('node-fetch');

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.VITE_ADMIN_API_KEY || '';
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

  if(!SUPABASE_URL || !SERVICE_KEY){ console.error('MISSING_SERVICE_ROLE_OR_URL'); process.exit(2); }
  if(!ADMIN_API_KEY){ console.error('MISSING_ADMIN_API_KEY'); process.exit(2); }

  const sup = createClient(SUPABASE_URL, SERVICE_KEY);

  const out = { steps: [] };
  const unique = Date.now().toString().slice(-6);
  const instPayload = {
    institution: {
      name: `Smoke Test Inst ${unique}`,
      type: 'SACCOS',
      registration_number: `REG/SMOKE/${unique}`,
      phone: '+255700000999',
      email: `smoke-${unique}@example.tz`,
      region: 'Dar es Salaam',
      currency: 'TZS'
    },
    admin_user: {
      email: `admin-smoke-${unique}@example.tz`,
      full_name: 'Smoke Admin',
      phone: '+255700000999',
      timezone: 'Africa/Dar_es_Salaam',
      currency: 'TZS'
    }
  };

  let created = { institution: null, member: null, profile: null, userId: null, transaction: null };

  try{
    // 1) Health
    try{
      const h = await fetch(`${BASE_URL}/api/health`);
      const json = await h.json().catch(()=>null);
      out.steps.push({ name: 'health', ok: h.ok, status: h.status, body: json });
    }catch(e){ out.steps.push({ name: 'health', ok:false, error: String(e) }); }

    // 2) Unauth admin GET (expect 401)
    try{
      const r = await fetch(`${BASE_URL}/api/admin/institutions`);
      out.steps.push({ name: 'admin-unauth-get', ok: r.status===401, status: r.status });
    }catch(e){ out.steps.push({ name: 'admin-unauth-get', ok:false, error: String(e) }); }

    // 3) Create institution + admin_user via admin API
    try{
      const res = await fetch(`${BASE_URL}/api/admin/institutions`, { method: 'POST', headers: { 'content-type':'application/json', 'x-admin-key': ADMIN_API_KEY }, body: JSON.stringify(instPayload) });
      const body = await res.json().catch(()=>null);
      if(res.ok && body && body.success){
        created.institution = body.data?.institution || null;
        created.member = body.data?.created?.member || null;
        created.profile = body.data?.created?.profile || null;
        out.steps.push({ name: 'create-institution', ok:true, status: res.status, institution_id: created.institution?.id, member_id: created.member?.id });
      } else {
        out.steps.push({ name: 'create-institution', ok:false, status: res.status, body });
        throw new Error('create-institution-failed');
      }
    }catch(e){ out.steps.push({ name: 'create-institution', ok:false, error: String(e) }); throw e; }

    // 4) Ensure auth user exists by listing users and matching email
    try{
      const list = await sup.auth.admin.listUsers();
      const users = list.data?.users || list.data?._getUsers || [];
      const match = users.find(u=>u.email===instPayload.admin_user.email);
      if(match){ created.userId = match.id; out.steps.push({ name: 'find-auth-user', ok:true, userId: match.id }); }
      else { out.steps.push({ name: 'find-auth-user', ok:false, note:'not found in listUsers' }); }
    }catch(e){ out.steps.push({ name: 'find-auth-user', ok:false, error: String(e) }); }

    // 5) Create a tenant-scoped transaction via admin endpoint
    try{
      const txPayload = { tenant_id: created.institution.id, member_id: created.member?.id || null, amount: 12345, type: 'deposit', reference: `SMOKE-${unique}` };
      const r = await fetch(`${BASE_URL}/api/admin/transactions`, { method: 'POST', headers: { 'content-type':'application/json', 'x-admin-key': ADMIN_API_KEY }, body: JSON.stringify(txPayload) });
      const b = await r.json().catch(()=>null);
      if(r.ok && b && b.success){ created.transaction = b.data?.[0] || b.data || null; out.steps.push({ name: 'create-transaction', ok:true, status: r.status, tx_ref: txPayload.reference, tx: { id: created.transaction?.id || null } }); }
      else { out.steps.push({ name: 'create-transaction', ok:false, status: r.status, body: b }); }
    }catch(e){ out.steps.push({ name: 'create-transaction', ok:false, error: String(e) }); }

    // 6) Read back transaction via DB using service key
    try{
      const txs = await sup.from('transactions').select('id,tenant_id,member_id,amount,type,reference,created_at').eq('tenant_id', created.institution.id).order('created_at',{ascending:false}).limit(5);
      out.steps.push({ name: 'db-read-transactions', ok: txs.error==null, count: (txs.data||[]).length });
    }catch(e){ out.steps.push({ name: 'db-read-transactions', ok:false, error: String(e) }); }

    // 7) Read back institution via DB
    try{
      const instQ = await sup.from('institutions').select('id,name,type,email,created_at').eq('id', created.institution.id).maybeSingle();
      out.steps.push({ name: 'db-read-institution', ok: instQ.error==null, data_present: instQ.data!=null });
    }catch(e){ out.steps.push({ name: 'db-read-institution', ok:false, error: String(e) }); }

    out.success = true;
  }catch(e){ out.success = false; out.error = String(e); }
  finally{
    // Cleanup: delete transaction(s), member, profile, institution, auth user
    try{
      if(created.transaction && created.transaction.id){ await sup.from('transactions').delete().eq('id', created.transaction.id); }
      if(created.member && created.member.id){ await sup.from('members').delete().eq('id', created.member.id); }
      if(created.profile && created.profile.id){ await sup.from('profiles').delete().eq('id', created.profile.id); }
      if(created.institution && created.institution.id){ await sup.from('institutions').delete().eq('id', created.institution.id); }
      if(created.userId){
        try{ if(sup.auth && sup.auth.admin && typeof sup.auth.admin.deleteUserById === 'function'){ await sup.auth.admin.deleteUserById(created.userId); } }catch(e){ /* non-fatal */ }
      }
      // ensure local temp password file removed
      try{ const p = 'temp_admin_password.txt'; if(fs.existsSync(p)) fs.unlinkSync(p); }catch(e){}
      out.cleaned = true;
    }catch(e){ out.cleaned = false; out.cleanupError = String(e); }
    console.log(JSON.stringify(out, null, 2));
  }
})();
