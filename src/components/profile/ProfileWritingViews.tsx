import Image from 'next/image';
import Link from 'next/link';
import type { ProfileWritingDTO } from '@/types/profileSite';
import { formatProfileDate, getProfileWritingDetailPath } from '@/lib/profileSitePaths';

export function ProfileWritingCard({ writing }: { writing: ProfileWritingDTO }) {
  const hasExternalUrl = writing.writingType === 'EXTERNAL_LINK' && Boolean(writing.externalUrl?.trim());
  const detailPath = getProfileWritingDetailPath(writing);
  const useDetailPage = Boolean(detailPath) && (!hasExternalUrl || Boolean(writing.slug?.trim()));
  const href = useDetailPage ? detailPath! : hasExternalUrl ? writing.externalUrl! : detailPath ?? '#';
  const openExternal = hasExternalUrl && !useDetailPage;
  const dateLabel = formatProfileDate(writing.publishedAt);

  const cardInner = (
    <>
      {writing.featuredImageUrl && (
        <div className="relative w-full h-44 overflow-hidden bg-muted">
          <Image
            src={writing.featuredImageUrl}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        {writing.publicationName && (
          <span className="text-xs font-caption uppercase text-primary tracking-wide">{writing.publicationName}</span>
        )}
        {dateLabel && (
          <p className="text-xs text-muted-foreground mt-1">{dateLabel}</p>
        )}
        <h3 className="font-heading text-lg font-semibold mt-2 text-foreground">{writing.title}</h3>
        {writing.excerpt && (
          <p className="font-body text-sm text-muted-foreground mt-2 line-clamp-3">{writing.excerpt}</p>
        )}
        <p className="text-sm text-primary font-semibold mt-4">
          {openExternal ? 'Read article →' : 'Read more →'}
        </p>
      </div>
    </>
  );

  const className =
    'bg-background rounded-lg sacred-shadow overflow-hidden reverent-hover block h-full flex flex-col';

  if (openExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        id={writing.id ? `writing-${writing.id}` : undefined}
        className={className}
      >
        {cardInner}
      </a>
    );
  }

  if (useDetailPage && detailPath) {
    return (
      <Link
        href={detailPath}
        id={writing.id ? `writing-${writing.id}` : undefined}
        className={className}
      >
        {cardInner}
      </Link>
    );
  }

  return (
    <div className={className} id={writing.id ? `writing-${writing.id}` : undefined}>
      {cardInner}
    </div>
  );
}

export function ProfileWritingDetailView({ writing }: { writing: ProfileWritingDTO }) {
  const dateLabel = formatProfileDate(writing.publishedAt);
  const isExternal = writing.writingType === 'EXTERNAL_LINK' && Boolean(writing.externalUrl?.trim());

  return (
    <article className="max-w-3xl mx-auto">
      {writing.featuredImageUrl && (
        <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-sacred overflow-hidden sacred-shadow-lg mb-8">
          <Image
            src={writing.featuredImageUrl}
            alt=""
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      )}
      {writing.publicationName && (
        <p className="font-caption text-sm uppercase tracking-widest text-primary mb-2">{writing.publicationName}</p>
      )}
      <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mb-3">{writing.title}</h1>
      {dateLabel && <p className="text-sm text-muted-foreground mb-6">{dateLabel}</p>}
      {writing.excerpt && (
        <p className="font-body text-lg text-muted-foreground mb-8 leading-relaxed border-l-4 border-primary pl-4">
          {writing.excerpt}
        </p>
      )}
      {writing.body?.trim() ? (
        <div className="font-body text-lg text-foreground whitespace-pre-wrap leading-relaxed">{writing.body}</div>
      ) : (
        !isExternal && writing.excerpt && null
      )}
      {isExternal && writing.externalUrl && (
        <p className="mt-8">
          <a
            href={writing.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-sacred font-semibold reverent-hover"
          >
            Read full article at source
          </a>
        </p>
      )}
    </article>
  );
}
