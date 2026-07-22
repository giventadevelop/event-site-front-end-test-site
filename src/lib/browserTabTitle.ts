/**
 * Builds distinct browser tab titles from the URL path so Chrome/Edge tab search
 * and hover tooltips can identify pages when many tabs are open.
 */

const MOSC_BRAND = 'Malankara Orthodox Syrian Church';
const APP_BRAND = 'Event Site Manager';
const ADMIN_BRAND = 'Admin';

/** Known path segments → searchable labels (keywords for tab search / hover). */
const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  'manage-usage': 'Manage Users',
  'manage-events': 'Manage Events',
  'tenant-management': 'Tenant Management',
  settings: 'Settings',
  organizations: 'Organizations',
  'newsletter-emails': 'Newsletter Emails',
  'bulk-email': 'Bulk Email',
  'event-emails': 'Event Emails',
  'whatsapp-settings': 'WhatsApp Settings',
  gallery: 'Gallery',
  media: 'Media',
  events: 'Events',
  tickets: 'Tickets',
  'ticket-types': 'Ticket Types',
  'discount-codes': 'Discount Codes',
  sponsors: 'Sponsors',
  membership: 'Membership',
  plans: 'Plans',
  subscriptions: 'Subscriptions',
  profile: 'Profile',
  pricing: 'Pricing',
  polls: 'Polls',
  calendar: 'Calendar',
  downloads: 'Downloads',
  'application-forms': 'Application Forms',
  categories: 'Categories',
  'prayer-books': 'Prayer Books',
  pdfs: 'PDFs',
  photos: 'Photos',
  team: 'Team',
  writings: 'Writings',
  about: 'About',
  contact: 'Contact',
  'sign-in': 'Sign In',
  'sign-up': 'Sign Up',
  'mosc-redesign': 'MOSC',
  mosc: 'MOSC',
  'saints-cms': 'Saints & Blessed',
  saints: 'Saints',
  'holy-synod-cms': 'Holy Synod',
  'holy-synod': 'Holy Synod',
  directory: 'Directory',
  dioceses: 'Dioceses',
  news: 'News',
  'kalpana-cms': 'Kalpana',
  kalpana: 'Kalpana',
  'institutions-cms': 'Institutions',
  institutions: 'Institutions',
  'spiritual-organizations-cms': 'Spiritual Organizations',
  'spiritual-organizations': 'Spiritual Organizations',
  'publications-cms': 'Publications',
  publications: 'Publications',
  'training-cms': 'Training',
  training: 'Training',
  'theological-seminaries-cms': 'Theological Seminaries',
  'theological-seminaries': 'Theological Seminaries',
  'pilgrim-centres': 'Pilgrim Centres',
  'the-church': 'The Church',
  ecumenical: 'Ecumenical',
  'liturgical-calendar': 'Liturgical Calendar',
  lectionary: 'Lectionary',
  'mosc-calendar': 'MOSC Calendar',
  'contact-form-email': 'Contact Form Email',
  'privacy-policy': 'Privacy Policy',
  'terms-of-use': 'Terms of Use',
  catholicate: 'Catholicate',
  'photo-gallery': 'Photo Gallery',
  'creator-analytics': 'Creator Analytics',
  email: 'Email',
  'downloads-old': 'Downloads (Legacy)',
  edit: 'Edit',
  new: 'New',
  list: 'List',
  view: 'View',
  checkout: 'Checkout',
  register: 'Register',
  success: 'Success',
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  reports: 'Reports',
  albums: 'Albums',
  'gas-station': 'Gas Station',
  'check-in-analytics': 'Check-in Analytics',
  'event-analytics': 'Event Analytics',
  'events-analytics': 'Events Analytics',
  communication: 'Communication',
  'event-contacts': 'Event Contacts',
  'event-sponsors': 'Event Sponsors',
  'event-featured-performers': 'Featured Performers',
  'event-program-directors': 'Program Directors',
  'tenant-email-addresses': 'Tenant Email Addresses',
  'profile-site': 'Profile Site',
  competitions: 'Competitions',
  registrations: 'Registrations',
  results: 'Results',
  days: 'Competition Days',
  performers: 'Performers',
  contacts: 'Contacts',
  emails: 'Emails',
  'focus-groups': 'Focus Groups',
  schools: 'Schools',
  hospitals: 'Hospitals',
  orphanages: 'Orphanages',
  monasteries: 'Monasteries',
  convents: 'Convents',
};

