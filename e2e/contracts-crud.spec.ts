import { test, expect } from '@playwright/test';

test.describe('Contracts CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3037');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Contracts dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/Contract|Agreement|Clause|Renewal|Approval/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list contracts via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/contracts/contracts', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list contract approvals via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/contracts/approvals', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list contract renewals via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/contracts/renewals', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
