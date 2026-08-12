'use client';

import { useState } from 'react';
import { Crown, Check, Loader2, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { pressScale } from '@/lib/haptics';
import { openProSubscriptionCheckout, type RazorpayResponse } from '@/lib/razorpay';

interface ProUpgradeCardProps {
  userId: string;
  userEmail: string;
  isPro?: boolean;
  proExpiresAt?: number;
  onUpgradeSuccess?: () => void;
}

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
    setUpgrading(true);

    try {
      await openProSubscriptionCheckout(
        userId,
        userEmail,
        async (response: RazorpayResponse) => {
          try {
            // For subscriptions, we need a different verification approach
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

            if (!verifyResponse.ok) {
              throw new Error('Subscription verification failed');
            }
            
            // Call success callback
            onUpgradeSuccess?.();
            
            alert('Welcome to multiply. Pro! ✳ Enjoy zero platform fees.');
          } catch (error) {
            console.error('Subscription verification failed:', error);
            alert('Subscription verification failed. Please contact support.');
          } finally {
            setUpgrading(false);
          }
        },
        (error: any) => {
          console.error('Subscription payment failed:', error);
          alert('Payment failed. Please try again.');
          setUpgrading(false);
        }
      );
    } catch (error) {
      console.error('Subscription initialization failed:', error);
      alert('Failed to initialize subscription. Please try again.');
      setUpgrading(false);
    }
  };

  if (isProActive) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Crown size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-bold text-sm text-purple-800 mb-1">
              multiply. Pro Active ✳
            </h3>
            <p className="text-xs text-purple-600 mb-2">
              Enjoying zero platform fees and Pro benefits
            </p>
            <p className="text-xs text-purple-500">
              Expires: {new Date(proExpiresAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-purple-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-purple-400 flex items-center justify-center flex-shrink-0">
          <Crown size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-bold text-base text-text mb-1">
            upgrade to multiply. Pro
          </h3>
          <p className="text-xs text-muted mb-3">
            ₹190/month — unlock Pro benefits and save on every gig
          </p>
        </div>
      </div>

      {/* Benefits list */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Check size={14} className="text-green-600 flex-shrink-0" />
          <span className="text-xs text-text">Zero platform fees (save 5% on every gig)</span>
        </div>
        <div className="flex items-center gap-2">
          <Star size={14} className="text-yellow-500 flex-shrink-0" />
          <span className="text-xs text-text">Verified ✳ badge on profile</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-blue-600 flex-shrink-0" />
          <span className="text-xs text-text">Top placement in search results</span>
        </div>
      </div>

      {/* Savings calculator */}
      <div className="bg-white/70 rounded-lg p-3 mb-4 border border-gray-100">
        <h4 className="font-heading font-bold text-xs text-text mb-2">potential savings</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted">₹1,000 gig</span>
            <span className="font-mono text-green-600">save ₹50</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">₹5,000 gig</span>
            <span className="font-mono text-green-600">save ₹250</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">₹10,000 gig</span>
            <span className="font-mono text-green-600">save ₹500</span>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <p className="text-xs text-muted">
            Pro pays for itself with just ₹3,800 in gigs per month
          </p>
        </div>
      </div>

      {/* Upgrade button */}
      <motion.button
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-heading font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        onClick={handleUpgrade}
        disabled={upgrading}
        {...pressScale}
      >
        {upgrading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            upgrading...
          </>
        ) : (
          <>
            <Crown size={16} />
            upgrade to Pro — ₹190/month
          </>
        )}
      </motion.button>

      <p className="text-xs text-center text-muted mt-2">
        cancel anytime • benefits end at billing cycle
      </p>
    </div>
  );
}