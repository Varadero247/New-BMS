import { test, expect } from '@playwright/test';

test.describe('ISO 42001 (AI Management) CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3024');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display ISO 42001 dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/ISO 42001|AI|Artificial Intelligence|AI System|Governance/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list AI systems via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/iso42001/ai-systems', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list AI risk assessments via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/iso42001/risk-assessments', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list AI policies via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/iso42001/policies', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
