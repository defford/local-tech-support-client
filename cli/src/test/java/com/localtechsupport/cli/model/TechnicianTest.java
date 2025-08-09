package com.localtechsupport.cli.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

/**
 * Unit tests for the Technician model class
 */
public class TechnicianTest {

    private Technician technician;
    private LocalDateTime testDateTime;

    @BeforeEach
    void setUp() {
        testDateTime = LocalDateTime.of(2024, 6, 24, 10, 30);
        technician = new Technician();
    }

    @Test
    void testBasicPropertiesAndGetters() {
        // Test setters and getters
        technician.setId(1L);
        technician.setFirstName("Alice");
        technician.setLastName("Johnson");
        technician.setEmail("alice.johnson@company.com");
        technician.setPhone("+1-555-0456");
        technician.setStatus("ACTIVE");
        technician.setSkills(Arrays.asList("HARDWARE", "SOFTWARE", "NETWORK"));
        technician.setCreatedAt(testDateTime);
        technician.setUpdatedAt(testDateTime.plusHours(1));

        assertEquals(1L, technician.getId());
        assertEquals("Alice", technician.getFirstName());
        assertEquals("Johnson", technician.getLastName());
        assertEquals("alice.johnson@company.com", technician.getEmail());
        assertEquals("+1-555-0456", technician.getPhone());
        assertEquals("ACTIVE", technician.getStatus());
        assertEquals(Arrays.asList("HARDWARE", "SOFTWARE", "NETWORK"), technician.getSkills());
        assertEquals(testDateTime, technician.getCreatedAt());
        assertEquals(testDateTime.plusHours(1), technician.getUpdatedAt());
    }

    @Test
    void testGetFullName() {
        // Test with both first and last names
        technician.setFirstName("Alice");
        technician.setLastName("Johnson");
        assertEquals("Alice Johnson", technician.getFullName());

        // Test with only first name
        technician.setFirstName("Alice");
        technician.setLastName(null);
        assertEquals("Alice", technician.getFullName());

        // Test with only last name
        technician.setFirstName(null);
        technician.setLastName("Johnson");
        assertEquals("Johnson", technician.getFullName());

        // Test with both names null
        technician.setFirstName(null);
        technician.setLastName(null);
        assertEquals("", technician.getFullName());

        // Test with whitespace
        technician.setFirstName("  Alice  ");
        technician.setLastName("  Johnson  ");
        assertEquals("Alice Johnson", technician.getFullName());
    }

    @Test
    void testIsActive() {
        // Test active status (case insensitive)
        technician.setStatus("ACTIVE");
        assertTrue(technician.isActive());

        technician.setStatus("active");
        assertTrue(technician.isActive());

        technician.setStatus("Active");
        assertTrue(technician.isActive());

        // Test inactive statuses
        technician.setStatus("ON_VACATION");
        assertFalse(technician.isActive());

        technician.setStatus("SICK_LEAVE");
        assertFalse(technician.isActive());

        technician.setStatus("TERMINATED");
        assertFalse(technician.isActive());

        // Test null status
        technician.setStatus(null);
        assertFalse(technician.isActive());

        // Test empty status
        technician.setStatus("");
        assertFalse(technician.isActive());
    }

    @Test
    void testHasSkill() {
        technician.setSkills(Arrays.asList("HARDWARE", "SOFTWARE", "NETWORK"));

        // Test existing skills (case insensitive)
        assertTrue(technician.hasSkill("HARDWARE"));
        assertTrue(technician.hasSkill("hardware"));
        assertTrue(technician.hasSkill("Hardware"));
        assertTrue(technician.hasSkill("SOFTWARE"));
        assertTrue(technician.hasSkill("NETWORK"));

        // Test non-existing skill
        assertFalse(technician.hasSkill("DATABASE"));
        assertFalse(technician.hasSkill("SECURITY"));

        // Test with null skill
        assertFalse(technician.hasSkill(null));

        // Test with empty skill
        assertFalse(technician.hasSkill(""));

        // Test with null skills list
        technician.setSkills(null);
        assertFalse(technician.hasSkill("HARDWARE"));

        // Test with empty skills list
        technician.setSkills(new ArrayList<>());
        assertFalse(technician.hasSkill("HARDWARE"));
    }

    @Test
    void testIsAvailableForServiceType() {
        technician.setStatus("ACTIVE");
        technician.setSkills(Arrays.asList("HARDWARE", "SOFTWARE", "NETWORK"));

        // Test with matching skill and active status
        assertTrue(technician.isAvailableForServiceType("HARDWARE"));
        assertTrue(technician.isAvailableForServiceType("hardware"));
        assertTrue(technician.isAvailableForServiceType("SOFTWARE"));

        // Test with non-matching skill but active status
        assertFalse(technician.isAvailableForServiceType("DATABASE"));

        // Test with matching skill but inactive status
        technician.setStatus("ON_VACATION");
        assertFalse(technician.isAvailableForServiceType("HARDWARE"));

        // Test with null service type
        technician.setStatus("ACTIVE");
        assertFalse(technician.isAvailableForServiceType(null));

        // Test with null skills
        technician.setSkills(null);
        assertFalse(technician.isAvailableForServiceType("HARDWARE"));
    }

