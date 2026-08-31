/*
  Script: admin_test.js
  Usage (from project root):
    node scripts/admin_test.js

  Environment variables required for the verification step (optional):
    ADMIN_API_URL - default http://localhost:3001/api/admin/institutions
    ADMIN_API_KEY - required to call admin endpoint
    SUPABASE_URL - optional, used to verify created institution via service role
    SUPABASE_SERVICE_ROLE_KEY - optional, used to query Supabase directly for verification

  This script will:
    1) POST to /api/admin/institutions with sample payload (institution + admin_user)
    2) If SUPABASE_SERVICE_ROLE_KEY is set, query institutions table to verify creation
*/

const fetch = require('node-fetch');

(async () => {
  try {
    const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3001/api/admin/institutions';
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.VITE_ADMIN_API_KEY || process.env.SERVER_ADMIN_KEY;
    if (!ADMIN_API_KEY) return console.error('Set ADMIN_API_KEY (or VITE_ADMIN_API_KEY) env var before running this script.');

    const payload = {
      institution: {
        name: 'Test Institution from script',
        domain: 'test-institution.local',
        registration_number: 'TEST-2026-01',
        phone: '0000000000',
        email: 'admin@test-institution.local',
        status: 'Active'
      },
      admin_user: {
        email: 'admin+script@test-institution.local',
        password: 'P@ssw0rd123!',
        full_name: 'Script Admin',
        phone: '0000000000',
        timezone: 'Africa/Dar_es_Salaam',
        currency: 'TZS'
      }
    };

    console.log('Calling admin endpoint:', ADMIN_API_URL);
    const res = await fetch(ADMIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    console.log('Admin endpoint response:', JSON.stringify(json, null, 2));

    // Optional verification via Supabase service role
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
    if (SUPABASE_URL && SERVICE_ROLE) {
      const supaRes = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/institutions?domain=eq.test-institution.local`, {
        method: 'GET',
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`
        }
      });
      const institutions = await supaRes.json();
      console.log('Direct Supabase institutions query (service role):', institutions);
    } else {
      console.log('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY not provided, skipping direct verification.');
    }

  } catch (err) {
    console.error('Script error:', err);
  }
})();
