import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

/** Directory spiritual-organisation detail redirects to the CMS page. */
export default async function SpiritualOrganisationDirectoryRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/mosc-redesign/spiritual-organizations-cms/${encodeURIComponent(slug)}`);
}
