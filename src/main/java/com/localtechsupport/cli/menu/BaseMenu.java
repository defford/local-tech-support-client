package com.localtechsupport.cli.menu;

import com.localtechsupport.cli.service.ApiService;
import com.localtechsupport.cli.util.DisplayUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * Abstract base class for all menu implementations.
 * 
 * Provides common functionality for menu display, input handling,
 * and navigation while allowing concrete menus to implement
 * their specific behavior.
 */
public abstract class BaseMenu implements Menu {
    
    private static final Logger logger = LoggerFactory.getLogger(BaseMenu.class);
    
    protected MenuManager menuManager;
    protected ApiService apiService;
    protected Scanner scanner;
    protected List<MenuOption> menuOptions;
    protected Menu parentMenu;
    protected boolean exitRequested = false;
    
    /**
     * Constructor for base menu
     * 
     * @param parentMenu the parent menu for back navigation (null for root)
     */
    protected BaseMenu(Menu parentMenu) {
        this.parentMenu = parentMenu;
        this.menuOptions = new ArrayList<>();
    }
    
    @Override
    public void initialize(MenuManager menuManager) {
        this.menuManager = menuManager;
        this.apiService = menuManager.getApiService();
        this.scanner = menuManager.getScanner();
        
        // Initialize menu options - template method
        initializeMenuOptions();
        
        logger.debug("Menu initialized: {}", getTitle());
    }
    
    @Override
    public void display() {
        // Display header
        DisplayUtils.printHeader(getTitle());
        
        // Display custom content (template method)
        displayCustomContent();
        
        // Display menu options
        if (!menuOptions.isEmpty()) {
            DisplayUtils.printSubHeader("Available Options");
            DisplayUtils.printMenu(menuOptions);
        }
        
        // Display footer with navigation hints
        displayNavigationFooter();
    }
    
    @Override
    public Menu handleInput(String input) {
        try {
            // Try to parse as menu option number
            int choice = Integer.parseInt(input);
            
            // Find matching menu option
            for (MenuOption option : menuOptions) {
                if (option.getOptionNumber() == choice) {
                    logger.debug("Selected menu option: {} - {}", choice, option.getDisplayName());
                    
                    if (option.isExitOption()) {
                        exitRequested = true;
                        return null;
                    }
                    
                    Menu result = option.execute();
                    
                    // If it was an action (not navigation), handle post-action
                    if (result == null && option.isAction()) {
                        handlePostAction();
                    }
                    
                    return result;
                }
            }
            
            // Invalid option number
            DisplayUtils.printError("Invalid option. Please try again.");
            waitForEnter();
            return null;
            
        } catch (NumberFormatException e) {
            // Not a number - handle custom input (template method)
            return handleCustomInput(input);
        }
    }
    
    @Override
    public String getTitle() {
        // Abstract method - must be implemented by concrete menus
        return getMenuTitle();
    }
    
    @Override
    public Menu getParentMenu() {
        return parentMenu;
    }
    
    @Override
    public boolean isExitRequested() {
        return exitRequested;
    }
    
    /**
     * Template method: Initialize menu-specific options
     * Concrete menus should override this to add their options
     */
    protected abstract void initializeMenuOptions();
    
    /**
     * Template method: Get the title for this menu
     * 
     * @return the menu title
     */
    protected abstract String getMenuTitle();
    
    /**
     * Template method: Display custom content before menu options
     * Override to show menu-specific information
     */
    protected void displayCustomContent() {
        // Default: no custom content
    }
    
    /**
     * Template method: Handle custom input that's not a menu option
     * Override to handle special commands or shortcuts
     * 
     * @param input the user input
     * @return the next menu to navigate to, or null to stay
     */
    protected Menu handleCustomInput(String input) {
        DisplayUtils.printError("Invalid input. Please enter a number from the menu or use global commands (h for help).");
        waitForEnter();
        return null;
    }
    
    /**
     * Template method: Handle post-action processing
     * Called after an action menu option is executed
     */
    protected void handlePostAction() {
        waitForEnter();
    }
    
    /**
     * Wait for user to press Enter using the same Scanner instance
     * Use this instead of DisplayUtils.waitForEnter() to avoid input conflicts
     */
    protected void waitForEnter() {
        System.out.print("\nPress Enter to continue...");
        scanner.nextLine();
    }
    
    /**
     * Display navigation footer with helpful hints
     */
    private void displayNavigationFooter() {
        System.out.println();
        DisplayUtils.printSeparator();
        System.out.println("💡 Navigation: 'b' = back, 'q' = quit, 'h' = help");
        DisplayUtils.printSeparator();
    }
    
    /**
     * Helper method to add a menu option for sub-menu navigation
     * 
     * @param optionNumber the option number
     * @param displayName the display name
     * @param description optional description
     * @param menuSupplier supplier for the target menu
     */
    protected void addMenuOption(int optionNumber, String displayName, String description, 
                                 java.util.function.Supplier<Menu> menuSupplier) {
        menuOptions.add(new MenuOption(optionNumber, displayName, description, menuSupplier));
    }
    
    /**
     * Helper method to add a menu option for direct action
     * 
     * @param optionNumber the option number
     * @param displayName the display name
     * @param description optional description
     * @param action the action to execute
     */
    protected void addActionOption(int optionNumber, String displayName, String description, 
                                   Runnable action) {
        menuOptions.add(new MenuOption(optionNumber, displayName, description, action));
    }
    
    /**
     * Helper method to add an exit option
     * 
     * @param optionNumber the option number
     * @param displayName the display name (typically "Exit")
     */
    protected void addExitOption(int optionNumber, String displayName) {
        menuOptions.add(new MenuOption(optionNumber, displayName));
    }
    
    /**
     * Helper method to safely execute API operations with error handling
     * 
     * @param operation the operation to execute
     * @param operationName name for logging/error messages
     * @param <T> the return type
     * @return the result of the operation, or null if failed
     */
    protected <T> T executeApiOperation(java.util.function.Supplier<T> operation, String operationName) {
        try {
            DisplayUtils.printLoading(operationName);
            T result = operation.get();
            DisplayUtils.printSuccess(operationName + " completed successfully");
            return result;
        } catch (Exception e) {
            logger.error("Error in {} operation: {}", operationName, e.getMessage(), e);
            DisplayUtils.printError(operationName + " failed: " + e.getMessage());
            return null;
        }
    }
} 