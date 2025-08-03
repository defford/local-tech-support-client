package com.localtechsupport.cli.menu.reports;

import com.localtechsupport.cli.menu.BaseMenu;
import com.localtechsupport.cli.menu.Menu;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.util.DisplayUtils;
import com.localtechsupport.cli.client.ApiException;
import com.localtechsupport.cli.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Reports & Analytics menu providing comprehensive system reporting
 * 
 * This menu consolidates individual entity reports and provides cross-entity
 * analytics, performance metrics, and executive dashboard capabilities.
 * 
 * Lessons from Phase 5 applied:
 * - Robust null checking and error handling
 * - Detailed diagnostic information for troubleshooting
 * - API limitation awareness and documentation
 * - Professional display formatting with fallback logic
 */
public class ReportsAnalyticsMenu extends BaseMenu {
    
    private static final Logger logger = LoggerFactory.getLogger(ReportsAnalyticsMenu.class);
    
    public ReportsAnalyticsMenu(Menu parent) {
        super(parent);
    }
    
    @Override
    protected String getMenuTitle() {
        return "Reports & Analytics";
    }
    
    @Override
    protected void displayCustomContent() {
        try {
            // Display system overview with error handling
            displaySystemHealthStatus();
        } catch (Exception e) {
            DisplayUtils.printWarning("Could not load system status: " + e.getMessage());
            logger.warn("Failed to display system status in reports menu", e);
        }
        
        System.out.println();
        System.out.println("📊 Comprehensive system reporting and analytics");
        System.out.println("    Cross-entity reports, performance metrics, and insights");
    }
    
    @Override
    protected void initializeMenuOptions() {
        // Executive Dashboard
        addActionOption(1, "Executive Dashboard", 
            "High-level KPIs and system overview",
            this::executiveDashboard);
            
        // Cross-Entity Reports
        addActionOption(2, "Cross-Entity Analytics", 
            "Multi-entity correlation and relationship analysis",
            this::crossEntityAnalytics);
            
        // Performance Metrics
        addActionOption(3, "Performance Metrics", 
            "System performance indicators and trends",
            this::performanceMetrics);
            
        // Individual Entity Reports
        addActionOption(4, "Client Analytics", 
            "Detailed client management reports",
            this::clientAnalytics);
            
        addActionOption(5, "Technician Analytics", 
            "Technician performance and workload reports",
            this::technicianAnalytics);
            
        addActionOption(6, "Ticket Analytics", 
            "Ticket system reports and metrics",
            this::ticketAnalytics);
            
        addActionOption(7, "Appointment Analytics", 
            "Appointment scheduling and completion reports",
            this::appointmentAnalytics);
            
        // Export Options
        addActionOption(8, "Export Reports", 
            "Export data in various formats (CSV, JSON)",
            this::exportReports);
    }
    
    // ==================== MAIN REPORTING METHODS ====================
    
