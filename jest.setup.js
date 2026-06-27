/**
 * Jest Setup
 *
 * Global test setup and mocks
 */

// Add custom matchers or global test setup here
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock window.location
delete window.location;
window.location = { href: '', origin: 'http://localhost:3000' } as any;

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};


