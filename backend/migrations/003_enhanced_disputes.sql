-- Add seller_phone to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS seller_phone VARCHAR(15);

-- Create disputes table for enhanced dispute resolution
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  raised_by VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  item_description TEXT,
  evidence_images TEXT[], -- Array of image URLs
  status VARCHAR(50) DEFAULT 'pending', -- pending, under_review, resolved
  resolution TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_disputes_transaction_id ON disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- Add RLS policies for disputes table
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own disputes" ON disputes
  FOR SELECT USING (
    raised_by = auth.jwt() ->> 'email' OR
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.id = disputes.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create disputes for their transactions" ON disputes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.id = transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );
