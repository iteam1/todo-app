import { test, expect } from '@playwright/test';

test.describe('Complete Task', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Create a test task
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Test task');
    await input.press('Enter');
    await expect(page.getByText('Test task')).toBeVisible();
  });

  test('mark a task complete and verify visual change', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: /mark.*test task.*complete/i });
    await checkbox.click();

    await expect(checkbox).toBeChecked();
    // Completed task should have line-through styling
    const taskText = page.getByText('Test task');
    await expect(taskText).toHaveClass(/line-through/);
  });

  test('unmark a task and verify visual revert', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: /mark.*test task.*complete/i });
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Toggle back
    const incompleteCheckbox = page.getByRole('checkbox', { name: /mark.*test task.*incomplete/i });
    await incompleteCheckbox.click();
    await expect(page.getByRole('checkbox', { name: /mark.*test task.*complete/i })).not.toBeChecked();
    const taskText = page.getByText('Test task');
    await expect(taskText).not.toHaveClass(/line-through/);
  });

  test('completion state persists after page refresh', async ({ page }) => {
    // Complete the task
    const checkbox = page.getByRole('checkbox', { name: /mark.*test task.*complete/i });
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Reload and verify state persists
    await page.reload();
    await expect(
      page.getByRole('checkbox', { name: /mark.*test task.*incomplete/i }),
    ).toBeChecked();
    await expect(page.getByText('Test task')).toHaveClass(/line-through/);
  });
});
