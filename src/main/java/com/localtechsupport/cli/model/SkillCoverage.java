package com.localtechsupport.cli.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object for skill coverage analysis from the API
 * 
 * Represents the response from GET /api/skills/coverage
 */
public class SkillCoverage {

    @JsonProperty("totalSkills")
    private Integer totalSkills;

    @JsonProperty("skillsByServiceType")
    private Map<String, SkillInfo> skillsByServiceType;

    @JsonProperty("overallCoveragePercentage")
    private Double overallCoveragePercentage;

    @JsonProperty("criticalGaps")
    private List<String> criticalGaps;

    @JsonProperty("recommendations")
    private List<String> recommendations;

    @JsonProperty("redundantSkills")
    private List<String> redundantSkills;

    @JsonProperty("trainingNeeds")
    private Map<String, Integer> trainingNeeds;

    // Default constructor
    public SkillCoverage() {}

    // Getters and Setters

    public Integer getTotalSkills() {
        return totalSkills;
    }

    public void setTotalSkills(Integer totalSkills) {
        this.totalSkills = totalSkills;
    }

    public Map<String, SkillInfo> getSkillsByServiceType() {
        return skillsByServiceType;
    }

    public void setSkillsByServiceType(Map<String, SkillInfo> skillsByServiceType) {
        this.skillsByServiceType = skillsByServiceType;
    }

    public Double getOverallCoveragePercentage() {
        return overallCoveragePercentage;
    }

    public void setOverallCoveragePercentage(Double overallCoveragePercentage) {
        this.overallCoveragePercentage = overallCoveragePercentage;
    }

    public List<String> getCriticalGaps() {
        return criticalGaps;
    }

    public void setCriticalGaps(List<String> criticalGaps) {
        this.criticalGaps = criticalGaps;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public List<String> getRedundantSkills() {
        return redundantSkills;
    }

    public void setRedundantSkills(List<String> redundantSkills) {
        this.redundantSkills = redundantSkills;
    }

    public Map<String, Integer> getTrainingNeeds() {
        return trainingNeeds;
    }

    public void setTrainingNeeds(Map<String, Integer> trainingNeeds) {
        this.trainingNeeds = trainingNeeds;
    }

    // Utility methods

    /**
     * Get the coverage status based on overall percentage
     * 
     * @return coverage status as a string
     */
    public String getCoverageStatus() {
        if (overallCoveragePercentage == null) {
            return "UNKNOWN";
        }
        
        if (overallCoveragePercentage >= 90.0) {
            return "EXCELLENT";
        } else if (overallCoveragePercentage >= 80.0) {
            return "GOOD";
        } else if (overallCoveragePercentage >= 70.0) {
            return "ADEQUATE";
        } else if (overallCoveragePercentage >= 60.0) {
            return "NEEDS_IMPROVEMENT";
        } else {
            return "CRITICAL";
        }
    }

    /**
     * Check if there are critical skill gaps
     * 
     * @return true if critical gaps exist, false otherwise
     */
    public boolean hasCriticalGaps() {
        return criticalGaps != null && !criticalGaps.isEmpty();
    }

    /**
     * Get the number of critical gaps
     * 
     * @return number of critical gaps
     */
    public int getCriticalGapCount() {
        return criticalGaps != null ? criticalGaps.size() : 0;
    }

    /**
     * Get coverage emoji based on overall percentage
     * 
     * @return emoji representation of coverage status
     */
    public String getCoverageEmoji() {
        String status = getCoverageStatus();
        return switch (status) {
            case "EXCELLENT" -> "🟢";
            case "GOOD" -> "🟡";
            case "ADEQUATE" -> "🟠";
            case "NEEDS_IMPROVEMENT" -> "🔴";
            case "CRITICAL" -> "🚨";
            default -> "❓";
        };
    }

    @Override
    public String toString() {
        return String.format(
            "SkillCoverage{totalSkills=%d, overallCoverage=%.1f%%, criticalGaps=%d}",
            totalSkills, overallCoveragePercentage, getCriticalGapCount()
        );
    }

    /**
     * Nested class for skill information per service type
     */
    public static class SkillInfo {
        
        @JsonProperty("technicianCount")
        private Integer technicianCount;
        
        @JsonProperty("coveragePercentage")
        private Double coveragePercentage;
        
        @JsonProperty("status")
        private String status;
        
        // Default constructor
        public SkillInfo() {}
        
        // Getters and Setters
        
        public Integer getTechnicianCount() {
            return technicianCount;
        }
        
        public void setTechnicianCount(Integer technicianCount) {
            this.technicianCount = technicianCount;
        }
        
        public Double getCoveragePercentage() {
            return coveragePercentage;
        }
        
        public void setCoveragePercentage(Double coveragePercentage) {
            this.coveragePercentage = coveragePercentage;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        @Override
        public String toString() {
            return String.format(
                "SkillInfo{technicianCount=%d, coverage=%.1f%%, status='%s'}",
                technicianCount, coveragePercentage, status
            );
        }
    }
} 