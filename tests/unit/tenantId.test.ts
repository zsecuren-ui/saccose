import { describe, expect, it } from 'vitest';
import { CONFIRMED_TENANT_ID, normalizeTenantId, resolveTenantId } from '../../src/lib/tenantId';

describe('normalizeTenantId', () => {
  it('normalizes a valid UUID and rejects empty or malformed values', () => {
    const tenantId = CONFIRMED_TENANT_ID;

    expect(normalizeTenantId(tenantId)).toBe(tenantId);
    expect(normalizeTenantId('  ')).toBeUndefined();
    expect(normalizeTenantId('tenant_mlimani')).toBeUndefined();
    expect(normalizeTenantId('')).toBeUndefined();
  });

  it('prefers a valid active tenant and falls back to the selected institution', () => {
    expect(resolveTenantId('', undefined, CONFIRMED_TENANT_ID)).toBe(CONFIRMED_TENANT_ID);
    expect(resolveTenantId('tenant_mlimani', undefined, CONFIRMED_TENANT_ID)).toBe(CONFIRMED_TENANT_ID);
  });

  it('uses the confirmed UUID when no valid tenant is selected', () => {
    expect(resolveTenantId('', undefined, '')).toBe(CONFIRMED_TENANT_ID);
  });
});
