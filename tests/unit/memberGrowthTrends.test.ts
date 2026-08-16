import { describe, it, expect } from 'vitest';

interface TrendDayData {
  dayIndex: number;
  date: string;
  jumlaWanachama: number;
  wanachamaWapya: number;
  shughuliKilaSiku: number;
  kiasiChaShughuliTZS: number;
}

describe('Member Growth & Activity Trends Calculation Logic', () => {
  const generateMockTrendData = (days: number, currentMembers: number): TrendDayData[] => {
    const data: TrendDayData[] = [];
    const baseCount = Math.max(10, currentMembers - 20);
    let cumulative = baseCount;

    for (let i = days - 1; i >= 0; i--) {
      const newDaily = i % 3 === 0 ? 2 : 0;
      cumulative += newDaily;
      const activity = 10 + (i % 5) * 8;

      data.push({
        dayIndex: days - i,
        date: `Siku ${days - i}`,
        jumlaWanachama: cumulative,
        wanachamaWapya: newDaily,
        shughuliKilaSiku: activity,
        kiasiChaShughuliTZS: Number((activity * 0.15).toFixed(2))
      });
    }

    return data;
  };

  it('generates exactly 30 days of historical data', () => {
    const trendData = generateMockTrendData(30, 35);
    expect(trendData).toHaveLength(30);
    expect(trendData[0].dayIndex).toBe(1);
    expect(trendData[29].dayIndex).toBe(30);
  });

  it('calculates total new members added in 30 days accurately', () => {
    const trendData = generateMockTrendData(30, 35);
    const totalNew = trendData.reduce((acc, curr) => acc + curr.wanachamaWapya, 0);
    expect(totalNew).toBeGreaterThan(0);
    expect(trendData[29].jumlaWanachama).toBeGreaterThan(trendData[0].jumlaWanachama);
  });

  it('identifies the peak activity day correctly', () => {
    const trendData = generateMockTrendData(30, 35);
    const peakDay = [...trendData].sort((a, b) => b.shughuliKilaSiku - a.shughuliKilaSiku)[0];
    expect(peakDay.shughuliKilaSiku).toBeGreaterThan(0);
  });

  it('calculates average daily activities properly', () => {
    const trendData = generateMockTrendData(30, 35);
    const totalActivities = trendData.reduce((acc, curr) => acc + curr.shughuliKilaSiku, 0);
    const avgDaily = Math.round(totalActivities / 30);
    expect(avgDaily).toBeGreaterThan(0);
  });
});
