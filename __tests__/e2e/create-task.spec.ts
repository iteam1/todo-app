import { test, expect } from '@playwright/test';

test.describe('Create Task', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('create a task and verify it appears at top of list', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Buy milk');
    await input.press('Enter');
    await expect(page.getByText('Buy milk')).toBeVisible();
  });

  test('refresh page and verify task persists', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Persistent task');
    await input.press('Enter');
    await expect(page.getByText('Persistent task')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Persistent task')).toBeVisible();
  });

  test('attempt to submit whitespace task is not created', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('   ');
    await input.press('Enter');
    await expect(page.getByText('No tasks yet. Add one above.')).toBeVisible();
  });

  test('create a 500-character task without layout overflow', async ({ page }) => {
    const longText = 'A'.repeat(500);
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill(longText);
    await input.press('Enter');
    await expect(page.getByText(longText)).toBeVisible();

    // Check no horizontal overflow
    const bodyOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth;
    });
    expect(bodyOverflow).toBe(false);
  });

  test('newest task appears at top of list', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('First task');
    await input.press('Enter');
    await input.fill('Second task');
    await input.press('Enter');

    const items = page.getByRole('listitem');
    await expect(items.first()).toContainText('Second task');
  });
});
