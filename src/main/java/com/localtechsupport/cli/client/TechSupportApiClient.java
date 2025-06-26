package com.localtechsupport.cli.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.core.type.TypeReference;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
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
            Request request = new Request.Builder()
                .url(baseUrl + "/api/clients")
                .header("Accept", "application/json")
                .build();

            try (Response response = httpClient.newCall(request).execute()) {
                return response.isSuccessful();
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