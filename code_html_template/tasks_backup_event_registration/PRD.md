# Free Event Registration System - Specialized Requirements

**Version:** 1.0
**Date:** January 2025
**Focus:** Free Events (Picnics, Community Gatherings, etc.)
**Status:** Draft

## Overview

This document focuses specifically on the requirements for **free event registration** where no payment is required. This includes community picnics, member gatherings, open house events, and other free community activities.

## Key Characteristics of Free Events

### 1. **No Payment Required**
- Registration is completely free
- No ticket types or pricing
- No payment processing integration needed
- Immediate confirmation upon registration

### 2. **Guest Management Focus**
- Primary attendee + multiple guests
- Age-based guest categorization
- Special requirements collection
- Guest relationship tracking

### 3. **Access Control Options**
- **Member-Only Events**: Restricted to existing user profiles
- **Open Events**: Anyone can register (create temporary profiles)

## Database Tables for Free Events

### Core Tables Used
```sql
-- Main event configuration
event_details (
  admission_type = 'FREE',
  is_registration_required = true,
  allow_guests = true,
  max_guests_per_attendee = 5,
  require_guest_approval = false,
  enable_guest_pricing = false
)

-- Primary attendee registration
event_attendee (
  registration_status = 'CONFIRMED',
  attendee_type = 'MEMBER' | 'GUEST_USER',
  is_guest_user = boolean,
  temporary_profile_id = string
)

-- Guest registrations
event_attendee_guest (
  age_group = 'ADULT' | 'TEEN' | 'CHILD' | 'INFANT',
  relationship = 'SPOUSE' | 'CHILD' | 'FRIEND' | 'OTHER'
)

-- User profiles (existing or temporary)
user_profile (
  user_id = string (existing user) | null,
  is_temporary = boolean,
  profile_type = 'MEMBER' | 'GUEST_USER'
)
```

## Registration Workflow for Free Events

### 1. **Event Discovery**
```
User visits events page →
Filter for "Free Events" →
Select specific event →
View event details and registration form
```

### 2. **Access Control Check**
```
IF event.is_member_only = true:
  Require user login/profile
  Redirect to login if not authenticated
ELSE:
  Allow guest registration
  Create temporary profile if needed
```

### 3. **Registration Process**
```
Primary Attendee Information:
├── Existing User: Select from profile
├── New User: Create temporary profile
└── Basic Info: Name, Email, Phone

Guest Management:
├── Add Adults (age 18+)
├── Add Teens (age 13-17)
├── Add Children (age 3-12)
├── Add Infants (age 0-2)
└── Special Requirements per guest

Confirmation:
├── No payment required
├── Immediate confirmation
├── QR code generation
└── Email confirmation
```

## Frontend Pages for Free Events

### 1. **Events Listing Page** (`/events`)
```typescript
interface EventsListingPage {
  filters: {
    eventType: 'all' | 'free' | 'paid' | 'invitation-only';
    dateRange: DateRange;
    location: string;
    search: string;
  };

  eventCards: EventCard[];

  // Special highlighting for free events
  freeEventBadge: 'FREE EVENT';
  registrationStatus: 'Open' | 'Full' | 'Closed';
}
```

### 2. **Event Details Page** (`/events/[id]`)
```typescript
interface EventDetailsPage {
  eventInfo: EventDetails;
  registrationForm: RegistrationForm;
  guestManagement: GuestManagement;
  capacityStatus: CapacityStatus;
  specialRequirements: SpecialRequirementsForm;
}
```

### 3. **Registration Form Component**
```typescript
interface RegistrationForm {
  // Primary Attendee Section
  primaryAttendee: {
    profileSelection: 'existing' | 'new';
    existingProfile?: UserProfile;
    newProfile: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  };

  // Guest Management Section
  guests: {
    adults: GuestInfo[];
    teens: GuestInfo[];
    children: GuestInfo[];
    infants: GuestInfo[];
  };

  // Special Requirements
  specialRequirements: {
    dietary: string[];
    accessibility: string[];
    medical: string[];
    other: string;
  };

  // Terms and Conditions
  termsAccepted: boolean;
}
```

