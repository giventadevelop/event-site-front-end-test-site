'use client';

import React from 'react';

interface GivebutterDonateButtonProps {
  campaignId?: string;
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_CAMPAIGN_ID = 'mhoZp0';

/**
 * Givebutter Donate Button Component
 * Opens the full Givebutter campaign page in a popup (desktop) or new tab (mobile).
 * Campaign ID is read from NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID (optional prop overrides).
 *
 * We do not use the <givebutter-button> widget modal because it does not show
 * campaign-level options from the dashboard, including:
 * - "Show an 'Other' option to allow supporters to enter their own amount"
 * - "Require a minimum donation amount"
 * Opening the full campaign URL ensures suggested amounts, Other amount, and
 * minimum donation settings are all visible.
 *
 * Usage:
 * <GivebutterDonateButton />
 * Or override: <GivebutterDonateButton campaignId="otherCampaignId" />
 */
export default function GivebutterDonateButton({
  campaignId: campaignIdProp,
  className = '',
  children,
}: GivebutterDonateButtonProps) {
  const campaignId =
    campaignIdProp ??
    (typeof process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID === 'string' && process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID.trim()
      ? process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID.trim()
      : DEFAULT_CAMPAIGN_ID);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (window.innerWidth <= 768);

    if (isMobile) {
      // Mobile: Open in new tab (better UX, supports PRB)
      // Mobile browsers typically don't support popup windows well
      // Opening in new tab ensures Apple Pay/Google Pay PRB work correctly
      console.log('[GivebutterDonateButton] Mobile device detected - opening in new tab for PRB support');
      window.open(`https://givebutter.com/${campaignId}`, '_blank');
      return;
    }

    // Desktop: Try popup window first
    const width = 800;
    const height = 900;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      `https://givebutter.com/${campaignId}`,
      'GivebutterDonation',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no`
    );

    if (popup) {
      popup.focus();
      // Monitor popup for closure (optional - for analytics or callbacks)
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          console.log('[GivebutterDonateButton] Donation popup closed');
        }
      }, 500);

      // Cleanup interval after 10 minutes
      setTimeout(() => clearInterval(checkClosed), 600000);
    } else {
      // Popup blocked - fallback to new tab
      console.warn('[GivebutterDonateButton] Popup blocked, opening in new tab');
      window.open(`https://givebutter.com/${campaignId}`, '_blank');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      title="Donate Now"
      aria-label="Donate Now"
      type="button"
    >
      {children}
    </button>
  );
}
