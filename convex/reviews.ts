import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Submit a review after gig completion
export const submit = mutation({
  args: {
    gigId: v.id('gigs'),
    reviewerId: v.id('users'),
    revieweeId: v.id('users'),
    rating: v.number(),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5) throw new Error('rating must be 1–5');

    // Prevent duplicate reviews
    const existing = await ctx.db
      .query('reviews')
      .withIndex('by_gig', (q) => q.eq('gigId', args.gigId))
      .filter((q) => q.eq(q.field('reviewerId'), args.reviewerId))
      .first();
    if (existing) throw new Error('already reviewed');

    await ctx.db.insert('reviews', {
      gigId: args.gigId,
      reviewerId: args.reviewerId,
      revieweeId: args.revieweeId,
      rating: args.rating,
      text: args.text,
      createdAt: Date.now(),
    });

    // Recompute average rating for reviewee
    const allReviews = await ctx.db
      .query('reviews')
      .withIndex('by_reviewee', (q) => q.eq('revieweeId', args.revieweeId))
      .collect();

    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await ctx.db.patch(args.revieweeId, { rating: Math.round(avg * 100) / 100 });

    return { success: true };
  },
});

// Get reviews for a user
export const getForUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('reviews')
      .withIndex('by_reviewee', (q) => q.eq('revieweeId', userId))
      .collect();
  },
});
