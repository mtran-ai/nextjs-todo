import { test as base, expect } from '@playwright/test';
import { seedTestUser, getPrismaClient } from '../utils/test-db';

type AuthFixtures = {
  authenticatedPage: void;
  testUser: { username: string; password: string; id?: string };
};

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    await use({
      username: `testuser_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      password: 'TestPassword123'
    });
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    // Sign up the test user
    await page.goto('/sign-up');

    // Wait for form to be visible
    await page.waitForSelector('input#username', { timeout: 1000 });

    await page.fill('input#username', testUser.username);
    await page.fill('input#password', testUser.password);
    await page.fill('input#confirm-password', testUser.password);

    // Click the sign up button (look for button with "Sign up" text)
    await page.click('button:has-text("Sign up")');

    // Wait for redirect to home page
    await page.waitForURL(new RegExp(`/${testUser.username}$`), { timeout: 10000 });

    // Verify we're logged in
    await expect(page).toHaveURL(new RegExp(`/${testUser.username}$`));

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
