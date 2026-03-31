import { vi } from 'vitest';

// Mock next modules
vi.mock('next/dist/client/components/not-found.js', () => ({
  isNotFoundError: vi.fn(),
}));

vi.mock('next/dist/client/components/redirect.js', () => ({
  isRedirectError: vi.fn(),
}));
