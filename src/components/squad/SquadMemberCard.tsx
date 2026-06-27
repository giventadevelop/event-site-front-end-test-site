'use client';

import Image from 'next/image';
import type { TeamMemberDTO } from '@/types/teamMember';
import styles from './SquadRosterSection.module.css';

interface SquadMemberCardProps {
  member: TeamMemberDTO;
  lineupFallback?: string;
}

export default function SquadMemberCard({ member, lineupFallback }: SquadMemberCardProps) {
  const displayName = `${member.firstName} ${member.lastName}`.trim();
  const subtitle =
    member.lineupSubtitle?.trim() ||
    member.position?.trim() ||
    lineupFallback ||
    member.title;

  return (
    <article className={styles.card}>
      <div className={styles.cardImageWrap}>
        {member.jerseyNumber != null && (
          <span className={styles.jerseyBadge} aria-hidden="true">
            {member.jerseyNumber}
          </span>
        )}
        {member.profileImageUrl ? (
          <Image
            src={member.profileImageUrl}
            alt={displayName}
            width={320}
            height={400}
            className={styles.cardImage}
            unoptimized
          />
        ) : (
          <div className={styles.cardPlaceholder} aria-hidden="true">
            {member.firstName?.charAt(0) ?? '?'}
          </div>
        )}
      </div>
      <h3 className={styles.cardName}>{displayName}</h3>
      {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
    </article>
  );
}
