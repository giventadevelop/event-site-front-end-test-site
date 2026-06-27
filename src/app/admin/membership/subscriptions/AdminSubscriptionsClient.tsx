'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AdminNavigation from '@/components/AdminNavigation';
import { Modal } from '@/components/Modal';
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { cancelUserSubscriptionServer, getSubscriptionDetailsServer } from './ApiServerActions';
import type { MembershipSubscriptionDTO } from '@/types';

interface AdminSubscriptionsClientProps {
  subscriptions: MembershipSubscriptionDTO[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  error: string | null;
}

export function AdminSubscriptionsClient({
  subscriptions,
  totalCount,
  currentPage,
  pageSize,
  error,
}: AdminSubscriptionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<MembershipSubscriptionDTO | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSubscriptionId, setCancelSubscriptionId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const currentStatus = searchParams.get('status') || '';

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = (currentPage - 1) * pageSize + subscriptions.length;

  const handleCancelClick = (subscriptionId: number) => {
    setCancelSubscriptionId(subscriptionId);
    setCancelError(null);
    setCancelSuccess(false);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelSubscriptionId) return;

    try {
      setIsLoading(cancelSubscriptionId);
      setCancelError(null);
      await cancelUserSubscriptionServer(cancelSubscriptionId);
      setCancelSuccess(true);
      // Wait a moment to show success message, then refresh
      setTimeout(() => {
        setShowCancelModal(false);
        setCancelSubscriptionId(null);
        setCancelSuccess(false);
        router.refresh();
      }, 1500);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(null);
    }
  };

  const handleCancelModalClose = () => {
    if (!isLoading) {
      setShowCancelModal(false);
      setCancelSubscriptionId(null);
      setCancelError(null);
      setCancelSuccess(false);
    }
  };

