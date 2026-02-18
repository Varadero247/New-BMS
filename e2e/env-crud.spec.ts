import { test, expect } from '@playwright/test';

test.describe('Environmental CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3002');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Environmental dashboard', async ({ page }) => {
    await expect(page.locator('text=/Environment|Aspect|Event/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should list aspects via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/environment/aspects', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list events via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/environment/events', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list legal requirements via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/environment/legal', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
