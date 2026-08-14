'use client';

import { useState } from 'react';
import { Play, DollarSign, Crown, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { pressScale } from '@/lib/haptics';
import { TEST_AMOUNTS, TEST_CARDS, calculateTestFee, logPaymentFlow } from '@/lib/test-helpers';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

interface PaymentTestPanelProps {
  userId: string;
  isPro?: boolean;
  className?: string;
}

export default function PaymentTestPanel({ userId, isPro = false, className = '' }: PaymentTestPanelProps) {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const runPaymentTest = async (amount: number, paymentMode: 'advance' | 'direct') => {
    setTesting(true);
    logPaymentFlow('Starting payment test', { amount, paymentMode, isPro });

    try {
      // Create test gig
      const gigId = await convex.mutation(api.gigs.create, {
        creatorId: userId as any,
        title: `Test Gig ₹${amount}`,
        description: 'Automated test gig',
        charge: amount,
        isPro,
      });

      logPaymentFlow('Test gig created', { gigId });

      // Calculate expected amounts
      const platformFee = calculateTestFee(amount, isPro);
      const expectedPayment = paymentMode === 'advance' ? platformFee : amount + platformFee;

      const result = {
        timestamp: new Date().toLocaleTimeString(),
        amount,
        paymentMode,
        isPro,
        platformFee,
        expectedPayment,
        status: 'success',
        gigId
      };

      setTestResults(prev => [result, ...prev]);
      logPaymentFlow('Test completed', result);

    } catch (error) {
      const result = {
        timestamp: new Date().toLocaleTimeString(),
        amount,
        paymentMode,
        isPro,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setTestResults(prev => [result, ...prev]);
      logPaymentFlow('Test failed', result);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className={`bg-elevated rounded-[14px] p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Play size={16} className="text-text" />
        <span className="font-heading font-bold text-sm text-text">
          Payment Testing Panel {isPro && <Crown size={14} className="inline text-text" />}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <h4 className="text-xs font-mono text-muted">Quick Tests</h4>
        
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TEST_AMOUNTS).map(([label, amount]) => (
            <div key={label} className="space-y-1">
              <p className="text-xs text-text capitalize">{label}: ₹{amount}</p>
              <div className="flex gap-1">
                <motion.button
                  className="flex-1 bg-text text-bg text-xs py-1 px-2 rounded-full disabled:opacity-50 font-mono font-bold"
                  onClick={() => runPaymentTest(amount, 'advance')}
                  disabled={testing}
                  {...pressScale}
                >
                  ADV
                </motion.button>
                <motion.button
                  className="flex-1 bg-text text-bg text-xs py-1 px-2 rounded-full disabled:opacity-50 font-mono font-bold"
                  onClick={() => runPaymentTest(amount, 'direct')}
                  disabled={testing}
                  {...pressScale}
                >
                  DIR
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Cards Reference */}
      <div className="bg-surface rounded-[14px] p-2 mb-3">
        <h4 className="text-xs font-mono text-muted mb-1">Test Cards</h4>
        <div className="text-xs space-y-1 text-text">
          <div>✓ Success: {TEST_CARDS.success.number}</div>
          <div>✗ Failure: {TEST_CARDS.failure.number}</div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-surface rounded-[14px] p-2 max-h-32 overflow-y-auto">
          <h4 className="text-xs font-mono text-muted mb-1">Results</h4>
          {testResults.slice(0, 5).map((result, i) => (
            <div key={i} className="text-xs flex items-center justify-between py-1 last:border-0 text-text">
              <span className="text-muted">{result.timestamp}</span>
              <div className="flex items-center gap-1">
                <span>₹{result.amount}</span>
                <span className="text-dim">{result.paymentMode}</span>
                {result.status === 'success' ? (
                  <CheckCircle size={12} className="text-text" />
                ) : (
                  <XCircle size={12} className="text-text" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {testing && (
        <div className="text-xs text-muted text-center py-2">
          Running test... ⧚
        </div>
      )}
    </div>
  );
}