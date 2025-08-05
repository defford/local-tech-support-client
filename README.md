# Local Tech Support System

A comprehensive tech support management system with both CLI and web interfaces.

## Project Structure

This is a monorepo containing two applications:

- **`cli/`** - Java CLI application for tech support management
- **`webapp/`** - React web application (migration from CLI)
- **`docs/`** - Shared documentation and migration plans

## Applications

### CLI Application (`cli/`)

Java 17 + Maven-based CLI application with full CRUD operations for:
- Client Management
- Technician Management  
- Ticket Management
- Appointment Scheduling
- Reports & Analytics

**Quick Start:**
```bash
cd cli/
mvn clean package
java -jar target/tech-support-cli.jar interactive
```

See `cli/README.md` for detailed CLI documentation.

### Web Application (`webapp/`)

Modern React + TypeScript web application providing the same functionality as the CLI with improved UX.

**Tech Stack:**
- React 19 + TypeScript
- Vite build tool
- ShadCN UI framework
- Zustand state management
- TanStack Query for API
- Vitest + Testing Library

**Quick Start:**
```bash
cd webapp/
npm install
npm run dev
```

See `webapp/README.md` for detailed webapp documentation.

## Development

Both applications share the same REST API backend (default: `localhost:8080`).

### Migration Status

This project is migrating from Java CLI to React web application following the comprehensive plan in `docs/REACT_MIGRATION_PLAN.md`.

**✅ Phase 1 Complete:** Foundation & Infrastructure
- Complete TypeScript foundation with all Java model types
- Full ShadCN UI layout system with responsive navigation
- React Router integration with working navigation
- Comprehensive API layer with TanStack Query hooks
- Complete testing framework (Vitest + MSW) with 5/5 tests passing
- Production build system functional

**🚀 Current Phase:** Ready for Phase 2 - Core Entity Development

## Documentation

- `docs/REACT_MIGRATION_PLAN.md` - Complete migration strategy
- `docs/CLIENT_IMPLEMENTATION_PLAN.md` - Client management features
- `docs/MAIN_MENU_IMPLEMENTATION.md` - CLI menu structure
- `docs/TICKET_MANAGEMENT_IMPLEMENTATION.md` - Ticket system
- `docs/UNIT_TESTS_SUMMARY.md` - Testing overview

## Contributing

See individual application README files for specific development instructions.