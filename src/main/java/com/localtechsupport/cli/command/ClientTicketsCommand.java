package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.Client;
import com.localtechsupport.cli.model.Ticket;
import com.localtechsupport.cli.client.ApiException;
import com.localtechsupport.cli.util.JsonFormatter;
import com.localtechsupport.cli.formatter.ClientTicketsFormatter;
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
 * Command to display tickets for each client
 * 
 * This command answers the question: "Show me tickets for each client"
 * It fetches all clients and their associated tickets, then displays them in the requested format.
 */
@Command(
    name = "client-tickets",
    description = "Show tickets for each client in the system",
    mixinStandardHelpOptions = true
)
public class ClientTicketsCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(ClientTicketsCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Option(
        names = {"-c", "--client-id"},
        description = "Filter by specific client ID"
    )
    private Long clientId;

    @Option(
        names = {"-s", "--status"},
        description = "Filter tickets by status (OPEN, CLOSED)"
    )
    private String ticketStatus;

    @Override
    public Integer call() throws Exception {
        try {
            if (parent.isVerbose()) {
                System.out.println("🔍 Connecting to server: " + parent.getServerUrl());
            }
            
            ApiService apiService = new ApiService(parent.getServerUrl());
            
            if (parent.isVerbose()) {
                System.out.println("📋 Fetching client tickets data...");
            }
            
            // Fetch all clients
            List<Client> clients = apiService.getAllClients();
            if (parent.isVerbose()) {
                System.out.printf("📊 Processing %d clients...%n", clients.size());
            }
            
            // Build map of client -> tickets
            Map<Client, List<Ticket>> clientTicketsMap = new LinkedHashMap<>();
            
            for (Client client : clients) {
                List<Ticket> tickets = apiService.getTicketsByClient(client.getId());
                clientTicketsMap.put(client, tickets);
            }
            
            if (parent.isVerbose()) {
                System.out.println("✅ Successfully fetched client tickets data");
            }
            
            // Format and display output
            String output = formatOutput(clientTicketsMap, parent.getOutputFormat(), parent.getServerUrl());
            if (!output.trim().isEmpty()) {
                System.out.println(output);
            }
            
            return 0;
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching client tickets: " + e.getMessage());
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            return 1;
        }
    }

    /**
     * Fetch client tickets data from the API
     */
    private Map<Client, List<Ticket>> fetchClientTicketsData(ApiService apiService, boolean verbose) throws ApiException {
        Map<Client, List<Ticket>> clientTicketsMap = new HashMap<>();
        
        if (clientId != null) {
            // Fetch specific client and their tickets
            List<Client> allClients = apiService.getAllClients();
            Client targetClient = allClients.stream()
                .filter(c -> c.getId().equals(clientId))
                .findFirst()
                .orElse(null);
                
            if (targetClient == null) {
                throw new ApiException("Client with ID " + clientId + " not found", 404);
            }
            
            List<Ticket> tickets = apiService.getTicketsByClient(clientId);
            tickets = filterTickets(tickets);
            clientTicketsMap.put(targetClient, tickets);
            
        } else {
            // Fetch all clients and their tickets
            List<Client> clients = apiService.getAllClients();
            
            if (verbose) {
                System.out.println("📊 Processing " + clients.size() + " clients...");
            }
            
            // Fetch tickets for each client
            for (Client client : clients) {
                List<Ticket> tickets = apiService.getTicketsByClient(client.getId());
                tickets = filterTickets(tickets);
                clientTicketsMap.put(client, tickets);
            }
        }
        
        return clientTicketsMap;
    }

    /**
     * Filter tickets based on command options
     */
    private List<Ticket> filterTickets(List<Ticket> tickets) {
        if (ticketStatus != null) {
            return tickets.stream()
                .filter(t -> ticketStatus.equalsIgnoreCase(t.getStatus()))
                .collect(Collectors.toList());
        }
        return tickets;
    }

    /**
     * Format the output based on the requested format
     */
    private String formatOutput(Map<Client, List<Ticket>> clientTicketsMap, String format, String serverUrl) {
        switch (format.toLowerCase()) {
            case "json":
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                return JsonFormatter.withMetadata(
                    "Client Tickets Report", 
                    clientTicketsMap, 
                    serverUrl, 
                    timestamp
                );
                
            case "table":
            default:
                // Use professional formatter for table output (and as default)
                ClientTicketsFormatter formatter = new ClientTicketsFormatter();
                // Display the table AND return summary data
                formatter.displayClientTicketsReport(clientTicketsMap, serverUrl);
                
                // Return a simple summary for menu context
                long totalTickets = clientTicketsMap.values().stream().mapToLong(List::size).sum();
                return String.format("Displayed report for %d clients with %d total tickets", 
                    clientTicketsMap.size(), totalTickets);
        }
    }
} 