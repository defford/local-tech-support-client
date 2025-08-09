package com.localtechsupport.cli.menu.client;

import com.localtechsupport.cli.model.Client;
import com.localtechsupport.cli.util.InputValidator;
import com.localtechsupport.cli.util.DisplayUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Scanner;

/**
 * Utility class for collecting and validating client input from users
 * 
 * This class provides methods to build Client objects from user input
 * with proper validation and user-friendly prompts.
 */
public class ClientBuilder {
    
    private static final Logger logger = LoggerFactory.getLogger(ClientBuilder.class);
    
    private final Scanner scanner;
    
    public ClientBuilder(Scanner scanner) {
        this.scanner = scanner;
        logger.debug("ClientBuilder initialized");
    }
    
    /**
     * Collect input for creating a new client
     * 
     * @return a new Client object with user-provided data
     */
    public Client buildNewClient() {
        DisplayUtils.printHeader("NEW CLIENT REGISTRATION");
        
        System.out.println("Please provide the following information:");
        System.out.println("(* indicates required fields)\n");
        
        Client client = new Client();
        
        // Collect required fields
        client.setFirstName(collectFirstName());
        client.setLastName(collectLastName());
        client.setEmail(collectEmail());
        client.setPhone(collectPhone());
        
        // Collect optional fields
        client.setAddress(collectAddress());
        client.setNotes(collectNotes());
        
        // Set default values for new clients
        client.setStatus("ACTIVE");
        client.setActive(true);
        
        logger.info("Built new client: {} {}", client.getFirstName(), client.getLastName());
        return client;
    }
    
    /**
     * Build a client update from user input, showing current values
     * 
     * @param existing the existing client to update
     * @return updated Client object with new values, or null if cancelled
     */
    public Client buildClientUpdate(Client existing) {
        logger.debug("Building client update for: {}", existing.getFullName());
        
        DisplayUtils.printInfo("Press Enter to keep current value, or type new value:");
        System.out.println();
        
        try {
            // Collect updated information
            String firstName = collectOptionalField("First Name", existing.getFirstName());
            if (firstName == null) return null; // User cancelled
            
            String lastName = collectOptionalField("Last Name", existing.getLastName());
            if (lastName == null) return null;
            
            String email = collectOptionalEmailField("Email Address", existing.getEmail());
            if (email == null) return null;
            
            String phone = collectOptionalPhoneField("Phone Number", existing.getPhone());
            if (phone == null) return null;
            
            String address = collectOptionalField("Address", existing.getAddress());
            if (address == null) return null;
            
            String notes = collectOptionalField("Notes", existing.getNotes());
            if (notes == null) return null;
            
            // Create updated client object
            Client updatedClient = new Client();
            updatedClient.setId(existing.getId());
            updatedClient.setFirstName(firstName);
            updatedClient.setLastName(lastName);
            updatedClient.setEmail(email);
            updatedClient.setPhone(phone);
            updatedClient.setAddress(address);
            updatedClient.setNotes(notes);
            updatedClient.setStatus(existing.getStatus()); // Keep existing status
            updatedClient.setActive(existing.isActive()); // Keep existing active state
            updatedClient.setCreatedAt(existing.getCreatedAt()); // Keep existing created date
            updatedClient.setUpdatedAt(existing.getUpdatedAt()); // Will be updated by server
            
            logger.debug("Client update built successfully");
            return updatedClient;
            
        } catch (Exception e) {
            logger.error("Error building client update", e);
            DisplayUtils.printError("Error collecting client information: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Collect and validate first name
     */
    private String collectFirstName() {
        return InputValidator.validateStringInput(
            scanner, 
            "* First Name: ", 
            true
        ).trim();
    }
    
    /**
     * Collect and validate last name
     */
    private String collectLastName() {
        return InputValidator.validateStringInput(
            scanner, 
            "* Last Name: ", 
            true
        ).trim();
    }
    
    /**
     * Collect and validate email address
     */
    private String collectEmail() {
        return InputValidator.validateEmailInput(
            scanner, 
            "* Email Address: "
        );
    }
    
    /**
     * Collect and validate phone number
     */
    private String collectPhone() {
        return InputValidator.validatePhoneInput(
            scanner, 
            "* Phone Number: "
        );
    }
    
    /**
     * Collect optional address
     */
    private String collectAddress() {
        String address = InputValidator.validateStringInput(
            scanner, 
            "  Address (optional): ", 
            false
        );
        return address.trim().isEmpty() ? null : address.trim();
    }
    
    /**
     * Collect optional notes
     */
    private String collectNotes() {
        String notes = InputValidator.validateStringInput(
            scanner, 
            "  Notes (optional): ", 
            false
        );
        return notes.trim().isEmpty() ? null : notes.trim();
    }
    
    /**
     * Collect optional field with current value shown
     */
    private String collectOptionalField(String fieldName, String currentValue) {
        String displayValue = currentValue != null ? currentValue : "(not set)";
        System.out.printf("%s [%s]: ", fieldName, displayValue);
        
        String input = scanner.nextLine().trim();
        
        // Check for cancellation
        if (input.equalsIgnoreCase("cancel") || input.equalsIgnoreCase("c")) {
            return null;
        }
        
        // Return current value if empty input
        if (input.isEmpty()) {
            return currentValue;
        }
        
        return input;
    }
    
    /**
     * Collect optional email field with validation
     */
    private String collectOptionalEmailField(String fieldName, String currentValue) {
        String displayValue = currentValue != null ? currentValue : "(not set)";
        
        while (true) {
            System.out.printf("%s [%s]: ", fieldName, displayValue);
            String input = scanner.nextLine().trim();
            
            // Check for cancellation
            if (input.equalsIgnoreCase("cancel") || input.equalsIgnoreCase("c")) {
                return null;
            }
            
            // Return current value if empty input
            if (input.isEmpty()) {
                return currentValue;
            }
            
            // Validate email if new value provided
            if (InputValidator.isValidEmail(input)) {
                return input;
            } else {
                DisplayUtils.printError("Please enter a valid email address.");
            }
        }
    }
    
    /**
     * Collect optional phone field with validation
     */
    private String collectOptionalPhoneField(String fieldName, String currentValue) {
        String displayValue = currentValue != null ? currentValue : "(not set)";
        
        while (true) {
            System.out.printf("%s [%s]: ", fieldName, displayValue);
            String input = scanner.nextLine().trim();
            
            // Check for cancellation
            if (input.equalsIgnoreCase("cancel") || input.equalsIgnoreCase("c")) {
                return null;
            }
            
            // Return current value if empty input
            if (input.isEmpty()) {
                return currentValue;
            }
            
            // Validate phone if new value provided
            if (InputValidator.isValidPhone(input)) {
                return input;
            } else {
                DisplayUtils.printError("Please enter a valid phone number (10-20 digits, spaces, dashes, parentheses allowed).");
            }
        }
    }
} 