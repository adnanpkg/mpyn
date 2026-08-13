# Vercel Environment Variables Setup

Add these environment variables to your Vercel project:

## Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

### Required Environment Variables:

```
NEXT_PUBLIC_CONVEX_URL=https://watchful-marlin-396.convex.cloud

GMAIL_USER=https.adnan.exe@gmail.com
GMAIL_APP_PASSWORD=fsnziuvgnmudmpnc

RAZORPAY_KEY_ID=rzp_test_TPKsVytCHRFwHP
RAZORPAY_KEY_SECRET=EvzUYSOh8mAVLF6DPttfEHHt
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TPKsVytCHRFwHP

CONVEX_DEPLOYMENT=dev:watchful-marlin-396
NEXT_PUBLIC_CONVEX_SITE_URL=https://watchful-marlin-396.convex.site
```

### Steps:
1. Go to https://vercel.com/dashboard
2. Select your project (mpyn)
3. Go to Settings → Environment Variables
4. Add each variable above
5. Apply to: Production, Preview, and Development
6. Click "Save"
7. Redeploy: Go to Deployments → Click "..." on latest → Redeploy

### Notes:
- **RAZORPAY_KEY_SECRET** is sensitive - only add to Production & Preview (not needed in Development)
- **GMAIL_APP_PASSWORD** is sensitive - only add to Production & Preview
- After adding, trigger a new deployment for changes to take effect
