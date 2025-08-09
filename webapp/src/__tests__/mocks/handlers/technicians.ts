/**
 * MSW handlers for technician API endpoints
 */

import { http, HttpResponse } from 'msw';

// Simple in-memory store for technicians used in tests
let technicians = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 111-2222',
    status: 'ACTIVE',
    skills: ['Networking', 'Hardware']
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 333-4444',
    status: 'TERMINATED',
    skills: ['Software']
  }
];

let nextId = 3;

export const technicianHandlers: any[] = [
  // List technicians
  http.get('http://localhost:8080/api/technicians', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '0');
    const size = Number(url.searchParams.get('size') || '20');
    const start = page * size;
    const end = start + size;
    const content = technicians.slice(start, end);

    return HttpResponse.json({
      content,
      totalElements: technicians.length,
      totalPages: Math.max(1, Math.ceil(technicians.length / size)),
      size,
      number: page
    });
  }),

  // Get by id
  http.get('http://localhost:8080/api/technicians/:id', ({ params }) => {
    const id = Number(params.id);
    const tech = technicians.find(t => t.id === id);
    if (!tech) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(tech);
  }),

  // Create
  http.post('http://localhost:8080/api/technicians', async ({ request }) => {
    const body = await request.json();
    const created = { id: nextId++, skills: [], status: 'ACTIVE', ...body };
    technicians = [...technicians, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  // Update
  http.put('http://localhost:8080/api/technicians/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const updates = await request.json();
    const index = technicians.findIndex(t => t.id === id);
    if (index === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    technicians[index] = { ...technicians[index], ...updates };
    return HttpResponse.json(technicians[index]);
  }),

  // Delete
  http.delete('http://localhost:8080/api/technicians/:id', ({ params }) => {
    const id = Number(params.id);
    technicians = technicians.filter(t => t.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // Workload
  http.get('http://localhost:8080/api/technicians/:id/workload', ({ params }) => {
    const id = Number(params.id);
    const tech = technicians.find(t => t.id === id);
    if (!tech) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      technicianId: id,
      technicianName: `${tech.firstName} ${tech.lastName}`,
      assignedTickets: 2,
      completedTickets: 5,
      averageResolutionTime: 8,
      currentLoad: 'MEDIUM',
      skills: tech.skills || [],
      available: tech.status === 'ACTIVE'
    });
  }),

  // Tickets by technician (empty minimal)
  http.get('http://localhost:8080/api/technicians/:id/tickets', ({ params }) => {
    return HttpResponse.json({ content: [], totalElements: 0, totalPages: 1, size: 20, number: 0 });
  }),

  // Appointments by technician (empty minimal)
  http.get('http://localhost:8080/api/technicians/:id/appointments', ({ params }) => {
    return HttpResponse.json({ content: [], totalElements: 0, totalPages: 1, size: 20, number: 0 });
  }),

  // Statistics
  http.get('http://localhost:8080/api/technicians/statistics', () => {
    return HttpResponse.json({
      totalTechnicians: technicians.length,
      activeTechnicians: technicians.filter(t => t.status === 'ACTIVE').length,
      totalAssignedTickets: 0,
      averageTicketsPerTechnician: 0,
      techniciansByStatus: technicians.reduce((acc: Record<string, number>, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {}),
      skillCoverage: {
        skillsInfo: [],
        totalSkills: 0,
        averageSkillsPerTechnician: 0
      }
    });
  }),
];