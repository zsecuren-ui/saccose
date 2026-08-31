-- =============================================================
-- SACCOS PLATFORM - Final live Supabase SQL bundle
-- Purpose:
--   1) Ensure the live project contains the expected tenant tables
--   2) Add supporting columns/indexes for institution/member ownership
--   3) Create a real institution + real member mapping
--   4) Activate RLS and tenant-scoped policies
--   5) Prepare the project for production use with service role only on server
-- =============================================================

BEGIN;

-- 0) Safety: do not overwrite existing production data accidentally.
-- This script is safe to re-run because it uses IF NOT EXISTS / IF EXISTS guards.

-- 1) Core institutions table
CREATE TABLE IF NOT EXISTS public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text,
  email text,
  phone text,
  address text,
  city text,
  country text DEFAULT 'Tanzania',
  website text,
  status text DEFAULT 'active',
  timezone text DEFAULT 'Africa/Dar_es_Salaam',
  currency text DEFAULT 'TZS',
  joined_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_institutions_status ON public.institutions(status);
CREATE INDEX IF NOT EXISTS idx_institutions_created_at ON public.institutions(created_at DESC);

-- 2) Profiles table for auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  role text DEFAULT 'member',
  tenant_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  is_superadmin boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3) Members table
CREATE TABLE IF NOT EXISTS public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE,
  member_number text,
  full_name text,
  phone text,
  email text,
  id_type text,
  id_number text,
  photo_url text,
  occupation text,
  joined_date timestamptz DEFAULT now(),
  status text DEFAULT 'Active',
  total_savings numeric DEFAULT 0,
  total_shares numeric DEFAULT 0,
  total_loans_outstanding numeric DEFAULT 0,
  branch text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_members_tenant_id ON public.members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_member_number ON public.members(member_number);

-- 4) Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text,
  tenant_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE,
  member_id uuid,
  type text,
  amount numeric DEFAULT 0,
  payment_channel text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  balance_after numeric DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON public.transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON public.transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 5) Loans table
CREATE TABLE IF NOT EXISTS public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE,
  member_id uuid,
  amount_requested numeric DEFAULT 0,
  amount_approved numeric DEFAULT 0,
  interest_rate_annual numeric DEFAULT 0,
  duration_months integer DEFAULT 0,
  status text DEFAULT 'pending',
  applied_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loans_tenant_id ON public.loans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loans_member_id ON public.loans(member_id);

-- 6) Optional announcements table used by public landing page / internal alerts
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  body text,
  author_id uuid,
  created_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT true
);

-- 7) Add missing columns if some live DB is partially created
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS tenant_id uuid,
  ADD COLUMN IF NOT EXISTS is_superadmin boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.members
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.transactions
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS balance_after numeric DEFAULT 0;

ALTER TABLE IF EXISTS public.loans
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.institutions
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 8) Helper function for boolean JWT claim reading
CREATE OR REPLACE FUNCTION public.jwt_claim_bool(claim_name text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT (current_setting(format('jwt.claims.%s', claim_name), true) = 'true')::boolean;
$$;

-- 9) Enable RLS on all tenant-sensitive tables
ALTER TABLE IF EXISTS public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;

-- 10) Public reads for non-sensitive lists
DROP POLICY IF EXISTS institutions_select_public ON public.institutions;
CREATE POLICY institutions_select_public ON public.institutions
FOR SELECT USING (true);

DROP POLICY IF EXISTS profiles_select_public ON public.profiles;
CREATE POLICY profiles_select_public ON public.profiles
FOR SELECT USING (true);

DROP POLICY IF EXISTS members_select_public ON public.members;
CREATE POLICY members_select_public ON public.members
FOR SELECT USING (true);

DROP POLICY IF EXISTS transactions_select_public ON public.transactions;
CREATE POLICY transactions_select_public ON public.transactions
FOR SELECT USING (true);

DROP POLICY IF EXISTS loans_select_public ON public.loans;
CREATE POLICY loans_select_public ON public.loans
FOR SELECT USING (true);

DROP POLICY IF EXISTS announcements_select_public ON public.announcements;
CREATE POLICY announcements_select_public ON public.announcements
FOR SELECT USING (true);

-- 11) Superadmin writes on institutions and profiles
DROP POLICY IF EXISTS institutions_insert_superadmin ON public.institutions;
CREATE POLICY institutions_insert_superadmin ON public.institutions
FOR INSERT WITH CHECK (public.jwt_claim_bool('is_superadmin'));

DROP POLICY IF EXISTS institutions_update_superadmin ON public.institutions;
CREATE POLICY institutions_update_superadmin ON public.institutions
FOR UPDATE USING (public.jwt_claim_bool('is_superadmin')) WITH CHECK (public.jwt_claim_bool('is_superadmin'));

DROP POLICY IF EXISTS institutions_delete_superadmin ON public.institutions;
CREATE POLICY institutions_delete_superadmin ON public.institutions
FOR DELETE USING (public.jwt_claim_bool('is_superadmin'));

DROP POLICY IF EXISTS profiles_self ON public.profiles;
CREATE POLICY profiles_self ON public.profiles
FOR ALL USING (auth.role() = 'authenticated' AND id = auth.uid())
WITH CHECK (auth.role() = 'authenticated' AND id = auth.uid());

