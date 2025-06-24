package com.localtechsupport.cli.service;

import com.localtechsupport.cli.client.TechSupportApiClient;
import com.localtechsupport.cli.client.ApiResponse;
import com.localtechsupport.cli.client.ApiException;
import com.localtechsupport.cli.model.TicketStatistics;
import com.localtechsupport.cli.model.TechnicianStatistics;
import com.localtechsupport.cli.model.FeedbackStatistics;
import com.localtechsupport.cli.model.SkillCoverage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service layer for API communication and business logic
 * 
 * This service handles all interactions with the Tech Support API
 * and provides business logic around the raw API responses.
 */
public class ApiService implements AutoCloseable {

    private static final Logger logger = LoggerFactory.getLogger(ApiService.class);

    private final TechSupportApiClient apiClient;

    // API endpoints
    private static final String TICKETS_STATS_ENDPOINT = "/api/tickets/statistics";
    private static final String TECHNICIANS_STATS_ENDPOINT = "/api/technicians/statistics";
    private static final String FEEDBACK_STATS_ENDPOINT = "/api/feedback/statistics";
    private static final String SKILLS_COVERAGE_ENDPOINT = "/api/skills/coverage";

    public ApiService(String baseUrl) {
        this.apiClient = new TechSupportApiClient(baseUrl);
        logger.info("ApiService initialized with base URL: {}", baseUrl);
    }

    public ApiService(TechSupportApiClient apiClient) {
        this.apiClient = apiClient;
        logger.info("ApiService initialized with custom API client");
    }

    /**
     * Fetch ticket statistics from the API
     * 
     * @return TicketStatistics containing system health metrics
     * @throws ApiException if the API call fails
     */
    public TicketStatistics getTicketStatistics() throws ApiException {
        logger.debug("Fetching ticket statistics");
        
        try {
            ApiResponse<TicketStatistics> response = apiClient.get(
                TICKETS_STATS_ENDPOINT, 
                TicketStatistics.class
            );
            
            TicketStatistics stats = response.getData();
            logger.info("Successfully fetched ticket statistics: {}", stats);
            
            return stats;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch ticket statistics: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Fetch technician statistics from the API
     * 
     * @return TechnicianStatistics containing workforce analytics
     * @throws ApiException if the API call fails
     */
    public TechnicianStatistics getTechnicianStatistics() throws ApiException {
        logger.debug("Fetching technician statistics");
        
        try {
            ApiResponse<TechnicianStatistics> response = apiClient.get(
                TECHNICIANS_STATS_ENDPOINT, 
                TechnicianStatistics.class
            );
            
            TechnicianStatistics stats = response.getData();
            logger.info("Successfully fetched technician statistics: {}", stats);
            
            return stats;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch technician statistics: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Fetch feedback statistics from the API
     * 
     * @return FeedbackStatistics containing customer satisfaction metrics
     * @throws ApiException if the API call fails
     */
    public FeedbackStatistics getFeedbackStatistics() throws ApiException {
        logger.debug("Fetching feedback statistics");
        
        try {
            ApiResponse<FeedbackStatistics> response = apiClient.get(
                FEEDBACK_STATS_ENDPOINT, 
                FeedbackStatistics.class
            );
            
            FeedbackStatistics stats = response.getData();
            logger.info("Successfully fetched feedback statistics: {}", stats);
            
            return stats;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch feedback statistics: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Fetch skill coverage analysis from the API
     * 
     * @return SkillCoverage containing skill gap analysis
     * @throws ApiException if the API call fails
     */
    public SkillCoverage getSkillCoverage() throws ApiException {
        logger.debug("Fetching skill coverage analysis");
        
        try {
            ApiResponse<SkillCoverage> response = apiClient.get(
                SKILLS_COVERAGE_ENDPOINT, 
                SkillCoverage.class
            );
            
            SkillCoverage coverage = response.getData();
            logger.info("Successfully fetched skill coverage: {}", coverage);
            
            return coverage;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch skill coverage: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Test connection to the API server
     * 
     * @return true if connection is successful, false otherwise
     */
    public boolean testConnection() {
        logger.debug("Testing API connection");
        return apiClient.testConnection();
    }

    /**
     * Get the base URL of the API client
     * 
     * @return the base URL
     */
    public String getBaseUrl() {
        return apiClient.getBaseUrl();
    }

    /**
     * Close the API service and release resources
     */
    public void close() {
        logger.info("Closing API service");
        apiClient.close();
    }

    /**
     * Get comprehensive system health summary
     * 
     * This method combines multiple API calls to provide a complete
     * system overview. Use with caution as it makes multiple API requests.
     * 
     * @return SystemHealthSummary containing all key metrics
     * @throws ApiException if any API call fails
     */
    public SystemHealthSummary getSystemHealthSummary() throws ApiException {
        logger.debug("Fetching comprehensive system health summary");
        
        try {
            TicketStatistics ticketStats = getTicketStatistics();
            TechnicianStatistics techStats = getTechnicianStatistics();
            FeedbackStatistics feedbackStats = getFeedbackStatistics();
            SkillCoverage skillCoverage = getSkillCoverage();
            
            SystemHealthSummary summary = new SystemHealthSummary(
                ticketStats, techStats, feedbackStats, skillCoverage
            );
            
            logger.info("Successfully compiled system health summary");
            return summary;
            
        } catch (ApiException e) {
            logger.error("Failed to compile system health summary: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Comprehensive system health summary containing all key metrics
     */
    public static class SystemHealthSummary {
        private final TicketStatistics ticketStatistics;
        private final TechnicianStatistics technicianStatistics;
        private final FeedbackStatistics feedbackStatistics;
        private final SkillCoverage skillCoverage;

        public SystemHealthSummary(TicketStatistics ticketStatistics,
                                   TechnicianStatistics technicianStatistics,
                                   FeedbackStatistics feedbackStatistics,
                                   SkillCoverage skillCoverage) {
            this.ticketStatistics = ticketStatistics;
            this.technicianStatistics = technicianStatistics;
            this.feedbackStatistics = feedbackStatistics;
            this.skillCoverage = skillCoverage;
        }

        public TicketStatistics getTicketStatistics() {
            return ticketStatistics;
        }

        public TechnicianStatistics getTechnicianStatistics() {
            return technicianStatistics;
        }

        public FeedbackStatistics getFeedbackStatistics() {
            return feedbackStatistics;
        }

        public SkillCoverage getSkillCoverage() {
            return skillCoverage;
        }

        @Override
        public String toString() {
            return String.format(
                "SystemHealthSummary{tickets=%s, technicians=%s, feedback=%s, skills=%s}",
                ticketStatistics, technicianStatistics, feedbackStatistics, skillCoverage
            );
        }
    }
} 