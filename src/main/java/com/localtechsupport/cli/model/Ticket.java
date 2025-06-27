package com.localtechsupport.cli.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

/**
 * Ticket entity from the API
 * 
 * Represents a support ticket in the system
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Ticket {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("serviceType")
    private String serviceType; // HARDWARE, SOFTWARE, NETWORK, etc.

    @JsonProperty("status")
    private String status; // OPEN, CLOSED

    @JsonProperty("priority")
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    @JsonProperty("clientId")
    private Long clientId;

    @JsonProperty("clientName")
    private String clientName;

    @JsonProperty("clientEmail")
    private String clientEmail;

    @JsonProperty("assignedTechnicianId")
    private Long assignedTechnicianId;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @JsonProperty("dueAt")
    private LocalDateTime dueAt;

    @JsonProperty("resolvedAt")
    private LocalDateTime resolvedAt;

    @JsonProperty("overdue")
    private Boolean overdue;

    @JsonProperty("assigned")
    private Boolean assigned;

    // Navigation properties (may be included in responses)
    @JsonProperty("client")
    private Client client;

    @JsonProperty("assignedTechnician")
    private Technician assignedTechnician;

    // Default constructor
    public Ticket() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public Long getAssignedTechnicianId() {
        return assignedTechnicianId;
    }

    public void setAssignedTechnicianId(Long assignedTechnicianId) {
        this.assignedTechnicianId = assignedTechnicianId;
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

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public void setDueAt(LocalDateTime dueAt) {
        this.dueAt = dueAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public Boolean getOverdue() {
        return overdue;
    }

    public void setOverdue(Boolean overdue) {
        this.overdue = overdue;
    }

    public Boolean getAssigned() {
        return assigned;
    }

    public void setAssigned(Boolean assigned) {
        this.assigned = assigned;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Technician getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(Technician assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    // Utility methods
    @JsonIgnore
    public boolean isOpen() {
        return "OPEN".equalsIgnoreCase(status);
    }

    @JsonIgnore
    public boolean isClosed() {
        return "CLOSED".equals(status);
    }

    @JsonIgnore
    public boolean isOverdue() {
        // Use the overdue field from JSON if available
        if (overdue != null) {
            return overdue;
        }
        
        // Fallback to computing based on status and due date
        return isOpen() && dueAt != null && dueAt.isBefore(java.time.LocalDateTime.now());
    }

    @JsonIgnore
    public boolean isAssigned() {
        // Use the assigned field from JSON if available
        if (assigned != null) {
            return assigned;
        }
        
        // Fallback to checking technician assignment
        return assignedTechnician != null || assignedTechnicianId != null;
    }

    @JsonIgnore
    public String getFormattedDueDate() {
        if (dueAt == null) return "N/A";
        java.time.format.DateTimeFormatter formatter = 
            java.time.format.DateTimeFormatter.ofPattern("MMM dd, HH:mm");
        return dueAt.format(formatter);
    }

    @JsonIgnore
    public String getPriorityIndicator() {
        if (isOverdue()) return "🔴 OVERDUE";
        if (isOpen() && !isAssigned()) return "🟡 UNASSIGNED";
        if (isOpen()) return "🟢 ACTIVE";
        return "✅ CLOSED";
    }

    @Override
    public String toString() {
        return String.format("Ticket{id=%d, description='%s', status=%s, serviceType=%s}", 
                           id, description, status, serviceType);
    }
} 