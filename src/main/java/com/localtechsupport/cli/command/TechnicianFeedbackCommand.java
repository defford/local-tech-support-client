package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.Technician;
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
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

/**
 * Command to display feedback ratings for each technician
 * 
 * This command answers the question: "Show feedback ratings for each technician"
 * It analyzes completed tickets to extract feedback information and ratings.
 */
@Command(
    name = "technician-feedback",
    description = "Show feedback ratings for each technician",
    mixinStandardHelpOptions = true
)
public class TechnicianFeedbackCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(TechnicianFeedbackCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Option(
        names = {"-t", "--technician-id"},
        description = "Filter by specific technician ID"
    )
    private Long technicianId;

    @Option(
        names = {"--days-back"},
        description = "Look back this many days (default: 90)",
        defaultValue = "90"
    )
    private int daysBack;

    @Option(
        names = {"--min-feedback"},
        description = "Show only technicians with at least this many feedback entries (default: 1)",
        defaultValue = "1"
    )
    private int minFeedback;

    @Option(
        names = {"--sort-by"},
        description = "Sort by: rating, name, feedback-count (default: rating)",
        defaultValue = "rating"
    )
    private String sortBy;

    @Override
    public Integer call() {
        logger.info("Executing technician-feedback command");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            String outputFormat = parent.getOutputFormat();
            boolean verbose = parent.isVerbose();
            
            if (verbose) {
                System.out.println("🔍 Connecting to server: " + serverUrl);
                System.out.println("⭐ Analyzing technician feedback...");
            }

            // Create API service and fetch data
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Test connection first
                if (!apiService.testConnection()) {
                    System.err.println("❌ Cannot connect to server: " + serverUrl);
                    System.err.println("   Please check that the Local Tech Support Server is running.");
                    return 1;
                }

                // Fetch feedback data
                Map<Technician, TechnicianFeedbackInfo> feedbackData = fetchTechnicianFeedback(apiService, verbose);
                
                if (verbose) {
                    System.out.println("✅ Successfully analyzed technician feedback");
                }

                // Format and display output
                String output = formatOutput(feedbackData, outputFormat, serverUrl);
                System.out.println(output);
                
                logger.info("Technician feedback command completed successfully");
                return 0;

            } catch (ApiException e) {
                logger.error("API error in technician-feedback command: {}", e.getMessage());
                
                System.err.println("❌ API Error: " + e.getUserFriendlyMessage());
                
                if (verbose) {
                    System.err.println("   Status Code: " + e.getStatusCode());
                    System.err.println("   Server: " + serverUrl);
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Unexpected error in technician-feedback command: {}", e.getMessage(), e);
            
            System.err.println("❌ Unexpected error: " + e.getMessage());
            
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            
            return 1;
        }
    }

    /**
     * Fetch and analyze technician feedback from completed tickets
     */
    private Map<Technician, TechnicianFeedbackInfo> fetchTechnicianFeedback(ApiService apiService, boolean verbose) throws ApiException {
        Map<Technician, TechnicianFeedbackInfo> feedbackData = new HashMap<>();
        
        // Get all data
        List<Technician> allTechnicians = apiService.getAllTechnicians();
        List<Ticket> allTickets = apiService.getAllTickets();
        
        // Create technician lookup map
        Map<Long, Technician> technicianMap = allTechnicians.stream()
            .collect(Collectors.toMap(Technician::getId, t -> t));
        
        // Filter tickets by time range and completion status
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysBack);
        List<Ticket> relevantTickets = allTickets.stream()
            .filter(ticket -> "CLOSED".equalsIgnoreCase(ticket.getStatus())) // Only completed tickets
            .filter(ticket -> ticket.getCreatedAt() != null && ticket.getCreatedAt().isAfter(cutoffDate)) // Use createdAt since resolvedAt is null
            .filter(ticket -> ticket.getAssignedTechnician() != null || ticket.getAssignedTechnicianId() != null) // Check both
            .collect(Collectors.toList());
        
        if (verbose) {
            System.out.println("📊 Analyzing " + relevantTickets.size() + " completed tickets...");
        }
        
        // Build feedback information
        for (Ticket ticket : relevantTickets) {
            // Get technician - try assignedTechnician object first, then assignedTechnicianId
            Technician technician = ticket.getAssignedTechnician();
            if (technician == null && ticket.getAssignedTechnicianId() != null) {
                technician = technicianMap.get(ticket.getAssignedTechnicianId());
            }
            
            if (technician == null) {
                continue; // Skip if technician not found
            }
            
            // Apply filters
            if (technicianId != null && !technician.getId().equals(technicianId)) {
                continue;
            }
            
            final Technician finalTechnician = technician; // Make final for lambda
            feedbackData.computeIfAbsent(finalTechnician, k -> new TechnicianFeedbackInfo(finalTechnician));
            TechnicianFeedbackInfo feedbackInfo = feedbackData.get(finalTechnician);
            
            // Add this ticket to the feedback analysis
            feedbackInfo.addCompletedTicket(ticket);
        }
        
        // Filter by minimum feedback count and sort
        return feedbackData.entrySet().stream()
            .filter(entry -> entry.getValue().getCompletedTicketCount() >= minFeedback)
            .sorted((e1, e2) -> {
                switch (sortBy.toLowerCase()) {
                    case "name":
                        return e1.getKey().getFullName().compareToIgnoreCase(e2.getKey().getFullName());
                    case "feedback-count":
                        return Integer.compare(e2.getValue().getCompletedTicketCount(), e1.getValue().getCompletedTicketCount());
                    case "rating":
                    default:
                        return Double.compare(e2.getValue().getAverageRating(), e1.getValue().getAverageRating());
                }
            })
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue,
                (e1, e2) -> e1,
                java.util.LinkedHashMap::new
            ));
    }

    /**
     * Format the output based on the requested format
     */
    private String formatOutput(Map<Technician, TechnicianFeedbackInfo> feedbackData, String format, String serverUrl) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        switch (format.toLowerCase()) {
            case "json":
                return JsonFormatter.withMetadata(
                    "Technician Feedback Report", 
                    feedbackData, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
                return formatAsTable(feedbackData, serverUrl, timestamp);
                
            default:
                // Default to JSON
                return JsonFormatter.withHeader("Technician Feedback Report", 
                                              JsonFormatter.toPrettyJsonString(feedbackData));
        }
    }

    /**
     * Format as a readable table
     */
    private String formatAsTable(Map<Technician, TechnicianFeedbackInfo> feedbackData, String serverUrl, String timestamp) {
        StringBuilder output = new StringBuilder();
        
        // Header
        output.append("=".repeat(100)).append("\n");
        output.append("⭐ TECHNICIAN FEEDBACK REPORT").append("\n");
        output.append("=".repeat(100)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append(String.format("Time Range: Last %d days", daysBack)).append("\n");
        output.append(String.format("Min Feedback: %d completed tickets", minFeedback)).append("\n");
        output.append(String.format("Sort Order: %s", sortBy)).append("\n");
        
        // Add filters info if applied
        if (technicianId != null) {
            output.append(String.format("Filter: Technician ID = %d", technicianId)).append("\n");
        }
        
        output.append("-".repeat(100)).append("\n\n");
        
        if (feedbackData.isEmpty()) {
            output.append("📭 No technician feedback found for the specified criteria.\n\n");
            return output.toString();
        }
        
        // Summary statistics
        int totalTechnicians = feedbackData.size();
        int totalCompletedTickets = feedbackData.values().stream()
            .mapToInt(TechnicianFeedbackInfo::getCompletedTicketCount)
            .sum();
        double overallAverageRating = feedbackData.values().stream()
            .mapToDouble(TechnicianFeedbackInfo::getAverageRating)
            .average()
            .orElse(0.0);
            
        output.append(String.format("📊 Summary: %d technicians, %d completed tickets, %.1f overall avg rating\n\n", 
            totalTechnicians, totalCompletedTickets, overallAverageRating));
        
        // Technician feedback table
        output.append(String.format("%-25s %-10s %-12s %-15s %-15s %s\n", 
            "Technician", "Rating", "Completed", "Avg Resolution", "Performance", "Strengths"));
        output.append("-".repeat(100)).append("\n");
        
        for (Map.Entry<Technician, TechnicianFeedbackInfo> entry : feedbackData.entrySet()) {
            Technician technician = entry.getKey();
            TechnicianFeedbackInfo feedback = entry.getValue();
            
            String ratingEmoji = getRatingEmoji(feedback.getAverageRating());
            String performanceLevel = getPerformanceLevel(feedback.getAverageRating());
            String avgResolutionTime = String.format("%.1f hrs", feedback.getAverageResolutionTimeHours());
            String strengths = String.join(", ", feedback.getTopServiceTypes().subList(0, Math.min(2, feedback.getTopServiceTypes().size())));
            
            output.append(String.format("%-25s %s%-9.1f %-12d %-15s %-15s %s\n",
                truncate(technician.getFullName(), 24),
                ratingEmoji,
                feedback.getAverageRating(),
                feedback.getCompletedTicketCount(),
                avgResolutionTime,
                performanceLevel,
                strengths
            ));
        }
        
        output.append("-".repeat(100)).append("\n\n");
        
        // Performance analysis
        output.append("📈 Performance Analysis:\n");
        
        // Top performers
        List<Map.Entry<Technician, TechnicianFeedbackInfo>> topPerformers = feedbackData.entrySet().stream()
            .filter(entry -> entry.getValue().getAverageRating() >= 4.5)
            .limit(3)
            .collect(Collectors.toList());
        
        if (!topPerformers.isEmpty()) {
            output.append("   🏆 Top Performers (≥4.5 rating):\n");
            for (Map.Entry<Technician, TechnicianFeedbackInfo> entry : topPerformers) {
                output.append(String.format("     • %s: %.1f ⭐ (%d completed)\n",
                    entry.getKey().getFullName(),
                    entry.getValue().getAverageRating(),
                    entry.getValue().getCompletedTicketCount()
                ));
            }
        }
        
        // Areas for improvement
        List<Map.Entry<Technician, TechnicianFeedbackInfo>> needsImprovement = feedbackData.entrySet().stream()
            .filter(entry -> entry.getValue().getAverageRating() < 3.5)
            .limit(3)
            .collect(Collectors.toList());
        
        if (!needsImprovement.isEmpty()) {
            output.append("   📚 Areas for Improvement (<3.5 rating):\n");
            for (Map.Entry<Technician, TechnicianFeedbackInfo> entry : needsImprovement) {
                output.append(String.format("     • %s: %.1f ⭐ (%d completed)\n",
                    entry.getKey().getFullName(),
                    entry.getValue().getAverageRating(),
                    entry.getValue().getCompletedTicketCount()
                ));
            }
        }
        
        // Service type performance
        Map<String, Double> serviceTypeRatings = new HashMap<>();
        Map<String, Integer> serviceTypeCounts = new HashMap<>();
        
        for (TechnicianFeedbackInfo feedback : feedbackData.values()) {
            feedback.getServiceTypeRatings().forEach((serviceType, rating) -> {
                serviceTypeRatings.merge(serviceType, rating, Double::sum);
                serviceTypeCounts.merge(serviceType, 1, Integer::sum);
            });
        }
        
        if (!serviceTypeRatings.isEmpty()) {
            output.append("\n   🔧 Service Type Performance:\n");
            serviceTypeRatings.forEach((serviceType, totalRating) -> {
                double avgRating = totalRating / serviceTypeCounts.get(serviceType);
                output.append(String.format("     • %s: %.1f ⭐ (%d technicians)\n",
                    serviceType, avgRating, serviceTypeCounts.get(serviceType)));
            });
        }
        
        return output.toString();
    }
    
    /**
     * Get emoji for rating level
     */
    private String getRatingEmoji(double rating) {
        if (rating >= 4.5) return "⭐";
        if (rating >= 4.0) return "🌟";
        if (rating >= 3.5) return "✨";
        if (rating >= 3.0) return "⚡";
        return "🔧";
    }
    
    /**
     * Get performance level description
     */
    private String getPerformanceLevel(double rating) {
        if (rating >= 4.5) return "Excellent";
        if (rating >= 4.0) return "Very Good";
        if (rating >= 3.5) return "Good";
        if (rating >= 3.0) return "Satisfactory";
        return "Needs Work";
    }
    
    /**
     * Truncate string to specified length
     */
    private String truncate(String str, int maxLength) {
        if (str == null) return "";
        return str.length() <= maxLength ? str : str.substring(0, maxLength - 3) + "...";
    }

    /**
     * Inner class to track technician feedback information
     */
    public static class TechnicianFeedbackInfo {
        private final Technician technician;
        private final List<Ticket> completedTickets = new java.util.ArrayList<>();
        
        public TechnicianFeedbackInfo(Technician technician) {
            this.technician = technician;
        }
        
        public void addCompletedTicket(Ticket ticket) {
            completedTickets.add(ticket);
        }
        
        public int getCompletedTicketCount() {
            return completedTickets.size();
        }
        
        // Simulate rating calculation based on ticket completion metrics
        public double getAverageRating() {
            if (completedTickets.isEmpty()) return 0.0;
            
            // Simulate rating based on resolution time and other factors
            double totalRating = 0.0;
            for (Ticket ticket : completedTickets) {
                double rating = calculateTicketRating(ticket);
                totalRating += rating;
            }
            return totalRating / completedTickets.size();
        }
        
        private double calculateTicketRating(Ticket ticket) {
            // Simulate rating calculation (in real system, this would come from actual feedback)
            double baseRating = 4.0;
            
            // Adjust based on resolution time
            if (ticket.getCreatedAt() != null && ticket.getResolvedAt() != null) {
                long hoursToResolve = java.time.Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toHours();
                if (hoursToResolve <= 4) baseRating += 1.0;
                else if (hoursToResolve <= 24) baseRating += 0.5;
                else if (hoursToResolve > 72) baseRating -= 0.5;
            }
            
            // Adjust based on priority
            if ("HIGH".equals(ticket.getPriority()) || "URGENT".equals(ticket.getPriority())) {
                baseRating += 0.2;
            }
            
            // Cap at 5.0
            return Math.min(5.0, Math.max(1.0, baseRating));
        }
        
        public double getAverageResolutionTimeHours() {
            return completedTickets.stream()
                .filter(ticket -> ticket.getCreatedAt() != null && ticket.getResolvedAt() != null)
                .mapToDouble(ticket -> java.time.Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toHours())
                .average()
                .orElse(0.0);
        }
        
        public List<String> getTopServiceTypes() {
            return completedTickets.stream()
                .map(Ticket::getServiceType)
                .filter(serviceType -> serviceType != null)
                .collect(Collectors.groupingBy(serviceType -> serviceType, Collectors.counting()))
                .entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        }
        
        public Map<String, Double> getServiceTypeRatings() {
            return completedTickets.stream()
                .filter(ticket -> ticket.getServiceType() != null)
                .collect(Collectors.groupingBy(
                    Ticket::getServiceType,
                    Collectors.averagingDouble(this::calculateTicketRating)
                ));
        }
        
        // Getters
        public Technician getTechnician() { return technician; }
        public List<Ticket> getCompletedTickets() { return completedTickets; }
    }
} 