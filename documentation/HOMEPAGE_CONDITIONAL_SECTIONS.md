# Homepage Conditional Sections Display Logic

## Overview

This document describes how the conditional display of sections on the homepage works, specifically for the **Events/Upcoming Events Section**, **Team Members Section**, and **Sponsors Section**. These sections can be enabled or disabled through tenant settings, allowing different tenants to customize their homepage appearance.

## Sections with Conditional Display

### 1. **Events/Upcoming Events Section** (`UpcomingEventsSection`)
- **Component**: `src/components/UpcomingEventsSection.tsx`
- **Tenant Setting Field**: `showEventsSectionInHomePage` (boolean)
- **Default Behavior**: `true` (shown by default)
- **Data Source**: Fetches from `/api/proxy/event-details` with filtering for upcoming events
- **Caching**: Uses `sessionStorage` with key `homepage_events_cache` (5 minute duration)

### 2. **Team Members Section** (`TeamSection`)
- **Component**: `src/components/TeamSection.tsx`
- **Tenant Setting Field**: `showTeamMembersSectionInHomePage` (boolean)
- **Default Behavior**: `true` (shown by default)
- **Data Source**: Fetches from `/api/proxy/executive-committee-team-members?isActive.equals=true&sort=priorityOrder,asc`
- **Caching**: Uses `sessionStorage` with key `homepage_team_cache` (5 minute duration)

### 3. **Sponsors Section** (`OurSponsorsSection`)
- **Component**: `src/components/OurSponsorsSection.tsx`
- **Tenant Setting Field**: `showSponsorsSectionInHomePage` (boolean)
- **Default Behavior**: `true` (shown by default)
- **Data Source**: Fetches from `/api/proxy/event-sponsors`
- **Caching**: Uses `sessionStorage` with key `homepage_sponsors_cache` (5 minute duration)

## Implementation Architecture

### Tenant Settings Provider

The conditional display logic is managed through the `TenantSettingsProvider` component:

**Location**: `src/components/TenantSettingsProvider.tsx`

**How It Works**:

1. **Fetches Tenant Settings**:
   - Calls `/api/proxy/tenant-settings` on component mount
   - Uses sessionStorage caching (5 minute duration, key: `homepage_tenant_settings_cache`)
   - Implements retry logic (max 2 retries, 2 second delay)

2. **Derives Section Visibility**:
   ```typescript
   const showEventsSection = settings?.showEventsSectionInHomePage ?? true;
   const showTeamSection = settings?.showTeamMembersSectionInHomePage ?? true;
   const showSponsorsSection = settings?.showSponsorsSectionInHomePage ?? true;
   ```

3. **Provides Context**:
   - Makes `showEventsSection`, `showTeamSection`, `showSponsorsSection`, and `loading` available via React Context
   - Components can access these values using `useTenantSettings()` hook

4. **Error Handling**:
   - If tenant settings fetch fails, defaults to `true` (show all sections)
   - Gracefully handles network errors and 404/500 responses
   - Retries on server errors (500) and network failures

### Homepage Implementation

**Location**: `src/app/page.tsx`

**Section Order and Conditional Logic**:

```typescript
function HomePageContent() {
  const { showEventsSection, showTeamSection, showSponsorsSection, loading } = useTenantSettings();

  return (
    <main>
      {/* Always shown sections */}
      <HeroSection />
      <LiveEventsSection />
      <FeaturedEventsSection />
      <ServicesSection />      {/* "What We Do" */}
      <AboutSection />         {/* "About Foundation" */}

      {/* Conditional sections with loading state */}
      {loading ? (
        <LoadingImage />  {/* Shows loading_events.jpg */}
      ) : (
        <>
          {showEventsSection && <UpcomingEventsSection />}
          {showTeamSection && <TeamSection />}
        </>
      )}

      {/* Always shown sections */}
      <CausesSection />

      {/* Conditional section (no loading state) */}
      {showSponsorsSection && <OurSponsorsSection />}

      {/* Always shown sections */}
      <ProjectsSection />
      <TestimonialsSection />
      <ContactSection />
    </main>
  );
}
```

## Page Flow and Loading States

### Loading State Behavior

When `loading === true` (tenant settings are being fetched):

1. **Immediate Display Sections**:
   - Hero Section
   - Banner
   - Live Events Section
   - Featured Events Section
   - **Services Section ("What We Do")**
   - **About Section ("About Foundation")**

2. **Loading Indicator**:
   - Shows `/images/loading_events.jpg` with wavy animation
   - Positioned below "What We Do" and "About Foundation" sections
   - Indicates that Events and Team sections are loading

