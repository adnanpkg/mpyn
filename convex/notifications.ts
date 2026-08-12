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

// Get unread count for user
export const getUnreadCount = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('read'), false))
      .collect();
    return unread.length;
  },
});

// Create a notification
export const create = mutation({
  args: {
    userId: v.id('users'),
    type: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { userId, type, content }) => {
    await ctx.db.insert('notifications', {
      userId,
      type,
      content,
      read: false,
      createdAt: Date.now(),
    });
    return { success: true };
  },
});

// Mark specific notification as read
export const markRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { read: true });
    return { success: true };
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

// Send payment-related notification
export const sendPaymentNotification = mutation({
  args: {
    userId: v.id('users'),
    gigId: v.id('gigs'),
    type: v.union(
      v.literal('payment_received'),
      v.literal('payment_confirmed'),
      v.literal('payment_pending'),
      v.literal('payment_failed')
    ),
    amount: v.number(),
    gigTitle: v.string(),
  },
  handler: async (ctx, { userId, type, amount, gigTitle }) => {
    let content = '';
    
    switch (type) {
      case 'payment_received':
        content = `₹${amount.toLocaleString()} received for "${gigTitle}". start working! ✳`;
        break;
      case 'payment_confirmed':
        content = `payment of ₹${amount.toLocaleString()} confirmed for "${gigTitle}". gig is active! ✳`;
        break;
      case 'payment_pending':
        content = `payment processing for "${gigTitle}". will notify once confirmed.`;
        break;
      case 'payment_failed':
        content = `payment failed for "${gigTitle}". please try again or contact support.`;
        break;
    }

    await ctx.db.insert('notifications', {
      userId,
      type,
      content,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Send subscription-related notification
export const sendSubscriptionNotification = mutation({
  args: {
    userId: v.id('users'),
    type: v.union(
      v.literal('subscription_activated'),
      v.literal('subscription_cancelled'),
      v.literal('subscription_expired'),
      v.literal('subscription_renewed')
    ),
  },
  handler: async (ctx, { userId, type }) => {
    let content = '';
    
    switch (type) {
      case 'subscription_activated':
        content = 'welcome to multiply. Pro! ✳ zero fees, verified badge, top placement.';
        break;
      case 'subscription_cancelled':
        content = 'Pro subscription cancelled. benefits remain until end of billing cycle.';
        break;
      case 'subscription_expired':
        content = 'Pro subscription expired. upgrade to continue enjoying Pro benefits.';
        break;
      case 'subscription_renewed':
        content = 'Pro subscription renewed! ✳ another month of zero fees and Pro benefits.';
        break;
    }

    await ctx.db.insert('notifications', {
      userId,
      type,
      content,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
