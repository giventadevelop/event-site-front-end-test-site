# Performer & Sponsor Image Upload Implementation

## 🎯 **Overview**
This document outlines the implementation of image upload functionality for **Featured Performers** and **Sponsors** following the same pattern as the Program Director photo upload feature.

## 📋 **API Endpoints Implemented**

### 1. Featured Performer Image Upload
- **Frontend URL**: `/api/proxy/event-medias/upload/featured-performer`
- **Backend URL**: `/api/event-medias/upload/featured-performer`
- **Proxy File**: `src/pages/api/proxy/event-medias/upload/featured-performer.ts`

### 2. Sponsor Image Upload
- **Frontend URL**: `/api/proxy/event-medias/upload/sponsor`
- **Backend URL**: `/api/event-medias/upload/sponsor`
- **Proxy File**: `src/pages/api/proxy/event-medias/upload/sponsor.ts`

## 🔧 **Swagger API Specifications**

### Featured Performer Endpoint
```json
"/api/event-medias/upload/featured-performer": {
  "post": {
    "operationId": "uploadFeaturedPerformerImage",
    "parameters": [
      { "name": "eventId", "in": "query", "required": true, "type": "integer" },
      { "name": "entityId", "in": "query", "required": true, "type": "integer" },
      { "name": "imageType", "in": "query", "required": true, "type": "string" },
      { "name": "title", "in": "query", "required": true, "type": "string" },
      { "name": "description", "in": "query", "required": false, "type": "string" },
      { "name": "tenantId", "in": "query", "required": true, "type": "string" },
      { "name": "isPublic", "in": "query", "required": false, "type": "boolean" }
    ],
    "requestBody": {
      "content": {
        "multipart/form-data": {
          "schema": {
            "required": ["file"],
            "properties": {
              "file": { "type": "string", "format": "binary" }
            }
          }
        }
      }
    }
  }
}
```

### Sponsor Endpoint
```json
"/api/event-medias/upload/sponsor": {
  "post": {
    "operationId": "uploadSponsorImage",
    "parameters": [
      { "name": "eventId", "in": "query", "required": true, "type": "integer" },
      { "name": "entityId", "in": "query", "required": true, "type": "integer" },
      { "name": "imageType", "in": "query", "required": true, "type": "string" },
      { "name": "title", "in": "query", "required": true, "type": "string" },
      { "name": "description", "in": "query", "required": false, "type": "string" },
      { "name": "tenantId", "in": "query", "required": true, "type": "string" },
      { "name": "isPublic", "in": "query", "required": false, "type": "boolean" }
    ],
    "requestBody": {
      "content": {
        "multipart/form-data": {
          "schema": {
            "required": ["file"],
            "properties": {
              "file": { "type": "string", "format": "binary" }
            }
          }
        }
      }
    }
  }
}
```

## 🏗️ **Implementation Details**

### Proxy Handler Pattern
Both proxy handlers follow the established pattern from the program director implementation:

1. **JWT Authentication**: Uses `getCachedApiJwt()` with retry logic
2. **Parameter Validation**: Validates all required parameters
3. **Query String Construction**: Builds URLSearchParams according to Swagger spec
4. **Multipart Form Data**: Forwards raw request stream with `duplex: 'half'`
5. **Error Handling**: Proper error response draining and structured error responses
6. **Body Parser**: Disabled (`bodyParser: false`) for multipart form data

### Frontend Integration
The `ImageUpload` component has been updated to handle all three entity types:

```typescript
// Entity type handling in ImageUpload.tsx
if (entityType === 'program-director') {
  // Uses path parameter: /api/proxy/event-medias/upload/program-director/{entityId}/photo
  apiUrl = `/api/proxy/event-medias/upload/${entityType}/${entityId}/photo?...`;
} else if (entityType === 'featured-performer') {
  // Uses query parameter: /api/proxy/event-medias/upload/featured-performer?entityId=...
  apiUrl = `/api/proxy/event-medias/upload/${entityType}?eventId=${eventId}&entityId=${entityId}&imageType=${imageType}...`;
} else if (entityType === 'sponsor') {
  // Uses query parameter: /api/proxy/event-medias/upload/sponsor?entityId=...
  apiUrl = `/api/proxy/event-medias/upload/${entityType}?eventId=${eventId}&entityId=${entityId}&imageType=${imageType}...`;
}
```

