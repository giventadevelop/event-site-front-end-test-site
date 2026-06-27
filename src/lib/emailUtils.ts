/**
 * Utility functions for sending ticket emails in both desktop and mobile flows
 */

export interface SendTicketEmailParams {
  eventId: number;
  transactionId: number;
  email: string;
  emailHostUrlPrefix?: string;
}

/**
 * Sends a ticket email for a completed transaction
 * This is called after QR code generation to ensure the user receives their tickets
 */
export async function sendTicketEmail({
  eventId,
  transactionId,
  email,
  emailHostUrlPrefix
}: SendTicketEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the current domain for email context if not provided
    // Use window.location.origin for client-side, or the provided prefix
    const hostUrlPrefix = emailHostUrlPrefix ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    // Validate that we have a valid host URL prefix
    if (!hostUrlPrefix) {
      console.error('[EMAIL UTILS] No emailHostUrlPrefix provided and cannot detect from context');
      return {
        success: false,
        error: 'Email host URL prefix is required for proper email context'
      };
    }

    console.log('[EMAIL UTILS] Sending ticket email:', {
      eventId,
      transactionId,
      email,
      hostUrlPrefix
    });

    const response = await fetch(
      `/api/proxy/events/${eventId}/transactions/${transactionId}/send-ticket-email?to=${encodeURIComponent(email)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-email-host-url-prefix': hostUrlPrefix
        },
      }
    );

    if (response.ok) {
      console.log('[EMAIL UTILS] Ticket email sent successfully');
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('[EMAIL UTILS] Failed to send ticket email:', response.status, errorText);
      return {
        success: false,
        error: `Failed to send email: ${response.status} - ${errorText}`
      };
    }
  } catch (error: any) {
    console.error('[EMAIL UTILS] Exception sending ticket email:', error);
    return {
      success: false,
      error: `Email sending failed: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Sends ticket email asynchronously without blocking the UI
 * This is the preferred method for integration into payment flows
 */
export function sendTicketEmailAsync(params: SendTicketEmailParams): void {
  // Send email in background without blocking
  sendTicketEmail(params).then(result => {
    if (result.success) {
      console.log('[EMAIL UTILS] Background email sent successfully');
    } else {
      console.warn('[EMAIL UTILS] Background email failed:', result.error);
    }
  }).catch(error => {
    console.error('[EMAIL UTILS] Background email exception:', error);
  });
}
