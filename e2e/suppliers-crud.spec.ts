import { test, expect } from '@playwright/test';

test.describe('Suppliers CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3033');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Suppliers dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/Supplier|Vendor|Score|Approval|Procurement/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list suppliers via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/suppliers/suppliers', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list supplier scorecards via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/suppliers/scorecards', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list supplier documents via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/suppliers/documents', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