## 📁 **File Structure**

```
src/
├── pages/api/proxy/event-medias/upload/
│   ├── featured-performer.ts          # Featured performer proxy
│   ├── sponsor.ts                     # Sponsor proxy
│   └── program-director/
│       └── [entityId]/
│           └── photo.ts               # Program director proxy
├── components/ui/
│   └── ImageUpload.tsx                # Updated frontend component
└── lib/api/
    └── jwt.ts                         # JWT authentication utilities
```

## 🎯 **Usage Examples**

### Featured Performer Upload
```typescript
<ImageUpload
  entityId={performer.id}
  entityType="featured-performer"
  imageType="photo"
  eventId={eventId}
  onImageUploaded={handleImageUploaded}
  onError={handleError}
/>
```

### Sponsor Upload
```typescript
<ImageUpload
  entityId={sponsor.id}
  entityType="sponsor"
  imageType="logo"
  eventId={eventId}
  onImageUploaded={handleImageUploaded}
  onError={handleError}
/>
```

## 🔍 **Key Differences from Program Director**

| Aspect | Program Director | Featured Performer | Sponsor |
|--------|------------------|-------------------|---------|
| **URL Structure** | `/program-director/{entityId}/photo` | `/featured-performer` | `/sponsor` |
| **Entity ID** | Path parameter | Query parameter | Query parameter |
| **Image Type** | Fixed as "photo" | Dynamic parameter | Dynamic parameter |
| **Required Params** | eventId, entityId, title | eventId, entityId, imageType, title | eventId, entityId, imageType, title |

## ✅ **Testing Checklist**

### Featured Performer Upload
- [ ] Navigate to `http://localhost:3000/admin/events/1/performers`
- [ ] Click on image upload area for a performer
- [ ] Select an image file
- [ ] Verify upload completes successfully
- [ ] Check backend logs for proper parameter binding
- [ ] Verify image appears in the UI

### Sponsor Upload
- [ ] Navigate to `http://localhost:3000/admin/events/1/sponsors`
- [ ] Click on image upload area for a sponsor
- [ ] Select an image file
- [ ] Verify upload completes successfully
- [ ] Check backend logs for proper parameter binding
- [ ] Verify image appears in the UI

## 🚨 **Troubleshooting**

### Common Issues
1. **HTTP 415 Error**: Check if `bodyParser: false` is set in proxy config
2. **Missing Parameters**: Verify all required query parameters are included
3. **JWT Authentication**: Check if JWT token is valid and properly attached
4. **Content-Type**: Ensure multipart/form-data is preserved in headers

### Debug Information
Both proxy handlers include comprehensive logging:
- Parameter values and validation
- Backend URL construction
- Request headers being sent
- Backend response status and headers
- Error details and stack traces

## 📚 **References**

### Cursor Rules Compliance
- **File**: `.cursor/rules/nextjs_api_routes.mdc`
- **Pattern**: Proxy pattern with JWT authentication
- **Error Handling**: Structured error responses
- **Body Parsing**: Disabled for multipart form data

### Swagger Documentation
- **File**: `documentation/Swagger_API_Docs/api-docs.json`
- **Endpoints**: Featured performer and sponsor upload specifications

### Working Examples
- **Program Director**: `http://localhost:3000/admin/events/1/program-directors`
- **Media Upload**: `http://localhost:3000/admin/events/5/media`

---

**Created**: 2025-01-16
**Status**: Implemented
**Priority**: High
**Related Features**: Program Director Photo Upload, Media Upload System

