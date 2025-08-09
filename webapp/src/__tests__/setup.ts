/**
 * Test setup configuration
 * Configures testing environment with MSW and Testing Library
 */

import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Radix UI and user-event pointer helpers for JSDOM
// JSDOM doesn't implement these; mock as no-ops to avoid runtime errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Element.prototype.setPointerCapture = function () { /* noop */ };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Element.prototype.hasPointerCapture = function () { return false; };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Element.prototype.scrollIntoView = function () { /* noop */ };

// Mock window.matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Start MSW server before all tests
beforeAll(() => {
  server.listen();
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Stop MSW server after all tests
afterAll(() => {
  server.close();
});