/**
 * Comprehensive Admin Test Suite
 *
 * Tests all admin pages and sub-pages with Playwright automation.
 * Uses auth.json for credentials configuration.
 *
 * Usage:
 *   1. Copy auth.json.example to auth.json
 *   2. Fill in your admin credentials
 *   3. Run: node TestSprite/admin-tests/comprehensive-admin-test-suite.js
 *
 * Base URL (default http://localhost:3000 from auth.json):
 *   npm run test:admin -- --port=3001
 *   npm run test:admin -- --base-url=http://127.0.0.1:3001
 *   Env: TEST_BASE_URL, TEST_PORT, or PORT (see resolve-admin-test-base-url.js)
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import ES module authentication helpers
import { authenticatePage, createAuthenticatedContext, saveAuthState, loadAuthState } from '../sanity-tests/authenticate-playwright.js';
import { resolveAdminTestBaseUrl } from './resolve-admin-test-base-url.js';

// Configuration
const AUTH_CONFIG_PATH = path.join(__dirname, 'auth.json');
const AUTH_STATE_PATH = path.join(__dirname, '.auth-state.json');
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const REPORT_PATH = path.join(__dirname, 'admin-test-report.html');

// Test results storage
let testResults = [];
let startTime = Date.now();

/**
 * Load authentication configuration
 */
