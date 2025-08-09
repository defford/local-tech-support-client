/**
 * MSW handlers for ticket API endpoints
 */

import { http, HttpResponse } from 'msw';
import { Ticket, TicketStatus, TicketPriority, ServiceType, PagedResponse, TicketStatistics } from '../../../types';

// Mock ticket data
const mockTickets: Ticket[] = [
  {
    id: 1,
    title: 'Network connectivity issue',
    description: 'User cannot connect to the office network',
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    serviceType: ServiceType.NETWORK,
    clientId: 1,
    clientName: 'John Smith',
    clientEmail: 'john.smith@example.com',
    assignedTechnicianId: null,
    assignedTechnician: null,
    dueAt: '2024-03-01T10:00:00Z',
    createdAt: '2024-02-28T09:00:00Z',
    updatedAt: '2024-02-28T09:00:00Z'
  },
  {
    id: 2,
    title: 'Software installation problem',
    description: 'Unable to install required software package',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    serviceType: ServiceType.SOFTWARE,
    clientId: 2,
    clientName: 'Jane Doe',
    clientEmail: 'jane.doe@example.com',
    assignedTechnicianId: 1,
    assignedTechnician: {
      id: 1,
      firstName: 'Tech',
      lastName: 'Support',
      email: 'tech.support@example.com',
      phone: '+1-555-0101',
      specializations: ['SOFTWARE'],
      status: 'ACTIVE' as any,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    dueAt: null,
    createdAt: '2024-02-27T14:30:00Z',
    updatedAt: '2024-02-28T08:15:00Z'
  },
  {
    id: 3,
    title: 'Hardware malfunction',
    description: 'Computer randomly shuts down',
    status: TicketStatus.CLOSED,
    priority: TicketPriority.URGENT,
    serviceType: ServiceType.HARDWARE,
    clientId: 3,
    clientName: 'Bob Wilson',
    clientEmail: 'bob.wilson@example.com',
    assignedTechnicianId: 2,
    assignedTechnician: {
      id: 2,
      firstName: 'Support',
      lastName: 'Tech',
      email: 'support.tech@example.com',
      phone: '+1-555-0102',
      specializations: ['HARDWARE'],
      status: 'ACTIVE' as any,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    dueAt: '2024-02-26T16:00:00Z', // Overdue
    createdAt: '2024-02-25T10:00:00Z',
    updatedAt: '2024-02-28T11:45:00Z'
  }
];

// Mock ticket statistics
const mockTicketStats: TicketStatistics = {
  totalTickets: mockTickets.length,
  openTickets: mockTickets.filter(t => t.status === TicketStatus.OPEN).length,
  closedTickets: mockTickets.filter(t => t.status === TicketStatus.CLOSED).length,
  overdueTickets: 1, // Calculated based on dueAt
  unassignedTickets: mockTickets.filter(t => !t.assignedTechnicianId).length,
  urgentTickets: mockTickets.filter(t => t.priority === TicketPriority.URGENT).length,
  averageResolutionTime: 24.5
};

export const ticketHandlers = [
  // Get all tickets
  http.get('http://localhost:8080/api/tickets', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    
    const startIndex = page * size;
    const endIndex = Math.min(startIndex + size, mockTickets.length);
    const content = mockTickets.slice(startIndex, endIndex);
    
    const response: PagedResponse<Ticket> = {
      content,
      totalElements: mockTickets.length,
      totalPages: Math.ceil(mockTickets.length / size),
      size,
      number: page,
      numberOfElements: content.length,
      first: page === 0,
      last: endIndex >= mockTickets.length,
      empty: content.length === 0
    };
    
    return HttpResponse.json(response);
  }),

  // Get ticket by ID
  http.get('http://localhost:8080/api/tickets/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const ticket = mockTickets.find(t => t.id === id);
    
    if (!ticket) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(ticket);
  }),

  // Create ticket
  http.post('http://localhost:8080/api/tickets', async ({ request }) => {
    const ticketData = await request.json() as Partial<Ticket>;
    
    const newTicket: Ticket = {
      id: Math.max(...mockTickets.map(t => t.id)) + 1,
      title: ticketData.title || '',
      description: ticketData.description || '',
      status: ticketData.status || TicketStatus.OPEN,
      priority: ticketData.priority || TicketPriority.MEDIUM,
      serviceType: ticketData.serviceType || ServiceType.GENERAL,
      clientId: ticketData.clientId || 1,
      clientName: ticketData.clientName,
      clientEmail: ticketData.clientEmail,
      assignedTechnicianId: ticketData.assignedTechnicianId || null,
      assignedTechnician: ticketData.assignedTechnician || null,
      dueAt: ticketData.dueAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockTickets.push(newTicket);
    return HttpResponse.json(newTicket, { status: 201 });
  }),

  // Update ticket
  http.put('http://localhost:8080/api/tickets/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const updates = await request.json() as Partial<Ticket>;
    
    const ticketIndex = mockTickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const updatedTicket = {
      ...mockTickets[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    mockTickets[ticketIndex] = updatedTicket;
    return HttpResponse.json(updatedTicket);
  }),

  // Delete ticket
  http.delete('http://localhost:8080/api/tickets/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const ticketIndex = mockTickets.findIndex(t => t.id === id);
    
    if (ticketIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    mockTickets.splice(ticketIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Assign ticket
  http.post('http://localhost:8080/api/tickets/:id/assign', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const assignment = await request.json() as { technicianId: number };
    
    const ticketIndex = mockTickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    mockTickets[ticketIndex].assignedTechnicianId = assignment.technicianId;
    mockTickets[ticketIndex].updatedAt = new Date().toISOString();
    
    const assignmentResult = {
      ticketId: id,
      assignedTechnicianId: assignment.technicianId,
      assignedTechnicianName: `Technician ${assignment.technicianId}`,
      assignedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(assignmentResult);
  }),

  // Close ticket
  http.post('http://localhost:8080/api/tickets/:id/close', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const { resolution } = await request.json() as { resolution?: string };
    
    const ticketIndex = mockTickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    mockTickets[ticketIndex].status = TicketStatus.CLOSED;
    mockTickets[ticketIndex].updatedAt = new Date().toISOString();
    
    return HttpResponse.json(mockTickets[ticketIndex]);
  }),

  // Reopen ticket
  http.post('http://localhost:8080/api/tickets/:id/reopen', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const { reason } = await request.json() as { reason?: string };
    
    const ticketIndex = mockTickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    mockTickets[ticketIndex].status = TicketStatus.OPEN;
    mockTickets[ticketIndex].updatedAt = new Date().toISOString();
    
    return HttpResponse.json(mockTickets[ticketIndex]);
  }),

  // Search tickets
  http.get('http://localhost:8080/api/tickets/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase() || '';
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    
    let filteredTickets = mockTickets.filter(ticket => {
      const matchesQuery = !query || 
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.clientName?.toLowerCase().includes(query);
      
      const matchesStatus = !status || ticket.status === status;
      const matchesPriority = !priority || ticket.priority === priority;
      
      return matchesQuery && matchesStatus && matchesPriority;
    });
    
    const response: PagedResponse<Ticket> = {
      content: filteredTickets,
      totalElements: filteredTickets.length,
      totalPages: 1,
      size: filteredTickets.length,
      number: 0,
      numberOfElements: filteredTickets.length,
      first: true,
      last: true,
      empty: filteredTickets.length === 0
    };
    
    return HttpResponse.json(response);
  }),

  // Get overdue tickets
  http.get('http://localhost:8080/api/tickets/overdue', ({ request }) => {
    const now = new Date();
    const overdueTickets = mockTickets.filter(ticket => 
      ticket.dueAt && new Date(ticket.dueAt) < now && ticket.status === TicketStatus.OPEN
    );
    
    const response: PagedResponse<Ticket> = {
      content: overdueTickets,
      totalElements: overdueTickets.length,
      totalPages: 1,
      size: overdueTickets.length,
      number: 0,
      numberOfElements: overdueTickets.length,
      first: true,
      last: true,
      empty: overdueTickets.length === 0
    };
    
    return HttpResponse.json(response);
  }),

  // Get unassigned tickets
  http.get('http://localhost:8080/api/tickets/unassigned', ({ request }) => {
    const unassignedTickets = mockTickets.filter(ticket => !ticket.assignedTechnicianId);
    
    const response: PagedResponse<Ticket> = {
      content: unassignedTickets,
      totalElements: unassignedTickets.length,
      totalPages: 1,
      size: unassignedTickets.length,
      number: 0,
      numberOfElements: unassignedTickets.length,
      first: true,
      last: true,
      empty: unassignedTickets.length === 0
    };
    
    return HttpResponse.json(response);
  }),

  // Get ticket statistics
  http.get('http://localhost:8080/api/tickets/statistics', () => {
    return HttpResponse.json(mockTicketStats);
  })
];