-- 12) Tenant-scoped member writes
DROP POLICY IF EXISTS members_write_tenant_claim ON public.members;
CREATE POLICY members_write_tenant_claim ON public.members
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    OR
    public.jwt_claim_bool('is_superadmin')
  )
);

DROP POLICY IF EXISTS members_update_tenant ON public.members;
CREATE POLICY members_update_tenant ON public.members
FOR UPDATE USING (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    OR
    public.jwt_claim_bool('is_superadmin')
  )
) WITH CHECK (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    OR
    public.jwt_claim_bool('is_superadmin')
  )
);

DROP POLICY IF EXISTS members_delete_tenant ON public.members;
CREATE POLICY members_delete_tenant ON public.members
FOR DELETE USING (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    OR
    public.jwt_claim_bool('is_superadmin')
  )
);

-- 13) Tenant-scoped transaction writes
DROP POLICY IF EXISTS transactions_write_tenant_claim ON public.transactions;
CREATE POLICY transactions_write_tenant_claim ON public.transactions
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    OR
    public.jwt_claim_bool('is_superadmin')
  )
);

DROP POLICY IF EXISTS transactions_update_tenant ON public.transactions;
CREATE POLICY transactions_update_tenant ON public.transactions
FOR UPDATE USING (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    OR
    public.jwt_claim_bool('is_superadmin')
  )
) WITH CHECK (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    OR
    public.jwt_claim_bool('is_superadmin')
  )
);

DROP POLICY IF EXISTS transactions_delete_tenant ON public.transactions;
CREATE POLICY transactions_delete_tenant ON public.transactions
FOR DELETE USING (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    OR
    public.jwt_claim_bool('is_superadmin')
  )
);

-- 14) Tenant-scoped loan writes
DROP POLICY IF EXISTS loans_write_tenant_claim ON public.loans;
CREATE POLICY loans_write_tenant_claim ON public.loans
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    OR
    public.jwt_claim_bool('is_superadmin')
  )
);

DROP POLICY IF EXISTS loans_update_tenant ON public.loans;
CREATE POLICY loans_update_tenant ON public.loans
FOR UPDATE USING (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    OR
    public.jwt_claim_bool('is_superadmin')
  )
) WITH CHECK (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    OR
    public.jwt_claim_bool('is_superadmin')
  )
);

-- 15) Real institution and real member seed for live project
-- Replace the UUID placeholders with the real institution id and real auth user id.
-- If you do not know them yet, create the institution first, then insert the profile/member rows.

DO $$
DECLARE
  v_institution_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.institutions WHERE name = 'SACCOS PLATFORM') THEN
    INSERT INTO public.institutions (
      id,
      name,
      short_name,
      email,
      phone,
      address,
      city,
      country,
      website,
      status,
      timezone,
      currency,
      joined_date
    ) VALUES (
      gen_random_uuid(),
      'SACCOS PLATFORM',
      'SACCOS',
      'admin@saccos-platform.co.tz',
      '+255700000000',
      'Dar es Salaam',
      'Dar es Salaam',
      'Tanzania',
      'https://www.saccos-platform.co.tz',
      'active',
      'Africa/Dar_es_Salaam',
      'TZS',
      now()
    )
    RETURNING id INTO v_institution_id;
  ELSE
    SELECT id INTO v_institution_id FROM public.institutions WHERE name = 'SACCOS PLATFORM' LIMIT 1;
  END IF;

  IF v_institution_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, tenant_id, role, is_superadmin, last_login, created_at, updated_at)
    VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'admin@saccos-platform.co.tz',
      'System Administrator',
      v_institution_id,
      'superadmin',
      true,
      now(),
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        tenant_id = EXCLUDED.tenant_id,
        role = EXCLUDED.role,
        is_superadmin = EXCLUDED.is_superadmin,
        last_login = NOW(),
        updated_at = NOW();

    INSERT INTO public.members (
      tenant_id,
      member_number,
      full_name,
      phone,
      email,
      id_type,
      id_number,
      occupation,
      joined_date,
      status,
      total_savings,
      total_shares,
      total_loans_outstanding,
      branch,
      created_at,
      updated_at
    )
    VALUES (
      v_institution_id,
      'SP-001',
      'System Administrator',
      '+255700000000',
      'admin@saccos-platform.co.tz',
      'National ID',
      '00000000',
      'Administrator',
      now(),
      'Active',
      0,
      0,
      0,
      'HQ',
      now(),
      now()
    )
    ON CONFLICT (email) DO UPDATE
    SET tenant_id = EXCLUDED.tenant_id,
        member_number = EXCLUDED.member_number,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        id_type = EXCLUDED.id_type,
        id_number = EXCLUDED.id_number,
        occupation = EXCLUDED.occupation,
        status = EXCLUDED.status,
        branch = EXCLUDED.branch,
        updated_at = NOW();
  END IF;
END $$;

-- 16) Helpful production checks
-- Run in Supabase SQL editor to validate the live setup:
-- SELECT * FROM public.institutions;
-- SELECT * FROM public.profiles;
-- SELECT * FROM public.members;
-- SELECT * FROM public.transactions;
-- SELECT * FROM pg_policies WHERE schemaname = 'public';

COMMIT;
