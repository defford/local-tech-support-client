# Tickets Page Implementation Plan

## Project Status Analysis

**Current State:**
- ✅ ShadCN UI migration complete through Phase 4
- ✅ Professional theme system with dark/light mode implemented  
- ✅ Technicians management fully implemented as reference pattern
- ✅ Comprehensive ticket API infrastructure exists:
  - Complete TypeScript types (`Ticket.ts`, `TicketCreateRequest`, `TicketUpdateRequest`, `TicketAssignmentRequest`)
  - Robust TanStack Query hooks (`useTickets.ts`) - 15+ hooks for all operations
  - Full API service layer (`tickets.ts`) - CRUD + assignment + status management
  - Util functions for status checking, priority handling, overdue detection
- ✅ Basic placeholder component exists in `App.tsx`
- ✅ Navigation structure ready in app shell

**Infrastructure Ready:**
- API client with error handling and retries
- Query invalidation and cache management
- Bulk operations support (create, update, assign, close, delete)
- Assignment and status workflow operations
- Search and filtering capabilities
- Overdue and unassigned ticket tracking

## Implementation Plan

### Phase 1: Core Tickets Page Structure
**Estimated Time: 2-3 hours**

#### 1.1 Create TicketsPage Component
- **File**: `webapp/src/pages/tickets/TicketsPage.tsx`
- **Components**: Main page layout with:
  - Header with page title and "New Ticket" button
  - Status overview cards (Open, Overdue, Unassigned counts)
  - Search and filter controls
  - Data table with ticket list
  - Loading and error states
  - Pagination controls

#### 1.2 Create TicketForm Component
- **File**: `webapp/src/components/forms/TicketForm.tsx`
- **Features**:
  - React Hook Form with Zod validation
  - Fields: title, description, serviceType, priority, clientId, dueAt
  - Client selector dropdown with search
  - Service type selection (Hardware, Software, Network)
  - Priority selection with visual indicators
  - Due date picker with validation
  - Form validation matching API requirements
  - Save/Cancel actions

#### 1.3 Create TicketModal Component
- **File**: `webapp/src/components/forms/TicketModal.tsx`
- **Features**:
  - Modal wrapper using ShadCN Dialog
  - Support for Create/Edit modes
  - Integration with TicketForm
  - Proper form submission handling
  - Success/error feedback

### Phase 2: Data Table Implementation
**Estimated Time: 2-3 hours**

#### 2.1 Ticket Data Table
- **Component**: Enhanced DataTable for tickets
- **Columns**:
  - ID (clickable to detail page)
  - Title (truncated with tooltip)
  - Client name and email
  - Status badge with color coding
  - Priority badge with urgency indicators
  - Assigned technician (or "Unassigned")
  - Due date with overdue highlighting
  - Actions (Edit/Delete/Assign/Close)

#### 2.2 Table Features
- **Sorting**: By priority, status, due date, created date, client name
- **Filtering**: 
  - Status: Open, Closed, Overdue, Unassigned
  - Priority: Urgent, High, Medium, Low
  - Service Type: Hardware, Software, Network
  - Assigned/Unassigned toggle
- **Search**: Global search across title, description, client name
- **Pagination**: Using existing infrastructure
- **Bulk Actions**: Select multiple tickets for bulk operations

### Phase 3: Advanced Features
**Estimated Time: 3-4 hours**

#### 3.1 Ticket Detail View
- **File**: `webapp/src/pages/tickets/TicketDetailPage.tsx`
- **Sections**:
  - Ticket information card with status and priority
  - Client information and contact details
  - Assignment status and technician details
  - Timeline/history of status changes
  - Action buttons for status management
  - Related tickets or appointments

#### 3.2 Assignment Management
- **Component**: TechnicianAssignmentModal
- **Features**:
  - Available technicians list with workload indicators
  - Skills matching recommendations
  - Assignment confirmation with estimated completion
  - Workload impact visualization
  - Assignment history tracking

