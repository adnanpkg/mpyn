import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get all conversations for a user (unique partners)
export const getConversations = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const sent = await ctx.db
      .query('messages')
      .withIndex('by_sender', (q) => q.eq('senderId', userId))
      .collect();

    const received = await ctx.db
      .query('messages')
      .withIndex('by_receiver', (q) => q.eq('receiverId', userId))
      .collect();

    // Unique partner IDs
    const partnerIds = new Set<string>();
    for (const m of sent) partnerIds.add(m.receiverId);
    for (const m of received) partnerIds.add(m.senderId);

    // For each partner, get last message + their user info
    const conversations = await Promise.all(
      Array.from(partnerIds).map(async (partnerId) => {
        const partner = await ctx.db.get(partnerId as any);
        const allMsgs = [
          ...sent.filter((m) => m.receiverId === partnerId),
          ...received.filter((m) => m.senderId === partnerId),
        ].sort((a, b) => b.createdAt - a.createdAt);

        const last = allMsgs[0];
        const unreadCount = received.filter(
          (m) => m.senderId === partnerId && !m.read
        ).length;

        return { partner, lastMessage: last, unreadCount };
      })
    );

    return conversations
      .filter((c) => c.partner)
      .sort((a, b) => (b.lastMessage?.createdAt ?? 0) - (a.lastMessage?.createdAt ?? 0));
  },
});

// Get messages between two users
export const getThread = query({
  args: {
    userId: v.id('users'),
    partnerId: v.id('users'),
  },
  handler: async (ctx, { userId, partnerId }) => {
    const sent = await ctx.db
      .query('messages')
      .withIndex('by_sender', (q) => q.eq('senderId', userId))
      .filter((q) => q.eq(q.field('receiverId'), partnerId))
      .collect();

    const received = await ctx.db
      .query('messages')
      .withIndex('by_sender', (q) => q.eq('senderId', partnerId))
      .filter((q) => q.eq(q.field('receiverId'), userId))
      .collect();

    const all = [...sent, ...received].sort((a, b) => a.createdAt - b.createdAt);
    return all;
  },
});

// Send a message
export const send = mutation({
  args: {
    senderId: v.id('users'),
    receiverId: v.id('users'),
    text: v.string(),
    gigId: v.optional(v.id('gigs')),
  },
  handler: async (ctx, { senderId, receiverId, text, gigId }) => {
    const msgId = await ctx.db.insert('messages', {
      senderId,
      receiverId,
      text,
      gigId,
      read: false,
      createdAt: Date.now(),
    });

    // Notify receiver
    await ctx.db.insert('notifications', {
      userId: receiverId,
      type: 'new_message',
      content: `new message from a ${gigId ? 'gig partner' : 'user'}.`,
      read: false,
      createdAt: Date.now(),
    });

    return msgId;
  },
});

// Mark messages as read
export const markRead = mutation({
  args: { userId: v.id('users'), partnerId: v.id('users') },
  handler: async (ctx, { userId, partnerId }) => {
    const unread = await ctx.db
      .query('messages')
      .withIndex('by_sender', (q) => q.eq('senderId', partnerId))
      .filter((q) =>
        q.and(q.eq(q.field('receiverId'), userId), q.eq(q.field('read'), false))
      )
      .collect();

    for (const m of unread) {
      await ctx.db.patch(m._id, { read: true });
    }
    return { success: true };
  },
});
