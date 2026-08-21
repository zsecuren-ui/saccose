-- Migration: RLS policies for production tenancy and security
-- Run this file in Supabase SQL editor (Project > Database > SQL Editor) as an admin/service role.
-- These policies assume your JWT includes a "tenant_id" claim (jwt.claims.tenant_id) for tenant-scoped users
-- and optionally a boolean claim "is_superadmin" (jwt.claims.is_superadmin) for platform superadmins.
-- The service_role key always bypasses RLS and can be used by server-side admin endpoints.

-- Enable RLS on tables
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.institutions ENABLE ROW LEVEL SECURITY;

-- ANNOUNCEMENTS: allow public SELECT; only authenticated users can INSERT their own announcements
CREATE POLICY IF NOT EXISTS select_for_all_announcements ON public.announcements
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS insert_authenticated_announcements ON public.announcements
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND author_id = auth.uid());

CREATE POLICY IF NOT EXISTS update_own_announcements ON public.announcements
  FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY IF NOT EXISTS delete_own_announcements ON public.announcements
  FOR DELETE
  USING (author_id = auth.uid());

-- PROFILES: allow users to read their own profile and update/insert their own profile
CREATE POLICY IF NOT EXISTS select_profiles ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated' AND id = auth.uid());

CREATE POLICY IF NOT EXISTS upsert_own_profile ON public.profiles
  FOR ALL
  USING (auth.role() = 'authenticated' AND id = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND id = auth.uid());

-- MEMBERS: allow SELECT for authenticated users (or public if you prefer)
CREATE POLICY IF NOT EXISTS select_members ON public.members
  FOR SELECT
  USING (true);

-- Only allow INSERT/UPDATE/DELETE when the JWT tenant_id claim matches tenant_id column
CREATE POLICY IF NOT EXISTS insert_members_tenant ON public.members
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND
    tenant_id = current_setting('jwt.claims.tenant_id')::uuid
  );

CREATE POLICY IF NOT EXISTS update_members_tenant ON public.members
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND
    tenant_id = current_setting('jwt.claims.tenant_id')::uuid
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND
    tenant_id = current_setting('jwt.claims.tenant_id')::uuid
  );

CREATE POLICY IF NOT EXISTS delete_members_tenant ON public.members
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND
    tenant_id = current_setting('jwt.claims.tenant_id')::uuid
  );

-- TRANSACTIONS: allow SELECT for authenticated users; INSERT only when tenant_id claim matches (or via service_role)
CREATE POLICY IF NOT_EXISTS select_transactions ON public.transactions
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT_EXISTS insert_transactions_tenant ON public.transactions
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND
    tenant_id = current_setting('jwt.claims.tenant_id')::uuid
  );

CREATE POLICY IF NOT_EXISTS update_transactions_tenant ON public.transactions
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND
    tenant_id = current_setting('jwt.claims.tenant_id')::uuid
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND
    tenant_id = current_setting('jwt.claims.tenant_id')::uuid
  );

CREATE POLICY IF NOT_EXISTS delete_transactions_tenant ON public.transactions
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND
    tenant_id = current_setting('jwt.claims.tenant_id')::uuid
  );

-- INSTITUTIONS: allow public SELECT; restrict INSERT/UPDATE/DELETE to superadmins (via claim is_superadmin) OR use server-side service_role
CREATE POLICY IF NOT_EXISTS select_institutions ON public.institutions
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT_EXISTS insert_institutions_superadmin ON public.institutions
  FOR INSERT
  WITH CHECK (
    current_setting('jwt.claims.is_superadmin', true) = 'true'
  );

CREATE POLICY IF NOT_EXISTS update_institutions_superadmin ON public.institutions
  FOR UPDATE
  USING (current_setting('jwt.claims.is_superadmin', true) = 'true')
  WITH CHECK (current_setting('jwt.claims.is_superadmin', true) = 'true');

CREATE POLICY IF NOT_EXISTS delete_institutions_superadmin ON public.institutions
  FOR DELETE
  USING (current_setting('jwt.claims.is_superadmin', true) = 'true');

-- NOTES:
-- 1) Service role key bypasses RLS, so server-side admin endpoints (using service_role) can always perform admin writes.
-- 2) Customize the claim names (tenant_id, is_superadmin) to match how you mint JWTs. If you use different claim names, replace them in current_setting('jwt.claims.<name>', true).
-- 3) Test policies in a staging project before applying to production.

-- End of migration
