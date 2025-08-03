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
- Mantine UI framework
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

This project is currently migrating from Java CLI to React web application following the comprehensive plan in `docs/REACT_MIGRATION_PLAN.md`.

**Current Phase:** Phase 1 - Foundation & Infrastructure

## Documentation

- `docs/REACT_MIGRATION_PLAN.md` - Complete migration strategy
- `docs/CLIENT_IMPLEMENTATION_PLAN.md` - Client management features
- `docs/MAIN_MENU_IMPLEMENTATION.md` - CLI menu structure
- `docs/TICKET_MANAGEMENT_IMPLEMENTATION.md` - Ticket system
- `docs/UNIT_TESTS_SUMMARY.md` - Testing overview

## Contributing

See individual application README files for specific development instructions.