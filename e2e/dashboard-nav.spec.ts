// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"], input[name="email"]', 'admin@ims.local');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
  });

  test('should display sidebar with all module sections', async ({ page }) => {
    await expect(page.locator('text=ISO Compliance')).toBeVisible();
    await expect(page.locator('text=Operations')).toBeVisible();
    await expect(page.locator('text=Portals & Specialist')).toBeVisible();
  });

  test('should display compliance gauges', async ({ page }) => {
    await expect(page.locator('text=Health & Safety')).toBeVisible();
    await expect(page.locator('text=Environmental')).toBeVisible();
    await expect(page.locator('text=Quality')).toBeVisible();
    await expect(page.locator('text=Overall IMS')).toBeVisible();
  });

  test('should display module cards in grouped sections', async ({ page }) => {
    await expect(page.locator('h2:has-text("ISO Compliance")')).toBeVisible();
    await expect(page.locator('h2:has-text("Operations")')).toBeVisible();
    await expect(page.locator('h2:has-text("Portals & Specialist")')).toBeVisible();
  });

  test('should navigate to templates page', async ({ page }) => {
    await page.click('text=Templates');
    await expect(page).toHaveURL(/.*templates/);
  });
});
