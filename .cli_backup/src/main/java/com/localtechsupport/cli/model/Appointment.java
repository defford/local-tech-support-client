package com.localtechsupport.cli.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

/**
 * Appointment entity from the API
 * 
 * Represents a scheduled appointment in the system
 */
public class Appointment {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("ticketId")
    private Long ticketId;

    @JsonProperty("technicianId")
    private Long technicianId;

    @JsonProperty("startTime")
    private LocalDateTime scheduledStartTime;

    @JsonProperty("endTime")
    private LocalDateTime scheduledEndTime;

    @JsonProperty("status")
    private String status; // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW

    @JsonProperty("notes")
    private String notes;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    // Navigation properties (may be included in responses)
    @JsonProperty("ticket")
    private Ticket ticket;

    @JsonProperty("technician")
    private Technician technician;

    // Default constructor
    public Appointment() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTicketId() {
        // If ticketId is null but we have an embedded ticket object, extract the ID
        if (ticketId == null && ticket != null) {
            return ticket.getId();
        }
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Long getTechnicianId() {
        // If technicianId is null but we have an embedded technician object, extract the ID
        if (technicianId == null && technician != null) {
            return technician.getId();
        }
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public LocalDateTime getScheduledStartTime() {
        return scheduledStartTime;
    }

    public void setScheduledStartTime(LocalDateTime scheduledStartTime) {
        this.scheduledStartTime = scheduledStartTime;
    }

    public LocalDateTime getScheduledEndTime() {
        return scheduledEndTime;
    }

    public void setScheduledEndTime(LocalDateTime scheduledEndTime) {
        this.scheduledEndTime = scheduledEndTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public Technician getTechnician() {
        return technician;
    }

    public void setTechnician(Technician technician) {
        this.technician = technician;
    }

    // Utility methods
    public boolean isUpcoming() {
        return LocalDateTime.now().isBefore(scheduledStartTime);
    }

    public boolean isInProgress() {
        return "IN_PROGRESS".equals(status);
    }

    public boolean isCompleted() {
        return "COMPLETED".equals(status);
    }

    public boolean isCancelled() {
        return "CANCELLED".equals(status) || "NO_SHOW".equals(status);
    }

    @Override
    public String toString() {
        return String.format("Appointment{id=%d, ticketId=%d, technicianId=%d, scheduledStartTime=%s, status='%s'}", 
                           id, ticketId, technicianId, scheduledStartTime, status);
    }
} 