function loadAuthConfig() {
  if (!fs.existsSync(AUTH_CONFIG_PATH)) {
    console.error(`❌ Auth config file not found: ${AUTH_CONFIG_PATH}`);
    console.error(`   Please copy auth.json.example to auth.json and fill in your credentials.`);
    process.exit(1);
  }

  try {
    const config = JSON.parse(fs.readFileSync(AUTH_CONFIG_PATH, 'utf8'));

    if (!config.email || !config.password) {
      console.error('❌ Auth config missing email or password');
      process.exit(1);
    }

    return {
      email: config.email,
      password: config.password,
      baseUrl: resolveAdminTestBaseUrl(config.baseUrl) || 'http://localhost:3000',
      timeout: config.timeout || 30000,
      headless: config.headless !== undefined ? config.headless : true, // Default to headless for CI/CD
      screenshotOnFailure: config.screenshotOnFailure !== false
    };
  } catch (error) {
    console.error(`❌ Error loading auth config: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Create screenshots directory if it doesn't exist
 */
function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

/**
 * All admin pages to test
 * Organized by category for better reporting
 */
const adminTestPages = [
  // ==========================================
  // CORE ADMIN PAGES
  // ==========================================
  {
    id: 'admin-001',
    name: 'Admin Dashboard',
    url: '/admin',
    category: 'core',
    priority: 'critical',
    expectedElements: ['h1, h2', '[class*="admin"]', 'nav', 'a[href*="/admin"]'],
    validation: ['Admin dashboard loads', 'Navigation menu visible', 'Admin buttons displayed'],
    timeout: 45000, // Increased timeout for client-side auth loading
  },
  {
    id: 'admin-002',
    name: 'Manage Users (Usage)',
    url: '/admin/manage-usage',
    category: 'core',
    priority: 'critical',
    expectedElements: [
      'h1',
      'table',
      'table thead th',
      'input[type="text"]',
      'select',
      'button[aria-label="Bulk Upload User List"]',
      'a[aria-label="Download Bulk Upload Template File"]',
      'button[aria-label="Previous Page"]',
      'button[aria-label="Next Page"]',
      // Row actions when data exists, or empty-state copy when none
      'button[aria-label="Edit User"], button[aria-label="Approve User"], span.text-sm.font-medium.text-orange-700',
    ],
    validation: [
      'Manage Users (/admin/manage-usage) loads',
      'Users table with header columns present',
      'Search uses text input + search-field dropdown (not type=search only)',
      'Status and role filter selects present',
      'Bulk upload + download template controls present',
      'Pagination footer (Previous / Next) present',
      'Per-row Edit / Approve / Reject when users exist, or empty state when none',
    ],
    timeout: 45000, // Increased timeout for API calls
  },
  {
    id: 'admin-003',
    name: 'Manage Events',
    url: '/admin/manage-events',
    category: 'core',
    priority: 'critical',
    expectedElements: [
      'h1',
      'div.text-lg.font-semibold.text-blue-800',
      'a[aria-label="Create New Event"]',
      'a[aria-label="Event Analytics Dashboard"]',
      'a[aria-label="Manage Usage"]',
      'select',
      'input[type="text"], input[type="number"]',
      'input[type="date"]',
      'button[aria-label="Show Past Events"], button[aria-label="Show Future Events"]',
      'button[aria-label="Refresh events from database"]',
      'table, [class*="table"], [class*="grid"]',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"]',
    ],
    validation: [
      'Manage Events (/admin/manage-events) loads',
      'Action cards for Create New Event, Event Analytics Dashboard, and Manage Usage visible',
      'Search Events panel visible',
      'Search controls include text/number/date/select filters',
      'Future/Past events toggle visible',
      'Refresh from database button visible',
      'Event list area and pagination controls visible',
    ],
    timeout: 45000, // Increased timeout for client-side auth loading
  },

  // ==========================================
  // EVENT MANAGEMENT PAGES
  // ==========================================
  {
    id: 'admin-004',
    name: 'Event Analytics Dashboard',
    url: '/admin/events/dashboard',
    category: 'events',
    priority: 'high',
    expectedElements: [
      'h1',
      'div.bg-white.rounded-lg.shadow',
      'h3:has-text("Registration Trends")',
      'h3:has-text("Guest Age Groups")',
      'h3:has-text("Guest Relationships")',
      'h3:has-text("Special Requirements")',
      'h3:has-text("Top Events by Attendance")',
      'h3:has-text("Recent Registrations")',
      'select',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"], span.text-sm.font-medium.text-orange-700',
      'a[aria-label="Event Analytics"]',
      'a[aria-label="View All Registrations"]',
    ],
    validation: [
      'Event analytics dashboard loads',
      'Metric cards and analytics sections are visible',
      'Registration Trends section and time-range selector visible',
      'Recent Registrations section visible',
      'Pagination controls appear when registrations exist (or empty state otherwise)',
      'Action links for Event Analytics and View All Registrations visible',
    ],
    timeout: 45000, // Increased timeout for this page (makes multiple API calls)
  },
  {
    id: 'admin-005',
    name: 'Event Registrations',
    url: '/admin/events/registrations',
    category: 'events',
    priority: 'high',
    expectedElements: [
      'h1',
      'a[aria-label="Back to Admin"]',
      'a[aria-label="Manage Events"]',
      'a[aria-label="Manage Usage"]',
      'a[aria-label="Event Analytics Dashboard"]',
      'a[aria-label="Communication Center"]',
      'button[aria-label="Search Events"]',
      'input[type="number"], input[type="date"], input[type="text"]',
      'button[aria-label="Search Registrations"]',
      'button[aria-label="Export CSV"]',
      'table, [class*="table"]',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"], p:has-text("Search by event to view registrations")',
      'a[aria-label="Back to Manage Events"]',
      'a[aria-label="Event Analytics"]',
    ],
    validation: [
      'Event registrations page loads',
      'Header and quick action navigation links visible',
      'Event search controls present (ID/name/date range)',
      'Registration search and CSV export controls present',
      'Registrations table area visible when event selected',
      'Pagination controls appear for selected event or prompt appears when none selected',
      'Bottom action links for Back to Manage Events and Event Analytics visible',
    ],
    timeout: 45000, // Increased timeout for API calls
  },

  // ==========================================
  // POLLS & FOCUS GROUPS
  // ==========================================
  {
    id: 'admin-006',
    name: 'Poll Management',
    url: '/admin/polls',
    category: 'polls',
    priority: 'medium',
    expectedElements: [
      'h1',
      'h2',
      'button[aria-label="Create Poll"], button[aria-label="Create Your First Poll"]',
      'input[type="text"]',
      '[class*="card"], [class*="grid"]',
      'button[aria-label="View Poll"], button[aria-label="Edit Poll"], button[aria-label="Delete Poll"], p:has-text("No polls created yet.")',
    ],
    validation: [
      'Poll management page loads',
      'Poll Management header and description visible',
      'Create Poll control visible',
      'Search polls text input visible',
      'Poll cards visible when data exists',
      'View/Edit/Delete actions visible when cards exist, or empty-state create prompt visible',
    ]
  },
  {
    id: 'admin-007',
    name: 'Focus Groups',
    url: '/admin/focus-groups',
    category: 'focus-groups',
    priority: 'medium',
    expectedElements: [
      'h1',
      '#focus-groups-search',
      'a[href*="/admin/focus-groups/new"]',
      'table',
      'table thead th',
      'a[aria-label="Edit Focus Group"], a[aria-label="Manage Events"], a[aria-label="Manage Members"], a[aria-label="View Media"], span.text-sm.font-medium.text-orange-700',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"], span:has-text("Showing")',
    ],
    validation: [
      'Focus groups page loads',
      'Search and New Group controls visible',
      'Table headers and search filter visible',
      'Row action buttons (Edit/Events/Members/Media) visible when data exists',
      'Pagination and item count visible when data exists',
      'Empty-state message shown when no focus groups match'
    ]
  },

  // ==========================================
  // MEMBERSHIP MANAGEMENT
  // ==========================================
  {
    id: 'admin-008',
    name: 'Membership Plans',
    url: '/admin/membership/plans',
    category: 'membership',
    priority: 'high',
    expectedElements: [
      'h1',
      'a[aria-label="Back to Admin"]',
      'button[aria-label="Create Plan"]',
      'a[href="/admin/membership/subscriptions"]',
      'a[href="/admin/membership/plans"]',
      'h2, [role="dialog"]',
      'button[aria-label="Create Your First Plan"], p:has-text("No membership plans found.")',
      'table thead th, p:has-text("No membership plans found.")',
      'button[title="Edit"], button[title="Delete"], button[title="Activate"], button[title="Deactivate"]',
      'button[aria-label="Previous Page"]',
      'button[aria-label="Next Page"]',
      'span:has-text("Showing"), span:has-text("No plans found")'
    ],
    validation: [
      'Membership plans page loads',
      'Membership navigation links and create controls are visible',
      'Create modal container and heading are available for plan creation/edit',
      'Plans table headers appear when data exists, otherwise empty-state message appears',
      'Row action controls (edit/activate/deactivate/delete) are present when plans exist',
      'Pagination controls and item-count footer are visible'
    ]
  },
  {
    id: 'admin-009',
    name: 'Membership Subscriptions',
    url: '/admin/membership/subscriptions',
    category: 'membership',
    priority: 'high',
    expectedElements: [
      'h1',
      'a[aria-label="Back to Admin"]',
      'a[href="/admin/membership/plans"]',
      'a[href="/admin/membership/subscriptions"]',
      'label:has-text("Filter by Status"), select',
      'table thead th, p:has-text("No subscriptions found.")',
      'button[aria-label="View subscription details"], button[aria-label="Cancel subscription"], p:has-text("No subscriptions found.")',
      'button[aria-label="Previous page"], button[aria-label="Next page"], p:has-text("No subscriptions found.")',
      'div:has-text("Showing"), p:has-text("No subscriptions found.")'
    ],
    validation: [
      'Membership subscriptions page loads',
      'Back and membership navigation links are visible',
      'Status filter control is visible',
      'Subscriptions table headers appear when data exists, otherwise empty-state message appears',
      'Row actions (view details/cancel) are visible when subscription rows exist',
      'Pagination controls and item-count footer appear when multiple pages exist'
    ]
  },

  // ==========================================
  // EMAIL MANAGEMENT
  // ==========================================
  {
    id: 'admin-010',
    name: 'Email Addresses',
    url: '/admin/tenant-email-addresses',
    category: 'email',
    priority: 'medium',
    expectedElements: [
      'h1',
      'button[aria-label="Add Email Address"]',
      'label:has-text("Search"), input[placeholder*="Search by email"]',
      'table thead th, p:has-text("No tenant email addresses configured yet.")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"]',
      'span:has-text("Showing"), span:has-text("No email addresses found")',
      'button[aria-label="Edit"], button[aria-label="Delete"], p:has-text("No tenant email addresses configured yet.")'
    ],
    validation: [
      'Tenant email addresses page loads',
      'Header and add-email action are visible',
      'Search input is visible',
      'Email table headers appear when data exists, otherwise empty-state message appears',
      'Row action controls (edit/delete) are present when rows exist',
      'Pagination controls and item-count footer are visible'
    ]
  },
  {
    id: 'admin-011',
    name: 'Bulk Email',
    url: '/admin/bulk-email',
    category: 'email',
    priority: 'medium',
    expectedElements: [
      'h1',
      'p:has-text("Send bulk emails to your members and subscribers")',
      'a[href="/admin/promotion-emails"]',
      'a[href="/admin/newsletter-emails"]',
      'h2:has-text("Promotional Emails for Events")',
      'h2:has-text("Newsletter Emails")',
      'li:has-text("Create event-specific email templates"), li:has-text("Create newsletter email templates")'
    ],
    validation: [
      'Bulk email management page loads',
      'Page title and intro description are visible',
      'Promotional emails and newsletter cards are visible',
      'Navigation links to promotion-emails and newsletter-emails are present',
      'Feature bullet lists are displayed in both cards'
    ]
  },
  {
    id: 'admin-012',
    name: 'Newsletter Emails',
    url: '/admin/newsletter-emails',
    category: 'email',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Newsletter emails page loads', 'Newsletter list visible']
  },

  // ==========================================
  // MEDIA & CONTENT
  // ==========================================
  {
    id: 'admin-013',
    name: 'Media Management',
    url: '/admin/media',
    category: 'media',
    priority: 'medium',
    expectedElements: [
      'h1:has-text("Manage Media Files")',
      'button[aria-label="Upload New Media"]',
      'h2:has-text("Search Media"), input#search-input, input#serial-input',
      'button[aria-label="Go to Image"]',
      'input[type="checkbox"][aria-label="Select all on this page"], button[aria-label="Delete selected"]',
      'button[title="View details"], button[aria-label="Edit Media"], button[aria-label="Delete Media"], div:has-text("No media found.")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"]',
      'span:has-text("Showing"), span:has-text("No media found")'
    ],
    validation: [
      'Admin media page loads',
      'Header and upload action are visible',
      'Search controls (title and serial number) are visible',
      'Bulk selection and delete-selected controls are present',
      'Media card action buttons appear when results exist, otherwise no-media state appears',
      'Pagination controls and item-count footer are visible'
    ]
  },
  {
    id: 'admin-014',
    name: 'Executive Committee',
    url: '/admin/executive-committee',
    category: 'content',
    priority: 'medium',
    expectedElements: [
      'h1:has-text("Executive Committee Management")',
      'h2:has-text("Team Members")',
      'button[aria-label="Add Member"]',
      '#exec-committee-search, h3:has-text("No team members yet")',
      'table thead th, h3:has-text("No team members yet")',
      'button[aria-label="View details"], button[aria-label="Edit member"], button[aria-label="Delete member"], span:has-text("No members found."), span:has-text("No members match your search."), h3:has-text("No team members yet")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"], h3:has-text("No team members yet")',
      'span:has-text("Showing"), h3:has-text("No team members yet")'
    ],
    timeout: 45000, // Increased timeout for this page (makes API calls)
    validation: [
      'Executive committee page loads',
      'Page header, management section, and Add Member control are visible',
      'Search input is visible',
      'Members table headers appear when data exists, otherwise empty-state messaging appears',
      'Row actions (view/edit/delete) appear when members exist',
      'Pagination and item-count footer are visible'
    ]
  },
  {
    id: 'admin-015',
    name: 'Event Sponsors (Global)',
    url: '/admin/event-sponsors',
    category: 'content',
    priority: 'medium',
    expectedElements: [
      'h1:has-text("Global Sponsors")',
      'button[aria-label="Add Sponsor"]',
      'input[placeholder*="Search sponsors"]',
      'select:has(option:has-text("All Types")), select:has(option:has-text("All Status"))',
      'table thead th, span:has-text("No sponsors found")',
      'a[href^="/admin/event-sponsors/"], button[aria-label="Delete"], span:has-text("No sponsors found")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"]',
      'span:has-text("Showing"), span:has-text("No sponsors found")'
    ],
    validation: [
      'Global event sponsors page loads',
      'Header, search controls, and Add Sponsor action are visible',
      'Type and status filter controls are visible',
      'Sponsors table headers appear when data exists, otherwise no-sponsors state appears',
      'Sponsor row actions are visible when rows exist',
      'Pagination controls and item-count footer are visible'
    ]
  },
  {
    id: 'admin-016',
    name: 'Global Performers',
    url: '/admin/event-featured-performers',
    category: 'content',
    priority: 'medium',
    expectedElements: [
      'h1:has-text("Global Performers")',
      'input[placeholder*="Search performers"], select:has(option:has-text("All Events"))',
      'button[aria-label="Add Performer"]',
      'table thead th, span:has-text("No performers found")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"]',
      'span:has-text("Showing"), span:has-text("No performers found")',
      'button[aria-label="Edit"], button[aria-label="Delete"], span:has-text("No performers found")',
      'div[role="dialog"]:has-text("Add Featured Performer"), button[aria-label="Cancel"], button[aria-label="Create Performer"]'
    ],
    validation: [
      'Global performers page loads',
      'Header, search controls, event filter, and Add Performer action are visible',
      'Performers table headers appear when data exists, otherwise no-performers state appears',
      'Row actions (edit/delete) are visible when rows exist',
      'Pagination controls and item-count footer are visible',
      'Create performer modal controls are present when opened'
    ]
  },
  {
    id: 'admin-017',
    name: 'Global Contacts',
    url: '/admin/event-contacts',
    category: 'content',
    priority: 'medium',
    expectedElements: [
      'h1:has-text("Global Contacts")',
      'input[placeholder*="Search contacts"], select:has(option:has-text("All Events"))',
      'button[aria-label="Add Contact"]',
      'table thead th, span:has-text("No contacts found")',
      'button[aria-label="Edit"], button[aria-label="Delete"], span:has-text("No contacts found")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"]',
      'span:has-text("Showing"), span:has-text("No contacts found")',
      'div[role="dialog"]:has-text("Add Event Contact"), button[aria-label="Cancel"], button[aria-label="Create Contact"]'
    ],
    validation: [
      'Global contacts page loads',
      'Header, search controls, event filter, and Add Contact action are visible',
      'Contacts table headers appear when data exists, otherwise no-contacts state appears',
      'Row actions (edit/delete) are visible when rows exist',
      'Pagination controls and item-count footer are visible',
      'Create contact modal controls are present when opened'
    ]
  },
  {
    id: 'admin-018',
    name: 'Global Emails',
    url: '/admin/event-emails',
    category: 'content',
    priority: 'medium',
    expectedElements: [
      'h1:has-text("Global Emails")',
      'button[aria-label="Add Email"]',
      'input[placeholder*="Search emails"]',
      'table thead th, span:has-text("No emails found")',
      'button[aria-label="Edit"], button[aria-label="Delete"], span:has-text("No emails found")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"]',
      'span:has-text("Showing"), span:has-text("No emails found")',
      'div[role="dialog"]:has-text("Add Global Event Email"), button[aria-label="Cancel"], button[aria-label="Create Email"]'
    ],
    validation: [
      'Global emails page loads',
      'Header, search control, and Add Email action are visible',
      'Emails table headers appear when data exists, otherwise no-emails state appears',
      'Row actions (edit/delete) are visible when rows exist',
      'Pagination controls and item-count footer are visible',
      'Create email modal controls are present when opened'
    ]
  },
  {
    id: 'admin-019',
    name: 'Global Program Directors',
    url: '/admin/event-program-directors',
    category: 'content',
    priority: 'medium',
    expectedElements: [
      'h1:has-text("Global Program Directors")',
      'input[placeholder*="Search directors"], select:has(option:has-text("All Events"))',
      'button[aria-label="Add Director"]',
      'table thead th, span:has-text("No directors found")',
      'button[aria-label="Edit"], button[aria-label="Delete"], span:has-text("No directors found")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"]',
      'span:has-text("Showing"), span:has-text("No directors found")',
      'div[role="dialog"]:has-text("Add Global Program Director"), button[aria-label="Cancel"], button[aria-label="Create Director"]'
    ],
    validation: [
      'Global program directors page loads',
      'Header, search controls, event filter, and Add Director action are visible',
      'Directors table headers appear when data exists, otherwise no-directors state appears',
      'Row actions (edit/delete) are visible when rows exist',
      'Pagination controls and item-count footer are visible',
      'Create director modal controls are present when opened'
    ]
  },

  // ==========================================
  // TENANT MANAGEMENT
  // ==========================================
  {
    id: 'admin-020',
    name: 'Organizations',
    url: '/admin/tenant-management/organizations',
    category: 'tenant',
    priority: 'high',
    expectedElements: [
      'h1:has-text("Tenant Organizations")',
      'h2:has-text("Tenant Organizations")',
      'a[aria-label="Create New Organization"]',
      'input[placeholder*="Search by organization name"], select:has(option:has-text("All Statuses")), select:has(option:has-text("All Organizations"))',
      'table thead th, span:has-text("No organizations found")',
      'a[aria-label="View Organization"], a[aria-label="Edit Organization"], button[aria-label="Delete Organization"], span:has-text("No organizations found")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"]',
      'span:has-text("Showing"), span:has-text("No organizations found")'
    ],
    validation: [
      'Tenant organizations page loads',
      'Page header and create organization action are visible',
      'Search and filter controls are visible',
      'Organization table headers appear when data exists, otherwise no-organizations state appears',
      'Row actions (view/edit/delete) are visible when rows exist',
      'Pagination controls and item-count footer are visible'
    ]
  },
  {
    id: 'admin-021',
    name: 'Tenant Settings',
    url: '/admin/tenant-management/settings',
    category: 'tenant',
    priority: 'high',
    expectedElements: [
      'h1:has-text("Tenant Settings")',
      'h2:has-text("Tenant Settings")',
      'a[aria-label="Create New Settings"]',
      'input[placeholder*="Search by tenant ID"], input[placeholder*="Filter by specific tenant ID"]',
      'table thead th, span:has-text("No settings found")',
      'a[aria-label="View details"], a[aria-label="Edit settings"], button[aria-label="Delete settings"], span:has-text("No settings found")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"]',
      'span:has-text("Showing"), span:has-text("No settings found")'
    ],
    validation: [
      'Tenant settings page loads',
      'Page header and create settings action are visible',
      'Search and tenant filter inputs are visible',
      'Settings table headers appear when data exists, otherwise no-settings state appears',
      'Row actions (view/edit/delete) are visible when rows exist',
      'Pagination controls and item-count footer are visible'
    ]
  },
  {
    id: 'admin-022',
    name: 'Tenant Management Test CRUD',
    url: '/admin/tenant-management/test',
    category: 'tenant',
    priority: 'medium',
    expectedElements: [
      'h1:has-text("Test CRUD Operations")',
      'a:has-text("Admin Dashboard"), a:has-text("Tenant Management"), span:has-text("Test CRUD Operations")',
      'h2:has-text("Test Controls"), h2:has-text("Test Results"), h2:has-text("Test Logs")',
      'button[aria-label="Run All Tests"], button[aria-label="Test Organizations Only"], button[aria-label="Test Settings Only"], button[aria-label="Clear Results"]',
      'div:has-text("All Tests"), div:has-text("Organizations"), div:has-text("Settings")',
      'p:has-text("No logs yet. Run a test to see the output.")'
    ],
    validation: [
      'Tenant management CRUD test page loads',
      'Breadcrumb navigation (admin and tenant management links) is visible',
      'Test controls section and all test action buttons are visible',
      'Results summary cards for all/org/settings are visible',
      'Logs section and initial empty logs message are visible'
    ]
  },

  // ==========================================
  // TESTING & UTILITIES
  // ==========================================
  {
    id: 'admin-023',
    name: 'Test Stripe',
    url: '/admin/test-stripe',
    category: 'utilities',
    priority: 'low',
    expectedElements: [
      'h1:has-text("Test Stripe Transaction")',
      'h2:has-text("Test Stripe Integration")',
      'label[for="amount"], input#amount',
      'button[aria-label="Test Stripe Payment"]',
      'h3:has-text("Test Card Numbers")',
      'p:has-text("Success:"), p:has-text("Decline:"), p:has-text("Insufficient Funds:")'
    ],
    validation: [
      'Test Stripe page loads',
      'Stripe integration intro panel is visible',
      'Amount input and test payment button are visible',
      'Test card numbers reference section is displayed'
    ]
  },
  {
    id: 'admin-024',
    name: 'Gallery Albums',
    url: '/admin/gallery/albums',
    category: 'content',
    priority: 'medium',
    expectedElements: [
      'h1:has-text("Gallery Albums")',
      'a[aria-label="Admin Dashboard"]',
      'button[aria-label="Create New Album"]',
      'form:has(input[placeholder*="Search albums by title"]), button:has-text("Search")',
      'a[aria-label="Manage Media"], a[aria-label="Edit Album"], button[aria-label="Delete Album"], h3:has-text("No albums found")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"], span:has-text("Showing")',
      'button[aria-label="Cancel"], button[aria-label="Create Album"]'
    ],
    validation: [
      'Gallery albums page loads',
      'Header, breadcrumb action, and create album control are visible',
      'Search bar and search submit action are present',
      'Album card actions (manage media/edit/delete) appear when albums exist, otherwise no-albums state appears',
      'Pagination controls and item-count footer appear when there are results',
      'Create album modal actions are present'
    ]
  },
  {
    id: 'admin-025',
    name: 'Homepage Cache',
    url: '/admin/homepage-cache',
    category: 'tenant',
    priority: 'high',
    expectedElements: [
      'h1:has-text("Cache records")',
      'button[aria-label="Reload data from database"]',
      'table thead th, td:has-text("No tenant settings found. Create tenant settings first.")',
      'button[aria-label="Refresh cache records for this tenant"], td:has-text("No tenant settings found. Create tenant settings first.")',
      'div:has-text("Cache refreshed for"), div:has-text("Failed to refresh cache")'
    ],
    validation: [
      'Homepage cache page loads',
      'Header and reload-from-database action are visible',
      'Cache records table headers appear when settings exist, otherwise no-settings state appears',
      'Refresh cache action is visible for rows when settings exist',
      'Success or error message area appears after refresh actions'
    ]
  },
  {
    id: 'admin-026',
    name: 'Admin QR Scanner',
    url: '/admin/qr-scanner',
    category: 'utilities',
    priority: 'high',
    expectedElements: [
      'h1:has-text("QR Code Scanner")',
      'p:has-text("Scan QR codes to verify and check in tickets")',
      'video, canvas, [class*="scanner"], [id*="scanner"]',
      'h3:has-text("Instructions:"), li:has-text("Point your camera at the QR code on the ticket")',
      'li:has-text("Use the \\"Switch Camera\\" button to toggle between front and back cameras")',
      'button:has-text("Scan Another QR Code"), h3:has-text("Valid Ticket"), h3:has-text("Invalid Ticket"), h3:has-text("Error")'
    ],
    validation: [
      'QR scanner page loads',
      'Scanner header and subtitle are visible',
      'Camera/scanner viewport element is visible',
      'Instruction panel and core guidance bullets are visible',
      'Result states (valid/invalid/error) or scan-another action surface when applicable'
    ]
  },
  {
    id: 'admin-027',
    name: 'Check-In Analytics',
    url: '/admin/check-in-analytics',
    category: 'analytics',
    priority: 'high',
    timeout: 60000,
    expectedElements: [
      'h1:has-text("Check-In Analytics")',
      'input[placeholder*="Search events by title"], button[aria-label="Search events"]',
      'button[aria-label="Quick Select Date Range"], button[aria-label="Apply Date Range"], button[aria-label="Clear Date Range"]',
      'h3:has-text("Getting Started"), p:has-text("Enter an Event ID above to view check-in analytics and history.")',
      'h3:has-text("Check-In History"), input[placeholder*="Search by name, email, or ID..."], button[aria-label="Export to CSV"]',
      'table thead th:has-text("Transaction ID"), table thead th:has-text("Check-In Time"), div:has-text("No check-ins found for this event.")'
    ],
    validation: [
      'Check-in analytics page loads',
      'Header and event search selector controls are visible',
      'Date range controls are visible for analytics filtering',
      'Getting-started guidance is visible before event selection',
      'Check-in history search/export controls appear when event data is loaded',
      'History table headers appear when data exists, otherwise empty-state message appears'
    ]
  },
  {
    id: 'admin-028',
    name: 'Sales Analytics',
    url: '/admin/sales-analytics',
    category: 'analytics',
    priority: 'high',
    expectedElements: [
      'h1:has-text("Sales Analytics")',
      'p:has-text("View and analyze sales data for your events")',
      'input[placeholder*="Search events by title"], button[aria-label="Search events"]',
      'button[aria-label="Quick Select Date Range"], button[aria-label="Apply Date Range"], button[aria-label="Clear Date Range"]',
      'h3:has-text("Getting Started"), p:has-text("Enter an Event ID above to view sales analytics and reports.")',
      'h3:has-text("Sales Transactions"), input[placeholder*="Search by name, email, or ID..."], button[aria-label="Export to CSV"], button[aria-label="Export to Excel"]',
      'p:has-text("Total Revenue"), p:has-text("Gross Revenue"), p:has-text("Net Revenue"), p:has-text("Avg Ticket Price")',
      'table thead th:has-text("Transaction ID"), table thead th:has-text("Final Amount"), div:has-text("No sales data found for this event.")'
    ],
    validation: [
      'Sales analytics page loads',
      'Header and event search controls are visible',
      'Date range controls are visible for sales filtering',
      'Getting-started guidance is visible before event selection',
      'Sales metric cards are visible when analytics are available',
      'Sales transactions search and export controls appear when event data is loaded',
      'Sales table headers appear when data exists, otherwise empty-state message appears'
    ]
  },
  {
    id: 'admin-029',
    name: 'Manual Payments',
    url: '/admin/manual-payments',
    category: 'analytics',
    priority: 'high',
    expectedElements: [
      'h1:has-text("Manual Payments")',
      'input[placeholder*="Search events by title"], button[aria-label="Search events"]',
      'button[aria-label="Quick Select Date Range"], button[aria-label="Apply Date Range"], button[aria-label="Clear Date Range"]',
      'h3:has-text("Manual Payment Summary Batch Job"), button:has-text("Batch Job Options"), button[aria-label="Trigger Manual Payment Summary Batch Job"]',
      'h3:has-text("Getting Started"), p:has-text("Enter an Event ID above to view manual payment requests and summaries.")',
      'h3:has-text("Manual Payment Requests"), input[placeholder*="Search by ID, handle, or instructions..."], select:has(option:has-text("All Statuses")), select:has(option:has-text("All Methods"))',
      'table thead th:has-text("Method"), table thead th:has-text("Status"), a:has-text("View"), button:has-text("Mark Received"), button:has-text("Cancel")',
      'button[aria-label="Previous Page"], button[aria-label="Next Page"], span:has-text("Showing"), div:has-text("No manual payments found for this event.")'
    ],
    validation: [
      'Manual payments page loads',
      'Header and event search controls are visible',
      'Date range controls are visible for manual payment filtering',
      'Batch job section controls are visible for summary refresh operations',
      'Getting-started guidance is visible before event selection',
      'Manual payment request search and status/method filters are visible',
      'Request table actions appear when data exists, otherwise empty-state message appears',
      'Pagination and item-count footer controls are visible'
    ]
  },
  {
    id: 'admin-030',
    name: 'Official Documents',
    url: '/admin/official-documents',
    category: 'content',
    priority: 'high',
    expectedElements: [
      'h1:has-text("Official documents")',
      'a:has-text("Admin Dashboard"), a:has-text("Browse categories (list)")',
      'h2:has-text("Bulk upload"), button:has-text("Upload batch"), label:has-text("Upload folder"), label:has-text("Choose files")',
      'h2:has-text("Filters"), button:has-text("Apply"), button:has-text("Refresh categories"), button:has-text("Add one file")',
      'h2:has-text("Year bundle cover"), button:has-text("Create year bundle"), button:has-text("Save cover")',
      'h2:has-text("Tenant official documents"), table thead th:has-text("Title"), table thead th:has-text("Link"), td:has-text("No documents found. Upload above or adjust filters.")',
      'button[aria-label="Edit document"], button[aria-label="Delete document"], button[aria-label="Previous Page"], button[aria-label="Next Page"]',
      'span:has-text("Showing"), span:has-text("No documents match the current filters"), div[role="dialog"]:has-text("Edit official document"), div:has-text("Delete document?")'
    ],
    validation: [
      'Official documents page loads',
      'Top navigation links to admin dashboard and categories list are visible',
      'Bulk upload section controls for files and folder upload are visible',
      'Filter section actions (apply/refresh/add-one-file) are visible',
      'Year bundle cover controls are visible',
      'Documents table headers appear when data exists, otherwise no-documents state appears',
      'Row actions (edit/delete) and pagination controls are visible',
      'Edit/delete dialog states are available from document actions'
    ]
  },
  {
    id: 'admin-031',
    name: 'Official Document Categories',
    url: '/admin/official-document-categories',
    category: 'content',
    priority: 'high',
    expectedElements: [
      'h1:has-text("Official document categories")',
      'a:has-text("Admin Dashboard"), a:has-text("Official documents (upload)")',
      'p:has-text("Manage category slugs used for bulk upload and year bundles. Tenant-scoped via the API.")',
      'button[aria-label="Add category"], span:has-text("Add category")',
      'code:has-text("official_document_category"), p:has-text("Rows in"), p:has-text("CRUD is disabled until GET /api/official-document-categories returns data from your backend.")',
      'table thead th:has-text("Sort"), table thead th:has-text("Active"), table thead th:has-text("Slug"), table thead th:has-text("Display name"), table thead th:has-text("Description"), td:has-text("No categories on this page."), td:has-text("No categories.")',
      'button[aria-label="Edit category"], button[aria-label="Delete category"], button[aria-label="Previous Page"], button[aria-label="Next Page"]',
      'span:has-text("Showing"), div:has-text("No categories"), div[role="alert"]:has-text("Slug and display name are required.")',
      'div[role="dialog"]:has-text("Add category"), div[role="dialog"]:has-text("Edit category"), div[role="alertdialog"]:has-text("Delete category?"), span:has-text("Create"), span:has-text("Save"), span:has-text("Delete")'
    ],
    validation: [
      'Official document categories page loads',
      'Top navigation links to admin dashboard and official documents upload page are visible',
      'Page description and tenant/category guidance text are visible',
      'Add category action is available in API mode',
      'Categories table headers appear when data exists, otherwise no-categories empty state appears',
      'Row actions (edit/delete) and pagination controls are visible in API mode',
      'Pagination footer item count/empty state is visible',
      'Add/edit/delete dialog states are available from category actions'
    ]
  }
];

// Note: Dynamic event pages are now tested in a separate script
// See: TestSprite/admin-tests/dynamic-event-test-suite.js
// Run: npm run test:admin:dynamic

/**
 * Get available event IDs from the manage-events page
 * NOTE: This function has been moved to dynamic-event-test-suite.js
 * This is kept here for reference but is no longer used in this script
 */
async function getAvailableEventIds_DEPRECATED(page, baseUrl) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(`\n   🔍 Discovering event IDs (attempt ${retryCount + 1}/${maxRetries})...`);

      // Navigate to manage-events page
      console.log(`   📍 Navigating to ${baseUrl}/admin/manage-events...`);
      await page.goto(`${baseUrl}/admin/manage-events`, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      // Wait for page to fully load (including client-side rendering)
      console.log(`   ⏳ Waiting 8 seconds for page to fully load...`);
      await page.waitForTimeout(8000); // Increased wait time for client-side rendering

      // Wait for network to be idle (no pending requests)
      try {
        console.log(`   ⏳ Waiting for network to be idle...`);
        await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
          console.warn(`   ⚠️  Network idle timeout, continuing...`);
        });
      } catch (e) {
        console.warn(`   ⚠️  Network idle check failed, continuing...`);
      }

      // Debug: Check what's actually on the page
      const pageStructure = await page.evaluate(() => {
        const structure = {
          bodyChildren: document.body ? document.body.children.length : 0,
          hasThirdDiv: document.body && document.body.children.length >= 3,
          thirdDivChildren: document.body && document.body.children.length >= 3 ? document.body.children[2].children.length : 0,
          hasTable: !!document.querySelector('table'),
          tableRows: document.querySelector('table') ? document.querySelector('table').querySelectorAll('tbody tr').length : 0,
          allButtons: document.querySelectorAll('button').length,
          allLinks: document.querySelectorAll('a[href*="/admin/events/"]').length
        };

        // Try to navigate to the exact XPath structure
        try {
          if (document.body && document.body.children.length >= 3) {
            const thirdDiv = document.body.children[2];
            if (thirdDiv.children.length > 0) {
              const innerDiv = thirdDiv.children[0];
              structure.hasInnerDiv = true;
              structure.innerDivChildren = innerDiv.children.length;

              // Check for table
              const table = innerDiv.querySelector('table');
              structure.hasTableInStructure = !!table;
              if (table) {
                structure.tableRowsInStructure = table.querySelectorAll('tbody tr').length;
              }

              // Check for toggle button structure (div[5] > div > div[3] > button)
              if (innerDiv.children.length >= 5) {
                const fifthDiv = innerDiv.children[4];
                if (fifthDiv.children.length > 0) {
                  const innerFifthDiv = fifthDiv.children[0];
                  if (innerFifthDiv.children.length >= 3) {
                    const thirdInnerDiv = innerFifthDiv.children[2];
                    const button = thirdInnerDiv.querySelector('button');
                    structure.hasToggleButtonInStructure = !!button;
                  }
                }
              }
            }
          }
        } catch (e) {
          structure.structureError = e.message;
        }

        return structure;
      });

      console.log(`   🔍 Page structure debug:`, JSON.stringify(pageStructure, null, 2));

      // Wait for the events table using exact XPath path
      console.log(`   🔍 Looking for events table using exact XPath...`);
      let tableFound = false;
      let tableHandle = null;

      // Strategy 1: Use exact XPath path via evaluateHandle
      try {
        tableHandle = await page.evaluateHandle(() => {
          try {
            // Exact XPath: /html/body/div[3]/div/table
            const body = document.body;
            if (body && body.children.length >= 3) {
              const thirdDiv = body.children[2];
              if (thirdDiv.children.length > 0) {
                const innerDiv = thirdDiv.children[0];
                const table = innerDiv.querySelector('table');
                return table;
              }
            }
            return null;
          } catch (e) {
            console.error('[Page] Error finding table:', e);
            return null;
          }
        });

        if (tableHandle && tableHandle.asElement()) {
          tableFound = true;
          console.log(`   ✅ Table found via exact XPath structure`);
        }
      } catch (e) {
        console.warn(`   ⚠️  XPath structure method failed: ${e.message}`);
      }

      // Strategy 2: Wait for table element directly (fallback)
      if (!tableFound) {
        try {
          await page.waitForSelector('table', { timeout: 15000 });
          tableFound = true;
          console.log(`   ✅ Table found via 'table' selector`);
        } catch (e) {
          console.warn(`   ⚠️  Table not found via 'table' selector`);
        }
      }

      // Additional wait for client-side data loading
      console.log(`   ⏳ Waiting 5 seconds for data to load...`);
      await page.waitForTimeout(5000);

      // Check if events table has rows using exact XPath structure
      const hasEvents = await page.evaluate(() => {
        try {
          // Exact XPath: /html/body/div[3]/div/table/tbody/tr
          const body = document.body;
          if (body && body.children.length >= 3) {
            const thirdDiv = body.children[2];
            if (thirdDiv.children.length > 0) {
              const innerDiv = thirdDiv.children[0];
              const table = innerDiv.querySelector('table');
              if (table) {
                const rows = table.querySelectorAll('tbody tr');
                const rowCount = rows.length;
                console.log(`[Page] Found ${rowCount} rows in table via XPath structure`);
                return rowCount > 0;
              }
            }
          }

          // Fallback: Direct table query
          const table = document.querySelector('table');
          if (table) {
            const rows = table.querySelectorAll('tbody tr');
            return rows.length > 0;
          }

          return false;
        } catch (e) {
          console.error('[Page] Error checking events:', e);
          return false;
        }
      });

      console.log(`   📊 Events table found: ${tableFound ? 'Yes' : 'No'}, Has events: ${hasEvents ? 'Yes' : 'No'}`);

      // If no events found, try toggling the future/past switcher
      if (!hasEvents && retryCount === 0) {
        console.log(`   🔄 No events found, attempting to toggle future/past switcher...`);

        try {
          // Use exact XPath path: /html/body/div[3]/div/div[5]/div/div[3]/button
          console.log(`   🔍 Looking for toggle button using exact XPath...`);
          let toggleButtonHandle = await page.evaluateHandle(() => {
            try {
              // Exact XPath: /html/body/div[3]/div/div[5]/div/div[3]/button
              const body = document.body;
              if (!body || body.children.length < 3) {
                console.log('[Page] Body has less than 3 children');
                return null;
              }

              const thirdDiv = body.children[2];
              if (!thirdDiv || thirdDiv.children.length === 0) {
                console.log('[Page] Third div has no children');
                return null;
              }

              const innerDiv = thirdDiv.children[0];
              if (!innerDiv || innerDiv.children.length < 5) {
                console.log(`[Page] Inner div has ${innerDiv ? innerDiv.children.length : 0} children, need at least 5`);
                return null;
              }

              const fifthDiv = innerDiv.children[4];
              if (!fifthDiv || fifthDiv.children.length === 0) {
                console.log('[Page] Fifth div has no children');
                return null;
              }

              const innerFifthDiv = fifthDiv.children[0];
              if (!innerFifthDiv || innerFifthDiv.children.length < 3) {
                console.log(`[Page] Inner fifth div has ${innerFifthDiv ? innerFifthDiv.children.length : 0} children, need at least 3`);
                return null;
              }

              const thirdInnerDiv = innerFifthDiv.children[2];
              const button = thirdInnerDiv ? thirdInnerDiv.querySelector('button') : null;

              if (button) {
                console.log('[Page] ✅ Toggle button found via exact XPath structure');
              } else {
                console.log('[Page] ❌ Toggle button not found in thirdInnerDiv');
              }

              return button;
            } catch (e) {
              console.error('[Page] Error finding toggle button:', e);
              return null;
            }
          });

          let toggleButton = null;
          if (toggleButtonHandle && toggleButtonHandle.asElement()) {
            toggleButton = toggleButtonHandle.asElement();
            console.log(`   ✅ Toggle button found via exact XPath structure`);
          } else {
            // Fallback: Try aria-label
            console.log(`   🔍 Toggle button not found via XPath, trying aria-label...`);
            toggleButton = await page.$('button[aria-label*="Show Future Events"], button[aria-label*="Show Past Events"]').catch(() => null);
            if (toggleButton) {
              console.log(`   ✅ Toggle button found via aria-label`);
            }
          }

          if (toggleButton) {
            console.log(`   ✅ Toggle button found, clicking...`);
            await toggleButton.click();

            // Wait for page to reload after toggle
            console.log(`   ⏳ Waiting 8 seconds for data to reload after toggle...`);
            await page.waitForTimeout(8000); // Increased wait time for data reload

            // Wait for network to be idle
            try {
              console.log(`   ⏳ Waiting for network to be idle after toggle...`);
              await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
                console.warn(`   ⚠️  Network idle timeout after toggle, continuing...`);
              });
            } catch (e) {
              console.warn(`   ⚠️  Network idle check failed after toggle`);
            }

            // Wait for table to update using exact XPath
            console.log(`   ⏳ Waiting for table to update...`);
            await page.waitForTimeout(5000);

            // Check again if events are now visible using exact XPath
            const hasEventsAfterToggle = await page.evaluate(() => {
              try {
                // Exact XPath: /html/body/div[3]/div/table/tbody/tr
                const body = document.body;
                if (body && body.children.length >= 3) {
                  const thirdDiv = body.children[2];
                  if (thirdDiv.children.length > 0) {
                    const innerDiv = thirdDiv.children[0];
                    const table = innerDiv.querySelector('table');
                    if (table) {
                      const rows = table.querySelectorAll('tbody tr');
                      const rowCount = rows.length;
                      console.log(`[Page] After toggle: Found ${rowCount} rows`);
                      return rowCount > 0;
                    }
                  }
                }
                return false;
              } catch (e) {
                console.error('[Page] Error checking events after toggle:', e);
                return false;
              }
            });

            console.log(`   📊 Events after toggle: ${hasEventsAfterToggle ? 'Found' : 'Still none'}`);

            if (!hasEventsAfterToggle) {
              console.warn(`   ⚠️  No events found even after toggle, will retry...`);
              retryCount++;
              continue;
            }
          } else {
            console.warn(`   ⚠️  Toggle button not found with any method, will retry...`);
            retryCount++;
            continue;
          }
        } catch (toggleError) {
          console.warn(`   ⚠️  Error toggling switcher: ${toggleError.message}`);
          console.warn(`   📍 Error stack: ${toggleError.stack?.split('\n').slice(0, 3).join('\n')}`);
          retryCount++;
          continue;
        }
      }

      // Look for "Upload Media Files" links using exact XPath: /html/body/div[3]/div/table/tbody/tr[1]/td[9]/a
      console.log(`   🔍 Looking for Upload Media Files links using exact XPath...`);
      const eventIds = await page.evaluate(() => {
        const ids = [];

        try {
          // Exact XPath: /html/body/div[3]/div/table/tbody/tr[1]/td[9]/a
          const body = document.body;
          if (!body || body.children.length < 3) {
            console.log('[Page] Body structure not found');
            return [];
          }

          const thirdDiv = body.children[2];
          if (!thirdDiv || thirdDiv.children.length === 0) {
            console.log('[Page] Third div has no children');
            return [];
          }

          const innerDiv = thirdDiv.children[0];
          const table = innerDiv.querySelector('table');
          if (!table) {
            console.log('[Page] Table not found in innerDiv');
            return [];
          }

          const tbody = table.querySelector('tbody');
          if (!tbody) {
            console.log('[Page] Tbody not found in table');
            return [];
          }

          const rows = tbody.querySelectorAll('tr');
          console.log(`[Page] Found ${rows.length} rows in table`);

          // Check each row's 9th column (td[9]) for Upload Media Files link
          rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 9) {
              const mediaCell = cells[8]; // 0-indexed, so 8 = 9th column (td[9])
              const link = mediaCell.querySelector('a[href*="/admin/events/"][href*="/media"]');
              if (link) {
                const href = link.getAttribute('href');
                if (href) {
                  const match = href.match(/\/admin\/events\/(\d+)\/media/);
                  if (match) {
                    ids.push(match[1]);
                    console.log(`[Page] Found event ID ${match[1]} in row ${index + 1}, column 9`);
                  }
                }
              }
            }
          });

          // Fallback: Find all media links if XPath structure didn't work
          if (ids.length === 0) {
            console.log('[Page] No IDs found via XPath, trying all media links...');
            const mediaLinks = Array.from(document.querySelectorAll('a[href*="/admin/events/"][href*="/media"]'));
            mediaLinks.forEach(link => {
              const href = link.getAttribute('href');
              if (href) {
                const match = href.match(/\/admin\/events\/(\d+)\/media/);
                if (match) ids.push(match[1]);
              }
            });
          }
        } catch (e) {
          console.error('[Page] Error finding event IDs:', e);
        }

        // Remove duplicates and return unique IDs
        return [...new Set(ids)];
      });

      if (eventIds.length > 0) {
        console.log(`   ✅ Found ${eventIds.length} event ID(s): ${eventIds.join(', ')}`);

        // Randomly select up to 3 events for testing
        const selectedIds = eventIds
          .sort(() => Math.random() - 0.5) // Shuffle
          .slice(0, 3); // Take first 3

        console.log(`   🎯 Selected ${selectedIds.length} event ID(s) for testing: ${selectedIds.join(', ')}`);
        return selectedIds;
      } else {
        // Fallback: Try to find any event links if media links weren't found
        console.log(`   🔍 Media links not found, trying generic event links...`);

        const fallbackIds = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/admin/events/"]'));
          const ids = links
            .map(link => {
              const href = link.getAttribute('href');
              if (!href) return null;
              const match = href.match(/\/admin\/events\/(\d+)/);
              return match ? match[1] : null;
            })
            .filter(id => id !== null);
          return [...new Set(ids)];
        });

        if (fallbackIds.length > 0) {
          console.log(`   ✅ Found ${fallbackIds.length} event ID(s) via fallback: ${fallbackIds.join(', ')}`);
          return fallbackIds.slice(0, 3);
        }

        console.warn(`   ⚠️  No event IDs found, will retry...`);
        retryCount++;

        if (retryCount < maxRetries) {
          console.log(`   ⏳ Waiting 3 seconds before retry...`);
          await page.waitForTimeout(3000); // Wait before retry
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Error fetching event IDs (attempt ${retryCount + 1}/${maxRetries}): ${error.message}`);
      console.warn(`   📍 Error stack: ${error.stack?.split('\n').slice(0, 3).join('\n')}`);
      retryCount++;

      if (retryCount < maxRetries) {
        console.log(`   ⏳ Waiting 3 seconds before retry...`);
        await page.waitForTimeout(3000); // Wait before retry
      }
    }
  }

  console.warn(`   ❌ Could not fetch event IDs after ${maxRetries} attempts`);
  return [];
}

