# multiply. Payment System Testing Guide

## Prerequisites

1. **Razorpay Account Setup**
   - Get test keys from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
   - Replace placeholder values in `.env.local`:
     ```
     RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
     RAZORPAY_KEY_SECRET=your_actual_key_secret
     NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
     ```

2. **Convex Environment Variables**
   - Add to Vercel/deployment:
     ```
     NEXT_PUBLIC_CONVEX_URL=https://admired-blackbird-652.convex.cloud
     GMAIL_USER=https.adnan.exe@gmail.com
     GMAIL_APP_PASSWORD=fsnziuvgnmudmpnc
     RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
     RAZORPAY_KEY_SECRET=your_actual_key_secret
     NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
     ```

## Test Scenarios

### 1. Free User Gig Payment Flow

**Setup:**
- Create two test accounts: one creator, one business
- Ensure business account is NOT Pro (isPro: false)

**Test Steps:**
1. **Gig Creation**
   - Login as creator
   - Create gig with ₹1,000 charge
   - Verify fee calculator shows ₹50 platform fee (5%)
   - Verify "creator receives: ₹950"

2. **Gig Discovery & Messaging**
   - Login as business user
   - Find creator's gig in home feed
   - Tap "chat & deal" to open messages
   - Send message to negotiate

3. **Gig Confirmation**
   - Business should see "Confirm Gig" button in messages
   - Tap to see payment mode selection:
     - **Advance**: ₹50 (platform fee only)
     - **Direct**: ₹1,050 (full amount + fee)
   - Select payment mode and confirm

4. **Payment Processing**
   - Gig status changes to "agreed"
   - Business sees "Pay Now" button
   - Tap to open Razorpay checkout
   - Use test card: 4111 1111 1111 1111, any future date, any CVV
   - Complete payment

5. **Post-Payment Verification**
   - Gig status changes to "in_progress"
   - Both parties receive payment notifications
   - Creator sees payment received notification
   - Business sees payment confirmed notification

### 2. Pro User Gig Payment Flow

**Setup:**
- Upgrade business account to Pro
- Test Pro subscription payment first

**Test Steps:**
1. **Pro Subscription**
   - Login as business user
   - Go to Profile tab
   - See "upgrade to multiply. Pro" card
   - Tap "upgrade to Pro — ₹190/month"
   - Complete Razorpay subscription payment
   - Verify Pro badge appears (✳ pro)

2. **Zero Fee Gig**
   - Create gig as creator (₹1,000)
   - Confirm gig as Pro business user
   - Verify fee calculator shows "₹0 — Pro member ✳"
   - Complete payment (should be full ₹1,000, zero platform fee)

### 3. Gig Completion & Rating Flow

**Test Steps:**
1. **Mutual Completion**
   - Both creator and business mark gig complete
   - First person sees "waiting for partner to confirm"
   - Second person sees "partner marked complete. confirm to finalize!"
   - After both confirm, gig status changes to "completed"

2. **Rating Prompt**
   - Both parties see rating dialog
   - Submit 1-5 star rating with optional review text
   - Verify ratings update user profiles
   - Check review appears in user's profile reviews

### 4. Payment Status Tracking

**Verify Throughout:**
- Payment status indicators work correctly
- Notifications are sent at each step
- PaymentHistory component shows transactions
- Gig status updates properly in real-time

## Test Payment Details

### Razorpay Test Cards
```
Success: 4111 1111 1111 1111
Failure: 4000 0000 0000 0002
CVV: Any 3-digit number
Expiry: Any future date
```

### Test Amounts
- ₹500 (minimum) → ₹25 fee (free user), ₹0 fee (Pro)
- ₹1,000 → ₹50 fee (free user), ₹0 fee (Pro)
- ₹5,000 → ₹250 fee (free user), ₹0 fee (Pro)
- ₹10,000 → ₹500 fee (free user), ₹0 fee (Pro)

## Error Scenarios to Test

1. **Payment Failures**
   - Use failure test card
   - Verify gig returns to "agreed" status
   - Check error notifications are sent

2. **Network Issues**
   - Test payment timeout scenarios
   - Verify proper error handling

3. **Invalid Amounts**
   - Try creating gig under ₹500
   - Verify validation messages

4. **Pro Expiry**
   - Test Pro subscription expiration
   - Verify fees return to 5% after expiry

## Database Verification

Check these Convex tables after each test:

1. **gigs table**
   - `status` field transitions correctly
   - `platformFee` field stores correct amount
   - `razorpayOrderId` and `razorpayPaymentId` populated

2. **subscriptions table**
   - Pro subscription records created
   - Status and expiry dates correct

3. **notifications table**
   - Payment notifications sent to correct users
   - Completion and rating notifications work

4. **reviews table**
   - Rating submissions stored correctly
   - Average ratings calculated properly

## Success Criteria

✅ **All payment modes work (advance/direct)**
✅ **Fee calculation correct (5% free, 0% Pro)**
✅ **Pro subscription upgrade functional**
✅ **Mutual gig completion works**
✅ **Rating system functional**
✅ **Notifications sent properly**
✅ **Payment status tracking accurate**
✅ **Error handling graceful**

## Common Issues & Solutions

1. **Razorpay checkout doesn't open**
   - Check browser console for script loading errors
   - Verify NEXT_PUBLIC_RAZORPAY_KEY_ID is set

2. **Payment verification fails**
   - Check server logs for Razorpay signature errors
   - Verify RAZORPAY_KEY_SECRET is correct

3. **Pro status not updating**
   - Check user.proExpiresAt timestamp
   - Verify subscription creation in database

4. **Notifications not appearing**
   - Check notifications table in Convex dashboard
   - Verify notification polling in app

## Production Deployment Notes

1. **Switch to live Razorpay keys**
2. **Test with small real amounts first**
3. **Monitor error rates and payment failures**
4. **Set up Razorpay webhooks for subscription events**
5. **Add payment reconciliation process**