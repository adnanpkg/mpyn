import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay only when environment variables are available
const initRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay configuration missing');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay configuration not available' },
        { status: 500 }
      );
    }

    const razorpay = initRazorpay();
    const { userId, customerEmail } = await request.json();

    // Validate required fields
    if (!userId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, customerEmail' },
        { status: 400 }
      );
    }

    // Create or get Razorpay customer
    let customer;
    try {
      // For simplicity, create a new customer each time
      // In production, you might want to store customer IDs in your database
      customer = await razorpay.customers.create({
        name: `User ${userId}`,
        email: customerEmail,
        contact: '', // Optional: add phone if available
        notes: {
          userId,
        },
      });
    } catch (error) {
      console.error('Customer creation failed:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Create Razorpay plan (₹190/month)
    let plan;
    try {
      plan = await razorpay.plans.create({
        period: 'monthly',
        interval: 1,
        item: {
          name: 'multiply. Pro Subscription',
          amount: 19000, // ₹190 in paisa
          currency: 'INR',
          description: 'Monthly Pro subscription - zero platform fees, verified badge',
        },
        notes: {
          planType: 'multiply_pro_monthly',
        },
      });
    } catch (error) {
      console.error('Plan creation failed:', error);
      return NextResponse.json(
        { error: 'Failed to create subscription plan' },
        { status: 500 }
      );
    }

    // Create subscription - using simpler approach for TypeScript compatibility
    const subscriptionData: any = {
      plan_id: plan.id,
      customer_notify: 1,
      quantity: 1,
      total_count: 12,
      notes: {
        userId,
        subscriptionType: 'multiply_pro',
      },
    };

    const subscription = await razorpay.subscriptions.create(subscriptionData);

    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId: customer.id,
      planId: plan.id,
      amount: 19000, // Amount in paisa
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.error('Subscription creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription', details: error.message },
      { status: 500 }
    );
  }
}