import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Create a new offer (business to creator)
export const create = mutation({
  args: {
    fromUserId: v.id('users'),
    toUserId: v.id('users'),
    amount: v.number(),
    gigId: v.optional(v.id('gigs')),
  },
  handler: async (ctx, { fromUserId, toUserId, amount, gigId }) => {
    // Validate amount is positive
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Get usernames for notification
    const fromUser = await ctx.db.get(fromUserId);
    const toUser = await ctx.db.get(toUserId);
    
    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    // Create offer
    const offerId = await ctx.db.insert('offers', {
      fromUserId,
      toUserId,
      amount,
      gigId,
      status: 'pending',
      createdAt: Date.now(),
    });

    // Notify creator about new offer
    await ctx.db.insert('notifications', {
      userId: toUserId,
      type: 'offer_received',
      content: `@${fromUser.username} offered ₹${amount.toLocaleString()} for a gig`,
      fromUserId: fromUserId,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true, offerId };
  },
});

// Accept an offer (creator accepts business offer)
export const accept = mutation({
  args: {
    offerId: v.id('offers'),
    userId: v.id('users'),
  },
  handler: async (ctx, { offerId, userId }) => {
    const offer = await ctx.db.get(offerId);
    
    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.toUserId !== userId) {
      throw new Error('Not authorized to accept this offer');
    }

    if (offer.status !== 'pending') {
      throw new Error('Offer already responded to');
    }

    // Update offer status
    await ctx.db.patch(offerId, {
      status: 'accepted',
      respondedAt: Date.now(),
    });

    // Get usernames
    const fromUser = await ctx.db.get(offer.fromUserId);
    const toUser = await ctx.db.get(offer.toUserId);

    // Notify business that offer was accepted
    await ctx.db.insert('notifications', {
      userId: offer.fromUserId,
      type: 'offer_accepted',
      content: `@${toUser?.username} accepted your ₹${offer.amount.toLocaleString()} offer! proceed with gig.`,
      fromUserId: userId,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Reject an offer (creator rejects business offer)
export const reject = mutation({
  args: {
    offerId: v.id('offers'),
    userId: v.id('users'),
  },
  handler: async (ctx, { offerId, userId }) => {
    const offer = await ctx.db.get(offerId);
    
    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.toUserId !== userId) {
      throw new Error('Not authorized to reject this offer');
    }

    if (offer.status !== 'pending') {
      throw new Error('Offer already responded to');
    }

    // Update offer status
    await ctx.db.patch(offerId, {
      status: 'rejected',
      respondedAt: Date.now(),
    });

    // Get usernames
    const toUser = await ctx.db.get(offer.toUserId);

    // Notify business that offer was rejected
    await ctx.db.insert('notifications', {
      userId: offer.fromUserId,
      type: 'offer_rejected',
      content: `@${toUser?.username} declined your ₹${offer.amount.toLocaleString()} offer.`,
      fromUserId: userId,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Get pending offers for a user (creator sees incoming offers)
export const getPending = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const offers = await ctx.db
      .query('offers')
      .withIndex('by_to_user', (q) => q.eq('toUserId', userId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect();

    // Enrich with sender info
    const enrichedOffers = await Promise.all(
      offers.map(async (offer) => {
        const fromUser = await ctx.db.get(offer.fromUserId);
        return {
          ...offer,
          fromUser: {
            _id: fromUser?._id,
            username: fromUser?.username,
          },
        };
      })
    );

    return enrichedOffers.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get all offers between two users
export const getBetweenUsers = query({
  args: {
    userId1: v.id('users'),
    userId2: v.id('users'),
  },
  handler: async (ctx, { userId1, userId2 }) => {
    const offers1 = await ctx.db
      .query('offers')
      .withIndex('by_from_user', (q) => q.eq('fromUserId', userId1))
      .filter((q) => q.eq(q.field('toUserId'), userId2))
      .collect();

    const offers2 = await ctx.db
      .query('offers')
      .withIndex('by_from_user', (q) => q.eq('fromUserId', userId2))
      .filter((q) => q.eq(q.field('toUserId'), userId1))
      .collect();

    const allOffers = [...offers1, ...offers2];
    return allOffers.sort((a, b) => b.createdAt - a.createdAt);
  },
});
