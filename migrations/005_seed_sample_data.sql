-- Migration: Seed sample production-friendly data (optional)
-- Run only after core tables exist. This creates a sample plan, roles and a sample institution placeholder.

INSERT INTO public.plans (id, name, description, created_at)
SELECT gen_random_uuid(), 'starter', 'Starter plan for small SACCOS', now()
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE name = 'starter');

-- Create an institution placeholder (do not run if you already have production data)
INSERT INTO public.institutions (id, name, domain, registration_number, phone, email, status)
SELECT gen_random_uuid(), 'SACCOS - Sample Tenant', 'sample.saccos.local', 'SAMPLE-0001', '0000000000', 'sample@saccos.local', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM public.institutions WHERE domain = 'sample.saccos.local');

-- Default roles table (if you use a roles table)
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE,
  description text
);

INSERT INTO public.roles (name, description)
SELECT 'superadmin', 'Platform super administrator'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'superadmin');

INSERT INTO public.roles (name, description)
SELECT 'tenant_admin', 'Administrator for a tenant/institution'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'tenant_admin');

-- End of seed
