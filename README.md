# safipay
M-Pesa Escrow Web App

## Recent Updates

### Phase 2: User Experience Improvements ✅

1. **Modern Modal Dialogs** - Replaced all prompt() and alert() calls:
   - Payment modal with phone number input
   - Release confirmation modal with transaction details
   - Dispute modal with textarea for detailed reasons
   - Toast notifications for success/error messages

2. **Real-time Payment Status** - Added polling for payment confirmation:
   - Shows "Checking payment..." indicator after STK push
   - Automatically updates when M-Pesa callback confirms payment
   - Polls every 3 seconds for up to 5 minutes
   - Toast notification when payment is confirmed

3. **Transaction Filtering & Search**:
   - Search by description, buyer/seller email, or M-Pesa receipt
   - Filter by status (All, In Escrow, Awaiting Payment, Paid, Complete, Disputed)
   - Shows count of filtered vs total transactions
   - Real-time filtering as you type

4. **Mobile Responsive Design**:
   - Responsive grid layouts (stats cards adapt to screen size)
   - Flexible navigation that works on small screens
   - Touch-friendly button sizes
   - Proper text scaling with clamp()
   - Custom scrollbar styling

5. **Better Loading States**:
   - Loading indicators on all modal actions
   - Disabled buttons during API calls
   - Visual feedback for all user actions

### Phase 1: Security Improvements ✅

1. **Fixed Payment Flow** - Transactions now correctly transition through states:
   - `held` → `pending_payment` (after STK push) → `paid` (after M-Pesa callback confirms)
   - Previously marked as paid immediately, which was incorrect

2. **Secured Backend Endpoints** - All API routes now require authentication:
   - `/api/stkpush` - Requires valid JWT token
   - `/api/release` - Requires valid JWT token  
   - `/api/dispute` - Requires valid JWT token
   - Verifies user owns the transaction before allowing actions

3. **Enhanced Error Handling**:
   - Phone number validation (Kenyan format: 0712345678 or 254712345678)
   - Amount validation (minimum KES 1)
   - Transaction state validation (can't release unpaid transactions, etc.)
   - Failed payment handling (reverts to `held` status for retry)
   - Detailed error messages returned to frontend

4. **Environment Variable Validation**:
   - Backend checks for required env vars on startup
   - Frontend validates Supabase config before initialization
   - Clear error messages if configuration is missing

### Database Schema Update Required

Add new columns to your `transactions` table:

```sql
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_error TEXT;

-- Update any existing transactions in 'paid' status without receipt to 'held'
UPDATE transactions 
SET status = 'held' 
WHERE status = 'paid' AND mpesa_receipt IS NULL;
```

### Testing Checklist

Phase 2:
- [ ] Open payment modal and send STK push
- [ ] See real-time payment status updates
- [ ] Search transactions by description
- [ ] Filter transactions by status
- [ ] Test on mobile device (responsive layout)
- [ ] Release funds via modal confirmation
- [ ] Raise dispute with detailed reason
- [ ] See toast notifications for all actions

Phase 1:
- [ ] Create transaction (should be in `held` status)
- [ ] Initiate payment (should move to `pending_payment`)
- [ ] Complete M-Pesa payment (should move to `paid` with receipt)
- [ ] Cancel M-Pesa payment (should revert to `held`)
- [ ] Try to release funds without auth token (should fail with 401)
- [ ] Release funds (should move to `complete`)
- [ ] Raise dispute (should move to `disputed`)

## Setup

1. Install dependencies:
```bash
npm install
cd backend && npm install
```

2. Configure environment variables (see `.env.example`)

3. Run development servers:
```bash
# Frontend
npm run dev

# Backend
cd backend && npm run dev
```
