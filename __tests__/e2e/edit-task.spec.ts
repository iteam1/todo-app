import { test, expect } from '@playwright/test';

test.describe('Edit Task', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  // US1: Edit and Save Inline
  test('add task → click Edit → change text → press Enter → text is updated', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Original text');
    await input.press('Enter');

    await page.getByRole('button', { name: /edit task/i }).click();
    const editInput = page.getByRole('textbox').last();
    await editInput.fill('Updated text');
    await editInput.press('Enter');

    await expect(page.getByText('Updated text')).toBeVisible();
    await expect(page.getByText('Original text')).not.toBeVisible();
  });

  test('edited text persists after page reload', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Original text');
    await input.press('Enter');

    await page.getByRole('button', { name: /edit task/i }).click();
    const editInput = page.getByRole('textbox').last();
    await editInput.fill('Persisted text');
    await editInput.press('Enter');

    await page.reload();
    await expect(page.getByText('Persisted text')).toBeVisible();
  });

  // US2: Cancel Edit with Escape
  test('add task → click Edit → modify text → press Escape → original text restored', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Original text');
    await input.press('Enter');

    await page.getByRole('button', { name: /edit task/i }).click();
    const editInput = page.getByRole('textbox').last();
    await editInput.fill('Modified text');
    await editInput.press('Escape');

    await expect(page.getByText('Original text')).toBeVisible();
    await expect(page.getByText('Modified text')).not.toBeVisible();
  });

  // US3: Reject Blank Save
  test('add task → click Edit → clear text → press Enter → original text restored', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Original text');
    await input.press('Enter');

    await page.getByRole('button', { name: /edit task/i }).click();
    const editInput = page.getByRole('textbox').last();
    await editInput.fill('');
    await editInput.press('Enter');

    await expect(page.getByText('Original text')).toBeVisible();
  });

  test('blank rejection persists on reload — original text remains', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Original text');
    await input.press('Enter');

    await page.getByRole('button', { name: /edit task/i }).click();
    const editInput = page.getByRole('textbox').last();
    await editInput.fill('');
    await editInput.press('Enter');

    await page.reload();
    await expect(page.getByText('Original text')).toBeVisible();
  });
});
