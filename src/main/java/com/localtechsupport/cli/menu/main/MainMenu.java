package com.localtechsupport.cli.menu.main;

import com.localtechsupport.cli.menu.BaseMenu;
import com.localtechsupport.cli.menu.Menu;
import com.localtechsupport.cli.menu.client.ClientManagementMenu;
import com.localtechsupport.cli.menu.technician.TechnicianManagementMenu;
import com.localtechsupport.cli.menu.ticket.TicketManagementMenu;
import com.localtechsupport.cli.menu.appointment.AppointmentManagementMenu;
import com.localtechsupport.cli.menu.reports.ReportsAnalyticsMenu;
import com.localtechsupport.cli.util.DisplayUtils;
// Import the command classes
import com.localtechsupport.cli.command.ClientTicketsCommand;
import com.localtechsupport.cli.command.OverdueTicketsCommand;
import com.localtechsupport.cli.command.TechnicianWorkloadCommand;
import com.localtechsupport.cli.command.AvailableTechniciansCommand;
import com.localtechsupport.cli.command.TechnicianScheduleCommand;
import com.localtechsupport.cli.command.ClientAppointmentsCommand;
import com.localtechsupport.cli.command.ClientTechnicianHistoryCommand;
import com.localtechsupport.cli.command.TechnicianFeedbackCommand;
import com.localtechsupport.cli.CliApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import picocli.CommandLine;

/**
 * Main menu for the Tech Support CLI system.
 * 
 * This is the root menu that provides access to all major system functions
 * including client management, technician management, tickets, appointments,
 * reports, and viewing current data.
 */
public class MainMenu extends BaseMenu {
    
    private static final Logger logger = LoggerFactory.getLogger(MainMenu.class);
    
    public MainMenu() {
        super(null); // Root menu has no parent
    }
    
    @Override
    protected String getMenuTitle() {
        return "Tech Support CLI System - Main Menu";
    }
    
    @Override
    protected void displayCustomContent() {
        // Display system information and connection status
        System.out.println("🖥️  Welcome to the Local Tech Support System");
        System.out.println("    Server: " + apiService.getBaseUrl());
        System.out.println("    Connection: ✅ Active");
        System.out.println();  
        System.out.println("📋 This interactive menu system provides access to all");
        System.out.println("    system functions with an intuitive navigation interface.");
    }
    
    @Override
    protected void initializeMenuOptions() {
        // Client Management
        addMenuOption(1, "Client Management", 
            "Manage clients, view client information, and handle client-related operations",
            () -> new ClientManagementMenu(this));
        
        // Technician Management  
        addMenuOption(2, "Technician Management",
            "Manage technicians, skills, schedules, and technician-related operations", 
            () -> new TechnicianManagementMenu(this));
        
        // Ticket Management
        addMenuOption(3, "Ticket Management",
            "Create, update, assign, and track support tickets",
            () -> new TicketManagementMenu(this));
        
        // Appointment Management
        addMenuOption(4, "Appointment Management", 
            "Schedule, manage, and track client appointments",
            () -> new AppointmentManagementMenu(this));
        
        // Reports & Analytics
        addMenuOption(5, "Reports & Analytics",
            "View system reports, statistics, and analytics",
            () -> new ReportsAnalyticsMenu(this));
        
        // View Current Data - Links to existing functionality
        addMenuOption(6, "View Current Data",
            "Quick access to current system data using existing commands",
            () -> new ViewCurrentDataMenu(this));
        
        // Exit option
        addExitOption(7, "Exit");
    }
    
    /**
     * Placeholder menu for features not yet implemented
     */
    private static class PlaceholderMenu extends BaseMenu {
        
        private final String menuTitle;
        private final String message;
        
        public PlaceholderMenu(Menu parent, String title, String message) {
            super(parent);
            this.menuTitle = title;
            this.message = message;
        }
        
        @Override
        protected String getMenuTitle() {
            return menuTitle;
        }
        
        @Override
        protected void displayCustomContent() {
            DisplayUtils.printInfo(message);
            System.out.println();
            System.out.println("🚧 This feature is planned for future implementation.");
            System.out.println("   Use 'b' or 'back' to return to the main menu.");
        }
        
        @Override
        protected void initializeMenuOptions() {
            // No options - just a placeholder
        }
    }
    
    /**
     * Menu for viewing current data using existing commands
     */
    private static class ViewCurrentDataMenu extends BaseMenu {
        
        private static final Logger logger = LoggerFactory.getLogger(ViewCurrentDataMenu.class);
        
        public ViewCurrentDataMenu(Menu parent) {
            super(parent);
        }
        
        @Override
        protected String getMenuTitle() {
            return "View Current Data";
        }
        
        @Override
        protected void displayCustomContent() {
            System.out.println("📊 Quick access to current system data");
            System.out.println("    These options execute the core reporting commands");
            System.out.println("    to display current system information.");
        }
        
