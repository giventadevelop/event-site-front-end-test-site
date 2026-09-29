'use client';

import EventFormHelpTooltip from '@/components/EventFormHelpTooltip';

interface Props {
  title: string;
  summary: string;
  help: string;
}

export default function CompetitionAdminHelpStrip({ title, summary, help }: Props) {
  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-gray-700">{summary}</span>
      <EventFormHelpTooltip
        fieldName={title}
        title={title}
        customContent={<p className="text-sm text-gray-700 leading-relaxed">{help}</p>}
      />
    </div>
  );
}
