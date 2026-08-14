import { mutation, action } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';

// Generate a 6-digit OTP code
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Resend — called as an action so we can use fetch
export const sendOtp = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const code = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store the OTP in DB
    await ctx.runMutation(api.auth.storeOtp, { email, code, expiresAt });

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) throw new Error('RESEND_API_KEY not configured');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'multiply. <onboarding@resend.dev>',
        to: email,
        subject: 'your multiply. sign-in code',
        html: `
          <div style="background:#000;color:#fff;font-family:monospace;padding:40px;max-width:480px;margin:0 auto;border-radius:16px;">
            <h1 style="font-size:32px;margin-bottom:4px;">multiply.</h1>
            <p style="color:#888;font-size:14px;margin-bottom:32px;">your one-time sign-in code</p>
            <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <span style="font-size:40px;font-weight:bold;letter-spacing:12px;">${code}</span>
            </div>
            <p style="color:#888;font-size:12px;">expires in 10 minutes. do not share this code.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend failed: ${err}`);
    }

    return { success: true };
  },
});

// Internal mutation — stores OTP, invalidates old ones for same email
export const storeOtp = mutation({
  args: { email: v.string(), code: v.string(), expiresAt: v.number() },
  handler: async (ctx, { email, code, expiresAt }) => {
    // Delete old OTPs for this email
    const old = await ctx.db
      .query('otpCodes')
      .withIndex('by_email', (q) => q.eq('email', email))
      .collect();
    for (const o of old) {
      await ctx.db.delete(o._id);
    }
    await ctx.db.insert('otpCodes', { email, code, expiresAt, used: false });
  },
});

// Verify OTP — creates user if new, returns session token
export const verifyOtp = mutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, { email, code }) => {
    const now = Date.now();

    const otpRecord = await ctx.db
      .query('otpCodes')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();

    if (!otpRecord) throw new Error('no otp found — request a new code');
    if (otpRecord.used) throw new Error('code already used');
    if (otpRecord.expiresAt < now) throw new Error('code expired');
    if (otpRecord.code !== code) throw new Error('wrong code');

    // Mark used
    await ctx.db.patch(otpRecord._id, { used: true });

    // Upsert user
    let user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();

    if (!user) {
      const userId = await ctx.db.insert('users', {
        email,
        createdAt: now,
        isPro: false,
        ordersCount: 0,
        rating: 0,
      });
      user = await ctx.db.get(userId);
    }

    if (!user) throw new Error('failed to create user');

    // Create session token
    const token = crypto.randomUUID() + '-' + crypto.randomUUID();
    await ctx.db.insert('sessions', {
      userId: user._id,
      token,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return { token, userId: user._id, isNewUser: !user.username };
  },
});

// Validate session token → returns userId
export const validateSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();

    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      await ctx.db.delete(session._id);
      return null;
    }
    return session.userId;
  },
});

// Sign out — deletes session
export const signOut = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();
    if (session) await ctx.db.delete(session._id);
    return { success: true };
  },
});
