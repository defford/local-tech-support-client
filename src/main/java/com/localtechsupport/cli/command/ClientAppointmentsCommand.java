package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.Client;
import com.localtechsupport.cli.model.Appointment;
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
import java.util.ArrayList;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

/**
 * Command to display upcoming appointments for each client
 * 
 * This command answers the question: "Show upcoming appointments for each client"
 * It fetches clients and their associated appointments through tickets.
 */
@Command(
    name = "client-appointments",
    description = "Show upcoming appointments for each client",
    mixinStandardHelpOptions = true
)
public class ClientAppointmentsCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(ClientAppointmentsCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Option(
        names = {"-c", "--client-id"},
        description = "Filter by specific client ID"
    )
    private Long clientId;

    @Option(
        names = {"-s", "--status"},
        description = "Filter appointments by status (PENDING, CONFIRMED, IN_PROGRESS)"
    )
    private String appointmentStatus;

    @Option(
        names = {"-d", "--days-ahead"},
        description = "Look ahead this many days (default: 30)",
        defaultValue = "30"
    )
    private int daysAhead;

    @Option(
        names = {"--include-past"},
        description = "Include past appointments"
    )
    private boolean includePast = false;

    @Override
    public Integer call() {
        logger.info("Executing client-appointments command");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            String outputFormat = parent.getOutputFormat();
            boolean verbose = parent.isVerbose();
            
            if (verbose) {
                System.out.println("🔍 Connecting to server: " + serverUrl);
                System.out.println("📅 Fetching client appointments...");
            }

            // Create API service and fetch data
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Test connection first
                if (!apiService.testConnection()) {
                    System.err.println("❌ Cannot connect to server: " + serverUrl);
                    System.err.println("   Please check that the Local Tech Support Server is running.");
                    return 1;
                }

                // Fetch appointment data
                Map<Client, List<Appointment>> clientAppointmentMap = fetchClientAppointmentData(apiService, verbose);
                
                if (verbose) {
                    System.out.println("✅ Successfully fetched client appointment data");
                }

                // Format and display output
                String output = formatOutput(clientAppointmentMap, outputFormat, serverUrl);
                System.out.println(output);
                
                logger.info("Client appointments command completed successfully");
                return 0;

            } catch (ApiException e) {
                logger.error("API error in client-appointments command: {}", e.getMessage());
                
                System.err.println("❌ API Error: " + e.getUserFriendlyMessage());
                
                if (verbose) {
                    System.err.println("   Status Code: " + e.getStatusCode());
                    System.err.println("   Server: " + serverUrl);
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Unexpected error in client-appointments command: {}", e.getMessage(), e);
            
            System.err.println("❌ Unexpected error: " + e.getMessage());
            
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            
            return 1;
        }
    }

    /**
     * Fetch client appointment data from the API
     */
    private Map<Client, List<Appointment>> fetchClientAppointmentData(ApiService apiService, boolean verbose) throws ApiException {
        Map<Client, List<Appointment>> clientAppointmentMap = new HashMap<>();
        
        // Get all appointments
        List<Appointment> allAppointments = apiService.getAllAppointments();
        List<Appointment> filteredAppointments = filterAppointments(allAppointments);
        
        if (clientId != null) {
            // Fetch specific client
            List<Client> allClients = apiService.getAllClients();
            Client targetClient = allClients.stream()
                .filter(c -> c.getId().equals(clientId))
                .findFirst()
                .orElse(null);
                
            if (targetClient == null) {
                throw new ApiException("Client with ID " + clientId + " not found", 404);
            }
            
            // Get appointments for this client
            List<Appointment> clientAppointments = getAppointmentsForClient(targetClient.getId(), filteredAppointments, apiService);
            clientAppointmentMap.put(targetClient, clientAppointments);
            
        } else {
            // Fetch all clients and their appointments
            List<Client> clients = apiService.getAllClients()
                .stream()
                .filter(Client::isActive) // Only show active clients
                .collect(Collectors.toList());
            
            if (verbose) {
                System.out.println("📊 Processing " + clients.size() + " active clients...");
            }
            
            // Get appointments for each client
            for (Client client : clients) {
                List<Appointment> clientAppointments = getAppointmentsForClient(client.getId(), filteredAppointments, apiService);
                clientAppointmentMap.put(client, clientAppointments);
            }
        }
        
        return clientAppointmentMap;
    }

    /**
     * Get appointments for a specific client by correlating through tickets
     */
    private List<Appointment> getAppointmentsForClient(Long clientId, List<Appointment> allAppointments, ApiService apiService) throws ApiException {
        // Get client tickets
        List<Ticket> clientTickets = apiService.getTicketsByClient(clientId);
        List<Long> clientTicketIds = clientTickets.stream()
            .map(Ticket::getId)
            .collect(Collectors.toList());
        
        // Filter appointments that belong to client tickets
        return allAppointments.stream()
            .filter(appointment -> clientTicketIds.contains(appointment.getTicketId()))
            .sorted((a1, a2) -> a1.getScheduledStartTime().compareTo(a2.getScheduledStartTime()))
            .collect(Collectors.toList());
    }

    /**
     * Filter appointments based on command options
     */
    private List<Appointment> filterAppointments(List<Appointment> appointments) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime futureLimit = now.plusDays(daysAhead);
        
        return appointments.stream()
            .filter(appointment -> {
                LocalDateTime startTime = appointment.getScheduledStartTime();
                if (startTime == null) return false;
                
                // Filter by time range
                if (!includePast && startTime.isBefore(now)) {
                    return false;
                }
                if (startTime.isAfter(futureLimit)) {
                    return false;
                }
                
                // Filter by status if specified
                if (appointmentStatus != null && !appointmentStatus.equalsIgnoreCase(appointment.getStatus())) {
                    return false;
                }
                
                return true;
            })
            .collect(Collectors.toList());
    }

    /**
     * Format the output based on the requested format
     */
    private String formatOutput(Map<Client, List<Appointment>> clientAppointmentMap, String format, String serverUrl) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        switch (format.toLowerCase()) {
            case "json":
                return JsonFormatter.withMetadata(
                    "Client Appointments Report", 
                    clientAppointmentMap, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
                return formatAsTable(clientAppointmentMap, serverUrl, timestamp);
                
            default:
                // Default to JSON
                return JsonFormatter.withHeader("Client Appointments Report", 
                                              JsonFormatter.toPrettyJsonString(clientAppointmentMap));
        }
    }

    /**
     * Format as a readable table
     */
    private String formatAsTable(Map<Client, List<Appointment>> clientAppointmentMap, String serverUrl, String timestamp) {
        StringBuilder output = new StringBuilder();
        
        // Header
        output.append("=".repeat(100)).append("\n");
        output.append("📅 CLIENT APPOINTMENTS REPORT").append("\n");
        output.append("=".repeat(100)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append(String.format("Time Range: %s days ahead", daysAhead));
        if (includePast) {
            output.append(" (including past)");
        }
        output.append("\n");
        
        // Add filters info if applied
        if (clientId != null) {
            output.append(String.format("Filter: Client ID = %d", clientId)).append("\n");
        }
        if (appointmentStatus != null) {
            output.append(String.format("Filter: Appointment Status = %s", appointmentStatus)).append("\n");
        }
        
        output.append("-".repeat(100)).append("\n\n");
        
        // Summary
        int totalClients = clientAppointmentMap.size();
        int totalAppointments = clientAppointmentMap.values().stream()
            .mapToInt(List::size)
            .sum();
        int clientsWithAppointments = (int) clientAppointmentMap.entrySet().stream()
            .filter(entry -> !entry.getValue().isEmpty())
            .count();
            
        output.append(String.format("📊 Summary: %d clients, %d appointments, %d clients with upcoming appointments\n\n", 
            totalClients, totalAppointments, clientsWithAppointments));
        
        if (totalAppointments == 0) {
            output.append("📭 No upcoming appointments found.\n\n");
            return output.toString();
        }
        
        // Client appointments
        for (Map.Entry<Client, List<Appointment>> entry : clientAppointmentMap.entrySet()) {
            Client client = entry.getKey();
            List<Appointment> appointments = entry.getValue();
            
            if (appointments.isEmpty() && clientId == null) {
                // Skip clients with no appointments unless specifically requested
                continue;
            }
            
            output.append(String.format("👤 %s (ID: %d)", client.getFullName(), client.getId())).append("\n");
            output.append(String.format("   📧 %s | 📞 %s | Status: %s", 
                client.getEmail(),
                client.getPhone() != null ? client.getPhone() : "N/A",
                client.getStatus())).append("\n");
            
            if (appointments.isEmpty()) {
                output.append("   📭 No upcoming appointments\n\n");
                continue;
            }
            
            output.append(String.format("   📅 %d upcoming appointment(s):\n", appointments.size()));
            
            for (Appointment appointment : appointments) {
                String statusEmoji = getAppointmentStatusEmoji(appointment.getStatus());
                String timeInfo = appointment.getScheduledStartTime().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"));
                if (appointment.getScheduledEndTime() != null) {
                    timeInfo += " - " + appointment.getScheduledEndTime().format(DateTimeFormatter.ofPattern("HH:mm"));
                }
                
                String relativeTime = getRelativeTime(appointment.getScheduledStartTime());
                
                output.append(String.format("     %s %s (%s)", 
                    statusEmoji, timeInfo, relativeTime));
                
                // Add ticket information if available
                if (appointment.getTicket() != null) {
                    output.append(String.format(" | Ticket #%d: %s", 
                        appointment.getTicket().getId(),
                        appointment.getTicket().getTitle()));
                } else {
                    output.append(String.format(" | Ticket #%d", appointment.getTicketId()));
                }
                
                // Add technician information if available
                if (appointment.getTechnician() != null) {
                    output.append(String.format(" | Tech: %s", appointment.getTechnician().getFullName()));
                } else if (appointment.getTechnicianId() != null) {
                    output.append(String.format(" | Tech ID: %d", appointment.getTechnicianId()));
                }
                
                output.append("\n");
                
                // Add notes if available
                if (appointment.getNotes() != null && !appointment.getNotes().trim().isEmpty()) {
                    String notes = appointment.getNotes().trim();
                    if (notes.length() > 60) notes = notes.substring(0, 57) + "...";
                    output.append(String.format("       📝 %s\n", notes));
                }
            }
            
            output.append("\n");
        }
        
        // Statistics
        if (totalAppointments > 0) {
            output.append("📈 Appointment Statistics:\n");
            
            // Status breakdown
            Map<String, Long> statusBreakdown = clientAppointmentMap.values().stream()
                .flatMap(List::stream)
                .collect(Collectors.groupingBy(Appointment::getStatus, Collectors.counting()));
            
            output.append("   Status Distribution: ");
            statusBreakdown.forEach((status, count) -> {
                String emoji = getAppointmentStatusEmoji(status);
                output.append(String.format("%s %s:%d ", emoji, status, count));
            });
            output.append("\n");
            
            // Next 7 days
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime weekAhead = now.plusDays(7);
            long appointmentsThisWeek = clientAppointmentMap.values().stream()
                .flatMap(List::stream)
                .filter(apt -> apt.getScheduledStartTime().isAfter(now) && apt.getScheduledStartTime().isBefore(weekAhead))
                .count();
            
            output.append(String.format("   Appointments in next 7 days: %d\n", appointmentsThisWeek));
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
    
    /**
     * Get relative time description
     */
    private String getRelativeTime(LocalDateTime appointmentTime) {
        LocalDateTime now = LocalDateTime.now();
        
        if (appointmentTime.isBefore(now)) {
            return "Past";
        }
        
        long hoursUntil = java.time.Duration.between(now, appointmentTime).toHours();
        long daysUntil = java.time.Duration.between(now, appointmentTime).toDays();
        
        if (hoursUntil < 1) {
            return "Very soon";
        } else if (hoursUntil < 24) {
            return String.format("in %d hour(s)", hoursUntil);
        } else if (daysUntil == 1) {
            return "Tomorrow";
        } else if (daysUntil < 7) {
            return String.format("in %d day(s)", daysUntil);
        } else {
            return String.format("in %d week(s)", daysUntil / 7);
        }
    }
} 