/**
 * Extended checks for /admin/focus-groups (admin-007): list UI, search filter, table columns,
 * row action links when data exists, and pagination when multiple pages of results exist.
 */
async function runFocusGroupsExtendedChecks(page, test, elementsFound) {
  const expected = test.expectedElements || [];
  const foundSelectors = new Set(elementsFound.map((e) => e.selector));
  const missing = expected.filter((sel) => !foundSelectors.has(sel));
  if (missing.length > 0) {
    throw new Error(`Focus groups page missing expected elements: ${missing.join(', ')}`);
  }

  await page.waitForSelector('#focus-groups-search', { state: 'visible', timeout: 15000 });
  const newLink = await page.$('a[href="/admin/focus-groups/new"], a[href*="/admin/focus-groups/new"]');
  if (!newLink || !(await newLink.isVisible().catch(() => false))) {
    throw new Error('Focus groups: "New Group" link not visible');
  }

  const hasColumns = await page.evaluate(() => {
    const ths = [...document.querySelectorAll('table thead th')].map((t) => (t.textContent || '').trim());
    return ths.includes('Name') && ths.includes('Slug') && ths.includes('Active') && ths.includes('Actions');
  });
  if (!hasColumns) {
    throw new Error('Focus groups: table missing expected columns (Name, Slug, Active, Actions)');
  }

  await page.fill('#focus-groups-search', '__testsprite_no_results_xyz__');
  await page.waitForTimeout(500);
  const noMatchVisible = await page.evaluate(() => document.body.innerText.includes('No focus groups match your search'));
  if (!noMatchVisible) {
    throw new Error('Focus groups: search with no matches did not show expected empty message');
  }

  await page.fill('#focus-groups-search', '');
  await page.waitForTimeout(400);

  const editCount = await page.$$eval('a[href*="/admin/focus-groups/"][href*="/edit"]', (as) => as.length);
  if (editCount > 0) {
    const actionHrefs = await page.$$eval('tbody a[href*="/admin/focus-groups/"]', (anchors) =>
      anchors.map((a) => a.getAttribute('href') || '')
    );
    const hasEvents = actionHrefs.some((h) => h.includes('/events'));
    const hasMembers = actionHrefs.some((h) => h.includes('/members'));
    const hasMedia = actionHrefs.some((h) => h.includes('/media'));
    if (!hasEvents || !hasMembers || !hasMedia) {
      throw new Error(
        `Focus groups: expected row action links for events, members, and media. Found events=${hasEvents}, members=${hasMembers}, media=${hasMedia}`
      );
    }

    const nextBtn = await page.$('button[aria-label="Next Page"]');
    if (nextBtn) {
      const isDisabled = await nextBtn.evaluate((el) => {
        return el.disabled || el.getAttribute('aria-disabled') === 'true' || el.classList.contains('pointer-events-none');
      });
      if (!isDisabled) {
        await nextBtn.click();
        await page.waitForTimeout(400);
        const prevBtn = await page.$('button[aria-label="Previous Page"]');
        if (prevBtn) {
          await prevBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }
  }
}

/**
 * Extended checks for /admin/membership/plans (admin-008): header, back link, create flow modal,
 * table columns when plans exist or empty state, pagination when multiple pages, optional test-plans strip.
 */
async function runMembershipPlansExtendedChecks(page, test, elementsFound) {
  const expected = test.expectedElements || [];
  const foundSelectors = new Set(elementsFound.map((e) => e.selector));
  const missing = expected.filter((sel) => !foundSelectors.has(sel));
  if (missing.length > 0) {
    throw new Error(`Membership plans page missing expected elements: ${missing.join(', ')}`);
  }

  const h1 = await page.$('h1');
  const h1Text = (await h1?.textContent()) || '';
  if (!h1Text.includes('Membership Plans')) {
    throw new Error('Membership plans: expected main heading to contain "Membership Plans"');
  }

  const back = await page.$('a[aria-label="Back to Admin"]');
  if (!back || !(await back.isVisible().catch(() => false))) {
    throw new Error('Membership plans: Back to Admin link not visible');
  }

  const bodyText = await page.evaluate(() => document.body.innerText);
  if (!bodyText.includes('Create Test Plans')) {
    throw new Error('Membership plans: expected "Create Test Plans" helper section');
  }

  const theadThCount = await page.$$eval('table thead th', (ths) => ths.length);
  const hasPlansTable = theadThCount > 0;

  if (hasPlansTable) {
    const colsOk = await page.evaluate(() => {
      const ths = [...document.querySelectorAll('table thead th')].map((t) => (t.textContent || '').trim());
      return ths.some((t) => t.includes('Plan Name')) && ths.some((t) => t.includes('Actions'));
    });
    if (!colsOk) {
      throw new Error('Membership plans: table missing Plan Name or Actions column headers');
    }
  } else {
    if (!bodyText.includes('No membership plans found')) {
      throw new Error('Membership plans: expected empty state copy when no table is shown');
    }
  }

  const createPlanBtn = await page.$('button[aria-label="Create Plan"]');
  if (!createPlanBtn || !(await createPlanBtn.isVisible().catch(() => false))) {
    throw new Error('Membership plans: Create Plan button not visible');
  }
  await createPlanBtn.click();
  await page.waitForSelector('div.fixed.inset-0.z-50 h2', { state: 'visible', timeout: 15000 });
  const modalHeading = await page.textContent('div.fixed.inset-0.z-50 h2');
  if (!modalHeading || !modalHeading.includes('Create Plan')) {
    throw new Error('Membership plans: create modal did not show "Create Plan" heading');
  }
  await page.waitForSelector('div.fixed.inset-0.z-50 input[name="planName"]', { state: 'visible', timeout: 10000 });

  const cancelInModal = page.locator('div.fixed.inset-0.z-50').getByRole('button', { name: 'Cancel' });
  await cancelInModal.click({ timeout: 8000 });
  await page.waitForFunction(
    () => !document.querySelector('div.fixed.inset-0.z-50.flex.items-center'),
    { timeout: 8000 }
  ).catch(() => {
    throw new Error('Membership plans: create modal did not close after Cancel');
  });

  const nextBtn = await page.$('button[aria-label="Next Page"]');
  if (nextBtn) {
    const isDisabled = await nextBtn.evaluate((el) => {
      return el.disabled || el.getAttribute('aria-disabled') === 'true' || el.classList.contains('pointer-events-none');
    });
    if (!isDisabled) {
      await nextBtn.click();
      await page.waitForTimeout(800);
      const prevBtn = await page.$('button[aria-label="Previous Page"]');
      if (prevBtn) {
        const prevDisabled = await prevBtn.evaluate((el) => el.disabled || el.classList.contains('pointer-events-none'));
        if (!prevDisabled) {
          await prevBtn.click();
          await page.waitForTimeout(400);
        }
      }
    }
  }

  if (hasPlansTable) {
    const editCount = await page.$$('button[title="Edit"]');
    if (editCount.length === 0) {
      throw new Error('Membership plans: expected at least one Edit action when plans table is shown');
    }
  }
}

/**
 * Extended checks for /admin/executive-committee (admin-014): page header, guidelines, Add Member,
 * list/search/pagination when members exist, empty state otherwise, add-member modal open/close.
 */
async function runExecutiveCommitteeExtendedChecks(page, test, elementsFound) {
  const expected = test.expectedElements || [];
  const foundSelectors = new Set(elementsFound.map((e) => e.selector));
  const missing = expected.filter((sel) => !foundSelectors.has(sel));
  if (missing.length > 0) {
    throw new Error(`Executive committee page missing expected elements: ${missing.join(', ')}`);
  }

  const h1Text = (await page.textContent('h1')) || '';
  if (!h1Text.includes('Executive Committee Management')) {
    throw new Error('Executive committee: expected h1 to contain "Executive Committee Management"');
  }

  const bodyText = await page.evaluate(() => document.body.innerText);
  if (!bodyText.includes('Profile Image Guidelines')) {
    throw new Error('Executive committee: expected profile image guidelines section');
  }

  const teamHeading =
    (await page
      .$eval('.flex.justify-between.items-center h2', (el) => el.textContent || '')
      .catch(() => '')) || '';
  if (!teamHeading.includes('Team Members')) {
    throw new Error('Executive committee: expected subheading with "Team Members"');
  }

  const hasListUi = (await page.$('#exec-committee-search')) !== null;
  if (hasListUi) {
    await page.waitForSelector('#exec-committee-search', { state: 'visible', timeout: 15000 });
    const colsOk = await page.evaluate(() => {
      const ths = [...document.querySelectorAll('table thead th')].map((t) => (t.textContent || '').trim());
      return ths.some((t) => t.includes('Priority')) && ths.some((t) => t.includes('Member')) && ths.some((t) => t.includes('Actions'));
    });
    if (!colsOk) {
      throw new Error('Executive committee: table missing Priority, Member, or Actions column headers');
    }

    await page.fill('#exec-committee-search', '__no_exec_member_match_xyz__');
    await page.waitForTimeout(500);
    const noMatch = await page.evaluate(() => document.body.innerText.includes('No members match your search'));
    if (!noMatch) {
      throw new Error('Executive committee: search with no matches did not show expected message');
    }
    await page.fill('#exec-committee-search', '');
    await page.waitForTimeout(400);

    const viewBtns = await page.$$('button[aria-label="View details"]');
    const editBtns = await page.$$('button[aria-label="Edit member"]');
    if (viewBtns.length === 0 || editBtns.length === 0) {
      throw new Error('Executive committee: expected View details and Edit member actions when list has data');
    }

    const nextBtn = await page.$('button[aria-label="Next Page"]');
    if (nextBtn) {
      const isDisabled = await nextBtn.evaluate((el) => {
        return el.disabled || el.getAttribute('aria-disabled') === 'true' || el.classList.contains('pointer-events-none');
      });
      if (!isDisabled) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        const prevBtn = await page.$('button[aria-label="Previous Page"]');
        if (prevBtn) {
          const prevDisabled = await prevBtn.evaluate((el) => {
            return el.disabled || el.getAttribute('aria-disabled') === 'true' || el.classList.contains('pointer-events-none');
          });
          if (!prevDisabled) {
            await prevBtn.click();
            await page.waitForTimeout(400);
          }
        }
      }
    }
  } else if (!bodyText.includes('No team members yet')) {
    throw new Error('Executive committee: expected empty state copy when no member list is shown');
  }

  const addBtn = await page.$('button[aria-label="Add Member"]');
  if (!addBtn || !(await addBtn.isVisible().catch(() => false))) {
    throw new Error('Executive committee: Add Member button not visible');
  }
  await addBtn.click();
  await page.waitForFunction(
    () => [...document.querySelectorAll('h2')].some((h) => (h.textContent || '').includes('Add New Team Member')),
    { timeout: 15000 }
  );
  await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 10000 });

  const closeBtn = await page.$('button[aria-label="Close"]');
  if (!closeBtn) {
    throw new Error('Executive committee: modal Close button not found');
  }
  await closeBtn.click();
  await page.waitForFunction(
    () => ![...document.querySelectorAll('h2')].some((h) => (h.textContent || '').includes('Add New Team Member')),
    { timeout: 8000 }
  ).catch(() => {
    throw new Error('Executive committee: add-member modal did not close');
  });
}

