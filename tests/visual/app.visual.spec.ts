import { test, expect } from '@playwright/test';

const stabilizeUi = async (page: import('@playwright/test').Page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
    `,
  });
};

test.describe('Visual Regression', () => {
  test('landing page', async ({ page }) => {
    await page.goto('/');
    await stabilizeUi(page);
    await expect(page).toHaveScreenshot('landing-page.png', { fullPage: true });
  });

  test('services page', async ({ page }) => {
    await page.goto('/services');
    await stabilizeUi(page);
    await expect(page).toHaveScreenshot('services-page.png', { fullPage: true });
  });

  test('database page', async ({ page }) => {
    await page.goto('/database');
    await stabilizeUi(page);
    await expect(page).toHaveScreenshot('database-page.png', { fullPage: true });
  });

  test('admin access gate (guest)', async ({ page }) => {
    await page.goto('/admin');
    await stabilizeUi(page);
    await expect(page).toHaveScreenshot('admin-gate-page.png', { fullPage: true });
  });

  test('login modal', async ({ page }) => {
    await page.goto('/');
    await stabilizeUi(page);
    await page.locator('section').first().locator('button').first().click();
    await expect(page).toHaveScreenshot('login-modal.png', { fullPage: true });
  });
});
