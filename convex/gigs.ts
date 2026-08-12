import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Platform cut calculator: 5% for free users, 0% for Pro users
function calcPlatformFee(charge: number, isPro: boolean): number {
  if (isPro) return 0; // Pro users: zero platform fee
  return Math.round(charge * 0.05); // Free users: 5% platform fee
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
    const platformFee = calcPlatformFee(args.charge, args.isPro ?? false);
    const gigId = await ctx.db.insert('gigs', {
      creatorId: args.creatorId,
      title: args.title,
      description: args.description,
      charge: args.charge,
      cut: platformFee, // Store as 'cut' for backward compatibility
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

// Creator marks gig complete
export const creatorMarkComplete = mutation({
  args: { gigId: v.id('gigs'), userId: v.id('users') },
  handler: async (ctx, { gigId, userId }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error('gig not found');
    if (gig.creatorId !== userId) throw new Error('not your gig');
    if (gig.status !== 'in_progress') throw new Error('gig not in progress');

    await ctx.db.patch(gigId, {
      creatorMarkedComplete: true,
    });

    // Check if both parties have marked complete
    if (gig.businessMarkedComplete) {
      // Both marked complete - finalize gig
      await finalizeGigCompletion(ctx, gig);
    } else {
      // Update status to pending business completion
      await ctx.db.patch(gigId, {
        status: 'pending_completion',
      });

      // Notify business to mark complete
      if (gig.businessId) {
        await ctx.db.insert('notifications', {
          userId: gig.businessId,
          type: 'completion_pending',
          content: `"${gig.title}" marked complete by creator. confirm to finalize! ✳`,
          read: false,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// Business marks gig complete
export const businessMarkComplete = mutation({
  args: { gigId: v.id('gigs'), userId: v.id('users') },
  handler: async (ctx, { gigId, userId }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error('gig not found');
    if (gig.businessId !== userId) throw new Error('not your gig');
    if (!['in_progress', 'pending_completion'].includes(gig.status)) {
      throw new Error('gig not ready for completion');
    }

    await ctx.db.patch(gigId, {
      businessMarkedComplete: true,
    });

    // Check if both parties have marked complete
    if (gig.creatorMarkedComplete) {
      // Both marked complete - finalize gig
      await finalizeGigCompletion(ctx, gig);
    } else {
      // Update status to pending creator completion
      await ctx.db.patch(gigId, {
        status: 'pending_completion',
      });

      // Notify creator to mark complete
      await ctx.db.insert('notifications', {
        userId: gig.creatorId,
        type: 'completion_pending',
        content: `"${gig.title}" marked complete by business. confirm to finalize! ✳`,
        read: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Helper function to finalize gig completion
async function finalizeGigCompletion(ctx: any, gig: any) {
  const now = Date.now();
  
  // Mark gig as completed
  await ctx.db.patch(gig._id, {
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

  // Send completion notifications with rating prompts
  await ctx.db.insert('notifications', {
    userId: gig.creatorId,
    type: 'gig_completed',
    content: `"${gig.title}" completed! ✳ rate your experience to help the community.`,
    read: false,
    createdAt: now,
  });

  if (gig.businessId) {
    await ctx.db.insert('notifications', {
      userId: gig.businessId,
      type: 'gig_completed',
      content: `"${gig.title}" completed! ✳ rate your experience to help the community.`,
      read: false,
      createdAt: now,
    });
  }
}

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

// Get a single gig by ID
export const getById = query({
  args: { gigId: v.id('gigs') },
  handler: async (ctx, { gigId }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) return null;
    
    const creator = await ctx.db.get(gig.creatorId);
    const business = gig.businessId ? await ctx.db.get(gig.businessId) : null;
    
    return {
      ...gig,
      creator,
      business,
    };
  },
});

// Get active gig between two users (for messages UI)
export const getActiveGigBetweenUsers = query({
  args: {
    creatorId: v.id('users'),
    businessId: v.id('users'),
  },
  handler: async (ctx, { creatorId, businessId }) => {
    // Find open or agreed gigs where one user is creator and other is potential business
    const openGigs = await ctx.db
      .query('gigs')
      .withIndex('by_creator', (q) => q.eq('creatorId', creatorId))
      .filter((q) => q.eq(q.field('status'), 'open'))
      .collect();

    // Also check for already agreed gigs between these users
    const agreedGigs = await ctx.db
      .query('gigs')
      .withIndex('by_creator', (q) => q.eq('creatorId', creatorId))
      .filter((q) => 
        q.and(
          q.eq(q.field('businessId'), businessId),
          q.or(
            q.eq(q.field('status'), 'agreed'),
            q.eq(q.field('status'), 'payment_pending'),
            q.eq(q.field('status'), 'payment_done'),
            q.eq(q.field('status'), 'in_progress')
          )
        )
      )
      .collect();

    // Return the most relevant gig
    if (agreedGigs.length > 0) {
      return agreedGigs[0]; // Return existing gig between these users
    }
    
    if (openGigs.length > 0) {
      return openGigs[0]; // Return open gig that business can confirm
    }
    
    return null;
  },
});

// Confirm gig (business accepts, moves to agreed status with platform fee calculation)
export const confirm = mutation({
  args: {
    gigId: v.id('gigs'),
    businessId: v.id('users'),
    paymentMode: v.union(v.literal('advance'), v.literal('direct')),
  },
  handler: async (ctx, { gigId, businessId, paymentMode }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error('gig not found');
    if (gig.status !== 'open') throw new Error('gig already confirmed');
    
    // Get business user to check Pro status
    const business = await ctx.db.get(businessId);
    if (!business) throw new Error('business user not found');
    
    // Calculate platform fee based on Pro status
    const isPro = Boolean(business.isPro && (business as any).proExpiresAt && (business as any).proExpiresAt > Date.now());
    const platformFee = calcPlatformFee(gig.charge, isPro);
    
    await ctx.db.patch(gigId, {
      businessId,
      paymentMode,
      platformFee, // Store calculated platform fee
      status: 'agreed', // Change status to 'agreed' first
    });

    // Notify creator
    await ctx.db.insert('notifications', {
      userId: gig.creatorId,
      type: 'gig_confirmed',
      content: `your gig "${gig.title}" was confirmed! proceed to payment. ✳`,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Mark payment as pending (when checkout is initiated)
export const markPaymentPending = mutation({
  args: {
    gigId: v.id('gigs'),
    razorpayOrderId: v.string(),
  },
  handler: async (ctx, { gigId, razorpayOrderId }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error('gig not found');
    
    await ctx.db.patch(gigId, {
      razorpayOrderId,
      status: 'payment_pending',
    });

    // Send pending notification
    if (gig.businessId) {
      await ctx.db.insert('notifications', {
        userId: gig.businessId,
        type: 'payment_pending',
        content: `payment processing for "${gig.title}". will notify once confirmed.`,
        read: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Mark payment as failed
export const markPaymentFailed = mutation({
  args: {
    gigId: v.id('gigs'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { gigId, reason }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error('gig not found');
    
    // Reset gig to agreed status so payment can be retried
    await ctx.db.patch(gigId, {
      status: 'agreed',
      razorpayOrderId: undefined,
      razorpayPaymentId: undefined,
    });

    // Send failure notification
    if (gig.businessId) {
      await ctx.db.insert('notifications', {
        userId: gig.businessId,
        type: 'payment_failed',
        content: `payment failed for "${gig.title}". please try again or contact support.`,
        read: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Update payment status after successful Razorpay verification
export const updatePaymentStatus = mutation({
  args: {
    gigId: v.id('gigs'),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    status: v.union(v.literal('payment_done'), v.literal('payment_pending')),
  },
  handler: async (ctx, { gigId, razorpayOrderId, razorpayPaymentId, status }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error('gig not found');
    
    await ctx.db.patch(gigId, {
      razorpayOrderId,
      razorpayPaymentId,
      status: status === 'payment_done' ? 'in_progress' : status,
    });

    if (status === 'payment_done') {
      // Calculate actual payment amount based on payment mode
      const paymentAmount = gig.paymentMode === 'advance' 
        ? (gig.platformFee || Math.round(gig.charge * 0.05))
        : gig.charge + (gig.platformFee || Math.round(gig.charge * 0.05));

      // Send payment notifications using the new notification system
      await ctx.db.insert('notifications', {
        userId: gig.creatorId,
        type: 'payment_received',
        content: `₹${paymentAmount.toLocaleString()} received for "${gig.title}". start working! ✳`,
        read: false,
        createdAt: Date.now(),
      });

      if (gig.businessId) {
        await ctx.db.insert('notifications', {
          userId: gig.businessId,
          type: 'payment_confirmed',
          content: `payment of ₹${paymentAmount.toLocaleString()} confirmed for "${gig.title}". gig is active! ✳`,
          read: false,
          createdAt: Date.now(),
        });
      }
    }

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
