'use client';

interface RecurringDonationToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function RecurringDonationToggle({
  enabled,
  onChange,
}: RecurringDonationToggleProps) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
        />
        <span className="ml-2 text-sm font-medium text-gray-700">
          Make this a recurring donation
        </span>
      </label>
    </div>
  );
}
