package com.localtechsupport.cli.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

/**
 * Unit tests for the Client model class
 */
public class ClientTest {

    private Client client;
    private LocalDateTime testDateTime;

    @BeforeEach
    void setUp() {
        testDateTime = LocalDateTime.of(2024, 6, 24, 10, 30);
        client = new Client();
    }

    @Test
    void testBasicPropertiesAndGetters() {
        // Test setters and getters
        client.setId(1L);
        client.setFirstName("John");
        client.setLastName("Doe");
        client.setEmail("john.doe@example.com");
        client.setPhone("+1-555-0123");
        client.setStatus("ACTIVE");
        client.setCreatedAt(testDateTime);
        client.setUpdatedAt(testDateTime.plusHours(1));

        assertEquals(1L, client.getId());
        assertEquals("John", client.getFirstName());
        assertEquals("Doe", client.getLastName());
        assertEquals("john.doe@example.com", client.getEmail());
        assertEquals("+1-555-0123", client.getPhone());
        assertEquals("ACTIVE", client.getStatus());
        assertEquals(testDateTime, client.getCreatedAt());
        assertEquals(testDateTime.plusHours(1), client.getUpdatedAt());
    }

    @Test
    void testGetFullName() {
        // Test with both first and last names
        client.setFirstName("John");
        client.setLastName("Doe");
        assertEquals("John Doe", client.getFullName());

        // Test with only first name
        client.setFirstName("John");
        client.setLastName(null);
        assertEquals("John", client.getFullName());

        // Test with only last name
        client.setFirstName(null);
        client.setLastName("Doe");
        assertEquals("Doe", client.getFullName());

        // Test with both names null
        client.setFirstName(null);
        client.setLastName(null);
        assertEquals("", client.getFullName());

        // Test with empty strings
        client.setFirstName("");
        client.setLastName("");
        assertEquals("", client.getFullName());

        // Test with whitespace
        client.setFirstName("  John  ");
        client.setLastName("  Doe  ");
        assertEquals("John Doe", client.getFullName());
    }

    @Test
    void testIsActive() {
        // Test active status (case insensitive)
        client.setStatus("ACTIVE");
        assertTrue(client.isActive());

        client.setStatus("active");
        assertTrue(client.isActive());

        client.setStatus("Active");
        assertTrue(client.isActive());

        // Test inactive statuses
        client.setStatus("INACTIVE");
        assertFalse(client.isActive());

        client.setStatus("SUSPENDED");
        assertFalse(client.isActive());

        client.setStatus("TERMINATED");
        assertFalse(client.isActive());

        // Test null status
        client.setStatus(null);
        assertFalse(client.isActive());

        // Test empty status
        client.setStatus("");
        assertFalse(client.isActive());
    }

    @Test
    void testEqualsAndHashCode() {
        Client client1 = new Client();
        client1.setId(1L);
        client1.setFirstName("John");
        client1.setLastName("Doe");
        client1.setEmail("john.doe@example.com");

        Client client2 = new Client();
        client2.setId(1L);
        client2.setFirstName("John");
        client2.setLastName("Doe");
        client2.setEmail("john.doe@example.com");

        Client client3 = new Client();
        client3.setId(2L);
        client3.setFirstName("Jane");
        client3.setLastName("Smith");
        client3.setEmail("jane.smith@example.com");

        // Test equality
        assertEquals(client1, client2);
        assertNotEquals(client1, client3);

        // Test hash code
        assertEquals(client1.hashCode(), client2.hashCode());
        assertNotEquals(client1.hashCode(), client3.hashCode());

        // Test with null
        assertNotEquals(client1, null);
        assertNotEquals(client1, "not a client");
    }

    @Test
    void testToString() {
        client.setId(1L);
        client.setFirstName("John");
        client.setLastName("Doe");
        client.setEmail("john.doe@example.com");
        client.setStatus("ACTIVE");

        String result = client.toString();
        assertNotNull(result);
        assertTrue(result.contains("Client"));
        assertTrue(result.contains("id=1"));
        assertTrue(result.contains("John Doe"));
        assertTrue(result.contains("john.doe@example.com"));
        assertTrue(result.contains("ACTIVE"));
    }

    @Test
    void testConstructorWithParameters() {
        Client paramClient = new Client(
            1L, 
            "John", 
            "Doe", 
            "john.doe@example.com", 
            "+1-555-0123", 
            "ACTIVE",
            testDateTime,
            testDateTime.plusHours(1)
        );

        assertEquals(1L, paramClient.getId());
        assertEquals("John", paramClient.getFirstName());
        assertEquals("Doe", paramClient.getLastName());
        assertEquals("john.doe@example.com", paramClient.getEmail());
        assertEquals("+1-555-0123", paramClient.getPhone());
        assertEquals("ACTIVE", paramClient.getStatus());
        assertEquals(testDateTime, paramClient.getCreatedAt());
        assertEquals(testDateTime.plusHours(1), paramClient.getUpdatedAt());
    }

    @Test
    void testEdgeCases() {
        // Test very long names
        String longName = "A".repeat(100);
        client.setFirstName(longName);
        client.setLastName(longName);
        assertEquals(longName + " " + longName, client.getFullName());

        // Test special characters in names
        client.setFirstName("José");
        client.setLastName("García-López");
        assertEquals("José García-López", client.getFullName());

        // Test numbers in names
        client.setFirstName("John2");
        client.setLastName("Doe3");
        assertEquals("John2 Doe3", client.getFullName());

        // Test unusual but valid email formats
        client.setEmail("user+tag@domain.co.uk");
        assertEquals("user+tag@domain.co.uk", client.getEmail());

        // Test phone number formats
        client.setPhone("(555) 123-4567");
        assertEquals("(555) 123-4567", client.getPhone());
    }

    @Test
    void testNullSafeOperations() {
        // Ensure operations are null-safe
        Client nullClient = new Client();
        
        // These should not throw exceptions
        assertNotNull(nullClient.getFullName());
        assertFalse(nullClient.isActive());
        assertNotNull(nullClient.toString());
        
        // Test equals with null fields
        Client anotherNullClient = new Client();
        assertEquals(nullClient, anotherNullClient);
    }
} 