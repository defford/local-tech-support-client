package com.localtechsupport.cli.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/**
 * Data Transfer Object for feedback statistics from the API
 * 
 * Represents the response from GET /api/feedback/statistics
 */
public class FeedbackStatistics {

    @JsonProperty("totalFeedback")
    private Long totalFeedback;

    @JsonProperty("averageRating")
    private Double averageRating;

    @JsonProperty("ratingDistribution")
    private Map<Integer, Long> ratingDistribution;

    @JsonProperty("satisfactionLevel")
    private String satisfactionLevel;

    @JsonProperty("feedbackTrends")
    private Map<String, Double> feedbackTrends;

    @JsonProperty("highRatingsCount")
    private Long highRatingsCount;

    @JsonProperty("lowRatingsCount")
    private Long lowRatingsCount;

    @JsonProperty("improvementScore")
    private Double improvementScore;

    @JsonProperty("responseRate")
    private Double responseRate;

    // Default constructor
    public FeedbackStatistics() {}

    // Getters and Setters

    public Long getTotalFeedback() {
        return totalFeedback;
    }

    public void setTotalFeedback(Long totalFeedback) {
        this.totalFeedback = totalFeedback;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Map<Integer, Long> getRatingDistribution() {
        return ratingDistribution;
    }

    public void setRatingDistribution(Map<Integer, Long> ratingDistribution) {
        this.ratingDistribution = ratingDistribution;
    }

    public String getSatisfactionLevel() {
        return satisfactionLevel;
    }

    public void setSatisfactionLevel(String satisfactionLevel) {
        this.satisfactionLevel = satisfactionLevel;
    }

    public Map<String, Double> getFeedbackTrends() {
        return feedbackTrends;
    }

    public void setFeedbackTrends(Map<String, Double> feedbackTrends) {
        this.feedbackTrends = feedbackTrends;
    }

    public Long getHighRatingsCount() {
        return highRatingsCount;
    }

    public void setHighRatingsCount(Long highRatingsCount) {
        this.highRatingsCount = highRatingsCount;
    }

    public Long getLowRatingsCount() {
        return lowRatingsCount;
    }

    public void setLowRatingsCount(Long lowRatingsCount) {
        this.lowRatingsCount = lowRatingsCount;
    }

    public Double getImprovementScore() {
        return improvementScore;
    }

    public void setImprovementScore(Double improvementScore) {
        this.improvementScore = improvementScore;
    }

    public Double getResponseRate() {
        return responseRate;
    }

    public void setResponseRate(Double responseRate) {
        this.responseRate = responseRate;
    }

    // Utility methods

    /**
     * Get the percentage of high ratings (4-5 stars)
     * 
     * @return percentage as a double, or 0.0 if no feedback
     */
    public double getHighSatisfactionPercentage() {
        if (totalFeedback == null || totalFeedback == 0) {
            return 0.0;
        }
        return ((double) (highRatingsCount != null ? highRatingsCount : 0) / totalFeedback) * 100;
    }

    /**
     * Get the percentage of low ratings (1-2 stars)
     * 
     * @return percentage as a double, or 0.0 if no feedback
     */
    public double getLowSatisfactionPercentage() {
        if (totalFeedback == null || totalFeedback == 0) {
            return 0.0;
        }
        return ((double) (lowRatingsCount != null ? lowRatingsCount : 0) / totalFeedback) * 100;
    }

    /**
     * Get the satisfaction level emoji based on average rating
     * 
     * @return emoji representation of satisfaction
     */
    public String getSatisfactionEmoji() {
        if (averageRating == null) {
            return "❓";
        }
        
        if (averageRating >= 4.5) {
            return "😊";
        } else if (averageRating >= 4.0) {
            return "🙂";
        } else if (averageRating >= 3.0) {
            return "😐";
        } else if (averageRating >= 2.0) {
            return "😞";
        } else {
            return "😠";
        }
    }

    /**
     * Get detailed satisfaction level description
     * 
     * @return detailed description of satisfaction level
     */
    public String getDetailedSatisfactionLevel() {
        if (averageRating == null) {
            return "UNKNOWN";
        }
        
        if (averageRating >= 4.5) {
            return "EXCELLENT";
        } else if (averageRating >= 4.0) {
            return "VERY_GOOD";
        } else if (averageRating >= 3.5) {
            return "GOOD";
        } else if (averageRating >= 3.0) {
            return "AVERAGE";
        } else if (averageRating >= 2.0) {
            return "POOR";
        } else {
            return "VERY_POOR";
        }
    }

    @Override
    public String toString() {
        return String.format(
            "FeedbackStatistics{totalFeedback=%d, averageRating=%.1f, satisfactionLevel='%s'}",
            totalFeedback, averageRating, satisfactionLevel
        );
    }
} 