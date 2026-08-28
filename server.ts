import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

let resendClient: Resend | null = null;

function getResendClient(): { client: Resend | null; apiKey: string | null } {
  const apiKey = (process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || '').trim();
  if (!apiKey) {
    return { client: null, apiKey: null };
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return { client: resendClient, apiKey };
}

export function updateResendApiKey(newKey: string, newFrom?: string): void {
  const trimmed = (newKey || '').trim();
  process.env.RESEND_API_KEY = trimmed;
  if (trimmed) {
    resendClient = new Resend(trimmed);
  } else {
    resendClient = null;
  }
  if (newFrom && newFrom.trim()) {
    process.env.EMAIL_FROM = newFrom.trim();
  }

  // Persist to .env file
  try {
    const envPath = path.join(process.cwd(), '.env');
    const sender = process.env.EMAIL_FROM || 'SchoolHub <onboarding@resend.dev>';
    const envContent = `# SchoolHub Environment Configuration\nRESEND_API_KEY=${trimmed}\nEMAIL_FROM="${sender}"\n`;
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('[Server] Saved updated RESEND_API_KEY and EMAIL_FROM to .env');
  } catch (e) {
    console.warn('[Server] Could not write to .env file:', e);
  }
}

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export async function sendEmailService(payload: SendEmailPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}> {
  const { to, subject, html, text, from } = payload;
  const { client, apiKey } = getResendClient();

  const sender = from || process.env.EMAIL_FROM || 'SchoolHub <onboarding@resend.dev>';

  if (!apiKey || !client) {
    const errorMsg = 'EMAIL_API_KEY / RESEND_API_KEY environment variable is not configured. Please set RESEND_API_KEY in your environment.';
    console.warn(`[EmailService] Warning: ${errorMsg}`);
    return {
      success: false,
      error: errorMsg,
      provider: 'resend',
    };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];
    console.log(`[EmailService] Sending email to ${recipients.join(', ')} | Subject: "${subject}" | From: ${sender}`);

    const response = await client.emails.send({
      from: sender,
      to: recipients,
      subject,
      html: html || (text ? `<p>${text}</p>` : '<p></p>'),
      text: text,
    });

    if (response.error) {
      console.error('[EmailService] Resend API error response:', response.error);
      return {
        success: false,
        error: response.error.message || 'Failed to send email via Resend API',
        provider: 'resend',
      };
    }

    console.log('[EmailService] Email sent successfully! Message ID:', response.data?.id);
    return {
      success: true,
      messageId: response.data?.id,
      provider: 'resend',
    };
  } catch (err: any) {
    const message = err?.message || 'Unexpected network or server error during email dispatch.';
    console.error('[EmailService] Unhandled error while sending email:', err);
    return {
      success: false,
      error: message,
      provider: 'resend',
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health & Configuration Status Check
  app.get('/api/email/status', (_req, res) => {
    const { apiKey } = getResendClient();
    const isConfigured = Boolean(apiKey && apiKey.trim().length > 0);
    const defaultFrom = process.env.EMAIL_FROM || 'SchoolHub <onboarding@resend.dev>';
    res.json({
      configured: isConfigured,
      provider: 'resend',
      sender: defaultFrom,
      instructions: isConfigured
        ? 'Email provider is configured and active.'
        : 'Set RESEND_API_KEY in your environment or via the diagnostics console to enable real email delivery.',
    });
  });

  // API Route: Save or Update Resend API Key Configuration
  app.post('/api/email/config', (req, res) => {
    try {
      const { apiKey, from } = req.body || {};
      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid RESEND_API_KEY (starts with re_).',
        });
      }

      updateResendApiKey(apiKey, from);
      return res.json({
        success: true,
        configured: true,
        sender: process.env.EMAIL_FROM || 'SchoolHub <onboarding@resend.dev>',
        message: 'Resend API Key configured and saved successfully.',
      });
    } catch (err: any) {
      console.error('[API /api/email/config] Error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to update email configuration.',
      });
    }
  });

  // API Route: Generic Reusable Send Email
  app.post('/api/email/send', async (req, res) => {
    try {
      const { to, subject, html, text, from } = req.body || {};

      if (!to || !subject) {
        return res.status(400).json({
          success: false,
          error: 'Recipient email ("to") and "subject" are required.',
        });
      }

      const result = await sendEmailService({ to, subject, html, text, from });
      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('[API /api/email/send] Error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Internal server error while sending email.',
      });
    }
  });

  // API Route: Dedicated Test Email Trigger
  app.post('/api/email/test', async (req, res) => {
    try {
      const { to } = req.body || {};
      if (!to) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a destination email address ("to").',
        });
      }

      const testSubject = 'Test Email — Setup Successful (SchoolHub)';
      const testHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background: #0369a1; padding: 24px; text-align: center; color: #ffffff; }
            .content { padding: 32px 24px; }
            .badge { display: inline-block; background: #dcfce7; color: #15803d; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; }
            .info-box { background: #f1f5f9; border-left: 4px solid #0369a1; padding: 14px 18px; margin: 20px 0; border-radius: 4px; font-size: 14px; }
            .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">SchoolHub Nigeria</h1>
              <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Institutional Management Platform</p>
            </div>
            <div class="content">
              <span class="badge">✓ EMAIL DISPATCH VERIFIED</span>
              <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #0f172a;">Test Email — Setup Successful!</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
                Congratulations! Your SchoolHub email delivery service is now connected and operational.
              </p>
              <div class="info-box">
                <strong>Delivery Details:</strong><br>
                &bull; <strong>Recipient:</strong> ${to}<br>
                &bull; <strong>Provider:</strong> Resend API<br>
                &bull; <strong>Timestamp:</strong> ${new Date().toUTCString()}
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                This confirms that verification codes, bursary receipts, and student invitations will be delivered directly to parent and teacher inboxes.
              </p>
            </div>
            <div class="footer">
              SchoolHub Automated Notification Engine &bull; Nigeria Secondary Education Management
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await sendEmailService({
        to,
        subject: testSubject,
        html: testHtml,
        text: 'SchoolHub Test Email — Setup Successful! Your email service is now properly connected.',
      });

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json({
        ...result,
        recipient: to,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[API /api/email/test] Error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Error executing email test dispatch.',
      });
    }
  });

  // ============================================================
  // Verification Code Management (Server-Side)
  // ============================================================
  const verificationCodes: Map<string, { code: string; expiresAt: number; name: string; schoolName: string }> = new Map();

  function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function cleanupExpiredCodes(): void {
    const now = Date.now();
    for (const [key, val] of verificationCodes.entries()) {
      if (val.expiresAt < now) verificationCodes.delete(key);
    }
  }

  // API Route: Send Verification Code to Email
  app.post('/api/email/send-verification', async (req, res) => {
    try {
      cleanupExpiredCodes();
      const { email, name, schoolName } = req.body || {};
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email address is required.' });
      }

      const code = generateCode();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
      verificationCodes.set(email.toLowerCase().trim(), { code, expiresAt, name: name || 'User', schoolName: schoolName || 'SchoolHub' });

      console.log(`[VerifyService] Generated code ${code} for ${email} (expires in 15 min)`);

      // Build verification email HTML
      const verificationHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your SchoolHub Verification Code</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px 12px; color: #1E293B; }
            .wrapper { max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: #0369A1; padding: 28px 24px; text-align: center; color: #FFFFFF; }
            .content { padding: 32px 24px; }
            .footer { background: #F8FAFC; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
            .code-box { background: #F0F9FF; border: 2px dashed #0369A1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
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
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; background: #E0F2FE; color: #0369A1; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">
                  Account Verification
                </span>
              </div>
              <h2 style="font-size: 20px; color: #0F172A; margin: 0 0 12px 0;">Verify Your Email Address</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
                Hello <strong>${name || 'User'}</strong>,<br/>
                Thank you for registering on SchoolHub for <strong>${schoolName || 'your school'}</strong>. Please use the 6-digit security code below to complete your email verification:
              </p>
              <div class="code-box">
                <div style="font-size: 12px; font-weight: 700; color: #0369A1; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px;">Your 6-Digit Verification Code</div>
                <div style="font-size: 36px; font-weight: 800; color: #0369A1; letter-spacing: 8px; font-family: monospace;">${code}</div>
                <div style="font-size: 12px; color: #64748B; margin-top: 8px;">Valid for 15 minutes. Never share this code with anyone.</div>
              </div>
              <p style="font-size: 13px; line-height: 1.5; color: #64748B; margin: 0;">
                If you did not initiate this account creation request, you can safely disregard this email.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0 0 6px 0;">&copy; ${new Date().getFullYear()} SchoolHub. Supporting primary and secondary education across Nigeria.</p>
              <p style="margin: 0; font-size: 11px; opacity: 0.8;">This is an automated institutional message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await sendEmailService({
        to: email,
        subject: `Your SchoolHub Verification Code — ${schoolName || 'SchoolHub'}`,
        html: verificationHtml,
        text: `Hello ${name || 'User'},\n\nYour SchoolHub verification code for ${schoolName || 'your school'} is: ${code}.\n\nThis code is valid for 15 minutes. Enter it on the registration page to complete your verification.\n\nIf you did not request this, please ignore this email.`,
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || 'Failed to send verification email.',
          provider: result.provider,
        });
      }

      return res.json({
        success: true,
        message: `Verification code sent to ${email}`,
        messageId: result.messageId,
        provider: result.provider,
      });
    } catch (err: any) {
      console.error('[API /api/email/send-verification] Error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to send verification code.',
      });
    }
  });

  // API Route: Verify a Submitted Code
  app.post('/api/email/verify-code', (req, res) => {
    try {
      cleanupExpiredCodes();
      const { email, code } = req.body || {};
      if (!email || !code) {
        return res.status(400).json({ success: false, error: 'Email and code are required.' });
      }

      const key = email.toLowerCase().trim();
      const stored = verificationCodes.get(key);

      if (!stored) {
        return res.json({
          success: false,
          error: 'No verification code found for this email. Please request a new code.',
        });
      }

      if (stored.expiresAt < Date.now()) {
        verificationCodes.delete(key);
        return res.json({
          success: false,
          error: 'Verification code has expired. Please request a new code.',
        });
      }

      if (stored.code !== code.trim()) {
        return res.json({
          success: false,
          error: 'Incorrect verification code. Please check your email and try again.',
        });
      }

      // Code is valid — remove it so it can't be reused
      verificationCodes.delete(key);
      return res.json({
        success: true,
        message: 'Email verified successfully.',
      });
    } catch (err: any) {
      console.error('[API /api/email/verify-code] Error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Error verifying code.',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SchoolHub Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
