'use client';

import { Crown, Info } from 'lucide-react';

interface FeeCalculatorProps {
  amount: number;
  isPro?: boolean;
  className?: string;
}

export default function FeeCalculator({ amount, isPro = false, className = '' }: FeeCalculatorProps) {
  const platformFee = isPro ? 0 : Math.round(amount * 0.05);
  const creatorReceives = amount - platformFee;

  if (amount < 500) return null;

  return (
    <div className={`bg-surface rounded-card p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Info size={14} className="text-muted" />
        <span className="text-xs font-mono text-muted">fee breakdown</span>
        {isPro && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-text font-mono">*</span>
            <span className="text-text font-mono">Pro</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted">gig amount</span>
          <span className="font-mono text-text">₹{amount.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-muted">platform fee</span>
          <span className="font-mono text-text">
            {isPro ? (
              <span className="text-text">₹0 (Pro benefit *)</span>
            ) : (
              `₹${platformFee.toLocaleString()} (5%)`
            )}
          </span>
        </div>
        
        <div className="pt-1 flex justify-between text-xs font-bold">
          <span className="text-text">creator receives</span>
          <span className="font-mono text-text">₹{creatorReceives.toLocaleString()}</span>
        </div>
      </div>
      
      {!isPro && amount >= 3800 && (
        <div className="mt-2 pt-2">
          <p className="text-xs text-muted">
            * Pro subscription (₹190/month) saves ₹{platformFee.toLocaleString()} on this gig
          </p>
        </div>
      )}
    </div>
  );
}