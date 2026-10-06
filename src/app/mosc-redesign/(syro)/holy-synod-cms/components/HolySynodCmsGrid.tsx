import { MOSC_LISTING_GRID_CLASS, MoscCmsHubCard } from '../../components/MoscCmsHubCard';
import type { HolySynodMember } from '../types';

const PLACEHOLDER_IMAGE = '/images/holy-synod/Synod-2.jpg';
const BASE_PATH = '/mosc-redesign/holy-synod-cms';

/** Presentational Holy Synod card grid (search/pagination owned by parent page). */
export default function HolySynodCmsGrid({ members }: { members: HolySynodMember[] }) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className={MOSC_LISTING_GRID_CLASS}>
      {members.map((member) => (
        <MoscCmsHubCard
          key={member.documentId || member.slug}
          href={`${BASE_PATH}/${member.slug}`}
          title={member.name}
          excerpt={member.excerpt}
          imageUrl={member.imageUrl ?? PLACEHOLDER_IMAGE}
          imageAlt={member.imageAlt ?? member.name}
        />
      ))}
    </div>
  );
}
