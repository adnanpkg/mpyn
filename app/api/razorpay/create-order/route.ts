import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { amount, gigId, paymentType } = await request.json();

    // Validate required fields
    if (!amount || !gigId || !paymentType) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, gigId, paymentType' },
        { status: 400 }
      );
    }

    // Validate payment type
    if (!['gig_advance', 'gig_direct', 'pro_subscription'].includes(paymentType)) {
      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paisa (Razorpay uses smallest currency unit)
      currency: 'INR',
      receipt: `${paymentType}_${gigId}_${Date.now()}`,
      notes: {
        gigId,
        paymentType,
        createdAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order', details: error.message },
      { status: 500 }
    );
  }
}