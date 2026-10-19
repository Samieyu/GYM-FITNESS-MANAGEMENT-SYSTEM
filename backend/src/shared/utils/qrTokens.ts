import crypto from 'crypto';
import { config } from '../../config';

export interface QrTokenPayload {
  memberId: string;
  timestamp: number;
}

/**
 * Business Rule 7: Dynamic 60-Second Rotating QR Code
 * Signs a member ID and current timestamp using HMAC-SHA256.
 */
export const generateMemberQrToken = (
  memberId: string,
  nowTimestamp: number = Date.now()
): { token: string; timestamp: number; expiresInSeconds: number } => {
  const secret = config.qr.hmacSecret;
  const payloadStr = `${memberId}:${nowTimestamp}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadStr)
    .digest('hex');

  // Format: base64(memberId:timestamp:signature)
  const token = Buffer.from(`${memberId}:${nowTimestamp}:${signature}`).toString('base64url');

  return {
    token,
    timestamp: nowTimestamp,
    expiresInSeconds: config.qr.validitySeconds || 60,
  };
};

/**
 * Business Rule 7: Verifies HMAC signature and 60-second validity window
 */
export const verifyMemberQrToken = (
  token: string,
  maxAgeMs: number = (config.qr.validitySeconds || 60) * 1000
): { valid: boolean; memberId?: string; reason?: string } => {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) {
      return { valid: false, reason: 'Invalid QR token format' };
    }

    const [memberId, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return { valid: false, reason: 'Invalid QR token timestamp' };
    }

    // 1. Verify HMAC-SHA256 signature
    const secret = config.qr.hmacSecret;
    const payloadStr = `${memberId}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadStr)
      .digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { valid: false, reason: 'Tampered or invalid QR signature' };
    }

    // 2. Verify 60-second time window (anti-screenshot protection)
    const age = Date.now() - timestamp;
    if (age < -5000) {
      // Future timestamp clock skew protection (>5s in future)
      return { valid: false, reason: 'QR token from future timestamp' };
    }
    if (age > maxAgeMs) {
      return { valid: false, reason: 'QR token expired. Please refresh your pass.' };
    }

    return { valid: true, memberId };
  } catch (err: any) {
    return { valid: false, reason: 'Malformed QR token' };
  }
};
