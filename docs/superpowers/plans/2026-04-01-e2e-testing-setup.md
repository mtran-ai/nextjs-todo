# E2E Testing Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Playwright e2e tests for core user flows (sign-up, sign-in, creating/editing/completing tasks, adding comments) with a clean test database seeding strategy.

**Architecture:**
- Install Playwright and configure it for Next.js with a test database
- Create test fixtures for authentication and common database operations
- Build e2e tests for core workflows: sign-up → sign-in → create task → toggle task done → edit task → delete task → add comment
- Use a seeded test database that resets between test suites; include helper utilities to seed users and tasks

**Tech Stack:** Playwright, Next.js 14, PostgreSQL (test database), Prisma (seeding)

---

## File Structure

**New files to create:**
- `playwright.config.ts` — Playwright configuration (base URL, database setup, test timeout)
- `tests/fixtures/auth.ts` — Authentication fixtures (sign up, sign in, logged-in user)
- `tests/fixtures/db.ts` — Database fixtures and seeding utilities
- `tests/core-flows.spec.ts` — E2e tests for all core user flows
- `tests/utils/test-db.ts` — Test database utilities (connection, reset)
- `.env.test` — Test environment variables
- `tests/global.setup.ts` — Global setup hook to initialize test database

**Modified files:**
- `src/package.json` — Add Playwright scripts

---

### Task 1: Install Playwright and Initialize Config

**Files:**
- Create: `playwright.config.ts`
- Modify: `src/package.json`

- [ ] **Step 1: Add Playwright to package.json (dev dependencies)**

In `src/package.json`, add these packages to `devDependencies`:
```json
"@playwright/test": "^1.48.0",
"ts-node": "^10.9.2"
```

- [ ] **Step 2: Run npm install**

```bash
npm install
```

Expected: All packages install successfully.

- [ ] **Step 3: Create playwright.config.ts in the root (not src/)**

Create `/home/mtran/projects/devinition/training/nextjs-todo/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    cwd: './src'
  },
  globalSetup: require.resolve('./tests/global.setup.ts'),
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
```

- [ ] **Step 4: Add Playwright scripts to src/package.json**

In the `scripts` section, add:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:debug": "playwright test --debug"
```

- [ ] **Step 5: Commit**

```bash
cd src
git add package.json ../playwright.config.ts
git commit -m "setup: add Playwright e2e testing framework"
cd ..
```

---

### Task 2: Create Test Database Utilities

**Files:**
- Create: `tests/utils/test-db.ts`
- Create: `.env.test`

- [ ] **Step 1: Create .env.test in the src/ directory**

In `src/.env.test`, add:
```
DATABASE_URL="postgresql://test_user:test_password@localhost:5432/test_todo_db"
DIRECT_DATABASE_URL="postgresql://test_user:test_password@localhost:5432/test_todo_db"
NEXTAUTH_SECRET="test-secret-key-only-for-testing"
NEXTAUTH_URL="http://localhost:3000"
```

Note: Replace `test_user`, `test_password`, and `localhost` with your actual test database credentials if different.

- [ ] **Step 2: Create tests/utils/test-db.ts**

Create `/home/mtran/projects/devinition/training/nextjs-todo/tests/utils/test-db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export async function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }
  return prisma;
}

export async function resetDatabase() {
  const prisma = await getPrismaClient();

  // Delete in order of dependencies
  await prisma.comment.deleteMany({});
  await prisma.repo.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
}

export async function closeDatabase() {
  if (prisma) {
    await prisma.$disconnect();
  }
}

export async function seedTestUser(data: {
  username: string;
  password: string;
}) {
  const prisma = await getPrismaClient();
  const bcrypt = await import('bcrypt');

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword
    }
  });
}

