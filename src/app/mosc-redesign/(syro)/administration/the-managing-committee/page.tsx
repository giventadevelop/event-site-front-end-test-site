import { redirect } from 'next/navigation';

/** Canonical page is the Strapi-backed CMS route. */
export default function ManagingCommitteeRedirectPage() {
  redirect('/mosc-redesign/administration/the-managing-committee-cms');
}
