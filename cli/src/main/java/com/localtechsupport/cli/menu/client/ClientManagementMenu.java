package com.localtechsupport.cli.menu.client;

import com.localtechsupport.cli.menu.BaseMenu;
import com.localtechsupport.cli.menu.Menu;
import com.localtechsupport.cli.menu.MenuOption;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.util.DisplayUtils;
import com.localtechsupport.cli.client.ApiException;
import com.localtechsupport.cli.model.Client;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Scanner;

/**
 * Main client management menu providing access to all client operations
 * 
 * This menu offers CRUD operations for clients including:
 * - View all clients
 * - Search clients 
 * - View client details
 * - Create new client
 * - Edit existing client
 * - Change client status
 * - Delete client
 */
public class ClientManagementMenu extends BaseMenu {

    private static final Logger logger = LoggerFactory.getLogger(ClientManagementMenu.class);

    public ClientManagementMenu(Menu parentMenu) {
        super(parentMenu);
        logger.debug("ClientManagementMenu initialized");
    }

    @Override
    protected String getMenuTitle() {
        return "CLIENT MANAGEMENT";
    }

    @Override
    protected void displayCustomContent() {
        try {
            // Display current system status
            List<Client> allClients = apiService.getAllClients();
            long activeClients = allClients.stream().filter(Client::isActive).count();
            long suspendedClients = allClients.size() - activeClients;
            
            System.out.println("📊 Current System Status:");
            System.out.printf("    Total Clients: %d (%d active, %d suspended)%n", 
                allClients.size(), activeClients, suspendedClients);
            System.out.println("    Recent Activity: Loading...");
            System.out.println();
            
        } catch (ApiException e) {
            logger.warn("Could not load client statistics: {}", e.getMessage());
            System.out.println("📊 Current System Status: Unable to load statistics");
            System.out.println();
        }
    }

    @Override
    protected void initializeMenuOptions() {
        addActionOption(1, "View All Clients", "List all clients with status",
            this::viewAllClients);
            
        addActionOption(2, "Search Clients", "Find clients by name/email/phone", 
            this::searchClients);
            
        addActionOption(3, "View Client Details", "Detailed view with tickets/history",
            this::viewClientDetails);
            
        addActionOption(4, "Create New Client", "Add new client to system",
            this::createNewClient);
            
        addActionOption(5, "Edit Client", "Update client information",
            this::editClient);
            
        addActionOption(6, "Client Status", "Activate/suspend client accounts",
            this::manageClientStatus);
            
        addActionOption(7, "Delete Client", "Remove client (with confirmation)",
            this::deleteClient);
            
        addActionOption(8, "Client Reports", "Statistics and analytics",
            this::clientReports);
    }

    // ==================== ACTION METHODS ====================

    private void viewAllClients() {
        DisplayUtils.printHeader("ALL CLIENTS");
        
        try {
            List<Client> clients = apiService.getAllClients();
            
            if (clients.isEmpty()) {
                System.out.println("No clients found in the system.");
                return;
            }
            
            System.out.printf("%-5s %-20s %-30s %-15s %-12s %-20s%n", 
                "ID", "Name", "Email", "Phone", "Status", "Last Updated");
            System.out.println("────────────────────────────────────────────────────────────────────────────────────────────────────────");
            
            for (Client client : clients) {
                String status = client.isActive() ? "🟢 ACTIVE" : "🔴 SUSPENDED";
                String lastUpdated = client.getUpdatedAt() != null ? 
                    client.getUpdatedAt().toLocalDate().toString() : "N/A";
                
                System.out.printf("%-5d %-20s %-30s %-15s %-12s %-20s%n",
                    client.getId(),
                    client.getFullName(),
                    client.getEmail(),
                    client.getPhone(),
                    status,
                    lastUpdated
                );
            }
            
            System.out.printf("%nTotal: %d clients%n", clients.size());
            
        } catch (ApiException e) {
            DisplayUtils.printError("Failed to load clients: " + e.getMessage());
            logger.error("Failed to load clients", e);
        }
    }

