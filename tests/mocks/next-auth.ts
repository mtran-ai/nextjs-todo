import { vi } from 'vitest';
import { createMockSession } from '../fixtures';

// Create a controllable auth mock
let authSession: any = createMockSession();

export const mockAuthSession = (session: any) => {
  authSession = session;
};

export const resetAuthSession = () => {
  authSession = createMockSession();
};

// Mock next-auth module
vi.mock('next-auth', () => {
  const mockNextAuth = vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(async () => authSession),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }));

  return {
    default: mockNextAuth,
    auth: vi.fn(async () => authSession),
  };
});
