import Link from 'next/link';
import Image from 'next/image';
import SubpageHomeDesignBackground from '@/components/SubpageHomeDesignBackground';
import { fetchPublishedProfileWritingsServer } from '@/lib/profileSiteServer';
import { getProfileWritingDetailPath, formatProfileDate } from '@/lib/profileSitePaths';

export default async function NewsListPage() {
  const writings = await fetchPublishedProfileWritingsServer();
  const articles = writings.filter((w) => w.writingType !== 'EXTERNAL_LINK');

  return (
    <>
      <SubpageHomeDesignBackground />
      <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mb-3">News</h1>
          <p className="font-body text-muted-foreground mb-10 max-w-2xl">
            Published writings and perspectives for this site.
          </p>

          {articles.length === 0 ? (
            <p className="font-body text-muted-foreground">No published articles yet.</p>
          ) : (
            <ul className="space-y-6">
              {articles.map((writing) => {
                const href = getProfileWritingDetailPath(writing);
                const dateLabel = formatProfileDate(writing.publishedAt);
                return (
                  <li
                    key={writing.id ?? writing.slug}
                    className="bg-card rounded-lg sacred-shadow p-5 flex flex-col sm:flex-row gap-5"
                  >
                    {writing.featuredImageUrl && (
                      <div className="relative w-full sm:w-40 h-32 flex-shrink-0 rounded-sacred overflow-hidden">
                        <Image
                          src={writing.featuredImageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {dateLabel && (
                        <p className="font-caption text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          {dateLabel}
                        </p>
                      )}
                      <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
                        {href ? (
                          <Link href={href} className="hover:text-primary reverent-transition">
                            {writing.title}
                          </Link>
                        ) : (
                          writing.title
                        )}
                      </h2>
                      {writing.excerpt && (
                        <p className="font-body text-muted-foreground text-sm line-clamp-3 mb-3">
                          {writing.excerpt}
                        </p>
                      )}
                      {href && (
                        <Link href={href} className="text-sm text-primary font-semibold hover:underline">
                          Read more →
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
