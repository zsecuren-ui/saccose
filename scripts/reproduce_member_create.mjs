import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: 'saccos/.env' });

const baseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const productionUrl = 'https://zsecuren.org';

if (!baseUrl || !serviceRoleKey || !anonKey) {
  throw new Error('Missing Supabase configuration');
}

const adminClient = createClient(baseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const anonClient = createClient(baseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const previousProfiles = await adminClient.from('profiles')
  .select('id')
  .eq('full_name', 'Temporary Member Reproduction');
if (previousProfiles.data?.length) {
  await adminClient.from('profiles').delete().in('id', previousProfiles.data.map(profile => profile.id));
}

let testUserId = '';
let accessToken = '';
let tenantId = '';
let memberId = crypto.randomUUID();
let result;

try {
  const email = `member-repro-${crypto.randomUUID()}@example.invalid`;
  const createdUser = await adminClient.auth.admin.createUser({
    email,
    password: 'ReproPassword123!',
    email_confirm: true,
    options: {
      data: {
        full_name: 'Temporary Member Reproduction',
        role: 'superadmin',
        is_superadmin: true
      }
    }
  });

  if (createdUser.error) throw createdUser.error;
  testUserId = createdUser.data.user.id;

  const profile = await adminClient.from('profiles').upsert({
    id: testUserId,
    email,
    full_name: 'Temporary Member Reproduction',
    role: 'superadmin',
    tenant_id: null,
    is_superadmin: true,
    last_login: new Date().toISOString()
  }, { onConflict: 'id' });
  if (profile.error) throw profile.error;

  const signIn = await anonClient.auth.signInWithPassword({
    email,
    password: 'ReproPassword123!'
  });
  if (signIn.error) throw signIn.error;
  accessToken = signIn.data.session.access_token;

  const institution = await adminClient.from('institutions').select('id,name').limit(1).single();
  if (institution.error || !institution.data?.id) throw new Error('No institution found');
  tenantId = institution.data.id;

  const payload = {
    id: memberId,
    tenant_id: tenantId,
    member_number: `REPRO-${Date.now()}`,
    full_name: 'Temporary Endpoint Reproduction',
    phone: null,
    email: null,
    photo_url: null,
    occupation: null,
    id_type: 'NIDA',
    id_number: null,
    branch: 'Main Branch',
    status: 'Active',
    total_savings: 0,
    total_shares: 0,
    total_loans_outstanding: 0,
    joined_date: new Date().toISOString()
  };

  const response = await fetch(`${productionUrl}/api/admin/members`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000)
  });
  const body = await response.json();
  result = { status: response.status, body, memberId, tenantId };
  console.log(JSON.stringify(result, null, 2));

  if (!response.ok || !body.success) process.exitCode = 1;
} catch (error) {
  console.error('REPRODUCTION_ERROR:', error.message || error);
  process.exitCode = 1;
} finally {
  let memberClean = false;
  let userClean = false;
  let profileClean = false;
  if (memberId) {
    try {
      await adminClient.from('members').delete().eq('id', memberId);
      const memberCheck = await adminClient.from('members').select('id').eq('id', memberId).maybeSingle();
      memberClean = !memberCheck.data;
    } catch (cleanupError) {
      console.warn('Cleanup member failed:', cleanupError.message || cleanupError);
    }
  }

  if (testUserId) {
    try {
      await adminClient.auth.admin.deleteUser(testUserId);
      userClean = true;
    } catch (cleanupError) {
      console.warn('Cleanup user failed:', cleanupError.message || cleanupError);
    }
  }

  if (testUserId) {
    try {
      await adminClient.from('profiles').delete().eq('id', testUserId);
      const profileCheck = await adminClient.from('profiles').select('id').eq('id', testUserId).maybeSingle();
      profileClean = !profileCheck.data;
    } catch (cleanupError) {
      console.warn('Cleanup profile failed:', cleanupError.message || cleanupError);
    }
  }

  console.log(JSON.stringify({ cleanupCompleted: memberClean && userClean && profileClean, memberId, tenantId }, null, 2));
}
