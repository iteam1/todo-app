import { test, expect } from '@playwright/test';

test.describe('Delete Task', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Task to delete');
    await input.press('Enter');
    await expect(page.getByText('Task to delete')).toBeVisible();
  });

  test('confirm deletion removes task from list', async ({ page }) => {
    await page.getByRole('button', { name: /delete.*task to delete/i }).click();
    await expect(page.getByRole('button', { name: /^delete$/i })).toBeVisible();
    await page.getByRole('button', { name: /^delete$/i }).click();
    await expect(page.getByText('Task to delete')).not.toBeVisible();
  });

  test('cancel deletion keeps task in list', async ({ page }) => {
    await page.getByRole('button', { name: /delete.*task to delete/i }).click();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByText('Task to delete')).toBeVisible();
  });

  test('delete task while "Completed" filter active, switch to "All" and verify absent', async ({
    page,
  }) => {
    // Complete the task first
    await page.getByRole('checkbox', { name: /mark.*task to delete.*complete/i }).click();

    // Switch to Completed filter
    await page.getByRole('tab', { name: /^completed$/i }).click();
    await expect(page.getByText('Task to delete')).toBeVisible();

    // Delete from Completed view
    await page.getByRole('button', { name: /delete.*task to delete/i }).click();
    await page.getByRole('button', { name: /^delete$/i }).click();

    // Switch to All filter
    await page.getByRole('tab', { name: /^all$/i }).click();
    await expect(page.getByText('Task to delete')).not.toBeVisible();
  });

  test('deleted task does not reappear after page refresh', async ({ page }) => {
    await page.getByRole('button', { name: /delete.*task to delete/i }).click();
    await page.getByRole('button', { name: /^delete$/i }).click();
    await expect(page.getByText('Task to delete')).not.toBeVisible();

    await page.reload();
    await expect(page.getByText('Task to delete')).not.toBeVisible();
  });
});
