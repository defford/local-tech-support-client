package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.Technician;
import com.localtechsupport.cli.model.Appointment;
import com.localtechsupport.cli.client.ApiException;
import com.localtechsupport.cli.util.JsonFormatter;
import picocli.CommandLine.Command;
import picocli.CommandLine.ParentCommand;
import picocli.CommandLine.Option;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

/**
 * Command to display technician's schedule for the week
 * 
 * This command answers the question: "Show technician's schedule for the week"
 * It fetches appointments for technicians and displays them in a weekly view.
 */
@Command(
    name = "technician-schedule",
    description = "Show technician's schedule for the week",
    mixinStandardHelpOptions = true
)
public class TechnicianScheduleCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(TechnicianScheduleCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Option(
        names = {"-t", "--technician-id"},
        description = "Filter by specific technician ID"
    )
    private Long technicianId;

    @Option(
        names = {"-w", "--week-offset"},
        description = "Week offset from current week (0 = current, 1 = next, -1 = previous)",
        defaultValue = "0"
    )
    private int weekOffset;

    @Option(
        names = {"-s", "--status"},
        description = "Filter appointments by status (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED)"
    )
    private String appointmentStatus;

    @Option(
        names = {"--upcoming-only"},
        description = "Show only upcoming appointments"
    )
    private boolean upcomingOnly = false;

    @Override
    public Integer call() {
        logger.info("Executing technician-schedule command");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            String outputFormat = parent.getOutputFormat();
            boolean verbose = parent.isVerbose();
            
            if (verbose) {
                System.out.println("🔍 Connecting to server: " + serverUrl);
                System.out.println("📅 Fetching technician schedules...");
            }

            // Create API service and fetch data
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Test connection first
                if (!apiService.testConnection()) {
                    System.err.println("❌ Cannot connect to server: " + serverUrl);
                    System.err.println("   Please check that the Local Tech Support Server is running.");
                    return 1;
                }

                // Fetch schedule data
                Map<Technician, List<Appointment>> technicianScheduleMap = fetchTechnicianScheduleData(apiService, verbose);
                
                if (verbose) {
                    System.out.println("✅ Successfully fetched technician schedule data");
                }

                // Format and display output
                String output = formatOutput(technicianScheduleMap, outputFormat, serverUrl);
                System.out.println(output);
                
                logger.info("Technician schedule command completed successfully");
                return 0;

            } catch (ApiException e) {
                logger.error("API error in technician-schedule command: {}", e.getMessage());
                
                System.err.println("❌ API Error: " + e.getUserFriendlyMessage());
                
                if (verbose) {
                    System.err.println("   Status Code: " + e.getStatusCode());
                    System.err.println("   Server: " + serverUrl);
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Unexpected error in technician-schedule command: {}", e.getMessage(), e);
            
            System.err.println("❌ Unexpected error: " + e.getMessage());
            
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            
            return 1;
        }
    }

    /**
     * Fetch technician schedule data from the API
     */
    private Map<Technician, List<Appointment>> fetchTechnicianScheduleData(ApiService apiService, boolean verbose) throws ApiException {
        Map<Technician, List<Appointment>> technicianScheduleMap = new HashMap<>();
        
        if (technicianId != null) {
            // Fetch specific technician and their appointments
            List<Technician> allTechnicians = apiService.getAllTechnicians();
            Technician targetTechnician = allTechnicians.stream()
                .filter(t -> t.getId().equals(technicianId))
                .findFirst()
                .orElse(null);
                
            if (targetTechnician == null) {
                throw new ApiException("Technician with ID " + technicianId + " not found", 404);
            }
            
            List<Appointment> appointments = apiService.getAppointmentsByTechnician(technicianId);
            appointments = filterAppointments(appointments);
            technicianScheduleMap.put(targetTechnician, appointments);
            
        } else {
            // Fetch all technicians and their appointments
            List<Technician> technicians = apiService.getAllTechnicians()
                .stream()
                .filter(Technician::isActive) // Only show active technicians
                .collect(Collectors.toList());
            
            if (verbose) {
                System.out.println("📊 Processing " + technicians.size() + " active technicians...");
            }
            
            // Fetch appointments for each technician
            for (Technician technician : technicians) {
                List<Appointment> appointments = apiService.getAppointmentsByTechnician(technician.getId());
                appointments = filterAppointments(appointments);
                technicianScheduleMap.put(technician, appointments);
            }
        }
        
        return technicianScheduleMap;
    }

    /**
     * Filter appointments based on command options
     */
    private List<Appointment> filterAppointments(List<Appointment> appointments) {
        // Calculate week boundaries
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekStart = now.plusWeeks(weekOffset).truncatedTo(ChronoUnit.DAYS)
            .minusDays(now.getDayOfWeek().getValue() - 1); // Start of week (Monday)
        LocalDateTime weekEnd = weekStart.plusDays(7);
        
        List<Appointment> filtered = appointments.stream()
            .filter(appointment -> {
                // Filter by week
                LocalDateTime startTime = appointment.getScheduledStartTime();
                if (startTime == null) return false;
                if (startTime.isBefore(weekStart) || startTime.isAfter(weekEnd)) return false;
                
                // Filter by status if specified
                if (appointmentStatus != null && !appointmentStatus.equalsIgnoreCase(appointment.getStatus())) {
                    return false;
                }
                
                // Filter by upcoming if specified
                if (upcomingOnly && startTime.isBefore(now)) {
                    return false;
                }
                
                return true;
            })
            .sorted((a1, a2) -> a1.getScheduledStartTime().compareTo(a2.getScheduledStartTime()))
            .collect(Collectors.toList());
            
        return filtered;
    }

    /**
     * Format the output based on the requested format
     */
    private String formatOutput(Map<Technician, List<Appointment>> technicianScheduleMap, String format, String serverUrl) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        switch (format.toLowerCase()) {
            case "json":
                return JsonFormatter.withMetadata(
                    "Technician Schedule Report", 
                    technicianScheduleMap, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
                return formatAsTable(technicianScheduleMap, serverUrl, timestamp);
                
            default:
                // Default to JSON
                return JsonFormatter.withHeader("Technician Schedule Report", 
                                              JsonFormatter.toPrettyJsonString(technicianScheduleMap));
        }
    }

    /**
     * Format as a readable table
     */
    private String formatAsTable(Map<Technician, List<Appointment>> technicianScheduleMap, String serverUrl, String timestamp) {
        StringBuilder output = new StringBuilder();
        
        // Calculate week info
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekStart = now.plusWeeks(weekOffset).truncatedTo(ChronoUnit.DAYS)
            .minusDays(now.getDayOfWeek().getValue() - 1);
        LocalDateTime weekEnd = weekStart.plusDays(6);
        
        // Header
        output.append("=".repeat(100)).append("\n");
        output.append("📅 TECHNICIAN SCHEDULE REPORT").append("\n");
        output.append("=".repeat(100)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append(String.format("Week: %s - %s", 
            weekStart.format(DateTimeFormatter.ofPattern("MMM dd")),
            weekEnd.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))).append("\n");
        
        // Add filters info if applied
        if (technicianId != null) {
            output.append(String.format("Filter: Technician ID = %d", technicianId)).append("\n");
        }
        if (appointmentStatus != null) {
            output.append(String.format("Filter: Appointment Status = %s", appointmentStatus)).append("\n");
        }
        if (upcomingOnly) {
            output.append("Filter: Upcoming appointments only").append("\n");
        }
        
        output.append("-".repeat(100)).append("\n\n");
        
        // Summary
        int totalTechnicians = technicianScheduleMap.size();
        int totalAppointments = technicianScheduleMap.values().stream()
            .mapToInt(List::size)
            .sum();
            
        output.append(String.format("📊 Summary: %d technicians, %d appointments this week\n\n", 
            totalTechnicians, totalAppointments));
        
        if (totalAppointments == 0) {
            output.append("📭 No appointments scheduled for this week.\n\n");
            return output.toString();
        }
        
        // Technician schedules
        for (Map.Entry<Technician, List<Appointment>> entry : technicianScheduleMap.entrySet()) {
            Technician technician = entry.getKey();
            List<Appointment> appointments = entry.getValue();
            
            if (appointments.isEmpty() && technicianId == null) {
                // Skip technicians with no appointments unless specifically requested
                continue;
            }
            
            output.append(String.format("👨‍🔧 %s (ID: %d)", technician.getFullName(), technician.getId())).append("\n");
            output.append(String.format("   Status: %s | Skills: %s", 
                technician.getStatus(),
                technician.getSkills() != null ? String.join(", ", technician.getSkills()) : "None")).append("\n");
            
            if (appointments.isEmpty()) {
                output.append("   📭 No appointments scheduled for this week\n\n");
                continue;
            }
            
            output.append(String.format("   📅 %d appointment(s) scheduled:\n", appointments.size()));
            
            // Group appointments by day
            Map<String, List<Appointment>> appointmentsByDay = appointments.stream()
                .collect(Collectors.groupingBy(appointment -> 
                    appointment.getScheduledStartTime().format(DateTimeFormatter.ofPattern("EEEE, MMM dd"))));
            
            for (Map.Entry<String, List<Appointment>> dayEntry : appointmentsByDay.entrySet()) {
                String day = dayEntry.getKey();
                List<Appointment> dayAppointments = dayEntry.getValue();
                
                output.append(String.format("     📆 %s:\n", day));
                
                for (Appointment appointment : dayAppointments) {
                    String statusEmoji = getAppointmentStatusEmoji(appointment.getStatus());
                    String timeRange = String.format("%s - %s",
                        appointment.getScheduledStartTime().format(DateTimeFormatter.ofPattern("HH:mm")),
                        appointment.getScheduledEndTime() != null ? 
                            appointment.getScheduledEndTime().format(DateTimeFormatter.ofPattern("HH:mm")) : "??:??");
                    
                    String ticketInfo = appointment.getTicket() != null ? 
                        String.format("Ticket #%d", appointment.getTicket().getId()) : 
                        String.format("Ticket #%d", appointment.getTicketId());
                    
                    output.append(String.format("       %s %s | %s", 
                        statusEmoji, timeRange, ticketInfo));
                    
                    if (appointment.getTicket() != null && appointment.getTicket().getTitle() != null) {
                        String title = appointment.getTicket().getTitle();
                        if (title.length() > 30) title = title.substring(0, 27) + "...";
                        output.append(String.format(" | %s", title));
                    }
                    
                    output.append("\n");
                }
            }
            
            output.append("\n");
        }
        
        // Weekly statistics
        if (totalAppointments > 0) {
            output.append("📈 Weekly Statistics:\n");
            
            // Status breakdown
            Map<String, Long> statusBreakdown = technicianScheduleMap.values().stream()
                .flatMap(List::stream)
                .collect(Collectors.groupingBy(Appointment::getStatus, Collectors.counting()));
            
            output.append("   Status Distribution: ");
            statusBreakdown.forEach((status, count) -> {
                String emoji = getAppointmentStatusEmoji(status);
                output.append(String.format("%s %s:%d ", emoji, status, count));
            });
            output.append("\n");
            
            // Busiest day
            Map<String, Long> dayBreakdown = technicianScheduleMap.values().stream()
                .flatMap(List::stream)
                .collect(Collectors.groupingBy(appointment -> 
                    appointment.getScheduledStartTime().format(DateTimeFormatter.ofPattern("EEEE")), Collectors.counting()));
            
            if (!dayBreakdown.isEmpty()) {
                String busiestDay = dayBreakdown.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Unknown");
                output.append(String.format("   Busiest Day: %s (%d appointments)\n", 
                    busiestDay, dayBreakdown.get(busiestDay)));
            }
        }
        
        return output.toString();
    }
    
    /**
     * Get emoji for appointment status
     */
    private String getAppointmentStatusEmoji(String status) {
        return switch (status.toUpperCase()) {
            case "PENDING" -> "⏳";
            case "CONFIRMED" -> "✅";
            case "IN_PROGRESS" -> "🔧";
            case "COMPLETED" -> "✅";
            case "CANCELLED" -> "❌";
            case "NO_SHOW" -> "👻";
            default -> "❓";
        };
    }
} 