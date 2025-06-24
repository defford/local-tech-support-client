package com.localtechsupport.cli;

import com.localtechsupport.cli.command.SystemHealthCommand;
import com.localtechsupport.cli.command.TechnicianStatsCommand;
import com.localtechsupport.cli.command.FeedbackStatsCommand;
import com.localtechsupport.cli.command.SkillCoverageCommand;
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
 */
@Command(
    name = "tech-support-cli",
    description = "Local Tech Support System CLI Client - Access key system metrics and reports",
    version = "1.0",
    subcommands = {
        SystemHealthCommand.class,
        TechnicianStatsCommand.class,
        FeedbackStatsCommand.class,
        SkillCoverageCommand.class,
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
        System.out.println("Available commands:");
        System.out.println("  system-health    - Display system health and ticket statistics");
        System.out.println("  technician-stats - Show technician performance analytics");
        System.out.println("  feedback-stats   - View customer satisfaction metrics");
        System.out.println("  skill-coverage   - Analyze skill coverage and gaps");
        System.out.println();
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