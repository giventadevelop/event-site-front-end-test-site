import type { Metadata } from 'next';
import { pilgrimCentresData } from '../pilgrimCentresData';

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
  children: React.ReactNode;
};

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved =
    typeof (params as Promise<{ slug: string }>).then === 'function'
      ? await (params as Promise<{ slug: string }>)
      : (params as { slug: string });
  const slug = resolved?.slug || '';
  const entry = pilgrimCentresData.find((c) => c.slug === slug);
  const title = entry?.name || humanizeSlug(slug) || 'Pilgrim Centre';
  return {
    title,
    description:
      entry?.description ||
      `${title} – pilgrim centre of the Malankara Orthodox Syrian Church.`,
    keywords: [title, 'Pilgrim Centres', 'Malankara Orthodox Syrian Church', 'MOSC'],
  };
}

export default function PilgrimCentreSlugLayout({ children }: Props) {
  return children;
}
