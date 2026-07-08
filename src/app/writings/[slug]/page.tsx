import Link from 'next/link';
import { notFound } from 'next/navigation';
import SubpageHomeDesignBackground from '@/components/SubpageHomeDesignBackground';
import { ProfileWritingDetailView } from '@/components/profile/ProfileWritingViews';
import { fetchProfileWritingBySlugServer } from '@/lib/profileSiteServer';

interface WritingSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WritingSlugPage({ params }: WritingSlugPageProps) {
  const { slug } = await params;
  const writing = await fetchProfileWritingBySlugServer(decodeURIComponent(slug));
  if (!writing) {
    notFound();
  }

  return (
    <>
      <SubpageHomeDesignBackground />
      <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto mb-8">
          <Link href="/#profile-writings" className="text-primary font-semibold hover:underline text-sm">
            ← Back to selected works
          </Link>
        </div>
        <ProfileWritingDetailView writing={writing} />
      </main>
    </>
  );
}