        @Override
        protected void initializeMenuOptions() {
            // Client Tickets
            addActionOption(1, "Client Tickets", 
                "Show tickets for each client in the system",
                () -> executeCommand("Client Tickets Report", ClientTicketsCommand.class));
            
            // Overdue Tickets
            addActionOption(2, "Overdue Tickets",
                "Show tickets that are currently overdue", 
                () -> executeCommand("Overdue Tickets Report", OverdueTicketsCommand.class));
            
            // Technician Workload
            addActionOption(3, "Technician Workload",
                "Show tickets assigned to each technician",
                () -> executeCommand("Technician Workload Report", TechnicianWorkloadCommand.class));
            
            // Available Technicians
            addActionOption(4, "Available Technicians", 
                "Show technicians available for each service type",
                () -> executeCommand("Available Technicians Report", AvailableTechniciansCommand.class));
            
            // Technician Schedule
            addActionOption(5, "Technician Schedule",
                "Show appointments for each technician",
                () -> executeCommand("Technician Schedule Report", TechnicianScheduleCommand.class));
            
            // Client Appointments
            addActionOption(6, "Client Appointments",
                "Show appointments scheduled by each client", 
                () -> executeCommand("Client Appointments Report", ClientAppointmentsCommand.class));
            
            // Client-Technician History
            addActionOption(7, "Client-Technician History",
                "Show which clients have worked with which technicians",
                () -> executeCommand("Client-Technician History Report", ClientTechnicianHistoryCommand.class));
            
            // Technician Feedback
            addActionOption(8, "Technician Feedback", 
                "Show feedback ratings for each technician",
                () -> executeCommand("Technician Feedback Report", TechnicianFeedbackCommand.class));
        }
        
        /**
         * Create a mock CliApplication for command execution
         */
        private CliApplication createMockCliApplication() {
            return new CliApplication() {
                @Override
                public String getServerUrl() {
                    return apiService.getBaseUrl();
                }
                
                @Override
                public boolean isVerbose() {
                    return false; // Menu context doesn't need verbose output
                }
                
                @Override
                public String getOutputFormat() {
                    return "table"; // Use table format for better readability
                }
            };
        }
        
        /**
         * Generic method to execute any command class
         */
        private <T extends java.util.concurrent.Callable<Integer>> void executeCommand(String reportName, Class<T> commandClass) {
            try {
                // Create and initialize the command
                T command = createAndInitializeCommand(commandClass);
                
                // Execute the command
                DisplayUtils.printHeader(reportName.toUpperCase());
                System.out.println();
                
                Integer result = command.call();
                
                if (result != 0) {
                    System.out.println();
                    DisplayUtils.printError("Command completed with errors (exit code: " + result + ")");
                }
                
            } catch (Exception e) {
                logger.error("Error executing {}: {}", commandClass.getSimpleName(), e.getMessage(), e);
                System.out.println();
                DisplayUtils.printError("Error executing command: " + e.getMessage());
            }
        }
        
        /**
         * Create and initialize a command instance with proper parent and default values
         */
        private <T> T createAndInitializeCommand(Class<T> commandClass) throws Exception {
            try {
                // Create instance
                T command = commandClass.getDeclaredConstructor().newInstance();
                
                // Set parent command
                setParentCommand(command);
                
                // Set default values for @Option fields
                setDefaultValues(command);
                
                logger.debug("Successfully initialized command: {}", commandClass.getSimpleName());
                return command;
                
            } catch (Exception e) {
                logger.error("Failed to initialize {}: {}", commandClass.getSimpleName(), e.getMessage(), e);
                throw new Exception("Failed to initialize " + commandClass.getSimpleName() + ": " + e.getMessage(), e);
            }
        }
        
        /**
         * Set the parent command field using reflection
         */
        private <T> void setParentCommand(T command) throws Exception {
            java.lang.reflect.Field parentField = command.getClass().getDeclaredField("parent");
            parentField.setAccessible(true);
            parentField.set(command, createMockCliApplication());
        }
        
        /**
         * Set default values for all @Option fields that have defaultValue
         */
        private <T> void setDefaultValues(T command) throws Exception {
            java.lang.reflect.Field[] fields = command.getClass().getDeclaredFields();
            
            for (java.lang.reflect.Field field : fields) {
                CommandLine.Option optionAnnotation = field.getAnnotation(CommandLine.Option.class);
                if (optionAnnotation != null && !optionAnnotation.defaultValue().equals(CommandLine.Option.NULL_VALUE)) {
                    try {
                        field.setAccessible(true);
                        String defaultValue = optionAnnotation.defaultValue();
                        Object value = convertDefaultValue(field.getType(), defaultValue);
                        field.set(command, value);
                        logger.debug("Set default value for {}.{}: {}", 
                            command.getClass().getSimpleName(), field.getName(), defaultValue);
                    } catch (Exception e) {
                        logger.warn("Failed to set default value for {}.{}: {}", 
                            command.getClass().getSimpleName(), field.getName(), e.getMessage());
                        // Continue with other fields
                    }
                }
            }
        }
        
        /**
         * Convert string default value to appropriate Java type
         */
        private Object convertDefaultValue(Class<?> fieldType, String defaultValue) {
            if (fieldType == String.class) {
                return defaultValue;
            } else if (fieldType == int.class || fieldType == Integer.class) {
                return Integer.parseInt(defaultValue);
            } else if (fieldType == boolean.class || fieldType == Boolean.class) {
                return Boolean.parseBoolean(defaultValue);
            } else if (fieldType == long.class || fieldType == Long.class) {
                return Long.parseLong(defaultValue);
            }
            // Fallback to string for any other types
            return defaultValue;
        }
    }
} 