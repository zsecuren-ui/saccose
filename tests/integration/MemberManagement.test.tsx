import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { AppProvider } from '../../src/context/AppContext';
import { MemberManagement } from '../../src/components/tenant/MemberManagement';

describe('MemberManagement Integration Test', () => {
  it('renders Member Management panel and allows opening member registration modal', async () => {
    render(
      <AppProvider>
        <MemberManagement />
      </AppProvider>
    );

    // Verify main header and buttons render
    expect(screen.getByText(/Wanachama wote/i)).toBeInTheDocument();
    
    // Find add member button
    const addBtn = screen.getByText(/Sajili Mwanachama/i);
    expect(addBtn).toBeInTheDocument();

    // Click add member button (wrap in act for state updates)
    await act(async () => {
      fireEvent.click(addBtn);
    });

    // Verify modal options appear
    expect(screen.getByText(/Mwanachama Mmoja \(Single\)/i)).toBeInTheDocument();
    // Multiple elements contain the same label; assert the first occurrence
    const bulkBtns = screen.getAllByText(/Sajili kwa Mkupuo/i);
    expect(bulkBtns.length).toBeGreaterThan(0);
    expect(bulkBtns[0]).toBeInTheDocument();
  });
});
