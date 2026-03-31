# Unit Tests

This directory contains unit tests for the Next.js todo application using Vitest.

## Running Tests

From the `src/` directory:

```bash
# Run tests in watch mode
npm test

# Run tests with UI dashboard
npm run test:ui

# Run tests once (CI mode)
npm run test:run
```

## Test Structure

- `setup.ts` — Global test setup, mock initialization, and utilities
- `fixtures.ts` — Mock data factories for creating test data
- `mocks/` — Module mocks for Prisma, next-auth, and Next.js
- `app/` — Tests for server actions and application logic
- `utils.test.ts` — Tests for fixture utilities

## Writing New Tests

1. Import fixtures from `fixtures.ts` to create mock data
2. Use `mockPrismaClient` to set up return values for database operations
3. Follow Arrange-Act-Assert pattern
4. Reset mocks in `beforeEach` hook

Example:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockTask } from '../fixtures';
import { mockPrismaClient } from '../mocks/prisma';

describe('Task Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch a task', async () => {
    // Arrange
    const mockTask = createMockTask({ id: 'task-1' });
    (mockPrismaClient.task.findUnique as any).mockResolvedValue(mockTask);

    // Act
    const result = await fetchTask('task-1');

    // Assert
    expect(result).toEqual(mockTask);
    expect(mockPrismaClient.task.findUnique).toHaveBeenCalledWith({
      where: { id: 'task-1' },
    });
  });
});
```

## Configuration

- **Environment:** happy-dom (lightweight DOM implementation)
- **Config file:** `vitest.config.ts` (in src/ directory)
- **Globals enabled:** describe, it, expect, beforeEach, afterEach, vi
- **Path alias:** `~` resolves to `src/`
- **TypeScript:** Configured in `tsconfig.json`

## Test Coverage

Current test coverage includes:

- **Fixtures:** Mock data factories for User, Task, Comment, and Session models
- **Unit Tests:** Fixture utility functions

### Planned Areas (Infrastructure Ready)

- Server actions: toogle, deleteTask, createComment, linkRepo
- Happy path tests for successful operations
- Error handling for authentication and database failures
- Edge cases and validation

## Mocks

The test suite uses the following mocks:

- **Prisma Client** (`mocks/prisma.ts`) — Database operations mocked with vi.fn()
- **next-auth** (`mocks/next-auth.ts`) — Authentication and session handling
- **next-safe-action** (`mocks/next-safe-action.ts`) — Server action wrapper
- **Next.js** (`mocks/next.ts`) — Next.js specific modules

## Adding New Tests

1. Create a new test file with `.test.ts` or `.test.tsx` extension
2. Import test utilities: `import { describe, it, expect, beforeEach } from 'vitest'`
3. Use fixtures to create mock data
4. Mock external dependencies as needed
5. Run `npm run test:run` to verify

## Troubleshooting

- **Module not found errors:** Check that imports use the `~` alias correctly (e.g., `import { db } from '~/lib/db'`)
- **Mock setup issues:** Ensure mocks are imported in `setup.ts` before tests run
- **Type errors:** Verify TypeScript paths are configured in `tsconfig.json`

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library Documentation](https://testing-library.com)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
