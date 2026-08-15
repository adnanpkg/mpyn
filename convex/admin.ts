import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// ADMIN: Give a user pro subscription (for testing)
export const giveProSubscription = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    // Find user by username
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', username))
      .first();

    if (!user) throw new Error(`User "${username}" not found`);

    const now = Date.now();
    const monthInMs = 30 * 24 * 60 * 60 * 1000;

    // Update user with pro status
    await ctx.db.patch(user._id, {
      isPro: true,
      proExpiresAt: now + monthInMs,
    });

    // Create subscription record
    await ctx.db.insert('subscriptions', {
      userId: user._id,
      razorpaySubId: `test_sub_${Date.now()}`,
      planId: 'multiply_pro_monthly',
      status: 'active',
      currentStart: now,
      currentEnd: now + monthInMs,
      nextBilling: now + monthInMs,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      user: username,
      proUntil: new Date(now + monthInMs).toISOString(),
    };
  },
});
