package com.localtechsupport.cli.menu.main;

import com.localtechsupport.cli.menu.BaseMenu;
import com.localtechsupport.cli.menu.Menu;
import com.localtechsupport.cli.menu.client.ClientManagementMenu;
import com.localtechsupport.cli.menu.technician.TechnicianManagementMenu;
import com.localtechsupport.cli.menu.ticket.TicketManagementMenu;
import com.localtechsupport.cli.util.DisplayUtils;

/**
 * Main menu for the Tech Support CLI system.
 * 
 * This is the root menu that provides access to all major system functions
 * including client management, technician management, tickets, appointments,
 * reports, and viewing current data.
 */
public class MainMenu extends BaseMenu {
    
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
            () -> new PlaceholderMenu(this, "Appointment Management",
                "Appointment operations will be available in Phase 5 implementation"));
        
        // Reports & Analytics
        addMenuOption(5, "Reports & Analytics",
            "View system reports, statistics, and analytics",
            () -> new PlaceholderMenu(this, "Reports & Analytics",
                "Advanced reporting will be available in Phase 6 implementation"));
        
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
            System.out.println("    These options use the existing command implementations");
            System.out.println("    to display current system information.");
        }
        
        @Override
        protected void initializeMenuOptions() {
            // Client Tickets
            addActionOption(1, "Client Tickets", 
                "Show tickets for each client in the system",
                this::showClientTickets);
            
            // Overdue Tickets
            addActionOption(2, "Overdue Tickets",
                "Show tickets that are currently overdue", 
                this::showOverdueTickets);
            
            // Technician Workload
            addActionOption(3, "Technician Workload",
                "Show tickets assigned to each technician",
                this::showTechnicianWorkload);
            
            // Available Technicians
            addActionOption(4, "Available Technicians", 
                "Show technicians available for each service type",
                this::showAvailableTechnicians);
            
            // Technician Schedule
            addActionOption(5, "Technician Schedule",
                "Show appointments for each technician",
                this::showTechnicianSchedule);
            
            // Client Appointments
            addActionOption(6, "Client Appointments",
                "Show appointments scheduled by each client", 
                this::showClientAppointments);
            
            // Client-Technician History
            addActionOption(7, "Client-Technician History",
                "Show which clients have worked with which technicians",
                this::showClientTechnicianHistory);
            
            // Technician Feedback
            addActionOption(8, "Technician Feedback", 
                "Show feedback ratings for each technician",
                this::showTechnicianFeedback);
        }
        
        private void showClientTickets() {
            DisplayUtils.printInfo("This would execute the client-tickets command");
            DisplayUtils.printWarning("Integration with existing commands will be implemented in the next iteration");
        }
        
        private void showOverdueTickets() {
            DisplayUtils.printInfo("This would execute the overdue-tickets command");
            DisplayUtils.printWarning("Integration with existing commands will be implemented in the next iteration");
        }
        
        private void showTechnicianWorkload() {
            DisplayUtils.printInfo("This would execute the technician-workload command");
            DisplayUtils.printWarning("Integration with existing commands will be implemented in the next iteration");
        }
        
        private void showAvailableTechnicians() {
            DisplayUtils.printInfo("This would execute the available-technicians command");
            DisplayUtils.printWarning("Integration with existing commands will be implemented in the next iteration");
        }
        
        private void showTechnicianSchedule() {
            DisplayUtils.printInfo("This would execute the technician-schedule command");
            DisplayUtils.printWarning("Integration with existing commands will be implemented in the next iteration");
        }
        
        private void showClientAppointments() {
            DisplayUtils.printInfo("This would execute the client-appointments command");
            DisplayUtils.printWarning("Integration with existing commands will be implemented in the next iteration");
        }
        
        private void showClientTechnicianHistory() {
            DisplayUtils.printInfo("This would execute the client-technician-history command");
            DisplayUtils.printWarning("Integration with existing commands will be implemented in the next iteration");
        }
        
        private void showTechnicianFeedback() {
            DisplayUtils.printInfo("This would execute the technician-feedback command");
            DisplayUtils.printWarning("Integration with existing commands will be implemented in the next iteration");
        }
    }
} 