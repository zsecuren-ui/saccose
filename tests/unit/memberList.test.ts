import { describe, expect, it } from 'vitest';
import type { Member } from '../../src/types';
import { mergeRemoteMembersPreservingPending } from '../../src/lib/memberList';

const makeMember = (id: string, fullName: string): Member => ({
  id,
  tenantId: '09c38950-67d3-4669-bb75-ea9257253a50',
  memberNumber: `MB-${id}`,
  fullName,
  phone: '',
  email: '',
  idType: 'NIDA',
  idNumber: '',
  photoUrl: '',
  occupation: '',
  joinedDate: '2026-10-10',
  status: 'Active',
  totalSavings: 0,
  totalShares: 0,
  totalLoansOutstanding: 0,
  branch: 'Main Branch',
  nextOfKin: {
    fullName: '',
    relationship: '',
    phone: '',
    percentageShare: 100
  }
});

describe('mergeRemoteMembersPreservingPending', () => {
  it('does not lose a newly registered member when an older fetch completes afterward', () => {
    const newlySaved = makeMember('new-member', 'Mwanachama Mpya');
    const protectedIds = new Set([newlySaved.id]);

    const result = mergeRemoteMembersPreservingPending(
      [makeMember('existing-member', 'Mwanachama wa Zamani')],
      [newlySaved],
      protectedIds
    );

    expect(result.map(member => member.id)).toEqual(['new-member', 'existing-member']);
    expect(protectedIds.has(newlySaved.id)).toBe(true);
  });

  it('uses the database row when a fetch confirms it and keeps the session-created ID protected', () => {
    const protectedIds = new Set(['member-1']);
    const remoteMember = makeMember('member-1', 'Jina lililohifadhiwa');

    const result = mergeRemoteMembersPreservingPending(
      [remoteMember],
      [makeMember('member-1', 'Jina la muda')],
      protectedIds
    );

    expect(result).toEqual([remoteMember]);
    expect(protectedIds.has('member-1')).toBe(true);
  });
});
