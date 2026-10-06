import { isUuid } from './uuid';

export const CONFIRMED_TENANT_ID = '09c38950-67d3-4669-bb75-ea9257253a50';

export const normalizeTenantId = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim();
  return isUuid(normalized) ? normalized : undefined;
};

export const resolveTenantId = (
  activeTenantId?: string,
  memberTenantId?: string,
  institutionId?: string
): string | undefined => {
  return normalizeTenantId(activeTenantId) ||
    normalizeTenantId(memberTenantId) ||
    normalizeTenantId(institutionId) ||
    CONFIRMED_TENANT_ID;
};
