# Calendar Feature PRD - Verification Report

**Date:** October 26, 2025
**Reviewer:** Development Team (via Claude Code)
**PRD Document:** `Calendar_Feature_PRD.md` (Version 1.0)
**Status:** 🔴 **REQUIRES MAJOR REVISIONS**

---

## Executive Summary

The Calendar Feature PRD has been reviewed against project standards including:
- ✅ Database schema (`Latest_Schema_Post__Blob_Claude_11.sql`)
- ✅ API specifications (`api-docs.json`)
- ⚠️ Next.js API route patterns (`.cursor/rules/nextjs_api_routes.mdc`)
- ⚠️ UI style guide (`.cursor/rules/ui_style_guide.mdc`)
- ❌ Infrastructure elimination (project already in development phase)

**Overall Assessment:** The PRD is comprehensive in feature scope but contains significant deviations from established project standards and includes infrastructure decisions already made. **Major revisions required before implementation.**

---

## ✅ What's Correct

### 1. Database Schema Alignment
**Status:** ✅ EXCELLENT

- **`event_details` table:** Exists with all necessary fields
  - `startDate`, `endDate`, `startTime`, `endTime` ✓
  - `timezone`, `location`, `title`, `caption` ✓
  - `isActive`, `tenant_id` for multi-tenant filtering ✓
- **`event_calendar_entry` table:** Exists (for external calendar sync)
  - Currently used for Google Calendar/iCal integration
  - PRD correctly does NOT depend on this for main calendar view
- **All event-related tables present:** event_media, event_ticket_type, event_organizer, etc.

**Recommendation:** ✅ No changes needed - database fully supports requirements

---

### 2. API Endpoints Available
**Status:** ✅ GOOD

The PRD correctly references existing API:
```typescript
// PRD Section 9: API Requirements
GET /api/proxy/event-details
Query Params:
- startDate.greaterThanOrEqual: '2025-10-01'
- endDate.lessThanOrEqual: '2025-10-31'
- isActive.equals: true
- sort: 'startDate,asc'
- page: 0
- size: 100
```

**Verified in `api-docs.json`:**
- `/api/event-details` GET endpoint exists ✓
- Supports all JHipster filter operations (`.equals`, `.greaterThanOrEqual`, `.lessThanOrEqual`) ✓
- Returns `EventDetailsDTO[]` array ✓
- Includes pagination via `x-total-count` header ✓

**Recommendation:** ✅ Use existing `/api/proxy/event-details` - no new backend endpoints needed

---

### 3. Feature Scope & User Stories
**Status:** ✅ COMPREHENSIVE

- User stories well-defined with Gherkin syntax ✓
- Functional requirements clear and testable ✓
- Out-of-scope items properly documented ✓
- Success metrics and KPIs defined ✓

**Recommendation:** ✅ Feature scope is solid - keep as-is

---

## ⚠️ Requires Corrections

### 1. API Architecture Pattern Violations
**Status:** ⚠️ MODERATE ISSUES

#### Issue 1.1: New API Endpoint Suggestion
**PRD Section 9 (Lines 819-839):**
```typescript
// ❌ INCORRECT - PRD suggests creating new endpoint:
GET /api/calendar/events
Query Params:
- month (number, 1-12)
- year (number, e.g., 2025)
```

**Problem:**
- Violates `.cursor/rules/nextjs_api_routes.mdc` - backend already has `/api/event-details`
- Creates redundant endpoint
- Backend is at `C:\Users\gain\git\malayalees-us-site-boot` (separate repo)
- Project in development phase - no new backend endpoints without explicit requirement

**Correct Pattern:**
```typescript
// ✅ CORRECT - Use existing proxy with date filtering:
const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
const endDate = new Date(year, month, 0).toISOString().split('T')[0];

const response = await fetch(
  `/api/proxy/event-details?` +
  `startDate.greaterThanOrEqual=${startDate}&` +
  `endDate.lessThanOrEqual=${endDate}&` +
  `isActive.equals=true&` +
  `sort=startDate,asc&` +
  `page=0&size=100`
);
```

**Action Required:**
- ❌ Remove "New APIs (Optional)" section (lines 817-852)
- ✅ Add note: "Use existing `/api/proxy/event-details` with date range filtering"

---

