// Razorpay checkout utilities

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id?: string;
  subscription_id?: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  razorpay_subscription_id?: string;
  orderId?: string; // Added for Pro subscriptions - passed through from client
}

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Open Razorpay checkout for gig payments
export const openGigCheckout = async (
  gigId: string,
  amount: number,
  paymentType: 'gig_advance' | 'gig_direct',
  userEmail: string,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: any) => void,
  onPending?: () => void
) => {
  try {
    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay');
    }

    // Create order
    const orderResponse = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        gigId,
        paymentType,
      }),
    });

    if (!orderResponse.ok) {
      throw new Error('Failed to create payment order');
    }

    const orderData = await orderResponse.json();

    // Mark payment as pending in database
    if (onPending) {
      onPending();
    }

    // Open Razorpay checkout
    const options: RazorpayOptions = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: 'multiply.',
      description: paymentType === 'gig_advance' 
        ? 'Platform fee for gig (advance payment)' 
        : 'Full payment for gig',
      handler: onSuccess,
      prefill: {
        email: userEmail,
      },
      notes: {
        gigId,
        paymentType,
      },
      theme: {
        color: '#000000',
      },
      modal: {
        ondismiss: () => {
          console.log('Payment cancelled by user');
          // Could mark as failed here if needed
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();

  } catch (error) {
    console.error('Checkout error:', error);
    onError(error);
  }
};

// Open Razorpay checkout for Pro subscription
export const openProSubscriptionCheckout = async (
  userId: string,
  userEmail: string,
  onSuccess: (response: RazorpayResponse & { orderId: string }) => void,
  onError: (error: any) => void
) => {
  try {
    console.log('Opening Pro checkout for:', { userId, userEmail });
    
    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay');
    }

    // Create order for Pro (one-time payment)
    const orderResponse = await fetch('/api/razorpay/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        customerEmail: userEmail,
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('Order creation failed:', errorData);
      throw new Error(errorData.error || 'Failed to create order');
    }

    const orderData = await orderResponse.json();
    console.log('Order created:', orderData);

    // Open Razorpay checkout for one-time payment
    const options: RazorpayOptions = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: 'multiply.',
      description: 'Pro Subscription - ₹190 for 30 days',
      handler: (response: RazorpayResponse) => {
        // Attach orderId to response since Razorpay doesn't return it
        onSuccess({
          ...response,
          orderId: orderData.orderId,
        });
      },
      prefill: {
        email: userEmail,
      },
      notes: {
        userId,
        subscriptionType: 'multiply_pro',
        orderId: orderData.orderId,
      },
      theme: {
        color: '#000000',
      },
      modal: {
        ondismiss: () => {
          console.log('Payment cancelled by user');
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();

  } catch (error) {
    console.error('Checkout error:', error);
    onError(error);
  }
};

// Verify payment after successful checkout
export const verifyPayment = async (
  paymentResponse: RazorpayResponse,
  gigId: string,
  userId: string,
  paymentType: string
) => {
  const verifyResponse = await fetch('/api/razorpay/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...paymentResponse,
      gigId,
      userId,
      paymentType,
    }),
  });

  if (!verifyResponse.ok) {
    throw new Error('Payment verification failed');
  }

  return verifyResponse.json();
};