#### 3.3 Status Workflow Management
- **Features**:
  - Status transition buttons (Open → Assigned → Closed)
  - Close ticket with resolution notes
  - Reopen ticket with reason
  - Priority escalation workflow
  - Overdue ticket alerts and actions

#### 3.4 Priority and Visual Indicators
- **Components**:
  - PriorityBadge with color coding and icons
  - OverdueIndicator with time calculations
  - StatusWorkflow with transition visualization
  - Assignment status with technician avatars

### Phase 4: Integration & Testing
**Estimated Time: 2-3 hours**

#### 4.1 Route Integration
- Replace placeholder in `App.tsx` with full TicketsPage
- Add ticket detail routes (`/tickets/:id`)
- Update navigation links with ticket counts
- Implement breadcrumb navigation

#### 4.2 Error Handling
- API error display with recovery options
- Form validation errors with clear messaging
- Network failure recovery with retry mechanisms
- Empty states for no tickets and no search results
- Assignment conflict resolution

#### 4.3 Testing Implementation
- Unit tests for ticket components
- Integration tests for CRUD operations
- Assignment workflow testing
- Status transition testing
- Error boundary testing

## Technical Architecture

### Component Hierarchy
```
TicketsPage
├── StatusOverviewCards (Open, Overdue, Unassigned counts)
├── PageHeader (with New Ticket action)
├── SearchAndFilters
│   ├── SearchInput
│   ├── StatusFilter
│   ├── PriorityFilter
│   └── ServiceTypeFilter
├── TicketDataTable
│   ├── TicketRow (with status, priority, assignment indicators)
│   ├── BulkActions
│   └── StatusActions (Assign, Close, Edit)
├── TicketModal
│   └── TicketForm (with client selector, priority picker)
└── Pagination

TicketDetailPage
├── TicketInfoCard
├── ClientInfoCard
├── AssignmentCard
├── StatusWorkflow
└── ActionButtons

TechnicianAssignmentModal
├── AvailableTechniciansList
├── WorkloadIndicators
└── AssignmentForm
```

### State Management
- **TanStack Query**: All server state via existing hooks
- **Local State**: Form state, UI interactions, filters, selection
- **URL State**: Search params, pagination, filters, active views

### Data Flow
1. Page loads → `useTickets()` fetches paginated data
2. Status cards → `useTicketStatistics()` for counts  
3. User creates → `useCreateTicket()` mutation
4. User assigns → `useAssignTicket()` mutation
5. User closes → `useCloseTicket()` mutation
6. User updates → `useUpdateTicket()` mutation
7. Cache automatically updated via query invalidation

## File Structure
```
webapp/src/
├── pages/
│   └── tickets/
│       ├── TicketsPage.tsx           # Main tickets page
│       ├── TicketDetailPage.tsx      # Detail view page
│       └── index.ts                  # Exports
├── components/
│   ├── forms/
│   │   ├── TicketForm.tsx            # Ticket creation/editing form
│   │   ├── TicketModal.tsx           # Modal wrapper for forms
│   │   └── TechnicianAssignmentModal.tsx # Assignment interface
│   └── ui/
│       ├── PriorityBadge.tsx         # Priority indicator component
│       ├── OverdueIndicator.tsx      # Overdue warning component
│       ├── StatusWorkflow.tsx        # Status transition component
│       └── AssignmentStatus.tsx      # Assignment indicator component
└── __tests__/
    ├── pages/tickets/
    ├── components/forms/
    └── integration/
```

## API Integration Points

### Existing Hooks to Utilize
- `useTickets(params)` - Main data fetching with pagination
- `useTicket(id)` - Single ticket details
- `useCreateTicket()` - Create new tickets
- `useUpdateTicket()` - Edit ticket details
- `useDeleteTicket()` - Remove tickets
- `useAssignTicket()` - Assign to technician
- `useCloseTicket()` - Close with resolution
- `useReopenTicket()` - Reopen with reason
- `useTicketSearch(params)` - Search functionality
- `useOverdueTickets()` - Overdue ticket management
- `useUnassignedTickets()` - Unassigned ticket tracking
- `useTicketStatistics()` - Dashboard metrics

