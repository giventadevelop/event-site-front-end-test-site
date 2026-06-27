# TestSprite Test Specification
## Malayalees US Site Event Registration Platform

### Project Information
- **Project Name:** Malayalees US Site Event Registration Platform
- **Base URL:** http://localhost:3000
- **Technology:** Next.js 15, React 18, TypeScript
- **Authentication:** Clerk
- **Payment:** Stripe
- **Database:** PostgreSQL (via Rust API)

### Test Environment Setup
- **Frontend Port:** 3000
- **Backend API Port:** 8080
- **Database:** PostgreSQL
- **Environment:** Development

### Test Data Requirements

#### Test Users
```json
{
  "admin_user": {
    "email": "admin@malayalees.com",
    "password": "AdminPass123!",
    "role": "admin"
  },
  "member_user": {
    "email": "member@malayalees.com",
    "password": "MemberPass123!",
    "role": "member"
  },
  "guest_user": {
    "email": "guest@example.com",
    "password": "GuestPass123!",
    "role": "guest"
  }
}
```

#### Test Events
```json
{
  "free_event": {
    "title": "Community Cultural Night",
    "description": "Free cultural event for all members",
    "startDate": "2025-02-15",
    "endDate": "2025-02-15",
    "startTime": "18:00",
    "endTime": "21:00",
    "location": "Community Center",
    "capacity": 100,
    "admissionType": "FREE",
    "isMemberOnly": false,
    "allowGuests": true,
    "maxGuestsPerAttendee": 2
  },
  "paid_event": {
    "title": "Annual Gala Dinner",
    "description": "Premium gala dinner event",
    "startDate": "2025-03-20",
    "endDate": "2025-03-20",
    "startTime": "19:00",
    "endTime": "23:00",
    "location": "Grand Hotel",
    "capacity": 200,
    "admissionType": "PAID",
    "price": 75.00,
    "isMemberOnly": true,
    "allowGuests": true,
    "maxGuestsPerAttendee": 1
  }
}
```

### Test Scenarios

#### 1. Public Event Discovery Tests

**Test Case 1.1: Homepage Load**
- **URL:** http://localhost:3000
- **Expected:** Page loads with event listings
- **Validation:**
  - Page title contains "Malayalees"
  - Event cards are visible
  - Navigation menu is present

**Test Case 1.2: Event Details View**
- **URL:** http://localhost:3000/event/[event-slug]
- **Expected:** Event details page loads
- **Validation:**
  - Event title is displayed
  - Event date and time are shown
  - Location information is present
  - Registration button is visible

#### 2. Authentication Tests

**Test Case 2.1: User Registration**
- **URL:** http://localhost:3000/sign-up
- **Steps:**
  1. Click "Sign Up" button
  2. Enter email and password
  3. Complete registration form
  4. Submit registration
- **Expected:** User account created successfully
- **Validation:** Redirected to dashboard with success message

**Test Case 2.2: User Login**
- **URL:** http://localhost:3000/sign-in
- **Steps:**
  1. Enter valid credentials
  2. Click "Sign In"
- **Expected:** User logged in successfully
- **Validation:** Redirected to dashboard, user menu visible

**Test Case 2.3: User Logout**
- **Steps:**
  1. Click user menu
  2. Click "Sign Out"
- **Expected:** User logged out
- **Validation:** Redirected to homepage, login button visible

#### 3. Event Registration Tests

**Test Case 3.1: Free Event Registration**
- **URL:** http://localhost:3000/event/register
- **Prerequisites:** User logged in
- **Steps:**
  1. Select free event
  2. Fill registration form
  3. Add guest information (if allowed)
  4. Submit registration
- **Expected:** Registration successful
- **Validation:**
  - Success page displayed
  - QR code generated
  - Confirmation email sent

**Test Case 3.2: Paid Event Registration**
- **URL:** http://localhost:3000/event/register
- **Prerequisites:** User logged in
- **Steps:**
  1. Select paid event
  2. Fill registration form
  3. Proceed to payment
  4. Complete Stripe payment
- **Expected:** Payment successful, registration confirmed
- **Validation:**
  - Payment success page
  - QR code generated
  - Receipt email sent

**Test Case 3.3: Member-Only Event Access**
- **URL:** http://localhost:3000/event/[member-only-event]
- **Prerequisites:** Non-member user logged in
- **Expected:** Access denied or membership signup prompt
- **Validation:** Redirected to membership page or access denied message

#### 4. Admin Dashboard Tests

**Test Case 4.1: Admin Login**
- **URL:** http://localhost:3000/admin
- **Prerequisites:** Admin user credentials
- **Steps:**
  1. Navigate to admin dashboard
  2. Login with admin credentials
- **Expected:** Admin dashboard loads
- **Validation:** Admin navigation menu visible

