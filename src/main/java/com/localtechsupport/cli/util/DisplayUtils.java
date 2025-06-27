package com.localtechsupport.cli.util;

import java.util.List;
import com.localtechsupport.cli.menu.MenuOption;

/**
 * Utility class for professional console display formatting.
 * 
 * Provides methods for headers, menus, messages, and visual elements.
 */
public class DisplayUtils {
    
    // ANSI Color codes
    public static final String RESET = "\033[0m";
    public static final String RED = "\033[31m";
    public static final String GREEN = "\033[32m";
    public static final String YELLOW = "\033[33m";
    public static final String BLUE = "\033[34m";
    public static final String PURPLE = "\033[35m";
    public static final String CYAN = "\033[36m";
    public static final String WHITE = "\033[37m";
    public static final String BOLD = "\033[1m";
    
    // Box drawing characters
    private static final String HEADER_LINE = "═".repeat(80);
    private static final String SUB_HEADER_LINE = "─".repeat(80);
    private static final String MENU_BORDER_TOP = "╔" + "═".repeat(78) + "╗";
    private static final String MENU_BORDER_BOTTOM = "╚" + "═".repeat(78) + "╝";
    private static final String MENU_BORDER_SIDE = "║";
    
    /**
     * Print a professional header with ASCII art border
     * 
     * @param title the header title
     */
    public static void printHeader(String title) {
        System.out.println();
        System.out.println(MENU_BORDER_TOP);
        System.out.printf("║%s%s%s║%n", 
            " ".repeat((78 - title.length()) / 2),
            BOLD + title.toUpperCase() + RESET,
            " ".repeat((78 - title.length()) / 2 + (78 - title.length()) % 2));
        System.out.println(MENU_BORDER_BOTTOM);
        System.out.println();
    }
    
    /**
     * Print a simple header with double line
     * 
     * @param title the header title
     */
    public static void printSimpleHeader(String title) {
        System.out.println();
        System.out.println(HEADER_LINE);
        System.out.printf("📊 %s%s%s%n", BOLD, title.toUpperCase(), RESET);
        System.out.println(HEADER_LINE);
        System.out.println();
    }
    
    /**
     * Print a sub-header with single line
     * 
     * @param title the sub-header title
     */
    public static void printSubHeader(String title) {
        System.out.println();
        System.out.printf("🔹 %s%s%s%n", BOLD, title, RESET);
        System.out.println(SUB_HEADER_LINE);
    }
    
    /**
     * Print menu options in a formatted list
     * 
     * @param options the list of menu options
     */
    public static void printMenu(List<MenuOption> options) {
        for (MenuOption option : options) {
            System.out.println(option.getFormattedDisplay());
        }
    }
    
    /**
     * Print an error message in red
     * 
     * @param message the error message
     */
    public static void printError(String message) {
        System.out.printf("%s❌ %s%s%n", RED, message, RESET);
    }
    
    /**
     * Print a success message in green
     * 
     * @param message the success message
     */
    public static void printSuccess(String message) {
        System.out.printf("%s✅ %s%s%n", GREEN, message, RESET);
    }
    
    /**
     * Print an info message in blue
     * 
     * @param message the info message
     */
    public static void printInfo(String message) {
        System.out.printf("%sℹ️  %s%s%n", BLUE, message, RESET);
    }
    
    /**
     * Print a warning message in yellow
     * 
     * @param message the warning message
     */
    public static void printWarning(String message) {
        System.out.printf("%s⚠️  %s%s%n", YELLOW, message, RESET);
    }
    
    /**
     * Print a loading message
     * 
     * @param message the loading message
     */
    public static void printLoading(String message) {
        System.out.printf("%s🔄 %s...%s%n", CYAN, message, RESET);
    }
    
    /**
     * Clear the console screen
     */
    public static void clearScreen() {
        System.out.print("\033[2J\033[H");
        System.out.flush();
    }
    
    /**
     * Wait for user to press Enter
     */
    public static void waitForEnter() {
        System.out.print("\nPress Enter to continue...");
        try {
            System.in.read();
        } catch (Exception e) {
            // Ignore
        }
    }
    
    /**
     * Print a separator line
     */
    public static void printSeparator() {
        System.out.println(SUB_HEADER_LINE);
    }
    
    /**
     * Print a thick separator line
     */
    public static void printThickSeparator() {
        System.out.println(HEADER_LINE);
    }
    
    /**
     * Print centered text within a given width
     * 
     * @param text the text to center
     * @param width the total width
     */
    public static void printCentered(String text, int width) {
        int padding = (width - text.length()) / 2;
        System.out.printf("%s%s%s%n", 
            " ".repeat(Math.max(0, padding)),
            text,
            " ".repeat(Math.max(0, width - text.length() - padding)));
    }
    
    /**
     * Create a formatted table row
     * 
     * @param columns the column values
     * @param widths the column widths
     * @return formatted table row
     */
    public static String formatTableRow(String[] columns, int[] widths) {
        StringBuilder sb = new StringBuilder("│");
        
        for (int i = 0; i < columns.length && i < widths.length; i++) {
            String column = columns[i] != null ? columns[i] : "";
            if (column.length() > widths[i] - 2) {
                column = column.substring(0, widths[i] - 5) + "...";
            }
            sb.append(String.format(" %-" + (widths[i] - 2) + "s │", column));
        }
        
        return sb.toString();
    }
    
    /**
     * Print a simple progress bar
     * 
     * @param current the current progress
     * @param total the total items
     * @param message optional message
     */
    public static void printProgress(int current, int total, String message) {
        int percentage = (int) ((double) current / total * 100);
        int barLength = 30;
        int filledLength = (int) ((double) current / total * barLength);
        
        StringBuilder bar = new StringBuilder("[");
        for (int i = 0; i < barLength; i++) {
            if (i < filledLength) {
                bar.append("█");
            } else {
                bar.append("░");
            }
        }
        bar.append("]");
        
        System.out.printf("\r%s %d%% (%d/%d)%s%s", 
            bar, percentage, current, total,
            message != null ? " - " + message : "",
            current == total ? "\n" : "");
    }
} 