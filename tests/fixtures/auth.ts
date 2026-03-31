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
    await page.fill('input#username', testUser.username);
    await page.fill('input#password', testUser.password);
    await page.fill('input#confirm-password', testUser.password);
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
