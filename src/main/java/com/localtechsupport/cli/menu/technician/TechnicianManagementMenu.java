package com.localtechsupport.cli.menu.technician;

import com.localtechsupport.cli.menu.BaseMenu;
import com.localtechsupport.cli.menu.Menu;
import com.localtechsupport.cli.menu.MenuOption;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.Technician;
import com.localtechsupport.cli.model.Ticket;
import com.localtechsupport.cli.model.Appointment;
import com.localtechsupport.cli.client.ApiException;
import com.localtechsupport.cli.util.DisplayUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.HashMap;

/**
 * Menu for technician management operations
 * 
 * Provides comprehensive CRUD operations for technicians including:
 * - View all technicians
 * - Search technicians  
 * - View technician details
 * - Create new technician
 * - Edit technician
 * - Technician status management
 * - Delete technician
 * - Technician reports
 */
public class TechnicianManagementMenu extends BaseMenu {
    
    private static final Logger logger = LoggerFactory.getLogger(TechnicianManagementMenu.class);
    private TechnicianBuilder technicianBuilder;
    
    public TechnicianManagementMenu(Menu parentMenu) {
        super(parentMenu);
    }
    
    @Override
    protected String getMenuTitle() {
        return "TECHNICIAN MANAGEMENT";
    }
    
    @Override
    protected void displayCustomContent() {
        try {
            // Display current system status
            List<Technician> technicians = apiService.getAllTechnicians();
            long activeCount = technicians.stream().filter(Technician::isActive).count();
            long totalCount = technicians.size();
            long inactiveCount = totalCount - activeCount;
            
            System.out.println("📊 Current System Status:");
            System.out.printf("    Total Technicians: %d (%d active, %d inactive)\n", 
                totalCount, activeCount, inactiveCount);
            System.out.println("    Recent Activity: Loading...");
            System.out.println();
            
        } catch (ApiException e) {
            logger.error("Failed to fetch technician statistics", e);
            System.out.println("📊 Current System Status: Unable to load statistics");
            System.out.println();
        }
    }
    
    @Override
    protected void initializeMenuOptions() {
        // Initialize TechnicianBuilder with scanner from BaseMenu
        this.technicianBuilder = new TechnicianBuilder(scanner);
        
        addActionOption(1, "View All Technicians", "List all technicians with status",
            this::viewAllTechnicians);
            
        addActionOption(2, "Search Technicians", "Find technicians by name/email/skills", 
            this::searchTechnicians);
            
        addActionOption(3, "View Technician Details", "Detailed view with workload/schedule",
            this::viewTechnicianDetails);
            
        addActionOption(4, "Create New Technician", "Add new technician to system",
            this::createNewTechnician);
            
        addActionOption(5, "Edit Technician", "Update technician information",
            this::editTechnician);
            
        addActionOption(6, "Technician Status", "Activate/deactivate technician accounts",
            this::manageTechnicianStatus);
            
        addActionOption(7, "Delete Technician", "Remove technician (with confirmation)",
            this::deleteTechnician);
            
        addActionOption(8, "Technician Reports", "Statistics and analytics",
            this::technicianReports);
    }
    
    // ==================== MENU OPERATIONS ====================
    
    private void viewAllTechnicians() {
        DisplayUtils.printHeader("ALL TECHNICIANS");
        
        try {
            List<Technician> technicians = apiService.getAllTechnicians();
            
            if (technicians.isEmpty()) {
                System.out.println("📭 No technicians found in the system.");
                DisplayUtils.waitForEnter();
                return;
            }
            
            // Display technicians table
            displayTechniciansTable(technicians);
            
            System.out.println();
            System.out.print("Enter technician ID to view details (or press Enter to continue): ");
            String input = scanner.nextLine().trim();
            
            if (!input.isEmpty()) {
                try {
                    Long technicianId = Long.parseLong(input);
                    Technician selectedTechnician = technicians.stream()
                        .filter(t -> t.getId().equals(technicianId))
                        .findFirst()
                        .orElse(null);
                        
                    if (selectedTechnician != null) {
                        displayTechnicianDetails(selectedTechnician);
                    } else {
                        DisplayUtils.printError("Technician not found with ID: " + technicianId);
                    }
                } catch (NumberFormatException e) {
                    DisplayUtils.printError("Invalid technician ID format.");
                }
            }
            
        } catch (ApiException e) {
            logger.error("Failed to fetch technicians", e);
            DisplayUtils.printError("Failed to retrieve technicians: " + e.getMessage());
        }
        
        DisplayUtils.waitForEnter();
    }
    
