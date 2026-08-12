// Test helpers for payment flow debugging

export const TEST_CARDS = {
  success: {
    number: '4111111111111111',
    cvv: '123',
    expiry: '12/25',
    name: 'Test User'
  },
  failure: {
    number: '4000000000000002',
    cvv: '123', 
    expiry: '12/25',
    name: 'Test User'
  },
  insufficient_funds: {
    number: '4000000000000341',
    cvv: '123',
    expiry: '12/25',
    name: 'Test User'
  }
};

export const TEST_AMOUNTS = {
  minimum: 500,      // ₹25 fee for free users
  small: 1000,       // ₹50 fee for free users  
  medium: 5000,      // ₹250 fee for free users
  large: 10000,      // ₹500 fee for free users
};

export function calculateTestFee(amount: number, isPro: boolean = false): number {
  if (isPro) return 0;
  return Math.round(amount * 0.05);
}

export function generateTestGig(creatorId: string, amount: number = TEST_AMOUNTS.medium) {
  return {
    creatorId,
    title: `Test Gig - ₹${amount.toLocaleString()}`,
    description: `Test gig for payment flow testing. Amount: ₹${amount}`,
    charge: amount,
  };
}

// Mock payment responses for testing UI without real payments
export const MOCK_PAYMENT_RESPONSES = {
  success: {
    razorpay_payment_id: 'pay_test_success_123',
    razorpay_order_id: 'order_test_success_123',
    razorpay_signature: 'mock_signature_success'
  },
  failure: {
    error: {
      code: 'PAYMENT_FAILED',
      description: 'Payment failed due to insufficient funds',
      source: 'customer',
      step: 'payment_authentication',
      reason: 'payment_failed'
    }
  }
};

// Development mode payment simulator
export function simulatePayment(
  amount: number, 
  shouldSucceed: boolean = true,
  delay: number = 2000
): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldSucceed) {
        resolve({
          ...MOCK_PAYMENT_RESPONSES.success,
          amount: amount * 100, // Convert to paisa
        });
      } else {
        reject(MOCK_PAYMENT_RESPONSES.failure);
      }
    }, delay);
  });
}

// Log payment flow for debugging
export function logPaymentFlow(step: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Payment Flow - ${step}:`, data);
  }
}

// Validate payment amounts
export function validatePaymentAmount(amount: number): { isValid: boolean, error?: string } {
  if (amount < 500) {
    return { isValid: false, error: 'Minimum amount is ₹500' };
  }
  if (amount > 100000) {
    return { isValid: false, error: 'Maximum amount is ₹1,00,000' };
  }
  return { isValid: true };
}

// Test user creation helpers
export const TEST_USERS = {
  creator: {
    email: 'creator.test@example.com',
    username: 'testcreator',
    role: 'creator' as const,
    city: 'Mumbai',
    state: 'Maharashtra'
  },
  business: {
    email: 'business.test@example.com', 
    username: 'testbusiness',
    role: 'business' as const,
    city: 'Mumbai',
    state: 'Maharashtra'
  },
  proBusiness: {
    email: 'probusiness.test@example.com',
    username: 'testprobusiness', 
    role: 'business' as const,
    city: 'Mumbai',
    state: 'Maharashtra',
    isPro: true,
    proExpiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
};

// Payment status helpers for testing
export function getExpectedPaymentAmount(gigAmount: number, paymentMode: 'advance' | 'direct', isPro: boolean): number {
  const platformFee = calculateTestFee(gigAmount, isPro);
  
  if (paymentMode === 'advance') {
    return platformFee; // Only platform fee for advance
  } else {
    return gigAmount + platformFee; // Full amount + fee for direct
  }
}

// Generate test payment verification data
export function generateTestPaymentVerification(orderId: string, paymentId: string) {
  // Note: In real implementation, signature should be generated using Razorpay secret
  // This is just for testing UI flows
  return {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: 'test_signature_' + Date.now()
  };
}