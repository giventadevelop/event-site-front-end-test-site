package com.nextjstemplate.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextjstemplate.service.dto.ClerkListResponse;
import com.nextjstemplate.service.dto.Organization;
import com.nextjstemplate.service.dto.OrganizationMembership;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Clerk API response deserialization
 *
 * These tests verify that Clerk API responses are correctly parsed
 * and prevent the bug that caused infinite redirect loops.
 */
public class ClerkIntegrationServiceTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Should correctly deserialize organization memberships response")
    public void testDeserializeOrganizationMemberships_Success() throws Exception {
        // Actual response from Clerk API /v1/users/{userId}/organization_memberships
        String clerkApiResponse = """
            {
              "data": [
                {
                  "object": "organization_membership",
                  "id": "orgmem_30l7OUMrDvsmxgIK5rSbzYFZEIa",
                  "public_metadata": {},
                  "private_metadata": {},
                  "role": "org:admin",
                  "role_name": "Admin",
                  "permissions": [
                    "org:sys_profile:manage",
                    "org:sys_profile:delete",
                    "org:sys_memberships:read",
                    "org:sys_memberships:manage",
                    "org:sys_domains:read",
                    "org:sys_domains:manage"
                  ],
                  "created_at": 1754190273226,
                  "updated_at": 1754190273226,
                  "organization": {
                    "object": "organization",
                    "id": "org_30l7OVABY5ReEeDQMRNzyOFosgZ",
                    "name": "Adwiise",
                    "slug": "adw",
                    "image_url": "https://img.clerk.com/example.png",
                    "has_image": true,
                    "created_by": "user_123",
                    "created_at": 1754190273000,
                    "updated_at": 1754190273000,
                    "public_metadata": {},
                    "private_metadata": {},
                    "max_allowed_memberships": 100,
                    "admin_delete_enabled": true,
                    "members_count": 5
                  }
                }
              ],
              "total_count": 1
            }
            """;

        // CORRECT way to deserialize
        ClerkListResponse<OrganizationMembership> response = objectMapper.readValue(
            clerkApiResponse,
            new TypeReference<ClerkListResponse<OrganizationMembership>>() {}
        );

        // Assertions
        assertNotNull(response);
        assertNotNull(response.getData());
        assertEquals(1, response.getTotalCount());
        assertEquals(1, response.getData().size());

        OrganizationMembership membership = response.getData().get(0);
        assertEquals("orgmem_30l7OUMrDvsmxgIK5rSbzYFZEIa", membership.getId());
        assertEquals("org:admin", membership.getRole());
        assertEquals("Admin", membership.getRoleName());
        assertTrue(membership.isAdmin());
        assertEquals(6, membership.getPermissions().size());

        Organization org = membership.getOrganization();
        assertNotNull(org);
        assertEquals("org_30l7OVABY5ReEeDQMRNzyOFosgZ", org.getId());
        assertEquals("Adwiise", org.getName());
        assertEquals("adw", org.getSlug());
        assertEquals(5, org.getMembersCount());
    }

    @Test
    @DisplayName("Should handle empty organizations list")
    public void testDeserializeOrganizationMemberships_EmptyList() throws Exception {
        String clerkApiResponse = """
            {
              "data": [],
              "total_count": 0
            }
            """;

        ClerkListResponse<OrganizationMembership> response = objectMapper.readValue(
            clerkApiResponse,
            new TypeReference<ClerkListResponse<OrganizationMembership>>() {}
        );

        assertNotNull(response);
        assertTrue(response.isEmpty());
        assertEquals(0, response.getTotalCount());
        assertEquals(0, response.size());
    }

    @Test
    @DisplayName("Should handle multiple organizations")
    public void testDeserializeOrganizationMemberships_MultipleOrgs() throws Exception {
        String clerkApiResponse = """
            {
              "data": [
                {
                  "object": "organization_membership",
                  "id": "orgmem_1",
                  "public_metadata": {},
                  "private_metadata": {},
                  "role": "org:admin",
                  "role_name": "Admin",
                  "permissions": ["org:sys_profile:manage"],
                  "created_at": 1754190273226,
                  "updated_at": 1754190273226,
                  "organization": {
                    "object": "organization",
                    "id": "org_1",
                    "name": "First Org",
                    "slug": "first-org",
                    "created_at": 1754190273000,
                    "updated_at": 1754190273000,
                    "public_metadata": {},
                    "private_metadata": {},
                    "members_count": 10
                  }
                },
                {
                  "object": "organization_membership",
                  "id": "orgmem_2",
                  "public_metadata": {},
                  "private_metadata": {},
                  "role": "org:member",
                  "role_name": "Member",
                  "permissions": ["org:sys_profile:read"],
                  "created_at": 1754190273226,
                  "updated_at": 1754190273226,
                  "organization": {
                    "object": "organization",
                    "id": "org_2",
                    "name": "Second Org",
                    "slug": "second-org",
                    "created_at": 1754190273000,
                    "updated_at": 1754190273000,
                    "public_metadata": {},
                    "private_metadata": {},
                    "members_count": 25
                  }
                }
              ],
              "total_count": 2
            }
            """;

        ClerkListResponse<OrganizationMembership> response = objectMapper.readValue(
            clerkApiResponse,
            new TypeReference<ClerkListResponse<OrganizationMembership>>() {}
        );

        assertEquals(2, response.getTotalCount());
        assertEquals(2, response.getData().size());

        // First org - admin
        OrganizationMembership firstMembership = response.getData().get(0);
        assertTrue(firstMembership.isAdmin());
        assertEquals("First Org", firstMembership.getOrganization().getName());

        // Second org - member
        OrganizationMembership secondMembership = response.getData().get(1);
        assertFalse(secondMembership.isAdmin());
        assertEquals("Second Org", secondMembership.getOrganization().getName());
    }

    @Test
    @DisplayName("REGRESSION TEST: Old buggy code should fail")
    public void testOldBuggyDeserialization_ShouldFail() {
        String clerkApiResponse = """
            {
              "data": [
                {
                  "id": "orgmem_123",
                  "role": "org:admin"
                }
              ],
              "total_count": 1
            }
            """;

        // This is the OLD BUGGY code that caused the issue
        // It should throw an exception because Clerk returns { data: [...] }, not [...]
        assertThrows(Exception.class, () -> {
            List<Map<String, Object>> result = objectMapper.readValue(
                clerkApiResponse,
                new TypeReference<List<Map<String, Object>>>() {}
            );
        });
    }

    @Test
    @DisplayName("Should handle missing optional fields gracefully")
    public void testDeserializeOrganizationMemberships_MissingFields() throws Exception {
        String clerkApiResponse = """
            {
              "data": [
                {
                  "object": "organization_membership",
                  "id": "orgmem_123",
                  "role": "org:admin",
                  "role_name": "Admin",
                  "created_at": 1754190273226,
                  "updated_at": 1754190273226,
                  "organization": {
                    "object": "organization",
                    "id": "org_123",
                    "name": "Test Org",
                    "slug": "test-org",
                    "created_at": 1754190273000,
                    "updated_at": 1754190273000
                  }
                }
              ],
              "total_count": 1
            }
            """;

        ClerkListResponse<OrganizationMembership> response = objectMapper.readValue(
            clerkApiResponse,
            new TypeReference<ClerkListResponse<OrganizationMembership>>() {}
        );

        OrganizationMembership membership = response.getData().get(0);

        // Should handle missing fields with defaults
        assertNotNull(membership.getPermissions());
        assertTrue(membership.getPermissions().isEmpty());
        assertNotNull(membership.getPublicMetadata());
        assertTrue(membership.getPublicMetadata().isEmpty());
        assertNotNull(membership.getPrivateMetadata());
        assertTrue(membership.getPrivateMetadata().isEmpty());

        Organization org = membership.getOrganization();
        assertEquals(0, org.getMembersCount()); // Default to 0
        assertFalse(org.getHasImage()); // Default to false
    }

    @Test
    @DisplayName("Should correctly identify admin permissions")
    public void testAdminPermissionCheck() throws Exception {
        String adminResponse = """
            {
              "data": [
                {
                  "object": "organization_membership",
                  "id": "orgmem_1",
                  "role": "org:admin",
                  "role_name": "Admin",
                  "permissions": ["org:sys_profile:manage"],
                  "created_at": 1754190273226,
                  "updated_at": 1754190273226,
                  "public_metadata": {},
                  "private_metadata": {},
                  "organization": {
                    "object": "organization",
                    "id": "org_1",
                    "name": "Test Org",
                    "slug": "test",
                    "created_at": 1754190273000,
                    "updated_at": 1754190273000,
                    "public_metadata": {},
                    "private_metadata": {},
                    "members_count": 1
                  }
                }
              ],
              "total_count": 1
            }
            """;

        ClerkListResponse<OrganizationMembership> response = objectMapper.readValue(
            adminResponse,
            new TypeReference<ClerkListResponse<OrganizationMembership>>() {}
        );

        OrganizationMembership membership = response.getData().get(0);
        assertTrue(membership.isAdmin());
        assertTrue(membership.hasPermission("org:sys_profile:manage"));
        assertFalse(membership.hasPermission("org:sys_profile:delete"));
    }

    @Test
    @DisplayName("Should use wrapper class for backward compatibility with Map")
    public void testDeserializeWithMap_UsingWrapper() throws Exception {
        // For legacy code that still uses Map<String, Object>
        String clerkApiResponse = """
            {
              "data": [
                {
                  "id": "orgmem_123",
                  "role": "org:admin"
                }
              ],
              "total_count": 1
            }
            """;

        // Use wrapper class even with Map (better than direct List deserialization)
        ClerkListResponse<Map<String, Object>> response = objectMapper.readValue(
            clerkApiResponse,
            new TypeReference<ClerkListResponse<Map<String, Object>>>() {}
        );

        assertEquals(1, response.getTotalCount());
        Map<String, Object> membership = response.getData().get(0);
        assertEquals("orgmem_123", membership.get("id"));
        assertEquals("org:admin", membership.get("role"));
    }
}