#### Issue 1.2: Client Component API Calls
**PRD Section 7 (Lines 653-675):**
```typescript
// ❌ INCORRECT Pattern:
'use client';
export function CalendarClient({ initialEvents }) {
  useEffect(() => {
    fetchEventsForDateRange(currentDate, view, filters); // ❌ Direct fetch from client
  }, [currentDate, view, filters]);
}
```

**Problem:**
Violates `.cursor/rules/nextjs_api_routes.mdc` - Rule: "Client Components Must Not Make Direct API Calls"

**Correct Pattern from `nextjs_api_routes.mdc`:**
```typescript
// ✅ CORRECT - Server Action Pattern:

// 1. Create ApiServerActions.ts for server-side fetches
// src/app/calendar/ApiServerActions.ts
'use server';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

export async function fetchEventsForMonthServer(year: number, month: number) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const url = `${API_BASE_URL}/api/event-details?` +
    `startDate.greaterThanOrEqual=${startDate}&` +
    `endDate.lessThanOrEqual=${endDate}&` +
    `isActive.equals=true&sort=startDate,asc&page=0&size=100`;

  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return [];
  return await res.json();
}

// 2. Client component calls server action
// src/app/calendar/CalendarClient.tsx
'use client';
import { fetchEventsForMonthServer } from './ApiServerActions';

export function CalendarClient({ initialEvents }) {
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchEventsForMonthServer(currentYear, currentMonth);
      setEvents(data);
    };
    loadEvents();
  }, [currentYear, currentMonth]);
}
```

**Action Required:**
- ❌ Remove all direct `fetch()` calls from client components (lines 653-675)
- ✅ Add `ApiServerActions.ts` file specification with `fetchWithJwtRetry` pattern
- ✅ Reference `.cursor/rules/nextjs_api_routes.mdc` rule: "STRICT RULE: All Server Actions Must Use fetchWithJwtRetry"

---

#### Issue 1.3: Missing Server Component Pattern
**PRD Section 7 (Lines 641-651):**
```typescript
// ❌ INCOMPLETE Pattern:
export default async function CalendarPage() {
  const events = await fetchEventsForCalendar(startOfMonth, endOfMonth);
  return <CalendarClient initialEvents={events} />;
}
```

**Problem:**
- Doesn't show error handling (required by `nextjs_api_routes.mdc`)
- Missing graceful failure pattern
- No fallback data

**Correct Pattern from `nextjs_api_routes.mdc`:**
```typescript
// ✅ CORRECT - Graceful Error Handling:
export default async function CalendarPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  let initialEvents = [];
  try {
    initialEvents = await fetchEventsForMonthServer(year, month + 1);
  } catch (error) {
    console.error('Failed to load initial events:', error);
    // Graceful fallback - empty array allows page to render
  }

  return <CalendarClient initialEvents={initialEvents} />;
}
```

**Action Required:**
- ✅ Add try-catch error handling to server component example
- ✅ Add reference to "Graceful API Failure Handling" rule from `nextjs_api_routes.mdc`

---

### 2. UI/UX Standards Non-Compliance
**Status:** ⚠️ MODERATE ISSUES

#### Issue 2.1: Missing Pagination Standards
**PRD Section 6 (FR-9):** No mention of pagination for large event datasets

**Problem:**
- `.cursor/rules/ui_style_guide.mdc` mandates:
  - "CRITICAL: Always show pagination controls"
  - "Never conditionally hide pagination"
  - Use `x-total-count` header from backend
  - Previous/Next/Page status pattern

**Current PRD:**
- No pagination mentioned for month view
- No page size limits specified
- No total count display

**Correct Pattern from `ui_style_guide.mdc`:**
```typescript
// ✅ CORRECT - Always Show Pagination:
const totalPages = Math.ceil(totalCount / pageSize);
const isPrevDisabled = currentPage === 0 || loading;
const isNextDisabled = currentPage >= totalPages - 1 || loading;

// ALWAYS render pagination - show in ALL states (loading, empty, with data)
<div className="mt-8">
  <div className="flex justify-between items-center">
    <button disabled={isPrevDisabled} onClick={handlePrevPage}>
      <ChevronLeft /> Previous
    </button>
    <div className="text-sm font-semibold">
      Page {currentPage + 1} of {totalPages}
    </div>
    <button disabled={isNextDisabled} onClick={handleNextPage}>
      Next <ChevronRight />
    </button>
  </div>
  <div className="text-center text-sm mt-2">
    {totalCount > 0 ? (
      <>Showing {startItem} to {endItem} of {totalCount} events</>
    ) : (
      <span>No events found</span>
    )}
  </div>
</div>
```

