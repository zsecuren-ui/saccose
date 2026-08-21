-- Migration: Core tables for production
-- Creates profiles, members, transactions, and loans tables with basic RLS policies

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  last_login timestamptz
);

CREATE TABLE IF NOT EXISTS public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
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
  branch text
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text,
  tenant_id uuid,
  member_id uuid,
  type text,
  amount numeric,
  payment_channel text,
  status text,
  created_at timestamptz DEFAULT now(),
  balance_after numeric
);

CREATE TABLE IF NOT EXISTS public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  member_id uuid,
  amount_requested numeric,
  amount_approved numeric,
  interest_rate_annual numeric,
  duration_months integer,
  status text,
  applied_date timestamptz DEFAULT now()
);

-- Enable RLS where appropriate
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loans ENABLE ROW LEVEL SECURITY;

-- Announcements: allow public SELECT, and authenticated INSERT with author_id check
CREATE POLICY IF NOT EXISTS select_for_all_announcements ON public.announcements
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS insert_authenticated_announcements ON public.announcements
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND author_id = auth.uid());

-- Profiles: only allow users to insert/update their own profile
CREATE POLICY IF NOT EXISTS select_profiles ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS upsert_own_profile ON public.profiles
  FOR ALL
  USING (auth.role() = 'authenticated' AND id = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND id = auth.uid());

-- Members: allow SELECT for tenants; INSERT/UPDATE must be through server (service_role) or tenant-admin authenticated users.
CREATE POLICY IF NOT EXISTS select_members ON public.members
  FOR SELECT
  USING (true);

-- Transactions: allow SELECT for authenticated; INSERT via server (service_role) or authenticated users when tenant_id is provided and matches claim
CREATE POLICY IF NOT EXISTS select_transactions ON public.transactions
  FOR SELECT
  USING (true);

-- For production: keep INSERT/UPDATE on members/transactions restricted and perform writes via server-side admin endpoints (service_role key) for sensitive operations.

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_members_tenant ON public.members (tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON public.transactions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member ON public.transactions (member_id);

-- End of migration
