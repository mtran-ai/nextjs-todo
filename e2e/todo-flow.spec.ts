import { test, expect } from './fixtures/auth';

test.describe('Todo creation flow', () => {
  test('create, complete, and delete a todo end-to-end', async ({
    page,
    testUser,
    authenticatedPage
  }) => {
    // Already signed in via authenticatedPage fixture; verify we landed on home
    await expect(page).toHaveURL(new RegExp(`/${testUser.username}$`));

    // Open the create-task dialog
    await page.click('[data-testid="create-task-button"]');

    // Fill title and description
    const title = 'Full flow task';
    const description = 'Created by the todo-flow e2e spec';
    await page.fill('input[id="title"]', title);
    await page.fill('textarea[id="description"]', description);

    // Pick a due date: open the calendar popover, navigate forward one month, click day 15
    await page.click('button[id="due"]');
    const calendar = page.locator('[role="grid"]');
    await calendar.waitFor({ state: 'visible' });
    await page.getByRole('button', { name: /next month/i }).click();
    await calendar.getByRole('gridcell', { name: '15', exact: true }).click();

    // The trigger button should no longer display the placeholder
    await expect(page.locator('button[id="due"]')).not.toHaveText('Pick a date');

    // Submit the form
    await page.click('button[type="submit"]');

    // Task appears in the list
    const taskItem = page.locator('li').filter({ hasText: title }).first();
    await expect(taskItem).toBeVisible({ timeout: 10000 });
    await expect(taskItem).toContainText(description);

    // Stats reflect the new task
    await expect(page.locator('[data-testid="stats-total"]')).toHaveText('1');
    await expect(page.locator('[data-testid="stats-pending"]')).toHaveText('1');
    await expect(page.locator('[data-testid="stats-completed"]')).toHaveText(
      '0'
    );

    // Mark the task as done by clicking the DoneCheckbox SVG
    await taskItem.locator('svg').first().click();

    // Wait for the server action + revalidation
    await page.waitForTimeout(2000);

    // Done state is reflected in the UI: dimmed list item + strikethrough title
    await expect(taskItem).toHaveClass(/opacity-60/);
    await expect(taskItem.locator('h4')).toHaveClass(/line-through/);

    // Stats reflect completion
    await expect(page.locator('[data-testid="stats-completed"]')).toHaveText(
      '1'
    );
    await expect(page.locator('[data-testid="stats-pending"]')).toHaveText('0');

    // Open the task menu and delete (no confirmation dialog)
    await taskItem.locator('button').last().click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    // Task disappears from the list
    await expect(page.locator('li').filter({ hasText: title })).toHaveCount(0, {
      timeout: 10000
    });

    // Empty-state placeholder returns
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });
});
