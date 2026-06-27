# Backend Implementation Prompt: Email Header Image Upload Endpoint

## Overview
The frontend needs a new REST API endpoint to upload email header images for tenant settings. This endpoint should follow the exact same pattern as the existing **tenant logo upload** endpoint (`/api/tenant-settings/upload/tenant-logo`).

## Current Status
- ✅ **Frontend Implementation**: Complete
- ✅ **Database Schema**: Field `email_header_image_url VARCHAR(2048) NULL` exists in `public.tenant_settings` table
- ❌ **Backend Endpoint**: Missing (404 error when calling endpoint)

## Required Endpoint

### Endpoint Details
- **URL**: `POST /api/tenant-settings/upload/email-header-image`
- **Content-Type**: `multipart/form-data`
- **Authentication**: JWT Bearer token (required)
- **Tenant ID**: Passed via `X-Tenant-ID` header

### Request Format
```
POST /api/tenant-settings/upload/email-header-image
Headers:
  Authorization: Bearer <jwt_token>
  X-Tenant-ID: <tenant_id>
  Content-Type: multipart/form-data

Body:
  file: <image_file> (multipart file upload)
```

### Expected Response Format

**Success Response (200 OK):**
```json
{
  "emailHeaderImageUrl": "https://s3.amazonaws.com/bucket/path/to/email-header-image.jpg"
}
```

**Alternative Success Response (if backend uses different field name):**
```json
{
  "url": "https://s3.amazonaws.com/bucket/path/to/email-header-image.jpg"
}
```

**Error Response (400/500):**
```json
{
  "error": "Error message describing what went wrong"
}
```

## Reference Implementation: Tenant Logo Upload

The backend should replicate the exact same logic used for tenant logo upload. Here's what the tenant logo endpoint does:

1. **Accepts multipart file upload** with field name `file`
2. **Validates the file** (image type, size limits)
3. **Uploads to S3** (or configured storage service)
4. **Updates the tenant_settings record** with the new URL in the `logo_image_url` field
5. **Returns the S3 URL** in the response

### Expected Behavior for Email Header Image Upload

1. **Accepts multipart file upload** with field name `file`
2. **Validates the file** (image type: PNG, JPG, JPEG, GIF, WEBP; size limits - same as logo)
3. **Uploads to S3** (or configured storage service)
4. **Updates the tenant_settings record** with the new URL in the `email_header_image_url` field
5. **Returns the S3 URL** in the response

## Database Schema Reference

The `email_header_image_url` field already exists in the database:

```sql
CREATE TABLE public.tenant_settings (
    -- ... other fields ...
    email_header_image_url VARCHAR(2048) NULL,
    email_footer_html_url VARCHAR(2048),
    logo_image_url VARCHAR(2048),
    -- ... other fields ...
);
```

**Location**: `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_11.sql` (line 2019)

## Frontend Call Pattern

The frontend calls this endpoint via a Next.js proxy route:

**Frontend Proxy Route**: `src/pages/api/proxy/tenant-settings/upload/email-header-image.ts`

**Frontend Client Function**: `src/app/admin/tenant-management/settings/ApiServerActions.ts`
```typescript
export async function uploadEmailHeaderImageClient(file: File): Promise<{ url: string }> {
  const baseUrl = getAppUrl();
  const formData = new FormData();
  formData.append('file', file);

  const url = `${baseUrl}/api/proxy/tenant-settings/upload/email-header-image`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload email header image. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.emailHeaderImageUrl || result.url || '',
  };
}
```

## Implementation Checklist

- [ ] Create endpoint `POST /api/tenant-settings/upload/email-header-image`
- [ ] Accept `multipart/form-data` with field name `file`
- [ ] Validate file type (images only: PNG, JPG, JPEG, GIF, WEBP)
- [ ] Validate file size (use same limits as tenant logo upload)
- [ ] Upload file to S3/storage service
- [ ] Update `tenant_settings.email_header_image_url` field with S3 URL
- [ ] Return JSON response with `emailHeaderImageUrl` field (or `url` field)
- [ ] Handle errors gracefully with appropriate HTTP status codes
- [ ] Ensure JWT authentication is enforced
- [ ] Ensure tenant ID is validated from `X-Tenant-ID` header

## Testing Requirements

1. **Test successful upload**:
   - Upload a valid image file
   - Verify S3 upload succeeds
   - Verify database record is updated
   - Verify response contains correct URL

2. **Test error cases**:
   - Invalid file type (non-image)
   - File too large
   - Missing JWT token (401)
   - Invalid tenant ID
   - Database update failure

3. **Test with existing tenant logo endpoint**:
   - Ensure both endpoints work independently
   - Ensure both can be called for the same tenant_settings record

## API Documentation Reference

Please update the Swagger/OpenAPI documentation (`documentation/Swagger_API_Docs/api-docs.json`) to include this new endpoint, following the same structure as the tenant logo upload endpoint.

## Related Files

### Frontend Files (Already Implemented)
- `src/pages/api/proxy/tenant-settings/upload/email-header-image.ts` - Proxy route
- `src/app/admin/tenant-management/settings/ApiServerActions.ts` - Client upload function
- `src/app/admin/tenant-management/components/TenantSettingsForm.tsx` - UI component
- `src/types/index.ts` - DTO definition (includes `emailHeaderImageUrl?: string`)

### Backend Reference (To Implement)
- Spring Boot Controller: Similar to tenant logo upload controller
- Service Layer: Similar to tenant logo upload service
- Repository: Update `TenantSettings` entity (field already exists in DB)

## Notes

1. **Field Name Consistency**: The frontend expects either `emailHeaderImageUrl` or `url` in the response. Use `emailHeaderImageUrl` to match the database field name.

2. **Tenant Isolation**: Ensure the endpoint validates that the tenant ID matches the authenticated user's tenant, preventing cross-tenant updates.

3. **File Storage**: Use the same S3 bucket/path structure as tenant logo uploads for consistency.

4. **Error Messages**: Provide clear, actionable error messages in the response for debugging.

## Questions or Issues?

If you encounter any issues or need clarification:
- Check the existing tenant logo upload implementation for reference
- Verify the database schema includes `email_header_image_url` field
- Ensure the endpoint path matches exactly: `/api/tenant-settings/upload/email-header-image`
- Test with Postman/curl first before frontend integration

---

**Backend Project Location**: `E:\project_workspace\malayalees-us-site-boot`

**Frontend Project Location**: `E:\project_workspace\mosc-temp`

**Priority**: High - Frontend is ready and waiting for backend endpoint

