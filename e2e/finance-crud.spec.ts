import { test, expect } from '@playwright/test';

test.describe('Finance CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3013');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Finance dashboard', async ({ page }) => {
    await expect(page.locator('text=/Finance|Account|Invoice|Budget/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('should list accounts via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/finance/accounts', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list financial reports via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/finance/reports', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list tax records via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/finance/tax', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
