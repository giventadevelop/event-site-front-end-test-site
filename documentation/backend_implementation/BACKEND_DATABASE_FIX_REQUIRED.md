# Backend Database Fix Required

**Issue**: PostgreSQL JSONB Type Mismatch Error
**Priority**: HIGH
**Status**: ⚠️ BLOCKING AUTHENTICATION

---

## Problem Description

The authentication flow is failing at the database level during sign-in because the Spring Boot backend's `UserProfile` entity has a type mismatch with the PostgreSQL database schema.

### Error Details

```
ERROR: column "clerk_metadata" is of type jsonb but expression is of type character varying
Hint: You will need to rewrite or cast the expression.
Position: 172
```

**Error Location**: Backend database update operation in `ClerkAuthServiceImpl.signIn()`

**Impact**: Users cannot sign in successfully. Authentication completes in Clerk, JWT tokens are generated, but the database update fails causing a 500 error to be returned to the frontend.

---

## Root Cause

The `user_profile` table has a column `clerk_metadata` defined as `jsonb` (JSON Binary) type in PostgreSQL, but the Spring Boot `UserProfile` entity is treating it as a `String` (character varying).

When Hibernate tries to execute the UPDATE statement, PostgreSQL rejects it because you cannot directly assign a string to a JSONB column without proper casting or JSON parsing.

---

## Required Fix (Backend)

### Option 1: Use Hibernate JSON Type Library (RECOMMENDED)

**Step 1**: Add dependency to `pom.xml`

```xml
<dependency>
    <groupId>io.hypersistence</groupId>
    <artifactId>hypersistence-utils-hibernate-63</artifactId>
    <version>3.7.0</version>
</dependency>
```

**Step 2**: Update `UserProfile` entity

```java
package com.nextjstemplate.domain;

import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import java.util.Map;

@Entity
@Table(name = "user_profile")
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class UserProfile {

    // ... other fields ...

    @Type(JsonBinaryType.class)
    @Column(name = "clerk_metadata", columnDefinition = "jsonb")
    private Map<String, Object> clerkMetadata;

    // Getters and setters
    public Map<String, Object> getClerkMetadata() {
        return clerkMetadata;
    }

    public void setClerkMetadata(Map<String, Object> clerkMetadata) {
        this.clerkMetadata = clerkMetadata;
    }
}
```

**Step 3**: Update service layer to use Map instead of String

```java
// In ClerkAuthServiceImpl or wherever clerkMetadata is set
Map<String, Object> metadata = new HashMap<>();
// Populate metadata from Clerk response
userProfile.setClerkMetadata(metadata);
```

---

### Option 2: Use Custom JPA Converter

If you prefer more control, create a custom converter:

**Step 1**: Create converter class

```java
package com.nextjstemplate.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.Map;

@Converter
public class JsonbConverter implements AttributeConverter<Map<String, Object>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert Map to JSON", e);
        }
    }

    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(dbData, Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse JSON from database", e);
        }
    }
}
```

**Step 2**: Apply converter in entity

```java
@Entity
@Table(name = "user_profile")
public class UserProfile {

    @Convert(converter = JsonbConverter.class)
    @Column(name = "clerk_metadata", columnDefinition = "jsonb")
    private Map<String, Object> clerkMetadata;
}
```

---

### Option 3: Change Database Column Type

If JSONB features are not needed, change the column to TEXT:

```sql
-- Run this migration on your database
ALTER TABLE user_profile
ALTER COLUMN clerk_metadata TYPE text;

-- If there's existing JSONB data, use this instead:
ALTER TABLE user_profile
ALTER COLUMN clerk_metadata TYPE text USING clerk_metadata::text;
```

Then update entity:

```java
@Column(name = "clerk_metadata", columnDefinition = "text")
private String clerkMetadata;
```

---

## Temporary Workaround (Frontend)

While the backend is being fixed, the frontend now shows user-friendly error messages instead of technical errors:

**Before**: "API Error: 500 Internal Server Error"
**After**: "Something went wrong on our end. We're working on it. Please try again in a few minutes."

### Enhanced Error Handling

Created `src/lib/errorMessages.ts` with:
- User-friendly error message mapping
- HTTP status code handling
- Error code (AUTH_001, etc.) handling
- Graceful fallback messages

Updated `AuthContext.tsx` to use the new error handling utility.

---

## Testing After Fix

### 1. Sign-In Test
```bash
# Test existing user sign-in
curl -X POST http://localhost:8080/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant_demo_001" \
  -d '{
    "email": "giventauser@gmail.com",
    "password": "your-password",
    "tenantId": "tenant_demo_001"
  }'
```

**Expected**: 200 OK with JWT tokens and user object

### 2. Database Verification
```sql
-- Check that clerk_metadata is properly stored
SELECT id, email, clerk_metadata
FROM user_profile
WHERE email = 'giventauser@gmail.com';
```

**Expected**: `clerk_metadata` column should contain valid JSON/JSONB data

### 3. Frontend Test
1. Go to sign-in page
2. Enter credentials
3. Submit form
4. Should redirect to dashboard (no error)

---

## Files Involved

### Backend (Needs Changes)
- `src/main/java/com/nextjstemplate/domain/UserProfile.java`
- `src/main/java/com/nextjstemplate/service/impl/ClerkAuthServiceImpl.java`
- `pom.xml` (if using Option 1)

### Database
- Table: `user_profile`
- Column: `clerk_metadata` (jsonb type)

### Frontend (Already Fixed)
- ✅ `src/lib/errorMessages.ts` - Error message mapping
- ✅ `src/contexts/AuthContext.tsx` - User-friendly error handling
- ✅ All auth proxy routes - Already properly forwarding to backend

---

## Recommended Action

**IMMEDIATE**: Implement Option 1 (Hibernate JSON Type) as it provides:
1. Type-safe JSON handling
2. Automatic serialization/deserialization
3. Full PostgreSQL JSONB feature support
4. Clean code with minimal boilerplate

---

## Additional Notes

### Why JSONB?

JSONB (JSON Binary) in PostgreSQL provides:
- Efficient storage and indexing
- Fast query capabilities
- JSON path queries
- Schema flexibility

If you're storing Clerk metadata (which can have varying structure), JSONB is the right choice.

### Migration Strategy

1. **Fix the entity** (Option 1 recommended)
2. **Test locally** with existing user
3. **Deploy to staging**
4. **Verify no data corruption**
5. **Deploy to production**

No data migration needed - existing NULL values and properly formatted JSON will work correctly with the fix.

---

## Support

For questions about this fix:
- **Backend Repository**: Check the Spring Boot project
- **Issue Tracker**: Log the issue with tag `database-schema`
- **This Document**: `BACKEND_DATABASE_FIX_REQUIRED.md`

---

**Status**: ⚠️ Waiting for backend fix
**Frontend**: ✅ Error handling improved
**Next Step**: Backend developer implements Option 1
