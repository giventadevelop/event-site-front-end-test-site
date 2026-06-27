# YAML Fix Visual Guide

## Current State (BROKEN) ❌

```yaml
# Line 118 - First server block
server:
  port: 8080

# ... many lines of other configuration ...

# Line 185 - Second server block (DUPLICATE KEY - CAUSES ERROR)
server:
  base-url: ${SERVER_BASE_URL:http://localhost:8080}

frontend:
  url: ${FRONTEND_URL:http://localhost:3000}
```

**Error**: DuplicateKeyException - YAML parser found two `server:` keys

---

## Fixed State (WORKING) ✅

```yaml
# Line 118 - Merged server block
server:
  port: 8080
  base-url: ${SERVER_BASE_URL:http://localhost:8080}

# ... many lines of other configuration ...

# Frontend configuration (remains separate, no duplication)
frontend:
  url: ${FRONTEND_URL:http://localhost:3000}
```

**Result**: Single `server:` key with all properties merged together

---

## What to Change

### ❌ REMOVE THIS (around line 185):
```yaml
# OAuth Configuration
server:
  base-url: ${SERVER_BASE_URL:http://localhost:8080}
```

### ✅ CHANGE THIS (around line 118):
**From:**
```yaml
server:
  port: 8080
```

**To:**
```yaml
server:
  port: 8080
  base-url: ${SERVER_BASE_URL:http://localhost:8080}
```

### ✅ KEEP THIS (wherever it is):
```yaml
frontend:
  url: ${FRONTEND_URL:http://localhost:3000}
```

---

## Step-by-Step Visual Instructions

### Step 1: Find Line 118
```yaml
116: # Some configuration above
117:
118: server:           <-- FIND THIS
119:   port: 8080
120:
```

### Step 2: Add base-url Property
```yaml
118: server:
119:   port: 8080
120:   base-url: ${SERVER_BASE_URL:http://localhost:8080}  <-- ADD THIS LINE
121:
```

### Step 3: Find Line 185
```yaml
183: # Some configuration above
184:
185: # OAuth Configuration           <-- FIND THIS SECTION
186: server:                          <-- DELETE FROM HERE
187:   base-url: ${SERVER_BASE_URL:http://localhost:8080}  <-- DELETE THIS TOO
188:
189: frontend:                        <-- KEEP FROM HERE DOWN
190:   url: ${FRONTEND_URL:http://localhost:3000}
```

### Step 4: Delete Lines 185-187
```yaml
183: # Some configuration above
184:
185: frontend:                        <-- THIS SHOULD NOW BE HERE
186:   url: ${FRONTEND_URL:http://localhost:3000}
```

---

## Common Mistakes to Avoid

### ❌ Wrong Indentation
```yaml
server:
  port: 8080
    base-url: ${SERVER_BASE_URL:http://localhost:8080}  # Too much indentation!
```

### ✅ Correct Indentation
```yaml
server:
  port: 8080
  base-url: ${SERVER_BASE_URL:http://localhost:8080}  # Same level as 'port'
```

---

### ❌ Using Tabs
```yaml
server:
→   port: 8080  # Tab character causes issues
```

### ✅ Using Spaces
```yaml
server:
  port: 8080  # Two spaces
```

---

### ❌ Creating Another Duplicate
```yaml
server:
  port: 8080
  base-url: ${SERVER_BASE_URL:http://localhost:8080}

# ... other config ...

server:  # Another duplicate!
  some-other-property: value
```

### ✅ All Under One Server Block
```yaml
server:
  port: 8080
  base-url: ${SERVER_BASE_URL:http://localhost:8080}
  some-other-property: value
```

---

## Quick Reference

| Line | Action | What to Do |
|------|--------|------------|
| 118 | MODIFY | Add `base-url` property under existing `server:` |
| 185-187 | DELETE | Remove duplicate `server:` block and comment |
| 189+ | KEEP | Leave `frontend:` configuration as-is |

---

## After Fixing

### Test 1: Backend Starts
```bash
./mvnw spring-boot:run
```
**Expected**: No YAML parsing errors, server starts successfully

### Test 2: Configuration Loaded
**Backend Console Output:**
```
Server running on port: 8080
Server base URL: http://localhost:8080
Frontend URL: http://localhost:3000
```

### Test 3: OAuth Endpoints Available
```bash
curl http://localhost:8080/api/oauth/google/initiate?tenantId=test
```
**Expected**: 302 redirect (not 404 or 500)

---

## If Still Broken

1. **Check for other duplicate keys**: Search entire file for duplicate top-level keys
2. **Validate YAML syntax**: Use online YAML validator (https://www.yamllint.com/)
3. **Check indentation**: Ensure all properties use spaces (not tabs) and correct nesting
4. **Review entire server block**: Make sure all server properties are together
5. **Restart IDE**: Sometimes IDEs cache old configuration

---

## Summary

**Problem**: Two `server:` keys in YAML file
**Solution**: Merge into one `server:` key with both properties
**Result**: Backend starts successfully, OAuth endpoints work

The fix is simple: combine the server configuration into a single block!
