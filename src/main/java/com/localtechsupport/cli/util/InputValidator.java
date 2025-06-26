package com.localtechsupport.cli.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Scanner;
import java.util.regex.Pattern;

/**
 * Utility class for validating and processing user input.
 * 
 * Provides methods to safely collect and validate different types of input
 * with appropriate error handling and user-friendly prompts.
 */
public class InputValidator {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^[\\d\\s\\-\\(\\)\\+\\.]{10,20}$"
    );
    
    /**
     * Validate and get a Long input (for IDs)
     * 
     * @param scanner the scanner for input
     * @param prompt the prompt message
     * @return the validated Long value
     */
    public static Long validateLongInput(Scanner scanner, String prompt) {
        while (true) {
            System.out.print(prompt);
            String input = scanner.nextLine().trim();
            
            if (input.isEmpty()) {
                DisplayUtils.printError("Input cannot be empty. Please try again.");
                continue;
            }
            
            try {
                long value = Long.parseLong(input);
                if (value <= 0) {
                    DisplayUtils.printError("Value must be positive. Please try again.");
                    continue;
                }
                return value;
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Please enter a valid number.");
            }
        }
    }
    
    /**
     * Validate and get a String input
     * 
     * @param scanner the scanner for input
     * @param prompt the prompt message
     * @param required whether the input is required
     * @return the validated String value (or null if not required and empty)
     */
    public static String validateStringInput(Scanner scanner, String prompt, boolean required) {
        while (true) {
            System.out.print(prompt);
            String input = scanner.nextLine().trim();
            
            if (input.isEmpty()) {
                if (required) {
                    DisplayUtils.printError("This field is required. Please try again.");
                    continue;
                } else {
                    return null;
                }
            }
            
            return input;
        }
    }
    
    /**
     * Validate and get a String input with minimum length
     * 
     * @param scanner the scanner for input
     * @param prompt the prompt message
     * @param minLength minimum required length
     * @return the validated String value
     */
    public static String validateStringInput(Scanner scanner, String prompt, int minLength) {
        while (true) {
            System.out.print(prompt);
            String input = scanner.nextLine().trim();
            
            if (input.length() < minLength) {
                DisplayUtils.printError(String.format("Input must be at least %d characters long.", minLength));
                continue;
            }
            
            return input;
        }
    }
    
    /**
     * Validate and get a DateTime input
     * 
     * @param scanner the scanner for input
     * @param prompt the prompt message
     * @return the validated LocalDateTime value
     */
    public static LocalDateTime validateDateTimeInput(Scanner scanner, String prompt) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        
        while (true) {
            System.out.print(prompt + " (format: yyyy-MM-dd HH:mm): ");
            String input = scanner.nextLine().trim();
            
            if (input.isEmpty()) {
                DisplayUtils.printError("Date/time is required. Please try again.");
                continue;
            }
            
            try {
                return LocalDateTime.parse(input, formatter);
            } catch (DateTimeParseException e) {
                DisplayUtils.printError("Invalid date/time format. Please use yyyy-MM-dd HH:mm");
            }
        }
    }
    
    /**
     * Validate and get an enum input
     * 
     * @param scanner the scanner for input
     * @param prompt the prompt message
     * @param enumClass the enum class
     * @param <T> the enum type
     * @return the validated enum value
     */
    public static <T extends Enum<T>> T validateEnumInput(Scanner scanner, String prompt, Class<T> enumClass) {
        T[] values = enumClass.getEnumConstants();
        
        while (true) {
            System.out.println(prompt);
            System.out.println("Available options:");
            for (int i = 0; i < values.length; i++) {
                System.out.printf("  %d. %s%n", i + 1, values[i].name());
            }
            System.out.print("Enter your choice (1-" + values.length + "): ");
            
            String input = scanner.nextLine().trim();
            
            if (input.isEmpty()) {
                DisplayUtils.printError("Selection is required. Please try again.");
                continue;
            }
            
            try {
                int choice = Integer.parseInt(input);
                if (choice >= 1 && choice <= values.length) {
                    return values[choice - 1];
                } else {
                    DisplayUtils.printError("Please enter a number between 1 and " + values.length);
                }
            } catch (NumberFormatException e) {
                // Try to match by name
                for (T value : values) {
                    if (value.name().equalsIgnoreCase(input)) {
                        return value;
                    }
                }
                DisplayUtils.printError("Invalid selection. Please try again.");
            }
        }
    }
    
    /**
     * Validate and get an email input
     * 
     * @param scanner the scanner for input
     * @param prompt the prompt message
     * @return the validated email address
     */
    public static String validateEmailInput(Scanner scanner, String prompt) {
        while (true) {
            System.out.print(prompt);
            String input = scanner.nextLine().trim();
            
            if (input.isEmpty()) {
                DisplayUtils.printError("Email is required. Please try again.");
                continue;
            }
            
            if (!EMAIL_PATTERN.matcher(input).matches()) {
                DisplayUtils.printError("Please enter a valid email address.");
                continue;
            }
            
            return input;
        }
    }
    
    /**
     * Validate and get a phone number input
     * 
     * @param scanner the scanner for input
     * @param prompt the prompt message
     * @return the validated phone number
     */
    public static String validatePhoneInput(Scanner scanner, String prompt) {
        while (true) {
            System.out.print(prompt);
            String input = scanner.nextLine().trim();
            
            if (input.isEmpty()) {
                DisplayUtils.printError("Phone number is required. Please try again.");
                continue;
            }
            
            if (!PHONE_PATTERN.matcher(input).matches()) {
                DisplayUtils.printError("Please enter a valid phone number (10-20 digits, spaces, dashes, parentheses allowed).");
                continue;
            }
            
            return input;
        }
    }
    
    /**
     * Get a confirmation (yes/no) input
     * 
     * @param scanner the scanner for input
     * @param prompt the prompt message
     * @return true for yes, false for no
     */
    public static boolean getConfirmation(Scanner scanner, String prompt) {
        while (true) {
            System.out.print(prompt + " (y/n): ");
            String input = scanner.nextLine().trim().toLowerCase();
            
            if (input.equals("y") || input.equals("yes")) {
                return true;
            } else if (input.equals("n") || input.equals("no")) {
                return false;
            } else {
                DisplayUtils.printError("Please enter 'y' for yes or 'n' for no.");
            }
        }
    }
    
    /**
     * Get an integer input within a range
     * 
     * @param scanner the scanner for input
     * @param prompt the prompt message
     * @param min minimum value (inclusive)
     * @param max maximum value (inclusive)
     * @return the validated integer
     */
    public static int validateIntegerInput(Scanner scanner, String prompt, int min, int max) {
        while (true) {
            System.out.print(prompt + String.format(" (%d-%d): ", min, max));
            String input = scanner.nextLine().trim();
            
            if (input.isEmpty()) {
                DisplayUtils.printError("Input is required. Please try again.");
                continue;
            }
            
            try {
                int value = Integer.parseInt(input);
                if (value >= min && value <= max) {
                    return value;
                } else {
                    DisplayUtils.printError(String.format("Please enter a number between %d and %d.", min, max));
                }
            } catch (NumberFormatException e) {
                DisplayUtils.printError("Please enter a valid number.");
            }
        }
    }
} 