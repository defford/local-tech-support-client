package com.localtechsupport.cli;

import com.localtechsupport.cli.command.ClientTicketsCommand;
import com.localtechsupport.cli.command.OverdueTicketsCommand;
import com.localtechsupport.cli.command.TechnicianWorkloadCommand;
import com.localtechsupport.cli.command.AvailableTechniciansCommand;
import com.localtechsupport.cli.command.TechnicianScheduleCommand;
import com.localtechsupport.cli.command.ClientAppointmentsCommand;
import com.localtechsupport.cli.command.ClientTechnicianHistoryCommand;
import com.localtechsupport.cli.command.TechnicianFeedbackCommand;
import com.localtechsupport.cli.command.InteractiveMenuCommand;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.Callable;

/**
 * Main CLI Application for Local Tech Support System
 * 
 * This application provides command-line access to key system metrics
 * and reporting capabilities from the Local Tech Support Server API.
 * 
 * All commands correspond to actual endpoints available on the Spring Boot server.
 */
@Command(
    name = "tech-support-cli",
    description = "Local Tech Support System CLI Client - Access key system metrics and reports",
    version = "1.0",
    subcommands = {
        ClientTicketsCommand.class,
        OverdueTicketsCommand.class,
        TechnicianWorkloadCommand.class,
        AvailableTechniciansCommand.class,
        TechnicianScheduleCommand.class,
        ClientAppointmentsCommand.class,
        ClientTechnicianHistoryCommand.class,
        TechnicianFeedbackCommand.class,
        InteractiveMenuCommand.class,
        CommandLine.HelpCommand.class
    },
    mixinStandardHelpOptions = true
)
public class CliApplication implements Callable<Integer> {

    private static final Logger logger = LoggerFactory.getLogger(CliApplication.class);

    @Option(
        names = {"-s", "--server"},
        description = "API server URL (default: http://localhost:8080)",
        defaultValue = "http://localhost:8080"
    )
    private String serverUrl;

    @Option(
        names = {"-v", "--verbose"},
        description = "Enable verbose output for debugging"
    )
    private boolean verbose;

    @Option(
        names = {"-f", "--format"},
        description = "Output format: json, table (default: json)",
        defaultValue = "json"
    )
    private String outputFormat;

    public static void main(String[] args) {
        try {
            int exitCode = new CommandLine(new CliApplication()).execute(args);
            System.exit(exitCode);
        } catch (Exception e) {
            System.err.println("Fatal error: " + e.getMessage());
            if (Boolean.getBoolean("debug")) {
                e.printStackTrace();
            }
            System.exit(1);
        }
    }

    @Override
    public Integer call() {
        System.out.println("🖥️  Local Tech Support CLI v1.0");
        System.out.println("=====================================");
        System.out.println();
        System.out.println("🎯 INTERACTIVE MODE (Recommended):");
        System.out.println("  interactive, menu, i              - Launch full interactive menu system");
        System.out.println();
        System.out.println("📋 DIRECT COMMANDS (8 core business questions):");
        System.out.println("  client-tickets                    - What tickets does each client have?");
        System.out.println("  overdue-tickets                   - What tickets are currently overdue?");
        System.out.println("  technician-workload               - What tickets are assigned to each technician?");
        System.out.println("  available-technicians             - What technicians are available for each service type?");
        System.out.println("  technician-schedule               - What appointments does each technician have?");
        System.out.println("  client-appointments               - What appointments has each client scheduled?");
        System.out.println("  client-technician-history         - What clients have used which technicians?");
        System.out.println("  technician-feedback               - What feedback ratings has each technician received?");
        System.out.println();
        System.out.println("💡 TIP: Use 'tech-support-cli interactive' for the full menu experience!");
        System.out.println("Use 'tech-support-cli <command> --help' for detailed command usage.");
        System.out.println("Use 'tech-support-cli --help' for global options.");
        System.out.println();
        System.out.println("Server: " + serverUrl);
        System.out.println("Format: " + outputFormat);
        
        return 0;
    }

    // Getters for subcommands to access parent options
    public String getServerUrl() {
        return serverUrl;
    }

    public boolean isVerbose() {
        return verbose;
    }

    public String getOutputFormat() {
        return outputFormat;
    }
} 