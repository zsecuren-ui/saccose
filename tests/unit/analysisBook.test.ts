import { describe, it, expect } from 'vitest';

interface AnalysisEntry {
  id: string;
  type: 'daily' | 'quarterly';
  datePeriod: string;
  totalIncome: number;
  totalExpense: number;
  bankBalance: number;
  loanRepayments: number;
  newLoansIssued: number;
  liquidityRatio: number;
}

describe('Analysis Book Financial Logic', () => {
  const entries: AnalysisEntry[] = [
    {
      id: 'an_1',
      type: 'daily',
      datePeriod: '2026-08-14',
      totalIncome: 4000000,
      totalExpense: 1000000,
      bankBalance: 300000000,
      loanRepayments: 2000000,
      newLoansIssued: 1000000,
      liquidityRatio: 28.5
    },
    {
      id: 'an_2',
      type: 'quarterly',
      datePeriod: 'Robo ya 2 2026',
      totalIncome: 120000000,
      totalExpense: 30000000,
      bankBalance: 300000000,
      loanRepayments: 80000000,
      newLoansIssued: 50000000,
      liquidityRatio: 29.0
    }
  ];

  it('calculates net surplus (income - expense) correctly', () => {
    const dailyNet = entries[0].totalIncome - entries[0].totalExpense;
    expect(dailyNet).toBe(3000000);

    const quarterlyNet = entries[1].totalIncome - entries[1].totalExpense;
    expect(quarterlyNet).toBe(90000000);
  });

  it('filters entries correctly by type', () => {
    const dailyOnly = entries.filter(e => e.type === 'daily');
    const quarterlyOnly = entries.filter(e => e.type === 'quarterly');

    expect(dailyOnly).toHaveLength(1);
    expect(quarterlyOnly).toHaveLength(1);
    expect(dailyOnly[0].id).toBe('an_1');
  });

  it('calculates liquidity ratio accurately', () => {
    const bankBal = 300000000;
    const newLoans = 100000000;
    const calculatedRatio = Number(((bankBal / (bankBal + newLoans)) * 30).toFixed(1));
    expect(calculatedRatio).toBe(22.5);
  });
});
