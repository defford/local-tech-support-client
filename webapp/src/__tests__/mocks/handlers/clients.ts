/**
 * MSW handlers for client API endpoints
 */

import { http, HttpResponse } from 'msw';
import { Client, ClientStatus, PagedResponse } from '../../../types';

// Mock client data
const mockClients: Client[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    address: '123 Main St, City, State 12345',
    notes: 'Preferred contact method: email',
    status: ClientStatus.ACTIVE,
    active: true,
    fullName: 'John Doe',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0124',
    address: '456 Oak Ave, City, State 12345',
    notes: 'Business client',
    status: ClientStatus.ACTIVE,
    active: true,
    fullName: 'Jane Smith',
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z'
  },
  {
    id: 3,
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1-555-0125',
    status: ClientStatus.SUSPENDED,
    active: false,
    fullName: 'Bob Johnson',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-20T11:15:00Z'
  }
];

export const clientHandlers = [
  // Get all clients
  http.get('/api/clients', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    
    const startIndex = page * size;
    const endIndex = Math.min(startIndex + size, mockClients.length);
    const content = mockClients.slice(startIndex, endIndex);
    
    const response: PagedResponse<Client> = {
      content,
      totalElements: mockClients.length,
      totalPages: Math.ceil(mockClients.length / size),
      size,
      number: page,
      numberOfElements: content.length,
      first: page === 0,
      last: endIndex >= mockClients.length,
      empty: content.length === 0
    };
    
    return HttpResponse.json(response);
  }),

  // Get client by ID
  http.get('/api/clients/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const client = mockClients.find(c => c.id === id);
    
    if (!client) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(client);
  }),

  // Create client
  http.post('/api/clients', async ({ request }) => {
    const clientData = await request.json() as Partial<Client>;
    
    const newClient: Client = {
      id: Math.max(...mockClients.map(c => c.id)) + 1,
      firstName: clientData.firstName || '',
      lastName: clientData.lastName || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      address: clientData.address,
      notes: clientData.notes,
      status: clientData.status || ClientStatus.ACTIVE,
      active: clientData.status === ClientStatus.ACTIVE,
      fullName: `${clientData.firstName} ${clientData.lastName}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockClients.push(newClient);
    return HttpResponse.json(newClient, { status: 201 });
  }),

  // Update client
  http.put('/api/clients/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const updates = await request.json() as Partial<Client>;
    
    const clientIndex = mockClients.findIndex(c => c.id === id);
    if (clientIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const updatedClient = {
      ...mockClients[clientIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    mockClients[clientIndex] = updatedClient;
    return HttpResponse.json(updatedClient);
  }),

  // Delete client
  http.delete('/api/clients/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const clientIndex = mockClients.findIndex(c => c.id === id);
    
    if (clientIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    mockClients.splice(clientIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Search clients
  http.get('/api/clients/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase() || '';
    const status = url.searchParams.get('status');
    
    let filteredClients = mockClients.filter(client => {
      const matchesQuery = !query || 
        client.firstName.toLowerCase().includes(query) ||
        client.lastName.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query);
      
      const matchesStatus = !status || client.status === status;
      
      return matchesQuery && matchesStatus;
    });
    
    const response: PagedResponse<Client> = {
      content: filteredClients,
      totalElements: filteredClients.length,
      totalPages: 1,
      size: filteredClients.length,
      number: 0,
      numberOfElements: filteredClients.length,
      first: true,
      last: true,
      empty: filteredClients.length === 0
    };
    
    return HttpResponse.json(response);
  })
];