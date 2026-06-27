'use client';

interface DonationAmountSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export default function DonationAmountSelector({
  value,
  onChange,
  error,
  placeholder = 'Enter custom amount',
}: DonationAmountSelectorProps) {
  return (
    <div className="mb-6">
      <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
        Custom Amount
      </label>
      <input
        id="customAmount"
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          // Allow only numbers and decimal point
          const inputValue = e.target.value.replace(/[^0-9.]/g, '');
          onChange(inputValue);
        }}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-blue-500 text-base ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-400 focus:border-blue-500'
        }`}
      />
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </div>
  );
}
