/**
 * MSW handlers for statistics API endpoints
 */

import { http, HttpResponse } from 'msw';
import { TicketStatistics, TechnicianStatistics } from '../../../types';

// Mock ticket statistics
const mockTicketStats: TicketStatistics = {
  totalTickets: 156,
  openTickets: 42,
  inProgressTickets: 18,
  resolvedTickets: 96,
  closedTickets: 96,
  averageResolutionTimeHours: 24.5,
  ticketsResolvedToday: 8,
  ticketsByPriority: {
    'URGENT': 5,
    'HIGH': 12,
    'MEDIUM': 20,
    'LOW': 5
  },
  ticketsByStatus: {
    'OPEN': 42,
    'CLOSED': 96
  },
  ticketsByServiceType: {
    'HARDWARE': 45,
    'SOFTWARE': 67,
    'NETWORK': 44
  }
};

// Mock technician statistics
const mockTechnicianStats: TechnicianStatistics = {
  totalTechnicians: 12,
  activeTechnicians: 10,
  totalAssignedTickets: 38,
  averageTicketsPerTechnician: 3.8,
  techniciansByStatus: {
    'ACTIVE': 10,
    'ON_VACATION': 1,
    'SICK_LEAVE': 1,
    'TERMINATED': 0
  },
  skillCoverage: {
    skillsInfo: [
      {
        skill: 'HARDWARE',
        technicianCount: 8,
        coverage: 66.7
      },
      {
        skill: 'SOFTWARE',
        technicianCount: 10,
        coverage: 83.3
      },
      {
        skill: 'NETWORK',
        technicianCount: 6,
        coverage: 50.0
      }
    ],
    totalSkills: 3,
    averageSkillsPerTechnician: 2.1
  }
};

export const statisticsHandlers = [
  // Get ticket statistics
  http.get('/api/tickets/statistics', () => {
    return HttpResponse.json(mockTicketStats);
  }),

  // Get technician statistics
  http.get('/api/technicians/statistics', () => {
    return HttpResponse.json(mockTechnicianStats);
  })
];