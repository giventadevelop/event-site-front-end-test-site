import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import SubpageHomeDesignBackground from '@/components/SubpageHomeDesignBackground';
import { fetchProfileMediaAssetByIdServer } from '@/lib/profileSiteServer';

interface DownloadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DownloadDetailPage({ params }: DownloadDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!numericId || Number.isNaN(numericId)) {
    notFound();
  }
  const asset = await fetchProfileMediaAssetByIdServer(numericId);
  if (!asset || asset.isDownloadable === false) {
    notFound();
  }

  return (
    <>
      <SubpageHomeDesignBackground />
      <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-3xl mx-auto">
          <Link href="/downloads" className="text-primary font-semibold hover:underline text-sm">
            ← Back to downloads
          </Link>

          {asset.coverImageUrl && (
            <div className="relative w-full h-48 sm:h-64 rounded-sacred overflow-hidden sacred-shadow-lg mt-8 mb-8">
              <Image src={asset.coverImageUrl} alt="" fill className="object-cover" priority unoptimized />
            </div>
          )}

          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mb-4">{asset.title}</h1>
          {asset.fileType && (
            <p className="text-sm uppercase tracking-wide text-muted-foreground mb-6">{asset.fileType}</p>
          )}
          {asset.description && (
            <div className="font-body text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed mb-8">
              {asset.description}
            </div>
          )}

          <a
            href={asset.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-sacred font-semibold reverent-hover"
          >
            Download file
          </a>
        </div>
      </main>
    </>
  );
}
