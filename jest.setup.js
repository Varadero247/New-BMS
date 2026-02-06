// Global Jest setup

// Increase timeout for integration tests
jest.setTimeout(30000);

// Suppress console output during tests unless in debug mode
if (process.env.DEBUG !== 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    // Keep error for debugging
    error: console.error,
  };
}

// Clean up after all tests
afterAll(async () => {
  // Allow any pending async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 100));
});
