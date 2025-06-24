package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.TicketStatistics;
import com.localtechsupport.cli.client.ApiException;
import com.localtechsupport.cli.util.JsonFormatter;
import picocli.CommandLine.Command;
import picocli.CommandLine.ParentCommand;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.Callable;

/**
 * Command to display system health and ticket statistics
 * 
 * This command fetches ticket statistics from the API and displays
 * them in the requested format (JSON or table).
 */
@Command(
    name = "system-health",
    description = "Display system health dashboard with ticket statistics",
    mixinStandardHelpOptions = true
)
public class SystemHealthCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(SystemHealthCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Override
    public Integer call() {
        logger.info("Executing system-health command");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            String outputFormat = parent.getOutputFormat();
            boolean verbose = parent.isVerbose();
            
            if (verbose) {
                System.out.println("🔍 Connecting to server: " + serverUrl);
                System.out.println("📋 Fetching ticket statistics...");
            }

            // Create API service and fetch data
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Test connection first
                if (!apiService.testConnection()) {
                    System.err.println("❌ Cannot connect to server: " + serverUrl);
                    System.err.println("   Please check that the Local Tech Support Server is running.");
                    return 1;
                }

                // Fetch ticket statistics
                TicketStatistics stats = apiService.getTicketStatistics();
                
                if (verbose) {
                    System.out.println("✅ Successfully fetched ticket statistics");
                }

                // Format and display output
                String output = formatOutput(stats, outputFormat, serverUrl);
                System.out.println(output);
                
                logger.info("System health command completed successfully");
                return 0;

            } catch (ApiException e) {
                logger.error("API error in system-health command: {}", e.getMessage());
                
                System.err.println("❌ API Error: " + e.getUserFriendlyMessage());
                
                if (verbose) {
                    System.err.println("   Status Code: " + e.getStatusCode());
                    System.err.println("   Server: " + serverUrl);
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Unexpected error in system-health command: {}", e.getMessage(), e);
            
            System.err.println("❌ Unexpected error: " + e.getMessage());
            
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            
            return 1;
        }
    }

    /**
     * Format the ticket statistics output based on the requested format
     * 
     * @param stats the ticket statistics data
     * @param format the output format (json or table)
     * @param serverUrl the server URL for metadata
     * @return formatted output string
     */
    private String formatOutput(TicketStatistics stats, String format, String serverUrl) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        switch (format.toLowerCase()) {
            case "json":
                return JsonFormatter.withMetadata(
                    "System Health Dashboard", 
                    stats, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
                return formatAsTable(stats, serverUrl, timestamp);
                
            default:
                // Default to JSON
                return JsonFormatter.withHeader("System Health Dashboard", 
                                              JsonFormatter.toPrettyJsonString(stats));
        }
    }

    /**
     * Format ticket statistics as a readable table
     * 
     * @param stats the ticket statistics
     * @param serverUrl the server URL
     * @param timestamp the timestamp
     * @return formatted table output
     */
    private String formatAsTable(TicketStatistics stats, String serverUrl, String timestamp) {
        StringBuilder output = new StringBuilder();
        
        // Header
        output.append("=".repeat(60)).append("\n");
        output.append("🏥 SYSTEM HEALTH DASHBOARD").append("\n");
        output.append("=".repeat(60)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append("-".repeat(60)).append("\n\n");
        
        // Ticket Overview
        output.append("📋 Ticket Overview:\n");
        output.append(String.format("   Total Tickets: %d\n", 
                                    stats.getTotalTickets() != null ? stats.getTotalTickets() : 0));
        output.append(String.format("   Open Tickets: %d (%.1f%%)\n", 
                                    stats.getOpenTickets() != null ? stats.getOpenTickets() : 0,
                                    stats.getOpenTicketPercentage()));
        output.append(String.format("   In Progress: %d\n", 
                                    stats.getInProgressTickets() != null ? stats.getInProgressTickets() : 0));
        output.append(String.format("   Resolved: %d (%.1f%%)\n", 
                                    stats.getResolvedTickets() != null ? stats.getResolvedTickets() : 0,
                                    stats.getResolvedTicketPercentage()));
        output.append(String.format("   Closed: %d\n\n", 
                                    stats.getClosedTickets() != null ? stats.getClosedTickets() : 0));
        
        // Performance Metrics
        output.append("⚡ Performance Metrics:\n");
        output.append(String.format("   Avg Resolution Time: %.1f hours\n", 
                                    stats.getAverageResolutionTimeHours() != null ? stats.getAverageResolutionTimeHours() : 0.0));
        output.append(String.format("   Resolved Today: %d\n", 
                                    stats.getTicketsResolvedToday() != null ? stats.getTicketsResolvedToday() : 0));
        output.append(String.format("   System Load: %s %s\n\n", 
                                    getLoadEmoji(stats.getSystemLoadLevel()),
                                    stats.getSystemLoadLevel()));
        
        // Status Distribution
        if (stats.getTicketsByStatus() != null && !stats.getTicketsByStatus().isEmpty()) {
            output.append("📊 Status Distribution:\n");
            stats.getTicketsByStatus().forEach((status, count) -> {
                double percentage = stats.getTotalTickets() != null && stats.getTotalTickets() > 0 
                    ? (double) count / stats.getTotalTickets() * 100 
                    : 0.0;
                output.append(String.format("   %-12s: %3d (%5.1f%%)\n", status, count, percentage));
            });
            output.append("\n");
        }
        
        // Recommendations
        output.append("🎯 System Health Status: ").append(getHealthStatusMessage(stats)).append("\n");
        
        return output.toString();
    }

    /**
     * Get emoji for system load level
     */
    private String getLoadEmoji(String loadLevel) {
        return switch (loadLevel) {
            case "LOW" -> "🟢";
            case "MEDIUM" -> "🟡";
            case "HIGH" -> "🔴";
            default -> "❓";
        };
    }

    /**
     * Get system health status message
     */
    private String getHealthStatusMessage(TicketStatistics stats) {
        String loadLevel = stats.getSystemLoadLevel();
        double resolvedPercentage = stats.getResolvedTicketPercentage();
        
        if ("LOW".equals(loadLevel) && resolvedPercentage > 70) {
            return "🟢 EXCELLENT - System running smoothly";
        } else if ("MEDIUM".equals(loadLevel) && resolvedPercentage > 60) {
            return "🟡 GOOD - Monitor workload distribution";
        } else if ("HIGH".equals(loadLevel)) {
            return "🔴 ATTENTION NEEDED - High ticket backlog";
        } else {
            return "🟠 REVIEW REQUIRED - Check resolution processes";
        }
    }
} 