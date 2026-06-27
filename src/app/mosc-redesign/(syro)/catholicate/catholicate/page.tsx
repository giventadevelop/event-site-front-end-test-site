import { redirect } from 'next/navigation';

/**
 * Redirect to the single Catholicate introduction page.
 * Content previously at /mosc/catholicate/catholicate is now at /mosc/catholicate-intro.
 */
export default function CatholicateOverviewRedirect() {
  redirect('/mosc-redesign/catholicate-intro');
}
