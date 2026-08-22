-- Migration: Recommended consolidated RLS (claims + profile fallbacks) and helper functions
-- Run this in Supabase SQL editor after you've created the necessary columns (profiles.tenant_id, institutions, etc.).

-- 1) Helper function to read boolean claims more reliably
CREATE OR REPLACE FUNCTION public.jwt_claim_bool(claim_name text)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT (current_setting(format('jwt.claims.%s', claim_name), true) = 'true')::boolean;
$$;

-- 2) ANNOUNCEMENTS: public select, authenticated inserts by author
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS announcements_select_public ON public.announcements FOR SELECT USING (true);
CREATE POLICY IF NOT_EXISTS announcements_insert_authenticated ON public.announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND author_id = auth.uid());

-- 3) PROFILES: users may access their own profile
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT_EXISTS profiles_self ON public.profiles FOR ALL USING (auth.role() = 'authenticated' AND id = auth.uid()) WITH CHECK (auth.role() = 'authenticated' AND id = auth.uid());

-- 4) INSTITUTIONS: public select; writes only by superadmin claim or via service_role
ALTER TABLE IF EXISTS public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT_EXISTS institutions_select_public ON public.institutions FOR SELECT USING (true);
CREATE POLICY IF NOT_EXISTS institutions_insert_superadmin ON public.institutions FOR INSERT WITH CHECK (public.jwt_claim_bool('is_superadmin'));
CREATE POLICY IF NOT_EXISTS institutions_update_superadmin ON public.institutions FOR UPDATE USING (public.jwt_claim_bool('is_superadmin')) WITH CHECK (public.jwt_claim_bool('is_superadmin'));
CREATE POLICY IF NOT_EXISTS institutions_delete_superadmin ON public.institutions FOR DELETE USING (public.jwt_claim_bool('is_superadmin'));

-- 5) MEMBERS & TRANSACTIONS: prefer claim-based tenant_id matching, fallback to profiles.tenant_id lookup
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;

-- SELECT policies (public read or restrict as needed)
CREATE POLICY IF NOT_EXISTS members_select_public ON public.members FOR SELECT USING (true);
CREATE POLICY IF NOT_EXISTS transactions_select_public ON public.transactions FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: allow when tenant_id matches jwt.claims.tenant_id OR matches profiles.tenant_id for authenticated users
-- Members
CREATE POLICY IF NOT_EXISTS members_write_tenant_claim ON public.members FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  )
);

CREATE POLICY IF NOT_EXISTS members_update_tenant ON public.members FOR UPDATE USING (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  )
) WITH CHECK (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  )
);

CREATE POLICY IF NOT_EXISTS members_delete_tenant ON public.members FOR DELETE USING (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  )
);

-- Transactions
CREATE POLICY IF NOT_EXISTS transactions_write_tenant_claim ON public.transactions FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  )
);

CREATE POLICY IF NOT_EXISTS transactions_update_tenant ON public.transactions FOR UPDATE USING (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  )
) WITH CHECK (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  )
);

CREATE POLICY IF NOT_EXISTS transactions_delete_tenant ON public.transactions FOR DELETE USING (
  auth.role() = 'authenticated' AND (
    (current_setting('jwt.claims.tenant_id', true) IS NOT NULL AND tenant_id = current_setting('jwt.claims.tenant_id')::uuid)
    OR
    (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  )
);

-- Notes:
-- 1) Service role bypasses RLS and is used by server-side admin endpoints.
-- 2) Adapt the "jwt_claim_bool('is_superadmin')" to the exact claim name you use when minting tokens.
-- 3) Test in staging. If you want strict read restrictions, change SELECT policies accordingly.

-- End of recommended RLS consolidation
