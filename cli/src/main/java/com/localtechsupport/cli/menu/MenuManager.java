package com.localtechsupport.cli.menu;

import com.localtechsupport.cli.service.ApiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Scanner;
import java.util.Stack;

/**
 * Central manager for the menu-driven interface.
 * 
 * Handles navigation stack, menu transitions, application lifecycle,
 * and provides shared services to all menus.
 */
public class MenuManager {
    
    private static final Logger logger = LoggerFactory.getLogger(MenuManager.class);
    
    private final Stack<Menu> navigationStack = new Stack<>();
    private final ApiService apiService;
    private final Scanner scanner;
    private Menu currentMenu;
    private boolean running = true;
    
    public MenuManager(ApiService apiService) {
        this.apiService = apiService;
        this.scanner = new Scanner(System.in);
        logger.info("MenuManager initialized");
    }
    
    /**
     * Start the interactive menu system
     * 
     * @return exit code (0 for success, 1 for error)
     */
    public int start() {
        logger.info("Starting interactive menu system");
        
        try {
            // Test API connection first
            if (!apiService.testConnection()) {
                System.err.println("❌ Cannot connect to server: " + apiService.getBaseUrl());
                System.err.println("   Please check that the Local Tech Support Server is running.");
                return 1;
            }
            
            // Initialize with main menu
            currentMenu = createMainMenu();
            currentMenu.initialize(this);
            
            // Main interaction loop
            while (running && currentMenu != null) {
                try {
                    // Clear screen and display current menu
                    clearScreen();
                    displayBreadcrumbs();
                    currentMenu.display();
                    
                    // Get user input
                    System.out.print("\nEnter your choice: ");
                    String input = scanner.nextLine().trim();
                    
                    if (input.isEmpty()) {
                        continue; // Skip empty input
                    }
                    
                    // Handle navigation commands
                    if (handleGlobalCommands(input)) {
                        continue;
                    }
                    
                    // Let current menu handle the input
                    Menu nextMenu = currentMenu.handleInput(input);
                    
                    if (nextMenu != null) {
                        navigateTo(nextMenu);
                    } else if (currentMenu.isExitRequested()) {
                        running = false;
                    }
                    
                } catch (Exception e) {
                    logger.error("Error in menu interaction: {}", e.getMessage(), e);
                    System.err.println("❌ An error occurred. Please try again.");
                    waitForEnter();
                }
            }
            
            System.out.println("\n👋 Thank you for using Tech Support CLI!");
            return 0;
            
        } catch (Exception e) {
            logger.error("Fatal error in menu system: {}", e.getMessage(), e);
            System.err.println("❌ Fatal error: " + e.getMessage());
            return 1;
        }
    }
    
    /**
     * Navigate to a new menu, adding current menu to navigation stack
     * 
     * @param menu the menu to navigate to
     */
    public void navigateTo(Menu menu) {
        if (currentMenu != null) {
            navigationStack.push(currentMenu);
        }
        
        currentMenu = menu;
        if (currentMenu != null) {
            currentMenu.initialize(this);
        }
        
        logger.debug("Navigated to menu: {}", menu != null ? menu.getTitle() : "null");
    }
    
    /**
     * Go back to the previous menu in the navigation stack
     * 
     * @return true if back navigation was successful, false if at root
     */
    public boolean goBack() {
        if (!navigationStack.isEmpty()) {
            currentMenu = navigationStack.pop();
            logger.debug("Navigated back to menu: {}", currentMenu.getTitle());
            return true;
        }
        return false;
    }
    
    /**
     * Get the API service for data operations
     * 
     * @return the API service instance
     */
    public ApiService getApiService() {
        return apiService;
    }
    
    /**
     * Get the scanner for user input
     * 
     * @return the scanner instance
     */
    public Scanner getScanner() {
        return scanner;
    }
    
    /**
     * Request application shutdown
     */
    public void shutdown() {
        running = false;
        logger.info("Menu system shutdown requested");
    }
    
    /**
     * Handle global navigation commands
     * 
     * @param input the user input
     * @return true if command was handled, false otherwise
     */
    private boolean handleGlobalCommands(String input) {
        switch (input.toLowerCase()) {
            case "b":
            case "back":
                if (goBack()) {
                    return true;
                } else {
                    System.out.println("Already at main menu");
                    waitForEnter();
                    return true;
                }
                
            case "q":
            case "quit":
            case "exit":
                running = false;
                return true;
                
            case "h":
            case "help":
                displayGlobalHelp();
                waitForEnter();
                return true;
                
            default:
                return false;
        }
    }
    
    /**
     * Display breadcrumb navigation
     */
    private void displayBreadcrumbs() {
        if (!navigationStack.isEmpty()) {
            System.out.print("📍 ");
            for (int i = 0; i < navigationStack.size(); i++) {
                if (i > 0) System.out.print(" > ");
                System.out.print(navigationStack.get(i).getTitle());
            }
            if (currentMenu != null) {
                System.out.print(" > " + currentMenu.getTitle());
            }
            System.out.println();
            System.out.println();
        }
    }
    
    /**
     * Display global help information
     */
    private void displayGlobalHelp() {
        System.out.println("\n═══════════════════════════════════════");
        System.out.println("📖 GLOBAL NAVIGATION COMMANDS");
        System.out.println("═══════════════════════════════════════");
        System.out.println("  b, back  - Go back to previous menu");
        System.out.println("  q, quit  - Exit the application");
        System.out.println("  h, help  - Show this help message");
        System.out.println("═══════════════════════════════════════");
    }
    
    /**
     * Clear the console screen
     */
    private void clearScreen() {
        // Use ANSI escape codes for clearing screen
        System.out.print("\033[2J\033[H");
        System.out.flush();
    }
    
    /**
     * Wait for user to press Enter
     */
    private void waitForEnter() {
        System.out.print("\nPress Enter to continue...");
        scanner.nextLine();
    }
    
    /**
     * Create the main menu instance
     * 
     * @return the main menu
     */
    private Menu createMainMenu() {
        return new com.localtechsupport.cli.menu.main.MainMenu();
    }
} 