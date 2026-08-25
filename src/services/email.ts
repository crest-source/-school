/**
 * Client-side Email Service Helper
 * Dispatches requests to the server-side `/api/email/*` endpoints to keep API keys secure.
 */

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
  recipient?: string;
}

export interface EmailStatusResponse {
  configured: boolean;
  provider: string;
  sender: string;
  instructions: string;
}

/**
 * Reusable email dispatch function.
 * Safe to call from any component, view, or modal without risk of throwing unhandled exceptions.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const errorMsg = data?.error || `Email dispatch failed with status ${response.status}`;
      console.error('[EmailClient] Send failed:', errorMsg);
      return {
        success: false,
        error: errorMsg,
        provider: data?.provider || 'resend',
      };
    }

    console.log('[EmailClient] Email sent successfully:', data);
    return {
      success: true,
      messageId: data.messageId,
      provider: data.provider,
    };
  } catch (err: any) {
    const errorMsg = err?.message || 'Network error attempting to send email.';
    console.error('[EmailClient] Network/fetch error:', err);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Send a verification test email to a specified address.
 */
export async function sendTestEmail(to: string): Promise<EmailResponse> {
  try {
    const response = await fetch('/api/email/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data?.error || `Test email request failed with status ${response.status}`,
        provider: data?.provider,
      };
    }

    return {
      success: true,
      messageId: data.messageId,
      recipient: data.recipient,
      provider: data.provider,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error while attempting test email dispatch.',
    };
  }
}

/**
 * Check whether the server has RESEND_API_KEY configured.
 */
export async function checkEmailConfigStatus(): Promise<EmailStatusResponse> {
  try {
    const response = await fetch('/api/email/status');
    if (!response.ok) {
      return {
        configured: false,
        provider: 'resend',
        sender: 'SchoolHub <onboarding@resend.dev>',
        instructions: 'Could not connect to server status endpoint.',
      };
    }
    return await response.json();
  } catch (err) {
    return {
      configured: false,
      provider: 'resend',
      sender: 'SchoolHub <onboarding@resend.dev>',
      instructions: 'Network error checking email status.',
    };
  }
}
