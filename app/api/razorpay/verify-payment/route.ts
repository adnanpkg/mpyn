import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
      gigId,
      userId,
      paymentType,
    } = await request.json();

    // Validate required fields
    if (!razorpay_payment_id || !userId || !paymentType) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    // For subscriptions, we don't need order_id verification, just payment_id
    if (paymentType === 'pro_subscription') {
      if (!razorpay_subscription_id) {
        return NextResponse.json(
          { error: 'Missing subscription ID for Pro subscription' },
          { status: 400 }
        );
      }

      // Handle Pro subscription activation
      await convex.mutation(api.subscriptions.activateProSubscription, {
        userId: userId as any,
        razorpayOrderId: razorpay_subscription_id, // Use subscription ID as order ID
        razorpayPaymentId: razorpay_payment_id,
        razorpaySubId: razorpay_subscription_id,
      });
    } else {
      // Handle gig payments - need order_id and signature verification
      if (!razorpay_order_id || !razorpay_signature || !gigId) {
        return NextResponse.json(
          { error: 'Missing required fields for gig payment verification' },
          { status: 400 }
        );
      }

      // Verify Razorpay signature for gig payments
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: 'Invalid payment signature' },
          { status: 400 }
        );
      }

      // Update gig payment status
      await convex.mutation(api.gigs.updatePaymentStatus, {
        gigId: gigId as any,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'payment_done',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    });

  } catch (error: any) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { error: 'Payment verification failed', details: error.message },
      { status: 500 }
    );
  }
}