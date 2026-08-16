import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.alert and scrollIntoView for test environments
if (typeof window !== 'undefined') {
  window.alert = vi.fn();
  window.scrollTo = vi.fn();
}
