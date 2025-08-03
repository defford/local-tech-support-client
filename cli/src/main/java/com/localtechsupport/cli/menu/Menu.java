package com.localtechsupport.cli.menu;

/**
 * Base interface for all menu implementations in the Tech Support CLI system.
 * 
 * This interface defines the core contract that all menus must implement,
 * providing navigation, display, and input handling capabilities.
 */
public interface Menu {
    
    /**
     * Display the menu to the user with all available options
     */
    void display();
    
    /**
     * Handle user input and return the next menu to navigate to
     * 
     * @param input the user's input choice
     * @return the next menu to display, or null to stay on current menu
     */
    Menu handleInput(String input);
    
    /**
     * Get the title of this menu for display purposes
     * 
     * @return the menu title
     */
    String getTitle();
    
    /**
     * Get the parent menu for back navigation
     * 
     * @return the parent menu, or null if this is the root menu
     */
    Menu getParentMenu();
    
    /**
     * Check if the user has requested to exit the application
     * 
     * @return true if exit was requested, false otherwise
     */
    boolean isExitRequested();
    
    /**
     * Initialize the menu with required dependencies
     * 
     * @param menuManager the menu manager for navigation control
     */
    void initialize(MenuManager menuManager);
} 