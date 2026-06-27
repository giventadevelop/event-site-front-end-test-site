# Calendar Feature - Developer Implementation Guide

**Quick reference for developers implementing the calendar feature**

---

## 🚀 Quick Start (30 Minutes)

### Step 1: Install Dependencies

```bash
# Install required packages
npm install react-big-calendar date-fns

# Optional: Install types if using TypeScript
npm install --save-dev @types/react-big-calendar
```

### Step 2: Create File Structure

```bash
# Create calendar directory structure
mkdir -p src/app/calendar/components
mkdir -p src/app/calendar/hooks
mkdir -p src/app/calendar/utils

# Create main files
touch src/app/calendar/page.tsx
touch src/app/calendar/CalendarClient.tsx
touch src/app/calendar/components/MonthView.tsx
touch src/app/calendar/components/EventModal.tsx
touch src/app/calendar/hooks/useCalendarData.ts
touch src/app/calendar/utils/calendarHelpers.ts
```

### Step 3: Basic Calendar Page (MVP)

**File: `src/app/calendar/page.tsx`**

```typescript
import { Suspense } from 'react';
import CalendarClient from './CalendarClient';

export const metadata = {
  title: 'Events Calendar | Malayalees US',
  description: 'Browse all upcoming events in calendar view',
};

export default async function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Events Calendar
          </h1>
          <p className="text-lg text-gray-600">
            Browse all upcoming community events
          </p>
        </div>
        
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarClient />
        </Suspense>
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded mb-4"></div>
      <div className="h-96 bg-gray-200 rounded"></div>
    </div>
  );
}
```

