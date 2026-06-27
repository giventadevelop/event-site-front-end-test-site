'use client';

interface PrayerIntentionInputProps {
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}

export default function PrayerIntentionInput({
  value,
  onChange,
  optional = true,
}: PrayerIntentionInputProps) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        Prayer Intention {optional && <span className="text-gray-500">(Optional)</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your prayer intention..."
        rows={3}
        className="w-full px-4 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
        maxLength={500}
      />
      <div className="text-sm text-gray-500 mt-1">
        {value.length}/500 characters
      </div>
    </div>
  );
}
