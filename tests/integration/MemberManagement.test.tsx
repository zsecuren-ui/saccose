import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppProvider } from '../../src/context/AppContext';
import { MemberManagement } from '../../src/components/tenant/MemberManagement';

describe('MemberManagement Integration Test', () => {
  it('renders Member Management panel and allows opening member registration modal', () => {
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

    // Click add member button
    fireEvent.click(addBtn);

    // Verify modal options appear
    expect(screen.getByText(/Mwanachama Mmoja \(Single\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Sajili kwa Mkupuo/i)).toBeInTheDocument();
  });
});
