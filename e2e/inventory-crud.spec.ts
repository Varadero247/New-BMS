import { test, expect } from '@playwright/test';

test.describe('Inventory CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3005');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Inventory dashboard', async ({ page }) => {
    await expect(page.locator('text=/Inventory|Item|Stock|Warehouse/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('should list inventory items via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/inventory/items', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list stock levels via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/inventory/stock-levels', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list warehouses via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/inventory/warehouses', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
