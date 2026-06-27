# KANJ Comparison - Quick Reference for Developers

## 🎯 TL;DR

**What we learned:** KANJ.org is a 46-year-old community organization with excellent organizational structure but basic technical features. We have superior technical capabilities but lack public-facing organizational content.

**Critical action:** Create `/polls` public page - this is the #1 gap preventing public poll participation.

---

## 📊 Side-by-Side Quick Compare

| Feature | KANJ | Us | Action Needed |
|---------|------|----|--------------| 
| Poll Voting | ❌ | ✅ | Make public accessible |
| Payment System | Basic | ✅ Advanced | None |
| Executive Team Display | ✅ | ❌ | Add organizational hierarchy |
| Calendar Page | ✅ | ❌ | Create `/calendar` page |
| Focus Groups | ✅ (4 groups) | ❌ | Optional - assess need |
| Academy/Courses | ✅ | ❌ | Optional - assess need |
| Contact Channels | ✅ (8+ emails) | ❌ | Add department routing |
| Admin Panel | Basic | ✅ Advanced | None |
| Mobile Payments | ❌ | ✅ | None |
| Multi-tenant | ❌ | ✅ | None |

---

## 🚨 Critical Issues

### Issue #1: No Public Polls Page
```bash
# Current state:
http://localhost:3000/polls         # 404 ❌
http://localhost:3000/admin/polls   # Works but requires auth ✅
http://localhost:3000/polls/[id]    # Works ✅

# Solution: Create public polls listing
# File: src/app/polls/page.tsx
# Reference: src/app/admin/polls/page.tsx (adapt for public use)
```

### Issue #2: Missing Organizational Structure
```typescript
// KANJ displays:
- 14 executive committee members with roles and photos
- 5 trustee board members
- Clear hierarchy and responsibilities

// We have:
- TeamSection component exists (src/components/TeamSection.tsx)
- But no executive structure or hierarchy

// Solution: Enhance TeamSection or create ExecutiveBoard component
```

### Issue #3: No Dedicated Calendar
```typescript
// KANJ: /calendar page with full calendar view
// We: Events scattered across homepage sections

// Solution: Create /calendar page
// Integrate with existing event system
// Use react-big-calendar or fullcalendar
```

---

## 💻 Quick Implementation Guide

### 1. Create Public Polls Page (30 mins)

```typescript
// src/app/polls/page.tsx
import { PollList } from '@/components/polls/PollList';
import { fetchEventPollsServer } from '@/app/admin/polls/ApiServerActions';

export default async function PublicPollsPage() {
  const pollsResult = await fetchEventPollsServer({
    'isActive.equals': true,
    sort: 'startDate,desc'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Polls
          </h1>
          <p className="text-lg text-gray-600">
            Participate in community decisions and share your voice
          </p>
        </div>
        <PollList initialPolls={pollsResult.data} />
      </div>
    </div>
  );
}
```

### 2. Add Calendar Page (2-3 hours)

```bash
# Install calendar library
npm install react-big-calendar date-fns

# Create calendar page
touch src/app/calendar/page.tsx

# Fetch events and display in calendar view
# Reference existing event fetching from homepage
```

### 3. Enhance Executive Team Display (1-2 hours)

```typescript
// Create src/components/ExecutiveBoard.tsx
// Fetch executive committee members from backend
// Display with hierarchy:
// - President, Vice President (top tier)
// - Secretary/Treasurer (second tier)
// - Specialized officers (third tier)
// - Trustees (separate section)
```

---

## 🗂️ File Locations Reference

### Existing Files to Review
```
src/app/admin/polls/page.tsx           # Admin polls page (adapt for public)
src/components/polls/PollList.tsx      # Reusable poll listing component
src/components/TeamSection.tsx         # Current team display
src/app/page.tsx                       # Homepage with event sections
src/app/event/[id]/page.tsx           # Event details page
```