**Action Required:**
- ✅ Add FR-11: "Pagination for Large Datasets"
  - Show pagination controls below calendar
  - Display "Showing X to Y of Z events" for current month
  - Use `x-total-count` header from API
  - Always visible pagination (even when empty)
- ✅ Reference `ui_style_guide.mdc` Section 5: Pagination

---

#### Issue 2.2: Missing Date/Timezone Formatting Standards
**PRD Section 8 (Lines 597-604):** Specifies `date-fns` but not timezone handling

**Problem:**
- `.cursor/rules/ui_style_guide.mdc` Section 7 mandates:
  - "Always display event dates using event's intended timezone"
  - "Use `date-fns-tz` for formatting"
  - "Never use `new Date('YYYY-MM-DD')` for display"

**Correct Pattern from `ui_style_guide.mdc`:**
```typescript
// ✅ CORRECT - Timezone-Aware Formatting:
import { formatInTimeZone } from 'date-fns-tz';

<div className="flex items-center gap-2">
  <FaCalendarAlt />
  <span>
    {formatInTimeZone(
      eventDetails.startDate,
      eventDetails.timezone,
      'EEEE, MMMM d, yyyy (zzz)'
    )}
  </span>
</div>
// Output: "Wednesday, August 7, 2025 (EDT)"
```

**Action Required:**
- ✅ Update Section 8 "Technology Stack" (line 602):
  - Change: `date-fns or date-fns-tz`
  - To: `date-fns-tz (required for timezone-aware display)`
- ✅ Add Section 8.5: "Date & Timezone Display Standards"
  - Always use `formatInTimeZone()` from `date-fns-tz`
  - Display timezone abbreviation (EDT, PST, etc.)
  - Reference `ui_style_guide.mdc` Section 7

---

#### Issue 2.3: Missing Responsive Button Standards
**PRD Section 8 (Lines 550-589):** Generic button/UI guidelines

**Problem:**
- `.cursor/rules/ui_style_guide.mdc` Section 6 defines specific responsive grid pattern:
  - `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6`
  - Button width: `w-48 max-w-xs mx-auto`
  - Mobile: compact, centered buttons
  - Always visible, horizontally scrollable

**Action Required:**
- ✅ Update Section 8 "UI/UX Requirements" (lines 550-589):
  - Add subsection: "Navigation Button Grid Pattern"
  - Reference `ui_style_guide.mdc` Section 6
  - Include responsive grid classes

---

#### Issue 2.4: Missing Tooltip/Modal Standards
**PRD Section 6 (FR-6, Lines 400-435):** Event modal/details popup

**Problem:**
- `.cursor/rules/ui_style_guide.mdc` Section 4 defines strict tooltip/modal standards:
  - Close button always visible (`sticky top-0 right-0`)
  - Large close button (`w-10 h-10 bg-red-500`)
  - Renders via React Portal
  - Positioning: always to right of trigger, never above columns

**Current PRD:**
```
┌─────────────────────────────────────────────────────────┐
│  Community Fundraiser                              [X]  │
├─────────────────────────────────────────────────────────┤
```

**Action Required:**
- ✅ Update FR-6 Event Modal specification (lines 413-435):
  - Add: "Modal must render via React Portal (ReactDOM.createPortal)"
  - Add: "Close button always visible (sticky positioning)"
  - Add: "Close button styling: `w-10 h-10 bg-red-500 hover:bg-red-600`"
  - Reference `ui_style_guide.mdc` Section 4

---

### 3. Missing Critical Specifications
**Status:** ⚠️ MODERATE ISSUES

#### Issue 3.1: No Server Action File Structure
**Problem:** PRD shows file structure (lines 615-636) but omits `ApiServerActions.ts`

**Required by `.cursor/rules/nextjs_api_routes.mdc`:**
```
src/app/calendar/
├── page.tsx                      # Server component (SSR)
├── CalendarClient.tsx            # Client component
├── ApiServerActions.ts           # ✅ REQUIRED - All server-side API calls
├── components/
│   ├── MonthView.tsx
│   ├── WeekView.tsx
│   └── ...
```

