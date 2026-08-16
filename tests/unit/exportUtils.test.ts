import { describe, it, expect, vi } from 'vitest';
import { downloadCSV } from '../../src/lib/exportUtils';

describe('exportUtils - downloadCSV', () => {
  it('should generate and trigger download of CSV blob', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    headers: ['Jina', 'Namba ya Simu', 'Kiasi (TZS)'];
    rows: [
      ['Amina Hassan', '+255712345678', 500000],
      ['Juma Kapuya', '+255788990011', 1200000]
    ];

    downloadCSV('wanachama_test', ['Jina', 'Namba ya Simu', 'Kiasi'], [
      ['Amina Hassan', '+255712345678', 500000],
      ['Juma Kapuya', '+255788990011', 1200000]
    ]);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    clickSpy.mockRestore();
  });
});
