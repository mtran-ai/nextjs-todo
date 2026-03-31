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
