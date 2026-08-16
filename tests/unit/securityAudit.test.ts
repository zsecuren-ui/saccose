import { describe, it, expect } from 'vitest';
import { sanitizeInput, containsInjectionPattern, evaluatePasswordStrength } from '../../src/lib/security';

describe('Automated Cyber Attack & Penetration Test Suite (OWASP Top 10)', () => {
  it('A01: Broken Access Control - Input parameter sanitization prevents path traversal', () => {
    const maliciousPath = '../../etc/passwd';
    const sanitized = sanitizeInput(maliciousPath);
    expect(sanitized).not.toContain('..');
  });

  it('A03: Injection Attacks - Detects SQL and Command Injection attempts', () => {
    const injections = [
      "1' OR '1'='1",
      "'; DROP TABLE members; --",
      "admin'--",
      "exec xp_cmdshell('dir')"
    ];

    injections.forEach(payload => {
      expect(containsInjectionPattern(payload)).toBe(true);
    });
  });

  it('A03: Cross-Site Scripting (XSS) - Neutralizes HTML script tags and onload handlers', () => {
    const xssPayloads = [
      '<img src=x onerror=alert(1)>',
      '<svg/onload=alert(document.cookie)>',
      'javascript:alert("hacked")'
    ];

    xssPayloads.forEach(payload => {
      const cleaned = sanitizeInput(payload);
      expect(cleaned).not.toContain('<img');
      expect(cleaned).not.toContain('javascript:');
    });
  });

  it('A07: Identification and Authentication Failures - Enforces strong password rules', () => {
    const weakPass = 'password';
    const strongPass = 'SacCo$2026!Secure';

    expect(evaluatePasswordStrength(weakPass).score).toBeLessThan(50);
    expect(evaluatePasswordStrength(strongPass).score).toBeGreaterThanOrEqual(75);
  });
});
