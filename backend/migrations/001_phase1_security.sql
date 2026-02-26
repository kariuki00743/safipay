-- Phase 1: Security & Payment Flow Improvements
-- Run this migration on your Supabase database

-- Add payment_error column to track failed payment attempts
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_error TEXT;

-- Clean up any inconsistent data (transactions marked as paid without receipt)
UPDATE transactions 
SET status = 'held' 
WHERE status = 'paid' AND mpesa_receipt IS NULL;

-- Add index for faster lookups by mpesa_code (used in callback)
CREATE INDEX IF NOT EXISTS idx_transactions_mpesa_code 
ON transactions(mpesa_code) 
WHERE mpesa_code IS NOT NULL;

-- Add index for user_id + status queries (used in dashboard)
CREATE INDEX IF NOT EXISTS idx_transactions_user_status 
ON transactions(user_id, status);

-- Optional: Add a check constraint to ensure valid status values
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('held', 'pending_payment', 'paid', 'complete', 'disputed'));
