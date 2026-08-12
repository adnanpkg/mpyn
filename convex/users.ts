import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get user by ID
export const getById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// Get user by session token
export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    return await ctx.db.get(session.userId);
  },
});

// Complete profile (called at end of onboarding)
export const completeProfile = mutation({
  args: {
    userId: v.id('users'),
    username: v.string(),
    role: v.union(v.literal('creator'), v.literal('business')),
    state: v.string(),
    city: v.string(),
  },
  handler: async (ctx, { userId, username, role, state, city }) => {
    // Check username not taken
    const existing = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', username))
      .first();
    if (existing && existing._id !== userId) {
      throw new Error('username already taken');
    }
    await ctx.db.patch(userId, { username, role, state, city });
    return { success: true };
  },
});

// Get creator profile
export const getCreatorProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('creatorProfiles')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
  },
});

// Get business profile
export const getBusinessProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('businessProfiles')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
  },
});

// Save / update creator profile
export const saveCreatorProfile = mutation({
  args: {
    userId: v.id('users'),
    instagramHandle: v.string(),
    bio: v.string(),
    contentCategories: v.array(v.string()),
    gigCharge: v.number(),
    portfolioUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('creatorProfiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        instagramHandle: args.instagramHandle,
        bio: args.bio,
        contentCategories: args.contentCategories,
        gigCharge: args.gigCharge,
        portfolioUrl: args.portfolioUrl,
        profileComplete: true,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('creatorProfiles', {
        userId: args.userId,
        instagramHandle: args.instagramHandle,
        bio: args.bio,
        contentCategories: args.contentCategories,
        gigCharge: args.gigCharge,
        portfolioUrl: args.portfolioUrl,
        profileComplete: true,
        updatedAt: Date.now(),
      });
    }
    return { success: true };
  },
});

// Save / update business profile
export const saveBusinessProfile = mutation({
  args: {
    userId: v.id('users'),
    name: v.string(),
    category: v.string(),
    description: v.string(),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('businessProfiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        category: args.category,
        description: args.description,
        address: args.address,
        profileComplete: true,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('businessProfiles', {
        userId: args.userId,
        name: args.name,
        category: args.category,
        description: args.description,
        address: args.address,
        profileComplete: true,
        updatedAt: Date.now(),
      });
    }
    return { success: true };
  },
});

// Get feed: users in same city with opposite role, sorted by ranking
export const getFeed = query({
  args: {
    city: v.string(),
    role: v.union(v.literal('creator'), v.literal('business')),
  },
  handler: async (ctx, { city, role }) => {
    const targetRole = role === 'creator' ? 'business' : 'creator';
    const users = await ctx.db
      .query('users')
      .filter((q) =>
        q.and(
          q.eq(q.field('role'), targetRole),
          q.eq(q.field('city'), city)
        )
      )
      .collect();

    // Attach creator/business profile data
    const enriched = await Promise.all(
      users.map(async (u) => {
        if (u.role === 'creator') {
          const cp = await ctx.db
            .query('creatorProfiles')
            .withIndex('by_user', (q) => q.eq('userId', u._id))
            .first();
          return { ...u, profile: cp };
        } else {
          const bp = await ctx.db
            .query('businessProfiles')
            .withIndex('by_user', (q) => q.eq('userId', u._id))
            .first();
          return { ...u, profile: bp };
        }
      })
    );

    // Ranking: Pro first → orders desc → rating desc
    return enriched.sort((a, b) => {
      if (a.isPro && !b.isPro) return -1;
      if (!a.isPro && b.isPro) return 1;
      const oA = a.ordersCount ?? 0;
      const oB = b.ordersCount ?? 0;
      if (oA !== oB) return oB - oA;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  },
});
