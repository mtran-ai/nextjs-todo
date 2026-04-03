import { vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';

// Create a mock Prisma client with all methods
export const mockPrismaClient = {
  task: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  comment: {
    create: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  },
  repo: {
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
} as unknown as PrismaClient;

// Mock the db module before tests import it
vi.mock('~/lib/db', () => ({
  db: mockPrismaClient,
}));
