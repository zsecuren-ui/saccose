-- Migration: add tenant_id to profiles and create institution_settings table

-- Add tenant_id to profiles so auth users can be associated with a tenant (institution)
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS tenant_id uuid;

-- Create a simple institution_settings table to hold tenant-level defaults
CREATE TABLE IF NOT EXISTS public.institution_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE,
  timezone text DEFAULT 'Africa/Dar_es_Salaam',
  currency text DEFAULT 'TZS',
  theme text DEFAULT 'default',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles (tenant_id);
CREATE INDEX IF NOT EXISTS idx_institution_settings_tenant ON public.institution_settings (tenant_id);

-- End of migration
