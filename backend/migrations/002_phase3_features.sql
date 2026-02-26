-- Phase 3: Missing Features - Email notifications, refunds, transaction history
-- Run this migration on your Supabase database

-- Add refunded_at column to track refund timestamp
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Update the status check constraint to include 'refunded'
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('held', 'pending_payment', 'paid', 'complete', 'disputed', 'refunded'));

-- Add index for refunded transactions
CREATE INDEX IF NOT EXISTS idx_transactions_refunded 
ON transactions(refunded_at) 
WHERE refunded_at IS NOT NULL;

-- Optional: Add a function to automatically track status changes
CREATE OR REPLACE FUNCTION track_transaction_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes (you can create a separate audit table if needed)
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    RAISE NOTICE 'Transaction % status changed from % to %', NEW.id, OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS transaction_status_change_trigger ON transactions;
CREATE TRIGGER transaction_status_change_trigger
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION track_transaction_status_changes();