    private void searchClients() {
        DisplayUtils.printHeader("SEARCH CLIENTS");
        
        try {
            System.out.println("🔍 Search Options:");
            System.out.println("  1. Search by Name (first or last name)");
            System.out.println("  2. Search by Email");
            System.out.println("  3. Search by Phone");
            System.out.println("  4. Search by Status (active/suspended)");
            System.out.println("  5. View All Clients");
            System.out.println();
            System.out.print("Enter your choice (1-5, or 'b' to go back): ");
            
            String choice = scanner.nextLine().trim();
            
            if (choice.equalsIgnoreCase("b") || choice.equalsIgnoreCase("back")) {
                return;
            }
            
            List<Client> allClients = apiService.getAllClients();
            List<Client> filteredClients;
            String searchTerm;
            
            switch (choice) {
                case "1":
                    System.out.print("Enter name to search for: ");
                    final String nameSearch = scanner.nextLine().trim().toLowerCase();
                    filteredClients = allClients.stream()
                        .filter(c -> c.getFirstName().toLowerCase().contains(nameSearch) ||
                                   c.getLastName().toLowerCase().contains(nameSearch) ||
                                   c.getFullName().toLowerCase().contains(nameSearch))
                        .collect(Collectors.toList());
                    searchTerm = nameSearch;
                    break;
                    
                case "2":
                    System.out.print("Enter email to search for: ");
                    final String emailSearch = scanner.nextLine().trim().toLowerCase();
                    filteredClients = allClients.stream()
                        .filter(c -> c.getEmail().toLowerCase().contains(emailSearch))
                        .collect(Collectors.toList());
                    searchTerm = emailSearch;
                    break;
                    
                case "3":
                    System.out.print("Enter phone number to search for: ");
                    final String phoneSearch = scanner.nextLine().trim();
                    filteredClients = allClients.stream()
                        .filter(c -> c.getPhone().contains(phoneSearch))
                        .collect(Collectors.toList());
                    searchTerm = phoneSearch;
                    break;
                    
                case "4":
                    System.out.println("Select status:");
                    System.out.println("  a. Active clients only");
                    System.out.println("  s. Suspended clients only");
                    System.out.print("Enter choice (a/s): ");
                    String statusChoice = scanner.nextLine().trim().toLowerCase();
                    
                    if (statusChoice.equals("a")) {
                        filteredClients = allClients.stream()
                            .filter(Client::isActive)
                            .collect(Collectors.toList());
                        searchTerm = "active clients";
                    } else if (statusChoice.equals("s")) {
                        filteredClients = allClients.stream()
                            .filter(c -> !c.isActive())
                            .collect(Collectors.toList());
                        searchTerm = "suspended clients";
                    } else {
                        DisplayUtils.printError("Invalid choice. Please select 'a' for active or 's' for suspended.");
                        return;
                    }
                    break;
                    
                case "5":
                    filteredClients = new ArrayList<>(allClients);
                    searchTerm = "all clients";
                    break;
                    
                default:
                    DisplayUtils.printError("Invalid choice. Please select 1-5.");
                    return;
            }
            
            // Display search results
            System.out.println();
            if (filteredClients.isEmpty()) {
                System.out.println("🔍 No clients found matching your search criteria.");
                if (!searchTerm.isEmpty() && !searchTerm.equals("all clients") && 
                    !searchTerm.equals("active clients") && !searchTerm.equals("suspended clients")) {
                    System.out.println("   Search term: \"" + searchTerm + "\"");
                }
                return;
            }
            
            System.out.println("🔍 Search Results" + (searchTerm.isEmpty() ? "" : " for \"" + searchTerm + "\"") + ":");
            System.out.printf("   Found %d client(s)%n", filteredClients.size());
            System.out.println();
            
            // Display results in table format
            System.out.printf("%-5s %-25s %-35s %-15s %-12s%n", 
                "ID", "Name", "Email", "Phone", "Status");
            System.out.println("─────────────────────────────────────────────────────────────────────────────────────────────────");
            
            for (Client client : filteredClients) {
                String status = client.isActive() ? "🟢 ACTIVE" : "🔴 SUSPENDED";
                System.out.printf("%-5d %-25s %-35s %-15s %-12s%n",
                    client.getId(),
                    client.getFullName(),
                    client.getEmail(),
                    client.getPhone(),
                    status
                );
            }
            
            System.out.println();
            System.out.print("Enter client ID to view details, or press Enter to continue: ");
            String idInput = scanner.nextLine().trim();
            
            if (!idInput.isEmpty()) {
                try {
                    Long clientId = Long.parseLong(idInput);
                    Client selectedClient = filteredClients.stream()
                        .filter(c -> c.getId().equals(clientId))
                        .findFirst()
                        .orElse(null);
                    
                    if (selectedClient != null) {
                        System.out.println();
                        displayClientSummary(selectedClient);
                    } else {
                        DisplayUtils.printError("Client ID not found in search results.");
                    }
                } catch (NumberFormatException e) {
                    DisplayUtils.printError("Invalid ID format.");
                }
            }
            
        } catch (ApiException e) {
            DisplayUtils.printError("Failed to search clients: " + e.getMessage());
            logger.error("Failed to search clients", e);
        } catch (Exception e) {
            DisplayUtils.printError("Unexpected error: " + e.getMessage());
            logger.error("Unexpected error during client search", e);
        }
    }

