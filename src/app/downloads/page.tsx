import Link from 'next/link';
import Image from 'next/image';
import SubpageHomeDesignBackground from '@/components/SubpageHomeDesignBackground';
import { fetchDownloadableProfileMediaAssetsServer } from '@/lib/profileSiteServer';

export default async function DownloadsListPage() {
  const assets = await fetchDownloadableProfileMediaAssetsServer();

  return (
    <>
      <SubpageHomeDesignBackground />
      <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mb-3">
            Downloads
          </h1>
          <p className="font-body text-muted-foreground mb-10 max-w-2xl">
            Documents and media files available for download.
          </p>

          {assets.length === 0 ? (
            <p className="font-body text-muted-foreground">No downloads available yet.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {assets.map((asset) => (
                <li key={asset.id ?? asset.fileUrl} className="bg-card rounded-lg sacred-shadow overflow-hidden flex flex-col">
                  {asset.coverImageUrl && (
                    <div className="relative w-full h-40">
                      <Image
                        src={asset.coverImageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="font-heading text-lg font-semibold text-foreground mb-1">
                      {asset.title}
                    </h2>
                    {asset.fileType && (
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                        {asset.fileType}
                      </p>
                    )}
                    {asset.description && (
                      <p className="font-body text-sm text-muted-foreground line-clamp-3 mb-4">
                        {asset.description}
                      </p>
                    )}
                    <div className="mt-auto flex flex-wrap gap-3">
                      {asset.id != null && (
                        <Link
                          href={`/downloads/${asset.id}`}
                          className="text-sm text-primary font-semibold hover:underline"
                        >
                          View details
                        </Link>
                      )}
                      <a
                        href={asset.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary font-semibold hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
