package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.Technician;
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
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

/**
 * Command to display available technicians
 * 
 * This command answers the question: "Which technicians are available for hardware issues?"
 * It fetches available technicians, optionally filtered by service type/skill.
 */
@Command(
    name = "available-technicians",
    description = "Show technicians available for service assignments",
    mixinStandardHelpOptions = true
)
public class AvailableTechniciansCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(AvailableTechniciansCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Option(
        names = {"-t", "--service-type"},
        description = "Filter by service type skill (HARDWARE, SOFTWARE, NETWORK)"
    )
    private String serviceType;

    @Option(
        names = {"-s", "--skill"},
        description = "Filter by specific skill (alias for --service-type)"
    )
    private String skill;

    @Option(
        names = {"--show-skills"},
        description = "Show detailed skill breakdown"
    )
    private boolean showSkills = false;

    @Option(
        names = {"--sort-by"},
        description = "Sort by: name, skill-count, status (default: name)",
        defaultValue = "name"
    )
    private String sortBy;

    @Override
    public Integer call() {
        logger.info("Executing available-technicians command");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            String outputFormat = parent.getOutputFormat();
            boolean verbose = parent.isVerbose();
            
            // Use skill parameter if service-type not specified
            // Handle the case where default value processing might set unwanted values
            String filterSkill = null;
            if (serviceType != null && !serviceType.equals("__no_default_value__") && !serviceType.equals("_NULL_")) {
                filterSkill = serviceType;
            } else if (skill != null && !skill.equals("__no_default_value__") && !skill.equals("_NULL_")) {
                filterSkill = skill;
            }
            
            if (verbose) {
                System.out.println("🔍 Connecting to server: " + serverUrl);
                System.out.println("👨‍🔧 Fetching available technicians...");
                if (filterSkill != null) {
                    System.out.println("🎯 Filtering by skill: " + filterSkill);
                }
            }

            // Create API service and fetch data
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Test connection first
                if (!apiService.testConnection()) {
                    System.err.println("❌ Cannot connect to server: " + serverUrl);
                    System.err.println("   Please check that the Local Tech Support Server is running.");
                    return 1;
                }

                // Fetch available technicians
                List<Technician> availableTechnicians = fetchAvailableTechnicians(apiService, filterSkill, verbose);
                
                if (verbose) {
                    System.out.println("✅ Successfully fetched " + availableTechnicians.size() + " available technicians");
                }

                // Format and display output
                String output = formatOutput(availableTechnicians, outputFormat, serverUrl, filterSkill);
                System.out.println(output);
                
                logger.info("Available technicians command completed successfully");
                return 0;

            } catch (ApiException e) {
                logger.error("API error in available-technicians command: {}", e.getMessage());
                
                System.err.println("❌ API Error: " + e.getUserFriendlyMessage());
                
                if (verbose) {
                    System.err.println("   Status Code: " + e.getStatusCode());
                    System.err.println("   Server: " + serverUrl);
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Unexpected error in available-technicians command: {}", e.getMessage(), e);
            
            System.err.println("❌ Unexpected error: " + e.getMessage());
            
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            
            return 1;
        }
    }

    /**
     * Fetch available technicians from the API
     * Uses the basic technicians endpoint and filters client-side due to server issues with /api/technicians/available
     */
    private List<Technician> fetchAvailableTechnicians(ApiService apiService, String filterSkill, boolean verbose) throws ApiException {
        // Fetch all technicians and filter client-side for availability
        List<Technician> allTechnicians = apiService.getAllTechnicians();
        
        // Filter for available technicians only
        List<Technician> availableTechnicians = allTechnicians.stream()
            .filter(t -> t.getAvailable() != null && t.getAvailable())
            .collect(Collectors.toList());
        
        // Apply skill filter if specified
        if (filterSkill != null && !filterSkill.equals("__no_default_value__") && !filterSkill.equals("_NULL_")) {
            availableTechnicians = availableTechnicians.stream()
                .filter(t -> t.getSkills() != null && 
                           t.getSkills().stream()
                            .anyMatch(skill -> skill.equalsIgnoreCase(filterSkill)))
                .collect(Collectors.toList());
        }
        
        // Apply sorting
        availableTechnicians = applySorting(availableTechnicians);
        
        if (verbose && !availableTechnicians.isEmpty()) {
            System.out.println("🔍 Found " + availableTechnicians.size() + " matching available technicians");
        }
        
        return availableTechnicians;
    }

    /**
     * Apply sorting to the technician list
     */
    private List<Technician> applySorting(List<Technician> technicians) {
        return technicians.stream()
            .sorted((t1, t2) -> {
                switch (sortBy.toLowerCase()) {
                    case "skill-count":
                        int skillCount1 = t1.getSkills() != null ? t1.getSkills().size() : 0;
                        int skillCount2 = t2.getSkills() != null ? t2.getSkills().size() : 0;
                        return Integer.compare(skillCount2, skillCount1); // Descending
                    case "status":
                        return t1.getStatus().compareToIgnoreCase(t2.getStatus());
                    case "name":
                    default:
                        return t1.getFullName().compareToIgnoreCase(t2.getFullName());
                }
            })
            .collect(Collectors.toList());
    }

    /**
     * Format the output based on the requested format
     */
    private String formatOutput(List<Technician> availableTechnicians, String format, String serverUrl, String filterSkill) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        switch (format.toLowerCase()) {
            case "json":
                return JsonFormatter.withMetadata(
                    "Available Technicians Report", 
                    availableTechnicians, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
                return formatAsTable(availableTechnicians, serverUrl, timestamp, filterSkill);
                
            default:
                // Default to JSON
                return JsonFormatter.withHeader("Available Technicians Report", 
                                              JsonFormatter.toPrettyJsonString(availableTechnicians));
        }
    }

    /**
     * Format as a readable table
     */
    private String formatAsTable(List<Technician> availableTechnicians, String serverUrl, String timestamp, String filterSkill) {
        StringBuilder output = new StringBuilder();
        
        // Header
        output.append("=".repeat(90)).append("\n");
        output.append("👨‍🔧 AVAILABLE TECHNICIANS REPORT").append("\n");
        output.append("=".repeat(90)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append(String.format("Sort Order: %s", sortBy)).append("\n");
        
        // Add filters info if applied
        if (filterSkill != null) {
            output.append(String.format("Filter: Service Type/Skill = %s", filterSkill)).append("\n");
        }
        
        output.append("-".repeat(90)).append("\n\n");
        
        if (availableTechnicians.isEmpty()) {
            String message = filterSkill != null ? 
                "No available technicians found with skill: " + filterSkill :
                "No available technicians found";
            output.append("🚫 ").append(message).append("\n\n");
            return output.toString();
        }
        
        // Summary statistics
        output.append(String.format("📊 Total Available Technicians: %d\n", availableTechnicians.size()));
        
        // Skill coverage analysis
        if (showSkills) {
            Map<String, Long> skillCoverage = availableTechnicians.stream()
                .filter(t -> t.getSkills() != null)
                .flatMap(t -> t.getSkills().stream())
                .collect(Collectors.groupingBy(skill -> skill, Collectors.counting()));
            
            if (!skillCoverage.isEmpty()) {
                output.append("Skill Coverage: ");
                skillCoverage.entrySet().stream()
                    .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                    .forEach(entry -> output.append(String.format("%s:%d ", entry.getKey(), entry.getValue())));
                output.append("\n");
            }
        }
        
        output.append("\n");
        
        // Technician details table
        String headerFormat = showSkills ? "%-20s %-15s %-12s %-30s %s\n" : "%-25s %-15s %-15s %-20s %s\n";
        String[] headers = showSkills ? 
            new String[]{"Name", "Status", "Skill Count", "Skills", "Contact"} :
            new String[]{"Name", "Status", "Email", "Phone", "Primary Skills"};
            
        output.append(String.format(headerFormat, (Object[]) headers));
        output.append("-".repeat(90)).append("\n");
        
        for (Technician technician : availableTechnicians) {
            String statusEmoji = getStatusEmoji(technician.getStatus());
            String skillInfo = getSkillInfo(technician, showSkills);
            String contact = showSkills ? technician.getEmail() : technician.getPhone();
            
            if (showSkills) {
                output.append(String.format("%-20s %s%-14s %-12s %-30s %s\n",
                    truncate(technician.getFullName(), 19),
                    statusEmoji,
                    technician.getStatus(),
                    technician.getSkills() != null ? technician.getSkills().size() : 0,
                    skillInfo,
                    contact != null ? contact : "N/A"
                ));
            } else {
                output.append(String.format("%-25s %s%-14s %-15s %-20s %s\n",
                    truncate(technician.getFullName(), 24),
                    statusEmoji,
                    technician.getStatus(),
                    technician.getEmail(),
                    contact != null ? contact : "N/A",
                    skillInfo
                ));
            }
        }
        
        output.append("-".repeat(90)).append("\n");
        
        // Recommendations
        if (availableTechnicians.size() > 0) {
            output.append("\n💡 Assignment Recommendations:\n");
            
            if (filterSkill != null) {
                output.append(String.format("   • %d technician(s) available for %s issues\n", 
                    availableTechnicians.size(), filterSkill));
                    
                // Find technicians with multiple relevant skills
                long multiSkillTechs = availableTechnicians.stream()
                    .filter(t -> t.getSkills() != null && t.getSkills().size() > 1)
                    .count();
                    
                if (multiSkillTechs > 0) {
                    output.append(String.format("   • %d technician(s) have additional skills for cross-training\n", multiSkillTechs));
                }
            } else {
                output.append("   • Consider skill requirements when assigning tickets\n");
                output.append("   • Use --service-type filter to find specialists\n");
            }
        }
        
        return output.toString();
    }
    
    /**
     * Get emoji for technician status
     */
    private String getStatusEmoji(String status) {
        return switch (status.toUpperCase()) {
            case "ACTIVE" -> "🟢";
            case "ON_VACATION" -> "🏖️";
            case "SICK_LEAVE" -> "🤒";
            default -> "❓";
        };
    }
    
    /**
     * Get skill information for display
     */
    private String getSkillInfo(Technician technician, boolean showAll) {
        if (technician.getSkills() == null || technician.getSkills().isEmpty()) {
            return "None";
        }
        
        if (showAll) {
            String skills = String.join(", ", technician.getSkills());
            return truncate(skills, 28);
        } else {
            // Show up to 2 primary skills
            String skills = technician.getSkills().stream()
                .limit(2)
                .collect(Collectors.joining(", "));
            if (technician.getSkills().size() > 2) {
                skills += " +more";
            }
            return truncate(skills, 18);
        }
    }
    
    /**
     * Truncate string to specified length
     */
    private String truncate(String str, int maxLength) {
        if (str == null) return "";
        return str.length() <= maxLength ? str : str.substring(0, maxLength - 3) + "...";
    }
} 