package com.localtechsupport.cli.menu;

import java.util.function.Supplier;

/**
 * Represents a single option in a menu with display text and associated action.
 * 
 * Menu options can either navigate to a sub-menu or execute a direct action.
 */
public class MenuOption {
    
    private final int optionNumber;
    private final String displayName;
    private final String description;
    private final Supplier<Menu> menuSupplier;  // For sub-menu navigation
    private final Runnable action;              // For direct actions
    private final boolean isExitOption;
    
    /**
     * Create a menu option that navigates to a sub-menu
     * 
     * @param optionNumber the number displayed to the user
     * @param displayName the text shown in the menu
     * @param description optional description of what this option does
     * @param menuSupplier supplier that creates the target menu
     */
    public MenuOption(int optionNumber, String displayName, String description, Supplier<Menu> menuSupplier) {
        this.optionNumber = optionNumber;
        this.displayName = displayName;
        this.description = description;
        this.menuSupplier = menuSupplier;
        this.action = null;
        this.isExitOption = false;
    }
    
    /**
     * Create a menu option that executes a direct action
     * 
     * @param optionNumber the number displayed to the user
     * @param displayName the text shown in the menu
     * @param description optional description of what this option does
     * @param action the action to execute when selected
     */
    public MenuOption(int optionNumber, String displayName, String description, Runnable action) {
        this.optionNumber = optionNumber;
        this.displayName = displayName;
        this.description = description;
        this.menuSupplier = null;
        this.action = action;
        this.isExitOption = false;
    }
    
    /**
     * Create an exit menu option
     * 
     * @param optionNumber the number displayed to the user
     * @param displayName the text shown in the menu
     */
    public MenuOption(int optionNumber, String displayName) {
        this.optionNumber = optionNumber;
        this.displayName = displayName;
        this.description = null;
        this.menuSupplier = null;
        this.action = null;
        this.isExitOption = true;
    }
    
    /**
     * Execute this menu option
     * 
     * @return the next menu to navigate to, or null if this was an action
     */
    public Menu execute() {
        if (isExitOption) {
            return null; // Signal exit
        }
        
        if (menuSupplier != null) {
            return menuSupplier.get();
        }
        
        if (action != null) {
            action.run();
        }
        
        return null; // Stay on current menu
    }
    
    // Getters
    public int getOptionNumber() {
        return optionNumber;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean isSubMenu() {
        return menuSupplier != null;
    }
    
    public boolean isAction() {
        return action != null;
    }
    
    public boolean isExitOption() {
        return isExitOption;
    }
    
    /**
     * Get formatted display string for this option
     * 
     * @return formatted string for menu display
     */
    public String getFormattedDisplay() {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("  %d. %s", optionNumber, displayName));
        
        if (description != null && !description.trim().isEmpty()) {
            sb.append(String.format(" - %s", description));
        }
        
        return sb.toString();
    }
} 