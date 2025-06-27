# 🖥️ Local Tech Support CLI Client

A comprehensive command-line interface for the Local Tech Support System API, providing both interactive menu-driven access and direct command execution for complete system management.

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Local Tech Support Server running on `localhost:8080` (default)

### Build and Run
```bash
# Clone and build
git clone <repository-url>
cd local-tech-support-cli
mvn clean package

# Run the CLI - Interactive Mode (Recommended)
java -jar target/tech-support-cli.jar interactive

# Or use Maven directly
mvn compile exec:java -Dexec.mainClass="com.localtechsupport.cli.CliApplication" -Dexec.args="interactive"

# Direct command execution
java -jar target/tech-support-cli.jar client-tickets
java -jar target/tech-support-cli.jar overdue-tickets
```

## 🎯 Features Overview

### Interactive Menu System
The CLI provides a comprehensive menu-driven interface with full CRUD (Create, Read, Update, Delete) operations:

- **🖥️ Interactive Mode**: Full-featured menu system with navigation breadcrumbs
- **👥 Client Management**: Complete client lifecycle management
- **🔧 Technician Management**: Technician profiles, skills, and availability
- **🎫 Ticket Management**: Support ticket creation, assignment, and tracking
- **📅 Appointment Management**: Scheduling and appointment lifecycle management
- **📊 Reports & Analytics**: Comprehensive reporting and data visualization
- **📋 Quick Data Access**: Direct access to core reporting commands

### Direct Command Access
8 core business intelligence commands for immediate data access:

```bash
tech-support-cli client-tickets                 # Client ticket summaries
tech-support-cli overdue-tickets               # Overdue ticket analysis
tech-support-cli technician-workload           # Technician assignment overview
tech-support-cli available-technicians         # Service type availability
tech-support-cli technician-schedule           # Appointment schedules
tech-support-cli client-appointments           # Client appointment history
tech-support-cli client-technician-history     # Service relationship analysis
tech-support-cli technician-feedback           # Performance ratings
```

## 🔧 Development

### Project Structure
```
src/
├── main/java/com/localtechsupport/cli/
│   ├── CliApplication.java              # Main entry point & command routing
│   ├── client/                          # HTTP client layer
│   │   ├── TechSupportApiClient.java    # REST client implementation
│   │   ├── ApiResponse.java             # Response wrapper
│   │   └── ApiException.java            # Exception handling
│   ├── service/                         # Business logic layer
│   │   └── ApiService.java              # Complete CRUD operations service
│   ├── command/                         # Direct command implementations
│   │   ├── InteractiveMenuCommand.java  # Menu system launcher
│   │   ├── ClientTicketsCommand.java    # Client ticket reporting
│   │   ├── OverdueTicketsCommand.java   # Overdue analysis
│   │   ├── TechnicianWorkloadCommand.java # Workload distribution
│   │   ├── AvailableTechniciansCommand.java # Service availability
│   │   ├── TechnicianScheduleCommand.java # Schedule management
│   │   ├── ClientAppointmentsCommand.java # Appointment history
│   │   ├── ClientTechnicianHistoryCommand.java # Service relationships
│   │   └── TechnicianFeedbackCommand.java # Performance metrics
│   ├── menu/                            # Interactive menu system
│   │   ├── MenuManager.java             # Navigation & lifecycle management
│   │   ├── BaseMenu.java                # Abstract menu foundation
│   │   ├── main/MainMenu.java           # Root menu with system overview
│   │   ├── client/ClientManagementMenu.java # Client CRUD operations
│   │   ├── technician/TechnicianManagementMenu.java # Technician CRUD
│   │   ├── ticket/TicketManagementMenu.java # Ticket CRUD & assignment
│   │   ├── appointment/AppointmentManagementMenu.java # Scheduling system
│   │   └── reports/ReportsAnalyticsMenu.java # Advanced analytics
│   ├── model/                           # Data models (DTOs)
│   │   ├── Client.java                  # Client entity model
│   │   ├── Technician.java              # Technician entity model
│   │   ├── Ticket.java                  # Support ticket model
│   │   ├── Appointment.java             # Appointment model
│   │   ├── FeedbackStatistics.java     # Performance metrics
│   │   ├── TicketStatistics.java       # System health metrics
│   │   ├── TechnicianStatistics.java   # Workforce analytics
│   │   ├── SkillCoverage.java           # Skill gap analysis
│   │   └── PagedResponse.java           # Pagination wrapper
│   ├── formatter/                       # Output formatting
│   │   └── ClientTicketsFormatter.java # Specialized formatters
│   └── util/                           # Utility classes
│       ├── DisplayUtils.java           # Console display utilities
│       ├── InputValidator.java         # Input validation
│       └── JsonFormatter.java          # JSON output formatting
└── test/java/                          # Comprehensive test suite
    ├── client/TechSupportApiClientTest.java # HTTP client tests
    └── model/                          # Model validation tests
```

### Running Tests
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=TechSupportApiClientTest

# Run tests with coverage report
mvn test jacoco:report

