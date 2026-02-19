import { test, expect } from '@playwright/test';

test.describe('Regulatory Monitor CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3040');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Regulatory Monitor dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/Regulatory|Regulation|Legal|Obligation|Change/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list regulatory changes via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/reg-monitor/changes', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list legal register via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/reg-monitor/legal-register', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list regulatory obligations via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/reg-monitor/obligations', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
