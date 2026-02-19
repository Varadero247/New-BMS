import { test, expect } from '@playwright/test';

test.describe('Workflows CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3008');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Workflows dashboard', async ({ page }) => {
    await expect(page.locator('text=/Workflow|Process|Automation|Instance/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should list workflow instances via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/workflows/instances', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list workflow templates via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/workflows/templates', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list workflow definitions via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/workflows/definitions', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
