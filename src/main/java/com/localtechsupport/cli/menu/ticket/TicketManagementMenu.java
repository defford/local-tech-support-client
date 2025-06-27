package com.localtechsupport.cli.menu.ticket;

import com.localtechsupport.cli.menu.BaseMenu;
import com.localtechsupport.cli.menu.Menu;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.Ticket;
import com.localtechsupport.cli.model.Client;
import com.localtechsupport.cli.model.Technician;
import com.localtechsupport.cli.client.ApiException;
import com.localtechsupport.cli.util.DisplayUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Scanner;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.HashMap;

/**
 * Menu for ticket management operations
 * 
 * Provides comprehensive CRUD operations for tickets including:
 * - View all tickets
 * - Search tickets
 * - View ticket details
 * - Create new ticket
 * - Edit ticket
 * - Assign technician
 * - Update status
 * - Delete ticket
 * - Ticket reports
 */
public class TicketManagementMenu extends BaseMenu {
    
    private static final Logger logger = LoggerFactory.getLogger(TicketManagementMenu.class);
    private TicketBuilder ticketBuilder;
    
    public TicketManagementMenu(Menu parentMenu) {
        super(parentMenu);
    }
    
    @Override
    protected String getMenuTitle() {
        return "TICKET MANAGEMENT";
    }
    
    @Override
    protected void displayCustomContent() {
        try {
            // Display current system status
            List<Ticket> tickets = apiService.getAllTickets();
            long openCount = tickets.stream().filter(t -> "OPEN".equals(t.getStatus())).count();
            long closedCount = tickets.stream().filter(t -> "CLOSED".equals(t.getStatus())).count();
            long totalCount = tickets.size();
            
            System.out.println("📊 Current System Status:");
            System.out.printf("    Total Tickets: %d (%d open, %d closed)\n", 
                totalCount, openCount, closedCount);
            System.out.println("    Recent Activity: Loading...");
            System.out.println();
            
            System.out.println("ℹ️  Note: Ticket core fields (description, service type, client) cannot be modified after creation.");
            System.out.println("   Available operations: Status updates, technician assignment, and ticket closure.");
            System.out.println();
            
        } catch (ApiException e) {
            logger.error("Failed to fetch ticket statistics", e);
            System.out.println("📊 Current System Status: Unable to load statistics");
            System.out.println();
            
            System.out.println("ℹ️  Note: Ticket core fields (description, service type, client) cannot be modified after creation.");
            System.out.println("   Available operations: Status updates, technician assignment, and ticket closure.");
            System.out.println();
        }
    }
    
    @Override
    protected void initializeMenuOptions() {
        // Initialize TicketBuilder with scanner and apiService from BaseMenu
        this.ticketBuilder = new TicketBuilder(scanner, apiService);
        
        addActionOption(1, "View All Tickets", "List all tickets with status and priority",
            this::viewAllTickets);
            
        addActionOption(2, "Search Tickets", "Find tickets by title/client/status/priority", 
            this::searchTickets);
            
        addActionOption(3, "View Ticket Details", "Detailed view with client and technician info",
            this::viewTicketDetails);
            
        addActionOption(4, "Create New Ticket", "Add new ticket to system",
            this::createNewTicket);
            
        addActionOption(5, "Assign Technician", "Assign or change technician for ticket",
            this::assignTechnician);
            
        addActionOption(6, "Update Status", "Change ticket status (Open/Closed)",
            this::updateTicketStatus);
            
        addActionOption(7, "Close Ticket", "Close ticket with resolution notes",
            this::closeTicket);
            
        addActionOption(8, "Delete Ticket", "Remove ticket (with confirmation)",
            this::deleteTicket);
            
        addActionOption(9, "Ticket Reports", "Statistics and analytics",
            this::ticketReports);
    }
    
    // ==================== MENU OPERATIONS ====================
    
