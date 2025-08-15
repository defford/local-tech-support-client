package com.localtechsupport.cli.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/**
 * Data Transfer Object for technician statistics from the API
 * 
 * Represents the response from GET /api/technicians/statistics
 */
public class TechnicianStatistics {

    @JsonProperty("totalTechnicians")
    private Long totalTechnicians;

    @JsonProperty("activeTechnicians")
    private Long activeTechnicians;

    @JsonProperty("inactiveTechnicians")
    private Long inactiveTechnicians;

    @JsonProperty("terminatedTechnicians")
    private Long terminatedTechnicians;

    @JsonProperty("averageWorkload")
    private Double averageWorkload;

    @JsonProperty("utilizationRate")
    private Double utilizationRate;

    @JsonProperty("topPerformerName")
    private String topPerformerName;

    @JsonProperty("topPerformerTicketCount")
    private Long topPerformerTicketCount;

    @JsonProperty("techniciansByStatus")
    private Map<String, Long> techniciansByStatus;

    @JsonProperty("workloadDistribution")
    private Map<String, Long> workloadDistribution;

    @JsonProperty("skillCoverageOverall")
    private Double skillCoverageOverall;

    // Default constructor
    public TechnicianStatistics() {}

    // Getters and Setters

    public Long getTotalTechnicians() {
        return totalTechnicians;
    }

    public void setTotalTechnicians(Long totalTechnicians) {
        this.totalTechnicians = totalTechnicians;
    }

    public Long getActiveTechnicians() {
        return activeTechnicians;
    }

    public void setActiveTechnicians(Long activeTechnicians) {
        this.activeTechnicians = activeTechnicians;
    }

    public Long getInactiveTechnicians() {
        return inactiveTechnicians;
    }

    public void setInactiveTechnicians(Long inactiveTechnicians) {
        this.inactiveTechnicians = inactiveTechnicians;
    }

    public Long getTerminatedTechnicians() {
        return terminatedTechnicians;
    }

    public void setTerminatedTechnicians(Long terminatedTechnicians) {
        this.terminatedTechnicians = terminatedTechnicians;
    }

    public Double getAverageWorkload() {
        return averageWorkload;
    }

    public void setAverageWorkload(Double averageWorkload) {
        this.averageWorkload = averageWorkload;
    }

    public Double getUtilizationRate() {
        return utilizationRate;
    }

    public void setUtilizationRate(Double utilizationRate) {
        this.utilizationRate = utilizationRate;
    }

    public String getTopPerformerName() {
        return topPerformerName;
    }

    public void setTopPerformerName(String topPerformerName) {
        this.topPerformerName = topPerformerName;
    }

    public Long getTopPerformerTicketCount() {
        return topPerformerTicketCount;
    }

    public void setTopPerformerTicketCount(Long topPerformerTicketCount) {
        this.topPerformerTicketCount = topPerformerTicketCount;
    }

    public Map<String, Long> getTechniciansByStatus() {
        return techniciansByStatus;
    }

    public void setTechniciansByStatus(Map<String, Long> techniciansByStatus) {
        this.techniciansByStatus = techniciansByStatus;
    }

    public Map<String, Long> getWorkloadDistribution() {
        return workloadDistribution;
    }

    public void setWorkloadDistribution(Map<String, Long> workloadDistribution) {
        this.workloadDistribution = workloadDistribution;
    }

    public Double getSkillCoverageOverall() {
        return skillCoverageOverall;
    }

    public void setSkillCoverageOverall(Double skillCoverageOverall) {
        this.skillCoverageOverall = skillCoverageOverall;
    }

    // Utility methods

    /**
     * Get the percentage of technicians that are active
     * 
     * @return percentage as a double, or 0.0 if no technicians
     */
    public double getActivePercentage() {
        if (totalTechnicians == null || totalTechnicians == 0) {
            return 0.0;
        }
        return ((double) (activeTechnicians != null ? activeTechnicians : 0) / totalTechnicians) * 100;
    }

    /**
     * Get workforce status level based on active technician ratio
     * 
     * @return workforce status as a string
     */
    public String getWorkforceStatus() {
        double activeRatio = getActivePercentage() / 100.0;
        
        if (activeRatio >= 0.9) {
            return "EXCELLENT";
        } else if (activeRatio >= 0.8) {
            return "GOOD";
        } else if (activeRatio >= 0.7) {
            return "FAIR";
        } else {
            return "NEEDS_ATTENTION";
        }
    }

    /**
     * Get utilization level based on utilization rate
     * 
     * @return utilization level as a string
     */
    public String getUtilizationLevel() {
        if (utilizationRate == null) {
            return "UNKNOWN";
        }
        
        if (utilizationRate >= 0.9) {
            return "HIGH";
        } else if (utilizationRate >= 0.7) {
            return "OPTIMAL";
        } else if (utilizationRate >= 0.5) {
            return "MODERATE";
        } else {
            return "LOW";
        }
    }

    @Override
    public String toString() {
        return String.format(
            "TechnicianStatistics{totalTechnicians=%d, activeTechnicians=%d, avgWorkload=%.1f, utilization=%.1f%%}",
            totalTechnicians, activeTechnicians, averageWorkload, utilizationRate * 100
        );
    }
} 