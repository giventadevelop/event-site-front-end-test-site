import { MoscCmsHubCard } from '../components/MoscCmsHubCard';

export type LectionaryPeriod = {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
};

/** Presentational lectionary period card grid (search/pagination owned by parent page). */
export default function LectionaryPeriodsGrid({ periods }: { periods: LectionaryPeriod[] }) {
  if (periods.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
      {periods.map((period) => (
        <MoscCmsHubCard
          key={period.id}
          href={period.link}
          title={period.title}
          excerpt={period.description}
          imageUrl={period.image}
          imageAlt={period.title}
        />
      ))}
    </div>
  );
}