**Action Required:**
- ✅ Add `ApiServerActions.ts` to file structure (line 618)
- ✅ Add code example showing `fetchEventsForMonthServer()` using `fetchWithJwtRetry`
- ✅ Reference rule: "Standard: Place all server-side API calls in ApiServerActions.ts"

---

#### Issue 3.2: No Public Routes Configuration
**Problem:** PRD doesn't specify middleware configuration for `/calendar` route

**Required by `.cursor/rules/nextjs_api_routes.mdc` (NEW RULE added today):**
```typescript
// src/middleware.ts
export default authMiddleware({
  publicRoutes: [
    '/',
    '/calendar(.*)',  // ✅ REQUIRED - Calendar must be public
    '/api/proxy(.*)',  // ✅ Already configured for public API access
    // ...
  ],
});
```

**Action Required:**
- ✅ Add Section 7.5: "Middleware Configuration"
  - Add `/calendar(.*)` to publicRoutes
  - Confirm `/api/proxy(.*)` already in publicRoutes (fixed today!)
  - Reference new rule in `nextjs_api_routes.mdc` (Clerk Middleware Public Routes Configuration)

---

## ❌ Must Be Removed (Infrastructure Already Decided)

### Remove: Infrastructure & Setup Sections
**Status:** ❌ VIOLATES PROJECT PHASE

User explicitly stated:
> "This is a project already in development phase. Infrastructure, basic dev tools, database schema, JSON schema all already defined. Focus only on implementation of features. Don't specify infrastructure development/basic project setup."

**Sections to REMOVE or MARK as "Already Implemented":**

#### 1. Remove: Technology Stack Decision (Lines 596-611)
```markdown
### Technology Stack

**Frontend:**
```typescript
- Framework: Next.js 15 (App Router)  # ✅ ALREADY DECIDED
- Calendar Library: react-big-calendar or fullcalendar  # ❌ REMOVE - to be decided during implementation
- State Management: React useState/useEffect  # ✅ ALREADY DECIDED
- Styling: Tailwind CSS + custom CSS  # ✅ ALREADY DECIDED
- Date Handling: date-fns or date-fns-tz  # ⚠️ CHANGE to: "date-fns-tz (required)"
- Icons: Lucide React or existing icon system  # ✅ ALREADY DECIDED (react-icons/fa)
```
```

**Action Required:**
- ❌ Remove library selection discussion
- ✅ Change section title to: "Technology Stack (Already Configured)"
- ✅ State facts only: "Framework: Next.js 15 (App Router)", "Styling: Tailwind CSS", etc.
- ✅ For date library: State as requirement, not option: "Date Library: `date-fns-tz` (required for timezone support)"

---

#### 2. Remove: Library Comparison (Lines 1200-1224, Appendix A)
```markdown
### A. Calendar Library Comparison

| Feature | react-big-calendar | fullcalendar | react-calendar | Custom Build |
...
```

**Problem:** This is implementation detail, not feature requirement

**Action Required:**
- ❌ Remove entire Appendix A (lines 1200-1224)
- ✅ Replace with: "Calendar library selection deferred to implementation phase. Requirements: Month/Week/Day views, event positioning, responsive design."

---

#### 3. Simplify: Timeline & Resource Allocation (Lines 905-1003)
**Current:** 10-week timeline with team allocation

**Problem:**
- Too detailed for PRD
- Resource allocation is PM/leadership decision
- Timeline should be estimate, not detailed Gantt chart

**Action Required:**
- ✅ Simplify to:
  ```markdown
  ## Implementation Timeline (Estimate)

  **Total Duration:** 8-10 weeks

  **Phases:**
  1. **Foundation (2 weeks):** Basic calendar page, API integration, month view
  2. **Core Features (2 weeks):** Week/day views, event interactions, modals
  3. **Enhanced Features (2 weeks):** Filtering, search, export, performance optimization
  4. **Testing & Polish (2-3 weeks):** Responsive design, accessibility, cross-browser testing
  5. **Launch (1 week):** Deployment, monitoring, feedback collection

  **Note:** Actual timeline depends on team availability and priority changes.
  ```

---

#### 4. Remove: Dependencies & Risks (Lines 1006-1087)
**Current:** Extensive risk analysis with mitigation strategies

**Problem:** This is PM/project management content, not technical PRD

