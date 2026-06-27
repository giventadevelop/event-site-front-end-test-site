'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, X, LogOut, User } from 'lucide-react';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import { isAdminRole } from '@/lib/utils';
import Image from 'next/image';

const navItems = [
  {
    name: 'Home',
    href: '/',
    active: false
  },
  {
    name: 'About',
    href: '/#about-us',
    active: false,
    dropdown: [] // Will be populated dynamically based on tenant settings
  },
  {
    name: 'Events',
    href: '/events',
    active: false
  },
  {
    name: 'Features',
    href: '#',
    active: false,
    dropdown: [
      { name: 'Polls', href: '/polls' },
      { name: 'Focus Groups', href: '/focus-groups' },
      { name: 'Profile', href: '/profile', requiresAuth: true },
      { name: 'Members', href: '/member-portal', requiresAuth: true },
      { name: 'Membership', href: '/membership' },
      { name: 'MOSC', href: '/mosc' },
      { name: 'MOSC_Redesign', href: '/mosc-redesign' }
    ]
  },
  {
    name: 'Calendar',
    href: '/calendar',
    active: false
  },
  {
    name: 'Gallery',
    href: '/gallery',
    active: false
  },
  {
    name: 'Contact',
    href: '/#contact',
    active: false
  }
];

// Admin submenu items
const adminSubmenuItems = [
  { name: 'Admin Home', href: '/admin' },
  { name: 'Manage Users', href: '/admin/manage-usage' },
  { name: 'Manage Events', href: '/admin/manage-events' },
  { name: 'Event Analytics', href: '/admin/events/dashboard' },
  { name: 'Registrations', href: '/admin/events/registrations' },
  { name: 'QR Scanner', href: '/admin/qr-scanner' },
  { name: 'Check-In Analytics', href: '/admin/check-in-analytics' },
  { name: 'Sales Analytics', href: '/admin/sales-analytics' },
  { name: 'Manual Payments', href: '/admin/manual-payments' },
  { name: 'Poll Management', href: '/admin/polls' },
  { name: 'Focus Groups', href: '/admin/focus-groups' },
  {
    name: 'Membership',
    href: '#',
    dropdown: [
      { name: 'Plans', href: '/admin/membership/plans' },
      { name: 'Subscriptions', href: '/admin/membership/subscriptions' }
    ]
  },
  { name: 'Bulk Email', href: '/admin/bulk-email' },
  { name: 'Test Stripe', href: '/admin/test-stripe' },
  { name: 'Media Management', href: '/admin/media' },
  { name: 'Official Documents', href: '/admin/official-documents' },
  { name: 'Document Categories', href: '/admin/official-document-categories' },
  { name: 'Executive Committee', href: '/admin/executive-committee' },
  { name: 'Event Sponsors', href: '/admin/event-sponsors' }
];

type HeaderProps = {
  hideMenuItems?: boolean;
  variant?: 'charity' | 'default';
  isTenantAdmin?: boolean;
};

const getNavAriaLabel = (itemName: string) => {
  if (itemName === 'Calendar') {
    return 'Navigate to Schedule';
  }
  return `Navigate to ${itemName}`;
};

const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  console.log('[Header] handleSmoothScroll called with:', href);

  // Handle both '#section' and '/#section' formats
  if (!href.startsWith('#') && !href.startsWith('/#')) return;

  e.preventDefault();
  console.log('[Header] Preventing default and handling hash navigation');

  // Extract the hash part (handle both '#section' and '/#section')
  const hashPart = href.startsWith('/#') ? href.substring(1) : href; // '/#team-section' -> '#team-section'
  const targetId = hashPart.substring(1); // '#team-section' -> 'team-section'

  // If we're not on the home page, navigate there first
  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    console.log('[Header] Not on home page, navigating to:', `/${hashPart}`);
    // Show loading indicator for team section navigation
    if (targetId === 'team-section') {
      showNavigationLoading();
    }
    // Navigate to home page with hash
    window.location.href = `/${hashPart}`;
    return;
  }

  // If we're on the home page, update the URL hash and scroll
  console.log('[Header] On home page, updating hash to:', hashPart);

  // Show loading indicator for team section
  if (targetId === 'team-section') {
    showNavigationLoading();
  }

  // Update the URL hash
  window.history.pushState(null, '', hashPart);

  // Wait for element to exist before scrolling (especially important for dynamically loaded sections)
  const headerHeight = 128;
  const maxWaitTime = 10000; // 10 seconds max wait
  const pollInterval = 100; // Check every 100ms
  const startTime = Date.now();

  const waitForElementAndScroll = () => {
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // CRITICAL: For team-section, ensure it's fully rendered and visible
      // Check if element has content (not just the container)
      if (targetId === 'team-section') {
        const hasContent = targetElement.querySelector('.max-w-7xl') || targetElement.children.length > 0;
        if (!hasContent) {
          // Element exists but content not loaded yet, keep waiting
          const elapsed = Date.now() - startTime;
          if (elapsed < maxWaitTime) {
            setTimeout(waitForElementAndScroll, pollInterval);
            return false;
          }
        }
      }

      // Element exists and is ready, scroll to it with proper offset
      // Use larger offset for team-section to ensure it's fully visible above the fold
      const scrollOffset = targetId === 'team-section' ? headerHeight + 40 : headerHeight + 20;
      const targetPosition = targetElement.offsetTop - scrollOffset;

      // Ensure we scroll to the correct element by verifying the ID matches
      if (targetElement.id === targetId) {
        window.scrollTo({ top: Math.max(0, targetPosition), behavior: 'smooth' });
        hideNavigationLoading();
        console.log('[Header] Successfully scrolled to:', targetId, 'at position:', targetPosition);
        return true;
      }
    }

    // Element doesn't exist yet
    const elapsed = Date.now() - startTime;
    if (elapsed < maxWaitTime) {
      // Keep waiting
      setTimeout(waitForElementAndScroll, pollInterval);
      return false;
    } else {
      // Timeout reached
      console.warn('[Header] Timeout waiting for element:', targetId);
      hideNavigationLoading();
      return false;
    }
  };

  // Start waiting for element
  waitForElementAndScroll();

  // Also trigger a hashchange event to let the page component handle the scrolling
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

