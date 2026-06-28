export type AdminSubmenuItem = {
  name: string;
  href: string;
  dropdown?: { name: string; href: string }[];
};

export const adminSubmenuItems: AdminSubmenuItem[] = [
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
      { name: 'Subscriptions', href: '/admin/membership/subscriptions' },
    ],
  },
  { name: 'Bulk Email', href: '/admin/bulk-email' },
  { name: 'Test Stripe', href: '/admin/test-stripe' },
  { name: 'Media Management', href: '/admin/media' },
  { name: 'Official Documents', href: '/admin/official-documents' },
  { name: 'Document Categories', href: '/admin/official-document-categories' },
  { name: 'Executive Committee', href: '/admin/executive-committee' },
  { name: 'Event Sponsors', href: '/admin/event-sponsors' },
];
