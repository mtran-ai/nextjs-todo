import { test, expect } from './fixtures/auth';

test.describe('Core User Flows', () => {
  test('Sign up and view home page', async ({ page, testUser, authenticatedPage }) => {
    // Already logged in via authenticatedPage fixture
    // Verify we're on the home page
    await expect(page).toHaveURL(new RegExp(`/${testUser.username}$`));

    // Verify the page shows the create task button
    const createButton = page.locator('[data-testid="create-task-button"]');
    await expect(createButton).toBeVisible();
  });

  test('Create a new task', async ({ page, testUser, authenticatedPage }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Click create task button
    await page.click('[data-testid="create-task-button"]');

    // Fill in task form
    await page.fill('input[id="title"]', 'Test task from e2e');
    await page.fill('textarea[id="description"]', 'This is a test task');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for dialog to close and task to appear in list
    const taskTitle = page.locator('text=Test task from e2e');
    await expect(taskTitle).toBeVisible({ timeout: 10000 });
  });

  test('Toggle task done status', async ({ page, testUser, authenticatedPage }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Create a task first
    await page.click('[data-testid="create-task-button"]');
    await page.fill('input[id="title"]', 'Task to complete');
    await page.click('button[type="submit"]');

    // Wait for task to appear
    await expect(page.locator('text=Task to complete')).toBeVisible({ timeout: 10000 });

    // Find the task list item and click the done icon (DoneCheckbox renders an SVG, not a checkbox)
    const taskItem = page.locator('li').filter({ hasText: 'Task to complete' }).first();
    await taskItem.locator('svg').first().click();

    // Wait for the server action to complete
    await page.waitForTimeout(1000);

    // Verify the task is still visible (no crash/error)
    await expect(taskItem).toBeVisible();
  });

  test('Edit an existing task', async ({ page, testUser, authenticatedPage }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Create a task first
    await page.click('[data-testid="create-task-button"]');
    await page.fill('input[id="title"]', 'Original title');
    await page.fill('textarea[id="description"]', 'Original description');
    await page.click('button[type="submit"]');

    // Wait for task to appear
    await expect(page.locator('text=Original title')).toBeVisible({ timeout: 10000 });

    // Find the task item and open the TaskMenu (the only button in the list item)
    const taskItem = page.locator('li').filter({ hasText: 'Original title' }).first();
    await taskItem.locator('button').last().click();

    // Click "Edit" option
    await page.click('text=Edit');

    // Update the title
    const titleInput = page.locator('input[id="title"]');
    await titleInput.fill('Updated title');

    // Save changes
    await page.click('button[type="submit"]');

    // Verify the task was updated
    await expect(page.locator('text=Updated title')).toBeVisible({ timeout: 10000 });
  });

  test('Delete a task', async ({ page, testUser, authenticatedPage }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Create a task first
    await page.click('[data-testid="create-task-button"]');
    await page.fill('input[id="title"]', 'Task to delete');
    await page.click('button[type="submit"]');

    // Wait for task to appear
    await expect(page.locator('text=Task to delete')).toBeVisible({ timeout: 10000 });

    // Find the task item and open the TaskMenu
    const taskItem = page.locator('li').filter({ hasText: 'Task to delete' }).first();
    await taskItem.locator('button').last().click();

    // Click "Delete" option in the dropdown menu — no confirmation dialog, deletion is immediate
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    // Wait for the task to disappear
    await expect(page.locator('text=Task to delete')).not.toBeVisible({ timeout: 10000 });
  });

  test('View task details and add a comment', async ({ page, testUser, authenticatedPage }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Create a task first
    await page.click('[data-testid="create-task-button"]');
    await page.fill('input[id="title"]', 'Task with comments');
    await page.click('button[type="submit"]');

    // Wait for task to appear
    await expect(page.locator('text=Task with comments')).toBeVisible({ timeout: 10000 });

    // Click on the task link to view details
    const taskItem = page.locator('li').filter({ hasText: 'Task with comments' }).first();
    await taskItem.locator('a').click();

    // Wait for the task detail page to load
    await page.waitForURL(new RegExp(`/${testUser.username}/[a-z0-9]+$`), { timeout: 10000 });

    // Open the comments section (collapsed by default)
    await page.click('button:has-text("Comments")');

    // Fill the comment input (it's a text input, not a textarea)
    const commentInput = page.locator('input[placeholder="Your comment..."]');
    await commentInput.fill('This is a test comment');

    // Submit the comment using Ctrl+Enter keyboard shortcut
    await commentInput.press('Control+Enter');

    // Verify the comment appears
    await expect(page.locator('text=This is a test comment')).toBeVisible({ timeout: 10000 });
  });

  test('Sign out', async ({ page, testUser, authenticatedPage }) => {
    // Navigate to home page
    await page.goto(`/${testUser.username}`);

    // Sign out button is directly in the header (no dropdown menu)
    await page.click('button:has-text("Sign out")');

    // Verify we're redirected to sign-in page
    await expect(page).toHaveURL('/sign-in', { timeout: 10000 });
  });
});

test.describe('Sign in flow', () => {
  test('Sign in with existing credentials', async ({ page, testUser, authenticatedPage }) => {
    // User was already created via authenticatedPage fixture
    // Sign out first
    await page.goto(`/${testUser.username}`);
    await page.click('button:has-text("Sign out")');
    await expect(page).toHaveURL('/sign-in', { timeout: 10000 });

    // Now sign in again
    await page.goto('/sign-in');
    await page.fill('input#username', testUser.username);
    await page.fill('input#password', testUser.password);
    await page.click('button:has-text("Sign in")');

    // Verify we're back on the home page
    await expect(page).toHaveURL(new RegExp(`/${testUser.username}$`), { timeout: 10000 });
  });
});
