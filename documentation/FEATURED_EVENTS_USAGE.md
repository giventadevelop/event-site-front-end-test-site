# Featured Events and Featured Event Images - Usage Guide

## Overview

Featured Events are special events that are prominently displayed on the homepage in a dedicated section. They are designed to highlight important or upcoming events with special visual treatment. Featured Event Images are the specific media files marked with the `isFeaturedEventImage` flag that are used to display these events.

## Purpose

Featured Events serve the following purposes:

1. **Prominent Event Highlighting**: Showcase important or special events in a visually distinct section
2. **Homepage Visibility**: Provide immediate visibility to key events without requiring users to navigate to the events page
3. **Visual Appeal**: Use high-quality images (1920×1080px, 16:9 aspect ratio) for optimal display
4. **Event Promotion**: Help promote specific events that organizers want to emphasize

## Where Featured Events Are Used

### 1. **Homepage - Featured Events Section**

**Location**: `src/components/FeaturedEventsSection.tsx`
**Page**: Homepage (`src/app/page.tsx`)

**Display Position on Homepage:**
```
1. HeroSection (top of page)
2. Site Banner (MOSC-TEMP banner)
3. LiveEventsSection
4. FeaturedEventsSection ← HERE
5. ServicesSection ("What We Do")
6. AboutSection ("About Foundation")
7. UpcomingEventsSection (conditional)
8. TeamSection (conditional)
```

**Visual Appearance:**
- **Background**: Gradient from blue-50 to indigo-50
- **Section Title**: "Featured Events" (bold, large text)
- **Card Layout**: Each featured event displayed in a card with:
  - **Left side (60% width on desktop)**: Featured event image (1920×1080px recommended)
  - **Right side (40% width on desktop)**: Event details (title, date, time, location, "See More Details" button)
  - **Badge**: "Featured Event" badge overlay on the image (top-left corner, blue with white dot)
- **Responsive**: Stacks vertically on mobile, horizontal on desktop
- **Hover Effect**: Cards have shadow elevation on hover

**Code Location:**
```typescript
// src/app/page.tsx (line ~119)
<ErrorBoundary fallback={<EventsFallback />}>
  <FeaturedEventsSection />
</ErrorBoundary>
```

### 2. **Data Filtering Hook**

**Location**: `src/hooks/useFilteredEvents.ts`

**How It Works:**
- Uses the `useFilteredEvents('featured')` hook
- Filters events to find those with media marked as `isFeaturedEventImage = true`
- Respects the `startDisplayingFromDate` field to only show events that should be displayed
- Returns filtered events with their associated featured images

**Filtering Logic:**
```typescript
case 'featured':
  hasCorrectFlag = mediaItem.isFeaturedEventImage === true;
  break;
```

### 3. **Media Upload/Management Pages**

**Locations:**
- `src/app/admin/events/[id]/media/MediaClientPage.tsx` (Main upload page)
- `src/app/admin/events/[id]/media/list/page.tsx` (Media list/edit page)
- `src/app/admin/media/page.tsx` (Global media management)

**Checkbox Label**: "Featured Event Image"

**When Uploading:**
- When uploading an image for an event, check the "Featured Event Image" checkbox
- This sets `isFeaturedEventImage = true` on the media record
- The image will then be eligible to appear in the Featured Events section

**Image Specifications for Featured Events:**
- **Recommended Dimensions**: 1920×1080px (16:9 aspect ratio)
- **Mobile**: 800×450px (16:9 aspect ratio)
- **Format**: WebP preferred, JPG acceptable
- **Quality**: 85-90%
- **File Size**: Under 500KB

## Technical Implementation Details

### Data Structure

**Event Details DTO:**
```typescript
interface EventDetailsDTO {
  id: number;
  title: string;
  startDate: string;
  startTime?: string;
  location?: string;
  timezone?: string;
  isFeaturedEvent: boolean; // Event-level flag
  featuredEventPriorityRanking: number;
  // ... other fields
}
```

**Event Media DTO:**
```typescript
interface EventMediaDTO {
  id: number;
  eventId: number;
  fileUrl: string;
  altText?: string;
  isFeaturedEventImage: boolean; // Media-level flag (THIS IS WHAT WE USE)
  startDisplayingFromDate?: string;
  // ... other fields
}
```

### Key Distinction

**Important**: There are TWO related but separate concepts:

1. **`isFeaturedEvent`** (Event-level flag): A boolean on the event itself indicating it's a featured event
   - Used for general event categorization
   - Location: `src/components/EventForm.tsx`
   - Can be set when creating/editing events

2. **`isFeaturedEventImage`** (Media-level flag): A boolean on the media file indicating it should be used in the Featured Events section
   - **THIS IS WHAT THE HOMEPAGE USES**
   - Must be checked when uploading/editing media
   - Determines which images appear in `FeaturedEventsSection`

### Display Conditions

For an event to appear in the Featured Events section:

1. **Media Requirement**: The event must have at least one media item with `isFeaturedEventImage = true`
2. **Display Date**: The media's `startDisplayingFromDate` must be today or in the past (not in the future)
3. **Image Available**: The media must have a valid `fileUrl`

### Rendering Behavior

**Component**: `FeaturedEventsSection.tsx`

- **Loading State**: Returns `null` if data is still loading
- **Empty State**: Returns `null` if no featured events found
- **Visibility Delay**: Section appears 2 seconds after data is loaded (same timing as HeroSection)
- **Error Handling**: Wrapped in `ErrorBoundary` on homepage to prevent page crashes

