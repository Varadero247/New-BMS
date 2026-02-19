import { test, expect } from '@playwright/test';

test.describe('Incidents CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3041');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Incidents dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/Incident|RIDDOR|Investigation|Near Miss|Report/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list incidents via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/incidents/incidents', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should get incidents dashboard via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/incidents/dashboard', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list RIDDOR reports via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/incidents/riddor', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
