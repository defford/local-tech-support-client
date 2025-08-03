# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Java 17 Maven-based CLI application for the Local Tech Support System. It provides both interactive menu-driven access and direct command execution for complete system management, integrating with a REST API backend running on `localhost:8080` (default).

## Essential Commands

### Build and Package
```bash
# Clean build and create executable JAR
mvn clean package

# Quick compile without tests
mvn clean compile

# Run directly with Maven during development
mvn compile exec:java -Dexec.mainClass="com.localtechsupport.cli.CliApplication" -Dexec.args="interactive"
```

### Testing
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=TechSupportApiClientTest

# Run tests with coverage report
mvn test jacoco:report

# View coverage report at: target/site/jacoco/index.html
```

### Application Execution
```bash
# Interactive mode (recommended for development)
java -jar target/tech-support-cli.jar interactive

# Direct command mode
java -jar target/tech-support-cli.jar client-tickets
java -jar target/tech-support-cli.jar overdue-tickets
java -jar target/tech-support-cli.jar --server http://localhost:8080 technician-workload
```

## Architecture Overview

### Core Components
- **CliApplication.java**: Main entry point using PicoCLI for command routing
- **TechSupportApiClient.java**: HTTP client layer using OkHttp for REST API communication
- **ApiService.java**: Business logic layer providing complete CRUD operations
- **MenuManager.java**: Interactive menu system with navigation and lifecycle management

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
- **PicoCLI**: Command-line interface framework
- **OkHttp**: HTTP client for API communication
- **Jackson**: JSON serialization/deserialization
- **JUnit 5 + Mockito + AssertJ**: Testing framework
- **MockWebServer**: HTTP mocking for tests
- **Logback**: Logging framework

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
- Follow the REACT_MIGRATION_PLAN.md
- Follow clean git branching strategies

## Development Guidelines

### Task Completion
- Always end your task with a list of actions the user can use to manually test the changes.