  const handleViewDetails = async (subscriptionId: number) => {
    try {
      setIsLoading(subscriptionId);
      const details = await getSubscriptionDetailsServer(subscriptionId);
      if (details) {
        setSelectedSubscription(details);
        setShowDetailsModal(true);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load subscription details');
    } finally {
      setIsLoading(null);
    }
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1'); // Reset to first page when filtering
    router.push(`/admin/membership/subscriptions?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">User Subscriptions</h1>
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <Link
          href="/admin"
          className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Back to Admin"
          aria-label="Back to Admin"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="font-semibold text-indigo-700">Back to Admin</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Subscriptions</h1>
          <p className="text-gray-600">
            View and manage all user subscriptions in the system.
          </p>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNavigation currentPage="membership-subscriptions" />

      {/* Status Filter */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
        <select
          value={currentStatus}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="border border-gray-400 rounded-xl px-4 py-2 text-base focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIAL">Trial</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="PAST_DUE">Past Due</option>
          <option value="EXPIRED">Expired</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="font-body text-muted-foreground">No subscriptions found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">User</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Plan</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Period Start</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Period End</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-body text-sm text-foreground">
                      {subscription.userProfile?.firstName} {subscription.userProfile?.lastName}
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-muted-foreground">
                      {subscription.userProfile?.email || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-foreground">
                      {subscription.membershipPlan?.planName || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-body text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          subscription.subscriptionStatus === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : subscription.subscriptionStatus === 'TRIAL'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {subscription.subscriptionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-foreground">
                      {formatDate(subscription.currentPeriodStart)}
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-foreground">
                      {formatDate(subscription.currentPeriodEnd)}
                    </td>
                    <td className="py-3 px-4 font-body text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => subscription.id && handleViewDetails(subscription.id)}
                          disabled={isLoading === subscription.id}
                          className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="View Details"
                          aria-label="View subscription details"
                        >
                          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {subscription.subscriptionStatus === 'ACTIVE' || subscription.subscriptionStatus === 'TRIAL' ? (
                          <button
                            onClick={() => subscription.id && handleCancelClick(subscription.id)}
                            disabled={isLoading === subscription.id}
                            className="flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel Subscription"
                            aria-label="Cancel subscription"
                          >
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <button
                  disabled={!hasPrevPage}
                  onClick={() => router.push(`/admin/membership/subscriptions?page=${currentPage - 1}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                <div className="text-sm font-semibold">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  disabled={!hasNextPage}
                  onClick={() => router.push(`/admin/membership/subscriptions?page=${currentPage + 1}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                Showing {startItem} to {endItem} of {totalCount} items
              </div>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-blue-500 relative">
            {/* Colored Header Section */}
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-semibold text-2xl mb-1">Subscription Details</h2>
                  <p className="text-blue-100 text-sm">ID: {selectedSubscription.id}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedSubscription(null);
                  }}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User & Plan Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-5 border-2 border-blue-200 shadow-sm">
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2 block">User</label>
                    <p className="text-base font-semibold text-gray-800 mb-1">
                      {selectedSubscription.userProfile?.firstName} {selectedSubscription.userProfile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedSubscription.userProfile?.email}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-teal-100">
                    <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2 block">Plan</label>
                    <p className="text-base font-semibold text-gray-800">{selectedSubscription.membershipPlan?.planName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Status & Cancellation Info Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-200 shadow-sm">
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2 block">Status</label>
                    <p className="text-sm text-foreground">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${
                          selectedSubscription.subscriptionStatus === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : selectedSubscription.subscriptionStatus === 'TRIAL'
                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                            : selectedSubscription.subscriptionStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-800 border-2 border-red-300'
                            : 'bg-gray-100 text-gray-800 border-2 border-gray-300'
                        }`}
                      >
                        {selectedSubscription.subscriptionStatus}
                      </span>
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-pink-100">
                    <label className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2 block">Cancel at Period End</label>
                    <p className={`text-base font-semibold ${selectedSubscription.cancelAtPeriodEnd ? 'text-red-600' : 'text-gray-800'}`}>
                      {selectedSubscription.cancelAtPeriodEnd ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Period Dates Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-200 shadow-sm">
                <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Current Period
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <label className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2 block">Period Start</label>
                    <p className="text-sm font-medium text-gray-800">{formatDate(selectedSubscription.currentPeriodStart)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-emerald-100">
                    <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 block">Period End</label>
                    <p className="text-sm font-medium text-gray-800">{formatDate(selectedSubscription.currentPeriodEnd)}</p>
                  </div>
                </div>
              </div>

              {/* Trial Period Card (if applicable) */}
              {selectedSubscription.trialStart && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-5 border-2 border-yellow-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Trial Period
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white rounded-lg p-4 border border-yellow-100">
                      <label className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-2 block">Trial Start</label>
                      <p className="text-sm font-medium text-gray-800">{formatDate(selectedSubscription.trialStart)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-100">
                      <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2 block">Trial End</label>
                      <p className="text-sm font-medium text-gray-800">{formatDate(selectedSubscription.trialEnd || '')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Info Card (if applicable) */}
              {selectedSubscription.cancelledAt && (
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-5 border-2 border-red-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancellation Details
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-red-100 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 block">Cancelled At</label>
                      <p className="text-sm font-medium text-gray-800">{formatDate(selectedSubscription.cancelledAt)}</p>
                    </div>
                    {selectedSubscription.cancellationReason && (
                      <div>
                        <label className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 block">Cancellation Reason</label>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">{selectedSubscription.cancellationReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stripe Information Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-lg p-5 border-2 border-indigo-200 shadow-sm">
                <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Stripe Information
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white rounded-lg p-4 border border-indigo-100">
                    <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2 block">Subscription ID</label>
                    <p className="text-xs text-gray-800 font-mono break-all">{selectedSubscription.stripeSubscriptionId || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-violet-100">
                    <label className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2 block">Customer ID</label>
                    <p className="text-xs text-gray-800 font-mono break-all">{selectedSubscription.stripeCustomerId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Timestamps Card */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timestamps
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Created At</label>
                    <p className="text-sm font-medium text-gray-800">{formatDate(selectedSubscription.createdAt || '')}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-100">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">Updated At</label>
                    <p className="text-sm font-medium text-gray-800">{formatDate(selectedSubscription.updatedAt || '')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Close Button */}
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-4 rounded-b-lg border-t-2 border-blue-200">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedSubscription(null);
                  }}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        open={showCancelModal}
        onClose={handleCancelModalClose}
        title={cancelSuccess ? undefined : "Cancel Subscription"}
        preventBackdropClose={isLoading !== null}
      >
        <div className="relative p-6 text-center">
          {cancelSuccess ? (
            <>
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-3xl text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800">Subscription Cancelled</h3>
                <p className="text-sm text-gray-700">The subscription has been successfully cancelled.</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-3xl text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Confirm Cancellation</h3>
                <p className="text-sm text-gray-700">
                  Are you sure you want to cancel this subscription? This action will change the status to CANCELLED.
                </p>
              </div>

              {cancelError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{cancelError}</p>
                </div>
              )}

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleCancelModalClose}
                  disabled={isLoading !== null}
                  className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-6 py-2 rounded-md flex items-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={isLoading !== null}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md flex items-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading !== null ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaExclamationTriangle /> Confirm Cancellation
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

