'use client';

interface Feature {
  key: string;
  value: string;
}

interface PlanFeaturesListProps {
  features: Feature[];
  highlightFeatures?: string[];
}

export function PlanFeaturesList({ features, highlightFeatures = [] }: PlanFeaturesListProps) {
  if (features.length === 0) {
    return null;
  }

  // Additional filtering to ensure no "0" or invalid values slip through
  const validFeatures = features.filter((feature) => {
    const value = String(feature.value).trim();
    return (
      value !== '' &&
      value !== '0' &&
      value !== 'null' &&
      value !== 'undefined' &&
      value !== '{' &&
      value !== '}' &&
      value !== '[]' &&
      value !== '{}'
    );
  });

  if (validFeatures.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-3">
      {validFeatures.map((feature) => {
        const isHighlighted = highlightFeatures.includes(feature.key);
        return (
          <li key={feature.key} className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center ${
              isHighlighted ? 'bg-green-100' : 'bg-green-50'
            }`}>
              <svg
                className={`w-3 h-3 ${isHighlighted ? 'text-green-500' : 'text-green-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span
              className={`font-body text-sm flex-1 ${
                isHighlighted ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {feature.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}



