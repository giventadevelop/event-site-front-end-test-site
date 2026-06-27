'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

/**
 * Shows a loading overlay during Clerk satellite sync to prevent users from
 * seeing a blank or broken page on the first load with ?__clerk_synced=true.
 *
 * Problem: When the primary domain redirects back to the satellite with
 * ?__clerk_synced=true, the server can't establish the session on this first
 * request (the cookie is set for subsequent requests). The client-side
 * ClerkProvider also takes time to process the sync param. During this window
 * the page can appear blank, incomplete, or show a flash of non-logged-in state.
 *
 * Solution: This component detects __clerk_synced in the URL and shows a
 * lightweight full-screen loading overlay. Once Clerk finishes loading
 * (isLoaded === true), it waits a brief stabilization period, then fades
 * out the overlay. A max timeout prevents infinite loading if something fails.
 *
 * Must render inside ClerkProvider so useAuth() works.
 * Placed in layout.tsx body alongside ClerkSyncUrlCleanup.
 */
const POST_LOAD_STABILIZE_MS = 400;
const MAX_WAIT_MS = 10_000;

export default function ClerkSatelliteSyncGate() {
  const { isLoaded } = useAuth();
  const [showOverlay, setShowOverlay] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const detected = useRef(false);

  // Detect __clerk_synced on mount (runs once)
  useEffect(() => {
    if (detected.current || typeof window === 'undefined') return;
    detected.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.has('__clerk_synced')) {
      setShowOverlay(true);
    }
  }, []);

  // Hide overlay once Clerk is loaded + brief stabilization
  useEffect(() => {
    if (!showOverlay || !isLoaded) return;

    const timer = setTimeout(() => {
      setFadeOut(true);
      // Remove from DOM after fade animation completes
      setTimeout(() => setShowOverlay(false), 500);
    }, POST_LOAD_STABILIZE_MS);

    return () => clearTimeout(timer);
  }, [showOverlay, isLoaded]);

  // Max timeout safety net — force hide even if Clerk never loads
  useEffect(() => {
    if (!showOverlay) return;

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setShowOverlay(false), 500);
    }, MAX_WAIT_MS);

    return () => clearTimeout(timer);
  }, [showOverlay]);

  if (!showOverlay) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Loading page"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998, // Below navigation-loading-indicator (9999)
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 500ms ease-out',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 44,
            height: 44,
            margin: '0 auto 14px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'clerk-gate-spin 0.8s linear infinite',
          }}
        />
        <p
          style={{
            color: '#6b7280',
            fontSize: 14,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            margin: 0,
          }}
        >
          Loading&hellip;
        </p>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: '@keyframes clerk-gate-spin{to{transform:rotate(360deg)}}',
        }}
      />
    </div>
  );
}
