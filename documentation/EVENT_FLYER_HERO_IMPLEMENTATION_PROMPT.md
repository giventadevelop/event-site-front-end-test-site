# Event Flyer Hero Section Implementation Prompt

## **Current Implementation Analysis from Home Page:**

The home page (`src/app/page.tsx`) implements a sophisticated event flyer-based hero image system that dynamically displays event images in the hero section. Here's how it works:

## **API Calls and Data Flow:**

### 1. **Primary Event Fetching**
```typescript
// Fetches all events with sorting
const eventsResponse = await fetch(
  `${baseUrl}/api/proxy/event-details?sort=startDate,asc`,
  { cache: 'no-store' }
);
```

### 2. **Event Media Fetching (Two-Phase Approach)**
```typescript
// Phase 1: Try to fetch event flyers first
const flyerRes = await fetch(
  `${baseUrl}/api/proxy/event-medias?eventId.equals=${event.id}&eventFlyer.equals=true`,
  { cache: 'no-store' }
);

// Phase 2: Fallback to featured images if no flyers found
const featuredRes = await fetch(
  `${baseUrl}/api/proxy/event-medias?eventId.equals=${event.id}&isFeaturedImage.equals=true`,
  { cache: 'no-store' }
);
```

## **Core Logic Implementation:**

### 1. **Event Filtering and Prioritization**
```typescript
// Find upcoming events within 3 months
const upcomingEvents = events
  .filter(event => event.startDate && new Date(event.startDate) >= today)
  .sort((a, b) => {
    const aDate = a.startDate ? new Date(a.startDate).getTime() : Infinity;
    const bDate = b.startDate ? new Date(b.startDate).getTime() : Infinity;
    return aDate - bDate;
  });
```

### 2. **Hero Image Selection Logic**
```typescript
// Priority 1: Use thumbnail from upcoming events (if within 3 months)
if (eventDate && eventDate <= threeMonthsFromNow && event.thumbnailUrl) {
  heroImageUrl = event.thumbnailUrl;
  nextEvent = event;
}

// Priority 2: Fetch hero image from event media API
const heroUrl = await fetchHeroImageForEvent(candidateEvent.id!);
if (heroUrl) {
  heroImageUrl = heroUrl;
}

// Priority 3: Fallback to default image
heroImageUrl = "/images/side_images/chilanka_2025.webp";
```

### 3. **Media Processing and Fallbacks**
```typescript
// Process media arrays with error handling
const mediaArray = Array.isArray(flyerData) ? flyerData : (flyerData ? [flyerData] : []);

// Extract file URL and alt text
if (mediaArray.length > 0) {
  const fileUrl = mediaArray[0].fileUrl;
  return {
    ...event,
    thumbnailUrl: fileUrl,
    placeholderText: mediaArray[0].altText || event.title
  };
}
```

## **Required Implementation for Charity Theme:**

### 1. **Create Event Media Fetching Functions**
```typescript
// Fetch events with media
async function fetchEventsWithMedia(): Promise<EventWithMedia[]>

// Fetch hero image for specific event
async function fetchHeroImageForEvent(eventId: number): Promise<string | null>
```

### 2. **Implement Hero Image Selection Logic**
```typescript
// Determine hero image based on upcoming events
const today = new Date();
const threeMonthsFromNow = new Date();
threeMonthsFromNow.setMonth(today.getMonth() + 3);

// Find next event with valid media
const upcomingEvents = events
  .filter(event => event.startDate && new Date(event.startDate) >= today)
  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
```

### 3. **API Endpoints Required**
- **Events**: `/api/proxy/event-details?sort=startDate,asc`
- **Event Flyers**: `/api/proxy/event-medias?eventId.equals=${id}&eventFlyer.equals=true`
- **Featured Images**: `/api/proxy/event-medias?eventId.equals=${id}&isFeaturedImage.equals=true`

### 4. **Data Types and Interfaces**
```typescript
interface EventWithMedia extends EventDetailsDTO {
  thumbnailUrl?: string;
  placeholderText?: string;
}
```

## **Expected Behavior:**

1. **Page Load**: Show default hero image
2. **Data Fetching**: Fetch events and their associated media
3. **Image Selection**: Choose hero image based on upcoming events (within 3 months)
4. **Priority Order**: Event Flyer → Featured Image → Default Image
5. **Dynamic Updates**: Hero image changes based on event schedule

## **Error Handling Requirements:**

- **Timeout Protection**: 10-second timeout for media API calls
- **Graceful Degradation**: Fallback to default image if APIs fail
- **Partial Failures**: Handle individual event media failures without breaking the entire system
- **Cache Management**: Use `cache: 'no-store'` for fresh data

## **Performance Considerations:**

- **Parallel Processing**: Use `Promise.allSettled` for concurrent media fetching
- **Abort Controllers**: Implement request cancellation for timeouts
- **Efficient Filtering**: Sort events once and filter efficiently
- **Memory Management**: Clean up timers and intervals properly

## **Implementation Steps:**

1. **Copy the fetchEventsWithMedia function** from home page
2. **Copy the fetchHeroImageForEvent function** from home page
3. **Implement the hero image selection logic** in charity theme
4. **Add proper error handling** and fallbacks
5. **Integrate with existing DynamicHeroImage component**
6. **Test the complete flow** from API calls to image display

This system ensures the hero section always displays relevant, up-to-date event imagery while maintaining performance and reliability.

