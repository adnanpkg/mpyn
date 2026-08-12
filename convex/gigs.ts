import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Platform cut calculator
function calcCut(charge: number, isPro: boolean): number {
  if (isPro) {
    if (charge <= 2000) return 15;
    if (charge <= 10000) return 28;
    return 40;
  }
  if (charge <= 2000) return 19;
  if (charge <= 10000) return 35;
  return 50;
}

// Create a gig
export const create = mutation({
  args: {
    creatorId: v.id('users'),
    title: v.string(),
    description: v.optional(v.string()),
    charge: v.number(),
    isPro: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.charge < 500) throw new Error('minimum gig is ₹500 bro');
    const cut = calcCut(args.charge, args.isPro ?? false);
    const gigId = await ctx.db.insert('gigs', {
      creatorId: args.creatorId,
      title: args.title,
      description: args.description,
      charge: args.charge,
      cut,
      status: 'open',
      creatorMarkedComplete: false,
      businessMarkedComplete: false,
      createdAt: Date.now(),
    });
    return gigId;
  },
});

// Get gigs for a user (as creator or business)
export const getForUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const asCreator = await ctx.db
      .query('gigs')
      .withIndex('by_creator', (q) => q.eq('creatorId', userId))
      .collect();

    const asBusiness = await ctx.db
      .query('gigs')
      .withIndex('by_business', (q) => q.eq('businessId', userId))
      .collect();

    const all = [...asCreator, ...asBusiness];
    all.sort((a, b) => b.createdAt - a.createdAt);
    return all;
  },
});

// Get open gigs (for home feed discovery)
export const getOpen = query({
  args: { city: v.string(), excludeUserId: v.id('users') },
  handler: async (ctx, { city, excludeUserId }) => {
    const gigs = await ctx.db
      .query('gigs')
      .withIndex('by_status', (q) => q.eq('status', 'open'))
      .collect();

    // Filter out user's own gigs and attach creator info
    const filtered = await Promise.all(
      gigs
        .filter((g) => g.creatorId !== excludeUserId)
        .map(async (g) => {
          const creator = await ctx.db.get(g.creatorId);
          if (!creator || creator.city !== city) return null;
          return { ...g, creator };
        })
    );

    return filtered.filter(Boolean);
  },
});

// Creator marks gig posted
export const creatorMarkComplete = mutation({
  args: { gigId: v.id('gigs'), userId: v.id('users') },
  handler: async (ctx, { gigId, userId }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error('gig not found');
    if (gig.creatorId !== userId) throw new Error('not your gig');
    await ctx.db.patch(gigId, {
      creatorMarkedComplete: true,
      status: 'pending_completion',
    });
    return { success: true };
  },
});

// Business confirms completion
export const businessMarkComplete = mutation({
  args: { gigId: v.id('gigs'), userId: v.id('users') },
  handler: async (ctx, { gigId, userId }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error('gig not found');
    if (gig.businessId !== userId) throw new Error('not your gig');

    const now = Date.now();
    await ctx.db.patch(gigId, {
      businessMarkedComplete: true,
      status: 'completed',
      completedAt: now,
    });

    // Increment orders count on both users
    const creator = await ctx.db.get(gig.creatorId);
    if (creator) {
      await ctx.db.patch(gig.creatorId, {
        ordersCount: (creator.ordersCount ?? 0) + 1,
      });
    }
    if (gig.businessId) {
      const business = await ctx.db.get(gig.businessId);
      if (business) {
        await ctx.db.patch(gig.businessId, {
          ordersCount: (business.ordersCount ?? 0) + 1,
        });
      }
    }

    // Create notifications
    await ctx.db.insert('notifications', {
      userId: gig.creatorId,
      type: 'gig_completed',
      content: `"${gig.title}" has been confirmed complete. gig done. ✳`,
      read: false,
      createdAt: now,
    });

    return { success: true };
  },
});

// Delete a gig (creator only, open status)
export const remove = mutation({
  args: { gigId: v.id('gigs'), userId: v.id('users') },
  handler: async (ctx, { gigId, userId }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error('gig not found');
    if (gig.creatorId !== userId) throw new Error('not your gig');
    if (gig.status !== 'open') throw new Error('can only delete open gigs');
    await ctx.db.delete(gigId);
    return { success: true };
  },
});

// Confirm gig (business accepts, moves to in_progress)
export const confirm = mutation({
  args: {
    gigId: v.id('gigs'),
    businessId: v.id('users'),
    paymentMode: v.union(v.literal('advance'), v.literal('direct')),
  },
  handler: async (ctx, { gigId, businessId, paymentMode }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error('gig not found');
    await ctx.db.patch(gigId, {
      businessId,
      paymentMode,
      status: 'in_progress',
    });

    // Notify creator
    await ctx.db.insert('notifications', {
      userId: gig.creatorId,
      type: 'gig_confirmed',
      content: `your gig "${gig.title}" was confirmed! get to work. ✳`,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Raise a dispute
export const raiseDispute = mutation({
  args: {
    gigId: v.id('gigs'),
    raisedBy: v.id('users'),
    description: v.string(),
  },
  handler: async (ctx, { gigId, raisedBy, description }) => {
    await ctx.db.patch(gigId, { status: 'disputed' });
    await ctx.db.insert('disputes', {
      gigId,
      raisedBy,
      description,
      status: 'open',
      createdAt: Date.now(),
    });
    return { success: true };
  },
});
