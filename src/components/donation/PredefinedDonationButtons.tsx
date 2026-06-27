'use client';

interface PredefinedDonationButtonsProps {
  onAmountSelect: (amount: number) => void;
  selectedAmount: number | null;
  presets?: number[]; // Default: [5, 10, 25, 50, 100]
}

export default function PredefinedDonationButtons({
  onAmountSelect,
  selectedAmount,
  presets = [5, 10, 25, 50, 100],
}: PredefinedDonationButtonsProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Amount</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {presets.map((amount) => (
          <button
            key={amount}
            onClick={() => onAmountSelect(amount)}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              selectedAmount === amount
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            type="button"
          >
            ${amount}
          </button>
        ))}
      </div>
    </div>
  );
}
