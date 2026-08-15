'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { pressScale, haptic } from '@/lib/haptics';
import { openProSubscriptionCheckout, type RazorpayResponse } from '@/lib/razorpay';

interface ProUpgradeCardProps {
  userId: string;
  userEmail: string;
  isPro?: boolean;
  proExpiresAt?: number;
  onUpgradeSuccess?: () => void;
}

const springConfig = { stiffness: 400, damping: 30 };

export default function ProUpgradeCard({
  userId,
  userEmail,
  isPro = false,
  proExpiresAt,
  onUpgradeSuccess,
}: ProUpgradeCardProps) {
  const [upgrading, setUpgrading] = useState(false);

  const isProActive = isPro && proExpiresAt && proExpiresAt > Date.now();

  const handleUpgrade = async () => {
    haptic.tap();
    setUpgrading(true);

    try {
      await openProSubscriptionCheckout(
        userId,
        userEmail,
        async (response: RazorpayResponse) => {
          try {
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                userId,
                paymentType: 'pro_subscription',
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              console.error('Verification response:', verifyData);
              throw new Error(verifyData.error || 'Subscription verification failed');
            }
            
            haptic.success();
            onUpgradeSuccess?.();
            alert('welcome to multiply. Pro * zero fees await.');
          } catch (error) {
            console.error('Subscription verification failed:', error);
            haptic.error();
            alert(`verification failed: ${error instanceof Error ? error.message : 'unknown error'}`);
          } finally {
            setUpgrading(false);
          }
        },
        (error: any) => {
          console.error('Subscription payment failed:', error);
          haptic.error();
          alert('payment failed. please try again.');
          setUpgrading(false);
        }
      );
    } catch (error) {
      console.error('Subscription initialization failed:', error);
      haptic.error();
      alert('failed to initialize. please try again.');
      setUpgrading(false);
    }
  };

  if (isProActive) {
    const daysLeft = Math.ceil((proExpiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    
    return (
      <motion.div 
        className="rounded-[20px] p-4 mb-6 bg-surface"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', ...springConfig }}
      >
        <div className="text-center mb-3">
          <img src="/icon.svg" alt="multiply" className="w-10 h-10 mx-auto mb-2" />
          <h3 className="font-heading font-bold text-text mb-1">
            multiply. Pro
          </h3>
          <p className="text-dim text-xs font-mono">
            {daysLeft} days remaining
          </p>
        </div>

        <div className="space-y-2 text-xs text-muted mb-4">
          <p>* zero platform fees</p>
          <p>* verified badge</p>
          <p>* top placement</p>
        </div>

        <p className="text-center text-xs text-dim">
          renews {new Date(proExpiresAt).toLocaleDateString('en-IN')}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="rounded-[20px] p-5 mb-6 bg-elevated"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', ...springConfig }}
    >
      {/* Header */}
      <div className="mb-4">
        <img src="/icon.svg" alt="multiply pro" className="w-10 h-10 mx-auto mb-3" />
        <h3 className="font-heading font-bold text-text text-center mb-1">
          upgrade to multiply. Pro
        </h3>
        <p className="text-muted text-xs text-center font-mono">
          ₹190 / month
        </p>
      </div>

      {/* Benefits */}
      <div className="space-y-2 mb-5 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-text font-bold">*</span>
          <span className="text-muted">zero platform fees (save 5% per gig)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-text font-bold">*</span>
          <span className="text-muted">verified badge on profile</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-text font-bold">*</span>
          <span className="text-muted">top placement in search</span>
        </div>
      </div>

      {/* Savings breakdown */}
      <div className="bg-surface rounded-[14px] p-3 mb-5">
        <p className="font-heading font-bold text-xs text-text mb-3">
          your savings
        </p>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-dim">₹1,000 gig</span>
            <span className="text-text">save ₹50</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dim">₹5,000 gig</span>
            <span className="text-text">save ₹250</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dim">₹10,000 gig</span>
            <span className="text-text">save ₹500</span>
          </div>
          <div className="pt-2 mt-2">
            <p className="text-dim">pro pays for itself at ₹3,800/month in gigs</p>
          </div>
        </div>
      </div>

      {/* Upgrade button */}
      <motion.button
        className="w-full bg-text text-bg py-3 px-4 rounded-full font-heading font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        onClick={handleUpgrade}
        disabled={upgrading}
        {...pressScale}
      >
        {upgrading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            upgrading...
          </>
        ) : (
          'upgrade now'
        )}
      </motion.button>

      <p className="text-xs text-center text-dim mt-3">
        cancel anytime • benefits end at billing cycle
      </p>
    </motion.div>
  );
}