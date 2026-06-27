/**
 * Calendar quick-link submenu — Liturgical (Strapi) vs MOSC event calendar (database).
 */
export type CalendarMenuItem = {
  label: string;
  href: string;
};

export const CALENDAR_QUICK_LINK_LABEL = 'Calendar';

export const CALENDAR_MENU_BASE_HREF = '/mosc-redesign/liturgical-calendar';

export const CALENDAR_MENU_ITEMS: CalendarMenuItem[] = [
  {
    label: 'Liturgical Calendar',
    href: '/mosc-redesign/liturgical-calendar',
  },
  {
    label: 'MOSC Calendar',
    href: '/mosc-redesign/mosc-calendar',
  },
];

export function isCalendarNavActive(pathname: string): boolean {
  return CALENDAR_MENU_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
}