### New Files to Create
```
src/app/polls/page.tsx                 # Public polls listing ⭐⭐⭐
src/app/calendar/page.tsx              # Full calendar view ⭐⭐⭐
src/components/ExecutiveBoard.tsx      # Org hierarchy display ⭐⭐
src/app/focus-groups/[slug]/page.tsx  # Focus groups (optional) ⭐
src/app/academy/page.tsx               # Training/courses (optional) ⭐
```

---

## 📋 Development Checklist

### Week 1: Critical Public Features
- [ ] Create `/polls` public page
- [ ] Update main navigation menu
- [ ] Add link from homepage to polls
- [ ] Test public poll viewing (no auth)
- [ ] Test poll voting (with auth)

### Week 2: Calendar & Navigation
- [ ] Install calendar library
- [ ] Create `/calendar` page
- [ ] Fetch and display all events in calendar
- [ ] Add calendar link to navigation
- [ ] Test month/week/day views

### Week 3: Organizational Structure
- [ ] Design executive board layout
- [ ] Fetch team members with roles
- [ ] Create hierarchy display component
- [ ] Add trustee board section
- [ ] Add department contact info

### Week 4: Polish & Launch
- [ ] Review all new pages for consistency
- [ ] Add breadcrumbs for navigation
- [ ] Test mobile responsiveness
- [ ] Update footer links
- [ ] Deploy to staging

---

## 🔗 API Endpoints Needed

### Already Exist
```typescript
// Polls
fetchEventPollsServer({ filters })          // ✅ Exists
fetchEventPollOptionsServer({ filters })    // ✅ Exists

// Events
// Used in homepage sections                 // ✅ Exists
```

### May Need to Create
```typescript
// Team/Executive Committee
fetchExecutiveCommitteeMembers()           // Check if exists
// Look for: src/app/admin/ApiServerActions.ts

// Calendar events
fetchAllEventsForCalendar()               // May exist in event actions
// Look for: src/app/event/ApiServerActions.ts
```

---

## 🎨 Design Considerations

### KANJ's Approach (Traditional)
- White backgrounds
- Blue accents (#0066cc)
- Formal professional photos
- Clear hierarchy with titles
- Simple card layouts

### Our Approach (Modern)
- Gradient backgrounds
- Indigo/cyan color scheme
- Glassmorphism effects
- Interactive hover states
- More vibrant and dynamic

**Recommendation:** Keep our modern design but ensure clarity and professionalism for organizational sections (executive board, trustees).

---

## 📞 Contact System Enhancement

### KANJ's Model (to emulate)
```typescript
const departments = {
  'General Information': 'info@organization.org',
  'President': 'president@organization.org',
  'IT/Website': 'itgroup@organization.org',
  'Sports': 'sports@organization.org',
  'Career Guidance': 'careercounseling@organization.org',
  // etc.
};

// Contact form should route based on inquiry type
// Each executive member should have contact info displayed
```

---

## 🚀 Quick Wins (< 1 hour each)

1. **Add "View All Polls" link** on homepage
   - Link to `/polls` (create basic page)
   
2. **Update navigation menu**
   - Add "Calendar" link
   - Add "Polls" link under Community section

3. **Add event search** on homepage
   - Simple text filter on UpcomingEventsSection

4. **Enhance footer**
   - Add department-specific contact emails
   - Link to bylaws/governance (if exists)

---

## 📚 Full Documentation

For complete analysis with all details, screenshots, and rationale:
- **Main Analysis:** `KANJ_vs_OurSite_Analysis.md`
- **Overview:** `README.md`
- **Event Competitions PRD:** `Event_Competitions_PRD.html` · `event_competitions/generic_prd.html`
- **This Guide:** `QUICK_REFERENCE.md`

---

**Last Updated:** October 22, 2025  
**Next Review:** After implementing Priority 1 features  
**Status:** 🟢 Ready for implementation

