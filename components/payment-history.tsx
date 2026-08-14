'use client';

import { useEffect, useState } from 'react';
import { CreditCard, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { spring } from '@/lib/haptics';
import PaymentStatus from './payment-status';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

interface PaymentRecord {
  _id: string;
  title: string;
  charge: number;
  platformFee?: number;
  status: string;
  paymentMode?: 'advance' | 'direct';
  createdAt: number;
  completedAt?: number;
  isCreator: boolean; // true if user is creator, false if business
}

interface PaymentHistoryProps {
  userId: string;
  limit?: number;
  showAll?: boolean;
}

export default function PaymentHistory({
  userId,
  limit = 10,
  showAll = false,
}: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    totalFees: 0,
    completedGigs: 0,
  });

  useEffect(() => {
    const loadPaymentHistory = async () => {
      try {
        const gigs = await convex.query(api.gigs.getForUser, {
          userId: userId as any,
        });

        const paymentRecords: PaymentRecord[] = gigs.map((gig: any) => ({
          _id: gig._id,
          title: gig.title,
          charge: gig.charge,
          platformFee: gig.platformFee || gig.cut,
          status: gig.status,
          paymentMode: gig.paymentMode,
          createdAt: gig.createdAt,
          completedAt: gig.completedAt,
          isCreator: gig.creatorId === userId,
        }));

        // Sort by most recent first
        paymentRecords.sort((a, b) => b.createdAt - a.createdAt);

        // Limit results if needed
        const displayPayments = showAll ? paymentRecords : paymentRecords.slice(0, limit);
        setPayments(displayPayments);

        // Calculate stats
        const earnings = paymentRecords
          .filter(p => p.isCreator && ['payment_done', 'in_progress', 'completed'].includes(p.status))
          .reduce((sum, p) => sum + p.charge - (p.platformFee || 0), 0);

        const spending = paymentRecords
          .filter(p => !p.isCreator && ['payment_done', 'in_progress', 'completed'].includes(p.status))
          .reduce((sum, p) => sum + p.charge + (p.platformFee || 0), 0);

        const fees = paymentRecords
          .filter(p => !p.isCreator && ['payment_done', 'in_progress', 'completed'].includes(p.status))
          .reduce((sum, p) => sum + (p.platformFee || 0), 0);

        const completed = paymentRecords.filter(p => p.status === 'completed').length;

        setStats({
          totalEarned: earnings,
          totalSpent: spending,
          totalFees: fees,
          completedGigs: completed,
        });

      } catch (error) {
        console.error('Failed to load payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentHistory();
  }, [userId, limit, showAll]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton w-full h-16 rounded-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-text" />
            <span className="text-xs font-mono text-muted">earned</span>
          </div>
          <p className="font-heading font-bold text-text">₹{stats.totalEarned.toLocaleString()}</p>
        </div>
        
        <div className="bg-surface rounded-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-dim" />
            <span className="text-xs font-mono text-muted">spent</span>
          </div>
          <p className="font-heading font-bold text-text">₹{stats.totalSpent.toLocaleString()}</p>
        </div>
        
        <div className="bg-surface rounded-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={14} className="text-muted" />
            <span className="text-xs font-mono text-muted">platform fees</span>
          </div>
          <p className="font-heading font-bold text-text">₹{stats.totalFees.toLocaleString()}</p>
        </div>
        
        <div className="bg-surface rounded-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-muted" />
            <span className="text-xs font-mono text-muted">completed</span>
          </div>
          <p className="font-heading font-bold text-text">{stats.completedGigs}</p>
        </div>
      </div>

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard size={32} className="text-muted mb-3 mx-auto" />
          <p className="font-heading font-bold text-sm text-text mb-1">no payments yet</p>
          <p className="text-muted text-xs">payment history will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h4 className="font-heading font-bold text-sm text-text">recent activity</h4>
          {payments.map((payment, i) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.default, delay: i * 0.02 }}
              className="bg-surface rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-heading font-bold text-sm text-text mb-1">
                    {payment.title}
                  </h5>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>{payment.isCreator ? 'earning' : 'spending'}</span>
                    <span>•</span>
                    <span>{new Date(payment.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-text">
                    {payment.isCreator ? '+' : '-'}₹{payment.charge.toLocaleString()}
                  </p>
                  {!payment.isCreator && payment.platformFee && (
                    <p className="text-xs text-muted">
                      +₹{payment.platformFee.toLocaleString()} fee
                    </p>
                  )}
                </div>
              </div>
              
              <PaymentStatus
                status={payment.status}
                paymentMode={payment.paymentMode}
                className="w-fit"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}