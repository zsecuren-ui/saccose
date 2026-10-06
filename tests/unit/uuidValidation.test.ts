import { describe, expect, it } from 'vitest';
import { isUuid } from '../../src/lib/uuid';

describe('UUID validation', () => {
  it('accepts valid UUID v4 values', () => {
    expect(isUuid('09c38950-67d3-4669-bb75-ea9257253a50')).toBe(true);
  });

  it('rejects seeded application identifiers', () => {
    expect(isUuid('tenant_mlimani')).toBe(false);
  });

  it('rejects malformed identifiers', () => {
    expect(isUuid('not-a-uuid')).toBe(false);
    expect(isUuid('09c38950-67d3-4669-bb75')).toBe(false);
  });
});
