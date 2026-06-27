'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { TeamGroupDTO } from '@/types/teamGroup';
import type { TeamMemberDTO } from '@/types/teamMember';
import { parseTeamGroupsResponse } from '@/lib/parseTeamGroupsResponse';
import { parseTeamMembersResponse } from '@/lib/parseTeamMembersResponse';
import SquadMemberCard from './SquadMemberCard';
import styles from './SquadRosterSection.module.css';

export default function SquadRosterSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [group, setGroup] = useState<TeamGroupDTO | null>(null);
  const [members, setMembers] = useState<TeamMemberDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const groupsRes = await fetch(
          '/api/proxy/team-groups?isActive.equals=true&sort=displayOrder,asc',
          { cache: 'no-store' }
        );
        if (!groupsRes.ok) {
          if (!cancelled) {
            setGroup(null);
            setMembers([]);
          }
          return;
        }
        const groupsData = await groupsRes.json();
        const groups = parseTeamGroupsResponse(groupsData);
        const primary = groups[0] ?? null;
        if (!primary?.id) {
          if (!cancelled) {
            setGroup(null);
            setMembers([]);
          }
          return;
        }
        if (!cancelled) setGroup(primary);

        const membersRes = await fetch(
          `/api/proxy/team-members?teamGroupId.equals=${primary.id}&isActive.equals=true&sort=priorityOrder,asc`,
          { cache: 'no-store' }
        );
        if (!membersRes.ok) {
          if (!cancelled) setMembers([]);
          return;
        }
        const membersData = await membersRes.json();
        if (!cancelled) {
          setMembers(parseTeamMembersResponse(membersData));
        }
      } catch (e) {
        console.error('[SquadRosterSection] load failed', e);
        if (!cancelled) {
          setGroup(null);
          setMembers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollBy = useCallback((delta: number) => {
    trackRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <section className={styles.section} aria-label="Team roster">
        <div className={styles.inner}>
          <p className={styles.loading}>Loading roster…</p>
        </div>
      </section>
    );
  }

  if (!group || members.length === 0) {
    return null;
  }

  const eyebrow = group.sectionLabel?.trim() || 'SQUAD';
  const headline = group.headline?.trim() || group.name;
  const ctaLabel = group.ctaLabel?.trim() || 'View all players';
  const ctaHref =
    group.ctaHref?.trim() ||
    (group.slug ? `/team/${group.slug}` : '/team');

  return (
    <section className={styles.section} aria-label={headline}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.headline}>{headline}</h2>

        <div className={styles.carouselWrap}>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navPrev}`}
            aria-label="Previous players"
            onClick={() => scrollBy(-280)}
          >
            ‹
          </button>
          <div ref={trackRef} className={styles.track} role="list">
            {members.map((m) => (
              <div key={m.id ?? `${m.firstName}-${m.lastName}`} role="listitem">
                <SquadMemberCard member={m} lineupFallback={group.name} />
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navNext}`}
            aria-label="Next players"
            onClick={() => scrollBy(280)}
          >
            ›
          </button>
        </div>

        <div className={styles.ctaWrap}>
          <Link href={ctaHref} className={styles.cta}>
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
