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
    public Integer call() {
        logger.info("Executing client-tickets command");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            String outputFormat = parent.getOutputFormat();
            boolean verbose = parent.isVerbose();
            
            if (verbose) {
                System.out.println("🔍 Connecting to server: " + serverUrl);
                System.out.println("📋 Fetching client tickets data...");
            }

            // Create API service and fetch data
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Test connection first
                if (!apiService.testConnection()) {
                    System.err.println("❌ Cannot connect to server: " + serverUrl);
                    System.err.println("   Please check that the Local Tech Support Server is running.");
                    return 1;
                }

                // Fetch data
                Map<Client, List<Ticket>> clientTicketsMap = fetchClientTicketsData(apiService, verbose);
                
                if (verbose) {
                    System.out.println("✅ Successfully fetched client tickets data");
                }

                // Format and display output
                String output = formatOutput(clientTicketsMap, outputFormat, serverUrl);
                System.out.println(output);
                
                logger.info("Client tickets command completed successfully");
                return 0;

            } catch (ApiException e) {
                logger.error("API error in client-tickets command: {}", e.getMessage());
                
                System.err.println("❌ API Error: " + e.getUserFriendlyMessage());
                
                if (verbose) {
                    System.err.println("   Status Code: " + e.getStatusCode());
                    System.err.println("   Server: " + serverUrl);
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Unexpected error in client-tickets command: {}", e.getMessage(), e);
            
            System.err.println("❌ Unexpected error: " + e.getMessage());
            
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
                // Capture output to string instead of printing directly
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                java.io.PrintStream originalOut = System.out;
                try {
                    System.setOut(new java.io.PrintStream(baos));
                    formatter.displayClientTicketsReport(clientTicketsMap, serverUrl);
                    return baos.toString();
                } finally {
                    System.setOut(originalOut);
                }
        }
    }
} 