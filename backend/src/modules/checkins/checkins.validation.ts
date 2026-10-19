import { z } from 'zod';

export const scanCheckinSchema = z.object({
  scannedData: z.string({
    required_error: 'Scanned QR token or member ID is required',
  }).min(1, 'Scanned data cannot be empty'),
  checkinType: z.enum(['reception_qr', 'reception_manual', 'self_qr']).optional(),
  allowOverride: z.boolean().optional(),
});

export type ScanCheckinInput = z.infer<typeof scanCheckinSchema>;
