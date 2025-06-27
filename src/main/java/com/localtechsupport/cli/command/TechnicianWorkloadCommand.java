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
import java.util.LinkedHashMap;

/**
 * Command to display current workload for each technician
 * 
 * This command answers the question: "Show current workload for each technician"
 * It fetches all technicians and their assigned tickets, then displays workload metrics.
 */
@Command(
    name = "technician-workload",
    description = "Show current workload for each technician",
    mixinStandardHelpOptions = true
)
public class TechnicianWorkloadCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(TechnicianWorkloadCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Option(
        names = {"-t", "--technician-id"},
        description = "Filter by specific technician ID"
    )
    private Long technicianId;

    @Option(
        names = {"-s", "--status"},
        description = "Filter technicians by status (ACTIVE, ON_VACATION, SICK_LEAVE)"
    )
    private String technicianStatus;

    @Option(
        names = {"--include-closed"},
        description = "Include closed tickets in workload calculation"
    )
    private boolean includeClosedTickets = false;

    @Option(
        names = {"--sort-by"},
        description = "Sort by: workload, name, status (default: workload)",
        defaultValue = "workload"
    )
    private String sortBy;

    @Override
    public Integer call() throws Exception {
        try {
            if (parent.isVerbose()) {
                System.out.println("🔍 Connecting to server: " + parent.getServerUrl());
                System.out.println("👨‍💻 Fetching technician workload data...");
            }
            
            ApiService apiService = new ApiService(parent.getServerUrl());
            
            // Fetch technicians
            List<Technician> technicians = apiService.getAllTechnicians();
            
            // Filter technicians if needed - handle the __no_default_value__ case
            if (technicianStatus != null && !technicianStatus.equals("__no_default_value__")) {
                technicians = technicians.stream()
                    .filter(t -> technicianStatus.equalsIgnoreCase(t.getStatus()))
                    .collect(Collectors.toList());
            }
            
            // Filter by technician ID if specified
            if (technicianId != null) {
                technicians = technicians.stream()
                    .filter(t -> t.getId().equals(technicianId))
                    .collect(Collectors.toList());
            }
            
            if (parent.isVerbose()) {
                System.out.println("📊 Processing " + technicians.size() + " technicians...");
            }
            
            // Build workload map
            Map<Technician, WorkloadInfo> technicianWorkloadMap = new LinkedHashMap<>();
            
            for (Technician technician : technicians) {
                List<Ticket> tickets = apiService.getTicketsByTechnician(technician.getId());
                WorkloadInfo workloadInfo = calculateWorkloadInfo(tickets);
                technicianWorkloadMap.put(technician, workloadInfo);
            }
            
            // Apply sorting
            technicianWorkloadMap = applySorting(technicianWorkloadMap);
            
            if (parent.isVerbose()) {
                System.out.println("✅ Successfully fetched technician workload data");
            }
            
            // Format and display output
            String output = formatOutput(technicianWorkloadMap, "table", parent.getServerUrl());
            System.out.println(output);
            
            return 0;
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching technician workload: " + e.getMessage());
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            return 1;
        }
    }

    /**
     * Calculate workload information from tickets
     */
    private WorkloadInfo calculateWorkloadInfo(List<Ticket> allTickets) {
        List<Ticket> activeTickets = includeClosedTickets ? 
            allTickets : 
            allTickets.stream().filter(Ticket::isOpen).collect(Collectors.toList());
            
        // Use null-safe grouping to handle tickets with null fields
        Map<String, Long> ticketsByStatus = allTickets.stream()
            .collect(Collectors.groupingBy(
                ticket -> ticket.getStatus() != null ? ticket.getStatus() : "UNKNOWN", 
                Collectors.counting()));
            
        Map<String, Long> ticketsByPriority = activeTickets.stream()
            .collect(Collectors.groupingBy(
                ticket -> ticket.getPriority() != null ? ticket.getPriority() : "UNKNOWN", 
                Collectors.counting()));
            
        Map<String, Long> ticketsByServiceType = activeTickets.stream()
            .collect(Collectors.groupingBy(
                ticket -> ticket.getServiceType() != null ? ticket.getServiceType() : "UNKNOWN", 
                Collectors.counting()));
            
        long overdueCount = activeTickets.stream()
            .mapToLong(t -> t.isOverdue() ? 1 : 0)
            .sum();
            
        return new WorkloadInfo(
            activeTickets.size(),
            (int) overdueCount,
            ticketsByStatus,
            ticketsByPriority,
            ticketsByServiceType
        );
    }

    /**
     * Apply sorting to the technician workload map
     */
    private Map<Technician, WorkloadInfo> applySorting(Map<Technician, WorkloadInfo> originalMap) {
        return originalMap.entrySet().stream()
            .sorted((e1, e2) -> {
                switch (sortBy.toLowerCase()) {
                    case "name":
                        return e1.getKey().getFullName().compareToIgnoreCase(e2.getKey().getFullName());
                    case "status":
                        return e1.getKey().getStatus().compareToIgnoreCase(e2.getKey().getStatus());
                    case "workload":
                    default:
                        return Integer.compare(e2.getValue().getActiveTicketCount(), e1.getValue().getActiveTicketCount());
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
    private String formatOutput(Map<Technician, WorkloadInfo> technicianWorkloadMap, String format, String serverUrl) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        switch (format.toLowerCase()) {
            case "json":
                return JsonFormatter.withMetadata(
                    "Technician Workload Report", 
                    technicianWorkloadMap, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
                return formatAsTable(technicianWorkloadMap, serverUrl, timestamp);
                
            default:
                // Default to JSON
                return JsonFormatter.withHeader("Technician Workload Report", 
                                              JsonFormatter.toPrettyJsonString(technicianWorkloadMap));
        }
    }

    /**
     * Format as a readable table
     */
    private String formatAsTable(Map<Technician, WorkloadInfo> technicianWorkloadMap, String serverUrl, String timestamp) {
        StringBuilder output = new StringBuilder();
        
        // Header
        output.append("=".repeat(100)).append("\n");
        output.append("👨‍💻 TECHNICIAN WORKLOAD REPORT").append("\n");
        output.append("=".repeat(100)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append(String.format("Sort Order: %s", sortBy)).append("\n");
        
        // Add filters info if applied
        if (technicianId != null) {
            output.append(String.format("Filter: Technician ID = %d", technicianId)).append("\n");
        }
        if (technicianStatus != null) {
            output.append(String.format("Filter: Status = %s", technicianStatus)).append("\n");
        }
        if (includeClosedTickets) {
            output.append("Including: Closed tickets in workload").append("\n");
        }
        
        output.append("-".repeat(100)).append("\n\n");
        
        // Summary
        int totalTechnicians = technicianWorkloadMap.size();
        int totalActiveTickets = technicianWorkloadMap.values().stream()
            .mapToInt(WorkloadInfo::getActiveTicketCount)
            .sum();
        int totalOverdueTickets = technicianWorkloadMap.values().stream()
            .mapToInt(WorkloadInfo::getOverdueTicketCount)
            .sum();
            
        output.append(String.format("📊 Summary: %d technicians, %d active tickets, %d overdue\n\n", 
            totalTechnicians, totalActiveTickets, totalOverdueTickets));
        
        // Technician details table
        output.append(String.format("%-25s %-12s %-8s %-8s %-20s %s\n", 
            "Technician", "Status", "Active", "Overdue", "Skills", "Priority Breakdown"));
        output.append("-".repeat(100)).append("\n");
        
        for (Map.Entry<Technician, WorkloadInfo> entry : technicianWorkloadMap.entrySet()) {
            Technician technician = entry.getKey();
            WorkloadInfo workload = entry.getValue();
            
            String statusEmoji = getStatusEmoji(technician.getStatus());
            String workloadEmoji = getWorkloadEmoji(workload.getActiveTicketCount());
            String skills = technician.getSkills() != null ? 
                String.join(",", technician.getSkills().subList(0, Math.min(2, technician.getSkills().size()))) : "None";
            if (skills.length() > 18) skills = skills.substring(0, 15) + "...";
            
            String priorityBreakdown = workload.getTicketsByPriority().entrySet().stream()
                .map(e -> e.getKey().charAt(0) + ":" + e.getValue())
                .collect(Collectors.joining(" "));
            
            output.append(String.format("%-25s %s%-11s %-8s %-8s %-20s %s\n",
                technician.getFullName(),
                statusEmoji,
                technician.getStatus(),
                workloadEmoji + workload.getActiveTicketCount(),
                workload.getOverdueTicketCount() > 0 ? "⚠️" + workload.getOverdueTicketCount() : workload.getOverdueTicketCount(),
                skills,
                priorityBreakdown
            ));
        }
        
        output.append("-".repeat(100)).append("\n");
        
        // Workload analysis
        if (totalTechnicians > 1) {
            output.append("\n📈 Workload Analysis:\n");
            double avgWorkload = (double) totalActiveTickets / totalTechnicians;
            output.append(String.format("   Average tickets per technician: %.1f\n", avgWorkload));
            
            long overloadedTechs = technicianWorkloadMap.values().stream()
                .mapToLong(w -> w.getActiveTicketCount() > avgWorkload * 1.5 ? 1 : 0)
                .sum();
            
            if (overloadedTechs > 0) {
                output.append(String.format("   ⚠️  %d technician(s) are overloaded (>%.1f tickets)\n", overloadedTechs, avgWorkload * 1.5));
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
            case "TERMINATED" -> "⛔";
            default -> "❓";
        };
    }
    
    /**
     * Get emoji for workload level
     */
    private String getWorkloadEmoji(int ticketCount) {
        if (ticketCount == 0) return "😴";
        if (ticketCount <= 3) return "😊";
        if (ticketCount <= 6) return "😐";
        if (ticketCount <= 10) return "😰";
        return "🔥";
    }

    /**
     * Inner class to hold workload information
     */
    public static class WorkloadInfo {
        private final int activeTicketCount;
        private final int overdueTicketCount;
        private final Map<String, Long> ticketsByStatus;
        private final Map<String, Long> ticketsByPriority;
        private final Map<String, Long> ticketsByServiceType;

        public WorkloadInfo(int activeTicketCount, int overdueTicketCount, 
                          Map<String, Long> ticketsByStatus, Map<String, Long> ticketsByPriority,
                          Map<String, Long> ticketsByServiceType) {
            this.activeTicketCount = activeTicketCount;
            this.overdueTicketCount = overdueTicketCount;
            this.ticketsByStatus = ticketsByStatus;
            this.ticketsByPriority = ticketsByPriority;
            this.ticketsByServiceType = ticketsByServiceType;
        }

        // Getters
        public int getActiveTicketCount() { return activeTicketCount; }
        public int getOverdueTicketCount() { return overdueTicketCount; }
        public Map<String, Long> getTicketsByStatus() { return ticketsByStatus; }
        public Map<String, Long> getTicketsByPriority() { return ticketsByPriority; }
        public Map<String, Long> getTicketsByServiceType() { return ticketsByServiceType; }
    }
} 