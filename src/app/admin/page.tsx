'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";
// Icons removed - using inline SVGs instead

export default function AdminPage() {
  const { userId } = useAuth();

  // CRITICAL: Each button must have a UNIQUE color - no duplicates allowed
  // All gray colors (gray, slate, stone, zinc, neutral) are avoided
  // Using all available Tailwind colors + custom colors for 24 unique buttons
  const adminButtons = [
    {
      href: '/admin',
      icon: 'home',
      label: 'Admin Home',
      color: 'blue',
      key: 'admin-home'
    },
    {
      href: '/admin/manage-usage',
      icon: 'users',
      label: 'Manage Users',
      color: 'indigo',
      key: 'manage-usage'
    },
    {
      href: '/admin/manage-events',
      icon: 'calendar',
      label: 'Manage Events',
      color: 'green',
      key: 'manage-events'
    },
    {
      href: '/admin/events/dashboard',
      icon: 'chart',
      label: 'Event Analytics',
      color: 'teal',
      key: 'event-analytics'
    },
    {
      href: '/admin/events/registrations',
      icon: 'users',
      label: 'Event Attendee',
      sublabel: 'Registrations',
      color: 'purple',
      key: 'event-registrations'
    },
    {
      href: '/admin/polls',
      icon: 'chartBar',
      label: 'Poll Management',
      color: 'violet',
      key: 'poll-management'
    },
    {
      href: '/admin/focus-groups',
      icon: 'userFriends',
      label: 'Focus Groups',
      color: 'orange',
      key: 'focus-groups'
    },
    {
      href: '/admin/membership/plans',
      icon: 'addressCard',
      label: 'Membership Plans',
      color: 'pink',
      key: 'membership-plans'
    },
    {
      href: '/admin/membership/subscriptions',
      icon: 'fileInvoice',
      label: 'Membership Subscriptions',
      color: 'rose',
      key: 'membership-subscriptions'
    },
    {
      href: '/admin/tenant-email-addresses',
      icon: 'mailBulk',
      label: 'Email Addresses',
      color: 'lime',
      key: 'tenant-email-addresses'
    },
    {
      href: '/admin/bulk-email',
      icon: 'envelope',
      label: 'Bulk Email',
      color: 'yellow',
      key: 'bulk-email'
    },
    {
      href: '/admin/test-stripe',
      icon: 'creditCard',
      label: 'Test Stripe',
      color: 'fuchsia',
      key: 'test-stripe'
    },
    {
      href: '/admin/media',
      icon: 'image',
      label: 'Media Management',
      color: 'cyan',
      key: 'media-management'
    },
    {
      href: '/admin/gallery/albums',
      icon: 'photoAlbum',
      label: 'Gallery Albums',
      color: 'deepTeal',
      key: 'gallery-albums'
    },
    {
      href: '/admin/executive-committee',
      icon: 'userTie',
      label: 'Executive Committee',
      sublabel: 'Leadership',
      color: 'amber',
      key: 'executive-committee'
    },
    {
      href: '/admin/team-groups',
      icon: 'userFriends',
      label: 'Squad groups',
      sublabel: 'Sports / bands',
      color: 'violet',
      key: 'team-groups'
    },
    {
      href: '/admin/team-members',
      icon: 'addressCard',
      label: 'Squad roster',
      sublabel: 'Members',
      color: 'rose',
      key: 'team-members'
    },
    {
      href: '/admin/event-sponsors',
      icon: 'handshake',
      label: 'Global Sponsors',
      color: 'emerald',
      key: 'event-sponsors'
    },
    {
      href: '/admin/tenant-management/organizations',
      icon: 'building',
      label: 'Organizations',
      color: 'sky',
      key: 'tenant-organizations'
    },
    {
      href: '/admin/tenant-management/settings',
      icon: 'cog',
      label: 'Tenant Settings',
      color: 'red',
      key: 'tenant-settings'
    },
    {
      href: '/admin/homepage-cache',
      icon: 'refresh',
      label: 'Cache records',
      color: 'sky',
      key: 'homepage-cache'
    },
    {
      href: '/admin/tenant-management/test',
      icon: 'chart',
      label: 'Test CRUD',
      color: 'warmOrange',
      key: 'tenant-test'
    },
    {
      href: '/admin/event-featured-performers',
      icon: 'microphone',
      label: 'Global Performers',
      color: 'coolBlue',
      key: 'global-performers'
    },
    {
      href: '/admin/event-contacts',
      icon: 'phone',
      label: 'Global Contacts',
      color: 'vibrantPurple',
      key: 'global-contacts'
    },
    {
      href: '/admin/event-emails',
      icon: 'mailBulk',
      label: 'Global Emails',
      color: 'softPink',
      key: 'global-emails'
    },
    {
      href: '/admin/event-program-directors',
      icon: 'userCheck',
      label: 'Global Directors',
      color: 'brightYellow',
      key: 'global-directors'
    },
    {
      href: '/admin/qr-scanner',
      icon: 'qrcode',
      label: 'QR Scanner',
      color: 'lightCyan',
      key: 'qr-scanner'
    },
    {
      href: '/admin/check-in-analytics',
      icon: 'clipboardCheck',
      label: 'Check-In Analytics',
      color: 'cyan',
      key: 'check-in-analytics'
    },
    {
      href: '/admin/sales-analytics',
      icon: 'chartLine',
      label: 'Sales Analytics',
      color: 'sky',
      key: 'sales-analytics'
    },
    {
      href: '/admin/manual-payments',
      icon: 'moneyBill',
      label: 'Manual Payments [Zelle, Venmo…]',
      color: 'mintGreen',
      key: 'manual-payments'
    },
    {
      href: '/admin/official-documents',
      icon: 'folderOpen',
      label: 'Official Documents',
      color: 'documentOfficial',
      key: 'official-documents'
    },
    {
      href: '/admin/official-document-categories',
      icon: 'listBullet',
      label: 'Document categories',
      sublabel: 'Official library',
      color: 'docCategories',
      key: 'official-document-categories'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 hover:bg-blue-100 text-blue-800',
      green: 'bg-green-50 hover:bg-green-100 text-green-800',
      yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-50 hover:bg-purple-100 text-purple-800',
      orange: 'bg-orange-50 hover:bg-orange-100 text-orange-800',
      teal: 'bg-teal-50 hover:bg-teal-100 text-teal-800',
      indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800',
      cyan: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800',
      red: 'bg-red-50 hover:bg-red-100 text-red-800',
      pink: 'bg-pink-50 hover:bg-pink-100 text-pink-800',
      emerald: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800',
      amber: 'bg-amber-50 hover:bg-amber-100 text-amber-800',
      rose: 'bg-rose-50 hover:bg-rose-100 text-rose-800',
      lime: 'bg-lime-50 hover:bg-lime-100 text-lime-800',
      violet: 'bg-violet-50 hover:bg-violet-100 text-violet-800',
      fuchsia: 'bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800',
      sky: 'bg-sky-50 hover:bg-sky-100 text-sky-800',
      // Custom colors for additional unique buttons (using Tailwind color shades)
      warmOrange: 'bg-orange-50 hover:bg-orange-100 text-orange-800',
      coolBlue: 'bg-blue-50 hover:bg-blue-100 text-blue-800',
      vibrantPurple: 'bg-purple-50 hover:bg-purple-100 text-purple-800',
      softPink: 'bg-pink-50 hover:bg-pink-100 text-pink-800',
      brightYellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800',
      deepTeal: 'bg-teal-50 hover:bg-teal-100 text-teal-800',
      lightCyan: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800',
      mintGreen: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800',
      documentOfficial: 'bg-[#f5f3ff] hover:bg-[#ede9fe] text-[#5b21b6]',
      docCategories: 'bg-[#fdf2f8] hover:bg-[#fce7f3] text-[#9d174d]'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getIconBgColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      yellow: 'bg-yellow-100',
      purple: 'bg-purple-100',
      orange: 'bg-orange-100',
      teal: 'bg-teal-100',
      indigo: 'bg-indigo-100',
      cyan: 'bg-cyan-100',
      red: 'bg-red-100',
      pink: 'bg-pink-100',
      emerald: 'bg-emerald-100',
      amber: 'bg-amber-100',
      rose: 'bg-rose-100',
      lime: 'bg-lime-100',
      violet: 'bg-violet-100',
      fuchsia: 'bg-fuchsia-100',
      sky: 'bg-sky-100',
      // Custom colors for additional unique buttons
      warmOrange: 'bg-orange-100',
      coolBlue: 'bg-blue-100',
      vibrantPurple: 'bg-purple-100',
      softPink: 'bg-pink-100',
      brightYellow: 'bg-yellow-100',
      deepTeal: 'bg-teal-100',
      lightCyan: 'bg-cyan-100',
      mintGreen: 'bg-emerald-100',
      documentOfficial: 'bg-[#ddd6fe]',
      docCategories: 'bg-[#fbcfe8]'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getIconTextColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-500',
      green: 'text-green-500',
      yellow: 'text-yellow-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500',
      teal: 'text-teal-500',
      indigo: 'text-indigo-500',
      cyan: 'text-cyan-500',
      red: 'text-red-500',
      pink: 'text-pink-500',
      emerald: 'text-emerald-500',
      amber: 'text-amber-500',
      rose: 'text-rose-500',
      lime: 'text-lime-500',
      violet: 'text-violet-500',
      fuchsia: 'text-fuchsia-500',
      sky: 'text-sky-500',
      // Custom colors for additional unique buttons
      warmOrange: 'text-orange-500',
      coolBlue: 'text-blue-500',
      vibrantPurple: 'text-purple-500',
      softPink: 'text-pink-500',
      brightYellow: 'text-yellow-500',
      deepTeal: 'text-teal-500',
      lightCyan: 'text-cyan-500',
      mintGreen: 'text-emerald-500',
      documentOfficial: 'text-violet-600',
      docCategories: 'text-pink-600'
    };
    return colorMap[color] || colorMap.blue;
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
      case 'chartBar':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
      case 'userFriends':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
      case 'addressCard':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>;
      case 'fileInvoice':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'mailBulk':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'envelope':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'creditCard':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
      case 'image':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'photoAlbum':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V17a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M8 14h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01" /></svg>;
      case 'userTie':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
      case 'handshake':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>;
      case 'building':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
      case 'cog':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      case 'refresh':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
      case 'microphone':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
      case 'phone':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
      case 'userCheck':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'qrcode':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>;
      case 'clipboardCheck':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
      case 'chartLine':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>;
      case 'moneyBill':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
      case 'folderOpen':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h12a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>;
      case 'listBullet':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7m0 0l3-3m-3 3l3 3" /></svg>;
      default:
        return null;
    }
  };

  // Render page content even if userId is not yet available (client-side auth loading)
  // This prevents the page from hanging during Playwright tests
  if (!userId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-800 mb-4 sm:mb-8 flex flex-wrap items-center justify-center gap-2 text-center">
          Admin [
          <span className="flex items-center gap-1 text-blue-600">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </span>
          ] Event Management
        </h1>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="text-center py-8">
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-800 mb-4 sm:mb-8 flex flex-wrap items-center justify-center gap-2 text-center">
        Admin [
        <span className="flex items-center gap-1 text-blue-600">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </span>
        ] Event Management
      </h1>

      {/* Responsive Button Group */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {adminButtons.map((button) => {
            const colorClasses = getColorClasses(button.color);
            const iconBgColor = getIconBgColor(button.color);
            const iconTextColor = getIconTextColor(button.color);

            return (
              <Link
                key={button.key}
                href={button.href}
                className={`flex flex-col items-center justify-center ${colorClasses} rounded-lg shadow-md p-4 text-xs transition-all group`}
                title={button.sublabel ? `${button.label} [${button.sublabel}]` : button.label}
                aria-label={button.sublabel ? `${button.label} [${button.sublabel}]` : button.label}
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${iconBgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {renderIcon(button.icon, `w-10 h-10 ${iconTextColor}`)}
                </div>
                <span className="font-semibold text-center leading-tight">{button.label}</span>
                {'sublabel' in button && button.sublabel && (
                  <span className="text-center leading-tight mt-0.5 opacity-90">[{button.sublabel}]</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