// Loading indicator functions
let loadingIndicator: HTMLElement | null = null;

const showNavigationLoading = () => {
  if (typeof window === 'undefined') return;

  // Remove existing indicator if any
  hideNavigationLoading();

  // Create loading indicator
  loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'navigation-loading-indicator';
  loadingIndicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  `;

  // Create spinner
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  // Add keyframes if not already present
  if (!document.getElementById('navigation-loading-styles')) {
    const style = document.createElement('style');
    style.id = 'navigation-loading-styles';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Create text
  const text = document.createElement('div');
  text.textContent = 'Loading team members...';
  text.style.cssText = `
    margin-top: 16px;
    font-size: 16px;
    font-weight: 500;
    color: #3b82f6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  loadingIndicator.appendChild(spinner);
  loadingIndicator.appendChild(text);
  document.body.appendChild(loadingIndicator);
};

const hideNavigationLoading = () => {
  if (loadingIndicator && loadingIndicator.parentNode) {
    loadingIndicator.parentNode.removeChild(loadingIndicator);
    loadingIndicator = null;
  }
};

type NavSubItem = {
  name: string;
  href: string;
  requiresAuth?: boolean;
};

/** True only after mount — use to defer client-only auth/settings/nav state */
function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

/** Hash fragment for active nav — empty until after mount to avoid SSR/client mismatch */
function useLocationHash(): string {
  const [hash, setHash] = useState('');
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return hash;
}

function pathnameMatchesMosc(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/mosc' || pathname.startsWith('/mosc/');
}

function pathnameMatchesMoscRedesign(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/mosc-redesign' || pathname.startsWith('/mosc-redesign/');
}

/** SSR + first paint: hide auth/membership items (matches server Clerk/settings state) */
function shouldShowNavSubItem(
  subItem: NavSubItem,
  mounted: boolean,
  userId: string | null | undefined,
  settings: { isMembershipSubscriptionEnabled?: boolean } | null
): boolean {
  if (!mounted) {
    if (subItem.requiresAuth) return false;
    if (subItem.href === '/membership') return false;
    return true;
  }
  if (subItem.requiresAuth && !userId) return false;
  if (subItem.href === '/membership' && !settings?.isMembershipSubscriptionEnabled) return false;
  return true;
}

/**
 * Desktop nav item with submenu (About, Features) — hover + click, click-outside close
 */
