package com.localtechsupport.cli.menu.appointment;

import com.localtechsupport.cli.menu.BaseMenu;
import com.localtechsupport.cli.menu.Menu;
import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.model.Appointment;
import com.localtechsupport.cli.model.Ticket;
import com.localtechsupport.cli.model.Technician;
import com.localtechsupport.cli.client.ApiException;
import com.localtechsupport.cli.util.DisplayUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Scanner;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Map;
import java.util.HashMap;

/**
 * Menu for appointment management operations
 * 
 * Provides comprehensive appointment management with:
 * - View all appointments with calendar display
 * - Schedule new appointments with conflict detection
 * - Reschedule existing appointments
 * - Status management (6-state workflow)
 * - Cancel appointments with reasons
 * - Appointment reports and analytics
 * 
 * Implements business rules: 30min-8hr duration, only ACTIVE technicians, only OPEN tickets
 * Status workflow: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED/CANCELLED/NO_SHOW
 */
public class AppointmentManagementMenu extends BaseMenu {
    
    private static final Logger logger = LoggerFactory.getLogger(AppointmentManagementMenu.class);
    private AppointmentBuilder appointmentBuilder;
    
    public AppointmentManagementMenu(Menu parentMenu) {
        super(parentMenu);
    }
    
    @Override
    protected String getMenuTitle() {
        return "APPOINTMENT MANAGEMENT";
    }
    
    @Override
    protected void displayCustomContent() {
        try {
            // Display current system status
            List<Appointment> appointments = apiService.getAllAppointments();
            long totalCount = appointments.size();
            
            // Status breakdown
            long pendingCount = appointments.stream().filter(a -> "PENDING".equals(a.getStatus())).count();
            long confirmedCount = appointments.stream().filter(a -> "CONFIRMED".equals(a.getStatus())).count();
            long inProgressCount = appointments.stream().filter(a -> "IN_PROGRESS".equals(a.getStatus())).count();
            long completedCount = appointments.stream().filter(a -> "COMPLETED".equals(a.getStatus())).count();
            long cancelledCount = appointments.stream().filter(a -> "CANCELLED".equals(a.getStatus())).count();
            long noShowCount = appointments.stream().filter(a -> "NO_SHOW".equals(a.getStatus())).count();
            
            // Upcoming appointments (next 7 days)
            List<Appointment> upcomingAppointments = apiService.getUpcomingAppointments(7);
            
            System.out.println("📊 Current System Status:");
            System.out.printf("    Total Appointments: %d\n", totalCount);
            System.out.printf("    Status Breakdown: %d pending, %d confirmed, %d in-progress, %d completed\n", 
                pendingCount, confirmedCount, inProgressCount, completedCount);
            System.out.printf("    Upcoming (7 days): %d appointments scheduled\n", upcomingAppointments.size());
            System.out.println();
            
            System.out.println("ℹ️  Appointment Status Workflow:");
            System.out.println("   PENDING → CONFIRMED → IN_PROGRESS → COMPLETED (or CANCELLED/NO_SHOW)");
            System.out.println("   Business Rules: 30min-8hr duration, Active technicians only, Open tickets only");
            System.out.println();
            
            System.out.println("⚠️  API Update Limitations:");
            System.out.println("   ✅ Status updates: Full support for workflow transitions");
            System.out.println("   ❌ Time changes: Not supported - use Cancel & Recreate instead");
            System.out.println("   ❌ Technician changes: Not supported - use Cancel & Recreate instead");
            System.out.println("   ❌ Ticket reassignment: Not supported (fixed at creation)");
            System.out.println();
            
        } catch (ApiException e) {
            logger.error("Failed to fetch appointment statistics", e);
            System.out.println("📊 Current System Status: Unable to load statistics");
            System.out.println();
            
            System.out.println("ℹ️  Appointment Status Workflow:");
            System.out.println("   PENDING → CONFIRMED → IN_PROGRESS → COMPLETED (or CANCELLED/NO_SHOW)");
            System.out.println("   Business Rules: 30min-8hr duration, Active technicians only, Open tickets only");
            System.out.println();
            
            System.out.println("⚠️  API Update Limitations:");
            System.out.println("   ✅ Status updates: Full support for workflow transitions");
            System.out.println("   ❌ Time changes: Not supported - use Cancel & Recreate instead");
            System.out.println("   ❌ Technician changes: Not supported - use Cancel & Recreate instead");
            System.out.println("   ❌ Ticket reassignment: Not supported (fixed at creation)");
            System.out.println();
        }
    }
    
    @Override
    protected void initializeMenuOptions() {
        // Initialize AppointmentBuilder with scanner and apiService from BaseMenu
        this.appointmentBuilder = new AppointmentBuilder(scanner, apiService);
        
        addActionOption(1, "View All Appointments", "Calendar view of all appointments with status",
            this::viewAllAppointments);
            
        addActionOption(2, "Upcoming Appointments", "View appointments in the next 7 days", 
            this::viewUpcomingAppointments);
            
        addActionOption(3, "Schedule New Appointment", "Create new appointment with conflict detection",
            this::scheduleNewAppointment);
            
        addActionOption(4, "View Appointment Details", "Detailed view with ticket and technician info",
            this::viewAppointmentDetails);
            
        addActionOption(5, "Cancel & Recreate Appointment", "Change times/technician (cancel + create new)",
            this::cancelAndRecreateAppointment);
            
        addActionOption(6, "Confirm Appointment", "Change status from PENDING to CONFIRMED",
            this::confirmAppointment);
            
        addActionOption(7, "Start Appointment", "Change status to IN_PROGRESS",
            this::startAppointment);
            
        addActionOption(8, "Complete Appointment", "Mark appointment as COMPLETED",
            this::completeAppointment);
            
        addActionOption(9, "Cancel Appointment", "Cancel appointment with reason",
            this::cancelAppointment);
            
        addActionOption(10, "Mark No-Show", "Mark client as no-show",
            this::markNoShow);
            
        addActionOption(11, "Search Appointments", "Find appointments by various criteria",
            this::searchAppointments);
            
        addActionOption(12, "Appointment Reports", "Statistics and analytics",
            this::appointmentReports);
    }
    
    // ==================== MENU OPERATIONS ====================
    
