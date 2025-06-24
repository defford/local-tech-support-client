package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.SkillCoverage;
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
 * Command to analyze skill coverage, gaps, and training needs
 * 
 * This command fetches skill coverage analysis from the API and displays
 * comprehensive skill gap analysis and recommendations in the requested format.
 */
@Command(
    name = "skill-coverage",
    description = "Analyze skill coverage, gaps, and training needs",
    mixinStandardHelpOptions = true
)
public class SkillCoverageCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(SkillCoverageCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Override
    public Integer call() {
        logger.info("Executing skill-coverage command");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            String outputFormat = parent.getOutputFormat();
            boolean verbose = parent.isVerbose();
            
            if (verbose) {
                System.out.println("🔍 Connecting to server: " + serverUrl);
                System.out.println("🎯 Fetching skill coverage analysis...");
            }

            // Create API service and fetch data
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Test connection first
                if (!apiService.testConnection()) {
                    System.err.println("❌ Cannot connect to server: " + serverUrl);
                    System.err.println("   Please check that the Local Tech Support Server is running.");
                    return 1;
                }

                // Fetch skill coverage analysis
                SkillCoverage coverage = apiService.getSkillCoverage();
                
                if (verbose) {
                    System.out.println("✅ Successfully fetched skill coverage analysis");
                }

                // Format and display output
                String output = formatOutput(coverage, outputFormat, serverUrl);
                System.out.println(output);
                
                logger.info("Skill coverage command completed successfully");
                return 0;

            } catch (ApiException e) {
                logger.error("API error in skill-coverage command: {}", e.getMessage());
                
                System.err.println("❌ API Error: " + e.getUserFriendlyMessage());
                
                if (verbose) {
                    System.err.println("   Status Code: " + e.getStatusCode());
                    System.err.println("   Server: " + serverUrl);
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Unexpected error in skill-coverage command: {}", e.getMessage(), e);
            
            System.err.println("❌ Unexpected error: " + e.getMessage());
            
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            
            return 1;
        }
    }

    /**
     * Format the skill coverage output based on the requested format
     * 
     * @param coverage the skill coverage data
     * @param format the output format (json or table)
     * @param serverUrl the server URL for metadata
     * @return formatted output string
     */
    private String formatOutput(SkillCoverage coverage, String format, String serverUrl) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        switch (format.toLowerCase()) {
            case "json":
                return JsonFormatter.withMetadata(
                    "Skill Coverage Analysis", 
                    coverage, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
                return formatAsTable(coverage, serverUrl, timestamp);
                
            default:
                // Default to JSON
                return JsonFormatter.withHeader("Skill Coverage Analysis", 
                                              JsonFormatter.toPrettyJsonString(coverage));
        }
    }

    /**
     * Format skill coverage as a readable table
     * 
     * @param coverage the skill coverage data
     * @param serverUrl the server URL
     * @param timestamp the timestamp
     * @return formatted table output
     */
    private String formatAsTable(SkillCoverage coverage, String serverUrl, String timestamp) {
        StringBuilder output = new StringBuilder();
        
        // Header
        output.append("=".repeat(70)).append("\n");
        output.append("🎯 SKILL COVERAGE ANALYSIS").append("\n");
        output.append("=".repeat(70)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append("-".repeat(70)).append("\n\n");
        
        // Overall Coverage
        output.append("📊 Overall Coverage: ");
        if (coverage.getOverallCoveragePercentage() != null) {
            output.append(String.format("%.1f%% %s (%s)", 
                                      coverage.getOverallCoveragePercentage(),
                                      coverage.getCoverageEmoji(),
                                      coverage.getCoverageStatus()));
        } else {
            output.append("N/A");
        }
        output.append("\n\n");
        
        // Coverage Summary
        output.append("📈 Coverage Summary:\n");
        output.append(String.format("   Total Skills Tracked: %d\n", 
                                    coverage.getTotalSkills() != null ? coverage.getTotalSkills() : 0));
        output.append(String.format("   Critical Gaps: %d %s\n", 
                                    coverage.getCriticalGapCount(),
                                    coverage.hasCriticalGaps() ? "⚠️" : "✅"));
        output.append("\n");
        
        // Skills by Service Type
        if (coverage.getSkillsByServiceType() != null && !coverage.getSkillsByServiceType().isEmpty()) {
            output.append("🔧 Skills by Service Type:\n");
            output.append("┌─────────────────┬────────────┬─────────┬──────────┐\n");
            output.append("│ Service Type    │ Technicians│ Coverage│ Status   │\n");
            output.append("├─────────────────┼────────────┼─────────┼──────────┤\n");
            
            coverage.getSkillsByServiceType().forEach((serviceType, skillInfo) -> {
                String statusEmoji = getStatusEmoji(skillInfo.getStatus());
                output.append(String.format("│ %-15s │ %10d │ %6.1f%% │ %s %-6s │\n",
                                           serviceType.length() > 15 ? serviceType.substring(0, 15) : serviceType,
                                           skillInfo.getTechnicianCount() != null ? skillInfo.getTechnicianCount() : 0,
                                           skillInfo.getCoveragePercentage() != null ? skillInfo.getCoveragePercentage() : 0.0,
                                           statusEmoji,
                                           skillInfo.getStatus() != null ? skillInfo.getStatus() : "UNKNOWN"));
            });
            
            output.append("└─────────────────┴────────────┴─────────┴──────────┘\n\n");
        }
        
        // Critical Gaps
        if (coverage.hasCriticalGaps()) {
            output.append("🚨 Critical Skill Gaps:\n");
            coverage.getCriticalGaps().forEach(gap -> {
                output.append(String.format("   • %s\n", gap));
            });
            output.append("\n");
        }
        
        // Training Needs
        if (coverage.getTrainingNeeds() != null && !coverage.getTrainingNeeds().isEmpty()) {
            output.append("📚 Training Needs Assessment:\n");
            coverage.getTrainingNeeds().entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue())) // Sort by priority (highest first)
                .forEach(entry -> {
                    String priority = getPriorityLevel(entry.getValue());
                    output.append(String.format("   %-20s: %s Priority (%d)\n", 
                                                entry.getKey(), 
                                                priority,
                                                entry.getValue()));
                });
            output.append("\n");
        }
        
        // Recommendations
        if (coverage.getRecommendations() != null && !coverage.getRecommendations().isEmpty()) {
            output.append("💡 Recommendations:\n");
            coverage.getRecommendations().forEach(recommendation -> {
                output.append(String.format("   • %s\n", recommendation));
            });
            output.append("\n");
        }
        
        // Redundant Skills
        if (coverage.getRedundantSkills() != null && !coverage.getRedundantSkills().isEmpty()) {
            output.append("🔄 Redundant Skills (Consider Reallocation):\n");
            coverage.getRedundantSkills().forEach(skill -> {
                output.append(String.format("   • %s\n", skill));
            });
            output.append("\n");
        }
        
        // Overall Assessment
        output.append("🎯 Coverage Assessment: ").append(getCoverageAssessmentMessage(coverage)).append("\n");
        
        return output.toString();
    }

    /**
     * Get status emoji for skill status
     */
    private String getStatusEmoji(String status) {
        if (status == null) return "❓";
        
        return switch (status.toUpperCase()) {
            case "EXCELLENT", "GOOD" -> "🟢";
            case "ADEQUATE", "MEDIUM" -> "🟡";
            case "LOW", "POOR" -> "🟠";
            case "CRITICAL", "RISK" -> "🔴";
            default -> "❓";
        };
    }

    /**
     * Get priority level description
     */
    private String getPriorityLevel(Integer priority) {
        if (priority == null) return "UNKNOWN";
        
        if (priority >= 8) return "🔴 URGENT";
        if (priority >= 6) return "🟠 HIGH";
        if (priority >= 4) return "🟡 MEDIUM";
        return "🟢 LOW";
    }

    /**
     * Get overall coverage assessment message
     */
    private String getCoverageAssessmentMessage(SkillCoverage coverage) {
        String coverageStatus = coverage.getCoverageStatus();
        boolean hasCriticalGaps = coverage.hasCriticalGaps();
        
        if ("EXCELLENT".equals(coverageStatus) && !hasCriticalGaps) {
            return "🟢 OUTSTANDING - Comprehensive skill coverage across all service areas";
        } else if ("GOOD".equals(coverageStatus) && !hasCriticalGaps) {
            return "🟢 STRONG - Good skill coverage with minor optimization opportunities";
        } else if ("ADEQUATE".equals(coverageStatus)) {
            return "🟡 ADEQUATE - Acceptable coverage, focus on identified gaps";
        } else if ("NEEDS_IMPROVEMENT".equals(coverageStatus) || hasCriticalGaps) {
            return "🟠 NEEDS IMPROVEMENT - Address critical gaps and training needs";
        } else if ("CRITICAL".equals(coverageStatus)) {
            return "🔴 CRITICAL - Immediate action required to address skill shortages";
        } else {
            return "🟠 REVIEW REQUIRED - Assess skill distribution and coverage";
        }
    }
} 