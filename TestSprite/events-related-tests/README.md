# TestSprite Admin Events Test Suite

Comprehensive test suite for the Malayalees US Site admin events management functionality using TestSprite MCP Server.

## 🎯 Test Scope

This test suite covers all functionality under the `/admin/events/` path:

### **Core Event Management**
- ✅ Event Analytics Dashboard (`/admin/events`)
- ✅ Event Overview (`/admin/events/[id]`)
- ✅ Event Creation (`/admin/events/new`)
- ✅ Event Editing (`/admin/events/[id]/edit`)

### **Event Content Management**
- ✅ Media Management (`/admin/events/[id]/media`)
- ✅ Ticket Types (`/admin/events/[id]/ticket-types/list`)
- ✅ Performers (`/admin/events/[id]/performers`)
- ✅ Sponsors (`/admin/events/[id]/sponsors`)
- ✅ Contacts (`/admin/events/[id]/contacts`)
- ✅ Emails (`/admin/events/[id]/emails`)
- ✅ Program Directors (`/admin/events/[id]/program-directors`)

### **Advanced Features**
- ✅ Registration Management (`/admin/events/registrations`)
- ✅ Event Dashboard (`/admin/events/dashboard`)
- ✅ Settings (`/admin/events/settings`)
- ✅ Reports (`/admin/events/reports`)

---

## 🚀 Quick Start

### **Prerequisites**
1. **Node.js 18+** installed
2. **Frontend running** on `http://localhost:3000`
3. **Backend API running** on `http://localhost:8080`
4. **Admin authentication** set up with Clerk

### **Installation**
```bash
# Navigate to test directory
cd TestSprite/events-related-tests

# Install dependencies
npm run install-deps

# Setup Playwright browsers
npm run setup
```

### **Run Tests**
```bash
# Run all admin events tests
npm test

# Run specific test categories
npm run test:core      # Core functionality tests
npm run test:crud      # CRUD operations tests
npm run test:media     # Media management tests
npm run test:analytics # Analytics and reporting tests

# Run specific test
npm run test:specific AE001  # Run specific test by ID
```

---

## 📋 Test Categories

### **1. Core Functionality Tests (AE001-AE003)**
**Priority:** High
**Focus:** Basic page loads, navigation, and core functionality

- **AE001**: Admin Events Analytics Dashboard
- **AE002**: Event Overview Page Navigation
- **AE003**: Event Edit Form Functionality

### **2. CRUD Operations Tests (AE004-AE007)**
**Priority:** High
**Focus:** Create, Read, Update, Delete operations for all entities

- **AE004**: Ticket Types CRUD Operations
- **AE005**: Performers CRUD Operations
- **AE006**: Sponsors CRUD Operations
- **AE007**: Contacts CRUD Operations

### **3. Media Management Tests (AE008)**
**Priority:** Medium
**Focus:** File uploads, media organization, and image handling

- **AE008**: Event Media Upload and Management

### **4. Registration Management Tests (AE009)**
**Priority:** High
**Focus:** Registration data management and attendee tracking

- **AE009**: Event Registration Management System

### **5. Analytics & Reporting Tests (AE010-AE011)**
**Priority:** Medium
**Focus:** Dashboard analytics and report generation

- **AE010**: Event Dashboard Analytics
- **AE011**: Event Reports Generation

---

## 🔧 Configuration

### **Test Configuration**
Edit `test-config.json` to customize:

```json
{
  "baseUrl": "http://localhost:3000",
  "authentication": {
    "required": true,
    "type": "clerk-social-login",
    "role": "admin"
  },
  "environment": {
    "browser": "chromium",
    "headless": false,
    "viewport": { "width": 1920, "height": 1080 }
  }
}
```

### **Test Data**
Sample test data is defined in `test-config.json` under the `testData` section. Modify as needed for your environment.

---

## 📊 Test Execution Examples

### **Run Core Functionality Tests**
```bash
node run-events-tests.js --category=core-functionality
```

### **Run All CRUD Tests**
```bash
node run-events-tests.js --category=crud-operations
```

### **Run Specific Test**
```bash
node run-events-tests.js --test=AE004
```

### **Run All Tests with Detailed Output**
```bash
node run-events-tests.js
```

---

## 📈 Test Results & Reporting

### **Output Files**
- `admin-events-test-results.json` - Detailed test results
- `admin-events-test-report.md` - Human-readable report
- `screenshots/` - Test execution screenshots
- `logs/` - Detailed execution logs

### **Report Format**
```json
{
  "summary": {
    "totalTests": 12,
    "passedTests": 11,
    "failedTests": 1,
    "successRate": "91.7%",
    "totalDuration": "45s"
  },
  "results": [
    {
      "id": "AE001",
      "name": "Admin Events Analytics Dashboard",
      "status": "PASSED",
      "duration": "2.3s",
      "error": null
    }
  ]
}
```

---

## 🛠️ Troubleshooting

### **Common Issues**

#### **Authentication Failures**
```bash
# Verify Clerk configuration
# Check environment variables
# Ensure admin user exists
```

#### **Page Load Timeouts**
```bash
# Increase timeout in test-config.json
# Check network connectivity
# Verify backend API is running
```

#### **Element Not Found Errors**
```bash
# Update selectors in test-config.json
# Check if UI components have changed
# Verify page structure matches expectations
```

### **Debug Mode**
```bash
# Run with debug output
DEBUG=true node run-events-tests.js

# Run with browser visible
HEADLESS=false node run-events-tests.js
```

---

## 🔗 Integration with Main Project

### **Add to Main Package.json**
```json
{
  "scripts": {
    "test:admin-events": "cd TestSprite/events-related-tests && npm test",
    "test:events-crud": "cd TestSprite/events-related-tests && npm run test:crud",
    "test:events-core": "cd TestSprite/events-related-tests && npm run test:core"
  }
}
```

### **CI/CD Integration**
```yaml
# .github/workflows/admin-events-tests.yml
name: Admin Events Tests
on: [push, pull_request]
jobs:
  test-admin-events:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:admin-events
```

---

## 📚 References

### **Documentation**
- [nextjs_api_routes.mdc](../../.cursor/rules/nextjs_api_routes.mdc) - API patterns
- [ui_style_guide.mdc](../../.cursor/rules/ui_style_guide.mdc) - UI standards
- [Swagger API Docs](../../documentation/Swagger_API_Docs/api-docs.json) - API schema

### **Related Files**
- Main admin events page: `src/app/admin/events/page.tsx`
- Event management hub: `src/app/admin/events/[id]/page.tsx`
- API server actions: `src/app/admin/events/[id]/*/ApiServerActions.ts`
- UI components: `src/components/ui/DataTable.tsx`, `src/components/ui/Modal.tsx`

---

## 🎉 Success Metrics

### **Performance Targets**
- **Page Load Time**: < 500ms for all pages
- **API Response Time**: < 1000ms for all operations
- **Form Submission**: < 2000ms for all CRUD operations

### **Quality Targets**
- **Test Pass Rate**: 95%+ for all test runs
- **UI Consistency**: 100% compliance with ui_style_guide.mdc
- **API Compliance**: 100% compliance with nextjs_api_routes.mdc
- **Error Handling**: Graceful failure for all error scenarios

---

**Created by:** TestSprite MCP Server
**Last Updated:** September 18, 2025
**Version:** 1.0.0
**Maintained by:** Development Team
