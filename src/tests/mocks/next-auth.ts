import { vi } from 'vitest';
import { createMockSession } from '../fixtures';

// Mock next-auth module
vi.mock('next-auth', () => {
  const mockNextAuth = vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(async () => {
      return createMockSession();
    }),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }));

  return {
    default: mockNextAuth,
    auth: vi.fn(async () => {
      return createMockSession();
    }),
  };
});