    private void viewClientDetails() {
        DisplayUtils.printHeader("CLIENT DETAILS");
        
        try {
            // Get all clients for selection
            List<Client> clients = apiService.getAllClients();
            
            if (clients.isEmpty()) {
                System.out.println("No clients found in the system.");
                return;
            }
            
            // Display clients for selection
            System.out.println("📋 Select a client to view details:");
            System.out.println();
            System.out.printf("%-5s %-25s %-35s %-15s%n", "ID", "Name", "Email", "Status");
            System.out.println("─────────────────────────────────────────────────────────────────────────────────");
            
            for (Client client : clients) {
                String status = client.isActive() ? "🟢 ACTIVE" : "🔴 SUSPENDED";
                System.out.printf("%-5d %-25s %-35s %-15s%n",
                    client.getId(),
                    client.getFullName(),
                    client.getEmail(),
                    status
                );
            }
            
            System.out.println();
            System.out.print("Enter client ID to view details (or 'b' to go back): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("b") || input.equalsIgnoreCase("back")) {
                return;
            }
            
            try {
                Long clientId = Long.parseLong(input);
                Client selectedClient = clients.stream()
                    .filter(c -> c.getId().equals(clientId))
                    .findFirst()
                    .orElse(null);
                
                if (selectedClient == null) {
                    DisplayUtils.printError("Client with ID " + clientId + " not found.");
                    return;
                }
                
                // Display detailed client information
                System.out.println();
                System.out.println("╔════════════════════════════════════════════════════════════════╗");
                System.out.printf("║                CLIENT DETAILS - %-27s║%n", selectedClient.getFullName());
                System.out.println("╚════════════════════════════════════════════════════════════════╝");
                System.out.println();
                
                System.out.println("👤 Personal Information");
                System.out.println("────────────────────────────────────────────────────────────────");
                System.out.printf("  Name:          %s%n", selectedClient.getFullName());
                System.out.printf("  Email:         %s%n", selectedClient.getEmail());
                System.out.printf("  Phone:         %s%n", selectedClient.getPhone());
                System.out.printf("  Address:       %s%n", 
                    selectedClient.getAddress() != null ? selectedClient.getAddress() : "Not provided");
                
                String statusDisplay = selectedClient.isActive() ? "🟢 ACTIVE" : "🔴 SUSPENDED";
                System.out.printf("  Status:        %s%n", statusDisplay);
                
                if (selectedClient.getCreatedAt() != null) {
                    System.out.printf("  Member Since:  %s%n", selectedClient.getCreatedAt().toString());
                }
                if (selectedClient.getUpdatedAt() != null) {
                    System.out.printf("  Last Updated:  %s%n", selectedClient.getUpdatedAt().toString());
                }
                
                System.out.println();
                System.out.println("📝 Notes");
                System.out.println("────────────────────────────────────────────────────────────────");
                System.out.printf("  %s%n", 
                    selectedClient.getNotes() != null && !selectedClient.getNotes().trim().isEmpty() 
                        ? selectedClient.getNotes() : "No notes available");
                
                System.out.println();
                System.out.println("🎫 Ticket Information");
                System.out.println("────────────────────────────────────────────────────────────────");
                System.out.println("  Use main menu → Ticket Management to view detailed ticket information");
                System.out.printf("  Client ID: %d (%s)%n", clientId, selectedClient.getFullName());
                
                System.out.println();
                System.out.println("💡 Quick Actions Available");
                System.out.println("────────────────────────────────────────────────────────────────");
                System.out.println("  To manage this client, use the main Client Management menu:");
                System.out.println("  • Edit Client Information (option 5)");
                System.out.println("  • Change Client Status (option 6)");
                System.out.println("  • Delete Client (option 7)");
                System.out.println();
                System.out.print("Press Enter to continue...");
                scanner.nextLine();
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid ID format. Please enter a valid number.");
            }
            
        } catch (ApiException e) {
            DisplayUtils.printError("Failed to load client details: " + e.getMessage());
            logger.error("Failed to load client details", e);
        } catch (Exception e) {
            DisplayUtils.printError("Unexpected error: " + e.getMessage());
            logger.error("Unexpected error during client details view", e);
        }
    }

    private void createNewClient() {
        DisplayUtils.printHeader("CREATE NEW CLIENT");
        
        try {
            ClientBuilder clientBuilder = new ClientBuilder(scanner);
            Client newClient = clientBuilder.buildNewClient();
            
            System.out.println("\n📋 Please review the client information:");
            displayClientSummary(newClient);
            
            System.out.print("\nCreate this client? (y/n): ");
            String confirm = scanner.nextLine().trim().toLowerCase();
            
            if (confirm.equals("y") || confirm.equals("yes")) {
                Client createdClient = apiService.createClient(newClient);
                System.out.printf("✅ Client %s created (ID: %d)\n", 
                    createdClient.getFullName(), createdClient.getId());
                logger.info("Created new client: {} {}", createdClient.getFirstName(), createdClient.getLastName());
            } else {
                System.out.println("Client creation cancelled.");
            }
            
        } catch (ApiException e) {
            DisplayUtils.printError("Failed to create client: " + e.getMessage());
            logger.error("Failed to create client", e);
        } catch (Exception e) {
            DisplayUtils.printError("Unexpected error: " + e.getMessage());
            logger.error("Unexpected error during client creation", e);
        }
    }