    private void searchTechnicians() {
        DisplayUtils.printHeader("SEARCH TECHNICIANS");
        
        System.out.println("🔍 Search Options:");
        System.out.println("   1. Search by Name");
        System.out.println("   2. Search by Email");
        System.out.println("   3. Search by Skill");
        System.out.println("   4. Filter by Status");
        System.out.println("   5. View All Technicians");
        System.out.println();
        
        System.out.print("Select search option (1-5): ");
        String choice = scanner.nextLine().trim();
        
        try {
            List<Technician> allTechnicians = apiService.getAllTechnicians();
            List<Technician> filteredTechnicians = new ArrayList<>();
            String searchCriteria = "";
            
            switch (choice) {
                case "1":
                    System.out.print("Enter name to search: ");
                    String nameQuery = scanner.nextLine().trim().toLowerCase();
                    if (!nameQuery.isEmpty()) {
                        filteredTechnicians = allTechnicians.stream()
                            .filter(t -> t.getFullName().toLowerCase().contains(nameQuery))
                            .collect(Collectors.toList());
                        searchCriteria = "Name contains: " + nameQuery;
                    }
                    break;
                    
                case "2":
                    System.out.print("Enter email to search: ");
                    String emailQuery = scanner.nextLine().trim().toLowerCase();
                    if (!emailQuery.isEmpty()) {
                        filteredTechnicians = allTechnicians.stream()
                            .filter(t -> t.getEmail() != null && t.getEmail().toLowerCase().contains(emailQuery))
                            .collect(Collectors.toList());
                        searchCriteria = "Email contains: " + emailQuery;
                    }
                    break;
                    
                case "3":
                    System.out.print("Enter skill to search (HARDWARE, SOFTWARE, NETWORK, etc.): ");
                    String skillQuery = scanner.nextLine().trim().toUpperCase();
                    if (!skillQuery.isEmpty()) {
                        filteredTechnicians = allTechnicians.stream()
                            .filter(t -> t.hasSkill(skillQuery))
                            .collect(Collectors.toList());
                        searchCriteria = "Has skill: " + skillQuery;
                    }
                    break;
                    
                case "4":
                    System.out.print("Enter status (ACTIVE, ON_VACATION, SICK_LEAVE, TERMINATED): ");
                    String statusQuery = scanner.nextLine().trim().toUpperCase();
                    if (!statusQuery.isEmpty()) {
                        filteredTechnicians = allTechnicians.stream()
                            .filter(t -> statusQuery.equals(t.getStatus()))
                            .collect(Collectors.toList());
                        searchCriteria = "Status: " + statusQuery;
                    }
                    break;
                    
                case "5":
                    filteredTechnicians = allTechnicians;
                    searchCriteria = "All technicians";
                    break;
                    
                default:
                    DisplayUtils.printError("Invalid search option.");
                    DisplayUtils.waitForEnter();
                    return;
            }
            
            // Display results
            System.out.println();
            DisplayUtils.printHeader("SEARCH RESULTS - " + searchCriteria);
            
            if (filteredTechnicians.isEmpty()) {
                System.out.println("📭 No technicians found matching your search criteria.");
            } else {
                System.out.printf("📊 Found %d technician(s)\n\n", filteredTechnicians.size());
                displayTechniciansTable(filteredTechnicians);
                
                // Allow viewing details
                System.out.println();
                System.out.print("Enter technician ID to view details (or press Enter to continue): ");
                String input = scanner.nextLine().trim();
                
                if (!input.isEmpty()) {
                    try {
                        Long technicianId = Long.parseLong(input);
                        Technician selectedTechnician = filteredTechnicians.stream()
                            .filter(t -> t.getId().equals(technicianId))
                            .findFirst()
                            .orElse(null);
                            
                        if (selectedTechnician != null) {
                            displayTechnicianDetails(selectedTechnician);
                        } else {
                            DisplayUtils.printError("Technician not found in search results.");
                        }
                    } catch (NumberFormatException e) {
                        DisplayUtils.printError("Invalid technician ID format.");
                    }
                }
            }
            
        } catch (ApiException e) {
            logger.error("Failed to search technicians", e);
            DisplayUtils.printError("Failed to search technicians: " + e.getMessage());
        }
        
        DisplayUtils.waitForEnter();
    }
    
