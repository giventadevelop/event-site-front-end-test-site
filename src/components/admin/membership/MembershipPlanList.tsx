'use client';

import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import type { MembershipPlanDTO } from '@/types';
import {
  deleteMembershipPlanServer,
  togglePlanActiveStatusServer,
} from '@/app/admin/membership/plans/ApiServerActions';
import { useRouter } from 'next/navigation';
import { DeletePlanConfirmationDialog } from './DeletePlanConfirmationDialog';
import { ValidationErrorDialog } from './ValidationErrorDialog';

type DeleteStatus = 'confirming' | 'deleting' | 'success' | 'error';

interface MembershipPlanListProps {
  plans: MembershipPlanDTO[];
  onEdit: (plan: MembershipPlanDTO) => void;
  onPlanUpdate?: (updatedPlan: MembershipPlanDTO) => void;
  onPlanDelete?: (deletedPlanId: number) => void;
}

// Plan Details Tooltip Component (following UI standards)
function PlanDetailsTooltip({ plan, anchorRect, onClose }: { plan: MembershipPlanDTO | null, anchorRect: DOMRect | null, onClose: () => void }) {
  if (!anchorRect || !plan) return null;

  const tooltipWidth = 450;
  const spacing = 12;

  // Always show tooltip to the right of the anchor cell, never above the columns
  let top = anchorRect.top;
  let left = anchorRect.right + spacing;

  // Clamp position to stay within the viewport
  const estimatedHeight = 400;
  if (top + estimatedHeight > window.innerHeight) {
    top = window.innerHeight - estimatedHeight - spacing;
  }
  if (top < spacing) {
    top = spacing;
  }
  if (left + tooltipWidth > window.innerWidth - spacing) {
    left = window.innerWidth - tooltipWidth - spacing;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 9999,
    background: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    padding: '16px',
    width: `${tooltipWidth}px`,
    fontSize: '14px',
    maxHeight: '500px',
    overflowY: 'auto',
    transition: 'opacity 0.1s ease-in-out',
  };

  const formatCurrency = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '(empty)';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const details = [
    { label: 'Plan Name', value: plan.planName || '(empty)' },
    { label: 'Plan Code', value: plan.planCode || '(empty)' },
    { label: 'Description', value: plan.description || '(empty)' },
    { label: 'Plan Type', value: plan.planType || '(empty)' },
    { label: 'Billing Interval', value: plan.billingInterval || '(empty)' },
    { label: 'Price', value: formatCurrency(plan.price || 0, plan.currency) },
    { label: 'Currency', value: plan.currency || '(empty)' },
    { label: 'Trial Days', value: plan.trialDays?.toString() || '0' },
    { label: 'Status', value: plan.isActive ? 'Active' : 'Inactive' },
    { label: 'Max Events Per Month', value: plan.maxEventsPerMonth?.toString() || 'Unlimited' },
    { label: 'Max Attendees Per Event', value: plan.maxAttendeesPerEvent?.toString() || 'Unlimited' },
    { label: 'Stripe Product ID', value: plan.stripeProductId || '(Not yet created)' },
    { label: 'Stripe Price ID', value: plan.stripePriceId || '(Not yet created)' },
    { label: 'Created At', value: formatDate(plan.createdAt) },
    { label: 'Updated At', value: formatDate(plan.updatedAt) },
  ];

  return ReactDOM.createPortal(
    <div
      style={style}
      tabIndex={-1}
      className="admin-tooltip"
    >
      <div className="sticky top-0 right-0 z-10 bg-white flex justify-end" style={{ minHeight: 0 }}>
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
          {details.map(({ label, value }) => (
            <tr key={label}>
              <th>{label}</th>
              <td>{value === null || value === undefined || value === '' ? <span className="text-gray-400 italic">(empty)</span> : String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
    document.body
  );
}

export function MembershipPlanList({ plans, onEdit, onPlanUpdate, onPlanDelete }: MembershipPlanListProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatus>('confirming');
  const [planToDelete, setPlanToDelete] = useState<MembershipPlanDTO | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  const [hoveredPlanId, setHoveredPlanId] = useState<number | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);
  const [tooltipPlan, setTooltipPlan] = useState<MembershipPlanDTO | null>(null);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);

  const handleDeleteClick = (plan: MembershipPlanDTO) => {
    setPlanToDelete(plan);
    setDeleteStatus('confirming');
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete?.id) return;

    try {
      setDeleteStatus('deleting');
      await deleteMembershipPlanServer(planToDelete.id);
      setDeleteStatus('success');

      // Remove plan from local state immediately
      if (onPlanDelete) {
        onPlanDelete(planToDelete.id);
      }

      // Auto-close after 2 seconds on success
      setTimeout(() => {
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
        setDeleteStatus('confirming');
        router.refresh(); // Refresh to sync with server
      }, 2000);
    } catch (err) {
      setDeleteStatus('error');
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete plan');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
    setDeleteStatus('confirming');
    setDeleteError(null);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
    setDeleteStatus('confirming');
    setDeleteError(null);
    router.refresh();
  };

  const handleToggleActive = async (planId: number, currentStatus: boolean) => {
    try {
      setIsLoading(planId);
      const newStatus = !currentStatus;

      // Optimistically update the UI immediately
      const plan = plans.find(p => p.id === planId);
      if (plan && onPlanUpdate) {
        const updatedPlan = { ...plan, isActive: newStatus };
        onPlanUpdate(updatedPlan);
      }

      // Then update on the server
      const updatedPlan = await togglePlanActiveStatusServer(planId, newStatus);

      // Update with server response to ensure consistency
      if (onPlanUpdate) {
        onPlanUpdate(updatedPlan);
      }

      // Refresh router to sync with server
      router.refresh();
    } catch (err) {
      // Revert optimistic update on error
      const plan = plans.find(p => p.id === planId);
      if (plan && onPlanUpdate) {
        onPlanUpdate(plan); // Revert to original state
      }
      setErrorDialogMessage(err instanceof Error ? err.message : 'Failed to update plan status');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(null);
    }
  };

  const handlePlanNameMouseEnter = (plan: MembershipPlanDTO, event: React.MouseEvent<HTMLTableCellElement>) => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
    const rect = event.currentTarget.getBoundingClientRect();
    tooltipTimer.current = setTimeout(() => {
      setTooltipAnchor(rect);
      setTooltipPlan(plan);
      setHoveredPlanId(plan.id || null);
    }, 300); // 300ms delay to prevent flickering
  };

  const handlePlanNameMouseLeave = () => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
    tooltipTimer.current = setTimeout(() => {
      setTooltipPlan(null);
      setTooltipAnchor(null);
      setHoveredPlanId(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimer.current) {
        clearTimeout(tooltipTimer.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
      {/* User Guidance Note */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Hover over a plan name in the first column to see detailed information in a tooltip dialog.
        </p>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Plan Name</th>
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Plan Code</th>
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Type</th>
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Billing</th>
            <th className="text-right py-3 px-4 font-heading font-semibold text-foreground">Price</th>
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Status</th>
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id} className="border-b hover:bg-gray-50">
              <td
                className="py-3 px-4 font-body text-sm text-foreground cursor-pointer"
                onMouseEnter={(e) => handlePlanNameMouseEnter(plan, e)}
                onMouseLeave={handlePlanNameMouseLeave}
              >
                {plan.planName}
              </td>
              <td className="py-3 px-4 font-body text-sm text-muted-foreground">{plan.planCode}</td>
              <td className="py-3 px-4 font-body text-sm text-foreground">{plan.planType}</td>
              <td className="py-3 px-4 font-body text-sm text-foreground">{plan.billingInterval}</td>
              <td className="py-3 px-4 font-body text-sm text-right text-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: plan.currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(plan.price)}
              </td>
              <td className="py-3 px-4 font-body text-sm">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-4 font-body text-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(plan)}
                    className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit"
                    disabled={isLoading === plan.id}
                  >
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan.id!, plan.isActive)}
                    disabled={isLoading === plan.id}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.isActive
                        ? 'bg-green-100 hover:bg-green-200'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={plan.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {plan.isActive ? (
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(plan)}
                    disabled={isLoading === plan.id || deleteDialogOpen}
                    className="flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Dialog */}
      <DeletePlanConfirmationDialog
        isOpen={deleteDialogOpen}
        status={deleteStatus}
        planName={planToDelete?.planName}
        message={deleteError || undefined}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        onClose={handleDeleteClose}
      />

      {/* Error Dialog */}
      <ValidationErrorDialog
        isOpen={errorDialogOpen}
        title="Error"
        message={errorDialogMessage}
        onClose={() => setErrorDialogOpen(false)}
      />

      {/* Plan Details Tooltip */}
      {tooltipPlan && (
        <div
          onMouseEnter={() => {
            if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
          }}
          onMouseLeave={() => {
            tooltipTimer.current = setTimeout(() => {
              setTooltipPlan(null);
              setTooltipAnchor(null);
              setHoveredPlanId(null);
            }, 200);
          }}
        >
          <PlanDetailsTooltip
            plan={tooltipPlan}
            anchorRect={tooltipAnchor}
            onClose={() => {
              setTooltipPlan(null);
              setTooltipAnchor(null);
              setHoveredPlanId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}


