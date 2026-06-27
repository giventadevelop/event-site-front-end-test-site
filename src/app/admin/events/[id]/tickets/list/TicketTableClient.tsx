"use client";
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { EventTicketTransactionDTO } from '@/types';
import { refundTicketTransactionServer } from './ApiServerActions';
import { Modal } from '@/components/Modal';
import TicketDetailsModal from './TicketDetailsModal';

function TicketDetailsTooltip({ ticket, anchorRect, onClose }: { ticket: EventTicketTransactionDTO, anchorRect: DOMRect | null, onClose: () => void }) {
  if (!anchorRect) return null;
  if (typeof window === 'undefined' || !document.body) return null;
  const tooltipWidth = 420;
  const spacing = 12;
  let top = anchorRect.top;
  let left = anchorRect.right + spacing;
  const estimatedHeight = 300;
  if (top + estimatedHeight > window.innerHeight) {
    top = window.innerHeight - estimatedHeight - spacing;
  }
  if (top < spacing) {
    top = spacing;
  }
  if (left + tooltipWidth > window.innerWidth) {
    left = window.innerWidth - tooltipWidth - spacing;
  }
  const style: React.CSSProperties = {
    position: 'fixed',
    top,
    left,
    zIndex: 9999,
    background: 'white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    padding: 16,
    width: tooltipWidth,
    fontSize: 14,
    maxHeight: 400,
    overflowY: 'auto',
    transition: 'opacity 0.1s ease-in-out',
  };
  const entries = Object.entries(ticket);
  return ReactDOM.createPortal(
    <div style={style} tabIndex={-1} className="admin-tooltip">
      <div className="sticky top-0 right-0 z-10 bg-white flex justify-end">
        <button
          onClick={onClose}
          className="w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          aria-label="Close tooltip"
        >
          &times;
        </button>
      </div>
      <table className="admin-tooltip-table">
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key}>
              <th>{key}</th>
              <td>{value === null || value === undefined || value === '' ? <span className="text-gray-400 italic">(empty)</span> : String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
    document.body
  );
}

const REFUND_REASONS = [
  'Duplicate purchase',
  'Customer request',
  'Event canceled',
  'Payment error',
  'Other',
];

