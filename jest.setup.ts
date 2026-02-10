// Jest global setup file
// This file runs before each test suite

// Increase timeout for all tests
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Give time for cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
});
