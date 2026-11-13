-- Migration: 003_fix_payment_status.sql
-- Description: Convert payments.status to VARCHAR(50) with check constraint to support 'completed', 'successful', 'pending', 'failed', 'refunded'

ALTER TABLE payments ALTER COLUMN status DROP DEFAULT;
ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE payments ALTER COLUMN status SET DEFAULT 'pending';

-- Normalize any historical 'successful' status to 'completed'
UPDATE payments SET status = 'completed' WHERE status = 'successful';

DO $$ BEGIN
    ALTER TABLE payments ADD CONSTRAINT chk_payments_status 
    CHECK (status IN ('pending', 'completed', 'successful', 'failed', 'refunded'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
