import { redirect } from 'next/navigation';

/** Legacy URL — liturgical calendar moved to /mosc-redesign/liturgical-calendar */
export default function CalendarLegacyRedirectPage() {
  redirect('/mosc-redesign/liturgical-calendar');
}
