'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ErrorDialog } from './ErrorDialog';
import { triggerProfileReconciliationServer } from '@/app/profile/actions';

/**
 * Component that automatically triggers profile reconciliation after authentication
 * This ensures mobile payment profiles get updated with proper Clerk user data
 */
export function ProfileReconciliationTrigger() {
  const { isSignedIn, userId } = useAuth();
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    // Only trigger once per session and only when user is signed in
    if (isSignedIn && userId && !hasTriggered) {
      console.log('[ProfileReconciliationTrigger] 🔄 User signed in, triggering profile reconciliation');

      // Add a small delay to ensure the session is fully established
      const timer = setTimeout(() => {
        triggerProfileReconciliation();
      }, 1000); // Wait 1 second for session to be fully ready

      return () => clearTimeout(timer);
    }
  }, [isSignedIn, userId, hasTriggered]);

  const triggerProfileReconciliation = async () => {
    if (!userId) return;

    setIsLoading(true);
    setHasTriggered(true);

    try {
      console.log('[ProfileReconciliationTrigger] 🚀 Calling profile reconciliation server action');

      // Use server action instead of API route to avoid 401 errors
      const result = await triggerProfileReconciliationServer();

      if (result.success) {
        setResult(result);
        console.log('[ProfileReconciliationTrigger] ✅ Profile reconciliation result:', result);

        if (result.reconciliationNeeded) {
          console.log('[ProfileReconciliationTrigger] 🔄 Profile was updated with Clerk data');
        } else {
          console.log('[ProfileReconciliationTrigger] ✅ Profile was already up-to-date');
        }
      } else {
        console.log('[ProfileReconciliationTrigger] ❌ Profile reconciliation failed:', result.error, result.details);
        setResult(result);

        // Only show error dialog for serious errors, not auth issues
        if (result.error !== 'Unauthorized') {
          setErrorDetails(result.details);
          setShowErrorDialog(true);
        }
      }
    } catch (error) {
      // Handle network errors gracefully without console logging
      setResult({ error: 'Network error', details: error instanceof Error ? error.message : 'Unknown error' });

      // Show error dialog for network errors
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error');
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  // This component doesn't render anything visible
  // It just runs the reconciliation logic in the background
  return (
    <>
      {/* Error Dialog for Backend Errors */}
      <ErrorDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Some unexpected error has occurred"
        message="Please try back again later."
        details={errorDetails || undefined}
        showRetry={false}
      />
    </>
  );
}
