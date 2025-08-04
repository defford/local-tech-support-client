/**
 * Test setup configuration
 * Configures testing environment with MSW and Testing Library
 */

import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { server } from './mocks/server';

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