export async function seedTestTask(data: {
  authorId: string;
  title: string;
  description?: string;
  due?: Date;
  done?: boolean;
}) {
  const prisma = await getPrismaClient();

  return prisma.task.create({
    data: {
      authorId: data.authorId,
      title: data.title,
      description: data.description,
      due: data.due,
      done: data.done ?? false
    }
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/.env.test tests/utils/test-db.ts
git commit -m "setup: add test database utilities and configuration"
```

---

### Task 3: Create Global Test Setup

**Files:**
- Create: `tests/global.setup.ts`

- [ ] **Step 1: Create tests/global.setup.ts**

Create `/home/mtran/projects/devinition/training/nextjs-todo/tests/global.setup.ts`:

```typescript
import { resetDatabase, closeDatabase } from './utils/test-db';

async function globalSetup() {
  // Set test environment variables
  process.env.DATABASE_URL = process.env.DATABASE_URL ||
    'postgresql://test_user:test_password@localhost:5432/test_todo_db';
  process.env.DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL ||
    'postgresql://test_user:test_password@localhost:5432/test_todo_db';
  process.env.NEXTAUTH_SECRET = 'test-secret-key-only-for-testing';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';

  console.log('🔄 Resetting test database...');
  try {
    await resetDatabase();
    console.log('✅ Test database reset complete');
  } catch (error) {
    console.error('❌ Failed to reset test database:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

export default globalSetup;
```

- [ ] **Step 2: Commit**

```bash
git add tests/global.setup.ts
git commit -m "setup: add global test database reset on startup"
```

---

### Task 4: Create Authentication Fixtures

**Files:**
- Create: `tests/fixtures/auth.ts`

- [ ] **Step 1: Create tests/fixtures/auth.ts**

Create `/home/mtran/projects/devinition/training/nextjs-todo/tests/fixtures/auth.ts`:

```typescript
import { test as base, expect } from '@playwright/test';
import { seedTestUser, getPrismaClient } from '../utils/test-db';

type AuthFixtures = {
  authenticatedPage: void;
  testUser: { username: string; password: string; id?: string };
};

export const test = base.extend<AuthFixtures>({
  testUser: {
    username: `testuser_${Date.now()}`,
    password: 'TestPassword123!'
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    // Sign up the test user
    await page.goto('/sign-up');
    await page.fill('input[type="text"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to home page
    await page.waitForURL(/\/[^/]+$/);

    // Verify we're logged in
    const url = page.url();
    expect(url).toContain(testUser.username);

    // Save the user ID from the database for later use
    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { username: testUser.username }
    });
    if (user) {
      testUser.id = user.id;
    }

    await use();
  }
});

export { expect };
```

- [ ] **Step 2: Commit**

```bash
git add tests/fixtures/auth.ts
git commit -m "setup: create authentication test fixtures"
```

---

### Task 5: Create Database Fixtures

**Files:**
- Create: `tests/fixtures/db.ts`

- [ ] **Step 1: Create tests/fixtures/db.ts**

Create `/home/mtran/projects/devinition/training/nextjs-todo/tests/fixtures/db.ts`:

```typescript
import { test as base } from '@playwright/test';
import { seedTestUser, seedTestTask, getPrismaClient } from '../utils/test-db';

type DbFixtures = {
  userWithTasks: {
    username: string;
    password: string;
    id: string;
    taskIds: string[];
  };
};

export const test = base.extend<DbFixtures>({
  userWithTasks: async ({}, use) => {
    const prisma = await getPrismaClient();
    const username = `dbuser_${Date.now()}`;
    const password = 'TestPassword123!';

    // Create user
    const user = await seedTestUser({ username, password });

    // Create sample tasks
    const task1 = await seedTestTask({
      authorId: user.id,
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      done: false
    });

    const task2 = await seedTestTask({
      authorId: user.id,
      title: 'Complete project',
      description: 'Finish the e2e tests',
      done: false
    });

    const userWithTasks = {
      username,
      password,
      id: user.id,
      taskIds: [task1.id, task2.id]
    };

    await use(userWithTasks);
  }
});

export { expect } from '@playwright/test';
```

- [ ] **Step 2: Commit**

```bash
git add tests/fixtures/db.ts
git commit -m "setup: create database test fixtures"
```

---

### Task 6: Write Core User Flow Tests

**Files:**
- Create: `tests/core-flows.spec.ts`

- [ ] **Step 1: Create tests/core-flows.spec.ts**

Create `/home/mtran/projects/devinition/training/nextjs-todo/tests/core-flows.spec.ts`:

```typescript
import { test, expect } from './fixtures/auth';

test.describe('Core User Flows', () => {
  test('Sign up and view home page', async ({ page, testUser }) => {
    // Already logged in via authenticatedPage fixture
    // Verify we're on the home page
    const url = page.url();
    expect(url).toContain(testUser.username);

    // Verify the page shows the create task button
    const createButton = page.locator('button:has-text("✓")').first();
    await expect(createButton).toBeVisible();
  });

  test('Create a new task', async ({ page, testUser }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Click create task button
    await page.click('button[type="button"]:has-text("+")');

    // Fill in task form
    await page.fill('input[id="title"]', 'Test task from e2e');
    await page.fill('textarea[id="description"]', 'This is a test task');

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for success and modal to close
    await page.waitForURL(`/${testUser.username}`);

    // Verify task appears in list
    const taskTitle = page.locator('text=Test task from e2e');
    await expect(taskTitle).toBeVisible();
  });

  test('Toggle task done status', async ({ page, testUser }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Create a task first
    await page.click('button:has-text("+")');
    await page.fill('input[id="title"]', 'Task to complete');
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for page to update
    await page.waitForTimeout(1000);

    // Find the task and its checkbox
    const taskRow = page.locator('text=Task to complete').first();
    const checkbox = taskRow.locator('input[type="checkbox"]').first();

    // Toggle the checkbox
    await checkbox.click();

    // Verify it's marked as done (usually adds a strikethrough class)
    await expect(taskRow).toHaveClass(/done|completed/);
  });

  test('Edit an existing task', async ({ page, testUser }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Create a task first
    await page.click('button:has-text("+")');
    await page.fill('input[id="title"]', 'Original title');
    await page.fill('textarea[id="description"]', 'Original description');
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for page to update
    await page.waitForTimeout(1000);

    // Find the task and open the menu (3-dot menu)
    const taskRow = page.locator('text=Original title').first();
    const menuButton = taskRow.locator('button').filter({ has: page.locator('[role="img"]') }).first();

    // Click the menu button
    await menuButton.click();

    // Click "Edit" option
    await page.click('text=Edit');

    // Update the title
    const titleInput = page.locator('input[id="title"]');
    await titleInput.fill('Updated title');

    // Save changes
    await page.click('button[type="submit"]:has-text("Save")');

    // Wait for page to update
    await page.waitForTimeout(1000);

    // Verify the task was updated
    const updatedTask = page.locator('text=Updated title');
    await expect(updatedTask).toBeVisible();
  });

  test('Delete a task', async ({ page, testUser }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Create a task first
    await page.click('button:has-text("+")');
    await page.fill('input[id="title"]', 'Task to delete');
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for page to update
    await page.waitForTimeout(1000);

    // Find the task and open the menu
    const taskRow = page.locator('text=Task to delete').first();
    const menuButton = taskRow.locator('button').filter({ has: page.locator('[role="img"]') }).first();

    // Click the menu button
    await menuButton.click();

    // Click "Delete" option
    await page.click('text=Delete');

    // Confirm deletion if there's a confirmation dialog
    await page.click('button:has-text("Delete")');

    // Wait for the task to disappear
    const taskElement = page.locator('text=Task to delete');
    await expect(taskElement).not.toBeVisible();
  });

  test('View task details and add a comment', async ({ page, testUser }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Create a task first
    await page.click('button:has-text("+")');
    await page.fill('input[id="title"]', 'Task with comments');
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for page to update
    await page.waitForTimeout(1000);

    // Click on the task to view details
    const taskLink = page.locator('text=Task with comments').first();
    await taskLink.click();

    // Wait for the task detail page to load
    await page.waitForURL(new RegExp(`/${testUser.username}/[a-z0-9]+$`));

    // Add a comment
    const commentInput = page.locator('textarea').last(); // Assuming the last textarea is for comments
    await commentInput.fill('This is a test comment');

    // Submit the comment
    await page.click('button:has-text("Add")');

    // Verify the comment appears
    const comment = page.locator('text=This is a test comment');
    await expect(comment).toBeVisible();
  });

  test('Sign out', async ({ page, testUser }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Find and click the sign out button (usually in header/menu)
    const menuButton = page.locator('button[aria-label="Menu"]').first();
    await menuButton.click();

    // Click sign out
    await page.click('text=Sign out');

    // Verify we're redirected to sign-in page
    await page.waitForURL('/sign-in');
    const url = page.url();
    expect(url).toContain('sign-in');
  });
});

test.describe('Sign in flow', () => {
  test('Sign in with existing credentials', async ({ page, testUser, authenticatedPage }) => {
    // User was already created via authenticatedPage fixture
    // Sign out first
    await page.goto(`/${testUser.username}`);
    const menuButton = page.locator('button[aria-label="Menu"]').first();
    await menuButton.click();
    await page.click('text=Sign out');

    // Now sign in again
    await page.goto('/sign-in');
    await page.fill('input[type="text"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Verify we're back on the home page
    await page.waitForURL(new RegExp(`/${testUser.username}$`));
    const url = page.url();
    expect(url).toContain(testUser.username);
  });
});
```

- [ ] **Step 2: Run the tests to verify they work**

```bash
npm run test:e2e
```

Expected: Some tests may fail due to selector issues or timing. This is normal — we'll refine in the next step.

- [ ] **Step 3: Fix selector issues**

If tests fail due to missing selectors:
- Use `npm run test:e2e:ui` to interactively debug
- Update selectors in the test file to match actual HTML elements
- Common fixes:
  - Replace generic `button:has-text()` with more specific selectors
  - Use `data-testid` attributes if available
  - Check browser console for element inspection

- [ ] **Step 4: Commit**

```bash
git add tests/core-flows.spec.ts
git commit -m "test: add e2e tests for core user flows (sign-up, create/edit/delete tasks, comments)"
```

---

### Task 7: Add Helper Scripts and Documentation

**Files:**
- Create: `tests/README.md`
- Modify: `src/package.json`

- [ ] **Step 1: Create tests/README.md**

Create `/home/mtran/projects/devinition/training/nextjs-todo/tests/README.md`:

```markdown
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
```

- [ ] **Step 2: Update src/package.json with test database commands**

In `src/package.json`, add this script:
```json
"test:e2e:setup": "dotenvx run --env-file=.env.test -- prisma db push"
```

- [ ] **Step 3: Commit**

```bash
git add tests/README.md src/package.json
git commit -m "docs: add e2e testing guide and setup helper scripts"
```

---

## Summary

This plan sets up a complete e2e testing infrastructure with:
- Playwright configured for Next.js
- Test database utilities with seeding
- Authentication and database fixtures
- Comprehensive tests covering core user workflows
- Documentation and helper scripts

All tests run against an isolated test database that resets before each run.
