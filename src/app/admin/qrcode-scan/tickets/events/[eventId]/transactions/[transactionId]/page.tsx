import { fetchQrCodeUsageDetails } from './ApiServerActions';
import { QrCodeUsageDTO } from '@/types';
import CheckInFormClient from './CheckInFormClient';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTicketAlt, FaMoneyBillAlt } from 'react-icons/fa';
import LocationDisplay from '@/components/LocationDisplay';

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatTimeRange(start?: string, end?: string) {
  if (!start || !end) return '-';
  return `${start} - ${end}`;
}
function formatDateTime(dateStr?: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
}

function getTicketTypeName(ticketTypeId: number | undefined, eventTicketTypes: any[] | undefined) {
  if (!ticketTypeId || !eventTicketTypes) return '-';
  const found = eventTicketTypes.find(tt => tt.id === ticketTypeId);
  return found?.name || '-';
}

export default async function QrCodeScanPage({ params }: { params: Promise<{ eventId: string; transactionId: string }> | { eventId: string; transactionId: string } }) {
  // Await params for Next.js 15+ compatibility
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  const { eventId, transactionId } = resolvedParams;
  let qrCodeUsage: QrCodeUsageDTO | null = null;
  let fetchError: string | null = null;
  try {
    qrCodeUsage = await fetchQrCodeUsageDetails(eventId, transactionId);
  } catch (err: any) {
    if (err?.status === 404) {
      fetchError = 'No ticket or check-in record found for this QR code or transaction.';
    } else {
      fetchError = 'An error occurred while loading check-in details. Please try again later.';
    }
  }
  if (!qrCodeUsage && !fetchError) {
    fetchError = 'No ticket or check-in record found for this QR code or transaction.';
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-16 text-center">
        <div className="text-3xl font-bold text-red-600 mb-4">Check-In Not Found</div>
        <div className="text-lg text-gray-700 mb-8">{fetchError}</div>
        <div className="text-gray-500">Please verify the QR code or transaction link and try again. If you believe this is an error, contact event support.</div>
      </div>
    );
  }
  if (!qrCodeUsage) return null;

  const event = qrCodeUsage.eventDetails;
  const eventTicketTypes = qrCodeUsage.eventTicketTypes || [];
  const transaction = qrCodeUsage.transaction;
  const items = qrCodeUsage.items || [];
  const checkedIn = transaction?.status === 'CHECKED_IN' || !!qrCodeUsage.usedAt;

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Event Details Card */}
      {event && (
        <div className="bg-gray-100 rounded-2xl shadow-md p-8 mb-8 text-center">
          <div className="text-3xl font-bold mb-2">{event.title}</div>
          {event.caption && <div className="text-xl font-semibold text-teal-700 mb-2">{event.caption}</div>}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-2 text-lg text-gray-700">
            <span className="flex items-center gap-2"><FaCalendarAlt /> {formatDate(event.startDate)}</span>
            <span className="flex items-center gap-2"><FaClock /> {formatTimeRange(event.startTime, event.endTime)}</span>
            {event.location && <span className="flex items-center gap-2"><LocationDisplay location={event.location} /></span>}
          </div>
          {event.description && <div className="mt-2 text-gray-700">{event.description}</div>}
        </div>
      )}

      {/* Transaction Summary Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
          <div className="flex items-center gap-2 text-2xl font-bold text-teal-800 mb-2 sm:mb-0"><FaTicketAlt /> Transaction Summary</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-gray-500 text-sm">Name</div>
            <div className="font-semibold">{transaction?.firstName} {transaction?.lastName}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Amount Paid</div>
            <div className="font-semibold">${transaction?.totalAmount?.toFixed(2) ?? '-'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Date of Purchase</div>
            <div className="font-semibold">{formatDateTime(transaction?.purchaseDate)}</div>
          </div>
          {(transaction?.checkInStatus === 'CHECKED_IN' || qrCodeUsage.usedAt) && (
            <>
              <div>
                <div className="text-gray-500 text-sm">Check-In Status</div>
                <div className="font-semibold text-green-700">{transaction?.checkInStatus ?? '-'}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Number of Guests Checked In</div>
                <div className="font-semibold">{transaction?.numberOfGuestsCheckedIn ?? '-'}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Check-In Time</div>
                <div className="font-semibold">{formatDateTime(transaction?.checkInTime)}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ticket Breakdown Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 text-2xl font-bold text-teal-800 mb-4"><FaMoneyBillAlt /> Ticket Breakdown</div>
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="py-2">Ticket Type</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Price Per Unit</th>
              <th className="py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2">{item.ticketType?.name || getTicketTypeName(item.ticketTypeId, eventTicketTypes)}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">${item.pricePerUnit?.toFixed(2) ?? '-'}</td>
                <td className="py-2">${(item.pricePerUnit && item.quantity) ? (item.pricePerUnit * item.quantity).toFixed(2) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Check-In Form */}
      <CheckInFormClient
        eventId={eventId}
        transactionId={transactionId}
        qrCodeUsage={qrCodeUsage}
        transaction={transaction}
        items={items}
      />
    </div>
  );
}