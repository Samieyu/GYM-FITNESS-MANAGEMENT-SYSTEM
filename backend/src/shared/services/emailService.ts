import nodemailer from 'nodemailer';
import { config } from '../../config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false, // Mailpit uses unencrypted SMTP port 1025
  auth: config.smtp.user
    ? {
        user: config.smtp.user,
        pass: config.smtp.pass,
      }
    : undefined,
});

/**
 * Reusable, responsive branded HTML email shell
 * High contrast, dark charcoal canvas (#0E1116), signature orange accent (#FF6B00),
 * clean typographic scale, mobile-first table layout with safe insets.
 */
interface EmailShellOptions {
  preheader: string;
  badgeText?: string;
  badgeColor?: string;
  headline: string;
  greetingName: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  altUrlText?: string;
  footerNote?: string;
}

const renderEmailShell = (opts: EmailShellOptions): string => {
  const badgeHtml = opts.badgeText
    ? `<tr>
        <td align="left" style="padding-bottom: 12px;">
          <span style="display: inline-block; background-color: ${opts.badgeColor || '#FF6B00'}20; color: ${opts.badgeColor || '#FF6B00'}; border: 1px solid ${opts.badgeColor || '#FF6B00'}40; border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            ${opts.badgeText}
          </span>
        </td>
      </tr>`
    : '';

  const ctaHtml = opts.ctaText && opts.ctaUrl
    ? `<tr>
        <td align="left" style="padding: 24px 0 16px 0;">
          <table border="0" cellspacing="0" cellpadding="0" style="margin: 0;">
            <tr>
              <td align="center" style="background-color: #FF6B00; border-radius: 12px;">
                <a href="${opts.ctaUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; color: #FFFFFF; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${opts.ctaText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${
        opts.altUrlText
          ? `<tr>
              <td align="left" style="padding-bottom: 20px;">
                <p style="margin: 0; font-size: 11px; color: #64748B; line-height: 1.5;">
                  ${opts.altUrlText}:<br />
                  <a href="${opts.ctaUrl}" target="_blank" style="color: #FF8533; text-decoration: underline; word-break: break-all;">
                    ${opts.ctaUrl}
                  </a>
                </p>
              </td>
            </tr>`
          : ''
      }`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${opts.headline}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0 !important; padding: 0 !important; -webkit-text-size-adjust: 100% !important; -ms-text-size-adjust: 100% !important; }
    table, td { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 16px !important; }
      .email-content { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0E1116; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Preheader text for inbox preview -->
  <div style="display: none; font-size: 1px; color: #0E1116; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${opts.preheader}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0E1116; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!-- Email Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 580px; margin: 0 auto;">
          <!-- Brand Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #F1F5F9; text-transform: uppercase;">
                      SWEATBOX <span style="color: #FF6B00;">FITNESS</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 4px;">
                    <span style="font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">
                      Premier Athletic Club & Performance Center
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background-color: #161B22; border: 1px solid #2D333B; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
              <!-- Top Accent Gradient Line -->
              <div style="height: 4px; width: 100%; background: linear-gradient(90deg, #FF6B00 0%, #FF8533 50%, #FFA04D 100%);"></div>

              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-content" style="padding: 36px 32px;">
                ${badgeHtml}
                
                <!-- Headline -->
                <tr>
                  <td align="left" style="padding-bottom: 16px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #F1F5F9; line-height: 1.3; letter-spacing: -0.3px;">
                      ${opts.headline}
                    </h1>
                  </td>
                </tr>

                <!-- Salutation -->
                <tr>
                  <td align="left" style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #F1F5F9;">
                      Hello <strong style="color: #FF8533;">${opts.greetingName}</strong>,
                    </p>
                  </td>
                </tr>

                <!-- Body Content -->
                <tr>
                  <td align="left" style="font-size: 14px; line-height: 1.6; color: #CBD5E1; padding-bottom: 8px;">
                    ${opts.bodyHtml}
                  </td>
                </tr>

                <!-- CTA Button -->
                ${ctaHtml}

                <!-- Footer Note -->
                ${
                  opts.footerNote
                    ? `<tr>
                        <td align="left" style="padding-top: 16px; border-top: 1px solid #2D333B;">
                          <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                            ${opts.footerNote}
                          </p>
                        </td>
                      </tr>`
                    : ''
                }
              </table>
            </td>
          </tr>

          <!-- Brand Footer -->
          <tr>
            <td align="center" style="padding-top: 24px; padding-bottom: 12px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <p style="margin: 0; font-size: 11px; color: #64748B; font-weight: 600;">
                      SWEATBOX FITNESS CLUB • BOLE MEDHANIALEM, ADDIS ABABA, ETHIOPIA
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 11px; color: #475569;">
                      Ethiopian Calendar Powered Engine (ዓ.ም / E.C.) • Chapa & Telebirr Secured
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <p style="margin: 0; font-size: 10px; color: #334155;">
                      This is an automated system notification. If you did not request this, please contact support@sweatboxfitness.et
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${config.corsOrigin}/verify-email?token=${token}`;

  const html = renderEmailShell({
    preheader: `Verify your account to activate your SWEATBOX membership.`,
    badgeText: 'Account Verification',
    badgeColor: '#FF6B00',
    headline: 'Activate Your SWEATBOX Account',
    greetingName: firstName,
    bodyHtml: `
      <p style="margin: 0 0 14px 0;">
        Thank you for joining <strong>SWEATBOX Fitness</strong>. We are thrilled to welcome you to our athletic community.
      </p>
      <p style="margin: 0 0 14px 0;">
        Please confirm your email address by clicking the button below. Once verified, your membership profile will be unlocked for facility entry, biometric logs, and group class reservations.
      </p>
    `,
    ctaText: 'Verify Email Address',
    ctaUrl: verificationUrl,
    altUrlText: 'Or paste this link into your browser',
    footerNote: 'This verification link is secure and will expire in 24 hours.',
  });

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'Verify Your SWEATBOX Account',
      html,
    });
    console.log(`[Email] Verification email sent to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send verification email to ${email}:`, error);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<void> => {
  const resetUrl = `${config.corsOrigin}/reset-password?token=${token}`;

  const html = renderEmailShell({
    preheader: `Reset your SWEATBOX account password.`,
    badgeText: 'Security Notice',
    badgeColor: '#EF4444',
    headline: 'Password Reset Request',
    greetingName: firstName,
    bodyHtml: `
      <p style="margin: 0 0 14px 0;">
        We received a request to reset the password for your SWEATBOX account.
      </p>
      <p style="margin: 0 0 14px 0;">
        Click the button below to choose a new password. If you did not make this request, your account remains secure and you can safely ignore this message.
      </p>
    `,
    ctaText: 'Reset Password',
    ctaUrl: resetUrl,
    altUrlText: 'Or copy and paste this reset URL',
    footerNote: 'For your security, this password reset link will expire in 1 hour.',
  });

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'Password Reset Request — SWEATBOX Fitness',
      html,
    });
    console.log(`[Email] Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send password reset email to ${email}:`, error);
  }
};

export const sendWalkinInvitationEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<void> => {
  const setPasswordUrl = `${config.corsOrigin}/set-password?token=${token}`;

  const html = renderEmailShell({
    preheader: `Welcome to SWEATBOX! Set your password to access your digital member pass.`,
    badgeText: 'Front Desk Registration',
    badgeColor: '#10B981',
    headline: 'Welcome to SWEATBOX Fitness Club',
    greetingName: firstName,
    bodyHtml: `
      <p style="margin: 0 0 14px 0;">
        You have been registered by our front desk reception team. Your athlete profile is created and ready for access.
      </p>
      <p style="margin: 0 0 14px 0;">
        Click below to set your personal account password. Once set, you can sign in to view your membership status, book group classes, and access your <strong>60-second dynamic QR entrance pass</strong>.
      </p>
    `,
    ctaText: 'Set Password & Activate Pass',
    ctaUrl: setPasswordUrl,
    altUrlText: 'Direct setup link',
    footerNote: 'This onboarding invitation will remain valid for 72 hours.',
  });

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'Welcome to SWEATBOX Fitness — Set Your Password',
      html,
    });
    console.log(`[Email] Walk-in invitation sent to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send walk-in invitation to ${email}:`, error);
  }
};

export const sendStaffInvitationEmail = async (
  email: string,
  firstName: string,
  role: 'trainer' | 'reception',
  token: string,
  initialPassword?: string
): Promise<void> => {
  const setPasswordUrl = `${config.corsOrigin}/set-password?token=${token}`;
  const roleTitle = role === 'trainer' ? 'Certified Fitness Trainer' : 'Front Desk Receptionist';

  const credentialCard = initialPassword
    ? `<div style="margin: 16px 0; padding: 16px; background-color: #1F242D; border: 1px solid #2D333B; border-radius: 12px;">
        <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #94A3B8; font-weight: 700;">Assigned Temporary Credentials</p>
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #F1F5F9;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 0; font-size: 13px; color: #F1F5F9;"><strong>Initial Password:</strong> <code style="background-color: #0E1116; padding: 2px 8px; border-radius: 6px; color: #FF8533; font-weight: bold;">${initialPassword}</code></p>
      </div>`
    : '';

  const html = renderEmailShell({
    preheader: `You have been provisioned as a ${roleTitle} at SWEATBOX Fitness.`,
    badgeText: 'Staff Provisioning',
    badgeColor: '#3B82F6',
    headline: `Welcome to the Team, ${firstName}!`,
    greetingName: firstName,
    bodyHtml: `
      <p style="margin: 0 0 14px 0;">
        You have been officially provisioned as a <strong>${roleTitle}</strong> on the SWEATBOX Staff Operating Portal by the System Administrator.
      </p>
      ${credentialCard}
      <p style="margin: 0 0 14px 0;">
        You can log in directly using your email and assigned credentials, or click below to set a private personal password:
      </p>
    `,
    ctaText: 'Access Staff Portal',
    ctaUrl: setPasswordUrl,
    altUrlText: 'Direct setup link',
    footerNote: 'This setup link expires in 72 hours. For account safety, please update your password upon initial login.',
  });

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: `Welcome to SWEATBOX Fitness — Your Staff Account (${roleTitle})`,
      html,
    });
    console.log(`[Email] Staff invitation sent to ${email} for role ${role}`);
  } catch (error) {
    console.error(`[Email] Failed to send staff invitation to ${email}:`, error);
  }
};

export const sendPaymentConfirmationEmail = async (
  email: string,
  firstName: string,
  paymentDetails: {
    planName: string;
    amount: number;
    paymentMethod: string;
    reference: string;
    startDate: string;
    endDate: string;
  }
): Promise<void> => {
  const receiptCard = `
    <div style="margin: 20px 0; padding: 20px; background-color: #1F242D; border: 1px solid #2D333B; border-radius: 16px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Membership Tier:</td>
          <td align="right" style="padding: 6px 0; font-size: 14px; font-weight: 800; color: #F1F5F9;">${paymentDetails.planName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Amount Paid:</td>
          <td align="right" style="padding: 6px 0; font-size: 16px; font-weight: 900; color: #10B981;">${paymentDetails.amount.toLocaleString()} ETB</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Payment Method:</td>
          <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #F1F5F9; text-transform: uppercase;">${paymentDetails.paymentMethod}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Transaction Ref:</td>
          <td align="right" style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #FF8533;">${paymentDetails.reference}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Validity Period:</td>
          <td align="right" style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #F1F5F9;">${paymentDetails.startDate} → ${paymentDetails.endDate}</td>
        </tr>
      </table>
    </div>
  `;

  const html = renderEmailShell({
    preheader: `Payment receipt: ${paymentDetails.amount.toLocaleString()} ETB for ${paymentDetails.planName}. Membership active!`,
    badgeText: 'Payment Confirmed',
    badgeColor: '#10B981',
    headline: 'Payment Receipt & Membership Active',
    greetingName: firstName,
    bodyHtml: `
      <p style="margin: 0 0 14px 0;">
        We have successfully confirmed your transaction. Your SWEATBOX membership is officially <strong>ACTIVE</strong>.
      </p>
      ${receiptCard}
      <p style="margin: 0 0 14px 0;">
        Your dynamic 60-second QR check-in pass is now active on your member portal. Simply present the QR code at the entrance turnstile or front desk scanner for instant access.
      </p>
    `,
    ctaText: 'Open Member Portal & QR Pass',
    ctaUrl: config.corsOrigin,
    footerNote: 'Official payment receipt. Please retain this email for your tax or corporate reimbursement records.',
  });

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: `Payment Receipt & Membership Activated — ${paymentDetails.planName}`,
      html,
    });
    console.log(`[Email] Payment confirmation sent to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send payment confirmation to ${email}:`, error);
  }
};

export const sendExpiryReminderEmail = async (
  email: string,
  firstName: string,
  details: {
    planName: string;
    daysRemaining: number;
    endDate: string;
    endDateEc: string;
  }
): Promise<void> => {
  const renewUrl = `${config.corsOrigin}/plans`;
  const isUrgent = details.daysRemaining <= 1;

  const warningCard = `
    <div style="margin: 20px 0; padding: 20px; background-color: #1F242D; border: 1px solid ${isUrgent ? '#EF4444' : '#F59E0B'}60; border-radius: 16px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Current Plan:</td>
          <td align="right" style="padding: 6px 0; font-size: 14px; font-weight: 800; color: #F1F5F9;">${details.planName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Days Remaining:</td>
          <td align="right" style="padding: 6px 0; font-size: 16px; font-weight: 900; color: ${isUrgent ? '#EF4444' : '#F59E0B'};">
            ${details.daysRemaining} ${details.daysRemaining === 1 ? 'DAY' : 'DAYS'}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Expiry Date (E.C.):</td>
          <td align="right" style="padding: 6px 0; font-size: 14px; font-weight: 800; color: #FF8533;">${details.endDateEc}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Gregorian Expiry:</td>
          <td align="right" style="padding: 6px 0; font-size: 12px; color: #CBD5E1;">${details.endDate}</td>
        </tr>
      </table>
    </div>
  `;

  const html = renderEmailShell({
    preheader: `${isUrgent ? 'URGENT: Membership expires tomorrow!' : 'Reminder: Membership expires in 7 days.'} Renew now.`,
    badgeText: isUrgent ? 'Urgent: Expires Tomorrow' : 'Renewal Reminder',
    badgeColor: isUrgent ? '#EF4444' : '#F59E0B',
    headline: isUrgent ? 'Your Membership Expires Tomorrow!' : 'Your Membership Expires in 7 Days',
    greetingName: firstName,
    bodyHtml: `
      <p style="margin: 0 0 14px 0;">
        Your <strong>${details.planName}</strong> subscription at SWEATBOX Fitness is nearing expiration.
      </p>
      ${warningCard}
      <p style="margin: 0 0 14px 0;">
        Renew online seamlessly with <strong>Chapa, Telebirr, or CBE Birr</strong> to keep your facility entrance pass active without any interruption to your training routine.
      </p>
    `,
    ctaText: 'Renew Membership Now',
    ctaUrl: renewUrl,
    footerNote: 'You can also renew in person at our front desk reception via cash or POS card payment.',
  });

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: `${isUrgent ? '🚨 URGENT: Membership Expires Tomorrow' : 'Membership Expiring Soon (7 Days)'} — SWEATBOX Fitness`,
      html,
    });
    console.log(`[Email] Expiry reminder (${details.daysRemaining}d) sent to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send expiry reminder to ${email}:`, error);
  }
};

export const sendClassBookingConfirmationEmail = async (
  email: string,
  firstName: string,
  classDetails: {
    title: string;
    location: string;
    trainerName: string;
    timeFormatted: string;
    dateEc: string;
    status: 'booked' | 'waitlisted';
    waitlistPosition?: number | null;
  }
): Promise<void> => {
  const isBooked = classDetails.status === 'booked';

  const classCard = `
    <div style="margin: 20px 0; padding: 20px; background-color: #1F242D; border: 1px solid #2D333B; border-radius: 16px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Class Session:</td>
          <td align="right" style="padding: 6px 0; font-size: 14px; font-weight: 800; color: #F1F5F9;">${classDetails.title}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Instructor:</td>
          <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #F1F5F9;">${classDetails.trainerName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Location:</td>
          <td align="right" style="padding: 6px 0; font-size: 13px; color: #CBD5E1;">${classDetails.location}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Date (E.C.):</td>
          <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #FF8533;">${classDetails.dateEc}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Time:</td>
          <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #F1F5F9;">${classDetails.timeFormatted}</td>
        </tr>
      </table>
    </div>
  `;

  const html = renderEmailShell({
    preheader: isBooked
      ? `Spot confirmed for ${classDetails.title} with ${classDetails.trainerName}.`
      : `Waitlisted at position #${classDetails.waitlistPosition} for ${classDetails.title}.`,
    badgeText: isBooked ? 'Spot Reserved' : `Waitlist Position #${classDetails.waitlistPosition}`,
    badgeColor: isBooked ? '#10B981' : '#F59E0B',
    headline: isBooked ? 'Group Class Booking Confirmed!' : 'Waitlist Queue Confirmation',
    greetingName: firstName,
    bodyHtml: `
      <p style="margin: 0 0 14px 0;">
        ${
          isBooked
            ? `Your spot is confirmed for <strong>${classDetails.title}</strong>.`
            : `You have joined the waitlist at position <strong>#${classDetails.waitlistPosition}</strong> for <strong>${classDetails.title}</strong>.`
        }
      </p>
      ${classCard}
      <p style="margin: 0 0 14px 0;">
        ${
          isBooked
            ? 'Please arrive 10 minutes prior to session start with your dynamic QR check-in pass.'
            : 'If an athlete cancels, you will be automatically promoted to confirmed and notified immediately via email.'
        }
      </p>
    `,
    ctaText: 'View Schedule on Portal',
    ctaUrl: `${config.corsOrigin}/classes`,
    footerNote: 'Need to cancel? Please cancel at least 2 hours prior to allow waitlisted members to attend.',
  });

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: `${isBooked ? '✅ Confirmed: ' : '📋 Waitlisted: '}${classDetails.title} — SWEATBOX Fitness`,
      html,
    });
    console.log(`[Email] Class ${classDetails.status} email sent to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send class booking email to ${email}:`, error);
  }
};

export const sendWaitlistPromotionEmail = async (
  email: string,
  firstName: string,
  classDetails: {
    title: string;
    location: string;
    trainerName: string;
    timeFormatted: string;
    dateEc: string;
  }
): Promise<void> => {
  const classCard = `
    <div style="margin: 20px 0; padding: 20px; background-color: #1F242D; border: 1px solid #10B981; border-radius: 16px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Class:</td>
          <td align="right" style="padding: 6px 0; font-size: 14px; font-weight: 800; color: #F1F5F9;">${classDetails.title}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Trainer:</td>
          <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #F1F5F9;">${classDetails.trainerName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Location:</td>
          <td align="right" style="padding: 6px 0; font-size: 13px; color: #CBD5E1;">${classDetails.location}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Date (E.C.):</td>
          <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #FF8533;">${classDetails.dateEc}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94A3B8;">Time:</td>
          <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #F1F5F9;">${classDetails.timeFormatted}</td>
        </tr>
      </table>
    </div>
  `;

  const html = renderEmailShell({
    preheader: `Great news! You have been promoted from the waitlist to booked for ${classDetails.title}!`,
    badgeText: 'Waitlist Promoted',
    badgeColor: '#10B981',
    headline: 'You Are Confirmed For Class!',
    greetingName: firstName,
    bodyHtml: `
      <p style="margin: 0 0 14px 0;">
        A spot opened up and you have been automatically promoted from the waitlist to <strong>BOOKED</strong> for <strong>${classDetails.title}</strong>!
      </p>
      ${classCard}
      <p style="margin: 0 0 14px 0;">
        Your digital QR pass is ready for check-in at our front desk. We look forward to seeing you crush your workout!
      </p>
    `,
    ctaText: 'View My Classes',
    ctaUrl: `${config.corsOrigin}/classes`,
    footerNote: 'Please arrive 10 minutes early so our coaching staff can get you prepped.',
  });

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: `🎉 Waitlist Promoted: You are confirmed for ${classDetails.title}!`,
      html,
    });
    console.log(`[Email] Waitlist promotion email sent to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send waitlist promotion email to ${email}:`, error);
  }
};

export const sendTrainerFeedbackEmail = async (
  email: string,
  firstName: string,
  feedbackDetails: {
    trainerName: string;
    comment: string;
    weightKg: number;
    recordedDateEc: string;
  }
): Promise<void> => {
  const quoteCard = `
    <div style="margin: 20px 0; padding: 20px; background-color: #1F242D; border-left: 4px solid #FF6B00; border-top: 1px solid #2D333B; border-right: 1px solid #2D333B; border-bottom: 1px solid #2D333B; border-radius: 12px;">
      <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #94A3B8; font-weight: 700;">
        Coach Notes (${feedbackDetails.recordedDateEc} • Weight: ${feedbackDetails.weightKg} kg)
      </p>
      <p style="margin: 0; font-size: 14px; font-style: italic; color: #F1F5F9; line-height: 1.6;">
        "${feedbackDetails.comment}"
      </p>
    </div>
  `;

  const html = renderEmailShell({
    preheader: `Coach ${feedbackDetails.trainerName} left feedback on your progress metric log.`,
    badgeText: 'Coach Feedback',
    badgeColor: '#FF6B00',
    headline: 'Transformation Feedback From Your Coach',
    greetingName: firstName,
    bodyHtml: `
      <p style="margin: 0 0 14px 0;">
        Your personal coach <strong>${feedbackDetails.trainerName}</strong> reviewed your recent fitness transformation log recorded on <strong>${feedbackDetails.recordedDateEc}</strong> and left direct feedback:
      </p>
      ${quoteCard}
      <p style="margin: 0 0 14px 0;">
        Keep up the dedication and consistency toward your athletic goals.
      </p>
    `,
    ctaText: 'Open Transformation Dashboard',
    ctaUrl: config.corsOrigin,
    footerNote: 'SWEATBOX Coaching Staff • Personalized Fitness & Nutrition Analytics',
  });

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: `Coach Feedback: New note from ${feedbackDetails.trainerName}`,
      html,
    });
    console.log(`[Email] Trainer feedback email sent to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send trainer feedback email to ${email}:`, error);
  }
};
