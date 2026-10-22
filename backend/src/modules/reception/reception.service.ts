import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { ReceptionRepository, UserRecord, MembershipRecord, PaymentRecord } from './reception.repository';
import { WalkinRegisterInput } from './reception.validation';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError 
} from '../../shared/errors/AppError';
import { 
  sendWalkinInvitationEmail, 
  sendPaymentConfirmationEmail 
} from '../../shared/services/emailService';
import { formatEthiopianDate } from '../../shared/utils/ethiopianCalendar';

export interface WalkinRegistrationResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    isNewUser: boolean;
  };
  membership: MembershipRecord;
  payment: PaymentRecord;
  inviteSent: boolean;
  inviteToken?: string;
}

export class ReceptionService {
  private repo = new ReceptionRepository();

  async registerWalkinMember(
    staffUser: { id: string; email: string },
    input: WalkinRegisterInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<WalkinRegistrationResult> {
    // 1. Validate plan
    const plan = await this.repo.findPlanById(input.planId);
    if (!plan || !plan.is_active) {
      throw new NotFoundError('Selected membership plan not found or is currently inactive');
    }

    // 2. Validate amount >= plan price
    const planPrice = parseFloat(plan.price);
    if (input.amount < planPrice) {
      throw new BadRequestError(
        `Recorded amount (${input.amount} ETB) is less than the plan price (${planPrice} ETB)`
      );
    }

    // 3. Check if user already exists
    let existingUser = await this.repo.findUserByEmail(input.email);
    if (existingUser && existingUser.role !== 'member') {
      throw new BadRequestError('This email is associated with a staff account and cannot be registered as a member');
    }

    // 4. Rule 2: Single active membership check
    if (existingUser) {
      const activeMembership = await this.repo.findActiveMembershipByMemberId(existingUser.id);
      if (activeMembership) {
        throw new ConflictError(
          `Member ${existingUser.first_name} ${existingUser.last_name} already has an active membership (${activeMembership.plan_name}). Only 1 active membership is permitted.`
        );
      }
    }

    const client = await this.repo.getClient();
    let targetUser: UserRecord;
    let isNewUser = false;
    let inviteToken: string | undefined;
    let membership: MembershipRecord;
    let payment: PaymentRecord;

    try {
      await client.query('BEGIN');

      if (!existingUser) {
        // Create new user
        isNewUser = true;
        const tempPassword = crypto.randomBytes(16).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        targetUser = await this.repo.createUser(
          {
            email: input.email.toLowerCase(),
            passwordHash,
            role: 'member',
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            isVerified: true, // In-person front desk verified
          },
          client
        );

        // Generate invitation set-password token (valid for 72 hours)
        inviteToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
        await this.repo.createPasswordResetToken(targetUser.id, inviteToken, expiresAt, client);

        // Create member profile
        const memberCode = `M-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        await this.repo.createMemberProfile(
          {
            userId: targetUser.id,
            memberCode,
            emergencyContact: input.emergencyContact,
            fitnessGoals: input.fitnessGoals,
            assignedTrainerId: input.assignedTrainerId,
          },
          client
        );
      } else {
        targetUser = existingUser;
      }

      // Activate membership directly
      membership = await this.repo.createAndActivateMembership(
        targetUser.id,
        plan.id,
        plan.duration_months,
        client
      );

      // Create payment record
      const refPrefix = input.paymentMethod === 'cash' ? 'WALK-CASH' : 'WALK-BANK';
      const reference = `${refPrefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      payment = await this.repo.createPayment(
        {
          memberId: targetUser.id,
          membershipId: membership.id,
          amount: input.amount,
          currency: 'ETB',
          paymentMethod: input.paymentMethod,
          status: 'completed',
          paymentReference: reference,
          recordedByUserId: staffUser.id,
          rawResponse: {
            note: input.referenceNote || 'Front Desk Walk-In Registration',
            recordedBy: staffUser.email,
          },
        },
        client
      );

      // Record audit log
      await this.repo.recordAuditLog(
        {
          userId: staffUser.id,
          action: 'WALK_IN_REGISTRATION_CREATED',
          entityType: 'memberships',
          entityId: membership.id,
          newValues: {
            memberId: targetUser.id,
            memberEmail: targetUser.email,
            planId: plan.id,
            paymentMethod: input.paymentMethod,
            amount: input.amount,
            reference,
            isNewUser,
          },
          ipAddress,
          userAgent,
        },
        client
      );

      await client.query('COMMIT');
    } catch (err: any) {
      await client.query('ROLLBACK');
      if (err.code === '23505' && err.constraint === 'idx_single_active_membership') {
        throw new ConflictError('Member already has an active membership');
      }
      throw err;
    } finally {
      client.release();
    }

    // 5. Send emails asynchronously
    if (isNewUser && inviteToken) {
      sendWalkinInvitationEmail(targetUser.email, targetUser.first_name, inviteToken).catch(
        (err) => console.error('[Walk-in] Invite email failed:', err)
      );
    }

    const ethStart = formatEthiopianDate(membership.start_date);
    const ethEnd = formatEthiopianDate(membership.end_date);

    sendPaymentConfirmationEmail(targetUser.email, targetUser.first_name, {
      planName: plan.name,
      amount: input.amount,
      paymentMethod: input.paymentMethod === 'cash' ? 'Cash (Front Desk Walk-In)' : 'Bank Transfer (Front Desk)',
      reference: payment.payment_reference,
      startDate: `${ethStart} E.C. (${membership.start_date})`,
      endDate: `${ethEnd} E.C. (${membership.end_date})`,
    }).catch((err) => console.error('[Walk-in] Confirmation email failed:', err));

    return {
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.first_name,
        lastName: targetUser.last_name,
        phone: targetUser.phone,
        isNewUser,
      },
      membership,
      payment,
      inviteSent: isNewUser,
      inviteToken,
    };
  }
}
