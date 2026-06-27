# Homepage Design System & UI/UX Documentation

> **Route:** `/` (`http://localhost:3000/`)
> **Source of truth:** `src/app/page.tsx` → `src/app/HomePageClient.tsx`
> **Audience:** Frontend developers, UI designers, onboarding engineers, future maintainers

This document is a section-by-section UI/UX design specification for the public homepage of the **Malayalees.US** (MCEFEE) platform. It captures layout, component composition, styling tokens, responsive behavior, interactions, and the engineering decisions behind them so the page can be rebuilt, extended, or audited with confidence.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design Goals](#2-design-goals)
3. [Technology Stack](#3-technology-stack)
4. [Layout Structure](#4-layout-structure)
5. [Header / Navbar Design](#5-header--navbar-design)
6. [Hero Section Design](#6-hero-section-design)
7. [Homepage Sections (Detailed)](#7-homepage-sections-detailed)
8. [Footer Design](#8-footer-design)
9. [Typography System](#9-typography-system)
10. [Color Palette](#10-color-palette)
11. [Spacing System](#11-spacing-system)
12. [Button Styles](#12-button-styles)
13. [Card Components](#13-card-components)
14. [Animations & Interactions](#14-animations--interactions)
15. [Responsive Breakpoints](#15-responsive-breakpoints)
16. [Accessibility Notes](#16-accessibility-notes)
17. [SEO Considerations](#17-seo-considerations)
18. [Performance Optimizations](#18-performance-optimizations)
19. [Asset Requirements](#19-asset-requirements)
20. [Suggested Folder Structure](#20-suggested-folder-structure)

---

## 1. Project Overview

The homepage is the marketing and engagement entry point for a **multi-tenant cultural & community events platform**. It blends:

- A dynamic, data-driven **hero slideshow** that rotates upcoming-event posters and standalone hero imagery.
- **Live / Featured / Upcoming event** strips that pull from the backend via authenticated proxy APIs.
- **Marketing storytelling sections** (Services, About, Causes, Projects, Testimonials).
- **Community sections** (Executive Committee/Team, Squad Roster, Sponsors) that are tenant-configurable.
- A rich **Contact** block and a comprehensive **footer**.

The page is composed almost entirely of modular React section components, orchestrated by a single client component (`HomePageClient`) over a thin server entry (`page.tsx`) that performs initial SSR data hydration for featured events.

| Attribute | Value |
|-----------|-------|
| Entry (server) | `src/app/page.tsx` |
| Orchestrator (client) | `src/app/HomePageClient.tsx` |
| Background canvas | `HomeParticleBackground` |
| Section visibility | Driven by `useTenantSettings()` flags |
| Resilience | Each data section wrapped in `<ErrorBoundary>` with fallbacks |

---

## 2. Design Goals

| Goal | How it is achieved |
|------|--------------------|
| **Immersive first impression** | Animated particle background + split-panel neon hero with Ken Burns slideshow |
| **Content freshness** | Live event/featured/upcoming data fetched from backend, cached 5 min in `sessionStorage` |
| **Performance under load** | Deferred fetching (`useDeferredFetch`), SSR hydration of featured events, image lazy-loading |
| **Graceful degradation** | `ErrorBoundary` fallbacks per section; sections render `null` while loading instead of layout shift |
| **Tenant flexibility** | Optional sections (Squad, Team, Sponsors, Events) toggle via tenant settings |
| **Brand consistency** | Shared section chrome (`HomeSectionRail`, `HomeSectionTitle`), glass-card system, neon CTA language |
| **Accessibility** | `aria-label`s on controls, semantic landmarks, focus rings, `prefers-reduced-motion` handling |

---

## 3. Technology Stack

> Assumed where not explicitly visible; confirmed where identifiable in code.

| Layer | Technology | Evidence |
|-------|-----------|----------|
| Framework | **Next.js 15+ (App Router)** | `src/app/` structure, server/client component split |
| UI library | **React 18+** | `'use client'`, hooks throughout |
| Language | **TypeScript** | `.tsx` files, typed DTOs (`EventWithMedia`, `EventMediaDTO`) |
| Styling | **Tailwind CSS** + custom CSS layer | `tailwind.config.ts`, `src/app/globals.css` |
| Animations | `tailwindcss-animate` + bespoke CSS keyframes + `requestAnimationFrame` | `tailwind.config.ts` plugins, Ken Burns / particle loops |
| Icons | **lucide-react** + inline Heroicons-style SVGs | `ArrowRight`, `Heart`, `ChevronLeft`, etc. |
| Auth | **Clerk** | `useAuth`, `useUser`, `useClerk` in Header |
| Images | **next/image** | `<Image fill priority sizes=...>` |
| Data fetching | Authenticated **proxy API routes** (`/api/proxy/*`) | Hero, events, sponsors, team fetches |
| Fonts | `next/font` (Inter) + Google Fonts (DM Serif Display, Plus Jakarta Sans) | `layout.tsx` |

---

## 4. Layout Structure

The homepage uses a **single-column, vertically-stacked section layout** layered over a fixed animated background.

```
<body class="home-page-background">
 ├── <Header />                      ← fixed, glassmorphic, 8rem (128px) tall
 ├── <HomeParticleBackground />      ← fixed canvas, z-0, decorative
 └── <main class="home-page-layout relative z-[1]">
      ├── .home-hero-viewport-filler → <HeroSection />     (full viewport)
      ├── <LiveEventsSection />        (ErrorBoundary)
      ├── <FeaturedEventsSection />    (ErrorBoundary, SSR-hydrated)
      ├── <ServicesSection />          ("What We Do")
      ├── <AboutSection />             ("About Foundation", #about-us)
      ├── <UpcomingEventsSection />    (conditional, ErrorBoundary)
      ├── <SquadRosterSection />       (conditional)
      ├── <TeamSection />              (conditional, ErrorBoundary)
      ├── <CausesSection />
      ├── <ProjectsSection />          (dark band)
      ├── <TestimonialsSection />
      ├── <OurSponsorsSection />       (conditional, ErrorBoundary)
      └── #contact                     (inline Contact section)
 └── <Footer />                       ← dark, edge-to-edge
```

**Key structural decisions**

- **Layering:** `HomeParticleBackground` sits at `z-0`; `<main>` is `relative z-[1]` so content renders above the canvas while the background remains visible through translucent sections.
- **Viewport filler:** `.home-hero-viewport-filler` forces header + hero to occupy the full first screen, preventing a "green gap" below the hero.
- **Container width:** Most sections center content with `max-w-6xl`/`max-w-7xl mx-auto` and responsive padding `px-4 sm:px-6 lg:px-8`.
- **Conditional rendering:** A `loading` gate shows a spinner only for the Upcoming Events + Team cluster; statically-known sections render immediately to improve perceived performance.
- **Resilience pattern:** Data sections are individually wrapped in `<ErrorBoundary fallback={...}>` so one failed API call never blanks the page.

---

## 5. Header / Navbar Design

**Component:** `src/components/Header.tsx` (`'use client'`)

| Property | Specification |
|----------|---------------|DD
| Position | Fixed top bar, height `--header-bar-height: 8rem` (128px) |
| Background | Glassmorphic: `var(--homepage-section-bg-glass)` `rgba(240,253,244,0.94)` with `backdrop-filter: blur(20px) saturate(180%)` |
| Scroll behavior | `.header-glass--scrolled` strengthens background to `rgba(240,253,244,0.98)` + adds `box-shadow 0 4px 20px rgba(15,23,42,0.08)` and a hairline bottom border (non-home pages) |
| Brand | "MALAYALEES.US" in **DM Serif Display**, color `#7c3aed` (purple-600), `drop-shadow`, scales `1.05` on group hover |
| Nav typography | **Plus Jakarta Sans**, `font-weight 600`, `font-size` fluid `0.9375rem → 1.0625rem` across `lg/xl/2xl` breakpoints |

**Primary navigation items:** `Home`, `About` (`/#about-us`), `Events`, `Features` (dropdown: Polls, Focus Groups, Profile, Members, Membership, MOSC), `Calendar`, `Gallery`, `Contact` (`/#contact`).

**Behaviors**

- **Smooth scroll / hash routing:** `handleSmoothScroll` intercepts `#`/`/#` links. If the user is off-route, it navigates to `/<hash>` first; for `team-section` it shows a custom navigation-loading indicator.
- **Auth-aware:** Uses Clerk (`useUser`, `useAuth`) to show profile / member links and an **Admin** submenu when `isAdminRole(...)` resolves true (server-verified `isTenantAdmin` preferred).
- **Admin submenu:** Extensive admin routes (Manage Users/Events, Analytics, QR Scanner, Membership, Bulk Email, Media, etc.) rendered only for admins.
- **Interactive states:** `--header-hover-bg`, `--header-active-bg`, `--header-focus-ring` drive hover/active/focus; nav links are `inline-flex` at fixed `2.5rem` height with `border-radius 0.5rem` and `transition all 0.25s cubic-bezier(0.4,0,0.2,1)`.

**Responsive:** Desktop horizontal nav collapses to a mobile menu (hamburger / `X` toggle via `lucide-react`). Nav link padding and font-size step down at `lg`, up at `xl`/`2xl`.

---

## 6. Hero Section Design

**Component:** `src/components/HeroSection.tsx` → inner `DynamicHeroImage`

### Purpose
A high-impact, **split-panel** hero that doubles as a live promotional surface — rotating event posters and standalone hero images, with a Kerala brand image, mission CTA, donate button, and a "browse events" link.

### Layout structure
- Root `<section class="hero-container-split hero-container-neon">` with a `hero-split-row` containing a `hero-top-row`.
- **Left column (desktop) / first (mobile):** `hero-brand-card` → Kerala backwaters image (`object-contain object-top` on mobile, `object-cover object-center` on desktop).
- **Right column (desktop) / second (mobile):** `hero-right-panel` → neon-framed slideshow (`hero-slideshow-neon-frame` → `hero-slideshow-wrapper hero-image-tilt-panel`) + decorative `hero-slideshow-particles`.
- **CTA row below images:** `hero-left-cta-card` containing the "Our Mission" thumbnail link (`/#about-us`) and a `GivebutterDonateButton` ("Donate Now" with a filled `Heart` icon).
- **Bottom:** `hero-browse-container` → "Browse all upcoming events" link with `ArrowRight`.

### Slideshow engine (`DynamicHeroImage`)
| Feature | Detail |
|---------|--------|
| Crossfade | Dual stacked layers (`hero-crossfade-stack` / `hero-crossfade-layer.is-visible`), `HERO_SLIDESHOW_CROSSFADE_MS = 420ms` — must match CSS opacity transition |
| Ken Burns | `HeroKenBurnsSlide` animates `transform: scale(1 → 1.12)` via `requestAnimationFrame` over each slide's duration (min 5s) |
| Per-image duration | Pulled from media `homePageHeroDisplayDurationSeconds` (clamped 1s–600s), default **8000ms** |
| Content selection | "4-month rule": if no events within 4 months, shows up to **24** standalone hero images; otherwise event posters first + up to **12** standalone images. Default image always appended |
| Controls | On hover/touch: Previous / Play-Pause / Next circular buttons (`hero-carousel-control`, `w-12 h-12 rounded-full`, `hover:scale-110 active:scale-95`), cyan-200 icons, `z-20` |
| Ticket overlay | `getOverlayInfo(currentEvent)` renders a clickable "Buy Tickets"/route image (`hover:scale-110`, `drop-shadow-lg`) |

### Styling notes
- **Neon aesthetic:** Gradient-ring frame around the slideshow; donate button glows via `hero-donate-button-neon` (`box-shadow 0 0 18px rgba(249,115,22,0.45)`).
- **Browse link:** `hero-browse-link-neon` — dark translucent pill `rgba(15,23,42,0.78)`, white text + text-shadow, border `rgba(255,255,255,0.28)`; on hover shifts to violet `rgba(109,40,217,0.92)` with a glow `box-shadow 0 6px 22px rgba(109,40,217,0.45)`.

### Responsive behavior
- **Mobile (`< 768px`):** Stacks brand image → slideshow → CTA → browse link vertically; touch reveals controls for 3s (`handleTouchStart`/`handleTouchInteraction`).
- **Desktop:** Two-column split (brand ~30vw, slideshow ~65vw via `sizes` hints); CTA row spans full width below.
- `prefers-reduced-motion` is respected by the tilt/3D effects elsewhere; Ken Burns uses RAF that naturally stops when inactive.

---

## 7. Homepage Sections (Detailed)

Each section is documented with **Purpose · Components · Layout · Styling · Responsive**.

### Shared section chrome
- **`HomeSectionRail`** — flex row: a left vertical eyebrow rail (`home-section-rail__aside` → `HomeSectionEyebrow`) + right content (`home-section-rail__content flex-1 min-w-0`). Default container `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`.
- **`HomeSectionTitle`** — renders `h2`/`h3` and accents the **last word** with a blue→purple gradient (`home-section-title-accent`, `linear-gradient(90deg,#2563eb,#9333ea)` clipped to text).
- **Eyebrow pill** — white rounded-full chip with a yellow `#facc15` mark and soft shadow.

---

### 7.1 Live Events Section
- **Purpose:** Horizontal strips for events flagged `isLiveEventImage`; appears 2s after load.
- **Components:** `EventStripBannerImage`, `useFilteredEvents('live')`, calendar URL builder, `formatInTimeZone`.
- **Layout:** `section` with `bg-gradient-to-r from-green-50 to-emerald-50`; stack `space-y-4 md:space-y-6`; row `flex flex-col md:flex-row h-auto md:h-[200px]`; image `h-48 md:h-full md:w-[70%]`, details panel `md:w-[30%]`.
- **Styling:** `homepage-glass-card services-glass-card-face group rounded-2xl shadow-md border border-gray-200/80`; amber decorative gradient in details panel; compact `w-7 h-7 rounded-lg` meta chips.
- **Responsive:** Single column → 70/30 horizontal split at `md`. Returns `null` while loading / not visible / empty.

### 7.2 Featured Events Section
- **Purpose:** Up to 3 homepage-featured events in a 70/30 image-to-details split with a "Featured" pill and buy-ticket overlay.
- **Components:** `HomeSectionRail`, `HomeSectionTitle`, `EventStripBannerImage variant="featured"`, `getOverlayInfo`, `useFilteredEvents('featured')`.
- **Layout:** `featured-events-section py-0 md:py-1 bg-gradient-to-b from-emerald-50/80 via-white to-emerald-50/40`; card `flex flex-col md:flex-row md:items-stretch`; media `md:w-[70%]`, details `md:w-[30%]`, hairline vertical rule between.
- **Styling:** `homepage-glass-card services-glass-card-face rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-200/60 hover:shadow-lg`; meta rows with `w-7 h-7` icon chips; actions `h-9 rounded-lg border border-emerald-200/90 bg-emerald-50`.
- **Responsive:** Stacks vertically on mobile; SSR-hydrated via `initialFeaturedEvents` for instant first paint, then client refresh.

### 7.3 Services Section ("What We Do")
- **Purpose:** Four static cultural/educational offerings (dance, art, folklore, cuisine).
- **Components:** `HomeSectionRail`, `HomeSectionTitle`, inner `CulturalGlassCard`, inline SVG icons, bottom CTA pill.
- **Layout:** `relative overflow-hidden py-24`; grid `grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12`; cards `flex items-start space-x-6` (icon well + text).
- **Styling:** `bg-gradient-to-b from-emerald-50/90 via-green-50 to-emerald-50/80` + radial overlay; glass cards (`services-glass-card-wrap/face/shine rounded-2xl`); color-coded icon wells `bg-{green|orange|blue|yellow}-100/85 backdrop-blur-sm border rounded-xl`.
- **Animations:** `IntersectionObserver` (threshold 0.12) reveal with staggered `--services-reveal-delay: index*80ms`; mouse 3D tilt (`perspective(1100px)` rotateX/Y ≤ 6°/8°); icon `group-hover:scale-110`; respects `prefers-reduced-motion`.
- **Responsive:** 1-col mobile → 2-col `md`.

### 7.4 About Section (`#about-us`)
- **Purpose:** Mission / heritage narrative copy.
- **Components:** `HomeSectionRail`, `HomeSectionTitle`, `home-section-body-text` paragraphs.
- **Layout:** `py-12 bg-green-50`; inner `flex flex-col lg:flex-row gap-12 lg:gap-16 items-start`; title column `flex-1 lg:max-w-lg`, body `flex-1 space-y-6`.
- **Styling:** Large headline `text-4xl md:text-5xl lg:text-6xl font-normal leading-tight`; body `text-base leading-relaxed text-gray-600`.
- **Responsive:** Single column → split headline/prose at `lg`.

### 7.5 Upcoming Events Section
- **Purpose:** Up to 6 upcoming events (fallback to recent past) with thumbnails, date/time/location, and ticket/register/donation CTAs.
- **Components:** `UpcomingEventGlassCard`, `EventImageWithErrorHandling`, `HomeSectionRail`, `HomeSectionTitle`, recurring-event helpers, donation/ticket helpers.
- **Layout:** `section py-16 bg-green-50`; grid `grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2`; cards `flex h-full flex-col rounded-2xl`.
- **Styling:** Per-card random pastel tint at `opacity-[0.14]`; glass stack; content area `border-t border-white/25 p-5`; metadata icons `w-14 h-14 rounded-xl bg-{blue|green|purple}-100`; admin-style action buttons `h-14 rounded-xl bg-green-100 hover:bg-green-200 hover:scale-105`.
- **Animations:** Scroll reveal + 3D tilt (same engine as Services); image `group-hover:scale-105 duration-300`.
- **Responsive:** 1-col → 2-col `lg`. Returns `null` while loading. "View all" via `hero-browse-link-neon`.

### 7.6 Squad Roster Section
- **Purpose:** Horizontal carousel of the first active team-group's members (sports/squad UX).
- **Components:** `SquadMemberCard`, response parsers; CSS-module layout (not the glass system).
- **Layout:** Full-width dark `section` (`linear-gradient(180deg,#0f172a,#1e293b)`); scroll track `display:flex gap-1rem overflow-x-auto scroll-snap-type:x mandatory`; prev/next buttons absolutely positioned at ~38% height.
- **Styling:** Uppercase eyebrow/headline; CTA link styled in module CSS.
- **Animations:** `scrollBy({ left: ±280, behavior:'smooth' })`.
- **Responsive:** Horizontal swipe/scroll with snap; nav buttons for pointer devices.

### 7.7 Team Section (Executive Committee)
- **Purpose:** Preview of up to 6 committee members (3 per row) with bio truncation, "Read more" modal, and link to `/team`.
- **Components:** `HomeSectionRail`, `HomeSectionTitle`, `Modal`, `Image`, `TeamSection.module.css`.
- **Layout:** `py-24 bg-green-50`; CSS-module flex-wrap grid (`gap-8 lg:gap-10`); fixed card `~300×820px`; photo `h-[400px] lg:h-[450px]`.
- **Styling:** Per-card gradient headers via `nth-child`; card `rounded-[2rem] shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500`; role badge `text-blue-600 bg-blue-50 px-3 py-1 rounded-full`; staggered `animationDelay: index*150ms`.
- **Animations:** Photo `group-hover:scale-105 duration-700`; card lift `hover:-translate-y-3`; modal icon `hover:scale-110`.
- **Responsive:** Wraps from 3-per-row to fewer columns on smaller widths. "Show More" uses `hero-browse-link-neon` when >6 members. Returns `null` while loading.

### 7.8 Causes Section
- **Purpose:** Three thematic "cause" cards (water, healthcare, education) — marketing template.
- **Components:** `HomeSectionRail`, `HomeSectionTitle`, plain `<img>` cards.
- **Layout:** `py-24 bg-green-50`; grid `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`.
- **Styling:** Cards `bg-white rounded-3xl overflow-hidden shadow-md`; image `w-full h-48 object-cover`.
- **Animations:** `hover:-translate-y-2 hover:shadow-2xl transition-all duration-300`.
- **Responsive:** 1 → 2 → 3 columns across `md`/`lg`.

### 7.9 Projects Section
- **Purpose:** Four project highlights on a dark band.
- **Components:** `HomeSectionRail`, `HomeSectionTitle`, glass project cards with inline accent hex colors.
- **Layout:** `home-projects-section py-24 bg-gray-800 text-white relative overflow-hidden`; grid `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`.
- **Styling:** True glassmorphism `bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6`; category pills `backgroundColor: ${color}20`; status dots `w-3 h-3 rounded-full`.
- **Animations:** `hover:-translate-y-2 hover:bg-white/15 transition-all duration-300`.
- **Responsive:** 1 → 2 → 4 columns across `md`/`lg`.

### 7.10 Testimonials Section
- **Purpose:** Featured testimonial quote with (visual-only) prev/next controls.
- **Components:** `HomeSectionRail`, `HomeSectionTitle`, glass quote card, nav buttons.
- **Layout:** `py-24 bg-green-50`; `flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-16 items-center`.
- **Styling:** `testimonials-glass-card services-glass-card-face rounded-3xl p-8 md:p-12` + shine; quote mark `text-5xl text-yellow-400`; nav `w-12 h-12 rounded-full border-2 border-yellow-400 bg-yellow-400/10`.
- **Animations:** Nav `hover:bg-yellow-400 hover:text-white hover:scale-110 duration-300`.
- **Responsive:** Stacks vertically on mobile, side-by-side at `lg`.

### 7.11 Sponsors Section
- **Purpose:** Up to 15 active sponsors in 2-column glass cards with banners, linking to `/sponsors`.
- **Components:** `HomeSectionRail`, `HomeSectionTitle`, `SponsorCard` (`bodyLayout="split"`).
- **Layout:** `section py-24 bg-green-50`; grid `grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2`.
- **Styling:** Shared glass card classes; empty/error fallback uses centered glass card.
- **Animations:** Card interactions delegated to `SponsorCard`; "See All" uses `hero-browse-link-neon`.
- **Responsive:** 1 → 2 columns at `lg`. Returns `null` while loading.

### 7.12 Contact Section (inline)
- **Purpose:** Contact information grid + social links + CTA, implemented directly in `HomePageClient`.
- **Components:** `HomeSectionRail` (eyebrow "Contact"), `homepage-glass-card` info cards with icons.
- **Layout:** `#contact py-24 bg-green-50`; container `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`; cards in `grid grid-cols-1 md:grid-cols-2`.
- **Styling:** Glass cards; icons animate `group-hover:scale-110 transition-transform duration-300`.
- **Responsive:** 1 → 2 columns at `md`.

---

## 8. Footer Design

**Component:** `src/components/Footer.tsx`

| Property | Specification |
|----------|---------------|
| Background | `bg-gray-900`, `text-gray-300`, edge-to-edge, `mt-20` |
| Layout | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12` inside `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12` |
| Column 1 | Logo + mission blurb + **tenant-driven social icons** (Facebook, Instagram, X, LinkedIn, YouTube, TikTok — each rendered only if its tenant URL exists) |
| Column 2 | "Get in Touch" — address, phones, email with `MapPin`/`Phone`/`Mail` blue-400 icons |
| Column 3 | "Quick Links" nav |
| Column 4 | "Ways to Help" nav |
| Copyright bar | `border-t border-gray-800`, flex row, links: Privacy / Terms / Accessibility |
| Social icon style | `linkBaseClass`: `w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95` + brand-colored hover bg (e.g. `hover:bg-blue-600`, `hover:bg-pink-600`) and matching focus ring |
| Link hover | `hover:text-white` (or `hover:text-blue-400`) + `hover:translate-x-1` micro-shift |

**Back-to-top button (`BackToTopButton`)**
- Appears after `pageYOffset > 300`; `fixed bottom-6 right-6 z-50`.
- `w-14 h-14` circular, `bg-blue-600 hover:bg-blue-700 active:bg-blue-800`, `shadow-xl hover:shadow-2xl`.
- `hover:scale-110 active:scale-95`, smooth `transition-all duration-300`; toggles `translate-y` + `opacity` + `visibility` for entrance/exit.
- `aria-label="Back to top"`, `touch-manipulation`, focus ring.

> ⚠️ **Maintenance note:** The footer still uses generic charity-template copy/links (e.g., "123 Charity Lane", `#about`, "© 2024 … Charity Organization"). These should be wired to tenant settings before production for the Malayalees.US brand.

---

## 9. Typography System

| Role | Font | Source | Notes |
|------|------|--------|-------|
| Base body | **Inter** | `next/font/google` (`layout.tsx`) | Default sans throughout |
| Header brand & logo | **DM Serif Display** | Google Fonts (`beforeInteractive`) | `.header-logo-brand`, `.header-logo-primary`, letter-spacing `-0.02em` |
| Header nav | **Plus Jakarta Sans** | Google Fonts | `font-weight 600`, fluid sizing |
| Tailwind tokens | `font-display`, `font-body`, `font-script` | `var(--font-*)` in `tailwind.config.ts` | Theming hooks |
| Specialized | `font-dm-sans`, `font-syro-primary` (Poppins), `font-syro-display` (Playfair) | config | Used by adjacent themed routes |

**Heading scale (homepage)**
- Section titles: `text-3xl md:text-4xl font-bold` (standard) up to `text-4xl md:text-5xl lg:text-6xl font-normal leading-tight tracking-tight` (About/hero-adjacent).
- Accent last word: blue→purple gradient text (`#2563eb → #9333ea`) with subtle white drop-shadow for legibility over imagery.
- Body copy: `home-section-body-text` / `text-base leading-relaxed text-gray-600`.

---

## 10. Color Palette

### Semantic tokens (`tailwind.config.ts`, HSL CSS variables)
| Token | Tailwind class | Purpose |
|-------|----------------|---------|
| `background` / `foreground` | `bg-background` / `text-foreground` | Base surfaces/text |
| `primary` / `secondary` | `bg-primary` etc. | Brand actions |
| `muted` / `accent` / `card` / `popover` | — | Surfaces & subtle UI |
| `destructive` | — | Errors / dangerous actions |

### Homepage section palette
| Color | Value | Usage |
|-------|-------|-------|
| Section green | `bg-green-50` / `#f0fdf4` (`--homepage-section-bg`) | Default section background |
| Emerald gradients | `from-emerald-50/90 via-green-50 to-emerald-50/80` | Services, Featured |
| Brand purple | `#7c3aed` / `#6d28d9` | Logo, hero neon hover, accent gradient |
| Title accent | `linear-gradient(90deg,#2563eb,#9333ea)` | `HomeSectionTitle` last word |
| Yellow accent | `#facc15` | Eyebrow marks, testimonial quote, donate glow tone |
| Donate orange | `rgba(249,115,22,*)` / amber | Donate button neon glow |
| Dark band | `bg-gray-800` / `#0f172a–#1e293b` | Projects, Squad, Footer |
| Cyan | `text-cyan-200` | Hero carousel control icons |

### Header CSS custom properties
`--header-accent-gradient: linear-gradient(135deg,#6d28d9,#a855f7,#f59e0b)`, `--header-bg-glass`, `--header-focus-ring: rgba(109,40,217,0.3)`.

---

## 11. Spacing System

| Scale | Typical usage |
|-------|---------------|
| Section vertical rhythm | `py-12` (About), `py-16` (Live/Upcoming), `py-24` (Services, Causes, Projects, Testimonials, Sponsors, Contact) |
| Container padding | `px-4 sm:px-6 lg:px-8` |
| Max widths | `max-w-6xl` (content rails) / `max-w-7xl` (footer, wide grids) |
| Grid gaps | `gap-6` (Projects), `gap-8` (most grids), `lg:gap-12` (Services/Footer) |
| Card padding | `p-5` (event content), `p-6` (Projects), `p-8 md:p-12` (Testimonials) |
| Header height | `--header-bar-height: 8rem` |
| Custom (themed) | `spacing.syro-*` tokens (`5px → 60px`) for sibling routes |

The system favors a **24px (`py-24`) major section rhythm** with **8px-multiple gaps**, keeping vertical cadence consistent across marketing sections.

---

## 12. Button Styles

| Button | Classes / tokens | Behavior |
|--------|------------------|----------|
| **Neon browse link** | `hero-browse-link-neon` — dark pill `rgba(15,23,42,0.78)`, white text, border `rgba(255,255,255,0.28)` | Hover → violet `rgba(109,40,217,0.92)` + glow; used for all "View all" CTAs |
| **Donate** | `GivebutterDonateButton` + `hero-donate-button-neon` | Amber/orange glow `box-shadow 0 0 18px`; filled `Heart` icon |
| **Hero carousel controls** | `hero-carousel-control w-12 h-12 rounded-full` | `hover:scale-110 active:scale-95`, cyan-200 icons, appear on hover/touch |
| **Admin-style action buttons** | `h-14 rounded-xl bg-{color}-100 hover:bg-{color}-200 hover:scale-105` (Upcoming) / `h-9 rounded-lg border bg-emerald-50` (Featured) | Ticket / Register / Calendar CTAs |
| **Back-to-top** | `w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-xl hover:shadow-2xl` | Scroll-triggered, `hover:scale-110 active:scale-95` |
| **Footer social** | `w-10 h-10 rounded-lg hover:scale-110 active:scale-95` + brand hover bg | Per-network color on hover |

**Conventions:** All interactive buttons use `transition-all duration-300`, a hover `scale` (1.05–1.10), an active `scale-95` press state, a visible focus ring (`focus:ring-2 focus:ring-offset-2`), and `title` + `aria-label`.

---

## 13. Card Components

### Glass card system (primary pattern)
- **Classes:** `homepage-glass-card services-glass-card-face` + decorative `services-glass-card-shine`.
- **Variants:** `services-glass-card-wrap` (reveal/tilt wrapper), `upcoming-events-glass-card-*`, `testimonials-glass-card`, `featured-event-card-*`.
- **Look:** Translucent white face, subtle inner shine, `rounded-2xl`/`rounded-3xl`, soft shadow, hover border/shadow lift.
- **Reveal:** `IntersectionObserver` adds `--visible` with staggered `--*-reveal-delay` (e.g., `index*80ms`).
- **Tilt:** Mouse-driven 3D `perspective(1100px) rotateX/Y` (≤ 6–8°, `translateZ` up to 26px); disabled under `prefers-reduced-motion`.

### Card archetypes
| Card | Section | Distinctive styling |
|------|---------|---------------------|
| Cultural service card | Services | Icon well + text, `flex items-start space-x-6` |
| Event card | Upcoming/Live/Featured | Banner (70%) + meta/CTAs, glass face, large `w-14 h-14` icon chips |
| Cause card | Causes | `bg-white rounded-3xl shadow-md`, `hover:-translate-y-2` |
| Project card | Projects | Dark glass `bg-white/10 backdrop-blur-md border-white/20` |
| Team card | Team | Fixed `~300×820px`, gradient header, `hover:-translate-y-3 duration-500` |
| Testimonial card | Testimonials | `rounded-3xl p-8 md:p-12`, yellow quote mark |
| Sponsor card | Sponsors | Shared `SponsorCard` split layout |

---

## 14. Animations & Interactions

| Interaction | Mechanism | Notes |
|-------------|-----------|-------|
| Particle background | `requestAnimationFrame` loop, 220 orbiting particles | DPR capped at 2; `aria-hidden`; resizes on window resize |
| Hero crossfade | Dual layer opacity transition, `420ms` | Indices managed to avoid stale frames |
| Hero Ken Burns | RAF `scale(1 → 1.12)` per slide | Min 5s duration; stops when slide inactive |
| Section reveal | `IntersectionObserver` (threshold ~0.12) + CSS class | Staggered per-card delays |
| 3D card tilt | Pointer-move → `rotateX/Y` + `translateZ` | `prefers-reduced-motion` disables |
| Hover lifts | `hover:-translate-y-2/-3`, `hover:shadow-2xl` | Causes, Projects, Team |
| Image zoom | `group-hover:scale-105` (`duration-300/700`) | Event/team imagery |
| Button micro-interactions | `hover:scale-110`, `active:scale-95` | Carousel, donate, social, back-to-top |
| Nav hash scroll | `handleSmoothScroll` + custom loading indicator | For in-page anchors and `team-section` |
| Marquee (available) | `animation: marquee-slow 30s linear infinite` | Defined in config for ticker-style use |
| Header scroll state | `.header-glass--scrolled` strengthens glass/shadow | `transition 0.35s cubic-bezier(0.4,0,0.2,1)` |

---

## 15. Responsive Breakpoints

Standard Tailwind breakpoints (plus custom themed ones in config):

| Breakpoint | Min width | Homepage behavior |
|------------|-----------|-------------------|
| (base) | 0 | Single-column stacks; hero brand → slideshow → CTA vertical; touch controls |
| `sm` | 640px | Padding `sm:px-6`; eyebrow rails switch from vertical to horizontal at/below 639px |
| `md` | 768px | Event strips become 70/30 horizontal; Services 2-col; Causes 2-col; Projects 2-col |
| `lg` | 1024px | Upcoming/Sponsors 2-col; Projects 4-col; About split headline/prose; `lg:px-8`; nav padding/font step |
| `xl` | 1280px | Nav link sizing increases |
| `2xl` | 1536px | Container caps at `1400px`; nav padding max |
| `syro-tablet` | 991px | (themed sibling routes) |
| `syro-mobile` | 576px | (themed sibling routes) |

**Hero `sizes` hints:** brand `(max-width:767px) 100vw, 30vw`; slideshow `(max-width:768px) 100vw, 65vw` — guiding `next/image` to ship right-sized assets per viewport.

---

## 16. Accessibility Notes

- **Landmarks:** `<header>`, `<main>`, `<footer role="contentinfo">`, `<nav>`, `<section aria-label="Homepage hero">`.
- **Labels:** All icon-only controls carry `aria-label` + `title` (carousel buttons, social links, back-to-top, donate, overlay link).
- **Focus management:** Visible focus rings via `focus:ring-2 focus:ring-offset-2` and `--header-focus-ring`; footer links use `focus:outline-none focus:text-white`.
- **Reduced motion:** 3D tilt and reveal motion check `prefers-reduced-motion`; decorative canvas is `aria-hidden`.
- **Touch targets:** Buttons meet ~44–56px minimums (`w-12 h-12`, `min-w-[56px]`), `touch-manipulation` on back-to-top.
- **Color contrast:** Title accent text adds white `drop-shadow` for legibility over imagery; dark sections use white text on `#0f172a`–`gray-800`.

**Recommended improvements**
- Add `alt` text fidelity for event/sponsor images (currently some generic alts).
- Ensure the testimonial carousel controls are either wired up or `aria-hidden`/disabled (currently visual-only).
- Provide skip-to-content link given the 128px fixed header.

---

## 17. SEO Considerations

- **Server entry:** `page.tsx` is a server component performing SSR data fetch (`fetchFeaturedEventsForHomepageServer`), so featured content is present in initial HTML.
- **Metadata:** Define a route-level `export const metadata` (title/description/Open Graph) on the homepage; currently fonts are configured in `layout.tsx` but homepage-specific metadata should be confirmed/added.
- **Semantic structure:** Single `<h1>`-class hero messaging + `h2` section titles support content hierarchy.
- **Crawlable links:** Internal navigation (`/events`, `/team`, `/sponsors`, `#about-us`, `#contact`) uses `next/link`.
- **Images:** `next/image` emits responsive `srcset`; ensure descriptive `alt`s for indexing.
- **Recommendations:** Add JSON-LD (`Organization`, `Event`) structured data, canonical URL, and per-tenant OG images.

---

## 18. Performance Optimizations

| Technique | Implementation |
|-----------|----------------|
| **Deferred fetching** | `useDeferredFetch(ms)` delays section data until after first paint (Hero 500ms, Featured 0ms, Upcoming 300ms, Live 500ms, Team 800ms, Sponsors 1500ms) — staggers network load |
| **SSR hydration** | Featured events fetched server-side and passed as `initialFeaturedEvents` for instant render |
| **Client caching** | `sessionStorage` per-section caches (5 min) keyed via `getHomepageCacheKey()`; hero reads cache in `useLayoutEffect` before paint |
| **No layout shift** | Data sections render `null` (not skeletons that resize) until ready; hero pre-fills viewport |
| **Image optimization** | `next/image` with `fill`, `sizes`, `priority` on above-the-fold hero/brand; `object-cover`/`object-contain` to avoid reflow |
| **Animation efficiency** | RAF loops self-cancel when inactive; particle DPR capped at 2; crossfade timeouts cleaned up to prevent leaks |
| **Error isolation** | `ErrorBoundary` per section prevents cascade failures and re-renders |
| **Conditional rendering** | Optional sections (Squad/Team/Sponsors/Events) skip work entirely when tenant flags are off |

---

## 19. Asset Requirements

| Asset | Path / Source | Notes |
|-------|---------------|-------|
| Hero brand image | `/images/hero_section/wooden-boat-under-coconut-tree-riverside_ver_2.jpg` | Kerala backwaters, `priority` |
| Hero default poster | `/images/hero_section/default_hero_section_second_column_poster.jpeg` | Always appended to rotation |
| Mission logo | `/images/logos/Malayalees_US/image.png` | "Our Mission" CTA thumbnail |
| Footer logo | Builder.io CDN URL | Should migrate to tenant asset |
| Hero/event media | Backend `event-medias` (flags: `isHomePageHeroImage`, `isHeroImage`, `isLiveEventImage`, `isFeatured`) | Resolved via `/api/proxy/event-medias` |
| Sponsor banners | `/api/proxy/event-medias?eventMediaType=SPONSOR_BANNER` | Per-sponsor |
| Team photos | `/api/proxy/executive-committee-team-members` | Portrait `object-cover object-top` |
| Testimonial photo | `/images/testimonial-samanta.jpg` | Template placeholder — replace |
| Causes images | Pexels external URLs | Template placeholders — replace |
| Overlay/ticket images | `getOverlayInfo()` | Buy-tickets / route-specific badges |

**Image guidance:** Hero posters benefit from consistent aspect ratios; standalone hero images honor `displayOrder` (admin) and `homePageHeroDisplayDurationSeconds`.

---

## 20. Suggested Folder Structure

```
src/
├── app/
│   ├── page.tsx                     # Server entry (SSR featured events)
│   ├── HomePageClient.tsx           # Client orchestrator (section order, ErrorBoundary, hash nav)
│   ├── layout.tsx                   # Root layout, fonts, providers, metadata
│   └── globals.css                  # Design tokens + bespoke homepage/hero CSS
│
├── components/
│   ├── Header.tsx                   # Fixed glass navbar (auth-aware)
│   ├── Footer.tsx                   # Dark footer + BackToTopButton
│   ├── HeroSection.tsx              # Split-panel neon hero + DynamicHeroImage
│   ├── HomeParticleBackground.tsx   # Decorative canvas background
│   │
│   ├── home/                        # (suggested) group homepage-only sections
│   │   ├── HomeSectionRail.tsx
│   │   ├── HomeSectionTitle.tsx
│   │   ├── HomeSectionEyebrow.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── CausesSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   └── TestimonialsSection.tsx
│   │
│   ├── events/                      # (suggested) event-driven sections
│   │   ├── LiveEventsSection.tsx
│   │   ├── FeaturedEventsSection.tsx
│   │   ├── UpcomingEventsSection.tsx
│   │   └── EventStripBannerImage.tsx
│   │
│   ├── community/                   # (suggested) people sections
│   │   ├── TeamSection.tsx (+ .module.css)
│   │   ├── OurSponsorsSection.tsx
│   │   └── squad/SquadRosterSection.tsx
│   │
│   └── ui/                          # Shared primitives (Modal, SponsorCard, buttons, icons)
│
├── hooks/
│   ├── usePageReady.ts              # useDeferredFetch
│   ├── useFilteredEvents.ts
│   └── useEventsData.ts
│
├── lib/
│   ├── env.ts                       # getTenantId, getAppUrl
│   ├── heroOverlay.ts               # getOverlayInfo
│   ├── eventUtils.ts                # recurring-event helpers
│   ├── homepageCacheKeys.ts         # sessionStorage cache keys
│   └── homepage/fetchFeaturedEventsServer.ts
│
└── types/                           # EventWithMedia, EventMediaDTO, etc.
```

> **Refactor suggestion:** Section components currently live flat in `src/components/`. Grouping them under `home/`, `events/`, and `community/` (as above) would improve discoverability without changing behavior — update imports in `HomePageClient.tsx` accordingly.

---

## Replicating the Design System on Subpages

The homepage look (animated purple particle field, transparent → frosted header,
purple‑glass cards, light gradient‑accent titles, transparent footer) is **not**
produced by per‑element Tailwind classes. It is driven by two `document.body`
classes plus a background component and a small set of shared CSS hooks. To make
any subpage (e.g. `/events`, `/team`, `/event-sponsors`) match the homepage,
follow this exact recipe.

### 1. Toggle the body classes (client component, `useLayoutEffect`)

```tsx
import { useLayoutEffect } from 'react';

useLayoutEffect(() => {
  // Global homepage chrome: particle field tokens, purple-glass cards,
  // transparent footer, and clearing of bg-green-50 / gradient section shells.
  document.body.classList.add('home-page-background');
  // Per-subpage hook that gives the header homepage behavior
  // (transparent at top, dark frosted on scroll). Required because
  // `header-glass--home` only applies on `/`.
  document.body.classList.add('<page>-page-background'); // e.g. events-page-background
  return () => {
    document.body.classList.remove('home-page-background');
    document.body.classList.remove('<page>-page-background');
  };
}, []);
```

- `useLayoutEffect` (not `useEffect`) avoids a flash of the default background.
- Always remove both classes on unmount so other pages are unaffected.

### 2. Render the particle background + layout wrapper

```tsx
import HomeParticleBackground from '@/components/HomeParticleBackground';

return (
  <>
    <HomeParticleBackground />
    <div className="home-page-layout relative z-[1] w-full overflow-x-hidden">
      {/* page content */}
    </div>
  </>
);
```

- The `.home-page-layout` class is **required** — nearly every glass/text CSS
  rule is scoped to `body.home-page-background .home-page-layout …`.
- `relative z-[1]` keeps content above the fixed particle canvas.

### 3. Use the shared title + eyebrow components

```tsx
import { HomeSectionEyebrow } from '@/components/HomeSectionEyebrow';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';

<HomeSectionEyebrow label="Events" />          {/* white pill + yellow mark   */}
<HomeSectionTitle>All Events</HomeSectionTitle> {/* last word gets gradient accent + halo shadow */}
```

`HomeSectionTitle` automatically splits the last word into a
`home-section-title-accent` span (blue→purple gradient) and applies the text
shadow that keeps the title legible over the dark particle field. Do **not**
hand‑roll the `<span className="bg-gradient-to-r …">` markup — it lacks the halo
and disappears into the background.

### 4. Convert cards to purple glass

Add `homepage-glass-card services-glass-card-face` to any card container. When
`body.home-page-background .home-page-layout` is active, `globals.css` swaps the
background to `var(--homepage-purple-glass-gradient)`, applies the purple border
+ shadow, and recolors descendant `text-gray-900/800/600/500` for contrast.

```tsx
<div className="homepage-glass-card services-glass-card-face rounded-2xl p-6">…</div>
```

- The base `.services-glass-card-face` rule includes `padding: 2rem`. For cards
  with an **edge‑to‑edge media/image** (like event cards), override with an inline
  `style={{ padding: 0 }}` so the image stays flush; let the inner content keep
  its own padding.
- `text-gray-700` and standalone copy sitting **directly** on the particle field
  are not covered by the default homepage rules — add a small page‑scoped block
  (see `body.events-page-background …` in `globals.css`) to recolor them
  (dark indigo inside glass cards, near‑white on the dark field).

### 5. Header & footer behavior (CSS, one‑time per subpage)

Header transparency on subpages is enabled by adding the new
`<page>-page-background` selector to the shared header rules in
`src/components/home-particle-background.css`:

```css
body.team-page-background .header-glass,
body.sponsors-page-background .header-glass,
body.events-page-background .header-glass { /* transparent at top */ }

/* …and the matching .header-glass--scrolled and ::after rules for the
   dark frosted backdrop + fade strip on scroll. */
```

The footer is already handled globally by `body.home-page-background
footer.footer-edge-to-edge …` — no per‑page work needed.

### 6. Make existing hero/section shells transparent

If the subpage has its own hero or colored section shells (e.g. a black hero or a
`bg-green-50` band), set their backgrounds to `transparent` so the particle field
shows through. `home-particle-background.css` already neutralizes
`.home-page-layout section.bg-green-50` and common gradient shells; remove or
transparent‑out any bespoke inline `backgroundColor` (and `!important` mobile
overrides) on the page.

> **Reference implementations:** `src/app/team/page.tsx` (`team-page-background`),
> `src/app/events/page.tsx` (`events-page-background`). Shared CSS lives in
> `src/app/globals.css` and `src/components/home-particle-background.css`.

---

## Appendix: Section Render Order Quick Reference

| # | Section | Source | Conditional | Data |
|---|---------|--------|-------------|------|
| 1 | Hero | `HeroSection` | Always | Hero media (deferred 500ms) |
| 2 | Live Events | `LiveEventsSection` | Always (EB) | `isLiveEventImage` events |
| 3 | Featured Events | `FeaturedEventsSection` | Always (EB) | SSR + client featured |
| 4 | Services | `ServicesSection` | Always | Static |
| 5 | About | `AboutSection` | Always | Static |
| 6 | Upcoming Events | `UpcomingEventsSection` | `showEventsSection` (EB) | Upcoming/past events |
| 7 | Squad Roster | `SquadRosterSection` | `showSquadSection` | team-groups/members |
| 8 | Team | `TeamSection` | `showExecutiveCommitteeSection` (EB) | Executive committee |
| 9 | Causes | `CausesSection` | Always | Static |
| 10 | Projects | `ProjectsSection` | Always | Static |
| 11 | Testimonials | `TestimonialsSection` | Always | Static |
| 12 | Sponsors | `OurSponsorsSection` | `showSponsorsSection` (EB) | event-sponsors |
| 13 | Contact | inline in `HomePageClient` | Always | Static |

_EB = wrapped in `ErrorBoundary` with a fallback._

---

*Generated from source analysis of `src/app/page.tsx`, `HomePageClient.tsx`, `HeroSection.tsx`, `Header.tsx`, `Footer.tsx`, `tailwind.config.ts`, `globals.css`, and all homepage section components.*