**Test Case 4.2: Event Management**
- **URL:** http://localhost:3000/admin/events
- **Prerequisites:** Admin logged in
- **Steps:**
  1. Click "Create New Event"
  2. Fill event details form
  3. Set event settings
  4. Save event
- **Expected:** Event created successfully
- **Validation:** Event appears in events list

**Test Case 4.3: Registration Management**
- **URL:** http://localhost:3000/admin/events/registrations
- **Prerequisites:** Admin logged in, test registrations exist
- **Steps:**
  1. View registrations table
  2. Search by name/email
  3. Edit attendee information
  4. Delete registration
- **Expected:** Registration management functions work
- **Validation:**
  - Search returns correct results
  - Edit form opens with data
  - Delete confirmation works

#### 5. Payment Integration Tests

**Test Case 5.1: Stripe Payment Flow**
- **URL:** http://localhost:3000/event/register
- **Steps:**
  1. Select paid event
  2. Fill registration form
  3. Click "Pay with Stripe"
  4. Complete test payment
- **Expected:** Payment processed successfully
- **Validation:**
  - Stripe checkout opens
  - Payment completes
  - Success page displays

**Test Case 5.2: Payment Webhook Handling**
- **Prerequisites:** Stripe webhook configured
- **Steps:**
  1. Complete test payment
  2. Check webhook processing
- **Expected:** Webhook processes payment event
- **Validation:** Registration status updated in database

#### 6. QR Code & Check-in Tests

**Test Case 6.1: QR Code Generation**
- **URL:** http://localhost:3000/event/success
- **Prerequisites:** Successful registration
- **Expected:** QR code displayed
- **Validation:**
  - QR code is visible
  - QR code is scannable
  - Contains correct registration data

**Test Case 6.2: Check-in Process**
- **URL:** http://localhost:3000/admin/qrcode-scan
- **Prerequisites:** Admin logged in, QR code available
- **Steps:**
  1. Scan QR code
  2. Verify attendee information
  3. Complete check-in
- **Expected:** Check-in successful
- **Validation:**
  - Attendee status updated
  - Check-in time recorded
  - Success message displayed

#### 7. Mobile Responsiveness Tests

**Test Case 7.1: Mobile Event Registration**
- **Device:** Mobile viewport (375x667)
- **URL:** http://localhost:3000/event/register
- **Expected:** Mobile-optimized registration form
- **Validation:**
  - Form fits mobile screen
  - Touch targets are appropriate size
  - QR code is mobile-friendly

**Test Case 7.2: Mobile Admin Dashboard**
- **Device:** Tablet viewport (768x1024)
- **URL:** http://localhost:3000/admin
- **Expected:** Responsive admin interface
- **Validation:**
  - Tables are scrollable
  - Buttons are touch-friendly
  - Navigation works on touch

#### 8. Error Handling Tests

**Test Case 8.1: Invalid Registration Data**
- **Steps:**
  1. Submit registration with invalid email
  2. Submit registration with missing required fields
- **Expected:** Validation errors displayed
- **Validation:**
  - Error messages are clear
  - Form doesn't submit
  - User can correct errors

**Test Case 8.2: Payment Failure**
- **Steps:**
  1. Use Stripe test card for declined payment
  2. Complete payment flow
- **Expected:** Payment failure handled gracefully
- **Validation:**
  - Error message displayed
  - User can retry payment
  - Registration not created

#### 9. Performance Tests

**Test Case 9.1: Page Load Performance**
- **URLs:** All major pages
- **Expected:** Pages load within 3 seconds
- **Validation:**
  - Lighthouse score > 90
  - First Contentful Paint < 2s
  - Largest Contentful Paint < 3s

**Test Case 9.2: Database Performance**
- **Steps:**
  1. Load registration management page
  2. Search with large dataset
  3. Export CSV with many records
- **Expected:** Operations complete within 5 seconds
- **Validation:** No timeout errors

#### 10. Security Tests

**Test Case 10.1: Unauthorized Access**
- **URLs:** Admin-only pages
- **Prerequisites:** Non-admin user logged in
- **Expected:** Access denied
- **Validation:** Redirected to appropriate page

**Test Case 10.2: Data Validation**
- **Steps:**
  1. Submit forms with malicious input
  2. Attempt SQL injection
  3. Test XSS prevention
- **Expected:** Input sanitized and rejected
- **Validation:** No security vulnerabilities

### Test Data Cleanup
After each test run, clean up:
- Test user accounts
- Test events
- Test registrations
- Test payment records
- Test QR codes

### Test Reporting
Generate reports including:
- Test execution results
- Performance metrics
- Error logs
- Screenshots of failures
- Browser console errors
- Network request logs

### Browser Support
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Chrome
- Mobile Safari

### Test Execution Order
1. Setup test data
2. Authentication tests
3. Public functionality tests
4. User registration tests
5. Admin functionality tests
6. Payment integration tests
7. Mobile responsiveness tests
8. Performance tests
9. Security tests
10. Cleanup test data
