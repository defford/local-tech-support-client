package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.FeedbackStatistics;
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
 * Command to display customer satisfaction metrics and feedback analysis
 * 
 * This command fetches feedback statistics from the API and displays
 * comprehensive customer satisfaction analytics in the requested format.
 */
@Command(
    name = "feedback-stats",
    description = "View customer satisfaction metrics and feedback analysis",
    mixinStandardHelpOptions = true
)
public class FeedbackStatsCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackStatsCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Override
    public Integer call() {
        logger.info("Executing feedback-stats command");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            String outputFormat = parent.getOutputFormat();
            boolean verbose = parent.isVerbose();
            
            if (verbose) {
                System.out.println("🔍 Connecting to server: " + serverUrl);
                System.out.println("😊 Fetching customer satisfaction metrics...");
            }

            // Create API service and fetch data
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Test connection first
                if (!apiService.testConnection()) {
                    System.err.println("❌ Cannot connect to server: " + serverUrl);
                    System.err.println("   Please check that the Local Tech Support Server is running.");
                    return 1;
                }

                // Fetch feedback statistics
                FeedbackStatistics stats = apiService.getFeedbackStatistics();
                
                if (verbose) {
                    System.out.println("✅ Successfully fetched customer satisfaction metrics");
                }

                // Format and display output
                String output = formatOutput(stats, outputFormat, serverUrl);
                System.out.println(output);
                
                logger.info("Feedback stats command completed successfully");
                return 0;

            } catch (ApiException e) {
                logger.error("API error in feedback-stats command: {}", e.getMessage());
                
                System.err.println("❌ API Error: " + e.getUserFriendlyMessage());
                
                if (verbose) {
                    System.err.println("   Status Code: " + e.getStatusCode());
                    System.err.println("   Server: " + serverUrl);
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Unexpected error in feedback-stats command: {}", e.getMessage(), e);
            
            System.err.println("❌ Unexpected error: " + e.getMessage());
            
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            
            return 1;
        }
    }

    /**
     * Format the feedback statistics output based on the requested format
     * 
     * @param stats the feedback statistics data
     * @param format the output format (json or table)
     * @param serverUrl the server URL for metadata
     * @return formatted output string
     */
    private String formatOutput(FeedbackStatistics stats, String format, String serverUrl) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        switch (format.toLowerCase()) {
            case "json":
                return JsonFormatter.withMetadata(
                    "Customer Satisfaction Metrics", 
                    stats, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
                return formatAsTable(stats, serverUrl, timestamp);
                
            default:
                // Default to JSON
                return JsonFormatter.withHeader("Customer Satisfaction Metrics", 
                                              JsonFormatter.toPrettyJsonString(stats));
        }
    }

    /**
     * Format feedback statistics as a readable table
     * 
     * @param stats the feedback statistics
     * @param serverUrl the server URL
     * @param timestamp the timestamp
     * @return formatted table output
     */
    private String formatAsTable(FeedbackStatistics stats, String serverUrl, String timestamp) {
        StringBuilder output = new StringBuilder();
        
        // Header
        output.append("=".repeat(60)).append("\n");
        output.append("😊 CUSTOMER SATISFACTION METRICS").append("\n");
        output.append("=".repeat(60)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append("-".repeat(60)).append("\n\n");
        
        // Overall Rating
        output.append("⭐ Overall Rating: ");
        if (stats.getAverageRating() != null) {
            output.append(String.format("%.1f/5.0 %s (%s)", 
                                      stats.getAverageRating(),
                                      stats.getSatisfactionEmoji(),
                                      stats.getDetailedSatisfactionLevel()));
        } else {
            output.append("N/A");
        }
        output.append("\n\n");
        
        // Feedback Overview
        output.append("📊 Feedback Overview:\n");
        output.append(String.format("   Total Feedback: %d\n", 
                                    stats.getTotalFeedback() != null ? stats.getTotalFeedback() : 0));
        output.append(String.format("   High Ratings (4-5★): %d (%.1f%%)\n", 
                                    stats.getHighRatingsCount() != null ? stats.getHighRatingsCount() : 0,
                                    stats.getHighSatisfactionPercentage()));
        output.append(String.format("   Low Ratings (1-2★): %d (%.1f%%)\n", 
                                    stats.getLowRatingsCount() != null ? stats.getLowRatingsCount() : 0,
                                    stats.getLowSatisfactionPercentage()));
        
        if (stats.getResponseRate() != null) {
            output.append(String.format("   Response Rate: %.1f%%\n", stats.getResponseRate() * 100));
        }
        
        if (stats.getImprovementScore() != null) {
            output.append(String.format("   Improvement Score: %.1f\n", stats.getImprovementScore()));
        }
        
        output.append("\n");
        
        // Rating Distribution
        if (stats.getRatingDistribution() != null && !stats.getRatingDistribution().isEmpty()) {
            output.append("📈 Rating Distribution:\n");
            
            // Sort by rating (5 to 1)
            stats.getRatingDistribution().entrySet().stream()
                .sorted((e1, e2) -> e2.getKey().compareTo(e1.getKey()))
                .forEach(entry -> {
                    int rating = entry.getKey();
                    long count = entry.getValue();
                    double percentage = stats.getTotalFeedback() != null && stats.getTotalFeedback() > 0 
                        ? (double) count / stats.getTotalFeedback() * 100 
                        : 0.0;
                    
                    String stars = "⭐".repeat(rating);
                    String trend = getTrendIndicator(rating, stats);
                    
                    output.append(String.format("   %s %-8s: %3d (%5.1f%%) %s\n", 
                                                stars, 
                                                "(" + rating + " star" + (rating != 1 ? "s" : "") + ")", 
                                                count, 
                                                percentage,
                                                trend));
                });
            output.append("\n");
        }
        
        // Trends
        if (stats.getFeedbackTrends() != null && !stats.getFeedbackTrends().isEmpty()) {
            output.append("📊 Feedback Trends:\n");
            stats.getFeedbackTrends().forEach((period, change) -> {
                String trendIcon = change > 0 ? "↗️" : change < 0 ? "↘️" : "→";
                output.append(String.format("   %-10s: %s %.1f%%\n", period, trendIcon, change));
            });
            output.append("\n");
        }
        
        // Service Quality Assessment
        output.append("🎯 Service Quality: ").append(getServiceQualityMessage(stats)).append("\n");
        
        return output.toString();
    }

    /**
     * Get trend indicator for rating
     */
    private String getTrendIndicator(int rating, FeedbackStatistics stats) {
        if (stats.getFeedbackTrends() == null) {
            return "";
        }
        
        // For high ratings (4-5), positive trend is good
        // For low ratings (1-2), negative trend is good
        if (rating >= 4) {
            return stats.getFeedbackTrends().getOrDefault("recent", 0.0) > 0 ? "↗️" : "↘️";
        } else if (rating <= 2) {
            return stats.getFeedbackTrends().getOrDefault("recent", 0.0) < 0 ? "↗️" : "↘️";
        } else {
            return "→";
        }
    }

    /**
     * Get service quality status message
     */
    private String getServiceQualityMessage(FeedbackStatistics stats) {
        String satisfactionLevel = stats.getDetailedSatisfactionLevel();
        double highSatisfactionPercentage = stats.getHighSatisfactionPercentage();
        
        if ("EXCELLENT".equals(satisfactionLevel) && highSatisfactionPercentage > 80) {
            return "🟢 OUTSTANDING - Exceptional customer satisfaction";
        } else if ("VERY_GOOD".equals(satisfactionLevel) && highSatisfactionPercentage > 70) {
            return "🟢 VERY_GOOD - Strong customer satisfaction";
        } else if ("GOOD".equals(satisfactionLevel) && highSatisfactionPercentage > 60) {
            return "🟡 GOOD - Satisfactory performance, room for improvement";
        } else if ("AVERAGE".equals(satisfactionLevel)) {
            return "🟠 AVERAGE - Focus on service quality improvements";
        } else if ("POOR".equals(satisfactionLevel)) {
            return "🔴 POOR - Immediate service quality review needed";
        } else if ("VERY_POOR".equals(satisfactionLevel)) {
            return "🚨 CRITICAL - Urgent action required to improve customer satisfaction";
        } else {
            return "🟠 REVIEW REQUIRED - Monitor satisfaction trends closely";
        }
    }
} 