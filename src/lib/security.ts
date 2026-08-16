// Security and Cyber Attack Protection Utility Module
// Provides XSS sanitization, CSRF protection, Rate Limiting, PII Data Masking, and Security Audit Logging

// 1. XSS Input Sanitizer
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/\.\./g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '')
    .trim();
}

// 2. Prevent SQL / NoSQL Injection Patterns
export function containsInjectionPattern(input: string): boolean {
  if (!input) return false;
  const injectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))(\s*)((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /(exec(\s|\+)+(s|x)p\w+)/i,
    /UNION(\s|\+)+SELECT/i,
    /DROP(\s|\+)+TABLE/i,
    /{\s*"\$gt"\s*:\s*""\s*}/i, // NoSQL injection
    /{\s*"\$ne"\s*:\s*null\s*}/i
  ];

  return injectionPatterns.some(pattern => pattern.test(input));
}

// 3. CSRF Token Generator & Validator
const CSRF_STORAGE_KEY = 'saccos_csrf_token';

export function getOrCreateCsrfToken(): string {
  if (typeof window === 'undefined') return 'server_csrf_token';
  let token = localStorage.getItem(CSRF_STORAGE_KEY);
  if (!token) {
    token = 'csrf_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(CSRF_STORAGE_KEY, token);
  }
  return token;
}

export function validateCsrfToken(submittedToken: string): boolean {
  const currentToken = getOrCreateCsrfToken();
  return submittedToken === currentToken;
}

// 4. Rate Limiter for Client-side Actions & Login Attempts
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(actionKey: string, maxAttempts: number = 5, windowMs: number = 60000): { allowed: boolean; remainingMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(actionKey);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(actionKey, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remainingMs: 0 };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remainingMs: record.resetTime - now };
  }

  record.count += 1;
  return { allowed: true, remainingMs: 0 };
}

// 5. PII Masking (NIDA, Phone Numbers, Account Numbers)
export function maskNIDA(nida: string): string {
  if (!nida || nida.length < 8) return '****';
  return nida.substring(0, 4) + '******' + nida.substring(nida.length - 4);
}

export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 7) return '***';
  return phone.substring(0, 4) + '****' + phone.substring(phone.length - 3);
}

export function maskBankAccount(accountNo: string): string {
  if (!accountNo || accountNo.length < 6) return '****';
  return accountNo.substring(0, 3) + '******' + accountNo.substring(accountNo.length - 3);
}

// 6. Password / PIN Strength Checker
export interface PasswordStrength {
  score: number; // 0 to 100
  label: 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  reasons: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const reasons: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, label: 'Weak', reasons: ['Nenosiri halipaswi kuwa wazi.'] };
  }

  if (password.length >= 8) score += 25;
  else reasons.push('Ongeza urefu kuwa angalau herufi 8.');

  if (/[A-Z]/.test(password)) score += 25;
  else reasons.push('Ongeza herufi kubwa (A-Z).');

  if (/[0-9]/.test(password)) score += 25;
  else reasons.push('Ongeza namba (0-9).');

  if (/[^A-Za-z0-9]/.test(password)) score += 25;
  else reasons.push('Ongeza ishara maalum (@, #, $, %).');

  let label: PasswordStrength['label'] = 'Weak';
  if (score >= 100) label = 'Very Strong';
  else if (score >= 75) label = 'Strong';
  else if (score >= 50) label = 'Medium';

  return { score, label, reasons };
}

// 7. Security Audit Logger
export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: 'LOGIN' | 'FAILED_LOGIN' | 'BULK_MEMBER_ADD' | 'FINANCIAL_OVERRIDE' | 'RATE_LIMIT_TRIGGER' | 'INJECTION_BLOCKED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  user: string;
  ipAddress: string;
  details: string;
}

const securityAuditLogs: SecurityAuditLog[] = [
  {
    id: 'sec_001',
    timestamp: new Date().toISOString(),
    eventType: 'LOGIN',
    severity: 'LOW',
    user: 'SuperAdmin',
    ipAddress: '197.250.12.44',
    details: 'Ingizo la kawaida la mfumo limekamilika.'
  },
  {
    id: 'sec_002',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    eventType: 'RATE_LIMIT_TRIGGER',
    severity: 'MEDIUM',
    user: 'Unknown',
    ipAddress: '41.222.180.12',
    details: 'Jaribio la kuingia lilizuiwa baada ya majaribio 5 yasiyo sahihi.'
  }
];

export function logSecurityEvent(
  eventType: SecurityAuditLog['eventType'],
  severity: SecurityAuditLog['severity'],
  user: string,
  details: string
): SecurityAuditLog {
  const newLog: SecurityAuditLog = {
    id: `sec_${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType,
    severity,
    user,
    ipAddress: '127.0.0.1 (Cloud Protection)',
    details: sanitizeInput(details)
  };
  securityAuditLogs.unshift(newLog);
  return newLog;
}

export function getSecurityLogs(): SecurityAuditLog[] {
  return securityAuditLogs;
}
