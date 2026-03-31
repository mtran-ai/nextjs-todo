import { beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Import mocks in the correct order
import './mocks/next';
import './mocks/next-safe-action';
import './mocks/prisma';
import './mocks/next-auth';

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
