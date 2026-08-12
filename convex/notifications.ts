import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get notifications for a user
export const getForUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const notifs = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    return notifs.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Mark all notifications read
export const markAllRead = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('read'), false))
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
    return { success: true };
  },
});
