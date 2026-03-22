import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 320, height: 568 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const vp of viewports) {
  test(`no horizontal scrollbar at ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');

    // Add some content to test with
    const input = page.getByRole('textbox', { name: /new task/i });
    await input.fill('Test task for responsive layout check');
    await input.press('Enter');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
}
