/**
 * Client-side Email Service Helper & Template Engine
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
 * Save or update Resend API Key in backend server and .env file.
 */
export async function saveEmailConfig(apiKey: string, from?: string): Promise<{ success: boolean; error?: string; sender?: string }> {
  try {
    const response = await fetch('/api/email/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, from }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, error: data?.error || 'Failed to update email API key.' };
    }
    return { success: true, sender: data.sender };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error saving email configuration.' };
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

/**
 * Request the server to generate and send a verification code to the given email.
 */
export async function sendVerificationCode(email: string, name: string, schoolName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/email/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, schoolName }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, error: data?.error || 'Failed to send verification code.' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error sending verification code.' };
  }
}

/**
 * Verify a submitted code against the server-stored code.
 */
export async function verifyCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/email/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await response.json();
    if (!data.success) {
      return { success: false, error: data?.error || 'Code verification failed.' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error verifying code.' };
  }
}

// -------------------------------------------------------------
// HTML Email Template Builders
// -------------------------------------------------------------

function emailLayout(title: string, bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px 12px; color: #1E293B; }
        .wrapper { max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #0369A1; padding: 28px 24px; text-align: center; color: #FFFFFF; }
        .content { padding: 32px 24px; }
        .footer { background: #F8FAFC; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
        .code-box { background: #F0F9FF; border: 2px dashed #0369A1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
        .btn-link { display: inline-block; background: #0369A1; color: #FFFFFF !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 16px 0; }
        .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
        .info-table td { padding: 10px 12px; border-bottom: 1px solid #F1F5F9; }
        .info-table td:first-child { color: #64748B; font-weight: 500; width: 38%; }
        .info-table td:last-child { color: #0F172A; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div style="font-size: 32px; margin-bottom: 6px;">🎓</div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">SchoolHub Nigeria</h1>
          <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Institutional Portal & Academic Management</p>
        </div>
        <div class="content">
          ${bodyContent}
        </div>
        <div class="footer">
          <p style="margin: 0 0 6px 0;">&copy; ${new Date().getFullYear()} SchoolHub. Supporting primary and secondary education across Nigeria.</p>
          <p style="margin: 0; font-size: 11px; opacity: 0.8;">This is an automated institutional message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 1. Email Verification Code Template
 */
export function buildVerificationEmailHtml(name: string, schoolName: string, code: string): string {
  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="display: inline-block; background: #E0F2FE; color: #0369A1; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">
        Account Verification
      </span>
    </div>
    <h2 style="font-size: 20px; color: #0F172A; margin: 0 0 12px 0;">Verify Your Email Address</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
      Hello <strong>${name}</strong>,<br/>
      Thank you for registering on SchoolHub for <strong>${schoolName}</strong>. Please use the 6-digit security code below to complete your email verification:
    </p>

    <div class="code-box">
      <div style="font-size: 12px; font-weight: 700; color: #0369A1; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px;">Your 6-Digit Verification Code</div>
      <div style="font-size: 36px; font-weight: 800; color: #0369A1; letter-spacing: 8px; font-family: monospace;">${code}</div>
      <div style="font-size: 12px; color: #64748B; margin-top: 8px;">Valid for 15 minutes. Never share this code with anyone.</div>
    </div>

    <p style="font-size: 13px; line-height: 1.5; color: #64748B; margin: 0;">
      If you did not initiate this account creation request, you can safely disregard this email.
    </p>
  `;
  return emailLayout('Your SchoolHub Verification Code', content);
}

/**
 * 2. School Registration Welcome Email (Sent to School Admin)
 */
export function buildSchoolWelcomeEmailHtml(
  schoolName: string,
  schoolCode: string,
  adminName: string,
  adminEmail: string,
  facultyUrl: string,
  studentUrl: string
): string {
  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="display: inline-block; background: #DCFCE7; color: #166534; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">
        Institution Activated
      </span>
    </div>
    <h2 style="font-size: 20px; color: #0F172A; margin: 0 0 12px 0;">Welcome to SchoolHub, ${adminName}!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 18px 0;">
      Congratulations! <strong>${schoolName}</strong> has been registered successfully. Your administrative dashboard and institutional hub are now active.
    </p>

    <table class="info-table">
      <tr><td>School Name:</td><td>${schoolName}</td></tr>
      <tr><td>Institutional Code:</td><td><strong style="color: #0369A1; font-family: monospace; font-size: 16px;">${schoolCode}</strong></td></tr>
      <tr><td>Admin Login Email:</td><td>${adminEmail}</td></tr>
      <tr><td>Status:</td><td><span style="color: #16A34A; font-weight: 700;">● Active</span></td></tr>
    </table>

    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <div style="font-weight: 700; font-size: 13px; color: #0369A1; margin-bottom: 8px;">🔗 Faculty Onboarding Link:</div>
      <div style="font-size: 12px; word-break: break-all; color: #475569; background: #FFFFFF; padding: 8px; border-radius: 4px; border: 1px solid #CBD5E1;">
        <code>${facultyUrl}</code>
      </div>
      <div style="font-size: 11px; color: #64748B; margin-top: 6px;">Share this with your teachers so they can register their assigned classes and subjects.</div>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${window.location.origin}${window.location.pathname}#login" class="btn-link">
        Sign In to School Admin Dashboard &rarr;
      </a>
    </div>
  `;
  return emailLayout(`Welcome to SchoolHub — ${schoolName}`, content);
}

/**
 * 3. User Join Confirmation Email
 */
export function buildUserJoinConfirmationEmailHtml(
  userName: string,
  schoolName: string,
  role: 'teacher' | 'student',
  status: 'active' | 'pending'
): string {
  const isTeacher = role === 'teacher';
  const content = `
    <h2 style="font-size: 20px; color: #0F172A; margin: 0 0 12px 0;">Registration Received!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
      Hello <strong>${userName}</strong>,<br/>
      Your registration profile as a <strong>${isTeacher ? 'Faculty Member / Teacher' : 'Student'}</strong> at <strong>${schoolName}</strong> has been successfully submitted.
    </p>

    <div style="background: ${status === 'pending' ? '#FEF3C7' : '#DCFCE7'}; border: 1px solid ${status === 'pending' ? '#FCD34D' : '#86EFAC'}; border-radius: 8px; padding: 16px; margin: 20px 0; color: ${status === 'pending' ? '#92400E' : '#166534'};">
      <strong>${status === 'pending' ? '⏳ Awaiting Administrator Verification' : '✓ Account Verified & Active'}</strong>
      <p style="font-size: 13px; margin: 6px 0 0 0; line-height: 1.5;">
        ${status === 'pending'
          ? 'To ensure data security, your account will be activated once confirmed by the School Administrator. You will be able to log in to your dashboard.'
          : 'Your account is ready for immediate access to assignments, timetables, grades, and school news.'
        }
      </p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${window.location.origin}${window.location.pathname}#login" class="btn-link">
        Go to Portal Sign In Screen &rarr;
      </a>
    </div>
  `;
  return emailLayout(`Registration Confirmed — ${schoolName}`, content);
}

/**
 * 4. Bursary Fee Payment Receipt Email
 */
export function buildFeeReceiptEmailHtml(
  receiptNumber: string,
  schoolName: string,
  studentName: string,
  studentClass: string,
  term: string,
  session: string,
  amountPaid: number,
  balanceRemaining: number,
  paymentMethod: string,
  referenceNumber?: string
): string {
  const formattedAmount = '₦' + Number(amountPaid).toLocaleString('en-NG');
  const formattedBalance = '₦' + Number(balanceRemaining).toLocaleString('en-NG');

  const content = `
    <div style="text-align: center; margin-bottom: 18px;">
      <span style="display: inline-block; background: #DCFCE7; color: #166534; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">
        Official Bursary Receipt
      </span>
    </div>
    <h2 style="font-size: 20px; color: #0F172A; margin: 0 0 12px 0;">Payment Confirmation Receipt</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
      This is an official payment confirmation from <strong>${schoolName}</strong> for student <strong>${studentName}</strong> (${studentClass}).
    </p>

    <table class="info-table">
      <tr><td>Receipt Number:</td><td><strong style="color: #0369A1; font-family: monospace;">${receiptNumber}</strong></td></tr>
      <tr><td>Student Name:</td><td>${studentName}</td></tr>
      <tr><td>Class & Cohort:</td><td>${studentClass}</td></tr>
      <tr><td>Term & Session:</td><td>${term} (${session})</td></tr>
      <tr><td>Amount Paid:</td><td><strong style="font-size: 18px; color: #16A34A;">${formattedAmount}</strong></td></tr>
      <tr><td>Payment Method:</td><td>${paymentMethod}</td></tr>
      ${referenceNumber ? `<tr><td>Transaction Ref:</td><td><code>${referenceNumber}</code></td></tr>` : ''}
      <tr><td>Outstanding Balance:</td><td><strong style="color: ${balanceRemaining > 0 ? '#DC2626' : '#16A34A'};">${formattedBalance}</strong></td></tr>
      <tr><td>Date Processed:</td><td>${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td></tr>
    </table>

    <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 12px; text-align: center; font-size: 13px; color: #166534; margin-top: 16px;">
      ✓ Status: <strong>${balanceRemaining <= 0 ? 'Fully Cleared / Zero Balance' : 'Part Payment Recorded'}</strong>
    </div>
  `;
  return emailLayout(`Payment Receipt ${receiptNumber} — ${schoolName}`, content);
}

/**
 * 5. Report Card Result Summary Email
 */
export function buildReportCardSummaryEmailHtml(
  schoolName: string,
  studentName: string,
  studentClass: string,
  term: string,
  session: string,
  totalScore: number,
  averageScore: number,
  overallGrade: string,
  overallRemark: string,
  position?: number
): string {
  const content = `
    <div style="text-align: center; margin-bottom: 18px;">
      <span style="display: inline-block; background: #E0F2FE; color: #0369A1; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">
        Terminal Assessment Report
      </span>
    </div>
    <h2 style="font-size: 20px; color: #0F172A; margin: 0 0 12px 0;">Term Report Card Published</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
      Official terminal assessment results for <strong>${studentName}</strong> have been published by <strong>${schoolName}</strong> for <strong>${term} (${session})</strong>.
    </p>

    <table class="info-table">
      <tr><td>Student Name:</td><td>${studentName}</td></tr>
      <tr><td>Class:</td><td>${studentClass}</td></tr>
      <tr><td>Term / Session:</td><td>${term} / ${session}</td></tr>
      ${position ? `<tr><td>Class Position:</td><td><strong style="color: #0369A1; font-size: 16px;">${position}${position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'} Position</strong></td></tr>` : ''}
      <tr><td>Overall Total:</td><td>${totalScore}</td></tr>
      <tr><td>Average Score:</td><td><strong>${averageScore.toFixed(1)}%</strong></td></tr>
      <tr><td>Final Grade:</td><td><strong style="color: #16A34A; font-size: 16px;">${overallGrade}</strong></td></tr>
      <tr><td>Principal Remark:</td><td>${overallRemark}</td></tr>
    </table>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${window.location.origin}${window.location.pathname}#login" class="btn-link">
        View Full Digital Report Card &rarr;
      </a>
    </div>
  `;
  return emailLayout(`Terminal Report Card for ${studentName} — ${schoolName}`, content);
}
