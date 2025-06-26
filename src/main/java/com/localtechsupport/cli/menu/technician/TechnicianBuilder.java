package com.localtechsupport.cli.menu.technician;

import com.localtechsupport.cli.model.Technician;
import com.localtechsupport.cli.util.InputValidator;
import com.localtechsupport.cli.util.DisplayUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Scanner;

/**
 * Utility class for building technician objects from user input
 * 
 * Handles collection and validation of technician data for create/update operations
 */
public class TechnicianBuilder {
    
    private static final Logger logger = LoggerFactory.getLogger(TechnicianBuilder.class);
    private final Scanner scanner;
    
    // Available skills/service types
    private static final List<String> AVAILABLE_SKILLS = Arrays.asList(
        "HARDWARE", "SOFTWARE"
    );
    
    // Available status options
    private static final List<String> AVAILABLE_STATUSES = Arrays.asList(
        "ACTIVE", "INACTIVE", "IN_TRAINING", "ON_VACATION", "TERMINATED"
    );
    
    public TechnicianBuilder(Scanner scanner) {
        this.scanner = scanner;
    }
    
    /**
     * Build a new technician from user input
     * 
     * @return populated Technician object or null if cancelled
     */
    public Technician buildNewTechnician() {
        DisplayUtils.printHeader("NEW TECHNICIAN REGISTRATION");
        
        System.out.println("📋 Please provide the following information:");
        System.out.println("   (Enter 'cancel' at any time to abort)");
        System.out.println();
        
        try {
            // Collect required fields
            String fullName = collectFullName();
            if (fullName == null) return null;
            
            String email = collectEmail();
            if (email == null) return null;
            
            String phone = collectPhone();
            if (phone == null) return null;
            
            List<String> skills = collectSkills();
            if (skills == null) return null;
            
            // Optional fields
            String status = collectStatus();
            if (status == null) return null;
            
            // Create technician object
            Technician technician = new Technician();
            technician.setFullName(fullName);
            technician.setEmail(email);
            technician.setPhone(phone);
            technician.setSkills(skills);
            technician.setStatus(status);
            
            // Show confirmation
            displayTechnicianSummary(technician, "NEW TECHNICIAN SUMMARY");
            
            System.out.print("✅ Create this technician? (y/n): ");
            String confirm = scanner.nextLine().trim().toLowerCase();
            
            if (confirm.equals("y") || confirm.equals("yes")) {
                return technician;
            } else {
                System.out.println("❌ Technician creation cancelled.");
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error building new technician", e);
            DisplayUtils.printError("An error occurred while collecting technician information.");
            return null;
        }
    }
    
    /**
     * Build updated technician data from user input
     * 
     * @param existing the existing technician to update
     * @return updated Technician object or null if cancelled
     */
    public Technician buildTechnicianUpdate(Technician existing) {
        DisplayUtils.printHeader("EDIT TECHNICIAN - " + existing.getFullName());
        
        System.out.println("📋 Current information (press Enter to keep current value):");
        System.out.println("   (Enter 'cancel' at any time to abort)");
        System.out.println();
        
        try {
            // Create copy of existing technician
            Technician updated = new Technician();
            updated.setId(existing.getId());
            
            // Update fields
            String fullName = collectFullNameUpdate(existing.getFullName());
            if (fullName == null) return null;
            updated.setFullName(fullName);
            
            String email = collectEmailUpdate(existing.getEmail());
            if (email == null) return null;
            updated.setEmail(email);
            
            String phone = collectPhoneUpdate(existing.getPhone());
            if (phone == null) return null;
            updated.setPhone(phone);
            
            List<String> skills = collectSkillsUpdate(existing.getSkills());
            if (skills == null) return null;
            updated.setSkills(skills);
            
            String status = collectStatusUpdate(existing.getStatus());
            if (status == null) return null;
            updated.setStatus(status);
            
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
            logger.error("Error building technician update", e);
            DisplayUtils.printError("An error occurred while updating technician information.");
            return null;
        }
    }
    
    // ==================== FIELD COLLECTION METHODS ====================
    
    private String collectFullName() {
        while (true) {
            System.out.print("Full Name: ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("cancel")) {
                return null;
            }
            
            if (input.isEmpty()) {
                DisplayUtils.printError("Full name is required.");
                continue;
            }
            
            if (input.length() > 100) {
                DisplayUtils.printError("Full name must be 100 characters or less.");
                continue;
            }
            
            return input;
        }
    }
    
    
    
    private String collectEmail() {
        while (true) {
            System.out.print("Email Address: ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("cancel")) {
                return null;
            }
            
            if (input.isEmpty()) {
                DisplayUtils.printError("Email address is required.");
                continue;
            }
            
            if (!InputValidator.isValidEmail(input)) {
                DisplayUtils.printError("Please enter a valid email address (e.g., user@example.com).");
                continue;
            }
            
            return input;
        }
    }
    
    private String collectPhone() {
        while (true) {
            System.out.print("Phone Number: ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("cancel")) {
                return null;
            }
            
            if (input.isEmpty()) {
                DisplayUtils.printError("Phone number is required.");
                continue;
            }
            
            if (!InputValidator.isValidPhone(input)) {
                DisplayUtils.printError("Please enter a valid phone number (e.g., 555-0123 or +1-555-0123).");
                continue;
            }
            
            return input;
        }
    }
    
    private List<String> collectSkills() {
        System.out.println("📚 Available Skills:");
        for (int i = 0; i < AVAILABLE_SKILLS.size(); i++) {
            System.out.printf("   %d. %s\n", i + 1, AVAILABLE_SKILLS.get(i));
        }
        System.out.println();
        
        while (true) {
            System.out.print("Select skills (e.g., 1,3,5 or 'all' for all skills): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("cancel")) {
                return null;
            }
            
            if (input.isEmpty()) {
                DisplayUtils.printError("At least one skill is required.");
                continue;
            }
            
            if (input.equalsIgnoreCase("all")) {
                return new ArrayList<>(AVAILABLE_SKILLS);
            }
            
            try {
                List<String> selectedSkills = new ArrayList<>();
                String[] selections = input.split(",");
                
                for (String selection : selections) {
                    int index = Integer.parseInt(selection.trim()) - 1;
                    if (index < 0 || index >= AVAILABLE_SKILLS.size()) {
                        throw new NumberFormatException("Invalid skill number: " + (index + 1));
                    }
                    String skill = AVAILABLE_SKILLS.get(index);
                    if (!selectedSkills.contains(skill)) {
                        selectedSkills.add(skill);
                    }
                }
                
                if (selectedSkills.isEmpty()) {
                    DisplayUtils.printError("At least one skill is required.");
                    continue;
                }
                
                return selectedSkills;
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Please enter valid skill numbers (e.g., 1,3,5).");
            }
        }
    }
    
    private String collectStatus() {
        System.out.println("📊 Available Status Options:");
        for (int i = 0; i < AVAILABLE_STATUSES.size(); i++) {
            System.out.printf("   %d. %s\n", i + 1, AVAILABLE_STATUSES.get(i));
        }
        System.out.println();
        
        while (true) {
            System.out.print("Select status (default: ACTIVE): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("cancel")) {
                return null;
            }
            
            if (input.isEmpty()) {
                return "ACTIVE"; // Default status
            }
            
            try {
                int index = Integer.parseInt(input) - 1;
                if (index < 0 || index >= AVAILABLE_STATUSES.size()) {
                    throw new NumberFormatException("Invalid status number");
                }
                return AVAILABLE_STATUSES.get(index);
                
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Please enter a valid status number (1-" + AVAILABLE_STATUSES.size() + ").");
            }
        }
    }
    
    // ==================== UPDATE FIELD COLLECTION METHODS ====================
    
    private String collectFullNameUpdate(String current) {
        System.out.printf("Full Name [%s]: ", current);
        String input = scanner.nextLine().trim();
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        if (input.isEmpty()) {
            return current;
        }
        
        if (input.length() > 100) {
            DisplayUtils.printError("Full name must be 100 characters or less. Keeping current value.");
            return current;
        }
        
        return input;
    }
    
    private String collectLastNameUpdate(String current) {
        System.out.printf("Last Name [%s]: ", current);
        String input = scanner.nextLine().trim();
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        if (input.isEmpty()) {
            return current;
        }
        
        if (input.length() > 50) {
            DisplayUtils.printError("Last name must be 50 characters or less. Keeping current value.");
            return current;
        }
        
        return input;
    }
    
    private String collectEmailUpdate(String current) {
        System.out.printf("Email Address [%s]: ", current);
        String input = scanner.nextLine().trim();
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        if (input.isEmpty()) {
            return current;
        }
        
        if (!InputValidator.isValidEmail(input)) {
            DisplayUtils.printError("Invalid email format. Keeping current value.");
            return current;
        }
        
        return input;
    }
    
    private String collectPhoneUpdate(String current) {
        System.out.printf("Phone Number [%s]: ", current);
        String input = scanner.nextLine().trim();
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        if (input.isEmpty()) {
            return current;
        }
        
        if (!InputValidator.isValidPhone(input)) {
            DisplayUtils.printError("Invalid phone format. Keeping current value.");
            return current;
        }
        
        return input;
    }
    
    private List<String> collectSkillsUpdate(List<String> current) {
        System.out.println("📚 Current Skills: " + (current != null ? String.join(", ", current) : "None"));
        System.out.println("Available Skills:");
        for (int i = 0; i < AVAILABLE_SKILLS.size(); i++) {
            System.out.printf("   %d. %s\n", i + 1, AVAILABLE_SKILLS.get(i));
        }
        System.out.print("Update skills (e.g., 1,3,5 or 'all' or Enter to keep current): ");
        String input = scanner.nextLine().trim();
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        if (input.isEmpty()) {
            return current;
        }
        
        if (input.equalsIgnoreCase("all")) {
            return new ArrayList<>(AVAILABLE_SKILLS);
        }
        
        try {
            List<String> selectedSkills = new ArrayList<>();
            String[] selections = input.split(",");
            
            for (String selection : selections) {
                int index = Integer.parseInt(selection.trim()) - 1;
                if (index < 0 || index >= AVAILABLE_SKILLS.size()) {
                    throw new NumberFormatException("Invalid skill number");
                }
                String skill = AVAILABLE_SKILLS.get(index);
                if (!selectedSkills.contains(skill)) {
                    selectedSkills.add(skill);
                }
            }
            
            return selectedSkills.isEmpty() ? current : selectedSkills;
            
        } catch (NumberFormatException e) {
            DisplayUtils.printError("Invalid skill selection. Keeping current skills.");
            return current;
        }
    }
    
    private String collectStatusUpdate(String current) {
        System.out.printf("Current Status: %s\n", current);
        System.out.println("Available Status Options:");
        for (int i = 0; i < AVAILABLE_STATUSES.size(); i++) {
            System.out.printf("   %d. %s\n", i + 1, AVAILABLE_STATUSES.get(i));
        }
        System.out.print("Update status (Enter to keep current): ");
        String input = scanner.nextLine().trim();
        
        if (input.equalsIgnoreCase("cancel")) {
            return null;
        }
        
        if (input.isEmpty()) {
            return current;
        }
        
        try {
            int index = Integer.parseInt(input) - 1;
            if (index < 0 || index >= AVAILABLE_STATUSES.size()) {
                throw new NumberFormatException("Invalid status number");
            }
            return AVAILABLE_STATUSES.get(index);
            
        } catch (NumberFormatException e) {
            DisplayUtils.printError("Invalid status selection. Keeping current status.");
            return current;
        }
    }
    
    // ==================== DISPLAY METHODS ====================
    
    private void displayTechnicianSummary(Technician technician, String title) {
        System.out.println();
        DisplayUtils.printHeader(title);
        
        System.out.printf("Name:        %s\n", technician.getFullName());
        System.out.printf("Email:       %s\n", technician.getEmail());
        System.out.printf("Phone:       %s\n", technician.getPhone());
        System.out.printf("Status:      %s\n", technician.getStatus());
        System.out.printf("Skills:      %s\n", technician.getSkills() != null ? 
            String.join(", ", technician.getSkills()) : "None");
        System.out.println();
    }
    
    private void displayUpdateSummary(Technician existing, Technician updated) {
        System.out.println();
        DisplayUtils.printHeader("UPDATE SUMMARY");
        
        System.out.println("📋 Changes to be made:");
        
        if (!Objects.equals(existing.getFullName(), updated.getFullName())) {
            System.out.printf("   Name:     %s → %s\n", existing.getFullName(), updated.getFullName());
        }
        
        if (!Objects.equals(existing.getEmail(), updated.getEmail())) {
            System.out.printf("   Email:    %s → %s\n", existing.getEmail(), updated.getEmail());
        }
        
        if (!Objects.equals(existing.getPhone(), updated.getPhone())) {
            System.out.printf("   Phone:    %s → %s\n", existing.getPhone(), updated.getPhone());
        }
        
        if (!Objects.equals(existing.getStatus(), updated.getStatus())) {
            System.out.printf("   Status:   %s → %s\n", existing.getStatus(), updated.getStatus());
        }
        
        List<String> existingSkills = existing.getSkills() != null ? existing.getSkills() : new ArrayList<>();
        List<String> updatedSkills = updated.getSkills() != null ? updated.getSkills() : new ArrayList<>();
        
        if (!existingSkills.equals(updatedSkills)) {
            System.out.printf("   Skills:   %s → %s\n", 
                String.join(", ", existingSkills), 
                String.join(", ", updatedSkills));
        }
        
        System.out.println();
    }
} 