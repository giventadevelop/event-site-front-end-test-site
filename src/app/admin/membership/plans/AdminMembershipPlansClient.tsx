'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AdminNavigation from '@/components/AdminNavigation';
import { MembershipPlanList } from '@/components/admin/membership/MembershipPlanList';
import { MembershipPlanForm } from '@/components/admin/membership/MembershipPlanForm';
import {
  createMembershipPlanServer,
  updateMembershipPlanServer,
  fetchAllMembershipPlansServer,
} from './ApiServerActions';
import type { MembershipPlanDTO } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreateTestPlansButton } from './create-test-plans-button';

interface AdminMembershipPlansClientProps {
  plans: MembershipPlanDTO[];
  totalCount: number;
  initialPage: number;
  pageSize: number;
  error: string | null;
}

export function AdminMembershipPlansClient({
  plans: initialPlans,
  totalCount: initialTotalCount,
  initialPage,
  pageSize,
  error,
}: AdminMembershipPlansClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState(initialPlans);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlanDTO | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Load plans when page changes (only if different from initial page)
  useEffect(() => {
    async function loadPlans() {
      setLoading(true);
      try {
        const result = await fetchAllMembershipPlansServer({
          page: currentPage,
          size: pageSize,
          sort: 'createdAt,desc',
        });
        setPlans(result.plans);
        setTotalCount(result.totalCount);
      } catch (err) {
        console.error('Failed to reload plans:', err);
      } finally {
        setLoading(false);
      }
    }

    // Only reload if page changed from initial (to avoid reloading on mount)
    if (currentPage !== initialPage) {
      loadPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      router.push(`/admin/membership/plans?page=${newPage}`);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      router.push(`/admin/membership/plans?page=${newPage}`);
    }
  };

  const handleEdit = (plan: MembershipPlanDTO) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormError(null);
  };

  const handleSubmit = async (formData: Partial<MembershipPlanDTO>) => {
    startTransition(async () => {
      try {
        setFormError(null);

        // VALIDATION: Plan name is required
        if (!formData.planName || !formData.planName.trim()) {
          setFormError('Plan name is required.');
          return;
        }

        // VALIDATION: Plan code is required
        if (!formData.planCode || !formData.planCode.trim()) {
          setFormError('Plan code is required.');
          return;
        }

        // VALIDATION: Plan code minimum length (4 characters)
        if (formData.planCode.trim().length < 4) {
          setFormError('Plan code must be at least 4 characters long.');
          return;
        }

        // VALIDATION: Check for duplicate plan name (case-insensitive) - applies to both create and update
        const normalizedPlanName = formData.planName.trim().toLowerCase();
        const duplicatePlan = plans.find(
          (p) =>
            p.planName?.toLowerCase() === normalizedPlanName &&
            p.id !== editingPlan?.id // Exclude current plan when editing
        );

        if (duplicatePlan) {
          setFormError(
            `A plan with the name "${formData.planName}" already exists. Please use a unique plan name.`
          );
          return;
        }

        // VALIDATION: Check for duplicate plan code (case-insensitive) - applies to both create and update
        const normalizedPlanCode = formData.planCode.trim().toLowerCase();
        const duplicatePlanCode = plans.find(
          (p) =>
            p.planCode?.toLowerCase() === normalizedPlanCode &&
            p.id !== editingPlan?.id // Exclude current plan when editing
        );

        if (duplicatePlanCode) {
          setFormError(
            `A plan with the code "${formData.planCode}" already exists. Plan codes must be unique.`
          );
          return;
        }

        // VALIDATION: Price must be >= $0.60 for subscription plans
        const planType = formData.planType || editingPlan?.planType;
        const price = Number(formData.price) || 0;
        if (planType === 'SUBSCRIPTION') {
          if (price <= 0) {
            setFormError('Subscription plans must have a price greater than zero.');
            return;
          } else if (price < 0.60) {
            setFormError('Subscription plans must have a minimum price of $0.60.');
            return;
          }
        }

        // Clean up form data - remove undefined values and ensure proper types
        const cleanedData: Partial<MembershipPlanDTO> = {
          ...formData,
          // Ensure number fields are properly handled
          maxEventsPerMonth: formData.maxEventsPerMonth === undefined || formData.maxEventsPerMonth === null || formData.maxEventsPerMonth === ''
            ? undefined
            : Number(formData.maxEventsPerMonth),
          maxAttendeesPerEvent: formData.maxAttendeesPerEvent === undefined || formData.maxAttendeesPerEvent === null || formData.maxAttendeesPerEvent === ''
            ? undefined
            : Number(formData.maxAttendeesPerEvent),
          // Ensure price is a number
          price: Number(formData.price) || 0,
          // Ensure trialDays is a number
          trialDays: Number(formData.trialDays) || 0,
          // Keep featuresJson as object - server action will convert to string for backend
          featuresJson: (() => {
            if (typeof formData.featuresJson === 'string') {
              try {
                return JSON.parse(formData.featuresJson);
              } catch {
                return {};
              }
            }
            return formData.featuresJson || {};
          })(),
          // Stripe IDs are created automatically by backend/Stripe API during plan creation
          // They are managed by Stripe integration and should not be sent from frontend
        };

        let updatedPlan: MembershipPlanDTO;

        if (editingPlan?.id) {
          // For update, include id and remove undefined fields
          // Stripe IDs are managed by backend/Stripe API - don't send them in updates
          const { id, createdAt, updatedAt, stripePriceId, stripeProductId, ...updateData } = cleanedData;
          updatedPlan = await updateMembershipPlanServer(editingPlan.id, updateData);
        } else {
          // For create, exclude id and ensure all required fields are present
          // Stripe IDs are created automatically by backend/Stripe API - don't send them
          const { id, createdAt, updatedAt, stripePriceId, stripeProductId, ...createData } = cleanedData;
          updatedPlan = await createMembershipPlanServer(createData as Omit<MembershipPlanDTO, 'id' | 'createdAt' | 'updatedAt'>);
        }

        // Update local state
        if (editingPlan?.id) {
          setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
        } else {
          // For new plans, add to current page or refresh if needed
          setPlans((prev) => [...prev, updatedPlan]);
          setTotalCount((prev) => prev + 1);
        }

        handleCloseModal();
        // Refresh to get updated data from server
        router.refresh();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to save plan');
      }
    });
  };

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Membership Plans</h1>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Membership Plans</h1>
          <p className="text-gray-600">
            Create, edit, and manage all membership plans in the system.
          </p>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNavigation currentPage="membership-plans" />

      {/* Create Test Plans Button */}
      <CreateTestPlansButton />

      {/* Create Plan Button */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-105"
          title="Create Plan"
          aria-label="Create Plan"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-semibold text-blue-700">Create Plan</span>
        </Button>
      </div>

      {plans.length === 0 && totalCount === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="font-body text-lg text-muted-foreground mb-6">No membership plans found.</p>
          <Button
            onClick={() => {
              setEditingPlan(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-105 mx-auto"
            title="Create Your First Plan"
            aria-label="Create Your First Plan"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Create Your First Plan</span>
          </Button>
        </div>
      ) : (
        <MembershipPlanList
          plans={plans}
          onEdit={handleEdit}
          onPlanUpdate={(updatedPlan) => {
            setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
          }}
          onPlanDelete={(deletedPlanId) => {
            setPlans((prev) => prev.filter((p) => p.id !== deletedPlanId));
            setTotalCount((prev) => Math.max(0, prev - 1));
          }}
        />
      )}

      {/* Pagination Controls - Always visible, matching admin page style */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          {/* Previous Button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0 || loading}
            className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Previous Page"
            aria-label="Previous Page"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          {/* Page Info */}
          <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
            <span className="text-sm font-bold text-blue-700">
              Page <span className="text-blue-600">{currentPage + 1}</span> of <span className="text-blue-600">{Math.ceil(totalCount / pageSize) || 1}</span>
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage >= Math.ceil(totalCount / pageSize) - 1 || loading}
            className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Next Page"
            aria-label="Next Page"
            type="button"
          >
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Item Count Text */}
        <div className="text-center mt-3">
          {totalCount > 0 ? (
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{totalCount > 0 ? currentPage * pageSize + 1 : 0}</span> to <span className="font-bold text-blue-600">{totalCount > 0 ? currentPage * pageSize + Math.min(pageSize, totalCount - currentPage * pageSize) : 0}</span> of <span className="font-bold text-blue-600">{totalCount}</span> plans
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-700">No plans found</span>
              <span className="text-sm text-orange-600">[No plans match your criteria]</span>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
              {editingPlan ? 'Edit Plan' : 'Create Plan'}
            </h2>
            {formError && (
              <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-md">
                {formError}
              </div>
            )}
            <MembershipPlanForm
              plan={editingPlan}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              isLoading={isPending}
              existingPlans={plans}
            />
          </div>
        </div>
      )}
    </div>
  );
}

