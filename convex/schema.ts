import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users / auth sessions
  users: defineTable({
    email: v.string(),
    username: v.optional(v.string()),
    role: v.optional(v.union(v.literal('creator'), v.literal('business'))),
    state: v.optional(v.string()),
    city: v.optional(v.string()),
    isPro: v.optional(v.boolean()),
    proExpiresAt: v.optional(v.number()), // Pro subscription expiry timestamp
    ordersCount: v.optional(v.number()),
    rating: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_username', ['username']),

  // OTP codes for email auth
  otpCodes: defineTable({
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  }).index('by_email', ['email']),

  // Session tokens
  sessions: defineTable({
    userId: v.id('users'),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_user', ['userId']),

  // Creator profiles
  creatorProfiles: defineTable({
    userId: v.id('users'),
    instagramHandle: v.optional(v.string()),
    bio: v.optional(v.string()),
    contentCategories: v.optional(v.array(v.string())),
    gigCharge: v.optional(v.number()),
    portfolioUrl: v.optional(v.string()),
    profileComplete: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // Business profiles
  businessProfiles: defineTable({
    userId: v.id('users'),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    profileComplete: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // Gigs
  gigs: defineTable({
    creatorId: v.id('users'),
    businessId: v.optional(v.id('users')),
    title: v.string(),
    description: v.optional(v.string()),
    charge: v.number(),
    cut: v.number(), // Platform fee amount (kept as 'cut' for backward compatibility)
    platformFee: v.optional(v.number()), // New explicit platform fee field
    status: v.union(
      v.literal('open'),
      v.literal('agreed'),
      v.literal('payment_pending'),
      v.literal('payment_done'),
      v.literal('in_progress'),
      v.literal('pending_completion'),
      v.literal('completed'),
      v.literal('disputed')
    ),
    paymentMode: v.optional(v.union(v.literal('advance'), v.literal('direct'))),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    creatorMarkedComplete: v.optional(v.boolean()),
    businessMarkedComplete: v.optional(v.boolean()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index('by_creator', ['creatorId'])
    .index('by_business', ['businessId'])
    .index('by_status', ['status']),

  // Messages
  messages: defineTable({
    gigId: v.optional(v.id('gigs')),
    senderId: v.id('users'),
    receiverId: v.id('users'),
    text: v.string(),
    read: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index('by_sender', ['senderId'])
    .index('by_receiver', ['receiverId'])
    .index('by_conversation', ['senderId', 'receiverId']),

  // Reviews
  reviews: defineTable({
    gigId: v.optional(v.id('gigs')),
    reviewerId: v.id('users'),
    revieweeId: v.id('users'),
    rating: v.number(),
    text: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_reviewee', ['revieweeId'])
    .index('by_gig', ['gigId']),

  // Disputes
  disputes: defineTable({
    gigId: v.id('gigs'),
    raisedBy: v.id('users'),
    description: v.string(),
    screenshotUrl: v.optional(v.string()),
    status: v.union(
      v.literal('open'),
      v.literal('reviewing'),
      v.literal('resolved')
    ),
    aiSummary: v.optional(v.string()),
    resolution: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_gig', ['gigId']),

  // Notifications
  notifications: defineTable({
    userId: v.id('users'),
    type: v.string(),
    content: v.string(),
    fromUserId: v.optional(v.id('users')),
    read: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  // Offers (business offers to creator, creator can accept/reject)
  offers: defineTable({
    gigId: v.optional(v.id('gigs')),
    fromUserId: v.id('users'), // Business sending offer
    toUserId: v.id('users'), // Creator receiving offer
    amount: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('rejected')
    ),
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index('by_to_user', ['toUserId'])
    .index('by_from_user', ['fromUserId'])
    .index('by_status', ['status']),

  // Pro subscriptions (₹190/month)
  subscriptions: defineTable({
    userId: v.id('users'),
    razorpaySubId: v.string(), // Razorpay subscription ID
    planId: v.string(), // Razorpay plan ID (multiply_pro_monthly)
    status: v.union(
      v.literal('active'),
      v.literal('halted'),
      v.literal('cancelled'),
      v.literal('completed'),
      v.literal('expired')
    ),
    currentStart: v.number(), // Current billing period start
    currentEnd: v.number(), // Current billing period end  
    nextBilling: v.optional(v.number()), // Next billing date
    razorpayCustomerId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_razorpay_sub', ['razorpaySubId'])
    .index('by_status', ['status']),
});
