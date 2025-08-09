package com.localtechsupport.cli.menu.ticket;

import com.localtechsupport.cli.model.Ticket;
import com.localtechsupport.cli.model.Client;
import com.localtechsupport.cli.model.Technician;
import com.localtechsupport.cli.util.InputValidator;
import com.localtechsupport.cli.util.DisplayUtils;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.client.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Scanner;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Utility class for building ticket objects from user input
 * 
 * Handles collection and validation of ticket data for create/update operations
 */
public class TicketBuilder {
    
    private static final Logger logger = LoggerFactory.getLogger(TicketBuilder.class);
    private final Scanner scanner;
    private final ApiService apiService;
    
    // Available service types
    private static final List<String> SERVICE_TYPES = Arrays.asList(
        "HARDWARE", "SOFTWARE", "NETWORK"
    );
    
    // Available statuses (used only for updates)
    private static final List<String> STATUSES = Arrays.asList(
        "OPEN", "CLOSED"
    );
    
    public TicketBuilder(Scanner scanner, ApiService apiService) {
        this.scanner = scanner;
        this.apiService = apiService;
    }
    
    /**
     * Build a new ticket from user input
     * 
     * @return populated Ticket object or null if cancelled
     */
    public Ticket buildNewTicket() {
        DisplayUtils.printHeader("NEW TICKET CREATION");
        
        System.out.println("📋 Please provide the following information:");
        System.out.println("   (Enter 'cancel' at any time to abort)");
        System.out.println();
        
        try {
            // Collect required fields (matching server expectations)
            String description = collectDescription();
            if (description == null) return null;
            
            String serviceType = collectServiceType();
            if (serviceType == null) return null;
            
            Long clientId = collectClientId();
            if (clientId == null) return null;
            
            // Create ticket object (only fields the server expects)
            Ticket ticket = new Ticket();
            ticket.setDescription(description);
            ticket.setServiceType(serviceType);
            ticket.setClientId(clientId);
            // Server automatically sets: id, status=OPEN, createdAt, updatedAt, dueAt (SLA-based)
            
            // Debug logging to verify ticket object creation
            logger.info("TicketBuilder created ticket: description='{}', serviceType='{}', clientId={}", 
                ticket.getDescription(), ticket.getServiceType(), ticket.getClientId());
            
            // Show confirmation
            displayTicketSummary(ticket, "NEW TICKET SUMMARY");
            
            System.out.print("✅ Create this ticket? (y/n): ");
            String confirm = scanner.nextLine().trim().toLowerCase();
            
            if (confirm.equals("y") || confirm.equals("yes")) {
                return ticket;
            } else {
                System.out.println("❌ Ticket creation cancelled.");
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error building new ticket", e);
            DisplayUtils.printError("An error occurred while collecting ticket information.");
            return null;
        }
    }
    
    /**
     * Build updated ticket data from user input
     * 
     * @param existing the existing ticket to update
     * @return updated Ticket object or null if cancelled
     */
    public Ticket buildTicketUpdate(Ticket existing) {
        DisplayUtils.printHeader("EDIT TICKET - #" + existing.getId());
        
        System.out.println("📋 Current information (press Enter to keep current value):");
        System.out.println("   (Enter 'cancel' at any time to abort)");
        System.out.println();
        
        try {
            // Create copy of existing ticket
            Ticket updated = new Ticket();
            updated.setId(existing.getId());
            
            // Update fields (only description and service type are editable)
            String description = collectDescriptionUpdate(existing.getDescription());
            if (description == null) return null;
            updated.setDescription(description);
            
            String serviceType = collectServiceTypeUpdate(existing.getServiceType());
            if (serviceType == null) return null;
            updated.setServiceType(serviceType);
            
            // Server-managed fields - preserve existing values
            updated.setTitle(existing.getTitle());
            updated.setPriority(existing.getPriority());
            
            String status = collectStatusUpdate(existing.getStatus());
            if (status == null) return null;
            updated.setStatus(status);
            
            Long effectiveClientId = getEffectiveClientId(existing);
            Long clientId = collectClientIdUpdate(effectiveClientId);
            if (clientId == null) return null;
            updated.setClientId(clientId);
            
            LocalDateTime dueAt = collectDueDateUpdate(existing.getDueAt());
            updated.setDueAt(dueAt);
            
            // Preserve other fields
            updated.setAssignedTechnicianId(existing.getAssignedTechnicianId());
            updated.setCreatedAt(existing.getCreatedAt());
            updated.setResolvedAt(existing.getResolvedAt());
            
            // Show changes summary
            displayUpdateSummary(existing, updated);
            
            System.out.print("✅ Save these changes? (y/n): ");
            String confirm = scanner.nextLine().trim().toLowerCase();
            
            if (confirm.equals("y") || confirm.equals("yes")) {
                return updated;
            } else {
                System.out.println("❌ Update cancelled.");
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error building ticket update", e);
            DisplayUtils.printError("An error occurred while updating ticket information.");
            return null;
        }
    }
    
    // ==================== FIELD COLLECTION METHODS ====================
    

    
    private String collectDescription() {
        while (true) {
            System.out.print("Description: ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("cancel")) {
                return null;
            }
            
            if (input.isEmpty()) {
                DisplayUtils.printError("Description is required.");
                continue;
            }
            
            if (input.length() > 1000) {
                DisplayUtils.printError("Description must be 1000 characters or less.");
                continue;
            }
            
            return input;
        }
    }
    
    private String collectServiceType() {
        while (true) {
            System.out.println("Available Service Types:");
            for (int i = 0; i < SERVICE_TYPES.size(); i++) {
                System.out.printf("  %d. %s\n", i + 1, SERVICE_TYPES.get(i));
            }
            System.out.print("Select service type (1-" + SERVICE_TYPES.size() + "): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("cancel")) {
                return null;
            }
            
            try {
                int choice = Integer.parseInt(input);
                if (choice >= 1 && choice <= SERVICE_TYPES.size()) {
                    return SERVICE_TYPES.get(choice - 1);
                } else {
                    DisplayUtils.printError("Please enter a number between 1 and " + SERVICE_TYPES.size());
                }
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Please enter a valid number.");
            }
        }
    }
    

    
    private Long collectClientId() {
        try {
            List<Client> clients = apiService.getAllClients();
            
            if (clients.isEmpty()) {
                DisplayUtils.printError("No clients found in the system. Please create a client first.");
                return null;
            }
            
            while (true) {
                System.out.println("Available Clients:");
                for (int i = 0; i < Math.min(clients.size(), 10); i++) {
                    Client client = clients.get(i);
                    System.out.printf("  %d. %s (%s)\n", i + 1, client.getFullName(), client.getEmail());
                }
                
                if (clients.size() > 10) {
                    System.out.printf("  ... and %d more clients\n", clients.size() - 10);
                    System.out.println("  Or enter client ID directly");
                }
                
                System.out.print("Select client (1-" + Math.min(clients.size(), 10) + ") or enter ID: ");
                String input = scanner.nextLine().trim();
                
                if (input.equalsIgnoreCase("cancel")) {
                    return null;
                }
                
                try {
                    int choice = Integer.parseInt(input);
                    if (choice >= 1 && choice <= Math.min(clients.size(), 10)) {
                        return clients.get(choice - 1).getId();
                    } else if (choice > 10 && choice <= clients.size()) {
                        // Direct ID entry for clients beyond the display limit
                        return clients.stream()
                            .filter(c -> c.getId().equals((long) choice))
                            .findFirst()
                            .map(Client::getId)
                            .orElse(null);
                    } else {
                        // Treat as direct ID
                        Long clientId = Long.parseLong(input);
                        boolean exists = clients.stream().anyMatch(c -> c.getId().equals(clientId));
                        if (exists) {
                            return clientId;
                        } else {
                            DisplayUtils.printError("Client ID " + clientId + " not found.");
                        }
                    }
                } catch (NumberFormatException e) {
                    DisplayUtils.printError("Please enter a valid number or client ID.");
                }
            }
            
        } catch (ApiException e) {
            logger.error("Failed to fetch clients for ticket creation", e);
            DisplayUtils.printError("Failed to retrieve clients: " + e.getMessage());
            return null;
        }
    }
    

    
    // ==================== UPDATE METHODS ====================
    

    
    private String collectDescriptionUpdate(String current) {
        System.out.printf("Description [%s]: ", current != null ? 
            (current.length() > 50 ? current.substring(0, 50) + "..." : current) : "None");
        String input = scanner.nextLine().trim();
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        if (input.isEmpty()) {
            return current;
        }
        
        if (input.length() > 1000) {
            DisplayUtils.printError("Description must be 1000 characters or less.");
            return collectDescriptionUpdate(current);
        }
        
        return input;
    }
    
    private String collectServiceTypeUpdate(String current) {
        System.out.printf("Service Type [%s] - Available: %s: ", 
            current, String.join(", ", SERVICE_TYPES));
        String input = scanner.nextLine().trim();
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        if (input.isEmpty()) {
            return current;
        }
        
        String upperInput = input.toUpperCase();
        if (SERVICE_TYPES.contains(upperInput)) {
            return upperInput;
        } else {
            DisplayUtils.printError("Invalid service type. Available: " + String.join(", ", SERVICE_TYPES));
            return collectServiceTypeUpdate(current);
        }
    }
    

    
    private String collectStatusUpdate(String current) {
        System.out.printf("Status [%s] - Available: %s: ", 
            current, String.join(", ", STATUSES));
        String input = scanner.nextLine().trim();
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        if (input.isEmpty()) {
            return current;
        }
        
        String upperInput = input.toUpperCase();
        if (STATUSES.contains(upperInput)) {
            return upperInput;
        } else {
            DisplayUtils.printError("Invalid status. Available: " + String.join(", ", STATUSES));
            return collectStatusUpdate(current);
        }
    }
    
    private Long collectClientIdUpdate(Long current) {
        try {
            List<Client> clients = apiService.getAllClients();
            Client currentClient = clients.stream()
                .filter(c -> c.getId().equals(current))
                .findFirst()
                .orElse(null);
                
            System.out.printf("Client [%s]: ", 
                currentClient != null ? currentClient.getFullName() : "ID: " + current);
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("cancel")) {
                return null;
            }
            
            if (input.isEmpty()) {
                return current;
            }
            
            try {
                Long newClientId = Long.parseLong(input);
                boolean exists = clients.stream().anyMatch(c -> c.getId().equals(newClientId));
                if (exists) {
                    return newClientId;
                } else {
                    DisplayUtils.printError("Client ID " + newClientId + " not found.");
                    return collectClientIdUpdate(current);
                }
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Please enter a valid client ID.");
                return collectClientIdUpdate(current);
            }
            
        } catch (ApiException e) {
            logger.error("Failed to fetch clients for ticket update", e);
            DisplayUtils.printError("Failed to retrieve clients: " + e.getMessage());
            return current;
        }
    }
    
    private LocalDateTime collectDueDateUpdate(LocalDateTime current) {
        String currentStr = current != null ? 
            current.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "None";
        System.out.printf("Due Date [%s] (format: yyyy-MM-dd HH:mm): ", currentStr);
        String input = scanner.nextLine().trim();
        
        if (input.isEmpty()) {
            return current;
        }
        
        if (input.equalsIgnoreCase("none") || input.equalsIgnoreCase("null")) {
            return null;
        }
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            LocalDateTime dueDate = LocalDateTime.parse(input, formatter);
            
            if (dueDate.isBefore(LocalDateTime.now())) {
                DisplayUtils.printError("Due date cannot be in the past.");
                return collectDueDateUpdate(current);
            }
            
            return dueDate;
            
        } catch (DateTimeParseException e) {
            DisplayUtils.printError("Invalid date format. Please use: yyyy-MM-dd HH:mm");
            return collectDueDateUpdate(current);
        }
    }
    
