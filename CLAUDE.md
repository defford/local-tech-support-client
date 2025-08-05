# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo** containing the Local Tech Support System with both CLI and web applications:

- **`cli/`** - Java 17 Maven-based CLI application (fully functional)
- **`webapp/`** - React 19 + TypeScript web application (ShadCN UI migration complete)

Both applications integrate with the same REST API backend running on `localhost:8080` (default).

**Current Status:** ShadCN UI migration complete through Phase 4. Professional UI components with dark/light theme system implemented. Ready for feature development.

## Essential Commands

### CLI Application (Java)
```bash
# Navigate to CLI directory
cd cli/

# Clean build and create executable JAR
mvn clean package

# Quick compile without tests
mvn clean compile

# Run all tests
mvn test

# Run directly with Maven during development
mvn compile exec:java -Dexec.mainClass="com.localtechsupport.cli.CliApplication" -Dexec.args="interactive"

# Interactive mode (recommended for development)
java -jar target/tech-support-cli.jar interactive

# Direct command mode
java -jar target/tech-support-cli.jar client-tickets
```

### Web Application (React)
```bash
# Navigate to webapp directory
cd webapp/

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Architecture Overview

### CLI Application (Java)
- **CliApplication.java**: Main entry point using PicoCLI for command routing
- **TechSupportApiClient.java**: HTTP client layer using OkHttp for REST API communication
- **ApiService.java**: Business logic layer providing complete CRUD operations
- **MenuManager.java**: Interactive menu system with navigation and lifecycle management

### Web Application (React) - ShadCN UI Migration Complete
- **Tech Stack**: React 19 + TypeScript + Vite + ShadCN UI + TanStack Query + Tailwind CSS
- **UI Framework**: ShadCN UI with Radix UI primitives (replaced Mantine UI)
- **Styling**: Tailwind CSS v4 with CSS variables and dark mode support
- **Theme System**: next-themes with system preference detection and manual switching
- **Layout System**: Card-based responsive layout with professional theming
- **API Layer**: Axios client with TanStack Query hooks for all entities
- **Testing**: Vitest + Testing Library + MSW for comprehensive testing
- **Type System**: Complete TypeScript definitions matching Java models

### Menu System Architecture
The application uses a hierarchical menu system with specialized menus:
- **MainMenu**: Root menu with system overview
- **ClientManagementMenu**: Client CRUD operations
- **TechnicianManagementMenu**: Technician CRUD operations
- **TicketManagementMenu**: Ticket CRUD and assignment
- **AppointmentManagementMenu**: Scheduling system
- **ReportsAnalyticsMenu**: Advanced analytics and reporting

### Data Flow
1. Commands enter through CliApplication (PicoCLI routing)
2. Menu commands launch MenuManager for interactive mode
3. Direct commands call specific Command classes
4. All data operations go through ApiService
5. ApiService uses TechSupportApiClient for HTTP communication
6. Results formatted by specialized formatters (JsonFormatter, ClientTicketsFormatter)

### Key Dependencies

#### CLI Application (Java)
- **PicoCLI**: Command-line interface framework
- **OkHttp**: HTTP client for API communication
- **Jackson**: JSON serialization/deserialization
- **JUnit 5 + Mockito + AssertJ**: Testing framework
- **MockWebServer**: HTTP mocking for tests
- **Logback**: Logging framework

#### Web Application (React)
- **ShadCN UI**: Component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework (v4 with CSS variables)
- **next-themes**: Theme management with system preference detection
- **TanStack Query**: Data fetching and caching
- **React Hook Form**: Form state management with Zod validation
- **Lucide React**: Modern icon library
- **Vite**: Build tool and development server

## Development Patterns

### Error Handling
- All API errors wrapped in `ApiException` with HTTP status codes
- Menu system provides user-friendly error messages
- Commands return exit codes (0 = success, 1 = error)

### Data Models
- All models are POJOs with Jackson annotations
- PagedResponse wrapper for API pagination
- Statistics models for reporting (FeedbackStatistics, TicketStatistics, etc.)

### Testing Strategy
- HTTP client tests use MockWebServer for realistic API simulation
- Model tests validate data structures and serialization
- 12 comprehensive unit tests for TechSupportApiClient covering success/error scenarios

### Code Organization
- `command/` - Direct CLI command implementations
- `menu/` - Interactive menu system (organized by domain)
- `client/` - HTTP communication layer
- `service/` - Business logic layer
- `model/` - Data transfer objects
- `formatter/` - Output formatting utilities
- `util/` - Shared utilities (validation, display, JSON formatting)

## Important Notes

### Server Dependency
- Requires Local Tech Support Server running on configured port (default: localhost:8080)
- All functionality depends on API availability
- Connection errors are gracefully handled with helpful messages

### Configuration
- Server URL configurable via `--server` flag
- Output format configurable via `--format` flag (json/table)
- Verbose logging available via `--verbose` flag

### Menu Navigation
- Use 'b' or 'back' to return to previous menu
- Use 'q' or 'quit' to exit application
- Use 'h' or 'help' for navigation assistance
- Breadcrumb navigation shows current menu path

### ALWAYS REMEMBER
- ShadCN UI migration is complete - use ShadCN components for all new development
- Work in appropriate directory (`cli/` for Java, `webapp/` for React)
- Follow clean git branching strategies
- Test both applications when making changes
- Use SHADCN_CONVERSION_TRACKER.md to understand completed migration work

### Current ShadCN UI Migration Status
- **✅ Phase 1 Complete**: Infrastructure setup (Tailwind CSS, ShadCN init, build system)
- **✅ Phase 2 Complete**: Core components (Button, Input, Select, Dialog, Badge, Alert)
- **✅ Phase 3 Complete**: Data display components (Table, Skeleton, Card) 
- **✅ Phase 4 Complete**: Theme provider system with dark/light mode switching
- **🚀 Ready for**: Feature development with professional ShadCN UI components

## Development Guidelines

### Task Completion
- Always end your task with a list of actions the user can use to manually test the changes
- Test both CLI and webapp when relevant
- Update documentation to reflect changes