### 4. **Guest Management Interface**
```typescript
interface GuestManagement {
  // Guest Counter Interface
  guestCounts: {
    adults: number;
    teens: number;
    children: number;
    infants: number;
  };

  // Individual Guest Details
  guestDetails: GuestDetail[];

  // Guest Form
  addGuest: (ageGroup: AgeGroup) => void;
  removeGuest: (guestId: string) => void;
  updateGuest: (guestId: string, data: Partial<GuestInfo>) => void;
}
```

## API Endpoints for Free Events

### 1. **Event Management**
```typescript
// Get free events only
GET /api/events?admission_type=FREE&is_active=true

// Get event details
GET /api/events/:id

// Create free event
POST /api/events
{
  admission_type: 'FREE',
  allow_guests: true,
  max_guests_per_attendee: 5,
  require_guest_approval: false,
  is_member_only: false // or true for restricted events
}
```

### 2. **Registration (No Payment)**
```typescript
// Register for free event
POST /api/events/:id/register
{
  attendee: {
    profileType: 'existing' | 'new';
    existingUserId?: string;
    newProfile?: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    specialRequirements?: string;
  };

  guests: [
    {
      firstName: string;
      lastName: string;
      ageGroup: 'ADULT' | 'TEEN' | 'CHILD' | 'INFANT';
      relationship: 'SPOUSE' | 'CHILD' | 'FRIEND' | 'OTHER';
      specialRequirements?: string;
    }
  ];

  termsAccepted: boolean;
}

// Response
{
  success: true;
  registrationId: string;
  qrCodeData: string;
  qrCodeUrl: string;
  confirmationEmail: string;
  guestCount: number;
}
```

### 3. **Guest Management**
```typescript
// Get guest statistics for event
GET /api/events/:id/guest-stats
{
  totalRegistrations: number;
  totalAttendees: number;
  guestBreakdown: {
    adults: number;
    teens: number;
    children: number;
    infants: number;
  };
  capacityUtilization: number;
  specialRequirements: {
    dietary: string[];
    accessibility: string[];
    medical: string[];
  };
}

// Update guest information
PUT /api/registrations/:id/guests/:guestId
{
  firstName?: string;
  lastName?: string;
  ageGroup?: AgeGroup;
  relationship?: string;
  specialRequirements?: string;
}
```

## Business Rules for Free Events

### 1. **Registration Rules**
- **Capacity Limits**: Maximum total attendees (primary + guests)
- **Guest Limits**: Maximum guests per primary attendee (configurable per event)
- **Registration Deadline**: Cut-off date for sign-ups
- **Waitlist Management**: Handle capacity overflow gracefully

### 2. **Access Control Rules**
- **Member Events**: Require existing user profile and authentication
- **Open Events**: Allow temporary profile creation for non-members
- **Guest Users**: Create minimal profile with basic information
- **Profile Cleanup**: Archive temporary profiles after event completion

### 3. **Guest Management Rules**
- **Age Groups**: Automatic categorization based on age
- **Relationship Tracking**: Map guest relationships to primary attendee
- **Special Requirements**: Collect and track dietary, accessibility, medical needs
- **Guest Limits**: Enforce per-event guest limits

## User Experience for Free Events

### 1. **Simple Registration Flow**
```
Step 1: Event Selection
├── Clear "FREE EVENT" badge
├── Event details and description
├── Guest policy information
└── Registration button

Step 2: Attendee Information
├── Profile selection (existing/new)
├── Basic information collection
├── Special requirements
└── Continue to guests

Step 3: Guest Management
├── Guest counter interface
├── Individual guest details
├── Age group selection
└── Special requirements per guest

Step 4: Confirmation
├── Registration summary
├── QR code generation
├── Email confirmation
└── Event reminders
```

