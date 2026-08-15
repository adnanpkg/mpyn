import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// ADMIN: Give a user pro subscription (for testing)
export const giveProSubscription = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    console.log('Looking for user with username:', username);
    
    // Find user by username (case insensitive search)
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', username.toLowerCase()))
      .first();

    if (!user) {
      console.error('User not found:', username);
      // List all users with usernames for debugging
      const allUsers = await ctx.db.query('users').collect();
      const usersWithNames = allUsers.filter(u => u.username).map(u => u.username);
      console.log('Available usernames:', usersWithNames);
      throw new Error(`User "${username}" not found. Available: ${usersWithNames.join(', ')}`);
    }

    console.log('Found user:', user._id, user.username);

    const now = Date.now();
    const monthInMs = 30 * 24 * 60 * 60 * 1000;

    // Update user with pro status
    await ctx.db.patch(user._id, {
      isPro: true,
      proExpiresAt: now + monthInMs,
    });

    console.log('Updated user isPro status');

    // Create subscription record
    const subRecord = await ctx.db.insert('subscriptions', {
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

    console.log('Created subscription record:', subRecord);

    return {
      success: true,
      user: username,
      proUntil: new Date(now + monthInMs).toISOString(),
    };
  },
});
