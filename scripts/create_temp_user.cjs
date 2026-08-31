require('dotenv').config(); (async ()=>{
  try{
    const crypto = require('crypto');
    const fs = require('fs');
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
    if(!SUPABASE_URL || !SERVICE_KEY){ console.error('MISSING_SERVICE_ROLE_OR_URL'); process.exit(2); }
    const { createClient } = require('@supabase/supabase-js');
    const sup = createClient(SUPABASE_URL, SERVICE_KEY);
    const email = 'tempadmin@example.tz';
    const password = 'P@ss-' + crypto.randomBytes(8).toString('base64').replace(/\/+|\=+/g, '');

    const authAdmin = (sup.auth && sup.auth.admin) ? sup.auth.admin : null;
    let createdUser = null;

    if(authAdmin && typeof authAdmin.createUser === 'function'){
      const createRes = await authAdmin.createUser({
        email,
        password,
        user_metadata: { full_name: 'Temp Admin' },
        email_confirm: true
      });
      createdUser = createRes.user || createRes.data || createRes;
    } else if(sup.auth && typeof sup.auth.createUser === 'function'){
      const createRes = await sup.auth.createUser({ email, password, user_metadata: { full_name: 'Temp Admin' } });
      createdUser = createRes.user || createRes.data || createRes;
    } else {
      console.error('NO_ADMIN_CREATE_API'); process.exit(3);
    }

    if(!createdUser || !createdUser.id){ console.error('CREATE_USER_FAILED', JSON.stringify(createdUser||{})); process.exit(4); }

    const instId = '4c32ccb0-877d-4ae0-9c72-947fc304c4a8';
    const profileRow = { id: createdUser.id, email, full_name: 'Temp Admin', tenant_id: instId, last_login: new Date().toISOString() };
    const { data: pData, error: pErr } = await sup.from('profiles').upsert(profileRow, { onConflict: 'id' }).select();

    try{
      const memberRow = { tenant_id: instId, full_name: 'Temp Admin', email, phone: '+255700000099', joined_date: new Date().toISOString(), status: 'Active' };
      const { data: mData, error: mErr } = await sup.from('members').insert([memberRow]).select();
    }catch(e){ /* non-fatal */ }

    fs.writeFileSync('temp_admin_password.txt', password, { encoding: 'utf8', flag: 'w' });

    console.log('CREATED_USER_ID:' + createdUser.id);
    console.log('PASSWORD_SAVED_FILE: temp_admin_password.txt');
    console.log(JSON.stringify({ user: { id: createdUser.id, email: createdUser.email || email } }, null, 2));

  }catch(e){ console.error('ERR', e); process.exit(1); }
})();