### 2. **Guest Management Interface**
- **Visual Guest Counter**: Easy addition/removal of guests
- **Age Group Selection**: Clear categorization (Adult, Teen, Child, Infant)
- **Relationship Mapping**: Dropdown for guest relationships
- **Bulk Operations**: Add multiple guests of same type
- **Special Requirements**: Per-guest special needs collection

### 3. **Mobile Optimization**
- **Touch-Friendly**: Large buttons and form elements
- **Progressive Disclosure**: Show relevant fields based on selections
- **Auto-Save**: Save progress as user fills form
- **Offline Capability**: Basic form functionality without internet

## Admin Features for Free Events

### 1. **Event Management Dashboard**
```typescript
interface EventManagementDashboard {
  // Event Overview
  eventSummary: {
    totalRegistrations: number;
    totalAttendees: number;
    capacityUtilization: number;
    registrationTrends: ChartData;
  };

  // Guest Analytics
  guestAnalytics: {
    ageGroupDistribution: PieChart;
    relationshipBreakdown: BarChart;
    specialRequirements: SummaryTable;
  };

  // Registration Management
  registrations: RegistrationList;
  waitlist: WaitlistManagement;
  capacityAlerts: AlertSystem;
}
```

### 2. **Registration Management**
- **View All Registrations**: Complete attendee and guest lists
- **Export Functionality**: CSV/Excel export for event planning
- **Capacity Monitoring**: Real-time registration counts
- **Waitlist Management**: Handle overflow registrations

### 3. **Guest Analytics**
- **Demographics**: Age group and relationship analysis
- **Special Requirements**: Summary of dietary, accessibility, medical needs
- **Registration Patterns**: Peak registration times and trends
- **Capacity Planning**: Data for future event planning

## Implementation Considerations

### 1. **Performance Optimization**
- **Database Indexing**: Optimize queries for free event lookups
- **Caching**: Cache event details and capacity information
- **Lazy Loading**: Load guest details on demand
- **Batch Operations**: Handle multiple guest additions efficiently

### 2. **Security Considerations**
- **Data Validation**: Validate all guest information
- **Rate Limiting**: Prevent registration spam
- **Profile Isolation**: Ensure tenant data separation
- **Audit Logging**: Track all registration changes

### 3. **Scalability Planning**
- **Database Design**: Handle large numbers of guest records
- **API Performance**: Optimize for high registration volumes
- **Storage Management**: Efficient handling of temporary profiles
- **Cleanup Processes**: Automated cleanup of expired data

## Success Metrics for Free Events

### 1. **Registration Metrics**
- **Completion Rate**: > 95% (no payment barrier)
- **Guest Addition Rate**: > 2.5 guests per primary attendee
- **Registration Speed**: < 3 minutes for complete registration
- **Mobile Usage**: > 70% (community events often mobile-first)

### 2. **User Experience Metrics**
- **Form Abandonment**: < 5%
- **Guest Management Ease**: User satisfaction > 4.5/5
- **Mobile Performance**: Page load time < 2 seconds
- **Error Rate**: < 1% during registration

### 3. **Business Impact Metrics**
- **Event Participation**: 25% increase in total attendees
- **Admin Efficiency**: 50% reduction in manual processing
- **Data Quality**: 90% complete guest information
- **Community Engagement**: Higher repeat event participation

## Conclusion

The free event registration system provides a streamlined, user-friendly experience for community events where payment is not required. The focus on guest management, flexible access control, and comprehensive analytics makes it ideal for picnics, community gatherings, and other free activities.

The system's simplicity encourages higher participation rates while providing organizers with the data and tools needed for effective event planning and management.

### Key Benefits
1. **Higher Participation**: No payment barrier increases registration rates
2. **Better Guest Management**: Comprehensive guest tracking and analytics
3. **Flexible Access**: Support for both member-only and open events
4. **Mobile-First Design**: Optimized for community event registration
5. **Comprehensive Analytics**: Data-driven event planning and improvement

---

**Document Control**
- **Version**: 1.0
- **Last Updated**: January 2025
- **Next Review**: February 2025
- **Related Documents**: [Main PRD](./PRD.md)
