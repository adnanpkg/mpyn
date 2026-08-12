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
    cut: v.number(),
    status: v.union(
      v.literal('open'),
      v.literal('agreed'),
      v.literal('in_progress'),
      v.literal('pending_completion'),
      v.literal('completed'),
      v.literal('disputed')
    ),
    paymentMode: v.optional(v.union(v.literal('advance'), v.literal('direct'))),
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
    gigId: v.id('gigs'),
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
    read: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  // Subscriptions
  subscriptions: defineTable({
    userId: v.id('users'),
    razorpaySubId: v.optional(v.string()),
    status: v.string(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index('by_user', ['userId']),
});
