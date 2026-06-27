'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/#about-us", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/#team-section", label: "Team" },
  { href: "/#contact", label: "Contact" },
];

// Function to handle smooth scrolling with offset for fixed header
const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  if (!href.startsWith('/#')) return;

  // Only intercept and smooth-scroll when already on the home page.
  // From any other route, let the default navigation to `/#section` occur
  // so the user is taken to the correct section on the home page.
  const isOnHomePage = typeof window !== 'undefined' && window.location.pathname === '/';
  if (!isOnHomePage) return;

  e.preventDefault();
  const targetId = href.substring(2);
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    const headerHeight = 80; // Approximate header height
    const targetPosition = targetElement.offsetTop - headerHeight - 20; // Extra 20px for breathing room
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
};

const ORG_NAME = "Adwiise";

type HeaderProps = {
  hideMenuItems?: boolean;
};

export function Header({ hideMenuItems = false }: HeaderProps) {
  const pathname = usePathname();
  const { userId } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoaded: userLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  // Ensure hash navigation to home sections accounts for fixed header offset
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const headerHeight = 80;

    const scrollToHashWithOffset = (behavior: ScrollBehavior = 'smooth') => {
      const hash = window.location.hash;
      if (!hash || window.location.pathname !== '/') return;
      const targetId = hash.replace('#', '');
      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;
      window.scrollTo({ top: Math.max(0, targetPosition), behavior });
    };

    // On initial load of the home page with a hash (e.g., navigating from /events to /#team-section)
    // defer to allow layout/images to settle, then adjust position with offset
    if (window.location.pathname === '/' && window.location.hash) {
      requestAnimationFrame(() => scrollToHashWithOffset('auto'));
      // Fallback adjustment after a brief delay for late-loading content
      const timeout = setTimeout(() => scrollToHashWithOffset('auto'), 300);
      return () => clearTimeout(timeout);
    }

    // Handle in-page hash changes on the home page
    const onHashChange = () => scrollToHashWithOffset('smooth');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [pathname]);

  useEffect(() => {
    async function checkAdminInOrg() {
      if (!userLoaded || !user) {
        setIsAdmin(false);
        return;
      }
      try {
        const memberships = await user.getOrganizationMemberships();
        const targetOrgMembership = memberships.find(
          (membership: any) => membership.organization.name === ORG_NAME
        );
        setIsAdmin(
          targetOrgMembership?.role === 'org:admin' ||
          targetOrgMembership?.role === 'admin'
        );
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdminInOrg();
  }, [user, userLoaded]);

  return (
    <header className="bg-transparent" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(5px)' }}>
      <nav className="mx-auto px-4 sm:px-6 lg:px-8 py-[18px]">
        <div className="relative flex items-center justify-between h-[58px]">
          {/* Logo - only show on pages other than home */}
          <div className="flex items-center gap-2 shrink-0">
            {pathname !== "/" && (
              <Link href="/" className="flex items-center">
                <img
                  src="/images/mcefee_logo_black_border_transparent.png"
                  alt="MCEFEE Logo"
                  style={{
                    height: '58px',
                    width: 'auto',
                    minWidth: '120px',
                    opacity: 0.9
                  }}
                />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-yellow-300 hover:bg-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6 xl:space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-yellow-300 hover:text-yellow-100 px-3 py-2 rounded-md text-sm font-bold ${pathname === item.href ? "text-yellow-100" : ""
                  }`}
                style={{ fontSize: 15, transition: 'color 0.3s ease' }}
                onClick={(e) => handleSmoothScroll(e, item.href)}
              >
                {item.label}
              </Link>
            ))}
            {!userId ? (
              <>
                <Link
                  href="/sign-in"
                  className="text-yellow-300 hover:text-yellow-100 px-3 py-2 rounded-md text-sm font-bold"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-yellow-400 text-black px-4 py-2 rounded-md text-sm font-bold hover:bg-yellow-300"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className={`text-yellow-300 hover:text-yellow-100 px-3 py-2 rounded-md text-sm font-bold ${pathname === "/profile" ? "text-yellow-100" : ""
                    }`}
                >
                  Profile
                </Link>
                {/* Admin menu item */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`text-yellow-300 hover:text-yellow-100 px-3 py-2 rounded-md text-sm font-bold ${pathname === "/admin" ? "text-yellow-100" : ""}`}
                  >
                    Admin
                  </Link>
                )}
                <UserButton afterSignOutUrl="/" />
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden pt-2 pb-3 space-y-1`}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block text-yellow-300 hover:text-yellow-100 px-3 py-2 rounded-md text-base font-bold ${pathname === item.href ? "text-yellow-100 bg-gray-800" : ""
                }`}
              onClick={(e) => {
                setIsMenuOpen(false);
                handleSmoothScroll(e, item.href);
              }}
            >
              {item.label}
            </Link>
          ))}
          {!userId ? (
            <>
              <Link
                href="/sign-in"
                className="block text-yellow-300 hover:text-yellow-100 px-3 py-2 rounded-md text-base font-bold"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="block bg-yellow-400 text-black px-3 py-2 rounded-md text-base font-bold hover:bg-yellow-300 mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className={`block text-yellow-300 hover:text-yellow-100 px-3 py-2 rounded-md text-base font-bold ${pathname === "/profile" ? "text-yellow-100 bg-gray-800" : ""
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              {/* Admin menu item for mobile */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`block text-yellow-300 hover:text-yellow-100 px-3 py-2 rounded-md text-base font-bold ${pathname === "/admin" ? "text-yellow-100 bg-gray-800" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <div className="px-3 py-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}