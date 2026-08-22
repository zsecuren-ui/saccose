-- Migration: Alternative RLS policies that use profiles.tenant_id for tenant scoping
-- Use these if your JWT does not include tenant_id claim. These policies check the authenticated user's
-- tenant by looking up public.profiles where id = auth.uid().

-- MEMBERS: allow SELECT for all (or restrict if desired)
CREATE POLICY IF NOT EXISTS select_members_profile_tenant ON public.members
  FOR SELECT
  USING (true);

-- Allow INSERT only when tenant_id equals the tenant of the authenticated user's profile
CREATE POLICY IF NOT EXISTS insert_members_profile_based ON public.members
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IS NOT NULL AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS update_members_profile_based ON public.members
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS delete_members_profile_based ON public.members
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- TRANSACTIONS: similar policies
CREATE POLICY IF NOT EXISTS select_transactions_profile_tenant ON public.transactions
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS insert_transactions_profile_based ON public.transactions
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IS NOT NULL AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT_EXISTS update_transactions_profile_based ON public.transactions
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT_EXISTS delete_transactions_profile_based ON public.transactions
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- NOTES: Run this migration in Supabase SQL editor if you prefer tenant-to-profile mapping.
-- Test carefully in staging before applying to production.
