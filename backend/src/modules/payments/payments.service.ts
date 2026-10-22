import crypto from 'crypto';
import { config } from '../../config';
import { 
  BadRequestError, 
  UnauthorizedError, 
  NotFoundError, 
  ConflictError, 
  UnprocessableEntityError 
} from '../../shared/errors/AppError';
import { 
  PaymentsRepository, 
  MembershipRecord, 
  PaymentRecord 
} from './payments.repository';
import { 
  RecordManualPaymentInput, 
  PaymentFilterInput 
} from './payments.validation';
import { sendPaymentConfirmationEmail } from '../../shared/services/emailService';

export class PaymentsService {
  private repo = new PaymentsRepository();

  /**
   * Business Rule 3: Initialize online payment via Chapa (Test mode)
   * Enforces Business Rule 2: Member cannot have more than 1 active membership.
   */
  async initializeChapaPayment(
    memberUser: { id: string; email: string; firstName: string; lastName: string },
    planId: string,
    returnUrl?: string
  ): Promise<{ checkoutUrl: string | null; txRef: string; amount: number; planName: string; isLiveGateway: boolean }> {
    // 1. Validate plan
    const plan = await this.repo.findPlanById(planId);
    if (!plan || !plan.is_active) {
      throw new NotFoundError('Membership plan not found or is currently inactive');
    }

    // 2. Business Rule 2: Check for existing active membership
    const activeMembership = await this.repo.findActiveMembershipByMemberId(memberUser.id);
    if (activeMembership) {
      throw new ConflictError(
        'Member already has an active membership. Only one active membership is permitted at a time.'
      );
    }

    // 3. Generate unique transaction reference (Idempotency token)
    const txRef = `TX-GYM-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // 4. Create pending membership and pending payment inside a transaction
    const client = await this.repo.getClient();
    let pendingPayment: PaymentRecord;
    try {
      await client.query('BEGIN');

      const pendingMembership = await this.repo.createPendingMembership(
        memberUser.id,
        plan.id,
        client
      );

      pendingPayment = await this.repo.createPayment(
        {
          memberId: memberUser.id,
          membershipId: pendingMembership.id,
          amount: parseFloat(plan.price),
          currency: 'ETB',
          paymentMethod: 'chapa',
          status: 'pending',
          paymentReference: txRef,
        },
        client
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // 5. Call Chapa API to generate checkout URL if live key configured
    let checkoutUrl: string | null = null;
    let isLiveGateway = false;

    try {
      const isConfiguredKey =
        config.chapa.secretKey &&
        !config.chapa.secretKey.includes('placeholder') &&
        !config.chapa.secretKey.includes('sample') &&
        config.chapa.secretKey.startsWith('CHASECK_');

      if (isConfiguredKey) {
        const response = await fetch(`${config.chapa.baseUrl}/transaction/initialize`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.chapa.secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: plan.price.toString(),
            currency: 'ETB',
            email: memberUser.email,
            first_name: memberUser.firstName,
            last_name: memberUser.lastName,
            tx_ref: txRef,
            callback_url: `${config.corsOrigin.replace(':5173', ':5000')}/api/v1/payments/chapa/webhook`,
            return_url: returnUrl || `${config.corsOrigin}/?tx_ref=${txRef}`,
            customization: {
              title: 'Titan Fitness',
              description: `Payment for ${plan.name}`,
            },
          }),
        });

        const data: any = await response.json();
        if (data.status === 'success' && data.data?.checkout_url) {
          checkoutUrl = data.data.checkout_url;
          isLiveGateway = true;
        } else {
          console.warn('[Chapa] External API response not success:', data);
        }
      }
    } catch (apiErr) {
      console.warn('[Chapa] External API call error, falling back to local simulation mode:', apiErr);
    }

    return {
      checkoutUrl,
      txRef,
      amount: parseFloat(plan.price),
      planName: plan.name,
      isLiveGateway,
    };
  }

  /**
   * Business Rule 3: Verify and process Chapa Webhook
   * - Verifies HMAC-SHA256 signature
   * - Enforces idempotency (single processing of reference)
   * - Verifies amount against plan price
   * - Activates membership within a database transaction
   */
  async verifyAndProcessWebhook(
    rawBody: string,
    signature: string | undefined,
    payload: any
  ): Promise<{ status: string; message: string; paymentId?: string; membershipId?: string }> {
    // 1. Verify HMAC-SHA256 signature
    const secret = config.chapa.webhookSecret || config.chapa.secretKey;
    if (!signature) {
      throw new UnauthorizedError('Missing Chapa webhook signature header');
    }

    // In development mode, permit test-demo-bypass for instant local frontend verification
    const isDevBypass = config.env === 'development' && signature === 'test-demo-bypass';

    if (!isDevBypass) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      // Secure comparison
      const sigBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);
      const isValidSignature =
        sigBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, expectedBuffer);

      if (!isValidSignature) {
        throw new UnauthorizedError('Invalid Chapa webhook signature');
      }
    }

    const txRef = payload.tx_ref;
    if (!txRef) {
      throw new BadRequestError('Transaction reference (tx_ref) is missing from webhook payload');
    }

    // 2. Fetch payment record
    const payment = await this.repo.findPaymentByReference(txRef);
    if (!payment) {
      throw new NotFoundError(`Payment with reference "${txRef}" not found`);
    }

    // 3. Idempotency Check: Replay protection (processed once only)
    if (payment.status === 'completed') {
      return {
        status: 'already_processed',
        message: 'Payment reference has already been verified and processed',
        paymentId: payment.id,
        membershipId: payment.membership_id || undefined,
      };
    }

    // 4. Verify payment status from Chapa
    const isSuccess = payload.status === 'success';
    if (!isSuccess) {
      await this.repo.updatePaymentStatus(payment.id, 'failed', payload.reference, payload);
      return {
        status: 'failed',
        message: 'Webhook reported payment was not successful',
        paymentId: payment.id,
      };
    }

    // 5. Verify payment amount matches expected amount
    const paidAmount = parseFloat(payload.amount);
    const expectedAmount = payment.amount;
    if (Math.abs(paidAmount - expectedAmount) > 0.01) {
      await this.repo.updatePaymentStatus(payment.id, 'failed', payload.reference, payload);
      throw new UnprocessableEntityError(
        `Payment amount mismatch: Expected ${expectedAmount} ETB but received ${paidAmount} ETB`
      );
    }

    return await this.completePaymentAndActivateMembership(
      payment,
      payload.reference || payload.id || null,
      payload
    );
  }

  /**
   * Business Rule 3: Directly verify transaction with Chapa via /transaction/verify/:txRef
   * Handles user returning from Chapa hosted checkout gateway or manual client verification.
   */
  async verifyChapaTransaction(txRef: string): Promise<{
    status: string;
    message: string;
    paymentId?: string;
    membershipId?: string;
    isCompleted: boolean;
  }> {
    if (!txRef) {
      throw new BadRequestError('Transaction reference (tx_ref) is required');
    }

    const payment = await this.repo.findPaymentByReference(txRef);
    if (!payment) {
      throw new NotFoundError(`Payment with reference "${txRef}" not found`);
    }

    if (payment.status === 'completed') {
      return {
        status: 'success',
        message: 'Payment has already been verified and processed',
        paymentId: payment.id,
        membershipId: payment.membership_id || undefined,
        isCompleted: true,
      };
    }

    let chapaResponse: any = null;
    try {
      const response = await fetch(`${config.chapa.baseUrl}/transaction/verify/${txRef}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.chapa.secretKey}`,
          'Content-Type': 'application/json',
        },
      });
      chapaResponse = await response.json();
    } catch (netErr: any) {
      console.error('[Chapa Verify API] Failed to reach Chapa verify endpoint:', netErr);
      throw new BadRequestError('Unable to reach Chapa verification server');
    }

    if (!chapaResponse || chapaResponse.status !== 'success' || !chapaResponse.data) {
      return {
        status: 'pending',
        message: chapaResponse?.message || 'Payment is still awaiting completion on Chapa',
        paymentId: payment.id,
        isCompleted: false,
      };
    }

    const chapaData = chapaResponse.data;
    const statusLower = (chapaData.status || '').toLowerCase();
    const isSuccess =
      statusLower === 'success' ||
      statusLower === 'successful' ||
      statusLower === 'completed';
    const isFailed =
      statusLower.includes('fail') ||
      statusLower.includes('cancel') ||
      statusLower.includes('expired');

    if (isSuccess) {
      const result = await this.completePaymentAndActivateMembership(
        payment,
        chapaData.reference || chapaData.id || txRef,
        chapaData
      );
      return {
        ...result,
        isCompleted: true,
      };
    } else if (isFailed) {
      await this.repo.updatePaymentStatus(
        payment.id,
        'failed',
        chapaData.reference || txRef,
        chapaData
      );
      return {
        status: 'failed',
        message: 'Payment was cancelled or unsuccessful on Chapa',
        paymentId: payment.id,
        isCompleted: false,
      };
    }

    return {
      status: chapaData.status || 'pending',
      message: `Transaction is currently ${chapaData.status || 'pending'} on Chapa`,
      paymentId: payment.id,
      isCompleted: false,
    };
  }

  /**
   * Helper to activate membership and complete payment atomically in a DB transaction
   */
  private async completePaymentAndActivateMembership(
    payment: PaymentRecord,
    transactionId: string | null,
    rawPayload: any
  ): Promise<{ status: string; message: string; paymentId: string; membershipId: string }> {
    if (!payment.membership_id) {
      throw new UnprocessableEntityError('Payment is not linked to a membership record');
    }

    const membership = await this.repo.findMembershipById(payment.membership_id);
    if (!membership) {
      throw new NotFoundError('Associated membership record not found');
    }

    const durationMonths = membership.duration_months || 1;

    const client = await this.repo.getClient();
    let activatedMembership: MembershipRecord;
    try {
      await client.query('BEGIN');

      // Update payment status to completed
      await this.repo.updatePaymentStatus(
        payment.id,
        'completed',
        transactionId,
        rawPayload,
        client
      );

      // Activate membership
      activatedMembership = await this.repo.activateMembership(
        membership.id,
        durationMonths,
        client
      );

      // Audit log
      await this.repo.recordAuditLog(
        {
          userId: payment.member_id,
          action: 'PAYMENT_COMPLETED',
          entityType: 'payments',
          entityId: payment.id,
          oldValues: { status: 'pending' },
          newValues: {
            status: 'completed',
            amount: payment.amount,
            method: 'chapa',
            reference: payment.payment_reference,
            membershipId: membership.id,
          },
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

    // Send confirmation email to member
    if (payment.member_email && payment.member_first_name) {
      sendPaymentConfirmationEmail(payment.member_email, payment.member_first_name, {
        planName: membership.plan_name || 'Gym Membership',
        amount: payment.amount,
        paymentMethod: 'Chapa Online',
        reference: payment.payment_reference,
        startDate: activatedMembership.start_date || 'Today',
        endDate: activatedMembership.end_date || 'N/A',
      }).catch((emailErr) => console.error('[Payment Activation] Confirmation email error:', emailErr));
    }

    return {
      status: 'success',
      message: 'Payment verified and membership activated successfully',
      paymentId: payment.id,
      membershipId: membership.id,
    };
  }

  /**
   * Business Rule 4: Reception and Admin record Cash and Bank-Transfer payments
   * Enforces Business Rule 2: Member cannot have more than 1 active membership.
   */
  async recordManualPayment(
    recordedByUser: { id: string; email: string },
    data: RecordManualPaymentInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ payment: PaymentRecord; membership: MembershipRecord }> {
    // 1. Validate target member
    const member = await this.repo.findUserById(data.memberId);
    if (!member) {
      throw new NotFoundError('Member not found');
    }
    if (member.role !== 'member') {
      throw new BadRequestError('Manual payments can only be recorded for accounts with role "member"');
    }

    // 2. Validate plan
    const plan = await this.repo.findPlanById(data.planId);
    if (!plan || !plan.is_active) {
      throw new NotFoundError('Membership plan not found or is currently inactive');
    }

    // 3. Business Rule 2: Check for existing active membership
    const activeMembership = await this.repo.findActiveMembershipByMemberId(data.memberId);
    if (activeMembership) {
      throw new ConflictError(
        'Member already has an active membership. Only one active membership is permitted at a time.'
      );
    }

    // 4. Verify amount >= plan price
    const planPrice = parseFloat(plan.price);
    if (data.amount < planPrice) {
      throw new BadRequestError(
        `Recorded amount (${data.amount} ETB) is less than the plan price (${planPrice} ETB)`
      );
    }

    // 5. Generate manual reference
    const refPrefix = data.paymentMethod === 'cash' ? 'MAN-CASH' : 'MAN-BANK';
    const reference = `${refPrefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // 6. Database transaction: Create active membership + completed payment + audit log
    const client = await this.repo.getClient();
    let membership: MembershipRecord;
    let payment: PaymentRecord;

    try {
      await client.query('BEGIN');

      // Create and activate membership directly
      membership = await this.repo.createAndActivateMembership(
        data.memberId,
        plan.id,
        plan.duration_months,
        client
      );

      // Create completed payment record
      payment = await this.repo.createPayment(
        {
          memberId: data.memberId,
          membershipId: membership.id,
          amount: data.amount,
          currency: 'ETB',
          paymentMethod: data.paymentMethod,
          status: 'completed',
          paymentReference: reference,
          recordedByUserId: recordedByUser.id,
          rawResponse: {
            note: data.referenceNote || 'Offline recorded by staff',
            recordedBy: recordedByUser.email,
          },
        },
        client
      );

      // Record audit log
      await this.repo.recordAuditLog(
        {
          userId: recordedByUser.id,
          action: 'OFFLINE_PAYMENT_RECORDED',
          entityType: 'payments',
          entityId: payment.id,
          newValues: {
            paymentMethod: data.paymentMethod,
            amount: data.amount,
            memberId: data.memberId,
            planId: plan.id,
            membershipId: membership.id,
            reference,
            note: data.referenceNote || null,
          },
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
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

    // 7. Send receipt email to member
    if (member.email && member.first_name) {
      sendPaymentConfirmationEmail(member.email, member.first_name, {
        planName: plan.name,
        amount: data.amount,
        paymentMethod: data.paymentMethod === 'cash' ? 'Cash (Front Desk)' : 'Bank Transfer',
        reference,
        startDate: membership.start_date || 'Today',
        endDate: membership.end_date || 'N/A',
      }).catch((emailErr) => console.error('[ManualPayment] Receipt email error:', emailErr));
    }

    return { payment, membership };
  }

  /**
   * Fetch active membership for member dashboard
   */
  async getMemberActiveMembership(memberId: string): Promise<any | null> {
    const membership = await this.repo.findActiveMembershipByMemberId(memberId);
    if (!membership) return null;

    // Calculate days remaining
    let daysRemaining = 0;
    if (membership.end_date) {
      const end = new Date(membership.end_date);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    return {
      ...membership,
      daysRemaining,
    };
  }

  /**
   * Fetch payment history for a member
   */
  async getMemberPaymentHistory(memberId: string): Promise<PaymentRecord[]> {
    return this.repo.findPaymentsByMemberId(memberId);
  }

  /**
   * Fetch all payments for Admin & Reception
   */
  async getAllPayments(query: PaymentFilterInput): Promise<{
    payments: PaymentRecord[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { payments, total } = await this.repo.findAllPayments({
      page: query.page,
      limit: query.limit,
      status: query.status,
      paymentMethod: query.paymentMethod,
    });

    return {
      payments,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }
}
