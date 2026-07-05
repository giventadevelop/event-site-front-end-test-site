'use client';

import {
  ADSENSE_REGION_IDS,
  ADSENSE_REGION_LABELS,
  type AdsensePlacementFields,
  type AdsenseRegionId,
} from '@/lib/adsense/parseAdsensePlacements';

interface GoogleAdsensePlacementsFieldsProps {
  value: AdsensePlacementFields;
  onChange: (fields: AdsensePlacementFields) => void;
  fieldErrors?: Partial<Record<AdsenseRegionId, string>>;
  onFieldBlur?: (regionId: AdsenseRegionId) => void;
}

export default function GoogleAdsensePlacementsFields({
  value,
  onChange,
  fieldErrors = {},
  onFieldBlur,
}: GoogleAdsensePlacementsFieldsProps) {
  const handleChange = (regionId: AdsenseRegionId, slotId: string) => {
    onChange({ ...value, [regionId]: slotId });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-1">Ad unit slot IDs by page region</p>
        <p className="text-xs text-gray-500">
          Optional. Enter the numeric slot ID from Google AdSense for each region you want to show ads.
          Leave blank to skip a region.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {ADSENSE_REGION_IDS.map((regionId) => (
          <div key={regionId}>
            <label htmlFor={`adsense-slot-${regionId}`} className="block text-sm font-medium text-gray-700 mb-1">
              {ADSENSE_REGION_LABELS[regionId]}
            </label>
            <p className="text-xs text-gray-500 mb-1 font-mono">{regionId}</p>
            <input
              id={`adsense-slot-${regionId}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value[regionId]}
              onChange={(e) => handleChange(regionId, e.target.value)}
              onBlur={() => onFieldBlur?.(regionId)}
              className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base font-mono text-sm ${
                fieldErrors[regionId]
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-400 focus:border-blue-500'
              }`}
              placeholder="1234567890"
              aria-invalid={fieldErrors[regionId] ? true : undefined}
            />
            {fieldErrors[regionId] && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors[regionId]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