    private void viewAllAppointments() {
        DisplayUtils.printHeader("ALL APPOINTMENTS");
        
        try {
            List<Appointment> appointments = apiService.getAllAppointments();
            
            if (appointments.isEmpty()) {
                System.out.println("📭 No appointments found in the system.");
                waitForEnter();
                return;
            }
            
            // Sort by scheduled start time
            appointments = appointments.stream()
                .sorted((a1, a2) -> {
                    if (a1.getScheduledStartTime() == null) return 1;
                    if (a2.getScheduledStartTime() == null) return -1;
                    return a1.getScheduledStartTime().compareTo(a2.getScheduledStartTime());
                })
                .collect(Collectors.toList());
            
            // Display appointments table
            displayAppointmentsTable(appointments);
            
            System.out.println();
            System.out.print("Enter appointment ID to view details (or press Enter to continue): ");
            String input = scanner.nextLine().trim();
            
            if (!input.isEmpty()) {
                try {
                    Long appointmentId = Long.parseLong(input);
                    Appointment selectedAppointment = appointments.stream()
                        .filter(a -> a.getId().equals(appointmentId))
                        .findFirst()
                        .orElse(null);
                        
                    if (selectedAppointment != null) {
                        displayAppointmentDetails(selectedAppointment);
                    } else {
                        DisplayUtils.printError("Appointment not found with ID: " + appointmentId);
                    }
                } catch (NumberFormatException e) {
                    DisplayUtils.printError("Invalid appointment ID format.");
                }
            }
            
        } catch (ApiException e) {
            logger.error("Failed to fetch appointments", e);
            DisplayUtils.printError("Failed to retrieve appointments: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void viewUpcomingAppointments() {
        DisplayUtils.printHeader("UPCOMING APPOINTMENTS");
        
        try {
            List<Appointment> upcomingAppointments = apiService.getUpcomingAppointments(7);
            
            if (upcomingAppointments.isEmpty()) {
                System.out.println("📭 No upcoming appointments in the next 7 days.");
                waitForEnter();
                return;
            }
            
            System.out.printf("📅 Found %d upcoming appointment(s) in the next 7 days:\n\n", upcomingAppointments.size());
            
            // Display appointments table
            displayAppointmentsTable(upcomingAppointments);
            
            // Show next few appointments with details
            System.out.println("\n🔜 Next Few Appointments:");
            upcomingAppointments.stream()
                .limit(5)
                .forEach(this::displayAppointmentSummary);
                
        } catch (ApiException e) {
            logger.error("Failed to fetch upcoming appointments", e);
            DisplayUtils.printError("Failed to retrieve upcoming appointments: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void scheduleNewAppointment() {
        DisplayUtils.printHeader("SCHEDULE NEW APPOINTMENT");
        
        try {
            // Use AppointmentBuilder to collect input
            Appointment newAppointment = appointmentBuilder.buildNewAppointment();
            
            if (newAppointment == null) {
                return; // User cancelled
            }
            
            // Create the appointment via API
            Appointment createdAppointment;
            try {
                // Add pre-submission debugging information
                System.out.println();
                System.out.println("🔧 DEBUG: Submitting appointment with exact data:");
                System.out.printf("   Ticket ID: %d\n", newAppointment.getTicketId());
                System.out.printf("   Technician ID: %d\n", newAppointment.getTechnicianId());
                System.out.printf("   Start Time: %s\n", newAppointment.getScheduledStartTime().toString());
                System.out.printf("   End Time: %s\n", newAppointment.getScheduledEndTime().toString());
                System.out.printf("   Notes: %s\n", newAppointment.getNotes() != null ? "\"" + newAppointment.getNotes() + "\"" : "null");
                System.out.printf("   Status: %s\n", newAppointment.getStatus() != null ? newAppointment.getStatus() : "null (will be set by server)");
                System.out.println("   Timestamp: " + java.time.LocalDateTime.now());
                System.out.println();
                
                logger.info("Creating appointment - TicketId: {}, TechnicianId: {}, Start: {}, End: {}", 
                    newAppointment.getTicketId(), 
                    newAppointment.getTechnicianId(),
                    newAppointment.getScheduledStartTime(),
                    newAppointment.getScheduledEndTime());
                
                createdAppointment = apiService.createAppointment(newAppointment);
                
                DisplayUtils.printSuccess("✅ Appointment scheduled successfully!");
                System.out.printf("   Appointment ID: #%d\n", createdAppointment.getId());
                System.out.printf("   Status: %s (requires confirmation)\n", createdAppointment.getStatus());
                System.out.printf("   Scheduled: %s - %s\n", 
                    formatDateTime(createdAppointment.getScheduledStartTime()),
                    formatDateTime(createdAppointment.getScheduledEndTime()));
            } catch (ApiException e) {
                logger.error("API exception during appointment creation", e);
                
                // Detailed debugging information for troubleshooting
                System.out.println();
                System.out.println("🚨 APPOINTMENT CREATION FAILED - DEBUG INFORMATION:");
                System.out.println("═══════════════════════════════════════════════════");
                System.out.printf("Error Type: %s\n", e.getClass().getSimpleName());
                System.out.printf("Error Message: %s\n", e.getMessage());
                System.out.printf("Timestamp: %s\n", java.time.LocalDateTime.now());
                System.out.println();
                
                System.out.println("📊 REQUEST DATA SENT TO SERVER:");
                System.out.printf("   Ticket ID: %d\n", newAppointment.getTicketId());
                System.out.printf("   Technician ID: %d\n", newAppointment.getTechnicianId());
                System.out.printf("   Start Time (ISO): %s\n", newAppointment.getScheduledStartTime().toString());
                System.out.printf("   End Time (ISO): %s\n", newAppointment.getScheduledEndTime().toString());
                System.out.printf("   Duration: %d minutes\n", 
                    java.time.Duration.between(newAppointment.getScheduledStartTime(), newAppointment.getScheduledEndTime()).toMinutes());
                System.out.printf("   Notes: %s\n", newAppointment.getNotes() != null ? "\"" + newAppointment.getNotes() + "\"" : "null");
                System.out.println();
                
                // Enhanced error analysis based on error type
                if (e.getMessage().contains("500") || e.getMessage().contains("Internal Server Error")) {
                    DisplayUtils.printError("⚠️  SERVER ERROR (500) - Server-side validation or processing failed");
                    System.out.println();
                    System.out.println("🔍 IMMEDIATE DIAGNOSTIC STEPS:");
                    System.out.println("   1. Check server logs for stack trace at " + java.time.LocalDateTime.now());
                    System.out.println("   2. Verify these entities still exist and have correct status:");
                    System.out.printf("      - Ticket #%d should be OPEN\n", newAppointment.getTicketId());
                    System.out.printf("      - Technician #%d should be ACTIVE\n", newAppointment.getTechnicianId());
                    System.out.println("   3. Check for database constraint violations");
                    System.out.println("   4. Look for race conditions (another user modifying data)");
                    System.out.println();
                    System.out.println("🔧 SERVER-SIDE ISSUES TO INVESTIGATE:");
                    System.out.println("   • Database connection/transaction failures");
                    System.out.println("   • JPQL query errors in conflict detection");
                    System.out.println("   • Foreign key constraint violations");
                    System.out.println("   • Business rule enforcement at DB level");
                    System.out.println("   • Timezone handling issues");
                    
                } else if (e.getMessage().contains("400") || e.getMessage().contains("Bad Request")) {
                    DisplayUtils.printError("⚠️  BAD REQUEST (400) - Data format/validation error");
                    System.out.println();
                    System.out.println("🔍 DATA FORMAT ISSUES:");
                    System.out.println("   • Date format: Check if server expects different ISO format");
                    System.out.println("   • Field validation: Server may have stricter rules than client");
                    System.out.println("   • Required fields: Server may expect additional fields");
                    
                } else if (e.getMessage().contains("409") || e.getMessage().contains("Conflict")) {
                    DisplayUtils.printError("⚠️  CONFLICT (409) - Scheduling conflict detected by server");
                    System.out.println();
                    System.out.println("🔍 CONFLICT ANALYSIS:");
                    System.out.println("   • Server found conflicts that client validation missed");
                    System.out.println("   • Race condition: Another appointment created between validation and submission");
                    System.out.println("   • Different conflict detection logic on server vs client");
                    
                } else if (e.getMessage().contains("404") || e.getMessage().contains("Not Found")) {
                    DisplayUtils.printError("⚠️  NOT FOUND (404) - Referenced entity not found");
                    System.out.println();
                    System.out.println("🔍 ENTITY VERIFICATION NEEDED:");
                    System.out.printf("   • Ticket #%d may have been deleted\n", newAppointment.getTicketId());
                    System.out.printf("   • Technician #%d may have been deleted\n", newAppointment.getTechnicianId());
                    System.out.println("   • Database referential integrity issues");
                    
                } else {
                    DisplayUtils.printError("⚠️  UNEXPECTED ERROR - " + e.getMessage());
                    System.out.println();
                    System.out.println("🔍 GENERAL TROUBLESHOOTING:");
                    System.out.println("   • Network connectivity issues");
                    System.out.println("   • Server unavailable or overloaded");
                    System.out.println("   • API endpoint changes");
                    System.out.println("   • Authentication/authorization issues");
                }
                
                System.out.println();
                System.out.println("💡 IMMEDIATE WORKAROUNDS TO TRY:");
                System.out.println("   1. Try with a different technician");
                System.out.println("   2. Try with a different time slot (30 min later)");
                System.out.println("   3. Try with a different ticket");
                System.out.println("   4. Wait 1-2 minutes and retry (in case of race condition)");
                System.out.println();
                
                // Offer to run diagnostic checks
                System.out.print("🔹 Run diagnostic checks to verify current entity states? (y/n): ");
                String runDiagnostics = scanner.nextLine().trim().toLowerCase();
                
                if (runDiagnostics.equals("y") || runDiagnostics.equals("yes")) {
                    runAppointmentDiagnostics(newAppointment);
                }
                
                waitForEnter();
                return;
            }
            
            // Ask if user wants to confirm immediately
            System.out.print("\n🔹 Confirm this appointment now? (y/n): ");
            String confirmChoice = scanner.nextLine().trim().toLowerCase();
            
            if (confirmChoice.equals("y") || confirmChoice.equals("yes")) {
                try {
                    Appointment confirmedAppointment = apiService.confirmAppointment(createdAppointment.getId());
                    DisplayUtils.printSuccess("✅ Appointment confirmed! Status: " + confirmedAppointment.getStatus());
                } catch (ApiException e) {
                    logger.error("Failed to confirm appointment", e);
                    DisplayUtils.printError("Failed to confirm appointment: " + e.getMessage());
                    System.out.println("The appointment was created but confirmation failed. You can confirm it later.");
                }
            }
            
        } catch (Exception e) {
            logger.error("Unexpected error during appointment creation", e);
            DisplayUtils.printError("An unexpected error occurred while scheduling the appointment.");
            System.out.println("This may indicate a system issue. Please try again or contact support.");
        }
        
        waitForEnter();
    }
    
    private void viewAppointmentDetails() {
        DisplayUtils.printHeader("APPOINTMENT DETAILS");
        
        try {
            List<Appointment> appointments = apiService.getAllAppointments();
            
            if (appointments.isEmpty()) {
                System.out.println("📭 No appointments found in the system.");
                waitForEnter();
                return;
            }
            
            // Display appointment selection
            System.out.println("📋 Select an appointment to view details:");
            System.out.println();
            displayAppointmentsTable(appointments);
            
            System.out.print("Enter appointment ID: ");
            String input = scanner.nextLine().trim();
            
            try {
                Long appointmentId = Long.parseLong(input);
                Appointment selectedAppointment = appointments.stream()
                    .filter(a -> a.getId().equals(appointmentId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedAppointment != null) {
                    displayAppointmentDetails(selectedAppointment);
                } else {
                    DisplayUtils.printError("Appointment not found with ID: " + appointmentId);
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid appointment ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to fetch appointments for details view", e);
            DisplayUtils.printError("Failed to retrieve appointments: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void cancelAndRecreateAppointment() {
        DisplayUtils.printHeader("CANCEL & RECREATE APPOINTMENT");
        
        System.out.println("⚠️  API LIMITATION NOTICE:");
        System.out.println("   The API does not support direct time/technician updates.");
        System.out.println("   This process will:");
        System.out.println("   1️⃣ Cancel the existing appointment");
        System.out.println("   2️⃣ Create a new appointment with your changes");
        System.out.println("   3️⃣ Preserve audit trail through cancellation reason");
        System.out.println();
        
        try {
            List<Appointment> appointments = apiService.getAllAppointments().stream()
                .filter(a -> !"COMPLETED".equals(a.getStatus()) && 
                           !"CANCELLED".equals(a.getStatus()) && 
                           !"NO_SHOW".equals(a.getStatus()))
                .collect(Collectors.toList());
            
            if (appointments.isEmpty()) {
                System.out.println("📭 No modifiable appointments found.");
                waitForEnter();
                return;
            }
            
            System.out.println("📋 Select appointment to modify:");
            System.out.println("   (Only non-terminal appointments can be modified)");
            System.out.println();
            displayAppointmentsTable(appointments);
            
            System.out.print("Enter appointment ID to modify: ");
            String input = scanner.nextLine().trim();
            
            try {
                Long appointmentId = Long.parseLong(input);
                Appointment selectedAppointment = appointments.stream()
                    .filter(a -> a.getId().equals(appointmentId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedAppointment == null) {
                    DisplayUtils.printError("Appointment not found or cannot be modified.");
                    waitForEnter();
                    return;
                }
                
                // Display current appointment details
                System.out.println();
                System.out.println("📄 CURRENT APPOINTMENT:");
                displayAppointmentDetails(selectedAppointment);
                
                // Confirm the operation
                System.out.printf("❓ Proceed to cancel appointment #%d and create a new one? (y/n): ", appointmentId);
                String confirm = scanner.nextLine().trim().toLowerCase();
                
                if (!confirm.equals("y") && !confirm.equals("yes")) {
                    System.out.println("❌ Operation cancelled.");
                    waitForEnter();
                    return;
                }
                
                // Step 1: Cancel the existing appointment
                System.out.println();
                System.out.println("🗑️  STEP 1: Cancelling existing appointment...");
                String cancellationReason = "Cancelled for modification - recreating with updated details";
                
                try {
                    apiService.cancelAppointment(appointmentId, cancellationReason);
                    DisplayUtils.printSuccess("✅ Original appointment cancelled successfully");
                } catch (ApiException e) {
                    DisplayUtils.printError("❌ Failed to cancel original appointment: " + e.getMessage());
                    waitForEnter();
                    return;
                }
                
                // Step 2: Create new appointment with updated details
                System.out.println();
                System.out.println("📅 STEP 2: Creating new appointment...");
                System.out.println("   (You can modify any details - times, technician, notes, etc.)");
                System.out.println();
                
                // Create new appointment (user will input all details fresh)
                Appointment newAppointment = appointmentBuilder.buildNewAppointment();
                
                if (newAppointment == null) {
                    System.out.println("❌ New appointment creation cancelled.");
                    System.out.println("⚠️  WARNING: Original appointment was already cancelled!");
                    System.out.println("   You may need to manually recreate the appointment.");
                    waitForEnter();
                    return;
                }
                
                // Create the new appointment
                try {
                    Appointment createdAppointment = apiService.createAppointment(newAppointment);
                    
                    System.out.println();
                    DisplayUtils.printSuccess("✅ APPOINTMENT MODIFICATION COMPLETED!");
                    System.out.printf("   Cancelled: Appointment #%d\n", appointmentId);
                    System.out.printf("   Created:   Appointment #%d\n", createdAppointment.getId());
                    System.out.printf("   Status:    %s\n", createdAppointment.getStatus());
                    System.out.printf("   New Time:  %s - %s\n", 
                        formatDateTime(createdAppointment.getScheduledStartTime()),
                        formatDateTime(createdAppointment.getScheduledEndTime()));
                    
                } catch (ApiException e) {
                    DisplayUtils.printError("❌ Failed to create new appointment: " + e.getMessage());
                    System.out.println("⚠️  CRITICAL: Original appointment was cancelled but new one failed!");
                    System.out.println("   You may need to manually recreate the appointment.");
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid appointment ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to modify appointment", e);
            DisplayUtils.printError("Failed to modify appointment: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void confirmAppointment() {
        updateAppointmentStatus("CONFIRM", "PENDING", 
            apiService::confirmAppointment, 
            "Confirm appointment (PENDING → CONFIRMED)");
    }
    
    private void startAppointment() {
        updateAppointmentStatus("START", "CONFIRMED", 
            apiService::startAppointment, 
            "Start appointment (CONFIRMED → IN_PROGRESS)");
    }
    
    private void completeAppointment() {
        DisplayUtils.printHeader("COMPLETE APPOINTMENT");
        
        try {
            List<Appointment> appointments = apiService.getAllAppointments().stream()
                .filter(a -> "IN_PROGRESS".equals(a.getStatus()))
                .collect(Collectors.toList());
            
            if (appointments.isEmpty()) {
                System.out.println("📭 No in-progress appointments to complete.");
                waitForEnter();
                return;
            }
            
            System.out.println("📋 Select appointment to complete:");
            System.out.println("   (Only IN_PROGRESS appointments can be completed)");
            System.out.println();
            displayAppointmentsTable(appointments);
            
            System.out.print("Enter appointment ID to complete: ");
            String input = scanner.nextLine().trim();
            
            try {
                Long appointmentId = Long.parseLong(input);
                Appointment selectedAppointment = appointments.stream()
                    .filter(a -> a.getId().equals(appointmentId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedAppointment == null) {
                    DisplayUtils.printError("Appointment not found or not in IN_PROGRESS status.");
                    waitForEnter();
                    return;
                }
                
                // Collect completion notes
                System.out.print("Completion notes (optional): ");
                String notes = scanner.nextLine().trim();
                
                // Confirm completion
                System.out.printf("✅ Complete appointment #%d? (y/n): ", appointmentId);
                String confirm = scanner.nextLine().trim().toLowerCase();
                
                if (confirm.equals("y") || confirm.equals("yes")) {
                    Appointment result = apiService.completeAppointment(appointmentId, notes.isEmpty() ? null : notes);
                    DisplayUtils.printSuccess("✅ Appointment completed successfully!");
                    System.out.printf("   Status: %s\n", result.getStatus());
                } else {
                    System.out.println("❌ Completion cancelled.");
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid appointment ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to complete appointment", e);
            DisplayUtils.printError("Failed to complete appointment: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void cancelAppointment() {
        DisplayUtils.printHeader("CANCEL APPOINTMENT");
        
        try {
            List<Appointment> appointments = apiService.getAllAppointments().stream()
                .filter(a -> !"COMPLETED".equals(a.getStatus()) && 
                           !"CANCELLED".equals(a.getStatus()) && 
                           !"NO_SHOW".equals(a.getStatus()))
                .collect(Collectors.toList());
            
            if (appointments.isEmpty()) {
                System.out.println("📭 No cancellable appointments found.");
                waitForEnter();
                return;
            }
            
            System.out.println("📋 Select appointment to cancel:");
            System.out.println("   (Only non-terminal appointments can be cancelled)");
            System.out.println();
            displayAppointmentsTable(appointments);
            
            System.out.print("Enter appointment ID to cancel: ");
            String input = scanner.nextLine().trim();
            
            try {
                Long appointmentId = Long.parseLong(input);
                Appointment selectedAppointment = appointments.stream()
                    .filter(a -> a.getId().equals(appointmentId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedAppointment == null) {
                    DisplayUtils.printError("Appointment not found or cannot be cancelled.");
                    waitForEnter();
                    return;
                }
                
                // Collect cancellation reason
                System.out.print("Cancellation reason: ");
                String reason = scanner.nextLine().trim();
                
                if (reason.isEmpty()) {
                    DisplayUtils.printError("Cancellation reason is required.");
                    waitForEnter();
                    return;
                }
                
                // Confirm cancellation
                System.out.printf("❌ Cancel appointment #%d? This cannot be undone. (y/n): ", appointmentId);
                String confirm = scanner.nextLine().trim().toLowerCase();
                
                if (confirm.equals("y") || confirm.equals("yes")) {
                    Appointment result = apiService.cancelAppointment(appointmentId, reason);
                    DisplayUtils.printSuccess("✅ Appointment cancelled successfully!");
                    System.out.printf("   Status: %s\n", result.getStatus());
                    System.out.printf("   Reason: %s\n", reason);
                } else {
                    System.out.println("❌ Cancellation aborted.");
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid appointment ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to cancel appointment", e);
            DisplayUtils.printError("Failed to cancel appointment: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void markNoShow() {
        DisplayUtils.printHeader("MARK NO-SHOW");
        
        try {
            List<Appointment> appointments = apiService.getAllAppointments().stream()
                .filter(a -> "CONFIRMED".equals(a.getStatus()) && 
                           a.getScheduledStartTime() != null &&
                           a.getScheduledStartTime().isBefore(LocalDateTime.now()))
                .collect(Collectors.toList());
            
            if (appointments.isEmpty()) {
                System.out.println("📭 No appointments eligible for no-show marking.");
                System.out.println("    (Only confirmed past appointments can be marked as no-show)");
                waitForEnter();
                return;
            }
            
            System.out.println("📋 Select appointment to mark as no-show:");
            System.out.println("   (Only confirmed past appointments shown)");
            System.out.println();
            displayAppointmentsTable(appointments);
            
            System.out.print("Enter appointment ID to mark as no-show: ");
            String input = scanner.nextLine().trim();
            
            try {
                Long appointmentId = Long.parseLong(input);
                Appointment selectedAppointment = appointments.stream()
                    .filter(a -> a.getId().equals(appointmentId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedAppointment == null) {
                    DisplayUtils.printError("Appointment not found or not eligible for no-show.");
                    waitForEnter();
                    return;
                }
                
                // Collect no-show notes
                System.out.print("No-show notes (optional): ");
                String notes = scanner.nextLine().trim();
                
                // Confirm no-show marking
                System.out.printf("👻 Mark appointment #%d as no-show? This cannot be undone. (y/n): ", appointmentId);
                String confirm = scanner.nextLine().trim().toLowerCase();
                
                if (confirm.equals("y") || confirm.equals("yes")) {
                    Appointment result = apiService.markAppointmentNoShow(appointmentId, notes.isEmpty() ? null : notes);
                    DisplayUtils.printSuccess("✅ Appointment marked as no-show!");
                    System.out.printf("   Status: %s\n", result.getStatus());
                } else {
                    System.out.println("❌ No-show marking cancelled.");
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid appointment ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to mark appointment as no-show", e);
            DisplayUtils.printError("Failed to mark appointment as no-show: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void searchAppointments() {
        DisplayUtils.printHeader("SEARCH APPOINTMENTS");
        
        System.out.println("🔍 Search Options:");
        System.out.println("   1. Search by Status");
        System.out.println("   2. Search by Technician");
        System.out.println("   3. Search by Date Range");
        System.out.println("   4. View All Appointments");
        System.out.println();
        
        System.out.print("Select search option (1-4): ");
        String choice = scanner.nextLine().trim();
        
        try {
            List<Appointment> allAppointments = apiService.getAllAppointments();
            List<Appointment> filteredAppointments;
            String searchCriteria = "";
            
            switch (choice) {
                case "1":
                    System.out.println("Available statuses: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW");
                    System.out.print("Enter status: ");
                    String statusQuery = scanner.nextLine().trim().toUpperCase();
                    if (!statusQuery.isEmpty()) {
                        filteredAppointments = allAppointments.stream()
                            .filter(a -> statusQuery.equals(a.getStatus()))
                            .collect(Collectors.toList());
                        searchCriteria = "Status: " + statusQuery;
                    } else {
                        filteredAppointments = allAppointments;
                        searchCriteria = "All appointments";
                    }
                    break;
                    
                case "2":
                    System.out.print("Enter technician name or ID: ");
                    String techQuery = scanner.nextLine().trim().toLowerCase();
                    if (!techQuery.isEmpty()) {
                        // Get technician details for name matching
                        List<Technician> technicians = apiService.getAllTechnicians();
                        filteredAppointments = allAppointments.stream()
                            .filter(a -> {
                                if (a.getTechnicianId() == null) return false;
                                
                                // Check by ID
                                if (techQuery.equals(a.getTechnicianId().toString())) {
                                    return true;
                                }
                                
                                // Check by name
                                Technician tech = technicians.stream()
                                    .filter(t -> t.getId().equals(a.getTechnicianId()))
                                    .findFirst()
                                    .orElse(null);
                                    
                                return tech != null && 
                                       tech.getFullName().toLowerCase().contains(techQuery);
                            })
                            .collect(Collectors.toList());
                        searchCriteria = "Technician: " + techQuery;
                    } else {
                        filteredAppointments = allAppointments;
                        searchCriteria = "All appointments";
                    }
                    break;
                    
                case "3":
                    System.out.print("Enter days ahead to search (default: 7): ");
                    String daysInput = scanner.nextLine().trim();
                    int daysAhead = 7;
                    try {
                        if (!daysInput.isEmpty()) {
                            daysAhead = Integer.parseInt(daysInput);
                        }
                    } catch (NumberFormatException e) {
                        DisplayUtils.printError("Invalid number, using default 7 days.");
                    }
                    
                    LocalDateTime cutoff = LocalDateTime.now().plusDays(daysAhead);
                    filteredAppointments = allAppointments.stream()
                        .filter(a -> a.getScheduledStartTime() != null && 
                                   a.getScheduledStartTime().isBefore(cutoff) &&
                                   a.getScheduledStartTime().isAfter(LocalDateTime.now().minusDays(1)))
                        .collect(Collectors.toList());
                    searchCriteria = "Next " + daysAhead + " days";
                    break;
                    
                case "4":
                default:
                    filteredAppointments = allAppointments;
                    searchCriteria = "All appointments";
                    break;
            }
            
            System.out.printf("\n📊 Search Results: %s\n", searchCriteria);
            
            if (filteredAppointments.isEmpty()) {
                System.out.println("📭 No appointments found matching your search criteria.");
            } else {
                System.out.printf("📅 Found %d appointment(s)\n\n", filteredAppointments.size());
                displayAppointmentsTable(filteredAppointments);
            }
            
        } catch (ApiException e) {
            logger.error("Failed to search appointments", e);
            DisplayUtils.printError("Failed to search appointments: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    private void appointmentReports() {
        DisplayUtils.printHeader("APPOINTMENT REPORTS & ANALYTICS");
        
        try {
            List<Appointment> appointments = apiService.getAllAppointments();
            
            if (appointments.isEmpty()) {
                System.out.println("📭 No appointments found in the system.");
                waitForEnter();
                return;
            }
            
            // Calculate comprehensive statistics
            long totalCount = appointments.size();
            
            // Status breakdown
            Map<String, Long> statusCounts = appointments.stream()
                .collect(Collectors.groupingBy(
                    a -> a.getStatus() != null ? a.getStatus() : "UNKNOWN", 
                    Collectors.counting()));
            
            // Upcoming vs past
            LocalDateTime now = LocalDateTime.now();
            long upcomingCount = appointments.stream()
                .filter(a -> a.getScheduledStartTime() != null && a.getScheduledStartTime().isAfter(now))
                .count();
            long pastCount = totalCount - upcomingCount;
            
            // Technician workload
            Map<Long, Long> technicianWorkload = appointments.stream()
                .filter(a -> a.getTechnicianId() != null)
                .collect(Collectors.groupingBy(
                    Appointment::getTechnicianId,
                    Collectors.counting()));
            
            // Display comprehensive report
            System.out.println("📊 APPOINTMENT SYSTEM OVERVIEW");
            System.out.println("═".repeat(80));
            System.out.printf("Total Appointments:      %d\n", totalCount);
            System.out.printf("Upcoming Appointments:   %d\n", upcomingCount);
            System.out.printf("Past Appointments:       %d\n", pastCount);
            System.out.println();
            
            System.out.println("📈 STATUS BREAKDOWN");
            System.out.println("─".repeat(40));
            statusCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .forEach(entry -> {
                    String emoji = getStatusEmoji(entry.getKey());
                    System.out.printf("  %s %-12s: %d (%.1f%%)\n", 
                        emoji, entry.getKey(), entry.getValue(), 
                        (entry.getValue() * 100.0) / totalCount);
                });
            
            System.out.println("\n👨‍🔧 TECHNICIAN WORKLOAD");
            System.out.println("─".repeat(40));
            if (technicianWorkload.isEmpty()) {
                System.out.println("  No technician assignments found");
            } else {
                List<Technician> technicians = apiService.getAllTechnicians();
                technicianWorkload.entrySet().stream()
                    .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                    .limit(10)
                    .forEach(entry -> {
                        Technician tech = technicians.stream()
                            .filter(t -> t.getId().equals(entry.getKey()))
                            .findFirst()
                            .orElse(null);
                        String name = tech != null ? tech.getFullName() : "ID: " + entry.getKey();
                        System.out.printf("  %-25s: %d appointments\n", name, entry.getValue());
                    });
            }
            
            // Next 7 days outlook
            List<Appointment> nextWeek = apiService.getUpcomingAppointments(7);
            System.out.printf("\n📅 NEXT 7 DAYS OUTLOOK\n");
            System.out.println("─".repeat(40));
            System.out.printf("  Scheduled Appointments: %d\n", nextWeek.size());
            
            if (!nextWeek.isEmpty()) {
                long confirmedNextWeek = nextWeek.stream()
                    .filter(a -> "CONFIRMED".equals(a.getStatus()))
                    .count();
                long pendingNextWeek = nextWeek.stream()
                    .filter(a -> "PENDING".equals(a.getStatus()))
                    .count();
                    
                System.out.printf("  Confirmed:              %d\n", confirmedNextWeek);
                System.out.printf("  Pending Confirmation:   %d\n", pendingNextWeek);
            }
            
        } catch (ApiException e) {
            logger.error("Failed to generate appointment reports", e);
            DisplayUtils.printError("Failed to generate reports: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    // ==================== UTILITY METHODS ====================
    
    private void updateAppointmentStatus(String operation, String requiredStatus, 
                                       AppointmentStatusUpdater updater, String title) {
        DisplayUtils.printHeader(title.toUpperCase());
        
        try {
            List<Appointment> appointments = apiService.getAllAppointments().stream()
                .filter(a -> requiredStatus.equals(a.getStatus()))
                .collect(Collectors.toList());
            
            if (appointments.isEmpty()) {
                System.out.printf("📭 No %s appointments found.\n", requiredStatus);
                waitForEnter();
                return;
            }
            
            System.out.printf("📋 Select appointment to %s:\n", operation.toLowerCase());
            System.out.printf("   (Only %s appointments shown)\n", requiredStatus);
            System.out.println();
            displayAppointmentsTable(appointments);
            
            System.out.printf("Enter appointment ID to %s: ", operation.toLowerCase());
            String input = scanner.nextLine().trim();
            
            try {
                Long appointmentId = Long.parseLong(input);
                Appointment selectedAppointment = appointments.stream()
                    .filter(a -> a.getId().equals(appointmentId))
                    .findFirst()
                    .orElse(null);
                    
                if (selectedAppointment == null) {
                    DisplayUtils.printError("Appointment not found or not in " + requiredStatus + " status.");
                    waitForEnter();
                    return;
                }
                
                // Confirm action
                System.out.printf("✅ %s appointment #%d? (y/n): ", operation, appointmentId);
                String confirm = scanner.nextLine().trim().toLowerCase();
                
                if (confirm.equals("y") || confirm.equals("yes")) {
                    Appointment result = updater.update(appointmentId);
                    DisplayUtils.printSuccess("✅ Appointment " + operation.toLowerCase() + "ed successfully!");
                    System.out.printf("   Status: %s\n", result.getStatus());
                } else {
                    System.out.println("❌ " + operation + " cancelled.");
                }
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Invalid appointment ID format.");
            }
            
        } catch (ApiException e) {
            logger.error("Failed to {} appointment", operation.toLowerCase(), e);
            DisplayUtils.printError("Failed to " + operation.toLowerCase() + " appointment: " + e.getMessage());
        }
        
        waitForEnter();
    }
    
    @FunctionalInterface
    private interface AppointmentStatusUpdater {
        Appointment update(Long appointmentId) throws ApiException;
    }
    
    // ==================== DISPLAY METHODS ====================
    
    private void displayAppointmentsTable(List<Appointment> appointments) {
        System.out.println("┌─────┬────────────────────┬─────────────────────┬────────────┬─────────────┬──────────────┐");
        System.out.println("│ ID  │ Start Time         │ End Time            │ Status     │ Technician  │ Ticket       │");
        System.out.println("├─────┼────────────────────┼─────────────────────┼────────────┼─────────────┼──────────────┤");
        
        for (Appointment appointment : appointments.stream().limit(20).collect(Collectors.toList())) {
            String startTime = appointment.getScheduledStartTime() != null ? 
                formatDateTime(appointment.getScheduledStartTime()) : "N/A";
            String endTime = appointment.getScheduledEndTime() != null ? 
                formatDateTime(appointment.getScheduledEndTime()) : "N/A";
            String status = getStatusDisplay(appointment.getStatus());
            String technicianInfo = getTechnicianDisplay(appointment.getTechnicianId());
            String ticketInfo = getTicketDisplay(appointment.getTicketId());
            
            System.out.printf("│ %-3d │ %-18s │ %-19s │ %-10s │ %-11s │ %-12s │%n",
                appointment.getId(),
                startTime.length() > 18 ? startTime.substring(0, 15) + "..." : startTime,
                endTime.length() > 19 ? endTime.substring(0, 16) + "..." : endTime,
                status.length() > 10 ? status.substring(0, 7) + "..." : status,
                technicianInfo.length() > 11 ? technicianInfo.substring(0, 8) + "..." : technicianInfo,
                ticketInfo.length() > 12 ? ticketInfo.substring(0, 9) + "..." : ticketInfo);
        }
        
        System.out.println("└─────┴────────────────────┴─────────────────────┴────────────┴─────────────┴──────────────┘");
        
        if (appointments.size() > 20) {
            System.out.printf("... and %d more appointments (showing first 20)\n", appointments.size() - 20);
        }
    }
    
    private void displayAppointmentDetails(Appointment appointment) {
        System.out.println();
        DisplayUtils.printHeader("APPOINTMENT DETAILS - #" + appointment.getId());
        
        try {
            // Use embedded entities if available, otherwise fetch from API
            Ticket ticket = appointment.getTicket();
            if (ticket == null && appointment.getTicketId() != null) {
                ticket = apiService.getTicketById(appointment.getTicketId());
            }
            
            Technician technician = appointment.getTechnician();
            if (technician == null && appointment.getTechnicianId() != null) {
                List<Technician> technicians = apiService.getAllTechnicians();
                technician = technicians.stream()
                    .filter(t -> t.getId().equals(appointment.getTechnicianId()))
                    .findFirst()
                    .orElse(null);
            }
            
            // Basic appointment info
            System.out.printf("📅 Appointment ID: #%d\n", appointment.getId());
            System.out.printf("📊 Status:        %s\n", getStatusDisplay(appointment.getStatus()));
            
            // Timing information
            if (appointment.getScheduledStartTime() != null) {
                System.out.printf("⏰ Start Time:    %s\n", formatDateTime(appointment.getScheduledStartTime()));
            }
            if (appointment.getScheduledEndTime() != null) {
                System.out.printf("⏰ End Time:      %s\n", formatDateTime(appointment.getScheduledEndTime()));
            }
            
            if (appointment.getScheduledStartTime() != null && appointment.getScheduledEndTime() != null) {
                Duration duration = Duration.between(appointment.getScheduledStartTime(), appointment.getScheduledEndTime());
                System.out.printf("⏱️  Duration:      %d hours, %d minutes\n", 
                    duration.toHours(), duration.toMinutes() % 60);
            }
            
            // Related entities
            if (ticket != null) {
                System.out.printf("🎫 Ticket:        #%d - %s\n", 
                    ticket.getId(), 
                    ticket.getDescription() != null ? ticket.getDescription() : "No description");
                System.out.printf("   Priority:      %s\n", ticket.getPriority());
                System.out.printf("   Service Type:  %s\n", ticket.getServiceType());
                if (ticket.getClientName() != null) {
                    System.out.printf("   Client:        %s\n", ticket.getClientName());
                }
                if (ticket.getClientEmail() != null) {
                    System.out.printf("   Client Email:  %s\n", ticket.getClientEmail());
                }
            } else if (appointment.getTicketId() != null) {
                System.out.printf("🎫 Ticket:        #%d (details unavailable)\n", appointment.getTicketId());
            } else {
                System.out.println("🎫 Ticket:        Not assigned");
            }
            
            if (technician != null) {
                System.out.printf("👨‍🔧 Technician:    %s\n", technician.getFullName());
                System.out.printf("   Email:         %s\n", technician.getEmail());
                System.out.printf("   Phone:         %s\n", 
                    technician.getPhone() != null ? technician.getPhone() : "N/A");
                if (technician.getSkills() != null && !technician.getSkills().isEmpty()) {
                    System.out.printf("   Skills:        %s\n", String.join(", ", technician.getSkills()));
                }
            } else if (appointment.getTechnicianId() != null) {
                System.out.printf("👨‍🔧 Technician:    ID %d (details unavailable)\n", appointment.getTechnicianId());
            } else {
                System.out.println("👨‍🔧 Technician:    Not assigned");
            }
            
            // Notes
            if (appointment.getNotes() != null && !appointment.getNotes().isEmpty()) {
                System.out.printf("📝 Notes:         %s\n", appointment.getNotes());
            }
            
            // Timestamps
            if (appointment.getCreatedAt() != null) {
                System.out.printf("📅 Created:       %s\n", formatDateTime(appointment.getCreatedAt()));
            }
            if (appointment.getUpdatedAt() != null) {
                System.out.printf("📅 Last Updated:  %s\n", formatDateTime(appointment.getUpdatedAt()));
            }
            
        } catch (ApiException e) {
            logger.warn("Failed to fetch appointment details", e);
            // Show basic info even if we can't get related entities
            System.out.printf("📅 Appointment ID: #%d\n", appointment.getId());
            System.out.printf("📊 Status:        %s\n", appointment.getStatus());
            System.out.printf("🎫 Ticket ID:     %d\n", appointment.getTicketId());
            System.out.printf("👨‍🔧 Technician ID: %d\n", appointment.getTechnicianId());
        }
        
        System.out.println();
    }
    
    private void displayAppointmentSummary(Appointment appointment) {
        String statusEmoji = getStatusEmoji(appointment.getStatus());
        String timeInfo = appointment.getScheduledStartTime() != null ? 
            formatDateTime(appointment.getScheduledStartTime()) : "N/A";
        String techInfo = getTechnicianDisplay(appointment.getTechnicianId());
        
        System.out.printf("   %s Appointment #%d - %s | %s\n", 
            statusEmoji, appointment.getId(), timeInfo, techInfo);
    }
    
    private String getStatusDisplay(String status) {
        return switch (status != null ? status.toUpperCase() : "UNKNOWN") {
            case "PENDING" -> "🟡 PENDING";
            case "CONFIRMED" -> "🟢 CONFIRMED";
            case "IN_PROGRESS" -> "🔵 IN_PROGRESS";
            case "COMPLETED" -> "✅ COMPLETED";
            case "CANCELLED" -> "❌ CANCELLED";
            case "NO_SHOW" -> "👻 NO_SHOW";
            default -> "❓ " + status;
        };
    }
    
    private String getStatusEmoji(String status) {
        return switch (status != null ? status.toUpperCase() : "UNKNOWN") {
            case "PENDING" -> "🟡";
            case "CONFIRMED" -> "🟢";
            case "IN_PROGRESS" -> "🔵";
            case "COMPLETED" -> "✅";
            case "CANCELLED" -> "❌";
            case "NO_SHOW" -> "👻";
            default -> "❓";
        };
    }
    
    private String getTechnicianDisplay(Long technicianId) {
        if (technicianId == null) return "Unassigned";
        
        try {
            List<Technician> technicians = apiService.getAllTechnicians();
            Technician technician = technicians.stream()
                .filter(t -> t.getId().equals(technicianId))
                .findFirst()
                .orElse(null);
            
            return technician != null ? technician.getFullName() : "ID: " + technicianId;
            
        } catch (ApiException e) {
            return "ID: " + technicianId;
        }
    }
    
    private String getTicketDisplay(Long ticketId) {
        return ticketId != null ? "#" + ticketId : "N/A";
    }
    
    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }
    
    /**
     * Run comprehensive diagnostics to identify why appointment creation failed
     * 
     * @param failedAppointment the appointment data that failed to create
     */
    private void runAppointmentDiagnostics(Appointment failedAppointment) {
        System.out.println();
        DisplayUtils.printHeader("APPOINTMENT DIAGNOSTIC ANALYSIS");
        
        try {
            System.out.println("🔍 Running comprehensive entity verification...");
            System.out.println();
            
            // 1. Verify Ticket Status
            System.out.print("1️⃣ Checking Ticket Status... ");
            try {
                Ticket ticket = apiService.getTicketById(failedAppointment.getTicketId());
                if ("OPEN".equals(ticket.getStatus())) {
                    System.out.println("✅ PASS");
                    System.out.printf("   Ticket #%d: %s (Status: %s)\n", 
                        ticket.getId(), ticket.getDescription(), ticket.getStatus());
                } else {
                    System.out.println("❌ FAIL");
                    System.out.printf("   Ticket #%d: Status is '%s' (Expected: OPEN)\n", 
                        ticket.getId(), ticket.getStatus());
                    System.out.println("   🚨 ROOT CAUSE: Ticket status changed after validation!");
                }
            } catch (ApiException e) {
                System.out.println("❌ ERROR");
                System.out.printf("   Cannot retrieve ticket #%d: %s\n", 
                    failedAppointment.getTicketId(), e.getMessage());
                System.out.println("   🚨 ROOT CAUSE: Ticket may have been deleted!");
            }
            System.out.println();
            
            // 2. Verify Technician Status
            System.out.print("2️⃣ Checking Technician Status... ");
            try {
                List<Technician> technicians = apiService.getAllTechnicians();
                Technician technician = technicians.stream()
                    .filter(t -> t.getId().equals(failedAppointment.getTechnicianId()))
                    .findFirst()
                    .orElse(null);
                
                if (technician == null) {
                    System.out.println("❌ ERROR");
                    System.out.printf("   Technician ID %d not found\n", failedAppointment.getTechnicianId());
                    System.out.println("   🚨 ROOT CAUSE: Technician may have been deleted!");
                } else if ("ACTIVE".equals(technician.getStatus())) {
                    System.out.println("✅ PASS");
                    System.out.printf("   %s (ID: %d, Status: %s)\n", 
                        technician.getFullName(), technician.getId(), technician.getStatus());
                } else {
                    System.out.println("❌ FAIL");
                    System.out.printf("   %s (ID: %d): Status is '%s' (Expected: ACTIVE)\n", 
                        technician.getFullName(), technician.getId(), technician.getStatus());
                    System.out.println("   🚨 ROOT CAUSE: Technician status changed after validation!");
                }
            } catch (ApiException e) {
                System.out.println("❌ ERROR");
                System.out.printf("   Cannot retrieve technician data: %s\n", e.getMessage());
            }
            System.out.println();
            
            // 3. Check for Scheduling Conflicts
            System.out.print("3️⃣ Checking Scheduling Conflicts... ");
            try {
                boolean isAvailable = apiService.checkTechnicianAvailability(
                    failedAppointment.getTechnicianId(),
                    failedAppointment.getScheduledStartTime(),
                    failedAppointment.getScheduledEndTime()
                );
                
                if (isAvailable) {
                    System.out.println("✅ PASS");
                    System.out.println("   No scheduling conflicts detected");
                } else {
                    System.out.println("❌ FAIL");
                    System.out.println("   Scheduling conflict detected!");
                    System.out.println("   🚨 ROOT CAUSE: Another appointment was created since validation!");
                    
                    // Try to get specific conflict information
                    try {
                        List<Appointment> conflictingAppointments = apiService.getAllAppointments().stream()
                            .filter(a -> a.getTechnicianId().equals(failedAppointment.getTechnicianId()))
                            .filter(a -> {
                                LocalDateTime start = failedAppointment.getScheduledStartTime();
                                LocalDateTime end = failedAppointment.getScheduledEndTime();
                                LocalDateTime aStart = a.getScheduledStartTime();
                                LocalDateTime aEnd = a.getScheduledEndTime();
                                
                                return (start.isBefore(aEnd) && end.isAfter(aStart));
                            })
                            .collect(Collectors.toList());
                        
                        if (!conflictingAppointments.isEmpty()) {
                            System.out.println("   Conflicting appointments found:");
                            for (Appointment conflict : conflictingAppointments.subList(0, Math.min(3, conflictingAppointments.size()))) {
                                System.out.printf("   • Appointment #%d: %s - %s (Status: %s)\n",
                                    conflict.getId(),
                                    formatDateTime(conflict.getScheduledStartTime()),
                                    formatDateTime(conflict.getScheduledEndTime()),
                                    conflict.getStatus());
                            }
                        }
                    } catch (Exception ex) {
                        System.out.println("   Could not retrieve conflict details: " + ex.getMessage());
                    }
                }
            } catch (ApiException e) {
                System.out.println("❌ ERROR");
                System.out.printf("   Cannot check availability: %s\n", e.getMessage());
                System.out.println("   🚨 ROOT CAUSE: Server-side conflict checking is failing!");
            }
            System.out.println();
            
            // 4. Verify Date/Time Constraints
            System.out.print("4️⃣ Checking Date/Time Constraints... ");
            LocalDateTime now = LocalDateTime.now();
            Duration duration = Duration.between(
                failedAppointment.getScheduledStartTime(), 
                failedAppointment.getScheduledEndTime()
            );
            
            boolean futureCheck = failedAppointment.getScheduledStartTime().isAfter(now.plusMinutes(5));
            boolean durationCheck = duration.toMinutes() >= 30 && duration.toHours() <= 8;
            
            if (futureCheck && durationCheck) {
                System.out.println("✅ PASS");
                System.out.printf("   Future date: %s (✓)\n", futureCheck ? "Yes" : "No");
                System.out.printf("   Duration: %d minutes (✓)\n", duration.toMinutes());
            } else {
                System.out.println("❌ FAIL");
                System.out.printf("   Future date: %s (%s)\n", 
                    futureCheck ? "Yes" : "No", futureCheck ? "✓" : "✗");
                System.out.printf("   Duration: %d minutes (%s)\n", 
                    duration.toMinutes(), durationCheck ? "✓" : "✗");
                if (!futureCheck) {
                    System.out.println("   🚨 ROOT CAUSE: Appointment time is in the past!");
                }
                if (!durationCheck) {
                    System.out.println("   🚨 ROOT CAUSE: Duration violates 30min-8hr constraint!");
                }
            }
            System.out.println();
            
            // 5. Server Connection Test
            System.out.print("5️⃣ Testing Server Connection... ");
            try {
                // Simple API call to test connectivity
                apiService.getAllAppointments();
                System.out.println("✅ PASS");
                System.out.println("   Server is responding to API requests");
            } catch (ApiException e) {
                System.out.println("❌ FAIL");
                System.out.printf("   Server connection issue: %s\n", e.getMessage());
                System.out.println("   🚨 ROOT CAUSE: Server connectivity or availability issue!");
            }
            System.out.println();
            
            // Summary and Recommendations
            System.out.println("═══════════════════════════════════════════════════");
            System.out.println("🔧 DIAGNOSTIC SUMMARY & RECOMMENDATIONS:");
            System.out.println();
            System.out.println("Based on the diagnostic results above:");
            System.out.println("• If all checks PASS: This indicates a server-side processing error");
            System.out.println("• If any check FAILS: That failure is likely the root cause");
            System.out.println();
            System.out.println("📋 NEXT STEPS:");
            System.out.println("1. Review any FAILED checks above");
            System.out.println("2. If all checks pass, examine server logs for internal errors");
            System.out.println("3. Try the suggested workarounds (different technician/time)");
            System.out.println("4. Contact system administrator if server-side issues persist");
            
        } catch (Exception e) {
            logger.error("Error during diagnostic analysis", e);
            DisplayUtils.printError("Diagnostic analysis failed: " + e.getMessage());
        }
    }
} 