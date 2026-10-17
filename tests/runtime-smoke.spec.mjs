import { test, expect } from '@playwright/test';

test('Hub boots to the sign-in screen without browser errors', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toHaveText('Sign in');
  await expect(page.locator('form[data-form="login"]')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('forgot-password flow opens from the sign-in screen', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.locator('[data-action="forgot-password"]').click();
  await expect(page.locator('h1')).toHaveText('Reset password');
  await expect(page.locator('form[data-form="forgot-password"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
