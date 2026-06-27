"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FaTicketAlt, FaUser, FaEnvelope, FaCalendarAlt, FaMoneyBillWave, FaTimes, FaSpinner } from 'react-icons/fa';
import type { EventTicketTransactionDTO } from '@/types';

interface TicketDetailsModalProps {
  open: boolean;
  onClose: () => void;
  transaction: EventTicketTransactionDTO | null;
}

interface TransactionItem {
  id: number;
  ticketTypeId: number;
  ticketTypeName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export default function TicketDetailsModal({ open, onClose, transaction }: TicketDetailsModalProps) {
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && transaction?.id) {
      fetchTransactionItems();
    }
  }, [open, transaction?.id]);

  const fetchTransactionItems = async () => {
    if (!transaction?.id) return;

    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/proxy/event-ticket-transaction-items?transactionId.equals=${transaction.id}`, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction items');
      }

      const items = await response.json();
      setTransactionItems(Array.isArray(items) ? items : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !transaction) return null;

  return (
    <Modal open={open} onClose={onClose} title="Ticket Details">
      <div className="relative p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 text-xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          aria-label="Close dialog"
        >
          <FaTimes />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaTicketAlt className="text-teal-500" />
            Transaction #{transaction.id}
          </h2>

          {/* Transaction Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Transaction Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FaUser className="text-gray-500" />
                <span className="text-sm text-gray-600">Customer:</span>
                <span className="font-medium">{transaction.firstName} {transaction.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-gray-500" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="font-medium">{transaction.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500" />
                <span className="text-sm text-gray-600">Purchase Date:</span>
                <span className="font-medium">
                  {transaction.purchaseDate ? new Date(transaction.purchaseDate).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-gray-500" />
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="font-medium">${transaction.finalAmount?.toFixed(2) || transaction.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {/* Discount Information */}
            {transaction.discountAmount && transaction.discountAmount > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <span className="font-semibold">Discount Applied:</span>
                  <span className="text-green-600">-${transaction.discountAmount.toFixed(2)}</span>
                </div>
                {transaction.discountCodeId && (
                  <div className="text-sm text-green-600 mt-1">
                    Discount Code ID: {transaction.discountCodeId}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ticket Breakdown */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Ticket Breakdown</h3>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-teal-500 text-xl mr-2" />
                <span className="text-gray-600">Loading ticket details...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-700 font-medium">Error loading ticket details:</div>
                <div className="text-red-600 text-sm mt-1">{error}</div>
              </div>
            )}

            {!loading && !error && transactionItems.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-yellow-700">No ticket items found for this transaction.</div>
              </div>
            )}

            {!loading && !error && transactionItems.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Ticket Type</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Price Per Unit</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactionItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-800">
                          {item.ticketTypeName || `Ticket Type #${item.ticketTypeId}`}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">${item.pricePerUnit.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-800">${item.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-700 text-right">
                        Total:
                      </td>
                      <td className="px-4 py-2 text-sm font-semibold text-gray-800">
                        ${transactionItems.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Transaction Status */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Transaction Status</h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  transaction.status === 'REFUNDED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                {transaction.status}
              </span>
              {transaction.status === 'REFUNDED' && transaction.refundAmount && (
                <span className="text-sm text-gray-600">
                  (Refunded: ${transaction.refundAmount.toFixed(2)})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}