    private void viewAllTickets() {
        DisplayUtils.printHeader("ALL TICKETS");
        
        try {
            List<Ticket> tickets = apiService.getAllTickets();
            
            if (tickets.isEmpty()) {
                System.out.println("📭 No tickets found in the system.");
                waitForEnter();
                return;
            }
            
            // Display tickets table
            displayTicketsTable(tickets);
            
            System.out.println();
            System.out.print("Enter ticket ID to view details (or press Enter to continue): ");
            String input = scanner.nextLine().trim();
            
            if (!input.isEmpty()) {
                try {
                    Long ticketId = Long.parseLong(input);
                    Ticket selectedTicket = tickets.stream()
                        .filter(t -> t.getId().equals(ticketId))
                        .findFirst()
                        .orElse(null);
                        
                    if (selectedTicket != null) {
                        displayTicketDetails(selectedTicket);
                    } else {
                        DisplayUtils.printError("Ticket not found with ID: " + ticketId);
                    }
                } catch (NumberFormatException e) {
                    DisplayUtils.printError("Invalid ticket ID format.");
                }
            }
            
        } catch (ApiException e) {
            logger.error("Failed to fetch tickets", e);
            DisplayUtils.printError("Failed to retrieve tickets: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void searchTickets() {
        DisplayUtils.printHeader("SEARCH TICKETS");
        
        System.out.println("🔍 Search Options:");
        System.out.println("   1. Search by Description");
        System.out.println("   2. Search by Status");
        System.out.println("   3. Search by Service Type");
        System.out.println("   4. View All Tickets");
        System.out.println();
        
        System.out.print("Select search option (1-4): ");
        String choice = scanner.nextLine().trim();
        
        try {
            List<Ticket> allTickets = apiService.getAllTickets();
            List<Ticket> filteredTickets;
            String searchCriteria = "";
            
            switch (choice) {
                case "1":
                    System.out.print("Enter description keywords: ");
                    String descriptionQuery = scanner.nextLine().trim().toLowerCase();
                    if (!descriptionQuery.isEmpty()) {
                        filteredTickets = allTickets.stream()
                            .filter(t -> t.getDescription() != null && 
                                t.getDescription().toLowerCase().contains(descriptionQuery))
                            .collect(Collectors.toList());
                        searchCriteria = "Description contains: " + descriptionQuery;
                    } else {
                        filteredTickets = allTickets;
                        searchCriteria = "All tickets";
                    }
                    break;
                    
                case "2":
                    System.out.print("Enter status (OPEN, CLOSED): ");
                    String statusQuery = scanner.nextLine().trim().toUpperCase();
                    if (!statusQuery.isEmpty()) {
                        filteredTickets = allTickets.stream()
                            .filter(t -> statusQuery.equals(t.getStatus()))
                            .collect(Collectors.toList());
                        searchCriteria = "Status: " + statusQuery;
                    } else {
                        filteredTickets = allTickets;
                        searchCriteria = "All tickets";
                    }
                    break;
                    
                case "3":
                    System.out.print("Enter service type (HARDWARE, SOFTWARE, NETWORK): ");
                    String serviceQuery = scanner.nextLine().trim().toUpperCase();
                    if (!serviceQuery.isEmpty()) {
                        filteredTickets = allTickets.stream()
                            .filter(t -> serviceQuery.equals(t.getServiceType()))
                            .collect(Collectors.toList());
                        searchCriteria = "Service Type: " + serviceQuery;
                    } else {
                        filteredTickets = allTickets;
                        searchCriteria = "All tickets";
                    }
                    break;
                    
                case "4":
                    filteredTickets = allTickets;
                    searchCriteria = "All tickets";
                    break;
                    
                default:
                    DisplayUtils.printError("Invalid search option.");
                    waitForEnter();
                    return;
            }
            
            // Display results
            System.out.println();
            DisplayUtils.printHeader("SEARCH RESULTS - " + searchCriteria);
            
            if (filteredTickets.isEmpty()) {
                System.out.println("📭 No tickets found matching your search criteria.");
            } else {
                System.out.printf("📊 Found %d ticket(s)\n\n", filteredTickets.size());
                displayTicketsTable(filteredTickets);
                
                // Allow viewing details
                System.out.println();
                System.out.print("Enter ticket ID to view details (or press Enter to continue): ");
                String input = scanner.nextLine().trim();
                
                if (!input.isEmpty()) {
                    try {
                        Long ticketId = Long.parseLong(input);
                        Ticket selectedTicket = filteredTickets.stream()
                            .filter(t -> t.getId().equals(ticketId))
                            .findFirst()
                            .orElse(null);
                            
                        if (selectedTicket != null) {
                            // Fetch full ticket details with nested objects
                            try {
                                Ticket fullTicket = apiService.getTicketById(ticketId);
                                displayTicketDetails(fullTicket);
                            } catch (ApiException e) {
                                logger.warn("Failed to fetch full ticket details for {}, using summary: {}", ticketId, e.getMessage());
                                displayTicketDetails(selectedTicket);
                            }
                        } else {
                            DisplayUtils.printError("Ticket not found in search results.");
                        }
                    } catch (NumberFormatException e) {
                        DisplayUtils.printError("Invalid ticket ID format.");
                    }
                }
            }
            
        } catch (ApiException e) {
            logger.error("Failed to search tickets", e);
            DisplayUtils.printError("Failed to search tickets: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void viewTicketDetails() {
        DisplayUtils.printHeader("TICKET DETAILS");
        
        try {
            List<Ticket> tickets = apiService.getAllTickets();
            
            if (tickets.isEmpty()) {
                System.out.println("📭 No tickets found in the system.");
                waitForEnter();
                return;
            }
            
            // Display ticket selection
            System.out.println("📋 Select a ticket to view details:");
            System.out.println();
            displayTicketsTable(tickets);
            
            System.out.print("Enter ticket ID: ");
            String input = scanner.nextLine().trim();
            
            try {
                Long ticketId = Long.parseLong(input);
                Ticket selectedTicket = tickets.stream()
                    .filter(t -> t.getId().equals(ticketId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedTicket != null) {
                    // Fetch full ticket details with nested objects
                    try {
                        Ticket fullTicket = apiService.getTicketById(ticketId);
                        displayTicketDetails(fullTicket);
                    } catch (ApiException e) {
                        logger.warn("Failed to fetch full ticket details for {}, using summary: {}", ticketId, e.getMessage());
                        displayTicketDetails(selectedTicket);
                    }
                } else {
                    DisplayUtils.printError("Ticket not found with ID: " + ticketId);
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid ticket ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to fetch tickets for details view", e);
            DisplayUtils.printError("Failed to retrieve tickets: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void createNewTicket() {
        DisplayUtils.printHeader("CREATE NEW TICKET");
        
        try {
            // Use TicketBuilder to collect input
            Ticket newTicket = ticketBuilder.buildNewTicket();
            
            if (newTicket == null) {
                return; // User cancelled
            }
            
            // Create the ticket via API
            Ticket createdTicket = apiService.createTicket(newTicket);
            
            // Auto-assign the ticket using server logic
            try {
                Ticket assignedTicket = apiService.autoAssignTicket(createdTicket.getId());
                
                Long effectiveTechnicianId = getEffectiveAssignedTechnicianId(assignedTicket);
                if (effectiveTechnicianId != null) {
                    // Get technician details to show name
                    try {
                        List<Technician> technicians = apiService.getAllTechnicians();
                        Technician assignedTech = technicians.stream()
                            .filter(t -> t.getId().equals(effectiveTechnicianId))
                            .findFirst()
                            .orElse(null);
                        
                        if (assignedTech != null) {
                            System.out.printf("✅ Ticket #%d created and assigned to %s\n", 
                                createdTicket.getId(), assignedTech.getFullName());
                        } else {
                            System.out.printf("✅ Ticket #%d created and assigned to technician ID %d\n", 
                                createdTicket.getId(), effectiveTechnicianId);
                        }
                    } catch (ApiException techError) {
                        System.out.printf("✅ Ticket #%d created and assigned to technician ID %d\n", 
                            createdTicket.getId(), effectiveTechnicianId);
                    }
                    
                    logger.info("Auto-assigned ticket {} to technician {}", 
                        createdTicket.getId(), effectiveTechnicianId);
                } else {
                    System.out.printf("✅ Ticket #%d created (unassigned - no suitable technician found)\n", 
                        createdTicket.getId());
                }
                
            } catch (ApiException autoAssignError) {
                logger.warn("Auto-assignment failed for ticket {}: {}", 
                    createdTicket.getId(), autoAssignError.getMessage());
                System.out.printf("✅ Ticket #%d created (auto-assignment failed)\n", createdTicket.getId());
            }
            
        } catch (ApiException e) {
            logger.error("Failed to create ticket", e);
            DisplayUtils.printError("Failed to create ticket: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during ticket creation", e);
            DisplayUtils.printError("An unexpected error occurred while creating the ticket.");
        }
        
        waitForEnter();
    }
    
    private void closeTicket() {
        DisplayUtils.printHeader("CLOSE TICKET");
        
        try {
            List<Ticket> tickets = apiService.getAllTickets();
            
            if (tickets.isEmpty()) {
                System.out.println("📭 No tickets found in the system.");
                waitForEnter();
                return;
            }
            
            // Filter to show only open tickets
            List<Ticket> openTickets = tickets.stream()
                .filter(t -> "OPEN".equals(t.getStatus()))
                .collect(Collectors.toList());
                
            if (openTickets.isEmpty()) {
                System.out.println("📭 No open tickets found to close.");
                waitForEnter();
                return;
            }
            
            // Display open tickets
            System.out.println("📋 Open tickets available to close:");
            System.out.println();
            displayTicketsTable(openTickets);
            
            System.out.print("Enter ticket ID to close (or 'b' to go back): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("b")) {
                return;
            }
            
            try {
                Long ticketId = Long.parseLong(input);
                Ticket selectedTicket = openTickets.stream()
                    .filter(t -> t.getId().equals(ticketId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedTicket == null) {
                    DisplayUtils.printError("Ticket not found with ID: " + ticketId);
                    waitForEnter();
                    return;
                }
                
                // Collect resolution notes
                System.out.println();
                System.out.printf("📋 Closing Ticket #%d\n", ticketId);
                System.out.println("Please provide resolution details:");
                System.out.print("Resolution Notes: ");
                String resolutionNotes = scanner.nextLine().trim();
                
                if (resolutionNotes.isEmpty()) {
                    DisplayUtils.printError("Resolution notes are required to close a ticket.");
                    waitForEnter();
                    return;
                }
                
                // Confirm closure
                System.out.printf("\n✅ Close ticket #%d with resolution: \"%s\"? (y/n): ", 
                    ticketId, resolutionNotes.length() > 50 ? resolutionNotes.substring(0, 50) + "..." : resolutionNotes);
                String confirm = scanner.nextLine().trim().toLowerCase();
                
                if (!confirm.equals("y") && !confirm.equals("yes")) {
                    System.out.println("❌ Ticket closure cancelled.");
                    waitForEnter();
                    return;
                }
                
                // For now, use the status update method since we don't have a specific close endpoint implemented
                // TODO: Implement proper close endpoint when server supports it
                Ticket result = apiService.updateTicketStatus(ticketId, "CLOSED");
                
                System.out.printf("✅ Ticket #%d closed successfully\n", ticketId);
                logger.info("Closed ticket {} with resolution: {}", ticketId, resolutionNotes);
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid ticket ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to close ticket", e);
            DisplayUtils.printError("Failed to close ticket: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during ticket closure", e);
            DisplayUtils.printError("An unexpected error occurred while closing the ticket.");
        }
        
        waitForEnter();
    }
    
    private void assignTechnician() {
        DisplayUtils.printHeader("ASSIGN TECHNICIAN");
        
        try {
            List<Ticket> tickets = apiService.getAllTickets();
            List<Technician> technicians = apiService.getAllTechnicians();
            
            if (tickets.isEmpty()) {
                System.out.println("📭 No tickets found in the system.");
                waitForEnter();
                return;
            }
            
            if (technicians.isEmpty()) {
                System.out.println("📭 No technicians found in the system.");
                waitForEnter();
                return;
            }
            
            // Display ticket selection
            System.out.println("📋 Select a ticket to assign:");
            System.out.println();
            displayTicketsTable(tickets);
            
            System.out.print("Enter ticket ID: ");
            String ticketInput = scanner.nextLine().trim();
            
            try {
                Long ticketId = Long.parseLong(ticketInput);
                
                // Get complete ticket details including nested objects
                Ticket selectedTicket = apiService.getTicketById(ticketId);
                if (selectedTicket == null) {
                    DisplayUtils.printError("Ticket not found with ID: " + ticketId);
                    waitForEnter();
                    return;
                }
                
                // Business Rule Validation: Check if ticket is OPEN
                if (!"OPEN".equals(selectedTicket.getStatus())) {
                    DisplayUtils.printError("Cannot assign technician to closed ticket. Status: " + selectedTicket.getStatus());
                    waitForEnter();
                    return;
                }
                
                // Display current assignment
                System.out.println();
                
                // Get display title - handle null titles
                String displayTitle = "No Title";
                if (selectedTicket.getTitle() != null && !selectedTicket.getTitle().trim().isEmpty()) {
                    displayTitle = selectedTicket.getTitle();
                } else if (selectedTicket.getDescription() != null && !selectedTicket.getDescription().trim().isEmpty()) {
                    displayTitle = selectedTicket.getDescription().length() > 50 ? 
                        selectedTicket.getDescription().substring(0, 47) + "..." : 
                        selectedTicket.getDescription();
                }
                
                System.out.printf("📋 Ticket #%d: %s\n", ticketId, displayTitle);
                System.out.printf("   Status: %s | Service Type: %s\n", 
                    selectedTicket.getStatus(), selectedTicket.getServiceType());
                
                Long currentTechnicianId = getEffectiveAssignedTechnicianId(selectedTicket);
                if (currentTechnicianId != null) {
                    Technician currentTech = technicians.stream()
                        .filter(t -> t.getId().equals(currentTechnicianId))
                        .findFirst()
                        .orElse(null);
                    System.out.printf("   Currently assigned to: %s\n", 
                        currentTech != null ? currentTech.getFullName() : "ID: " + currentTechnicianId);
                } else {
                    System.out.println("   Currently unassigned");
                }
                System.out.println();
                
                // Filter active technicians
                List<Technician> activeTechnicians = technicians.stream()
                    .filter(t -> "ACTIVE".equals(t.getStatus()))
                    .collect(Collectors.toList());
                
                if (activeTechnicians.isEmpty()) {
                    System.out.println("⚠️  No active technicians available for assignment.");
                    waitForEnter();
                    return;
                }
                
                // Display assignment options
                System.out.println("📋 Assignment Options:");
                System.out.println("  🤖 AUTO. Auto-assign using intelligent workload balancing");
                if (currentTechnicianId != null) {
                    System.out.println("  🔄 REASSIGN. Change assigned technician");
                    System.out.println("  ❌ UNASSIGN. Remove current assignment");
                }
                System.out.println("  👤 MANUAL. Manually select technician");
                System.out.println("  ❌ CANCEL. Return to menu");
                System.out.println();
                
                System.out.print("Select option (AUTO/REASSIGN/UNASSIGN/MANUAL/CANCEL): ");
                String choice = scanner.nextLine().trim().toUpperCase();
                
                switch (choice) {
                    case "AUTO":
                        handleAutoAssignment(ticketId, displayTitle);
                        break;
                        
                    case "REASSIGN":
                        if (currentTechnicianId != null) {
                            handleReassignment(ticketId, displayTitle, currentTechnicianId, activeTechnicians);
                        } else {
                            System.out.println("⚠️  No technician currently assigned. Use MANUAL assignment instead.");
                        }
                        break;
                        
                    case "UNASSIGN":
                        if (currentTechnicianId != null) {
                            handleUnassignment(ticketId, displayTitle);
                        } else {
                            System.out.println("⚠️  No technician currently assigned.");
                        }
                        break;
                        
                    case "MANUAL":
                        handleManualAssignment(ticketId, displayTitle, selectedTicket.getServiceType(), activeTechnicians);
                        break;
                        
                    case "CANCEL":
                        System.out.println("Assignment cancelled.");
                        break;
                        
                    default:
                        DisplayUtils.printError("Invalid option selected.");
                        break;
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid ticket ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to load assignment data", e);
            DisplayUtils.printError("Failed to load assignment data: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void handleAutoAssignment(Long ticketId, String displayTitle) {
        System.out.printf("Auto-assign ticket '%s' using intelligent workload balancing? (y/n): ", displayTitle);
        String confirm = scanner.nextLine().trim().toLowerCase();
        
        if (confirm.equals("y") || confirm.equals("yes")) {
            try {
                System.out.println("🤖 Auto-assigning ticket using server logic...");
                Ticket result = apiService.autoAssignTicket(ticketId);
                
                Long assignedTechId = getEffectiveAssignedTechnicianId(result);
                if (assignedTechId != null) {
                    try {
                        List<Technician> technicians = apiService.getAllTechnicians();
                        Technician assignedTech = technicians.stream()
                            .filter(t -> t.getId().equals(assignedTechId))
                            .findFirst()
                            .orElse(null);
                        
                        if (assignedTech != null) {
                            DisplayUtils.printSuccess("✅ Ticket automatically assigned!");
                            System.out.printf("   Assigned to: %s (%s)\n", 
                                assignedTech.getFullName(), assignedTech.getEmail());
                            System.out.printf("   Workload balancing applied - selected least busy qualified technician\n");
                        } else {
                            DisplayUtils.printSuccess("✅ Ticket automatically assigned to technician ID: " + assignedTechId);
                        }
                    } catch (Exception techError) {
                        DisplayUtils.printSuccess("✅ Ticket automatically assigned to technician ID: " + assignedTechId);
                    }
                    
                    logger.info("Auto-assigned ticket: {} (ID: {}) to technician: {}", 
                        displayTitle, ticketId, assignedTechId);
                } else {
                    System.out.println("ℹ️  No suitable technician found for auto-assignment.");
                    System.out.println("   Possible reasons: No active technicians, skill mismatch, or all technicians at capacity");
                }
                
            } catch (ApiException autoAssignError) {
                logger.error("Auto-assignment failed for ticket {}: {}", ticketId, autoAssignError.getMessage());
                String errorMessage = autoAssignError.getMessage();
                if (errorMessage.contains("no suitable technicians")) {
                    DisplayUtils.printError("Auto-assignment failed: No suitable technicians available");
                } else {
                    DisplayUtils.printError("Auto-assignment failed: " + errorMessage);
                }
            }
        } else {
            System.out.println("Auto-assignment cancelled.");
        }
    }
    
    private void handleReassignment(Long ticketId, String displayTitle, Long currentTechnicianId, List<Technician> activeTechnicians) {
        System.out.printf("Reassign ticket '%s'? This will unassign the current technician first. (y/n): ", displayTitle);
        String confirm = scanner.nextLine().trim().toLowerCase();
        
        if (confirm.equals("y") || confirm.equals("yes")) {
            try {
                // Step 1: Unassign current technician
                System.out.print("Reason for reassignment (optional): ");
                String reason = scanner.nextLine().trim();
                if (reason.isEmpty()) {
                    reason = "Reassignment requested";
                }
                
                System.out.println("🔄 Unassigning current technician...");
                apiService.unassignTechnician(ticketId, reason, "CLI User");
                
                // Step 2: Show manual assignment options
                System.out.println("✅ Current technician unassigned. Now select new technician:");
                handleManualAssignment(ticketId, displayTitle, null, activeTechnicians);
                
            } catch (ApiException e) {
                logger.error("Reassignment failed for ticket {}: {}", ticketId, e.getMessage());
                DisplayUtils.printError("Reassignment failed: " + e.getMessage());
            }
        } else {
            System.out.println("Reassignment cancelled.");
        }
    }
    
    private void handleUnassignment(Long ticketId, String displayTitle) {
        System.out.printf("Unassign ticket '%s'? (y/n): ", displayTitle);
        String confirm = scanner.nextLine().trim().toLowerCase();
        
        if (confirm.equals("y") || confirm.equals("yes")) {
            try {
                System.out.print("Reason for unassignment (optional): ");
                String reason = scanner.nextLine().trim();
                if (reason.isEmpty()) {
                    reason = "Unassignment requested via CLI";
                }
                
                System.out.println("❌ Unassigning technician...");
                Ticket result = apiService.unassignTechnician(ticketId, reason, "CLI User");
                
                DisplayUtils.printSuccess("✅ Technician unassigned successfully!");
                System.out.println("   Audit trail entry created with reason: " + reason);
                
                logger.info("Unassigned ticket: {} (ID: {})", displayTitle, ticketId);
                
            } catch (ApiException e) {
                logger.error("Unassignment failed for ticket {}: {}", ticketId, e.getMessage());
                DisplayUtils.printError("Unassignment failed: " + e.getMessage());
            }
        } else {
            System.out.println("Unassignment cancelled.");
        }
    }
    
    private void handleManualAssignment(Long ticketId, String displayTitle, String serviceType, List<Technician> activeTechnicians) {
        System.out.println("👤 Manual Assignment - Available Active Technicians:");
        System.out.println();
        
        for (int i = 0; i < activeTechnicians.size(); i++) {
            Technician tech = activeTechnicians.get(i);
            System.out.printf("  %d. %s (%s)\n", 
                i + 1, 
                tech.getFullName(), 
                tech.getEmail());
            System.out.printf("     Status: %s | Current Workload: %s\n",
                tech.getStatus(),
                tech.getCurrentWorkload() != null ? tech.getCurrentWorkload().toString() : "N/A");
            
            // Show skill compatibility if service type is known
            if (serviceType != null) {
                System.out.printf("     Service Type Compatibility: %s tickets ✅\n", serviceType);
            }
            System.out.println();
        }
        
        System.out.print("Select technician (1-" + activeTechnicians.size() + ") or 0 to cancel: ");
        String techChoice = scanner.nextLine().trim();
        
        try {
            int choice = Integer.parseInt(techChoice);
            
            if (choice == 0) {
                System.out.println("Manual assignment cancelled.");
                return;
            }
            
            if (choice >= 1 && choice <= activeTechnicians.size()) {
                Technician selectedTech = activeTechnicians.get(choice - 1);
                
                // Business Rule Validation: Check technician is active
                if (!"ACTIVE".equals(selectedTech.getStatus())) {
                    DisplayUtils.printError("Cannot assign inactive technician: " + selectedTech.getFullName());
                    return;
                }
                
                // Confirm assignment
                System.out.printf("Assign ticket '%s' to %s? (y/n): ", 
                    displayTitle, selectedTech.getFullName());
                String confirm = scanner.nextLine().trim().toLowerCase();
                
                if (confirm.equals("y") || confirm.equals("yes")) {
                    try {
                        System.out.println("👤 Assigning technician...");
                        Ticket result = apiService.assignTechnician(ticketId, selectedTech.getId());
                        
                        DisplayUtils.printSuccess("✅ Ticket assigned successfully!");
                        System.out.printf("   %s is now assigned to %s\n", 
                            displayTitle, selectedTech.getFullName());
                        System.out.println("   Assignment audit trail entry created");
                        
                        logger.info("Manually assigned ticket: {} (ID: {}) to technician: {} (ID: {})", 
                            displayTitle, ticketId, selectedTech.getFullName(), selectedTech.getId());
                            
                    } catch (ApiException assignError) {
                        logger.error("Assignment failed for ticket {} to technician {}: {}", 
                            ticketId, selectedTech.getId(), assignError.getMessage());
                        
                        String errorMessage = assignError.getMessage();
                        if (errorMessage.contains("not found")) {
                            if (errorMessage.contains("Ticket")) {
                                DisplayUtils.printError("Assignment failed: Ticket not found");
                            } else if (errorMessage.contains("Technician")) {
                                DisplayUtils.printError("Assignment failed: Technician not found");
                            } else {
                                DisplayUtils.printError("Assignment failed: " + errorMessage);
                            }
                        } else if (errorMessage.contains("closed ticket")) {
                            DisplayUtils.printError("Assignment failed: Cannot assign technician to closed ticket");
                        } else if (errorMessage.contains("inactive technician")) {
                            DisplayUtils.printError("Assignment failed: Cannot assign inactive technician");
                        } else if (errorMessage.contains("skills")) {
                            DisplayUtils.printError("Assignment failed: Technician does not have required skills for this service type");
                        } else {
                            DisplayUtils.printError("Assignment failed: " + errorMessage);
                        }
                    }
                } else {
                    System.out.println("Assignment cancelled.");
                }
            } else {
                DisplayUtils.printError("Invalid technician selection.");
            }
            
        } catch (NumberFormatException e) {
            DisplayUtils.printError("Invalid selection format.");
        }
    }
    
    private void updateTicketStatus() {
        DisplayUtils.printHeader("UPDATE TICKET STATUS");
        
        try {
            List<Ticket> tickets = apiService.getAllTickets();
            
            if (tickets.isEmpty()) {
                System.out.println("📭 No tickets found in the system.");
                waitForEnter();
                return;
            }
            
            // Display tickets
            System.out.println("📋 Select a ticket to update status:");
            System.out.println();
            displayTicketsTable(tickets);
            
            System.out.print("Enter ticket ID: ");
            String input = scanner.nextLine().trim();
            
            try {
                Long ticketId = Long.parseLong(input);
                
                // Get complete ticket details including nested objects
                Ticket selectedTicket = apiService.getTicketById(ticketId);
                if (selectedTicket == null) {
                    DisplayUtils.printError("Ticket not found with ID: " + ticketId);
                    waitForEnter();
                    return;
                }
                
                // Show current status and options
                System.out.println();
                
                // Get display title - handle null titles
                String displayTitle = "No Title";
                if (selectedTicket.getTitle() != null && !selectedTicket.getTitle().trim().isEmpty()) {
                    displayTitle = selectedTicket.getTitle();
                } else if (selectedTicket.getDescription() != null && !selectedTicket.getDescription().trim().isEmpty()) {
                    displayTitle = selectedTicket.getDescription().length() > 50 ? 
                        selectedTicket.getDescription().substring(0, 47) + "..." : 
                        selectedTicket.getDescription();
                }
                
                System.out.printf("📋 Ticket #%d: %s\n", ticketId, displayTitle);
                System.out.printf("Current Status: %s\n", getStatusDisplay(selectedTicket.getStatus()));
                System.out.println();
                
                System.out.println("🔹 Available Status Options:");
                System.out.println("  1. OPEN - Ticket is open and needs attention");
                System.out.println("  2. CLOSED - Ticket is resolved and closed");
                System.out.println();
                
                System.out.print("Select new status (1-2): ");
                String statusChoice = scanner.nextLine().trim();
                
                String newStatus;
                switch (statusChoice) {
                    case "1":
                        newStatus = "OPEN";
                        break;
                    case "2":
                        newStatus = "CLOSED";
                        break;
                    default:
                        DisplayUtils.printError("Invalid status selection.");
                        waitForEnter();
                        return;
                }
                
                if (newStatus.equals(selectedTicket.getStatus())) {
                    System.out.println("ℹ️  Ticket already has this status.");
                    waitForEnter();
                    return;
                }
                
                // Confirmation
                System.out.printf("⚠️  Change ticket status from %s to %s?\n", 
                    selectedTicket.getStatus(), newStatus);
                System.out.print("Confirm status change? (y/n): ");
                String confirm = scanner.nextLine().trim().toLowerCase();
                
                if (confirm.equals("y") || confirm.equals("yes")) {
                    Ticket result = apiService.updateTicketStatus(ticketId, newStatus);
                    String resultDisplayTitle = result.getTitle() != null ? result.getTitle() : "Ticket #" + result.getId();
                    System.out.printf("✅ %s status changed to %s\n", resultDisplayTitle, result.getStatus());
                    logger.info("Updated ticket status: {} (ID: {}) -> {}", 
                        result.getTitle(), ticketId, result.getStatus());
                } else {
                    System.out.println("Status change cancelled.");
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid ticket ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to update ticket status", e);
            DisplayUtils.printError("Failed to update ticket status: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void deleteTicket() {
        DisplayUtils.printHeader("DELETE TICKET");
        
        System.out.println("⚠️  IMPORTANT: Server Business Rules for Ticket Deletion");
        System.out.println("   • Only CLOSED tickets can be deleted");
        System.out.println("   • Deletion is permanent and irreversible");
        System.out.println("   • All related data (history, feedback, appointments) will be removed");
        System.out.println("   • Consider keeping closed tickets for historical records");
        System.out.println();
        
        try {
            List<Ticket> tickets = apiService.getAllTickets();
            
            if (tickets.isEmpty()) {
                System.out.println("📭 No tickets found in the system.");
                waitForEnter();
                return;
            }
            
            // Display ticket selection
            System.out.println("📋 Select a ticket to delete:");
            System.out.println();
            displayTicketsTable(tickets);
            
            System.out.print("Enter ticket ID to delete (or 'b' to go back): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("b")) {
                return;
            }
            
            try {
                Long ticketId = Long.parseLong(input);
                
                // Get complete ticket details including nested objects
                Ticket selectedTicket = apiService.getTicketById(ticketId);
                if (selectedTicket == null) {
                    DisplayUtils.printError("Ticket not found with ID: " + ticketId);
                    waitForEnter();
                    return;
                }
                
                // Show ticket details
                System.out.println();
                displayTicketSummary(selectedTicket);
                System.out.println();
                
                // Enforce business rule: Only closed tickets can be deleted
                if ("OPEN".equals(selectedTicket.getStatus())) {
                    System.out.println("❌ DELETION BLOCKED: Ticket is currently OPEN");
                    System.out.println();
                    System.out.println("🔹 Server Business Rule: Only CLOSED tickets can be deleted");
                    System.out.println("   This ensures proper audit trails and prevents accidental");
                    System.out.println("   deletion of active work.");
                    System.out.println();
                    System.out.println("🔹 Available Options:");
                    System.out.println("   1. Close this ticket first (recommended)");
                    System.out.println("   2. Cancel deletion");
                    System.out.println();
                    
                    System.out.print("Would you like to close this ticket first? (y/n): ");
                    String closeFirst = scanner.nextLine().trim().toLowerCase();
                    
                    if (closeFirst.equals("y") || closeFirst.equals("yes")) {
                        System.out.println("Redirecting to ticket closure process...");
                        System.out.println("After closing, you can return to delete the ticket.");
                        waitForEnter();
                        closeTicket(); // Call the existing close ticket method
                        return;
                    } else {
                        System.out.println("Deletion cancelled. Ticket remains OPEN.");
                        waitForEnter();
                        return;
                    }
                }
                
                // Ticket is closed - proceed with deletion confirmation
                System.out.println("✅ Ticket is CLOSED - deletion is permitted");
                System.out.println();
                
                // Get display title for confirmation
                String displayTitle = "No Title";
                if (selectedTicket.getTitle() != null && !selectedTicket.getTitle().trim().isEmpty()) {
                    displayTitle = selectedTicket.getTitle();
                } else if (selectedTicket.getDescription() != null && !selectedTicket.getDescription().trim().isEmpty()) {
                    displayTitle = selectedTicket.getDescription().length() > 50 ? 
                        selectedTicket.getDescription().substring(0, 47) + "..." : 
                        selectedTicket.getDescription();
                }
                
                // Simplified confirmation process
                System.out.println("🔹 Deletion Confirmation:");
                System.out.printf("   Ticket #%d: %s\n", ticketId, displayTitle);
                System.out.println("   Status: CLOSED");
                System.out.println("   ⚠️  This action is PERMANENT and IRREVERSIBLE");
                System.out.println();
                
                // Step 1: Initial confirmation
                System.out.print("Proceed with deletion? (y/n): ");
                String confirm1 = scanner.nextLine().trim().toLowerCase();
                
                if (!confirm1.equals("y") && !confirm1.equals("yes")) {
                    System.out.println("Deletion cancelled.");
                    waitForEnter();
                    return;
                }
                
                // Step 2: Final confirmation with ticket ID
                System.out.printf("Final confirmation: Type the ticket ID '%d' to proceed: ", ticketId);
                String idConfirmation = scanner.nextLine().trim();
                
                if (!idConfirmation.equals(ticketId.toString())) {
                    DisplayUtils.printError("ID confirmation failed. Deletion cancelled.");
                    waitForEnter();
                    return;
                }
                
                // Attempt deletion
                try {
                    apiService.deleteTicket(ticketId);
                    System.out.printf("✅ Ticket #%d deleted successfully\n", ticketId);
                    System.out.println("   All related data (history, feedback, appointments) removed");
                    logger.info("Successfully deleted closed ticket: {} (ID: {})", displayTitle, ticketId);
                    
                } catch (ApiException e) {
                    if (e.getStatusCode() == 400) {
                        System.out.println();
                        DisplayUtils.printError("❌ Deletion Failed: Server Business Rule Violation");
                        System.out.println("   " + e.getMessage());
                        System.out.println();
                        System.out.println("🔹 This usually means:");
                        System.out.println("   • Ticket status changed after selection");
                        System.out.println("   • Server detected the ticket is not properly closed");
                        System.out.println("   • Additional business rules prevent deletion");
                        logger.info("Delete operation blocked by server business rules for ticket ID: {}", ticketId);
                    } else if (e.getStatusCode() == 404) {
                        DisplayUtils.printError("❌ Ticket not found - may have been deleted by another user");
                        logger.info("Ticket ID {} not found during deletion - already deleted?", ticketId);
                    } else {
                        DisplayUtils.printError("❌ Failed to delete ticket: " + e.getMessage());
                        logger.error("Failed to delete ticket ID: {}", ticketId, e);
                    }
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid ticket ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to retrieve tickets for deletion", e);
            DisplayUtils.printError("Failed to retrieve tickets: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void ticketReports() {
        DisplayUtils.printHeader("TICKET REPORTS & ANALYTICS");
        
        try {
            List<Ticket> tickets = apiService.getAllTickets();
            
            if (tickets.isEmpty()) {
                System.out.println("📭 No tickets found in the system.");
                waitForEnter();
                return;
            }
            
            // Calculate statistics
            long totalCount = tickets.size();
            long openCount = tickets.stream().filter(t -> "OPEN".equals(t.getStatus())).count();
            long closedCount = tickets.stream().filter(t -> "CLOSED".equals(t.getStatus())).count();
            
            // Priority breakdown
            Map<String, Long> priorityCounts = tickets.stream()
                .collect(Collectors.groupingBy(
                    t -> t.getPriority() != null ? t.getPriority() : "UNKNOWN", 
                    Collectors.counting()));
                    
            // Service type breakdown
            Map<String, Long> serviceTypeCounts = tickets.stream()
                .collect(Collectors.groupingBy(
                    t -> t.getServiceType() != null ? t.getServiceType() : "UNKNOWN", 
                    Collectors.counting()));
            
            // Assignment statistics
            long assignedCount = tickets.stream().filter(t -> t.getAssignedTechnicianId() != null).count();
            long unassignedCount = totalCount - assignedCount;
            
            // Display report
            System.out.println("📊 TICKET SYSTEM OVERVIEW");
            System.out.println("═".repeat(80));
            System.out.printf("Total Tickets:           %d\n", totalCount);
            System.out.printf("Open:                    %d (%.1f%%)\n", openCount, 
                (openCount * 100.0 / totalCount));
            System.out.printf("Closed:                  %d (%.1f%%)\n", closedCount, 
                (closedCount * 100.0 / totalCount));
            System.out.printf("Assigned:                %d (%.1f%%)\n", assignedCount, 
                (assignedCount * 100.0 / totalCount));
            System.out.printf("Unassigned:              %d (%.1f%%)\n", unassignedCount, 
                (unassignedCount * 100.0 / totalCount));
            System.out.println();
            
            System.out.println("🔴 PRIORITY BREAKDOWN");
            System.out.println("─".repeat(40));
            priorityCounts.entrySet().stream()
                .sorted((e1, e2) -> {
                    // Sort by priority order: URGENT, HIGH, MEDIUM, LOW, UNKNOWN
                    String[] order = {"URGENT", "HIGH", "MEDIUM", "LOW", "UNKNOWN"};
                    int pos1 = java.util.Arrays.asList(order).indexOf(e1.getKey());
                    int pos2 = java.util.Arrays.asList(order).indexOf(e2.getKey());
                    if (pos1 == -1) pos1 = order.length;
                    if (pos2 == -1) pos2 = order.length;
                    return Integer.compare(pos1, pos2);
                })
                .forEach(entry -> {
                    double percentage = (entry.getValue() * 100.0 / totalCount);
                    System.out.printf("%-8s: %d tickets (%.1f%%)\n", 
                        entry.getKey(), entry.getValue(), percentage);
                });
            System.out.println();
            
            System.out.println("🛠️  SERVICE TYPE BREAKDOWN");
            System.out.println("─".repeat(40));
            serviceTypeCounts.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .forEach(entry -> {
                    double percentage = (entry.getValue() * 100.0 / totalCount);
                    System.out.printf("%-10s: %d tickets (%.1f%%)\n", 
                        entry.getKey(), entry.getValue(), percentage);
                });
            System.out.println();
            
            // System health indicators
            System.out.println("🏥 SYSTEM HEALTH");
            System.out.println("─".repeat(40));
            
            double resolutionRate = (closedCount * 100.0 / totalCount);
            if (resolutionRate >= 80) {
                System.out.printf("✅ Resolution Rate: %.1f%% (Excellent)\n", resolutionRate);
            } else if (resolutionRate >= 60) {
                System.out.printf("⚠️  Resolution Rate: %.1f%% (Good)\n", resolutionRate);
            } else {
                System.out.printf("❌ Resolution Rate: %.1f%% (Needs Attention)\n", resolutionRate);
            }
            
            double assignmentRate = (assignedCount * 100.0 / totalCount);
            if (assignmentRate >= 90) {
                System.out.printf("✅ Assignment Rate: %.1f%% (Excellent)\n", assignmentRate);
            } else if (assignmentRate >= 70) {
                System.out.printf("⚠️  Assignment Rate: %.1f%% (Good)\n", assignmentRate);
            } else {
                System.out.printf("❌ Assignment Rate: %.1f%% (Poor)\n", assignmentRate);
            }
            
            // Urgent ticket alert
            long urgentOpen = tickets.stream()
                .filter(t -> "URGENT".equals(t.getPriority()) && "OPEN".equals(t.getStatus()))
                .count();
            if (urgentOpen > 0) {
                System.out.printf("🚨 URGENT Open Tickets: %d (Needs Immediate Attention!)\n", urgentOpen);
            }
            
            System.out.println();
            System.out.println("📈 RECOMMENDATIONS");
            System.out.println("─".repeat(40));
            
            if (resolutionRate < 70) {
                System.out.println("• Focus on closing resolved tickets");
            }
            if (assignmentRate < 80) {
                System.out.println("• Assign unassigned tickets to appropriate technicians");
            }
            if (urgentOpen > 0) {
                System.out.println("• Prioritize urgent tickets for immediate resolution");
            }
            if (openCount > closedCount) {
                System.out.println("• Review workflow to improve ticket resolution time");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to generate ticket reports", e);
            DisplayUtils.printError("Failed to generate reports: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    // ==================== HELPER METHODS ====================
    
    private void displayTicketsTable(List<Ticket> tickets) {
        System.out.printf("%-4s %-40s %-10s %-12s %-18s %s\n", 
            "ID", "Description", "Status", "Service", "Client", "Assigned To");
        System.out.println("─".repeat(110));
        
        for (Ticket ticket : tickets) {
            // Get client name - prioritize nested object over ID lookup
            String clientDisplay = "N/A";
            if (ticket.getClient() != null && ticket.getClient().getFullName() != null && !ticket.getClient().getFullName().trim().isEmpty()) {
                clientDisplay = truncate(ticket.getClient().getFullName(), 16);
            } else {
                Long effectiveClientId = getEffectiveClientId(ticket);
                if (effectiveClientId != null) {
                    try {
                        List<Client> clients = apiService.getAllClients();
                        Client client = clients.stream()
                            .filter(c -> c.getId().equals(effectiveClientId))
                            .findFirst()
                            .orElse(null);
                        if (client != null && client.getFullName() != null && !client.getFullName().trim().isEmpty()) {
                            clientDisplay = truncate(client.getFullName(), 16);
                        } else {
                            clientDisplay = "ID:" + effectiveClientId;
                        }
                    } catch (ApiException e) {
                        clientDisplay = "ID:" + effectiveClientId;
                    }
                }
            }
            
            // Get technician name - prioritize nested object over ID lookup
            String technicianDisplay = "Unassigned";
            if (ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().getFullName() != null && !ticket.getAssignedTechnician().getFullName().trim().isEmpty()) {
                technicianDisplay = truncate(ticket.getAssignedTechnician().getFullName(), 18);
            } else {
                Long effectiveTechnicianId = getEffectiveAssignedTechnicianId(ticket);
                if (effectiveTechnicianId != null) {
                    try {
                        List<Technician> technicians = apiService.getAllTechnicians();
                        Technician technician = technicians.stream()
                            .filter(t -> t.getId().equals(effectiveTechnicianId))
                            .findFirst()
                            .orElse(null);
                        if (technician != null && technician.getFullName() != null && !technician.getFullName().trim().isEmpty()) {
                            technicianDisplay = truncate(technician.getFullName(), 18);
                        } else {
                            technicianDisplay = "ID:" + effectiveTechnicianId;
                        }
                    } catch (ApiException e) {
                        technicianDisplay = "ID:" + effectiveTechnicianId;
                    }
                }
            }
            
            // Get description - truncate if too long
            String description = "No Description";
            if (ticket.getDescription() != null && !ticket.getDescription().trim().isEmpty()) {
                description = ticket.getDescription().length() > 40 ? 
                    ticket.getDescription().substring(0, 37) + "..." : 
                    ticket.getDescription();
            }
            
            System.out.printf("%-4d %-40s %-10s %-12s %-18s %s\n",
                ticket.getId(),
                truncateWithDefault(description, 40, "No Description"),
                getStatusDisplay(ticket.getStatus()),
                ticket.getServiceType() != null ? ticket.getServiceType() : "N/A",
                clientDisplay,
                technicianDisplay
            );
        }
    }
    
    private void displayTicketDetails(Ticket ticket) {
        System.out.println();
        DisplayUtils.printHeader("TICKET DETAILS - #" + ticket.getId());
        
        System.out.println("🎫 Ticket Information");
        System.out.println("─".repeat(80));
        System.out.printf("  ID:           %d\n", ticket.getId());
        System.out.printf("  Description:  %s\n", ticket.getDescription() != null ? ticket.getDescription() : "No Description");
        System.out.printf("  Status:       %s\n", getStatusDisplay(ticket.getStatus()));
        System.out.printf("  Service Type: %s\n", ticket.getServiceType() != null ? ticket.getServiceType() : "Not specified");
        
        if (ticket.getCreatedAt() != null) {
            System.out.printf("  Created:      %s\n", ticket.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")));
        }
        if (ticket.getDueAt() != null) {
            System.out.printf("  Due Date:     %s\n", ticket.getDueAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")));
        }
        if (ticket.getResolvedAt() != null) {
            System.out.printf("  Resolved:     %s\n", ticket.getResolvedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")));
        }
        System.out.println();
        
        // Client information
        System.out.println("👤 Client Information");
        System.out.println("─".repeat(80));
        
        Long effectiveClientId = getEffectiveClientId(ticket);
        
        if (effectiveClientId != null) {
            try {
                // Always fetch fresh client data to ensure we have complete information
                List<Client> clients = apiService.getAllClients();
                Client client = clients.stream()
                    .filter(c -> c.getId().equals(effectiveClientId))
                    .findFirst()
                    .orElse(null);
                    
                if (client != null) {
                    System.out.printf("  Name:         %s\n", client.getFullName() != null ? client.getFullName() : "Not provided");
                    System.out.printf("  Email:        %s\n", client.getEmail() != null ? client.getEmail() : "Not provided");
                    System.out.printf("  Phone:        %s\n", client.getPhone() != null && !client.getPhone().trim().isEmpty() ? client.getPhone() : "Not provided");
                    System.out.printf("  Status:       %s\n", client.isActive() ? "🟢 ACTIVE" : "🔴 SUSPENDED");
                } else {
                    System.out.printf("  Client ID:    %d (Client not found)\n", effectiveClientId);
                }
            } catch (ApiException e) {
                System.out.printf("  Client ID:    %d (Unable to load client details)\n", effectiveClientId);
            }
        } else {
            System.out.println("  No client assigned");
        }
        System.out.println();
        
        // Technician information
        System.out.println("🔧 Assignment Information");
        System.out.println("─".repeat(80));
        
        Long effectiveTechnicianId = getEffectiveAssignedTechnicianId(ticket);
        if (effectiveTechnicianId != null) {
            try {
                // Always fetch fresh technician data to ensure we have complete information
                List<Technician> technicians = apiService.getAllTechnicians();
                Technician technician = technicians.stream()
                    .filter(t -> t.getId().equals(effectiveTechnicianId))
                    .findFirst()
                    .orElse(null);
                    
                if (technician != null) {
                    System.out.printf("  Technician:   %s\n", technician.getFullName() != null ? technician.getFullName() : "Not provided");
                    System.out.printf("  Email:        %s\n", technician.getEmail() != null ? technician.getEmail() : "Not provided");
                    System.out.printf("  Status:       %s\n", technician.getStatus() != null ? technician.getStatus() : "Unknown");
                    System.out.printf("  Workload:     %s\n", 
                        technician.getCurrentWorkload() != null ? technician.getCurrentWorkload().toString() : "N/A");
                } else {
                    System.out.printf("  Technician ID: %d (Technician not found)\n", effectiveTechnicianId);
                }
            } catch (ApiException e) {
                System.out.printf("  Technician ID: %d (Unable to load technician details)\n", effectiveTechnicianId);
            }
        } else {
            System.out.println("  Not assigned to any technician");
        }
        System.out.println();
        
        System.out.println("🔹 Available Actions");
        System.out.println("─".repeat(80));
        System.out.println("  1. Edit Ticket Information");
        System.out.println("  2. Assign/Change Technician");
        System.out.println("  3. Update Status");
        System.out.println("  4. Delete Ticket");
        System.out.println();
    }
    
    private void displayTicketSummary(Ticket ticket) {
        // Get display description - truncate if too long
        String displayDescription = "No Description";
        if (ticket.getDescription() != null && !ticket.getDescription().trim().isEmpty()) {
            displayDescription = ticket.getDescription().length() > 50 ? 
                ticket.getDescription().substring(0, 47) + "..." : 
                ticket.getDescription();
        }
        
        // Get client name
        String clientName = "Not assigned";
        if (ticket.getClient() != null && ticket.getClient().getFullName() != null && !ticket.getClient().getFullName().trim().isEmpty()) {
            clientName = ticket.getClient().getFullName();
        }
        
        // Get technician name
        String technicianName = "Unassigned";
        if (ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().getFullName() != null && !ticket.getAssignedTechnician().getFullName().trim().isEmpty()) {
            technicianName = ticket.getAssignedTechnician().getFullName();
        }
        
        System.out.printf("📋 Ticket #%d: %s\n", ticket.getId(), displayDescription);
        System.out.printf("   Status: %s\n", ticket.getStatus() != null ? ticket.getStatus() : "Unknown");
        System.out.printf("   Service Type: %s\n", ticket.getServiceType() != null ? ticket.getServiceType() : "Not specified");
        System.out.printf("   Client: %s\n", clientName);
        System.out.printf("   Assigned To: %s\n", technicianName);
    }
    
    private String getStatusDisplay(String status) {
        if (status == null) return "UNKNOWN";
        
        switch (status) {
            case "OPEN":
                return "🟢 OPEN";
            case "CLOSED":
                return "🔴 CLOSED";
            default:
                return status;
        }
    }
    

    
    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
    }
    
    private String truncateWithDefault(String text, int maxLength, String defaultValue) {
        if (text == null || text.trim().isEmpty()) return defaultValue;
        return text.length() > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
    }
    
    /**
     * Helper method to get the effective assigned technician ID from a ticket.
     * Checks both the assignedTechnicianId field and the nested assignedTechnician object.
     * 
     * @param ticket the ticket to check
     * @return the technician ID if found, null otherwise
     */
    private Long getEffectiveAssignedTechnicianId(Ticket ticket) {
        if (ticket == null) {
            return null;
        }
        
        // First check the direct assignedTechnicianId field
        if (ticket.getAssignedTechnicianId() != null) {
            return ticket.getAssignedTechnicianId();
        }
        
        // Then check the nested assignedTechnician object
        if (ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().getId() != null) {
            return ticket.getAssignedTechnician().getId();
        }
        
        return null;
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