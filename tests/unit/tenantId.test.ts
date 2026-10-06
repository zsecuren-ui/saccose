import { describe, expect, it } from 'vitest';
import { normalizeTenantId } from '../../src/lib/tenantId';

describe('normalizeTenantId', () => {
  it('normalizes a valid UUID and rejects empty or malformed values', () => {
    const tenantId = '09c38950-67d3-4669-bb75-ea9257253a50';

    expect(normalizeTenantId(tenantId)).toBe(tenantId);
    expect(normalizeTenantId('  ')).toBeUndefined();
    expect(normalizeTenantId('tenant_mlimani')).toBeUndefined();
    expect(normalizeTenantId('')).toBeUndefined();
  });
});
