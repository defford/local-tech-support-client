package com.localtechsupport.cli.formatter;

import com.localtechsupport.cli.model.Client;
import com.localtechsupport.cli.model.Ticket;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Professional formatter for client tickets output
 * 
 * Provides formatted table output, summary statistics, and alerts
 * instead of raw JSON dumps for better CLI user experience.
 */
public class ClientTicketsFormatter {
    
    private static final String HEADER_LINE = "═".repeat(80);
    private static final String SUB_HEADER_LINE = "─".repeat(80);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, HH:mm");
    
    /**
     * Display comprehensive client tickets report
     */
    public void displayClientTicketsReport(Map<Client, List<Ticket>> clientTickets, String serverUrl) {
        printHeader(serverUrl);
        printSummaryStatistics(clientTickets);
        printDetailedClientTicketsTable(clientTickets);
        printOverdueTicketsAlert(clientTickets);
        printFooter();
    }
    
    /**
     * Print report header with server info
     */
    private void printHeader(String serverUrl) {
        System.out.println(HEADER_LINE);
        System.out.println("📊 CLIENT TICKETS REPORT");
        System.out.println(HEADER_LINE);
        System.out.println("Server: " + serverUrl);
        System.out.println("Timestamp: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        System.out.println();
    }
    
    /**
     * Print comprehensive summary statistics
     */
    private void printSummaryStatistics(Map<Client, List<Ticket>> clientTickets) {
        // Calculate statistics
        long totalClients = clientTickets.size();
        long activeClients = clientTickets.keySet().stream()
            .filter(Client::isActive).count();
        long totalTickets = clientTickets.values().stream().mapToLong(List::size).sum();
        long openTickets = clientTickets.values().stream()
            .flatMap(List::stream)
            .filter(Ticket::isOpen)
            .count();
        long overdueTickets = clientTickets.values().stream()
            .flatMap(List::stream)
            .filter(Ticket::isOverdue)
            .count();
        long unassignedTickets = clientTickets.values().stream()
            .flatMap(List::stream)
            .filter(t -> !t.isAssigned())
            .count();
        
        System.out.println("📊 CLIENT TICKETS SUMMARY");
        System.out.println(HEADER_LINE);
        System.out.printf("👥 Clients: %d total (%d active, %d inactive)%n", 
            totalClients, activeClients, totalClients - activeClients);
        System.out.printf("🎫 Tickets: %d total (%d open, %d closed)%n", 
            totalTickets, openTickets, totalTickets - openTickets);
        System.out.printf("⚠️  Critical: %d overdue, %d unassigned%n", 
            overdueTickets, unassignedTickets);
        System.out.println();
    }
    
    /**
     * Print detailed client tickets table
     */
    private void printDetailedClientTicketsTable(Map<Client, List<Ticket>> clientTickets) {
        System.out.println("┌─────────────────────┬──────────────────────────┬─────────┬──────────┬─────────────┐");
        System.out.println("│ Client              │ Ticket Description       │ Status  │ Service  │ Technician  │");
        System.out.println("├─────────────────────┼──────────────────────────┼─────────┼──────────┼─────────────┤");
        
        for (Map.Entry<Client, List<Ticket>> entry : clientTickets.entrySet()) {
            Client client = entry.getKey();
            List<Ticket> tickets = entry.getValue();
            
            if (tickets.isEmpty()) {
                // Show clients with no tickets
                String clientName = truncate(client.getFullName(), 19);
                System.out.printf("│ %-19s │ %-24s │ %-7s │ %-8s │ %-11s │%n", 
                    clientName, "No tickets found", "N/A", "N/A", "N/A");
            } else {
                for (int i = 0; i < tickets.size(); i++) {
                    Ticket ticket = tickets.get(i);
                    String clientName = (i == 0) ? truncate(client.getFullName(), 19) : "";
                    String description = truncate(ticket.getDescription(), 24);
                    String status = formatStatus(ticket);
                    String serviceType = truncate(ticket.getServiceType(), 8);
                    String technician = formatTechnician(ticket);
                    
                    System.out.printf("│ %-19s │ %-24s │ %-7s │ %-8s │ %-11s │%n", 
                        clientName, description, status, serviceType, technician);
                }
            }
            
            System.out.println("├─────────────────────┼──────────────────────────┼─────────┼──────────┼─────────────┤");
        }
        
        System.out.println("└─────────────────────┴──────────────────────────┴─────────┴──────────┴─────────────┘");
        System.out.println();
    }
    
    /**
     * Print overdue tickets alert section
     */
    private void printOverdueTicketsAlert(Map<Client, List<Ticket>> clientTickets) {
        List<OverdueTicketInfo> overdueTickets = clientTickets.entrySet().stream()
            .flatMap(entry -> entry.getValue().stream()
                .filter(Ticket::isOverdue)
                .map(ticket -> new OverdueTicketInfo(entry.getKey(), ticket)))
            .collect(Collectors.toList());
            
        if (!overdueTickets.isEmpty()) {
            System.out.println("🚨 URGENT: OVERDUE TICKETS REQUIRING IMMEDIATE ATTENTION");
            System.out.println(HEADER_LINE);
            
            for (OverdueTicketInfo info : overdueTickets) {
                String dueDate = info.ticket.getDueAt() != null ? 
                    info.ticket.getDueAt().format(TIME_FORMATTER) : "No due date";
                System.out.printf("⚠️  Ticket #%d - %s (%s) - Due: %s%n", 
                    info.ticket.getId(),
                    info.client.getFullName(),
                    info.ticket.getServiceType(),
                    dueDate);
            }
            System.out.println();
        }
    }
    
    /**
     * Print report footer
     */
    private void printFooter() {
        System.out.println(HEADER_LINE);
        System.out.println("Report completed successfully");
    }
    
    /**
     * Truncate text to specified length with ellipsis
     */
    private String truncate(String text, int maxLength) {
        if (text == null || text.trim().isEmpty()) return "N/A";
        text = text.trim();
        return text.length() > maxLength ? 
            text.substring(0, maxLength - 3) + "..." : text;
    }
    
    /**
     * Format ticket status with priority indicators
     */
    private String formatStatus(Ticket ticket) {
        if (ticket.isOverdue()) return "OVERDUE";
        if (ticket.isOpen() && !ticket.isAssigned()) return "OPEN*";
        return ticket.getStatus();
    }
    
    /**
     * Format technician assignment
     */
    private String formatTechnician(Ticket ticket) {
        if (!ticket.isAssigned()) {
            return "Unassigned";
        }
        
        if (ticket.getAssignedTechnician() != null) {
            String fullName = ticket.getAssignedTechnician().getFullName();
            return truncate(getShortName(fullName), 11);
        }
        
        return "ID:" + ticket.getAssignedTechnicianId();
    }
    
    /**
     * Convert full name to short format (e.g., "John Smith" -> "John S.")
     */
    private String getShortName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) return "Unknown";
        
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0];
        } else if (parts.length >= 2) {
            return parts[0] + " " + parts[1].charAt(0) + ".";
        }
        return fullName;
    }
    
    /**
     * Helper class for overdue ticket information
     */
    private static class OverdueTicketInfo {
        final Client client;
        final Ticket ticket;
        
        OverdueTicketInfo(Client client, Ticket ticket) {
            this.client = client;
            this.ticket = ticket;
        }
    }
} 