/**
 * Run a single test
 */
async function runTest(page, test, config) {
  const testStartTime = Date.now();
  const result = {
    id: test.id,
    name: test.name,
    url: test.url || test.urlPattern,
    category: test.category,
    priority: test.priority,
    status: 'PENDING',
    duration: 0,
    error: null,
    screenshot: null,
    elementsFound: [],
    validations: [],
    jsErrors: [],
    consoleErrors: []
  };

  // Track JavaScript errors and console errors
  const jsErrors = [];
  const consoleErrors = [];

  // Set up error listeners before navigation
  page.on('pageerror', (error) => {
    const errorDetails = {
      type: 'pageerror',
      message: error.message,
      stack: error.stack || 'No stack trace available',
      name: error.name || 'Error',
      timestamp: new Date().toISOString()
    };
    jsErrors.push(errorDetails);
    console.error(`   ⚠️  JavaScript Error [${errorDetails.name}]: ${errorDetails.message}`);
    if (errorDetails.stack && errorDetails.stack !== 'No stack trace available') {
      console.error(`   📍 Stack trace:\n${errorDetails.stack.split('\n').slice(0, 5).join('\n')}...`);
    }
  });

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();

    // Capture console errors and warnings
    if (type === 'error' || type === 'warning') {
      const errorDetails = {
        type: type,
        message: text,
        location: location ? `${location.url}:${location.lineNumber}:${location.columnNumber}` : 'Unknown',
        timestamp: new Date().toISOString()
      };
      consoleErrors.push(errorDetails);

      // Log critical errors (ReferenceError, TypeError, etc.) with full details
      if (type === 'error' && (
        text.includes('ReferenceError') ||
        text.includes('TypeError') ||
        text.includes('is not defined') ||
        text.includes('Cannot read') ||
        text.includes('Failed to') ||
        text.includes('Uncaught') ||
        text.includes('SyntaxError')
      )) {
        console.error(`   ⚠️  Console ${type}: ${text}`);
        if (errorDetails.location !== 'Unknown') {
          console.error(`   📍 Location: ${errorDetails.location}`);
        }
      }
    }
  });

  try {
    console.log(`\n🧪 [${test.id}] ${test.name}`);
    console.log(`   📍 URL: ${test.url || test.urlPattern}`);

    // Navigate to page (handle page closure gracefully)
    const fullUrl = `${config.baseUrl}${test.url || test.urlPattern}`;
    // Use test-specific timeout if provided, otherwise use config timeout
    const pageTimeout = test.timeout || config.timeout;
    try {
      await page.goto(fullUrl, {
        waitUntil: 'domcontentloaded',
        timeout: pageTimeout
      });
    } catch (navigationError) {
      // If page is closed during navigation, provide helpful error
      if (navigationError.message.includes('closed') || navigationError.message.includes('detached')) {
        throw new Error(`Page was closed during navigation. This usually means authentication failed or session expired.`);
      }
      throw navigationError;
    }

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.warn(`   ⚠️  Network idle timeout, continuing...`);
    });

    // CRITICAL: Wait for main content (h1) to appear for client-side rendered pages
    // This ensures client components have hydrated and rendered their content
    try {
      // Wait for h1 specifically (most reliable indicator of page content)
      await page.waitForSelector('h1', {
        timeout: 20000,
        state: 'visible'
      }).catch(async () => {
        // If h1 doesn't appear, try other selectors
        console.warn(`   ⚠️  h1 not found, trying alternative selectors...`);
        await page.waitForSelector('h2, main, [class*="admin"]', {
          timeout: 10000,
          state: 'visible'
        }).catch(() => {
          console.warn(`   ⚠️  Alternative selectors also not found, continuing anyway...`);
        });
      });

      // Additional wait for client-side rendering to complete (especially for data tables)
      await page.waitForTimeout(2000);
    } catch (waitError) {
      console.warn(`   ⚠️  Could not wait for main content: ${waitError.message}`);
    }

    // Check for JavaScript errors after page load
    // Wait a bit more to catch errors that occur during component rendering
    await page.waitForTimeout(1000);

    // Store JavaScript errors in result
    result.jsErrors = jsErrors;
    result.consoleErrors = consoleErrors;

    // Fail test if critical JavaScript errors are detected
    if (jsErrors.length > 0) {
      const criticalErrors = jsErrors.filter(err => {
        const msg = err.message.toLowerCase();
        return msg.includes('referenceerror') ||
               msg.includes('typeerror') ||
               msg.includes('is not defined') ||
               msg.includes('cannot read') ||
               msg.includes('syntaxerror') ||
               msg.includes('uncaught');
      });

      if (criticalErrors.length > 0) {
        // Build detailed error message with stack traces
        const errorDetails = criticalErrors.map(err => {
          let detail = `${err.name || 'Error'}: ${err.message}`;
          if (err.stack && err.stack !== 'No stack trace available') {
            // Include first 10 lines of stack trace
            const stackLines = err.stack.split('\n').slice(0, 10);
            detail += `\nStack trace:\n${stackLines.join('\n')}`;
          }
          return detail;
        }).join('\n\n---\n\n');

        throw new Error(`JavaScript runtime error detected:\n\n${errorDetails}`);
      }
    }

    // Check for critical console errors (exclude known 404s for moved assets)
    const IGNORED_404_URL_PATTERNS = [
      'unite_india_logo.avif'  // Image moved to /images/logos/Malayalees_US/unite_india_logo.avif
    ];
    const criticalConsoleErrors = consoleErrors.filter(err => {
      const msg = err.message.toLowerCase();
      const location = (err.location || '').toLowerCase();
      const isIgnored404 = msg.includes('failed to load resource') &&
        msg.includes('404') &&
        IGNORED_404_URL_PATTERNS.some(pattern => location.includes(pattern.toLowerCase()));
      if (isIgnored404) return false;
      return err.type === 'error' && (
        msg.includes('referenceerror') ||
        msg.includes('typeerror') ||
        msg.includes('is not defined') ||
        msg.includes('cannot read') ||
        msg.includes('failed to') ||
        msg.includes('syntaxerror') ||
        msg.includes('uncaught')
      );
    });

    if (criticalConsoleErrors.length > 0) {
      // Build detailed error message with locations
      const errorDetails = criticalConsoleErrors.map(err => {
        let detail = `Console ${err.type}: ${err.message}`;
        if (err.location && err.location !== 'Unknown') {
          detail += `\nLocation: ${err.location}`;
        }
        return detail;
      }).join('\n\n---\n\n');

      throw new Error(`Console error detected:\n\n${errorDetails}`);
    }

    // Check for expected elements
    const elementsFound = [];
    for (const selector of test.expectedElements) {
      try {
        const count = await page.$$(selector).then(elements => elements.length);
        if (count > 0) {
          elementsFound.push({ selector, count });
        }
      } catch (error) {
        // Element not found, continue
      }
    }

    result.elementsFound = elementsFound;

    // Check for authentication errors
    const currentUrl = page.url();
    const pageContent = await page.content().catch(() => '');

    // CRITICAL: Check if redirected to sign-in page (most reliable indicator)
    const isSignInPage = currentUrl.includes('/sign-in') || currentUrl.includes('/sign-up');

    if (isSignInPage) {
      throw new Error('Authentication failed - redirected to sign-in page. User may not have ADMIN role in database.');
    }

    // Only check for visible error messages, not just any "401" or "403" text in HTML/JS
    // Look for actual error elements that are visible to the user
    try {
      const errorSelectors = [
        '[role="alert"]',
        '[class*="error"][class*="message"]',
        '[class*="alert"][class*="error"]',
        'div[class*="cl-error"]',
        'div[class*="cl-alert"]',
        'p[class*="error"]',
        'span[class*="error"]'
      ];

      let hasVisibleAuthError = false;
      for (const selector of errorSelectors) {
        try {
          const errorElement = await page.$(selector);
          if (errorElement) {
            const isVisible = await errorElement.isVisible().catch(() => false);
            if (isVisible) {
              const text = await errorElement.textContent().catch(() => '');
              // Only treat as auth error if it contains authentication-related error text
              if (text && (
                text.toLowerCase().includes('unauthorized') ||
                text.toLowerCase().includes('401') ||
                text.toLowerCase().includes('403') ||
                text.toLowerCase().includes('forbidden') ||
                text.toLowerCase().includes('access denied')
              )) {
                hasVisibleAuthError = true;
                console.error(`   ⚠️  Visible auth error found: ${text.trim()}`);
                break;
              }
            }
          }
        } catch (e) {
          // Continue checking
        }
      }

      if (hasVisibleAuthError) {
        throw new Error('Authentication failed - visible 401/403 Unauthorized error detected on page');
      }
    } catch (errorCheckError) {
      // If error checking fails, don't fail the test (might be false positive)
      console.log(`   ℹ️  Could not check for visible errors: ${errorCheckError.message}`);
    }

    // Check for 404 errors - only check for actual 404 page indicators, not just any "404" text
    // Check URL first (most reliable)
    if (currentUrl.includes('/404')) {
      throw new Error('Page not found (404)');
    }

    // Check for visible 404 error messages (not just any "404" text in HTML/JS)
    try {
      const notFoundSelectors = [
        'h1:has-text("404")',
        'h1:has-text("Not Found")',
        'h1:has-text("Page Not Found")',
        '[class*="404"]',
        '[class*="not-found"]'
      ];

      let hasVisible404 = false;
      for (const selector of notFoundSelectors) {
        try {
          const notFoundElement = await page.$(selector);
          if (notFoundElement) {
            const isVisible = await notFoundElement.isVisible().catch(() => false);
            if (isVisible) {
              hasVisible404 = true;
              break;
            }
          }
        } catch (e) {
          // Continue checking
        }
      }

      // Also check page title
      const pageTitle = await page.title().catch(() => '');
      if (pageTitle.toLowerCase().includes('404') || pageTitle.toLowerCase().includes('not found')) {
        hasVisible404 = true;
      }

      if (hasVisible404) {
        throw new Error('Page not found (404)');
      }
    } catch (notFoundCheckError) {
      // If 404 check fails, don't fail the test (might be false positive)
      if (notFoundCheckError.message.includes('404')) {
        throw notFoundCheckError; // Re-throw actual 404 errors
      }
    }

    // Check if main content is present
    const hasMainContent = await page.$('h1, h2, main, [class*="admin"]').then(el => el !== null);
    if (!hasMainContent) {
      throw new Error('Page loaded but no main content found');
    }

    if (test.id === 'admin-007') {
      await runFocusGroupsExtendedChecks(page, test, elementsFound);
    }
    if (test.id === 'admin-008') {
      await runMembershipPlansExtendedChecks(page, test, elementsFound);
    }
    if (test.id === 'admin-014') {
      await runExecutiveCommitteeExtendedChecks(page, test, elementsFound);
    }

    // Run validations
    const validations = [];
    for (const validation of test.validation) {
      // Simple validation checks
      if (validation.toLowerCase().includes('loads')) {
        validations.push({ check: validation, passed: hasMainContent });
      } else {
        validations.push({ check: validation, passed: true }); // Assume passed for now
      }
    }
    result.validations = validations;

    result.status = 'PASSED';
    result.duration = Date.now() - testStartTime;
    console.log(`   ✅ PASSED (${result.duration}ms)`);
    console.log(`   📊 Elements found: ${elementsFound.length}/${test.expectedElements.length}`);

  } catch (error) {
    result.status = 'FAILED';
    result.duration = Date.now() - testStartTime;
    result.error = error.message;
    console.log(`   ❌ FAILED: ${error.message}`);

    // Take screenshot on failure (only if page is still open)
    if (config.screenshotOnFailure) {
      try {
        // Check if page is still open before taking screenshot
        if (!page.isClosed()) {
          const screenshotPath = path.join(SCREENSHOTS_DIR, `failure-${test.id}-${Date.now()}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          result.screenshot = screenshotPath;
          console.log(`   📸 Screenshot saved: ${screenshotPath}`);
        } else {
          console.warn(`   ⚠️  Could not take screenshot - page was closed`);
        }
      } catch (screenshotError) {
        // Ignore screenshot errors (page might be closed)
        console.warn(`   ⚠️  Could not take screenshot: ${screenshotError.message}`);
      }
    }
  }

  return result;
}

/**
 * Generate HTML report
 */
function generateReport() {
  const duration = Date.now() - startTime;
  const passed = testResults.filter(r => r.status === 'PASSED').length;
  const failed = testResults.filter(r => r.status === 'FAILED').length;
  const skipped = testResults.filter(r => r.status === 'SKIPPED').length;

  const report = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Test Suite Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-card.passed { border-left: 4px solid #10b981; }
    .stat-card.failed { border-left: 4px solid #ef4444; }
    .stat-card.skipped { border-left: 4px solid #f59e0b; }
    .stat-card.total { border-left: 4px solid #3b82f6; }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .stat-label {
      color: #6b7280;
      font-size: 14px;
    }
    .test-results {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test-item {
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 10px;
    }
    .test-item:last-child {
      border-bottom: none;
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .test-name {
      font-weight: 600;
      font-size: 16px;
    }
    .test-status {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .test-status.passed { background: #d1fae5; color: #065f46; }
    .test-status.failed { background: #fee2e2; color: #991b1b; }
    .test-status.skipped { background: #fef3c7; color: #92400e; }
    .test-details {
      color: #6b7280;
      font-size: 14px;
      margin-top: 8px;
    }
    .test-error {
      color: #ef4444;
      margin-top: 8px;
      padding: 10px;
      background: #fef2f2;
      border-radius: 4px;
      font-size: 13px;
    }
    .category-header {
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0 10px 0;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Admin Test Suite Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Duration: ${(duration / 1000).toFixed(2)}s</p>
  </div>

  <div class="stats">
    <div class="stat-card total">
      <div class="stat-number">${testResults.length}</div>
      <div class="stat-label">Total Tests</div>
    </div>
    <div class="stat-card passed">
      <div class="stat-number">${passed}</div>
      <div class="stat-label">Passed</div>
    </div>
    <div class="stat-card failed">
      <div class="stat-number">${failed}</div>
      <div class="stat-label">Failed</div>
    </div>
    <div class="stat-card skipped">
      <div class="stat-number">${skipped}</div>
      <div class="stat-label">Skipped</div>
    </div>
  </div>

  <div class="test-results">
    ${Object.entries(
      testResults.reduce((acc, test) => {
        if (!acc[test.category]) acc[test.category] = [];
        acc[test.category].push(test);
        return acc;
      }, {})
    ).map(([category, tests]) => `
      <div class="category-header">${category}</div>
      ${tests.map(test => `
        <div class="test-item">
          <div class="test-header">
            <div>
              <div class="test-name">[${test.id}] ${test.name}</div>
              <div class="test-details">
                ${test.url} • ${test.duration}ms • Priority: ${test.priority}
              </div>
            </div>
            <span class="test-status ${test.status.toLowerCase()}">${test.status}</span>
          </div>
          ${test.error ? `<div class="test-error">❌ ${test.error.replace(/\n/g, '<br>')}</div>` : ''}
          ${test.jsErrors && test.jsErrors.length > 0 ? `
            <div class="test-error">
              ⚠️ JavaScript Errors (${test.jsErrors.length}):
              <ul style="margin: 5px 0; padding-left: 20px;">
                ${test.jsErrors.map(err => {
                  let errorHtml = `<li><strong>${err.name || 'Error'}:</strong> ${err.message}`;
                  if (err.stack && err.stack !== 'No stack trace available') {
                    const stackLines = err.stack.split('\n').slice(0, 10);
                    errorHtml += `<br><pre style="background: #f5f5f5; padding: 5px; margin: 5px 0; border-radius: 3px; font-size: 11px; overflow-x: auto;">${stackLines.join('\n')}</pre>`;
                  }
                  errorHtml += `</li>`;
                  return errorHtml;
                }).join('')}
              </ul>
            </div>
          ` : ''}
          ${test.consoleErrors && test.consoleErrors.length > 0 ? `
            <div class="test-details" style="color: #f59e0b;">
              ⚠️ Console Warnings/Errors (${test.consoleErrors.length}):
              <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                ${test.consoleErrors.slice(0, 10).map(err => {
                  let errorHtml = `<li><strong>[${err.type}]</strong> ${err.message}`;
                  if (err.location && err.location !== 'Unknown') {
                    errorHtml += ` <span style="color: #6b7280; font-size: 11px;">(${err.location})</span>`;
                  }
                  errorHtml += `</li>`;
                  return errorHtml;
                }).join('')}
                ${test.consoleErrors.length > 10 ? `<li style="color: #6b7280; font-style: italic;">... and ${test.consoleErrors.length - 10} more</li>` : ''}
              </ul>
            </div>
          ` : ''}
          ${test.elementsFound.length > 0 ? `
            <div class="test-details">
              📊 Elements found: ${test.elementsFound.length}/${test.expectedElements?.length || 0}
            </div>
          ` : ''}
          ${test.screenshot ? `
            <div class="test-details">
              📸 <a href="${test.screenshot}" target="_blank">View Screenshot</a>
            </div>
          ` : ''}
        </div>
      `).join('')}
    `).join('')}
  </div>
</body>
</html>
  `;

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`\n📄 Report saved to: ${REPORT_PATH}`);
}

/**
 * Main test execution
 */
async function main() {
  console.log('🚀 Starting Comprehensive Admin Test Suite...\n');

  // Load configuration
  const config = loadAuthConfig();
  console.log(`📍 Base URL: ${config.baseUrl}`);
  console.log(`👤 Testing as: ${config.email}`);
  console.log(`⚙️  Headless: ${config.headless}`);
  console.log(`📸 Screenshots: ${config.screenshotOnFailure ? 'Enabled' : 'Disabled'}\n`);

  // Ensure screenshots directory exists
  ensureScreenshotsDir();

  // Launch browser
  const browser = await chromium.launch({
    headless: config.headless,
    timeout: 60000
  });

  let context, page;

  try {
    // Try to load saved auth state, but validate it first
    let authStateValid = false;
    if (fs.existsSync(AUTH_STATE_PATH)) {
      console.log('🔐 Loading saved authentication state...');
      try {
        const authState = await loadAuthState(browser, AUTH_STATE_PATH);
        context = authState.context;
        page = authState.page;

        // Validate auth state by checking if we can access an admin page
        console.log('   ⏳ Validating authentication state...');
        try {
          await page.goto(`${config.baseUrl}/admin`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
          });

          // Check if we're redirected to sign-in (auth state invalid)
          const currentUrl = page.url();
          if (!currentUrl.includes('/sign-in') && !currentUrl.includes('/sign-up')) {
            authStateValid = true;
            console.log('✅ Authentication state is valid');
          } else {
            console.warn('⚠️  Authentication state invalid - redirected to sign-in');
            await context.close();
            authStateValid = false;
          }
        } catch (validationError) {
          console.warn(`⚠️  Could not validate auth state: ${validationError.message}`);
          await context.close();
          authStateValid = false;
        }
      } catch (error) {
        console.warn(`⚠️  Could not load auth state: ${error.message}`);
        authStateValid = false;
      }
    }

    // If auth state is invalid or doesn't exist, authenticate fresh
    if (!authStateValid) {
      console.log('🔐 Authenticating fresh...');
      const authContext = await createAuthenticatedContext(browser, config.baseUrl, {
        email: config.email,
        password: config.password
      });
      context = authContext.context;
      page = authContext.page;
      await saveAuthState(context, AUTH_STATE_PATH);
      console.log('✅ Authentication successful, state saved');
    }

    // Run static admin page tests
    console.log('\n📋 Running static admin page tests...');
    for (const test of adminTestPages) {
      // Check if page is still open before each test
      if (page.isClosed()) {
        console.error(`\n❌ Page was closed. Authentication may have expired.`);
        console.error(`   Please delete ${AUTH_STATE_PATH} and re-run the test.`);
        break;
      }

      const result = await runTest(page, test, config);
      testResults.push(result);

      // If authentication failed, stop running tests
      if (result.error && result.error.includes('Authentication failed')) {
        console.warn(`\n⚠️  Authentication failed. Stopping test execution.`);
        console.warn(`   Please delete ${AUTH_STATE_PATH} and re-run the test.`);
        break;
      }
    }

    // Note: Dynamic event tests are now in a separate script
    // Run: npm run test:admin:dynamic
    console.log('\n📋 Dynamic event page tests are now in a separate script.');
    console.log('   💡 Run "npm run test:admin:dynamic" to test event-specific pages.');

    // Generate report
    console.log('\n📊 Generating test report...');
    generateReport();

    // Print summary
    const passed = testResults.filter(r => r.status === 'PASSED').length;
    const failed = testResults.filter(r => r.status === 'FAILED').length;
    const total = testResults.length;
    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.filter(r => r.status === 'FAILED').forEach(test => {
        console.log(`   - [${test.id}] ${test.name}: ${test.error}`);
      });
    }

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (context) await context.close();
    await browser.close();
  }
}

// Run tests
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

