# Program Director Photo Upload Issue - Comprehensive Analysis & Solution

## 🚨 **Issue Summary**
The program director photo upload functionality is failing with **HTTP 415 (Unsupported Media Type)** error. The implementation needs to follow the exact Swagger API specification and adhere to the established cursor rules for Next.js API routes.

## 📋 **Current Error Details**

### Frontend Error
```
POST http://localhost:3000/api/event-medias/upload/program-director/4301/photo?eventId=2&title=photo&description=Uploaded%20image&tenantId=tenant_demo_001&isPublic=true 415 (Unsupported Media Type)
```

### Backend Logs
```
❌ Program Director Photo Upload Proxy: Backend upload failed - HTTP status: 415
```

## 🎯 **Swagger API Specification**

### Endpoint Details
- **URL**: `/api/event-medias/upload/program-director/{entityId}/photo`
- **Method**: `POST`
- **Operation ID**: `uploadProgramDirectorPhoto`

### Required Parameters (Query Parameters)
1. **eventId** (required): `integer` (int64)
2. **title** (required): `string`
3. **description** (optional): `string`
4. **tenantId** (required): `string`
5. **isPublic** (optional): `boolean`

### Request Body
- **Content-Type**: `multipart/form-data`
- **Required Field**: `file` (binary)

### Response
- **Success**: `200 OK` with `EventMediaDTO` schema
- **Content-Type**: `application/json`

## 🔧 **Current Implementation Issues**

### 1. **Wrong Endpoint Usage**
- **Problem**: Currently trying to use `/api/event-medias/upload-multiple` (generic endpoint)
- **Solution**: Must use `/api/event-medias/upload/program-director/{entityId}/photo` (specific endpoint)

### 2. **Incorrect Parameter Format**
- **Problem**: Sending parameters as FormData in request body
- **Solution**: Send parameters as query parameters in URL

### 3. **Missing Proxy Pattern Compliance**
- **Problem**: Not following established cursor rules for API routes
- **Solution**: Use proxy pattern as per `nextjs_api_routes.mdc` guidelines

## 📁 **File Structure & Implementation**

### Current Files Involved
1. **Frontend Component**: `src/components/ui/ImageUpload.tsx`
2. **API Route**: `src/pages/api/event-medias/upload/program-director/[entityId]/photo.ts`
3. **Proxy Handler**: `src/pages/api/proxy/event-medias/upload/program-director/[entityId]/photo.ts`
4. **Reference Implementation**: `src/app/admin/events/[id]/media/ApiServerActions.ts`

### Reference Implementation (Working Example)
**Location**: `http://localhost:3000/admin/events/5/media`
**Pattern**: Uses `/api/proxy/event-medias/upload-multiple` with FormData parameters

## 🛠️ **Required Solution Approach**

### 1. **Follow Swagger Specification Exactly**
```typescript
// Correct URL structure
const apiUrl = `${API_BASE_URL}/api/event-medias/upload/program-director/${entityId}/photo?${queryParams}`;

// Query parameters (not form data)
const params = new URLSearchParams();
params.append('eventId', eventId);
params.append('title', title);
params.append('description', description);
params.append('tenantId', tenantId);
params.append('isPublic', isPublic.toString());
```

### 2. **Use Proxy Pattern (Cursor Rules Compliance)**
- Create dedicated proxy endpoint: `/api/proxy/event-medias/upload/program-director/[entityId]/photo`
- Use `fetchWithJwtRetry` for authentication
- Follow established patterns from `nextjs_api_routes.mdc`

### 3. **Proper Multipart Form Data Handling**
```typescript
// Forward the original request body (contains file)
const apiRes = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': req.headers['content-type'],
    'Content-Length': req.headers['content-length']
  },
  body: req, // Raw request stream with multipart form data
  duplex: 'half' // Required for Node.js fetch
});
```

## 📝 **Implementation Checklist**

### ✅ **Backend API Route** (`src/pages/api/proxy/event-medias/upload/program-director/[entityId]/photo.ts`)
- [ ] Use correct endpoint: `/api/event-medias/upload/program-director/{entityId}/photo`
- [ ] Send parameters as query parameters (not form data)
- [ ] Forward multipart form data with file in request body
- [ ] Use `fetchWithJwtRetry` for authentication
- [ ] Handle JWT token refresh logic
- [ ] Proper error handling and logging
- [ ] Disable bodyParser: `bodyParser: false`

### ✅ **Frontend Component** (`src/components/ui/ImageUpload.tsx`)
- [ ] Construct correct URL with query parameters
- [ ] Send file as multipart form data
- [ ] Handle success/error responses properly
- [ ] Remove any incorrect parameters (like `isTeamMemberProfileImage`)

### ✅ **Cursor Rules Compliance**
- [ ] Follow `nextjs_api_routes.mdc` guidelines
- [ ] Use proxy pattern for all backend calls
- [ ] Implement proper JWT authentication
- [ ] Use `getAppUrl()` for port-agnostic URLs
- [ ] Follow established error handling patterns

## 🔍 **Debugging Information**

### Current Request Flow
1. **Frontend**: `ImageUpload.tsx` → `/api/event-medias/upload/program-director/4301/photo`
2. **Next.js API Route**: Handles request and forwards to proxy
3. **Proxy**: `/api/proxy/event-medias/upload/program-director/4301/photo`
4. **Backend**: Should receive request at `/api/event-medias/upload/program-director/4301/photo`

### Expected Request Format
```
POST /api/event-medias/upload/program-director/4301/photo?eventId=2&title=photo&description=Uploaded%20image&tenantId=tenant_demo_001&isPublic=true
Content-Type: multipart/form-data

[file binary data]
```

## 🎯 **Success Criteria**

1. **No HTTP 415 Error**: Request should be accepted by backend
2. **Correct Parameter Binding**: Backend should receive all required parameters
3. **File Upload Success**: Image should be uploaded and stored
4. **Proper Response**: Should return `EventMediaDTO` with success status
5. **Cursor Rules Compliance**: Implementation should follow established patterns

## 📚 **References**

### Swagger Documentation
- **File**: `documentation/Swagger_API_Docs/api-docs.json`
- **Endpoint**: `/api/event-medias/upload/program-director/{entityId}/photo`
- **Line**: 33874 (sponsor endpoint reference)

### Cursor Rules
- **File**: `.cursor/rules/nextjs_api_routes.mdc`
- **Key Points**: Proxy pattern, JWT authentication, error handling

### Working Example
- **URL**: `http://localhost:3000/admin/events/5/media`
- **Pattern**: Uses `/api/proxy/event-medias/upload-multiple` with FormData
- **Files**: `src/app/admin/events/[id]/media/ApiServerActions.ts`

## 🚀 **Next Steps**

1. **Verify Current Implementation**: Check if the latest fix resolves the 415 error
2. **Test Upload Functionality**: Attempt to upload a program director photo
3. **Monitor Backend Logs**: Ensure backend receives the request correctly
4. **Validate Response**: Confirm successful upload and proper response format
5. **Cross-Reference**: Compare with working media upload implementation

---

**Created**: 2025-01-16
**Status**: In Progress
**Priority**: High
**Assigned**: AI Assistant
**Related Issues**: HTTP 415 Error, Parameter Binding, Cursor Rules Compliance



