import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

/** Directory seminary detail redirects to the Theological Seminaries CMS page. */
export default async function SeminaryDirectoryRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/mosc-redesign/theological-seminaries-cms/${encodeURIComponent(slug)}`);
}
