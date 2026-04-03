import { test, expect } from './fixtures/auth';

test.describe('Task list UI improvements', () => {
  test('does not show "no description" placeholder text', async ({
    page,
    testUser,
    authenticatedPage
  }) => {
    await page.goto(`/${testUser.username}`);
    await page.click('[data-testid="create-task-button"]');
    await page.fill('input[id="title"]', 'Task without description');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Task without description')).toBeVisible({
      timeout: 10000
    });

    await expect(page.locator('text=no description')).not.toBeVisible();
  });

  test('does not show "no due date" placeholder text', async ({
    page,
    testUser,
    authenticatedPage
  }) => {
    await page.goto(`/${testUser.username}`);
    await page.click('[data-testid="create-task-button"]');
    await page.fill('input[id="title"]', 'Task without due date');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Task without due date')).toBeVisible({
      timeout: 10000
    });

    await expect(page.locator('text=no due date')).not.toBeVisible();
  });

  test('does not show "no linked repo" placeholder text', async ({
    page,
    testUser,
    authenticatedPage
  }) => {
    await page.goto(`/${testUser.username}`);
    await page.click('[data-testid="create-task-button"]');
    await page.fill('input[id="title"]', 'Task without repo');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Task without repo')).toBeVisible({
      timeout: 10000
    });

    await expect(page.locator('text=no linked repo')).not.toBeVisible();
  });

  test('does not show "no comments" placeholder text', async ({
    page,
    testUser,
    authenticatedPage
  }) => {
    await page.goto(`/${testUser.username}`);
    await page.click('[data-testid="create-task-button"]');
    await page.fill('input[id="title"]', 'Task without comments');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Task without comments')).toBeVisible({
      timeout: 10000
    });

    await expect(page.locator('text=no comments')).not.toBeVisible();
  });

  test('shows empty state when no tasks exist', async ({
    page,
    testUser,
    authenticatedPage
  }) => {
    await page.goto(`/${testUser.username}`);
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toContainText(
      'No tasks yet'
    );
  });

  test('shows progress summary when tasks exist', async ({
    page,
    testUser,
    authenticatedPage
  }) => {
    await page.goto(`/${testUser.username}`);
    await page.click('[data-testid="create-task-button"]');
    await page.fill('input[id="title"]', 'Progress test task');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Progress test task')).toBeVisible({
      timeout: 10000
    });

    await expect(page.locator('[data-testid="task-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-progress"]')).toContainText(
      '0 of 1'
    );
  });

  test('done task has dimmed appearance and strikethrough title', async ({
    page,
    testUser,
    authenticatedPage
  }) => {
    await page.goto(`/${testUser.username}`);
    await page.click('[data-testid="create-task-button"]');
    await page.fill('input[id="title"]', 'Task to complete');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Task to complete')).toBeVisible({
      timeout: 10000
    });

    // Click the done checkbox SVG (DoneCheckbox renders an svg, not a button)
    const taskItem = page.locator('li').filter({ hasText: 'Task to complete' });
    await taskItem.locator('svg').first().click();
    // Wait for server action + revalidation to re-render the list item
    await page.waitForTimeout(2000);

    await expect(taskItem).toHaveClass(/opacity-60/);
    const title = taskItem.locator('h4');
    await expect(title).toHaveClass(/line-through/);
  });
});
