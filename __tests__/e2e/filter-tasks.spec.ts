import { test, expect } from '@playwright/test';

test.describe('Filter Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Create 3 tasks: 2 active, 1 completed
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Active task 1');
    await input.press('Enter');
    await input.fill('Active task 2');
    await input.press('Enter');
    await input.fill('Completed task');
    await input.press('Enter');

    // Complete the "Completed task"
    await page.getByRole('checkbox', { name: /mark.*completed task.*complete/i }).click();
  });

  test('"Active" filter shows only active tasks', async ({ page }) => {
    await page.getByRole('tab', { name: /^active$/i }).click();
    await expect(page.getByText('Active task 1')).toBeVisible();
    await expect(page.getByText('Active task 2')).toBeVisible();
    await expect(page.getByText('Completed task')).not.toBeVisible();
  });

  test('"Completed" filter shows only completed tasks', async ({ page }) => {
    await page.getByRole('tab', { name: /^completed$/i }).click();
    await expect(page.getByText('Completed task')).toBeVisible();
    await expect(page.getByText('Active task 1')).not.toBeVisible();
    await expect(page.getByText('Active task 2')).not.toBeVisible();
  });

  test('"All" filter shows all tasks', async ({ page }) => {
    await page.getByRole('tab', { name: /^all$/i }).click();
    await expect(page.getByText('Active task 1')).toBeVisible();
    await expect(page.getByText('Active task 2')).toBeVisible();
    await expect(page.getByText('Completed task')).toBeVisible();
  });

  test('completing a task while "Active" filter removes it from view', async ({ page }) => {
    await page.getByRole('tab', { name: /^active$/i }).click();
    await expect(page.getByText('Active task 1')).toBeVisible();

    await page.getByRole('checkbox', { name: /mark.*active task 1.*complete/i }).click();
    await expect(page.getByText('Active task 1')).not.toBeVisible();
    await expect(page.getByText('Active task 2')).toBeVisible();
  });

  test('empty state messages for each filter', async ({ page }) => {
    // Create a fresh page with only a completed task
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Only task');
    await input.press('Enter');
    await page.getByRole('checkbox', { name: /mark.*only task.*complete/i }).click();

    await page.getByRole('tab', { name: /^active$/i }).click();
    await expect(page.getByText('No active tasks.')).toBeVisible();

    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('tab', { name: /^completed$/i }).click();
    await expect(page.getByText('No completed tasks.')).toBeVisible();
  });
});
