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

export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${config.corsOrigin}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #121212; color: #f3f4f6; padding: 30px; border-radius: 8px;">
      <h2 style="color: #ff6b00; margin-bottom: 10px;">TITAN FITNESS</h2>
      <h3 style="color: #ffffff;">Verify Your Account</h3>
      <p style="color: #d1d5db;">Hello <strong>${firstName}</strong>,</p>
      <p style="color: #d1d5db;">Thank you for registering. Please verify your email to activate your account and start your membership journey.</p>
      <div style="margin: 25px 0;">
        <a href="${verificationUrl}" style="background-color: #ff6b00; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px;">Or copy and paste this link into your browser:</p>
      <p style="color: #ff8533; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
      <p style="color: #6b7280; font-size: 11px; margin-top: 30px;">This link will expire in 24 hours.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'Verify Your Titan Fitness Account',
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

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #121212; color: #f3f4f6; padding: 30px; border-radius: 8px;">
      <h2 style="color: #ff6b00; margin-bottom: 10px;">TITAN FITNESS</h2>
      <h3 style="color: #ffffff;">Password Reset Request</h3>
      <p style="color: #d1d5db;">Hello <strong>${firstName}</strong>,</p>
      <p style="color: #d1d5db;">We received a request to reset your password. Click the button below to choose a new password.</p>
      <div style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #ff6b00; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px;">This link expires in 1 hour.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'Password Reset Request',
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

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #121212; color: #f3f4f6; padding: 30px; border-radius: 8px;">
      <h2 style="color: #ff6b00; margin-bottom: 10px;">TITAN FITNESS</h2>
      <h3 style="color: #ffffff;">Welcome to Titan Fitness!</h3>
      <p style="color: #d1d5db;">Hello <strong>${firstName}</strong>,</p>
      <p style="color: #d1d5db;">You have been registered at our reception desk. Please click below to set your password and access your digital membership card.</p>
      <div style="margin: 25px 0;">
        <a href="${setPasswordUrl}" style="background-color: #ff6b00; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Set Your Password
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px;">Direct link: ${setPasswordUrl}</p>
      <p style="color: #6b7280; font-size: 11px; margin-top: 30px;">This invitation link will expire in 72 hours.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'Welcome to Titan Fitness - Set Your Password',
      html,
    });
    console.log(`[Email] Walk-in invitation sent to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send walk-in invitation to ${email}:`, error);
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
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #121212; color: #f3f4f6; padding: 30px; border-radius: 8px;">
      <h2 style="color: #ff6b00; margin-bottom: 10px;">TITAN FITNESS</h2>
      <h3 style="color: #ffffff;">Payment Confirmed - Membership Activated!</h3>
      <p style="color: #d1d5db;">Hello <strong>${firstName}</strong>,</p>
      <p style="color: #d1d5db;">We have received your payment. Your membership is now <strong>active</strong>.</p>
      
      <div style="margin: 20px 0; padding: 16px; background-color: #1e1e1e; border-radius: 6px; border: 1px solid #333333;">
        <p style="margin: 6px 0; color: #ffffff;"><strong>Plan:</strong> ${paymentDetails.planName}</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Amount Paid:</strong> ${paymentDetails.amount.toLocaleString()} ETB</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Payment Method:</strong> ${paymentDetails.paymentMethod.toUpperCase()}</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Reference:</strong> <span style="font-family: monospace; color: #ff8533;">${paymentDetails.reference}</span></p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Valid From:</strong> ${paymentDetails.startDate} <strong>to</strong> ${paymentDetails.endDate}</p>
      </div>

      <p style="color: #9ca3af; font-size: 13px;">
        You can now generate your dynamic 60-second QR check-in pass directly on your member dashboard.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: `Payment Receipt & Membership Activated - ${paymentDetails.planName}`,
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

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #121212; color: #f3f4f6; padding: 30px; border-radius: 8px;">
      <h2 style="color: #ff6b00; margin-bottom: 10px;">TITAN FITNESS</h2>
      <h3 style="color: ${isUrgent ? '#ef4444' : '#f59e0b'};">
        ${isUrgent ? 'URGENT: Membership Expires Tomorrow!' : 'Notice: Membership Expiring in 7 Days'}
      </h3>
      <p style="color: #d1d5db;">Hello <strong>${firstName}</strong>,</p>
      <p style="color: #d1d5db;">
        Your <strong>${details.planName}</strong> membership is set to expire on
        <strong>${details.endDateEc}</strong> (${details.endDate}).
      </p>
      <div style="margin: 20px 0; padding: 16px; background-color: #1e1e1e; border-radius: 6px; border: 1px solid #333333;">
        <p style="margin: 6px 0; color: #ffffff;"><strong>Days Remaining:</strong> ${details.daysRemaining} ${details.daysRemaining === 1 ? 'day' : 'days'}</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Expiry Date (E.C.):</strong> <span style="color: #ff8533;">${details.endDateEc}</span></p>
      </div>
      <p style="color: #d1d5db;">Renew now with Chapa, Telebirr, or CBE Birr to keep your dynamic QR check-in pass active without interruption.</p>
      <div style="margin: 25px 0;">
        <a href="${renewUrl}" style="background-color: #ff6b00; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Renew Membership
        </a>
      </div>
      <p style="color: #6b7280; font-size: 11px;">Titan Fitness Club • Addis Ababa, Ethiopia</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: `${isUrgent ? '🚨 URGENT: Membership Expires Tomorrow' : 'Membership Expiring Soon (7 Days)'} - Titan Fitness`,
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
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #121212; color: #f3f4f6; padding: 30px; border-radius: 8px;">
      <h2 style="color: #ff6b00; margin-bottom: 10px;">TITAN FITNESS</h2>
      <h3 style="color: ${isBooked ? '#22c55e' : '#f59e0b'};">
        ${isBooked ? 'Class Booking Confirmed!' : 'Waitlist Confirmation (Position #' + classDetails.waitlistPosition + ')'}
      </h3>
      <p style="color: #d1d5db;">Hello <strong>${firstName}</strong>,</p>
      <p style="color: #d1d5db;">
        ${isBooked 
          ? `Your spot is confirmed for <strong>${classDetails.title}</strong>.`
          : `You have been added to the waitlist at position <strong>#${classDetails.waitlistPosition}</strong> for <strong>${classDetails.title}</strong>.`
        }
      </p>
      
      <div style="margin: 20px 0; padding: 16px; background-color: #1e1e1e; border-radius: 6px; border: 1px solid #333333;">
        <p style="margin: 6px 0; color: #ffffff;"><strong>Class:</strong> ${classDetails.title}</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Trainer:</strong> ${classDetails.trainerName}</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Location:</strong> ${classDetails.location}</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Date (E.C.):</strong> ${classDetails.dateEc}</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Schedule Time:</strong> ${classDetails.timeFormatted}</p>
      </div>

      <p style="color: #9ca3af; font-size: 13px;">
        ${isBooked 
          ? 'Please arrive 10 minutes early with your digital QR check-in pass.' 
          : 'You will be automatically promoted to booked and notified immediately if a spot opens up.'}
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: `${isBooked ? '✅ Confirmed: ' : '📋 Waitlisted: '}${classDetails.title} - Titan Fitness`,
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
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #121212; color: #f3f4f6; padding: 30px; border-radius: 8px;">
      <h2 style="color: #ff6b00; margin-bottom: 10px;">TITAN FITNESS</h2>
      <h3 style="color: #22c55e;">🎉 Great News! You Are In!</h3>
      <p style="color: #d1d5db;">Hello <strong>${firstName}</strong>,</p>
      <p style="color: #d1d5db;">
        A spot opened up and you have been promoted from the waitlist to <strong>BOOKED</strong> for <strong>${classDetails.title}</strong>!
      </p>
      
      <div style="margin: 20px 0; padding: 16px; background-color: #1e1e1e; border-radius: 6px; border: 1px solid #333333;">
        <p style="margin: 6px 0; color: #ffffff;"><strong>Class:</strong> ${classDetails.title}</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Trainer:</strong> ${classDetails.trainerName}</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Location:</strong> ${classDetails.location}</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Date (E.C.):</strong> ${classDetails.dateEc}</p>
        <p style="margin: 6px 0; color: #ffffff;"><strong>Schedule Time:</strong> ${classDetails.timeFormatted}</p>
      </div>

      <p style="color: #9ca3af; font-size: 13px;">
        Your digital pass is ready for check-in at the front desk. See you in class!
      </p>
    </div>
  `;

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
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #121212; color: #f3f4f6; padding: 30px; border-radius: 8px;">
      <h2 style="color: #ff6b00; margin-bottom: 10px;">TITAN FITNESS</h2>
      <h3 style="color: #ffffff;">Coach Feedback on Your Transformation Log</h3>
      <p style="color: #d1d5db;">Hello <strong>${firstName}</strong>,</p>
      <p style="color: #d1d5db;">
        Your personal coach <strong>${feedbackDetails.trainerName}</strong> reviewed your progress metric log recorded on <strong>${feedbackDetails.recordedDateEc}</strong> (Weight: <strong>${feedbackDetails.weightKg} kg</strong>) and left feedback:
      </p>
      
      <div style="margin: 20px 0; padding: 16px; background-color: #1e1e1e; border-radius: 6px; border-left: 4px solid #ff6b00; border: 1px solid #333333;">
        <p style="margin: 0; color: #f3f4f6; font-style: italic; font-size: 14px;">"${feedbackDetails.comment}"</p>
      </div>

      <div style="margin: 25px 0;">
        <a href="${config.corsOrigin}" style="background-color: #ff6b00; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          View Your Progress Dashboard
        </a>
      </div>
      <p style="color: #6b7280; font-size: 11px; margin-top: 30px;">Keep pushing towards your fitness goals!</p>
    </div>
  `;

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
