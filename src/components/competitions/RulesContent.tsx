import type { EventCompetitionContentBlockDTO } from '@/types';

interface Props {
  blocks: EventCompetitionContentBlockDTO[];
}

export default function RulesContent({ blocks }: Props) {
  if (blocks.length === 0) {
    return <p className="text-muted-foreground">Rules and information will be posted soon.</p>;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <article key={block.id} className="bg-card rounded-lg sacred-shadow p-6">
          {block.title && <h2 className="font-heading font-semibold text-xl text-foreground mb-3">{block.title}</h2>}
          <div className="font-body text-muted-foreground whitespace-pre-wrap">{block.bodyMarkdown}</div>
        </article>
      ))}
    </div>
  );
}
