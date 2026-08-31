require('dotenv').config(); (async ()=>{
  try{
    const fs = require('fs');
    const { createClient } = require('@supabase/supabase-js');
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
    if(!SUPABASE_URL || !SERVICE_KEY){ console.error('MISSING_SERVICE_ROLE_OR_URL'); process.exit(2); }
    const sup = createClient(SUPABASE_URL, SERVICE_KEY);
    const userId = '18ac09e3-8e3d-4ffa-8693-eaea9d1d7a68';
    const newPassword = 'TempPass!ChangeMe123';
    if(!(sup.auth && sup.auth.admin && typeof sup.auth.admin.updateUserById === 'function')){
      console.error('ADMIN_UPDATE_NOT_AVAILABLE'); process.exit(3);
    }
    const res = await sup.auth.admin.updateUserById(userId, { password: newPassword });
    if(res.user && res.user.id){ fs.writeFileSync('temp_admin_password.txt', newPassword, { encoding: 'utf8', flag: 'w' }); console.log('UPDATED', JSON.stringify({ id: res.user.id, email: res.user.email }, null,2)); console.log('PASSWORD_SAVED_FILE: temp_admin_password.txt'); } else { console.error('UPDATE_FAILED', JSON.stringify(res)); process.exit(4); }
  }catch(e){ console.error('ERR', e); process.exit(1); }
})();
