import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Submit a review/rating after gig completion
export const submitReview = mutation({
  args: {
    gigId: v.id('gigs'),
    reviewerId: v.id('users'),
    revieweeId: v.id('users'),
    rating: v.number(),
    text: v.optional(v.string()),
  },
  handler: async (ctx, { gigId, reviewerId, revieweeId, rating, text }) => {
    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if gig is completed
    const gig = await ctx.db.get(gigId);
    if (!gig || gig.status !== 'completed') {
      throw new Error('Can only review completed gigs');
    }

    // Check if reviewer is part of this gig
    if (gig.creatorId !== reviewerId && gig.businessId !== reviewerId) {
      throw new Error('Only gig participants can submit reviews');
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query('reviews')
      .withIndex('by_gig', (q) => q.eq('gigId', gigId))
      .filter((q) => q.eq(q.field('reviewerId'), reviewerId))
      .first();

    if (existingReview) {
      throw new Error('Review already submitted for this gig');
    }

    // Create review
    const reviewId = await ctx.db.insert('reviews', {
      gigId,
      reviewerId,
      revieweeId,
      rating,
      text,
      createdAt: Date.now(),
    });

    // Update reviewee's average rating
    const allReviews = await ctx.db
      .query('reviews')
      .withIndex('by_reviewee', (q) => q.eq('revieweeId', revieweeId))
      .collect();

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await ctx.db.patch(revieweeId, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    });

    // Notify the reviewee
    await ctx.db.insert('notifications', {
      userId: revieweeId,
      type: 'review_received',
      content: `received ${rating}⭐ rating for "${gig.title}". ${text ? 'check your profile for feedback!' : ''}`,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true, reviewId };
  },
});

// Create a profile review (without gig requirement)
export const create = mutation({
  args: {
    gigId: v.optional(v.id('gigs')),
    reviewerId: v.id('users'),
    revieweeId: v.id('users'),
    rating: v.number(),
    text: v.optional(v.string()),
  },
  handler: async (ctx, { gigId, reviewerId, revieweeId, rating, text }) => {
    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Can't review yourself
    if (reviewerId === revieweeId) {
      throw new Error('Cannot review yourself');
    }

    // Create review (gigId is optional for profile reviews)
    const reviewId = await ctx.db.insert('reviews', {
      gigId: gigId as any,
      reviewerId,
      revieweeId,
      rating,
      text,
      createdAt: Date.now(),
    });

    // Update reviewee's average rating
    const allReviews = await ctx.db
      .query('reviews')
      .withIndex('by_reviewee', (q) => q.eq('revieweeId', revieweeId))
      .collect();

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await ctx.db.patch(revieweeId, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    });

    // Notify the reviewee
    const reviewee = await ctx.db.get(revieweeId);
    await ctx.db.insert('notifications', {
      userId: revieweeId,
      type: 'review_received',
      content: `received ${rating}⭐ rating${gigId ? ' for a gig' : ' on your profile'}. ${text ? 'check your profile for feedback!' : ''}`,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true, reviewId };
  },
});

// Get reviews for a user
export const getForUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const reviews = await ctx.db
      .query('reviews')
      .withIndex('by_reviewee', (q) => q.eq('revieweeId', userId))
      .collect();

    // Attach reviewer info and gig info
    const reviewsWithInfo = await Promise.all(
      reviews.map(async (review) => {
        const reviewer = await ctx.db.get(review.reviewerId);
        const gig = await ctx.db.get(review.gigId);
        return {
          ...review,
          reviewer,
          gig,
        };
      })
    );

    return reviewsWithInfo.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get review statistics for a user
export const getStats = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const reviews = await ctx.db
      .query('reviews')
      .withIndex('by_reviewee', (q) => q.eq('revieweeId', userId))
      .collect();

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 5.0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    return {
      totalReviews: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingDistribution: distribution,
    };
  },
});

// Check if user can review a specific gig
export const canReviewGig = query({
  args: { gigId: v.id('gigs'), userId: v.id('users') },
  handler: async (ctx, { gigId, userId }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig || gig.status !== 'completed') {
      return { canReview: false, reason: 'Gig not completed' };
    }

    // Check if user is part of gig
    const isParticipant = gig.creatorId === userId || gig.businessId === userId;
    if (!isParticipant) {
      return { canReview: false, reason: 'Not a participant' };
    }

    // Check if already reviewed
    const existingReview = await ctx.db
      .query('reviews')
      .withIndex('by_gig', (q) => q.eq('gigId', gigId))
      .filter((q) => q.eq(q.field('reviewerId'), userId))
      .first();

    if (existingReview) {
      return { canReview: false, reason: 'Already reviewed' };
    }

    // Determine who to review
    const revieweeId = gig.creatorId === userId ? gig.businessId : gig.creatorId;
    const reviewee = revieweeId ? await ctx.db.get(revieweeId) : null;

    return {
      canReview: true,
      revieweeId,
      revieweeName: reviewee?.username,
    };
  },
});