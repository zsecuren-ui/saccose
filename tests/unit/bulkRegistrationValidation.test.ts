import { describe, it, expect } from 'vitest';

describe('Bulk Registration Input Range Validation (1 to 50)', () => {
  function validateMemberCount(input: number): { valid: boolean; normalized: number; error?: string } {
    if (isNaN(input)) {
      return { valid: false, normalized: 1, error: 'Tafadhali weka namba iliyo halali (1 - 50).' };
    }
    if (input < 1) {
      return { valid: false, normalized: 1, error: 'Idadi ya chini kabisa ya kusajili ni mwanachama 1.' };
    }
    if (input > 50) {
      return { valid: false, normalized: 50, error: 'Idadi ya juu kabisa ya kusajili kwa mkupuo ni wanachama 50.' };
    }
    return { valid: true, normalized: input };
  }

  it('should accept valid values within 1 to 50', () => {
    expect(validateMemberCount(1).valid).toBe(true);
    expect(validateMemberCount(25).valid).toBe(true);
    expect(validateMemberCount(50).valid).toBe(true);
  });

  it('should reject and normalize values below 1', () => {
    const res = validateMemberCount(0);
    expect(res.valid).toBe(false);
    expect(res.normalized).toBe(1);
    expect(res.error).toBe('Idadi ya chini kabisa ya kusajili ni mwanachama 1.');
  });

  it('should reject and normalize values above 50', () => {
    const res = validateMemberCount(51);
    expect(res.valid).toBe(false);
    expect(res.normalized).toBe(50);
    expect(res.error).toBe('Idadi ya juu kabisa ya kusajili kwa mkupuo ni wanachama 50.');
  });

  it('should handle NaN gracefully', () => {
    const res = validateMemberCount(NaN);
    expect(res.valid).toBe(false);
    expect(res.normalized).toBe(1);
  });
});
