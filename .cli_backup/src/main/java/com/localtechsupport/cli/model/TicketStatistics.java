package com.localtechsupport.cli.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/**
 * Data Transfer Object for ticket statistics from the API
 * 
 * Represents the response from GET /api/tickets/statistics
 */
public class TicketStatistics {

    @JsonProperty("totalTickets")
    private Long totalTickets;

    @JsonProperty("openTickets")
    private Long openTickets;

    @JsonProperty("inProgressTickets")
    private Long inProgressTickets;

    @JsonProperty("resolvedTickets")
    private Long resolvedTickets;

    @JsonProperty("closedTickets")
    private Long closedTickets;

    @JsonProperty("averageResolutionTimeHours")
    private Double averageResolutionTimeHours;

    @JsonProperty("ticketsResolvedToday")
    private Long ticketsResolvedToday;

    @JsonProperty("ticketsByPriority")
    private Map<String, Long> ticketsByPriority;

    @JsonProperty("ticketsByStatus")
    private Map<String, Long> ticketsByStatus;

    @JsonProperty("ticketsByServiceType")
    private Map<String, Long> ticketsByServiceType;

    // Default constructor
    public TicketStatistics() {}

    // Getters and Setters

    public Long getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(Long totalTickets) {
        this.totalTickets = totalTickets;
    }

    public Long getOpenTickets() {
        return openTickets;
    }

    public void setOpenTickets(Long openTickets) {
        this.openTickets = openTickets;
    }

    public Long getInProgressTickets() {
        return inProgressTickets;
    }

    public void setInProgressTickets(Long inProgressTickets) {
        this.inProgressTickets = inProgressTickets;
    }

    public Long getResolvedTickets() {
        return resolvedTickets;
    }

    public void setResolvedTickets(Long resolvedTickets) {
        this.resolvedTickets = resolvedTickets;
    }

    public Long getClosedTickets() {
        return closedTickets;
    }

    public void setClosedTickets(Long closedTickets) {
        this.closedTickets = closedTickets;
    }

    public Double getAverageResolutionTimeHours() {
        return averageResolutionTimeHours;
    }

    public void setAverageResolutionTimeHours(Double averageResolutionTimeHours) {
        this.averageResolutionTimeHours = averageResolutionTimeHours;
    }

    public Long getTicketsResolvedToday() {
        return ticketsResolvedToday;
    }

    public void setTicketsResolvedToday(Long ticketsResolvedToday) {
        this.ticketsResolvedToday = ticketsResolvedToday;
    }

    public Map<String, Long> getTicketsByPriority() {
        return ticketsByPriority;
    }

    public void setTicketsByPriority(Map<String, Long> ticketsByPriority) {
        this.ticketsByPriority = ticketsByPriority;
    }

    public Map<String, Long> getTicketsByStatus() {
        return ticketsByStatus;
    }

    public void setTicketsByStatus(Map<String, Long> ticketsByStatus) {
        this.ticketsByStatus = ticketsByStatus;
    }

    public Map<String, Long> getTicketsByServiceType() {
        return ticketsByServiceType;
    }

    public void setTicketsByServiceType(Map<String, Long> ticketsByServiceType) {
        this.ticketsByServiceType = ticketsByServiceType;
    }

    // Utility methods

    /**
     * Calculate the current system load based on open vs total tickets
     * 
     * @return system load level as a string
     */
    public String getSystemLoadLevel() {
        if (totalTickets == null || totalTickets == 0) {
            return "NONE";
        }
        
        double loadRatio = (double) (openTickets != null ? openTickets : 0) / totalTickets;
        
        if (loadRatio < 0.3) {
            return "LOW";
        } else if (loadRatio < 0.6) {
            return "MEDIUM";
        } else {
            return "HIGH";
        }
    }

    /**
     * Get the percentage of tickets that are open
     * 
     * @return percentage as a double, or 0.0 if no tickets
     */
    public double getOpenTicketPercentage() {
        if (totalTickets == null || totalTickets == 0) {
            return 0.0;
        }
        return ((double) (openTickets != null ? openTickets : 0) / totalTickets) * 100;
    }

    /**
     * Get the percentage of tickets that are resolved
     * 
     * @return percentage as a double, or 0.0 if no tickets
     */
    public double getResolvedTicketPercentage() {
        if (totalTickets == null || totalTickets == 0) {
            return 0.0;
        }
        return ((double) (resolvedTickets != null ? resolvedTickets : 0) / totalTickets) * 100;
    }

    @Override
    public String toString() {
        return String.format(
            "TicketStatistics{totalTickets=%d, openTickets=%d, resolvedTickets=%d, avgResolutionTime=%.1fh}",
            totalTickets, openTickets, resolvedTickets, averageResolutionTimeHours
        );
    }
} 