**Rendering Details:**
```typescript
// Shows section 2 seconds after data loads
useEffect(() => {
  if (!isLoading && filteredEvents.length > 0) {
    setTimeout(() => {
      setIsVisible(true);
    }, 2000);
  }
}, [isLoading, filteredEvents.length]);
```

## Image Specifications

### Recommended Dimensions

**Desktop:**
- Width: 1920px
- Height: 1080px
- Aspect Ratio: 16:9

**Mobile:**
- Width: 800px
- Height: 450px
- Aspect Ratio: 16:9 (maintained)

### Format and Quality

- **Format**: WebP preferred, JPG acceptable
- **Quality**: 85-90%
- **File Size**: Under 500KB

### Why 16:9 Aspect Ratio?

The 16:9 aspect ratio ensures:
- Images fill the container perfectly without padding
- Consistent appearance across all screen sizes
- Optimal display in the horizontal card layout
- Professional, modern look

**Reference**: See the "Featured Event Image Specifications" section in `src/app/admin/events/[id]/media/MediaClientPage.tsx`

## How to Set Up Featured Events

### Step-by-Step Process

1. **Create or Edit Event**
   - Navigate to event management
   - Optionally check "Featured Event" checkbox on the event itself (not required for display)

2. **Upload Featured Event Image**
   - Go to `/admin/events/[id]/media`
   - Upload an image (recommended: 1920×1080px)
   - **Check the "Featured Event Image" checkbox** ⚠️ (Required)
   - Set "Start Displaying From Date" if you want to schedule when it appears
   - Fill in Alt Text for accessibility
   - Click "Upload Images"

3. **Verify Display**
   - Visit the homepage
   - Scroll down past the hero section and live events
   - The Featured Events section should appear with your event

### Admin Interface

**Checkbox Location:**
- In the upload form grid (3x3 checkbox grid)
- Label: "Featured Event Image"
- Position: One of the custom grid cells alongside other media type checkboxes

**Other Checkboxes in Same Grid:**
- Event Flyer
- Official Document
- Hero Image
- Active Hero Image
- Featured Event Image ← **This one**
- Live Event Image
- Home Page Hero Image
- Public

## Differences from Other Event Types

### Featured Events vs. Hero Images

| Feature | Featured Events | Hero Images |
|---------|----------------|-------------|
| **Flag** | `isFeaturedEventImage` | `isHomePageHeroImage` |
| **Location** | Featured Events section (below hero) | Hero section (top of page) |
| **Image Size** | 1920×1080px (16:9) | 800×1200px (2:3) |
| **Display Style** | Horizontal card with details | Full-width rotating banner |
| **Selection Criteria** | Future events with featured image flag | Future events within 3 months, active status |

### Featured Events vs. Live Events

| Feature | Featured Events | Live Events |
|---------|----------------|-------------|
| **Flag** | `isFeaturedEventImage` | `isLiveEventImage` |
| **Badge** | "Featured Event" (blue) | "Live Event" (red) |
| **Purpose** | General event promotion | Events currently happening or streaming |
| **Display** | Same card layout | Same card layout |

### Featured Events vs. Upcoming Events

| Feature | Featured Events | Upcoming Events |
|---------|----------------|-----------------|
| **Selection** | Manual (checkbox) | Automatic (future dates) |
| **Display** | Horizontal card layout | Grid layout with thumbnails |
| **Control** | Admin-controlled via checkbox | System-controlled by date |
| **Visibility** | Always shown if has featured image | Controlled by tenant settings |

## Troubleshooting

### Featured Event Not Showing

**Possible Causes:**

1. **Checkbox Not Checked**
   - Verify "Featured Event Image" checkbox is checked when uploading
   - Check the media list to confirm `isFeaturedEventImage = true`

2. **Display Date in Future**
   - Check `startDisplayingFromDate` field
   - Must be today or in the past

3. **No Image URL**
   - Verify the media has a valid `fileUrl`
   - Check that the upload completed successfully

4. **Event Not Active**
   - Featured events section will show regardless, but ensure event is active for consistency

### Image Quality Issues

**Solutions:**

1. **Use Recommended Dimensions**
   - Resize to 1920×1080px using image resizer tool
   - Maintain 16:9 aspect ratio

2. **Optimize File Size**
   - Compress to under 500KB
   - Use WebP format when possible
   - Quality 85-90%

3. **Check Image Display**
   - Verify image displays correctly in the admin preview
   - Test on different screen sizes

## Related Documentation

- [Image Resizing Guide](./IMAGE_RESIZING_GUIDE.md) - How to resize images before upload
- [Hero Section Image Specifications](./HERO_SECTION_IMAGE_SPECIFICATIONS.md) - Hero image requirements
- [Homepage Conditional Sections](./HOMEPAGE_CONDITIONAL_SECTIONS.md) - How sections appear/disappear

## Code References

**Components:**
- `src/components/FeaturedEventsSection.tsx` - Main featured events display component
- `src/app/page.tsx` - Homepage layout and section ordering

**Hooks:**
- `src/hooks/useFilteredEvents.ts` - Data filtering logic for featured events
- `src/hooks/useEventsData.ts` - Base data fetching hook

**Admin Pages:**
- `src/app/admin/events/[id]/media/MediaClientPage.tsx` - Upload page with checkbox
- `src/app/admin/events/[id]/media/list/page.tsx` - Edit existing media

**Types:**
- `src/types/index.ts` - TypeScript definitions for `EventDetailsDTO` and `EventMediaDTO`

---

**Last Updated**: January 2025
**Maintained By**: Development Team


