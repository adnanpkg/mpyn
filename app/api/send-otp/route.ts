import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Nodemailer transporter using Gmail SMTP
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const code = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

    // Store OTP in Convex
    await convex.mutation(api.auth.storeOtp, { email, code, expiresAt });

    // Send email via Gmail SMTP
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"multiply." <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'your multiply. sign-in code',
      html: `
        <div style="background:#000000;color:#ffffff;font-family:monospace;padding:40px;max-width:480px;margin:0 auto;border-radius:16px;">
          <p style="font-size:28px;font-weight:bold;margin:0 0 4px 0;">multiply.</p>
          <p style="color:#888888;font-size:13px;margin:0 0 32px 0;">your one-time sign-in code</p>
          <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
            <span style="font-size:44px;font-weight:bold;letter-spacing:14px;">${code}</span>
          </div>
          <p style="color:#888888;font-size:12px;margin:0;">expires in 10 minutes. don't share this code.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'failed to send otp';
    console.error('send-otp error:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
