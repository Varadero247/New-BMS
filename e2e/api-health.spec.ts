// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

test.describe('API Health Endpoints', () => {
  test('should respond healthy at Gateway (port 4000)', async ({ request }) => {
    const response = await request.get('http://localhost:4000/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('should respond healthy at Health & Safety API (port 4001)', async ({ request }) => {
    const response = await request.get('http://localhost:4001/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('should respond healthy at Environment API (port 4002)', async ({ request }) => {
    const response = await request.get('http://localhost:4002/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('should respond healthy at Quality API (port 4003)', async ({ request }) => {
    const response = await request.get('http://localhost:4003/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });
});