    private void editClient() {
        DisplayUtils.printHeader("EDIT CLIENT");
        
        try {
            // Get all clients for selection
            List<Client> clients = apiService.getAllClients();
            
            if (clients.isEmpty()) {
                System.out.println("No clients found in the system.");
                return;
            }
            
            // Display clients for selection
            System.out.println("📋 Select a client to edit:");
            System.out.println();
            System.out.printf("%-5s %-25s %-35s %-15s%n", "ID", "Name", "Email", "Status");
            System.out.println("─────────────────────────────────────────────────────────────────────────────────");
            
            for (Client client : clients) {
                String status = client.isActive() ? "🟢 ACTIVE" : "🔴 SUSPENDED";
                System.out.printf("%-5d %-25s %-35s %-15s%n",
                    client.getId(),
                    client.getFullName(),
                    client.getEmail(),
                    status
                );
            }
            
            System.out.println();
            System.out.print("Enter client ID to edit (or 'b' to go back): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("b") || input.equalsIgnoreCase("back")) {
                return;
            }
            
            try {
                Long clientId = Long.parseLong(input);
                Client selectedClient = clients.stream()
                    .filter(c -> c.getId().equals(clientId))
                    .findFirst()
                    .orElse(null);
                
                if (selectedClient == null) {
                    DisplayUtils.printError("Client with ID " + clientId + " not found.");
                    return;
                }
                
                // Show current client information
                System.out.println("\n📋 Current Client Information:");
                displayClientSummary(selectedClient);
                
                // Collect updates using ClientBuilder
                ClientBuilder clientBuilder = new ClientBuilder(scanner);
                Client updatedClient = clientBuilder.buildClientUpdate(selectedClient);
                
                if (updatedClient == null) {
                    System.out.println("Edit cancelled.");
                    return;
                }
                
                // Show changes summary
                System.out.println("\n📋 Changes Summary:");
                displayClientUpdateSummary(selectedClient, updatedClient);
                
                System.out.print("\nSave these changes? (y/n): ");
                String confirm = scanner.nextLine().trim().toLowerCase();
                
                if (confirm.equals("y") || confirm.equals("yes")) {
                    Client savedClient = apiService.updateClient(clientId, updatedClient);
                    System.out.printf("✅ %s updated\n", savedClient.getFullName());
                    
                    System.out.println("\n📋 Updated Client Information:");
                    displayClientSummary(savedClient);
                    logger.info("Updated client: {} {}", savedClient.getFirstName(), savedClient.getLastName());
                } else {
                    System.out.println("Changes cancelled.");
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid ID format. Please enter a valid number.");
            }
            
        } catch (ApiException e) {
            DisplayUtils.printError("Failed to edit client: " + e.getMessage());
            logger.error("Failed to edit client", e);
        } catch (Exception e) {
            DisplayUtils.printError("Unexpected error: " + e.getMessage());
            logger.error("Unexpected error during client edit", e);
        }
    }

    private void manageClientStatus() {
        DisplayUtils.printHeader("CLIENT STATUS MANAGEMENT");
        
        System.out.println("ℹ️  Status Management Information:");
        System.out.println("   This feature requests status changes and tracks them in client notes.");
        System.out.println("   Server business rules may prevent actual status changes through this interface.");
        System.out.println("   Contact system administrator if manual status changes are needed.");
        System.out.println();
        
        try {
            // Get all clients for selection
            List<Client> clients = apiService.getAllClients();
            
            if (clients.isEmpty()) {
                System.out.println("No clients found in the system.");
                return;
            }
            
            // Display clients with their current status
            System.out.println("📋 Select a client to change status:");
            System.out.println();
            System.out.printf("%-5s %-25s %-35s %-15s%n", "ID", "Name", "Email", "Current Status");
            System.out.println("─────────────────────────────────────────────────────────────────────────────────");
            
            for (Client client : clients) {
                String status = client.isActive() ? "🟢 ACTIVE" : "🔴 SUSPENDED";
                System.out.printf("%-5d %-25s %-35s %-15s%n",
                    client.getId(),
                    client.getFullName(),
                    client.getEmail(),
                    status
                );
            }
            
            System.out.println();
            System.out.print("Enter client ID to change status (or 'b' to go back): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("b") || input.equalsIgnoreCase("back")) {
                return;
            }
            
            try {
                Long clientId = Long.parseLong(input);
                Client selectedClient = clients.stream()
                    .filter(c -> c.getId().equals(clientId))
                    .findFirst()
                    .orElse(null);
                
                if (selectedClient == null) {
                    DisplayUtils.printError("Client with ID " + clientId + " not found.");
                    return;
                }
                
                // Show current status and available actions
                System.out.println("\n📋 Current Status: " + selectedClient.getFullName());
                String currentStatus = selectedClient.isActive() ? "🟢 ACTIVE" : "🔴 SUSPENDED";
                System.out.println("Status: " + currentStatus);
                System.out.println();
                
                if (selectedClient.isActive()) {
                    System.out.println("🔹 Available Actions:");
                    System.out.println("  1. Suspend Client - Deactivate client account");
                    System.out.println("  2. Keep Current Status - No changes");
                    System.out.println();
                    System.out.print("Enter your choice (1-2): ");
                    
                    String choice = scanner.nextLine().trim();
                    
                    if (choice.equals("1")) {
                        System.out.println();
                        System.out.println("⚠️  Suspending client will:");
                        System.out.println("   • Prevent new ticket creation");
                        System.out.println("   • Mark client as inactive in the system");
                        System.out.println("   • Existing tickets remain unchanged");
                        System.out.println();
                        System.out.print("Reason for suspension (optional): ");
                        String reason = scanner.nextLine().trim();
                        
                        System.out.print("Confirm suspension? (y/n): ");
                        String confirm = scanner.nextLine().trim().toLowerCase();
                        
                        if (confirm.equals("y") || confirm.equals("yes")) {
                            // Update client status to suspended
                            Client updatedClient = new Client();
                            updatedClient.setId(selectedClient.getId());
                            updatedClient.setFirstName(selectedClient.getFirstName());
                            updatedClient.setLastName(selectedClient.getLastName());
                            updatedClient.setEmail(selectedClient.getEmail());
                            updatedClient.setPhone(selectedClient.getPhone());
                            updatedClient.setAddress(selectedClient.getAddress());
                            
                            // Add suspension note to track the request
                            String suspensionNote = selectedClient.getNotes() != null ? selectedClient.getNotes() : "";
                            if (reason.isEmpty()) {
                                suspensionNote += " | Suspension requested";
                            } else {
                                suspensionNote += " | Suspension requested: " + reason;
                            }
                            updatedClient.setNotes(suspensionNote);
                            updatedClient.setStatus("SUSPENDED");
                            updatedClient.setActive(false);
                            
                            try {
                                Client result = apiService.updateClient(clientId, updatedClient);
                                
                                // Check if the status change was actually applied
                                if (result.isActive() && "ACTIVE".equals(result.getStatus())) {
                                    DisplayUtils.printError("⚠️  Status change not applied by server.");
                                    System.out.println("   The server has business rules that prevent status changes through this endpoint.");
                                    System.out.println("   Note has been added to track the suspension request: \"" + reason + "\"");
                                    System.out.println("   Contact system administrator for manual status changes.");
                                    logger.warn("Server prevented status change for client ID: {} - added note only", clientId);
                                } else {
                                    DisplayUtils.printSuccess("✅ Client suspended successfully!");
                                    logger.info("Suspended client: {} {} (ID: {})", 
                                        result.getFirstName(), result.getLastName(), clientId);
                                }
                            } catch (Exception e) {
                                DisplayUtils.printError("Failed to suspend client: " + e.getMessage());
                                logger.error("Failed to suspend client ID: " + clientId, e);
                            }
                        } else {
                            System.out.println("Suspension cancelled.");
                        }
                    }
                } else {
                    System.out.println("🔹 Available Actions:");
                    System.out.println("  1. Activate Client - Reactivate client account");
                    System.out.println("  2. Keep Current Status - No changes");
                    System.out.println();
                    System.out.print("Enter your choice (1-2): ");
                    
                    String choice = scanner.nextLine().trim();
                    
                    if (choice.equals("1")) {
                        System.out.println();
                        System.out.println("✅ Activating client will:");
                        System.out.println("   • Allow new ticket creation");
                        System.out.println("   • Mark client as active in the system");
                        System.out.println("   • Restore full system access");
                        System.out.println();
                        System.out.print("Confirm activation? (y/n): ");
                        String confirm = scanner.nextLine().trim().toLowerCase();
                        
                        if (confirm.equals("y") || confirm.equals("yes")) {
                            // Update client status to active
                            Client updatedClient = new Client();
                            updatedClient.setId(selectedClient.getId());
                            updatedClient.setFirstName(selectedClient.getFirstName());
                            updatedClient.setLastName(selectedClient.getLastName());
                            updatedClient.setEmail(selectedClient.getEmail());
                            updatedClient.setPhone(selectedClient.getPhone());
                            updatedClient.setAddress(selectedClient.getAddress());
                            
                            // Add activation note to track the request
                            String activationNote = selectedClient.getNotes() != null ? selectedClient.getNotes() : "";
                            activationNote += " | Activation requested";
                            updatedClient.setNotes(activationNote);
                            updatedClient.setStatus("ACTIVE");
                            updatedClient.setActive(true);
                            
                            try {
                                Client result = apiService.updateClient(clientId, updatedClient);
                                
                                // Check if the status change was actually applied
                                if (!result.isActive() && "SUSPENDED".equals(result.getStatus())) {
                                    DisplayUtils.printError("⚠️  Status change not applied by server.");
                                    System.out.println("   The server has business rules that prevent status changes through this endpoint.");
                                    System.out.println("   Note has been added to track the activation request.");
                                    System.out.println("   Contact system administrator for manual status changes.");
                                    logger.warn("Server prevented status change for client ID: {} - added note only", clientId);
                                } else {
                                    DisplayUtils.printSuccess("✅ Client activated successfully!");
                                    logger.info("Activated client: {} {} (ID: {})", 
                                        result.getFirstName(), result.getLastName(), clientId);
                                }
                            } catch (Exception e) {
                                DisplayUtils.printError("Failed to activate client: " + e.getMessage());
                                logger.error("Failed to activate client ID: " + clientId, e);
                            }
                        } else {
                            System.out.println("Activation cancelled.");
                        }
                    }
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid ID format. Please enter a valid number.");
            }
            
        } catch (ApiException e) {
            DisplayUtils.printError("Failed to manage client status: " + e.getMessage());
            logger.error("Failed to manage client status", e);
        } catch (Exception e) {
            DisplayUtils.printError("Unexpected error: " + e.getMessage());
            logger.error("Unexpected error during client status management", e);
        }
    }

    private void deleteClient() {
        DisplayUtils.printHeader("DELETE CLIENT");
        
        try {
            // Get all clients for selection
            List<Client> clients = apiService.getAllClients();
            
            if (clients.isEmpty()) {
                System.out.println("No clients found in the system.");
                return;
            }
            
            // Display clients for selection
            System.out.println("📋 Select a client to delete:");
            System.out.println();
            System.out.printf("%-5s %-25s %-35s %-15s%n", "ID", "Name", "Email", "Status");
            System.out.println("─────────────────────────────────────────────────────────────────────────────────");
            
            for (Client client : clients) {
                String status = client.isActive() ? "🟢 ACTIVE" : "🔴 SUSPENDED";
                System.out.printf("%-5d %-25s %-35s %-15s%n",
                    client.getId(),
                    client.getFullName(),
                    client.getEmail(),
                    status
                );
            }
            
            System.out.println();
            System.out.print("Enter client ID to delete (or 'b' to go back): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("b") || input.equalsIgnoreCase("back")) {
                return;
            }
            
            try {
                Long clientId = Long.parseLong(input);
                Client selectedClient = clients.stream()
                    .filter(c -> c.getId().equals(clientId))
                    .findFirst()
                    .orElse(null);
                
                if (selectedClient == null) {
                    DisplayUtils.printError("Client with ID " + clientId + " not found.");
                    return;
                }
                
                // Show client information and impact warning
                System.out.println("\n⚠️  CLIENT DELETION WARNING");
                System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                System.out.println();
                displayClientSummary(selectedClient);
                
                System.out.println("\n🚨 IMPORTANT: Deleting this client will:");
                System.out.println("   • Remove the client permanently from the system");
                System.out.println("   • Potentially affect associated tickets and appointments");
                System.out.println("   • This action CANNOT be undone");
                System.out.println();
                
                // Check if client is active
                if (selectedClient.isActive()) {
                    System.out.println("⛔ Cannot delete ACTIVE client.");
                    System.out.println("   Please suspend the client first, then try deletion.");
                    System.out.println("   This is a safety measure to prevent accidental deletion.");
                    System.out.println();
                    System.out.print("Would you like to suspend this client instead? (y/n): ");
                    String suspendChoice = scanner.nextLine().trim().toLowerCase();
                    
                    if (suspendChoice.equals("y") || suspendChoice.equals("yes")) {
                        // Redirect to status management logic
                        System.out.print("Reason for suspension: ");
                        String reason = scanner.nextLine().trim();
                        
                        Client updatedClient = new Client();
                        updatedClient.setId(selectedClient.getId());
                        updatedClient.setFirstName(selectedClient.getFirstName());
                        updatedClient.setLastName(selectedClient.getLastName());
                        updatedClient.setEmail(selectedClient.getEmail());
                        updatedClient.setPhone(selectedClient.getPhone());
                        updatedClient.setAddress(selectedClient.getAddress());
                        updatedClient.setNotes(selectedClient.getNotes() + " | Suspended: " + reason);
                        updatedClient.setStatus("SUSPENDED");
                        updatedClient.setActive(false);
                        
                        apiService.updateClient(clientId, updatedClient);
                        DisplayUtils.printSuccess("✅ Client suspended successfully!");
                        System.out.println("   You can now delete the client if still needed.");
                    }
                    return;
                }
                
                // Multi-step confirmation for suspended clients
                System.out.println("🔒 DELETION CONFIRMATION (Step 1 of 3)");
                System.out.print("Are you sure you want to delete this client? (yes/no): ");
                String confirm1 = scanner.nextLine().trim().toLowerCase();
                
                if (!confirm1.equals("yes")) {
                    System.out.println("Deletion cancelled.");
                    return;
                }
                
                System.out.println("\n🔒 DELETION CONFIRMATION (Step 2 of 3)");
                System.out.print("Type the client's full name to confirm: ");
                String nameConfirm = scanner.nextLine().trim();
                
                if (!nameConfirm.equals(selectedClient.getFullName())) {
                    DisplayUtils.printError("Name doesn't match. Deletion cancelled for safety.");
                    return;
                }
                
                System.out.println("\n🔒 FINAL CONFIRMATION (Step 3 of 3)");
                System.out.println("⚠️  This is your FINAL chance to cancel!");
                System.out.print("Type 'DELETE' in all caps to permanently delete this client: ");
                String finalConfirm = scanner.nextLine().trim();
                
                if (!finalConfirm.equals("DELETE")) {
                    System.out.println("Deletion cancelled. Client remains in the system.");
                    return;
                }
                
                // Attempt deletion
                try {
                    apiService.deleteClient(clientId);
                    System.out.printf("✅ %s deleted\n", selectedClient.getFullName());
                    logger.info("Deleted client: {} {} (ID: {})", 
                        selectedClient.getFirstName(), selectedClient.getLastName(), clientId);
                    
                } catch (ApiException e) {
                    if (e.getMessage().contains("409") || e.getMessage().contains("Conflict")) {
                        DisplayUtils.printError("❌ Cannot delete client: Client has active dependencies.");
                        System.out.println("   This client may have associated tickets or appointments.");
                        System.out.println("   Please resolve all dependencies before deletion.");
                    } else {
                        throw e; // Re-throw if it's a different API error
                    }
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid ID format. Please enter a valid number.");
            }
            
        } catch (ApiException e) {
            DisplayUtils.printError("Failed to delete client: " + e.getMessage());
            logger.error("Failed to delete client", e);
        } catch (Exception e) {
            DisplayUtils.printError("Unexpected error: " + e.getMessage());
            logger.error("Unexpected error during client deletion", e);
        }
    }

    private void clientReports() {
        DisplayUtils.printHeader("CLIENT REPORTS & ANALYTICS");
        
        try {
            // Get all clients for analysis
            List<Client> allClients = apiService.getAllClients();
            
            if (allClients.isEmpty()) {
                System.out.println("No clients found in the system to generate reports.");
                return;
            }
            
            // Calculate basic statistics
            long activeClients = allClients.stream().filter(Client::isActive).count();
            long suspendedClients = allClients.stream().filter(c -> !c.isActive()).count();
            
            // Display comprehensive client statistics
            System.out.println("📊 CLIENT SYSTEM OVERVIEW");
            System.out.println("═══════════════════════════════════════════════════════════════");
            System.out.println();
            
            System.out.printf("📈 Total Clients:        %d%n", allClients.size());
            System.out.printf("✅ Active Clients:       %d (%.1f%%)%n", 
                activeClients, (activeClients * 100.0 / allClients.size()));
            System.out.printf("⏸️  Suspended Clients:    %d (%.1f%%)%n", 
                suspendedClients, (suspendedClients * 100.0 / allClients.size()));
            
            System.out.println();
            System.out.println("📋 CLIENT STATUS BREAKDOWN");
            System.out.println("───────────────────────────────────────────────────────────────");
            
            // Show active clients summary
            System.out.println();
            System.out.println("🟢 ACTIVE CLIENTS SUMMARY:");
            if (activeClients > 0) {
                System.out.printf("   %d active clients in the system%n", activeClients);
                if (activeClients <= 5) {
                    allClients.stream()
                        .filter(Client::isActive)
                        .forEach(client -> System.out.printf("   • %s (%s)%n", 
                            client.getFullName(), client.getEmail()));
                } else {
                    System.out.printf("   • Use 'View All Clients' or 'Search Clients' for detailed list%n");
                }
            } else {
                System.out.println("   No active clients found.");
            }
            
            // Show suspended clients summary  
            System.out.println();
            System.out.println("🔴 SUSPENDED CLIENTS SUMMARY:");
            if (suspendedClients > 0) {
                System.out.printf("   %d suspended clients in the system%n", suspendedClients);
                if (suspendedClients <= 5) {
                    allClients.stream()
                        .filter(c -> !c.isActive())
                        .forEach(client -> System.out.printf("   • %s (%s)%n", 
                            client.getFullName(), client.getEmail()));
                } else {
                    System.out.printf("   • Use 'Search Clients' → Status filter for detailed list%n");
                }
            } else {
                System.out.println("   No suspended clients found.");
            }
            
            System.out.println();
            System.out.println("💡 SYSTEM INSIGHTS");
            System.out.println("───────────────────────────────────────────────────────────────");
            
            // Provide insights based on data
            if (allClients.size() == 0) {
                System.out.println("  📊 No clients in system - ready for first client onboarding");
            } else if (allClients.size() < 10) {
                System.out.println("  📈 Growing client base - consider client referral programs");
            } else if (allClients.size() >= 50) {
                System.out.println("  🎉 Established client base - excellent growth!");
            }
            
            if (suspendedClients == 0 && activeClients > 0) {
                System.out.println("  ✅ Perfect client retention - all clients are active!");
            } else if (suspendedClients > activeClients) {
                System.out.println("  ⚠️  High suspension rate - review client satisfaction processes");
            }
            
            double activePercentage = allClients.size() > 0 ? (activeClients * 100.0 / allClients.size()) : 0;
            if (activePercentage >= 90) {
                System.out.println("  🌟 Excellent client health score (90%+ active)");
            } else if (activePercentage >= 75) {
                System.out.println("  👍 Good client health score (75%+ active)");
            } else if (activePercentage < 50) {
                System.out.println("  📉 Client health needs attention (<50% active)");
            }
            
            System.out.println();
            System.out.println("🔄 RELATED REPORTS");
            System.out.println("───────────────────────────────────────────────────────────────");
            System.out.println("  • Ticket Management → Reports (client ticket statistics)");
            System.out.println("  • Technician Management → Reports (client-technician interactions)");
            System.out.println("  • Appointment Management → Reports (client appointment history)");
            
            System.out.println();
            System.out.print("Press Enter to continue...");
            scanner.nextLine();
            
        } catch (ApiException e) {
            DisplayUtils.printError("Failed to generate client reports: " + e.getMessage());
            logger.error("Failed to generate client reports", e);
        } catch (Exception e) {
            DisplayUtils.printError("Unexpected error: " + e.getMessage());
            logger.error("Unexpected error during client reports generation", e);
        }
    }

    // ==================== HELPER METHODS ====================

    private void displayClientSummary(Client client) {
        System.out.println("┌─────────────────────────────────────────────────────────────┐");
        System.out.println("│                    CLIENT SUMMARY                          │");
        System.out.println("├─────────────────────────────────────────────────────────────┤");
        System.out.printf("│ Name:     %-49s │%n", client.getFullName());
        System.out.printf("│ Email:    %-49s │%n", client.getEmail());
        System.out.printf("│ Phone:    %-49s │%n", client.getPhone());
        System.out.printf("│ Address:  %-49s │%n", client.getAddress() != null ? client.getAddress() : "Not provided");
        System.out.printf("│ Notes:    %-49s │%n", client.getNotes() != null ? client.getNotes() : "None");
        System.out.printf("│ Status:   %-49s │%n", client.getStatus());
        System.out.println("└─────────────────────────────────────────────────────────────┘");
    }

    private void displayClientUpdateSummary(Client original, Client updated) {
        System.out.println("┌─────────────────────────────────────────────────────────────┐");
        System.out.println("│                    CLIENT UPDATE SUMMARY                      │");
        System.out.println("├─────────────────────────────────────────────────────────────┤");
        System.out.printf("│ Name:     %-49s → %-49s │%n", original.getFullName(), updated.getFullName());
        System.out.printf("│ Email:    %-49s → %-49s │%n", original.getEmail(), updated.getEmail());
        System.out.printf("│ Phone:    %-49s → %-49s │%n", original.getPhone(), updated.getPhone());
        System.out.printf("│ Address:  %-49s → %-49s │%n", original.getAddress() != null ? original.getAddress() : "Not provided", updated.getAddress() != null ? updated.getAddress() : "Not provided");
        System.out.printf("│ Notes:    %-49s → %-49s │%n", original.getNotes() != null ? original.getNotes() : "None", updated.getNotes() != null ? updated.getNotes() : "None");
        System.out.printf("│ Status:   %-49s → %-49s │%n", original.getStatus(), updated.getStatus());
        System.out.println("└─────────────────────────────────────────────────────────────┘");
    }
} 