**Action Required:**
- ✅ Simplify to:
  ```markdown
  ## Dependencies

  **Technical:**
  - Existing `/api/event-details` endpoint (✅ Available)
  - `event_details` database table (✅ Exists)
  - Next.js 15 App Router (✅ Configured)

  **Project:**
  - Frontend developer availability (2 developers for 8-10 weeks)
  - QA resources for testing phase
  ```
- ❌ Remove risk mitigation, probability estimates, etc.

---

## 📋 Summary of Required Changes

### 🔴 CRITICAL (Must Fix Before Implementation)

1. **Remove New API Endpoint Suggestion** (Lines 817-852)
   - Delete "New APIs (Optional)" section
   - Confirm use of existing `/api/proxy/event-details`

2. **Fix Client Component API Pattern** (Lines 653-675)
   - Add `ApiServerActions.ts` specification
   - Use `fetchWithJwtRetry` from `@/lib/proxyHandler`
   - No direct `fetch()` calls from client components

3. **Add Public Route Configuration** (New Section 7.5)
   - Add `/calendar(.*)` to middleware publicRoutes
   - Reference new Clerk middleware rule

4. **Remove Infrastructure Decisions** (Multiple sections)
   - Remove library comparisons
   - Simplify timeline to estimates only
   - Remove risk analysis

### 🟡 IMPORTANT (Should Fix for Best Practices)

5. **Add Pagination Standards** (New FR-11)
   - Always-visible pagination controls
   - Use `x-total-count` header
   - Reference `ui_style_guide.mdc` Section 5

6. **Specify Date/Timezone Handling** (Section 8)
   - Mandate `date-fns-tz` (not optional)
   - Add timezone display examples
   - Reference `ui_style_guide.mdc` Section 7

7. **Update Modal/Tooltip Specs** (FR-6)
   - React Portal rendering
   - Sticky close button
   - Reference `ui_style_guide.mdc` Section 4

### 🟢 NICE TO HAVE (Can Address During Implementation)

8. **Add Responsive Button Grid Pattern** (Section 8)
   - Reference `ui_style_guide.mdc` Section 6

9. **Add Error Handling Examples** (Section 7)
   - Graceful API failure pattern
   - Reference `nextjs_api_routes.mdc`

---

## ✅ Approval Checklist

Before proceeding to implementation, the PRD must:

- [ ] Remove all new API endpoint suggestions
- [ ] Add `ApiServerActions.ts` with `fetchWithJwtRetry` pattern
- [ ] Add `/calendar(.*)` to middleware publicRoutes
- [ ] Mandate `date-fns-tz` for timezone display
- [ ] Add pagination standards (always-visible controls)
- [ ] Add modal/tooltip Portal rendering specs
- [ ] Remove library comparison appendix
- [ ] Simplify timeline to estimates
- [ ] Remove risk analysis section
- [ ] Add references to `.cursor/rules/` patterns throughout

---

## 📚 References

### Project Standards
- **API Patterns:** `.cursor/rules/nextjs_api_routes.mdc`
- **UI Standards:** `.cursor/rules/ui_style_guide.mdc`
- **Database Schema:** `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`
- **API Specs:** `documentation/Swagger_API_Docs/api-docs.json`

### Existing Implementation Examples
- **Homepage Events:** `src/app/page.tsx` (graceful error handling)
- **Gallery Pagination:** `src/app/gallery/components/GalleryPagination.tsx`
- **Event Success Page:** `src/app/event/success/page.tsx` (timezone formatting)
- **Manage Usage:** `src/app/admin/manage-usage/ManageUsageClient.tsx` (tooltip pattern)

### Backend Project
- **Location:** `C:\Users\gain\git\malayalees-us-site-boot`
- **Do not create new endpoints without backend team approval**

---

## 📝 Next Steps

1. **Resolve ByteRover Memory Conflicts**
   - URL: https://app.byterover.dev/workspace/cmek7x0ib01gq9x070hb4lf8s/memories/conflicts

2. **Update PRD**
   - Address all 🔴 CRITICAL items
   - Address all 🟡 IMPORTANT items

3. **Get PRD Re-approval**
   - Product Manager review
   - Engineering Lead approval

4. **Begin Implementation**
   - Start with Phase 1: Foundation (basic calendar page + API integration)

---

**Report Generated:** October 26, 2025
**Verification Tool:** Claude Code + Project Standards Analysis
**Status:** 🔴 **REQUIRES MAJOR REVISIONS**
