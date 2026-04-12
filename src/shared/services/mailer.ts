import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../../config';

// ─── Transport Initialization ────────────────────────────────

let transporter: Transporter | null = null;

const smtpConfigured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
const isProduction = env.NODE_ENV === 'production';

if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER!,
      pass: env.SMTP_PASS!,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  console.log('✅ SMTP mailer initialized.');
} else if (isProduction) {
  // In production, missing SMTP is a fatal configuration error.
  console.error('❌ SMTP not configured in production. Set SMTP_HOST, SMTP_USER, SMTP_PASS.');
  process.exit(1);
} else {
  console.warn('⚠️  SMTP not configured — email delivery disabled in development. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable.');
}

// ─── Helpers ─────────────────────────────────────────────────

function buildLink(path: string, token: string): string {
  const base = env.CLIENT_URL.replace(/\/$/, '');
  return `${base}${path}?token=${encodeURIComponent(token)}`;
}

/**
 * Send an email. Throws on failure in production.
 * In development without SMTP, logs a warning and returns silently.
 */
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!smtpConfigured || !transporter) {
    // Only reachable in non-production (prod exits at boot)
    console.warn(`📧 [DEV SKIP] Email to ${to} — SMTP not configured. Subject: "${subject}"`);
    return;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  console.log(`📧 [SENT] Email to ${to} — Subject: "${subject}"`);
}

// ─── Invite Email ────────────────────────────────────────────

export async function sendInviteEmail(to: string, firstName: string, rawToken: string): Promise<void> {
  const link = buildLink('/accept-invite', rawToken);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #18181b;">
      <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 16px;">
        You've been invited to AgencyOS
      </h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; margin: 0 0 24px;">
        Hi ${firstName}, you've been invited to join the platform.
        Click the button below to set your password and activate your account.
      </p>
      <a href="${link}" style="display: inline-block; padding: 10px 24px; font-size: 14px; font-weight: 500; color: #ffffff; background-color: #18181b; border-radius: 6px; text-decoration: none;">
        Activate Account
      </a>
      <p style="font-size: 12px; line-height: 1.5; color: #a1a1aa; margin: 24px 0 0;">
        This link expires in 48 hours. If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>
  `;

  await send(to, 'You\'ve been invited to AgencyOS', html);
}

// ─── Reset Password Email ────────────────────────────────────

export async function sendResetEmail(to: string, firstName: string, rawToken: string): Promise<void> {
  const link = buildLink('/reset-password', rawToken);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #18181b;">
      <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 16px;">
        Reset Your Password
      </h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; margin: 0 0 24px;">
        Hi ${firstName}, a password reset was requested for your account.
        Click the button below to set a new password.
      </p>
      <a href="${link}" style="display: inline-block; padding: 10px 24px; font-size: 14px; font-weight: 500; color: #ffffff; background-color: #18181b; border-radius: 6px; text-decoration: none;">
        Reset Password
      </a>
      <p style="font-size: 12px; line-height: 1.5; color: #a1a1aa; margin: 24px 0 0;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  await send(to, 'Reset your AgencyOS password', html);
}
