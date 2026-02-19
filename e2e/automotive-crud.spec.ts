import { test, expect } from '@playwright/test';

test.describe('Automotive CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3010');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Automotive dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/Automotive|APQP|PPAP|FMEA|Control Plan/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list APQP projects via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/automotive/apqp', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list PPAP submissions via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/automotive/ppap', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list control plans via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/automotive/control-plans', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
