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
    console.log('=== Pro Subscription API Called ===');
    
    // Check for required environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay credentials');
      return NextResponse.json(
        { error: 'Razorpay configuration not available' },
        { status: 500 }
      );
    }

    const razorpay = initRazorpay();
    const { userId, customerEmail } = await request.json();

    console.log('Request data:', { userId, customerEmail });

    // Validate required fields
    if (!userId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, customerEmail' },
        { status: 400 }
      );
    }

    // SIMPLIFIED: Use one-time payment instead of subscription
    // Create a regular order for ₹190 (30 days of Pro)
    console.log('Creating order for Pro upgrade...');
    
    const order = await razorpay.orders.create({
      amount: 19000, // ₹190 in paisa
      currency: 'INR',
      receipt: `pro_${userId}_${Date.now()}`,
      notes: {
        userId,
        paymentType: 'pro_subscription',
        email: customerEmail,
        duration: '30_days',
      },
    });

    console.log('Order created successfully:', order.id);

    return NextResponse.json({
      orderId: order.id,
      amount: 19000,
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.error('=== Pro Subscription API Error ===');
    console.error('Error:', error);
    console.error('Error details:', {
      statusCode: error.statusCode,
      errorCode: error.error?.code,
      description: error.error?.description,
      message: error.message,
    });
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message || error.error?.description },
      { status: 500 }
    );
  }
}