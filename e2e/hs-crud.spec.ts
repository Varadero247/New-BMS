import { test, expect } from '@playwright/test';

test.describe('Health & Safety CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login via API and set token
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3001');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display H&S dashboard', async ({ page }) => {
    await expect(page.locator('text=/Health.*Safety|Risk|Incident/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should list risks via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/health-safety/risks', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list incidents via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/health-safety/incidents', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list actions via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/health-safety/actions', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
