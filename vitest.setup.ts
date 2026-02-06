import { expect, afterEach, vi } from 'vitest';

// Setup global test environment
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
