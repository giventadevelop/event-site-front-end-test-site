"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEventTicketTransactionCheckIn } from "./ApiServerActions";
import type { QrCodeUsageDTO, EventTicketTransactionDTO, EventTicketTransactionItemDTO } from "@/types";
import { FaQrcode, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function CheckInFormClient({
  eventId,
  transactionId,
  qrCodeUsage,
  transaction,
  items,
}: {
  eventId: string;
  transactionId: string;
  qrCodeUsage: QrCodeUsageDTO;
  transaction: EventTicketTransactionDTO | undefined;
  items: EventTicketTransactionItemDTO[];
}) {
  const router = useRouter();
  const [usageCount, setUsageCount] = useState(transaction?.numberOfGuestsCheckedIn ?? 0);
  const [checkedIn, setCheckedIn] = useState(transaction?.checkInStatus === "CHECKED_IN" || transaction?.status === "CHECKED_IN");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxCheckIn = transaction?.quantity || items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    if (usageCount > maxCheckIn) {
      setError(`Cannot check in more than ${maxCheckIn} people (total tickets purchased).`);
      return;
    }
    startTransition(async () => {
      try {
        await updateEventTicketTransactionCheckIn(transactionId, {
          checkInStatus: checkedIn ? "CHECKED_IN" : "NOT_CHECKED_IN",
          numberOfGuestsCheckedIn: usageCount,
          checkInTime: checkedIn ? new Date().toISOString() : undefined,
        });
        setSuccess(true);
        // Keep success message visible longer
        setTimeout(() => setSuccess(false), 5000);
      } catch (err) {
        setError("Failed to update check-in. Please try again.");
      }
    });
  };

  const handleScanAnother = () => {
    router.push("/admin/qr-scanner");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of People Checking In</label>
          <input
            type="number"
            name="usageCount"
            min={1}
            max={maxCheckIn}
            value={usageCount}
            onChange={e => setUsageCount(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
          <div className="text-xs text-gray-500 mt-1">Max: {maxCheckIn}</div>
        </div>
        <div className="mb-4">
          <label className="flex flex-col items-center">
            <span className="relative flex items-center justify-center">
              <input
                type="checkbox"
                name="checkedIn"
                checked={checkedIn}
                onChange={e => setCheckedIn(e.target.checked)}
                className="custom-checkbox"
                onClick={e => e.stopPropagation()}
              />
              <span className="custom-checkbox-tick">
                {checkedIn && (
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                  </svg>
                )}
              </span>
            </span>
            <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Check-in is done</span>
          </label>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-green-800 font-semibold mb-1">Check-In Successful!</h3>
                <p className="text-green-700 text-sm">
                  {checkedIn
                    ? `${usageCount} guest${usageCount !== 1 ? 's' : ''} checked in successfully.`
                    : 'Check-in status updated successfully.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaTimesCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-1">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Check-In"
            )}
          </button>

          <button
            type="button"
            onClick={handleScanAnother}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FaQrcode className="w-5 h-5" />
            Scan Another QR Code
          </button>
        </div>
      </form>
    </div>
  );
}