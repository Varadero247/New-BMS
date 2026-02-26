// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
// Jest global setup file
// This file runs before each test suite

// Increase timeout for all tests
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Give time for cleanup
  await new Promise((resolve) => setTimeout(resolve, 100));
});