# View test results
cat target/surefire-reports/*.txt
```

**Test Coverage:**
- **TechSupportApiClient**: 12 comprehensive unit tests covering HTTP communication, error handling, and resource management
- **Model Validation**: Unit tests for data models with validation scenarios
- **Test Framework**: JUnit 5 with AssertJ assertions and OkHttp MockWebServer
- **Categories**: Constructor tests, API success scenarios, error handling, connection testing, and resource cleanup

### Building Distribution
```bash
mvn clean package
# Creates: target/tech-support-cli.jar (uber jar with all dependencies)
```

### CI/CD Pipeline
The project includes a comprehensive GitHub Actions workflow (`.github/workflows/ci.yml`) that:

- **Builds & Tests**: Compiles code and runs all unit tests on every push/PR
- **Test Reporting**: Generates detailed JUnit test reports
- **Artifact Management**: Packages and uploads JAR files for easy distribution
- **Security Scanning**: Runs Trivy security analysis and uploads results to GitHub Security tab
- **Quality Gates**: Ensures all tests pass before allowing merges

## 📋 Complete Feature Set

### Client Management
- **View All Clients**: Paginated client listings with status indicators
- **Search Clients**: Find clients by name, email, or phone number
- **Client Details**: Complete client profiles with ticket history
- **Create/Edit Clients**: Full client information management
- **Account Status**: Activate/suspend client accounts
- **Delete Clients**: Safe client removal with confirmation
- **Client Analytics**: Client-specific reporting and statistics

### Technician Management
- **Technician Profiles**: Complete technician information management
- **Skill Management**: Technical skill assignment and tracking
- **Schedule Management**: Availability and appointment scheduling
- **Performance Tracking**: Feedback and rating analysis
- **Workload Distribution**: Assignment balancing and optimization
- **Status Management**: Active/inactive technician status

### Ticket Management
- **Ticket Creation**: Support request initiation with service type classification
- **Assignment System**: Intelligent technician assignment based on skills and availability
- **Status Tracking**: Complete ticket lifecycle management (OPEN → IN_PROGRESS → RESOLVED)
- **Priority Management**: Ticket prioritization and SLA tracking
- **Update & Comments**: Ticket modification and communication history
- **Overdue Analysis**: SLA violation identification and reporting

### Appointment Management
- **Schedule Creation**: Appointment scheduling with conflict detection
- **Availability Checking**: Real-time technician availability verification
- **Status Management**: Complete appointment lifecycle (PENDING → CONFIRMED → COMPLETED)
- **Appointment Updates**: Rescheduling and modification capabilities
- **Completion Tracking**: Service completion documentation
- **No-Show Handling**: Appointment cancellation and no-show management

### Reports & Analytics
- **Executive Dashboard**: High-level KPIs and system overview
- **Cross-Entity Analytics**: Multi-entity correlation and relationship analysis
- **Performance Metrics**: System performance indicators and trends
- **Individual Entity Reports**: Detailed analytics for clients, technicians, tickets, and appointments
- **Export Capabilities**: Data export in CSV and JSON formats

## 🐛 Troubleshooting

### Connection Issues
```
❌ Cannot connect to server: http://localhost:8080
   Please check that the Local Tech Support Server is running.
```
**Solution**: Ensure the Local Tech Support Server is running on the specified port.

### API Errors
```
❌ API Error: Resource not found
```
**Solution**: Verify the server API endpoints are available and the server version is compatible.

### Java Version Issues
```
Error: LinkageError occurred while loading main class
```
**Solution**: Ensure you're using Java 17 or higher:
```bash
java -version
```

### Menu Navigation Issues
- Use **'b'** or **'back'** to return to previous menu
- Use **'q'** or **'quit'** to exit the application
- Use **'h'** or **'help'** for navigation assistance

## 📝 API Endpoints Integration

The CLI client integrates with comprehensive REST API endpoints:

### Core Data Endpoints
- `GET/POST/PUT/DELETE /api/clients` - Complete client management
- `GET/POST/PUT/DELETE /api/technicians` - Technician lifecycle management
- `GET/POST/PUT/DELETE /api/tickets` - Support ticket operations
- `GET/POST/PUT/DELETE /api/appointments` - Appointment scheduling

### Specialized Operations
- `POST /api/tickets/{id}/assign` - Technician assignment
- `PUT /api/appointments/{id}/status` - Status updates
- `POST /api/appointments/{id}/complete` - Completion handling
- `GET /api/appointments/availability` - Availability checking

### Analytics & Reporting
- `GET /api/tickets/statistics` - System health metrics
- `GET /api/technicians/statistics` - Workforce analytics
- `GET /api/feedback/statistics` - Customer satisfaction metrics
- `GET /api/skills/coverage` - Skill gap analysis

### Query Parameters
- `?clientId=X` - Filter by client
- `?technicianId=X` - Filter by technician
- `?serviceType=SOFTWARE` - Filter by service type
- `?status=OPEN` - Filter by status

## 🎨 Usage Examples

### Interactive Mode (Recommended)
```bash
# Launch full interactive experience
java -jar target/tech-support-cli.jar interactive

# Navigate through menus:
# 1. Client Management → 1. View All Clients
# 2. Technician Management → 3. View Technician Details
# 5. Reports & Analytics → 1. Executive Dashboard
```

### Direct Command Mode
```bash
# Get immediate insights
java -jar target/tech-support-cli.jar client-tickets
java -jar target/tech-support-cli.jar --server http://remote-server:8080 overdue-tickets
java -jar target/tech-support-cli.jar --format table technician-workload
```

### Configuration Options
```bash
# Server configuration
--server, -s    API server URL (default: http://localhost:8080)

# Output options
--format, -f    Output format: json, table (default: json)
--verbose, -v   Enable verbose output for debugging

# Help and version
--help, -h      Show command help
--version       Show application version
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is part of the Local Tech Support System and follows the same licensing terms.

---

*Built with ☕ Java 17, Maven, OkHttp, Jackson, PicoCLI, and comprehensive testing with JUnit 5*
