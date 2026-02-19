import { test, expect } from '@playwright/test';

test.describe('Assets CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3034');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Assets dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/Asset|Calibration|Inspection|Equipment|Depreciation/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list assets via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/assets/assets', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list asset calibrations via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/assets/calibrations', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list asset inspections via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/assets/inspections', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
