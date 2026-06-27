# Hero Section (Section 2) – Why an image is not displayed

## Your setup

- **Event:** id 8321, "Fundraiser Registration Required", start_date **2026-03-26**
- **Media:** id 8320, "Dinner_Fundraiser"
  - `is_hero_image` = true  
  - `is_home_page_hero_image` = true  
  - **`start_displaying_from_date` = '2026-03-26'** (March 26, 2026)

The image **does** show in the upcoming events section but **does not** show in the hero slideshow (Section 2).

---

## Root cause: `start_displaying_from_date` is in the future

The hero section only shows media when **Start Displaying From Date** is either:

- **null**, or  
- **today or in the past** (display date ≤ today).

That rule is applied in two places:

1. **`useFilteredEvents('hero')`**  
   File: `src/hooks/useFilteredEvents.ts`  
   - Builds the list of events that are eligible for the hero.
   - For each event’s media it keeps only items where:
     - `isHomePageHeroImage === true`, and  
     - `startDisplayingFromDate` is missing **or** parsed date **≤ today**.
   - If no media pass this filter, the event is not used in the hero at all.

2. **`isHeroMediaDisplayDateValid()`**  
   File: `src/components/HeroSection.tsx`  
   - Used when building the list of **standalone** hero images (media with no event).
   - Same rule: show only when `start_displaying_from_date` is null or ≤ today.

Your media has **`start_displaying_from_date = '2026-03-26'`**.  
So:

- **Today** (e.g. 2026-02-24) **<** 2026-03-26  
- The media is **correctly excluded** from the hero until 2026-03-26.

So the “not displayed in Section 2” behavior is exactly what the current business rule implements: **do not show hero images whose “start displaying” date is in the future.**

---

## Why it still appears in “Upcoming events”

- Upcoming events are driven by **event** dates (e.g. `start_date`) and event-level flags (e.g. featured).
- They do **not** use the hero rule “startDisplayingFromDate ≤ today” for that media.
- So the same event (8321) and its image can show in upcoming events while the same image is correctly hidden from the hero until 2026-03-26.

---

## How to get the image to show in the hero **now**

To have this image appear in the hero slideshow immediately, the media row must satisfy the rule above. Either:

**Option A – No date (show immediately)**  
Set **Start Displaying From Date** to empty/null:

```sql
UPDATE public.event_media
SET start_displaying_from_date = NULL, updated_at = NOW()
WHERE id = 8320;
```

**Option B – A date today or in the past**  
Set **Start Displaying From Date** to today or any past date, e.g.:

```sql
UPDATE public.event_media
SET start_displaying_from_date = '2026-02-24', updated_at = NOW()
WHERE id = 8320;
```

After either change, the next time the hero is built (e.g. refresh the homepage), event 8321 will have at least one hero-eligible media and the image will be included in Section 2.

---

## Summary

| What you have | Effect |
|---------------|--------|
| `start_displaying_from_date = '2026-03-26'` | Hero logic treats it as “start showing on March 26, 2026”, so it is **not** shown until that date. |
| Same event/media used for “Upcoming events” | Shown there because that section does not use the hero display-date rule. |

**Cause:** The image is not shown in Section 2 because of the **Start Displaying From Date** rule, not because of `is_hero_image` / `is_home_page_hero_image` (those are set correctly).  
**Fix:** Set `start_displaying_from_date` to **NULL** (or to a date ≤ today) if you want this image to appear in the hero slideshow now.
