import { test, expect } from '@playwright/test';

test.describe('Finance Compliance CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3038');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Finance Compliance dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/Finance|Compliance|Account|Budget|Report/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list finance accounts via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/finance/accounts', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list finance budgets via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/finance/budgets', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list finance reports via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/finance/reports', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
