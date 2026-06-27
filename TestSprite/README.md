# TestSprite Testing Suite
## Malayalees US Site Event Registration Platform

This folder contains automated testing configurations and scripts for the Malayalees US Site Event Registration Platform using TestSprite MCP server.

## 📁 Folder Structure

```
TestSprite/
├── sanity-tests/                    # Quick 3-minute sanity tests
│   ├── README.md                    # Sanity tests documentation
│   ├── sanity-test-config.json      # Basic test configuration
│   ├── testsprite-mcp-config.json   # TestSprite MCP server config
│   ├── run-sanity-tests.js          # Test execution script
│   └── test-report-template.html    # HTML report template
└── README.md                        # This file
```

## 🚀 Quick Start

### 1. Sanity Tests (2.5 minutes)
Run basic functionality tests to verify core features:

```bash
# Using TestSprite MCP server
testsprite run --config sanity-tests/testsprite-mcp-config.json

# Or using the Node.js script
node sanity-tests/run-sanity-tests.js
```

### 2. Test Configuration
- **Duration**: ~2.5 minutes
- **Scope**: Basic page loads and core functionality (7 tests)
- **Performance**: No strict timing requirements (local development)
- **Browsers**: Chrome only
- **Mobile**: Disabled for speed

## 🧪 Test Coverage

### Static Pages
- ✅ Homepage load and navigation
- ✅ Event listing page
- ✅ Event details page

### Admin Pages (User Already Logged In)
- ✅ Admin dashboard access
- ✅ Events management page
- ✅ Registrations management page
- ✅ User profile page

### Core Functionality
- ✅ Page load without errors
- ✅ Essential UI elements present
- ✅ Navigation functionality
- ✅ Form elements accessible

## 📊 Test Results

Test results are generated in HTML format with:
- Test execution summary
- Pass/fail status for each test
- Screenshots on failure
- Console logs for debugging
- Performance metrics (if enabled)

## 🔧 Configuration

### Test Settings
- **Timeout**: 10 seconds per test
- **Retries**: 1 retry on failure
- **Screenshots**: On failure only
- **Performance**: Disabled for local testing
- **Mobile**: Disabled for speed

### Test Data
- **Authentication**: Social Login (user already logged in)
- **Base URL**: http://localhost:3000
- **Note**: No manual login required - assumes user is already authenticated

## 📈 Future Enhancements

### Phase 2: Comprehensive Testing
- Full user registration flow testing
- Payment integration testing (Stripe)
- QR code generation and scanning
- Mobile responsiveness testing
- Performance benchmarking
- Security testing

### Phase 3: Advanced Testing
- End-to-end user journeys
- Cross-browser compatibility
- Load testing with multiple users
- Database integration testing
- API endpoint testing

## 🛠️ Development

### Adding New Tests
1. Add test case to `testsprite-mcp-config.json`
2. Update test scenarios in `run-sanity-tests.js`
3. Modify HTML report template if needed
4. Test locally before committing

### Test Data Management
- Test users are created automatically
- No cleanup required for sanity tests
- Test data is isolated per test run

## 📝 Notes

- Tests are designed for local development environment
- No performance timing requirements for sanity tests
- Focus on basic functionality validation
- Quick execution for rapid feedback
- Easy to extend for comprehensive testing later

## 🎯 Success Criteria

- All 10 sanity tests pass
- No critical JavaScript errors
- All essential UI elements present
- Navigation works correctly
- Admin pages accessible with proper authentication

---

**Last Updated**: January 2025
**TestSprite Version**: 1.0.0
**Project Version**: 1.0.0
