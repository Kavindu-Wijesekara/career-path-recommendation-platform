// Setup file for Jest tests

// Mock environment variables
process.env.GEMINI_API_KEY = 'test-gemini-api-key';
process.env.RESEND_API_KEY = 'test-resend-api-key';
process.env.OPENAI_API_KEY = 'test-openai-api-key';

// Global teardown
afterAll(() => {
  // Clean up any global mocks or resources
  jest.clearAllMocks();
});

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Increase test timeout for potentially slow API calls
jest.setTimeout(30000);

// Mock Node.js modules that might be difficult to test
jest.mock('child_process', () => ({
  exec: jest.fn((command, options, callback) => {
    callback && callback(null, { stdout: 'mocked output', stderr: '' });
    return {
      on: jest.fn(),
      stdout: {
        on: jest.fn()
      },
      stderr: {
        on: jest.fn()
      }
    };
  })
}));

// Add custom assertions if needed
expect.extend({
  toBeValidEmail(received) {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received);
    return {
      pass: isValid,
      message: () => `expected ${received} ${isValid ? 'not ' : ''}to be a valid email`
    };
  }
});