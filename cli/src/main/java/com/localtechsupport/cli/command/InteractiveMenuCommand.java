package com.localtechsupport.cli.command;

import com.localtechsupport.cli.CliApplication;
import com.localtechsupport.cli.menu.MenuManager;
import com.localtechsupport.cli.service.ApiService;
import picocli.CommandLine.Command;
import picocli.CommandLine.ParentCommand;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.Callable;

/**
 * Interactive menu command for the Tech Support CLI.
 * 
 * This command launches the menu-driven interface while maintaining
 * full compatibility with the existing PicoCLI command structure.
 * 
 * Usage: tech-support-cli interactive
 */
@Command(
    name = "interactive",
    aliases = {"menu", "i"},
    description = "Launch interactive menu-driven interface for full system access",
    mixinStandardHelpOptions = true
)
public class InteractiveMenuCommand implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(InteractiveMenuCommand.class);

    @ParentCommand
    private CliApplication parent;

    @Override
    public Integer call() {
        logger.info("Launching interactive menu system");
        
        try {
            // Get configuration from parent
            String serverUrl = parent.getServerUrl();
            boolean verbose = parent.isVerbose();
            
            if (verbose) {
                System.out.println("🚀 Launching interactive menu system...");
                System.out.println("🔍 Server: " + serverUrl);
            }

            // Create API service with the configured server URL
            try (ApiService apiService = new ApiService(serverUrl)) {
                
                // Create and start menu manager
                MenuManager menuManager = new MenuManager(apiService);
                int exitCode = menuManager.start();
                
                logger.info("Interactive menu system exited with code: {}", exitCode);
                return exitCode;
                
            } catch (Exception e) {
                logger.error("Error in interactive menu system: {}", e.getMessage(), e);
                System.err.println("❌ Error in menu system: " + e.getMessage());
                
                if (verbose) {
                    e.printStackTrace();
                }
                
                return 1;
            }

        } catch (Exception e) {
            logger.error("Fatal error launching interactive menu: {}", e.getMessage(), e);
            System.err.println("❌ Fatal error: " + e.getMessage());
            
            if (parent.isVerbose()) {
                e.printStackTrace();
            }
            
            return 1;
        }
    }
} 