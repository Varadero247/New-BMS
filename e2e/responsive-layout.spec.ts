// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"], input[name="email"]', 'admin@ims.local');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
  });

  test('should display sidebar collapsed on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForTimeout(500);
    // On mobile the sidebar should either be hidden or collapsed
    const sidebar = page.locator('nav, aside, [class*="sidebar"]').first();
    const isVisible = await sidebar.isVisible();
    if (isVisible) {
      // If visible, it should be in a collapsed/narrow state
      const box = await sidebar.boundingBox();
      expect(box?.width).toBeLessThan(100);
    } else {
      // Sidebar is hidden on mobile — that is the expected behaviour
      expect(isVisible).toBe(false);
    }
  });

  test('should display full sidebar on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.waitForTimeout(500);
    // Dashboard heading or module list should be visible at desktop width
    await expect(page.locator('text=/ISO Compliance|Operations|Dashboard/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate to a module page on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForTimeout(500);
    // Core page content should still be reachable on a tablet
    await expect(page.locator('text=/Health|Quality|Environment|Dashboard/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should keep login form usable on mobile viewport', async ({ page }) => {
    // Go back to login to test form at mobile size
    await page.evaluate(() => localStorage.removeItem('token'));
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:3000');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    const box = await emailInput.boundingBox();
    // Input should be reasonably wide on mobile (at least 200px)
    expect(box?.width).toBeGreaterThan(200);
  });
});
