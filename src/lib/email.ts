import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import fs from "fs";
import path from "path";
import type { ApplicationFormData, ContactFormData } from "@/types";
import { getAppBaseUrl } from "@/lib/app-url";

const isDev = process.env.NODE_ENV !== "production";

/** True when SMTP_PASS looks like a normal password instead of a Gmail App Password */
function smtpPassLooksLikeRegularPassword(pass: string | undefined): boolean {
  if (!pass) return false;
  const normalized = pass.replace(/\s/g, "");
  // Gmail app passwords are 16 letters/digits, no @ symbol
  if (pass.includes("@")) return true;
  return normalized.length > 0 && normalized.length !== 16;
}

export function getSmtpConfigStatus(): {
  configured: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  if (!process.env.SMTP_HOST) missing.push("SMTP_HOST");
  if (!process.env.SMTP_USER) missing.push("SMTP_USER");
  if (!process.env.SMTP_PASS) missing.push("SMTP_PASS");

  const warnings: string[] = [];
  if (smtpPassLooksLikeRegularPassword(process.env.SMTP_PASS)) {
    warnings.push(
      "SMTP_PASS looks like a regular Gmail password. Use a 16-character App Password (Google Account → Security → 2-Step Verification → App passwords)."
    );
  }
  if (!process.env.ADMIN_EMAIL && !process.env.SMTP_FROM && !process.env.SMTP_USER) {
    warnings.push("No sender address: set ADMIN_EMAIL, SMTP_FROM, or SMTP_USER.");
  }
  if (!process.env.ADMIN_NOTIFICATION_EMAIL && !process.env.SMTP_USER) {
    warnings.push(
      "No admin inbox for alerts: set ADMIN_NOTIFICATION_EMAIL (falls back to SMTP_USER)."
    );
  }

  return {
    configured: missing.length === 0,
    missing,
    warnings,
  };
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  const status = getSmtpConfigStatus();
  if (!status.configured) {
    throw new Error(
      `SMTP is not configured. Missing: ${status.missing.join(", ")}. Copy .env.example to .env.local and set Gmail App Password values.`
    );
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

if (isDev) {
  const status = getSmtpConfigStatus();
  if (!status.configured) {
    console.warn(
      `[email] SMTP not configured — emails will fail. Missing: ${status.missing.join(", ")}`
    );
  }
  for (const warning of status.warnings) {
    console.warn(`[email] ${warning}`);
  }
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: any[];
  /** When true, use ADMIN_EMAIL as From and default Reply-To to the org admin address */
  fromOrgAdmin?: boolean;
}

/** Organization address used as From on admin→user emails */
export function getOrgFromEmail(): string {
  return (
    process.env.ADMIN_EMAIL ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    ""
  );
}

/** Reply-To for user-facing mail so applicants can reach the admin inbox */
export function getOrgReplyToEmail(): string | undefined {
  return (
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    undefined
  );
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  attachments,
  fromOrgAdmin = false,
}: SendEmailOptions): Promise<void> {
  const from = fromOrgAdmin ? getOrgFromEmail() : process.env.SMTP_FROM || process.env.SMTP_USER;
  const resolvedReplyTo = replyTo ?? (fromOrgAdmin ? getOrgReplyToEmail() : undefined);

  if (!from) {
    throw new Error(
      "No sender email configured. Set ADMIN_EMAIL, SMTP_FROM, or SMTP_USER in environment variables."
    );
  }

  try {
    await getTransporter().sendMail({
      from: `"Westbridge Research" <${from}>`,
      to,
      subject,
      html,
      attachments,
      ...(resolvedReplyTo && { replyTo: resolvedReplyTo }),
    });
    if (isDev) {
      console.log(`[email] Sent "${subject}" → ${to}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const hint =
      message.includes("535") || message.includes("BadCredentials") || message.includes("EAUTH")
        ? " Gmail rejected SMTP credentials — use an App Password (not your login password) with 2FA enabled."
        : "";
    console.error(`[email] Failed to send "${subject}" → ${to}: ${message}${hint}`);
    throw err;
  }
}

/* ────────────────────── Application notification ───────────────────── */

export async function sendApplicationNotification(
  data: any
): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;

  if (!adminEmail) {
    console.warn("⚠️  No admin email configured — skipping notification");
    throw new Error("No admin notification email configured in environment variables.");
  }

  const researchAreas = Array.isArray(data.researchAreas)
    ? data.researchAreas.join(", ")
    : data.researchAreas || "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7fa; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a365d; color: #ffffff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-fellow { background: #ebf8ff; color: #2b6cb0; }
    .badge-senior { background: #faf5ff; color: #6b46c1; }
    .body { padding: 24px 32px; }
    .section { margin-bottom: 20px; }
    .section h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #718096; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .field { margin-bottom: 8px; }
    .label { font-weight: 600; color: #4a5568; font-size: 13px; }
    .value { color: #2d3748; font-size: 14px; }
    .footer { background: #f7fafc; padding: 16px 32px; text-align: center; font-size: 12px; color: #a0aec0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Membership Application</h1>
      <span class="badge ${data.type === "fellow" ? "badge-fellow" : "badge-senior"}">${data.type} Member</span>
    </div>
    <div class="body">
      <div class="section">
        <h2>Personal Information</h2>
        <div class="field"><span class="label">Name:</span> <span class="value">${data.fullName}</span></div>
        <div class="field"><span class="label">Email:</span> <span class="value">${data.email}</span></div>
        <div class="field"><span class="label">Phone:</span> <span class="value">${data.phone}</span></div>
        <div class="field"><span class="label">DOB:</span> <span class="value">${data.dateOfBirth}</span></div>
        <div class="field"><span class="label">Gender:</span> <span class="value">${data.gender}</span></div>
        <div class="field"><span class="label">Address:</span> <span class="value">${data.address}</span></div>
      </div>
      <div class="section">
        <h2>Academic Information</h2>
        <div class="field"><span class="label">Institution:</span> <span class="value">${data.institution}</span></div>
        <div class="field"><span class="label">Designation:</span> <span class="value">${data.designation}</span></div>
        <div class="field"><span class="label">Department:</span> <span class="value">${data.department}</span></div>
        <div class="field"><span class="label">Research Areas:</span> <span class="value">${researchAreas}</span></div>
        <div class="field"><span class="label">Qualifications:</span> <span class="value">${data.qualifications}</span></div>
        <div class="field"><span class="label">Experience:</span> <span class="value">${data.experience}</span></div>
      </div>
      ${
        data.type === "senior"
          ? `<div class="section">
        <h2>Senior-Specific Details</h2>
        ${data.publications ? `<div class="field"><span class="label">Publications:</span> <span class="value">${data.publications}</span></div>` : ""}
        ${data.achievements ? `<div class="field"><span class="label">Achievements:</span> <span class="value">${data.achievements}</span></div>` : ""}
        ${data.referenceNames ? `<div class="field"><span class="label">References:</span> <span class="value">${data.referenceNames}</span></div>` : ""}
      </div>`
          : ""
      }
      <div class="section">
        <h2>Motivation</h2>
        <p class="value" style="white-space: pre-line;">${data.motivation}</p>
      </div>
    </div>
    <div class="footer">
      &copy; Westbridge Research &bull; Review this application in the admin dashboard
    </div>
  </div>
</body>
</html>`;

  const attachments: any[] = [];
  if (data.resumeUrl && data.resumeUrl.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", data.resumeUrl);
    if (fs.existsSync(filePath)) {
      attachments.push({
        filename: path.basename(filePath),
        path: filePath,
      });
    }
  }

  await sendEmail({
    to: adminEmail,
    subject: `[WBR] New ${data.type} membership application — ${data.fullName}`,
    html,
    attachments,
  });
}


/* ────────────────────── Contact form notification ──────────────────── */

export async function sendContactNotification(
  data: ContactFormData
): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;

  if (!adminEmail) {
    console.warn("⚠️  No admin email configured — skipping contact notification");
    throw new Error("No admin notification email configured in environment variables.");
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7fa; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #2d3748; color: #ffffff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { padding: 24px 32px; }
    .field { margin-bottom: 12px; }
    .label { font-weight: 600; color: #4a5568; font-size: 13px; }
    .value { color: #2d3748; font-size: 14px; }
    .message-box { background: #f7fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #4299e1; margin-top: 16px; }
    .footer { background: #f7fafc; padding: 16px 32px; text-align: center; font-size: 12px; color: #a0aec0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Form Submission</h1>
    </div>
    <div class="body">
      <div class="field"><span class="label">Name:</span> <span class="value">${data.name}</span></div>
      <div class="field"><span class="label">Email:</span> <span class="value">${data.email}</span></div>
      ${data.phone ? `<div class="field"><span class="label">Phone:</span> <span class="value">${data.phone}</span></div>` : ""}
      <div class="field"><span class="label">Subject:</span> <span class="value">${data.subject}</span></div>
      <div class="message-box">
        <p class="value" style="white-space: pre-line; margin: 0;">${data.message}</p>
      </div>
    </div>
    <div class="footer">
      &copy; Westbridge Research &bull; Reply directly to ${data.email}
    </div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: adminEmail,
    subject: `[WBR Contact] ${data.subject}`,
    html,
    replyTo: data.email,
  });
}

/* ──────────────── Welcome Onboarding Email ───────────────── */

export async function sendWelcomeOnboardingEmail(
  memberEmail: string,
  memberName: string,
  generatedOrgEmail: string,
  orgEmailPassword: string,
  membershipId: string,
  membershipType: string
): Promise<void> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #0f172a; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
    .body { padding: 40px; line-height: 1.6; }
    .welcome-title { font-size: 20px; font-weight: 700; color: #1e3a8a; margin-top: 0; margin-bottom: 16px; }
    .highlight-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 24px; border-radius: 8px; margin: 24px 0; }
    .credential-row { display: flex; margin-bottom: 8px; font-size: 14px; }
    .credential-row:last-child { margin-bottom: 0; }
    .credential-label { font-weight: 600; width: 140px; color: #475569; }
    .credential-value { font-family: monospace; font-size: 15px; color: #1e293b; font-weight: 700; }
    .btn { display: inline-block; background: #1e3a8a; color: #ffffff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 24px; box-shadow: 0 4px 12px rgba(30,58,138,0.2); }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Westbridge Research</h1>
    </div>
    <div class="body">
      <h2 class="welcome-title">Congratulations, ${memberName}!</h2>
      <p>We are absolutely thrilled to inform you that your application for <strong>${membershipType.toUpperCase()} Membership</strong> at <strong>Westbridge Research</strong> has been approved!</p>
      <p>You are now part of a premier global forum of elite scientists, experienced researchers, and corporate engineers.</p>
      
      <div class="highlight-box">
        <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #1e3a8a;">Your Credentials & Official Email</h3>
        <div class="credential-row">
          <div class="credential-label">Membership ID:</div>
          <div class="credential-value">${membershipId}</div>
        </div>
        <div class="credential-row">
          <div class="credential-label">Official Email:</div>
          <div class="credential-value">${generatedOrgEmail}</div>
        </div>
        ${orgEmailPassword ? `
        <div class="credential-row">
          <div class="credential-label">Email Password:</div>
          <div class="credential-value">${orgEmailPassword}</div>
        </div>
        ` : ""}
        <div class="credential-row">
          <div class="credential-label">Status:</div>
          <div class="credential-value" style="color: #059669;">ACTIVE</div>
        </div>
      </div>
      
      <p>As a formal member, you have been issued a personalized organization email address listed above. This email will serve as your primary identity for all official institute communications, publications, collaborative boards, and updates.</p>
      <p>You can access your digital membership card, update your profile, and browse research directories by logging into the member portal.</p>
      
      <div style="text-align: center;">
        <a href="${getAppBaseUrl()}/login" class="btn">Access Member Portal</a>
      </div>
    </div>
    <div class="footer">
      &copy; Westbridge Research &bull; 2026. All rights reserved.<br/>
      If you did not apply for this, please contact support@westbridgeresearch.com.
    </div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: memberEmail,
    subject: `[WBR] Welcome to Westbridge Research — Official Email Provisioned`,
    html,
    fromOrgAdmin: true,
  });
}

/* ────────────── Welcome Approval Email (Prior to Credentials) ────────────── */

export async function sendWelcomeApprovalEmail(
  memberEmail: string,
  memberName: string,
  membershipId: string,
  membershipType: string
): Promise<void> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #0f172a; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
    .body { padding: 40px; line-height: 1.6; }
    .welcome-title { font-size: 20px; font-weight: 700; color: #1e3a8a; margin-top: 0; margin-bottom: 16px; }
    .highlight-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 24px; border-radius: 8px; margin: 24px 0; }
    .credential-row { display: flex; margin-bottom: 8px; font-size: 14px; }
    .credential-row:last-child { margin-bottom: 0; }
    .credential-label { font-weight: 600; width: 140px; color: #475569; }
    .credential-value { font-family: monospace; font-size: 15px; color: #1e293b; font-weight: 700; }
    .btn { display: inline-block; background: #1e3a8a; color: #ffffff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 24px; box-shadow: 0 4px 12px rgba(30,58,138,0.2); }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Westbridge Research</h1>
    </div>
    <div class="body">
      <h2 class="welcome-title">Congratulations, ${memberName}!</h2>
      <p>We are absolutely thrilled to inform you that your application for <strong>${membershipType.toUpperCase()} Membership</strong> at <strong>Westbridge Research</strong> has been approved!</p>
      <p>You are now part of a premier global forum of elite scientists, experienced researchers, and corporate engineers.</p>
      
      <div class="highlight-box">
        <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #1e3a8a;">Your Membership Details</h3>
        <div class="credential-row">
          <div class="credential-label">Membership ID:</div>
          <div class="credential-value">${membershipId}</div>
        </div>
        <div class="credential-row">
          <div class="credential-label">Status:</div>
          <div class="credential-value" style="color: #059669;">APPROVED</div>
        </div>
      </div>
      
      <p>To finalize your setup, view your digital membership card, and complete your academic showcase profile, please log into the Member Portal.</p>
      
      <div style="text-align: center;">
        <a href="${getAppBaseUrl()}/login" class="btn">Access Member Portal</a>
      </div>
    </div>
    <div class="footer">
      &copy; Westbridge Research &bull; 2026. All rights reserved.<br/>
      If you did not apply for this, please contact support@westbridgeresearch.com.
    </div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: memberEmail,
    subject: `[WBR] Welcome to Westbridge Research — Membership Approved!`,
    html,
    fromOrgAdmin: true,
  });
}

/* ──────────────── Application Rejection Email ─────────────────────── */

export async function sendApplicationRejectionEmail(
  memberEmail: string,
  memberName: string,
  membershipType: string,
  adminNotes?: string
): Promise<void> {
  const notesBlock = adminNotes
    ? `<div class="highlight-box" style="background: #fef2f2; border-left-color: #ef4444;">
        <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #991b1b;">Message from the Review Committee</h3>
        <p style="margin: 0; font-size: 14px; color: #334155; white-space: pre-line;">${adminNotes}</p>
      </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #0f172a; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
    .body { padding: 40px; line-height: 1.6; }
    .welcome-title { font-size: 20px; font-weight: 700; color: #1e3a8a; margin-top: 0; margin-bottom: 16px; }
    .highlight-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 24px; border-radius: 8px; margin: 24px 0; }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Westbridge Research</h1></div>
    <div class="body">
      <h2 class="welcome-title">Application Update, ${memberName}</h2>
      <p>Thank you for your interest in <strong>${membershipType.toUpperCase()} Membership</strong> at Westbridge Research.</p>
      <p>After careful review, we are unable to approve your application at this time. This decision reflects our current membership criteria and review capacity.</p>
      ${notesBlock}
      <p>You are welcome to reapply in a future cycle or contact us if you have questions about this decision.</p>
    </div>
    <div class="footer">
      &copy; Westbridge Research &bull; 2026. All rights reserved.<br/>
      Reply to this email to reach our membership team.
    </div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: memberEmail,
    subject: `[WBR] Membership Application Update — ${membershipType.toUpperCase()}`,
    html,
    fromOrgAdmin: true,
  });
}

/* ──────────────── Contact Form Acknowledgement ───────────────────── */

export async function sendContactAcknowledgementEmail(
  data: ContactFormData
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #0f172a; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 32px 40px; text-align: center; }
    .body { padding: 40px; line-height: 1.6; }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Westbridge Research</h1></div>
    <div class="body">
      <h2 style="color: #1e3a8a; margin-top: 0;">We received your message</h2>
      <p>Hello ${data.name},</p>
      <p>Thank you for contacting Westbridge Research regarding <strong>${data.subject}</strong>. A member of our team has received your inquiry and will respond by email as soon as possible.</p>
      <p style="font-size: 14px; color: #64748b;">Please keep this email for your records. For urgent matters, reply directly to this message.</p>
    </div>
    <div class="footer">&copy; Westbridge Research &bull; 2026</div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: data.email,
    subject: `[WBR] We received your message — ${data.subject}`,
    html,
    fromOrgAdmin: true,
  });
}

/* ──────────────── Member Status Change Email ─────────────────────── */

export async function sendMemberStatusChangeEmail(
  memberEmail: string,
  memberName: string,
  membershipId: string,
  newStatus: "active" | "inactive" | "suspended"
): Promise<void> {
  const statusLabels: Record<string, { label: string; color: string; message: string }> = {
    active: {
      label: "ACTIVE",
      color: "#059669",
      message: "Your Westbridge Research membership has been reactivated. You may continue using member portal features.",
    },
    inactive: {
      label: "INACTIVE",
      color: "#64748b",
      message: "Your membership has been marked inactive. Portal access may be limited until your status is restored.",
    },
    suspended: {
      label: "SUSPENDED",
      color: "#dc2626",
      message: "Your membership has been suspended. Please contact us by replying to this email if you believe this is an error.",
    },
  };
  const info = statusLabels[newStatus];

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #0f172a; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #fff; padding: 28px 36px; text-align: center; }
    .body { padding: 36px; line-height: 1.6; }
    .badge { font-family: monospace; font-weight: 700; color: ${info.color}; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1 style="margin:0;">Membership Status Update</h1></div>
    <div class="body">
      <p>Hello ${memberName},</p>
      <p>${info.message}</p>
      <p><strong>Membership ID:</strong> ${membershipId}<br/>
      <strong>New status:</strong> <span class="badge">${info.label}</span></p>
    </div>
    <div class="footer">&copy; Westbridge Research</div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: memberEmail,
    subject: `[WBR] Membership status updated — ${info.label}`,
    html,
    fromOrgAdmin: true,
  });
}

/* ───────────── Org Email Account Status Change ───────────────────── */

export async function sendOrgEmailStatusChangeEmail(
  memberEmail: string,
  memberName: string,
  orgEmail: string,
  newStatus: "active" | "inactive" | "suspended"
): Promise<void> {
  const statusMessage =
    newStatus === "active"
      ? "Your organization email account is now active."
      : newStatus === "inactive"
        ? "Your organization email account has been deactivated."
        : "Your organization email account has been suspended.";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; color: #0f172a; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; }
    .header { background: #1e3a8a; color: #fff; padding: 24px 32px; }
    .body { padding: 32px; line-height: 1.6; }
    .footer { padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1 style="margin:0;">Organization Email Update</h1></div>
    <div class="body">
      <p>Hello ${memberName},</p>
      <p>${statusMessage}</p>
      <p><strong>Organization email:</strong> ${orgEmail}<br/>
      <strong>Status:</strong> ${newStatus.toUpperCase()}</p>
      <p>Reply to this email if you need assistance.</p>
    </div>
    <div class="footer">&copy; Westbridge Research</div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: memberEmail,
    subject: `[WBR] Organization email ${newStatus} — ${orgEmail}`,
    html,
    fromOrgAdmin: true,
  });
}

/* ──────────────── Application Acknowledgement Email ───────────────── */

export async function sendApplicationAcknowledgementEmail(
  memberEmail: string,
  memberName: string,
  membershipType: string
): Promise<void> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #0f172a; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
    .body { padding: 40px; line-height: 1.6; }
    .welcome-title { font-size: 20px; font-weight: 700; color: #1e3a8a; margin-top: 0; margin-bottom: 16px; }
    .highlight-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 24px; border-radius: 8px; margin: 24px 0; }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Westbridge Research</h1>
    </div>
    <div class="body">
      <h2 class="welcome-title">Application Received, ${memberName}!</h2>
      <p>Thank you for submitting your application for <strong>${membershipType.toUpperCase()} Membership</strong> at Westbridge Research.</p>
      
      <div class="highlight-box">
        <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #1e3a8a;">What Happens Next?</h3>
        <p style="margin: 0; font-size: 14px; color: #334155;">Our review committee is currently evaluating your application. You will receive an update regarding your membership status within 7 to 14 business days.</p>
      </div>
      
      <p>If you have any questions in the meantime, please do not hesitate to contact us by replying directly to this email.</p>
    </div>
    <div class="footer">
      &copy; Westbridge Research &bull; 2026. All rights reserved.<br/>
      If you did not apply for this, please contact support@westbridgeresearch.com.
    </div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: memberEmail,
    subject: `[WBR] Application Received: ${membershipType.toUpperCase()} Membership`,
    html,
    fromOrgAdmin: true,
  });
}

/* ──────────────── Password Reset Email ───────────────────────────── */

export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetUrl: string
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #0f172a; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
    .body { padding: 40px; line-height: 1.6; }
    .btn { display: inline-block; background: #1e3a8a; color: #ffffff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 16px; }
    .muted { font-size: 13px; color: #64748b; word-break: break-all; }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Password Reset</h1></div>
    <div class="body">
      <p>Hello ${userName},</p>
      <p>We received a request to reset the password for your Westbridge Research account. Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <p class="muted">If the button does not work, copy and paste this link into your browser:<br/>${resetUrl}</p>
      <p class="muted">If you did not request this, you can safely ignore this email. Your password will not change.</p>
    </div>
    <div class="footer">&copy; Westbridge Research</div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: userEmail,
    subject: "[WBR] Reset your password",
    html,
    fromOrgAdmin: true,
  });
}