function HeaderNavDropdown({
  item,
  userId,
  settings,
  pathname,
  handleSmoothScroll,
}: {
  item: { name: string; dropdown: NavSubItem[] };
  userId: string | null | undefined;
  settings: { isMembershipSubscriptionEnabled?: boolean } | null;
  pathname: string | null;
  handleSmoothScroll: (e: React.MouseEvent, href: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useMounted();
  const locationHash = useLocationHash();

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 8, left: rect.left });
  }, []);

  const clearCloseHoverTimeout = useCallback(() => {
    if (closeHoverTimeoutRef.current) {
      clearTimeout(closeHoverTimeoutRef.current);
      closeHoverTimeoutRef.current = null;
    }
  }, []);

  const scheduleCloseOnHoverLeave = useCallback(() => {
    clearCloseHoverTimeout();
    closeHoverTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  }, [clearCloseHoverTimeout]);

  const openMenu = useCallback(() => {
    clearCloseHoverTimeout();
    setIsOpen(true);
  }, [clearCloseHoverTimeout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setMenuPosition(null);
      return;
    }
    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [isOpen, updateMenuPosition]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => () => clearCloseHoverTimeout(), [clearCloseHoverTimeout]);

  const isAboutActive =
    item.name === 'About' &&
    item.dropdown.some(
      (subItem) =>
        subItem.href === pathname ||
        (subItem.href === '/#about-us' && pathname === '/' && locationHash === '#about-us') ||
        (subItem.href === '/team' && pathname === '/team') ||
        (subItem.href === '/sponsors' && pathname === '/sponsors')
    );

  const isFeaturesActive =
    item.name === 'Features' &&
    item.dropdown.some(
      (subItem) =>
        subItem.href === pathname ||
        (subItem.href === '/profile' && pathname === '/profile') ||
        (subItem.href === '/membership' && pathname?.startsWith('/membership')) ||
        (subItem.href === '/mosc' && pathnameMatchesMosc(pathname)) ||
        (subItem.href === '/mosc-redesign' && pathnameMatchesMoscRedesign(pathname))
    );

  const isActive =
    mounted &&
    ((item.name === 'About' && isAboutActive) || (item.name === 'Features' && isFeaturesActive));

  return (
    <div
      ref={containerRef}
      className="header-nav-dropdown-root relative group"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleCloseOnHoverLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          clearCloseHoverTimeout();
          setIsOpen((prev) => {
            const next = !prev;
            if (next) {
              requestAnimationFrame(() => updateMenuPosition());
            }
            return next;
          });
        }}
        className={`header-nav-link font-semibold flex items-center gap-1.5 cursor-pointer ${isActive ? 'active' : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{item.name}</span>
        <ChevronDown
          size={16}
          className={`header-chevron text-[var(--header-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && menuPosition && (
      <div
        className="header-dropdown header-dropdown--fixed visible w-56"
        style={{ top: menuPosition.top, left: menuPosition.left }}
        role="menu"
        aria-label={`${item.name} submenu`}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleCloseOnHoverLeave}
      >
        <div className="py-2">
          {item.dropdown.map((subItem) => {
            if (!shouldShowNavSubItem(subItem, mounted, userId, settings)) return null;

            const isSubItemActive =
              mounted &&
              (subItem.href === pathname ||
                (subItem.href === '/membership' && pathname?.startsWith('/membership')) ||
                (subItem.href === '/mosc' && pathnameMatchesMosc(pathname)) ||
                (subItem.href === '/mosc-redesign' && pathnameMatchesMoscRedesign(pathname)) ||
                (subItem.href === '/#about-us' && pathname === '/' && locationHash === '#about-us') ||
                (subItem.href === '/team' && pathname === '/team'));

            return (
              <Link
                key={subItem.name}
                href={subItem.href}
                prefetch={subItem.href === '/mosc' || subItem.href === '/mosc-redesign' ? false : undefined}
                onClick={(e) => {
                  if (subItem.href.startsWith('/#')) {
                    handleSmoothScroll(e, subItem.href);
                  }
                  setIsOpen(false);
                }}
                className={`header-dropdown-item font-semibold block ${isSubItemActive ? 'active' : ''}`}
                role="menuitem"
                aria-label={`Navigate to ${subItem.name}`}
              >
                {subItem.name}
              </Link>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}

/**
 * User Avatar Dropdown Component
 * Shows user's profile image with dropdown menu for Profile and Sign Out
 * Editorial design with gradient border and refined animations
 */
function UserAvatarDropdown({
  user,
  onSignOut,
  isSigningOut
}: {
  user: any;
  onSignOut: () => void;
  isSigningOut: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get user's profile image or use default avatar
  const userImageUrl = user?.imageUrl || user?.hasImage ? user?.imageUrl : null;
  const userName = user?.firstName || user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'User';
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button with Gradient Border */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="header-avatar flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--header-focus-ring)] focus:ring-offset-2"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {userImageUrl ? (
          <Image
            src={userImageUrl}
            alt={userName}
            width={40}
            height={40}
            className="w-full h-full object-cover rounded-full"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-amber-400 text-white">
            <User size={18} className="text-white" />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      <div className={`header-dropdown absolute top-full right-0 mt-3 w-72 z-50 ${isOpen ? 'visible' : ''}`}>
        <div className="py-2">
          {/* User Info Header */}
          <div className="px-4 py-4 border-b border-[var(--header-border)]">
            <div className="flex items-center gap-3">
              {userImageUrl ? (
                <div className="flex-shrink-0">
                  <Image
                    src={userImageUrl}
                    alt={userName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--header-border)]"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-500 to-amber-400 text-white rounded-full flex-shrink-0">
                  <User size={22} className="text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--header-text-primary)] truncate font-['Plus_Jakarta_Sans']">
                  {userName}
                </p>
                {userEmail && (
                  <p className="text-xs text-[var(--header-text-muted)] truncate mt-0.5">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2 px-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className={`header-dropdown-item font-semibold flex items-center gap-3 ${pathname === '/profile' ? 'active' : ''}`}
              role="menuitem"
              aria-label="View profile"
            >
              <User size={16} aria-hidden="true" />
              <span>Profile</span>
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              disabled={isSigningOut}
              className={`
                w-full flex items-center gap-3 text-left
                font-['Plus_Jakarta_Sans'] font-medium text-sm
                px-4 py-2.5 mx-0 rounded-lg
                transition-all duration-200
                ${isSigningOut
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50'
                }
              `}
              role="menuitem"
              aria-label="Sign out"
            >
              <LogOut size={16} aria-hidden="true" />
              <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header({ hideMenuItems = false, variant = 'charity', isTenantAdmin }: HeaderProps) {
  const pathname = usePathname();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { settings, showTeamSection, loading: settingsLoading } = useTenantSettings();
  const [isAdmin, setIsAdmin] = useState(!!isTenantAdmin);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [openMobileDropdowns, setOpenMobileDropdowns] = useState<Record<string, boolean>>({});
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const mounted = useMounted();
  const locationHash = useLocationHash();
  // CRITICAL: Check for sign-out flag and call signOut() on satellite domain.
  // Just clearing localStorage is NOT enough — Clerk stores session in HTTP-only cookies
  // that can only be cleared via signOut(). Without this, the avatar/admin menu persist.
  const [pendingSignOut, setPendingSignOut] = useState(false);

  // Phase 1: Detect flag on mount (runs immediately, before Clerk loads)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const clerkSignedOut = urlParams.get('clerk_signout');

    if (clerkSignedOut === 'true') {
      console.log('[Header] Detected clerk_signout=true flag, waiting for Clerk to load...');
      setPendingSignOut(true);

      // Clean URL immediately so the flag doesn't persist on reload
      urlParams.delete('clerk_signout');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Phase 2: Once Clerk is loaded, call signOut() to clear the session properly
  useEffect(() => {
    if (!pendingSignOut || !isLoaded) return;

    const performSignOut = async () => {
      console.log('[Header] Clerk loaded, calling signOut() on satellite domain...');
      try {
        await signOut();
        console.log('[Header] signOut() completed on satellite domain');
      } catch (error) {
        console.error('[Header] signOut() error on satellite:', error);
      }

      // Clear localStorage as backup
      Object.keys(localStorage).forEach(key => {
        if (key.includes('clerk') || key.includes('__clerk')) {
          localStorage.removeItem(key);
        }
      });

      setPendingSignOut(false);
      window.location.replace(window.location.pathname);
    };

    performSignOut();
  }, [pendingSignOut, isLoaded, signOut]);

  const isHomePage =
    pathname === '/' || pathname === '/charity-theme';

  // Frosted header when content scrolls under the sticky bar (homepage + all pages)
  useEffect(() => {
    const SCROLL_THRESHOLD = 24;

    const updateScrollState = () => {
      setHeaderScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, [pathname]);

  // Debug: Log auth state changes
  useEffect(() => {
    console.log('[Header] Auth state:', {
      isLoaded,
      userId,
      userName: user?.firstName,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
    });
  }, [isLoaded, userId, user]);

  // Prefer server-verified tenant admin flag when provided; re-check admin status when user logs in
  // CRITICAL: When user logs in client-side, isTenantAdmin prop may be stale (from initial SSR)
  // We need to re-check admin status from the database when userId changes
  // On satellite domains, the server-side check is skipped during __clerk_synced, so
  // the client-side check here is the primary mechanism for showing the admin menu.
  useEffect(() => {
    // If user is not loaded yet, use server-verified flag (from SSR)
    if (!isLoaded) {
      setIsAdmin(!!isTenantAdmin);
      return;
    }

    // If user is not logged in, clear admin status
    if (!userId || !user) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;

    // Fetch profile and check admin role, with optional retry for satellite domain timing
    const checkAdminStatus = async (attempt = 1): Promise<void> => {
      try {
        const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
        if (!tenantId) {
          console.warn('[Header] NEXT_PUBLIC_TENANT_ID not set, cannot check admin status');
          if (!cancelled) {
            setIsAdmin(typeof isTenantAdmin === 'boolean' ? isTenantAdmin : false);
          }
          return;
        }

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const url = `${baseUrl}/api/proxy/user-profiles?userId.equals=${encodeURIComponent(userId)}&tenantId.equals=${encodeURIComponent(tenantId)}&size=1`;

        console.log(`[Header] Checking admin status (attempt ${attempt}), tenantId=${tenantId}, userId=${userId}`);
        const resp = await fetch(url, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' }
        });

        if (resp.ok) {
          const data = await resp.json();
          // Handle both raw array and paginated { content: [...] } responses
          let profile;
          if (Array.isArray(data)) {
            profile = data[0];
          } else if (data?.content && Array.isArray(data.content)) {
            profile = data.content[0];
          } else if (data && typeof data === 'object' && 'userId' in data) {
            profile = data;
          }
          const role = profile?.userRole ?? 'NONE';
          const adminResult = profile
            ? isAdminRole(profile.userRole)
            : isTenantAdmin === true;
          console.log(`[Header] Profile API response: profileId=${profile?.id ?? 'none'}, userRole="${role}", userStatus="${profile?.userStatus ?? 'none'}", isAdmin=${adminResult}, profileUserId=${profile?.userId}, dataType=${Array.isArray(data) ? 'array' : typeof data}, count=${Array.isArray(data) ? data.length : data?.content?.length ?? 1}, attempt=${attempt}`);
          if (!cancelled) {
            setIsAdmin(adminResult);
          }
        } else {
          console.warn(`[Header] Admin status check failed (attempt ${attempt}):`, resp.status);

          // On satellite domains, the first API call after sync may fail if session
          // is not yet established. Retry once after a short delay.
          if (attempt < 2) {
            console.log('[Header] Retrying admin status check in 2s...');
            await new Promise(r => setTimeout(r, 2000));
            if (!cancelled) return checkAdminStatus(attempt + 1);
          }

          // Final fallback
          if (!cancelled) {
            if (typeof isTenantAdmin === 'boolean') {
              setIsAdmin(isTenantAdmin);
            } else {
              const publicRole = user.publicMetadata?.role as string;
              const orgRole = user.organizationMemberships?.[0]?.role;
              const isAdminUser =
                publicRole === 'admin' ||
                publicRole === 'administrator' ||
                orgRole === 'admin' ||
                orgRole === 'org:admin';
              setIsAdmin(isAdminUser);
            }
          }
        }
      } catch (error) {
        console.error(`[Header] Error checking admin status (attempt ${attempt}):`, error);

        // Retry once on error (covers network hiccups after satellite sync)
        if (attempt < 2) {
          console.log('[Header] Retrying admin status check in 2s...');
          await new Promise(r => setTimeout(r, 2000));
          if (!cancelled) return checkAdminStatus(attempt + 1);
        }

        if (!cancelled) {
          setIsAdmin(typeof isTenantAdmin === 'boolean' ? isTenantAdmin : false);
        }
      }
    };

    checkAdminStatus();

    // Post-satellite-sync re-check: After Clerk satellite sync completes, the session
    // may not be fully ready when checkAdminStatus first runs. Detect if we just came
    // through a sync (ClerkSyncUrlCleanup sets this flag) and re-check after Clerk stabilizes.
    const wasSynced = typeof window !== 'undefined' && sessionStorage.getItem('clerk_satellite_synced');
    if (wasSynced) {
      sessionStorage.removeItem('clerk_satellite_synced');
      const syncTimer = setTimeout(() => {
        if (!cancelled) {
          console.log('[Header] Post-satellite-sync re-check of admin status');
          checkAdminStatus();
        }
      }, 1500);
      return () => { cancelled = true; clearTimeout(syncTimer); };
    }

    return () => { cancelled = true; };
  }, [isLoaded, userId, user, isTenantAdmin]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    console.log('[Header] Sign out button clicked');
    setIsSigningOut(true);

    // Broadcast sign-out to other tabs
    localStorage.setItem('clerk_signout_broadcast', Date.now().toString());

    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const primaryDomain = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com';
    const primaryHost = primaryDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // CRITICAL: If we're on the primary domain, always do normal sign out (never redirect).
    // This prevents sign-out errors when NEXT_PUBLIC_CLERK_DOMAIN is mis-set on primary app.
    const isPrimary =
      hostname === primaryHost ||
      hostname === primaryDomain ||
      hostname.includes(primaryHost.replace('www.', '')) ||
      hostname.includes(primaryDomain.replace('www.', ''));

    if (isPrimary) {
      try {
        await signOut();
        window.location.href = '/';
      } catch (error) {
        console.error('[Header] Error signing out:', error);
        setIsSigningOut(false);
      }
      return;
    }

    const isSatellite = process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' && !isPrimary;
    if (isSatellite) {
      console.log('[Header] Satellite domain detected, redirecting to primary domain sign-out...');
      const primarySignOutUrl = `https://${primaryHost}/auth/signout-redirect`;
      const returnUrl = encodeURIComponent(window.location.origin);
      window.location.href = `${primarySignOutUrl}?redirect_url=${returnUrl}`;
      return;
    }

    // Fallback: not primary and not satellite (e.g. localhost) - normal sign out
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('[Header] Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const headerHeight = 128;

    const scrollToHashWithOffset = (behavior: ScrollBehavior = 'smooth') => {
      const hash = window.location.hash;
      if (!hash || (window.location.pathname !== '/' && window.location.pathname !== '/charity-theme')) return;
      const targetId = hash.replace('#', '');

      // Show loading indicator for team section
      if (targetId === 'team-section') {
        showNavigationLoading();
      }

      // Wait for element to exist before scrolling (especially important for dynamically loaded sections)
      const maxWaitTime = targetId === 'team-section' ? 15000 : 10000; // 15 seconds for team-section, 10 for others
      const pollInterval = 100; // Check every 100ms
      const startTime = Date.now();

      const waitForElementAndScroll = () => {
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // CRITICAL: For team-section, ensure it's fully rendered and visible
          // Check if element has content (not just the container)
          if (targetId === 'team-section') {
            // Check if element has actual content (team members loaded)
            const hasContent = targetElement.querySelector('.max-w-7xl') &&
              (targetElement.querySelector('.grid') || targetElement.querySelector('.flex') ||
                targetElement.querySelector('[class*="team"]'));
            if (!hasContent) {
              // Element exists but content not loaded yet, keep waiting
              const elapsed = Date.now() - startTime;
              if (elapsed < maxWaitTime) {
                setTimeout(waitForElementAndScroll, pollInterval);
                return;
              }
            }
          }

          // Element exists and is ready, scroll to it with proper offset
          // Use larger offset for team-section to ensure it's fully visible above the fold
          const scrollOffset = targetId === 'team-section' ? headerHeight + 40 : headerHeight + 20;
          const targetPosition = targetElement.offsetTop - scrollOffset;

          // Ensure we scroll to the correct element by verifying the ID matches
          if (targetElement.id === targetId) {
            // Small delay to ensure layout is stable before scrolling
            setTimeout(() => {
              window.scrollTo({ top: Math.max(0, targetPosition), behavior });
              hideNavigationLoading();
              console.log('[Header useEffect] Successfully scrolled to:', targetId, 'at position:', targetPosition);
            }, 100);
            return;
          }
        }

        // Element doesn't exist yet
        const elapsed = Date.now() - startTime;
        if (elapsed < maxWaitTime) {
          // Keep waiting
          setTimeout(waitForElementAndScroll, pollInterval);
        } else {
          // Timeout reached
          console.warn('[Header useEffect] Timeout waiting for element:', targetId);
          hideNavigationLoading();
        }
      };

      // Start waiting for element
      waitForElementAndScroll();
    };

    if ((window.location.pathname === '/' || window.location.pathname === '/charity-theme') && window.location.hash) {
      requestAnimationFrame(() => scrollToHashWithOffset('auto'));
      const timeout = setTimeout(() => scrollToHashWithOffset('auto'), 300);
      return () => clearTimeout(timeout);
    }

    const onHashChange = () => scrollToHashWithOffset('smooth');
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      hideNavigationLoading();
    };
  }, [pathname]);

  // Build About dropdown dynamically based on tenant settings
  // Only show Team when settings are loaded AND showTeamSection is explicitly true.
  const aboutDropdown = [
    { name: 'About Us', href: '/#about-us' }
  ];
  if (mounted && !settingsLoading && settings && showTeamSection) {
    aboutDropdown.push({ name: 'Team', href: '/team' });
  }
  // Always add Sponsors menu item
  aboutDropdown.push({ name: 'Sponsors', href: '/sponsors' });

  // Update nav items with dynamic About dropdown
  // About always has a dropdown now (at minimum "About Us")
  const navItemsWithDropdown = navItems.map(item => {
    if (item.name === 'About') {
      return {
        ...item,
        dropdown: aboutDropdown
      };
    }
    return item;
  });

  // Update active state based on current route
  const updatedNavItems = navItemsWithDropdown.map(item => ({
    ...item,
    active: item.href === pathname || (item.href === '/' && (pathname === '/charity-theme' || pathname === '/'))
  }));

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 header-glass${headerScrolled ? ' header-glass--scrolled' : ''}${isHomePage ? ' header-glass--home' : ''}`}
      >
        <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:pl-5 lg:pr-8 xl:px-10">
          <div className="header-inner-grid h-[8rem] w-full min-w-0 items-center gap-2 sm:gap-3 lg:gap-3 xl:gap-4">
            {/* Brand — logo + MALAYALEES.US on all breakpoints (incl. mobile) */}
            <div className="header-brand-col flex min-w-0 items-center h-full max-w-[calc(100%-5.75rem)] sm:max-w-[calc(100%-6.25rem)] lg:max-w-none">
              <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-2.5 lg:gap-2 xl:gap-3 h-full">
                <div className="header-logo-image-wrap flex h-full w-[5.75rem] min-w-[5.75rem] sm:w-[6.75rem] sm:min-w-[6.75rem] lg:w-[6.5rem] lg:min-w-[6.5rem] xl:w-[7.5rem] xl:min-w-[7.5rem] 2xl:w-[9rem] 2xl:min-w-[9rem] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl transition-all duration-300 group-hover:scale-105">
                  <Image
                    src="/images/logos/Malayalees_US/Malayalees_US_Header_Branding.png"
                    alt="Unite India"
                    width={168}
                    height={128}
                    priority
                    loading="eager"
                    className="h-full w-full object-contain object-center"
                    style={{ width: 'auto', height: '100%' }}
                  />
                </div>
                <div className="min-w-0 shrink text-left">
                  <div className="header-logo-brand truncate whitespace-nowrap text-base leading-tight sm:text-lg md:text-xl lg:text-base xl:text-lg 2xl:text-[1.5rem]">
                    MALAYALEES.US
                  </div>
                </div>
              </Link>
            </div>

            {/* Main nav (desktop) — middle grid column; scrolls horizontally without overlapping auth */}
            <div className="header-main-nav-wrap hidden min-w-0 items-center justify-center px-0.5 lg:flex">
              {!hideMenuItems && (
                <nav
                  className="header-main-nav mx-auto flex min-w-0 max-w-full flex-nowrap items-center justify-center gap-0.5 lg:gap-0.5 xl:gap-1 2xl:gap-2"
                  role="navigation"
                  aria-label="Main navigation"
                >
                  {updatedNavItems.map((item) => {
                    const hasDropdown = item.dropdown && Array.isArray(item.dropdown) && item.dropdown.length > 0;

                    return (
                      <div key={item.name} className="relative shrink-0">
                        {hasDropdown ? (
                          <HeaderNavDropdown
                            item={{ name: item.name, dropdown: item.dropdown }}
                            userId={userId}
                            settings={settings}
                            pathname={pathname}
                            handleSmoothScroll={handleSmoothScroll}
                          />
                        ) : (
                          <Link
                            href={item.href}
                            className={`header-nav-link font-semibold ${item.active ? 'active' : ''}`}
                            onClick={(e) => handleSmoothScroll(e, item.href)}
                            aria-label={getNavAriaLabel(item.name)}
                            aria-current={item.active ? 'page' : undefined}
                          >
                            <span>{item.name}</span>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right — auth, search, mobile menu (dedicated grid column — never overlaps nav) */}
            <div className="header-auth-cluster flex shrink-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-2 lg:gap-2.5">
              <div className="header-auth-actions hidden lg:flex shrink-0 flex-nowrap items-center gap-1.5 xl:gap-2">
                {!isLoaded ? null : !userId ? (
                  <>
                    <Link
                      href="/sign-in"
                      className="header-nav-link header-auth-link font-semibold whitespace-nowrap shrink-0"
                    >
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/sign-up"
                      className="header-cta whitespace-nowrap shrink-0"
                    >
                      <span>Sign up</span>
                    </Link>
                  </>
                ) : (
                  <>
                    {isAdmin && (
                      <div className="relative group shrink-0">
                        <Link
                          href="/admin"
                          className={`header-nav-link header-auth-link font-semibold flex shrink-0 items-center gap-1.5 whitespace-nowrap ${pathname?.startsWith("/admin") ? 'active' : ''}`}
                        >
                          <span>Admin</span>
                          <ChevronDown
                            size={16}
                            className="header-chevron text-[var(--header-text-muted)]"
                            aria-hidden="true"
                          />
                        </Link>

                        <div className="header-dropdown absolute top-full right-0 mt-2 w-64 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 z-50 max-h-[70vh] overflow-y-auto">
                          <div className="py-2">
                            {adminSubmenuItems.map(subItem => {
                              const hasDropdown = subItem.dropdown && Array.isArray(subItem.dropdown);
                              const isMembershipActive = hasDropdown && subItem.dropdown.some(
                                (subSubItem: any) => pathname?.startsWith(subSubItem.href)
                              );

                              if (hasDropdown) {
                                return (
                                  <div key={subItem.name} className="relative group/membership">
                                    <div
                                      className={`header-dropdown-item font-semibold flex items-center justify-between cursor-pointer ${isMembershipActive ? 'active' : ''}`}
                                    >
                                      <span>{subItem.name}</span>
                                      <ChevronDown
                                        size={14}
                                        className="header-chevron text-[var(--header-text-muted)]"
                                        aria-hidden="true"
                                      />
                                    </div>
                                    <div className="header-dropdown absolute top-0 left-full ml-2 w-48 group-hover/membership:visible group-hover/membership:opacity-100 group-hover/membership:translate-y-0 group-hover/membership:scale-100 z-50">
                                      <div className="py-2">
                                        {subItem.dropdown.map((subSubItem: any) => {
                                          const isSubSubItemActive = pathname?.startsWith(subSubItem.href);
                                          return (
                                            <Link
                                              key={subSubItem.name}
                                              href={subSubItem.href}
                                              className={`header-dropdown-item font-semibold block ${isSubSubItemActive ? 'active' : ''}`}
                                              role="menuitem"
                                              aria-label={`Navigate to ${subSubItem.name}`}
                                            >
                                              {subSubItem.name}
                                            </Link>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`header-dropdown-item font-semibold block ${pathname?.startsWith(subItem.href) ? 'active' : ''}`}
                                  role="menuitem"
                                  aria-label={`Navigate to ${subItem.name}`}
                                >
                                  {subItem.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="shrink-0">
                      <UserAvatarDropdown
                        user={user}
                        onSignOut={handleSignOut}
                        isSigningOut={isSigningOut}
                      />
                    </div>
                  </>
                )}
              </div>
              {/* Search Button */}
              <button
                aria-label="Search"
                className="header-search-btn hidden shrink-0 sm:flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--header-focus-ring)]"
              >
                <Search
                  size={18}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>

              {/* Mobile menu button */}
              <button
                className="header-hamburger shrink-0 lg:hidden focus:outline-none focus:ring-2 focus:ring-[var(--header-focus-ring)]"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                type="button"
              >
                {!isMobileMenuOpen ? (
                  <>
                    <div className="header-hamburger-line"></div>
                    <div className="header-hamburger-line"></div>
                    <div className="header-hamburger-line"></div>
                  </>
                ) : (
                  <X size={18} className="text-[var(--header-text-secondary)]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[55] bg-[var(--header-text-primary)]/30 backdrop-blur-sm lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu — full viewport width so nothing is clipped off-screen */}
      <div
        id="mobile-menu"
        className={`header-mobile-menu fixed inset-y-0 right-0 left-0 z-[60] flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] transform transition-transform duration-300 ease-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden">
          {/* Mobile Menu Header — compact row; close always visible */}
          <div className="flex shrink-0 items-center gap-3 border-b border-[var(--header-border)] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <Link
              href="/"
              className="group flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
              onClick={closeMobileMenu}
            >
              <div className="header-logo-image-wrap flex h-12 w-12 min-w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:h-14 sm:w-14 sm:min-w-14">
                <Image
                  src="/images/logos/Malayalees_US/Malayalees_US_Header_Branding.png"
                  alt="Unite India"
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 text-left">
                <div className="header-logo-brand truncate text-base leading-tight sm:text-lg">
                  MALAYALEES.US
                </div>
              </div>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="header-mobile-menu-close flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--header-border)] bg-[var(--header-hover-bg)] text-[var(--header-text-primary)] hover:bg-[var(--header-active-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--header-focus-ring)] transition-all duration-200 touch-manipulation"
              aria-label="Close navigation menu"
              type="button"
            >
              <X size={22} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Menu Navigation */}
          <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-4 pb-[max(1rem,env(safe-area-inset-bottom))]" role="navigation" aria-label="Mobile navigation">
            <ul className="space-y-0.5 px-3">
              {!hideMenuItems && updatedNavItems.map((item) => {
                const hasDropdown = item.dropdown && Array.isArray(item.dropdown) && item.dropdown.length > 0;
                const isDropdownOpen = openMobileDropdowns[item.name] || false;

                if (hasDropdown) {
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => setOpenMobileDropdowns(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
                        className={`header-mobile-link w-full flex items-center justify-between ${isDropdownOpen ? 'active' : ''}`}
                        aria-label={`Toggle ${item.name} submenu`}
                        aria-expanded={isDropdownOpen}
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          size={16}
                          className={`text-[var(--header-text-muted)] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                      {isDropdownOpen && (
                        <ul className="pl-3 mt-1 space-y-0.5 border-l-2 border-[var(--header-border)] ml-4">
                          {item.dropdown.map((subItem: NavSubItem) => {
                            if (!shouldShowNavSubItem(subItem, mounted, userId, settings)) return null;

                            const isSubItemActive =
                              mounted &&
                              (subItem.href === pathname ||
                                (subItem.href === '/membership' && pathname?.startsWith('/membership')) ||
                                (subItem.href === '/mosc' && pathnameMatchesMosc(pathname)) ||
                                (subItem.href === '/mosc-redesign' && pathnameMatchesMoscRedesign(pathname)) ||
                                (subItem.href === '/#about-us' && pathname === '/' && locationHash === '#about-us') ||
                                (subItem.href === '/team' && pathname === '/team') ||
                                (subItem.href === '/sponsors' && pathname === '/sponsors'));

                            return (
                              <li key={subItem.name}>
                                <Link
                                  href={subItem.href}
                                  prefetch={subItem.href === '/mosc' || subItem.href === '/mosc-redesign' ? false : undefined}
                                  onClick={(e) => {
                                    // Handle smooth scroll for hash links
                                    if (subItem.href.startsWith('/#')) {
                                      handleSmoothScroll(e, subItem.href);
                                    }
                                    closeMobileMenu();
                                  }}
                                  className={`
                                    block py-2.5 px-4 rounded-lg
                                    font-['Plus_Jakarta_Sans'] text-sm font-semibold
                                    transition-all duration-200
                                    ${isSubItemActive
                                      ? 'text-[var(--header-accent-primary)] bg-[var(--header-active-bg)]'
                                      : 'text-[var(--header-text-secondary)] hover:text-[var(--header-accent-primary)] hover:bg-[var(--header-hover-bg)]'
                                    }
                                  `}
                                  aria-label={`Navigate to ${subItem.name}`}
                                >
                                  {subItem.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`header-mobile-link block ${item.active ? 'active' : ''}`}
                      onClick={(e) => {
                        closeMobileMenu();
                        handleSmoothScroll(e, item.href);
                      }}
                      aria-label={getNavAriaLabel(item.name)}
                      aria-current={item.active ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile Menu Auth Section */}
            <div className="px-3 mt-6 space-y-2">
              {!isLoaded ? null : !userId ? (
                <div className="space-y-2 p-3 rounded-xl bg-gradient-to-br from-violet-50 to-amber-50 border border-[var(--header-border)]">
                  <Link
                    href="/sign-in"
                    className="
                      block w-full py-3 px-4 rounded-lg
                      font-['Plus_Jakarta_Sans'] font-medium text-sm
                      text-center text-[var(--header-text-secondary)]
                      hover:text-[var(--header-accent-primary)] hover:bg-white/80
                      focus:outline-none
                      transition-all duration-200
                    "
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="
                      block w-full py-3 px-4 rounded-lg
                      font-['Plus_Jakarta_Sans'] font-semibold text-sm
                      text-center text-white
                      bg-gradient-to-r from-violet-600 to-violet-500
                      hover:from-violet-700 hover:to-violet-600
                      shadow-lg shadow-violet-500/20
                      focus:outline-none focus:ring-2 focus:ring-violet-500/50
                      transition-all duration-200
                    "
                    onClick={closeMobileMenu}
                  >
                    Sign up
                  </Link>
                </div>
              ) : (
                <>
                  {/* Mobile User Profile Section */}
                  <div className="px-3 mb-4 pb-4 border-b border-[var(--header-border)]">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-violet-50 to-amber-50">
                      {user?.imageUrl ? (
                        <div className="flex-shrink-0">
                          <Image
                            src={user.imageUrl}
                            alt={user?.firstName || user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'User'}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-500 to-amber-400 text-white rounded-full flex-shrink-0 shadow-md">
                          <User size={22} className="text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--header-text-primary)] truncate font-['Plus_Jakarta_Sans']">
                          {user?.firstName || user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'User'}
                        </p>
                        {user?.emailAddresses?.[0]?.emailAddress && (
                          <p className="text-xs text-[var(--header-text-muted)] truncate mt-0.5">
                            {user.emailAddresses[0].emailAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Profile Link */}
                  <Link
                    href="/profile"
                    className="header-mobile-link flex items-center gap-3"
                    onClick={closeMobileMenu}
                    aria-label="View profile"
                  >
                    <User size={18} aria-hidden="true" />
                    <span>Profile</span>
                  </Link>

                  {/* Mobile Sign Out Button */}
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleSignOut();
                    }}
                    disabled={isSigningOut}
                    className={`
                      flex items-center justify-center gap-2
                      w-full py-3 px-4 mx-0 rounded-lg
                      font-['Plus_Jakarta_Sans'] font-medium text-sm
                      border
                      focus:outline-none
                      transition-all duration-200
                      ${isSigningOut
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-rose-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300'
                      }
                    `}
                    aria-label="Sign out"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
                  </button>

                  {/* Mobile Admin Menu */}
                  {isAdmin && (
                    <div className="border-t border-[var(--header-border)] pt-4 mt-4">
                      <div className="text-xs font-semibold text-[var(--header-text-muted)] uppercase tracking-wider mb-3 px-4 font-['Plus_Jakarta_Sans']">
                        Admin Panel
                      </div>
                      <div className="space-y-0.5">
                        {adminSubmenuItems.map(subItem => {
                          const hasDropdown = subItem.dropdown && Array.isArray(subItem.dropdown);
                          const isDropdownOpen = openMobileDropdowns[`admin-${subItem.name}`] || false;

                          if (hasDropdown) {
                            return (
                              <div key={subItem.name}>
                                <button
                                  onClick={() => setOpenMobileDropdowns(prev => ({ ...prev, [`admin-${subItem.name}`]: !prev[`admin-${subItem.name}`] }))}
                                  className={`header-mobile-link w-full flex items-center justify-between text-sm py-2.5 ${isDropdownOpen ? 'active' : ''}`}
                                  aria-label={`Toggle ${subItem.name} submenu`}
                                  aria-expanded={isDropdownOpen}
                                >
                                  <span>{subItem.name}</span>
                                  <ChevronDown
                                    size={14}
                                    className={`text-[var(--header-text-muted)] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    aria-hidden="true"
                                  />
                                </button>
                                {isDropdownOpen && (
                                  <ul className="pl-3 mt-1 space-y-0.5 border-l-2 border-[var(--header-border)] ml-4">
                                    {subItem.dropdown.map((subSubItem: any) => {
                                      const isSubSubItemActive = pathname?.startsWith(subSubItem.href);
                                      return (
                                        <li key={subSubItem.name}>
                                          <Link
                                            href={subSubItem.href}
                                            className={`
                                              block py-2 px-4 rounded-lg
                                              font-['Plus_Jakarta_Sans'] text-xs font-semibold
                                              transition-all duration-200
                                              ${isSubSubItemActive
                                                ? 'text-[var(--header-accent-primary)] bg-[var(--header-active-bg)]'
                                                : 'text-[var(--header-text-secondary)] hover:text-[var(--header-accent-primary)] hover:bg-[var(--header-hover-bg)]'
                                              }
                                            `}
                                            onClick={closeMobileMenu}
                                            role="menuitem"
                                            aria-label={`Navigate to ${subSubItem.name}`}
                                          >
                                            {subSubItem.name}
                                          </Link>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              prefetch={subItem.href === '/mosc' ? false : undefined}
                              className={`header-mobile-link block text-sm py-2.5 ${pathname?.startsWith(subItem.href) ? 'active' : ''}`}
                              onClick={closeMobileMenu}
                              role="menuitem"
                              aria-label={`Navigate to ${subItem.name}`}
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Actions */}
            <div className="px-3 mt-6 mb-6">
              <button
                className="
                  w-full py-3 px-4 rounded-lg
                  font-['Plus_Jakarta_Sans'] font-medium text-sm
                  border border-[var(--header-border)]
                  text-[var(--header-text-secondary)]
                  hover:text-[var(--header-accent-primary)] hover:bg-[var(--header-hover-bg)] hover:border-[var(--header-accent-primary)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--header-focus-ring)]
                  transition-all duration-200
                  flex items-center justify-center gap-2
                "
                aria-label="Search"
              >
                <Search size={16} aria-hidden="true" />
                <span>Search</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
