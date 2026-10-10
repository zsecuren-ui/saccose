import type { Member } from '../types';

export const mergeRemoteMembersPreservingPending = (
  remoteMembers: Member[],
  currentMembers: Member[],
  protectedMemberIds: Set<string>
): Member[] => {
  const remoteMemberIds = new Set(remoteMembers.map(member => member.id));
  const pendingMembers = currentMembers.filter(member =>
    protectedMemberIds.has(member.id) && !remoteMemberIds.has(member.id)
  );
  return [...pendingMembers, ...remoteMembers];
};
