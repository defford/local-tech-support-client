package com.localtechsupport.cli.client;

/**
 * Exception thrown when API calls fail
 * 
 * This exception provides additional context about API failures including
 * HTTP status codes and detailed error messages.
 */
public class ApiException extends Exception {

    private final int statusCode;

    /**
     * Create an ApiException with a message and cause
     * 
     * @param message the error message
     * @param cause the underlying cause
     */
    public ApiException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = -1; // No HTTP status code available
    }

    /**
     * Create an ApiException with a message only
     * 
     * @param message the error message
     */
    public ApiException(String message) {
        super(message);
        this.statusCode = -1; // No HTTP status code available
    }

    /**
     * Create an ApiException with a message and HTTP status code
     * 
     * @param message the error message
     * @param statusCode the HTTP status code
     */
    public ApiException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    /**
     * Create an ApiException with a message, HTTP status code, and cause
     * 
     * @param message the error message
     * @param statusCode the HTTP status code
     * @param cause the underlying cause
     */
    public ApiException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    /**
     * Get the HTTP status code associated with this exception
     * 
     * @return the HTTP status code, or -1 if not available
     */
    public int getStatusCode() {
        return statusCode;
    }

    /**
     * Check if this exception has an HTTP status code
     * 
     * @return true if a status code is available, false otherwise
     */
    public boolean hasStatusCode() {
        return statusCode > 0;
    }

    /**
     * Get a user-friendly error message based on the status code
     * 
     * @return a formatted error message
     */
    public String getUserFriendlyMessage() {
        if (!hasStatusCode()) {
            return "Connection error: " + getMessage();
        }

        return switch (statusCode) {
            case 400 -> "Bad request: " + getMessage();
            case 401 -> "Authentication required: " + getMessage();
            case 403 -> "Access forbidden: " + getMessage();
            case 404 -> "Resource not found: " + getMessage();
            case 500 -> "Server error: " + getMessage();
            case 502 -> "Bad gateway: Server is temporarily unavailable";
            case 503 -> "Service unavailable: " + getMessage();
            case 504 -> "Gateway timeout: Server took too long to respond";
            default -> String.format("HTTP %d error: %s", statusCode, getMessage());
        };
    }

    @Override
    public String toString() {
        if (hasStatusCode()) {
            return String.format("ApiException{statusCode=%d, message='%s'}", statusCode, getMessage());
        }
        return String.format("ApiException{message='%s'}", getMessage());
    }
} 