**File: `src/app/calendar/CalendarClient.tsx`**

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { EventDetailsDTO } from '@/types';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarClient() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const params = new URLSearchParams({
        'startDate.greaterThanOrEqual': startOfMonth.toISOString().split('T')[0],
        'endDate.lessThanOrEqual': endOfMonth.toISOString().split('T')[0],
        'isActive.equals': 'true',
        sort: 'startDate,asc',
        size: '100'
      });

      const response = await fetch(`/api/proxy/event-details?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data: EventDetailsDTO[] = await response.json();
      const calendarEvents = transformToCalendarEvents(data);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  function transformToCalendarEvents(apiEvents: EventDetailsDTO[]) {
    return apiEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(`${event.startDate}T${event.startTime}`),
      end: new Date(`${event.endDate || event.startDate}T${event.endTime}`),
      resource: event, // Full event data
    }));
  }

  function handleEventClick(event: any) {
    setSelectedEvent(event.resource);
  }

  if (loading) {
    return <div className="text-center py-12">Loading calendar...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleEventClick}
        views={['month', 'week', 'day']}
        defaultView="month"
      />

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

// Simple event modal component
function EventModal({ event, onClose }: any) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <span className="mr-2">📅</span>
            <span>{event.startDate}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <span className="mr-2">🕐</span>
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center text-gray-600">
              <span className="mr-2">📍</span>
              <span>{event.location}</span>
            </div>
          )}
          
          {event.caption && (
            <p className="text-gray-600 mt-4">{event.caption}</p>
          )}
        </div>
        
        <div className="mt-6 flex gap-3">
          <a
            href={`/events/${event.id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center"
          >
            View Full Event
          </a>
          <a
            href={`/events/${event.id}/tickets`}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-center"
          >
            Buy Tickets
          </a>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Add Custom Styling

**File: `src/app/calendar/calendar-custom.css`**

```css
/* Custom calendar styling */
.rbc-calendar {
  font-family: inherit;
}

.rbc-header {
  padding: 10px 3px;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  background-color: #f3f4f6;
  border-bottom: 2px solid #e5e7eb;
}

.rbc-today {
  background-color: #eff6ff;
}

.rbc-event {
  background-color: #3b82f6;
  border-radius: 4px;
  padding: 2px 5px;
  font-size: 12px;
}

.rbc-event:hover {
  background-color: #2563eb;
  cursor: pointer;
}

.rbc-selected {
  background-color: #1d4ed8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .rbc-toolbar {
    flex-direction: column;
    gap: 10px;
  }
  
  .rbc-toolbar button {
    font-size: 12px;
    padding: 5px 10px;
  }
}
```

Import this CSS in `CalendarClient.tsx`:

```typescript
import './calendar-custom.css';
```

### Step 5: Add Navigation Link

**File: `src/components/Header.tsx` (or wherever your nav is)**

```typescript
// Add to navigation menu
<Link href="/calendar" className="nav-link">
  Calendar
</Link>
```

---

## 🎯 Phase 1: Foundation Checklist

**Week 1-2 Deliverables:**

- [ ] ✅ Install react-big-calendar and date-fns
- [ ] ✅ Create `/calendar` route
- [ ] ✅ Basic CalendarClient component
- [ ] ✅ Fetch events from API
- [ ] ✅ Transform events to calendar format
- [ ] ✅ Display month view
- [ ] ✅ Basic event click handler
- [ ] ✅ Simple event modal
- [ ] ✅ Navigation (prev/next/today)
- [ ] ✅ Custom styling
- [ ] ✅ Mobile responsive basics
- [ ] ✅ Loading states
- [ ] ✅ Error handling

---

## 🔧 Advanced Features (Phase 2+)

### Add Week & Day Views

```typescript
// In CalendarClient.tsx
<Calendar
  localizer={localizer}
  events={events}
  startAccessor="start"
  endAccessor="end"
  views={['month', 'week', 'day']}  // ✅ All views enabled
  defaultView="month"
  onView={(view) => console.log('View changed to:', view)}
  toolbar={true}  // Show view switcher
/>
```

### Add Event Filtering

```typescript
// Add filter state
const [filters, setFilters] = useState({
  category: 'all',
  location: 'all',
});

// Filter events before display
const filteredEvents = events.filter(event => {
  if (filters.category !== 'all' && event.resource.category !== filters.category) {
    return false;
  }
  if (filters.location !== 'all' && event.resource.location !== filters.location) {
    return false;
  }
  return true;
});

// Filter UI component
function CalendarFilters({ filters, onChange }) {
  return (
    <div className="flex gap-4 mb-4">
      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className="px-4 py-2 border rounded-lg"
      >
        <option value="all">All Categories</option>
        <option value="cultural">Cultural</option>
        <option value="educational">Educational</option>
        <option value="sports">Sports</option>
      </select>
      
      <select
        value={filters.location}
        onChange={(e) => onChange({ ...filters, location: e.target.value })}
        className="px-4 py-2 border rounded-lg"
      >
        <option value="all">All Locations</option>
        <option value="community-center">Community Center</option>
        <option value="online">Online</option>
      </select>
      
      <button
        onClick={() => onChange({ category: 'all', location: 'all' })}
        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        Clear Filters
      </button>
    </div>
  );
}
```

### Add Search Functionality

```typescript
// Add search state
const [searchTerm, setSearchTerm] = useState('');

// Filter by search
const searchedEvents = filteredEvents.filter(event => 
  event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  event.resource.caption?.toLowerCase().includes(searchTerm.toLowerCase())
);

// Search UI
function SearchBar({ value, onChange }) {
  return (
    <div className="relative mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search events..."
        className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
    </div>
  );
}
```

### Add Calendar Export

```typescript
// Export to iCal format
function exportEventToICal(event: EventDetailsDTO) {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Malayalees US//Events//EN
BEGIN:VEVENT
UID:${event.id}@malayalees.org
DTSTAMP:${new Date().toISOString()}
DTSTART:${event.startDate.replace(/-/g, '')}T${event.startTime.replace(/:/g, '')}00
DTEND:${(event.endDate || event.startDate).replace(/-/g, '')}T${event.endTime.replace(/:/g, '')}00
SUMMARY:${event.title}
DESCRIPTION:${event.caption || ''}
LOCATION:${event.location || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  // Trigger download
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/\s+/g, '-')}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

// Add to EventModal
<button
  onClick={() => exportEventToICal(event)}
  className="text-blue-600 hover:underline"
>
  📥 Add to Calendar
</button>
```

---

## 🎨 Customization Tips

### Change Calendar Colors

```typescript
// Custom event style prop function
function eventStyleGetter(event: any) {
  const categoryColors = {
    cultural: { backgroundColor: '#8b5cf6', color: 'white' },
    educational: { backgroundColor: '#10b981', color: 'white' },
    sports: { backgroundColor: '#ef4444', color: 'white' },
    default: { backgroundColor: '#3b82f6', color: 'white' },
  };
  
  const style = categoryColors[event.resource.category] || categoryColors.default;
  
  return {
    style: {
      ...style,
      borderRadius: '4px',
      border: 'none',
      padding: '2px 5px',
    }
  };
}

// Add to Calendar component
<Calendar
  eventPropGetter={eventStyleGetter}
  // ... other props
/>
```

### Custom Toolbar

```typescript
// Replace default toolbar with custom
<Calendar
  components={{
    toolbar: CustomToolbar,
  }}
  // ... other props
/>

function CustomToolbar({ label, onNavigate, onView, view }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <button
          onClick={() => onNavigate('PREV')}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Previous
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Next →
        </button>
      </div>
      
      <h2 className="text-xl font-bold">{label}</h2>
      
      <div className="flex gap-2">
        <button
          onClick={() => onView('month')}
          className={`px-4 py-2 rounded-lg ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Month
        </button>
        <button
          onClick={() => onView('week')}
          className={`px-4 py-2 rounded-lg ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Week
        </button>
        <button
          onClick={() => onView('day')}
          className={`px-4 py-2 rounded-lg ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Day
        </button>
      </div>
    </div>
  );
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Events Not Showing

**Problem:** Calendar loads but no events visible

**Solution:**
```typescript
// Check date format
console.log('Event start:', new Date(`${event.startDate}T${event.startTime}`));

// Ensure dates are valid
const start = new Date(`${event.startDate}T${event.startTime}`);
if (isNaN(start.getTime())) {
  console.error('Invalid date:', event);
}
```

### Issue 2: Calendar Layout Broken

**Problem:** Calendar not displaying correctly

**Solution:**
```typescript
// Import CSS before custom styles
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-custom.css';

// Set explicit height
<Calendar style={{ height: 600 }} />
```

### Issue 3: Mobile Not Responsive

**Problem:** Calendar too wide on mobile

**Solution:**
```css
/* Add to custom CSS */
@media (max-width: 768px) {
  .rbc-calendar {
    font-size: 12px;
  }
  
  .rbc-event {
    font-size: 10px;
    padding: 1px 3px;
  }
}
```

### Issue 4: Slow Performance

**Problem:** Calendar laggy with many events

**Solution:**
```typescript
// Implement pagination - load one month at a time
const [currentMonth, setCurrentMonth] = useState(new Date());

useEffect(() => {
  fetchEventsForMonth(currentMonth);
}, [currentMonth]);

// Cache fetched months
const eventCache = useRef(new Map());

async function fetchEventsForMonth(month: Date) {
  const key = `${month.getFullYear()}-${month.getMonth()}`;
  if (eventCache.current.has(key)) {
    setEvents(eventCache.current.get(key));
    return;
  }
  
  // Fetch and cache
  const events = await fetchEvents(month);
  eventCache.current.set(key, events);
  setEvents(events);
}
```

---

## ✅ Testing Checklist

### Manual Testing

- [ ] Calendar loads without errors
- [ ] Events display on correct dates
- [ ] Click event opens modal
- [ ] Modal shows correct event details
- [ ] "View Full Event" link works
- [ ] "Buy Tickets" link works
- [ ] Previous/Next navigation works
- [ ] "Today" button returns to current date
- [ ] Month/Week/Day views work
- [ ] Mobile responsive (test on real device)
- [ ] Touch interactions work (mobile)

### Edge Cases

- [ ] Handle empty events (no events for month)
- [ ] Handle API errors
- [ ] Handle loading states
- [ ] Handle events with no end date
- [ ] Handle all-day events
- [ ] Handle multi-day events
- [ ] Handle overlapping events

---

## 📚 Further Reading

- [react-big-calendar Docs](https://github.com/jquense/react-big-calendar)
- [date-fns Documentation](https://date-fns.org/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Full PRD](./Calendar_Feature_PRD.md)

---

**Happy Coding! 🎉**