### API Endpoints Available
- `GET /api/tickets` - List with pagination and filtering
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update existing ticket
- `DELETE /api/tickets/:id` - Remove ticket
- `POST /api/tickets/:id/assign` - Assign to technician
- `POST /api/tickets/:id/close` - Close with resolution
- `POST /api/tickets/:id/reopen` - Reopen with reason
- `GET /api/tickets/search` - Search functionality
- `GET /api/tickets/overdue` - Overdue tickets
- `GET /api/tickets/unassigned` - Unassigned tickets
- `GET /api/tickets/statistics` - Statistics data
- `POST /api/tickets/bulk` - Bulk operations

## Design Patterns

### Following Technician Page Patterns
- Consistent with existing `TechniciansPage.tsx` structure
- Same ShadCN UI components and styling approach
- Identical error handling and loading patterns
- Matching form validation and submission approach
- Similar responsive design and mobile optimization

### UI Components to Reuse
- `DataTable` - For ticket listing (proven pattern)
- `StatusBadge` - Adapt for ticket status
- `ErrorAlert` - For error display
- `LoadingSpinner` - For loading states
- Form components - Button, Input, Select, Dialog, etc.

### New Components for Tickets
- `PriorityBadge` - Visual priority indicators
- `OverdueIndicator` - Time-based warnings
- `AssignmentStatus` - Technician assignment display
- `StatusWorkflow` - Status transition interface

## Unique Ticket Features

### Status Workflow Management
```typescript
Open → In Progress → Closed
     ↘ Assigned ↗
     
Status transitions:
- Open → Assigned (when technician assigned)
- Assigned → Closed (when resolved)
- Closed → Open (when reopened)
- Any → Closed (manual closure)
```

### Priority System
```typescript
Priority levels with visual coding:
- URGENT: Red badge, immediate attention
- HIGH: Orange badge, same day
- MEDIUM: Yellow badge, within 3 days  
- LOW: Green badge, when available

Visual indicators:
🔴 URGENT - Critical system down
🟠 HIGH - Important functionality affected
🟡 MEDIUM - Standard request
🟢 LOW - Enhancement or minor issue
```

### Assignment Logic
- Show available technicians with skills matching
- Display current workload and availability
- Suggest optimal assignments based on expertise
- Track assignment history and performance

### Overdue Management
- Automatic overdue detection based on due dates
- Visual highlighting of overdue tickets
- Escalation workflows for overdue items
- Manager notification for critical overdue tickets

## Testing Strategy

### Manual Testing Scenarios
1. **CRUD Operations**
   - Create new ticket with all required fields
   - Create ticket with optional due date
   - Edit existing ticket details
   - Delete ticket with confirmation dialog
   - Bulk operations on multiple tickets

2. **Status Workflow**
   - Open ticket → Assign technician → Close ticket
   - Reopen closed ticket with reason
   - Manual status transitions
   - Bulk status updates
   - Assignment conflict handling

3. **Assignment Management**
   - Assign ticket to available technician
   - View technician workload before assignment
   - Reassign ticket to different technician
   - Unassign ticket from technician
   - Bulk assignment operations

4. **Priority and Overdue Management**
   - Create urgent priority ticket
   - View overdue ticket indicators
   - Filter by priority levels
   - Escalate ticket priority
   - Overdue notification system

5. **Data Display and Filtering**
   - View paginated ticket list
   - Sort by different columns (priority, status, due date)
   - Filter by status, priority, service type
   - Global search across ticket data
   - Clear filters functionality

6. **Client Integration**
   - Create ticket for specific client
   - View client contact information in ticket
   - Search tickets by client name
   - Client-specific ticket history

7. **Error Scenarios**
   - Network failure handling
   - Invalid form submissions
   - Server error responses
   - Concurrent modification conflicts
   - Assignment to unavailable technician

