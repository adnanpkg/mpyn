# multiply. — Full Context Sheet
### For AI Builder Handoff

---

## What is multiply.

multiply. is a hyperlocal influencer-business marketplace built for India. Local creators and local businesses in the same city can find each other, negotiate promotional gig deals, and complete the entire transaction through the platform.

Think of it like: if Fiverr and Instagram had a baby, but only for your city.

Example use case: A local restaurant wants promo content. They find a creator in the same city on multiply. The creator visits the restaurant, shoots a Reel, posts it, and gets paid — all managed through the app.

---

## Core Concept

- Two sided marketplace — creators and businesses are both users
- Hyperlocal — matching is city scoped, same city only
- Either side can initiate outreach — not just one way
- The whole deal flow (chat, gig confirmation, payment, rating) happens inside the app

---

## App Details

- App name: multiply. (always lowercase, always with the period)
- Domain: mpy.vercel.app
- Framework: Next.js (App Router)
- Hosting: Vercel
- Database + Auth + Storage: Supabase
- Payments: Razorpay (India)
- Animations: Framer Motion (spring physics only)
- Lottie: @lottiefiles/react-lottie-player (splash.json provided)
- Haptics: navigator.vibrate() Web Vibration API
- Styling: Tailwind CSS
- Icons: Lucide React
- Fonts: Figtree (headings), Inter (body), DM Mono (labels/numbers)

---

## Design System — STRICT

### Colors — strictly monochrome, zero color ever
```
Background:     #000000
Surface:        #0F0F0F
Elevated:       #1A1A1A
Border:         #2A2A2A
Text:           #FFFFFF
Muted:          #888888
Dim:            #444444
```
Only exception: #FF3B30 (iOS red) for error states only

