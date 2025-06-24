package com.localtechsupport.cli.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utility class for JSON formatting and pretty-printing
 * 
 * Provides methods to convert objects to formatted JSON strings
 * for CLI output display.
 */
public class JsonFormatter {

    private static final Logger logger = LoggerFactory.getLogger(JsonFormatter.class);
    
    private static final ObjectMapper objectMapper;
    
    static {
        objectMapper = new ObjectMapper();
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * Convert an object to pretty-printed JSON string
     * 
     * @param object the object to convert
     * @return formatted JSON string
     */
    public static String toPrettyJsonString(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            logger.error("Error converting object to JSON: {}", e.getMessage());
            return String.format("Error formatting JSON: %s", e.getMessage());
        }
    }

    /**
     * Convert an object to compact JSON string (no formatting)
     * 
     * @param object the object to convert
     * @return compact JSON string
     */
    public static String toCompactJsonString(Object object) {
        try {
            ObjectMapper compactMapper = new ObjectMapper();
            return compactMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            logger.error("Error converting object to compact JSON: {}", e.getMessage());
            return String.format("Error formatting JSON: %s", e.getMessage());
        }
    }

    /**
     * Add a header to JSON output for better readability
     * 
     * @param title the title/header text
     * @param jsonContent the JSON content
     * @return formatted output with header
     */
    public static String withHeader(String title, String jsonContent) {
        StringBuilder output = new StringBuilder();
        
        // Add header
        output.append("=".repeat(60)).append("\n");
        output.append(String.format("📊 %s", title.toUpperCase())).append("\n");
        output.append("=".repeat(60)).append("\n\n");
        
        // Add JSON content
        output.append(jsonContent);
        
        return output.toString();
    }

    /**
     * Format JSON with metadata information
     * 
     * @param title the title
     * @param object the object to convert
     * @param serverUrl the server URL for context
     * @param timestamp the timestamp for context
     * @return formatted output with metadata
     */
    public static String withMetadata(String title, Object object, String serverUrl, String timestamp) {
        StringBuilder output = new StringBuilder();
        
        // Add metadata header
        output.append("=".repeat(60)).append("\n");
        output.append(String.format("📊 %s", title.toUpperCase())).append("\n");
        output.append("=".repeat(60)).append("\n");
        output.append(String.format("Server: %s", serverUrl)).append("\n");
        output.append(String.format("Timestamp: %s", timestamp)).append("\n");
        output.append("-".repeat(60)).append("\n\n");
        
        // Add JSON content
        output.append(toPrettyJsonString(object));
        
        return output.toString();
    }

    /**
     * Create a simple key-value formatted output
     * 
     * @param title the title
     * @param keyValuePairs alternating key-value pairs
     * @return formatted key-value output
     */
    public static String keyValueFormat(String title, String... keyValuePairs) {
        StringBuilder output = new StringBuilder();
        
        output.append(String.format("📊 %s\n", title.toUpperCase()));
        output.append("-".repeat(40)).append("\n");
        
        for (int i = 0; i < keyValuePairs.length; i += 2) {
            if (i + 1 < keyValuePairs.length) {
                output.append(String.format("%-20s: %s\n", keyValuePairs[i], keyValuePairs[i + 1]));
            }
        }
        
        return output.toString();
    }
} 