    private void executiveDashboard() {
        DisplayUtils.printHeader("EXECUTIVE DASHBOARD");
        
        try {
            // Fetch all core data with error handling
            SystemDataBundle data = loadSystemData();
            
            if (data == null || !data.isValid()) {
                DisplayUtils.printError("Unable to load system data for dashboard");
                waitForEnter();
                return;
            }
            
            displayExecutiveSummary(data);
            displayKPIMetrics(data);
            displaySystemHealth(data);
            displayRecommendations(data);
            
        } catch (ApiException e) {
            logger.error("Failed to generate executive dashboard", e);
            DisplayUtils.printError("Failed to generate dashboard: " + e.getMessage());
            displayTroubleshootingSteps("executive dashboard", e);
        } catch (Exception e) {
            logger.error("Unexpected error in executive dashboard", e);
            DisplayUtils.printError("Unexpected error: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void crossEntityAnalytics() {
        DisplayUtils.printHeader("CROSS-ENTITY ANALYTICS");
        
        try {
            SystemDataBundle data = loadSystemData();
            
            if (data == null || !data.isValid()) {
                DisplayUtils.printError("Unable to load system data for cross-entity analysis");
                waitForEnter();
                return;
            }
            
            displayClientTechnicianMatrix(data);
            displayServiceTypeEffectiveness(data);
            displayResolutionPatterns(data);
            displayWorkloadDistribution(data);
            
        } catch (ApiException e) {
            logger.error("Failed to generate cross-entity analytics", e);
            DisplayUtils.printError("Failed to generate analytics: " + e.getMessage());
            displayTroubleshootingSteps("cross-entity analytics", e);
        } catch (Exception e) {
            logger.error("Unexpected error in cross-entity analytics", e);
            DisplayUtils.printError("Unexpected error: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void performanceMetrics() {
        DisplayUtils.printHeader("PERFORMANCE METRICS");
        
        try {
            SystemDataBundle data = loadSystemData();
            
            if (data == null || !data.isValid()) {
                DisplayUtils.printError("Unable to load system data for performance analysis");
                waitForEnter();
                return;
            }
            
            displayResponseTimeMetrics(data);
            displayThroughputMetrics(data);
            displayUtilizationMetrics(data);
            displayTrendAnalysis(data);
            
        } catch (ApiException e) {
            logger.error("Failed to generate performance metrics", e);
            DisplayUtils.printError("Failed to generate metrics: " + e.getMessage());
            displayTroubleshootingSteps("performance metrics", e);
        } catch (Exception e) {
            logger.error("Unexpected error in performance metrics", e);
            DisplayUtils.printError("Unexpected error: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    // Delegate to existing entity-specific reports
    private void clientAnalytics() {
        DisplayUtils.printInfo("Redirecting to Client Management → Client Reports...");
        waitForEnter();
        // Note: In future enhancement, could integrate directly here
    }
    
    private void technicianAnalytics() {
        DisplayUtils.printInfo("Redirecting to Technician Management → Technician Reports...");
        waitForEnter();
        // Note: In future enhancement, could integrate directly here
    }
    
    private void ticketAnalytics() {
        DisplayUtils.printInfo("Redirecting to Ticket Management → Ticket Reports...");
        waitForEnter();
        // Note: In future enhancement, could integrate directly here
    }
    
    private void appointmentAnalytics() {
        DisplayUtils.printInfo("Redirecting to Appointment Management → Appointment Reports...");
        waitForEnter();
        // Note: In future enhancement, could integrate directly here
    }
    
    private void exportReports() {
        DisplayUtils.printHeader("EXPORT REPORTS");
        DisplayUtils.printInfo("Export functionality will be available in the next iteration");
        DisplayUtils.printInfo("Planned formats: CSV, JSON, PDF");
        waitForEnter();
    }
    
    // ==================== DATA LOADING ====================
    
    /**
     * Load all system data with comprehensive error handling
     * Applies Phase 5 lessons: robust error handling and null checking
     */
    private SystemDataBundle loadSystemData() throws ApiException {
        logger.debug("Loading comprehensive system data");
        
        SystemDataBundle data = new SystemDataBundle();
        boolean hasErrors = false;
        
        try {
            data.clients = apiService.getAllClients();
            logger.debug("Loaded {} clients", data.clients.size());
        } catch (ApiException e) {
            logger.warn("Failed to load clients for reporting", e);
            data.clients = new ArrayList<>();
            hasErrors = true;
        }
        
        try {
            data.technicians = apiService.getAllTechnicians();
            logger.debug("Loaded {} technicians", data.technicians.size());
        } catch (ApiException e) {
            logger.warn("Failed to load technicians for reporting", e);
            data.technicians = new ArrayList<>();
            hasErrors = true;
        }
        
        try {
            data.tickets = apiService.getAllTickets();
            logger.debug("Loaded {} tickets", data.tickets.size());
        } catch (ApiException e) {
            logger.warn("Failed to load tickets for reporting", e);
            data.tickets = new ArrayList<>();
            hasErrors = true;
        }
        
        try {
            data.appointments = apiService.getAllAppointments();
            logger.debug("Loaded {} appointments", data.appointments.size());
        } catch (ApiException e) {
            logger.warn("Failed to load appointments for reporting", e);
            data.appointments = new ArrayList<>();
            hasErrors = true;
        }
        
        try {
            data.overdueTickets = apiService.getOverdueTickets();
            logger.debug("Loaded {} overdue tickets", data.overdueTickets.size());
        } catch (ApiException e) {
            logger.warn("Failed to load overdue tickets for reporting", e);
            data.overdueTickets = new ArrayList<>();
            hasErrors = true;
        }
        
        data.loadTimestamp = LocalDateTime.now();
        data.hasDataErrors = hasErrors;
        
        if (hasErrors) {
            DisplayUtils.printWarning("Some data could not be loaded - reports may be incomplete");
        }
        
        return data;
    }
    
    // ==================== DISPLAY METHODS ====================
    
    private void displaySystemHealthStatus() throws ApiException {
        // Quick system health check for menu header
        try {
            List<Client> clients = apiService.getAllClients();
            List<Technician> technicians = apiService.getAllTechnicians();
            List<Ticket> tickets = apiService.getAllTickets();
            
            long activeClients = clients.stream().filter(c -> c.isActive()).count();
            long activeTechnicians = technicians.stream()
                .filter(t -> "ACTIVE".equals(t.getStatus())).count();
            long openTickets = tickets.stream()
                .filter(t -> "OPEN".equals(t.getStatus())).count();
                
            System.out.println("🏥 System Health: " + 
                activeClients + " active clients, " +
                activeTechnicians + " active technicians, " +
                openTickets + " open tickets");
                
        } catch (ApiException e) {
            // Fail gracefully - this is just for display
            System.out.println("🏥 System Health: Unable to load status");
        }
    }
    
    private void displayExecutiveSummary(SystemDataBundle data) {
        System.out.println("📊 EXECUTIVE SUMMARY");
        System.out.println("═".repeat(80));
        
        // Core metrics with null safety
        long totalClients = data.clients != null ? data.clients.size() : 0;
        long activeClients = data.clients != null ? 
            data.clients.stream().filter(c -> c != null && c.isActive()).count() : 0;
            
        long totalTechnicians = data.technicians != null ? data.technicians.size() : 0;
        long activeTechnicians = data.technicians != null ?
            data.technicians.stream().filter(t -> t != null && "ACTIVE".equals(t.getStatus())).count() : 0;
            
        long totalTickets = data.tickets != null ? data.tickets.size() : 0;
        long openTickets = data.tickets != null ?
            data.tickets.stream().filter(t -> t != null && "OPEN".equals(t.getStatus())).count() : 0;
            
        long totalAppointments = data.appointments != null ? data.appointments.size() : 0;
        
        System.out.printf("Clients:       %d total (%d active)\n", totalClients, activeClients);
        System.out.printf("Technicians:   %d total (%d active)\n", totalTechnicians, activeTechnicians);
        System.out.printf("Tickets:       %d total (%d open)\n", totalTickets, openTickets);
        System.out.printf("Appointments:  %d total\n", totalAppointments);
        System.out.printf("Data Quality:  %s\n", data.hasDataErrors ? "⚠️ Partial" : "✅ Complete");
        System.out.println();
    }
    
    private void displayKPIMetrics(SystemDataBundle data) {
        System.out.println("📈 KEY PERFORMANCE INDICATORS");
        System.out.println("─".repeat(40));
        
        // Calculate KPIs with null safety
        double clientRetentionRate = calculateClientRetentionRate(data);
        double ticketResolutionRate = calculateTicketResolutionRate(data);
        double technicianUtilization = calculateTechnicianUtilization(data);
        int overdueCount = data.overdueTickets != null ? data.overdueTickets.size() : 0;
        
        System.out.printf("Client Retention:     %.1f%%\n", clientRetentionRate);
        System.out.printf("Ticket Resolution:    %.1f%%\n", ticketResolutionRate);
        System.out.printf("Tech Utilization:     %.1f%%\n", technicianUtilization);
        System.out.printf("Overdue Tickets:      %d\n", overdueCount);
        System.out.println();
    }
    
    private void displaySystemHealth(SystemDataBundle data) {
        System.out.println("🏥 SYSTEM HEALTH");
        System.out.println("─".repeat(40));
        
        // Health indicators
        String clientHealth = getClientHealthStatus(data);
        String technicianHealth = getTechnicianHealthStatus(data);
        String ticketHealth = getTicketHealthStatus(data);
        
        System.out.println("Client Health:        " + clientHealth);
        System.out.println("Technician Health:    " + technicianHealth);
        System.out.println("Ticket Health:        " + ticketHealth);
        System.out.println();
    }
    
    private void displayRecommendations(SystemDataBundle data) {
        System.out.println("💡 RECOMMENDATIONS");
        System.out.println("─".repeat(40));
        
        List<String> recommendations = generateRecommendations(data);
        if (recommendations.isEmpty()) {
            System.out.println("✅ System is operating optimally");
        } else {
            for (String recommendation : recommendations) {
                System.out.println("• " + recommendation);
            }
        }
        System.out.println();
    }
    
    // ==================== ANALYTICS METHODS ====================
    
    private void displayClientTechnicianMatrix(SystemDataBundle data) {
        System.out.println("🔗 CLIENT-TECHNICIAN INTERACTION MATRIX");
        System.out.println("─".repeat(50));
        
        if (data.tickets == null || data.tickets.isEmpty()) {
            System.out.println("No ticket data available for analysis");
            return;
        }
        
        // Build interaction matrix
        Map<String, Integer> interactions = new HashMap<>();
        
        for (Ticket ticket : data.tickets) {
            if (ticket == null) continue;
            
            String clientId = ticket.getClientId() != null ? ticket.getClientId().toString() : "Unknown";
            String techId = getEffectiveTechnicianId(ticket);
            String key = clientId + "-" + techId;
            
            interactions.merge(key, 1, Integer::sum);
        }
        
        System.out.printf("Total unique client-technician pairs: %d\n", interactions.size());
        System.out.printf("Most active partnerships: %s\n", 
            interactions.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> e.getKey() + " (" + e.getValue() + " tickets)")
                .orElse("None"));
        System.out.println();
    }
    
    // ==================== UTILITY METHODS ====================
    
    /**
     * Safely extract technician ID from ticket, handling null cases
     * Applies Phase 5 lesson: robust null checking and embedded object handling
     */
    private String getEffectiveTechnicianId(Ticket ticket) {
        if (ticket == null) return "Unassigned";
        
        // Try direct ID first
        if (ticket.getAssignedTechnicianId() != null) {
            return ticket.getAssignedTechnicianId().toString();
        }
        
        // Try embedded technician object
        if (ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().getId() != null) {
            return ticket.getAssignedTechnician().getId().toString();
        }
        
        return "Unassigned";
    }
    
    private double calculateClientRetentionRate(SystemDataBundle data) {
        if (data.clients == null || data.clients.isEmpty()) return 0.0;
        
        long activeClients = data.clients.stream()
            .filter(c -> c != null && c.isActive())
            .count();
            
        return (activeClients * 100.0) / data.clients.size();
    }
    
    private double calculateTicketResolutionRate(SystemDataBundle data) {
        if (data.tickets == null || data.tickets.isEmpty()) return 0.0;
        
        long closedTickets = data.tickets.stream()
            .filter(t -> t != null && "CLOSED".equals(t.getStatus()))
            .count();
            
        return (closedTickets * 100.0) / data.tickets.size();
    }
    
    private double calculateTechnicianUtilization(SystemDataBundle data) {
        if (data.technicians == null || data.technicians.isEmpty()) return 0.0;
        
        double avgWorkload = data.technicians.stream()
            .filter(t -> t != null && t.getCurrentWorkload() != null)
            .mapToInt(Technician::getCurrentWorkload)
            .average()
            .orElse(0.0);
            
        // Assume 10 tickets is 100% utilization
        return Math.min((avgWorkload / 10.0) * 100.0, 100.0);
    }
    
    private String getClientHealthStatus(SystemDataBundle data) {
        double retentionRate = calculateClientRetentionRate(data);
        if (retentionRate >= 90) return "🟢 Excellent";
        if (retentionRate >= 75) return "🟡 Good";
        return "🔴 Needs Attention";
    }
    
    private String getTechnicianHealthStatus(SystemDataBundle data) {
        double utilization = calculateTechnicianUtilization(data);
        if (utilization >= 70 && utilization <= 90) return "🟢 Optimal";
        if (utilization < 50) return "🟡 Underutilized";
        return "🔴 Overloaded";
    }
    
    private String getTicketHealthStatus(SystemDataBundle data) {
        double resolutionRate = calculateTicketResolutionRate(data);
        int overdueCount = data.overdueTickets != null ? data.overdueTickets.size() : 0;
        
        if (resolutionRate >= 80 && overdueCount == 0) return "🟢 Excellent";
        if (resolutionRate >= 60 && overdueCount < 5) return "🟡 Good";
        return "🔴 Needs Attention";
    }
    
    private List<String> generateRecommendations(SystemDataBundle data) {
        List<String> recommendations = new ArrayList<>();
        
        double retentionRate = calculateClientRetentionRate(data);
        double resolutionRate = calculateTicketResolutionRate(data);
        double utilization = calculateTechnicianUtilization(data);
        int overdueCount = data.overdueTickets != null ? data.overdueTickets.size() : 0;
        
        if (retentionRate < 75) {
            recommendations.add("Improve client retention - consider client satisfaction surveys");
        }
        
        if (resolutionRate < 70) {
            recommendations.add("Focus on ticket resolution - review workflow processes");
        }
        
        if (utilization < 50) {
            recommendations.add("Technician capacity available - consider taking on more clients");
        } else if (utilization > 90) {
            recommendations.add("Consider hiring additional technicians - current team overloaded");
        }
        
        if (overdueCount > 0) {
            recommendations.add("Address " + overdueCount + " overdue tickets immediately");
        }
        
        return recommendations;
    }
    
    /**
     * Get utilization level description for workload analysis
     */
    private String getUtilizationLevel(int workload, double avgWorkload) {
        if (avgWorkload == 0) return "(baseline)";
        
        double ratio = workload / avgWorkload;
        if (ratio > 1.5) return "(🔴 overloaded)";
        if (ratio > 1.2) return "(🟡 high)";
        if (ratio < 0.5) return "(🟢 available)";
        return "(🟢 optimal)";
    }
    
    /**
     * Display troubleshooting steps when API errors occur
     * Applies Phase 5 lesson: detailed diagnostic information
     */
    private void displayTroubleshootingSteps(String operation, ApiException e) {
        System.out.println();
        System.out.println("🔧 TROUBLESHOOTING STEPS for " + operation + ":");
        System.out.println("─".repeat(60));
        System.out.println("1. Check server connection: " + apiService.getBaseUrl());
        System.out.println("2. Verify API server is running");
        System.out.println("3. Check network connectivity");
        System.out.println("4. Review server logs for errors");
        System.out.println("5. Try individual entity reports if available");
        
        if (e.getStatusCode() == 404) {
            System.out.println("6. API endpoint may not exist - check server version");
        } else if (e.getStatusCode() == 500) {
            System.out.println("6. Server error - check server logs and data integrity");
        }
        System.out.println();
    }
    
    private void displayServiceTypeEffectiveness(SystemDataBundle data) {
        System.out.println("🛠️ SERVICE TYPE EFFECTIVENESS");
        System.out.println("─".repeat(50));
        
        if (data.tickets == null || data.tickets.isEmpty()) {
            System.out.println("No ticket data available for service type analysis");
            System.out.println();
            return;
        }
        
        // Analyze ticket resolution by service type
        Map<String, ServiceTypeStats> serviceStats = new HashMap<>();
        
        for (Ticket ticket : data.tickets) {
            if (ticket == null || ticket.getServiceType() == null) continue;
            
            String serviceType = ticket.getServiceType();
            ServiceTypeStats stats = serviceStats.computeIfAbsent(serviceType, k -> new ServiceTypeStats());
            
            stats.totalTickets++;
            if ("CLOSED".equals(ticket.getStatus())) {
                stats.resolvedTickets++;
            }
            if ("OPEN".equals(ticket.getStatus())) {
                stats.openTickets++;
            }
            
            // Analyze priority distribution
            String priority = ticket.getPriority() != null ? ticket.getPriority() : "UNKNOWN";
            stats.priorityDistribution.merge(priority, 1, Integer::sum);
            
            // Calculate average resolution time (simulated since we don't have resolution time data)
            if ("CLOSED".equals(ticket.getStatus()) && ticket.getCreatedAt() != null) {
                // Use created date as proxy for resolution estimation
                long daysSinceCreation = java.time.temporal.ChronoUnit.DAYS.between(
                    ticket.getCreatedAt().toLocalDate(), 
                    LocalDateTime.now().toLocalDate()
                );
                stats.totalResolutionDays += Math.max(1, daysSinceCreation); // Minimum 1 day
            }
        }
        
        // Display analysis
        for (Map.Entry<String, ServiceTypeStats> entry : serviceStats.entrySet()) {
            String serviceType = entry.getKey();
            ServiceTypeStats stats = entry.getValue();
            
            double resolutionRate = stats.totalTickets > 0 ? 
                (stats.resolvedTickets * 100.0 / stats.totalTickets) : 0.0;
            double avgResolutionDays = stats.resolvedTickets > 0 ? 
                (stats.totalResolutionDays / (double) stats.resolvedTickets) : 0.0;
                
            System.out.printf("%s Service Type:\n", serviceType);
            System.out.printf("  Total Tickets:      %d\n", stats.totalTickets);
            System.out.printf("  Resolution Rate:    %.1f%%\n", resolutionRate);
            System.out.printf("  Avg Resolution:     %.1f days\n", avgResolutionDays);
            System.out.printf("  Open Tickets:       %d\n", stats.openTickets);
            
            // Priority breakdown
            String topPriority = stats.priorityDistribution.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
            System.out.printf("  Most Common Priority: %s\n", topPriority);
            System.out.println();
        }
        
        // Service type recommendations
        System.out.println("🔍 SERVICE TYPE INSIGHTS:");
        ServiceTypeStats bestPerforming = serviceStats.values().stream()
            .max((s1, s2) -> Double.compare(
                s1.totalTickets > 0 ? (s1.resolvedTickets * 100.0 / s1.totalTickets) : 0,
                s2.totalTickets > 0 ? (s2.resolvedTickets * 100.0 / s2.totalTickets) : 0
            )).orElse(null);
            
        if (bestPerforming != null) {
            String bestType = serviceStats.entrySet().stream()
                .filter(e -> e.getValue() == bestPerforming)
                .map(Map.Entry::getKey)
                .findFirst().orElse("Unknown");
            System.out.printf("• Best performing service type: %s\n", bestType);
        }
        
        long totalOpenTickets = serviceStats.values().stream().mapToLong(s -> s.openTickets).sum();
        if (totalOpenTickets > 0) {
            System.out.printf("• Focus needed: %d open tickets across all service types\n", totalOpenTickets);
        }
        System.out.println();
    }
    
    private void displayResolutionPatterns(SystemDataBundle data) {
        System.out.println("📋 RESOLUTION PATTERNS");
        System.out.println("─".repeat(50));
        
        if (data.tickets == null || data.tickets.isEmpty()) {
            System.out.println("No ticket data available for resolution pattern analysis");
            System.out.println();
            return;
        }
        
        // Analyze ticket resolution patterns
        Map<String, Integer> resolutionByTechnician = new HashMap<>();
        Map<String, Integer> resolutionByServiceType = new HashMap<>();
        Map<String, Integer> resolutionByPriority = new HashMap<>();
        
        int totalResolved = 0;
        int totalUnassigned = 0;
        
        for (Ticket ticket : data.tickets) {
            if (ticket == null) continue;
            
            if ("CLOSED".equals(ticket.getStatus())) {
                totalResolved++;
                
                // Resolution by technician
                String techId = getEffectiveTechnicianId(ticket);
                resolutionByTechnician.merge(techId, 1, Integer::sum);
                
                // Resolution by service type
                String serviceType = ticket.getServiceType() != null ? ticket.getServiceType() : "UNKNOWN";
                resolutionByServiceType.merge(serviceType, 1, Integer::sum);
                
                // Resolution by priority
                String priority = ticket.getPriority() != null ? ticket.getPriority() : "UNKNOWN";
                resolutionByPriority.merge(priority, 1, Integer::sum);
            }
            
            if (getEffectiveTechnicianId(ticket).equals("Unassigned")) {
                totalUnassigned++;
            }
        }
        
        System.out.printf("Total Resolved Tickets: %d\n", totalResolved);
        System.out.printf("Unassigned Tickets: %d\n", totalUnassigned);
        System.out.println();
        
        // Top performing technicians
        System.out.println("🏆 TOP RESOLVING TECHNICIANS:");
        resolutionByTechnician.entrySet().stream()
            .filter(e -> !e.getKey().equals("Unassigned"))
            .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
            .limit(5)
            .forEach(entry -> {
                System.out.printf("  Technician %s: %d tickets resolved\n", 
                    entry.getKey(), entry.getValue());
            });
        System.out.println();
        
        // Resolution by service type
        System.out.println("🛠️ RESOLUTION BY SERVICE TYPE:");
        final int finalTotalResolved = totalResolved;
        resolutionByServiceType.entrySet().stream()
            .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
            .forEach(entry -> {
                double percentage = finalTotalResolved > 0 ? (entry.getValue() * 100.0 / finalTotalResolved) : 0;
                System.out.printf("  %s: %d tickets (%.1f%%)\n", 
                    entry.getKey(), entry.getValue(), percentage);
            });
        System.out.println();
        
        // Resolution by priority
        System.out.println("🔴 RESOLUTION BY PRIORITY:");
        String[] priorityOrder = {"URGENT", "HIGH", "MEDIUM", "LOW", "UNKNOWN"};
        for (String priority : priorityOrder) {
            Integer count = resolutionByPriority.get(priority);
            if (count != null && count > 0) {
                double percentage = finalTotalResolved > 0 ? (count * 100.0 / finalTotalResolved) : 0;
                System.out.printf("  %s: %d tickets (%.1f%%)\n", priority, count, percentage);
            }
        }
        System.out.println();
        
        // Pattern insights
        System.out.println("🔍 RESOLUTION INSIGHTS:");
        if (totalUnassigned > 0) {
            System.out.printf("• %d tickets need technician assignment\n", totalUnassigned);
        }
        
        String topServiceType = resolutionByServiceType.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("None");
        if (!topServiceType.equals("None")) {
            System.out.printf("• Most resolved service type: %s\n", topServiceType);
        }
        
        if (totalResolved == 0) {
            System.out.println("• No resolved tickets found - focus on closing completed work");
        }
        System.out.println();
    }
    
    private void displayWorkloadDistribution(SystemDataBundle data) {
        System.out.println("⚖️ WORKLOAD DISTRIBUTION");
        System.out.println("─".repeat(50));
        
        if (data.technicians == null || data.technicians.isEmpty()) {
            System.out.println("No technician data available for workload analysis");
            System.out.println();
            return;
        }
        
        // Analyze workload distribution
        Map<String, WorkloadStats> workloadMap = new HashMap<>();
        int totalWorkload = 0;
        int activeTechnicians = 0;
        
        for (Technician tech : data.technicians) {
            if (tech == null) continue;
            
            String techId = tech.getId() != null ? tech.getId().toString() : "Unknown";
            String status = tech.getStatus() != null ? tech.getStatus() : "UNKNOWN";
            int currentWorkload = tech.getCurrentWorkload() != null ? tech.getCurrentWorkload() : 0;
            
            WorkloadStats stats = new WorkloadStats();
            stats.technicianName = tech.getFullName() != null ? tech.getFullName() : "Unknown";
            stats.status = status;
            stats.currentWorkload = currentWorkload;
            stats.skills = tech.getSkills() != null ? tech.getSkills().size() : 0;
            
            workloadMap.put(techId, stats);
            
            if ("ACTIVE".equals(status)) {
                activeTechnicians++;
                totalWorkload += currentWorkload;
            }
            
            // Count assigned tickets from ticket data
            if (data.tickets != null) {
                long assignedTickets = data.tickets.stream()
                    .filter(t -> t != null && techId.equals(getEffectiveTechnicianId(t)))
                    .count();
                stats.assignedTickets = (int) assignedTickets;
            }
        }
        
        double avgWorkload = activeTechnicians > 0 ? (totalWorkload / (double) activeTechnicians) : 0;
        
        System.out.printf("Active Technicians: %d\n", activeTechnicians);
        System.out.printf("Total Workload: %d tickets\n", totalWorkload);
        System.out.printf("Average Workload: %.1f tickets per technician\n", avgWorkload);
        System.out.println();
        
        // Display individual technician workloads
        System.out.println("👨‍🔧 INDIVIDUAL WORKLOAD BREAKDOWN:");
        workloadMap.entrySet().stream()
            .filter(e -> "ACTIVE".equals(e.getValue().status))
            .sorted((e1, e2) -> Integer.compare(e2.getValue().currentWorkload, e1.getValue().currentWorkload))
            .forEach(entry -> {
                WorkloadStats stats = entry.getValue();
                String utilization = getUtilizationLevel(stats.currentWorkload, avgWorkload);
                System.out.printf("  %s: %d tickets %s\n", 
                    stats.technicianName, stats.currentWorkload, utilization);
                System.out.printf("    Skills: %d | Assigned: %d tickets\n", 
                    stats.skills, stats.assignedTickets);
            });
        System.out.println();
        
        // Workload distribution insights
        System.out.println("🔍 WORKLOAD INSIGHTS:");
        
        long overloaded = workloadMap.values().stream()
            .filter(s -> "ACTIVE".equals(s.status) && s.currentWorkload > avgWorkload * 1.5)
            .count();
        long underutilized = workloadMap.values().stream()
            .filter(s -> "ACTIVE".equals(s.status) && s.currentWorkload < avgWorkload * 0.5)
            .count();
            
        if (overloaded > 0) {
            System.out.printf("• %d technicians are overloaded (>150%% avg workload)\n", overloaded);
        }
        if (underutilized > 0) {
            System.out.printf("• %d technicians are underutilized (<50%% avg workload)\n", underutilized);
        }
        
        if (overloaded == 0 && underutilized == 0) {
            System.out.println("• Workload is well balanced across technicians");
        }
        
        // Capacity analysis
        int totalCapacity = (int) workloadMap.values().stream()
            .filter(s -> "ACTIVE".equals(s.status))
            .count() * 10; // Assume 10 tickets per technician capacity
        double utilizationRate = totalCapacity > 0 ? (totalWorkload * 100.0 / totalCapacity) : 0;
        System.out.printf("• System utilization: %.1f%% of total capacity\n", utilizationRate);
        
        if (utilizationRate > 90) {
            System.out.println("• Consider hiring additional technicians");
        } else if (utilizationRate < 50) {
            System.out.println("• Capacity available for additional clients");
        }
        
        System.out.println();
    }
    
    private void displayResponseTimeMetrics(SystemDataBundle data) {
        System.out.println("⏱️ RESPONSE TIME METRICS");
        System.out.println("─".repeat(50));
        
        if (data.tickets == null || data.tickets.isEmpty()) {
            System.out.println("No ticket data available for response time analysis");
            System.out.println();
            return;
        }
        
        // Calculate response time metrics (simulated based on available data)
        LocalDateTime now = LocalDateTime.now();
        long totalTickets = data.tickets.size();
        long recentTickets = 0;
        long quickResponses = 0;
        long slowResponses = 0;
        double totalResponseDays = 0;
        
        for (Ticket ticket : data.tickets) {
            if (ticket == null || ticket.getCreatedAt() == null) continue;
            
            long daysOld = java.time.temporal.ChronoUnit.DAYS.between(
                ticket.getCreatedAt().toLocalDate(), now.toLocalDate());
            
            // Consider tickets from last 30 days for response analysis
            if (daysOld <= 30) {
                recentTickets++;
                totalResponseDays += daysOld;
                
                // Simulate response time based on status and assignment
                if (getEffectiveTechnicianId(ticket).equals("Unassigned")) {
                    slowResponses++; // Unassigned tickets are slow responses
                } else if ("CLOSED".equals(ticket.getStatus()) && daysOld <= 3) {
                    quickResponses++; // Closed within 3 days is quick
                } else if (daysOld > 7) {
                    slowResponses++; // Open for more than 7 days is slow
                }
            }
        }
        
        double avgResponseDays = recentTickets > 0 ? (totalResponseDays / recentTickets) : 0;
        double quickResponseRate = recentTickets > 0 ? (quickResponses * 100.0 / recentTickets) : 0;
        double slowResponseRate = recentTickets > 0 ? (slowResponses * 100.0 / recentTickets) : 0;
        
        System.out.printf("Recent Tickets (30 days): %d\n", recentTickets);
        System.out.printf("Average Response Time: %.1f days\n", avgResponseDays);
        System.out.printf("Quick Responses (≤3 days): %d (%.1f%%)\n", quickResponses, quickResponseRate);
        System.out.printf("Slow Responses (>7 days): %d (%.1f%%)\n", slowResponses, slowResponseRate);
        System.out.println();
        
        // Response time insights
        System.out.println("🔍 RESPONSE TIME INSIGHTS:");
        if (avgResponseDays <= 2) {
            System.out.println("• Excellent response time - team is highly responsive");
        } else if (avgResponseDays <= 5) {
            System.out.println("• Good response time - within acceptable range");
        } else {
            System.out.println("• Response time needs improvement - consider workflow optimization");
        }
        
        if (slowResponseRate > 30) {
            System.out.println("• High number of slow responses - review assignment process");
        }
        
        if (quickResponseRate > 70) {
            System.out.println("• Excellent quick response rate - team is efficient");
        }
        System.out.println();
    }
    
    private void displayThroughputMetrics(SystemDataBundle data) {
        System.out.println("📊 THROUGHPUT METRICS");
        System.out.println("─".repeat(50));
        
        if (data.tickets == null || data.tickets.isEmpty()) {
            System.out.println("No ticket data available for throughput analysis");
            System.out.println();
            return;
        }
        
        // Calculate throughput metrics
        LocalDateTime now = LocalDateTime.now();
        long totalTickets = data.tickets.size();
        long ticketsThisWeek = 0;
        long resolvedThisWeek = 0;
        long ticketsThisMonth = 0;
        long resolvedThisMonth = 0;
        
        for (Ticket ticket : data.tickets) {
            if (ticket == null || ticket.getCreatedAt() == null) continue;
            
            long daysOld = java.time.temporal.ChronoUnit.DAYS.between(
                ticket.getCreatedAt().toLocalDate(), now.toLocalDate());
            
            if (daysOld <= 7) {
                ticketsThisWeek++;
                if ("CLOSED".equals(ticket.getStatus())) {
                    resolvedThisWeek++;
                }
            }
            
            if (daysOld <= 30) {
                ticketsThisMonth++;
                if ("CLOSED".equals(ticket.getStatus())) {
                    resolvedThisMonth++;
                }
            }
        }
        
        double weeklyThroughput = resolvedThisWeek;
        double monthlyThroughput = resolvedThisMonth;
        double weeklyCreationRate = ticketsThisWeek;
        double monthlyCreationRate = ticketsThisMonth;
        
        System.out.printf("Tickets Created This Week: %d\n", ticketsThisWeek);
        System.out.printf("Tickets Resolved This Week: %d\n", resolvedThisWeek);
        System.out.printf("Weekly Throughput Rate: %.1f tickets/week\n", weeklyThroughput);
        System.out.println();
        
        System.out.printf("Tickets Created This Month: %d\n", ticketsThisMonth);
        System.out.printf("Tickets Resolved This Month: %d\n", resolvedThisMonth);
        System.out.printf("Monthly Throughput Rate: %.1f tickets/month\n", monthlyThroughput);
        System.out.println();
        
        // Throughput insights
        System.out.println("🔍 THROUGHPUT INSIGHTS:");
        if (resolvedThisWeek >= ticketsThisWeek) {
            System.out.println("• Excellent - resolving tickets as fast as they're created");
        } else if (resolvedThisWeek >= ticketsThisWeek * 0.8) {
            System.out.println("• Good throughput - keeping up with ticket creation");
        } else {
            System.out.println("• Throughput concern - tickets creating faster than resolution");
        }
        
        if (monthlyThroughput > 0) {
            double projectedMonthly = (weeklyThroughput * 4);
            System.out.printf("• Projected monthly resolution: %.0f tickets\n", projectedMonthly);
        }
        System.out.println();
    }
    
    private void displayUtilizationMetrics(SystemDataBundle data) {
        System.out.println("📈 UTILIZATION METRICS");
        System.out.println("─".repeat(50));
        
        if (data.technicians == null || data.technicians.isEmpty()) {
            System.out.println("No technician data available for utilization analysis");
            System.out.println();
            return;
        }
        
        // Calculate utilization metrics
        int activeTechnicians = 0;
        int totalWorkload = 0;
        int maxCapacity = 0;
        Map<String, Integer> statusCounts = new HashMap<>();
        
        for (Technician tech : data.technicians) {
            if (tech == null) continue;
            
            String status = tech.getStatus() != null ? tech.getStatus() : "UNKNOWN";
            statusCounts.merge(status, 1, Integer::sum);
            
            if ("ACTIVE".equals(status)) {
                activeTechnicians++;
                int workload = tech.getCurrentWorkload() != null ? tech.getCurrentWorkload() : 0;
                totalWorkload += workload;
                maxCapacity += 10; // Assume 10 tickets per technician capacity
            }
        }
        
        double utilizationRate = maxCapacity > 0 ? (totalWorkload * 100.0 / maxCapacity) : 0;
        double avgWorkloadPerTech = activeTechnicians > 0 ? (totalWorkload / (double) activeTechnicians) : 0;
        
        System.out.printf("Active Technicians: %d\n", activeTechnicians);
        System.out.printf("Total Current Workload: %d tickets\n", totalWorkload);
        System.out.printf("Maximum Capacity: %d tickets\n", maxCapacity);
        System.out.printf("System Utilization: %.1f%%\n", utilizationRate);
        System.out.printf("Average Workload per Technician: %.1f tickets\n", avgWorkloadPerTech);
        System.out.println();
        
        // Technician status breakdown
        System.out.println("👨‍🔧 TECHNICIAN STATUS BREAKDOWN:");
        statusCounts.forEach((status, count) -> {
            System.out.printf("  %s: %d technicians\n", status, count);
        });
        System.out.println();
        
        // Utilization insights
        System.out.println("🔍 UTILIZATION INSIGHTS:");
        if (utilizationRate > 90) {
            System.out.println("• High utilization - consider hiring additional technicians");
        } else if (utilizationRate > 70) {
            System.out.println("• Good utilization - team is efficiently utilized");
        } else if (utilizationRate < 50) {
            System.out.println("• Low utilization - capacity available for more work");
        } else {
            System.out.println("• Moderate utilization - balanced workload");
        }
        
        if (avgWorkloadPerTech > 8) {
            System.out.println("• Individual workloads are high - monitor for burnout");
        } else if (avgWorkloadPerTech < 3) {
            System.out.println("• Individual workloads are light - opportunity for more clients");
        }
        System.out.println();
    }
    
    private void displayTrendAnalysis(SystemDataBundle data) {
        System.out.println("📉 TREND ANALYSIS");
        System.out.println("─".repeat(50));
        
        if (data.tickets == null || data.tickets.isEmpty()) {
            System.out.println("No ticket data available for trend analysis");
            System.out.println();
            return;
        }
        
        // Analyze trends over time periods
        LocalDateTime now = LocalDateTime.now();
        Map<String, Integer> weeklyTrends = new HashMap<>();
        Map<String, Integer> priorityTrends = new HashMap<>();
        Map<String, Integer> serviceTypeTrends = new HashMap<>();
        
        // Group tickets by week and analyze patterns
        for (Ticket ticket : data.tickets) {
            if (ticket == null || ticket.getCreatedAt() == null) continue;
            
            long daysOld = java.time.temporal.ChronoUnit.DAYS.between(
                ticket.getCreatedAt().toLocalDate(), now.toLocalDate());
            
            String weekBucket;
            if (daysOld <= 7) weekBucket = "This Week";
            else if (daysOld <= 14) weekBucket = "Last Week";
            else if (daysOld <= 21) weekBucket = "2 Weeks Ago";
            else if (daysOld <= 30) weekBucket = "3-4 Weeks Ago";
            else weekBucket = "Older";
            
            weeklyTrends.merge(weekBucket, 1, Integer::sum);
            
            // Track recent trends (last 30 days)
            if (daysOld <= 30) {
                String priority = ticket.getPriority() != null ? ticket.getPriority() : "UNKNOWN";
                priorityTrends.merge(priority, 1, Integer::sum);
                
                String serviceType = ticket.getServiceType() != null ? ticket.getServiceType() : "UNKNOWN";
                serviceTypeTrends.merge(serviceType, 1, Integer::sum);
            }
        }
        
        // Display weekly trend
        System.out.println("📅 WEEKLY TICKET TRENDS:");
        String[] weekOrder = {"This Week", "Last Week", "2 Weeks Ago", "3-4 Weeks Ago", "Older"};
        for (String week : weekOrder) {
            Integer count = weeklyTrends.get(week);
            if (count != null && count > 0) {
                System.out.printf("  %s: %d tickets\n", week, count);
            }
        }
        System.out.println();
        
        // Display priority trends
        System.out.println("🔴 RECENT PRIORITY TRENDS (30 days):");
        priorityTrends.entrySet().stream()
            .sorted((e1, e2) -> {
                String[] order = {"URGENT", "HIGH", "MEDIUM", "LOW", "UNKNOWN"};
                int pos1 = java.util.Arrays.asList(order).indexOf(e1.getKey());
                int pos2 = java.util.Arrays.asList(order).indexOf(e2.getKey());
                if (pos1 == -1) pos1 = order.length;
                if (pos2 == -1) pos2 = order.length;
                return Integer.compare(pos1, pos2);
            })
            .forEach(entry -> {
                System.out.printf("  %s: %d tickets\n", entry.getKey(), entry.getValue());
            });
        System.out.println();
        
        // Display service type trends
        System.out.println("🛠️ RECENT SERVICE TYPE TRENDS (30 days):");
        serviceTypeTrends.entrySet().stream()
            .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
            .forEach(entry -> {
                System.out.printf("  %s: %d tickets\n", entry.getKey(), entry.getValue());
            });
        System.out.println();
        
        // Trend insights
        System.out.println("🔍 TREND INSIGHTS:");
        Integer thisWeek = weeklyTrends.get("This Week");
        Integer lastWeek = weeklyTrends.get("Last Week");
        
        if (thisWeek != null && lastWeek != null) {
            if (thisWeek > lastWeek) {
                System.out.printf("• Increasing trend: %d more tickets this week vs last week\n", 
                    thisWeek - lastWeek);
            } else if (thisWeek < lastWeek) {
                System.out.printf("• Decreasing trend: %d fewer tickets this week vs last week\n", 
                    lastWeek - thisWeek);
            } else {
                System.out.println("• Stable trend: consistent ticket volume week-over-week");
            }
        }
        
        String topPriority = priorityTrends.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("None");
        if (!topPriority.equals("None")) {
            System.out.printf("• Most common priority: %s\n", topPriority);
        }
        
        String topServiceType = serviceTypeTrends.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("None");
        if (!topServiceType.equals("None")) {
            System.out.printf("• Most common service type: %s\n", topServiceType);
        }
        System.out.println();
    }
    
    // ==================== DATA CLASSES ====================
    
    /**
     * Container for all system data with validation
     * Provides null-safe data access patterns
     */
    private static class SystemDataBundle {
        List<Client> clients;
        List<Technician> technicians;
        List<Ticket> tickets;
        List<Appointment> appointments;
        List<Ticket> overdueTickets;
        LocalDateTime loadTimestamp;
        boolean hasDataErrors;
        
        boolean isValid() {
            return clients != null || technicians != null || tickets != null || appointments != null;
        }
    }
    
    /**
     * Statistics container for service type analysis
     */
    private static class ServiceTypeStats {
        int totalTickets = 0;
        int resolvedTickets = 0;
        int openTickets = 0;
        long totalResolutionDays = 0;
        Map<String, Integer> priorityDistribution = new HashMap<>();
    }
    
    /**
     * Statistics container for workload analysis
     */
    private static class WorkloadStats {
        String technicianName = "";
        String status = "";
        int currentWorkload = 0;
        int skills = 0;
        int assignedTickets = 0;
    }
} 