function isDynamicSegment(segment: string): boolean {
  if (/^\d+$/.test(segment)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return true;
  }
  if (/^user_[A-Za-z0-9]+$/.test(segment)) return true;
  if (/^[a-z0-9]{20,}$/i.test(segment) && !segment.includes('-')) return true;
  return false;
}

export function humanizePathSegment(segment: string): string {
  const mapped = SEGMENT_LABELS[segment.toLowerCase()];
  if (mapped) return mapped;
  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function pathContentKeywords(pathname: string): string[] {
  return pathname
    .split('/')
    .filter(Boolean)
    .filter((s) => !['mosc-redesign', 'mosc', 'mosc-old', 'admin'].includes(s))
    .filter((s) => !isDynamicSegment(s))
    .map((s) => humanizePathSegment(s));
}

export function buildBrowserTabTitle(pathname: string | null | undefined): string {
  const path = (pathname || '/').split('?')[0].split('#')[0] || '/';
  if (path === '/' || path === '') {
    return `Home | ${APP_BRAND}`;
  }

  const segments = path.split('/').filter(Boolean);
  const isAdmin = segments[0] === 'admin';
  const isMosc =
    segments[0] === 'mosc' ||
    segments[0] === 'mosc-redesign' ||
    segments[0] === 'mosc-old';

  const labelParts: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg === 'mosc-redesign' || seg === 'mosc' || seg === 'mosc-old') continue;
    if (seg === 'admin') continue;
    if (isDynamicSegment(seg)) {
      const prev = segments[i - 1];
      if (prev && !isDynamicSegment(prev) && /^\d+$/.test(seg)) {
        labelParts.push(`#${seg}`);
      } else if (seg.includes('-') && !/^\d+$/.test(seg)) {
        // Slug-like dynamic segments still get a human label for hover search
        labelParts.push(humanizePathSegment(seg));
      }
      continue;
    }
    labelParts.push(humanizePathSegment(seg));
  }

  const focused = labelParts.length <= 3 ? labelParts : labelParts.slice(-3);

  const pageLabel =
    focused.length > 0
      ? focused.join(' · ')
      : isAdmin
        ? 'Admin Home'
        : 'Home';

  if (isAdmin) {
    return `${pageLabel} | ${ADMIN_BRAND} | ${APP_BRAND}`;
  }
  if (isMosc) {
    return `${pageLabel} | ${MOSC_BRAND}`;
  }
  return `${pageLabel} | ${APP_BRAND}`;
}

/** True when the current <title> already includes the page-related path keyword(s). */
export function titleReflectsPath(pathname: string, title: string): boolean {
  const t = (title || '').toLowerCase();
  if (!t) return false;
  const keywords = pathContentKeywords(pathname);
  if (keywords.length === 0) {
    // Home /admin only
    if (pathname === '/' || pathname === '') return t.includes('home');
    if (pathname === '/admin' || pathname === '/admin/') return t.includes('admin');
    // Section roots (/mosc, /mosc-redesign, /mosc-old) and dynamic-only paths have no
    // content keywords. Compare against the full derived title so this check converges after
    // one rewrite — returning false unconditionally kept shouldApplyPathDerivedTitle true
    // forever, which made BrowserTabTitle's MutationObserver rewrite <title> in an infinite loop.
    return t === buildBrowserTabTitle(pathname).toLowerCase();
  }
  // Require the most specific (last) path keyword so "Downloads" must appear for /downloads
  const primary = keywords[keywords.length - 1].toLowerCase();
  return t.includes(primary);
}

/**
 * Apply path-derived titles whenever the live document.title lacks the page keyword
 * (covers generic brand-only titles and nested template leftovers).
 */
export function shouldApplyPathDerivedTitle(pathname: string, currentTitle: string): boolean {
  return !titleReflectsPath(pathname, currentTitle);
}

export function buildBrowserTabKeywords(pathname: string | null | undefined): string {
  const title = buildBrowserTabTitle(pathname);
  return title
    .split(/[|·,#]/)
    .map((p) => p.trim())
    .filter(Boolean)
    .join(', ');
}
