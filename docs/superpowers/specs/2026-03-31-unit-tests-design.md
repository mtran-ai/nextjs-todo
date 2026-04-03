# Unit Testing for Core Functionality — Design Specification

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

## Goal

Implement comprehensive unit tests for server actions and core business logic using Vitest and React Testing Library, providing confidence in task CRUD operations, comment management, and error handling.

## Architecture

Tests are organized in a separate `tests/` directory at the project root (sibling to `src/`), with a structure that mirrors the source code. Vitest is configured with a happy-dom environment to allow testing React components without a full browser. Server actions are tested in isolation with mocked Prisma and next-auth dependencies to avoid database calls and external auth during tests.

Test setup files provide reusable mocking utilities and data fixtures. Each server action function in `src/app/actions.ts` has dedicated test coverage organized into suites for happy paths, error cases, and edge cases. This keeps tests maintainable and allows developers to quickly understand expected behavior.

## Tech Stack

- **Vitest** (`^1.x`) — Test runner and assertion library, Jest-compatible syntax
- **React Testing Library** — Component interaction testing focused on user behavior
- **@vitest/ui** (optional) — Visual test dashboard for local development
- **happy-dom** — Lightweight DOM implementation for component tests

## File Structure

```
nextjs-todo/
├── src/
│   ├── app/
│   │   ├── actions.ts
│   │   ├── layout.tsx
│   │   └── ... (other app files)
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── auth.config.ts
│   │   ├── db.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── components/
│   │   └── ... (UI components)
│   ├── types/
│   │   └── ... (TypeScript types)
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── tests/
│   ├── vitest.config.ts       # Vitest configuration, path aliases, globals
│   ├── setup.ts               # Test setup: vitest.setup() hooks, utilities
│   ├── fixtures.ts            # Mock data factories (mockUser, mockTask, mockComment)
│   ├── mocks/
│   │   ├── prisma.ts          # vi.mock('@prisma/client')
│   │   └── next-auth.ts       # vi.mock('next-auth')
│   └── app/
│       └── actions.test.ts    # Server action tests (createTask, updateTask, deleteTask, etc.)
│
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-03-31-unit-tests-design.md (this file)
│
└── CLAUDE.md
```

## Testing Strategy

### Server Actions (`src/app/actions.ts`)

Each server action is tested with:

1. **Happy path tests** — Successful operation with valid inputs
   - createTask: Creates task with correct title, description, due date
   - updateTask: Modifies task fields, returns updated task
   - deleteTask: Removes task and cascading comments
   - addComment: Creates comment linked to task and user

2. **Error cases** — Validation failures, authorization failures
   - Invalid input (missing required fields, malformed data)
   - Unauthorized access (user trying to modify another user's task)
   - Not found errors (task doesn't exist)

3. **Edge cases** — Boundary conditions
   - Empty strings, very long inputs
   - Null/undefined values
   - Duplicate operations

### Mocking Strategy

- **Prisma:** Mock `@prisma/client` at the module level to avoid database calls. Each test provides specific return values for the operations being tested.
- **next-auth:** Mock `next-auth` to return test user sessions, allowing tests to verify permission checks.
- **All external dependencies:** Keep tests isolated from actual database, file system, or network calls.

### Test Structure

Each test file follows Arrange-Act-Assert:
```typescript
describe('Server Actions', () => {
  describe('createTask', () => {
    it('should create a task with valid input', () => {
      // Arrange: Set up mocks, input data
      // Act: Call the action
      // Assert: Verify return value, mock calls, side effects
    });
  });
});
```

## Configuration Files

### `tests/vitest.config.ts`

- Configure test environment as `happy-dom`
- Set up path aliases (`~/*` → `../src/*`)
- Enable globals (`describe`, `it`, `expect`, `beforeEach`, `afterEach`, `vi`)
- Set up test file patterns (`**/*.test.ts`, `**/*.test.tsx`)
- Configure coverage reporting (optional)

### `tests/setup.ts`

- Import all mock modules
- Define shared `beforeEach` / `afterEach` hooks
- Provide helper functions for common test operations (e.g., `createMockUser()`, `expectPrismaCall()`)

### `tests/fixtures.ts`

- Export factory functions: `createMockUser()`, `createMockTask()`, `createMockComment()`
- Each factory returns realistic test data with sensible defaults
- Factories accept optional overrides for customization

### `tests/mocks/prisma.ts`

Mock implementation of Prisma client with methods for:
- User operations (create, findUnique, findMany)
- Task operations (create, findUnique, findMany, update, delete)
- Comment operations (create, findMany, delete)
- Repo operations (create, findUnique, delete)

### `tests/mocks/next-auth.ts`

Mock implementation of next-auth providing:
- `auth()` function returning test session with user data
- Mock session structures matching the app's session type

## Success Criteria

1. ✅ Vitest configured and tests run locally (`npm test`)
2. ✅ At least 80% of server actions covered with passing tests
3. ✅ Tests run without accessing the actual database or making network calls
4. ✅ Test output is clear and failures are easy to diagnose
5. ✅ Test suite completes in under 5 seconds
6. ✅ Developers can run individual test files or specific tests with Vitest filters

## Scope Notes

- **In scope:** Server action tests, utility function tests, mock setup infrastructure
- **Out of scope:** Component rendering tests, end-to-end browser tests, authentication flow integration tests (those come later)
- **Future expansion:** After this foundation is solid, add component tests and integration tests

## Dependencies to Add

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "happy-dom": "^12.0.0",
    "vi": "^0.0.1"
  }
}
```

(Note: `vi` is imported from `vitest`, not installed separately)

