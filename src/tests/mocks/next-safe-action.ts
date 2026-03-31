import { vi } from 'vitest';

// Mock next-safe-action module
vi.mock('next-safe-action', () => {
  return {
    createSafeActionClient: vi.fn(() => {
      return {
        action: vi.fn((schema, handler) => handler),
      };
    }),
  };
});
