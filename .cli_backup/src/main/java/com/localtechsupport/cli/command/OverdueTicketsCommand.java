package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.Ticket;
import com.localtechsupport.cli.client.ApiException;
import com.localtechsupport.cli.util.JsonFormatter;
import picocli.CommandLine.Command;
import picocli.CommandLine.ParentCommand;
import picocli.CommandLine.Option;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

/**
 * Command to display overdue tickets
 * 
 * This command answers the question: "Which tickets are overdue?"
 * It fetches all overdue tickets from the API and displays them with priority information.
 */
@Command(
    name = "overdue-tickets",
    description = "Show tickets that are past their due date",
    mixinStandardHelpOptions = true
)
public class OverdueTicketsCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(OverdueTicketsCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Option(
        names = {"-t", "--service-type"},
        description = "Filter by service type (HARDWARE, SOFTWARE, NETWORK)"
    )
    private String serviceType;

    @Option(
        names = {"--sort-by"},
        description = "Sort by: dueAt, createdAt (default: dueAt)",
        defaultValue = "dueAt"
    )
    private String sortBy;

    @Override
    public Integer call() {
        logger.info("Executing overdue-tickets command");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            String outputFormat = parent.getOutputFormat();
            boolean verbose = parent.isVerbose();
            
            if (verbose) {
                System.out.println("🔍 Connecting to server: " + serverUrl);
                System.out.println("⚠️  Fetching overdue tickets...");
            }

            // Create API service and fetch data
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Test connection first
                if (!apiService.testConnection()) {
                    System.err.println("❌ Cannot connect to server: " + serverUrl);
                    System.err.println("   Please check that the Local Tech Support Server is running.");
                    return 1;
                }

                // Fetch overdue tickets
                List<Ticket> overdueTickets = fetchOverdueTickets(apiService, verbose);
                
                if (verbose) {
                    System.out.println("✅ Successfully fetched " + overdueTickets.size() + " overdue tickets");
                }

                // Format and display output
                String output = formatOutput(overdueTickets, outputFormat, serverUrl);
                System.out.println(output);
                
                logger.info("Overdue tickets command completed successfully");
                return 0;

            } catch (ApiException e) {
                logger.error("API error in overdue-tickets command: {}", e.getMessage());
                
                System.err.println("❌ API Error: " + e.getUserFriendlyMessage());
                
                if (verbose) {
                    System.err.println("   Status Code: " + e.getStatusCode());
                    System.err.println("   Server: " + serverUrl);
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Unexpected error in overdue-tickets command: {}", e.getMessage(), e);
            
            System.err.println("❌ Unexpected error: " + e.getMessage());
            
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            
            return 1;
        }
    }

    /**
     * Fetch and filter overdue tickets
     */
    private List<Ticket> fetchOverdueTickets(ApiService apiService, boolean verbose) throws ApiException {
        List<Ticket> overdueTickets = apiService.getOverdueTickets();
        
        // Apply filters
        if (serviceType != null && !serviceType.equals("__no_default_value__") && !serviceType.equals("_NULL_")) {
            overdueTickets = overdueTickets.stream()
                .filter(t -> serviceType.equalsIgnoreCase(t.getServiceType()))
                .collect(Collectors.toList());
        }
        
        // Apply sorting
        switch (sortBy.toLowerCase()) {
            case "createdAt":
                overdueTickets = overdueTickets.stream()
                    .sorted((t1, t2) -> t1.getCreatedAt().compareTo(t2.getCreatedAt()))
                    .collect(Collectors.toList());
                break;
            case "dueAt":
            default:
                overdueTickets = overdueTickets.stream()
                    .sorted((t1, t2) -> t1.getDueAt().compareTo(t2.getDueAt()))
                    .collect(Collectors.toList());
                break;
        }
        
        if (verbose && !overdueTickets.isEmpty()) {
            System.out.println("🔍 Applied filters - found " + overdueTickets.size() + " matching tickets");
        }
        
        return overdueTickets;
    }

    /**
     * Format the output based on the requested format
     */
    private String formatOutput(List<Ticket> overdueTickets, String format, String serverUrl) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        switch (format.toLowerCase()) {
            case "json":
                return JsonFormatter.withMetadata(
                    "Overdue Tickets Report", 
                    overdueTickets, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
                return formatAsTable(overdueTickets, serverUrl, timestamp);
                
            default:
                // Default to JSON
                return JsonFormatter.withHeader("Overdue Tickets Report", 
                                              JsonFormatter.toPrettyJsonString(overdueTickets));
        }
    }

    /**
     * Format as a readable table
     */
    private String formatAsTable(List<Ticket> overdueTickets, String serverUrl, String timestamp) {
        StringBuilder output = new StringBuilder();
        
        // Header
        output.append("=".repeat(100)).append("\n");
        output.append("⚠️  OVERDUE TICKETS REPORT").append("\n");
        output.append("=".repeat(100)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append(String.format("Sort Order: %s", sortBy)).append("\n");
        
        // Add filters info if applied
        if (serviceType != null && !serviceType.equals("__no_default_value__") && !serviceType.equals("_NULL_")) {
            output.append(String.format("Filter: Service Type = %s", serviceType)).append("\n");
        }
        
        output.append("-".repeat(100)).append("\n\n");
        
        if (overdueTickets.isEmpty()) {
            output.append("🎉 No overdue tickets found! All tickets are on schedule.\n\n");
            return output.toString();
        }
        
        // Summary statistics
        output.append(String.format("📊 Total Overdue Tickets: %d\n", overdueTickets.size()));
        
        // Service type breakdown
        Map<String, Long> serviceBreakdown = overdueTickets.stream()
            .collect(Collectors.groupingBy(Ticket::getServiceType, Collectors.counting()));
            
        output.append("Service Type Breakdown: ");
        serviceBreakdown.forEach((type, count) -> {
            output.append(String.format("%s:%d ", type, count));
        });
        output.append("\n\n");
        
        // Individual ticket details
        output.append("📋 Ticket Details:\n");
        output.append("-".repeat(100)).append("\n");
        output.append(String.format("%-8s %-40s %-10s %-12s %s\n", 
            "ID", "Description", "Service", "Overdue By", "Client"));
        output.append("-".repeat(100)).append("\n");
        
        for (Ticket ticket : overdueTickets) {
            String overdueBy = getOverdueDuration(ticket.getDueAt());
            String clientInfo = ticket.getClient() != null ? 
                ticket.getClient().getFullName() : 
                "Client #" + ticket.getClientId();
            
            // Use description since title is often null from server
            String description = ticket.getDescription();
            if (description == null || description.trim().isEmpty()) {
                description = ticket.getTitle() != null ? ticket.getTitle() : "No description";
            }
            if (description.length() > 35) {
                description = description.substring(0, 32) + "...";
            }
            
            output.append(String.format("%-8d %-40s %-10s %-12s %s\n",
                ticket.getId(),
                description,
                ticket.getServiceType(),
                overdueBy,
                clientInfo
            ));
        }
        
        output.append("-".repeat(100)).append("\n");
        
        // Recommendations
        if (overdueTickets.size() > 5) {
            output.append("\n💡 Recommendations:\n");
            output.append("   • Focus on URGENT and HIGH priority tickets first\n");
            output.append("   • Consider reassigning tickets to available technicians\n");
            output.append("   • Review SLA definitions if overdue tickets are recurring\n");
        }
        
        return output.toString();
    }
    
    /**
     * Calculate how long a ticket has been overdue
     */
    private String getOverdueDuration(LocalDateTime dueAt) {
        if (dueAt == null) return "N/A";
        
        Duration duration = Duration.between(dueAt, LocalDateTime.now());
        long hours = duration.toHours();
        long days = duration.toDays();
        
        if (days > 0) {
            return String.format("%dd %dh", days, hours % 24);
        } else {
            return String.format("%dh", hours);
        }
    }
} 