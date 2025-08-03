package com.localtechsupport.cli.client;

import java.util.List;
import java.util.Map;

/**
 * Generic wrapper for API responses containing data and metadata
 * 
 * @param <T> The type of data returned by the API
 */
public class ApiResponse<T> {

    private final T data;
    private final int statusCode;
    private final Map<String, List<String>> headers;

    public ApiResponse(T data, int statusCode, Map<String, List<String>> headers) {
        this.data = data;
        this.statusCode = statusCode;
        this.headers = headers;
    }

    /**
     * Get the response data
     * 
     * @return the parsed response data
     */
    public T getData() {
        return data;
    }

    /**
     * Get the HTTP status code
     * 
     * @return the HTTP status code
     */
    public int getStatusCode() {
        return statusCode;
    }

    /**
     * Get the response headers
     * 
     * @return map of response headers
     */
    public Map<String, List<String>> getHeaders() {
        return headers;
    }

    /**
     * Check if the response was successful (2xx status code)
     * 
     * @return true if successful, false otherwise
     */
    public boolean isSuccessful() {
        return statusCode >= 200 && statusCode < 300;
    }

    /**
     * Get a specific header value
     * 
     * @param headerName the header name to look up
     * @return the first value of the header, or null if not found
     */
    public String getHeader(String headerName) {
        List<String> values = headers.get(headerName);
        return values != null && !values.isEmpty() ? values.get(0) : null;
    }

    @Override
    public String toString() {
        return String.format("ApiResponse{statusCode=%d, data=%s}", statusCode, data);
    }
} 