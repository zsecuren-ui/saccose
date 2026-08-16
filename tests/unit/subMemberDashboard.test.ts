import { describe, it, expect } from 'vitest';
import { Member } from '../../src/types';

describe('Member Sub-Members Tracking & Display Logic', () => {
  const currentMember: Member = {
    id: 'mb_parent_123',
    tenantId: 'tenant_mlimani',
    memberNumber: 'MB-2024-0001',
    fullName: 'Juma Hassan',
    phone: '+255712345678',
    email: 'juma@example.com',
    idType: 'NIDA',
    idNumber: '123456789',
    photoUrl: '',
    occupation: 'Mfanyabiashara',
    joinedDate: '2024-01-01',
    status: 'Active',
    totalSavings: 500000,
    totalShares: 200000,
    totalLoansOutstanding: 0,
    branch: 'Tawi la Juma',
    nextOfKin: { fullName: 'Kin', relationship: 'Ndugu', phone: '+255700', percentageShare: 100 }
  };

  const allMembers: Member[] = [
    currentMember,
    {
      ...currentMember,
      id: 'sub_1',
      memberNumber: 'MB-2024-0002',
      fullName: 'Sub Member #1',
      registeredById: 'mb_parent_123'
    },
    {
      ...currentMember,
      id: 'sub_2',
      memberNumber: 'MB-2024-0003',
      fullName: 'Sub Member #2',
      registeredById: 'mb_parent_123'
    },
    {
      ...currentMember,
      id: 'sub_other',
      memberNumber: 'MB-2024-0004',
      fullName: 'Other Person',
      branch: 'Tawi la Arusha',
      registeredById: 'mb_other_999'
    }
  ];

  it('should correctly isolate sub-members registered by the current member', () => {
    const mySubMembers = allMembers.filter(m =>
      m.tenantId === currentMember.tenantId && (
        m.registeredById === currentMember.id ||
        (m.branch && currentMember.fullName && m.branch.includes(currentMember.fullName.split(' ')[0]))
      ) && m.id !== currentMember.id
    );

    expect(mySubMembers).toHaveLength(2);
    expect(mySubMembers[0].id).toBe('sub_1');
    expect(mySubMembers[1].id).toBe('sub_2');
  });

  it('should allow filtering sub-members by search query', () => {
    const mySubMembers = allMembers.filter(m => m.registeredById === currentMember.id);
    const search = 'MB-2024-0003';

    const filtered = mySubMembers.filter(m =>
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberNumber.toLowerCase().includes(search.toLowerCase())
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].memberNumber).toBe('MB-2024-0003');
  });
});
