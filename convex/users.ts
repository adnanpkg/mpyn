import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// MIGRATION: Move all users to creator/businessProfile tables
export const migrateUsers = mutation({
  handler: async (ctx) => {
    const allUsers = await ctx.db.query('users').collect();
    let creatorCount = 0;
    let businessCount = 0;

    for (const user of allUsers) {
      // Skip if user doesn't have a role (incomplete signup)
      if (!user.role) continue;

      // Check if profile already exists
      const existingProfile = await ctx.db
        .query(user.role === 'creator' ? 'creatorProfiles' : 'businessProfiles')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .first();

      if (existingProfile) continue; // Already migrated

      // Create profile based on role
      if (user.role === 'creator') {
        await ctx.db.insert('creatorProfiles', {
          userId: user._id,
          instagramHandle: '',
          bio: '',
          contentCategories: [],
          gigCharge: 0,
          profileComplete: false,
          updatedAt: Date.now(),
        });
        creatorCount++;
      } else if (user.role === 'business') {
        await ctx.db.insert('businessProfiles', {
          userId: user._id,
          name: user.username || '',
          category: '',
          description: '',
          profileComplete: false,
          updatedAt: Date.now(),
        });
        businessCount++;
      }
    }

    return {
      success: true,
      migrated: {
        creators: creatorCount,
        businesses: businessCount,
        total: creatorCount + businessCount,
      },
    };
  },
});

// Get user by ID
export const getById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    
    // Return rating as 0 if undefined/null (client-side default)
    const userWithDefaults = {
      ...user,
      rating: user.rating ?? 0,
    };
    
    // For businesses, include profile name
    if (user.role === 'business') {
      const bp = await ctx.db
        .query('businessProfiles')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .first();
      if (bp?.name) {
        return { ...userWithDefaults, username: bp.name };
      }
    }
    
    return userWithDefaults;
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
    // Validate inputs
    if (!username || username.trim().length === 0) {
      throw new Error('username is required');
    }
    if (!role || (role !== 'creator' && role !== 'business')) {
      throw new Error('role must be either creator or business');
    }
    if (!state || state.trim().length === 0) {
      throw new Error('state is required');
    }
    if (!city || city.trim().length === 0) {
      throw new Error('city is required');
    }
    
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
  args: v.object({
    userId: v.id('users'),
    instagramHandle: v.string(),
    bio: v.string(),
    contentCategories: v.array(v.string()),
    gigCharge: v.float64(),
    portfolioUrl: v.optional(v.string()),
    pfpSvg: v.optional(v.string()),
  }),
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
        pfpSvg: args.pfpSvg,
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
        pfpSvg: args.pfpSvg,
        profileComplete: true,
        updatedAt: Date.now(),
      });
    }
    return { success: true };
  },
});

// Save / update business profile
export const saveBusinessProfile = mutation({
  args: v.object({
    userId: v.id('users'),
    name: v.string(),
    category: v.string(),
    description: v.string(),
    address: v.optional(v.string()),
    pfpSvg: v.optional(v.string()),
  }),
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
        pfpSvg: args.pfpSvg,
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
        pfpSvg: args.pfpSvg,
        profileComplete: true,
        updatedAt: Date.now(),
      });
    }
    return { success: true };
  },
});

// Get feed: ALL open gigs in same city (visible to everyone including poster)
export const getFeed = query({
  args: {
    city: v.string(),
    role: v.union(v.literal('creator'), v.literal('business')),
  },
  handler: async (ctx, { city, role }) => {
    // Show open gigs to EVERYONE in the same city (businesses AND creators)
    // Gigs go live immediately, visible to all including poster

    // Get all open gigs
    const allGigs = await ctx.db
      .query('gigs')
      .withIndex('by_status', (q) => q.eq('status', 'open'))
      .collect();

    // Filter by creator's city and enrich with creator data
    const enrichedGigs = await Promise.all(
      allGigs.map(async (gig) => {
        const creator = await ctx.db.get(gig.creatorId);
        if (!creator || creator.city !== city) return null;

        // Get creator profile
        const profile = await ctx.db
          .query('creatorProfiles')
          .withIndex('by_user', (q) => q.eq('userId', gig.creatorId))
          .first();

        return {
          ...gig,
          creator: {
            _id: creator._id,
            username: creator.username,
            city: creator.city,
            state: creator.state,
            isPro: creator.isPro,
            rating: creator.rating,
            ordersCount: creator.ordersCount,
            profile,
          },
        };
      })
    );

    // Filter nulls and sort: Pro creators first → orders desc → rating desc
    const validGigs = enrichedGigs.filter(Boolean);
    return validGigs.sort((a, b) => {
      const aPro = a?.creator?.isPro ?? false;
      const bPro = b?.creator?.isPro ?? false;
      if (aPro && !bPro) return -1;
      if (!aPro && bPro) return 1;
      const oA = a?.creator?.ordersCount ?? 0;
      const oB = b?.creator?.ordersCount ?? 0;
      if (oA !== oB) return oB - oA;
      return (b?.creator?.rating ?? 0) - (a?.creator?.rating ?? 0);
    });
  },
});
