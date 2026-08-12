import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get user's active Pro subscription
export const getActiveSubscription = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .first();
      
    return subscription;
  },
});

// Check if user has active Pro subscription
export const isUserPro = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return false;
    
    // Check if user has isPro flag and it hasn't expired
    if (user.isPro && user.proExpiresAt && user.proExpiresAt > Date.now()) {
      return true;
    }
    
    return false;
  },
});

// Activate Pro subscription after successful payment
export const activateProSubscription = mutation({
  args: {
    userId: v.id('users'),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySubId: v.optional(v.string()),
    planId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const monthFromNow = now + (30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
    
    // Update user's Pro status
    await ctx.db.patch(args.userId, {
      isPro: true,
      proExpiresAt: monthFromNow,
    });

    // Create subscription record
    await ctx.db.insert('subscriptions', {
      userId: args.userId,
      razorpaySubId: args.razorpaySubId ?? args.razorpayOrderId,
      planId: args.planId ?? 'multiply_pro_monthly',
      status: 'active',
      currentStart: now,
      currentEnd: monthFromNow,
      nextBilling: monthFromNow,
      createdAt: now,
      updatedAt: now,
    });

    // Send notification
    await ctx.db.insert('notifications', {
      userId: args.userId,
      type: 'subscription_activated',
      content: 'welcome to multiply. Pro! ✳ zero fees, verified badge, top placement.',
      read: false,
      createdAt: now,
    });

    return { success: true };
  },
});

// Cancel Pro subscription
export const cancelSubscription = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .first();

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // Update subscription status to cancelled
    await ctx.db.patch(subscription._id, {
      status: 'cancelled',
      updatedAt: Date.now(),
    });

    // Note: User keeps Pro benefits until current period ends
    // The proExpiresAt field will handle the actual deactivation

    await ctx.db.insert('notifications', {
      userId,
      type: 'subscription_cancelled',
      content: 'Pro subscription cancelled. benefits remain until end of billing cycle.',
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Renew subscription (called by webhook or manually)
export const renewSubscription = mutation({
  args: {
    userId: v.id('users'),
    razorpayPaymentId: v.string(),
  },
  handler: async (ctx, { userId, razorpayPaymentId }) => {
    const now = Date.now();
    const monthFromNow = now + (30 * 24 * 60 * 60 * 1000);

    // Extend user's Pro expiry
    await ctx.db.patch(userId, {
      isPro: true,
      proExpiresAt: monthFromNow,
    });

    // Update subscription record
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        currentStart: now,
        currentEnd: monthFromNow,
        nextBilling: monthFromNow,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Deactivate expired subscriptions (can be called by cron job)
export const deactivateExpiredSubscriptions = mutation({
  args: {},
  handler: async (ctx, {}) => {
    const now = Date.now();
    
    // Find users with expired Pro subscriptions
    const expiredUsers = await ctx.db
      .query('users')
      .filter((q) => 
        q.and(
          q.eq(q.field('isPro'), true),
          q.lt(q.field('proExpiresAt'), now)
        )
      )
      .collect();

    for (const user of expiredUsers) {
      // Remove Pro status
      await ctx.db.patch(user._id, {
        isPro: false,
        proExpiresAt: undefined,
      });

      // Update subscription status
      const subscription = await ctx.db
        .query('subscriptions')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('status'), 'active'))
        .first();

      if (subscription) {
        await ctx.db.patch(subscription._id, {
          status: 'expired',
          updatedAt: now,
        });
      }

      // Notify user
      await ctx.db.insert('notifications', {
        userId: user._id,
        type: 'subscription_expired',
        content: 'Pro subscription expired. upgrade to continue enjoying Pro benefits.',
        read: false,
        createdAt: now,
      });
    }

    return { deactivatedCount: expiredUsers.length };
  },
});