# E2E Tests

This directory contains Playwright e2e tests for the todo application.

## Setup

1. Ensure you have a test PostgreSQL database:
   ```bash
   createdb test_todo_db
   ```

2. Load test environment variables:
   ```bash
   cp src/.env.test src/.env.local
   ```

3. Initialize the test database schema:
   ```bash
   npm run db:push
   ```

## Running Tests

**Run all tests:**
```bash
npm run test:e2e
```

**Run tests with UI (interactive debug):**
```bash
npm run test:e2e:ui
```

**Debug a single test:**
```bash
npm run test:e2e:debug
```

**Run a specific test file:**
```bash
npx playwright test tests/core-flows.spec.ts
```

## Test Database

Tests use a dedicated `test_todo_db` PostgreSQL database. The database is **reset before each test run** via the `global.setup.ts` hook.

**Important:** Do NOT use the same database as your development environment. Configure test credentials in `src/.env.test`.

## Fixtures

### `authenticatedPage`
Automatically signs up a new test user and logs them in.

```typescript
test('example', async ({ page, testUser, authenticatedPage }) => {
  // User is already logged in
  // testUser.username and testUser.password contain credentials
});
```

### `userWithTasks`
Pre-creates a user with sample tasks in the database.

```typescript
test('example', async ({ page, userWithTasks }) => {
  // User exists in DB with taskIds
  // Log in separately if needed
});
```

## Debugging

- **Headed mode:** Run `npm run test:e2e:ui` to see browser interactions
- **Trace viewer:** Failing tests generate traces at `test-results/`
- **Screenshots:** Failing tests capture screenshots at `test-results/`

## CI/CD Integration

In CI, tests run serially with retries. Set `CI=true` to enable:
```bash
CI=true npm run test:e2e
```
