package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.TechnicianStatistics;
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
 * Command to display technician performance analytics and workforce metrics
 * 
 * This command fetches technician statistics from the API and displays
 * comprehensive workforce analytics in the requested format.
 */
@Command(
    name = "technician-stats",
    description = "Show technician performance analytics and workforce metrics",
    mixinStandardHelpOptions = true
)
public class TechnicianStatsCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(TechnicianStatsCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Override
    public Integer call() {
        logger.info("Executing technician-stats command");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            String outputFormat = parent.getOutputFormat();
            boolean verbose = parent.isVerbose();
            
            if (verbose) {
                System.out.println("🔍 Connecting to server: " + serverUrl);
                System.out.println("👥 Fetching technician analytics...");
            }

            // Create API service and fetch data
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Test connection first
                if (!apiService.testConnection()) {
                    System.err.println("❌ Cannot connect to server: " + serverUrl);
                    System.err.println("   Please check that the Local Tech Support Server is running.");
                    return 1;
                }

                // Fetch technician statistics
                TechnicianStatistics stats = apiService.getTechnicianStatistics();
                
                if (verbose) {
                    System.out.println("✅ Successfully fetched technician analytics");
                }

                // Format and display output
                String output = formatOutput(stats, outputFormat, serverUrl);
                System.out.println(output);
                
                logger.info("Technician stats command completed successfully");
                return 0;

            } catch (ApiException e) {
                logger.error("API error in technician-stats command: {}", e.getMessage());
                
                System.err.println("❌ API Error: " + e.getUserFriendlyMessage());
                
                if (verbose) {
                    System.err.println("   Status Code: " + e.getStatusCode());
                    System.err.println("   Server: " + serverUrl);
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Unexpected error in technician-stats command: {}", e.getMessage(), e);
            
            System.err.println("❌ Unexpected error: " + e.getMessage());
            
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            
            return 1;
        }
    }

    /**
     * Format the technician statistics output based on the requested format
     * 
     * @param stats the technician statistics data
     * @param format the output format (json or table)
     * @param serverUrl the server URL for metadata
     * @return formatted output string
     */
    private String formatOutput(TechnicianStatistics stats, String format, String serverUrl) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        switch (format.toLowerCase()) {
            case "json":
                return JsonFormatter.withMetadata(
                    "Technician Performance Analytics", 
                    stats, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
                return formatAsTable(stats, serverUrl, timestamp);
                
            default:
                // Default to JSON
                return JsonFormatter.withHeader("Technician Performance Analytics", 
                                              JsonFormatter.toPrettyJsonString(stats));
        }
    }

    /**
     * Format technician statistics as a readable table
     * 
     * @param stats the technician statistics
     * @param serverUrl the server URL
     * @param timestamp the timestamp
     * @return formatted table output
     */
    private String formatAsTable(TechnicianStatistics stats, String serverUrl, String timestamp) {
        StringBuilder output = new StringBuilder();
        
        // Header
        output.append("=".repeat(60)).append("\n");
        output.append("👥 TECHNICIAN PERFORMANCE ANALYTICS").append("\n");
        output.append("=".repeat(60)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append("-".repeat(60)).append("\n\n");
        
        // Workforce Overview
        output.append("📊 Workforce Overview:\n");
        output.append(String.format("   Total Technicians: %d\n", 
                                    stats.getTotalTechnicians() != null ? stats.getTotalTechnicians() : 0));
        output.append(String.format("   Active: %d (%.1f%%)\n", 
                                    stats.getActiveTechnicians() != null ? stats.getActiveTechnicians() : 0,
                                    stats.getActivePercentage()));
        output.append(String.format("   Inactive: %d\n", 
                                    stats.getInactiveTechnicians() != null ? stats.getInactiveTechnicians() : 0));
        output.append(String.format("   Terminated: %d\n\n", 
                                    stats.getTerminatedTechnicians() != null ? stats.getTerminatedTechnicians() : 0));
        
        // Performance Metrics
        output.append("⚡ Performance Metrics:\n");
        output.append(String.format("   Average Workload: %.1f tickets/technician\n", 
                                    stats.getAverageWorkload() != null ? stats.getAverageWorkload() : 0.0));
        output.append(String.format("   Utilization Rate: %.1f%% (%s)\n", 
                                    stats.getUtilizationRate() != null ? stats.getUtilizationRate() * 100 : 0.0,
                                    stats.getUtilizationLevel()));
        
        if (stats.getTopPerformerName() != null) {
            output.append(String.format("   Top Performer: %s (%d tickets)\n", 
                                        stats.getTopPerformerName(),
                                        stats.getTopPerformerTicketCount() != null ? stats.getTopPerformerTicketCount() : 0));
        }
        
        output.append(String.format("   Skill Coverage: %.1f%%\n\n", 
                                    stats.getSkillCoverageOverall() != null ? stats.getSkillCoverageOverall() : 0.0));
        
        // Status Distribution
        if (stats.getTechniciansByStatus() != null && !stats.getTechniciansByStatus().isEmpty()) {
            output.append("📈 Status Distribution:\n");
            stats.getTechniciansByStatus().forEach((status, count) -> {
                double percentage = stats.getTotalTechnicians() != null && stats.getTotalTechnicians() > 0 
                    ? (double) count / stats.getTotalTechnicians() * 100 
                    : 0.0;
                output.append(String.format("   %-12s: %3d (%5.1f%%)\n", status, count, percentage));
            });
            output.append("\n");
        }
        
        // Workload Distribution
        if (stats.getWorkloadDistribution() != null && !stats.getWorkloadDistribution().isEmpty()) {
            output.append("📋 Workload Distribution:\n");
            stats.getWorkloadDistribution().forEach((range, count) -> {
                output.append(String.format("   %-15s: %d technicians\n", range, count));
            });
            output.append("\n");
        }
        
        // Workforce Assessment
        output.append("🎯 Workforce Status: ").append(getWorkforceStatusMessage(stats)).append("\n");
        
        return output.toString();
    }

    /**
     * Get workforce status message with recommendations
     */
    private String getWorkforceStatusMessage(TechnicianStatistics stats) {
        String workforceStatus = stats.getWorkforceStatus();
        String utilizationLevel = stats.getUtilizationLevel();
        
        if ("EXCELLENT".equals(workforceStatus) && "OPTIMAL".equals(utilizationLevel)) {
            return "🟢 EXCELLENT - Workforce operating at peak efficiency";
        } else if ("GOOD".equals(workforceStatus) && ("OPTIMAL".equals(utilizationLevel) || "HIGH".equals(utilizationLevel))) {
            return "🟡 GOOD - Strong performance, monitor workload balance";
        } else if ("FAIR".equals(workforceStatus)) {
            return "🟠 ATTENTION NEEDED - Review staffing levels and assignments";
        } else if ("NEEDS_ATTENTION".equals(workforceStatus)) {
            return "🔴 CRITICAL - Immediate workforce planning required";
        } else if ("LOW".equals(utilizationLevel)) {
            return "🟡 UNDERUTILIZED - Consider redistribution of work";
        } else {
            return "🟠 REVIEW REQUIRED - Assess workforce efficiency";
        }
    }
} 