    @Test
    void testEqualsAndHashCode() {
        Technician tech1 = new Technician();
        tech1.setId(1L);
        tech1.setFirstName("Alice");
        tech1.setLastName("Johnson");
        tech1.setEmail("alice.johnson@company.com");
        tech1.setSkills(Arrays.asList("HARDWARE", "SOFTWARE"));

        Technician tech2 = new Technician();
        tech2.setId(1L);
        tech2.setFirstName("Alice");
        tech2.setLastName("Johnson");
        tech2.setEmail("alice.johnson@company.com");
        tech2.setSkills(Arrays.asList("HARDWARE", "SOFTWARE"));

        Technician tech3 = new Technician();
        tech3.setId(2L);
        tech3.setFirstName("Bob");
        tech3.setLastName("Smith");
        tech3.setEmail("bob.smith@company.com");

        // Test equality
        assertEquals(tech1, tech2);
        assertNotEquals(tech1, tech3);

        // Test hash code
        assertEquals(tech1.hashCode(), tech2.hashCode());
        assertNotEquals(tech1.hashCode(), tech3.hashCode());

        // Test with null
        assertNotEquals(tech1, null);
        assertNotEquals(tech1, "not a technician");
    }

    @Test
    void testToString() {
        technician.setId(1L);
        technician.setFirstName("Alice");
        technician.setLastName("Johnson");
        technician.setEmail("alice.johnson@company.com");
        technician.setStatus("ACTIVE");
        technician.setSkills(Arrays.asList("HARDWARE", "SOFTWARE"));

        String result = technician.toString();
        assertNotNull(result);
        assertTrue(result.contains("Technician"));
        assertTrue(result.contains("id=1"));
        assertTrue(result.contains("Alice Johnson"));
        assertTrue(result.contains("alice.johnson@company.com"));
        assertTrue(result.contains("ACTIVE"));
        assertTrue(result.contains("HARDWARE"));
        assertTrue(result.contains("SOFTWARE"));
    }

    @Test
    void testConstructorWithParameters() {
        List<String> skills = Arrays.asList("HARDWARE", "SOFTWARE");
        Technician paramTech = new Technician(
            1L, 
            "Alice", 
            "Johnson", 
            "alice.johnson@company.com", 
            "+1-555-0456", 
            "ACTIVE",
            skills,
            "Alice Johnson",
            testDateTime,
            testDateTime.plusHours(1),
            2,
            true
        );

        assertEquals(1L, paramTech.getId());
        assertEquals("Alice", paramTech.getFirstName());
        assertEquals("Johnson", paramTech.getLastName());
        assertEquals("alice.johnson@company.com", paramTech.getEmail());
        assertEquals("+1-555-0456", paramTech.getPhone());
        assertEquals("ACTIVE", paramTech.getStatus());
        assertEquals(skills, paramTech.getSkills());
        assertEquals(testDateTime, paramTech.getCreatedAt());
        assertEquals(testDateTime.plusHours(1), paramTech.getUpdatedAt());
    }

    @Test
    void testSkillsManipulation() {
        // Test modifiable skills list
        List<String> skills = new ArrayList<>(Arrays.asList("HARDWARE", "SOFTWARE"));
        technician.setSkills(skills);

        // Verify original skills
        assertTrue(technician.hasSkill("HARDWARE"));
        assertTrue(technician.hasSkill("SOFTWARE"));
        assertFalse(technician.hasSkill("NETWORK"));

        // Modify the skills list
        skills.add("NETWORK");
        technician.setSkills(skills);
        
        // Verify updated skills
        assertTrue(technician.hasSkill("NETWORK"));
        assertEquals(3, technician.getSkills().size());

        // Test skill removal
        skills.remove("SOFTWARE");
        technician.setSkills(skills);
        
        assertFalse(technician.hasSkill("SOFTWARE"));
        assertTrue(technician.hasSkill("HARDWARE"));
        assertTrue(technician.hasSkill("NETWORK"));
    }

    @Test
    void testEdgeCases() {
        // Test with duplicate skills
        technician.setSkills(Arrays.asList("HARDWARE", "HARDWARE", "SOFTWARE"));
        assertTrue(technician.hasSkill("HARDWARE"));
        assertTrue(technician.hasSkill("SOFTWARE"));

        // Test with empty string skills
        technician.setSkills(Arrays.asList("HARDWARE", "", "SOFTWARE"));
        assertTrue(technician.hasSkill("HARDWARE"));
        assertFalse(technician.hasSkill(""));
        assertTrue(technician.hasSkill("SOFTWARE"));

        // Test with whitespace in skills
        technician.setSkills(Arrays.asList("  HARDWARE  ", "SOFTWARE"));
        assertTrue(technician.hasSkill("HARDWARE"));
        assertTrue(technician.hasSkill("  HARDWARE  "));

        // Test special characters in names
        technician.setFirstName("José");
        technician.setLastName("García-López");
        assertEquals("José García-López", technician.getFullName());
    }

    @Test
    void testNullSafeOperations() {
        // Ensure operations are null-safe
        Technician nullTech = new Technician();
        
        // These should not throw exceptions
        assertNotNull(nullTech.getFullName());
        assertFalse(nullTech.isActive());
        assertFalse(nullTech.hasSkill("HARDWARE"));
        assertFalse(nullTech.isAvailableForServiceType("HARDWARE"));
        assertNotNull(nullTech.toString());
        
        // Test equals with null fields
        Technician anotherNullTech = new Technician();
        assertEquals(nullTech, anotherNullTech);
    }
} 