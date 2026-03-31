import { vi } from 'vitest';
import { createMockSession } from '../fixtures';

// Create a controllable session state
export let mockSessionState: any = createMockSession();

// Mock the ~/lib/auth module
vi.mock('~/lib/auth', () => {
  return {
    auth: vi.fn(async () => mockSessionState),
  };
});

// Helper functions to control the mock
export const setMockSession = (session: any) => {
  mockSessionState = session;
};

export const setMockSessionUserId = (userId: string) => {
  mockSessionState = createMockSession(userId);
};

export const setMockSessionNull = () => {
  mockSessionState = null;
};

export const resetMockSession = () => {
  mockSessionState = createMockSession();
};
