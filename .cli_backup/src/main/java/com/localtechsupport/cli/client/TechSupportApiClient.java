package com.localtechsupport.cli.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.core.type.TypeReference;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.RequestBody;
import okhttp3.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * HTTP client for communicating with the Local Tech Support Server API
 * 
 * This client handles all HTTP requests to the server and provides
 * JSON response parsing capabilities.
 */
public class TechSupportApiClient {

    private static final Logger logger = LoggerFactory.getLogger(TechSupportApiClient.class);

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;

    public TechSupportApiClient(String baseUrl) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        
        this.httpClient = new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build();
            
        this.objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
            
        logger.info("TechSupportApiClient initialized with base URL: {}", this.baseUrl);
    }

    /**
     * Performs a GET request to the specified endpoint and returns the parsed response
     * 
     * @param endpoint The API endpoint (e.g., "/api/tickets/statistics")
     * @param responseType The class to deserialize the response into
     * @return ApiResponse containing the parsed data and metadata
     * @throws ApiException if the request fails or response cannot be parsed
     */
    public <T> ApiResponse<T> get(String endpoint, Class<T> responseType) throws ApiException {
        String url = baseUrl + endpoint;
        logger.debug("Making GET request to: {}", url);

        Request request = new Request.Builder()
            .url(url)
            .header("Accept", "application/json")
            .header("User-Agent", "TechSupport-CLI/1.0")
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            logger.debug("Response status: {} for URL: {}", response.code(), url);
            
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No error details";
                throw new ApiException(
                    String.format("API call failed with status %d: %s", response.code(), errorBody),
                    response.code()
                );
            }

            if (response.body() == null) {
                throw new ApiException("Response body is null", response.code());
            }

            String responseBody = response.body().string();
            logger.debug("Response body length: {} characters", responseBody.length());

            T data = objectMapper.readValue(responseBody, responseType);
            
            return new ApiResponse<>(
                data,
                response.code(),
                response.headers().toMultimap()
            );

        } catch (IOException e) {
            logger.error("Network error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Network error: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Unexpected error: " + e.getMessage(), e);
        }
    }

    /**
     * Performs a GET request to the specified endpoint and returns the parsed response using TypeReference
     * 
     * @param endpoint The API endpoint (e.g., "/api/clients")
     * @param typeReference The TypeReference to deserialize the response into
     * @return ApiResponse containing the parsed data and metadata
     * @throws ApiException if the request fails or response cannot be parsed
     */
    public <T> ApiResponse<T> get(String endpoint, TypeReference<T> typeReference) throws ApiException {
        String url = baseUrl + endpoint;
        logger.debug("Making GET request to: {}", url);

        Request request = new Request.Builder()
            .url(url)
            .header("Accept", "application/json")
            .header("User-Agent", "TechSupport-CLI/1.0")
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            logger.debug("Response status: {} for URL: {}", response.code(), url);
            
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No error details";
                throw new ApiException(
                    String.format("API call failed with status %d: %s", response.code(), errorBody),
                    response.code()
                );
            }

            if (response.body() == null) {
                throw new ApiException("Response body is null", response.code());
            }

            String responseBody = response.body().string();
            logger.debug("Response body length: {} characters", responseBody.length());

            T data = objectMapper.readValue(responseBody, typeReference);
            
            return new ApiResponse<>(
                data,
                response.code(),
                response.headers().toMultimap()
            );

        } catch (IOException e) {
            logger.error("Network error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Network error: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Unexpected error: " + e.getMessage(), e);
        }
    }

    /**
     * Performs a POST request to the specified endpoint with JSON payload
     * 
     * @param endpoint The API endpoint (e.g., "/api/clients")
     * @param payload The object to serialize as JSON and send in the request body
     * @param responseType The class to deserialize the response into
     * @return ApiResponse containing the parsed data and metadata
     * @throws ApiException if the request fails or response cannot be parsed
     */
    public <T, R> ApiResponse<R> post(String endpoint, T payload, Class<R> responseType) throws ApiException {
        String url = baseUrl + endpoint;
        logger.debug("Making POST request to: {}", url);

        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);
            logger.info("Request payload: {}", jsonPayload);

            RequestBody requestBody = RequestBody.create(
                jsonPayload,
                MediaType.parse("application/json")
            );

            Request request = new Request.Builder()
                .url(url)
                .post(requestBody)
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("User-Agent", "TechSupport-CLI/1.0")
                .build();

            try (Response response = httpClient.newCall(request).execute()) {
                logger.debug("Response status: {} for URL: {}", response.code(), url);
                
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "No error details";
                    throw new ApiException(
                        String.format("API call failed with status %d: %s", response.code(), errorBody),
                        response.code()
                    );
                }

                if (response.body() == null) {
                    throw new ApiException("Response body is null", response.code());
                }

                String responseBody = response.body().string();
                logger.debug("Response body length: {} characters", responseBody.length());

                R data = objectMapper.readValue(responseBody, responseType);
                
                return new ApiResponse<>(
                    data,
                    response.code(),
                    response.headers().toMultimap()
                );
            }

        } catch (IOException e) {
            logger.error("Network error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Network error: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Unexpected error: " + e.getMessage(), e);
        }
    }

    /**
     * Performs a PUT request to the specified endpoint with JSON payload
     * 
     * @param endpoint The API endpoint (e.g., "/api/clients/1")
     * @param payload The object to serialize as JSON and send in the request body
     * @param responseType The class to deserialize the response into
     * @return ApiResponse containing the parsed data and metadata
     * @throws ApiException if the request fails or response cannot be parsed
     */
    public <T, R> ApiResponse<R> put(String endpoint, T payload, Class<R> responseType) throws ApiException {
        String url = baseUrl + endpoint;
        logger.debug("Making PUT request to: {}", url);

        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);
            logger.debug("Request payload: {}", jsonPayload);

            RequestBody requestBody = RequestBody.create(
                jsonPayload,
                MediaType.parse("application/json")
            );

            Request request = new Request.Builder()
                .url(url)
                .put(requestBody)
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("User-Agent", "TechSupport-CLI/1.0")
                .build();

            try (Response response = httpClient.newCall(request).execute()) {
                logger.debug("Response status: {} for URL: {}", response.code(), url);
                
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "No error details";
                    throw new ApiException(
                        String.format("API call failed with status %d: %s", response.code(), errorBody),
                        response.code()
                    );
                }

                if (response.body() == null) {
                    throw new ApiException("Response body is null", response.code());
                }

                String responseBody = response.body().string();
                logger.debug("Response body length: {} characters", responseBody.length());

                R data = objectMapper.readValue(responseBody, responseType);
                
                return new ApiResponse<>(
                    data,
                    response.code(),
                    response.headers().toMultimap()
                );
            }

        } catch (IOException e) {
            logger.error("Network error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Network error: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Unexpected error: " + e.getMessage(), e);
        }
    }

    /**
     * Performs a DELETE request to the specified endpoint
     * 
     * @param endpoint The API endpoint (e.g., "/api/clients/1")
     * @throws ApiException if the request fails
     */
    public void delete(String endpoint) throws ApiException {
        String url = baseUrl + endpoint;
        logger.debug("Making DELETE request to: {}", url);

        Request request = new Request.Builder()
            .url(url)
            .delete()
            .header("Accept", "application/json")
            .header("User-Agent", "TechSupport-CLI/1.0")
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            logger.debug("Response status: {} for URL: {}", response.code(), url);
            
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No error details";
                throw new ApiException(
                    String.format("API call failed with status %d: %s", response.code(), errorBody),
                    response.code()
                );
            }

            logger.info("DELETE request successful for: {}", url);

        } catch (ApiException e) {
            // Re-throw ApiException as-is to preserve status code
            throw e;
        } catch (IOException e) {
            logger.error("Network error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Network error: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Unexpected error: " + e.getMessage(), e);
        }
    }

    /**
     * Performs a DELETE request to the specified endpoint with JSON payload and returns response
     * 
     * @param endpoint The API endpoint (e.g., "/api/tickets/1/assign")
     * @param payload The object to serialize as JSON and send in the request body
     * @param responseType The class to deserialize the response into
     * @return ApiResponse containing the parsed data and metadata
     * @throws ApiException if the request fails or response cannot be parsed
     */
    public <T, R> ApiResponse<R> delete(String endpoint, T payload, Class<R> responseType) throws ApiException {
        String url = baseUrl + endpoint;
        logger.debug("Making DELETE request with payload to: {}", url);

        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);
            logger.debug("Request payload: {}", jsonPayload);

            RequestBody requestBody = RequestBody.create(
                jsonPayload,
                MediaType.parse("application/json")
            );

            Request request = new Request.Builder()
                .url(url)
                .delete(requestBody)
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("User-Agent", "TechSupport-CLI/1.0")
                .build();

            try (Response response = httpClient.newCall(request).execute()) {
                logger.debug("Response status: {} for URL: {}", response.code(), url);
                
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "No error details";
                    throw new ApiException(
                        String.format("API call failed with status %d: %s", response.code(), errorBody),
                        response.code()
                    );
                }

                if (response.body() == null) {
                    throw new ApiException("Response body is null", response.code());
                }

                String responseBody = response.body().string();
                logger.debug("Response body length: {} characters", responseBody.length());

                R data = objectMapper.readValue(responseBody, responseType);
                
                return new ApiResponse<>(
                    data,
                    response.code(),
                    response.headers().toMultimap()
                );
            }

        } catch (IOException e) {
            logger.error("Network error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Network error: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error while calling {}: {}", url, e.getMessage());
            throw new ApiException("Unexpected error: " + e.getMessage(), e);
        }
    }

    /**
     * Get the base URL configured for this client
     * 
     * @return the base URL
     */
    public String getBaseUrl() {
        return baseUrl;
    }

    /**
     * Test connection to the API server
     * 
     * @return true if the server is reachable, false otherwise
     */
    public boolean testConnection() {
        try {
            // Try the main API endpoint instead of actuator health which may not be available
            Request request = new Request.Builder()
                .url(baseUrl + "/api/clients")
                .header("Accept", "application/json")
                .header("User-Agent", "TechSupport-CLI/1.0")
                .build();

            try (Response response = httpClient.newCall(request).execute()) {
                // Accept any response from 200-299 or even 401/403 as "connected"
                // We just want to verify the server is reachable, not that we can access data
                return response.code() >= 200 && response.code() < 500;
            }
        } catch (Exception e) {
            logger.warn("Connection test failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Close the HTTP client and release resources
     */
    public void close() {
        if (httpClient != null) {
            httpClient.dispatcher().executorService().shutdown();
            httpClient.connectionPool().evictAll();
        }
    }
} 