    // ==================== DISPLAY METHODS ====================
    
    private void displayTicketSummary(Ticket ticket, String title) {
        System.out.println();
        DisplayUtils.printHeader(title);
        System.out.printf("  Description:  %s\n", ticket.getDescription());
        System.out.printf("  Service Type: %s\n", ticket.getServiceType());
        System.out.printf("  Client ID:    %s\n", ticket.getClientId());
        System.out.println();
        System.out.println("📝 Note: Server will automatically set:");
        System.out.println("   • Status: OPEN");
        System.out.printf("   • Due Date: %s hours from creation\n", 
            "HARDWARE".equals(ticket.getServiceType()) ? "24" : "48");
        System.out.println();
    }
    
    private void displayUpdateSummary(Ticket existing, Ticket updated) {
        System.out.println();
        DisplayUtils.printHeader("TICKET UPDATE SUMMARY");
        
        if (!Objects.equals(existing.getDescription(), updated.getDescription())) {
            System.out.printf("  Description:  %s → %s\n", 
                truncate(existing.getDescription(), 30), truncate(updated.getDescription(), 30));
        }
        if (!Objects.equals(existing.getServiceType(), updated.getServiceType())) {
            System.out.printf("  Service Type: %s → %s\n", existing.getServiceType(), updated.getServiceType());
        }
        if (!Objects.equals(existing.getStatus(), updated.getStatus())) {
            System.out.printf("  Status:       %s → %s\n", existing.getStatus(), updated.getStatus());
        }
        Long existingEffectiveClientId = getEffectiveClientId(existing);
        if (!Objects.equals(existingEffectiveClientId, updated.getClientId())) {
            System.out.printf("  Client ID:    %s → %s\n", existingEffectiveClientId, updated.getClientId());
        }
        if (!Objects.equals(existing.getDueAt(), updated.getDueAt())) {
            String oldDate = existing.getDueAt() != null ? 
                existing.getDueAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "Not set";
            String newDate = updated.getDueAt() != null ? 
                updated.getDueAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "Not set";
            System.out.printf("  Due Date:     %s → %s\n", oldDate, newDate);
        }
        System.out.println();
    }
    
    private String truncate(String text, int maxLength) {
        if (text == null) return "None";
        return text.length() > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
    }
    
    /**
     * Helper method to get the effective client ID from a ticket.
     * Checks both the clientId field and the nested client object.
     * 
     * @param ticket the ticket to check
     * @return the client ID if found, null otherwise
     */
    private Long getEffectiveClientId(Ticket ticket) {
        if (ticket == null) {
            return null;
        }
        
        // First check the direct clientId field
        if (ticket.getClientId() != null) {
            return ticket.getClientId();
        }
        
        // Then check the nested client object
        if (ticket.getClient() != null && ticket.getClient().getId() != null) {
            return ticket.getClient().getId();
        }
        
        return null;
    }
} 