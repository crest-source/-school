import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

let resendClient: Resend | null = null;

function getResendClient(): { client: Resend | null; apiKey: string | null } {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || '';
  if (!apiKey) {
    return { client: null, apiKey: null };
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return { client: resendClient, apiKey };
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
        : 'Set RESEND_API_KEY in your environment to enable real email delivery.',
    });
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