8. **Responsive Design**
   - Mobile phone interface (320px-767px)
   - Tablet interface (768px-1199px)  
   - Desktop interface (1200px+)
   - Touch-friendly interactions
   - Keyboard navigation support

### Automated Testing
1. **Component Tests**
   - TicketsPage rendering and interactions
   - TicketForm validation logic
   - TicketModal open/close behavior
   - Search and filter functionality
   - Status transition components

2. **Integration Tests**
   - Full CRUD workflow testing
   - Assignment workflow testing
   - API integration with mock server
   - Query cache invalidation testing
   - Error boundary behavior

3. **Hook Tests**
   - All ticket-related hooks functionality
   - Error handling in hooks
   - Cache management and invalidation
   - Optimistic updates testing

## Success Criteria

### Functional Requirements
- ✅ View paginated list of tickets with status overview
- ✅ Create new tickets with client assignment and priority
- ✅ Edit existing ticket details including status and priority
- ✅ Delete tickets with confirmation and bulk operations
- ✅ Assign tickets to technicians with availability checking
- ✅ Manage ticket status workflow (Open → Assigned → Closed)
- ✅ Search tickets by title, description, client name
- ✅ Filter by status, priority, service type, assignment
- ✅ View overdue tickets with visual indicators
- ✅ Manage priority levels with escalation
- ✅ Responsive design for all screen sizes
- ✅ Client integration with contact information

### Technical Requirements
- ✅ Consistent with existing codebase patterns
- ✅ Uses ShadCN UI components throughout
- ✅ Proper TypeScript typing with no any types
- ✅ Comprehensive error handling and recovery
- ✅ Accessible UI components (WCAG 2.1 AA)
- ✅ Performance optimized (virtualization for large lists)
- ✅ Proper query cache management
- ✅ Mobile-first responsive design

### Quality Requirements
- ✅ Unit test coverage >80%
- ✅ Integration tests for key workflows
- ✅ Manual testing guide with 50+ scenarios
- ✅ No console errors or warnings
- ✅ Lighthouse accessibility score >90
- ✅ Professional UI with consistent theming
- ✅ Error boundaries with graceful fallback

## Implementation Phases Summary

| Phase | Deliverable | Time | Dependencies |
|-------|------------|------|--------------|
| 1     | Core page structure with forms | 2-3h | ShadCN UI components |
| 2     | Data table with filtering/search | 2-3h | Phase 1 |
| 3     | Advanced features (detail page, assignment) | 3-4h | Phase 2 |
| 4     | Integration, testing, polish | 2-3h | Phase 3 |

**Total Estimated Time: 9-13 hours**

## Next Steps

1. **Start with Phase 1** - Create basic page structure following technician patterns
2. **Leverage existing infrastructure** - All API hooks and services are ready
3. **Follow established patterns** - Use TechniciansPage as reference for consistency
4. **Test incrementally** - Verify each phase before proceeding
5. **Document testing scenarios** - Create comprehensive manual test plan
6. **Focus on ticket-specific features** - Status workflows, priority management, assignment

## Key Differentiators from Technicians

### Ticket-Specific Features
1. **Status Workflow**: Complex state transitions with business rules
2. **Priority Management**: Visual priority system with urgency indicators
3. **Assignment Logic**: Technician matching with workload consideration
4. **Client Integration**: Strong relationship with client contact information
5. **Overdue Tracking**: Time-based alerts and escalation workflows
6. **Service Type Classification**: Hardware/Software/Network categorization

### Enhanced UI Components
- Priority badges with visual hierarchy
- Status workflow with transition indicators
- Assignment interface with technician selection
- Overdue warnings with time calculations
- Client contact integration
- Service type classification system

The infrastructure is exceptionally well-prepared for this implementation. The existing API layer, TypeScript types, and TanStack Query hooks provide a solid foundation that will significantly accelerate development. The successful technician implementation provides proven patterns to follow while adding ticket-specific enhancements.