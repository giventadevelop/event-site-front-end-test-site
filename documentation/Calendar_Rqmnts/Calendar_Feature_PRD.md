# Product Requirements Document (PRD)
## Event Calendar View Feature

---

**Document Version:** 1.0  
**Date:** October 22, 2025  
**Status:** 🟡 Draft - Ready for Review  
**Priority:** ⭐⭐⭐ High  
**Project:** Malayalees US Site - Event Management Platform

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Background & Problem Statement](#background--problem-statement)
3. [Goals & Objectives](#goals--objectives)
4. [User Stories](#user-stories)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Technical Specifications](#technical-specifications)
8. [UI/UX Requirements](#ui-ux-requirements)
9. [API Requirements](#api-requirements)
10. [Success Metrics](#success-metrics)
11. [Implementation Timeline](#implementation-timeline)
12. [Dependencies & Risks](#dependencies--risks)
13. [Out of Scope](#out-of-scope)
14. [References](#references)

---

## 📊 Executive Summary

### Current State
Our event management platform currently displays events only in **list/card format** on the homepage and event pages. The `/mosc/calendar` page exists but only links to an external liturgical calendar and does not show our platform's events in an interactive calendar view.

### Gap Identified
**KANJ.org** (Kerala Association of New Jersey) has a **dedicated calendar page** with full calendar view, while our platform lacks this functionality. This creates poor user experience for users trying to:
- See all events at a glance for a specific month
- Identify which dates have events
- Navigate between months to plan attendance
- Get a visual representation of event density and distribution

### Proposed Solution
Implement a **full-featured, interactive event calendar page** at `/calendar` that displays all events from our backend API in month/week/day views with full navigation and filtering capabilities.

### Business Value
- **Improved User Experience**: Users can easily browse and discover events
- **Increased Event Registration**: Better visibility leads to higher attendance
- **Competitive Parity**: Matches industry-standard community organization websites
- **Better Event Planning**: Users can see scheduling conflicts and plan ahead

---

## 🎯 Background & Problem Statement

### Current Implementation Analysis

#### What We Have:
```typescript
// Location: src/components/UpcomingEventsSection.tsx
// Current Implementation:
✅ List view of upcoming events (max 6 events)
✅ Fallback to past events if no upcoming
✅ Event cards with date, time, location
✅ Link to individual event pages
✅ "View All Events" button

// Location: src/app/mosc/calendar/page.tsx
// Current Implementation:
✅ Static page about liturgical calendar
✅ Links to external calendar (calendar.mosc.in)
❌ Does NOT show our platform's events
❌ NOT an interactive calendar view
```

#### What's Missing (from KANJ Analysis):
```typescript
❌ Dedicated calendar page (/calendar)
❌ Interactive calendar grid (month view)
❌ Month/week/day view switching
❌ Previous/next month navigation
❌ Click on date to see events for that day
❌ Multi-event display on single date
❌ Calendar filtering (by category, location, etc.)
❌ Calendar export (iCal, Google Calendar)
❌ Visual event density indicators
```

### Problem Statement

**Problem:** Users cannot view events in a traditional calendar format, making it difficult to:
1. **Plan ahead** - See which dates in a month have events
2. **Avoid conflicts** - Identify overlapping events
3. **Discover events** - Browse all events for a specific time period
4. **Quick navigation** - Jump to specific months/weeks
5. **Get overview** - Understand event distribution and frequency

**Impact:**
- Lower event discovery rate
- Reduced event registrations
- Poor user experience compared to competitors
- Missed opportunities for cross-event promotion

**Who's Affected:**
- Community members looking for events
- Event organizers checking scheduling conflicts
- Administrators planning event calendars
- Mobile users needing quick event overview

---

## 🎯 Goals & Objectives

### Primary Goals

1. **Improve Event Discoverability**
   - Users can browse all events in calendar format
   - Visual representation of event-heavy vs. light periods
   - Easy navigation between months

2. **Match Industry Standards**
   - Provide calendar functionality similar to KANJ.org
   - Implement familiar calendar UI patterns
   - Support standard calendar interactions

3. **Enhance User Experience**
   - Reduce clicks needed to find events
   - Provide multiple viewing options (month/week/day)
   - Enable filtering and search within calendar

### Secondary Goals

4. **Increase Event Registrations**
   - Better visibility leads to more sign-ups
   - Cross-event promotion through calendar view
   - Easier access to ticket purchasing

5. **Support Mobile Users**
   - Responsive calendar design
   - Touch-friendly navigation
   - Optimized for small screens

### Success Criteria

- ✅ Calendar page loads in < 2 seconds
- ✅ Displays all active events from backend
- ✅ Month/week/day view switching works smoothly
- ✅ Mobile responsive (works on 320px+ screens)
- ✅ 80%+ user satisfaction rating
- ✅ 25%+ increase in event page views from calendar

---

## 👥 User Stories

### Epic: Interactive Event Calendar

#### As a Community Member:

**Story 1: Browse Events by Month**
```gherkin
Given I am on the calendar page
When I view the calendar
Then I should see a month view with all events displayed on their respective dates
And I should see which dates have events highlighted
And I should see event titles or indicators on each date
```

**Story 2: Navigate Between Months**
```gherkin
Given I am viewing the calendar
When I click "Next Month" or "Previous Month"
Then the calendar should update to show the selected month
And events for that month should be loaded
And the view should transition smoothly
```

**Story 3: View Event Details from Calendar**
```gherkin
Given I see an event on a specific date
When I click on the event
Then I should see event details (time, location, description)
And I should have the option to view the full event page
And I should have the option to register/buy tickets
```

**Story 4: Switch Calendar Views**
```gherkin
Given I am on the calendar page
When I select "Week View" or "Day View"
Then the calendar should switch to the selected view
And events should be displayed appropriately for that view
And navigation should work for the selected view (prev/next week or day)
```

**Story 5: Filter Events**
```gherkin
Given I am viewing the calendar
When I apply filters (category, location, etc.)
Then only events matching the filters should be displayed
And the calendar should update to show filtered results
And I should see the active filters clearly indicated
```

#### As an Event Organizer:

**Story 6: Check Scheduling Conflicts**
```gherkin
Given I am planning a new event
When I view the calendar
Then I should see all scheduled events
And I should identify potential scheduling conflicts
And I should see event density for planning purposes
```

#### As a Mobile User:

**Story 7: Browse Calendar on Mobile**
```gherkin
Given I am on a mobile device
When I access the calendar page
Then the calendar should be responsive and touch-friendly
And I should be able to swipe to navigate months
And event details should be easily accessible on touch
```

#### As an Administrator:

**Story 8: Quick Event Overview**
```gherkin
Given I am an admin
When I view the calendar
Then I should see all events (past, present, future)
And I should identify gaps in the event schedule
And I should access event management functions from calendar
```

---

## ⚙️ Functional Requirements

### FR-1: Calendar Page Creation

**Requirement:** Create a new dedicated calendar page at `/calendar`

**Details:**
- Route: `/calendar`
- Server-side rendered (Next.js app router)
- Fetches events from backend API
- Public access (no authentication required for viewing)
- Responsive design (mobile, tablet, desktop)

**Acceptance Criteria:**
- [ ] Page accessible at `/calendar`
- [ ] Loads within 2 seconds
- [ ] Displays current month by default
- [ ] No authentication required for viewing
- [ ] Graceful error handling if API fails

---

### FR-2: Month View (Primary View)

**Requirement:** Implement interactive month view calendar

**Details:**
- Standard calendar grid (7 columns for days, 5-6 rows for weeks)
- Current month displayed by default
- Today's date highlighted
- Days with events highlighted/indicated
- Event titles visible on dates (truncated if needed)
- Multiple events per day supported

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  October 2025                   [Week] [Day] [Month]   │
│  < Previous   Today   Next >                             │
├──────┬──────┬──────┬──────┬──────┬──────┬──────────────┤
│  Sun │  Mon │  Tue │  Wed │  Thu │  Fri │  Sat         │
├──────┼──────┼──────┼──────┼──────┼──────┼──────────────┤
│      │      │  1   │  2   │  3   │  4   │  5           │
│      │      │      │      │Event1│      │Event2        │
├──────┼──────┼──────┼──────┼──────┼──────┼──────────────┤
│  6   │  7   │  8   │  9   │  10  │  11  │  12          │
│      │Event3│      │      │      │Event4│Event5        │
└──────┴──────┴──────┴──────┴──────┴──────┴──────────────┘
```

**Acceptance Criteria:**
- [ ] Shows 7 columns (Sunday - Saturday)
- [ ] Shows 5-6 rows (weeks)
- [ ] Today's date clearly highlighted
- [ ] Events displayed on correct dates
- [ ] Up to 3 events visible per day (+ "more" indicator)
- [ ] Clicking date shows all events for that day
- [ ] Smooth transitions between months

---

### FR-3: Week View

**Requirement:** Implement week view for detailed weekly scheduling

**Details:**
- Shows 7 days in a row with hourly time slots
- Current week displayed by default
- Events positioned by time
- Supports multiple events in same time slot
- Hour markers on left side

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Week of Oct 20 - Oct 26, 2025       [Week] [Day] [Month]│
│  < Previous   Today   Next >                             │
├──────┬──────┬──────┬──────┬──────┬──────┬──────────────┤
│ Time │ Sun  │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat   │
├──────┼──────┼──────┼──────┼──────┼──────┼──────────────┤
│ 9AM  │      │Event1│      │      │      │      │       │
│ 10AM │      │  │   │      │Event3│      │      │       │
│ 11AM │      │  │   │Event2│  │   │      │      │Event4 │
│ 12PM │      │      │      │  │   │      │      │       │
└──────┴──────┴──────┴──────┴──────┴──────┴──────────────┘
```

**Acceptance Criteria:**
- [ ] Shows current week by default
- [ ] Events positioned by start time
- [ ] Event duration visually represented
- [ ] Navigate to previous/next week
- [ ] Click event to see details
- [ ] Responsive design for mobile

---

### FR-4: Day View

**Requirement:** Implement detailed day view with hourly breakdown

**Details:**
- Shows single day with all events
- Hourly time slots (6 AM - 11 PM)
- Events positioned by time with duration
- All-day events shown at top
- Detailed event information visible

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Wednesday, October 22, 2025         [Week] [Day] [Month]│
│  < Previous   Today   Next >                             │
├──────────────────────────────────────────────────────────┤
│ All-day: Community Fundraiser                           │
├──────────────────────────────────────────────────────────┤
│ 9:00 AM                                                  │
│   └─ Morning Coffee Meetup (9:00 AM - 10:30 AM)        │
│       Location: Community Center                         │
├──────────────────────────────────────────────────────────┤
│ 10:00 AM                                                 │
│        │                                                  │
├──────────────────────────────────────────────────────────┤
│ 11:00 AM                                                 │
│   └─ Tech Workshop (11:00 AM - 1:00 PM)                │
│       Location: Conference Room A                        │
└──────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Shows selected day (default: today)
- [ ] Events positioned by time
- [ ] All-day events shown separately
- [ ] Event details visible inline
- [ ] Navigate to previous/next day
- [ ] Click event to see full details

---

### FR-5: Navigation Controls

**Requirement:** Provide intuitive navigation between time periods

**Details:**
- Previous/Next buttons (month/week/day depending on view)
- "Today" button to return to current date
- Month/Year picker for quick jump
- View switcher (Month/Week/Day tabs)

**Acceptance Criteria:**
- [ ] Previous/Next buttons work for all views
- [ ] "Today" button returns to current date in any view
- [ ] Month/Year picker allows quick navigation
- [ ] View switcher maintains selected date when switching
- [ ] Keyboard navigation supported (arrow keys)

---

### FR-6: Event Display & Interaction

**Requirement:** Display event information and enable interactions

**Details:**
- Event title visible in calendar
- Color coding by category (optional)
- Click event to open details modal/panel
- Modal shows: title, description, date, time, location, organizer
- "View Full Event" button links to event page
- "Buy Tickets" button (if applicable)
- "Add to Calendar" export option

**Event Modal:**
```
┌─────────────────────────────────────────────────────────┐
│  Community Fundraiser                              [X]  │
├─────────────────────────────────────────────────────────┤
│  📅 Wednesday, October 22, 2025                         │
│  🕐 6:00 PM - 9:00 PM                                   │
│  📍 Community Center, 123 Main St                       │
│                                                          │
│  Join us for an evening of community fundraising...     │
│                                                          │
│  [View Full Event]  [Buy Tickets]  [Add to Calendar]   │
└─────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Events clickable in all views
- [ ] Modal displays complete event info
- [ ] Links to full event page work
- [ ] Ticket purchase flow accessible
- [ ] Export to calendar works (iCal format)
- [ ] Modal closeable via X, ESC key, or outside click

---

### FR-7: Event Filtering

**Requirement:** Allow users to filter events by various criteria

**Details:**
- Filter by category (cultural, educational, sports, etc.)
- Filter by location
- Filter by ticket availability (free, paid, sold out)
- Filter by date range
- Clear all filters option

**Filter UI:**
```
┌─────────────────────────────────────────────────────────┐
│  Filters:  [All Categories ▼] [All Locations ▼]        │
│            [All Types ▼] [Clear Filters]                │
└─────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Filter controls visible above calendar
- [ ] Filters update calendar in real-time
- [ ] Multiple filters can be applied simultaneously
- [ ] Filter state persists during navigation
- [ ] Clear filters resets to all events
- [ ] Filter counts shown (e.g., "Cultural (5)")

---

### FR-8: Search Functionality

**Requirement:** Enable text search within calendar events

**Details:**
- Search bar above calendar
- Real-time search as user types
- Search event titles, descriptions, locations
- Highlight matching events
- Show search results count

**Search UI:**
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Search events...            [Found 3 events]        │
└─────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Search bar prominently displayed
- [ ] Search updates calendar in real-time
- [ ] Searches title, description, location
- [ ] Results count displayed
- [ ] Clear search button available
- [ ] Works with filters (AND logic)

---

### FR-9: Responsive Mobile Design

**Requirement:** Ensure calendar works on all screen sizes

**Details:**
- Desktop: Full calendar grid
- Tablet: Compact calendar grid
- Mobile: Vertical list view with date headers
- Touch-friendly controls
- Swipe gestures for navigation (mobile)

**Mobile Layout:**
```
┌──────────────────────────┐
│  October 2025            │
│  < Today >               │
├──────────────────────────┤
│  🗓️ Wed, Oct 22         │
│  ├─ Event 1 (9:00 AM)   │
│  └─ Event 2 (2:00 PM)   │
├──────────────────────────┤
│  🗓️ Thu, Oct 23         │
│  └─ Event 3 (6:00 PM)   │
└──────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Works on screens 320px+ wide
- [ ] Touch-friendly controls (44px+ tap targets)
- [ ] Swipe to navigate months (mobile)
- [ ] Vertical list view on mobile < 768px
- [ ] No horizontal scrolling required
- [ ] Fast load time on mobile networks

---

### FR-10: Calendar Export

**Requirement:** Allow users to export events to external calendars

**Details:**
- Export single event to iCal/Google Calendar
- Export all events for a month
- Export filtered/searched events
- Standard iCal format (.ics file)

**Acceptance Criteria:**
- [ ] Export button available in UI
- [ ] Generates valid .ics file
- [ ] Includes title, description, date, time, location
- [ ] Works with Google Calendar, Apple Calendar, Outlook
- [ ] Export respects current filters

---

### FR-11: Pagination for Large Event Datasets

**Requirement:** Implement always-visible pagination controls for calendar views

**Details:**
- Pagination controls always displayed (never conditionally hidden)
- Uses `x-total-count` header from backend API
- Previous/Next/Page status pattern
- Shows "Showing X to Y of Z events"
- Grayed out buttons when navigation not possible
- Works for all calendar views (month/week/day)

**UI Pattern (from `.cursor/rules/ui_style_guide.mdc` Section 5):**
```typescript
const totalPages = Math.ceil(totalCount / pageSize);
const isPrevDisabled = currentPage === 0 || loading;
const isNextDisabled = currentPage >= totalPages - 1 || loading;
const startItem = totalCount > 0 ? currentPage * pageSize + 1 : 0;
const endItem = totalCount > 0 ? currentPage * pageSize + Math.min(pageSize, totalCount - currentPage * pageSize) : 0;

// ALWAYS render pagination - show in ALL states (loading, empty, with data)
<div className="mt-8">
  <div className="flex justify-between items-center">
    <button
      disabled={isPrevDisabled}
      onClick={handlePrevPage}
      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
    >
      <ChevronLeft className="h-5 w-5" />
      Previous
    </button>
    <div className="text-sm font-semibold text-gray-700">
      Page {currentPage + 1} of {totalPages}
    </div>
    <button
      disabled={isNextDisabled}
      onClick={handleNextPage}
      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
    >
      Next
      <ChevronRight className="h-5 w-5" />
    </button>
  </div>
  <div className="text-center text-sm text-gray-600 mt-2">
    {totalCount > 0 ? (
      <>Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
      <span className="font-medium">{totalCount}</span> events</>
    ) : (
      <span>No events found</span>
    )}
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] Pagination controls visible in all states (loading, empty, with data)
- [ ] Never conditionally hidden based on totalPages or totalCount
- [ ] Uses `x-total-count` response header from `/api/proxy/event-details`
- [ ] Previous/Next buttons grayed out appropriately
- [ ] Shows current page and total pages
- [ ] Shows item range (e.g., "Showing 1 to 20 of 45 events")
- [ ] Matches pagination pattern used in admin dashboard and gallery
- [ ] Reference: `.cursor/rules/ui_style_guide.mdc` Section 5

---

## 🎨 UI/UX Requirements

### Design System Adherence

**Must follow existing design patterns:**
- Color scheme: Gradient backgrounds (indigo/cyan)
- Typography: Modern sans-serif fonts
- Shadows: Consistent shadow system
- Buttons: Rounded, gradient hover effects
- Cards: Rounded corners with shadow
- Spacing: Consistent padding/margins

### Color Coding (Optional Feature)

**Event Categories:**
- 🔵 Cultural Events: Blue/Purple gradient
- 🟢 Educational: Green gradient
- 🔴 Sports: Red gradient
- 🟡 Social: Yellow/Orange gradient
- 🟣 Religious: Purple gradient

### Accessibility Requirements

**WCAG 2.1 AA Compliance:**
- Sufficient color contrast (4.5:1 for text)
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators visible
- ARIA labels for interactive elements
- Semantic HTML structure

### Animation & Transitions

**Smooth User Experience:**
- Month transitions: 200ms ease-in-out
- View switching: 300ms fade transition
- Modal open/close: 200ms scale + fade
- Hover effects: 150ms transform
- Loading states: Skeleton screens

### Modal & Tooltip Standards

**Event Details Modal Requirements:**
- **Render via React Portal** - Use `ReactDOM.createPortal(modal, document.body)`
  - Prevents clipping by parent containers with scrollbars
  - Ensures modal appears above all other content
- **Close Button Always Visible**
  - Position: `sticky top-0 right-0 z-10 bg-white flex justify-end`
  - Styling: `w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg`
  - Must remain visible even when modal content scrolls
- **Positioning**
  - Modal appears to the right of trigger element (event cell)
  - Never positioned above column headers
  - Clamped to viewport boundaries (stays on screen)
- **Close Behavior**
  - Only closes when close button (×) is clicked
  - Does not close on mouse leave or blur
  - ESC key closes modal (accessibility)

**Reference:** `.cursor/rules/ui_style_guide.mdc` Section 4 - Tooltips

**Example Implementation:**
```typescript
import ReactDOM from 'react-dom';

function EventModal({ event, anchorRect, onClose }) {
  if (!anchorRect) return null;

  const spacing = 8;
  const modalWidth = 320;
  let top = anchorRect.top;
  let left = anchorRect.right + spacing;

  // Clamp to viewport
  if (top + 400 > window.innerHeight) {
    top = window.innerHeight - 400 - spacing;
  }
  if (left + modalWidth > window.innerWidth) {
    left = window.innerWidth - modalWidth - spacing;
  }

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top, left, zIndex: 9999, width: modalWidth }} className="bg-white rounded-lg shadow-2xl border">
      {/* Sticky close button */}
      <div className="sticky top-0 right-0 z-10 bg-white flex justify-end">
        <button onClick={onClose} className="w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg">
          &times;
        </button>
      </div>
      {/* Modal content */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
        {/* ... event details ... */}
      </div>
    </div>,
    document.body
  );
}
```

### Responsive Button & Navigation Grid

**Calendar Navigation/Filter Buttons:**
- **Mobile (default):**
  - Grid: `grid-cols-1` centered with `justify-items-center mx-auto`
  - Buttons: `w-48 max-w-xs mx-auto` (compact, not full width)
  - Text: `text-xs`, Icon: `text-base`
  - Vertically stacked, perfectly centered
- **Tablet/Desktop:**
  - Grid: `sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6`
  - Button padding: `sm:p-2`
  - Icon size: `sm:text-lg`
- **Always visible:**
  - Wrap in `w-full overflow-x-auto` for horizontal scrolling if needed
  - Never hidden or cut off on small screens

**Reference:** `.cursor/rules/ui_style_guide.mdc` Section 6 - Responsive Button Group Grid

**Example Implementation:**
```typescript
<div className="w-full overflow-x-auto">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6 justify-items-center mx-auto">
    <button className="w-48 max-w-xs mx-auto flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md shadow p-1 sm:p-2 text-xs sm:text-xs transition-all">
      <FaCalendarAlt className="text-base sm:text-lg mb-1 mx-auto" />
      <span className="font-semibold text-center">Month View</span>
    </button>
    {/* ...other buttons... */}
  </div>
</div>
```

### Date & Time Display Standards

**CRITICAL:** All event dates must display in event's intended timezone to prevent off-by-one-day errors.

- **Library:** `date-fns-tz` (required, not optional)
- **Never use:** `new Date('YYYY-MM-DD')` - parses as UTC, shows wrong date in US timezones
- **Always use:** `formatInTimeZone(date, timezone, format)`
- **Display timezone:** Always show timezone abbreviation (EDT, PST, etc.)

**Reference:** `.cursor/rules/ui_style_guide.mdc` Section 7 - Date & Timezone Formatting

**Example:**
```typescript
import { formatInTimeZone } from 'date-fns-tz';

// ✅ CORRECT
const displayDate = formatInTimeZone(
  event.startDate,
  event.timezone, // 'America/New_York'
  'EEEE, MMMM d, yyyy (zzz)' // Wednesday, August 7, 2025 (EDT)
);

// ❌ INCORRECT - Will show wrong date
const wrongDate = new Date('2025-08-07').toLocaleDateString();
```

---

## 🔧 Technical Specifications

### Technology Stack (Already Configured)

**Frontend:**
```typescript
- Framework: Next.js 15.1.1 (App Router) ✅ Configured
- Calendar Library: To be selected during implementation (react-big-calendar recommended)
- State Management: React useState/useEffect ✅ Standard pattern
- Styling: Tailwind CSS 3.4.1 ✅ Configured
- Date Handling: date-fns-tz (REQUIRED for timezone-aware display)
  - Reference: .cursor/rules/ui_style_guide.mdc Section 7
- Icons: react-icons/fa ✅ Configured (FaCalendarAlt, FaClock, etc.)
```

**Backend:**
```typescript
- Existing Event API: /api/proxy/event-details ✅ Available
- Backend Location: C:\Users\gain\git\malayalees-us-site-boot
- No new backend endpoints required
- Use existing EventDetailsDTO
```

**Important:** Project is in active development phase. All infrastructure decisions already made. Focus on feature implementation only.

### File Structure

```
src/app/calendar/
├── page.tsx                      # Main calendar page (server component)
├── CalendarClient.tsx            # Client component with calendar
├── ApiServerActions.ts           # ⭐ REQUIRED: All server-side API calls
│                                 # Reference: .cursor/rules/nextjs_api_routes.mdc
├── components/
│   ├── MonthView.tsx            # Month view component
│   ├── WeekView.tsx             # Week view component
│   ├── DayView.tsx              # Day view component
│   ├── EventModal.tsx           # Event details modal (React Portal)
│   ├── CalendarFilters.tsx      # Filter controls
│   ├── CalendarSearch.tsx       # Search bar
│   ├── CalendarPagination.tsx   # Pagination controls (always visible)
│   └── ViewSwitcher.tsx         # Month/Week/Day tabs
├── hooks/
│   ├── useCalendarNav.ts        # Navigation state hook
│   └── useEventFilters.ts       # Filter state hook
├── utils/
│   ├── calendarHelpers.ts       # Date calculation helpers
│   └── eventFormatters.ts       # Event formatting utils (timezone-aware)
└── types/
    └── calendar.types.ts         # Calendar-specific types
```

**Key Files:**
- **`ApiServerActions.ts`**: Contains all server-side API calls using `fetchWithJwtRetry` from `@/lib/proxyHandler`
  - Pattern: All backend API calls must be server actions (not client-side fetches)
  - Reference: `.cursor/rules/nextjs_api_routes.mdc` - "Standard: Place all server-side API calls in ApiServerActions.ts"

### Data Flow (Correct Pattern)

**CRITICAL:** Follow `.cursor/rules/nextjs_api_routes.mdc` - All backend API calls must use server actions with `fetchWithJwtRetry`.

```typescript
// ============================================================================
// 1. ApiServerActions.ts - All server-side API calls
// ============================================================================
'use server';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

/**
 * Fetch events for a specific month using existing /api/event-details endpoint
 * Reference: .cursor/rules/nextjs_api_routes.mdc - "STRICT RULE: All Server Actions Must Use fetchWithJwtRetry"
 */
export async function fetchEventsForMonthServer(year: number, month: number) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Calculate month start/end dates
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const url = `${API_BASE_URL}/api/event-details?` +
    `startDate.greaterThanOrEqual=${startDate}&` +
    `endDate.lessThanOrEqual=${endDate}&` +
    `isActive.equals=true&` +
    `sort=startDate,asc&` +
    `page=0&size=100`;

  try {
    // Use fetchWithJwtRetry for authenticated backend calls
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Failed to fetch events: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return []; // Graceful fallback
  }
}

// ============================================================================
// 2. page.tsx - Server Component (SSR)
// ============================================================================
export default async function CalendarPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // Fetch initial events server-side with graceful error handling
  let initialEvents = [];
  try {
    initialEvents = await fetchEventsForMonthServer(year, month);
  } catch (error) {
    console.error('Failed to load initial events:', error);
    // Graceful fallback - empty array allows page to render
  }

  return <CalendarClient initialEvents={initialEvents} initialYear={year} initialMonth={month} />;
}

// ============================================================================
// 3. CalendarClient.tsx - Client Component (UI only)
// ============================================================================
'use client';
import { useState, useEffect } from 'react';
import { fetchEventsForMonthServer } from './ApiServerActions';

interface CalendarClientProps {
  initialEvents: EventDetailsDTO[];
  initialYear: number;
  initialMonth: number;
}

export function CalendarClient({ initialEvents, initialYear, initialMonth }: CalendarClientProps) {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState(initialEvents);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch events when date changes - calls server action
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const data = await fetchEventsForMonthServer(currentYear, currentMonth);
        setEvents(data);
      } catch (error) {
        console.error('Failed to load events:', error);
        // Keep existing events on error
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [currentYear, currentMonth, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <CalendarFilters filters={filters} onChange={setFilters} />
      <ViewSwitcher view={view} onChange={setView} />

      {loading ? (
        <div className="animate-pulse">Loading...</div>
      ) : (
        <>
          {view === 'month' && <MonthView events={events} year={currentYear} month={currentMonth} />}
          {view === 'week' && <WeekView events={events} year={currentYear} month={currentMonth} />}
          {view === 'day' && <DayView events={events} year={currentYear} month={currentMonth} />}
        </>
      )}

      <CalendarPagination
        totalCount={events.length}
        onPrevMonth={() => setCurrentMonth(m => m === 1 ? 12 : m - 1)}
        onNextMonth={() => setCurrentMonth(m => m === 12 ? 1 : m + 1)}
      />
    </div>
  );
}
```

**Key Pattern Compliance:**
- ✅ All backend API calls in `ApiServerActions.ts` with `'use server'` directive
- ✅ Uses `fetchWithJwtRetry` from `@/lib/proxyHandler` (not direct fetch)
- ✅ Server component fetches initial data with try-catch error handling
- ✅ Client component calls server actions only (no direct fetch to backend)
- ✅ Graceful error handling - page renders even if API fails
- ✅ Reference: `.cursor/rules/nextjs_api_routes.mdc`

### API Integration

**Existing Event API (Use This):**
```typescript
// Endpoint: /api/proxy/event-details (PUBLIC ROUTE - already configured)
// Method: GET
// Backend: C:\Users\gain\git\malayalees-us-site-boot

// Query Params (JHipster filter syntax):
{
  'startDate.greaterThanOrEqual': '2025-10-01',  // First day of month
  'endDate.lessThanOrEqual': '2025-10-31',       // Last day of month
  'isActive.equals': true,                       // Only active events
  sort: 'startDate,asc',                         // Chronological order
  page: 0,                                       // Pagination
  size: 100                                      // Events per page
}

// Response: EventDetailsDTO[] (verified in api-docs.json)
interface EventDetailsDTO {
  id: number;
  title: string;
  caption?: string;
  startDate: string;      // 'YYYY-MM-DD'
  endDate?: string;       // 'YYYY-MM-DD' (optional, defaults to startDate)
  startTime: string;      // 'HH:mm:ss'
  endTime: string;        // 'HH:mm:ss'
  location?: string;
  timezone: string;       // IANA timezone (e.g., 'America/New_York')
  isActive: boolean;
  tenantId: string;
  // ... other fields available in EventDetailsDTO
}

// Headers:
// - x-total-count: Total number of events matching criteria (for pagination)
```

**Calendar Data Transformation (Timezone-Aware):**
```typescript
import { formatInTimeZone } from 'date-fns-tz';

// ❌ INCORRECT - Causes off-by-one-day errors:
// new Date('2025-08-07')  // Parses as UTC, may show as Aug 6 in US timezones

// ✅ CORRECT - Use timezone-aware formatting:
function transformToCalendarEvents(apiEvents: EventDetailsDTO[]) {
  return apiEvents.map(event => {
    // Combine date + time + timezone for accurate display
    const startDateTime = `${event.startDate}T${event.startTime}`;
    const endDateTime = `${event.endDate || event.startDate}T${event.endTime}`;

    return {
      id: event.id,
      title: event.title,
      // Format with event's intended timezone
      displayDate: formatInTimeZone(
        event.startDate,
        event.timezone,
        'EEEE, MMMM d, yyyy (zzz)'
      ),
      displayTime: formatInTimeZone(
        startDateTime,
        event.timezone,
        'h:mm a'
      ),
      start: new Date(startDateTime),
      end: new Date(endDateTime),
      description: event.caption,
      location: event.location,
      timezone: event.timezone,
      allDay: false,
      resource: event // Full event data for modal
    };
  });
}
```

**Reference:** `.cursor/rules/ui_style_guide.mdc` Section 7 - Date & Timezone Formatting

### Performance Optimization

**Strategies:**
- Server-side initial load (Next.js SSR)
- Client-side caching of fetched events
- Lazy load events as user navigates
- Debounce search input (300ms)
- Virtual scrolling for large datasets
- Image lazy loading for event thumbnails
- Code splitting for calendar library

**Caching Strategy:**
```typescript
// Client-side cache
const eventCache = new Map<string, EventDetailsDTO[]>();

function getCacheKey(startDate: Date, endDate: Date, filters: any) {
  return `${startDate.toISOString()}-${endDate.toISOString()}-${JSON.stringify(filters)}`;
}

async function fetchEventsWithCache(start: Date, end: Date, filters: any) {
  const key = getCacheKey(start, end, filters);
  if (eventCache.has(key)) {
    return eventCache.get(key);
  }
  const events = await fetchEvents(start, end, filters);
  eventCache.set(key, events);
  return events;
}
```

### Error Handling

**Scenarios:**
1. **API Failure**
   - Show error message with retry button
   - Fallback to cached data if available
   - Log error to monitoring service

2. **No Events Found**
   - Show friendly "No events scheduled" message
   - Suggest browsing other months
   - Provide link to create event (admin)

3. **Network Timeout**
   - Show loading skeleton for 5 seconds
   - If timeout, show error message
   - Retry with exponential backoff

**Error UI:**
```typescript
<div className="text-center py-12">
  <div className="text-red-600 mb-4">
    Failed to load events
  </div>
  <button onClick={retry} className="btn-primary">
    Retry
  </button>
</div>
```

---

### Middleware Configuration

**CRITICAL:** Calendar page must be public (no authentication required for viewing)

**Required Changes to `src/middleware.ts`:**
```typescript
import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/sso-callback(.*)',
    '/api/webhooks(.*)',
    '/api/public(.*)',
    '/api/proxy(.*)',     // ✅ Already configured (fixed Oct 26, 2025)
    '/calendar(.*)',      // ⭐ ADD THIS - Calendar must be public
    '/mosc(.*)',
    '/events(.*)',
    '/gallery(.*)',
    '/about(.*)',
    '/contact(.*)',
    '/polls(.*)',
    '/charity-theme(.*)',
  ],

  // ... rest of middleware config
});
```

**Why This Is Required:**
- **Calendar viewing must be public** - No authentication needed to browse events
- **`/api/proxy(.*)` already public** - Allows unauthenticated API calls for public data
  - Reference: `.cursor/rules/nextjs_api_routes.mdc` - "Clerk Middleware Public Routes Configuration"
  - This rule was added Oct 26, 2025 to fix 401 errors on public pages
- **Clerk middleware** handles user authentication ONLY, not API authorization
- **Backend API** handles data authorization via JWT authentication

**Pattern:**
- Clerk manages user sessions (who is logged in)
- Backend manages data access (what data can be accessed)
- Public routes bypass Clerk authentication
- Public API routes (`/api/proxy/`) allow fetching public data without Clerk session

**Verification:**
- [ ] `/calendar(.*)` added to publicRoutes array
- [ ] Calendar page loads without requiring sign-in
- [ ] Events display correctly for unauthenticated users
- [ ] No 401 Unauthorized errors in console

**Reference:** `.cursor/rules/nextjs_api_routes.mdc` - Section: "Clerk Middleware Public Routes Configuration"

---

## 📡 API Requirements

### Existing APIs to Use

**Event Details API:**
```
GET /api/proxy/event-details
Query Params:
- startDate.greaterThanOrEqual (string, ISO date)
- endDate.lessThanOrEqual (string, ISO date)
- isActive.equals (boolean)
- sort (string, e.g., "startDate,asc")
- page (number)
- size (number)

Response: EventDetailsDTO[]
```

**Event Media API (for thumbnails):**
```
GET /api/proxy/event-medias
Query Params:
- eventId.equals (number)
- isHeroImage.equals (boolean)

Response: EventMediaDTO[]
```

**Note on New Backend Endpoints:**
- ❌ No new backend endpoints should be created without explicit backend team approval
- ✅ Existing `/api/event-details` endpoint supports all calendar requirements
- Backend project location: `C:\Users\gain\git\malayalees-us-site-boot`
- For export functionality (.ics files), implement frontend generation using existing event data

---

## 📊 Success Metrics

### KPIs (Key Performance Indicators)

**Usage Metrics:**
| Metric | Target | Measurement |
|--------|--------|-------------|
| Calendar page views | 500/month | Google Analytics |
| Events clicked from calendar | 25% click-through | Event tracking |
| Avg time on calendar page | > 2 minutes | Session tracking |
| Return visits to calendar | 40% | User tracking |
| Mobile vs desktop usage | 60/40 split | Device analytics |

**Performance Metrics:**
| Metric | Target | Measurement |
|--------|--------|-------------|
| Page load time | < 2 seconds | Lighthouse |
| Time to interactive | < 3 seconds | Web Vitals |
| Calendar render time | < 500ms | Performance API |
| API response time | < 1 second | Backend monitoring |
| Mobile performance score | > 90 | Lighthouse |

**User Satisfaction:**
| Metric | Target | Measurement |
|--------|--------|-------------|
| User satisfaction score | > 4.0/5.0 | User surveys |
| Calendar feature usefulness | > 80% positive | Feedback forms |
| Navigation ease rating | > 4.5/5.0 | UX surveys |
| Mobile experience rating | > 4.0/5.0 | App store reviews |

### A/B Testing Scenarios

**Test 1: Default View**
- A: Month view default
- B: Week view default
- Measure: User engagement, time on page

**Test 2: Event Display**
- A: Event titles shown
- B: Event icons/dots shown
- Measure: Click-through rate, user feedback

**Test 3: Filter Location**
- A: Filters above calendar
- B: Filters in sidebar
- Measure: Filter usage rate, user satisfaction

---

## 📅 Implementation Timeline (Estimate)

**Total Duration:** 8-10 weeks

**Phases:**

### Phase 1: Foundation (2 weeks)
- Create `/calendar` route and basic page structure
- Set up ApiServerActions.ts with `fetchWithJwtRetry` pattern
- Integrate calendar library (to be selected)
- Fetch events from existing `/api/proxy/event-details`
- Basic month view display with event data
- Navigation controls (previous/next/today)
- Add `/calendar(.*)` to middleware publicRoutes

**Milestone:** Working month view with real event data

---

### Phase 2: Core Features (2 weeks)
- Week view implementation
- Day view implementation
- View switcher (Month/Week/Day tabs)
- Event details modal (React Portal with sticky close button)
- Event click interactions
- Links to event pages and ticket purchase
- Pagination controls (always visible)

**Milestone:** All three views working with event interactions

---

### Phase 3: Enhanced Features (2 weeks)
- Filter controls (category, location, type)
- Search functionality
- Calendar export (.ics file generation)
- Timezone-aware date display (`date-fns-tz`)
- Loading states and error handling
- Performance optimization (caching, lazy loading)

**Milestone:** Full-featured calendar with filtering and export

---

### Phase 4: Testing & Polish (2-3 weeks)
- Mobile responsive refinements
- Touch gesture support (swipe navigation)
- Accessibility improvements (WCAG 2.1 AA compliance)
- Cross-browser testing
- User acceptance testing (UAT)
- Documentation updates

**Milestone:** Production-ready calendar

---

### Phase 5: Launch (1 week)
- Deploy to staging environment
- Beta testing with select users
- Fix critical bugs
- Deploy to production
- Monitor usage and performance
- Gather user feedback

**Milestone:** Calendar live in production with monitoring

---

**Note:** Actual timeline depends on team availability and priority changes. This is an estimate based on typical development velocity.

---

## ⚠️ Dependencies

### Technical Dependencies
- **Existing `/api/event-details` endpoint:** ✅ Available (verified in api-docs.json)
- **`event_details` database table:** ✅ Exists with all required fields
- **Next.js 15.1.1 App Router:** ✅ Configured
- **Tailwind CSS 3.4.1:** ✅ Configured
- **react-icons/fa:** ✅ Configured
- **date-fns-tz:** ⚠️ Needs to be installed (`npm install date-fns date-fns-tz`)

### Project Dependencies
- Frontend developer availability (2 developers for 8-10 weeks)
- QA resources for testing phase (1 QA engineer for 2-3 weeks)
- Product Manager approval and oversight

### Backend
- Backend project location: `C:\Users\gain\git\malayalees-us-site-boot`
- **No new backend endpoints required** - use existing `/api/event-details`
- Backend team approval required if any new endpoints are proposed

---

---

## 🚫 Out of Scope

The following features are **explicitly excluded** from this PRD and will be considered for future phases:

### Phase 2 Features (Future Enhancements)

1. **Event Creation from Calendar**
   - Clicking empty date to create new event
   - Drag-and-drop event creation
   - Quick event form in calendar

2. **Recurring Events**
   - Weekly/monthly recurring event patterns
   - Exception dates for recurring events
   - Edit single occurrence vs. all occurrences

3. **Calendar Subscriptions**
   - Subscribe to calendar via URL (webcal://)
   - Sync with external calendars
   - Real-time calendar updates

4. **Multi-Calendar View**
   - Toggle visibility of different event categories
   - Overlay multiple calendars
   - Color-coded calendar layers

5. **Event Reminders**
   - Email/SMS reminders before events
   - Push notifications (if mobile app)
   - Customizable reminder timing

6. **Social Features**
   - RSVP from calendar
   - See who's attending events
   - Share events via social media
   - Comment on events

7. **Advanced Filtering**
   - Save filter presets
   - Complex filter logic (OR, NOT operators)
   - Filter by price range
   - Filter by organizer

8. **Calendar Printing**
   - Print-friendly calendar view
   - PDF export of calendar
   - Customizable print layout

9. **Admin Calendar Features**
   - Drag-and-drop event rescheduling
   - Bulk event operations
   - Event approval workflow
   - Calendar analytics dashboard

10. **Internationalization**
    - Multi-language support
    - Locale-specific date formats
    - RTL (right-to-left) layout support

### Explicitly Not Included

- **User-specific calendars** (personal calendars per user)
- **Private events** (invitation-only events)
- **Event registration from calendar** (use event page for registration)
- **In-calendar payment** (use event page for ticket purchase)
- **Calendar widgets** (embeddable calendar for other sites)
- **Calendar API** (public API for calendar access)
- **Calendar integrations** (Zoom, Google Meet auto-add)

---

## 📚 References

### Competitive Analysis

**KANJ.org Calendar:**
- URL: https://www.kanj.org/calendar
- Features observed: Dedicated calendar page, month view, event listing
- Gap identified: They have calendar page, we don't

**Industry Standards:**
- Google Calendar: Month/week/day views, color coding, search
- Outlook Calendar: Business-focused, appointment slots, meeting rooms
- Apple Calendar: Clean design, natural language input, travel time
- Eventbrite: Event-focused, discovery, ticket integration

### Technical Documentation

- [react-big-calendar](https://github.com/jquense/react-big-calendar): Primary calendar library option
- [fullcalendar](https://fullcalendar.io/): Alternative premium calendar library
- [date-fns](https://date-fns.org/): Date manipulation utilities
- [Next.js App Router](https://nextjs.org/docs/app): Server/client component patterns

### Design Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/): Accessibility standards
- [Material Design Calendar](https://m2.material.io/components/date-pickers): Design patterns
- [Apple Human Interface Guidelines - Calendar](https://developer.apple.com/design/human-interface-guidelines/components/selection-and-input/date-pickers): iOS calendar UX

### Internal Documentation

- [KANJ Feature Comparison](../kanj_feature_comparison/KANJ_vs_OurSite_Analysis.md): Full competitive analysis
- [Event API Documentation](../../src/app/api/proxy/event-details/): Existing event API
- [UI Style Guide](../../.cursor/rules/ui_style_guide.mdc): Design system rules
- [Common Best Practices](../../.cursor/rules/common_app_router_aws_amplify_type_safety_best_practices.mdc): Technical standards

---

## 📝 Appendix

### A. Calendar Library Selection

**Note:** Calendar library selection is an implementation detail, not a PRD requirement.

**Requirements for selected library:**
- Month, Week, and Day views
- Event positioning by date/time
- Responsive design
- Event click interactions
- Customizable styling

**Suggested options:**
- `react-big-calendar` - Popular, well-maintained, free (MIT)
- `fullcalendar` - Feature-rich, commercial license available
- Custom implementation using date-fns-tz + Tailwind

**Decision:** To be made during implementation phase based on technical evaluation.

### B. Sample Event Data Structure

```typescript
interface CalendarEvent {
  // Core fields
  id: number;
  title: string;
  description?: string;
  
  // Date/Time
  start: Date;
  end: Date;
  allDay: boolean;
  timezone: string;
  
  // Location
  location?: string;
  address?: string;
  virtualEventUrl?: string;
  
  // Categorization
  category?: string;
  tags?: string[];
  
  // Visual
  color?: string;
  thumbnailUrl?: string;
  
  // Metadata
  organizerId?: number;
  organizerName?: string;
  isPublic: boolean;
  isFeatured: boolean;
  
  // Registration
  hasTickets: boolean;
  ticketUrl?: string;
  registrationUrl?: string;
  capacity?: number;
  attendeeCount?: number;
  
  // Full event data
  resource?: EventDetailsDTO; // Original API response
}
```

### C. Mockups & Wireframes

**Month View - Desktop:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]  Malayalees US                    [Search Events...]        │
│                                            [Login] [Sign Up]         │
├─────────────────────────────────────────────────────────────────────┤
│  October 2025                                                        │
│  < Previous  |  Today  |  Next >      [Month] [Week] [Day]         │
│                                                                      │
│  Filters: [All Categories ▼] [All Locations ▼] [Clear]             │
├───────┬───────┬───────┬───────┬───────┬───────┬───────────────────┤
│  Sun  │  Mon  │  Tue  │  Wed  │  Thu  │  Fri  │  Sat              │
├───────┼───────┼───────┼───────┼───────┼───────┼───────────────────┤
│       │       │   1   │   2   │   3   │   4   │   5               │
│       │       │       │ Comm  │ Tech  │       │ Chari             │
│       │       │       │ Meet  │ Work  │       │ Event             │
│       │       │       │ 9am   │ 11am  │       │ 6pm               │
├───────┼───────┼───────┼───────┼───────┼───────┼───────────────────┤
│   6   │   7   │   8   │   9   │  10   │  11   │  12               │
│       │ Yoga  │       │       │       │ Music │ Dance             │
│       │ 8am   │       │       │       │ Class │ Show              │
│       │       │       │       │       │ 5pm   │ 7pm               │
├───────┼───────┼───────┼───────┼───────┼───────┼───────────────────┤
│  13   │  14   │  15   │  16   │  17   │  18   │  19               │
│       │       │       │       │       │       │ Fund              │
│       │       │       │       │       │       │ Event             │
│       │       │       │       │       │       │ All Day           │
└───────┴───────┴───────┴───────┴───────┴───────┴───────────────────┘
```

**Mobile View - Portrait:**
```
┌────────────────────────┐
│  ☰  Calendar     🔍    │
├────────────────────────┤
│  October 2025          │
│  < Today >             │
│  [Month] [List]        │
├────────────────────────┤
│  Wed, Oct 2            │
│  ├─ Community Meetup   │
│  │   9:00 AM - 11:00 AM│
│  │   Community Center  │
│  └─ [View] [Tickets]   │
├────────────────────────┤
│  Thu, Oct 3            │
│  ├─ Tech Workshop      │
│  │   11:00 AM - 1:00 PM│
│  │   Conf Room A       │
│  └─ [View] [Tickets]   │
├────────────────────────┤
│  [Load More]           │
└────────────────────────┘
```

### D. Acceptance Test Cases

**Test Case 1: View Current Month**
```gherkin
Given I navigate to /calendar
When the page loads
Then I should see the current month displayed
And today's date should be highlighted
And all events for the current month should be visible
```

**Test Case 2: Navigate to Next Month**
```gherkin
Given I am viewing the calendar
When I click the "Next" button
Then the calendar should display the next month
And events for that month should load
And the month/year header should update
```

**Test Case 3: Click on Event**
```gherkin
Given I see an event on October 5th
When I click on the event
Then an event details modal should open
And I should see event title, date, time, location
And I should see buttons for "View Full Event" and "Buy Tickets"
```

**Test Case 4: Switch to Week View**
```gherkin
Given I am in month view
When I click the "Week" tab
Then the calendar should switch to week view
And the current week should be displayed
And events should be positioned by time
```

**Test Case 5: Filter by Category**
```gherkin
Given I am viewing the calendar with all events
When I select "Cultural" from the category filter
Then only cultural events should be displayed
And other events should be hidden
And the filter should show as active
```

**Test Case 6: Search for Event**
```gherkin
Given I am on the calendar page
When I type "Workshop" in the search bar
Then only events with "Workshop" in title or description should be displayed
And a results count should be shown
And non-matching events should be hidden
```

**Test Case 7: Export Event**
```gherkin
Given I am viewing an event in the modal
When I click "Add to Calendar"
Then a .ics file should download
And the file should be openable in Google Calendar
And event details should be correctly formatted
```

**Test Case 8: Mobile Responsive**
```gherkin
Given I am on a mobile device (< 768px width)
When I navigate to /calendar
Then the calendar should display in list view
And I should be able to swipe to navigate months
And all interactive elements should be touch-friendly (44px+ tap targets)
```

---

## 📧 Contact & Approvals

**Document Owner:** Product Manager  
**Email:** pm@malayalees.org  
**Last Updated:** October 22, 2025

**Approvals Required:**

| Role | Name | Approval Status | Date |
|------|------|----------------|------|
| Product Manager | [Name] | ⏳ Pending | - |
| Engineering Lead | [Name] | ⏳ Pending | - |
| UI/UX Lead | [Name] | ⏳ Pending | - |
| QA Lead | [Name] | ⏳ Pending | - |

**Review History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Oct 22, 2025 | Initial draft | Development Team |

---

**End of Document**

