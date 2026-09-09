-- Link member records to Supabase Auth and prevent members from reading other members.
-- Run after 007_live_supabase_bundle.sql.

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS username text;

CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_username ON public.members(username);

UPDATE public.members AS m
SET user_id = u.id,
    username = lower(u.email)
FROM auth.users AS u
WHERE m.user_id IS NULL
  AND m.email IS NOT NULL
  AND lower(m.email) = lower(u.email);

CREATE OR REPLACE FUNCTION public.app_can_manage_tenant(target_tenant_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.jwt_claim_bool('is_superadmin')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('superadmin', 'tenantadmin')
        AND p.tenant_id = target_tenant_id
    );
$$;

DROP POLICY IF EXISTS members_select_public ON public.members;
DROP POLICY IF EXISTS select_members ON public.members;
DROP POLICY IF EXISTS members_select_scoped ON public.members;
CREATE POLICY members_select_scoped ON public.members
FOR SELECT USING (
  public.app_can_manage_tenant(tenant_id)
  OR user_id = auth.uid()
  OR (user_id IS NULL AND lower(email) = lower(auth.jwt() ->> 'email'))
);

DROP POLICY IF EXISTS transactions_select_public ON public.transactions;
CREATE POLICY transactions_select_member_scoped ON public.transactions
FOR SELECT USING (
  public.app_can_manage_tenant(tenant_id)
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = transactions.member_id
      AND (m.user_id = auth.uid() OR lower(m.email) = lower(auth.jwt() ->> 'email'))
  )
);

DROP POLICY IF EXISTS loans_select_public ON public.loans;
CREATE POLICY loans_select_member_scoped ON public.loans
FOR SELECT USING (
  public.app_can_manage_tenant(tenant_id)
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = loans.member_id
      AND (m.user_id = auth.uid() OR lower(m.email) = lower(auth.jwt() ->> 'email'))
  )
);
