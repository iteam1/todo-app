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

  // T012: Responsive — touch target and no overflow at mobile viewport
  test('Edit button meets 44×44px touch target at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Mobile task');
    await input.press('Enter');

    const editBtn = page.getByRole('button', { name: /edit task/i });
    const box = await editBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    // No horizontal overflow
    const overflow = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth);
    expect(overflow).toBe(false);
  });

  test('inline input has no horizontal overflow at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Mobile task');
    await input.press('Enter');

    await page.getByRole('button', { name: /edit task/i }).click();

    const overflow = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth);
    expect(overflow).toBe(false);
  });
});
