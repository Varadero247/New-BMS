import { test, expect } from '@playwright/test';

test.describe('Complaints CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3036');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Complaints dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/Complaint|Customer|Resolution|SLA|Action/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list complaints via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/complaints/complaints', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list complaint actions via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/complaints/actions', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list complaint communications via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/complaints/communications', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
