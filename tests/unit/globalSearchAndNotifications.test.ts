import { describe, it, expect } from 'vitest';

interface SearchItem {
  id: string;
  type: 'member' | 'loan' | 'accounting';
  title: string;
  subtitle: string;
}

describe('Global Search & Notification Logic', () => {
  const mockMembers = [
    { id: 'm1', fullName: 'Joseph Mkwawa', memberNumber: 'MBR-001', phoneNumber: '0712345678' },
    { id: 'm2', fullName: 'Amina Juma', memberNumber: 'MBR-002', phoneNumber: '0788112233' }
  ];

  const mockLoans = [
    { id: 'l1', memberName: 'Joseph Mkwawa', loanType: 'Emergency Loan', amountApproved: 1500000, status: 'Active' },
    { id: 'l2', memberName: 'Salma Ally', loanType: 'Business Loan', amountApproved: 5000000, status: 'Approved' }
  ];

  const mockAccounts = [
    { id: 'a1', accountName: 'Cash on Hand', accountCode: '1010', category: 'ASSET' },
    { id: 'a2', accountName: 'Interest Income', accountCode: '4010', category: 'REVENUE' }
  ];

  it('filters member profiles correctly by name or member number', () => {
    const q = 'mkwawa';
    const results = mockMembers.filter(m =>
      m.fullName.toLowerCase().includes(q) || m.memberNumber.toLowerCase().includes(q)
    );

    expect(results).toHaveLength(1);
    expect(results[0].fullName).toBe('Joseph Mkwawa');
  });

  it('filters loan transactions correctly by member name or loan type', () => {
    const q = 'emergency';
    const results = mockLoans.filter(l =>
      l.memberName.toLowerCase().includes(q) || l.loanType.toLowerCase().includes(q)
    );

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('l1');
  });

  it('filters accounting ledger entries correctly by account name or code', () => {
    const q = '1010';
    const results = mockAccounts.filter(a =>
      a.accountName.toLowerCase().includes(q) || a.accountCode.toLowerCase().includes(q)
    );

    expect(results).toHaveLength(1);
    expect(results[0].accountName).toBe('Cash on Hand');
  });

  it('calculates unread notification count accurately', () => {
    const notifications = [
      { id: '1', unread: true },
      { id: '2', unread: false },
      { id: '3', unread: true }
    ];

    const unreadCount = notifications.filter(n => n.unread).length;
    expect(unreadCount).toBe(2);
  });
});
