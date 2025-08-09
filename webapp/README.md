# Tech Support System - Web Application

Modern React web application for the Local Tech Support System, providing a comprehensive interface for managing clients, technicians, tickets, and appointments.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- Local Tech Support API server running on `localhost:8080` (default)

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server with HMR
npm run build        # Production build
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm test             # Run tests in watch mode
npm run test:ui      # Run tests with UI interface
npm run test:coverage # Run tests with coverage report
```

## 🏗️ Architecture

### Tech Stack
- **React 19** + **TypeScript** - Modern React with full type safety
- **Vite** - Lightning fast build tool and dev server
- **Mantine v8** - Comprehensive UI component library
- **React Router v7** - Declarative routing
- **TanStack Query v5** - Server state management with caching
- **Axios** - HTTP client with interceptors and error handling
- **Zustand** - Lightweight state management (planned)
- **React Hook Form + Zod** - Forms with validation (planned)

### Development Tools
- **Vitest** - Fast testing framework
- **Testing Library** - Component testing utilities
- **MSW** - API mocking for tests
- **ESLint + Prettier** - Code quality and formatting
- **Husky** - Git hooks for quality gates

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── layout/          # AppShell, Header, Navigation
│   └── ui/              # Base components (DataTable, StatusBadge, etc.)
├── pages/               # Route-level page components
│   ├── clients/         # Client management pages
│   ├── technicians/     # Technician management pages
│   ├── tickets/         # Ticket management pages
│   └── appointments/    # Appointment management pages
├── services/            # API service layer
│   ├── api/            # Axios client configuration
│   ├── clients.ts      # Client API operations
│   ├── technicians.ts  # Technician API operations
│   └── tickets.ts      # Ticket API operations
├── hooks/               # Custom React hooks
│   ├── useClients.ts   # TanStack Query hooks for clients
│   ├── useTechnicians.ts # TanStack Query hooks for technicians
│   └── useTickets.ts   # TanStack Query hooks for tickets
├── types/               # TypeScript type definitions
│   ├── Client.ts       # Client entity types
│   ├── Technician.ts   # Technician entity types
│   ├── Ticket.ts       # Ticket entity types
│   └── index.ts        # Type exports
└── __tests__/           # Test files and utilities
    ├── components/     # Component tests
    ├── mocks/          # MSW API mocks
    └── utils/          # Test utilities
```

## 🔌 API Integration

The application connects to the Local Tech Support API server with the following features:

### Configuration
```typescript
// Default API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

### Available Endpoints
- **Clients**: `/api/clients` - Full CRUD operations
- **Technicians**: `/api/technicians` - Management with skills tracking
- **Tickets**: `/api/tickets` - Ticket lifecycle and assignment
- **Appointments**: `/api/appointments` - Scheduling system
- **Statistics**: `/api/statistics` - Dashboard metrics

### Error Handling
- Automatic retry logic for failed requests
- User-friendly error messages
- Network error detection and recovery
- API error transformation and display

## 🧪 Testing

### Testing Strategy
- **Unit Tests**: Component behavior and business logic
- **Integration Tests**: API interactions with MSW mocks
- **Coverage Target**: >80% code coverage

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI interface
npm run test:ui

# View coverage report
open coverage/index.html
```

### Test Setup
Tests include proper mocks for:
- Mantine UI components (`window.matchMedia`, `ResizeObserver`)
- API endpoints via MSW (Mock Service Worker)
- React Router navigation
- TanStack Query client

## 🎨 UI Components

### Layout System
- **AppShell**: Main application layout with responsive navigation
- **Header**: App title, theme toggle, user menu, notifications
- **Navigation**: Sidebar with route-based active states

### Component Library
- **DataTable**: Sortable, filterable tables with pagination
- **StatusBadge**: Styled status indicators for entities
- **ErrorAlert**: Comprehensive error display with retry functionality
- **LoadingSpinner**: Consistent loading states

## 🔧 Development Workflow

### Code Quality
- TypeScript strict mode enabled
- ESLint with React and TypeScript rules
- Prettier for consistent formatting
- Husky pre-commit hooks for quality gates

### Environment Variables
```bash
# .env.local
VITE_API_URL=http://localhost:8080  # API server URL
VITE_LOG_LEVEL=debug               # Development logging
```

### Build Configuration
- Production builds optimized with code splitting
- Lazy loading for route-based components
- Bundle analysis and optimization
- Asset optimization and compression

## 🚦 Current Status

**✅ Phase 1 Complete - Foundation Ready**
- Complete TypeScript type system matching Java API
- Full Mantine UI layout with responsive design
- React Router with navigation system
- Comprehensive API layer with TanStack Query
- Testing framework with MSW mocks
- Production build system working

**🚀 Phase 2 In Progress - Core Features**
- Client management CRUD interface
- Technician management with skills
- Ticket management and assignment
- Dashboard with real-time statistics

## 🤝 Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new components and features
3. Ensure TypeScript strict compliance
4. Update documentation for significant changes
5. Use conventional commit messages

## 📚 Additional Resources

- [Mantine Documentation](https://mantine.dev/)
- [TanStack Query Guide](https://tanstack.com/query)
- [React Router Documentation](https://reactrouter.com/)
- [Vitest Testing Guide](https://vitest.dev/)
- [MSW API Mocking](https://mswjs.io/)