    private void viewTechnicianDetails() {
        DisplayUtils.printHeader("TECHNICIAN DETAILS");
        
        try {
            List<Technician> technicians = apiService.getAllTechnicians();
            
            if (technicians.isEmpty()) {
                System.out.println("📭 No technicians found in the system.");
                DisplayUtils.waitForEnter();
                return;
            }
            
            // Display technician selection
            System.out.println("📋 Select a technician to view details:");
            System.out.println();
            displayTechniciansTable(technicians);
            
            System.out.print("Enter technician ID: ");
            String input = scanner.nextLine().trim();
            
            try {
                Long technicianId = Long.parseLong(input);
                Technician selectedTechnician = technicians.stream()
                    .filter(t -> t.getId().equals(technicianId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedTechnician != null) {
                    displayTechnicianDetails(selectedTechnician);
                } else {
                    DisplayUtils.printError("Technician not found with ID: " + technicianId);
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid technician ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to fetch technicians for details view", e);
            DisplayUtils.printError("Failed to retrieve technicians: " + e.getMessage());
        }
        
        DisplayUtils.waitForEnter();
    }
    
    private void createNewTechnician() {
        DisplayUtils.printHeader("CREATE NEW TECHNICIAN");
        
        try {
            // Use TechnicianBuilder to collect input
            Technician newTechnician = technicianBuilder.buildNewTechnician();
            
            if (newTechnician == null) {
                return; // User cancelled
            }
            
            // Create the technician via API
            Technician createdTechnician = apiService.createTechnician(newTechnician);
            
            System.out.printf("✅ Technician %s created (ID: %d)\n", 
                createdTechnician.getFullName(), createdTechnician.getId());
            
            logger.info("Created new technician: {} (ID: {})", 
                createdTechnician.getFullName(), createdTechnician.getId());
            
        } catch (ApiException e) {
            logger.error("Failed to create technician", e);
            DisplayUtils.printError("Failed to create technician: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during technician creation", e);
            DisplayUtils.printError("An unexpected error occurred while creating the technician.");
        }
        
        DisplayUtils.waitForEnter();
    }
    
    private void editTechnician() {
        DisplayUtils.printHeader("EDIT TECHNICIAN");
        
        try {
            List<Technician> technicians = apiService.getAllTechnicians();
            
            if (technicians.isEmpty()) {
                System.out.println("📭 No technicians found in the system.");
                DisplayUtils.waitForEnter();
                return;
            }
            
            // Display technician selection
            System.out.println("📋 Select a technician to edit:");
            System.out.println();
            displayTechniciansTable(technicians);
            
            System.out.print("Enter technician ID to edit (or 'b' to go back): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("b")) {
                return;
            }
            
            try {
                Long technicianId = Long.parseLong(input);
                Technician selectedTechnician = technicians.stream()
                    .filter(t -> t.getId().equals(technicianId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedTechnician == null) {
                    DisplayUtils.printError("Technician not found with ID: " + technicianId);
                    DisplayUtils.waitForEnter();
                    return;
                }
                
                // Use TechnicianBuilder to collect updates
                Technician updatedTechnician = technicianBuilder.buildTechnicianUpdate(selectedTechnician);
                
                if (updatedTechnician == null) {
                    return; // User cancelled
                }
                
                // Update the technician via API
                Technician result = apiService.updateTechnician(technicianId, updatedTechnician);
                
                System.out.printf("✅ %s updated\n", result.getFullName());
                
                logger.info("Updated technician: {} (ID: {})", result.getFullName(), technicianId);
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid technician ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to edit technician", e);
            DisplayUtils.printError("Failed to edit technician: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during technician editing", e);
            DisplayUtils.printError("An unexpected error occurred while editing the technician.");
        }
        
        DisplayUtils.waitForEnter();
    }
    
    private void manageTechnicianStatus() {
        DisplayUtils.printHeader("TECHNICIAN STATUS MANAGEMENT");
        
        System.out.println("ℹ️  Status Management Information:");
        System.out.println("   Change technician status between ACTIVE, ON_VACATION, SICK_LEAVE, and TERMINATED.");
        System.out.println("   TERMINATED technicians cannot be assigned new tickets or appointments.");
        System.out.println();
        System.out.println("⚠️  Note: Status changes may be restricted by server business rules.");
        System.out.println("   Contact system administrator if status changes are not applied.");
        System.out.println();
        
        try {
            List<Technician> technicians = apiService.getAllTechnicians();
            
            if (technicians.isEmpty()) {
                System.out.println("📭 No technicians found in the system.");
                DisplayUtils.waitForEnter();
                return;
            }
            
            // Display technician selection
            System.out.println("📋 Select a technician to change status:");
            System.out.println();
            displayTechniciansTable(technicians);
            
            System.out.print("Enter technician ID to change status (or 'b' to go back): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("b")) {
                return;
            }
            
            try {
                Long technicianId = Long.parseLong(input);
                Technician selectedTechnician = technicians.stream()
                    .filter(t -> t.getId().equals(technicianId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedTechnician == null) {
                    DisplayUtils.printError("Technician not found with ID: " + technicianId);
                    DisplayUtils.waitForEnter();
                    return;
                }
                
                // Show current status and options
                System.out.println();
                System.out.printf("📋 Current Status: %s\n", selectedTechnician.getFullName());
                System.out.printf("Status: %s\n", getStatusDisplay(selectedTechnician.getStatus()));
                System.out.println();
                
                System.out.println("🔹 Available Status Options:");
                System.out.println("  1. ACTIVE - Available for assignments");
                System.out.println("  2. ON_VACATION - Temporarily unavailable");
                System.out.println("  3. SICK_LEAVE - On medical leave");
                System.out.println("  4. TERMINATED - No longer with company");
                System.out.println();
                
                System.out.print("Select new status (1-4): ");
                String statusChoice = scanner.nextLine().trim();
                
                String newStatus;
                switch (statusChoice) {
                    case "1":
                        newStatus = "ACTIVE";
                        break;
                    case "2":
                        newStatus = "ON_VACATION";
                        break;
                    case "3":
                        newStatus = "SICK_LEAVE";
                        break;
                    case "4":
                        newStatus = "TERMINATED";
                        break;
                    default:
                        DisplayUtils.printError("Invalid status selection.");
                        DisplayUtils.waitForEnter();
                        return;
                }
                
                if (newStatus.equals(selectedTechnician.getStatus())) {
                    System.out.println("ℹ️  Technician already has this status.");
                    DisplayUtils.waitForEnter();
                    return;
                }
                
                // Confirmation
                System.out.printf("⚠️  Change %s's status from %s to %s?\n", 
                    selectedTechnician.getFullName(), selectedTechnician.getStatus(), newStatus);
                    
                if (newStatus.equals("TERMINATED")) {
                    System.out.println("   ⚠️  TERMINATED technicians cannot be assigned new work!");
                }
                
                System.out.print("Confirm status change? (y/n): ");
                String confirm = scanner.nextLine().trim().toLowerCase();
                
                if (confirm.equals("y") || confirm.equals("yes")) {
                    // Update technician status
                    Technician updatedTechnician = new Technician();
                    updatedTechnician.setId(selectedTechnician.getId());
                    updatedTechnician.setFirstName(selectedTechnician.getFirstName());
                    updatedTechnician.setLastName(selectedTechnician.getLastName());
                    updatedTechnician.setFullName(selectedTechnician.getFullName());
                    updatedTechnician.setEmail(selectedTechnician.getEmail());
                    updatedTechnician.setPhone(selectedTechnician.getPhone());
                    updatedTechnician.setSkills(selectedTechnician.getSkills());
                    updatedTechnician.setStatus(newStatus);
                    
                    try {
                        Technician result = apiService.updateTechnician(technicianId, updatedTechnician);
                        
                        // Check if the status change was actually applied
                        if (!newStatus.equals(result.getStatus())) {
                            DisplayUtils.printError("⚠️  Status change not applied by server.");
                            System.out.println("   The server has business rules that prevent status changes through this endpoint.");
                            System.out.println("   Status remains: " + result.getStatus());
                            System.out.println("   Contact system administrator for manual status changes.");
                            logger.warn("Server prevented status change for technician ID: {} - requested: {}, actual: {}", 
                                technicianId, newStatus, result.getStatus());
                        } else {
                            System.out.printf("✅ %s status changed to %s\n", result.getFullName(), result.getStatus());
                            logger.info("Updated technician status: {} (ID: {}) -> {}", 
                                result.getFullName(), technicianId, result.getStatus());
                        }
                    } catch (Exception e) {
                        DisplayUtils.printError("Failed to update technician status: " + e.getMessage());
                        logger.error("Failed to update technician status for ID: " + technicianId, e);
                    }
                } else {
                    System.out.println("Status change cancelled.");
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid technician ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to manage technician status", e);
            DisplayUtils.printError("Failed to retrieve technicians: " + e.getMessage());
        }
        
        DisplayUtils.waitForEnter();
    }
    
    private void deleteTechnician() {
        DisplayUtils.printHeader("DELETE TECHNICIAN");
        
        System.out.println("⚠️  Warning: Deleting technicians is a permanent action!");
        System.out.println("   Consider setting status to TERMINATED instead of deleting.");
        System.out.println("   Deleted technicians cannot be recovered.");
        System.out.println();
        
        try {
            List<Technician> technicians = apiService.getAllTechnicians();
            
            if (technicians.isEmpty()) {
                System.out.println("📭 No technicians found in the system.");
                DisplayUtils.waitForEnter();
                return;
            }
            
            // Display technician selection
            System.out.println("📋 Select a technician to delete:");
            System.out.println();
            displayTechniciansTable(technicians);
            
            System.out.print("Enter technician ID to delete (or 'b' to go back): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("b")) {
                return;
            }
            
            try {
                Long technicianId = Long.parseLong(input);
                Technician selectedTechnician = technicians.stream()
                    .filter(t -> t.getId().equals(technicianId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedTechnician == null) {
                    DisplayUtils.printError("Technician not found with ID: " + technicianId);
                    DisplayUtils.waitForEnter();
                    return;
                }
                
                // Show technician details and warnings
                System.out.println();
                displayTechnicianSummary(selectedTechnician);
                
                // Check if technician is active
                if (selectedTechnician.isActive()) {
                    System.out.println("⚠️  This technician is currently ACTIVE!");
                    System.out.println("   Consider setting status to TERMINATED first.");
                    System.out.println();
                }
                
                // Multi-step confirmation
                System.out.println("🔹 Deletion Confirmation Process:");
                System.out.println("   Step 1: Confirm technician selection");
                System.out.println("   Step 2: Type technician name for verification");
                System.out.println("   Step 3: Final deletion confirmation");
                System.out.println();
                
                // Step 1: Confirm selection
                System.out.printf("Step 1: Delete technician %s? (y/n): ", selectedTechnician.getFullName());
                String confirm1 = scanner.nextLine().trim().toLowerCase();
                
                if (!confirm1.equals("y") && !confirm1.equals("yes")) {
                    System.out.println("Deletion cancelled.");
                    DisplayUtils.waitForEnter();
                    return;
                }
                
                // Step 2: Name verification
                System.out.printf("Step 2: Type the technician's full name '%s' to verify: ", 
                    selectedTechnician.getFullName());
                String nameVerification = scanner.nextLine().trim();
                
                if (!nameVerification.equals(selectedTechnician.getFullName())) {
                    DisplayUtils.printError("Name verification failed. Deletion cancelled.");
                    DisplayUtils.waitForEnter();
                    return;
                }
                
                // Step 3: Final confirmation
                System.out.print("Step 3: Type 'DELETE' to confirm permanent deletion: ");
                String finalConfirm = scanner.nextLine().trim();
                
                if (!finalConfirm.equals("DELETE")) {
                    System.out.println("Final confirmation failed. Deletion cancelled.");
                    DisplayUtils.waitForEnter();
                    return;
                }
                
                // Attempt deletion
                try {
                    apiService.deleteTechnician(technicianId);
                    System.out.printf("✅ %s deleted\n", selectedTechnician.getFullName());
                    logger.info("Deleted technician: {} (ID: {})", selectedTechnician.getFullName(), technicianId);
                    
                } catch (ApiException e) {
                    if (e.getStatusCode() == 409) {
                        System.out.println();
                        DisplayUtils.printError("❌ Cannot delete technician");
                        System.out.println("   Server message: " + e.getMessage());
                        System.out.println();
                        System.out.println("🔹 Alternative Actions:");
                        System.out.println("   1. Set technician status to TERMINATED instead");
                        System.out.println("   2. Contact system administrator to resolve dependencies");
                        System.out.println("   3. Check for active tickets or assignments");
                        System.out.println();
                        System.out.println("💡 Tip: TERMINATED technicians remain in the system for reporting");
                        System.out.println("        but cannot be assigned new work.");
                        // Log as info since this is expected business logic, not an error
                        logger.info("Delete operation blocked by server for technician ID: {} (expected business rule)", technicianId);
                    } else {
                        DisplayUtils.printError("Failed to delete technician: " + e.getMessage());
                        logger.error("Failed to delete technician ID: " + technicianId, e);
                    }
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid technician ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to retrieve technicians for deletion", e);
            DisplayUtils.printError("Failed to retrieve technicians: " + e.getMessage());
        }
        
        DisplayUtils.waitForEnter();
    }
    
    private void technicianReports() {
        DisplayUtils.printHeader("TECHNICIAN REPORTS & ANALYTICS");
        
        try {
            List<Technician> technicians = apiService.getAllTechnicians();
            
            if (technicians.isEmpty()) {
                System.out.println("📭 No technicians found in the system.");
                DisplayUtils.waitForEnter();
                return;
            }
            
            // Calculate statistics
            long totalCount = technicians.size();
            long activeCount = technicians.stream().filter(t -> "ACTIVE".equals(t.getStatus())).count();
            long vacationCount = technicians.stream().filter(t -> "ON_VACATION".equals(t.getStatus())).count();
            long sickCount = technicians.stream().filter(t -> "SICK_LEAVE".equals(t.getStatus())).count();
            long terminatedCount = technicians.stream().filter(t -> "TERMINATED".equals(t.getStatus())).count();
            
            // Skill analysis
            Map<String, Long> skillCounts = technicians.stream()
                .filter(t -> t.getSkills() != null)
                .flatMap(t -> t.getSkills().stream())
                .collect(Collectors.groupingBy(skill -> skill, Collectors.counting()));
            
            // Workload analysis
            int totalWorkload = technicians.stream()
                .filter(t -> t.getCurrentWorkload() != null)
                .mapToInt(Technician::getCurrentWorkload)
                .sum();
            double avgWorkload = technicians.stream()
                .filter(t -> t.getCurrentWorkload() != null)
                .mapToInt(Technician::getCurrentWorkload)
                .average()
                .orElse(0.0);
            
            // Display report
            System.out.println("📊 TECHNICIAN SYSTEM OVERVIEW");
            System.out.println("═".repeat(80));
            System.out.printf("Total Technicians:      %d\n", totalCount);
            System.out.printf("Active:                  %d (%.1f%%)\n", activeCount, 
                (activeCount * 100.0 / totalCount));
            System.out.printf("On Vacation:             %d (%.1f%%)\n", vacationCount, 
                (vacationCount * 100.0 / totalCount));
            System.out.printf("Sick Leave:              %d (%.1f%%)\n", sickCount, 
                (sickCount * 100.0 / totalCount));
            System.out.printf("Terminated:              %d (%.1f%%)\n", terminatedCount, 
                (terminatedCount * 100.0 / totalCount));
            System.out.println();
            
            System.out.println("💼 WORKLOAD ANALYSIS");
            System.out.println("─".repeat(40));
            System.out.printf("Total Current Workload:  %d tickets\n", totalWorkload);
            System.out.printf("Average Workload:        %.1f tickets/technician\n", avgWorkload);
            System.out.println();
            
            System.out.println("🛠️  SKILL COVERAGE");
            System.out.println("─".repeat(40));
            if (skillCounts.isEmpty()) {
                System.out.println("No skill data available");
            } else {
                skillCounts.entrySet().stream()
                    .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                    .forEach(entry -> {
                        double percentage = (entry.getValue() * 100.0 / totalCount);
                        System.out.printf("%-12s: %d technicians (%.1f%%)\n", 
                            entry.getKey(), entry.getValue(), percentage);
                    });
            }
            System.out.println();
            
            // System health indicators
            System.out.println("🏥 SYSTEM HEALTH");
            System.out.println("─".repeat(40));
            
            double availabilityRate = (activeCount * 100.0 / totalCount);
            if (availabilityRate >= 80) {
                System.out.printf("✅ Technician Availability: %.1f%% (Excellent)\n", availabilityRate);
            } else if (availabilityRate >= 60) {
                System.out.printf("⚠️  Technician Availability: %.1f%% (Moderate)\n", availabilityRate);
            } else {
                System.out.printf("❌ Technician Availability: %.1f%% (Critical)\n", availabilityRate);
            }
            
            if (avgWorkload <= 3) {
                System.out.printf("✅ Average Workload: %.1f tickets (Healthy)\n", avgWorkload);
            } else if (avgWorkload <= 6) {
                System.out.printf("⚠️  Average Workload: %.1f tickets (High)\n", avgWorkload);
            } else {
                System.out.printf("❌ Average Workload: %.1f tickets (Overloaded)\n", avgWorkload);
            }
            
            System.out.println();
            System.out.println("📈 RECOMMENDATIONS");
            System.out.println("─".repeat(40));
            
            if (availabilityRate < 70) {
                System.out.println("• Consider hiring additional technicians");
            }
            if (avgWorkload > 5) {
                System.out.println("• Review workload distribution and assignment policies");
            }
            if (skillCounts.values().stream().anyMatch(count -> count < 2)) {
                System.out.println("• Consider cross-training technicians for better skill coverage");
            }
            if (activeCount < 3) {
                System.out.println("• Ensure minimum staffing levels for service continuity");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to generate technician reports", e);
            DisplayUtils.printError("Failed to generate reports: " + e.getMessage());
        }
        
        DisplayUtils.waitForEnter();
    }
    
    // ==================== HELPER METHODS ====================
    
    private void displayTechniciansTable(List<Technician> technicians) {
        System.out.printf("%-4s %-25s %-35s %-15s %-20s %s\n", 
            "ID", "Name", "Email", "Status", "Skills", "Workload");
        System.out.println("─".repeat(120));
        
        for (Technician technician : technicians) {
            String skillsDisplay = technician.getSkills() != null ? 
                String.join(", ", technician.getSkills()) : "None";
            if (skillsDisplay.length() > 18) {
                skillsDisplay = skillsDisplay.substring(0, 15) + "...";
            }
            
            String workloadDisplay = technician.getCurrentWorkload() != null ? 
                technician.getCurrentWorkload().toString() : "N/A";
            
            System.out.printf("%-4d %-25s %-35s %-15s %-20s %s\n",
                technician.getId(),
                truncate(technician.getFullName(), 25),
                truncate(technician.getEmail(), 35),
                getStatusDisplay(technician.getStatus()),
                skillsDisplay,
                workloadDisplay
            );
        }
    }
    
    private void displayTechnicianDetails(Technician technician) {
        System.out.println();
        DisplayUtils.printHeader("TECHNICIAN DETAILS - " + technician.getFullName());
        
        System.out.println("👤 Personal Information");
        System.out.println("─".repeat(80));
        System.out.printf("  Name:          %s\n", technician.getFullName());
        System.out.printf("  Email:         %s\n", technician.getEmail());
        System.out.printf("  Phone:         %s\n", technician.getPhone() != null ? technician.getPhone() : "Not provided");
        System.out.printf("  Status:        %s\n", getStatusDisplay(technician.getStatus()));
        System.out.printf("  Available:     %s\n", technician.getAvailable() != null && technician.getAvailable() ? "Yes" : "No");
        
        if (technician.getCreatedAt() != null) {
            System.out.printf("  Joined:        %s\n", technician.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
        }
        System.out.println();
        
        System.out.println("🛠️  Skills & Capabilities");
        System.out.println("─".repeat(80));
        if (technician.getSkills() != null && !technician.getSkills().isEmpty()) {
            technician.getSkills().forEach(skill -> System.out.printf("  • %s\n", skill));
        } else {
            System.out.println("  No skills defined");
        }
        System.out.println();
        
        System.out.println("💼 Current Workload");
        System.out.println("─".repeat(80));
        if (technician.getCurrentWorkload() != null) {
            System.out.printf("  Active Tickets: %d\n", technician.getCurrentWorkload());
            
            // Try to fetch actual tickets for more detail
            try {
                List<Ticket> tickets = apiService.getTicketsByTechnician(technician.getId());
                long openTickets = tickets.stream()
                    .filter(t -> !"CLOSED".equalsIgnoreCase(t.getStatus()))
                    .count();
                System.out.printf("  Open Tickets:   %d\n", openTickets);
                
                if (!tickets.isEmpty()) {
                    System.out.println("  Recent Tickets:");
                    tickets.stream()
                        .limit(3)
                        .forEach(ticket -> System.out.printf("    • #%d - %s (%s)\n", 
                            ticket.getId(), 
                            truncate(ticket.getTitle(), 40), 
                            ticket.getStatus()));
                }
            } catch (ApiException e) {
                logger.warn("Could not fetch tickets for technician {}", technician.getId());
            }
        } else {
            System.out.println("  Workload information not available");
        }
        System.out.println();
        
        System.out.println("🔹 Available Actions");
        System.out.println("─".repeat(80));
        System.out.println("  1. Edit Technician Information");
        System.out.println("  2. Change Status");
        System.out.println("  3. View Assigned Tickets");
        System.out.println("  4. View Schedule");
        System.out.println("  5. Delete Technician");
        System.out.println();
    }
    
    private void displayTechnicianSummary(Technician technician) {
        System.out.printf("📋 Technician: %s\n", technician.getFullName());
        System.out.printf("   Email: %s\n", technician.getEmail());
        System.out.printf("   Status: %s\n", technician.getStatus());
        System.out.printf("   Skills: %s\n", 
            technician.getSkills() != null ? String.join(", ", technician.getSkills()) : "None");
        System.out.printf("   Current Workload: %s\n", 
            technician.getCurrentWorkload() != null ? technician.getCurrentWorkload().toString() : "N/A");
    }
    
    private String getStatusDisplay(String status) {
        if (status == null) return "UNKNOWN";
        
        switch (status) {
            case "ACTIVE":
                return "🟢 ACTIVE";
            case "ON_VACATION":
                return "🟡 ON_VACATION";
            case "SICK_LEAVE":
                return "🟠 SICK_LEAVE";
            case "TERMINATED":
                return "🔴 TERMINATED";
            default:
                return status;
        }
    }
    
    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
    }
} 