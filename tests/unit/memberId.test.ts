import { describe, expect, it } from 'vitest';
import { createMemberId } from '../../src/lib/memberId';
import { isUuid } from '../../src/lib/uuid';

describe('member identifiers', () => {
  it('creates a UUID accepted by the members table', () => {
    const id = createMemberId();

    expect(isUuid(id)).toBe(true);
  });
});
