require('dotenv').config(); (async ()=>{
  try{
    const fs = require('fs');
    const { createClient } = require('@supabase/supabase-js');
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
    if(!SUPABASE_URL || !SERVICE_KEY){ console.error('MISSING_SERVICE_ROLE_OR_URL'); process.exit(2); }
    const sup = createClient(SUPABASE_URL, SERVICE_KEY);

    const instId = '4c32ccb0-877d-4ae0-9c72-947fc304c4a8';
    const userId = '18ac09e3-8e3d-4ffa-8693-eaea9d1d7a68';

    console.log('Starting cleanup for institution', instId, 'and user', userId);

    // Delete members for tenant
    try{
      const delMembers = await sup.from('members').delete().eq('tenant_id', instId).select();
      console.log('members.delete', JSON.stringify({ error: delMembers.error, count: (delMembers.data||[]).length }));
    }catch(e){ console.warn('members.delete failed', e); }

    // Delete profiles for the created user
    try{
      const delProfiles = await sup.from('profiles').delete().eq('id', userId).select();
      console.log('profiles.delete', JSON.stringify({ error: delProfiles.error, count: (delProfiles.data||[]).length }));
    }catch(e){ console.warn('profiles.delete failed', e); }

    // Delete institution row
    try{
      const delInst = await sup.from('institutions').delete().eq('id', instId).select();
      console.log('institutions.delete', JSON.stringify({ error: delInst.error, count: (delInst.data||[]).length }));
    }catch(e){ console.warn('institutions.delete failed', e); }

    // Try to delete auth user via admin API (best-effort)
    try{
      if(sup.auth && sup.auth.admin && typeof sup.auth.admin.deleteUser === 'function'){
        const r = await sup.auth.admin.deleteUser(userId);
        console.log('auth.admin.deleteUser result', JSON.stringify(r || {}));
      } else if(sup.auth && sup.auth.admin && typeof sup.auth.admin.deleteUserById === 'function'){
        const r = await sup.auth.admin.deleteUserById(userId);
        console.log('auth.admin.deleteUserById result', JSON.stringify(r || {}));
      } else if(sup.auth && typeof sup.auth.deleteUser === 'function'){
        const r = await sup.auth.deleteUser(userId);
        console.log('auth.deleteUser result', JSON.stringify(r || {}));
      } else {
        console.log('No supported admin deleteUser API found on this Supabase client — auth user may remain in auth.users');
      }
    }catch(e){ console.warn('auth.delete failed (non-fatal)', e); }

    // Remove local password file if present
    try{
      const pwdPath = 'temp_admin_password.txt';
      if(fs.existsSync(pwdPath)){
        fs.unlinkSync(pwdPath);
        console.log('Local password file removed:', pwdPath);
      } else {
        console.log('No local password file found');
      }
    }catch(e){ console.warn('Failed to remove local password file', e); }

    console.log('Cleanup finished.');
  }catch(e){ console.error('UNEXPECTED_ERROR', e); process.exit(1); }
})();
