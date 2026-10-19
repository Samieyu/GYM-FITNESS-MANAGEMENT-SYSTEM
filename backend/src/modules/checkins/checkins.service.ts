import { CheckinsRepository, CheckinRecord, ActiveMembershipInfo } from './checkins.repository';
import { generateMemberQrToken, verifyMemberQrToken } from '../../shared/utils/qrTokens';
import { 
  BadRequestError, 
  NotFoundError, 
  ForbiddenError, 
  ConflictError 
} from '../../shared/errors/AppError';

export interface QrPassResponse {
  token: string;
  expiresInSeconds: number;
  timestamp: number;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  membership: ActiveMembershipInfo | null;
}

export interface ScanResultResponse {
  status: 'allowed' | 'denied';
  message: string;
  checkinId: string;
  checkinTime: Date;
  denialReason?: string | null;
  isRepeatCheckin?: boolean;
  minutesSinceLastCheckin?: number;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  membership?: ActiveMembershipInfo | null;
}

export class CheckinsService {
  private repo = new CheckinsRepository();

  /**
   * Business Rule 7: Generate a rotating dynamic 60-second QR token for a member
   */
  async generateMemberQrPass(userId: string): Promise<QrPassResponse> {
    const user = await this.repo.findUserById(userId);
    const activeMembership = await this.repo.findActiveMembership(userId);
    const { token, timestamp, expiresInSeconds } = generateMemberQrToken(userId);

    return {
      token,
      expiresInSeconds,
      timestamp,
      member: {
        id: userId,
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
      },
      membership: activeMembership,
    };
  }

  /**
   * Business Rules 7, 8, 9: Process front desk QR code scan or manual check-in
   */
  async processCheckinScan(params: {
    scannedData: string;
    scannedByUserId: string;
    checkinType?: 'reception_qr' | 'reception_manual' | 'self_qr';
    allowOverride?: boolean;
  }): Promise<ScanResultResponse> {
    const { scannedData, scannedByUserId, checkinType = 'reception_qr', allowOverride = false } = params;

    let memberId: string;
    let resolvedType = checkinType;

    // 1. Resolve scanned data (Check if dynamic HMAC QR token or direct Member UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(scannedData.trim())) {
      // Manual member UUID entry at reception desk
      memberId = scannedData.trim();
      resolvedType = 'reception_manual';
    } else {
      // Verify rotating cryptographic HMAC-SHA256 QR token (Business Rule 7)
      const tokenVerification = verifyMemberQrToken(scannedData.trim());
      if (!tokenVerification.valid || !tokenVerification.memberId) {
        throw new BadRequestError(
          tokenVerification.reason || 'Invalid QR code. Please ask the member to refresh their pass.'
        );
      }
      memberId = tokenVerification.memberId;
    }

    // 2. Verify member exists and account is active
    const member = await this.repo.findUserById(memberId);
    if (!member) {
      throw new NotFoundError('Member record not found in system.');
    }

    if (!member.is_active) {
      const deniedRecord = await this.repo.createCheckin({
        memberId,
        status: 'denied',
        denialReason: 'Member account is deactivated/suspended.',
        checkinType: resolvedType,
        scannedByUserId,
      });

      return {
        status: 'denied',
        message: 'Access Denied: Member account is deactivated.',
        checkinId: deniedRecord.id,
        checkinTime: deniedRecord.checkin_time,
        denialReason: deniedRecord.denial_reason,
        member: {
          id: member.id,
          firstName: member.first_name,
          lastName: member.last_name,
          email: member.email,
          role: member.role,
        },
      };
    }

    // 3. Business Rule 8: Validate active membership
    const activeMembership = await this.repo.findActiveMembership(memberId);
    if (!activeMembership) {
      const deniedRecord = await this.repo.createCheckin({
        memberId,
        status: 'denied',
        denialReason: 'No active membership found (expired or unpaid).',
        checkinType: resolvedType,
        scannedByUserId,
      });

      return {
        status: 'denied',
        message: 'Access Denied: No active membership or membership has expired.',
        checkinId: deniedRecord.id,
        checkinTime: deniedRecord.checkin_time,
        denialReason: deniedRecord.denial_reason,
        member: {
          id: member.id,
          firstName: member.first_name,
          lastName: member.last_name,
          email: member.email,
          role: member.role,
        },
      };
    }

    // 4. Business Rule 9: Check 2-hour repeat check-in (Anti-passback rule)
    const recentCheckin = await this.repo.findRecentAllowedCheckin(memberId, 2);
    if (recentCheckin && !allowOverride) {
      const checkinMs = new Date(recentCheckin.checkin_time).getTime();
      const minutesAgo = Math.max(1, Math.round((Date.now() - checkinMs) / 60000));

      const deniedRecord = await this.repo.createCheckin({
        memberId,
        status: 'denied',
        denialReason: `Repeat check-in within 2 hours (${minutesAgo} mins ago). Anti-passback enforced.`,
        checkinType: resolvedType,
        scannedByUserId,
      });

      return {
        status: 'denied',
        message: `Repeat Check-in: Member already checked in ${minutesAgo} minutes ago.`,
        checkinId: deniedRecord.id,
        checkinTime: deniedRecord.checkin_time,
        denialReason: deniedRecord.denial_reason,
        isRepeatCheckin: true,
        minutesSinceLastCheckin: minutesAgo,
        member: {
          id: member.id,
          firstName: member.first_name,
          lastName: member.last_name,
          email: member.email,
          role: member.role,
        },
        membership: activeMembership,
      };
    }

    // 5. Grant entry and record successful check-in
    const record = await this.repo.createCheckin({
      memberId,
      status: 'allowed',
      denialReason: allowOverride && recentCheckin ? 'Reception authorized 2-hour override.' : null,
      checkinType: resolvedType,
      scannedByUserId,
    });

    return {
      status: 'allowed',
      message: `Access Granted! Welcome, ${member.first_name}.`,
      checkinId: record.id,
      checkinTime: record.checkin_time,
      member: {
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        role: member.role,
      },
      membership: activeMembership,
    };
  }

  /**
   * Retrieve recent check-ins for front desk live attendance log
   */
  async getRecentCheckins(limit: number = 25): Promise<CheckinRecord[]> {
    return await this.repo.findRecentCheckins(limit);
  }

  /**
   * Retrieve member's personal check-in history
   */
  async getMemberCheckinHistory(memberId: string, limit: number = 30): Promise<CheckinRecord[]> {
    return await this.repo.findMemberHistory(memberId, limit);
  }
}
