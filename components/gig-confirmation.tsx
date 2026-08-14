'use client';

import { useState } from 'react';
import { Check, CreditCard, HandCoins, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { pressScale, spring, haptic } from '@/lib/haptics';
import { openGigCheckout, verifyPayment, type RazorpayResponse } from '@/lib/razorpay';

interface GigConfirmationProps {
  gig: {
    _id: string;
    title: string;
    charge: number;
    status: string;
    creatorId: string;
    businessId?: string;
    platformFee?: number;
  };
  currentUserId: string;
  currentUserEmail: string;
  businessIsPro?: boolean;
  onConfirm: (paymentMode: 'advance' | 'direct') => void;
  onPaymentSuccess?: () => void;
  loading?: boolean;
}

export default function GigConfirmation({
  gig,
  currentUserId,
  currentUserEmail,
  businessIsPro = false,
  onConfirm,
  onPaymentSuccess,
  loading = false,
}: GigConfirmationProps) {
  const [paymentMode, setPaymentMode] = useState<'advance' | 'direct' | null>(null);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Calculate platform fee
  const platformFee = businessIsPro ? 0 : Math.round(gig.charge * 0.05);
  const isCreator = gig.creatorId === currentUserId;
  const isBusiness = !isCreator;

  // Show confirmation button only if:
  // 1. Gig is open AND user is business (not creator)
  // 2. OR gig is agreed and we need to show payment button
  const showConfirmButton = gig.status === 'open' && isBusiness;
  const showPaymentButton = gig.status === 'agreed' && isBusiness;
  const showPaymentStatus = ['payment_pending', 'payment_done', 'in_progress'].includes(gig.status);

  if (!showConfirmButton && !showPaymentButton && !showPaymentStatus) return null;

  const handleConfirmClick = () => {
    if (gig.status === 'open') {
      setShowModeSelection(true);
    }
  };

  const handleModeSelect = (mode: 'advance' | 'direct') => {
    haptic.tap();
    setPaymentMode(mode);
    onConfirm(mode);
  };

  const handlePayment = async (mode: 'advance' | 'direct') => {
    setProcessingPayment(true);
    
    try {
      // Calculate payment amount based on mode
      const paymentAmount = mode === 'advance' ? platformFee : gig.charge + platformFee;
      const paymentType = mode === 'advance' ? 'gig_advance' : 'gig_direct';

      await openGigCheckout(
        gig._id,
        paymentAmount,
        paymentType,
        currentUserEmail,
        async (response: RazorpayResponse) => {
          try {
            // Verify payment on server
            await verifyPayment(response, gig._id, currentUserId, paymentType);
            haptic.success();
            
            // Call success callback
            onPaymentSuccess?.();
            
            alert('payment successful! gig is now active.');
          } catch (error) {
            console.error('Payment verification failed:', error);
            haptic.error();
            alert('payment verification failed. please contact support.');
          } finally {
            setProcessingPayment(false);
          }
        },
        (error: any) => {
          console.error('Payment failed:', error);
          haptic.error();
          alert('payment failed. please try again.');
          setProcessingPayment(false);
        },
        () => {
          // Mark payment as pending when checkout opens
          console.log('Payment initiated, marking as pending...');
        }
      );
    } catch (error) {
      console.error('Payment initialization failed:', error);
      haptic.error();
      alert('failed to initialize payment. please try again.');
      setProcessingPayment(false);
    }
  };

  return (
    <div className="pt-4 space-y-3">
      {/* Gig Summary */}
      <div className="bg-surface rounded-card p-3">
        <h4 className="font-heading font-bold text-sm text-text mb-1">
          {gig.title}
        </h4>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted">gig amount</span>
            <span className="font-mono text-text">₹{gig.charge.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">platform fee</span>
            <span className="font-mono text-text">
              {businessIsPro ? (
                <span className="text-text">₹0 — Pro member *</span>
              ) : (
                `₹${platformFee.toLocaleString()}`
              )}
            </span>
          </div>
          {gig.status === 'agreed' && (
            <div className="pt-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-text">total payment</span>
                <span className="font-mono text-text">
                  ₹{(gig.charge + platformFee).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Button (for open gigs) */}
      {showConfirmButton && !showModeSelection && (
        <motion.button
          className="w-full bg-text text-bg py-3 px-4 rounded-pill font-heading font-bold text-sm disabled:opacity-50"
          onClick={handleConfirmClick}
          disabled={loading}
          {...pressScale}
        >
          confirm gig — ₹{gig.charge.toLocaleString()}
        </motion.button>
      )}

      {/* Payment Mode Selection */}
      {showModeSelection && (
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-sm text-text">
            select payment mode
          </h4>
          
          <motion.button
            className="w-full p-4 rounded-card bg-surface text-left"
            onClick={() => handleModeSelect('advance')}
            disabled={loading}
            {...pressScale}
          >
            <div className="flex items-start gap-3">
              <HandCoins size={20} className="text-muted mt-0.5" />
              <div className="flex-1">
                <h5 className="font-heading font-bold text-sm text-text mb-1">
                  advance payment
                </h5>
                <p className="text-xs text-muted leading-relaxed">
                  pay creator directly via UPI/cash outside the app.
                  platform fee (₹{platformFee.toLocaleString()}) charged through app.
                </p>
                <div className="mt-2 text-xs font-mono text-text">
                  total: ₹{platformFee.toLocaleString()} (platform fee only)
                </div>
              </div>
            </div>
          </motion.button>

          <motion.button
            className="w-full p-4 rounded-card bg-surface text-left"
            onClick={() => handleModeSelect('direct')}
            disabled={loading}
            {...pressScale}
          >
            <div className="flex items-start gap-3">
              <CreditCard size={20} className="text-muted mt-0.5" />
              <div className="flex-1">
                <h5 className="font-heading font-bold text-sm text-text mb-1">
                  direct payment
                </h5>
                <p className="text-xs text-muted leading-relaxed">
                  pay full amount through app. creator receives amount minus platform fee.
                </p>
                <div className="mt-2 text-xs font-mono text-text">
                  total: ₹{(gig.charge + platformFee).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.button>
        </div>
      )}

      {/* Payment Button (after gig confirmation) */}
      {showPaymentButton && (
        <div className="space-y-3">
          <div className="bg-surface rounded-card p-3 mb-3">
            <p className="text-xs text-text">
              ✓ gig confirmed! proceed to payment to activate.
            </p>
          </div>
          
          <motion.button
            className="w-full bg-text text-bg py-3 px-4 rounded-pill font-heading font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={() => handlePayment((gig as any).paymentMode as 'advance' | 'direct' || 'direct')}
            disabled={processingPayment}
            {...pressScale}
          >
            {processingPayment ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                processing...
              </>
            ) : (
              `pay now — ₹${(((gig as any).paymentMode === 'advance' ? platformFee : gig.charge + platformFee)).toLocaleString()}`
            )}
          </motion.button>
        </div>
      )}

      {/* Payment Status (for completed payments) */}
      {showPaymentStatus && (
        <div className="bg-surface rounded-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Check size={16} className="text-text" />
            <span className="font-heading font-bold text-sm text-text">
              {gig.status === 'payment_pending' ? 'payment processing' : 
               gig.status === 'payment_done' || gig.status === 'in_progress' ? 'payment completed' : 'gig confirmed'}
            </span>
          </div>
          <p className="text-xs text-muted">
            {gig.status === 'payment_pending' ? (
              'payment in progress...'
            ) : gig.status === 'payment_done' || gig.status === 'in_progress' ? (
              'payment completed! gig is now active.'
            ) : (
              'waiting for payment processing...'
            )}
          </p>
        </div>
      )}
    </div>
  );
}