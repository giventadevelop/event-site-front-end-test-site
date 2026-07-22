import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/** Legacy hub URL — canonical listing is /mosc-redesign/dioceses-cms. */
export default function DiocesesLegacyRedirect() {
  redirect('/mosc-redesign/dioceses-cms');
}
