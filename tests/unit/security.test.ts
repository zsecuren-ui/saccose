import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  containsInjectionPattern,
  checkRateLimit,
  maskNIDA,
  maskPhoneNumber,
  evaluatePasswordStrength,
  getOrCreateCsrfToken,
  validateCsrfToken
} from '../../src/lib/security';

describe('Security Utility Tests', () => {
  it('sanitizes malicious XSS HTML inputs', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  it('detects SQL and NoSQL injection attack patterns', () => {
    const sqlAttack = "SELECT * FROM users WHERE '1'='1'";
    const nosqlAttack = '{"$gt": ""}';
    const safeText = 'Juma Hassan Analysis Report';

    expect(containsInjectionPattern(sqlAttack)).toBe(true);
    expect(containsInjectionPattern(nosqlAttack)).toBe(true);
    expect(containsInjectionPattern(safeText)).toBe(false);
  });

  it('correctly rate limits repeated rapid attempts', () => {
    const key = 'user_login_test';
    // 3 attempts max
    expect(checkRateLimit(key, 3, 60000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60000).allowed).toBe(true);
    // 4th attempt should be blocked
    expect(checkRateLimit(key, 3, 60000).allowed).toBe(false);
  });

  it('masks sensitive PII data like NIDA and Phone Numbers', () => {
    const nida = '19900101123456789';
    const phone = '+255712345678';

    expect(maskNIDA(nida)).toBe('1990******6789');
    expect(maskPhoneNumber(phone)).toBe('+255****678');
  });

  it('evaluates password strength accurately', () => {
    const weakPass = '12345';
    const strongPass = 'Saccos2026@Pass!';

    expect(evaluatePasswordStrength(weakPass).label).toBe('Weak');
    expect(evaluatePasswordStrength(strongPass).label).toBe('Very Strong');
  });

  it('generates and validates CSRF tokens', () => {
    const token = getOrCreateCsrfToken();
    expect(token).toBeTruthy();
    expect(validateCsrfToken(token)).toBe(true);
    expect(validateCsrfToken('invalid_token')).toBe(false);
  });
});
