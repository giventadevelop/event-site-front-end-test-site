import { MOSC_LISTING_GRID_CLASS, MoscCmsHubCard } from '../../components/MoscCmsHubCard';
import type { Bishop } from '../../directory/bishops/types';

const PLACEHOLDER_IMAGE = '/images/holy-synod/Synod-2.jpg';

/** Retired bishops from directory API (`bishopType=retired`), shown on Holy Synod category tab. */
export default function RetiredBishopsGrid({ bishops }: { bishops: Bishop[] }) {
  if (bishops.length === 0) {
    return null;
  }

  return (
    <div className={MOSC_LISTING_GRID_CLASS}>
      {bishops.map((bishop) => (
        <MoscCmsHubCard
          key={bishop.documentId}
          href={`/mosc-redesign/directory/bishops/${bishop.documentId}`}
          title={bishop.name}
          excerpt={bishop.dioceseName}
          imageUrl={bishop.imageUrl ?? PLACEHOLDER_IMAGE}
          imageAlt={bishop.imageAlt ?? bishop.name}
          ctaLabel="View details"
        />
      ))}
    </div>
  );
}
