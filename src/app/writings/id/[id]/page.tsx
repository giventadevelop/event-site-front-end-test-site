import Link from 'next/link';
import { notFound } from 'next/navigation';
import SubpageHomeDesignBackground from '@/components/SubpageHomeDesignBackground';
import { ProfileWritingDetailView } from '@/components/profile/ProfileWritingViews';
import { fetchProfileWritingByIdServer } from '@/lib/profileSiteServer';

interface WritingIdPageProps {
  params: Promise<{ id: string }>;
}

export default async function WritingIdPage({ params }: WritingIdPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!numericId || Number.isNaN(numericId)) {
    notFound();
  }
  const writing = await fetchProfileWritingByIdServer(numericId);
  if (!writing) {
    notFound();
  }

  return (
    <>
      <SubpageHomeDesignBackground />
      <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto mb-8">
          <Link href="/news" className="text-primary font-semibold hover:underline text-sm">
            ← Back to news
          </Link>
        </div>
        <ProfileWritingDetailView writing={writing} />
      </main>
    </>
  );
}
