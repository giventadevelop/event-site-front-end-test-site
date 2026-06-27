'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface AdminNavigationProps {
  currentPage?: string;
  showHome?: boolean;
}

export default function AdminNavigation({ currentPage, showHome = true }: AdminNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent layout shifts after hydration
  useEffect(() => {
    if (containerRef.current) {
      // Force layout recalculation to prevent shifts
      containerRef.current.style.width = '100%';
      containerRef.current.style.maxWidth = '100%';
    }
  }, []);

  // When on event-sponsors page, do not show the Global Sponsors button (avoid linking to same page)
  const excludeKeyWhenActive = currentPage === 'event-sponsors' ? 'global-sponsors' : null;

  const buttons = [
    ...(showHome ? [{
      href: '/admin',
      icon: 'home',
      label: 'Admin Home',
      color: 'indigo',
      active: currentPage === 'admin',
      key: 'admin-home'
    }] : []),
    {
      href: '/admin/manage-usage',
      icon: 'users',
      label: 'Manage Users',
      color: 'blue',
      active: currentPage === 'manage-usage',
      key: 'manage-usage'
    },
    {
      href: '/admin/manage-events',
      icon: 'calendar',
      label: 'Manage Events',
      color: 'green',
      active: currentPage === 'manage-events',
      key: 'manage-events'
    },
    {
      href: '/admin/events/dashboard',
      icon: 'chart',
      label: 'Event Analytics',
      color: 'teal',
      active: currentPage === 'event-analytics',
      key: 'event-analytics'
    },
    {
      href: '/admin/events/registrations',
      icon: 'users',
      label: 'Event Attendee',
      sublabel: 'Registrations',
      color: 'indigo',
      active: currentPage === 'event-registrations',
      key: 'event-registrations'
    },
    {
      href: '/admin/communication',
      icon: 'envelope',
      label: 'Communication Center',
      color: 'amber',
      active: currentPage === 'communication',
      key: 'communication'
    },
    {
      href: '/admin/bulk-email',
      icon: 'envelope',
      label: 'Bulk Email',
      color: 'yellow',
      active: currentPage === 'bulk-email' || currentPage === 'promotion-emails' || currentPage === 'newsletter-emails',
      key: 'bulk-email'
    },
    {
      href: '/admin/test-stripe',
      icon: 'creditCard',
      label: 'Test Stripe',
      color: 'purple',
      active: currentPage === 'test-stripe',
      key: 'test-stripe'
    },
    {
      href: '/admin/executive-committee',
      icon: 'userTie',
      label: 'Executive Committee',
      sublabel: 'Team Members',
      color: 'orange',
      active: currentPage === 'executive-committee',
      key: 'executive-committee'
    },
    {
      href: '/admin/tenant-management/organizations',
      icon: 'building',
      label: 'Organizations',
      color: 'cyan',
      active: currentPage === 'tenant-organizations',
      key: 'tenant-organizations'
    },
    {
      href: '/admin/tenant-management/settings',
      icon: 'cog',
      label: 'Tenant Settings',
      color: 'purple',
      active: currentPage === 'tenant-settings',
      key: 'tenant-settings'
    },
    {
      href: '/admin/tenant-management/test',
      icon: 'chart',
      label: 'Test CRUD',
      color: 'red',
      active: currentPage === 'tenant-test',
      key: 'tenant-test'
    },
    // Global Event Management Features
    {
      href: '/admin/event-featured-performers',
      icon: 'microphone',
      label: 'Global Performers',
      color: 'pink',
      active: currentPage === 'event-featured-performers',
      key: 'global-performers'
    },
    {
      href: '/admin/event-contacts',
      icon: 'phone',
      label: 'Global Contacts',
      color: 'emerald',
      active: currentPage === 'event-contacts',
      key: 'global-contacts'
    },
    {
      href: '/admin/event-sponsors',
      icon: 'handshake',
      label: 'Global Sponsors',
      color: 'amber',
      active: currentPage === 'event-sponsors',
      key: 'global-sponsors'
    },
    {
      href: '/admin/event-emails',
      icon: 'mailBulk',
      label: 'Global Emails',
      color: 'cyan',
      active: currentPage === 'event-emails',
      key: 'global-emails'
    },
    {
      href: '/admin/event-program-directors',
      icon: 'userCheck',
      label: 'Global Directors',
      color: 'indigo',
      active: currentPage === 'event-program-directors',
      key: 'global-directors'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const baseColors: Record<string, string> = {
      gray: 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200',
      blue: 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-50 hover:bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200',
      teal: 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200',
      indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200',
      cyan: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200',
      slate: 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200',
      red: 'bg-red-50 hover:bg-red-100 text-red-800 border-red-200',
      pink: 'bg-pink-50 hover:bg-pink-100 text-pink-800 border-pink-200',
      emerald: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200',
      amber: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
    };

    const activeColors: Record<string, string> = {
      gray: 'bg-gray-200 text-gray-800 border-gray-300',
      blue: 'bg-blue-200 text-blue-800 border-blue-300',
      green: 'bg-green-200 text-green-800 border-green-300',
      yellow: 'bg-yellow-200 text-yellow-800 border-yellow-300',
      purple: 'bg-purple-200 text-purple-800 border-purple-300',
      orange: 'bg-orange-200 text-orange-800 border-orange-300',
      teal: 'bg-teal-200 text-teal-800 border-teal-300',
      indigo: 'bg-indigo-200 text-indigo-800 border-indigo-300',
      cyan: 'bg-cyan-200 text-cyan-800 border-cyan-300',
      slate: 'bg-slate-200 text-slate-800 border-slate-300',
      red: 'bg-red-200 text-red-800 border-red-300',
      pink: 'bg-pink-200 text-pink-800 border-pink-300',
      emerald: 'bg-emerald-200 text-emerald-800 border-emerald-300',
      amber: 'bg-amber-200 text-amber-800 border-amber-300'
    };

    return isActive ? activeColors[color] || activeColors.gray : baseColors[color] || baseColors.gray;
  };

  const getIconBgColor = (color: string) => {
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100',
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      yellow: 'bg-yellow-100',
      purple: 'bg-purple-100',
      orange: 'bg-orange-100',
      teal: 'bg-teal-100',
      indigo: 'bg-indigo-100',
      cyan: 'bg-cyan-100',
      slate: 'bg-slate-100',
      red: 'bg-red-100',
      pink: 'bg-pink-100',
      emerald: 'bg-emerald-100',
      amber: 'bg-amber-100'
    };
    return colorMap[color] || colorMap.gray;
  };

  const getIconTextColor = (color: string) => {
    const colorMap: Record<string, string> = {
      gray: 'text-gray-500',
      blue: 'text-blue-500',
      green: 'text-green-500',
      yellow: 'text-yellow-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500',
      teal: 'text-teal-500',
      indigo: 'text-indigo-500',
      cyan: 'text-cyan-500',
      slate: 'text-slate-500',
      red: 'text-red-500',
      pink: 'text-pink-500',
      emerald: 'text-emerald-500',
      amber: 'text-amber-500'
    };
    return colorMap[color] || colorMap.gray;
  };

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'home':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
      case 'users':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
      case 'calendar':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'chart':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
      case 'envelope':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'creditCard':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
      case 'userTie':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
      case 'building':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
      case 'cog':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      case 'microphone':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
      case 'phone':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
      case 'handshake':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>;
      case 'mailBulk':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'userCheck':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="w-full overflow-hidden box-border admin-navigation-container" style={{ maxWidth: '100%', width: '100%' }}>
      <div className="bg-white rounded-xl shadow-lg p-2.5 sm:p-3 md:p-4 lg:p-6 xl:p-8 overflow-hidden box-border" style={{ maxWidth: '100%', width: '100%' }}>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 w-full box-border" style={{ maxWidth: '100%', width: '100%' }}>
          {buttons.filter((b) => b.key !== excludeKeyWhenActive).map((button) => {
            const colorClasses = getColorClasses(button.color, button.active);
            const iconBgColor = getIconBgColor(button.color);
            const iconTextColor = getIconTextColor(button.color);

            return (
              <Link
                key={button.key}
                href={button.href}
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-1.5 sm:p-2 md:p-2.5 lg:p-3 xl:p-4 transition-all duration-300 hover:scale-105 hover:shadow-md group box-border w-full min-w-0 ${colorClasses}`}
                title={'sublabel' in button && button.sublabel ? `${button.label} [${button.sublabel}]` : button.label}
                aria-label={'sublabel' in button && button.sublabel ? `${button.label} [${button.sublabel}]` : button.label}
                style={{ width: '100%', maxWidth: '100%', flexShrink: 0 }}
              >
                <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-xl ${iconBgColor} flex items-center justify-center mb-1 sm:mb-1.5 md:mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {renderIcon(button.icon, `w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 ${iconTextColor}`)}
                </div>
                <span className="font-semibold text-center text-[9px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base leading-tight px-0.5 sm:px-1 break-words hyphens-auto">{button.label}</span>
                {'sublabel' in button && button.sublabel && (
                  <span className="text-center text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs xl:text-sm leading-tight mt-0.5 opacity-90 px-0.5 sm:px-1 break-words">[{button.sublabel}]</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
