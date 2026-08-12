# multiply. Payment System Deployment Checklist

## Pre-Deployment Setup

### 1. Razorpay Configuration
- [ ] Create Razorpay account
- [ ] Get test API keys from dashboard
- [ ] Replace placeholder keys in `.env.local`
- [ ] Test keys work with a simple API call
- [ ] Generate live keys for production

### 2. Environment Variables
- [ ] Local development (`.env.local`):
  ```
  NEXT_PUBLIC_CONVEX_URL=https://admired-blackbird-652.convex.cloud
  GMAIL_USER=https.adnan.exe@gmail.com
  GMAIL_APP_PASSWORD=fsnziuvgnmudmpnc
  RAZORPAY_KEY_ID=rzp_test_your_key_id
  RAZORPAY_KEY_SECRET=your_key_secret
  NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
  ```

- [ ] Vercel deployment variables:
  - [ ] `NEXT_PUBLIC_CONVEX_URL`
  - [ ] `GMAIL_USER` 
  - [ ] `GMAIL_APP_PASSWORD`
  - [ ] `RAZORPAY_KEY_ID` (secret)
  - [ ] `RAZORPAY_KEY_SECRET` (secret)
  - [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` (public)

### 3. Convex Database
- [ ] Convex deployment is live
- [ ] All tables exist with correct schema
- [ ] Test data can be inserted/queried
- [ ] Functions deploy without errors

## Functionality Testing

### 4. User Authentication & Profiles
- [ ] Sign up with OTP works
- [ ] Email delivery works (check spam folder)
- [ ] Profile creation works for creators and businesses
- [ ] Pro subscription status tracking works

### 5. Gig Management
- [ ] Create gig flow works
- [ ] Fee calculator shows correct amounts
- [ ] Platform fee calculation correct (5% free, 0% Pro)
- [ ] Gig discovery in home feed works
- [ ] Messaging between users works

### 6. Payment Flows

#### Free User Gig Payments
- [ ] Gig confirmation shows 5% platform fee
- [ ] Advance payment mode: charges platform fee only
- [ ] Direct payment mode: charges full amount + platform fee
- [ ] Payment success updates gig status to "in_progress"
- [ ] Payment failure returns gig to "agreed" status
- [ ] Notifications sent to both parties

#### Pro User Gig Payments  
- [ ] Pro subscription upgrade works
- [ ] Pro badge appears in profile
- [ ] Pro gigs show zero platform fee
- [ ] Pro payment amounts are correct
- [ ] Pro status checked correctly (including expiry)

#### Pro Subscription
- [ ] Upgrade card appears in profile
- [ ] Subscription checkout opens
- [ ] Payment processing works
- [ ] Pro status activates after payment
- [ ] Pro benefits apply immediately

### 7. Gig Completion
- [ ] Both parties must mark complete
- [ ] Mutual completion finalizes gig
- [ ] Order count increments for both users
- [ ] Rating dialog appears after completion
- [ ] Reviews are stored and displayed
- [ ] Average rating calculation works

### 8. Notifications System
- [ ] Payment received notifications
- [ ] Payment confirmed notifications
- [ ] Completion pending notifications
- [ ] Review received notifications
- [ ] Pro subscription notifications
- [ ] Notification icons correct for each type

### 9. UI/UX Consistency
- [ ] All fee displays show 5% structure
- [ ] Pro badges appear consistently
- [ ] Payment status indicators work
- [ ] Fee calculator accuracy
- [ ] Mobile responsiveness
- [ ] Error messages are user-friendly

## Error Handling

### 10. Payment Error Scenarios
- [ ] Invalid payment amounts rejected
- [ ] Network timeout handling
- [ ] Razorpay service errors
- [ ] Signature verification failures
- [ ] Graceful error messages shown to users
- [ ] Failed payments don't corrupt gig state

### 11. Edge Cases
- [ ] Minimum gig amount (₹500) enforced
- [ ] Pro subscription expiry handled correctly
- [ ] Concurrent completion attempts
- [ ] Duplicate payment prevention
- [ ] Invalid user states handled

## Performance & Security

### 12. Security Measures
- [ ] Razorpay signatures verified on server
- [ ] API keys not exposed to client
- [ ] SQL injection prevention (Convex handles this)
- [ ] Input validation on all forms
- [ ] Rate limiting on payment endpoints

### 13. Performance
- [ ] Page load times acceptable
- [ ] Payment processing responsive
- [ ] Database queries optimized
- [ ] Image loading optimized
- [ ] Network request minimization

## Production Readiness

### 14. Monitoring Setup
- [ ] Error tracking configured
- [ ] Payment success/failure metrics
- [ ] Performance monitoring
- [ ] User behavior analytics (optional)

### 15. Backup & Recovery
- [ ] Database backup strategy
- [ ] Payment reconciliation process
- [ ] Error log analysis setup

### 16. Documentation
- [ ] API documentation complete
- [ ] User guide for payment flows
- [ ] Admin guide for support
- [ ] Troubleshooting guide

## Go-Live Process

### 17. Soft Launch
- [ ] Deploy to staging environment
- [ ] Test with small group of users
- [ ] Process real test payments (small amounts)
- [ ] Monitor for 24 hours

### 18. Production Launch
- [ ] Switch to live Razorpay keys
- [ ] Update environment variables
- [ ] Deploy to production
- [ ] Announce to users
- [ ] Monitor closely for first week

### 19. Post-Launch
- [ ] Payment success rate monitoring
- [ ] User feedback collection
- [ ] Performance optimization
- [ ] Feature usage analytics

## Support & Maintenance

### 20. Support Process
- [ ] Payment dispute resolution process
- [ ] Refund policy and implementation
- [ ] Customer support training
- [ ] Escalation procedures

### 21. Regular Maintenance
- [ ] Monthly payment reconciliation
- [ ] Security audit schedule
- [ ] Performance review process
- [ ] Feature enhancement planning

---

## Success Criteria

✅ **Payment success rate > 95%**
✅ **Platform fee calculation 100% accurate**  
✅ **Pro subscription conversion tracking**
✅ **Zero critical payment errors**
✅ **User satisfaction with payment flow**
✅ **Support ticket volume manageable**

---

*Last updated: $(date)*