import { vi } from 'vitest';
import { createMockSession } from '../fixtures';

// Mock next-auth module
vi.mock('next-auth', () => {
  return {
    auth: vi.fn(async () => {
      return createMockSession();
    }),
  };
});

export const mockAuth = vi.hoisted(() => ({
  auth: vi.fn(async () => {
    return createMockSession();
  }),
}));
