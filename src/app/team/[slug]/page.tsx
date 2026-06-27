import Link from 'next/link';
import { notFound } from 'next/navigation';
import SquadMemberCard from '@/components/squad/SquadMemberCard';
import { parseTeamGroupsResponse } from '@/lib/parseTeamGroupsResponse';
import { parseTeamMembersResponse } from '@/lib/parseTeamMembersResponse';
import styles from '@/components/squad/SquadRosterSection.module.css';

interface TeamSlugPageProps {
  params: Promise<{ slug: string }>;
}

async function fetchGroupBySlug(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    'slug.equals': slug,
    'isActive.equals': 'true',
  });
  const res = await fetch(`${baseUrl}/api/proxy/team-groups?${params}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  const groups = parseTeamGroupsResponse(data);
  return groups[0] ?? null;
}

async function fetchMembersForGroup(groupId: number) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    'teamGroupId.equals': String(groupId),
    'isActive.equals': 'true',
    sort: 'priorityOrder,asc',
  });
  const res = await fetch(`${baseUrl}/api/proxy/team-members?${params}`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return parseTeamMembersResponse(data);
}

export default async function TeamSlugPage({ params }: TeamSlugPageProps) {
  const { slug } = await params;
  const group = await fetchGroupBySlug(slug);
  if (!group?.id) {
    notFound();
  }
  const members = await fetchMembersForGroup(group.id);
  const headline = group.headline?.trim() || group.name;

  return (
    <main className={styles.section} style={{ minHeight: '60vh', paddingTop: '8rem' }}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{group.sectionLabel?.trim() || 'SQUAD'}</p>
        <h1 className={styles.headline}>{headline}</h1>
        {group.description && (
          <p style={{ textAlign: 'center', color: '#94a3b8', maxWidth: '40rem', margin: '0 auto 2rem' }}>
            {group.description}
          </p>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(11.5rem, 1fr))',
            gap: '1.25rem',
            justifyItems: 'center',
          }}
        >
          {members.map((m) => (
            <SquadMemberCard key={m.id} member={m} lineupFallback={group.name} />
          ))}
        </div>
        {members.length === 0 && <p className={styles.empty}>No active members in this roster.</p>}
        <div className={styles.ctaWrap}>
          <Link href="/" className={styles.cta}>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
