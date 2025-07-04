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
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;

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
     * Get a specific ticket by ID with full details
     * 
     * @param ticketId the ticket ID
     * @return the ticket with full nested objects
     * @throws ApiException if the API call fails
     */
    public Ticket getTicketById(Long ticketId) throws ApiException {
        logger.debug("Fetching ticket with ID: {}", ticketId);
        
        try {
            ApiResponse<Ticket> response = apiClient.get(
                "/api/tickets/" + ticketId, 
                Ticket.class
            );
            
            Ticket ticket = response.getData();
            logger.info("Successfully fetched ticket: {}", ticket.getId());
            
            return ticket;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch ticket {}: {}", ticketId, e.getMessage());
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

    // ==================== CLIENT WRITE OPERATIONS ====================

    /**
     * Create a new client
     * 
     * @param client the client to create (without ID)
     * @return the created client with generated ID
     * @throws ApiException if the API call fails
     */
    public Client createClient(Client client) throws ApiException {
        logger.debug("Creating new client: {} {}", client.getFirstName(), client.getLastName());
        
        try {
            ApiResponse<Client> response = apiClient.post(
                "/api/clients", 
                client, 
                Client.class
            );
            
            Client createdClient = response.getData();
            logger.info("Successfully created client with ID: {}", createdClient.getId());
            
            return createdClient;
            
        } catch (ApiException e) {
            logger.error("Failed to create client: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Update an existing client
     * 
     * @param clientId the client ID to update
     * @param client the updated client data
     * @return the updated client
     * @throws ApiException if the API call fails
     */
    public Client updateClient(Long clientId, Client client) throws ApiException {
        logger.debug("Updating client ID: {}", clientId);
        
        try {
            ApiResponse<Client> response = apiClient.put(
                "/api/clients/" + clientId, 
                client, 
                Client.class
            );
            
            Client updatedClient = response.getData();
            logger.info("Successfully updated client ID: {}", clientId);
            
            return updatedClient;
            
        } catch (ApiException e) {
            logger.error("Failed to update client {}: {}", clientId, e.getMessage());
            throw e;
        }
    }

    /**
     * Delete a client by ID
     * 
     * @param clientId the client ID to delete
     * @throws ApiException if the API call fails
     */
    public void deleteClient(Long clientId) throws ApiException {
        logger.debug("Deleting client ID: {}", clientId);
        
        try {
            apiClient.delete("/api/clients/" + clientId);
            logger.info("Successfully deleted client ID: {}", clientId);
            
        } catch (ApiException e) {
            logger.error("Failed to delete client {}: {}", clientId, e.getMessage());
            throw e;
        }
    }

    /**
     * Activate a client (set status to ACTIVE and active to true)
     * 
     * @param clientId the client ID to activate
     * @return the updated client
     * @throws ApiException if the API call fails
     */
    public Client activateClient(Long clientId) throws ApiException {
        logger.debug("Activating client ID: {}", clientId);
        
        try {
            // First get the current client data
            Client currentClient = getClientById(clientId);
            
            // Create an updated client with ACTIVE status
            Client updatedClientData = new Client();
            updatedClientData.setId(currentClient.getId());
            updatedClientData.setFirstName(currentClient.getFirstName());
            updatedClientData.setLastName(currentClient.getLastName());
            updatedClientData.setEmail(currentClient.getEmail());
            updatedClientData.setPhone(currentClient.getPhone());
            updatedClientData.setAddress(currentClient.getAddress());
            updatedClientData.setNotes(currentClient.getNotes());
            updatedClientData.setStatus("ACTIVE");
            updatedClientData.setActive(true);
            
            // Update the client
            Client activatedClient = updateClient(clientId, updatedClientData);
            logger.info("Successfully activated client ID: {}", clientId);
            
            return activatedClient;
            
        } catch (ApiException e) {
            logger.error("Failed to activate client {}: {}", clientId, e.getMessage());
            throw e;
        }
    }

    /**
     * Suspend a client (set status to SUSPENDED and active to false)
     * 
     * @param clientId the client ID to suspend
     * @return the updated client
     * @throws ApiException if the API call fails
     */
    public Client suspendClient(Long clientId) throws ApiException {
        logger.debug("Suspending client ID: {}", clientId);
        
        try {
            // First get the current client data
            Client currentClient = getClientById(clientId);
            
            // Create an updated client with SUSPENDED status
            Client updatedClientData = new Client();
            updatedClientData.setId(currentClient.getId());
            updatedClientData.setFirstName(currentClient.getFirstName());
            updatedClientData.setLastName(currentClient.getLastName());
            updatedClientData.setEmail(currentClient.getEmail());
            updatedClientData.setPhone(currentClient.getPhone());
            updatedClientData.setAddress(currentClient.getAddress());
            updatedClientData.setNotes(currentClient.getNotes());
            updatedClientData.setStatus("SUSPENDED");
            updatedClientData.setActive(false);
            
            // Update the client
            Client suspendedClient = updateClient(clientId, updatedClientData);
            logger.info("Successfully suspended client ID: {}", clientId);
            
            return suspendedClient;
            
        } catch (ApiException e) {
            logger.error("Failed to suspend client {}: {}", clientId, e.getMessage());
            throw e;
        }
    }

    // ==================== TECHNICIAN CRUD OPERATIONS ====================
    
    /**
     * Create a new technician
     * 
     * @param technician the technician to create
     * @return the created technician
     * @throws ApiException if the API call fails
     */
    public Technician createTechnician(Technician technician) throws ApiException {
        logger.debug("Creating new technician: {}", technician.getFullName());
        
        try {
            ApiResponse<Technician> response = apiClient.post(
                "/api/technicians", 
                technician,
                Technician.class
            );
            
            Technician createdTechnician = response.getData();
            logger.info("Successfully created technician: {} (ID: {})", 
                createdTechnician.getFullName(), createdTechnician.getId());
            
            return createdTechnician;
            
        } catch (ApiException e) {
            logger.error("Failed to create technician: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Update an existing technician
     * 
     * @param technicianId the technician ID
     * @param technician the updated technician data
     * @return the updated technician
     * @throws ApiException if the API call fails
     */
    public Technician updateTechnician(Long technicianId, Technician technician) throws ApiException {
        logger.debug("Updating technician ID: {}", technicianId);
        
        try {
            ApiResponse<Technician> response = apiClient.put(
                "/api/technicians/" + technicianId, 
                technician,
                Technician.class
            );
            
            Technician updatedTechnician = response.getData();
            logger.info("Successfully updated technician: {} (ID: {})", 
                updatedTechnician.getFullName(), technicianId);
            
            return updatedTechnician;
            
        } catch (ApiException e) {
            logger.error("Failed to update technician ID {}: {}", technicianId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Delete a technician
     * 
     * @param technicianId the technician ID
     * @throws ApiException if the API call fails
     */
    public void deleteTechnician(Long technicianId) throws ApiException {
        logger.debug("Deleting technician ID: {}", technicianId);
        
        try {
            apiClient.delete("/api/technicians/" + technicianId);
            logger.info("Successfully deleted technician ID: {}", technicianId);
            
        } catch (ApiException e) {
            logger.error("Failed to delete technician ID {}: {}", technicianId, e.getMessage());
            throw e;
        }
    }

    // ==================== END TECHNICIAN CRUD OPERATIONS ====================

    // ==================== TICKET CRUD OPERATIONS ====================
    
    /**
     * Create a new ticket
     * 
     * @param ticket the ticket to create
     * @return the created ticket
     * @throws ApiException if the API call fails
     */
    public Ticket createTicket(Ticket ticket) throws ApiException {
        logger.info("Creating new ticket - Request data: description='{}', serviceType='{}', clientId={}", 
            ticket.getDescription() != null ? ticket.getDescription().substring(0, Math.min(50, ticket.getDescription().length())) + "..." : "null",
            ticket.getServiceType(),
            ticket.getClientId());
        
        // Create a minimal request object with only the fields the server expects
        // Server only expects: clientId, serviceType, description
        // Server automatically sets: id, status=OPEN, createdAt, updatedAt, dueAt (24h/48h SLA)
        java.util.Map<String, Object> createRequest = new java.util.HashMap<>();
        createRequest.put("clientId", ticket.getClientId());
        createRequest.put("serviceType", ticket.getServiceType());
        createRequest.put("description", ticket.getDescription());
        
        try {
            ApiResponse<Ticket> response = apiClient.post(
                "/api/tickets", 
                createRequest,
                Ticket.class
            );
            
            Ticket createdTicket = response.getData();
            
            // Debug logging to see what the server actually returned
            logger.info("Create ticket response: ID={}, status='{}', serviceType='{}', description='{}'", 
                createdTicket.getId(), 
                createdTicket.getStatus(),
                createdTicket.getServiceType(),
                createdTicket.getDescription() != null ? createdTicket.getDescription().substring(0, Math.min(50, createdTicket.getDescription().length())) + "..." : "null");
            
            logger.info("Successfully created ticket: Description-based ticket (ID: {})", createdTicket.getId());
            
            return createdTicket;
            
        } catch (ApiException e) {
            logger.error("Failed to create ticket: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Update an existing ticket
     * 
     * @param ticketId the ticket ID
     * @param ticket the updated ticket data
     * @return the updated ticket
     * @throws ApiException if the API call fails
     */
    public Ticket updateTicket(Long ticketId, Ticket ticket) throws ApiException {
        logger.debug("Updating ticket ID: {}", ticketId);
        
        try {
            ApiResponse<Ticket> response = apiClient.put(
                "/api/tickets/" + ticketId, 
                ticket,
                Ticket.class
            );
            
            Ticket updatedTicket = response.getData();
            logger.info("Successfully updated ticket: Description-based ticket (ID: {})", ticketId);
            
            return updatedTicket;
            
        } catch (ApiException e) {
            logger.error("Failed to update ticket ID {}: {}", ticketId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Delete a ticket
     * 
     * @param ticketId the ticket ID
     * @throws ApiException if the API call fails
     */
    public void deleteTicket(Long ticketId) throws ApiException {
        logger.debug("Deleting ticket ID: {}", ticketId);
        
        try {
            apiClient.delete("/api/tickets/" + ticketId);
            logger.info("Successfully deleted ticket ID: {}", ticketId);
            
        } catch (ApiException e) {
            logger.error("Failed to delete ticket ID {}: {}", ticketId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Assign a technician to a ticket using the proper assignment endpoint
     * 
     * @param ticketId the ticket ID
     * @param technicianId the technician ID to assign
     * @return the updated ticket
     * @throws ApiException if the API call fails
     */
    public Ticket assignTechnician(Long ticketId, Long technicianId) throws ApiException {
        logger.debug("Assigning technician {} to ticket {}", technicianId, ticketId);
        
        try {
            // Create request body with technician ID
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("technicianId", technicianId);
            
            ApiResponse<Ticket> response = apiClient.post(
                "/api/tickets/" + ticketId + "/assign",
                requestBody,
                Ticket.class
            );
            
            Ticket updatedTicket = response.getData();
            logger.info("Successfully assigned technician {} to ticket {}", technicianId, ticketId);
            return updatedTicket;
            
        } catch (ApiException e) {
            logger.error("Failed to assign technician {} to ticket {}: {}", technicianId, ticketId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Unassign the current technician from a ticket
     * 
     * @param ticketId the ticket ID
     * @param reason optional reason for unassignment
     * @param unassignedBy user making the change
     * @return the updated ticket
     * @throws ApiException if the API call fails
     */
    public Ticket unassignTechnician(Long ticketId, String reason, String unassignedBy) throws ApiException {
        logger.debug("Unassigning technician from ticket {}", ticketId);
        
        try {
            // Create request body with optional reason and user
            Map<String, Object> requestBody = new HashMap<>();
            if (reason != null && !reason.trim().isEmpty()) {
                requestBody.put("reason", reason.trim());
            }
            if (unassignedBy != null && !unassignedBy.trim().isEmpty()) {
                requestBody.put("updatedBy", unassignedBy.trim());
            }
            
            ApiResponse<Ticket> response = apiClient.delete(
                "/api/tickets/" + ticketId + "/assign",
                requestBody,
                Ticket.class
            );
            
            Ticket updatedTicket = response.getData();
            logger.info("Successfully unassigned technician from ticket {}", ticketId);
            return updatedTicket;
            
        } catch (ApiException e) {
            logger.error("Failed to unassign technician from ticket {}: {}", ticketId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Update ticket status using the proper status endpoint
     * 
     * @param ticketId the ticket ID
     * @param status the new status (OPEN, CLOSED)
     * @return the updated ticket
     * @throws ApiException if the API call fails
     */
    public Ticket updateTicketStatus(Long ticketId, String status) throws ApiException {
        logger.debug("Updating ticket {} status to {}", ticketId, status);
        
        try {
            // Create request body with status and required updatedBy field
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("status", status);
            requestBody.put("updatedBy", "CLI User"); // Required field for audit trail
            
            ApiResponse<Ticket> response = apiClient.put(
                "/api/tickets/" + ticketId + "/status",
                requestBody,
                Ticket.class
            );
            
            Ticket updatedTicket = response.getData();
            logger.info("Successfully updated ticket {} status to {}", ticketId, status);
            return updatedTicket;
            
        } catch (ApiException e) {
            logger.error("Failed to update ticket {} status to {}: {}", ticketId, status, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Auto-assign a ticket using the server's assignment logic
     * 
     * @param ticketId the ticket ID to auto-assign
     * @return the updated ticket with assigned technician
     * @throws ApiException if the API call fails
     */
    public Ticket autoAssignTicket(Long ticketId) throws ApiException {
        logger.info("Auto-assigning ticket {}", ticketId);
        
        try {
            ApiResponse<Ticket> response = apiClient.post(
                "/api/tickets/" + ticketId + "/auto-assign",
                null,
                Ticket.class
            );
            
            Ticket assignedTicket = response.getData();
            
            // Debug logging to see what the server actually returned
            Long technicianId = getEffectiveAssignedTechnicianId(assignedTicket);
            logger.info("Auto-assign response for ticket {}: assignedTechnicianId={}, assignedTechnician={}, status={}", 
                ticketId, assignedTicket.getAssignedTechnicianId(), 
                (assignedTicket.getAssignedTechnician() != null ? assignedTicket.getAssignedTechnician().getId() : "null"),
                assignedTicket.getStatus());
            
            // Check if we need to fetch the updated ticket to get the latest assignment
            if (technicianId == null) {
                logger.info("Response shows null assignment, fetching fresh ticket data to verify...");
                try {
                    // Get the updated ticket from the server to see if assignment was applied
                    List<Ticket> allTickets = getAllTickets();
                    Ticket refreshedTicket = allTickets.stream()
                        .filter(t -> t.getId().equals(ticketId))
                        .findFirst()
                        .orElse(assignedTicket);
                    
                    Long refreshedTechnicianId = getEffectiveAssignedTechnicianId(refreshedTicket);
                    logger.info("Refreshed ticket {}: assignedTechnicianId={}, assignedTechnician={}", 
                        ticketId, refreshedTicket.getAssignedTechnicianId(),
                        (refreshedTicket.getAssignedTechnician() != null ? refreshedTicket.getAssignedTechnician().getId() : "null"));
                    
                    // Use the refreshed ticket if it has assignment data
                    if (refreshedTechnicianId != null) {
                        logger.info("Successfully auto-assigned ticket {} to technician {} (found via refresh)", 
                            ticketId, refreshedTechnicianId);
                        return refreshedTicket;
                    }
                } catch (Exception refreshError) {
                    logger.warn("Failed to refresh ticket data after auto-assignment: {}", refreshError.getMessage());
                }
            }
            
            logger.info("Successfully auto-assigned ticket {} to technician {}", 
                ticketId, technicianId != null ? technicianId : "null");
            
            return assignedTicket;
            
        } catch (ApiException e) {
            logger.error("Failed to auto-assign ticket {}: {}", ticketId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Helper method to get the effective assigned technician ID from a ticket.
     * Checks both the assignedTechnicianId field and the nested assignedTechnician object.
     * 
     * @param ticket the ticket to check
     * @return the technician ID if found, null otherwise
     */
    private Long getEffectiveAssignedTechnicianId(Ticket ticket) {
        if (ticket == null) {
            return null;
        }
        
        // First check the direct assignedTechnicianId field
        if (ticket.getAssignedTechnicianId() != null) {
            return ticket.getAssignedTechnicianId();
        }
        
        // Then check the nested assignedTechnician object
        if (ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().getId() != null) {
            return ticket.getAssignedTechnician().getId();
        }
        
        return null;
    }

    // ==================== END TICKET CRUD OPERATIONS ====================

    // ==================== APPOINTMENT WRITE OPERATIONS ====================
    
    /**
     * Create a new appointment
     * 
     * @param appointment the appointment to create
     * @return the created appointment
     * @throws ApiException if the API call fails
     */
    public Appointment createAppointment(Appointment appointment) throws ApiException {
        logger.debug("Creating new appointment for ticket: {}", appointment.getTicketId());
        
        try {
            // Create a request object with properly formatted ISO 8601 dates
            // The server expects Instant objects, so we need to send timezone-aware timestamps
            Map<String, Object> createRequest = new HashMap<>();
            createRequest.put("ticketId", appointment.getTicketId());
            createRequest.put("technicianId", appointment.getTechnicianId());
            
            // Convert LocalDateTime to ISO 8601 format with UTC timezone
            // Format: 2025-06-27T14:30:00Z
            String startTimeIso = appointment.getScheduledStartTime()
                .atZone(java.time.ZoneId.systemDefault())
                .withZoneSameInstant(java.time.ZoneOffset.UTC)
                .format(java.time.format.DateTimeFormatter.ISO_INSTANT);
            
            String endTimeIso = appointment.getScheduledEndTime()
                .atZone(java.time.ZoneId.systemDefault())
                .withZoneSameInstant(java.time.ZoneOffset.UTC)
                .format(java.time.format.DateTimeFormatter.ISO_INSTANT);
            
            // Server API uses "startTime" and "endTime" for both requests and responses
            createRequest.put("startTime", startTimeIso);
            createRequest.put("endTime", endTimeIso);
            
            if (appointment.getNotes() != null && !appointment.getNotes().trim().isEmpty()) {
                createRequest.put("notes", appointment.getNotes().trim());
            }
            
            logger.debug("Sending appointment request with ISO dates: start={}, end={}", startTimeIso, endTimeIso);
            
            ApiResponse<Appointment> response = apiClient.post(
                "/api/appointments", 
                createRequest,
                Appointment.class
            );
            
            Appointment createdAppointment = response.getData();
            logger.info("Successfully created appointment with ID: {}", createdAppointment.getId());
            
            return createdAppointment;
            
        } catch (ApiException e) {
            logger.error("Failed to create appointment: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Update an existing appointment
     * 
     * @param appointmentId the appointment ID to update
     * @param appointment the updated appointment data
     * @return the updated appointment
     * @throws ApiException if the API call fails
     */
    public Appointment updateAppointment(Long appointmentId, Appointment appointment) throws ApiException {
        logger.debug("Updating appointment ID: {}", appointmentId);
        
        try {
            // Create a request object with properly formatted ISO 8601 dates
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("ticketId", appointment.getTicketId());
            updateRequest.put("technicianId", appointment.getTechnicianId());
            
            // Convert LocalDateTime to ISO 8601 format with UTC timezone
            String startTimeIso = appointment.getScheduledStartTime()
                .atZone(java.time.ZoneId.systemDefault())
                .withZoneSameInstant(java.time.ZoneOffset.UTC)
                .format(java.time.format.DateTimeFormatter.ISO_INSTANT);
            
            String endTimeIso = appointment.getScheduledEndTime()
                .atZone(java.time.ZoneId.systemDefault())
                .withZoneSameInstant(java.time.ZoneOffset.UTC)
                .format(java.time.format.DateTimeFormatter.ISO_INSTANT);
            
            // Server API uses "startTime" and "endTime" for both requests and responses
            updateRequest.put("startTime", startTimeIso);
            updateRequest.put("endTime", endTimeIso);
            
            if (appointment.getNotes() != null && !appointment.getNotes().trim().isEmpty()) {
                updateRequest.put("notes", appointment.getNotes().trim());
            }
            
            logger.debug("Sending appointment update with ISO dates: start={}, end={}", startTimeIso, endTimeIso);
            
            ApiResponse<Appointment> response = apiClient.put(
                "/api/appointments/" + appointmentId, 
                updateRequest,
                Appointment.class
            );
            
            Appointment updatedAppointment = response.getData();
            logger.info("Successfully updated appointment ID: {}", appointmentId);
            
            return updatedAppointment;
            
        } catch (ApiException e) {
            logger.error("Failed to update appointment {}: {}", appointmentId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Delete an appointment by ID
     * 
     * @param appointmentId the appointment ID to delete
     * @throws ApiException if the API call fails
     */
    public void deleteAppointment(Long appointmentId) throws ApiException {
        logger.debug("Deleting appointment ID: {}", appointmentId);
        
        try {
            apiClient.delete("/api/appointments/" + appointmentId);
            logger.info("Successfully deleted appointment ID: {}", appointmentId);
            
        } catch (ApiException e) {
            logger.error("Failed to delete appointment {}: {}", appointmentId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Update appointment status directly
     * 
     * @param appointmentId the appointment ID
     * @param status the new status (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
     * @return the updated appointment
     * @throws ApiException if the API call fails
     */
    public Appointment updateAppointmentStatus(Long appointmentId, String status) throws ApiException {
        logger.debug("Updating appointment {} status to: {}", appointmentId, status);
        
        try {
            ApiResponse<Appointment> response = apiClient.put(
                "/api/appointments/" + appointmentId + "/status", 
                Map.of("status", status),
                Appointment.class
            );
            
            Appointment updatedAppointment = response.getData();
            logger.info("Successfully updated appointment {} status to: {}", appointmentId, status);
            
            return updatedAppointment;
            
        } catch (ApiException e) {
            logger.error("Failed to update appointment {} status: {}", appointmentId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Confirm a pending appointment
     * 
     * @param appointmentId the appointment ID to confirm
     * @return the confirmed appointment
     * @throws ApiException if the API call fails
     */
    public Appointment confirmAppointment(Long appointmentId) throws ApiException {
        logger.debug("Confirming appointment ID: {}", appointmentId);
        
        try {
            ApiResponse<Appointment> response = apiClient.post(
                "/api/appointments/" + appointmentId + "/confirm", 
                null,
                Appointment.class
            );
            
            Appointment confirmedAppointment = response.getData();
            logger.info("Successfully confirmed appointment ID: {}", appointmentId);
            
            return confirmedAppointment;
            
        } catch (ApiException e) {
            logger.error("Failed to confirm appointment {}: {}", appointmentId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Start an appointment (change status to IN_PROGRESS)
     * 
     * @param appointmentId the appointment ID to start
     * @return the updated appointment
     * @throws ApiException if the API call fails
     */
    public Appointment startAppointment(Long appointmentId) throws ApiException {
        logger.debug("Starting appointment ID: {}", appointmentId);
        
        try {
            ApiResponse<Appointment> response = apiClient.post(
                "/api/appointments/" + appointmentId + "/start", 
                null,
                Appointment.class
            );
            
            Appointment startedAppointment = response.getData();
            logger.info("Successfully started appointment ID: {}", appointmentId);
            
            return startedAppointment;
            
        } catch (ApiException e) {
            logger.error("Failed to start appointment {}: {}", appointmentId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Complete an appointment
     * 
     * @param appointmentId the appointment ID to complete
     * @param notes optional completion notes
     * @return the completed appointment
     * @throws ApiException if the API call fails
     */
    public Appointment completeAppointment(Long appointmentId, String notes) throws ApiException {
        logger.debug("Completing appointment ID: {}", appointmentId);
        
        try {
            Map<String, Object> requestData = new HashMap<>();
            if (notes != null && !notes.trim().isEmpty()) {
                requestData.put("notes", notes.trim());
            }
            
            ApiResponse<Appointment> response = apiClient.post(
                "/api/appointments/" + appointmentId + "/complete", 
                requestData.isEmpty() ? null : requestData,
                Appointment.class
            );
            
            Appointment completedAppointment = response.getData();
            logger.info("Successfully completed appointment ID: {}", appointmentId);
            
            return completedAppointment;
            
        } catch (ApiException e) {
            logger.error("Failed to complete appointment {}: {}", appointmentId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Cancel an appointment
     * 
     * @param appointmentId the appointment ID to cancel
     * @param reason cancellation reason
     * @return the cancelled appointment
     * @throws ApiException if the API call fails
     */
    public Appointment cancelAppointment(Long appointmentId, String reason) throws ApiException {
        logger.debug("Cancelling appointment ID: {}", appointmentId);
        
        try {
            Map<String, String> requestData = new HashMap<>();
            requestData.put("reason", reason != null ? reason : "No reason provided");
            
            ApiResponse<Appointment> response = apiClient.post(
                "/api/appointments/" + appointmentId + "/cancel", 
                requestData,
                Appointment.class
            );
            
            Appointment cancelledAppointment = response.getData();
            logger.info("Successfully cancelled appointment ID: {}", appointmentId);
            
            return cancelledAppointment;
            
        } catch (ApiException e) {
            logger.error("Failed to cancel appointment {}: {}", appointmentId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Mark an appointment as no-show
     * 
     * @param appointmentId the appointment ID to mark as no-show
     * @param notes optional notes about the no-show
     * @return the updated appointment
     * @throws ApiException if the API call fails
     */
    public Appointment markAppointmentNoShow(Long appointmentId, String notes) throws ApiException {
        logger.debug("Marking appointment {} as no-show", appointmentId);
        
        try {
            Map<String, Object> requestData = new HashMap<>();
            if (notes != null && !notes.trim().isEmpty()) {
                requestData.put("notes", notes.trim());
            }
            
            ApiResponse<Appointment> response = apiClient.post(
                "/api/appointments/" + appointmentId + "/no-show", 
                requestData.isEmpty() ? null : requestData,
                Appointment.class
            );
            
            Appointment noShowAppointment = response.getData();
            logger.info("Successfully marked appointment {} as no-show", appointmentId);
            
            return noShowAppointment;
            
        } catch (ApiException e) {
            logger.error("Failed to mark appointment {} as no-show: {}", appointmentId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Check technician availability for a time slot
     * 
     * @param technicianId the technician ID
     * @param startTime proposed start time
     * @param endTime proposed end time
     * @return true if technician is available, false if conflicts exist
     * @throws ApiException if the API call fails
     */
    public boolean checkTechnicianAvailability(Long technicianId, LocalDateTime startTime, LocalDateTime endTime) throws ApiException {
        logger.debug("Checking availability for technician {} from {} to {}", technicianId, startTime, endTime);
        
        try {
            // Convert LocalDateTime to ISO 8601 format with UTC timezone for query parameters
            String startTimeIso = startTime
                .atZone(java.time.ZoneId.systemDefault())
                .withZoneSameInstant(java.time.ZoneOffset.UTC)
                .format(java.time.format.DateTimeFormatter.ISO_INSTANT);
            
            String endTimeIso = endTime
                .atZone(java.time.ZoneId.systemDefault())
                .withZoneSameInstant(java.time.ZoneOffset.UTC)
                .format(java.time.format.DateTimeFormatter.ISO_INSTANT);
            
            // URL encode the ISO timestamps for query parameters
            String queryParams = String.format("?technicianId=%d&startTime=%s&endTime=%s", 
                technicianId, 
                java.net.URLEncoder.encode(startTimeIso, "UTF-8"), 
                java.net.URLEncoder.encode(endTimeIso, "UTF-8"));
                
            logger.debug("Checking availability with ISO dates: start={}, end={}", startTimeIso, endTimeIso);
                
            ApiResponse<Boolean> response = apiClient.get(
                "/api/appointments/availability" + queryParams, 
                Boolean.class
            );
            
            boolean isAvailable = response.getData();
            
            logger.info("Technician {} availability check: {}", technicianId, isAvailable ? "Available" : "Conflicts exist");
            
            return isAvailable;
            
        } catch (ApiException e) {
            logger.error("Failed to check technician {} availability: {}", technicianId, e.getMessage());
            throw e;
        } catch (java.io.UnsupportedEncodingException e) {
            logger.error("Failed to encode date parameters for availability check", e);
            throw new ApiException("Failed to format date parameters", e);
        }
    }
    
    /**
     * Get upcoming appointments within a time range
     * 
     * @param daysAhead number of days to look ahead (default: 7)
     * @return list of upcoming appointments
     * @throws ApiException if the API call fails
     */
    public List<Appointment> getUpcomingAppointments(int daysAhead) throws ApiException {
        logger.debug("Fetching upcoming appointments for {} days ahead", daysAhead);
        
        try {
            // Server returns a plain array of appointments, not a PagedResponse
            ApiResponse<List<Appointment>> response = apiClient.get(
                "/api/appointments/upcoming?days=" + daysAhead, 
                new TypeReference<List<Appointment>>() {}
            );
            
            List<Appointment> appointments = response.getData();
            logger.info("Successfully fetched {} upcoming appointments", appointments.size());
            
            return appointments;
            
        } catch (ApiException e) {
            logger.error("Failed to fetch upcoming appointments: {}", e.getMessage());
            throw e;
        }
    }
} 