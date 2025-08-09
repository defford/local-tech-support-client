package com.localtechsupport.cli.menu.appointment;

import com.localtechsupport.cli.model.Appointment;
import com.localtechsupport.cli.model.Ticket;
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
import java.time.Duration;
import java.util.stream.Collectors;

/**
 * Utility class for building appointment objects from user input
 * 
 * Handles collection and validation of appointment data for create/update operations
 * Implements business rules: 30min-8hr duration, only ACTIVE technicians, only OPEN tickets
 */
public class AppointmentBuilder {
    
    private static final Logger logger = LoggerFactory.getLogger(AppointmentBuilder.class);
    private final Scanner scanner;
    private final ApiService apiService;
    
    // Available appointment statuses (for updates only - new appointments start PENDING)
    private static final List<String> APPOINTMENT_STATUSES = Arrays.asList(
        "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"
    );
    
    // Business rules
    private static final int MIN_DURATION_MINUTES = 30;
    private static final int MAX_DURATION_HOURS = 8;
    
    public AppointmentBuilder(Scanner scanner, ApiService apiService) {
        this.scanner = scanner;
        this.apiService = apiService;
    }
    
    /**
     * Build a new appointment from user input
     * 
     * @return populated Appointment object or null if cancelled
     */
    public Appointment buildNewAppointment() {
        DisplayUtils.printHeader("NEW APPOINTMENT SCHEDULING");
        
        System.out.println("📅 Please provide the following information:");
        System.out.println("   Business Rules: 30min-8hr duration, Active technicians only, Open tickets only");
        System.out.println("   (Enter 'cancel' at any time to abort)");
        System.out.println();
        
        try {
            // Collect required fields
            Long ticketId = collectTicketId();
            if (ticketId == null) return null;
            
            Long technicianId = collectTechnicianId();
            if (technicianId == null) return null;
            
            LocalDateTime startTime = collectStartTime();
            if (startTime == null) return null;
            
            LocalDateTime endTime = collectEndTime(startTime);
            if (endTime == null) return null;
            
            String notes = collectNotes();
            if (notes == null) return null; // Only if user cancelled
            
            // Create appointment object
            Appointment appointment = new Appointment();
            appointment.setTicketId(ticketId);
            appointment.setTechnicianId(technicianId);
            appointment.setScheduledStartTime(startTime);
            appointment.setScheduledEndTime(endTime);
            appointment.setNotes(notes.isEmpty() ? null : notes);
            // Server automatically sets: id, status=PENDING, createdAt, updatedAt
            
            // Validate business rules before showing confirmation
            if (!validateBusinessRules(appointment)) {
                return null;
            }
            
            // Show confirmation
            displayAppointmentSummary(appointment, "NEW APPOINTMENT SUMMARY");
            
            System.out.print("✅ Schedule this appointment? (y/n): ");
            String confirm = scanner.nextLine().trim().toLowerCase();
            
            if (confirm.equals("y") || confirm.equals("yes")) {
                return appointment;
            } else {
                System.out.println("❌ Appointment scheduling cancelled.");
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error building new appointment", e);
            DisplayUtils.printError("An error occurred while collecting appointment information.");
            return null;
        }
    }
    
    /**
     * Build appointment update from user input (for rescheduling)
     * 
     * @param existing the existing appointment to update
     * @return updated Appointment object or null if cancelled
     */
    public Appointment buildAppointmentUpdate(Appointment existing) {
        DisplayUtils.printHeader("RESCHEDULE APPOINTMENT");
        
        System.out.printf("📅 Rescheduling Appointment #%d\n", existing.getId());
        System.out.println("   Current Times: " + formatTimeRange(existing.getScheduledStartTime(), existing.getScheduledEndTime()));
        System.out.println("   (Enter 'cancel' to abort, or press Enter to keep current values)");
        System.out.println();
        
        try {
            // Show current appointment details
            displayCurrentAppointmentInfo(existing);
            System.out.println();
            
            // Collect new times (optional - can keep existing)
            LocalDateTime newStartTime = collectOptionalStartTime(existing.getScheduledStartTime());
            if (newStartTime == null && scanner.hasNext()) return null; // User cancelled
            
            LocalDateTime newEndTime = collectOptionalEndTime(
                newStartTime != null ? newStartTime : existing.getScheduledStartTime(),
                existing.getScheduledEndTime()
            );
            if (newEndTime == null && scanner.hasNext()) return null; // User cancelled
            
            // Optional notes update
            String newNotes = collectOptionalNotes(existing.getNotes());
            if (newNotes == null && scanner.hasNext()) return null; // User cancelled
            
            // Create updated appointment
            Appointment updated = new Appointment();
            updated.setId(existing.getId());
            updated.setTicketId(existing.getTicketId());
            updated.setTechnicianId(existing.getTechnicianId());
            updated.setScheduledStartTime(newStartTime != null ? newStartTime : existing.getScheduledStartTime());
            updated.setScheduledEndTime(newEndTime != null ? newEndTime : existing.getScheduledEndTime());
            updated.setStatus(existing.getStatus());
            updated.setNotes(newNotes != null ? (newNotes.isEmpty() ? null : newNotes) : existing.getNotes());
            
            // Validate if times changed
            if (newStartTime != null || newEndTime != null) {
                if (!validateBusinessRules(updated)) {
                    return null;
                }
            }
            
            // Show confirmation
            displayAppointmentUpdateSummary(existing, updated);
            
            System.out.print("✅ Apply these changes? (y/n): ");
            String confirm = scanner.nextLine().trim().toLowerCase();
            
            if (confirm.equals("y") || confirm.equals("yes")) {
                return updated;
            } else {
                System.out.println("❌ Appointment rescheduling cancelled.");
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error building appointment update", e);
            DisplayUtils.printError("An error occurred while updating appointment information.");
            return null;
        }
    }
    
    // ==================== INPUT COLLECTION METHODS ====================
    
    private Long collectTicketId() {
        while (true) {
            try {
                // Get open tickets only (business rule)
                List<Ticket> openTickets = apiService.getAllTickets().stream()
                    .filter(t -> "OPEN".equals(t.getStatus()))
                    .collect(Collectors.toList());
                
                if (openTickets.isEmpty()) {
                    DisplayUtils.printError("No open tickets available for scheduling appointments.");
                    return null;
                }
                
                System.out.println("📋 Available Open Tickets:");
                System.out.println("   (Only open tickets can have appointments scheduled)");
                for (int i = 0; i < Math.min(10, openTickets.size()); i++) {
                    Ticket ticket = openTickets.get(i);
                    String description = ticket.getDescription();
                    if (description != null && description.length() > 40) {
                        description = description.substring(0, 37) + "...";
                    }
                    System.out.printf("   %d. Ticket #%d: %s\n", i + 1, ticket.getId(), 
                        description != null ? description : "No description");
                }
                
                if (openTickets.size() > 10) {
                    System.out.printf("   ... and %d more tickets\n", openTickets.size() - 10);
                }
                
                System.out.print("Select ticket by number or enter ticket ID: ");
                String input = scanner.nextLine().trim();
                
                if (input.equalsIgnoreCase("cancel")) {
                    return null;
                }
                
                Long ticketId;
                try {
                    int choice = Integer.parseInt(input);
                    if (choice >= 1 && choice <= Math.min(10, openTickets.size())) {
                        ticketId = openTickets.get(choice - 1).getId();
                    } else {
                        ticketId = Long.parseLong(input);
                    }
                } catch (NumberFormatException e) {
                    DisplayUtils.printError("Please enter a valid number or ticket ID.");
                    continue;
                }
                
                // Verify ticket exists and is open
                Ticket selectedTicket = openTickets.stream()
                    .filter(t -> t.getId().equals(ticketId))
                    .findFirst()
                    .orElse(null);
                
                if (selectedTicket != null) {
                    System.out.printf("✅ Selected: Ticket #%d\n", ticketId);
                    return ticketId;
                } else {
                    DisplayUtils.printError("Ticket not found or not in OPEN status. Please select from the list.");
                }
                
            } catch (ApiException e) {
                logger.error("Failed to fetch tickets", e);
                DisplayUtils.printError("Failed to retrieve tickets: " + e.getMessage());
                return null;
            }
        }
    }
    
    private Long collectTechnicianId() {
        while (true) {
            try {
                // Get active technicians only (business rule)
                List<Technician> activeTechnicians = apiService.getAllTechnicians().stream()
                    .filter(t -> "ACTIVE".equals(t.getStatus()))
                    .collect(Collectors.toList());
                
                if (activeTechnicians.isEmpty()) {
                    DisplayUtils.printError("No active technicians available for appointment scheduling.");
                    return null;
                }
                
                System.out.println("👨‍🔧 Available Active Technicians:");
                System.out.println("   (Only active technicians can be assigned appointments)");
                for (int i = 0; i < activeTechnicians.size(); i++) {
                    Technician tech = activeTechnicians.get(i);
                    String skills = tech.getSkills() != null && !tech.getSkills().isEmpty() ? 
                        String.join(", ", tech.getSkills()) : "General";
                    System.out.printf("   %d. %s (Skills: %s)\n", i + 1, tech.getFullName(), skills);
                }
                
                System.out.print("Select technician by number or enter technician ID: ");
                String input = scanner.nextLine().trim();
                
                if (input.equalsIgnoreCase("cancel")) {
                    return null;
                }
                
                Long technicianId;
                try {
                    int choice = Integer.parseInt(input);
                    if (choice >= 1 && choice <= activeTechnicians.size()) {
                        technicianId = activeTechnicians.get(choice - 1).getId();
                    } else {
                        technicianId = Long.parseLong(input);
                    }
                } catch (NumberFormatException e) {
                    DisplayUtils.printError("Please enter a valid number or technician ID.");
                    continue;
                }
                
                // Verify technician exists and is active
                Technician selectedTechnician = activeTechnicians.stream()
                    .filter(t -> t.getId().equals(technicianId))
                    .findFirst()
                    .orElse(null);
                
                if (selectedTechnician != null) {
                    System.out.printf("✅ Selected: %s\n", selectedTechnician.getFullName());
                    return technicianId;
                } else {
                    DisplayUtils.printError("Technician not found or not ACTIVE. Please select from the list.");
                }
                
            } catch (ApiException e) {
                logger.error("Failed to fetch technicians", e);
                DisplayUtils.printError("Failed to retrieve technicians: " + e.getMessage());
                return null;
            }
        }
    }
    
    private LocalDateTime collectStartTime() {
        System.out.println("📅 Schedule Start Time:");
        System.out.println("   Format: YYYY-MM-DD HH:MM (24-hour format)");
        System.out.println("   Example: 2025-01-30 14:30");
        System.out.println("   Must be in the future");
        
        while (true) {
            System.out.print("Start time: ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("cancel")) {
                return null;
            }
            
            try {
                LocalDateTime startTime = LocalDateTime.parse(input, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                
                // Validate: must be in the future
                if (startTime.isBefore(LocalDateTime.now().plusMinutes(5))) {
                    DisplayUtils.printError("Start time must be at least 5 minutes in the future.");
                    continue;
                }
                
                return startTime;
                
            } catch (DateTimeParseException e) {
                DisplayUtils.printError("Invalid date/time format. Please use: YYYY-MM-DD HH:MM");
            }
        }
    }
    
    private LocalDateTime collectEndTime(LocalDateTime startTime) {
        System.out.println("📅 Schedule End Time:");
        System.out.println("   Format: YYYY-MM-DD HH:MM (24-hour format)");
        System.out.println("   Duration: 30 minutes to 8 hours maximum");
        System.out.printf("   Must be after: %s\n", startTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        
        while (true) {
            System.out.print("End time: ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("cancel")) {
                return null;
            }
            
            try {
                LocalDateTime endTime = LocalDateTime.parse(input, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                
                // Validate: must be after start time
                if (!endTime.isAfter(startTime)) {
                    DisplayUtils.printError("End time must be after start time.");
                    continue;
                }
                
                // Validate duration (business rule: 30min - 8hr)
                Duration duration = Duration.between(startTime, endTime);
                if (duration.toMinutes() < MIN_DURATION_MINUTES) {
                    DisplayUtils.printError("Minimum appointment duration is " + MIN_DURATION_MINUTES + " minutes.");
                    continue;
                }
                
                if (duration.toHours() > MAX_DURATION_HOURS) {
                    DisplayUtils.printError("Maximum appointment duration is " + MAX_DURATION_HOURS + " hours.");
                    continue;
                }
                
                return endTime;
                
            } catch (DateTimeParseException e) {
                DisplayUtils.printError("Invalid date/time format. Please use: YYYY-MM-DD HH:MM");
            }
        }
    }
    
    private String collectNotes() {
        System.out.print("Notes (optional): ");
        String input = scanner.nextLine().trim();
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        return input; // Can be empty
    }
    
    // ==================== OPTIONAL INPUT METHODS (FOR UPDATES) ====================
    
    private LocalDateTime collectOptionalStartTime(LocalDateTime currentStartTime) {
        System.out.printf("Current start time: %s\n", 
            currentStartTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        System.out.print("New start time (or press Enter to keep current): ");
        String input = scanner.nextLine().trim();
        
        if (input.isEmpty()) {
            return null; // Keep current
        }
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        try {
            LocalDateTime newStartTime = LocalDateTime.parse(input, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            
            if (newStartTime.isBefore(LocalDateTime.now().plusMinutes(5))) {
                DisplayUtils.printError("Start time must be at least 5 minutes in the future.");
                return collectOptionalStartTime(currentStartTime); // Retry
            }
            
            return newStartTime;
            
        } catch (DateTimeParseException e) {
            DisplayUtils.printError("Invalid date/time format. Please use: YYYY-MM-DD HH:MM");
            return collectOptionalStartTime(currentStartTime); // Retry
        }
    }
    
    private LocalDateTime collectOptionalEndTime(LocalDateTime startTime, LocalDateTime currentEndTime) {
        System.out.printf("Current end time: %s\n", 
            currentEndTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        System.out.print("New end time (or press Enter to keep current): ");
        String input = scanner.nextLine().trim();
        
        if (input.isEmpty()) {
            return null; // Keep current
        }
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        try {
            LocalDateTime newEndTime = LocalDateTime.parse(input, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            
            if (!newEndTime.isAfter(startTime)) {
                DisplayUtils.printError("End time must be after start time.");
                return collectOptionalEndTime(startTime, currentEndTime); // Retry
            }
            
            Duration duration = Duration.between(startTime, newEndTime);
            if (duration.toMinutes() < MIN_DURATION_MINUTES) {
                DisplayUtils.printError("Minimum appointment duration is " + MIN_DURATION_MINUTES + " minutes.");
                return collectOptionalEndTime(startTime, currentEndTime); // Retry
            }
            
            if (duration.toHours() > MAX_DURATION_HOURS) {
                DisplayUtils.printError("Maximum appointment duration is " + MAX_DURATION_HOURS + " hours.");
                return collectOptionalEndTime(startTime, currentEndTime); // Retry
            }
            
            return newEndTime;
            
        } catch (DateTimeParseException e) {
            DisplayUtils.printError("Invalid date/time format. Please use: YYYY-MM-DD HH:MM");
            return collectOptionalEndTime(startTime, currentEndTime); // Retry
        }
    }
    
    private String collectOptionalNotes(String currentNotes) {
        System.out.printf("Current notes: %s\n", currentNotes != null ? currentNotes : "(none)");
        System.out.print("New notes (or press Enter to keep current): ");
        String input = scanner.nextLine().trim();
        
        if (input.isEmpty()) {
            return null; // Keep current
        }
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        return input;
    }
    
    // ==================== VALIDATION METHODS ====================
    
    private boolean validateBusinessRules(Appointment appointment) {
        System.out.println("🔍 Performing pre-submission validation...");
        
        try {
            // 1. Re-verify ticket status (might have changed since selection)
            System.out.print("   Verifying ticket status... ");
            Ticket ticket = apiService.getTicketById(appointment.getTicketId());
            if (!"OPEN".equals(ticket.getStatus())) {
                System.out.println("❌");
                DisplayUtils.printError("Ticket #" + ticket.getId() + " is no longer OPEN (current status: " + ticket.getStatus() + ").");
                System.out.println("Only OPEN tickets can have appointments scheduled.");
                return false;
            }
            System.out.println("✅");
            
            // 2. Re-verify technician status (might have changed since selection)
            System.out.print("   Verifying technician status... ");
            List<Technician> allTechnicians = apiService.getAllTechnicians();
            Technician technician = allTechnicians.stream()
                .filter(t -> t.getId().equals(appointment.getTechnicianId()))
                .findFirst()
                .orElse(null);
            
            if (technician == null) {
                System.out.println("❌");
                DisplayUtils.printError("Technician not found with ID: " + appointment.getTechnicianId());
                return false;
            }
            
            if (!"ACTIVE".equals(technician.getStatus())) {
                System.out.println("❌");
                DisplayUtils.printError("Technician " + technician.getFullName() + " is no longer ACTIVE (current status: " + technician.getStatus() + ").");
                System.out.println("Only ACTIVE technicians can be assigned appointments.");
                return false;
            }
            System.out.println("✅");
            
            // 3. Verify appointment is still in the future (user might have delayed)
            System.out.print("   Verifying appointment time... ");
            if (appointment.getScheduledStartTime().isBefore(LocalDateTime.now().plusMinutes(5))) {
                System.out.println("❌");
                DisplayUtils.printError("Appointment start time is no longer in the future.");
                System.out.println("Please schedule for at least 5 minutes from now.");
                return false;
            }
            System.out.println("✅");
            
            // 4. Check for scheduling conflicts
            System.out.print("   Checking for scheduling conflicts... ");
            boolean isAvailable = apiService.checkTechnicianAvailability(
                appointment.getTechnicianId(),
                appointment.getScheduledStartTime(),
                appointment.getScheduledEndTime()
            );
            
            if (!isAvailable) {
                System.out.println("❌");
                DisplayUtils.printError("Technician " + technician.getFullName() + " is not available during the requested time slot.");
                System.out.println("Another appointment may have been scheduled since your selection.");
                System.out.println("Please choose a different time or technician.");
                return false;
            }
            System.out.println("✅");
            
            // 5. Verify business rule constraints one more time
            System.out.print("   Verifying business constraints... ");
            Duration duration = Duration.between(appointment.getScheduledStartTime(), appointment.getScheduledEndTime());
            if (duration.toMinutes() < MIN_DURATION_MINUTES || duration.toHours() > MAX_DURATION_HOURS) {
                System.out.println("❌");
                DisplayUtils.printError("Duration constraint violation: " + duration.toMinutes() + " minutes (must be 30min-8hr).");
                return false;
            }
            System.out.println("✅");
            
            System.out.println("✅ All validation checks passed! Appointment is ready for submission.");
            return true;
            
        } catch (ApiException e) {
            logger.error("Failed to validate appointment business rules", e);
            System.out.println("❌");
            DisplayUtils.printError("⚠️  Could not complete validation checks: " + e.getMessage());
            System.out.println("This may be due to a server connectivity issue.");
            System.out.println();
            
            // Give user option to proceed anyway (with clear warning)
            System.out.println("⚠️  WARNING: Unable to verify all business rules!");
            System.out.println("   - Ticket status might have changed");
            System.out.println("   - Technician status might have changed");
            System.out.println("   - Scheduling conflicts cannot be detected");
            System.out.println();
            System.out.print("🔹 Proceed with appointment creation anyway? (y/n): ");
            String proceed = scanner.nextLine().trim().toLowerCase();
            
            if (proceed.equals("y") || proceed.equals("yes")) {
                System.out.println("⚠️  Proceeding without complete validation...");
                System.out.println("   If the appointment fails, check ticket/technician status and scheduling conflicts.");
                return true;
            } else {
                System.out.println("❌ Appointment creation cancelled.");
                return false;
            }
        }
    }
    
    // ==================== DISPLAY METHODS ====================
    
    private void displayAppointmentSummary(Appointment appointment, String title) {
        System.out.println();
        DisplayUtils.printHeader(title);
        
        try {
            // Get ticket and technician details for display
            Ticket ticket = apiService.getTicketById(appointment.getTicketId());
            List<Technician> technicians = apiService.getAllTechnicians();
            Technician technician = technicians.stream()
                .filter(t -> t.getId().equals(appointment.getTechnicianId()))
                .findFirst()
                .orElse(null);
            
            System.out.printf("📋 Ticket:      #%d - %s\n", 
                ticket.getId(), 
                ticket.getDescription() != null ? ticket.getDescription() : "No description");
            System.out.printf("👨‍🔧 Technician:  %s\n", 
                technician != null ? technician.getFullName() : "ID: " + appointment.getTechnicianId());
            System.out.printf("📅 Start Time:  %s\n", 
                appointment.getScheduledStartTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            System.out.printf("📅 End Time:    %s\n", 
                appointment.getScheduledEndTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            
            Duration duration = Duration.between(appointment.getScheduledStartTime(), appointment.getScheduledEndTime());
            System.out.printf("⏱️  Duration:    %d hours, %d minutes\n", 
                duration.toHours(), duration.toMinutes() % 60);
            
            if (appointment.getNotes() != null && !appointment.getNotes().isEmpty()) {
                System.out.printf("📝 Notes:       %s\n", appointment.getNotes());
            }
            
            System.out.printf("📊 Status:      PENDING (will be set after creation)\n");
            
        } catch (ApiException e) {
            logger.warn("Failed to fetch details for appointment summary", e);
            System.out.printf("📋 Ticket ID:   %d\n", appointment.getTicketId());
            System.out.printf("👨‍🔧 Technician: ID %d\n", appointment.getTechnicianId());
            System.out.printf("📅 Time:        %s - %s\n", 
                appointment.getScheduledStartTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                appointment.getScheduledEndTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }
        
        System.out.println();
    }
    
    private void displayCurrentAppointmentInfo(Appointment appointment) {
        try {
            Ticket ticket = apiService.getTicketById(appointment.getTicketId());
            List<Technician> technicians = apiService.getAllTechnicians();
            Technician technician = technicians.stream()
                .filter(t -> t.getId().equals(appointment.getTechnicianId()))
                .findFirst()
                .orElse(null);
            
            System.out.printf("📋 Ticket: #%d - %s\n", 
                ticket.getId(), 
                ticket.getDescription() != null ? ticket.getDescription() : "No description");
            System.out.printf("👨‍🔧 Technician: %s\n", 
                technician != null ? technician.getFullName() : "ID: " + appointment.getTechnicianId());
            System.out.printf("📊 Status: %s\n", appointment.getStatus());
            
        } catch (ApiException e) {
            logger.warn("Failed to fetch appointment details", e);
            System.out.printf("📋 Ticket ID: %d | 👨‍🔧 Technician ID: %d | 📊 Status: %s\n", 
                appointment.getTicketId(), appointment.getTechnicianId(), appointment.getStatus());
        }
    }
    
    private void displayAppointmentUpdateSummary(Appointment original, Appointment updated) {
        System.out.println();
        DisplayUtils.printHeader("APPOINTMENT UPDATE SUMMARY");
        
        System.out.printf("📅 Appointment #%d Changes:\n\n", updated.getId());
        
        // Compare times
        if (!original.getScheduledStartTime().equals(updated.getScheduledStartTime())) {
            System.out.printf("⏰ Start Time: %s → %s\n", 
                formatDateTime(original.getScheduledStartTime()),
                formatDateTime(updated.getScheduledStartTime()));
        }
        
        if (!original.getScheduledEndTime().equals(updated.getScheduledEndTime())) {
            System.out.printf("⏰ End Time:   %s → %s\n", 
                formatDateTime(original.getScheduledEndTime()),
                formatDateTime(updated.getScheduledEndTime()));
        }
        
        // Compare notes
        if (!Objects.equals(original.getNotes(), updated.getNotes())) {
            System.out.printf("📝 Notes:      \"%s\" → \"%s\"\n", 
                original.getNotes() != null ? original.getNotes() : "(none)",
                updated.getNotes() != null ? updated.getNotes() : "(none)");
        }
        
        if (original.getScheduledStartTime().equals(updated.getScheduledStartTime()) &&
            original.getScheduledEndTime().equals(updated.getScheduledEndTime()) &&
            Objects.equals(original.getNotes(), updated.getNotes())) {
            System.out.println("ℹ️  No changes detected.");
        }
        
        System.out.println();
    }
    
    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }
    
    private String formatTimeRange(LocalDateTime start, LocalDateTime end) {
        return String.format("%s - %s", formatDateTime(start), formatDateTime(end));
    }
} 