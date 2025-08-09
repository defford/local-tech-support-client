/**
 * MSW server setup for API mocking in tests
 */

import { setupServer } from 'msw/node';
import { clientHandlers } from './handlers/clients';
import { technicianHandlers } from './handlers/technicians';
import { ticketHandlers } from './handlers/tickets';
import { statisticsHandlers } from './handlers/statistics';

// Combine all handlers
export const handlers = [
  ...clientHandlers,
  ...technicianHandlers,
  ...ticketHandlers,
  ...statisticsHandlers
];

// Setup MSW server
export const server = setupServer(...handlers);