### Typography
- Figtree — all headings and display text
- Inter — all body text
- DM Mono — all labels, numbers, tags, timestamps
- All brand copy is lowercase (multiply. let's go. gig done.)

### Border Radius
- Cards: 20px
- Buttons: 100px (pill shaped always)
- Inputs: 14px
- Bottom sheets: 24px 24px 0 0

### Motion — SwiftUI feel
- ALL animations: Framer Motion spring physics (stiffness: 400, damping: 30)
- Button press: scale 0.96 on tap, spring back on release
- Bottom sheets: slide up from bottom with spring, swipe down to dismiss
- List items: staggered fade in (20ms delay per item)
- Page transitions: slide + fade
- Never use ease-in-out anywhere

### Haptics
```js
navigator.vibrate?.(8)           // light tap — every button press
navigator.vibrate?.([10,50,10])  // success / confirmation
navigator.vibrate?.([30,20,30])  // error
navigator.vibrate?.([20,30,20,30,20]) // gig completed (heavy)
```

### Layout
- the current layout seems to be working fine on mobiles but we need to adjust it it for bigger screens

### Skeleton Loaders
- Every single data fetch shows skeleton loaders
- Shimmer animation: pulse from #1A1A1A to #2A2A2A
- Skeletons match exact shape and size of real content

---

## Brand Mark
- The asterisk ✳ is the core brand mark
- Used as: app icon, favicon, verified badge, loader
- White asterisk on black background
- Logo: white asterisk above "multiply." wordmark in Figtree bold

---

## PWA Setup
- Installable on Android and iOS home screen
- manifest.json: name "multiply.", background #000000, theme #000000
- apple-touch-icon: white asterisk on black, 180x180px
- Meta tags:
  - apple-mobile-web-app-capable: yes
  - apple-mobile-web-app-status-bar-style: black
  - theme-color: #000000

---

## User Types

### Creators (Influencers)
- Authenticate via Instagram OAuth (Meta Basic Display API)
- Instagram handle, follower count, profile photo auto pulled
- Set up: bio, content categories, gig charge, portfolio URL
- Minimum gig charge: ₹500 (hard enforced, cannot be bypassed)
- Their Instagram profile + follower count = proof of work

### Businesses
- Set up: business name, category, description, address, photos (up to 5)
- Photos stored in Supabase Storage
- City pre filled from onboarding

---

## Onboarding Flow (in exact order)

1. Splash screen — Lottie animation (splash.json) full screen, black bg, no text
2. State selection — searchable list of all Indian states
3. City selection — filtered by selected state, searchable
4. Role selection — "creator" or "business" (two large cards)
5. Auth — email OTP via Supabase Auth OR Google OAuth
6. Profile creation (creator or business depending on role)

### Auth Options
- Primary: Google Sign In (Supabase Google OAuth provider)
- Fallback: Email OTP (supabase.auth.signInWithOtp)
- Phone OTP: NOT used (unreliable for Indian numbers on free tier)
- Sign up asks for username (stored in users table)
- "already have an account? sign in" toggle between sign in and sign up

---

## Supabase Database Schema

```sql
users (
  id, phone, email, username, role (creator/business), 
  state, city, is_pro, created_at
)

creator_profiles (
  user_id, instagram_handle, follower_count, profile_photo, 
  bio, categories (array), charge (min 500), 
  portfolio_url, rating, orders_count
)

business_profiles (
  user_id, name, category, description, 
  state, city, address, photos (array), 
  rating, orders_count
)

gigs (
  id, creator_id, business_id, price, cut, 
  status (agreed/in_progress/pending_completion/completed/disputed),
  payment_mode (advance/direct),
  creator_marked_complete (bool),
  business_marked_complete (bool),
  created_at, completed_at
)

messages (
  id, gig_id, sender_id, content, created_at, read (bool)
)

reviews (
  id, gig_id, reviewer_id, reviewee_id, 
  rating (1-5), text, created_at
)

disputes (
  id, gig_id, raised_by, description, screenshot_url,
  status (open/reviewing/resolved),
  ai_summary, resolution, created_at
)

subscriptions (
  id, user_id, razorpay_sub_id, status, expires_at
)

notifications (
  id, user_id, type, content, read (bool), created_at
)
```

---

## Gig Flow (step by step)

1. Creator or business initiates outreach → opens chat
2. Both chat and agree on terms
3. Either party taps "confirm gig." → confirmation bottom sheet
4. Bottom sheet shows price, platform cut, amount creator receives
5. Both confirm → gig created in Supabase with status "agreed"
6. Gig moves to "in progress"
7. Creator visits business, shoots content, posts it
8. Creator taps "i've posted it." → business gets push notification
9. Business taps "confirm completion."
10. When BOTH mark complete → gig officially closes
11. Platform cut deducted via Razorpay
12. Orders count increments on both profiles
13. Rating prompt appears for both sides
14. Rankings update in real time

---

## Platform Cut (Multiply's fee per gig)

### Free Users
```
₹500 – ₹2,000    → ₹19 cut
₹2,001 – ₹10,000 → ₹35 cut
₹10,001+          → ₹50 cut (hard cap)
```

### Pro Users (₹190/month subscribers)
```
₹500 – ₹2,000    → ₹15 cut
₹2,001 – ₹10,000 → ₹28 cut
₹10,001+          → ₹40 cut (hard cap)
```

Minimum gig value: ₹500 — hard enforced everywhere, no exceptions

---

## Payment Modes

Two modes, both valid:

1. Advance — business pays creator a portion directly upfront, final payment through app
2. Direct — full payment through the app

Both modes: Multiply deducts its cut on completion
Both modes: counts as official order and affects rankings
No escrow — Multiply does not hold funds

---

## multiply. Pro Subscription

Price: ₹190/month via Razorpay Subscriptions

Free tier:
- Basic profile
- Send and receive outreach
- Standard search placement
- Full platform cut on deals

Pro tier (₹190/month):
- ✳ Verified badge on profile
- Top of search placement (Pro always above free)
- Advanced analytics (profile views, outreach rate, conversion)
- Reduced platform cut (see above)

Verified badge = Pro subscription ONLY. No other way to get it.

---

## Search Rankings Algorithm

1. Pro subscribers always ranked above free users
2. Within same tier: sorted by orders_count descending
3. Tiebreak: rating score descending

Updates in real time after every completed gig.

---

## Dispute System

1. Either party taps "raise dispute." on active gig
2. Form: describe issue + optional screenshot upload (Supabase Storage)
3. Gig status → "disputed" (frozen)
4. AI agent (Claude API or OpenAI) reviews context: chat history, both profiles, transaction, completion status → generates summary stored in disputes.ai_summary
5. Summary goes to human Multiply dispute manager (admin panel)
6. Human makes final money decision — no automated money calls
7. Both parties notified via push + in-app notification

---

## Notifications

Push (FCM via Supabase) + in-app panel for:
- New message received
- Gig confirmed by other party
- Creator marked gig complete → business alert
- Business confirmed completion → creator alert
- Dispute raised / resolved
- Pro subscription expiring (3 days before)

---

## Bottom Tab Navigation

5 tabs: Home · Gigs · Messages · Notifications · Profile
- Fixed at bottom
- backdrop-filter: blur(20px)
- Active: white icon + white DM Mono label
- Inactive: #444 icon
- padding-bottom: env(safe-area-inset-bottom)

---

## Profile Tab Must Have

- Edit profile option
- Sign out button at bottom:
  - calls supabase.auth.signOut()
  - haptic vibrate(8)
  - redirects to auth screen
  - clears all local state

---

## Home Screen — Current Issue to Fix

Skeleton loaders are stuck because Supabase returns empty data (no profiles created yet).

Fix:
- If user has no profile set up → redirect to profile creation screen instead of showing stuck skeletons
- Add floating + button (bottom right, white circle, black plus icon) for creating a gig
- Add edit profile in profile tab

---

## Performance Requirements

Must run smoothly on low end Android phones on Indian 3G/4G networks:
- Lazy load all images with blur placeholder
- Code split every route
- Use next/image for all images
- Minimize JS bundle
- No heavy libraries unless necessary
- Target Lighthouse mobile score: 90+

---

## Copy & Tone Rules

- All UI copy: lowercase always
- Short and punchy — no corporate speak
- Indian English is fine
- Errors: friendly ("minimum gig is ₹500 bro")
- Success states: satisfying with animation + haptic
- Brand always written as: multiply. (never Multiply or MULTIPLY)

---

## Hard Rules — Never Break These

1. Minimum gig value ₹500 — hard block, no exceptions
2. Gig only completes when BOTH sides mark it done
3. Every payment through app = official order = affects ranking
4. Verified ✳ badge = Pro subscription only
5. Pro users always rank above free in search
6. Platform cut always deducted on completion
7. Strictly monochrome — zero color ever (except #FF3B30 for errors)
8. Performance first — must run on low end Android
9. Every tap has haptic feedback
10. Skeleton loaders on every single data fetch
11. All animations use spring physics only — never ease-in-out
12. App name is always "multiply." — lowercase with period

---

*multiply. — where local influence meets local business.*
*Built for India. Hyperlocal. Monochrome. Tactile.*