3. **Blocked Sections** (until loading completes):
   - Upcoming Events Section
   - Team Members Section

4. **Sponsors Section**:
   - Only shown if `showSponsorsSection === true` AND `loading === false`
   - Does not appear during loading state

### Normal State Behavior (loading === false)

1. **Always Shown Sections**:
   - Hero Section
   - Banner
   - Live Events Section
   - Featured Events Section
   - Services Section ("What We Do")
   - About Section ("About Foundation")
   - Causes Section
   - Projects Section
   - Testimonials Section
   - Contact Section

2. **Conditionally Shown Sections** (based on tenant settings):
   - **Upcoming Events Section**: Shown if `showEventsSection === true`
   - **Team Members Section**: Shown if `showTeamSection === true`
   - **Sponsors Section**: Shown if `showSponsorsSection === true`

## Tenant Settings DTO Structure

**Location**: `src/types/index.ts`

```typescript
export interface TenantSettingsDTO {
  id?: number;
  tenantId?: string;
  // ... other fields ...
  showEventsSectionInHomePage?: boolean;
  showTeamMembersSectionInHomePage?: boolean;
  showSponsorsSectionInHomePage?: boolean;
  // ... other fields ...
}
```

## Backend API Integration

### Fetching Tenant Settings

**Endpoint**: `/api/proxy/tenant-settings`

**Server Action**: `src/app/ApiServerActions.ts`

```typescript
export async function fetchTenantSettingsServer(): Promise<TenantSettingsDTO | null> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const tenantId = getTenantId();

  const response = await fetchWithJwtRetry(
    `${API_BASE_URL}/api/tenant-settings?tenantId.equals=${encodeURIComponent(tenantId)}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    }
  );

  // Returns TenantSettingsDTO or null
}
```

## Caching Mechanism

### Tenant Settings Cache

- **Storage**: `sessionStorage`
- **Key**: `homepage_tenant_settings_cache`
- **Duration**: 5 minutes (300,000 ms)
- **Structure**:
  ```json
  {
    "data": { /* TenantSettingsDTO */ },
    "timestamp": 1234567890
  }
  ```

### Section Data Caches

Each section maintains its own cache:

1. **Events Cache**:
   - Key: `homepage_events_cache`
   - Duration: 5 minutes
   - Stores: Event array with `isUpcoming` flag

2. **Team Cache**:
   - Key: `homepage_team_cache`
   - Duration: 5 minutes
   - Stores: Team member array

3. **Sponsors Cache**:
   - Key: `homepage_sponsors_cache`
   - Duration: 5 minutes
   - Stores: Sponsors array

## Admin Configuration

### Tenant Settings Management

**Location**: `src/app/admin/tenant-management/settings/[id]/edit/page.tsx`

**UI Controls**:
- Toggle switches in the admin panel to enable/disable each section
- Located under "Homepage Display Settings" tab
- Changes are persisted to the backend via PUT/PATCH requests

**Form Fields**:
- `showEventsSectionInHomePage`: Toggle for Events section
- `showTeamMembersSectionInHomePage`: Toggle for Team section
- `showSponsorsSectionInHomePage`: Toggle for Sponsors section

## Error Handling and Fallbacks

### Tenant Settings Fetch Failures

1. **Network Errors**:
   - Retries up to 2 times with 2 second delay
   - Falls back to default values (all sections shown)

2. **404 Not Found**:
   - No tenant settings exist
   - Defaults to showing all sections (`true`)

3. **500 Server Error**:
   - Retries up to 2 times
   - Falls back to default values if retries exhausted

4. **Cache Errors**:
   - Silently falls back to API fetch
   - Does not break the page if cache read fails

### Section Component Errors

Each conditional section is wrapped in an `ErrorBoundary`:

```typescript
{showEventsSection && (
  <ErrorBoundary fallback={<EventsFallback />}>
    <UpcomingEventsSection />
  </ErrorBoundary>
)}

{showTeamSection && (
  <ErrorBoundary fallback={<TeamFallback />}>
    <TeamSection />
  </ErrorBoundary>
)}

