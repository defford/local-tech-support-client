package com.localtechsupport.cli.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Technician entity from the API
 * 
 * Represents a technician in the tech support system
 */
public class Technician {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("firstName")
    private String firstName;

    @JsonProperty("lastName")
    private String lastName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("status")
    private String status; // ACTIVE, ON_VACATION, SICK_LEAVE, TERMINATED

    @JsonProperty("skills")
    private List<String> skills; // List of service types they can handle

    @JsonProperty("fullName")
    private String fullName;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    // Additional fields from server
    @JsonProperty("currentWorkload")
    private Integer currentWorkload;

    @JsonProperty("available")
    private Boolean available;

    // Default constructor
    public Technician() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public Integer getCurrentWorkload() {
        return currentWorkload;
    }

    public void setCurrentWorkload(Integer currentWorkload) {
        this.currentWorkload = currentWorkload;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    // Constructor with all parameters
    public Technician(Long id, String firstName, String lastName, String email, String phone, 
                      String status, List<String> skills, String fullName, LocalDateTime createdAt, 
                      LocalDateTime updatedAt, Integer currentWorkload, Boolean available) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.status = status;
        this.skills = skills;
        this.fullName = fullName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.currentWorkload = currentWorkload;
        this.available = available;
    }

    // Utility methods
    public boolean isActive() {
        return status != null && "ACTIVE".equalsIgnoreCase(status);
    }

    public boolean hasSkill(String serviceType) {
        if (skills == null || serviceType == null || serviceType.trim().isEmpty()) {
            return false;
        }
        String trimmedServiceType = serviceType.trim();
        return skills.stream().anyMatch(skill -> skill != null && skill.trim().equalsIgnoreCase(trimmedServiceType));
    }

    public boolean isAvailableForServiceType(String serviceType) {
        return isActive() && hasSkill(serviceType);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Technician technician = (Technician) obj;
        
        if (id != null ? !id.equals(technician.id) : technician.id != null) return false;
        if (firstName != null ? !firstName.equals(technician.firstName) : technician.firstName != null) return false;
        if (lastName != null ? !lastName.equals(technician.lastName) : technician.lastName != null) return false;
        return email != null ? email.equals(technician.email) : technician.email == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (firstName != null ? firstName.hashCode() : 0);
        result = 31 * result + (lastName != null ? lastName.hashCode() : 0);
        result = 31 * result + (email != null ? email.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return String.format("Technician{id=%d, fullName='%s', email='%s'}", 
                           id, fullName, email);
    }
    
    // Helper methods for formatting and display
    
    /**
     * Get short name for table display (e.g., "John Smith" -> "John S.")
     */
    public String getShortName() {
        if (fullName == null || fullName.trim().isEmpty()) return "Unknown";
        
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0];
        } else if (parts.length >= 2) {
            return parts[0] + " " + parts[1].charAt(0) + ".";
        }
        return fullName;
    }
} 