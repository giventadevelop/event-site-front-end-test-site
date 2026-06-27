# Backend YAML Configuration Fix

## Issue
The backend Spring Boot application is failing to start with the following error:

```
org.yaml.snakeyaml.constructor.DuplicateKeyException: while constructing a mapping
found duplicate key server
 in 'reader', line 185, column 1:
    server:
```

## Root Cause
During the OAuth implementation, I added a duplicate `server:` key to `application-dev.yml`:
- **Line 118**: Original `server:` block with `port: 8080`
- **Line 185**: Duplicate `server:` block with OAuth configuration

YAML does not allow duplicate top-level keys, causing the parser to fail.

## Fix Instructions

### Step 1: Locate the File
Navigate to your backend repository and open:
```
src/main/resources/application-dev.yml
```

### Step 2: Find the Existing Server Block
Around line 118, you should see:
```yaml
server:
  port: 8080
```

### Step 3: Add OAuth Configuration to Existing Block
Modify the existing `server:` block to include the `base-url` property:
```yaml
server:
  port: 8080
  base-url: ${SERVER_BASE_URL:http://localhost:8080}
```

### Step 4: Remove Duplicate Server Block
Around line 185, remove the duplicate `server:` section:
```yaml
# OAuth Configuration  <-- REMOVE THIS COMMENT
server:                 <-- REMOVE THIS LINE
  base-url: ${SERVER_BASE_URL:http://localhost:8080}  <-- REMOVE THIS LINE
```

### Step 5: Keep Frontend Configuration
Keep the `frontend:` configuration that was added (it should be separate from `server:`):
```yaml
frontend:
  url: ${FRONTEND_URL:http://localhost:3000}
```

## Complete Fixed Configuration

The corrected section should look like this:

```yaml
# Server Configuration
server:
  port: 8080
  base-url: ${SERVER_BASE_URL:http://localhost:8080}

# ... other configuration ...

# Frontend Configuration (add this as a new top-level key if not present)
frontend:
  url: ${FRONTEND_URL:http://localhost:3000}
```

## Environment Variables

These environment variables can be set (optional, defaults provided):
- `SERVER_BASE_URL` - Backend base URL (default: `http://localhost:8080`)
- `FRONTEND_URL` - Frontend URL (default: `http://localhost:3000`)

## Verification

After making the fix:

1. **Save the file**
2. **Restart the backend application**
3. **Verify no YAML errors** in the console
4. **Test the OAuth endpoints** are accessible:
   - `http://localhost:8080/api/oauth/google/initiate`
   - `http://localhost:8080/api/oauth/facebook/initiate`
   - `http://localhost:8080/api/oauth/github/initiate`

## Alternative: Complete Server Block Example

If you have additional server configuration, ensure everything is under one `server:` block:

```yaml
server:
  port: 8080
  base-url: ${SERVER_BASE_URL:http://localhost:8080}
  servlet:
    context-path: /
  compression:
    enabled: true
  # ... any other server properties
```

## Notes

- YAML is indentation-sensitive (use 2 spaces, not tabs)
- Each top-level key must be unique
- Properties under the same key should be at the same indentation level
- Environment variable defaults use the syntax: `${VAR_NAME:default_value}`

## Next Steps After Fix

Once the backend starts successfully:

1. **Configure Clerk Dashboard**
   - Enable Google, Facebook, GitHub OAuth providers
   - Add redirect URIs: `http://localhost:8080/api/oauth/{provider}/callback`

2. **Test OAuth Flow**
   - Start both frontend and backend
   - Click social login buttons on frontend
   - Verify OAuth flow completes successfully
   - Check that user is logged in after callback

3. **Monitor Logs**
   - Watch backend logs for OAuth requests
   - Verify state token creation and validation
   - Check Clerk API interactions

## Support

If you encounter any issues after applying this fix, please check:
- YAML syntax is correct (no tabs, proper indentation)
- No other duplicate keys exist in the file
- Environment variables are accessible if you're not using defaults
