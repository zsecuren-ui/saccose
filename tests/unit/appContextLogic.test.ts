import { describe, it, expect } from 'vitest';

describe('SACCOS Business Rules & Member Batch Allocation', () => {
  it('should calculate member numbers sequentially for batch creation (1 to 50)', () => {
    const existingCount = 10;
    const batchCount = 50;
    const prefix = 'Mwanachama Mpya';
    const branch = 'Zanzibar Stone Town';

    const generatedMembers = Array.from({ length: batchCount }, (_, index) => {
      const num = existingCount + index + 1;
      const formattedNum = String(num).padStart(4, '0');
      return {
        memberNumber: `MEM-${formattedNum}`,
        fullName: `${prefix} #${index + 1}`,
        branch,
        status: 'Active' as const
      };
    });

    expect(generatedMembers).toHaveLength(50);
    expect(generatedMembers[0].memberNumber).toBe('MEM-0011');
    expect(generatedMembers[49].memberNumber).toBe('MEM-0060');
    expect(generatedMembers[0].fullName).toBe('Mwanachama Mpya #1');
    expect(generatedMembers[49].fullName).toBe('Mwanachama Mpya #50');
  });

  it('should calculate loan installments correctly', () => {
    const principal = 1000000;
    const durationMonths = 12;
    const interestRatePerMonth = 0.015; // 1.5% monthly

    const totalInterest = principal * interestRatePerMonth * durationMonths;
    const totalRepayable = principal + totalInterest;
    const monthlyInstallment = Math.round(totalRepayable / durationMonths);

    expect(totalInterest).toBe(180000);
    expect(totalRepayable).toBe(1180000);
    expect(monthlyInstallment).toBe(98333);
  });
});