{showSponsorsSection && (
  <ErrorBoundary fallback={<div>Sponsors temporarily unavailable</div>}>
    <OurSponsorsSection />
  </ErrorBoundary>
)}
```

**Fallback Components**:
- `EventsFallback`: Shows "Events Information Temporarily Unavailable" message
- `TeamFallback`: Shows "Team Information Temporarily Unavailable" message
- Sponsors: Shows "Sponsors temporarily unavailable" message

## Default Behavior

### When Tenant Settings Are Not Available

If tenant settings cannot be fetched or don't exist:

- **All sections are shown by default** (`true`)
- This ensures backward compatibility
- Pages continue to work even if backend is unavailable
- Graceful degradation without breaking the user experience

### Code Defaults

```typescript
// TenantSettingsProvider.tsx
const TenantSettingsContext = React.createContext<TenantSettingsContextType>({
  settings: null,
  loading: true,
  showEventsSection: true,  // Default to true
  showTeamSection: true,    // Default to true
  showSponsorsSection: true // Default to true
});

// Derived values with nullish coalescing
const showEventsSection = settings?.showEventsSectionInHomePage ?? true;
const showTeamSection = settings?.showTeamMembersSectionInHomePage ?? true;
const showSponsorsSection = settings?.showSponsorsSectionInHomePage ?? true;
```

## Data Fetching Strategy

### Each Section's Data Fetching

1. **Check Cache First**:
   - Look for cached data in `sessionStorage`
   - Validate cache age (< 5 minutes)
   - Use cached data if valid

2. **Fetch from API**:
   - If cache is invalid or missing, fetch from backend
   - Use proxy endpoints (`/api/proxy/...`) for authentication
   - Handle errors gracefully

3. **Cache the Result**:
   - Store successful fetch results in `sessionStorage`
   - Include timestamp for cache validation

## Visual Loading Indicators

### Loading Image

**Image Path**: `/images/loading_events.jpg`

**Styling**:
- Centered with flexbox
- 300x300px dimensions
- Rounded corners with shadow
- Pulse animation
- Wavy overlay animation (CSS class: `wavy-animation`)

**CSS Animation** (from `src/app/globals.css`):
```css
.wavy-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 193, 7, 0.2) 25%,
    rgba(255, 193, 7, 0.4) 50%,
    rgba(255, 193, 7, 0.2) 75%,
    transparent 100%);
  background-size: 200% 100%;
  animation:
    wavy 3s ease-in-out infinite,
    shimmer 2s ease-in-out infinite;
}
```

## Summary Table

| Section | Component | Setting Field | Default | Loading State | Cache Key |
|---------|-----------|---------------|---------|---------------|-----------|
| Events | `UpcomingEventsSection` | `showEventsSectionInHomePage` | `true` | Blocked during loading | `homepage_events_cache` |
| Team | `TeamSection` | `showTeamMembersSectionInHomePage` | `true` | Blocked during loading | `homepage_team_cache` |
| Sponsors | `OurSponsorsSection` | `showSponsorsSectionInHomePage` | `true` | Only shown when not loading | `homepage_sponsors_cache` |

## Key Files Reference

- **Homepage Component**: `src/app/page.tsx`
- **Tenant Settings Provider**: `src/components/TenantSettingsProvider.tsx`
- **Events Section**: `src/components/UpcomingEventsSection.tsx`
- **Team Section**: `src/components/TeamSection.tsx`
- **Sponsors Section**: `src/components/OurSponsorsSection.tsx`
- **Server Actions**: `src/app/ApiServerActions.ts`
- **Types**: `src/types/index.ts` (TenantSettingsDTO)
- **Admin Form**: `src/app/admin/tenant-management/components/TenantSettingsForm.tsx`
- **Admin View**: `src/app/admin/tenant-management/settings/[id]/page.tsx`

## Best Practices

1. **Always provide fallback values**: Use `?? true` to default to showing sections
2. **Cache aggressively**: Use sessionStorage to reduce API calls
3. **Graceful degradation**: Ensure page works even if backend fails
4. **Error boundaries**: Wrap conditional sections to prevent crashes
5. **Loading states**: Show appropriate loading indicators
6. **Default to visible**: Show sections by default for better UX

## Testing Scenarios

1. **All sections enabled**: Verify all three sections appear
2. **All sections disabled**: Verify none appear (except loading indicator)
3. **Mixed state**: Enable some, disable others
4. **Loading state**: Verify loading image appears correctly
5. **Cache behavior**: Test with and without cached data
6. **Error scenarios**: Test with backend unavailable
7. **Admin changes**: Verify changes reflect immediately (after cache expiry)

## Notes

- Tenant settings are tenant-specific (multi-tenant architecture)
- Settings are fetched once per session (cached for 5 minutes)
- Changes in admin panel require cache expiration to see changes (or manual cache clear)
- Loading state only affects Events and Team sections; Sponsors section waits for loading to complete
- "What We Do" and "About Foundation" sections are always shown immediately (outside loading condition)


