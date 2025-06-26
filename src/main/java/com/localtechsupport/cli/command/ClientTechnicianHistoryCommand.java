package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.Client;
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
import java.util.ArrayList;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

/**
 * Command to display history of which technicians worked with each client
 * 
 * This command answers the question: "Show history of which technicians worked with each client"
 * It analyzes ticket assignments to show client-technician relationships over time.
 */
@Command(
    name = "client-technician-history",
    description = "Show history of which technicians worked with each client",
    mixinStandardHelpOptions = true
)
public class ClientTechnicianHistoryCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(ClientTechnicianHistoryCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Option(
        names = {"-c", "--client-id"},
        description = "Filter by specific client ID"
    )
    private Long clientId;

    @Option(
        names = {"-t", "--technician-id"},
        description = "Filter by specific technician ID"
    )
    private Long technicianId;

    @Option(
        names = {"--days-back"},
        description = "Look back this many days (default: 365)",
        defaultValue = "365"
    )
    private int daysBack;

    @Option(
        names = {"--min-interactions"},
        description = "Show only relationships with at least this many interactions (default: 1)",
        defaultValue = "1"
    )
    private int minInteractions;

    @Override
    public Integer call() {
        logger.info("Executing client-technician-history command");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            String outputFormat = parent.getOutputFormat();
            boolean verbose = parent.isVerbose();
            
            if (verbose) {
                System.out.println("🔍 Connecting to server: " + serverUrl);
                System.out.println("🕒 Analyzing client-technician history...");
            }

            // Create API service and fetch data
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Test connection first
                if (!apiService.testConnection()) {
                    System.err.println("❌ Cannot connect to server: " + serverUrl);
                    System.err.println("   Please check that the Local Tech Support Server is running.");
                    return 1;
                }

                // Fetch history data
                Map<Client, Map<Technician, TechnicianInteraction>> historyData = fetchClientTechnicianHistory(apiService, verbose);
                
                if (verbose) {
                    System.out.println("✅ Successfully analyzed client-technician history");
                }

                // Format and display output
                String output = formatOutput(historyData, outputFormat, serverUrl);
                System.out.println(output);
                
                logger.info("Client technician history command completed successfully");
                return 0;

            } catch (ApiException e) {
                logger.error("API error in client-technician-history command: {}", e.getMessage());
                
                System.err.println("❌ API Error: " + e.getUserFriendlyMessage());
                
                if (verbose) {
                    System.err.println("   Status Code: " + e.getStatusCode());
                    System.err.println("   Server: " + serverUrl);
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Unexpected error in client-technician-history command: {}", e.getMessage(), e);
            
            System.err.println("❌ Unexpected error: " + e.getMessage());
            
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            
            return 1;
        }
    }

    /**
     * Fetch and analyze client-technician interaction history
     */
    private Map<Client, Map<Technician, TechnicianInteraction>> fetchClientTechnicianHistory(ApiService apiService, boolean verbose) throws ApiException {
        Map<Client, Map<Technician, TechnicianInteraction>> historyData = new HashMap<>();
        
        // Get all data
        List<Client> allClients = apiService.getAllClients();
        List<Technician> allTechnicians = apiService.getAllTechnicians();
        List<Ticket> allTickets = apiService.getAllTickets();
        
        // Create lookup maps
        Map<Long, Client> clientMap = allClients.stream()
            .collect(Collectors.toMap(Client::getId, c -> c));
        Map<Long, Technician> technicianMap = allTechnicians.stream()
            .collect(Collectors.toMap(Technician::getId, t -> t));
        
        // Filter tickets by time range
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysBack);
        List<Ticket> relevantTickets = allTickets.stream()
            .filter(ticket -> ticket.getCreatedAt() != null && ticket.getCreatedAt().isAfter(cutoffDate))
            .filter(ticket -> ticket.getAssignedTechnician() != null || ticket.getAssignedTechnicianId() != null) // Only tickets with assigned technicians
            .collect(Collectors.toList());
        
        if (verbose) {
            System.out.println("📊 Analyzing " + relevantTickets.size() + " tickets with assignments...");
        }
        
        // Build interaction history
        for (Ticket ticket : relevantTickets) {
            // Get client - try client object first, then clientId
            Client client = ticket.getClient();
            if (client == null && ticket.getClientId() != null) {
                client = clientMap.get(ticket.getClientId());
            }
            
            // Get technician - try assignedTechnician object first, then assignedTechnicianId
            Technician technician = ticket.getAssignedTechnician();
            if (technician == null && ticket.getAssignedTechnicianId() != null) {
                technician = technicianMap.get(ticket.getAssignedTechnicianId());
            }
            
            if (client == null || technician == null) {
                continue; // Skip if client or technician not found
            }
            
            // Apply filters
            if (clientId != null && !client.getId().equals(clientId)) {
                continue;
            }
            if (technicianId != null && !technician.getId().equals(technicianId)) {
                continue;
            }
            
            // Initialize data structures
            historyData.computeIfAbsent(client, k -> new HashMap<>());
            Map<Technician, TechnicianInteraction> technicianInteractions = historyData.get(client);
            
            final Technician finalTechnician = technician; // Make final for lambda
            TechnicianInteraction interaction = technicianInteractions.computeIfAbsent(
                finalTechnician, 
                k -> new TechnicianInteraction(finalTechnician)
            );
            
            // Add this ticket to the interaction
            interaction.addTicket(ticket);
        }
        
        // Filter by minimum interactions
        historyData.entrySet().removeIf(clientEntry -> {
            clientEntry.getValue().entrySet().removeIf(
                techEntry -> techEntry.getValue().getTicketCount() < minInteractions
            );
            return clientEntry.getValue().isEmpty();
        });
        
        return historyData;
    }

    /**
     * Format the output based on the requested format
     */
    private String formatOutput(Map<Client, Map<Technician, TechnicianInteraction>> historyData, String format, String serverUrl) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        switch (format.toLowerCase()) {
            case "json":
                return JsonFormatter.withMetadata(
                    "Client Technician History Report", 
                    historyData, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
                return formatAsTable(historyData, serverUrl, timestamp);
                
            default:
                // Default to JSON
                return JsonFormatter.withHeader("Client Technician History Report", 
                                              JsonFormatter.toPrettyJsonString(historyData));
        }
    }

    /**
     * Format as a readable table
     */
    private String formatAsTable(Map<Client, Map<Technician, TechnicianInteraction>> historyData, String serverUrl, String timestamp) {
        StringBuilder output = new StringBuilder();
        
        // Header
        output.append("=".repeat(100)).append("\n");
        output.append("🤝 CLIENT-TECHNICIAN HISTORY REPORT").append("\n");
        output.append("=".repeat(100)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append(String.format("Time Range: Last %d days", daysBack)).append("\n");
        output.append(String.format("Min Interactions: %d", minInteractions)).append("\n");
        
        // Add filters info if applied
        if (clientId != null) {
            output.append(String.format("Filter: Client ID = %d", clientId)).append("\n");
        }
        if (technicianId != null) {
            output.append(String.format("Filter: Technician ID = %d", technicianId)).append("\n");
        }
        
        output.append("-".repeat(100)).append("\n\n");
        
        if (historyData.isEmpty()) {
            output.append("📭 No client-technician interactions found for the specified criteria.\n\n");
            return output.toString();
        }
        
        // Summary statistics
        int totalClients = historyData.size();
        int totalRelationships = historyData.values().stream()
            .mapToInt(Map::size)
            .sum();
        int totalInteractions = historyData.values().stream()
            .flatMap(techMap -> techMap.values().stream())
            .mapToInt(TechnicianInteraction::getTicketCount)
            .sum();
            
        output.append(String.format("📊 Summary: %d clients, %d relationships, %d total interactions\n\n", 
            totalClients, totalRelationships, totalInteractions));
        
        // Client-technician relationships
        for (Map.Entry<Client, Map<Technician, TechnicianInteraction>> clientEntry : historyData.entrySet()) {
            Client client = clientEntry.getKey();
            Map<Technician, TechnicianInteraction> technicianInteractions = clientEntry.getValue();
            
            output.append(String.format("👤 %s (ID: %d) - %d technician relationship(s)", 
                client.getFullName(), client.getId(), technicianInteractions.size())).append("\n");
            output.append(String.format("   📧 %s | Status: %s", client.getEmail(), client.getStatus())).append("\n");
            
            // Sort technicians by interaction count (descending)
            List<Map.Entry<Technician, TechnicianInteraction>> sortedTechnicians = 
                technicianInteractions.entrySet().stream()
                    .sorted((e1, e2) -> Integer.compare(e2.getValue().getTicketCount(), e1.getValue().getTicketCount()))
                    .collect(Collectors.toList());
            
            for (Map.Entry<Technician, TechnicianInteraction> techEntry : sortedTechnicians) {
                Technician technician = techEntry.getKey();
                TechnicianInteraction interaction = techEntry.getValue();
                
                output.append(String.format("     🔧 %s (ID: %d): %d tickets", 
                    technician.getFullName(), technician.getId(), interaction.getTicketCount())).append("\n");
                
                // Show service types worked on
                if (!interaction.getServiceTypes().isEmpty()) {
                    output.append(String.format("        Service Types: %s", 
                        String.join(", ", interaction.getServiceTypes()))).append("\n");
                }
                
                // Show resolution rate
                if (interaction.getClosedTicketCount() > 0) {
                    double resolutionRate = (double) interaction.getClosedTicketCount() / interaction.getTicketCount() * 100;
                    output.append(String.format("        Resolution Rate: %.1f%% (%d resolved)", 
                        resolutionRate, interaction.getClosedTicketCount())).append("\n");
                }
                
                // Show date range
                if (interaction.getFirstInteraction() != null && interaction.getLastInteraction() != null) {
                    output.append(String.format("        Period: %s - %s", 
                        interaction.getFirstInteraction().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
                        interaction.getLastInteraction().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))).append("\n");
                }
            }
            
            output.append("\n");
        }
        
        // Top relationships analysis
        if (totalRelationships > 5) {
            output.append("🏆 Top Client-Technician Relationships:\n");
            
            List<ClientTechnicianPair> topRelationships = historyData.entrySet().stream()
                .flatMap(clientEntry -> 
                    clientEntry.getValue().entrySet().stream()
                        .map(techEntry -> new ClientTechnicianPair(
                            clientEntry.getKey(),
                            techEntry.getKey(),
                            techEntry.getValue()
                        ))
                )
                .sorted((p1, p2) -> Integer.compare(p2.interaction.getTicketCount(), p1.interaction.getTicketCount()))
                .limit(5)
                .collect(Collectors.toList());
            
            for (int i = 0; i < topRelationships.size(); i++) {
                ClientTechnicianPair pair = topRelationships.get(i);
                output.append(String.format("   %d. %s ↔ %s: %d interactions\n",
                    i + 1,
                    pair.client.getFullName(),
                    pair.technician.getFullName(),
                    pair.interaction.getTicketCount()
                ));
            }
            output.append("\n");
        }
        
        return output.toString();
    }

    /**
     * Inner class to track technician interactions with a client
     */
    public static class TechnicianInteraction {
        private final Technician technician;
        private final List<Ticket> tickets = new ArrayList<>();
        
        public TechnicianInteraction(Technician technician) {
            this.technician = technician;
        }
        
        public void addTicket(Ticket ticket) {
            tickets.add(ticket);
        }
        
        public int getTicketCount() {
            return tickets.size();
        }
        
        public int getClosedTicketCount() {
            return (int) tickets.stream().filter(Ticket::isClosed).count();
        }
        
        public List<String> getServiceTypes() {
            return tickets.stream()
                .map(Ticket::getServiceType)
                .filter(serviceType -> serviceType != null)
                .distinct()
                .collect(Collectors.toList());
        }
        
        public LocalDateTime getFirstInteraction() {
            return tickets.stream()
                .map(Ticket::getCreatedAt)
                .filter(date -> date != null)
                .min(LocalDateTime::compareTo)
                .orElse(null);
        }
        
        public LocalDateTime getLastInteraction() {
            return tickets.stream()
                .map(Ticket::getCreatedAt)
                .filter(date -> date != null)
                .max(LocalDateTime::compareTo)
                .orElse(null);
        }
        
        // Getters
        public Technician getTechnician() { return technician; }
        public List<Ticket> getTickets() { return tickets; }
    }
    
    /**
     * Helper class for top relationships analysis
     */
    private static class ClientTechnicianPair {
        final Client client;
        final Technician technician;
        final TechnicianInteraction interaction;
        
        ClientTechnicianPair(Client client, Technician technician, TechnicianInteraction interaction) {
            this.client = client;
            this.technician = technician;
            this.interaction = interaction;
        }
    }
} 