function RefundModal({
  open,
  onClose,
  onConfirm,
  ticket,
  loading,
  error,
  success,
  selectedReason,
  onSelectReason,
  localError,
  showSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ticket: EventTicketTransactionDTO | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  selectedReason: string;
  onSelectReason: (reason: string) => void;
  localError: string | null;
  showSuccess: boolean;
}) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={undefined}>
      <div className="relative p-6 text-center">
        {showSuccess ? (
          <>
            <h2 className="text-xl font-bold mb-2">Refund Ticket Transaction</h2>
            <div className="flex flex-col items-center gap-2 text-green-600 font-semibold mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Refund complete</span>
            </div>
          </>
        ) : ticket ? (
          <>
            <h2 className="text-xl font-bold mb-2">Refund Ticket Transaction</h2>
            <div className="mb-4 text-gray-700">
              <span className="font-semibold">Transaction ID:</span> {ticket.id}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select refund reason:</label>
              <select
                className="form-input w-full text-base"
                value={selectedReason}
                onChange={e => onSelectReason(e.target.value)}
                disabled={loading || success}
              >
                <option value="" disabled>Select a reason</option>
                {REFUND_REASONS.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
              {localError && <div className="text-red-500 text-sm mt-2">{localError}</div>}
            </div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <div className="mt-6 flex flex-row gap-3 sm:gap-4">
              <button
                onClick={onClose}
                disabled={loading || success}
                className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Cancel"
                aria-label="Cancel"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-700">Cancel</span>
              </button>
              <button
                onClick={onConfirm}
                disabled={loading || success}
                className="flex-1 flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Process Refund"
                aria-label="Process Refund"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                  {loading ? (
                    <svg className="animate-spin w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                </div>
                <span className="font-semibold text-green-700">{loading ? 'Processing…' : 'Process Refund'}</span>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}

export default function TicketTableClient({ rows }: { rows: EventTicketTransactionDTO[] }) {
  const [popoverTicket, setPopoverTicket] = useState<EventTicketTransactionDTO | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const [emailSentId, setEmailSentId] = useState<number | null>(null);
  const [emailErrorId, setEmailErrorId] = useState<number | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundTicket, setRefundTicket] = useState<EventTicketTransactionDTO | null>(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccessId, setRefundSuccessId] = useState<number | null>(null);
  const [refundSelectedReason, setRefundSelectedReason] = useState('');
  const [refundShowSuccess, setRefundShowSuccess] = useState(false);
  const [refundLocalError, setRefundLocalError] = useState<string | null>(null);

  // Ticket details modal state
  const [ticketDetailsModalOpen, setTicketDetailsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<EventTicketTransactionDTO | null>(null);

  const handleMouseEnter = (ticket: EventTicketTransactionDTO, e: React.MouseEvent) => {
    setPopoverTicket(ticket);
    setPopoverAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
  };
  const handleClose = () => setPopoverTicket(null);

  async function handleSendEmail(ticket: EventTicketTransactionDTO) {
    setSendingEmailId(ticket.id || null);
    setEmailSentId(null);
    setEmailErrorId(null);
    try {
      // Get the current domain for email context
      const emailHostUrlPrefix = window.location.origin;

      const res = await fetch(`/api/proxy/events/${ticket.eventId}/transactions/${ticket.id}/send-ticket-email?to=${encodeURIComponent(ticket.email ?? '')}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-email-host-url-prefix': emailHostUrlPrefix
          },
        });
      if (res.ok) {
        setEmailSentId(ticket.id || null);
      } else {
        setEmailErrorId(ticket.id || null);
      }
    } catch (err) {
      setEmailErrorId(ticket.id || null);
    } finally {
      setSendingEmailId(null);
    }
  }

  const handleRefundModalClose = () => {
    setRefundModalOpen(false);
    setRefundTicket(null);
    setRefundError(null);
    setRefundSelectedReason('');
    setRefundShowSuccess(false);
    setRefundLocalError(null);
    setRefundSuccessId(null);
  };

  const handleRefundSelectReason = (reason: string) => {
    setRefundSelectedReason(reason);
    setRefundLocalError(null);
  };

  const handleRefundProcess = async () => {
    if (!refundSelectedReason) {
      setRefundLocalError('Please select a refund reason.');
      return;
    }
    setRefundLocalError(null);
    setRefundLoading(true);
    setRefundError(null);
    try {
      await refundTicketTransactionServer(refundTicket!, refundSelectedReason);
      setRefundShowSuccess(true);
      setTimeout(() => {
        setRefundShowSuccess(false);
        setRefundModalOpen(false);
        setRefundTicket(null);
        setRefundSelectedReason('');
        setRefundSuccessId(null);
        if (typeof window !== 'undefined') window.location.reload();
      }, 1500);
    } catch (err: any) {
      setRefundError(err.message || 'Refund failed');
      setRefundShowSuccess(false);
    } finally {
      setRefundLoading(false);
    }
  };

  const handleTicketDetails = (ticket: EventTicketTransactionDTO) => {
    setSelectedTicket(ticket);
    setTicketDetailsModalOpen(true);
  };

  const handleTicketDetailsClose = () => {
    setTicketDetailsModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <>
      {rows.length === 0 ? (
        <tr className="bg-blue-50 border-b border-gray-300">
          <td colSpan={7} className="text-center py-8 text-gray-500">No tickets found.</td>
        </tr>
      ) : (
        rows.map((ticket, index) => (
          <tr key={ticket.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-yellow-100 border-b border-gray-300`}>
            <td className="px-4 py-2 border-r border-gray-200" onMouseEnter={e => handleMouseEnter(ticket, e)}>{ticket.id}</td>
            <td className="px-4 py-2 border-r border-gray-200" onMouseEnter={e => handleMouseEnter(ticket, e)}>{ticket.firstName} {ticket.lastName}</td>
            <td className="px-4 py-2 border-r border-gray-200">
              <div>{ticket.email}</div>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-2">
                  <button
                    className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-4"
                    onClick={() => handleSendEmail(ticket)}
                    disabled={sendingEmailId === ticket.id}
                    title="Resend Email"
                    aria-label="Resend Email"
                    type="button"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                      <svg className={`w-6 h-6 text-blue-600 ${sendingEmailId === ticket.id ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <span className="font-semibold text-blue-700">{sendingEmailId === ticket.id ? 'Sending...' : 'Resend Email'}</span>
                  </button>
                  {sendingEmailId === (typeof ticket.id === 'number' ? ticket.id : -1) && <span className="ml-1 text-xs text-gray-400">Sending...</span>}
                  {emailSentId === (typeof ticket.id === 'number' ? ticket.id : -1) && <span className="ml-1 text-xs text-green-600">Sent!</span>}
                  {emailErrorId === (typeof ticket.id === 'number' ? ticket.id : -1) && <span className="ml-1 text-xs text-red-600">Error</span>}
                </div>
                {ticket.status === 'REFUNDED' ? (
                  <button
                    className="bg-gray-200 border border-blue-500 text-blue-600 px-3 py-1.5 rounded-lg font-semibold cursor-not-allowed w-full mt-2 shadow-sm flex flex-row items-center justify-start gap-2 text-base"
                    disabled
                  >
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Refunded</span>
                  </button>
                ) : (
                  <button
                    className="w-full flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 mt-2"
                    onClick={() => { setRefundTicket(ticket); setRefundModalOpen(true); setRefundError(null); }}
                    title="Refund"
                    aria-label="Refund"
                    type="button"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-red-700">Refund</span>
                  </button>
                )}
                <button
                  className="w-full flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 mt-2"
                  onClick={() => handleTicketDetails(ticket)}
                  title="Ticket Details"
                  aria-label="Ticket Details"
                  type="button"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-teal-700">Ticket</span>
                </button>
              </div>
            </td>
            <td className="px-4 py-2 border-r border-gray-200">{ticket.quantity}</td>
            <td className="px-4 py-2 border-r border-gray-200">${ticket.finalAmount?.toFixed(2)}</td>
            <td className="px-4 py-2 border-r border-gray-200">{ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleString() : ''}</td>
            <td className="px-4 py-2">{ticket.status}</td>
          </tr>
        ))
      )}
      {popoverTicket && (
        <TicketDetailsTooltip
          ticket={popoverTicket}
          anchorRect={popoverAnchor}
          onClose={handleClose}
        />
      )}
      <RefundModal
        open={refundModalOpen || refundShowSuccess}
        onClose={handleRefundModalClose}
        onConfirm={handleRefundProcess}
        ticket={refundTicket}
        loading={refundLoading}
        error={refundError}
        success={refundShowSuccess}
        selectedReason={refundSelectedReason}
        onSelectReason={handleRefundSelectReason}
        localError={refundLocalError}
        showSuccess={refundShowSuccess}
      />
      <TicketDetailsModal
        open={ticketDetailsModalOpen}
        onClose={handleTicketDetailsClose}
        transaction={selectedTicket}
      />
    </>
  );
}