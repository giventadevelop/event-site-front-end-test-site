/**
 * Shared nav for /mosc-redesign — aligned with design_systems/design_samples/mosc_site_re_design.json
 * Calendar submenu: see calendarNav.ts (Liturgical + MOSC calendars).
 */
export const MOSC_REDESIGN_QUICK_LINKS = [
  { label: "Spiritual Organisations", href: "/mosc-redesign/spiritual-organizations-cms" },
  { label: "Publications", href: "/mosc-redesign/publications-cms" },
  { label: "Institutions", href: "/mosc-redesign/institutions-cms" },
  { label: "Training", href: "/mosc-redesign/training-cms" },
  { label: "Theological Seminaries", href: "/mosc-redesign/theological-seminaries-cms" },
  { label: "Lectionary", href: "/mosc-redesign/lectionary" },
  { label: "Downloads", href: "/mosc-redesign/downloads" },
  { label: "Gallery", href: "/mosc-redesign/gallery" },
] as const;

/** Right-aligned main nav item with search icon (rendered separately in header). */
export const MOSC_REDESIGN_SEARCH_DIRECTORY_NAV = {
  label: "Search Directory",
  href: "/mosc-redesign/directory",
} as const;

export const MOSC_REDESIGN_NAV_LINKS = [
  { label: "Home", href: "/mosc-redesign" },
  { label: "The Catholicate", href: "/mosc-redesign/catholicate-cms" },
  { label: "Administration", href: "/mosc-redesign/administration" },
  { label: "The Church", href: "/mosc-redesign/the-church" },
  { label: "Holy Synod", href: "/mosc-redesign/holy-synod-cms" },
  { label: "Ecumenical", href: "/mosc-redesign/ecumenical-cms" },
  { label: "Dioceses", href: "/mosc-redesign/dioceses" },
  { label: "News", href: "/mosc-redesign/news" },
  { label: "Saints", href: "/mosc-redesign/saints-cms" },
] as const;

export const MOSC_REDESIGN_FOOTER_QUICK_LINKS = [
  { label: "Catholicate News", href: "/mosc-redesign/news" },
  { label: "Downloads", href: "/mosc-redesign/downloads" },
  { label: "E-Mail", href: "/mosc-redesign/contact-form-email" },
  { label: "Gallery", href: "/mosc-redesign/gallery" },
  { label: "Contact Info", href: "/mosc-redesign/contact-info" },
] as const;
