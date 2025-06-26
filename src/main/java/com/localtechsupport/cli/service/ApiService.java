package com.localtechsupport.cli.service;

import com.localtechsupport.cli.client.TechSupportApiClient;
import com.localtechsupport.cli.client.ApiResponse;
import com.localtechsupport.cli.client.ApiException;
import com.localtechsupport.cli.model.Client;
import com.localtechsupport.cli.model.Technician;
import com.localtechsupport.cli.model.Ticket;
import com.localtechsupport.cli.model.Appointment;
import com.localtechsupport.cli.model.PagedResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

/**
 * Service layer for API communication and business logic
 * 
 * This service handles all interactions with the Tech Support API
 * using the correct endpoints that exist on the actual Spring Boot server.
 */
public class ApiService implements AutoCloseable {

    private static final Logger logger = LoggerFactory.getLogger(ApiService.class);

    private final TechSupportApiClient apiClient;

    public ApiService(String baseUrl) {
        this.apiClient = new TechSupportApiClient(baseUrl);
        logger.info("ApiService initialized with base URL: {}", baseUrl);
    }

    public ApiService(TechSupportApiClient apiClient) {
        this.apiClient = apiClient;
        logger.info("ApiService initialized with custom API client");
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
     * Get all clients from the API
     * 
     * @return List of all clients
     * @throws ApiException if the API call fails
     */
    public List<Client> getAllClients() throws ApiException {
        logger.debug("Fetching all clients");
        
        try {
            ApiResponse<PagedResponse<Client>> response = apiClient.get(
                "/api/clients", 
                new TypeReference<PagedResponse<Client>>() {}
            );
            
            List<Client> clients = response.getData().getContent();
            logger.info("Successfully fetched {} clients", clients.size());
            
            return clients;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch clients: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get a specific client by ID
     * 
     * @param clientId the client ID
     * @return the client
     * @throws ApiException if the API call fails
     */
    public Client getClientById(Long clientId) throws ApiException {
        logger.debug("Fetching client with ID: {}", clientId);
        
        try {
            ApiResponse<Client> response = apiClient.get(
                "/api/clients/" + clientId, 
                Client.class
            );
            
            Client client = response.getData();
            logger.info("Successfully fetched client: {}", client.getId());
            
            return client;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch client {}: {}", clientId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get tickets for a specific client using query parameter
     * 
     * @param clientId the client ID
     * @return List of tickets for the client
     * @throws ApiException if the API call fails
     */
    public List<Ticket> getTicketsByClient(Long clientId) throws ApiException {
        logger.debug("Fetching tickets for client: {}", clientId);
        
        try {
            ApiResponse<PagedResponse<Ticket>> response = apiClient.get(
                "/api/tickets?clientId=" + clientId, 
                new TypeReference<PagedResponse<Ticket>>() {}
            );
            
            List<Ticket> tickets = response.getData().getContent();
            logger.info("Successfully fetched {} tickets for client {}", tickets.size(), clientId);
            
            return tickets;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch tickets for client {}: {}", clientId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get all technicians from the API
     * 
     * @return List of all technicians
     * @throws ApiException if the API call fails
     */
    public List<Technician> getAllTechnicians() throws ApiException {
        logger.debug("Fetching all technicians");
        
        try {
            ApiResponse<PagedResponse<Technician>> response = apiClient.get(
                "/api/technicians", 
                new TypeReference<PagedResponse<Technician>>() {}
            );
            
            List<Technician> technicians = response.getData().getContent();
            logger.info("Successfully fetched {} technicians", technicians.size());
            
            return technicians;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch technicians: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get tickets for a specific technician using query parameter
     * 
     * @param technicianId the technician ID
     * @return List of tickets assigned to the technician
     * @throws ApiException if the API call fails
     */
    public List<Ticket> getTicketsByTechnician(Long technicianId) throws ApiException {
        logger.debug("Fetching tickets for technician: {}", technicianId);
        
        try {
            ApiResponse<PagedResponse<Ticket>> response = apiClient.get(
                "/api/tickets?technicianId=" + technicianId, 
                new TypeReference<PagedResponse<Ticket>>() {}
            );
            
            List<Ticket> tickets = response.getData().getContent();
            logger.info("Successfully fetched {} tickets for technician {}", tickets.size(), technicianId);
            
            return tickets;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch tickets for technician {}: {}", technicianId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get available technicians for a specific service type
     * 
     * @param serviceType the service type (HARDWARE, SOFTWARE, etc.)
     * @return List of available technicians
     * @throws ApiException if the API call fails
     */
    public List<Technician> getAvailableTechniciansByServiceType(String serviceType) throws ApiException {
        logger.debug("Fetching available technicians for service type: {}", serviceType);
        
        try {
            // Note: /api/technicians/available?serviceType=X returns a plain array, not a PagedResponse
            ApiResponse<List<Technician>> response = apiClient.get(
                "/api/technicians/available?serviceType=" + serviceType, 
                new TypeReference<List<Technician>>() {}
            );
            
            List<Technician> technicians = response.getData();
            logger.info("Successfully fetched {} available technicians for {}", technicians.size(), serviceType);
            
            return technicians;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch available technicians for {}: {}", serviceType, e.getMessage());
            throw e;
        }
    }

    /**
     * Get all available technicians
     * 
     * @return List of available technicians
     * @throws ApiException if the API call fails
     */
    public List<Technician> getAvailableTechnicians() throws ApiException {
        logger.debug("Fetching all available technicians");
        
        try {
            // Note: /api/technicians/available returns a plain array, not a PagedResponse
            ApiResponse<List<Technician>> response = apiClient.get(
                "/api/technicians/available", 
                new TypeReference<List<Technician>>() {}
            );
            
            List<Technician> technicians = response.getData();
            logger.info("Successfully fetched {} available technicians", technicians.size());
            
            return technicians;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch available technicians: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get overdue tickets
     * 
     * @return List of overdue tickets
     * @throws ApiException if the API call fails
     */
    public List<Ticket> getOverdueTickets() throws ApiException {
        logger.debug("Fetching overdue tickets");
        
        try {
            // Note: /api/tickets/overdue returns a plain array, not a PagedResponse
            ApiResponse<List<Ticket>> response = apiClient.get(
                "/api/tickets/overdue", 
                new TypeReference<List<Ticket>>() {}
            );
            
            List<Ticket> tickets = response.getData();
            logger.info("Successfully fetched {} overdue tickets", tickets.size());
            
            return tickets;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch overdue tickets: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get appointments for a specific technician using query parameter
     * 
     * @param technicianId the technician ID
     * @return List of appointments for the technician
     * @throws ApiException if the API call fails
     */
    public List<Appointment> getAppointmentsByTechnician(Long technicianId) throws ApiException {
        logger.debug("Fetching appointments for technician: {}", technicianId);
        
        try {
            ApiResponse<PagedResponse<Appointment>> response = apiClient.get(
                "/api/appointments?technicianId=" + technicianId, 
                new TypeReference<PagedResponse<Appointment>>() {}
            );
            
            List<Appointment> appointments = response.getData().getContent();
            logger.info("Successfully fetched {} appointments for technician {}", appointments.size(), technicianId);
            
            return appointments;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch appointments for technician {}: {}", technicianId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get all tickets from the API
     * 
     * @return List of all tickets
     * @throws ApiException if the API call fails
     */
    public List<Ticket> getAllTickets() throws ApiException {
        logger.debug("Fetching all tickets");
        
        try {
            ApiResponse<PagedResponse<Ticket>> response = apiClient.get(
                "/api/tickets", 
                new TypeReference<PagedResponse<Ticket>>() {}
            );
            
            List<Ticket> tickets = response.getData().getContent();
            logger.info("Successfully fetched {} tickets", tickets.size());
            
            return tickets;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch tickets: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get all appointments from the API
     * 
     * @return List of all appointments
     * @throws ApiException if the API call fails
     */
    public List<Appointment> getAllAppointments() throws ApiException {
        logger.debug("Fetching all appointments");
        
        try {
            ApiResponse<PagedResponse<Appointment>> response = apiClient.get(
                "/api/appointments", 
                new TypeReference<PagedResponse<Appointment>>() {}
            );
            
            List<Appointment> appointments = response.getData().getContent();
            logger.info("Successfully fetched {} appointments", appointments.size());
            
            return appointments;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch appointments: {}", e.getMessage());
            throw e;
        }
    }
} 