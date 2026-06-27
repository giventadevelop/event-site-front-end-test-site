package com.nextjstemplate.service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Generic wrapper for Clerk API list responses
 *
 * All Clerk API list endpoints return responses in this format:
 * {
 *   "data": [...],
 *   "total_count": N
 * }
 *
 * Usage:
 * ClerkListResponse<OrganizationMembership> response =
 *     objectMapper.readValue(json,
 *         new TypeReference<ClerkListResponse<OrganizationMembership>>() {});
 *
 * List<OrganizationMembership> memberships = response.getData();
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ClerkListResponse<T> {

    @JsonProperty("data")
    private List<T> data;

    @JsonProperty("total_count")
    private Integer totalCount;

    public ClerkListResponse() {
        this.data = Collections.emptyList();
        this.totalCount = 0;
    }

    public ClerkListResponse(List<T> data, Integer totalCount) {
        this.data = data != null ? data : Collections.emptyList();
        this.totalCount = totalCount != null ? totalCount : 0;
    }

    /**
     * Get data list with null safety
     * @return List of data items, never null
     */
    public List<T> getData() {
        return data != null ? data : Collections.emptyList();
    }

    public void setData(List<T> data) {
        this.data = data;
    }

    public Integer getTotalCount() {
        return totalCount != null ? totalCount : 0;
    }

    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }

    public boolean isEmpty() {
        return getData().isEmpty();
    }

    public int size() {
        return getData().size();
    }
}

/**
 * DTO for Clerk Organization Membership
 *
 * Represents a user's membership in an organization
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrganizationMembership {

    @JsonProperty("object")
    private String object;

    @JsonProperty("id")
    private String id;

    @JsonProperty("public_metadata")
    private Map<String, Object> publicMetadata;

    @JsonProperty("private_metadata")
    private Map<String, Object> privateMetadata;

    @JsonProperty("role")
    private String role;

    @JsonProperty("role_name")
    private String roleName;

    @JsonProperty("permissions")
    private List<String> permissions;

    @JsonProperty("created_at")
    private Long createdAt;

    @JsonProperty("updated_at")
    private Long updatedAt;

    @JsonProperty("organization")
    private Organization organization;

    // Constructors
    public OrganizationMembership() {
        this.permissions = Collections.emptyList();
        this.publicMetadata = Collections.emptyMap();
        this.privateMetadata = Collections.emptyMap();
    }

    // Getters and Setters
    public String getObject() {
        return object;
    }

    public void setObject(String object) {
        this.object = object;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Map<String, Object> getPublicMetadata() {
        return publicMetadata != null ? publicMetadata : Collections.emptyMap();
    }

    public void setPublicMetadata(Map<String, Object> publicMetadata) {
        this.publicMetadata = publicMetadata;
    }

    public Map<String, Object> getPrivateMetadata() {
        return privateMetadata != null ? privateMetadata : Collections.emptyMap();
    }

    public void setPrivateMetadata(Map<String, Object> privateMetadata) {
        this.privateMetadata = privateMetadata;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public List<String> getPermissions() {
        return permissions != null ? permissions : Collections.emptyList();
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public Long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    /**
     * Check if user has specific permission
     */
    public boolean hasPermission(String permission) {
        return getPermissions().contains(permission);
    }

    /**
     * Check if user is admin
     */
    public boolean isAdmin() {
        return "org:admin".equals(role) || hasPermission("org:sys_profile:manage");
    }
}

/**
 * DTO for Clerk Organization
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Organization {

    @JsonProperty("object")
    private String object;

    @JsonProperty("id")
    private String id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("slug")
    private String slug;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("has_image")
    private Boolean hasImage;

    @JsonProperty("created_by")
    private String createdBy;

    @JsonProperty("created_at")
    private Long createdAt;

    @JsonProperty("updated_at")
    private Long updatedAt;

    @JsonProperty("public_metadata")
    private Map<String, Object> publicMetadata;

    @JsonProperty("private_metadata")
    private Map<String, Object> privateMetadata;

    @JsonProperty("max_allowed_memberships")
    private Integer maxAllowedMemberships;

    @JsonProperty("admin_delete_enabled")
    private Boolean adminDeleteEnabled;

    @JsonProperty("members_count")
    private Integer membersCount;

    // Constructors
    public Organization() {
        this.publicMetadata = Collections.emptyMap();
        this.privateMetadata = Collections.emptyMap();
    }

    // Getters and Setters
    public String getObject() {
        return object;
    }

    public void setObject(String object) {
        this.object = object;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getHasImage() {
        return hasImage != null ? hasImage : false;
    }

    public void setHasImage(Boolean hasImage) {
        this.hasImage = hasImage;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public Long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Map<String, Object> getPublicMetadata() {
        return publicMetadata != null ? publicMetadata : Collections.emptyMap();
    }

    public void setPublicMetadata(Map<String, Object> publicMetadata) {
        this.publicMetadata = publicMetadata;
    }

    public Map<String, Object> getPrivateMetadata() {
        return privateMetadata != null ? privateMetadata : Collections.emptyMap();
    }

    public void setPrivateMetadata(Map<String, Object> privateMetadata) {
        this.privateMetadata = privateMetadata;
    }

    public Integer getMaxAllowedMemberships() {
        return maxAllowedMemberships;
    }

    public void setMaxAllowedMemberships(Integer maxAllowedMemberships) {
        this.maxAllowedMemberships = maxAllowedMemberships;
    }

    public Boolean getAdminDeleteEnabled() {
        return adminDeleteEnabled != null ? adminDeleteEnabled : false;
    }

    public void setAdminDeleteEnabled(Boolean adminDeleteEnabled) {
        this.adminDeleteEnabled = adminDeleteEnabled;
    }

    public Integer getMembersCount() {
        return membersCount != null ? membersCount : 0;
    }

    public void setMembersCount(Integer membersCount) {
        this.membersCount = membersCount;
    }
}

/**
 * EXAMPLE USAGE in ClerkIntegrationServiceImpl
 *
 * Replace the buggy code at line 252:
 */
/*
// BEFORE (BUGGY):
List<Map<String, Object>> organizations = objectMapper.readValue(
    responseBody,
    new TypeReference<ArrayList<Map<String, Object>>>() {}
);

// AFTER (FIXED) - Option 1: Using wrapper with Map
ClerkListResponse<Map<String, Object>> response = objectMapper.readValue(
    responseBody,
    new TypeReference<ClerkListResponse<Map<String, Object>>>() {}
);
List<Map<String, Object>> organizations = response.getData();

// AFTER (FIXED) - Option 2: Using strongly-typed DTO (RECOMMENDED)
ClerkListResponse<OrganizationMembership> response = objectMapper.readValue(
    responseBody,
    new TypeReference<ClerkListResponse<OrganizationMembership>>() {}
);
List<OrganizationMembership> organizations = response.getData();

// Then use with type safety:
for (OrganizationMembership membership : organizations) {
    String orgId = membership.getOrganization().getId();
    String orgName = membership.getOrganization().getName();
    boolean isAdmin = membership.isAdmin();

    logger.info("User is {} of organization: {}",
        membership.getRoleName(), orgName);
}
*/
